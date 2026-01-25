import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            artistProfileId,
            packageId,
            instructions,
            deliveryType,
            shippingAddress,
            addOnsSelected,
            totalPrice,
            referenceFiles = [],
        } = body;

        // Validate required fields
        if (!artistProfileId || !packageId || !instructions || !deliveryType) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create the order
        const order = await prisma.order.create({
            data: {
                buyerUserId: session.user.id,
                artistProfileId,
                packageId,
                status: "paid", // MVP: Skip payment, mark as paid
                instructions,
                deliveryType,
                shippingAddress,
                addOnsSelected: JSON.stringify(addOnsSelected),
                totalPrice,
            },
        });

        // Create order files for reference images
        if (referenceFiles.length > 0) {
            await prisma.orderFile.createMany({
                data: referenceFiles.map((url: string) => ({
                    orderId: order.id,
                    fileUrl: url,
                    fileType: "reference",
                })),
            });
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                status: order.status,
            },
        });
    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const role = searchParams.get("role") || "buyer";

        let where: any = {};

        if (role === "buyer") {
            where.buyerUserId = session.user.id;
        } else if (role === "artist" && session.user.artistProfileId) {
            where.artistProfileId = session.user.artistProfileId;
        } else {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        if (status) {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                package: true,
                artistProfile: {
                    select: {
                        displayName: true,
                        profilePhotoUrl: true,
                    },
                },
                buyer: {
                    select: {
                        name: true,
                    },
                },
                files: true,
                review: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
