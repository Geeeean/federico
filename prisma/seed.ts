import bcrypt from "bcrypt"
import { db } from "./client";

const main = async () => {
    const username = process.env.SYS_ADMIN_USERNAME;
    const password = process.env.SYS_ADMIN_PASSWORD;

    if (!username || !password) throw new Error("Sys Admin credentials not specified")

    const hashed = await bcrypt.hash(password, 10);

    const admin = await db.user.upsert({
        where: {
            username: username,
        },
        update: {},
        create: {
            username: username,
            password: hashed
        },
    })
}

main()
    .then(async () => {
        await db.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });