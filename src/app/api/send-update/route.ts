import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    .map((page: { properties: { Email: { title: { plain_text: string }[] } } }) =>
      page.properties.Email.title[0]?.plain_text
    )
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    // Simple auth check
    const { secret, subject, content } = await req.json();
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!subject || !content) {
      return NextResponse.json({ error: "Missing subject or content" }, { status: 400 });
    }

    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers" });
    }

    const results = await Promise.allSettled(
      subscribers.map((email) =>
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Fan Yao <onboarding@resend.dev>",
          to: email,
          subject,
          html: `
            <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#2a2722;padding:2em">
              <h1 style="font-size:1.5rem;margin-bottom:0.5em">${subject}</h1>
              <div style="line-height:1.8;font-size:1rem;color:#4a4540">${content}</div>
              <hr style="border:none;border-top:1px solid #e0ddd6;margin:2em 0" />
              <p style="font-size:0.8rem;color:#aaa">You received this email because you subscribed to Fan Yao's website.</p>
            </div>
          `,
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed, total: subscribers.length });
  } catch (e) {
    console.error("Send update error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
