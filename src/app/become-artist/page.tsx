"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BecomeArtistPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Step 1: Account
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Step 2: Profile
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [city, setCity] = useState("");
    const [styles, setStyles] = useState<string[]>([]);
    const [deliveryTypes, setDeliveryTypes] = useState<string[]>(["digital"]);
    const [startingPrice, setStartingPrice] = useState("");
    const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
    const [instagramUrl, setInstagramUrl] = useState("");

    // Step 3: Package
    const [packageName, setPackageName] = useState("");
    const [packageDesc, setPackageDesc] = useState("");
    const [packagePrice, setPackagePrice] = useState("");
    const [packageDelivery, setPackageDelivery] = useState("3-5 days");
    const [packageType, setPackageType] = useState("digital");

    const styleOptions = ["Sketch", "Watercolor", "Realistic", "Digital", "Oil Painting", "Charcoal", "Pencil Portrait", "Caricature"];

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: "artist" }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Signup failed");
                return;
            }

            // Login
            await signIn("credentials", {
                email,
                password,
                loginType: "artist",
                redirect: false,
            });

            setDisplayName(name.split(" ")[0]);
            setStep(2);
        } catch (e) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!displayName || !bio || styles.length === 0 || !startingPrice) {
            setError("Please fill in all required fields");
            return;
        }

        if (portfolioUrls.length < 3) {
            setError("Please add at least 3 portfolio images");
            return;
        }

        setStep(3);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!packageName || !packageDesc || !packagePrice) {
            setError("Please fill in all package details");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/artist/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile: {
                        displayName,
                        bio,
                        city,
                        styles,
                        deliveryTypes,
                        startingPrice: parseFloat(startingPrice),
                        instagramUrl: instagramUrl || null,
                    },
                    portfolioUrls,
                    package: {
                        name: packageName,
                        description: packageDesc,
                        price: parseFloat(packagePrice),
                        deliveryTimeText: packageDelivery,
                        deliveryType: packageType,
                    },
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to create profile");
                return;
            }

            router.push("/artist/dashboard");
            router.refresh();
        } catch (e) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const toggleStyle = (style: string) => {
        if (styles.includes(style)) {
            setStyles(styles.filter(s => s !== style));
        } else {
            setStyles([...styles, style]);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--gray-50)", padding: "2rem 0 4rem" }}>
            <div className="container">
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    {/* Progress */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    opacity: step >= s ? 1 : 0.4,
                                }}
                            >
                                <div
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "var(--radius-full)",
                                        background: step >= s ? "var(--primary-500)" : "var(--gray-300)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                    }}
                                >
                                    {s}
                                </div>
                                <span style={{ fontWeight: 500 }}>
                                    {s === 1 ? "Account" : s === 2 ? "Profile" : "Package"}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: "2.5rem" }}>
                        {error && (
                            <div style={{
                                padding: "0.75rem",
                                background: "#fee2e2",
                                color: "#991b1b",
                                borderRadius: "var(--radius-md)",
                                marginBottom: "1.5rem",
                                fontSize: "0.875rem"
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Step 1: Account */}
                        {step === 1 && (
                            <form onSubmit={handleStep1}>
                                <h2 style={{ marginBottom: "0.5rem" }}>Create Your Artist Account</h2>
                                <p className="text-muted mb-6">Start selling your art to thousands of customers</p>

                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                                    {loading ? "Creating Account..." : "Continue →"}
                                </button>

                                <p className="text-center text-muted mt-4">
                                    Already have an account? <Link href="/artist/login">Login</Link>
                                </p>
                            </form>
                        )}

                        {/* Step 2: Profile */}
                        {step === 2 && (
                            <form onSubmit={handleStep2}>
                                <h2 style={{ marginBottom: "0.5rem" }}>Build Your Profile</h2>
                                <p className="text-muted mb-6">This info will be shown publicly</p>

                                <div className="form-group">
                                    <label className="form-label">Display Name * (public)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="e.g. Priya"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Bio * (public)</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell buyers about your artistic style and experience..."
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">City (optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="e.g. Delhi NCR"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Art Styles * (select multiple)</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                        {styleOptions.map((style) => (
                                            <button
                                                key={style}
                                                type="button"
                                                onClick={() => toggleStyle(style)}
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "var(--radius-full)",
                                                    border: "2px solid",
                                                    borderColor: styles.includes(style) ? "var(--primary-500)" : "var(--gray-300)",
                                                    background: styles.includes(style) ? "var(--primary-50)" : "white",
                                                    color: styles.includes(style) ? "var(--primary-700)" : "var(--gray-600)",
                                                    fontWeight: 500,
                                                    fontSize: "0.875rem",
                                                }}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Starting Price (₹) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={startingPrice}
                                        onChange={(e) => setStartingPrice(e.target.value)}
                                        placeholder="499"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Portfolio Images * (min 3)</label>
                                    <p className="text-muted" style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                                        Paste image URLs and press Enter
                                    </p>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Paste image URL and press Enter"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const input = e.target as HTMLInputElement;
                                                if (input.value && portfolioUrls.length < 10) {
                                                    setPortfolioUrls([...portfolioUrls, input.value]);
                                                    input.value = "";
                                                }
                                            }
                                        }}
                                    />
                                    {portfolioUrls.length > 0 && (
                                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                                            {portfolioUrls.map((url, i) => (
                                                <div key={i} style={{ position: "relative" }}>
                                                    <img src={url} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-md)" }} />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPortfolioUrls(portfolioUrls.filter((_, j) => j !== i))}
                                                        style={{
                                                            position: "absolute",
                                                            top: "-8px",
                                                            right: "-8px",
                                                            width: "20px",
                                                            height: "20px",
                                                            borderRadius: "var(--radius-full)",
                                                            background: "var(--error)",
                                                            color: "white",
                                                            fontSize: "12px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Instagram (optional)</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={instagramUrl}
                                        onChange={(e) => setInstagramUrl(e.target.value)}
                                        placeholder="https://instagram.com/yourhandle"
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                                        ← Back
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Continue →
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: First Package */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit}>
                                <h2 style={{ marginBottom: "0.5rem" }}>Create Your First Package</h2>
                                <p className="text-muted mb-6">You can add more packages later</p>

                                <div className="form-group">
                                    <label className="form-label">Package Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={packageName}
                                        onChange={(e) => setPackageName(e.target.value)}
                                        placeholder="e.g. Quick Sketch"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        value={packageDesc}
                                        onChange={(e) => setPackageDesc(e.target.value)}
                                        placeholder="What's included in this package?"
                                        required
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Price (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={packagePrice}
                                            onChange={(e) => setPackagePrice(e.target.value)}
                                            placeholder="499"
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Delivery Time</label>
                                        <select
                                            className="form-input form-select"
                                            value={packageDelivery}
                                            onChange={(e) => setPackageDelivery(e.target.value)}
                                        >
                                            <option value="24-48 hrs">24-48 hrs</option>
                                            <option value="3-5 days">3-5 days</option>
                                            <option value="7-14 days">7-14 days</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Delivery Type</label>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <input
                                                type="radio"
                                                value="digital"
                                                checked={packageType === "digital"}
                                                onChange={(e) => setPackageType(e.target.value)}
                                            />
                                            Digital
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <input
                                                type="radio"
                                                value="physical"
                                                checked={packageType === "physical"}
                                                onChange={(e) => setPackageType(e.target.value)}
                                            />
                                            Physical
                                        </label>
                                    </div>
                                </div>

                                <div style={{
                                    background: "var(--primary-50)",
                                    padding: "1rem",
                                    borderRadius: "var(--radius-md)",
                                    marginBottom: "1.5rem"
                                }}>
                                    <p style={{ fontWeight: 500, marginBottom: "0.25rem" }}>📋 What happens next?</p>
                                    <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                                        Your profile will be reviewed by our team. Once approved, you'll go live and start receiving orders!
                                    </p>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                                        ← Back
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                        {loading ? "Submitting..." : "Submit for Approval"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
