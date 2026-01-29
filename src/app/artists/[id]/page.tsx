import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getArtist(id: string) {
    return await prisma.artistProfile.findUnique({
        where: { id, verificationStatus: "approved" },
        include: {
            portfolio: true,
            packages: { where: { isActive: true }, orderBy: { price: "asc" } },
            reviews: {
                include: { buyer: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });
}

export default async function ArtistProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const artist = await getArtist(id);

    if (!artist) {
        notFound();
    }

    const styles = JSON.parse(artist.styles) as string[];
    const deliveryTypes = JSON.parse(artist.deliveryTypes) as string[];

    // Mark the middle package as popular if there are 3+ packages
    const getPackageClass = (index: number) => {
        if (artist.packages.length >= 3 && index === 1) return "package-card popular";
        return "package-card";
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
            {/* Profile Hero */}
            <div className="profile-hero">
                <div className="container">
                    <div className="profile-hero-content">
                        <img
                            src={artist.profilePhotoUrl || "https://i.pravatar.cc/150"}
                            alt={artist.displayName}
                            className="profile-avatar"
                        />
                        <div className="profile-info">
                            <div className="profile-name-row">
                                <h1 className="profile-name">{artist.displayName}</h1>
                                <span className="tag tag-verified">✓ Verified</span>
                                {artist.isFeatured && <span className="tag tag-featured">⭐ Featured</span>}
                            </div>
                            <div className="profile-meta">
                                <span className="profile-rating">
                                    <span className="star">★</span>
                                    <span style={{ fontWeight: 700 }}>{artist.avgRating.toFixed(1)}</span>
                                    <span style={{ opacity: 0.8 }}>({artist.totalReviews} reviews)</span>
                                </span>
                                {artist.city && (
                                    <span className="profile-location">
                                        📍 {artist.city}
                                    </span>
                                )}
                            </div>
                            <div className="profile-tags">
                                {styles.map((style) => (
                                    <span key={style} className="profile-tag">
                                        {style}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="profile-layout">
                    {/* Main Content */}
                    <div className="profile-main">
                        {/* About Card */}
                        <div className="profile-card">
                            <h2>About</h2>
                            <p style={{ color: "var(--gray-600)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                                {artist.bio || "This artist hasn't added a bio yet."}
                            </p>

                            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                                <div>
                                    <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                                        Delivery Types
                                    </p>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {deliveryTypes.map((type) => (
                                            <span key={type} className="badge badge-primary">
                                                {type === "digital" ? "📥 Digital" : "📦 Physical"}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                                        Starting From
                                    </p>
                                    <p style={{ fontWeight: 700, color: "var(--primary-600)", fontSize: "1.5rem" }}>
                                        ₹{artist.startingPrice}
                                    </p>
                                </div>
                            </div>

                            {(artist.instagramUrl || artist.behanceUrl) && (
                                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                    {artist.instagramUrl && (
                                        <a
                                            href={artist.instagramUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                            Instagram
                                        </a>
                                    )}
                                    {artist.behanceUrl && (
                                        <a
                                            href={artist.behanceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
                                            </svg>
                                            Behance
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Portfolio Gallery */}
                        <div className="profile-card">
                            <h2>Portfolio</h2>
                            {artist.portfolio.length > 0 ? (
                                <div className="portfolio-grid">
                                    {artist.portfolio.map((item) => (
                                        <div key={item.id} className="portfolio-item">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title || "Portfolio"}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: "2rem" }}>
                                    <p className="text-muted">No portfolio images yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="profile-card">
                            <h2>
                                Reviews ({artist.totalReviews})
                            </h2>
                            {artist.reviews.length > 0 ? (
                                <div className="reviews-list">
                                    {artist.reviews.map((review) => (
                                        <div key={review.id} className="review-item">
                                            <div className="review-header">
                                                <span className="review-author">{review.buyer.name}</span>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.rating ? "star" : "star star-empty"}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="review-text">{review.comment}</p>
                                            <p className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: "2rem" }}>
                                    <p className="text-muted">No reviews yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Packages Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="profile-card">
                            <h3 style={{ marginBottom: "1.5rem" }}>Select a Package</h3>

                            {artist.packages.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {artist.packages.map((pkg, index) => (
                                        <div key={pkg.id} className={getPackageClass(index)}>
                                            <div className="package-header">
                                                <h4 className="package-name">{pkg.name}</h4>
                                                <span className="badge badge-primary">
                                                    {pkg.deliveryType === "digital" ? "📥 Digital" : "📦 Physical"}
                                                </span>
                                            </div>
                                            <p className="package-description">{pkg.description}</p>
                                            <div className="package-details">
                                                <span className="package-price">₹{pkg.price}</span>
                                                <div className="package-delivery">
                                                    <p className="package-delivery-label">Delivery</p>
                                                    <p className="package-delivery-time">{pkg.deliveryTimeText}</p>
                                                </div>
                                            </div>
                                            <p className="package-features">
                                                ✓ {pkg.revisionsIncluded} revision{pkg.revisionsIncluded > 1 ? "s" : ""} included
                                            </p>
                                            <Link
                                                href={`/order/${artist.id}/${pkg.id}`}
                                                className="btn btn-primary"
                                                style={{ width: "100%" }}
                                            >
                                                Order Now
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: "1rem" }}>
                                    <p className="text-muted">No packages available.</p>
                                </div>
                            )}

                            {/* Policies */}
                            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-200)" }}>
                                <h4 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Policies</h4>
                                <ul style={{ fontSize: "0.875rem", color: "var(--gray-600)", listStyle: "none" }}>
                                    <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ color: "var(--success)" }}>✓</span>
                                        Revisions included in each package
                                    </li>
                                    <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ color: "var(--success)" }}>✓</span>
                                        Secure payment through platform
                                    </li>
                                    <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ color: "var(--success)" }}>✓</span>
                                        Communication via order notes
                                    </li>
                                    <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ color: "var(--success)" }}>✓</span>
                                        Dispute resolution available
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
