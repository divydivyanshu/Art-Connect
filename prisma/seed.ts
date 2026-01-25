import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const artistNames = [
    { displayName: 'Priya', fullName: 'Priya Sharma', city: 'Delhi NCR' },
    { displayName: 'Arjun', fullName: 'Arjun Mehta', city: 'Mumbai' },
    { displayName: 'Kavya', fullName: 'Kavya Reddy', city: 'Bangalore' },
    { displayName: 'Rohan', fullName: 'Rohan Kapoor', city: 'Chennai' },
    { displayName: 'Ananya', fullName: 'Ananya Gupta', city: 'Kolkata' },
    { displayName: 'Vikram', fullName: 'Vikram Singh', city: 'Hyderabad' },
    { displayName: 'Meera', fullName: 'Meera Nair', city: 'Pune' },
    { displayName: 'Aditya', fullName: 'Aditya Joshi', city: 'Jaipur' },
    { displayName: 'Sneha', fullName: 'Sneha Patel', city: 'Ahmedabad' },
    { displayName: 'Rahul', fullName: 'Rahul Verma', city: 'Lucknow' },
];

const styleOptions = ['Sketch', 'Watercolor', 'Realistic', 'Digital', 'Oil Painting', 'Charcoal', 'Pencil Portrait', 'Caricature'];
const bios = [
    'Award-winning portrait artist with 8+ years of experience. Specializing in hyper-realistic portraits that capture emotions.',
    'Contemporary digital artist blending traditional techniques with modern aesthetics. Featured in multiple art exhibitions.',
    'Classical trained painter with a passion for watercolors. Every stroke tells a story.',
    'Self-taught artist specializing in charcoal and pencil sketches. Known for intricate details.',
    'Professional illustrator and portrait artist. Creating memories one canvas at a time.',
    'Mixed media artist with expertise in both digital and traditional art forms.',
    'Passionate about bringing photographs to life through oil paintings.',
    'Minimalist artist focusing on capturing essence with fewer strokes.',
    'Vibrant artist known for colorful and expressive portraits.',
    'Detail-oriented artist specializing in family portraits and pet illustrations.',
];

const packageTemplates = [
    {
        name: 'Quick Sketch',
        description: 'A beautiful pencil or charcoal sketch. Perfect for personal keepsakes.',
        deliveryType: 'digital',
        price: 499,
        deliveryTimeText: '24-48 hrs',
        revisionsIncluded: 1,
    },
    {
        name: 'Standard Portrait',
        description: 'Detailed digital portrait with background. High resolution file delivery.',
        deliveryType: 'digital',
        price: 1499,
        deliveryTimeText: '3-5 days',
        revisionsIncluded: 2,
    },
    {
        name: 'Premium Canvas',
        description: 'Hand-painted portrait on premium canvas with secure packaging and delivery.',
        deliveryType: 'physical',
        price: 4999,
        deliveryTimeText: '7-14 days',
        revisionsIncluded: 3,
    },
];

const portfolioImages = [
    'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    'https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=400',
    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400',
    'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400',
    'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=400',
    'https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=400',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400',
    'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400',
];

const reviewComments = [
    'Absolutely stunning work! Exceeded all expectations.',
    'The attention to detail is incredible. Highly recommended!',
    'Fast delivery and amazing quality. Will order again!',
    'Captured the emotions perfectly. My family loved it!',
    'Professional and talented. A true artist!',
    'Beautiful work, exactly what I wanted.',
    'Amazing experience from start to finish.',
    'The portrait is now the centerpiece of our living room.',
];

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.orderFile.deleteMany();
    await prisma.order.deleteMany();
    await prisma.package.deleteMany();
    await prisma.artistPortfolio.deleteMany();
    await prisma.artistPrivateDetails.deleteMany();
    await prisma.artistProfile.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            name: 'Admin',
            email: 'admin@artconnect.com',
            passwordHash: adminPassword,
            role: 'admin',
        },
    });
    console.log('👤 Created admin user');

    // Create demo buyer
    const buyerPassword = await bcrypt.hash('buyer123', 10);
    const buyer = await prisma.user.create({
        data: {
            name: 'Demo Buyer',
            email: 'buyer@demo.com',
            phone: '9876543210',
            passwordHash: buyerPassword,
            role: 'user',
        },
    });
    console.log('👤 Created demo buyer');

    // Create 10 artists with profiles
    for (let i = 0; i < 10; i++) {
        const artistPassword = await bcrypt.hash('artist123', 10);
        const artist = artistNames[i];

        // Select 2-4 random styles
        const numStyles = Math.floor(Math.random() * 3) + 2;
        const shuffledStyles = [...styleOptions].sort(() => Math.random() - 0.5);
        const selectedStyles = shuffledStyles.slice(0, numStyles);

        const user = await prisma.user.create({
            data: {
                name: artist.fullName,
                email: `${artist.displayName.toLowerCase()}@artist.com`,
                passwordHash: artistPassword,
                role: 'artist',
            },
        });

        const startingPrice = 499 + Math.floor(Math.random() * 500);
        const avgRating = 4 + Math.random() * 1;
        const totalReviews = Math.floor(Math.random() * 50) + 10;

        const artistProfile = await prisma.artistProfile.create({
            data: {
                userId: user.id,
                displayName: artist.displayName,
                bio: bios[i],
                city: artist.city,
                styles: JSON.stringify(selectedStyles),
                deliveryTypes: JSON.stringify(['digital', 'physical']),
                startingPrice: startingPrice,
                profilePhotoUrl: `https://i.pravatar.cc/150?img=${i + 10}`,
                verificationStatus: 'approved',
                isFeatured: i < 4, // First 4 artists are featured
                avgRating: Math.round(avgRating * 10) / 10,
                totalReviews: totalReviews,
            },
        });

        // Create private details
        await prisma.artistPrivateDetails.create({
            data: {
                artistProfileId: artistProfile.id,
                fullName: artist.fullName,
                phone: `98765${String(i).padStart(5, '0')}`,
                email: `${artist.displayName.toLowerCase()}.private@email.com`,
                address: `${i + 1}23 Art Street, ${artist.city}`,
            },
        });

        // Create portfolio images (5 per artist)
        for (let j = 0; j < 5; j++) {
            await prisma.artistPortfolio.create({
                data: {
                    artistProfileId: artistProfile.id,
                    imageUrl: portfolioImages[(i + j) % portfolioImages.length],
                    title: `Artwork ${j + 1}`,
                },
            });
        }

        // Create packages (3 per artist with slight price variations)
        for (const template of packageTemplates) {
            const priceVariation = Math.floor(Math.random() * 200) - 100;
            await prisma.package.create({
                data: {
                    artistProfileId: artistProfile.id,
                    name: template.name,
                    description: template.description,
                    deliveryType: template.deliveryType,
                    price: template.price + priceVariation,
                    deliveryTimeText: template.deliveryTimeText,
                    revisionsIncluded: template.revisionsIncluded,
                    isActive: true,
                    addOns: JSON.stringify({
                        extraPerson: 299,
                        detailedBackground: 199,
                        expressDelivery: 499,
                    }),
                },
            });
        }

        console.log(`🎨 Created artist: ${artist.displayName}`);
    }

    // Create some sample orders and reviews for the first 3 artists
    const artists = await prisma.artistProfile.findMany({
        take: 3,
        include: { packages: true },
    });

    for (const artist of artists) {
        const package_ = artist.packages[0];
        if (!package_) continue;

        const order = await prisma.order.create({
            data: {
                buyerUserId: buyer.id,
                artistProfileId: artist.id,
                packageId: package_.id,
                status: 'delivered',
                instructions: 'Please create a family portrait with a garden background.',
                deliveryType: 'digital',
                totalPrice: package_.price,
            },
        });

        // Create a review
        await prisma.review.create({
            data: {
                orderId: order.id,
                artistProfileId: artist.id,
                buyerUserId: buyer.id,
                rating: 4 + Math.floor(Math.random() * 2),
                comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
            },
        });
    }

    console.log('📦 Created sample orders and reviews');
    console.log('✅ Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@artconnect.com / admin123');
    console.log('   Buyer: buyer@demo.com / buyer123');
    console.log('   Artist: priya@artist.com / artist123 (or any artist name)');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
