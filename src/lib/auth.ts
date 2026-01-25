import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export async function requireAuth(requiredRole?: string | string[]) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/user/login");
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
            redirect("/unauthorized");
        }
    }

    return user;
}

export async function requireUser() {
    return requireAuth("user");
}

export async function requireArtist() {
    return requireAuth("artist");
}

export async function requireAdmin() {
    return requireAuth("admin");
}

export function isArtist(role: string) {
    return role === "artist";
}

export function isAdmin(role: string) {
    return role === "admin";
}

export function isUser(role: string) {
    return role === "user";
}
