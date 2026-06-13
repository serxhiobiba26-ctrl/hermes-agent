# Attivare l'AI che "capisce e risolve" le foto (Gemini su Vercel)

Questo rende automatica la funzione **🤖 Capisci e risolvi (AI)**: l'utente scatta
una foto dell'esercizio e la pagina la capisce e la risolve da sola.

La tua chiave resta **segreta** (impostata su Vercel, mai nel codice pubblico).
Costo: paghi solo l'uso di Gemini (c'è anche una fascia gratuita giornaliera).

Tempo: ~10 minuti, una volta sola.

---

## Passo 1 — Crea la chiave Google Gemini (gratis)

1. Vai su **https://aistudio.google.com/app/apikey**
2. Accedi con il tuo account Google.
3. Premi **Create API key** → copia la chiave (una stringa lunga). Tienila da parte.

> La fascia gratuita di Gemini basta per provare e per un uso leggero. Oltre i limiti, si paga a consumo.

---

## Passo 2 — Pubblica il sito su Vercel (con la funzione AI)

1. Vai su **https://vercel.com/new**
2. **Importa** il repository `hermes-agent` dal tuo GitHub.
3. In **Root Directory** premi *Edit* e scegli la cartella:
   `digital-product/studiaprivatista`  ← **importante**
   (così Vercel pubblica il sito e attiva la cartella `api/` con la funzione).
4. Apri **Environment Variables** e aggiungi:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** *(incolla la chiave del Passo 1)*
5. Premi **Deploy**. Dopo ~1 minuto hai il sito online (es. `studiaprivatista.vercel.app`).

### Branch di produzione
Il sito sta sul ramo **`claude/studiaprivatista-website-mlm0sa`**.
Se Vercel pubblica un altro ramo, vai in **Settings → Git → Production Branch**,
imposta `claude/studiaprivatista-website-mlm0sa` e premi **Redeploy**.
*(Oppure chiedimi di unire tutto nel ramo principale e salti questo passaggio.)*

---

## Passo 3 — Prova

1. Apri il sito Vercel, scheda **Risolvi**.
2. Premi **📷 Fotografa o carica l'esercizio**, scegli una foto.
3. Premi **🤖 Capisci e risolvi (AI)**.
4. In pochi secondi compare la soluzione spiegata passo-passo. ✅

Se vedi *"L'AI automatica non è ancora attivata"*: la funzione non è stata pubblicata
(controlla la Root Directory al Passo 2.3). Se vedi un errore di chiave: ricontrolla
`GEMINI_API_KEY` in **Settings → Environment Variables** e fai **Redeploy**.

---

## Come funziona (e i costi)

- La pagina rimpicciolisce la foto e la manda alla funzione `api/solve-photo.js`.
- La funzione, con la TUA chiave segreta, chiede a Gemini di:
  **1) leggere** la foto, **2) risolvere** spiegando, **3) ricontrollare** il risultato.
- Restituisce la soluzione, che appare nella pagina.

Nessuna chiave è visibile agli utenti. Se un domani vuoi spegnere l'AIn, basta togliere
la variabile su Vercel: il resto del sito (risolvi, flashcard, formulario, zaino) continua
a funzionare gratis come prima.

---

## Sicurezza & limiti (consigliato)

- Su Google AI Studio puoi mettere un **limite di spesa** e vedere l'uso.
- Se il sito diventa popolare, valuta un piccolo limite di richieste per evitare abusi.
- Per cambiare modello, modifica `MODEL` in cima a `api/solve-photo.js`.
