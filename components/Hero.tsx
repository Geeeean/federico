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
            <p className="font-serif text-3xl md:text-6xl font-semibold text-secondary">Federico & Partners</p>
            <p className="text-lg text-primary font-semibold">Studio legale</p>
          </motion.div>

          <motion.div variants={variants} className="mt-4">
            <p className="mt-4 text-lg">
              <span className="font-serif italic text-xl mr-2 text-secondary">Chi siamo.</span>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Est, nisi incidunt nihil at molestiae, illo voluptate sunt laudantium dolorum fuga praesentium assumenda voluptatum fugit neque. Nisi accusantium dolor odit dolorem.
            </p>
          </motion.div>

          <motion.div variants={variants} className=' bg-muted mt-6 relative overflow-hidden max-h-[650px] flex items-center'>
            <Image src={build} alt="" objectFit="cover" className="w-full" />
          </motion.div>
        </div>
      </motion.div >
    </MotionConfig >
  )
}

export default Hero