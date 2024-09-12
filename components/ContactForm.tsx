"use client"

type Props = {}

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { motion } from 'framer-motion'

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const ContactForm = (props: Props) => {
    return (
        <div className="max-w-2xl p-4 md:p-0 w-full">
            <motion.form
                className='p-4 w-full ring-1 bg-primary text-background rounded-lg flex flex-col gap-8'
                transition={{ type: "spring", duration: 0.5, bounce: 0, delay: 0.3 }}
                variants={variants}
                viewport={{ once: true }}
                initial="hidden"
                whileInView="show"
            >
                <div>
                    <p className='font-semibold text-xl md:text-3xl'>Contattaci per una consulenza</p>
                    <p className='text-background/80 text-sm md:text-base'>Compila il modulo sottostante per entrare in contatto con il nostro team di consulenza.</p>
                </div>

                <div className='flex flex-col gap-5'>
                    <div>
                        <span className='font-semibold'>Nome</span>
                        <Input id="Nome" placeholder="Mario Rossi" required className='mt-1' />
                    </div>
                    <div>
                        <span className='font-semibold'>Email</span>
                        <Input id="Email" placeholder="mario.rossi@gmail.com" required type='email' className='mt-1' />
                    </div>
                    <div>
                        <span className='font-semibold'>Cellulare</span>
                        <Input id="Nome" placeholder="+39 XXX XXX XXXX" required className='mt-1' />
                    </div>
                    <div>
                        <span className='font-semibold'>Descrizione</span>
                        <Textarea className='h-36' placeholder="Buongiorno, vorrei richiedere una consulenza legale in merito a una questione di diritto del lavoro. Sono stato recentemente licenziato dalla mia azienda senza preavviso..." />
                    </div>
                </div>

                <div className='bg-background text-primary font-bold w-full py-3 text-center rounded-lg'>Invia il modulo</div>
            </motion.form>
        </div>
    )
}

export default ContactForm