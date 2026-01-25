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
        const { orderId, rating, comment } = body;

        if (!orderId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Invalid review data" },
                { status: 400 }
            );
        }

        // Get the order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { review: true },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        if (order.buyerUserId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only review your own orders" },
                { status: 403 }
            );
        }

        if (order.status !== "delivered") {
            return NextResponse.json(
                { error: "You can only review delivered orders" },
                { status: 400 }
            );
        }

        if (order.review) {
            return NextResponse.json(
                { error: "You have already reviewed this order" },
                { status: 400 }
            );
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                orderId,
                artistProfileId: order.artistProfileId,
                buyerUserId: session.user.id,
                rating,
                comment: comment || null,
            },
        });

        // Update artist rating
        const artistReviews = await prisma.review.findMany({
            where: { artistProfileId: order.artistProfileId },
        });

        const avgRating = artistReviews.reduce((sum, r) => sum + r.rating, 0) / artistReviews.length;

        await prisma.artistProfile.update({
            where: { id: order.artistProfileId },
            data: {
                avgRating: Math.round(avgRating * 10) / 10,
                totalReviews: artistReviews.length,
            },
        });

        return NextResponse.json({
            success: true,
            review,
        });
    } catch (error) {
        console.error("Review creation error:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
}
