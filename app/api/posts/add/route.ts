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

    if (!post.title || !post.description || !post.link)
        return NextResponse.json({ error: "Bad syntax" }, { status: 400 });

    try {

        const postUpsert = await db.post.upsert({
            where: {
                id: post.id ?? -1,
            },
            update: {},
            create: {
                title: post.title,
                description: post.description,
                link: post.link
            },
        })

        return NextResponse.json({ msg: "Post created", posts: postUpsert }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: "Error on inserting post row" }, { status: 500 });
    }
}