"use client"

import { motion, MotionConfig } from "framer-motion";
import Tag from "@/components/ui/Tag"
import Link from "next/link"

type Props = {}

const TAG_CONT = "PROFESSIONISTI"
const DESC = "Lo Studio si avvale di un nucleo selezionato di avvocati interni aventi specifiche specializzazioni, nonché di una vasta rete di legali e consulenti su tutto il territorio nazionale."
const BTN_CONT = "Scopri di più"

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const ProfessionalsSpoiler = (props: Props) => {
    return (
        <MotionConfig transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
            <div className="w-screen flex items-center justify-center bg-primary p-8 md:py-16 my-4">
                <div className='flex flex-col justify-center items-center gap-8 text-center md:py-0 text-background max-w-3xl'>
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
                        {/* <div className="rounded-full w-[300px] md:w-[600px] bg-muted h-20 my-6"></div> */}
                    </motion.div>
                    <motion.div
                        viewport={{ once: true }}
                        className=""
                        initial="hidden"
                        whileInView="show"
                        variants={variants}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="font-serif italic text-xl mr-2">
                            Il titolare.
                        </span>
                        <span>
                            Avv. Fabio Federico. Avvocato penalista del Foro di Roma e patrocinante in Cassazione. Ha
                            conseguito il diploma di specializzazione nelle materie penalistiche presso l’Università La
                            Sapienza di Roma. È autore di pubblicazioni in diritto e procedura penale e saggista attivo in
                            vari ambiti tematici, nonché membro di commissioni di studio dell’Ordine degli avvocati e
                            delle Camere penali di Roma.
                        </span>
                    </motion.div>
                    <Link href="#" className="text-md italic font-serif z-10">
                        <Tag text={BTN_CONT} border={false} icon={null} underline secondary />
                    </Link>
                </div>
            </div>
        </MotionConfig>
    )
}

export default ProfessionalsSpoiler