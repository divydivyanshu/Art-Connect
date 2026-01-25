"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Artist {
    id: string;
    displayName: string;
    city: string | null;
    verificationStatus: string;
    isFeatured: boolean;
    avgRating: number;
    totalReviews: number;
    createdAt: string;
    user: {
        email: string | null;
    };
}

interface Order {
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    buyer: { name: string };
    artistProfile: { displayName: string };
    package: { name: string };
}

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("artists");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/user/login");
        }
        if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [artistsRes, ordersRes] = await Promise.all([
                    fetch("/api/admin/artists"),
                    fetch("/api/admin/orders"),
                ]);

                const artistsData = await artistsRes.json();
                const ordersData = await ordersRes.json();

                if (artistsData.artists) setArtists(artistsData.artists);
                if (ordersData.orders) setOrders(ordersData.orders);
            } catch (e) {
                console.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        }

        if (session?.user?.role === "admin") {
            fetchData();
        }
    }, [session]);

    const updateArtistStatus = async (artistId: string, newStatus: string) => {
        setUpdating(artistId);
        try {
            const res = await fetch(`/api/admin/artists/${artistId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verificationStatus: newStatus }),
            });

            if (res.ok) {
                setArtists(artists.map(artist =>
                    artist.id === artistId ? { ...artist, verificationStatus: newStatus } : artist
                ));
            }
        } catch (e) {
            console.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const toggleFeatured = async (artistId: string, isFeatured: boolean) => {
        setUpdating(artistId);
        try {
            const res = await fetch(`/api/admin/artists/${artistId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFeatured: !isFeatured }),
            });

            if (res.ok) {
                setArtists(artists.map(artist =>
                    artist.id === artistId ? { ...artist, isFeatured: !isFeatured } : artist
                ));
            }
        } catch (e) {
            console.error("Failed to toggle featured");
        } finally {
            setUpdating(null);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>Loading...</p>
            </div>
        );
    }

    const pendingArtists = artists.filter(a => a.verificationStatus === "pending");
    const approvedArtists = artists.filter(a => a.verificationStatus === "approved");

    return (
        <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
            <div style={{ background: "var(--gray-900)", color: "white", padding: "2rem 0" }}>
                <div className="container">
                    <h1 style={{ color: "white" }}>Admin Dashboard</h1>
                    <p style={{ opacity: 0.8 }}>Manage artists, orders, and platform settings</p>
                </div>
            </div>

            <div className="container" style={{ padding: "2rem 1.5rem" }}>
                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: "2rem" }}>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <p className="text-muted" style={{ fontSize: "0.875rem" }}>Total Artists</p>
                        <p style={{ fontSize: "2rem", fontWeight: 700 }}>{artists.length}</p>
                    </div>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <p className="text-muted" style={{ fontSize: "0.875rem" }}>Pending Approval</p>
                        <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--warning)" }}>
                            {pendingArtists.length}
                        </p>
                    </div>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <p className="text-muted" style={{ fontSize: "0.875rem" }}>Total Orders</p>
                        <p style={{ fontSize: "2rem", fontWeight: 700 }}>{orders.length}</p>
                    </div>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <p className="text-muted" style={{ fontSize: "0.875rem" }}>Revenue</p>
                        <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>
                            ₹{orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "2rem",
                    background: "white",
                    padding: "0.5rem",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-sm)"
                }}>
                    {[
                        { key: "artists", label: "Manage Artists" },
                        { key: "pending", label: `Pending (${pendingArtists.length})` },
                        { key: "orders", label: "All Orders" },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "var(--radius-md)",
                                fontWeight: 500,
                                background: activeTab === tab.key ? "var(--gray-900)" : "transparent",
                                color: activeTab === tab.key ? "white" : "var(--gray-600)",
                                transition: "all 0.2s",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Artists Tab */}
                {(activeTab === "artists" || activeTab === "pending") && (
                    <div className="card" style={{ overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "var(--gray-50)" }}>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Artist</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>City</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Rating</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === "pending" ? pendingArtists : approvedArtists).map(artist => (
                                    <tr key={artist.id} style={{ borderTop: "1px solid var(--gray-200)" }}>
                                        <td style={{ padding: "1rem" }}>
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{artist.displayName}</p>
                                                <p className="text-muted" style={{ fontSize: "0.75rem" }}>{artist.user.email}</p>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem" }}>{artist.city || "-"}</td>
                                        <td style={{ padding: "1rem" }}>
                                            ⭐ {artist.avgRating.toFixed(1)} ({artist.totalReviews})
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <span className={`badge badge-${artist.verificationStatus === "approved" ? "success" : artist.verificationStatus === "pending" ? "warning" : "danger"}`}>
                                                {artist.verificationStatus}
                                            </span>
                                            {artist.isFeatured && (
                                                <span className="badge" style={{ background: "gold", color: "#333", marginLeft: "0.5rem" }}>
                                                    ⭐ Featured
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                {artist.verificationStatus === "pending" && (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => updateArtistStatus(artist.id, "approved")}
                                                            disabled={updating === artist.id}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => updateArtistStatus(artist.id, "rejected")}
                                                            disabled={updating === artist.id}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {artist.verificationStatus === "approved" && (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => toggleFeatured(artist.id, artist.isFeatured)}
                                                        disabled={updating === artist.id}
                                                    >
                                                        {artist.isFeatured ? "Unfeature" : "Feature"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <div className="card" style={{ overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "var(--gray-50)" }}>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Order ID</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Buyer</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Artist</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Package</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Amount</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600 }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderTop: "1px solid var(--gray-200)" }}>
                                        <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.75rem" }}>
                                            {order.id.slice(0, 8)}...
                                        </td>
                                        <td style={{ padding: "1rem" }}>{order.buyer.name}</td>
                                        <td style={{ padding: "1rem" }}>{order.artistProfile.displayName}</td>
                                        <td style={{ padding: "1rem" }}>{order.package.name}</td>
                                        <td style={{ padding: "1rem", fontWeight: 600 }}>₹{order.totalPrice}</td>
                                        <td style={{ padding: "1rem" }}>
                                            <span className={`badge badge-${order.status === "delivered" ? "success" : order.status === "cancelled" ? "danger" : "info"}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
