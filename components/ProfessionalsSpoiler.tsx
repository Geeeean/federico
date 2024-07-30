import Tag from "./ui/Tag"
import Link from "next/link"

import { FiArrowUpRight } from "react-icons/fi";

type Props = {}

const TAG_CONT = "PROFESSIONISTI"
const DESC = "Il nostro successo è il risultato di un gruppo di avvocati profondamente preparato."
const BTN_CONT = "SCOPRI DI PIU"

const ProfessionalsSpoiler = (props: Props) => {
    return (
        <div className='flex flex-col justify-center items-center gap-6 text-center'>
            <Tag text={TAG_CONT} />
            <p className="text-6xl max-w-[750px] font-light">{DESC}</p>
            <div className="rounded-full w-[600px] bg-muted h-20 my-6"></div>
            <Link href="#" className="text-lg">
                <Tag text={BTN_CONT} border={false} icon={<FiArrowUpRight size={24} />} underline/>
            </Link>
        </div>
    )
}

export default ProfessionalsSpoiler