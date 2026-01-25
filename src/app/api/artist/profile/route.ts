import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "artist") {
            return NextResponse.json(
                { error: "Artist authentication required" },
                { status: 401 }
            );
        }

        const profile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                portfolio: true,
                packages: true,
            },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Artist profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Failed to fetch artist profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
