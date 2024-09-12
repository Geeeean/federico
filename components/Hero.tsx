"use client"

import { motion, MotionConfig } from "framer-motion"

import Image from "next/image"

import build from "@/public/chloe-4hirCrRfB04-unsplash 2.png"

import Link from "next/link"

type Props = {}

const variants = {
  hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
  show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const Hero = (props: Props) => {
  return (
    <MotionConfig transition={{ type: "spring", duration: 0.5, bounce: 0 }}>
      <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.15 }} className="max-w-2xl p-4 md:p-0 py-0">
        <div className="border-t border-primary pt-4">
          <motion.div variants={variants}>
            <p className="font-serif text-4xl md:text-7xl text-secondary font-medium">Federico & Partners</p>
            <p className="text-md text-primary font-medium">Studio legale</p>
          </motion.div>

          <motion.div variants={variants} className="mt-4">
            <span className="font-serif italic text-xl mr-2 text-secondary">
              Chi siamo.
            </span>
            <span>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Est, nisi incidunt nihil at molestiae, illo voluptate sunt laudantium dolorum fuga praesentium assumenda voluptatum fugit neque. Nisi accusantium dolor odit dolorem.
            </span>
          </motion.div>
          <motion.div variants={variants} className=' bg-muted mt-6 relative overflow-hidden max-h-[650px] flex items-center'>
            <Image src={build} alt="" objectFit="cover" className="w-full" />
          </motion.div>


          {/* <motion.div variants={variants} className="mt-10">
            <span className="font-serif italic text-xl mr-2 text-secondary">
              La nostra storia.
            </span>
            <span>
              Lo Studio Legale Federico (sede di Roma) nasce nel 1997. Il suo fondatore, l’Avv. Fabio
              Federico, fornendo un imprimatur di competenza e professionalità, ha creato un modello, tra i
              primi in Italia, di management applicata alla gestione dello studio legale. <Link href="#" className="border-b py-[0.5px] font-serif italic border-primary">Scopri di più</Link>
            </span>
          </motion.div>

          <motion.div variants={variants} className="mt-10">
            <span className="font-serif italic text-xl mr-2 text-secondary">
              Identità e marchio.
            </span>
            <span>Il Marchio dello Studio Legale Federico & Partners racchiude in un simbolo gli elementi
              fondanti del proprio modo di percepire una moderna concezione delle Scienze Forensi ed in
              particolare della professione dell’avvocato. <Link href="#" className="border-b py-[0.5px] font-serif italic border-primary">Scopri di più</Link>
            </span>
          </motion.div> */}
        </div>
      </motion.div >
    </MotionConfig >
  )
}

export default Hero