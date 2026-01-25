import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, password, role = "user" } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        if (!email && !phone) {
            return NextResponse.json(
                { error: "Email or phone number is required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        if (email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });
            if (existingEmail) {
                return NextResponse.json(
                    { error: "Email already registered" },
                    { status: 400 }
                );
            }
        }

        if (phone) {
            const existingPhone = await prisma.user.findFirst({
                where: { phone },
            });
            if (existingPhone) {
                return NextResponse.json(
                    { error: "Phone number already registered" },
                    { status: 400 }
                );
            }
        }

        // Hash password if provided
        let passwordHash = null;
        if (password) {
            if (password.length < 6) {
                return NextResponse.json(
                    { error: "Password must be at least 6 characters" },
                    { status: 400 }
                );
            }
            passwordHash = await bcrypt.hash(password, 10);
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                passwordHash,
                role,
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Failed to create account" },
            { status: 500 }
        );
    }
}
