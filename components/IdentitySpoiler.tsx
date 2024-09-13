"use client"

import { motion, MotionConfig } from "framer-motion"
import Link from "next/link"

import Tag from "@/components/ui/Tag"

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

type Props = {}
const IdentitySpoiler = (props: Props) => {
    return (
        <MotionConfig transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
            <div className="w-screen flex items-center justify-center p-4 md:py-8 my-4">
                <div className='flex flex-col justify-center items-center gap-8 text-center md:py-0 max-w-3xl text-lg'>
                    <motion.div
                        viewport={{ once: true }}
                        initial="hidden"
                        whileInView="show"
                        variants={variants}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-serif z-10 border-dark"
                    >
                        <span className="text-xl bg-primary text-background font-bold rounded-full px-3 py-1">STORIA E MARCHIO</span>
                    </motion.div>


                    <motion.div
                        viewport={{ once: true }}
                        className=""
                        initial="hidden"
                        whileInView="show"
                        variants={variants}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="font-serif italic text-xl mr-2 text-secondary">La nostra storia.</span>
                        <span> Lo Studio Legale Federico (sede di Roma) nasce nel 1997. Il suo fondatore, l’Avv. Fabio Federico, fornendo un imprimatur di competenza e professionalità, ha creato un modello, tra i primi in Italia, di management applicata alla gestione dello studio legale. </span>
                    </motion.div>
                    <motion.div
                        viewport={{ once: true }}
                        className=""
                        initial="hidden"
                        whileInView="show"
                        variants={variants}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="font-serif italic text-xl mr-2 text-secondary">Il marchio.</span>
                        <span>Il Marchio dello Studio Legale Federico & Partners racchiude in un simbolo gli elementi fondanti del proprio modo di percepire una moderna concezione delle Scienze Forensi ed in particolare della professione dell’avvocato.</span>
                    </motion.div>
                    <Link href="/identity" className="text-md italic font-serif z-10">
                        <Tag text="Scopri di più" border={false} icon={null} underline />
                    </Link>
                </div>
            </div>
        </MotionConfig>
    )
}

export default IdentitySpoiler