import { FiArrowUpRight } from "react-icons/fi"
import Tag from "./ui/Tag"

type Props = {}

const PIVA = {
    title: "Partita IVA",
    value: "02718420223"
}

const LOCATION = {
    city: "38122 Trento (TN)",
    address: "Via Giuseppe Grazioli, 106"
}

const CONTACTS = {
    email: "info@studiofederico.it",
    number: "+39 3335004460"
}

const Footer = (props: Props) => {
    return (
        <div className='w-full bg-primary text-background p-8 rounded-2xl flex flex-col gap-8 md:gap-20 [&>*]:flex [&>*]:w-full [&>*]:justify-between'>
            <div className="flex flex-col md:flex-row gap-8">
                <span>LOGO</span>
                <div className='md:text-right'>
                    <p>{PIVA.title}</p>
                    <p>{PIVA.value}</p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col gap-4">
                    <div>
                        <p>{LOCATION.address}</p>
                        <p>{LOCATION.city}</p>
                    </div>
                    <div>
                        <p>{CONTACTS.number}</p>
                        <p>{CONTACTS.email}</p>
                    </div>
                </div>
                <div className="flex gap-4 md:items-end">
                    <Tag text="Facebook" border={false} underline secondary icon={<FiArrowUpRight size={24} />} thick />
                    <Tag text="Instagram" border={false} underline secondary icon={<FiArrowUpRight size={24} />} thick />
                </div>
            </div>
        </div>
    )
}

export default Footer