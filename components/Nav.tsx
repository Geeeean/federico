import Link from 'next/link'

type Props = {}

const Nav = (props: Props) => {
  return (
    <div className='w-full flex justify-between'>
        <p>LOGO</p>
        <div className='flex gap-4'>
            <Link href="#">Professionisti</Link>
            <Link href="#">Servizi</Link>
            <Link href="#">Marchio</Link>
            <Link href="#">Contatti</Link>
        </div>
    </div>
  )
}

export default Nav