"use client"

import { BsArrowUpRightCircle } from "react-icons/bs";
import { motion, MotionConfig } from "framer-motion"

type Props = {}

const TITLE = "Servizi"
const DESC = `Lo Studio Legale <span className="font-serif italic">Federico & Partners</span> offre attività di consulenza stragiudiziale e giudiziale in ogni grado di giudizio.`
const SERVICES = [
    "Diritto civile e penale",
    "Contenzioso amministrativo",
    "Diritto di Famiglia",
    "Diritto del Lavoro",
    "Diritto Tributario",
    "Procedure per la risoluzione della crisi d’impresa",
    "Procedure concorsuali",
    "Consulenza ed assistenza in ambito societario",
]

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const ServicesSpoiler = (props: Props) => {
    return (
        <MotionConfig transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
            <div className='px-4 max-w-2xl flex flex-col md:flex-row w-full text-xl gap-3 md:gap-6 md:[&>*]:border-t [&>*]:border-primary md:[&>*]:pt-2'>
                <motion.span
                    viewport={{ once: true }}
                    initial="hidden"
                    whileInView="show"
                    variants={variants}
                    className="font-serif italic text-xl mr-2 hidden md:block text-secondary">{TITLE}</motion.span>
                <div>
                    <motion.div
                        initial="hidden"
                        viewport={{ once: true }}
                        whileInView="show"
                        transition={{ delayChildren: 0.3 }}
                        variants={variants}>
                        <span className="font-serif italic text-xl mr-2 md:hidden text-secondary">{TITLE}.</span>
                        <span className="md:text-left text-lg">
                            Lo Studio Legale <span className="font-serif font-medium">Federico & Partners</span> offre attività di consulenza stragiudiziale e giudiziale in ogni grado di giudizio.
                        </span>
                    </motion.div>
                    <motion.div
                        viewport={{ once: true }}
                        initial="hidden"
                        whileInView="show"
                        transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
                        className='mt-6 md:mt-12'>
                        {SERVICES.map((str: string, index: number) => {
                            return (
                                <motion.div variants={variants} key={index} className='grid grid-cols-[auto,1fr] gap-2 items-center border-t border-primary pt-4 py-4 hover:bg-black/5'>
                                    <span>{str}</span>
                                    <BsArrowUpRightCircle />
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>
        </MotionConfig >
    )
}

export default ServicesSpoiler