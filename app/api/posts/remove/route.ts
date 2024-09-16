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
    const post = body.post

    if (!post.id)
        return NextResponse.json({ error: "Bad syntax" }, { status: 400 });

    try {
        const deletePost = await db.post.delete({
            where: {
                id: post.id,
            },
        })

        return NextResponse.json({ msg: "Post deleted", remove: deletePost }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: "Error on inserting post row" }, { status: 500 });
    }
}