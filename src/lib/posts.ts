import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

// Local cover overrides — keyed by Notion slug, takes priority over Notion's Cover field
const COVER_OVERRIDES: Record<string, string> = {
  Writing: "/assets/images/wave-cover.jpg",
};

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  cover: string;
  content: string;
}

function richTextToHtml(richText: any[]): string {
  return richText
    .map((t: any) => {
      let text = t.plain_text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if (t.annotations?.bold) text = `<strong>${text}</strong>`;
      if (t.annotations?.italic) text = `<em>${text}</em>`;
      if (t.annotations?.strikethrough) text = `<del>${text}</del>`;
      if (t.annotations?.code) text = `<code>${text}</code>`;
      if (t.href) text = `<a href="${t.href}">${text}</a>`;
      return text;
    })
    .join("");
}

function blocksToHtml(blocks: any[]): string {
  const parts: string[] = [];
  let listBuffer: { type: string; items: string[] } | null = null;

  function flushList() {
    if (listBuffer) {
      const tag = listBuffer.type === "bulleted_list_item" ? "ul" : "ol";
      parts.push(`<${tag}>${listBuffer.items.map((i) => `<li>${i}</li>`).join("")}</${tag}>`);
      listBuffer = null;
    }
  }

  for (const block of blocks) {
    const type = block.type;

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      if (listBuffer && listBuffer.type === type) {
        listBuffer.items.push(richTextToHtml(block[type].rich_text));
      } else {
        flushList();
        listBuffer = { type, items: [richTextToHtml(block[type].rich_text)] };
      }
      continue;
    }

    flushList();

    switch (type) {
      case "paragraph":
        const pText = richTextToHtml(block.paragraph.rich_text);
        if (pText) parts.push(`<p>${pText}</p>`);
        break;
      case "heading_1":
        parts.push(`<h1>${richTextToHtml(block.heading_1.rich_text)}</h1>`);
        break;
      case "heading_2":
        parts.push(`<h2>${richTextToHtml(block.heading_2.rich_text)}</h2>`);
        break;
      case "heading_3":
        parts.push(`<h3>${richTextToHtml(block.heading_3.rich_text)}</h3>`);
        break;
      case "code":
        const lang = block.code.language || "";
        const code = block.code.rich_text.map((t: any) => t.plain_text).join("");
        const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        parts.push(`<pre><code class="language-${lang}">${escaped}</code></pre>`);
        break;
      case "quote":
        parts.push(`<blockquote>${richTextToHtml(block.quote.rich_text)}</blockquote>`);
        break;
      case "divider":
        parts.push(`<hr />`);
        break;
      case "image": {
        const url = block.image.type === "external" ? block.image.external.url : block.image.file.url;
        const caption = block.image.caption?.length ? richTextToHtml(block.image.caption) : "";
        parts.push(`<figure><img src="${url}" alt="${caption}" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`);
        break;
      }
      case "callout":
        const icon = block.callout.icon?.emoji || "";
        parts.push(`<blockquote>${icon} ${richTextToHtml(block.callout.rich_text)}</blockquote>`);
        break;
      case "toggle":
        parts.push(`<details><summary>${richTextToHtml(block.toggle.rich_text)}</summary></details>`);
        break;
      default:
        break;
    }
  }
  flushList();
  return parts.join("\n");
}

export async function getAllPosts(): Promise<Post[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: { property: "Published", checkbox: { equals: true } },
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return response.results.map((page: any) => {
    const props = page.properties;
    const slug = props.Slug?.rich_text?.[0]?.plain_text ?? "";
    return {
      slug,
      title: props.Title?.title?.[0]?.plain_text ?? "",
      date: props.Date?.date?.start ?? "",
      summary: props.Summary?.rich_text?.[0]?.plain_text ?? "",
      tags: [],
      cover: COVER_OVERRIDES[slug] ?? props.Cover?.url ?? "",
      content: "",
    };
  });
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "Published", checkbox: { equals: true } },
      ],
    },
  });

  if (response.results.length === 0) return undefined;

  const page: any = response.results[0];
  const props = page.properties;

  // Fetch page blocks (content)
  const blocks = await notion.blocks.children.list({ block_id: page.id });
  const contentHtml = blocksToHtml(blocks.results);

  return {
    slug,
    title: props.Title?.title?.[0]?.plain_text ?? "",
    date: props.Date?.date?.start ?? "",
    summary: props.Summary?.rich_text?.[0]?.plain_text ?? "",
    tags: [],
    cover: COVER_OVERRIDES[slug] ?? props.Cover?.url ?? "",
    content: contentHtml,
  };
}
