import React from 'react'

type Props = {}

const Location = (props: Props) => {
    return (
        <div className="w-screen flex items-center justify-center p-4 md:p-0 max-w-3xl rounded-xl overflow-hidden md:mb-28">
            <iframe title='gmap-location' src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8190.435375653298!2d12.492035608247603!3d41.88844372520626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61b78d24cde3%3A0xbb0a94144ee86a41!2sVia%20Marco%20Aurelio%2C%2020%2C%2000184%20Roma%20RM!5e0!3m2!1sit!2sit!4v1726219814276!5m2!1sit!2sit" width="800" height="450" style={{ border: 0 }} loading="lazy"></iframe>
        </div>
    )
}

export default Location