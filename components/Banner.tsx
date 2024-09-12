import Link from "next/link"
import Tag from "./ui/Tag";
import { FiArrowUpRight } from "react-icons/fi";

type Props = {
    border?: boolean
}

const LOCATIONS = ["Roma", "Reggio Calabria"]
const QUOTE = "I risultati che lo Studio legale ottiene lo distinguono da oltre 20 anni e sono diventati un modello per la pratica moderna del diritto."

const Banner = ({ border = false }: Props) => {
    return (
        <div className={`w-full flex flex-col md:grid md:grid-cols-[auto,250px] justify-between gap-4`}>
            <div className="flex flex-col gap-2">
                <div>
                    <p className="font-serif text-4xl text-secondary font-medium">Federico & Partners</p>
                    <p className="text-md text-primary font-medium">Studio legale</p>
                </div>
                <div>
                    {
                        LOCATIONS.map((text: string, index: number) => {
                            return (
                                <div className='flex gap-2 items-center' key={index}>
                                    <span className='w-2 h-2 rounded-full border border-primary' />
                                    <p className="">{text}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            {/* <div className="flex flex-col items-left md:items-end gap-3">
                <p className='max-w-96 text-left md:text-right'>{QUOTE}</p>
            </div> */}
        </div>
    )
}

export default Banner