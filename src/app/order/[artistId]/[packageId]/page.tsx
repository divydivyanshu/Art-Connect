"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface OrderPageProps {
    params: Promise<{ artistId: string; packageId: string }>;
}

export default function OrderPage({ params }: OrderPageProps) {
    const { artistId, packageId } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [packageData, setPackageData] = useState<any>(null);
    const [artistData, setArtistData] = useState<any>(null);

    const [instructions, setInstructions] = useState("");
    const [deliveryType, setDeliveryType] = useState("digital");
    const [shippingAddress, setShippingAddress] = useState("");
    const [referenceFiles, setReferenceFiles] = useState<string[]>([]);

    // Add-ons
    const [extraPerson, setExtraPerson] = useState(false);
    const [detailedBackground, setDetailedBackground] = useState(false);
    const [expressDelivery, setExpressDelivery] = useState(false);

    // Fetch data on mount
    useState(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/packages/${packageId}`);
                const data = await res.json();
                if (data.package) {
                    setPackageData(data.package);
                    setArtistData(data.artist);
                    setDeliveryType(data.package.deliveryType);
                }
            } catch (e) {
                console.error("Failed to fetch package data");
            }
        }
        fetchData();
    });

    if (status === "loading") {
        return (
            <div className="auth-page">
                <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="auth-page">
                <div className="card" style={{ padding: "3rem", textAlign: "center", maxWidth: "500px" }}>
                    <h2>Login Required</h2>
                    <p className="text-muted mt-2 mb-6">
                        You need to be logged in to place an order.
                    </p>
                    <Link
                        href={`/user/login?callbackUrl=/order/${artistId}/${packageId}`}
                        className="btn btn-primary"
                    >
                        Login to Continue
                    </Link>
                    <p className="mt-4 text-muted">
                        Don't have an account? <Link href="/user/signup" className="text-primary">Sign up</Link>
                    </p>
                </div>
            </div>
        );
    }

    const addOns = packageData?.addOns ? JSON.parse(packageData.addOns) : {};

    const calculateTotal = () => {
        let total = packageData?.price || 0;
        if (extraPerson && addOns.extraPerson) total += addOns.extraPerson;
        if (detailedBackground && addOns.detailedBackground) total += addOns.detailedBackground;
        if (expressDelivery && addOns.expressDelivery) total += addOns.expressDelivery;
        return total;
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!instructions.trim()) {
            setError("Please provide instructions for the artist");
            return;
        }

        if (deliveryType === "physical" && !shippingAddress.trim()) {
            setError("Please provide a shipping address for physical delivery");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    artistProfileId: artistId,
                    packageId,
                    instructions,
                    deliveryType,
                    shippingAddress: deliveryType === "physical" ? shippingAddress : null,
                    addOnsSelected: { extraPerson, detailedBackground, expressDelivery },
                    totalPrice: calculateTotal(),
                    referenceFiles,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create order");
                return;
            }

            // Redirect to order confirmation
            router.push(`/orders/${data.order.id}/confirmation`);
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--gray-50)", padding: "2rem 0" }}>
            <div className="container">
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <h1 style={{ marginBottom: "2rem" }}>Place Your Order</h1>

                    {error && (
                        <div style={{
                            padding: "1rem",
                            background: "#fee2e2",
                            color: "#991b1b",
                            borderRadius: "var(--radius-lg)",
                            marginBottom: "1.5rem"
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                        {/* Order Form */}
                        <div style={{ flex: "1", minWidth: "300px" }}>
                            <form onSubmit={handleSubmitOrder}>
                                <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                                    <h3 style={{ marginBottom: "1.5rem" }}>Order Details</h3>

                                    <div className="form-group">
                                        <label className="form-label">Instructions for the Artist *</label>
                                        <textarea
                                            className="form-input form-textarea"
                                            placeholder="Describe what you want. Include details about style, colors, poses, mood, etc."
                                            value={instructions}
                                            onChange={(e) => setInstructions(e.target.value)}
                                            rows={5}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Reference Photos (Optional)</label>
                                        <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                                            Upload up to 5 reference images
                                        </p>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Paste image URL (MVP: Image upload coming soon)"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                                    e.preventDefault();
                                                    setReferenceFiles([...referenceFiles, (e.target as HTMLInputElement).value]);
                                                    (e.target as HTMLInputElement).value = "";
                                                }
                                            }}
                                        />
                                        {referenceFiles.length > 0 && (
                                            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                {referenceFiles.map((file, i) => (
                                                    <span key={i} className="tag">
                                                        Image {i + 1}
                                                        <button
                                                            type="button"
                                                            onClick={() => setReferenceFiles(referenceFiles.filter((_, j) => j !== i))}
                                                            style={{ marginLeft: "0.5rem", color: "var(--error)" }}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Delivery Type</label>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                                <input
                                                    type="radio"
                                                    name="deliveryType"
                                                    value="digital"
                                                    checked={deliveryType === "digital"}
                                                    onChange={(e) => setDeliveryType(e.target.value)}
                                                />
                                                📥 Digital Delivery
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                                <input
                                                    type="radio"
                                                    name="deliveryType"
                                                    value="physical"
                                                    checked={deliveryType === "physical"}
                                                    onChange={(e) => setDeliveryType(e.target.value)}
                                                />
                                                📦 Physical Delivery
                                            </label>
                                        </div>
                                    </div>

                                    {deliveryType === "physical" && (
                                        <div className="form-group">
                                            <label className="form-label">Shipping Address *</label>
                                            <textarea
                                                className="form-input form-textarea"
                                                placeholder="Enter your complete shipping address"
                                                value={shippingAddress}
                                                onChange={(e) => setShippingAddress(e.target.value)}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                                    <h3 style={{ marginBottom: "1.5rem" }}>Add-ons (Optional)</h3>

                                    {addOns.extraPerson && (
                                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-md)", marginBottom: "0.75rem", cursor: "pointer" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={extraPerson}
                                                    onChange={(e) => setExtraPerson(e.target.checked)}
                                                />
                                                <span>Extra Person</span>
                                            </span>
                                            <span style={{ fontWeight: 600 }}>+₹{addOns.extraPerson}</span>
                                        </label>
                                    )}

                                    {addOns.detailedBackground && (
                                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-md)", marginBottom: "0.75rem", cursor: "pointer" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={detailedBackground}
                                                    onChange={(e) => setDetailedBackground(e.target.checked)}
                                                />
                                                <span>Detailed Background</span>
                                            </span>
                                            <span style={{ fontWeight: 600 }}>+₹{addOns.detailedBackground}</span>
                                        </label>
                                    )}

                                    {addOns.expressDelivery && (
                                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={expressDelivery}
                                                    onChange={(e) => setExpressDelivery(e.target.checked)}
                                                />
                                                <span>Express Delivery</span>
                                            </span>
                                            <span style={{ fontWeight: 600 }}>+₹{addOns.expressDelivery}</span>
                                        </label>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    style={{ width: "100%" }}
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : `Pay ₹${calculateTotal()}`}
                                </button>
                                <p className="text-muted text-center mt-2" style={{ fontSize: "0.75rem" }}>
                                    (MVP: Payment is simulated. Order will be created as "Paid")
                                </p>
                            </form>
                        </div>

                        {/* Order Summary Sidebar */}
                        <aside style={{ width: "300px", flexShrink: 0 }}>
                            <div className="card" style={{ padding: "1.5rem", position: "sticky", top: "calc(var(--header-height) + 1rem)" }}>
                                <h3 style={{ marginBottom: "1rem" }}>Order Summary</h3>

                                {packageData ? (
                                    <>
                                        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--gray-200)" }}>
                                            <img
                                                src={artistData?.profilePhotoUrl || "https://i.pravatar.cc/150"}
                                                alt="Artist"
                                                style={{ width: "48px", height: "48px", borderRadius: "var(--radius-full)" }}
                                            />
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{artistData?.displayName}</p>
                                                <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                                                    {packageData.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ fontSize: "0.9375rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                <span>Base Price</span>
                                                <span>₹{packageData.price}</span>
                                            </div>

                                            {extraPerson && addOns.extraPerson && (
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                    <span>Extra Person</span>
                                                    <span>₹{addOns.extraPerson}</span>
                                                </div>
                                            )}

                                            {detailedBackground && addOns.detailedBackground && (
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                    <span>Detailed Background</span>
                                                    <span>₹{addOns.detailedBackground}</span>
                                                </div>
                                            )}

                                            {expressDelivery && addOns.expressDelivery && (
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                    <span>Express Delivery</span>
                                                    <span>₹{addOns.expressDelivery}</span>
                                                </div>
                                            )}

                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginTop: "1rem",
                                                paddingTop: "1rem",
                                                borderTop: "2px solid var(--gray-900)",
                                                fontWeight: 700,
                                                fontSize: "1.125rem"
                                            }}>
                                                <span>Total</span>
                                                <span>₹{calculateTotal()}</span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                                            <p>📦 Delivery: {packageData.deliveryTimeText}</p>
                                            <p>🔄 Revisions: {packageData.revisionsIncluded} included</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="skeleton" style={{ height: "200px" }} />
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
