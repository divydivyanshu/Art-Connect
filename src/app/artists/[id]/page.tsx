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

    return (
        <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
            {/* Hero Section */}
            <div style={{
                background: "var(--gradient-primary)",
                color: "white",
                padding: "4rem 0 6rem"
            }}>
                <div className="container">
                    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
                        <img
                            src={artist.profilePhotoUrl || "https://i.pravatar.cc/150"}
                            alt={artist.displayName}
                            style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "var(--radius-full)",
                                border: "4px solid white",
                                boxShadow: "var(--shadow-xl)"
                            }}
                        />
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                                <h1 style={{ color: "white", fontSize: "2.5rem" }}>{artist.displayName}</h1>
                                <span className="tag tag-verified">✓ Verified</span>
                                {artist.isFeatured && <span className="tag tag-featured">⭐ Featured</span>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
                                <span className="rating" style={{ fontSize: "1.125rem" }}>
                                    <span className="star">★</span>
                                    <span style={{ fontWeight: 700 }}>{artist.avgRating.toFixed(1)}</span>
                                    <span style={{ opacity: 0.8 }}>({artist.totalReviews} reviews)</span>
                                </span>
                                {artist.city && (
                                    <span style={{ opacity: 0.9 }}>📍 {artist.city}</span>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {styles.map((style) => (
                                    <span key={style} className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                                        {style}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: "-3rem", paddingBottom: "4rem" }}>
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    {/* Main Content */}
                    <div style={{ flex: "1", minWidth: "300px" }}>
                        {/* About Card */}
                        <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
                            <h2 style={{ marginBottom: "1rem" }}>About</h2>
                            <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                                {artist.bio || "This artist hasn't added a bio yet."}
                            </p>

                            <div style={{ marginTop: "1.5rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                                <div>
                                    <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
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
                                    <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                                        Starting From
                                    </p>
                                    <p style={{ fontWeight: 700, color: "var(--primary-600)", fontSize: "1.25rem" }}>
                                        ₹{artist.startingPrice}
                                    </p>
                                </div>
                            </div>

                            {(artist.instagramUrl || artist.behanceUrl) && (
                                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                                    {artist.instagramUrl && (
                                        <a href={artist.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                            📸 Instagram
                                        </a>
                                    )}
                                    {artist.behanceUrl && (
                                        <a href={artist.behanceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                            🎨 Behance
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Portfolio Gallery */}
                        <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
                            <h2 style={{ marginBottom: "1.5rem" }}>Portfolio</h2>
                            {artist.portfolio.length > 0 ? (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                                    gap: "1rem"
                                }}>
                                    {artist.portfolio.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                aspectRatio: "1",
                                                borderRadius: "var(--radius-lg)",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title || "Portfolio"}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No portfolio images yet.</p>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="card" style={{ padding: "2rem" }}>
                            <h2 style={{ marginBottom: "1.5rem" }}>
                                Reviews ({artist.totalReviews})
                            </h2>
                            {artist.reviews.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {artist.reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            style={{
                                                paddingBottom: "1.5rem",
                                                borderBottom: "1px solid var(--gray-200)"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                <span style={{ fontWeight: 600 }}>{review.buyer.name}</span>
                                                <span className="rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.rating ? "star" : "star star-empty"}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </span>
                                            </div>
                                            <p style={{ color: "var(--gray-600)" }}>{review.comment}</p>
                                            <p className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No reviews yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Packages Sidebar */}
                    <aside style={{ width: "360px", flexShrink: 0 }}>
                        <div className="card" style={{ padding: "1.5rem", position: "sticky", top: "calc(var(--header-height) + 1rem)" }}>
                            <h3 style={{ marginBottom: "1.5rem" }}>Select a Package</h3>

                            {artist.packages.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {artist.packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            style={{
                                                padding: "1.5rem",
                                                border: "2px solid var(--gray-200)",
                                                borderRadius: "var(--radius-lg)",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                                                <h4>{pkg.name}</h4>
                                                <span className="badge badge-primary">
                                                    {pkg.deliveryType === "digital" ? "📥" : "📦"} {pkg.deliveryType}
                                                </span>
                                            </div>
                                            <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
                                                {pkg.description}
                                            </p>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                                <div>
                                                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary-600)" }}>
                                                        ₹{pkg.price}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p className="text-muted" style={{ fontSize: "0.75rem" }}>Delivery</p>
                                                    <p style={{ fontWeight: 500 }}>{pkg.deliveryTimeText}</p>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: "1rem" }}>
                                                ✓ {pkg.revisionsIncluded} revision{pkg.revisionsIncluded > 1 ? "s" : ""} included
                                            </div>
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
                                <p className="text-muted">No packages available.</p>
                            )}

                            {/* Policies */}
                            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-200)" }}>
                                <h4 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Policies</h4>
                                <ul style={{ fontSize: "0.875rem", color: "var(--gray-600)", listStyle: "none" }}>
                                    <li style={{ marginBottom: "0.5rem" }}>
                                        ✓ Revisions included in each package
                                    </li>
                                    <li style={{ marginBottom: "0.5rem" }}>
                                        ✓ Secure payment through platform
                                    </li>
                                    <li style={{ marginBottom: "0.5rem" }}>
                                        ✓ Communication via order notes
                                    </li>
                                    <li>
                                        ✓ Dispute resolution available
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
