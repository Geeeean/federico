import Link from "next/link"
import Tag from "./ui/Tag";
import { FiArrowUpRight } from "react-icons/fi";

type Props = {
    border?: boolean
}

const LOCATIONS = ["Reggio Calabria", "Roma"]
const QUOTE = "I risultati che lo Studio legale ottiene lo distinguono da oltre 20 anni e sono diventati un modello per la pratica moderna del diritto."
const BTN_CONT = "CONTATTACI"

const Banner = ({ border = false }: Props) => {
    return (
        <div className={`w-full ${border ? "border-t border-primary pt-2" : ""} flex flex-col md:flex-row justify-between gap-4`}>
            <div>
                {
                    LOCATIONS.map((text: string, index: number) => {
                        return (
                            <div className='flex gap-2 items-center' key={index}>
                                <span className='w-2 h-2 rounded-full border border-primary' />
                                <p>{text}</p>
                            </div>
                        )
                    })
                }
            </div>

            <div className="flex flex-col items-left md:items-end gap-3">
                <p className='max-w-96 text-left md:text-right'>{QUOTE}</p>
                <Link href="#">
                    <Tag text={BTN_CONT} icon={<FiArrowUpRight size={24} />} thick />
                </Link>
            </div>
        </div>
    )
}

export default Banner