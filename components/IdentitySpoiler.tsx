import Tag from "./ui/Tag"
import Link from "next/link"

type Props = {}

const TITLE = "Il marchio"
const DESC = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum minima alias maxime quas temporibus, vitae quibusdam natus culpa, unde sit tempora veniam exercitationem, praesentium quasi velit molestias voluptas repudiandae esse."
const BTN_CONT = "Continua a leggere"

const IdentitySpoiler = (props: Props) => {
    return (
        <div className='flex justify-center items-center gap-10 text-left'>
            <div className="text-xl">
                <p className="text-2xl">{TITLE}</p>
                <p className="max-w-xl">{DESC}</p>
                
                <div className="mt-5">
                    <Link href="#">
                        <Tag text={BTN_CONT} border={false} underline />
                    </Link>
                </div>
            </div>
            <div className="w-40 h-40 bg-muted"></div>
        </div>
    )
}

export default IdentitySpoiler