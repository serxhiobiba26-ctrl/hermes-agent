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
    const tutor = !!(body && body.tutor);
    const task = body && body.task;
    const materia = body && body.materia ? String(body.materia).slice(0, 80) : "";
    const argomento = body && body.argomento ? String(body.argomento).slice(0, 200) : "";

    // Formato "risolutore": risposta BREVE e con i NUMERI.
    const FORMAT =
      "Rispondi in modo BREVE e con i NUMERI, NON con un tema discorsivo. " +
      "Prima leggi bene, poi ricontrolla i conti. Usa ESATTAMENTE questo formato, in italiano:\n" +
      "📝 Esercizio: (riscrivi l'esercizio com'è, con numeri e simboli)\n" +
      "🧮 Svolgimento: (i passaggi essenziali, uno per riga, con numeri/equazioni — niente frasi lunghe)\n" +
      "✅ Risposta: (solo il risultato finale, in numeri)\n" +
      "Vai dritto ai calcoli. Se ci sono più soluzioni, elencale tutte (es. x = 2; x = 3).";
    // Formato "socratico": guida con domande e passaggi, in italiano.
    const SOCRATIC =
      "Comportati come un tutor SOCRATICO, in italiano. Spiega il ragionamento passo per passo, " +
      "in modo semplice e con esempi, come faresti con uno studente che prende il diploma da privatista. " +
      "Aiutami a capire il PERCHÉ di ogni passaggio, non darmi solo il numero. " +
      "Alla fine scrivi comunque una riga \"✅ Risposta:\" con il risultato corretto.";

    let parts;
    if (task === "quiz") {
      const n = Math.min(10, Math.max(2, parseInt(body.n, 10) || 5));
      if (!argomento) { res.status(400).json({ error: "Manca l'argomento della verifica." }); return; }
      parts = [{ text:
        `Sei un professore. Prepara una mini-verifica di ${materia || "questa materia"} sull'argomento "${argomento}", ` +
        `per uno studente che prende il diploma di maturità da privatista. ` +
        `Scrivi ESATTAMENTE ${n} domande numerate (1., 2., …), chiare e brevi, di difficoltà crescente. ` +
        `Solo le domande, in italiano, SENZA soluzioni e senza commenti.` }];
    } else if (task === "grade") {
      const domande = body && body.domande ? String(body.domande).slice(0, 3000) : "";
      const risposte = body && body.risposte ? String(body.risposte).slice(0, 4000) : "";
      if (!domande || !risposte) { res.status(400).json({ error: "Mancano domande o risposte da correggere." }); return; }
      parts = [{ text:
        `Sei un professore che corregge una verifica di ${materia || "questa materia"}, in italiano. ` +
        `Per OGNI domanda: di' se la risposta è giusta o sbagliata, correggi in breve e indica la risposta corretta. ` +
        `Alla fine scrivi una riga "📊 Voto: X/10" e 2 consigli pratici per migliorare. Sii incoraggiante ma onesto.\n\n` +
        `DOMANDE:\n${domande}\n\nRISPOSTE DELLO STUDENTE:\n${risposte}` }];
    } else if (image && typeof image === "string") {
      const m = /^data:(.+?);base64,(.*)$/s.exec(image);
      const mimeType = m ? m[1] : "image/jpeg";
      const data = m ? m[2] : image;
      const prompt =
        "Sei un tutor di matematica per il diploma da privatista. Nell'immagine c'è un esercizio (anche scritto a mano). " +
        (tutor ? SOCRATIC : FORMAT) + "\nSe l'immagine non è leggibile, scrivi solo: \"Foto non leggibile: rifalla più nitida e dritta.\"\n" +
        (question ? "Nota dello studente: " + question + "\n" : "");
      parts = [{ text: prompt }, { inline_data: { mime_type: mimeType, data: data } }];
    } else if (text) {
      const prompt =
        "Sei un tutor di matematica per il diploma da privatista. Risolvi questo esercizio. " +
        (tutor ? SOCRATIC : FORMAT) + "\nEsercizio: " + text + "\n" +
        (question ? "Nota dello studente: " + question + "\n" : "");
      parts = [{ text: prompt }];
    } else {
      res.status(400).json({ error: "Nessun esercizio ricevuto (né foto né testo)." });
      return;
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
