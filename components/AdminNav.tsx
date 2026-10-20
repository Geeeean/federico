"use client"

import Link from "next/link"
import { Button } from "./ui/button"

import { BiLogOut } from "react-icons/bi";
import { apiFetch } from "@/lib/api";

type Props = {}

const NAV_ITEMS = [
    { copy: "Home", href: "/" },
    { copy: "Gestione notizie", href: "/dashboard" },
    { copy: "Richieste di consulenza", href: "/dashboard/modals" },
]

const TITLE = "Admin dashboard"

const AdminNav = (props: Props) => {
    const logout = async () => {
        await apiFetch("/auth/logout", { method: "POST", body: "{}" }).catch(() => null)
        window.location.href = "/login"
    }

    return (
        <div className="w-full p-4">
            <div className='w-full flex justify-between items-center pb-4 border-b'>
                <span className="font-medium text-xl">{TITLE}</span>
                <div className="flex gap-6 items-center">
                    {
                        NAV_ITEMS.map((el, index) => <Link className="hover:underline" href={el.href} key={index}>{el.copy}</Link>)
                    }
                    <Button variant="ghost" size="icon" onClick={logout} title="Esci" aria-label="Esci">
                        <BiLogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AdminNav
