import Link from 'next/link'
import { IoIosMenu } from "react-icons/io";

type Props = {}

const Nav = (props: Props) => {
  return (
    <div className='w-full flex justify-between'>
        <p>LOGO</p>
        <div className='hidden md:flex gap-4'>
            <Link href="#">Professionisti</Link>
            <Link href="#">Servizi</Link>
            <Link href="#">Marchio</Link>
            <Link href="#">Contatti</Link>
        </div>

        <IoIosMenu size={24} className='md:hidden'/>
    </div>
  )
}

export default Nav