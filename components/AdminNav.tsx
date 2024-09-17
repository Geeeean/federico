"use client"

import Link from "next/link"
import { Button } from "./ui/button"

import { BiLogOut } from "react-icons/bi";
import { signOut } from "next-auth/react";

type Props = {}

const NAV_ITEMS = [
    { copy: "Home", href: "/" },
    { copy: "Gestione notizie", href: "/dashboard" },
    { copy: "Richieste di consulenza", href: "/dashboard/modals" },
]

const TITLE = "Admin dashboard"

const AdminNav = (props: Props) => {
    return (
        <div className="w-full p-4">
            <div className='w-full flex justify-between items-center pb-4 border-b'>
                <span className="font-medium text-xl">{TITLE}</span>
                <div className="flex gap-6 items-center">
                    {
                        NAV_ITEMS.map((el, index) => <Link className="hover:underline" href={el.href} key={index}>{el.copy}</Link>)
                    }
                </div>
            </div>
        </div>
    )
}

export default AdminNav