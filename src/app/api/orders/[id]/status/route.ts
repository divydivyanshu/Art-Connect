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

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Validate status
        const validStatuses = [
            "pending_payment",
            "paid",
            "pending_artist_acceptance",
            "accepted",
            "in_progress",
            "delivered",
            "cancelled",
            "refunded",
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Get the order
        const order = await prisma.order.findUnique({
            where: { id },
            include: { artistProfile: true },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Check permissions
        const isArtist = session.user.artistProfileId === order.artistProfileId;
        const isAdmin = session.user.role === "admin";
        const isBuyer = session.user.id === order.buyerUserId;

        if (!isArtist && !isAdmin) {
            // Buyers can only cancel
            if (isBuyer && status !== "cancelled") {
                return NextResponse.json(
                    { error: "You can only cancel orders" },
                    { status: 403 }
                );
            }
            if (!isBuyer) {
                return NextResponse.json(
                    { error: "Not authorized" },
                    { status: 403 }
                );
            }
        }

        // Update the order
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({
            success: true,
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Failed to update order status:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}
