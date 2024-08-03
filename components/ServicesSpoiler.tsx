import { BsArrowUpRightCircle } from "react-icons/bs";

type Props = {}

const TITLE = "Servizi"
const DESC = "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam soluta facilis ullam non voluptates blanditiis nulla molestias molestiae dolore, aperiam sit quod libero, a totam harum possimus quibusdam ab eveniet."
const SERVICES = [
    "Public-Private partnership",
    "Dispute resolution",
    "Corporate law",
    "Criminal legal protection",
    "IP/IT"
]

const ServicesSpoiler = (props: Props) => {
    return (
        <div className='flex flex-col md:flex-row w-full text-xl gap-3 md:gap-6 md:[&>*]:border-t [&>*]:border-primary md:[&>*]:pt-2'>
            <p className='md:w-1/3 font-medium'>{TITLE}</p>
            <div>
                <p className="text-justify md:text-left">
                    {DESC}
                </p>
                <div className='mt-6 md:mt-12'>
                    {SERVICES.map((str: string, index: number) => {
                        return (
                            <div key={index} className='flex items-center gap-2 border-t border-primary pt-4 py-4 hover:bg-black/5'>
                                <p>
                                    {str}
                                </p>
                                <BsArrowUpRightCircle />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default ServicesSpoiler