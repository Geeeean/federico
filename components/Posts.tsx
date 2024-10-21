type PostType = {
    id: number,
    title: string,
    description: string,
    link: string,
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

const Posts = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/get/all`, {
            cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Error fetching posts");
        }

        const posts: PostType[] = data.posts;

        return (
            <div className="w-screen flex items-center justify-center p-4">
                <div className='flex flex-col text-justify justify-center gap-8 md:py-0 w-full max-w-3xl text-lg'>
                    <span className="font-serif text-2xl md:text-4xl mt-1">NOTIZIE</span>
                    <div className="flex gap-4 h-full overflow-x-auto pb-4">
                        {
                            posts.length > 0 ? posts.map((item, index) => (
                                <div key={index} className="shadow shrink-0 p-4 w-52 md:w-80 bg-background text-primary flex flex-col justify-between gap-4 rounded-sm">
                                    <div>
                                        <p className="font-serif text-lg text-left">{item.title}</p>
                                        <p className="text-muted-foreground text-sm line-clamp-4">{item.description}</p>
                                    </div>
                                    <Link href={item.link}>
                                        <Button variant="secondary" className="w-full">Leggi</Button>
                                    </Link>
                                </div>
                            )) : <p>Al momento non sono presenti notizie.</p>
                        }
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        return <p className="text-red-500">Non è stato possibile caricare le notizie, perfavore riprova.</p>;
    }
};

export default Posts;

