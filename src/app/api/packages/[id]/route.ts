import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const pkg = await prisma.package.findUnique({
            where: { id },
            include: {
                artistProfile: {
                    select: {
                        id: true,
                        displayName: true,
                        profilePhotoUrl: true,
                    },
                },
            },
        });

        if (!pkg) {
            return NextResponse.json(
                { error: "Package not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            package: pkg,
            artist: pkg.artistProfile,
        });
    } catch (error) {
        console.error("Failed to fetch package:", error);
        return NextResponse.json(
            { error: "Failed to fetch package" },
            { status: 500 }
        );
    }
}
