import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface SearchParams {
    category?: string;
    delivery?: string;
    priceMin?: string;
    priceMax?: string;
    speed?: string;
    city?: string;
    sort?: string;
}

async function getArtists(searchParams: SearchParams) {
    const where: any = {
        verificationStatus: "approved",
    };

    // Filter by category/style
    if (searchParams.category) {
        where.styles = {
            contains: searchParams.category,
        };
    }

    // Filter by city
    if (searchParams.city) {
        where.city = {
            contains: searchParams.city,
        };
    }

    // Filter by starting price
    if (searchParams.priceMin || searchParams.priceMax) {
        where.startingPrice = {};
        if (searchParams.priceMin) {
            where.startingPrice.gte = parseInt(searchParams.priceMin);
        }
        if (searchParams.priceMax) {
            where.startingPrice.lte = parseInt(searchParams.priceMax);
        }
    }

    // Build ordering
    let orderBy: any = { avgRating: "desc" };
    if (searchParams.sort === "price-low") {
        orderBy = { startingPrice: "asc" };
    } else if (searchParams.sort === "price-high") {
        orderBy = { startingPrice: "desc" };
    } else if (searchParams.sort === "reviews") {
        orderBy = { totalReviews: "desc" };
    }

    return await prisma.artistProfile.findMany({
        where,
        include: {
            portfolio: { take: 3 },
            packages: { where: { isActive: true }, take: 1 },
        },
        orderBy,
    });
}

export default async function BrowseArtistsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const artists = await getArtists(params);

    const categories = [
        { value: "", label: "All Styles" },
        { value: "Sketch", label: "Sketch" },
        { value: "Watercolor", label: "Watercolor" },
        { value: "Realistic", label: "Realistic" },
        { value: "Digital", label: "Digital" },
        { value: "Oil Painting", label: "Oil Painting" },
        { value: "Charcoal", label: "Charcoal" },
    ];

    const sortOptions = [
        { value: "", label: "Top Rated" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "reviews", label: "Most Reviews" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
            {/* Hero Banner */}
            <div className="browse-header">
                <div className="container">
                    <h1>Browse Artists</h1>
                    <p>Find the perfect artist for your custom artwork</p>
                </div>
            </div>

            <div className="container">
                <div className="browse-layout">
                    {/* Filters Sidebar */}
                    <aside className="browse-sidebar">
                        <h3>Filters</h3>

                        <form>
                            <div className="form-group">
                                <label className="form-label">Style</label>
                                <select
                                    name="category"
                                    className="form-input form-select"
                                    defaultValue={params.category || ""}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Delivery Type</label>
                                <select
                                    name="delivery"
                                    className="form-input form-select"
                                    defaultValue={params.delivery || ""}
                                >
                                    <option value="">All Types</option>
                                    <option value="digital">Digital Only</option>
                                    <option value="physical">Physical</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Price Range (₹)</label>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <input
                                        type="number"
                                        name="priceMin"
                                        className="form-input"
                                        placeholder="Min"
                                        defaultValue={params.priceMin || ""}
                                        style={{ width: "50%" }}
                                    />
                                    <input
                                        type="number"
                                        name="priceMax"
                                        className="form-input"
                                        placeholder="Max"
                                        defaultValue={params.priceMax || ""}
                                        style={{ width: "50%" }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    className="form-input"
                                    placeholder="e.g. Mumbai"
                                    defaultValue={params.city || ""}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sort By</label>
                                <select
                                    name="sort"
                                    className="form-input form-select"
                                    defaultValue={params.sort || ""}
                                >
                                    {sortOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                                Apply Filters
                            </button>

                            {(params.category || params.delivery || params.priceMin || params.priceMax || params.city) && (
                                <Link
                                    href="/artists"
                                    className="btn btn-ghost"
                                    style={{ width: "100%", marginTop: "0.75rem" }}
                                >
                                    Clear Filters
                                </Link>
                            )}
                        </form>
                    </aside>

                    {/* Artists Grid */}
                    <div>
                        <div className="browse-results-header">
                            <p className="browse-count">
                                <strong>{artists.length}</strong> artist{artists.length !== 1 ? "s" : ""} found
                            </p>
                        </div>

                        {artists.length === 0 ? (
                            <div className="card empty-state">
                                <div className="empty-state-icon">🔍</div>
                                <h3 className="empty-state-title">No artists found</h3>
                                <p className="empty-state-text">Try adjusting your filters to find more artists.</p>
                                <Link href="/artists" className="btn btn-secondary">
                                    Clear Filters
                                </Link>
                            </div>
                        ) : (
                            <div className="artists-grid">
                                {artists.map((artist) => (
                                    <Link key={artist.id} href={`/artists/${artist.id}`}>
                                        <article className="card artist-card">
                                            <div className="artist-card-cover">
                                                <img
                                                    src={artist.portfolio[0]?.imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400"}
                                                    alt={artist.displayName}
                                                />
                                                <img
                                                    src={artist.profilePhotoUrl || "https://i.pravatar.cc/150"}
                                                    alt={artist.displayName}
                                                    className="artist-card-avatar"
                                                />
                                                {artist.isFeatured && (
                                                    <span className="artist-card-featured tag tag-featured">⭐ Featured</span>
                                                )}
                                            </div>
                                            <div className="artist-card-body">
                                                <div className="artist-card-header">
                                                    <h3 className="artist-card-name">{artist.displayName}</h3>
                                                    <span className="artist-card-verified" title="Verified Artist">✓</span>
                                                </div>
                                                <div className="artist-card-meta">
                                                    <span className="rating">
                                                        <span className="star">★</span>
                                                        <span className="rating-value">{artist.avgRating.toFixed(1)}</span>
                                                        <span className="rating-count">({artist.totalReviews})</span>
                                                    </span>
                                                    {artist.city && <span>📍 {artist.city}</span>}
                                                </div>
                                                <div className="artist-card-tags">
                                                    {JSON.parse(artist.styles).slice(0, 2).map((style: string) => (
                                                        <span key={style} className="tag">{style}</span>
                                                    ))}
                                                </div>
                                                {/* Portfolio Preview */}
                                                {artist.portfolio.length > 0 && (
                                                    <div className="artist-card-portfolio">
                                                        {artist.portfolio.slice(0, 3).map((item) => (
                                                            <div key={item.id} className="artist-card-portfolio-item">
                                                                <img src={item.imageUrl} alt="Portfolio" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="artist-card-footer">
                                                    <div>
                                                        <span className="artist-card-price">
                                                            ₹{artist.startingPrice} <span>onwards</span>
                                                        </span>
                                                        {artist.packages[0] && (
                                                            <p className="artist-card-delivery">
                                                                {artist.packages[0].deliveryTimeText}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="btn btn-primary btn-sm">View</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
