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
            portfolio: { take: 1 },
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
            <div style={{
                background: "var(--gradient-primary)",
                color: "white",
                padding: "3rem 0",
                textAlign: "center"
            }}>
                <div className="container">
                    <h1 style={{ color: "white", marginBottom: "0.5rem" }}>Browse Artists</h1>
                    <p style={{ opacity: 0.9 }}>Find the perfect artist for your custom artwork</p>
                </div>
            </div>

            <div className="container" style={{ padding: "2rem 1.5rem" }}>
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    {/* Filters Sidebar */}
                    <aside style={{
                        width: "250px",
                        background: "white",
                        padding: "1.5rem",
                        borderRadius: "var(--radius-xl)",
                        boxShadow: "var(--shadow-card)",
                        height: "fit-content",
                        flexShrink: 0
                    }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>Filters</h3>

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
                                <label className="form-label">Price Range</label>
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
                        </form>
                    </aside>

                    {/* Artists Grid */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1.5rem"
                        }}>
                            <p className="text-muted">
                                {artists.length} artist{artists.length !== 1 ? "s" : ""} found
                            </p>
                        </div>

                        {artists.length === 0 ? (
                            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                                <p className="text-muted">No artists found matching your criteria.</p>
                                <Link href="/artists" className="btn btn-secondary mt-4">
                                    Clear Filters
                                </Link>
                            </div>
                        ) : (
                            <div className="grid-3">
                                {artists.map((artist) => (
                                    <Link key={artist.id} href={`/artists/${artist.id}`}>
                                        <article className="card artist-card">
                                            <div className="artist-card-image">
                                                <img
                                                    src={artist.portfolio[0]?.imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400"}
                                                    alt={artist.displayName}
                                                />
                                                <img
                                                    src={artist.profilePhotoUrl || "https://i.pravatar.cc/150"}
                                                    alt={artist.displayName}
                                                    className="artist-card-avatar"
                                                />
                                            </div>
                                            <div className="artist-card-body">
                                                <h3 className="artist-card-name">{artist.displayName}</h3>
                                                <div className="artist-card-meta">
                                                    <span className="rating">
                                                        <span className="star">★</span>
                                                        <span className="rating-value">{artist.avgRating.toFixed(1)}</span>
                                                        <span className="rating-count">({artist.totalReviews})</span>
                                                    </span>
                                                    {artist.city && <span>{artist.city}</span>}
                                                </div>
                                                <div className="artist-card-tags">
                                                    {JSON.parse(artist.styles).slice(0, 2).map((style: string) => (
                                                        <span key={style} className="tag">{style}</span>
                                                    ))}
                                                    {artist.isFeatured && (
                                                        <span className="tag tag-featured">⭐ Featured</span>
                                                    )}
                                                </div>
                                                <div className="artist-card-footer">
                                                    <span className="artist-card-price">
                                                        ₹{artist.startingPrice} <span>onwards</span>
                                                    </span>
                                                    {artist.packages[0] && (
                                                        <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                                                            {artist.packages[0].deliveryTimeText}
                                                        </span>
                                                    )}
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
