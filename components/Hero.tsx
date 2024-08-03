"use client"

import { delay, motion } from "framer-motion"

import Banner from "./Banner"
import Image from "next/image"

// import build from "@/public/chloe-4hirCrRfB04-unsplash 2.png"
// import build from "@/public/valentin-farkasch-gCTgP86MhNQ-unsplash.jpg"
import build from "@/public/mauro-lima-yJat6lc2KUQ-unsplash.jpg"

const title = {
  open: (custom: number) => ({
    opacity: 1,
    y: "0%",
    transition: {
      duration: 0.20,
      ease: "easeOut",
      delay: 2.5 + custom * 0.12
    },
  }),
  closed: {
    opacity: 0,
    y: "100%",
    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },
};

const other = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: { ease: "easeOut" }
  },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { ease: "easeOut", delay: 3.4 + custom }
  }),
}

type Props = {}

const splitTextToWords = (text: string) => {
  return text.split(' ').map((word, index) => ({
    id: index,
    text: word,
  }));
};

const HERO_TITLE = "Consulenza legale e rappresentanza in tutta Italia"

const Hero = (props: Props) => {
  return (
    <div className="w-full">
      <motion.div
        className="flex gap-2 md:gap-5 flex-wrap"
        initial="closed"
        animate="open"
      >
        {splitTextToWords(HERO_TITLE).map((word, index) => (
          <motion.span
            key={word.id}
            custom={index}
            variants={title}
            className='text-4xl md:text-8xl'
          >
            {word.text}
          </motion.span>
        ))}
      </motion.div>
      {/* <motion.p variants={liVariant} initial="closed" animate="open" className='text-4xl md:text-8xl font-light'>{HERO_TITLE}</motion.p> */}
      <motion.div variants={other} initial="hidden" animate="show" custom={0} className="md:hidden mt-4">
        <Banner />
      </motion.div>
      <motion.div variants={other} initial="hidden" animate="show" custom={0.25} className=' bg-muted mt-6 relative overflow-hidden max-h-[650px] flex items-center'>
        <Image src={build} alt="" objectFit="cover" className="w-full" />
      </motion.div>
    </div>
  )
}

export default Hero