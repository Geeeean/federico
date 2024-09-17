"use client"

import { motion, MotionConfig } from "framer-motion"

const variants = {
  hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
  show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const INTRO_TITLE = "Chi siamo."
const INTRO_COPY = "Lo Studio Legale Federico & Partners, da più di sessant'anni, offre competenze specializzate in ogni branca del diritto, grazie a un modello gestionale che valorizza la collaborazione e il controllo collettivo del team, garantendo professionalità e qualità ai propri clienti."

type Props = {}

const Hero = (props: Props) => {
  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.15 }} className="max-w-3xl p-4 py-0">
      <motion.div variants={variants}>
        <p className="text-lg">
          <span className="font-serif italic text-xl mr-2 text-gold text-justify">{INTRO_TITLE}</span>
          {INTRO_COPY}
        </p>
      </motion.div>
    </motion.div >
  )
}

export default Hero