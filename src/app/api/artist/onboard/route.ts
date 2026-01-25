import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "artist") {
            return NextResponse.json(
                { error: "Artist authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { profile, portfolioUrls, package: packageData } = body;

        // Check if profile already exists
        const existing = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Artist profile already exists" },
                { status: 400 }
            );
        }

        // Create artist profile
        const artistProfile = await prisma.artistProfile.create({
            data: {
                userId: session.user.id,
                displayName: profile.displayName,
                bio: profile.bio,
                city: profile.city || null,
                styles: JSON.stringify(profile.styles),
                deliveryTypes: JSON.stringify(profile.deliveryTypes || ["digital"]),
                startingPrice: profile.startingPrice,
                instagramUrl: profile.instagramUrl || null,
                profilePhotoUrl: `https://i.pravatar.cc/150?u=${session.user.id}`,
                verificationStatus: "pending",
            },
        });

        // Create private details
        await prisma.artistPrivateDetails.create({
            data: {
                artistProfileId: artistProfile.id,
                fullName: session.user.name || profile.displayName,
                email: session.user.email,
            },
        });

        // Create portfolio images
        if (portfolioUrls && portfolioUrls.length > 0) {
            await prisma.artistPortfolio.createMany({
                data: portfolioUrls.map((url: string, index: number) => ({
                    artistProfileId: artistProfile.id,
                    imageUrl: url,
                    title: `Artwork ${index + 1}`,
                })),
            });
        }

        // Create first package
        if (packageData) {
            await prisma.package.create({
                data: {
                    artistProfileId: artistProfile.id,
                    name: packageData.name,
                    description: packageData.description,
                    price: packageData.price,
                    deliveryTimeText: packageData.deliveryTimeText,
                    deliveryType: packageData.deliveryType,
                    revisionsIncluded: 2,
                    isActive: true,
                    addOns: JSON.stringify({
                        extraPerson: 299,
                        detailedBackground: 199,
                        expressDelivery: 499,
                    }),
                },
            });
        }

        return NextResponse.json({
            success: true,
            artistProfileId: artistProfile.id,
        });
    } catch (error) {
        console.error("Artist onboarding error:", error);
        return NextResponse.json(
            { error: "Failed to create artist profile" },
            { status: 500 }
        );
    }
}
