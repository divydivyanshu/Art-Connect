import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getFeaturedArtists() {
  return await prisma.artistProfile.findMany({
    where: {
      verificationStatus: "approved",
      isFeatured: true,
    },
    include: {
      portfolio: { take: 1 },
    },
    take: 4,
  });
}

export default async function HomePage() {
  const featuredArtists = await getFeaturedArtists();

  const categories = [
    { name: "Portrait", image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400", slug: "portrait" },
    { name: "Sketch", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400", slug: "sketch" },
    { name: "Watercolor", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400", slug: "watercolor" },
    { name: "Digital Art", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400", slug: "digital" },
    { name: "Oil Painting", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400", slug: "oil-painting" },
  ];

  const testimonials = [
    {
      text: "The portrait Priya created for my parents' anniversary was absolutely stunning. They were moved to tears!",
      author: "Rahul Sharma",
      role: "Happy Customer",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      text: "Fast delivery, excellent communication, and the quality exceeded my expectations. Will definitely order again!",
      author: "Sneha Patel",
      role: "Repeat Customer",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      text: "Found the perfect artist for my wedding portrait. The whole process was smooth and professional.",
      author: "Amit Kumar",
      role: "Happy Customer",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
  ];

  const faqs = [
    {
      question: "How do I order custom art?",
      answer: "Browse our verified artists, select a package that fits your needs, upload reference photos, and complete your order. The artist will start working on your masterpiece!",
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery times vary by artist and package - from 24 hours for quick sketches to 14 days for premium canvas paintings. Check the package details for specific timelines.",
    },
    {
      question: "Can I request revisions?",
      answer: "Yes! Each package includes a set number of revisions. Artists work with you to ensure your complete satisfaction.",
    },
    {
      question: "How do physical deliveries work?",
      answer: "For physical art, artists carefully package and ship your artwork. Shipping is included in the package price, and you'll receive tracking details.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Book Verified Artists for Portraits & Custom Art</h1>
            <p className="hero-subtitle">
              Transform your moments into timeless masterpieces. Connect with talented artists
              for custom portraits, paintings, sketches, and digital art.
            </p>
            <div className="hero-actions">
              <Link href="/artists" className="btn btn-primary btn-lg">
                Browse Artists
              </Link>
              <Link href="/become-artist" className="btn btn-outline btn-lg">
                Become an Artist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <h2>Featured Artists</h2>
            <p className="text-muted mt-2">Discover our top-rated creative professionals</p>
          </div>

          <div className="grid-4">
            {featuredArtists.map((artist) => (
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
                      <span>{artist.city}</span>
                    </div>
                    <div className="artist-card-tags">
                      {JSON.parse(artist.styles).slice(0, 2).map((style: string) => (
                        <span key={style} className="tag">{style}</span>
                      ))}
                      <span className="tag tag-verified">✓ Verified</span>
                    </div>
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
      <section className="section" style={{ background: "var(--gray-100)" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>Popular Categories</h2>
            <p className="text-muted mt-2">Find the perfect style for your needs</p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link key={category.slug} href={`/artists?category=${category.slug}`}>
                <div className="category-card">
                  <img src={category.image} alt={category.name} />
                  <div className="category-card-overlay">
                    <span className="category-card-title">{category.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <h2>How It Works</h2>
            <p className="text-muted mt-2">Get your custom art in 3 simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card card">
              <div className="step-icon">🔍</div>
              <h3 className="step-title">1. Find Your Artist</h3>
              <p className="step-description">
                Browse our curated selection of verified artists. Filter by style, price, and delivery time.
              </p>
            </div>
            <div className="step-card card">
              <div className="step-icon">📝</div>
              <h3 className="step-title">2. Place Your Order</h3>
              <p className="step-description">
                Choose a package, upload reference photos, and share your vision. Pay securely online.
              </p>
            </div>
            <div className="step-card card">
              <div className="step-icon">🎨</div>
              <h3 className="step-title">3. Receive Your Art</h3>
              <p className="step-description">
                Track progress, request revisions, and receive your custom masterpiece digitally or physically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: "var(--gradient-hero)", color: "white" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ color: "white" }}>What Our Customers Say</h2>
            <p style={{ opacity: 0.9 }} className="mt-2">Join thousands of happy customers</p>
          </div>

          <div className="grid-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card testimonial-card">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="testimonial-avatar"
                />
                <p className="testimonial-text">"{testimonial.text}"</p>
                <p className="testimonial-author">{testimonial.author}</p>
                <p className="testimonial-role">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card"
                style={{ padding: "1.5rem", marginBottom: "1rem" }}
              >
                <h4 style={{ marginBottom: "0.5rem" }}>{faq.question}</h4>
                <p className="text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ background: "var(--gray-900)", color: "white" }}>
        <div className="container text-center">
          <h2 style={{ color: "white", marginBottom: "1rem" }}>Ready to Get Started?</h2>
          <p style={{ opacity: 0.8, marginBottom: "2rem", maxWidth: 600, margin: "0 auto 2rem" }}>
            Join thousands of customers who have transformed their photos into stunning artwork.
          </p>
          <div className="flex justify-center gap-4" style={{ flexWrap: "wrap" }}>
            <Link href="/artists" className="btn btn-primary btn-lg">
              Find an Artist
            </Link>
            <Link href="/become-artist" className="btn btn-outline btn-lg">
              Join as Artist
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
