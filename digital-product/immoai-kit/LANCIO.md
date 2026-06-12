# Guida al lancio — ImmoAI Kit (per chi non è tecnico)

Questa guida ti porta dal "ho i file" al "ho incassato la prima vendita".
Tempo richiesto: ~2 ore in totale. Costo: 0 € (dominio opzionale ~10 €/anno).

---

## Cosa hai già in mano (creato da me)

```
digital-product/immoai-kit/
├── index.html        → la pagina di vendita + il generatore gratuito
├── style.css         → la grafica
├── app.js            → il motore del generatore (zero costi, nessuna API)
├── prompt-pack.md    → estratto del prodotto (20 prompt di esempio)
└── LANCIO.md         → questa guida
```

Il modello di business è semplice:
- La **pagina web** (gratis) attira gli agenti immobiliari con il generatore funzionante.
- Chi vuole tutto (150+ prompt, calendario social, guida) **compra il kit a 29 €** su Gumroad.

---

## Passo 1 — Pubblica la pagina online (gratis)

Hai due strade:

**A) La faccio io adesso** (consigliata): posso pubblicarla su Vercel e darti subito un link
   live tipo `immoai-kit.vercel.app`. Dimmi solo "pubblica" e procedo.

**B) Da solo in 5 minuti:**
   1. Vai su [app.netlify.com/drop](https://app.netlify.com/drop)
   2. Trascina la cartella `immoai-kit` nella finestra
   3. Ottieni subito un link pubblico. Fatto.

---

## Passo 2 — Prepara il prodotto da vendere

Il prodotto a pagamento è un **PDF + cartella di file**. Devo ancora generartelo completo
(150 prompt + calendario social + guida). Dimmi "completa il prodotto" e lo preparo io
in formato pronto da caricare.

Per ora, con l'estratto `prompt-pack.md` puoi già testare il mercato.

---

## Passo 3 — Crea il negozio su Gumroad (gratis)

1. Registrati su [gumroad.com](https://gumroad.com) (gratis, trattiene una piccola % solo
   quando vendi — nessun costo fisso).
2. Crea un nuovo prodotto:
   - **Nome:** ImmoAI Kit — Annunci e contenuti immobiliari con l'AI
   - **Prezzo:** 29 € (prezzo di lancio 19 € per i primi 20 clienti)
   - **File:** carica il PDF/cartella del prodotto completo (Passo 2)
3. Copia il link del prodotto Gumroad.
4. Aprilo `index.html`, cerca la riga con `id="buy"` e incolla il tuo link Gumroad
   al posto del `#`. (Oppure dimmi il link e lo aggiorno io.)

---

## Passo 4 — Prezzo e offerta

| Cosa | Prezzo | Perché |
|------|--------|--------|
| Lancio (primi 20 clienti) | 19 € | crea urgenza e prime recensioni |
| Prezzo pieno | 29 € | margine quasi 100% |
| Upsell futuro | 9 €/mese | aggiornamenti mensili di nuovi prompt |

---

## Passo 5 — Trova i primi clienti (budget 0 €)

Gli agenti immobiliari sono facilissimi da raggiungere. In ordine di efficacia:

1. **Gruppi Facebook di agenti immobiliari italiani** → pubblica il link del generatore
   gratuito ("ho creato uno strumento gratis per scrivere annunci, ditemi se vi è utile").
   Dai valore prima, vendi dopo.
2. **Instagram/LinkedIn** → posta 3 video brevi in cui mostri il generatore in azione.
3. **DM diretti** → scrivi a 20 agenti al giorno offrendo di provare il tool gratis.
4. **Reti/agenzie locali** → email con il link. Una rete = decine di agenti.

Regola d'oro: **prima regali lo strumento gratuito, poi proponi il kit completo.**

---

## Passo 6 — Misura e scala

- Se vendi 5+ kit nella prima settimana → l'idea funziona, possiamo:
  - aggiungere un dominio professionale (te lo verifico io),
  - creare versioni per altre nicchie (avvocati, ristoranti, e-commerce),
  - automatizzare la promozione con Hermes (post programmati via cron).
- Se non vende → cambiamo nicchia o messaggio. Il bello: non hai speso nulla.

---

## Cosa posso fare io adesso (dimmi quale)

- **"pubblica"** → metto la pagina online su Vercel e ti do il link live.
- **"completa il prodotto"** → genero i 150+ prompt, il calendario social e la guida PDF-ready.
- **"cambia nicchia: ___"** → riadatto tutto a un altro settore in pochi minuti.
- **"scrivi i post di lancio"** → ti preparo i testi pronti per Facebook/Instagram/LinkedIn.
