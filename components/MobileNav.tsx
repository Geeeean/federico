"use client"

import { motion, AnimatePresence } from "framer-motion"
import { IoClose } from "react-icons/io5"
import { NAV_ITEMS } from "./Nav"
import Link from "next/link"
import Image from "next/image"

import logo from "@/public/logo_white.svg"

type Props = {
    setShow: (val: boolean | ((val: boolean) => boolean)) => void,
    show: boolean
}

const navVariants = {
    initial: { y: "-100%", opacity: 0, filter: "blur(4px)" },
    show: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: { y: "-100%", opacity: 0, filter: "blur(4px)" },
}

const liVariants = {
    initial: { opacity: 0, y: 15, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: 15, filter: "blur(4px)" },
}


const MobileNav = ({ setShow, show }: Props) => {
    return (
        <AnimatePresence mode="wait">
            {
                show ? (<motion.nav
                    className={`index absolute top-0 left-0 h-dvh w-screen bg-gray-950/70 backdrop-blur-2xl p-4 font-serif text-gray-50 md:hidden z-50 flex flex-col`}
                    variants={navVariants}
                    initial="initial"
                    animate="show"
                    exit="exit"
                    transition={{ ease: "easeInOut", bounce: 0, duration: 0.4 }}
                >
                    <div className="flex w-full">
                        <IoClose
                            onClick={() => setShow((isOpen: boolean) => !isOpen)}
                            size={24}
                        />
                    </div>
                    <div className="flex flex-col h-full justify-center items-center gap-20">
                        <motion.div variants={liVariants} initial="initial"
                            transition={{ type: "spring", bounce: 0, duration: 0.5, delay: 0.45 }}

                            animate="show"
                            exit="exit">
                            <Image alt="logo" src={logo} width={150} />
                        </motion.div>
                        <motion.ul
                            className="text-center"
                            transition={{ delayChildren: 0.5, staggerChildren: 0.1 }}
                            initial="initial"
                            animate="show"
                            exit="exit"
                        >
                            {
                                NAV_ITEMS.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        variants={liVariants}
                                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                        className="text-3xl italic mb-6"
                                        onClick={() => setShow(false)}
                                    >
                                        <Link href={item.href}>
                                            {item.copy}
                                        </Link>
                                    </motion.li>
                                ))
                            }
                        </motion.ul>
                    </div>
                </motion.nav>) : null
            }
        </AnimatePresence>
    )
}

export default MobileNav
