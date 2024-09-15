import { db } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        const posts = await db.post.findMany()
        return NextResponse.json({ msg: "Posts retrieved successfully", posts: posts }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ msg: "Error on getting posts from db" }, { status: 500 });
    }
}