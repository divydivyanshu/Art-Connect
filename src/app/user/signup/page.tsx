"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserSignupPage() {
    const router = useRouter();

    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: "user" }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Signup failed");
                return;
            }

            // Auto login after signup
            const result = await signIn("credentials", {
                email,
                password,
                loginType: "user",
                redirect: false,
            });

            if (result?.error) {
                setError("Account created. Please login manually.");
                router.push("/user/login");
            } else {
                router.push("/user/dashboard");
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
        if (!name) {
            setError("Please enter your name");
            return;
        }
        // MVP: Just pretend we sent the OTP
        setOtpSent(true);
        setError("");
    };

    const handlePhoneSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // First register the user
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, role: "user" }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Signup failed");
                setLoading(false);
                return;
            }

            // Then login with phone OTP
            const result = await signIn("phone-otp", {
                phone,
                otp,
                loginType: "user",
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/user/dashboard");
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
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join as a buyer to order custom art</p>
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
                        Phone
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
                    <form onSubmit={handleEmailSignup}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

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
                                placeholder="Create a password (min 6 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePhoneSignup}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={otpSent}
                                required
                            />
                        </div>

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
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link href="/user/login">Sign in</Link>
                    </p>
                    <p className="mt-2">
                        Want to sell your art?{" "}
                        <Link href="/become-artist">Become an Artist</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
