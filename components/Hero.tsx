import React from 'react'

type Props = {}

const HERO_TITLE = "Consulenza legale e rappresentanza in tutta Italia"

const Hero = (props: Props) => {
  return (
    <div>
        <p className='text-8xl font-light'>{HERO_TITLE}</p>
        <div className='w-full h-96 bg-muted mt-6'></div>
    </div>
  )
}

export default Hero