"use client"

import { motion, MotionConfig } from "framer-motion"

const variants = {
    hidden: { filter: "blur(4px)", transform: "translateY(20px)", opacity: 0 },
    show: { filter: "blur(0px)", transform: "translateY(0px)", opacity: 1 }
}

const TITLE = "STORIA E MARCHIO"

const P1_TITLE = "Il marchio."
const P1 = `Lo Studio Legale Federico (sede di Roma) nasce nel 1997. Il suo fondatore, l’Avv. Fabio
                            Federico, fornendo un imprimatur di competenza e professionalità, ha creato un modello, tra i
                            primi in Italia, di management applicata alla gestione dello studio legale.
                            Tale professionalità offre ai propri clienti un livello di competenza peculiare in ogni singola
                            branca del diritto, garantito dai titoli di specializzazione conseguiti.
                            Il modello gestionale cui si ispira è quello dell’esercizio individuale della prestazione
                            professionale, garantita dal controllo collettivo del team di lavoro, che produce un ambiente
                            di reciproca motivazione e sano spirito di competizione.
                            Lo Studio Legale Federico (sede di Reggio Calabria) nasce nel 1963.
                            Il fondatore, l’Avv. Paolo Federico, si è dedicato interamente alla professione, rappresentando
                            l’avvocatura nell’associazionismo forense a livello locale e nazionale, creando una struttura
                            moderna ed efficiente, così come testimoniato dai crescenti successi professionali conseguiti
                            fin dalla prima metà degli anni sessanta.`

const P2_TITLE = "La storia."
const P2 = `Il Marchio dello Studio Legale Federico & Partners racchiude in un simbolo gli elementi
                            fondanti del proprio modo di percepire una moderna concezione delle Scienze Forensi ed in
                            particolare della professione dell’avvocato. Il corollario terminologico che, ad esso, ruota
                            attorno, in senso orario, ha un preciso significato:
                            il DIRITTO come mezzo privilegiato per raggiungere la GIUSTIZIA
                            la LEGALITA’ come modo imprescindibile per godere della LIBERTA’
                            Al suo interno campeggia una Bilancia, in equilibrio su una Lancia, a testimonianza del
                            sottile equilibrio su cui si regge l’amministrazione della giustizia e la dualità, evocata dal
                            contrasto dei colori, in cui gravitano tutte le vicende giudiziarie ed umane. La particolare
                            posizione, in orizzontale, della Bilancia richiama il simbolo dell’Infinito che rappresenta
                            l’aspirazione ad una “Giustizia Assoluta ed Universale” che va oltre l’errore umano`

const Identity = () => {
    return (
        <MotionConfig transition={{ type: "spring", duration: 0.32, bounce: 0 }}>
            <div className="w-screen flex items-center justify-center p-4 text-lg">
                <motion.div className='flex flex-col text-justify gap-4 max-w-3xl'
                    initial="hidden"
                    whileInView="show"
                    transition={{ staggerChildren: 0.1 }}
                    viewport={{ once: true }}
                >
                    <motion.div variants={variants} className="text-xl font-serif z-10 border-dark mb-2">
                        <span className="text-2xl md:text-4xl mt-1">{TITLE}</span>
                    </motion.div>

                    {
                        [{title: P1_TITLE, pg: P1}, {title: P2_TITLE, pg: P2}].map(
                            (item, index) => (<motion.div variants={variants} key={index}>
                                <span className="font-serif italic text-xl mr-2 text-gold">{item.title}</span>
                                <span>{item.pg}</span>
                            </motion.div>)
                        )
                    }
                </motion.div>
            </div>
        </MotionConfig>
    )
}

export default Identity
