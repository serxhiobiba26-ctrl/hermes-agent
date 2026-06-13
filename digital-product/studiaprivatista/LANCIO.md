# Guida al lancio — Studia da Privatista

Dal "ho i file" al "ho i primi utenti (e le prime vendite)".
Tempo: ~1 ora. Costo: 0 € (dominio opzionale ~10 €/anno).

---

## Cosa hai in mano (già pronto)

```
digital-product/studiaprivatista/
├── index.html          → landing + la suite di studio gratuita
├── style.css           → la grafica
├── app.js              → motore: calcolatrice, generatore prompt, flashcard, formulario
├── data.js             → formule e mazzi di flashcard di partenza
├── LANCIO.md           → questa guida
└── prodotto-completo/  → il Kit da vendere (file Markdown)
```

**Modello di business**
- La **suite gratuita** (calcolatrice + prompt + flashcard + formulario) attira chi studia da privatista. Funziona tutta nel browser, senza account e senza costi per te (nessuna API).
- Chi vuole tutto pronto **compra il Kit Privatista a 29 €** su Gumroad.

---

## Passo 1 — Pubblica il sito gratis

Hai due strade. La pagina è statica: nessun build, nessun server.

### Opzione A — GitHub Pages (per avere l'indirizzo `…github.io/studiaprivatista/`)

1. Crea un nuovo repository pubblico su GitHub chiamato **`studiaprivatista`**.
2. Copia dentro **solo** il contenuto di questa cartella
   (`index.html`, `style.css`, `app.js`, `data.js`) nella radice del repo.
3. Vai su **Settings → Pages** → *Source: Deploy from a branch* → branch `main`, cartella `/ (root)` → **Save**.
4. Dopo 1–2 minuti il sito è online su
   `https://<tuo-utente>.github.io/studiaprivatista/`.

> I link interni sono già relativi, quindi funziona anche sotto il sotto-percorso `/studiaprivatista/`.

### Opzione B — Vercel o Netlify (dominio `.vercel.app` / drag&drop)

- **Vercel:** importa il repo, imposta *Output Directory* su questa cartella → Deploy.
- **Netlify:** vai su [app.netlify.com/drop](https://app.netlify.com/drop) e trascina la cartella `studiaprivatista`. Link pubblico immediato.

---

## Passo 2 — Collega il prodotto a pagamento

1. Registrati su [gumroad.com](https://gumroad.com) (gratis; trattengono una piccola % solo quando vendi).
2. Crea un prodotto:
   - **Nome:** Kit Privatista — tutto pronto per il diploma da privatista
   - **Prezzo:** 29 € (lancio 19 € per i primi clienti)
   - **File:** carica i `.md` della cartella `prodotto-completo/` (oppure esportali in PDF).
3. Copia il link del prodotto Gumroad.
4. Apri `app.js`, in cima trovi:
   ```js
   const GUMROAD_URL = "https://gumroad.com/";
   ```
   Sostituiscilo con il tuo link e ri-pubblica. Tutti i bottoni "Ottieni il Kit" punteranno lì.

---

## Passo 3 — Porta le prime persone

Dove sono i privatisti? In gruppi e ricerche molto specifiche.

- **Gruppi Facebook** "diploma da privatista", "recupero anni scolastici", "esame di maturità privatisti".
- **TikTok / Reel**: "Quanto costa il diploma da privatista? (spoiler: molto meno di quello che credi)". Mostra la suite mentre risolve un esercizio.
- **Reddit / Quora** italiani: rispondi alle domande "come prendere il diploma da privatista" e linka la guida gratuita.
- **SEO**: il sito è già ottimizzato per parole come *diploma da privatista*, *esame di Stato candidato esterno*, *studiare da privatista*.

**Messaggio che funziona:** non vendere subito. Regala la suite gratuita → chi la usa e si fida compra il Kit.

---

## Passo 4 — Personalizza (5 minuti)

- **Prezzi/scadenze esame:** nel sito sono indicativi e con disclaimer. Tienili aggiornati con i dati ufficiali del MIM/USR.
- **Aggiungi formule:** apri `data.js`, sezione `FORMULE`, e aggiungi righe `["Nome", "Formula"]`.
- **Aggiungi mazzi:** sempre in `data.js`, sezione `STARTER_DECKS`.

---

## Checklist finale

- [ ] Sito online (GitHub Pages / Vercel / Netlify)
- [ ] Provata la suite su telefono e PC
- [ ] Prodotto Gumroad creato e link inserito in `app.js`
- [ ] Primo post nei gruppi/TikTok
- [ ] Dominio personalizzato (opzionale)

Buon lancio. 🎓
