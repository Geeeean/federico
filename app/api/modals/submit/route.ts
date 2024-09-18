import { db } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json()

    if (!process.env.PRIVATE_RECAPTCHA_SECRET_KEY) {
        return NextResponse.json({ error: "Not valid recaptcha secret key" }, { status: 500 });
    }

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            secret: process.env.PRIVATE_RECAPTCHA_SECRET_KEY,
            response: body.token
        })
    })

    const data = await res.json()

    if (!data.success || !body.data.formValues.terms)
        return NextResponse.json({ error: "Not valid request" }, { status: 401 });

    try {
        const formValues = body.data.formValues
        delete formValues.terms

        await db.contactForm.create({ data: formValues })

        return NextResponse.json({ msg: "Created new contact modal row" }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: "Error on inserting modal row" }, { status: 500 });
    }
}