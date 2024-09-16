import { authOptions } from "@/lib/auth";
import { db } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body = await req.json()
    const modal = body.modal

    if (!modal.id)
        return NextResponse.json({ error: "Bad syntax" }, { status: 400 });

    try {
        const updateModal = await db.contactForm.update({
            where: {
                id: modal.id,
            },
            data: {
                viewed: modal.newViewed
            }
        })

        return NextResponse.json({ msg: "Modal updated", remove: updateModal }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: "Error on updating modal" }, { status: 500 });
    }
}