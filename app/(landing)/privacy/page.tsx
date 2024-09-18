type Props = {}

const TITLE = "Informativa sul trattamento dei dati personali"
const SUB_TITLE = `Informativa ai sensi dell’art. 13 del Regolamento Europeo 2016/679 (per brevità GDPR
2016/679) e del Codice Privacy n. 196/2003, nonché ex Codice Privacy (D.Lgs. n. 196/2003
come modificato dal D.Lgs. n. 101/2018).
Per una miglior comprensione di questa informativa si precisa che il Titolare del trattamento è la
persona fisica o giuridica che, singolarmente o insieme ad altri, determina le finalità e i mezzi
del trattamento di dati personali.
I dati personali sono le informazioni riguardanti una persona fisica identificata o identificabile
definita "interessato".
I dati particolari o c.d. sensibili sono quelli da cui possono rilevare l'origine razziale o etnica, le
opinioni politiche, le convinzioni religiose o filosofiche, o l'appartenenza sindacale, nonché i dati
genetici, i dati biometrici intesi a identificare in modo univoco una persona fisica e i dati relativi
alla salute o alla vita sessuale o all'orientamento sessuale dell'interessato.`

const PARAGRAPHS = [
    {
        title: "Titolare e responsabili del trattamento - art. 13 co. 1 lett. [a] [b] GDPR 2016/679", copy: `Titolare del trattamento dei dati personali è l’Avv. Fabio FEDERICO, del Foro di Roma, C.F.
FDRFBA72M01H224L, al quale ci si potrà rivolgere per esercitare i diritti riconosciuti dal GDPR
e per conoscere l'elenco aggiornato di tutti i Responsabili del trattamento dei dati.`},
    {
        title: `Finalità e base giuridica - art. 13 co. 1 lett. [c] [d] GDPR 2016/679, art. 2-sexies e octies
del Codice Privacy`, copy: `I dati personali da Voi forniti potranno essere trattati unicamente per le seguenti finalità:
- esecuzione del mandato professionale - base giuridica: art. 6.1 [b] GDPR 2016/679 riguardo i
dati personali e art. 2-sexies del Codice Privacy riguardo i dati particolari/sensibili - il trattamento
è necessario all'esecuzione di un contratto di cui l'interessato è parte o all'esecuzione di misure
precontrattuali adottate su richiesta dello stesso nell'ambito della tutela di un diritto in sede
amministrativa, giudiziaria e, a mente del considerando 52 del GDPR, stragiudiziale;
- gestione dei conseguenti obblighi di legge - base giuridica: art. 6.1 [c] GDPR 2016/679 e art.
2-sexies del Codice Privacy.
Non sono previsti ulteriori trattamenti basati sui legittimi interessi perseguiti dal titolare del
trattamento.
Il trattamento di dati personali relativi a condanne penali e/o a reati e/o a connesse misure di
sicurezza è consentito, a mente dell'art. 2-octies del Codice Privacy, per l'accertamento, l'esercizio o la difesa di un diritto in sede giudiziaria o per l'adempimento degli obblighi previsti
da disposizioni di legge o di regolamento in materia di mediazione finalizzata alla conciliazione
delle controversie civili e commerciali.`},
    {
        title: `Tipi di dati trattati e natura del conferimento dei dati personali e conseguenze di un
eventuale rifiuto di rispondere - art. 13 co. 2 lett. [e] [f] GDPR 2016/679`, copy: `- Dati comuni: nominativi, dati anagrafici; curriculum vitae; titoli di studio, corsi di formazione e
quanto altro utile per la gestione dell'attività lavorativa;
- dati particolari o c.d. sensibili necessari all'esecuzione del mandato professionale.
- dati giudiziari ossia relativi a condanne penali e a reati o a connesse misure di sicurezza se
necessario all'esecuzione del mandato professionale.
Il conferimento dei suddetti dati personali è necessario per l'esecuzione del mandato
professionale oppure obbligatorio per adempiere a specifici obblighi di legge e l'eventuale rifiuto
di conferirli comporta l'impossibilità di instaurare o proseguire il rapporto professionale.
Riguardo tali dati non esiste un processo decisionale automatizzato, né tanto meno un
trattamento che comporti la sua profilazione.` },
    {
        title: `Eventuali destinatari o eventuali categorie di destinatari dei dati personali e
trasferimento di dati personali ad un Paese terzo fuori dall’ Unione Europea - art. 13 co. 1
lett. [e] [f] GDPR 2016/679`, copy: `Ai dati possono accedere soggetti autorizzati ai sensi degli artt. 29 GDPR e 2-quaterdecies del
Codice Privacy.
Ai dati potranno ulteriormente accedere, in qualità di titolari autonomi o di responsabili ai sensi
dell'art. 28 GDPR, professionisti e consulenti incaricati dal titolare o direttamente dal cliente,
nonché domiciliatari, avvocati, collaboratori, soggetti operanti nel settore giudiziario, controparti
e relativi difensori, collegi di arbitri e, in genere, tutti quei soggetti cui la comunicazione sia
necessaria per il corretto adempimento per le finalità indicate nel punto 1), anche sotto il profilo
amministrativo e contabile come ad esempio:
- istituti di credito,
- organizzazioni sindacali,
- enti pubblici e privati con finalità assicurative,
- altri enti pubblici e privati che forniscono servizi di ausilio all'esecuzione del mandato
professionale.
I dati potranno essere comunicati all'esterno a persone esplicitamente indicate dall'interessato.
I dati non saranno diffusi e non verranno trasferiti ad un paese terzo o a un'organizzazione
internazionale.` },
    {
        title: `Periodo di conservazione o criteri utilizzati per stabilire tale periodo - art. 13 co. 2 lett.
[a] GDPR 2016/679`, copy: `I dati saranno conservati per un periodo di tempo non superiore a quello necessario agli scopi
per i quali essi sono stati raccolti o successivamente trattati conformemente a quanto previsto
dagli obblighi di legge previsti per l'esercizio della professione forense, tra cui gli art. 33 del
Codice Deontologico Forense ed art. 2235 del Codice Civile.` },
    {
        title: `Diritti dell'interessato - art. 13 co. 2 lett. [b] [c] [d] GDPR 2016/679 e relative limitazioni
ai sensi degli artt. 2-undecies e 2-duodecies del Codice Privacy come modificato dal
D.Lgs. n. 101/2018`, copy: `L'interessato gode di numerosi diritti, qui elencati:
- diritto di accesso ai dati personali;
- diritto di rettifica;
- nei casi previsti dalla legge, il diritto alla cancellazione dei dati (cd. diritto all'oblio);
- nei casi previsti dalla legge, il diritto alla limitazione del trattamento dei dati;
- nei casi previsti dalla legge, il diritto alla portabilità dei dati;
- nei casi previsti dalla legge, il diritto di opporsi alle attività di trattamento;
- in caso di trattamento basato sul consenso, la possibilità di revocarlo in ogni tempo fermo
restando la liceità del trattamento basato sul consenso successivamente revocato.
L'interessato può fare richiesta di esercitare tali diritti usando i dati di contatto del titolare del
trattamento e, se presente, del responsabile per la protezione dei dati.
Ai sensi dell'art. 2-terdecies si ricorda che i diritti delle persone decedute possono essere
esercitati da chi ha un interesse proprio, o agisce a tutela dell'interessato in qualità di suo
mandatario, o per ragioni familiari meritevoli di protezione. Nei casi previsti dalla legge
l'interessato può vietare l'esercizio anche solo di alcuni diritti in materia di protezione dei dati
personali mediante dichiarazione scritta che manifesti una volontà non equivoca, specifica,
libera ed informata, presentata o comunicata al titolare del trattamento. Tale dichiarazione può
essere revocata e comunque non può comportare effetti pregiudizievoli per l'esercizio di diritti
patrimoniali derivanti dalla morte dell'interessato o di difesa da parte di terzi.
In proposito devono comunque considerarsi le limitazioni ai diritti dell'interessato previste dagli
artt. 2-undecies e 2-duodecies del Codice Privacy come modificato dal D.Lgs. 101/2018,
limitazioni previste in materia di: antiriciclaggio, sostegno delle vittime di atti estorsivi, controllo
dei mercati finanziari e monetari, investigazioni difensive ed esercizio dei diritti in sede
giudiziaria e per ragioni di giustizia, protezione del whistleblower.
In relazione ad un trattamento che l'interessato ritenga non conforme alla normativa,
l'interessato può proporre reclamo alla competente autorità di controllo che, per l'Italia, è il
Garante per la protezione dei dati personali (art. 2-bis Codice Privacy).
In alternativa può proporre reclamo presso l'Autorità Garante dello Stato UE in cui risiede o
abitualmente lavora oppure nel luogo ove si è verificata la presunta violazione.` },
]

const Privacy = (props: Props) => {
    return (
        <div className="max-w-3xl p-4 w-full space-y-16">
            <div className="space-y-1">
                <p className="text-3xl font-medium font-serif">{TITLE}</p>
                <p className="text-lg font-medium">{SUB_TITLE}</p>
            </div>
            <div className="space-y-8">
                {PARAGRAPHS.map((par, index: number) => {
                    return (<div className="space-y-1" key={index}>
                        <p className="text-xl font-semibold">{par.title}</p>
                        <p className="text-lg">{par.copy}</p>
                    </div>)
                })}
            </div>
        </div>
    )
}

export default Privacy