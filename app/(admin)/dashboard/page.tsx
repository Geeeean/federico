"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { useEffect, useState } from "react"

import { useAddPost } from "@/app/hooks/useAddPost"
import { usePosts } from "@/app/hooks/usePosts"

import Link from "next/link"
import { useRemovePost } from "@/app/hooks/useRemovePost"

type Props = {}

const Dashboard = (props: Props) => {
  const [post, setPost] = useState<{ title: string, description: string, link: string }>({ title: "", description: "", link: "" });
  const [open, setOpen] = useState<boolean>()

  const { addPost, isPending: isAddPending, error: addError, isSuccess: isAddSuccess } = useAddPost();
  const { removePost, isPending: isRemovePending, error: removeError, isSuccess: removeSuccess } = useRemovePost()
  const { posts, isLoading, error } = usePosts();

  useEffect(() => {
    if (isAddSuccess && !isAddPending) {
      setOpen(false);
    }
  }, [isAddSuccess, isAddPending]);

  return (
    <div className="p-4 flex flex-col">
      <div className="w-full flex justify-between">
        <p className="text-3xl">Notizie</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="px-4 py-2 rounded-md text-background bg-primary">
            Aggiungi notizia
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi una notizia</DialogTitle>
              <DialogDescription>
                Riempi il form e premi il pulsante 'Aggiungi' per aggiungere correttamente una notizia alla home.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-medium font-sm">Titolo</span>
                <Input placeholder="Lorem ipsum..." onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))} />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-medium font-sm">Link</span>
                <Input placeholder="Lorem ipsum..." onChange={(e) => setPost(prev => ({ ...prev, link: e.target.value }))} />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-medium font-sm">Descrizione</span>
                <Textarea placeholder="lorem ipsum..." className="h-40" onChange={(e) => setPost(prev => ({ ...prev, description: e.target.value }))} />
              </div>

            </div>
            <Button className="mt-2" onClick={() => {
              addPost(post)
            }}
            >Aggiungi</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-auto grid grid-cols-4 auto-rows-min gap-2 h-full py-4 relative">
        {
          !isLoading ? posts.toReversed().map((post: { id: number, title: string, description: string, link: string }, index: number) => (
            <Card className="h-fit" key={index}>
              <CardHeader>
                <CardDescription>Titolo notizia</CardDescription>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Descrizione</CardDescription>
                <p className="line-clamp-3 h-[72px]">{post.description}</p>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <CardDescription>Link a</CardDescription>
                <Link href={post.link}>{post.link}</Link>
                <Button className="w-full mt-3" variant="destructive" onClick={() => {
                  removePost({ id: post.id })
                }}>Rimuovi</Button>
              </CardFooter>
            </Card>)
          ) : <span className="absolute top-1/2 left-1/2 text-xl -translate-x-1/2 -translate-y-1/2">Caricamento...</span>
        }
      </div>

    </div>
  )
}

export default Dashboard