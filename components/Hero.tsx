"use client"

import { motion, MotionConfig } from "framer-motion"

import Image from "next/image"

import build from "@/public/gary-walker-jones-4RCEZ0DSd88-unsplash.jpg"
// import build from "@/public/colosseo.jpg"

import Link from "next/link"

type Props = {}

const variants = {
  hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
  show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const Hero = (props: Props) => {
  return (
    <MotionConfig transition={{ type: "spring", duration: 0.5, bounce: 0 }}>
      <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.15 }} className="max-w-3xl p-4 md:p-0 py-0">
        <motion.div variants={variants}>
          <p className="text-lg">
            <span className="font-serif italic text-xl mr-2 text-gold">Chi siamo.</span>
            Federico & Partners è uno studio legale, fondato a Roma nel 1997 e a Reggio Calabria nel 1963, da avvocati con una lunga tradizione e dedizione alla professione. Offriamo competenze specializzate in ogni branca del diritto, grazie a un modello gestionale che valorizza la collaborazione e il controllo collettivo del team, garantendo professionalità e qualità ai nostri clienti.
          </p>
        </motion.div>

        <motion.div variants={variants} className=' bg-muted mt-6 relative overflow-hidden max-h-[650px] flex items-center'>
          <Image src={build} alt="" objectFit="cover" className="w-full" />
        </motion.div>
      </motion.div >
    </MotionConfig >
  )
}

export default Hero