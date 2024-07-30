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
        <div className='flex w-full text-xl gap-6 [&>*]:border-t [&>*]:border-primary [&>*]:pt-2'>
            <div className='w-1/3'>{TITLE}</div>
            <div>
                <p>{DESC}</p>
                <div className='mt-12'>
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