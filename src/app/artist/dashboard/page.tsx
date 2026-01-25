"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
    id: string;
    status: string;
    instructions: string;
    deliveryType: string;
    totalPrice: number;
    shippingAddress: string | null;
    createdAt: string;
    package: {
        name: string;
        deliveryTimeText: string;
    };
    buyer: {
        name: string;
    };
    files: Array<{ id: string; fileUrl: string; fileType: string }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    paid: { label: "New Order", color: "info" },
    pending_artist_acceptance: { label: "Awaiting Acceptance", color: "warning" },
    accepted: { label: "Accepted", color: "primary" },
    in_progress: { label: "In Progress", color: "primary" },
    delivered: { label: "Delivered", color: "success" },
    cancelled: { label: "Cancelled", color: "danger" },
};

export default function ArtistDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [artistProfile, setArtistProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("new");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/artist/login");
        }
        if (status === "authenticated" && session?.user?.role !== "artist") {
            router.push("/user/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [ordersRes, profileRes] = await Promise.all([
                    fetch("/api/orders?role=artist"),
                    fetch("/api/artist/profile"),
                ]);

                const ordersData = await ordersRes.json();
                const profileData = await profileRes.json();

                if (ordersData.orders) setOrders(ordersData.orders);
                if (profileData.profile) setArtistProfile(profileData.profile);
            } catch (e) {
                console.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (e) {
            console.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === "new") return order.status === "paid";
        if (activeTab === "accepted") return order.status === "accepted";
        if (activeTab === "in_progress") return order.status === "in_progress";
        if (activeTab === "delivered") return order.status === "delivered";
        return true;
    });

    if (status === "loading" || loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
            <div style={{ background: "var(--gradient-primary)", color: "white", padding: "2rem 0" }}>
                <div className="container">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                            <h1 style={{ color: "white" }}>Artist Dashboard</h1>
                            <p style={{ opacity: 0.9 }}>Welcome, {artistProfile?.displayName || session?.user?.name}</p>
                        </div>
                        {artistProfile && (
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <span className={`badge ${artistProfile.verificationStatus === "approved" ? "badge-success" : "badge-warning"}`}>
                                    {artistProfile.verificationStatus === "approved" ? "✓ Verified" : artistProfile.verificationStatus}
                                </span>
                                {artistProfile.isFeatured && (
                                    <span className="badge" style={{ background: "gold", color: "#333" }}>⭐ Featured</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: "2rem 1.5rem" }}>
                {/* Quick Stats */}
                {artistProfile && (
                    <div className="grid-4" style={{ marginBottom: "2rem" }}>
                        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                            <p className="text-muted" style={{ fontSize: "0.875rem" }}>Rating</p>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary-600)" }}>
                                ⭐ {artistProfile.avgRating.toFixed(1)}
                            </p>
                        </div>
                        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                            <p className="text-muted" style={{ fontSize: "0.875rem" }}>Reviews</p>
                            <p style={{ fontSize: "2rem", fontWeight: 700 }}>{artistProfile.totalReviews}</p>
                        </div>
                        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                            <p className="text-muted" style={{ fontSize: "0.875rem" }}>New Orders</p>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>
                                {orders.filter(o => o.status === "paid").length}
                            </p>
                        </div>
                        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                            <p className="text-muted" style={{ fontSize: "0.875rem" }}>In Progress</p>
                            <p style={{ fontSize: "2rem", fontWeight: 700 }}>
                                {orders.filter(o => o.status === "in_progress").length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                    <Link href="/artist/packages" className="btn btn-secondary">
                        📦 Manage Packages
                    </Link>
                    <Link href="/artist/portfolio" className="btn btn-secondary">
                        🖼️ Manage Portfolio
                    </Link>
                    <Link href={`/artists/${session?.user?.artistProfileId}`} className="btn btn-ghost">
                        👁️ View Public Profile
                    </Link>
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "2rem",
                    background: "white",
                    padding: "0.5rem",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-sm)",
                    overflowX: "auto"
                }}>
                    {[
                        { key: "new", label: `New (${orders.filter(o => o.status === "paid").length})` },
                        { key: "accepted", label: "Accepted" },
                        { key: "in_progress", label: "In Progress" },
                        { key: "delivered", label: "Delivered" },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "var(--radius-md)",
                                fontWeight: 500,
                                background: activeTab === tab.key ? "var(--primary-500)" : "transparent",
                                color: activeTab === tab.key ? "white" : "var(--gray-600)",
                                transition: "all 0.2s",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                        <p className="text-muted">No orders in this category</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {filteredOrders.map(order => (
                            <div key={order.id} className="card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                            <h3 style={{ fontSize: "1.125rem" }}>Order from {order.buyer.name}</h3>
                                            <span className={`badge badge-${statusLabels[order.status]?.color || "info"}`}>
                                                {statusLabels[order.status]?.label || order.status}
                                            </span>
                                        </div>
                                        <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                                            {order.package.name} • {order.deliveryType === "digital" ? "📥 Digital" : "📦 Physical"} • {order.package.deliveryTimeText}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--primary-600)" }}>
                                            ₹{order.totalPrice}
                                        </p>
                                        <p className="text-muted" style={{ fontSize: "0.75rem" }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1rem" }}>
                                    <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>Customer Instructions:</p>
                                    <p style={{ color: "var(--gray-700)" }}>{order.instructions}</p>
                                </div>

                                {order.files.filter(f => f.fileType === "reference").length > 0 && (
                                    <div style={{ marginBottom: "1rem" }}>
                                        <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>Reference Images:</p>
                                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                            {order.files.filter(f => f.fileType === "reference").map(file => (
                                                <a key={file.id} href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={file.fileUrl}
                                                        alt="Reference"
                                                        style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {order.shippingAddress && (
                                    <div style={{ marginBottom: "1rem" }}>
                                        <p style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Shipping Address:</p>
                                        <p className="text-muted" style={{ fontSize: "0.875rem" }}>{order.shippingAddress}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                    {order.status === "paid" && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => updateOrderStatus(order.id, "accepted")}
                                            disabled={updating === order.id}
                                        >
                                            {updating === order.id ? "..." : "Accept Order"}
                                        </button>
                                    )}
                                    {order.status === "accepted" && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => updateOrderStatus(order.id, "in_progress")}
                                            disabled={updating === order.id}
                                        >
                                            {updating === order.id ? "..." : "Start Work"}
                                        </button>
                                    )}
                                    {order.status === "in_progress" && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => updateOrderStatus(order.id, "delivered")}
                                            disabled={updating === order.id}
                                        >
                                            {updating === order.id ? "..." : "Mark Delivered"}
                                        </button>
                                    )}
                                    {order.status !== "delivered" && order.status !== "cancelled" && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                                            disabled={updating === order.id}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
