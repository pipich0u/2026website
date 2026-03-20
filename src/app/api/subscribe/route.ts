import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_SUBSCRIBE_DB },
        properties: {
          Email: {
            title: [{ text: { content: email } }],
          },
          date: {
            date: { start: new Date().toISOString() },
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Notion API error:", err);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ message: "Subscribed" });
  } catch (e) {
    console.error("Subscribe error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
