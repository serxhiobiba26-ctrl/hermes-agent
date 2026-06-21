import { useEffect, useState } from "react";

// --- Limite uso gratuito (segnaposto) -------------------------------------
// Sezione isolata e facile da rimuovere: i pagamenti veri si aggiungono dopo.
const LIMITE_USI = 3;
const CHIAVE_USI = "fjala_usi";

function leggiUsi() {
  const n = parseInt(localStorage.getItem(CHIAVE_USI) || "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function incrementaUsi() {
  const n = leggiUsi() + 1;
  localStorage.setItem(CHIAVE_USI, String(n));
  return n;
}
// --------------------------------------------------------------------------

const AZIONI = [
  { id: "traduci", etichetta: "Traduci" },
  { id: "correggi", etichetta: "Correggi" },
  { id: "rendi-naturale", etichetta: "Rendi naturale" },
];

const DIREZIONI = {
  "it-al": { sx: "IT", dx: "AL", etichetta: "IT → AL" },
  "al-it": { sx: "AL", dx: "IT", etichetta: "AL → IT" },
};

export default function App() {
  const [testo, setTesto] = useState("");
  const [direction, setDirection] = useState("it-al");
  const [risultato, setRisultato] = useState("");
  const [note, setNote] = useState([]);
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(null); // id azione in corso
  const [usiRimasti, setUsiRimasti] = useState(LIMITE_USI);

  useEffect(() => {
    setUsiRimasti(Math.max(0, LIMITE_USI - leggiUsi()));
  }, []);

  function scambiaDirezione() {
    setDirection((d) => (d === "it-al" ? "al-it" : "it-al"));
  }

  async function elabora(action) {
    if (caricamento) return;
    setErrore("");

    if (!testo.trim()) {
      setErrore("Scrivi o incolla un testo da elaborare.");
      return;
    }

    // Controllo del limite gratuito (segnaposto).
    if (usiRimasti <= 0) {
      setErrore(
        "Hai esaurito i 3 usi gratuiti su questo dispositivo. Presto sarà possibile " +
          "continuare con un piano a pagamento."
      );
      return;
    }

    setCaricamento(action);
    setRisultato("");
    setNote([]);

    try {
      const resp = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testo, direction, action }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setErrore(data && data.error ? data.error : "Si è verificato un errore. Riprova.");
        return;
      }

      setRisultato(data.risultato || "");
      setNote(Array.isArray(data.note) ? data.note : []);

      // Consuma un uso solo dopo una risposta valida.
      incrementaUsi();
      setUsiRimasti(Math.max(0, LIMITE_USI - leggiUsi()));
    } catch (e) {
      setErrore("Impossibile contattare il servizio. Controlla la connessione e riprova.");
    } finally {
      setCaricamento(null);
    }
  }

  const dir = DIREZIONI[direction];

  return (
    <div className="app">
      <header className="intestazione">
        <span className="marchio">Fjala</span>
        <p className="sottotitolo">
          Tra italiano e albanese — traduci, correggi, rendi naturale.
        </p>
      </header>

      <main className="libro">
        {/* Pagina sinistra: testo di partenza */}
        <section className="pagina pagina-sx">
          <label className="etichetta-pagina" htmlFor="testo">
            Testo di partenza · {dir.sx}
          </label>
          <textarea
            id="testo"
            className="campo-testo"
            placeholder="Incolla o scrivi qui il testo…"
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            spellCheck="false"
          />

          <div className="pulsanti">
            {AZIONI.map((a) => (
              <button
                key={a.id}
                type="button"
                className={"pulsante" + (caricamento === a.id ? " attivo" : "")}
                onClick={() => elabora(a.id)}
                disabled={!!caricamento}
              >
                {caricamento === a.id ? "…" : a.etichetta}
              </button>
            ))}
          </div>

          <p className="usi-residui">
            {usiRimasti > 0
              ? `${usiRimasti} ${usiRimasti === 1 ? "uso gratuito rimasto" : "usi gratuiti rimasti"}`
              : "Usi gratuiti esauriti"}
          </p>
        </section>

        {/* Dorso centrale con l'indicatore di direzione */}
        <div className="dorso">
          <button
            type="button"
            className="indicatore-direzione"
            onClick={scambiaDirezione}
            aria-label={`Direzione attuale ${dir.etichetta}. Tocca per invertire.`}
            title="Inverti direzione"
          >
            {dir.etichetta}
          </button>
        </div>

        {/* Pagina destra: risultato */}
        <section className="pagina pagina-dx">
          <span className="etichetta-pagina">Risultato · {dir.dx}</span>
          <div className="campo-risultato" aria-live="polite">
            {errore ? (
              <p className="messaggio-errore">{errore}</p>
            ) : risultato ? (
              <p className="testo-risultato">{risultato}</p>
            ) : (
              <p className="placeholder-risultato">Il risultato apparirà qui.</p>
            )}
          </div>
        </section>
      </main>

      {/* Note */}
      {note.length > 0 && (
        <section className="note">
          <h2 className="titolo-note">Note</h2>
          <div className="griglia-note">
            {note.map((n, i) => (
              <article className="scheda-nota" key={i}>
                {n.titolo && <h3 className="nota-titolo">{n.titolo}</h3>}
                {n.spiegazione && <p className="nota-spiegazione">{n.spiegazione}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        Fjala usa l'intelligenza artificiale: rileggi sempre i testi importanti.
      </footer>
    </div>
  );
}
