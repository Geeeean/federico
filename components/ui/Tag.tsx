import React, { ReactNode } from 'react'

type Props = {
    text: string,
    icon?: ReactNode
    thick?: boolean
}

const Tag = ({ text, icon, thick = false }: Props) => {
    return (

        <div className="border border-primary py-1 px-3 rounded-full flex items-center">
            <span className={`${thick ? "font-medium" : ""}`}>{text}</span>
            {icon}
        </div>
    )
}

export default Tag