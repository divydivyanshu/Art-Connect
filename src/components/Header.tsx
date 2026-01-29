"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function Header() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const isLoggedIn = status === "authenticated";
    const isArtist = session?.user?.role === "artist";
    const isAdmin = session?.user?.role === "admin";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const getDashboardLink = () => {
        if (isAdmin) return "/admin";
        if (isArtist) return "/artist/dashboard";
        return "/user/dashboard";
    };

    const isActive = (path: string) => {
        if (path === "/artists") return pathname === "/artists" || pathname.startsWith("/artists/");
        return pathname === path;
    };

    return (
        <>
            <header className={`header ${scrolled ? "scrolled" : ""}`}>
                <div className="container header-content">
                    {/* Logo */}
                    <Link href="/" className="logo">
                        <span style={{ fontSize: "1.75rem" }}>🎨</span>
                        ArtConnect
                    </Link>

                    {/* Center Navigation */}
                    <nav className="nav desktop-only">
                        <Link
                            href="/artists"
                            className={`nav-link ${isActive("/artists") ? "active" : ""}`}
                        >
                            Browse Artists
                        </Link>
                        <Link
                            href="/#categories"
                            className="nav-link"
                        >
                            Categories
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className="nav-link"
                        >
                            How It Works
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="nav-actions">
                        {status === "loading" ? (
                            <div className="skeleton" style={{ width: 100, height: 40, borderRadius: "var(--radius-lg)" }} />
                        ) : isLoggedIn ? (
                            <>
                                <Link
                                    href={getDashboardLink()}
                                    className="btn btn-ghost btn-sm desktop-only"
                                >
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
                                <Link href="/become-artist" className="btn btn-secondary btn-sm desktop-only">
                                    Become an Artist
                                </Link>
                                <Link href="/user/signup" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-only btn btn-ghost btn-icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                            style={{ marginLeft: "0.5rem" }}
                        >
                            {mobileMenuOpen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-menu-overlay open"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <div className={`mobile-menu mobile-only ${mobileMenuOpen ? "open" : ""}`} style={{
                transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)"
            }}>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Link
                        href="/artists"
                        className={`nav-link ${isActive("/artists") ? "active" : ""}`}
                        style={{ padding: "1rem 0", borderBottom: "1px solid var(--gray-100)" }}
                    >
                        Browse Artists
                    </Link>
                    <Link
                        href="/#categories"
                        className="nav-link"
                        style={{ padding: "1rem 0", borderBottom: "1px solid var(--gray-100)" }}
                    >
                        Categories
                    </Link>
                    <Link
                        href="/#how-it-works"
                        className="nav-link"
                        style={{ padding: "1rem 0", borderBottom: "1px solid var(--gray-100)" }}
                    >
                        How It Works
                    </Link>
                    <Link
                        href="/become-artist"
                        className="nav-link"
                        style={{ padding: "1rem 0", borderBottom: "1px solid var(--gray-100)" }}
                    >
                        Become an Artist
                    </Link>
                    {isLoggedIn && (
                        <Link
                            href={getDashboardLink()}
                            className="nav-link"
                            style={{ padding: "1rem 0", borderBottom: "1px solid var(--gray-100)" }}
                        >
                            Dashboard
                        </Link>
                    )}
                    {!isLoggedIn && (
                        <Link
                            href="/user/login"
                            className="nav-link"
                            style={{ padding: "1rem 0", borderBottom: "1px solid var(--gray-100)" }}
                        >
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </>
    );
}
