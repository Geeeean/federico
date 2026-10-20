"use client"

type PostType = {
    id: number,
    title: string,
    description: string,
    link: string,
}

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

type State = { status: "loading" } | { status: "error" } | { status: "ready", posts: PostType[] }

const Posts = () => {
    const [state, setState] = useState<State>({ status: "loading" })

    useEffect(() => {
        let cancelled = false
        apiFetch("/posts/get/all")
            .then(async (response) => {
                if (!response.ok) throw new Error("Error fetching posts")
                const data = await response.json()
                if (!cancelled) setState({ status: "ready", posts: data.posts })
            })
            .catch(() => !cancelled && setState({ status: "error" }))
        return () => { cancelled = true }
    }, [])

    if (state.status === "error") {
        return <p className="text-red-500">Non è stato possibile caricare le notizie, perfavore riprova.</p>;
    }

    return (
        <div className="w-screen flex items-center justify-center p-4">
            <div className='flex flex-col text-justify justify-center gap-8 md:py-0 w-full max-w-3xl text-lg'>
                <span className="font-serif text-2xl md:text-4xl mt-1">NOTIZIE</span>
                <div className="flex gap-4 h-full overflow-x-auto pb-4">
                    {
                        state.status === "loading" ? null :
                        state.posts.length > 0 ? state.posts.map((item) => (
                            <div key={item.id} className="shadow shrink-0 p-4 w-52 md:w-80 bg-background text-primary flex flex-col justify-between gap-4 rounded-sm">
                                <div>
                                    <p className="font-serif text-lg text-left">{item.title}</p>
                                    <p className="text-muted-foreground text-sm line-clamp-4">{item.description}</p>
                                </div>
                                {/* External link: don't leak the referrer or give the target page a handle on ours */}
                                <a href={item.link} rel="noopener noreferrer">
                                    <Button variant="secondary" className="w-full">Leggi</Button>
                                </a>
                            </div>
                        )) : <p>Al momento non sono presenti notizie.</p>
                    }
                </div>
            </div>
        </div>
    );
};

export default Posts;
