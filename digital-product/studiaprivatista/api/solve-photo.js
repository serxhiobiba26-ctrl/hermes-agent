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
    const text = body && body.text ? String(body.text).slice(0, 2000) : "";
    const question = body && body.question ? String(body.question).slice(0, 500) : "";

    if ((!image || typeof image !== "string") && !text) {
      res.status(400).json({ error: "Nessun esercizio ricevuto (né foto né testo)." });
      return;
    }

    // Formato comune: risposta BREVE e con i NUMERI, non un tema discorsivo.
    const FORMAT =
      "Rispondi in modo BREVE e con i NUMERI, NON con un tema discorsivo. " +
      "Prima leggi bene, poi ricontrolla i conti. Usa ESATTAMENTE questo formato, in italiano:\n" +
      "📝 Esercizio: (riscrivi l'esercizio com'è, con numeri e simboli)\n" +
      "🧮 Svolgimento: (i passaggi essenziali, uno per riga, con numeri/equazioni — niente frasi lunghe)\n" +
      "✅ Risposta: (solo il risultato finale, in numeri)\n" +
      "Vai dritto ai calcoli. Se ci sono più soluzioni, elencale tutte (es. x = 2; x = 3).";

    let parts;
    if (image && typeof image === "string") {
      const m = /^data:(.+?);base64,(.*)$/s.exec(image);
      const mimeType = m ? m[1] : "image/jpeg";
      const data = m ? m[2] : image;
      const prompt =
        "Sei un tutor di matematica per il diploma da privatista. Nell'immagine c'è un esercizio (anche scritto a mano). " +
        FORMAT + "\nSe l'immagine non è leggibile, scrivi solo: \"Foto non leggibile: rifalla più nitida e dritta.\"\n" +
        (question ? "Nota dello studente: " + question + "\n" : "");
      parts = [{ text: prompt }, { inline_data: { mime_type: mimeType, data: data } }];
    } else {
      const prompt =
        "Sei un tutor di matematica per il diploma da privatista. Risolvi questo esercizio. " +
        FORMAT + "\nEsercizio: " + text + "\n" +
        (question ? "Nota dello studente: " + question + "\n" : "");
      parts = [{ text: prompt }];
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      MODEL + ":generateContent?key=" + encodeURIComponent(key);

    const apiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      }),
    });

    const j = await apiResp.json();
    if (!apiResp.ok) {
      const msg = (j && j.error && j.error.message) ? j.error.message : "Errore dal servizio AI.";
      res.status(502).json({ error: msg });
      return;
    }

    const outParts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
    const outText = outParts ? outParts.map((p) => p.text || "").join("").trim() : "";
    res.status(200).json({ text: outText || "Non sono riuscito a risolverlo. Riprova con una foto più nitida o riscrivi l'esercizio." });
  } catch (e) {
    res.status(500).json({ error: "Errore interno: " + (e && e.message ? e.message : String(e)) });
  }
};
