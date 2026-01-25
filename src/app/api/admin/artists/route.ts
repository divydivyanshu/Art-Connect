import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const artists = await prisma.artistProfile.findMany({
            include: {
                user: {
                    select: { email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ artists });
    } catch (error) {
        console.error("Failed to fetch artists:", error);
        return NextResponse.json(
            { error: "Failed to fetch artists" },
            { status: 500 }
        );
    }
}
