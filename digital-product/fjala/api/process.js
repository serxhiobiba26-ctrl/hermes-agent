// Funzione serverless (Vercel) per Fjala.
// Chiama l'API Anthropic per tradurre, correggere o rendere naturale un testo
// tra italiano e albanese. La chiave resta SEGRETA qui sul server: si imposta
// nelle variabili d'ambiente del progetto Vercel come ANTHROPIC_API_KEY
// (non finisce mai nel codice pubblico).
//
// Riceve:  POST { text, direction, action }
//   direction: "it-al" | "al-it"
//   action:    "traduci" | "correggi" | "rendi-naturale"
// Risponde: { risultato: "...", note: [{ titolo, spiegazione }] }  oppure  { error: "..." }

const MODEL = "claude-sonnet-4-6";
const MAX_INPUT = 12000;

// Costruisce il prompt giusto in base ad azione e direzione.
function buildPrompt(action, direction, testo) {
  const partenza = direction === "al-it" ? "albanese" : "italiano";
  const arrivo = direction === "al-it" ? "italiano" : "albanese";

  if (action === "traduci") {
    return (
      `Sei un traduttore esperto italiano↔albanese. Traduci il testo seguente da ` +
      `${partenza} a ${arrivo}. La traduzione deve suonare naturale per un madrelingua, ` +
      `non letterale. Rispondi SOLO con un oggetto JSON valido con questa struttura: ` +
      `{ "risultato": "<traduzione>", "note": [{ "titolo": "...", "spiegazione": "..." }] }. ` +
      `In "note" metti al massimo 3 osservazioni su scelte di traduzione non ovvie ` +
      `(modi di dire, parole senza equivalente). Testo: """${testo}"""`
    );
  }

  if (action === "correggi") {
    return (
      `Sei un revisore esperto di ${partenza}. Correggi errori di grammatica, ortografia ` +
      `e punteggiatura nel testo seguente, mantenendo la stessa lingua e lo stesso significato. ` +
      `Rispondi SOLO con un oggetto JSON valido: { "risultato": "<testo corretto>", ` +
      `"note": [{ "titolo": "errore corretto", "spiegazione": "perché era sbagliato, in 1-2 frasi" }] }. ` +
      `Elenca in "note" ogni correzione rilevante (massimo 5). Testo: """${testo}"""`
    );
  }

  if (action === "rendi-naturale") {
    return (
      `Sei un madrelingua di ${partenza} con ottimo orecchio per lo stile. Riscrivi il testo ` +
      `seguente perché suoni naturale e scorrevole per un madrelingua, mantenendo la stessa lingua ` +
      `e lo stesso significato. Rispondi SOLO con un oggetto JSON valido: ` +
      `{ "risultato": "<versione naturale>", "note": [{ "titolo": "modifica", ` +
      `"spiegazione": "cosa è stato cambiato e perché" }] }. Massimo 5 note. Testo: """${testo}"""`
    );
  }

  return null;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Usa POST." });
    return;
  }

  // 1) Senza chiave non possiamo fare nulla: messaggio chiaro in italiano.
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({
      error:
        "Manca la chiave ANTHROPIC_API_KEY. Aggiungila su Vercel in Settings → " +
        "Environment Variables e poi fai un Redeploy del progetto.",
    });
    return;
  }

  try {
    // Body già in JSON su Vercel; gestiamo anche il caso stringa.
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const direction = body.direction === "al-it" ? "al-it" : "it-al";
    const action = body.action;
    const rawText = typeof body.text === "string" ? body.text : "";

    // 2) Valida testo e azione.
    const testo = rawText.trim().slice(0, MAX_INPUT);
    if (testo.length < 2) {
      res.status(400).json({ error: "Il testo è troppo corto: scrivi o incolla qualcosa da elaborare." });
      return;
    }

    const prompt = buildPrompt(action, direction, testo);
    if (!prompt) {
      res.status(400).json({ error: "Azione non valida. Usa: traduci, correggi oppure rendi-naturale." });
      return;
    }

    // 4) Chiamata all'API Anthropic.
    const apiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await apiResp.json();

    if (!apiResp.ok) {
      const msg =
        data && data.error && data.error.message
          ? data.error.message
          : "Il servizio AI ha restituito un errore. Riprova tra poco.";
      res.status(502).json({ error: msg });
      return;
    }

    // 5) Estrai i blocchi di testo, ripulisci eventuali backtick e fai il parse.
    const blocks = Array.isArray(data.content) ? data.content : [];
    let out = blocks
      .filter((b) => b && b.type === "text")
      .map((b) => b.text || "")
      .join("")
      .trim();

    // Rimuove un'eventuale recinzione ```json ... ```
    out = out.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(out);
    } catch {
      // Tentativo di recupero: estrai il primo oggetto JSON dal testo.
      const start = out.indexOf("{");
      const end = out.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        try {
          parsed = JSON.parse(out.slice(start, end + 1));
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed || typeof parsed.risultato !== "string") {
      res.status(502).json({ error: "Risposta inattesa dal servizio AI. Riprova." });
      return;
    }

    const note = Array.isArray(parsed.note)
      ? parsed.note
          .filter((n) => n && (n.titolo || n.spiegazione))
          .slice(0, 5)
          .map((n) => ({
            titolo: String(n.titolo || "").trim(),
            spiegazione: String(n.spiegazione || "").trim(),
          }))
      : [];

    res.status(200).json({ risultato: parsed.risultato, note });
  } catch (e) {
    // 6) Qualsiasi errore: messaggio in italiano.
    res.status(500).json({ error: "Errore interno: " + (e && e.message ? e.message : String(e)) });
  }
};
