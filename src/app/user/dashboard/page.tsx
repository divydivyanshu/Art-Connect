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
    createdAt: string;
    package: {
        name: string;
        deliveryTimeText: string;
    };
    artistProfile: {
        displayName: string;
        profilePhotoUrl: string | null;
    };
    review: any | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending_payment: { label: "Pending Payment", color: "warning" },
    paid: { label: "Paid", color: "info" },
    pending_artist_acceptance: { label: "Awaiting Artist", color: "info" },
    accepted: { label: "Accepted", color: "primary" },
    in_progress: { label: "In Progress", color: "primary" },
    delivered: { label: "Delivered", color: "success" },
    cancelled: { label: "Cancelled", color: "danger" },
    refunded: { label: "Refunded", color: "warning" },
};

export default function UserDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/user/login?callbackUrl=/user/dashboard");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch("/api/orders?role=buyer");
                const data = await res.json();
                if (data.orders) {
                    setOrders(data.orders);
                }
            } catch (e) {
                console.error("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchOrders();
        }
    }, [session]);

    const filteredOrders = orders.filter(order => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return ["paid", "pending_artist_acceptance", "accepted"].includes(order.status);
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
                    <h1 style={{ color: "white" }}>My Dashboard</h1>
                    <p style={{ opacity: 0.9 }}>Welcome back, {session?.user?.name}</p>
                </div>
            </div>

            <div className="container" style={{ padding: "2rem 1.5rem" }}>
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
                        { key: "all", label: "All Orders" },
                        { key: "pending", label: "Pending" },
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
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                        <p className="text-muted mb-4">No orders found</p>
                        <Link href="/artists" className="btn btn-primary">
                            Browse Artists
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {filteredOrders.map(order => (
                            <div key={order.id} className="card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                                    <img
                                        src={order.artistProfile.profilePhotoUrl || "https://i.pravatar.cc/150"}
                                        alt={order.artistProfile.displayName}
                                        style={{ width: "64px", height: "64px", borderRadius: "var(--radius-lg)" }}
                                    />

                                    <div style={{ flex: 1, minWidth: "200px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                            <h3 style={{ fontSize: "1.125rem" }}>{order.artistProfile.displayName}</h3>
                                            <span className={`badge badge-${statusLabels[order.status]?.color || "info"}`}>
                                                {statusLabels[order.status]?.label || order.status}
                                            </span>
                                        </div>
                                        <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                                            {order.package.name} • {order.deliveryType === "digital" ? "📥 Digital" : "📦 Physical"}
                                        </p>
                                        <p style={{
                                            fontSize: "0.875rem",
                                            color: "var(--gray-600)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            maxWidth: "400px"
                                        }}>
                                            {order.instructions}
                                        </p>
                                    </div>

                                    <div style={{ textAlign: "right", minWidth: "150px" }}>
                                        <p style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--primary-600)" }}>
                                            ₹{order.totalPrice}
                                        </p>
                                        <p className="text-muted" style={{ fontSize: "0.75rem" }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-muted" style={{ fontSize: "0.75rem" }}>
                                            Est: {order.package.deliveryTimeText}
                                        </p>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Link href={`/user/orders/${order.id}`} className="btn btn-secondary btn-sm">
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                {/* Show review button for delivered orders without review */}
                                {order.status === "delivered" && !order.review && (
                                    <div style={{
                                        marginTop: "1rem",
                                        paddingTop: "1rem",
                                        borderTop: "1px solid var(--gray-200)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}>
                                        <p className="text-muted">Your artwork has been delivered!</p>
                                        <Link href={`/user/orders/${order.id}/review`} className="btn btn-primary btn-sm">
                                            Leave a Review ⭐
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
