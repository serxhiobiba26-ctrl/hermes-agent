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
- Chi vuole tutto (100+ prompt, calendario social, guida) **compra il kit a 29 €** su Gumroad.

---

## Passo 1 — Pubblica la pagina online (gratis) — 2 minuti, una volta sola

Il repo è già configurato per il deploy automatico (`vercel.json` + `.vercelignore`).
Ti basta collegarlo una volta:

1. Vai su [vercel.com/new](https://vercel.com/new) (account già esistente)
2. Importa il repository **hermes-agent** dal tuo GitHub
3. Non cambiare nulla → premi **Deploy**
4. In ~1 minuto hai il link pubblico (es. `hermes-agent.vercel.app`)

Da quel momento **ogni aggiornamento pushato sul repo va online da solo**.

*Alternativa senza Vercel:* [app.netlify.com/drop](https://app.netlify.com/drop) →
trascina la cartella `immoai-kit` → link pubblico immediato.

---

## Passo 2 — Il prodotto da vendere (✅ GIÀ PRONTO)

Nella cartella `prodotto-completo/` trovi il prodotto finito:

- `01-PROMPT-PACK-COMPLETO.md` → 100+ prompt in 12 categorie + 10 mega-prompt bonus
- `02-CALENDARIO-SOCIAL-30-GIORNI.md` → 30 giorni di post già scritti
- `03-GUIDA-VENDI-DI-PIU-CON-AI.md` → la guida per il cliente

C'è anche lo ZIP `immoai-kit-prodotto.zip` pronto da caricare su Gumroad così com'è.

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

## Stato attuale

- ✅ Generatore web + pagina di vendita → `index.html` (pronta per il deploy)
- ✅ Prodotto completo → cartella `prodotto-completo/` + ZIP per Gumroad
- ✅ Post di lancio → `POST-DI-LANCIO.md` (gruppi FB, LinkedIn, DM, email, piano 7 giorni)
- ⬜ TU: importa il repo su [vercel.com/new](https://vercel.com/new) → link live
- ⬜ TU: crea il prodotto su [gumroad.com](https://gumroad.com) e carica lo ZIP
- ⬜ IO: quando mi dai il link Gumroad, lo collego al bottone "Acquista" della pagina

## Cosa posso fare dopo (dimmi quale)

- **"cambia nicchia: ___"** → riadatto tutto a un altro settore in pochi minuti.
- **"versione inglese"** → traduco tutto per vendere sul mercato internazionale (più grande).
- **"secondo prodotto"** → replico il modello per un'altra nicchia (avvocati, ristoranti...).
