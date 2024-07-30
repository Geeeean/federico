import React, { ReactNode } from 'react'

type Props = {
    text: string,
    icon?: ReactNode,
    thick?: boolean,
    border?: boolean,
    underline?: boolean
}

const Tag = ({ text, icon, thick = false, border = true, underline = false }: Props) => {
    return (

        <div className={`w-fit border-primary ${border ? "border py-1 px-3 rounded-full" : ""} ${underline ? "border-b" : ""} flex items-center`}>
            <span className={`${thick ? "font-medium" : ""}`}>{text}</span>
            {icon}
        </div>
    )
}

export default Tag