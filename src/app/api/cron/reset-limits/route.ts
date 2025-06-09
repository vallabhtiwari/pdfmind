import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import prisma from "@/lib/db";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("upstash-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    const url = req.nextUrl.href;
    const rawBody = await req.text();

    const isValid = await receiver.verify({
      body: rawBody,
      signature: signature,
      url,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const today = new Date();
    if (today.getDate() === 1) {
      await prisma.userLimits.updateMany({
        data: { dailyCount: 0, monthlyCount: 0 },
      });
    } else {
      await prisma.userLimits.updateMany({ data: { dailyCount: 0 } });
    }

    return NextResponse.json(
      { message: "Limits reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to reset limits" },
      { status: 500 }
    );
  }
}
