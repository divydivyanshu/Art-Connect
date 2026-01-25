"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Header() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isLoggedIn = status === "authenticated";
    const isArtist = session?.user?.role === "artist";
    const isAdmin = session?.user?.role === "admin";

    const getDashboardLink = () => {
        if (isAdmin) return "/admin";
        if (isArtist) return "/artist/dashboard";
        return "/user/dashboard";
    };

    return (
        <header className="header">
            <div className="container header-content">
                <Link href="/" className="logo">
                    🎨 ArtConnect
                </Link>

                <nav className="nav desktop-only">
                    <Link href="/artists" className="nav-link">
                        Browse Artists
                    </Link>
                    <Link href="/become-artist" className="nav-link">
                        Become an Artist
                    </Link>
                </nav>

                <div className="nav-actions">
                    {status === "loading" ? (
                        <div className="skeleton" style={{ width: 100, height: 40 }} />
                    ) : isLoggedIn ? (
                        <>
                            <Link href={getDashboardLink()} className="btn btn-ghost btn-sm desktop-only">
                                Dashboard
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="btn btn-secondary btn-sm"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/user/login" className="btn btn-ghost btn-sm desktop-only">
                                Login
                            </Link>
                            <Link href="/user/signup" className="btn btn-primary btn-sm">
                                Sign Up
                            </Link>
                        </>
                    )}

                    <button
                        className="mobile-only btn btn-ghost btn-sm"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div
                    className="mobile-only"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "white",
                        padding: "1rem",
                        boxShadow: "var(--shadow-lg)",
                        zIndex: 99,
                    }}
                >
                    <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <Link href="/artists" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                            Browse Artists
                        </Link>
                        <Link href="/become-artist" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                            Become an Artist
                        </Link>
                        {isLoggedIn && (
                            <Link href={getDashboardLink()} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                        )}
                        {!isLoggedIn && (
                            <Link href="/user/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
