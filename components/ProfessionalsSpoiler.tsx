"use client"

import { motion, MotionConfig } from "framer-motion";
import Tag from "@/components/ui/tag"
import Link from "next/link"

type Props = {}

const TAG_CONT = "PROFESSIONISTI"
const DESC = "Lo Studio si avvale di un nucleo selezionato di avvocati interni aventi specifiche specializzazioni, nonché di una vasta rete di legali e consulenti su tutto il territorio nazionale."
const BTN_CONT = "Scopri di più"

const TITLE_COPY = "Il titolare."
const COPY = `Avv. Fabio Federico. Avvocato penalista del Foro di Roma e patrocinante in Cassazione. Ha
                            conseguito il diploma di specializzazione nelle materie penalistiche presso l’Università La
                            Sapienza di Roma. È autore di pubblicazioni in diritto e procedura penale e saggista attivo in
                            vari ambiti tematici, nonché membro di commissioni di studio dell’Ordine degli avvocati e
                            delle Camere penali di Roma.`

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const ProfessionalsSpoiler = (props: Props) => {
    return (
        <MotionConfig transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
            <div id="professionals" className="w-screen flex items-center justify-center bg-ivory p-8 md:py-16 my-4 text-lg">
                <div className='flex flex-col justify-center items-center gap-8 text-center md:py-0 text-royal max-w-3xl'>
                    <motion.div
                        viewport={{ once: true }}
                        initial="hidden"
                        whileInView="show"
                        variants={variants}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-serif z-10 border-dark"
                    >
                        <Tag text={TAG_CONT} thick secondary />
                    </motion.div>

                    <motion.div
                        viewport={{ once: true }}
                        className="flex flex-col justify-center items-center gap-4"
                        initial="hidden"
                        whileInView="show"
                        variants={variants}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-2xl md:text-4xl font-light">{DESC}</p>
                    </motion.div>
                    <motion.p
                        viewport={{ once: true }}
                        className=""
                        initial="hidden"
                        whileInView="show"
                        variants={variants}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="font-serif italic text-xl mr-2">{TITLE_COPY}</span>
                        {COPY}
                    </motion.p>
                    {/* <Link href="#" className="text-md italic font-serif z-10">
                        <Tag text={BTN_CONT} border={false} icon={null} underline secondary />
                    </Link> */}
                </div>
            </div>
        </MotionConfig>
    )
}

export default ProfessionalsSpoiler