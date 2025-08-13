import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.userLimits.findUnique({
    where: { userEmail: session.user.email },
    select: {
      dailyCount: true,
      monthlyCount: true,
      totalCount: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User limits not found" },
      { status: 404 }
    );
  }

  const dailyLimit = parseInt(process.env.DAILY_LIMIT || "1");
  const monthlyLimit = parseInt(process.env.MONTHLY_LIMIT || "5");

  return NextResponse.json({
    dailyCount: user.dailyCount,
    monthlyCount: user.monthlyCount,
    totalCount: user.totalCount,
    dailyLimit,
    monthlyLimit,
  });
}
