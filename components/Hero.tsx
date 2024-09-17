"use client"

import Image from "next/image"
import build from "@/public/gary-walker-jones-4RCEZ0DSd88-unsplash.jpg"

import logo from "@/public/logo_white.svg"

import { motion } from "framer-motion"

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(15px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const SUB_TITLE = "Studio legale"
const TITLE = "Federico & Partners"

const Hero = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return <div className="w-full flex flex-col items-center relative">
        {children}

        {/* bg */}
        <motion.div
            variants={variants}
            className='opacity-30 w-full h-full absolute top-0 left-0 z-0 overflow-hidden flex items-center justify-center'>
            <Image
                src={build}
                alt=""
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                className="h-full w-full"
            />
        </motion.div>

        <div className="flex flex-col items-center gap-10 text-center z-50 py-10 md:pt-20 md:pb-32">
            <div className="relative max-w-[180px] md:max-w-[250px]">
                <Image alt="logo" src={logo} />
            </div>
            <div>
                <p className="text-3xl md:text-5xl font-serif mb-2">{SUB_TITLE}</p>
                <p className="text-4xl md:text-7xl font-medium font-serif">{TITLE}</p>
            </div>
        </div>
    </div>
}

export default Hero