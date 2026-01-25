import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function getOrder(id: string, userId: string) {
    return await prisma.order.findFirst({
        where: { id, buyerUserId: userId },
        include: {
            package: true,
            artistProfile: {
                select: {
                    displayName: true,
                    profilePhotoUrl: true,
                },
            },
        },
    });
}

export default async function OrderConfirmationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/user/login");
    }

    const { id } = await params;
    const order = await getOrder(id, session.user.id);

    if (!order) {
        notFound();
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
            <div className="card" style={{ maxWidth: "600px", width: "100%", padding: "3rem", textAlign: "center" }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    background: "var(--success)",
                    borderRadius: "var(--radius-full)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: "2.5rem"
                }}>
                    ✓
                </div>

                <h1 style={{ marginBottom: "0.5rem" }}>Order Confirmed!</h1>
                <p className="text-muted" style={{ marginBottom: "2rem" }}>
                    Your order has been placed successfully
                </p>

                <div style={{
                    background: "var(--gray-50)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.5rem",
                    marginBottom: "2rem"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", marginBottom: "1rem" }}>
                        <img
                            src={order.artistProfile.profilePhotoUrl || "https://i.pravatar.cc/150"}
                            alt={order.artistProfile.displayName}
                            style={{ width: "48px", height: "48px", borderRadius: "var(--radius-full)" }}
                        />
                        <div style={{ textAlign: "left" }}>
                            <p style={{ fontWeight: 600 }}>{order.artistProfile.displayName}</p>
                            <p className="text-muted" style={{ fontSize: "0.875rem" }}>{order.package.name}</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
                        <span className="text-muted">Order ID</span>
                        <span style={{ fontFamily: "monospace" }}>{order.id.slice(0, 8)}...</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
                        <span className="text-muted">Status</span>
                        <span className="badge badge-success">Paid</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
                        <span className="text-muted">Delivery</span>
                        <span>{order.package.deliveryTimeText}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9375rem", fontWeight: 600 }}>
                        <span>Total Paid</span>
                        <span>₹{order.totalPrice}</span>
                    </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ marginBottom: "0.75rem" }}>What happens next?</h4>
                    <ol style={{ textAlign: "left", paddingLeft: "1.5rem", color: "var(--gray-600)", lineHeight: 1.8 }}>
                        <li>The artist will review and accept your order</li>
                        <li>Work begins on your custom artwork</li>
                        <li>You'll be notified when it's ready for delivery</li>
                        <li>Leave a review after receiving your art!</li>
                    </ol>
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/user/dashboard" className="btn btn-primary">
                        View My Orders
                    </Link>
                    <Link href="/artists" className="btn btn-secondary">
                        Continue Browsing
                    </Link>
                </div>
            </div>
        </div>
    );
}
