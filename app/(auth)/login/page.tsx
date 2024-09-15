"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import clsx from "clsx"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

type Props = {}

const Login = (props: Props) => {
  const router = useRouter()

  const [authError, setAuthError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);

    e.preventDefault();

    const target = e.target as typeof e.target & {
      username: { value: string };
      password: { value: string };
    };

    if (target.username && target.password) {
      const signInData = await signIn("credentials", {
        username: target.username.value,
        password: target.password.value,
        redirect: false
      });

      setLoading(false)

      if (signInData?.error) {
        setAuthError(true)
      } else {
        router.push("/dashboard");
      }
    } else {
      setAuthError(true)
      setLoading(false)
    }

  }

  console.log(authError)

  return (
    <main className='w-screen h-screen flex justify-center items-center'>
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Accesso amministratore</CardTitle>
          <CardDescription>Riempi il form e premi il pulsante 'Accedi' per accedere come amministratore</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} onChange={() => setAuthError(false)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" placeholder="Mario Rossi" required />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>

            <div className="flex flex-col gap-1 items-center">
              <Button className="w-full" type="submit">Accedi</Button>
              {authError ? <span className="text-red-500">Errore nell'autenticazione</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export default Login