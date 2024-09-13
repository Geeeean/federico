"use client"

type Props = {}

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { motion } from 'framer-motion'
import { FormEvent } from 'react'

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
        name: { value: string };
        email: { value: string };
        description: { value: string };
        telephone: { value: string };
    };

    console.log(target.email.value)
}

const ContactForm = (props: Props) => {
    return (
        <div className="max-w-3xl p-4 md:px-0 md:py-8 w-full" id='contactForm'>
            <motion.form
                className='p-4 w-full ring-1 bg-primary text-background rounded-lg flex flex-col gap-8'
                transition={{ type: "spring", duration: 0.5, bounce: 0, delay: 0.3 }}
                variants={variants}
                viewport={{ once: true }}
                initial="hidden"
                whileInView="show"
                onSubmit={handleSubmit}
            >
                <div>
                    <p className='font-semibold text-xl md:text-3xl'>Contattaci per una consulenza</p>
                    <p className='text-background/80 text-sm md:text-base'>Compila il modulo sottostante per entrare in contatto con il nostro team di consulenza.</p>
                </div>

                <div className='flex flex-col gap-5'>
                    <div>
                        <span className='font-semibold'>Nome</span>
                        <Input id="Nome" name='name' placeholder="Mario Rossi" required className='mt-1' />
                    </div>
                    <div>
                        <span className='font-semibold'>Email</span>
                        <Input id="Email" name='email' placeholder="mario.rossi@gmail.com" required type='email' className='mt-1' />
                    </div>
                    <div>
                        <span className='font-semibold'>Cellulare</span>
                        <Input id="Nome" name='telephone' placeholder="+39 XXX XXX XXXX" required className='mt-1' />
                    </div>
                    <div>
                        <span className='font-semibold'>Descrizione</span>
                        <Textarea name='description' className='h-36' placeholder="Buongiorno, vorrei richiedere una consulenza legale in merito a una questione di diritto del lavoro. Sono stato recentemente licenziato dalla mia azienda senza preavviso..." />
                    </div>
                </div>

                <button className='bg-background text-primary font-bold w-full py-3 text-center rounded-lg'>Invia il modulo</button>
            </motion.form>
        </div>
    )
}

export default ContactForm