"use client"

import { delay, motion, Variants } from "framer-motion"

type Props = {}

const text: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    show: {
        opacity: 1,
        y: 0,
    },
}

const Loading = (props: Props) => {
    return (
        <motion.div
            animate={{ opacity: 0 }}
            transition={{ delay: 2 }}
            className='absolute top-0 left-0 z-10 w-screen h-screen bg-background flex flex-col justify-center items-center text-center'
        >
            <div className="mb-36 md:mb-0">
                <motion.p
                    className='text-primary text-2xl font-bold'
                    variants={text}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.1, ease: "easeOut" }}
                >
                    Federico & Partners
                </motion.p>

                <motion.p
                    variants={text}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.1, ease: "easeOut" }}
                    className='text-black/30 font-extrabold'
                >
                    STUDIO LEGALE
                </motion.p>
            </div>
        </motion.div >
    )
}

export default Loading