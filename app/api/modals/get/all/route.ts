import { authOptions } from "@/lib/auth";
import { db } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    try {
        const modals = await db.contactForm.findMany()
        return NextResponse.json({ msg: "Modals retrieved successfully", modals: modals }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ msg: "Error on getting modals from db" }, { status: 500 });
    }
}