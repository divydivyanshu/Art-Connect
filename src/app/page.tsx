import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getFeaturedArtists() {
  return await prisma.artistProfile.findMany({
    where: {
      verificationStatus: "approved",
      isFeatured: true,
    },
    include: {
      portfolio: { take: 3 },
    },
    take: 4,
  });
}

export default async function HomePage() {
  const featuredArtists = await getFeaturedArtists();

  const categories = [
    { name: "Portraits", subtitle: "Family & Individual", icon: "🖼️", slug: "portrait", color: "#fef3c7" },
    { name: "Pencil Sketch", subtitle: "Classic & Timeless", icon: "✏️", slug: "sketch", color: "#e0e7ff" },
    { name: "Watercolor", subtitle: "Soft & Artistic", icon: "🎨", slug: "watercolor", color: "#dbeafe" },
    { name: "Digital Art", subtitle: "Modern & Creative", icon: "💻", slug: "digital", color: "#fce7f3" },
    { name: "Oil Painting", subtitle: "Premium Canvas", icon: "🖌️", slug: "oil-painting", color: "#d1fae5" },
    { name: "Murals", subtitle: "Coming Soon", icon: "🏛️", slug: "murals", color: "#f3e8ff" },
  ];

  const testimonials = [
    {
      text: "The portrait Priya created for my parents' anniversary was absolutely stunning. They were moved to tears!",
      author: "Rahul Sharma",
      location: "Mumbai",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      text: "Fast delivery, excellent communication, and the quality exceeded my expectations. Highly recommended!",
      author: "Sneha Patel",
      location: "Bangalore",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      text: "Found the perfect artist for my wedding portrait. The whole process was smooth and professional.",
      author: "Amit Kumar",
      location: "Delhi",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=8",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            {/* Left: Content */}
            <div className="hero-content">
              <h1>Book Verified Artists for Portraits & Custom Art</h1>
              <p className="hero-subtitle">
                Get a digital portrait in 24–48 hours or order physical art delivered to your home.
                Connect with talented artists and transform your moments into timeless masterpieces.
              </p>
              <div className="hero-actions">
                <Link href="/artists" className="btn btn-primary btn-lg">
                  Browse Artists
                </Link>
                <Link href="/become-artist" className="btn btn-outline btn-lg">
                  Become an Artist
                </Link>
              </div>
              <Link href="#how-it-works" className="hero-link">
                Learn how it works <span>→</span>
              </Link>

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <div className="trust-badge-icon">⭐</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>4.8 Rating</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Average</div>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon">✓</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Verified</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Artists</div>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon">⚡</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>24-48 hrs</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Delivery</div>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon">🔒</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Secure</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Payments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hero-visual">
              <div className="hero-visual-grid">
                <div className="hero-visual-item">
                  <img
                    src="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop"
                    alt="Portrait art example"
                  />
                </div>
                <div className="hero-visual-item">
                  <img
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop"
                    alt="Sketch art example"
                  />
                </div>
                <div className="hero-visual-item">
                  <img
                    src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop"
                    alt="Watercolor art example"
                  />
                </div>
                <div className="hero-visual-item">
                  <img
                    src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=400&fit=crop"
                    alt="Digital art example"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Artists</h2>
            <p>Discover our top-rated creative professionals</p>
          </div>

          <div className="grid-4">
            {featuredArtists.map((artist) => (
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
                      <span className="artist-card-price">
                        ₹{artist.startingPrice} <span>onwards</span>
                      </span>
                      <span className="btn btn-primary btn-sm">View Profile</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/artists" className="btn btn-secondary">
              View All Artists →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2>Popular Categories</h2>
            <p>Find the perfect style for your custom artwork</p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link key={category.slug} href={`/artists?category=${category.slug}`}>
                <div className="category-card" style={{ background: category.color }}>
                  <div className="category-card-inner">
                    <div className="category-card-icon">{category.icon}</div>
                    <h3 className="category-card-title">{category.name}</h3>
                    <p className="category-card-subtitle">{category.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get your custom art in 3 simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card card">
              <span className="step-number">1</span>
              <div className="step-icon">🔍</div>
              <h3 className="step-title">Choose an Artist</h3>
              <p className="step-description">
                Browse our verified artists. Filter by style, price, and delivery time.
              </p>
            </div>
            <div className="step-card card">
              <span className="step-number">2</span>
              <div className="step-icon">📤</div>
              <h3 className="step-title">Upload Your Photo</h3>
              <p className="step-description">
                Select a package and share your reference photos and requirements.
              </p>
            </div>
            <div className="step-card card">
              <span className="step-number">3</span>
              <div className="step-icon">🎨</div>
              <h3 className="step-title">Get Your Artwork</h3>
              <p className="step-description">
                Receive your custom masterpiece digitally or delivered to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ArtConnect - Trust Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose ArtConnect?</h2>
            <p>Trusted by thousands of happy customers</p>
          </div>

          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-card-icon">✓</div>
              <h3 className="trust-card-title">Verified Artists</h3>
              <p className="trust-card-text">Every artist is verified for quality and professionalism</p>
            </div>
            <div className="trust-card">
              <div className="trust-card-icon">⚡</div>
              <h3 className="trust-card-title">Fast Delivery</h3>
              <p className="trust-card-text">Get digital art in 24-48 hours with express options</p>
            </div>
            <div className="trust-card">
              <div className="trust-card-icon">🔒</div>
              <h3 className="trust-card-title">Secure Payments</h3>
              <p className="trust-card-text">All transactions are protected and secure</p>
            </div>
            <div className="trust-card">
              <div className="trust-card-icon">🎁</div>
              <h3 className="trust-card-title">Gift-Ready</h3>
              <p className="trust-card-text">Perfect for birthdays, anniversaries, and special occasions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Join thousands of happy customers</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-info">
                    <p className="testimonial-author">{testimonial.author}</p>
                    <p className="testimonial-location">{testimonial.location}</p>
                  </div>
                </div>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < testimonial.rating ? "star" : "star star-empty"}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of customers who have transformed their photos into stunning artwork.
            </p>
            <div className="cta-actions">
              <Link href="/artists" className="btn btn-primary btn-lg">
                Find an Artist
              </Link>
              <Link href="/become-artist" className="btn btn-outline btn-lg">
                Join as Artist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
