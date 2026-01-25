import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { verificationStatus, isFeatured } = body;

        const updateData: any = {};
        if (verificationStatus !== undefined) {
            updateData.verificationStatus = verificationStatus;
        }
        if (isFeatured !== undefined) {
            updateData.isFeatured = isFeatured;
        }

        const artist = await prisma.artistProfile.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, artist });
    } catch (error) {
        console.error("Failed to update artist:", error);
        return NextResponse.json(
            { error: "Failed to update artist" },
            { status: 500 }
        );
    }
}
