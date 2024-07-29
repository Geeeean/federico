import Tag from "./ui/tag"
import Link from "next/link"

import { FiArrowUpRight } from "react-icons/fi";

type Props = {}

const TAG_CONT = "PROFESSIONISTI"
const DESC = "Il nostro successo è il risultato di un gruppo di avvocati profondamente preparato."
const BTN_CONT = "SCOPRI DI PIU"

const ProfessionalsSpoiler = (props: Props) => {
    return (
        <div className='h-screen max-h-[750px] flex flex-col justify-center items-center gap-6 text-center'>
            <Tag text={TAG_CONT} />
            <p className="text-6xl max-w-[750px] font-light">{DESC}</p>
            <div className="rounded-full w-[600px] bg-muted h-20 my-6"></div>
            <Link href="#" className="text-lg flex gap-1 border-b border-primary">
                <span>{BTN_CONT}</span>
                <FiArrowUpRight size={24} />
            </Link>
        </div>
    )
}

export default ProfessionalsSpoiler