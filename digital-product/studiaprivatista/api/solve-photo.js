// Funzione serverless (Vercel) — "capisci e risolvi" una foto con Google Gemini.
// La chiave resta SEGRETA qui sul server: si imposta nelle variabili d'ambiente
// del progetto Vercel come GEMINI_API_KEY (non finisce mai nel codice pubblico).
//
// Riceve:  POST { image: "data:image/jpeg;base64,...", question?: "testo" }
// Risponde: { text: "soluzione passo-passo" }  oppure  { error: "..." }

const MODEL = "gemini-2.0-flash";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Usa POST." });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Manca la chiave: imposta GEMINI_API_KEY nelle variabili d'ambiente del progetto." });
    return;
  }

  try {
    // Body già in JSON su Vercel; gestiamo anche il caso stringa.
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const image = body && body.image;
    const question = body && body.question ? String(body.question).slice(0, 500) : "";

    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "Nessuna immagine ricevuta." });
      return;
    }

    const m = /^data:(.+?);base64,(.*)$/s.exec(image);
    const mimeType = m ? m[1] : "image/jpeg";
    const data = m ? m[2] : image;

    // Un solo modello, ma istruito a comportarsi come una piccola squadra:
    // LETTORE (trascrive) → RISOLUTORE (spiega) → CONTROLLORE (verifica).
    const prompt =
      "Sei un tutor che aiuta uno studente a prendere il diploma di maturità da privatista. " +
      "Nell'immagine c'è un esercizio o una domanda (può essere stampato o scritto a mano). " +
      "Lavora in tre fasi, come una piccola squadra di assistenti:\n" +
      "1) LETTORE: trascrivi fedelmente ciò che vedi nell'immagine.\n" +
      "2) RISOLUTORE: risolvi spiegando OGNI passaggio in modo semplice e chiaro, in italiano.\n" +
      "3) CONTROLLORE: ricontrolla i calcoli e correggi eventuali errori.\n" +
      "Alla fine scrivi una riga che inizia con \"✅ Risposta:\" con il risultato finale.\n" +
      "Se l'immagine non è leggibile, dillo chiaramente e spiega cosa rifotografare.\n" +
      (question ? "Nota dello studente: " + question + "\n" : "");

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      MODEL + ":generateContent?key=" + encodeURIComponent(key);

    const apiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: data } }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
      }),
    });

    const j = await apiResp.json();
    if (!apiResp.ok) {
      const msg = (j && j.error && j.error.message) ? j.error.message : "Errore dal servizio AI.";
      res.status(502).json({ error: msg });
      return;
    }

    const parts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
    const text = parts ? parts.map((p) => p.text || "").join("").trim() : "";
    res.status(200).json({ text: text || "Non sono riuscito a leggere la foto. Riprova con una foto più nitida." });
  } catch (e) {
    res.status(500).json({ error: "Errore interno: " + (e && e.message ? e.message : String(e)) });
  }
};
