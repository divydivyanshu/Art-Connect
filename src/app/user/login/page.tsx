"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/user/dashboard";

    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                loginType: "user",
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!phone || phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }
        // MVP: Just pretend we sent the OTP
        setOtpSent(true);
        setError("");
    };

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("phone-otp", {
                phone,
                otp,
                loginType: "user",
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push(callbackUrl);
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
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Login to your buyer account</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${authMethod === "email" ? "active" : ""}`}
                        onClick={() => { setAuthMethod("email"); setError(""); }}
                    >
                        Email
                    </button>
                    <button
                        className={`auth-tab ${authMethod === "phone" ? "active" : ""}`}
                        onClick={() => { setAuthMethod("phone"); setError(""); }}
                    >
                        Phone OTP
                    </button>
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

                {authMethod === "email" ? (
                    <form onSubmit={handleEmailLogin}>
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
                ) : (
                    <form onSubmit={handlePhoneLogin}>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="Enter 10-digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    disabled={otpSent}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleSendOtp}
                                    disabled={otpSent}
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    {otpSent ? "Sent" : "Send OTP"}
                                </button>
                            </div>
                        </div>

                        {otpSent && (
                            <div className="form-group">
                                <label className="form-label">Enter OTP</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                />
                                <p className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                                    (MVP: Enter any 6-digit code)
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            disabled={loading || !otpSent}
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link href="/user/signup">Sign up</Link>
                    </p>
                    <p className="mt-2">
                        Are you an artist?{" "}
                        <Link href="/artist/login">Artist Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function UserLoginPage() {
    return (
        <Suspense fallback={<div className="auth-page"><div className="auth-card">Loading...</div></div>}>
            <LoginForm />
        </Suspense>
    );
}
