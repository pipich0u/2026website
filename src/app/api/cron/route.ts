import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotionText { plain_text: string }
interface BlogPage {
  id: string;
  properties: {
    Title: { title: NotionText[] };
    Summary: { rich_text: NotionText[] };
    Date: { date: { start: string } | null };
    Published: { checkbox: boolean };
    Slug: { rich_text: NotionText[] };
  };
}

async function getNewPosts(): Promise<BlogPage[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

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
        filter: {
          and: [
            { property: "Published", checkbox: { equals: true } },
            { property: "Date", date: { on_or_after: oneDayAgo } },
          ],
        },
      }),
    }
  );
  const data = await res.json();
  return data.results || [];
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
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await getNewPosts();
    if (posts.length === 0) {
      return NextResponse.json({ message: "No new posts" });
    }

    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers" });
    }

    const siteUrl = process.env.SITE_URL || "https://www.fanyao.live";
    let totalSent = 0;

    for (const post of posts) {
      const title = post.properties.Title.title[0]?.plain_text || "New Post";
      const summary = post.properties.Summary.rich_text[0]?.plain_text || "";
      const slug = post.properties.Slug.rich_text[0]?.plain_text || "";
      const postUrl = slug ? `${siteUrl}/technology/${slug}` : siteUrl;

      const html = `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#2a2722;padding:2em">
          <p style="font-size:0.75rem;letter-spacing:0.3em;color:#c9a84c;margin:0 0 1.5em">FAN YAO · NEW POST</p>
          <h1 style="font-size:1.6rem;font-weight:400;margin:0 0 0.8em;line-height:1.4">${title}</h1>
          ${summary ? `<p style="font-size:1rem;line-height:1.8;color:#5a554d;margin:0 0 2em">${summary}</p>` : ""}
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
            subject: `New Post: ${title}`,
            html,
          })
        )
      );

      totalSent += results.filter((r) => r.status === "fulfilled").length;
    }

    return NextResponse.json({
      posts: posts.length,
      subscribers: subscribers.length,
      sent: totalSent,
    });
  } catch (e) {
    console.error("Cron error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
