"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ArtistLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                loginType: "artist",
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/artist/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <Link href="/" className="logo" style={{ marginBottom: "1rem", display: "block" }}>
                        🎨 ArtConnect
                    </Link>
                    <h1 className="auth-title">Artist Login</h1>
                    <p className="auth-subtitle">Access your artist dashboard</p>
                </div>

                {error && (
                    <div style={{
                        padding: "0.75rem",
                        background: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "var(--radius-md)",
                        marginBottom: "1rem",
                        fontSize: "0.875rem"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        New artist?{" "}
                        <Link href="/become-artist">Join as Artist</Link>
                    </p>
                    <p className="mt-2">
                        Looking to order art?{" "}
                        <Link href="/user/login">Buyer Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
