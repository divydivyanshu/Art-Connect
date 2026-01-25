"use client";

import { useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ReviewPageProps {
    params: Promise<{ id: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
    const { id: orderId } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    rating,
                    comment,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to submit review");
                return;
            }

            router.push("/user/dashboard");
            router.refresh();
        } catch (e) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--gray-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
        }}>
            <div className="card" style={{ maxWidth: "500px", width: "100%", padding: "2.5rem" }}>
                <h2 style={{ marginBottom: "0.5rem", textAlign: "center" }}>Leave a Review</h2>
                <p className="text-muted text-center mb-6">Share your experience with this artist</p>

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

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ textAlign: "center" }}>
                        <label className="form-label">Rating</label>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", fontSize: "2rem" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: star <= rating ? "#fbbf24" : "var(--gray-300)",
                                        transition: "transform 0.2s",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Your Review</label>
                        <textarea
                            className="form-input form-textarea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience..."
                            rows={4}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
}
