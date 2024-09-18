"use client"

type Props = {}

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui//button'
import { Checkbox } from "@/components/ui/checkbox"

import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, useCallback, useState } from 'react'

import { useReCaptcha } from "next-recaptcha-v3";
import Link from 'next/link'

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 },
    exit: { filter: "blur(4px)", y: "100%", opacity: 0 },
}

const submittedVariants = {
    hidden: { filter: "blur(4px)", y: "-100%", opacity: 0 },
    show: { filter: "blur(0px)", y: 0, opacity: 1 },
}

const ContactForm = (props: Props) => {
    const { executeRecaptcha } = useReCaptcha();
    const [formValues, setFormValues] = useState<{ name: string, email: string, description: string, telephone: string, terms: boolean }>({ name: "", email: "", description: "", telephone: "", terms: false })
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            setIsLoading(true);

            const token = await executeRecaptcha("form_submit");

            const fetchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modals/submit`, {
                method: "POST",
                body: JSON.stringify({
                    data: { formValues },
                    token,
                }),
            });

            if (fetchRes.status == 200) {
                setSubmitted(true)
            }

            setIsLoading(false);
        },
        [executeRecaptcha, formValues],
    );

    return (
        <div className="max-w-3xl px-4 md:p-0 w-full" id='contactForm'>
            <div className='w-full h-[680px] bg-ivory rounded-lg'>
                <AnimatePresence mode='popLayout'>
                    {!submitted ? (<motion.form
                        className="p-4 w-full ring-1 bg-ivory text-royal rounded-lg flex flex-col gap-8 h-[680px] justify-between overflow-hidden"
                        exit={{ y: 24, opacity: 0, filter: "blur(4px)" }}
                        transition={{ type: "spring", duration: 0.6, bounce: 0 }}
                        key="form"
                        variants={variants}
                        viewport={{ once: true }}
                        initial="hidden"
                        whileInView="show"
                        onSubmit={handleSubmit}
                    >
                        <AnimatePresence>
                            {isLoading ? (<motion.div key="overlay" transition={{ type: "spring", duration: 0.5, bounce: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='absolute w-full h-full bg-black/10 z-40 top-0 left-0' />) : null}
                        </AnimatePresence>

                        <div>
                            <p className='font-semibold text-xl md:text-3xl'>Contattaci per una consulenza</p>
                            <p className='text-royal/80 text-sm md:text-base'>Compila il modulo sottostante per entrare in contatto con il nostro team di consulenza.</p>
                        </div>

                        <div className='flex flex-col gap-5'>
                            <div>
                                <span className='font-semibold'>Nome</span>
                                <Input id="Nome" name='name' placeholder="Mario Rossi" required className='mt-1' onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))} />
                            </div>
                            <div>
                                <span className='font-semibold'>Email</span>
                                <Input id="Email" name='email' placeholder="mario.rossi@gmail.com" required type='email' className='mt-1' onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))} />
                            </div>
                            <div>
                                <span className='font-semibold'>Cellulare</span>
                                <Input id="Nome" name='telephone' placeholder="+39 XXX XXX XXXX" required className='mt-1' onChange={(e) => setFormValues(prev => ({ ...prev, telephone: e.target.value }))} />
                            </div>
                            <div>
                                <span className='font-semibold'>Descrizione</span>
                                <Textarea name='description' className='h-40 resize-none' placeholder="Buongiorno, vorrei richiedere una consulenza legale in merito a una questione di diritto del lavoro. Sono stato recentemente licenziato dalla mia azienda senza preavviso..." onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))} />
                            </div>

                            <div className='flex items-center gap-2'>
                                <Checkbox id="terms" required checked={formValues.terms} onCheckedChange={(val) => setFormValues(prev => ({ ...prev, terms: val == true ? true : false }))} />
                                <label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Accetto i <Link href="/privacy" className='italic underline'>termini e le condizioni</Link>
                                </label>
                            </div>
                        </div>

                        <Button className='bg-royal text-ivory font-bold w-full py-3 hover:opacity-85 hover:bg-royal' type='submit'>Invia il modulo</Button>
                    </motion.form>) : (<motion.div
                        key="submitted"
                        initial={{ y: -64, opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{ type: "spring", duration: 0.6, bounce: 0 }}
                        className='bg-black/5 text-royal w-full h-[680px] flex flex-col justify-center items-center text-center'>
                        <p className='text-3xl md:text-5xl font-medium mb-2'>Modulo ricevuto!</p>
                        <p className='text-2xl md:text-4xl text-royal/50 px-8 md:px-16'>Verrai contattato dal nostro team al più presto.</p>
                    </motion.div>)
                    }
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ContactForm