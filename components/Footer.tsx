import Image from "next/image"

import { FiArrowUpRight } from "react-icons/fi"
import Tag from "@/components/ui/Tag"

type Props = {}

const PIVA = {
    title: "Partita IVA",
    value: "02718420223"
}

const LOCATION = {
    city: "00184 Roma (RM)",
    address: "Via Marco Aurelio 20"
}

const CONTACTS = {
    email: "segreteria.studiolegalefederico@gmail.com",
    number: "06 4550 4343"
}

import logo from "@/public/logo_blue.svg"

const Footer = (props: Props) => {
    return (
        <div className="mt-4 mx-auto w-full max-w-3xl p-4 md:px-0">
            <div className='w-full bg-primary text-background p-4 md:p-8 rounded-xl flex flex-col gap-8 md:gap-20 [&>*]:flex [&>*]:w-full [&>*]:justify-between'>
                <div className="flex flex-col md:flex-row gap-8">
                    <Image src={logo} alt="logo" width={100} height={100}></Image>
                    {/* <div className='md:text-right'>
                    <p>{PIVA.title}</p>
                    <p>{PIVA.value}</p>
                    </div> */}
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-xs">Indirizzo</p>
                            <p>{LOCATION.address}</p>
                            <p>{LOCATION.city}</p>
                        </div>
                        <div>
                            <p className="text-xs">Telefono</p>
                            <p>{CONTACTS.number}</p>
                            <p className="text-xs mt-2">Email</p>
                            <p>{CONTACTS.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 md:items-end">
                        <Tag text="Facebook" border={false} underline secondary icon={<FiArrowUpRight size={24} />} thick />
                        <Tag text="Instagram" border={false} underline secondary icon={<FiArrowUpRight size={24} />} thick />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer