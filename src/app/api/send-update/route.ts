import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotionText { plain_text: string }

async function getLatestPost() {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_BLOG_DB}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 1,
      }),
    }
  );
  const data = await res.json();
  const page = data.results?.[0];
  if (!page) return null;

  const props = page.properties;
  return {
    title: (props.Title?.title as NotionText[])?.[0]?.plain_text || "New Post",
    summary: (props.Summary?.rich_text as NotionText[])?.[0]?.plain_text || "",
    slug: (props.Slug?.rich_text as NotionText[])?.[0]?.plain_text || "",
  };
}

async function getSubscribers(): Promise<string[]> {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_SUBSCRIBE_DB}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ page_size: 100 }),
    }
  );
  const data = await res.json();
  return data.results
    .map((page: { properties: { Email: { title: NotionText[] } } }) =>
      page.properties.Email.title[0]?.plain_text
    )
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const post = await getLatestPost();
    if (!post) {
      return NextResponse.json({ error: "No published posts found" }, { status: 404 });
    }

    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers" });
    }

    const siteUrl = process.env.SITE_URL || "https://2026website-one.vercel.app";
    const postUrl = post.slug ? `${siteUrl}/technology/${post.slug}` : siteUrl;

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#2a2722;padding:2em">
        <p style="font-size:0.75rem;letter-spacing:0.3em;color:#c9a84c;margin:0 0 1.5em">FAN YAO · NEW POST</p>
        <h1 style="font-size:1.6rem;font-weight:400;margin:0 0 0.8em;line-height:1.4">${post.title}</h1>
        ${post.summary ? `<p style="font-size:1rem;line-height:1.8;color:#5a554d;margin:0 0 2em">${post.summary}</p>` : ""}
        <a href="${postUrl}" style="display:inline-block;padding:0.7em 1.8em;background:#f7ba53;color:white;text-decoration:none;border-radius:20px;font-size:0.85rem;font-family:sans-serif">Read More</a>
        <hr style="border:none;border-top:1px solid #e0ddd6;margin:2.5em 0 1em" />
        <p style="font-size:0.75rem;color:#aaa">You subscribed to updates from Fan Yao's website.</p>
      </div>
    `;

    const results = await Promise.allSettled(
      subscribers.map((email) =>
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Fan Yao <onboarding@resend.dev>",
          to: email,
          subject: `New Post: ${post.title}`,
          html,
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ post: post.title, sent, failed, total: subscribers.length });
  } catch (e) {
    console.error("Send update error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
