# StudyKit — Guida al lancio (passo passo)

> Stesso modello dell'ImmoAI Kit, applicato alla nicchia studenti.
> Cosa c'è già pronto e cosa devi fare tu.

## Struttura

```
studykit/
├── index.html          → pagina di vendita + generatore di comandi
├── style.css           → grafica
├── app.js              → motore del generatore (zero costi, nessuna API)
├── METODO-E-COMANDI.md → il metodo completo (4 fasi, 50+ comandi)
├── POST-DI-LANCIO.md   → i post per TikTok/Instagram + piano 7 giorni
├── PIANO-PRODOTTO.md   → la strategia di business
├── prodotto-completo/  → il prodotto da vendere (pacchetti per materia + guida)
└── studykit-prodotto.zip → pronto da caricare su Gumroad
```

Modello di business:
- La **pagina web** (gratis) attira gli studenti col generatore funzionante.
- Chi vuole tutto (50+ comandi, pacchetti per materia, guida) **compra il kit a 12 €**.

---

## Passo 1 — Pubblica la pagina online (gratis) — 2 minuti

Il repo è già configurato per il deploy. Ti basta collegarlo una volta:

1. Vai su [vercel.com/new](https://vercel.com/new) → importa il repo **hermes-agent**
2. ⚠️ In "Settings" imposta come Output Directory: `digital-product/studykit`
   (oppure crea un secondo progetto Vercel puntato a questa cartella)
3. Deploy → link pubblico in ~1 minuto

*Alternativa senza Vercel:* [app.netlify.com/drop](https://app.netlify.com/drop) →
trascina la cartella `studykit` → link immediato.

> Nota: `vercel.json` nella root punta all'ImmoAI Kit. Per pubblicare ENTRAMBI servono due
> progetti Vercel (uno per cartella), oppure usa Netlify Drop per il secondo. Dimmi
> "configura il deploy dello StudyKit" e ti sistemo io la configurazione.

---

## Passo 2 — Il prodotto da vendere (✅ GIÀ PRONTO)

Nella cartella `prodotto-completo/`:
- `PACCHETTI-PER-MATERIA.md` → comandi per matematica, storia, italiano, inglese, scienze
- `GUIDA-STUDIA-META-TEMPO.md` → la guida per lo studente
- (più `METODO-E-COMANDI.md` nella cartella sopra)

Lo ZIP `studykit-prodotto.zip` è pronto da caricare su Gumroad così com'è.

---

## Passo 3 — Crea il negozio (gratis)

1. Registrati su [gumroad.com](https://gumroad.com) (o [payhip.com](https://payhip.com))
2. Nuovo prodotto "StudyKit — Studia in metà tempo con l'AI"
3. Carica lo ZIP, prezzo 12 € (lancio a 8 €)
4. Copia il link e collega il bottone "Acquista" della pagina (lo faccio io quando me lo dai)

---

## Passo 4 — Lancio

Il canale per gli studenti è **TikTok e Instagram**, non Facebook.
Tutti i post pronti + il piano dei primi 7 giorni sono in `POST-DI-LANCIO.md`.

---

## Stato

- ✅ Pagina + generatore → `index.html`
- ✅ Prodotto completo → `prodotto-completo/` + ZIP
- ✅ Post di lancio → `POST-DI-LANCIO.md`
- ⬜ TU: pubblica la pagina (Vercel/Netlify)
- ⬜ TU: crea il prodotto su Gumroad e carica lo ZIP
- ⬜ IO: collego il link Gumroad al bottone quando me lo dai
