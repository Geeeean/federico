import React, { ReactNode } from 'react'

type Props = {
    text: string,
    icon?: ReactNode,
    thick?: boolean,
    border?: boolean,
    underline?: boolean,
    secondary?: boolean
}

const Tag = ({ text, icon, thick = false, border = true, underline = false, secondary = false }: Props) => {
    return (

        <div className={`w-fit h-fit ${!secondary ? "border-primary" : "border-background"} ${border ? "border py-1 px-3 rounded-full" : ""} ${underline ? "border-b" : ""} flex items-center`}>
            <span className={`${thick ? "font-medium" : ""}`}>{text}</span>
            {icon}
        </div>
    )
}

export default Tag