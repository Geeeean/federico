"use client"

import Image from 'next/image';

import Link from 'next/link'
import { IoIosMenu } from "react-icons/io";

const BTN_CONT = "CONTATTACI"

import logo from "@/public/logo_white.svg"
import { useState } from 'react';
import MobileNav from './MobileNav';
import Tag from './ui/Tag';
import { motion } from 'framer-motion';

export const NAV_ITEMS = [
  { copy: "Professionisti", href: "#" },
  { copy: "Marchio", href: "#" },
  { copy: "Servizi", href: "#" },
]

type Props = {}

const Nav = (props: Props) => {
  const [show, setShow] = useState<boolean>(false)

  return (
    <div className='w-full grid grid-cols-3 max-w-2xl'>
      <MobileNav setShow={setShow} show={show} />
      <div className='flex items-center gap-2'>
        <IoIosMenu size={32} className='md:hidden' onClick={() => setShow(true)} />
        <Image src={logo} alt="logo" width={64} height={64} className='hidden md:block'></Image>
      </div>

      <div className='hidden md:flex gap-4 items-center justify-center'>
        {
          NAV_ITEMS.map((item, index) => (
            <Link href="#" className='hidden md:block' key={index}>{item.copy}</Link>
          ))
        }
      </div>


      <div className='flex justify-end items-center col-span-2 md:col-span-1'>
        <motion.div whileTap={{scale: 0.9}}>
          <Link href="#">
            {/* <Tag text={BTN_CONT} icon={null} thick /> */}
            {/* <span className='italic font-serif text-2xl'>Contattaci</span> */}
            <div className='px-3 py-1 bg-primary text-background rounded-full ring-1 ring-primary font-medium'>{BTN_CONT}</div>
          </Link>
        </motion.div>
      </div>

    </div>
  )
}

export default Nav