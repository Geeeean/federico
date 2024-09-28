"use client"

import Image from "next/legacy/image";

import Link from 'next/link'
import { IoIosMenu } from "react-icons/io";

import logo from "@/public/logo_white.svg"
import { useEffect, useState } from 'react';
import MobileNav from './MobileNav';

export const NAV_ITEMS = [
  { copy: "Servizi", href: "/#services" },
  { copy: "Professionisti", href: "/#professionals" },
  { copy: "Contattaci", href: "/#contactForm" },
  { copy: "Storia", href: "/identity" },
]

const TITLE = "Federico & Partners"

type Props = {}

const Nav = (props: Props) => {
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    if (show) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [show]);

  return (
    <div className='px-4 w-full md:px-0 my-4 max-w-3xl'>
      <div className='border-b border-ivory w-full grid grid-cols-[1fr,auto] py-4 mx-auto'>
        <MobileNav setShow={setShow} show={show} />
        <Link href="/">
          <div className='flex items-center gap-2'>
            <Image src={logo} alt="logo" width={50} height={50} className='hidden md:block'></Image>
            <span className='font-serif text-3xl md:text-4xl'>{TITLE}</span>
          </div>
        </Link>

        <div className='hidden md:flex gap-4 items-center justify-center'>
          {
            NAV_ITEMS.map((item, index) => (
              <Link href={item.href} className='hidden md:block hover:underline' key={index}>{item.copy}</Link>
            ))
          }
        </div>


        <div className='flex justify-end items-center '>
          <IoIosMenu size={32} className='md:hidden' onClick={() => setShow(true)} />
        </div>
      </div>
    </div>
  )
}

export default Nav