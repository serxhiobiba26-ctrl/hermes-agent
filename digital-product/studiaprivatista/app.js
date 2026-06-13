/* ============================================================
   Studia da Privatista — logica della suite (zero dipendenze)
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* =========================================================
     TABS
     ========================================================= */
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => t.classList.remove("active"));
      $$(".panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      $("#panel-" + tab.dataset.tab).classList.add("active");
    });
  });

  /* =========================================================
     1) RISOLVI — risolutore matematico (nerdamer) + AI per le spiegazioni
     ========================================================= */
  const qInput = $("#q-input");
  const solveResult = $("#solve-result");

  // Carica uno script esterno su richiesta (fallback motore di calcolo + OCR)
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const sc = document.createElement("script");
      sc.src = src;
      sc.onload = resolve;
      sc.onerror = () => reject(new Error("script: " + src));
      document.head.appendChild(sc);
    });
  }

  // Assicura che nerdamer sia pronto: attende i file locali, poi ripiega su CDN
  let nerdamerReady = null;
  function ensureNerdamer() {
    if (typeof nerdamer !== "undefined") return Promise.resolve(true);
    if (nerdamerReady) return nerdamerReady;
    nerdamerReady = new Promise((resolve) => {
      let waited = 0;
      const iv = setInterval(() => {
        if (typeof nerdamer !== "undefined") { clearInterval(iv); resolve(true); return; }
        waited += 200;
        if (waited >= 2500) {
          clearInterval(iv);
          loadScript("https://cdn.jsdelivr.net/npm/nerdamer@1.1.13/all.min.js")
            .then(() => resolve(typeof nerdamer !== "undefined"))
            .catch(() => resolve(false));
        }
      }, 200);
    });
    return nerdamerReady;
  }

  // Funzione AI (Gemini, via serverless) — risolve foto o testo libero
  const AI_ENDPOINT = "/api/solve-photo";
  function nl2br(t) { return escapeHtml(t).replace(/\n/g, "<br>"); }
  async function solveWithAI(payload) {
    const resp = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (resp.status === 404 || resp.status === 405) throw new Error("nofunc");
    const j = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(j.error || "Errore dall'AI");
    return j.text || "";
  }

  // Capisce anche la scrittura "naturale": più, meno, per, diviso, x², radice di…
  function naturalize(raw) {
    let s = " " + String(raw).toLowerCase() + " ";
    const sup = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "^" + sup[c]);
    s = s
      .replace(/\b(quanto\s+fa|quanto\s+vale|calcola|risolvi(?:mi)?|risolvere|trova(?:mi)?|determina|il\s+valore\s+di|la\s+soluzione\s+di|equazione)\b/g, " ")
      .replace(/radice(?:\s+quadrata)?(?:\s+di)?\s*([0-9.]+)/g, "sqrt($1)")
      .replace(/\bal\s+quadrato\b/g, "^2")
      .replace(/\bal\s+cubo\b/g, "^3")
      .replace(/\belevato(?:\s+alla|\s+a)?\b/g, "^")
      // "più" ha l'accento: \b non funziona, uso delimitatori espliciti (non-lettere)
      .replace(/(^|[^a-zà-ÿ])pi(?:ù|u)(?=[^a-zà-ÿ]|$)/gi, "$1+")
      .replace(/\bmeno\b/g, "-")
      .replace(/\b(?:diviso(?:\s+per)?|fratto)\b/g, "/")
      .replace(/\b(?:moltiplicato\s+per|per|volte)\b/g, "*")
      .replace(/\buguale(?:\s+a)?\b/g, "=")
      .replace(/(\d+(?:\.\d+)?)\s*%/g, "($1/100)")
      .replace(/\b(?:il|lo|la|gli|le|uno|una|un)\b/g, " ")
      .replace(/\bdi\b/g, "*")
      .replace(/[?!]/g, " ");
    return s;
  }

  // Normalizza l'input per il motore di calcolo
  function normalizeMath(raw) {
    let s = String(raw).trim()
      .replace(/,/g, ".")            // virgola decimale → punto
      .replace(/[×·∙]/g, "*")
      .replace(/[÷:]/g, "/")
      .replace(/[–—−]/g, "-")
      .replace(/\s+/g, "");
    // moltiplicazione implicita: 2x → 2*x, 3(x+1) → 3*(x+1), )( → )*(, )2 → )*2
    s = s.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
    s = s.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");
    return s;
  }

  // Indovina la variabile (default x)
  function guessVar(s) {
    const cleaned = s.replace(/sqrt|diff|integrate|simplify|expand|factor|abs|sin|cos|tan|log|ln|pi/gi, "");
    const m = cleaned.match(/[a-z]/i);
    return m ? m[0].toLowerCase() : "x";
  }

  // Abbellisce l'output: * → ·, ^n → esponente, sqrt → √
  function pretty(t) {
    return String(t)
      .replace(/\*/g, "·")
      .replace(/\^\(([^)]+)\)/g, "<sup>$1</sup>")
      .replace(/\^(-?\d+(\.\d+)?)/g, "<sup>$1</sup>")
      .replace(/sqrt/g, "√");
  }
  function trimNum(d) {
    if (!d || d.indexOf(".") === -1) return d;
    return d.replace(/0+$/, "").replace(/\.$/, "");
  }

  function showSolve(html, kind) {
    solveResult.className = "solve-result" + (kind ? " " + kind : "");
    solveResult.innerHTML = html;
    solveResult.classList.remove("hidden");
  }

  async function runSolve() {
    const raw = qInput.value.trim();
    if (!raw) { showSolve("✏️ Scrivi prima un'operazione o un'equazione qui sopra.", "warn"); return; }
    if (typeof nerdamer === "undefined") {
      showSolve("⏳ Sto caricando il motore di calcolo…", "warn");
      const ok = await ensureNerdamer();
      if (!ok) { showSolve("⚠️ Non riesco a caricare il motore di calcolo. Controlla la connessione e ricarica la pagina (Ctrl/Cmd+R).", "warn"); return; }
    }
    let op = $("#q-op").value;
    const s = normalizeMath(naturalize(raw));
    if (!s) { showSolve("✏️ Scrivi un'operazione, ad esempio <code>x^2 - 5x + 6 = 0</code> oppure <code>radice di 144</code>.", "warn"); return; }
    const v = guessVar(s);
    if (op === "auto") op = s.includes("=") ? "solve" : "simplify";

    try {
      let label, value;
      if (op === "solve") {
        const arr = nerdamer.solve(s, v).toString().replace(/^\[|\]$/g, "");
        const parts = arr.length ? arr.split(",") : [];
        if (!parts.length) { showSolve("Non ho trovato soluzioni per questa equazione. Controlla la scrittura.", "warn"); return; }
        label = parts.length > 1 ? "Soluzioni" : "Soluzione";
        value = parts.map((p) => `${v} = <b>${pretty(p)}</b>`).join("<br>");
      } else if (op === "diff") {
        label = "Derivata";
        value = "<b>" + pretty(nerdamer("diff(" + s + "," + v + ")").toString()) + "</b>";
      } else if (op === "integrate") {
        label = "Integrale";
        value = "<b>" + pretty(nerdamer("integrate(" + s + "," + v + ")").toString()) + " + C</b>";
      } else if (op === "factor") {
        label = "Fattorizzazione";
        value = "<b>" + pretty(nerdamer.factor(s).toString()) + "</b>";
      } else if (op === "expand") {
        label = "Sviluppo";
        value = "<b>" + pretty(nerdamer("expand(" + s + ")").toString()) + "</b>";
      } else { // simplify / calcola
        let numeric = "";
        try {
          const ev = nerdamer(s).evaluate().toDecimal(10);
          if (ev !== undefined && /^-?\d/.test(ev) && !/[a-z]/i.test(ev)) numeric = trimNum(ev);
        } catch (e) {}
        const simplified = pretty(nerdamer("simplify(" + s + ")").toString());
        label = "Risultato";
        value = "<b>" + (numeric || simplified) + "</b>";
      }
      showSolve('<span class="sr-label">' + label + '</span><span class="sr-value">' + value + "</span>", "ok");
    } catch (err) {
      // Il motore locale non ce l'ha fatta: provo con l'AI (se configurata)
      showSolve("🤖 Il calcolo diretto non bastava: sto provando con l'AI…", "warn");
      try {
        const ans = await solveWithAI({ text: raw });
        showSolve('<span class="sr-label">Soluzione (AI)</span><span class="sr-value">' + nl2br(ans) + "</span>", "ok");
      } catch (e) {
        if (e.message === "nofunc") {
          showSolve("Non sono riuscito a risolverlo qui. Apri la spiegazione passo-passo con l'AI qui sotto 👇 (oppure attiva l'AI automatica seguendo AI-SETUP).", "warn");
        } else {
          showSolve("Non sono riuscito a contattare l'AI (" + (e.message || "errore") + "). Apri la spiegazione passo-passo qui sotto 👇", "warn");
        }
        const det = document.querySelector(".ai-fallback");
        if (det) det.open = true;
      }
    }
  }

  $("#solve-btn").addEventListener("click", runSolve);
  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runSolve(); }
  });

  // Generatore di prompt (fallback AI per spiegazioni e materie non matematiche)
  const MODI = {
    risolvi: (m, q) => `Sei un tutor di ${m} paziente e chiaro. Risolvi questo esercizio spiegando OGNI passaggio come faresti con uno studente che studia da privatista per il diploma. Alla fine scrivi la risposta finale evidenziata e un breve "perché funziona".\n\nEsercizio:\n${q}`,
    spiega: (m, q) => `Spiegami in modo semplicissimo, come se avessi 14 anni, questo argomento di ${m}. Usa un esempio concreto della vita quotidiana e una piccola analogia. Evita termini complicati; se ne usi uno, spiegalo subito.\n\nArgomento:\n${q}`,
    verifica: (m, q) => `Sono uno studente di ${m} che studia da privatista. Qui sotto c'è l'esercizio e la MIA soluzione. Controlla se è corretta: se c'è un errore, indicami esattamente dove e perché, poi mostrami la soluzione giusta passo-passo.\n\n${q}`,
    esercizi: (m, q) => `Crea 5 esercizi di ${m} simili a questo, di difficoltà crescente, pensati per chi prepara l'esame di Stato da privatista. Prima dammi solo i testi degli esercizi; poi, dopo una riga "--- SOLUZIONI ---", le soluzioni spiegate.\n\nEsercizio di riferimento:\n${q}`,
    riassunto: (m, q) => `Fammi un riassunto schematico e facile da memorizzare di questo argomento di ${m} per l'esame da privatista: concetti chiave in elenco puntato, date/formule importanti evidenziate e 3 possibili domande d'esame con risposta breve.\n\nArgomento:\n${q}`,
    interroga: (m, q) => `Fai l'interrogazione: facciamo una simulazione orale di ${m} su questo argomento. Fammi UNA domanda alla volta, aspetta la mia risposta, poi correggimi e dammi un voto da 1 a 10 con un consiglio. Inizia con una domanda facile e aumenta la difficoltà.\n\nArgomento:\n${q}`,
  };

  $("#gen-prompt").addEventListener("click", () => {
    const q = qInput.value.trim();
    const out = $("#prompt-out");
    if (!q) {
      out.classList.remove("hidden");
      $("#prompt-text").textContent = "✏️ Scrivi prima la tua domanda o esercizio qui sopra.";
      return;
    }
    const materia = $("#q-materia").value;
    const modo = $("#q-modo").value;
    $("#prompt-text").textContent = MODI[modo](materia, q);
    out.classList.remove("hidden");
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // Copia negli appunti (delegato)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const text = $("#" + btn.dataset.target).textContent;
    navigator.clipboard.writeText(text).then(() => {
      const old = btn.textContent;
      btn.textContent = "✓ Copiato";
      btn.classList.add("ok");
      setTimeout(() => { btn.textContent = old; btn.classList.remove("ok"); }, 1600);
    });
  });

  /* =========================================================
     1b) FOTO dell'esercizio — OCR sul sito + "risolvi con l'AI"
     ========================================================= */
  const photoInput = $("#photo-input");
  let photoURL = null;
  let tessPromise = null;
  function loadTesseract() {
    if (typeof Tesseract !== "undefined") return Promise.resolve();
    if (!tessPromise) tessPromise = loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
    return tessPromise;
  }

  if (photoInput) {
    $("#photo-pick").addEventListener("click", () => photoInput.click());

    photoInput.addEventListener("change", () => {
      const f = photoInput.files && photoInput.files[0];
      if (!f) return;
      if (photoURL) URL.revokeObjectURL(photoURL);
      photoURL = URL.createObjectURL(f);
      $("#photo-img").src = photoURL;
      $("#photo-preview").classList.remove("hidden");
      $("#photo-status").textContent = "";
      $("#photo-ai-box").classList.add("hidden");
    });

    $("#photo-clear").addEventListener("click", () => {
      if (photoURL) { URL.revokeObjectURL(photoURL); photoURL = null; }
      photoInput.value = "";
      $("#photo-preview").classList.add("hidden");
      $("#photo-status").textContent = "";
    });

    // Risolvi con l'AI: prepara l'istruzione pronta da incollare (la foto la allega l'utente)
    $("#photo-ai").addEventListener("click", () => {
      $("#photo-ai-text").textContent =
        "Ho fotografato un esercizio (immagine allegata). Per favore:\n" +
        "1) trascrivi l'esercizio che vedi nella foto;\n" +
        "2) risolvilo spiegando OGNI passaggio in modo semplice e chiaro;\n" +
        "3) scrivi la risposta finale evidenziata.\n" +
        "Sono uno studente che prepara il diploma di maturità da privatista.";
      $("#photo-ai-box").classList.remove("hidden");
      $("#photo-ai-box").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // Rimpicciolisce la foto prima di inviarla (più veloce e più economico)
    function fileToResizedDataURL(file, max, quality) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          let w = img.naturalWidth, h = img.naturalHeight;
          const big = Math.max(w, h);
          if (big > max) { const s = max / big; w = Math.round(w * s); h = Math.round(h * s); }
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          try { resolve(c.toDataURL("image/jpeg", quality)); } catch (e) { reject(e); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("immagine non valida")); };
        img.src = url;
      });
    }

    $("#photo-solve-ai").addEventListener("click", async () => {
      const f = photoInput.files && photoInput.files[0];
      if (!f) return;
      const status = $("#photo-status");
      const btn = $("#photo-solve-ai");
      btn.disabled = true;
      status.textContent = "🤖 Sto guardando la foto e risolvendo… (qualche secondo)";
      try {
        const dataURL = await fileToResizedDataURL(f, 1280, 0.85);
        const resp = await fetch(AI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataURL, question: qInput.value.trim() || undefined }),
        });
        if (resp.status === 404 || resp.status === 405) throw new Error("nofunc");
        const j = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(j.error || "Errore dall'AI");
        showSolve('<span class="sr-label">Soluzione dalla foto (AI)</span><span class="sr-value">' + nl2br(j.text || "") + "</span>", "ok");
        solveResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
        status.textContent = "";
      } catch (e) {
        if (e.message === "nofunc") {
          status.textContent = "L'AI automatica non è ancora attivata su questo sito. Per ora uso il metodo manuale qui sotto 👇";
          $("#photo-ai").click();
        } else {
          status.textContent = "Non sono riuscito a contattare l'AI (" + (e.message || "errore") + "). Riprova, oppure usa il metodo manuale.";
          $("#photo-ai").click();
        }
      } finally {
        btn.disabled = false;
      }
    });

    // OCR sperimentale: legge il testo dalla foto e lo mette nel riquadro
    $("#photo-ocr").addEventListener("click", async () => {
      const f = photoInput.files && photoInput.files[0];
      if (!f) return;
      const status = $("#photo-status");
      const btn = $("#photo-ocr");
      btn.disabled = true;
      status.textContent = "⏳ Carico il lettore di testo (solo la prima volta)…";
      try {
        await loadTesseract();
        status.textContent = "🔎 Sto leggendo la foto… può metterci qualche secondo.";
        const worker = await Tesseract.createWorker("ita+eng");
        const { data } = await worker.recognize(f);
        await worker.terminate();
        const text = (data && data.text ? data.text : "").replace(/\s*\n\s*/g, " ").trim();
        if (!text) {
          status.textContent = "Non sono riuscito a leggere testo dalla foto. Prova con una foto più nitida, oppure usa “Risolvi con l'AI”.";
        } else {
          qInput.value = text;
          status.textContent = "✓ Testo letto e inserito qui sopra. Controllalo e premi Risolvi.";
          qInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } catch (e) {
        status.textContent = "Lettura non riuscita (serve la connessione per scaricare il lettore). Usa “Risolvi con l'AI”.";
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* =========================================================
     2) MEMORIZZA — flashcard con ripetizione dilazionata (SM-2 lite)
     ========================================================= */
  const DAY = 86400000;
  const todayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };

  const loadJSON = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };
  const saveJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  function allDecks() {
    const custom = loadJSON("sp_custom_decks", []);
    return [...window.STARTER_DECKS, ...custom];
  }

  function getProgress() { return loadJSON("sp_progress", {}); }
  function cardState(prog, deckId, idx) {
    const key = deckId + "::" + idx;
    return prog[key] || { ef: 2.5, interval: 0, due: 0, reps: 0 };
  }
  function dueCount(deck) {
    const prog = getProgress();
    const now = todayStart();
    let n = 0;
    deck.cards.forEach((_, i) => { if (cardState(prog, deck.id, i).due <= now) n++; });
    return n;
  }

  function renderDecks() {
    const list = $("#deck-list");
    list.innerHTML = "";
    allDecks().forEach((deck) => {
      const due = dueCount(deck);
      const el = document.createElement("div");
      el.className = "deck";
      el.innerHTML =
        `<h3>${escapeHtml(deck.name)}</h3>` +
        `<div class="deck-meta">${deck.cards.length} carte</div>` +
        `<span class="due-pill ${due ? "" : "none"}">${due ? due + " da ripassare" : "tutto ripassato ✓"}</span>`;
      el.addEventListener("click", () => startStudy(deck));
      list.appendChild(el);
    });
  }

  let session = null; // { deck, queue:[idx], current }

  function startStudy(deck) {
    const prog = getProgress();
    const now = todayStart();
    const queue = [];
    deck.cards.forEach((_, i) => { if (cardState(prog, deck.id, i).due <= now) queue.push(i); });
    if (!queue.length) { renderDecks(); return; }
    // mescola
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    session = { deck, queue, current: null, total: queue.length, done: 0 };
    $("#deck-list").classList.add("hidden");
    $(".add-cards").classList.add("hidden");
    $("#study-area").classList.remove("hidden");
    $("#study-done").classList.add("hidden");
    nextCard();
  }

  function nextCard() {
    const flashcard = $("#flashcard");
    if (!session.queue.length) {
      flashcard.classList.add("hidden");
      $("#reveal-btn").classList.add("hidden");
      $("#rate-row").classList.add("hidden");
      $("#study-done").classList.remove("hidden");
      $("#study-progress").textContent = "";
      renderDecks();
      return;
    }
    session.current = session.queue.shift();
    const card = session.deck.cards[session.current];
    $("#fc-front").textContent = card[0];
    $("#fc-back").textContent = card[1];
    $("#fc-back").classList.add("hidden");
    flashcard.classList.remove("hidden");
    $("#reveal-btn").classList.remove("hidden");
    $("#rate-row").classList.add("hidden");
    $("#study-progress").textContent = `${session.done} / ${session.total}`;
  }

  $("#reveal-btn").addEventListener("click", () => {
    $("#fc-back").classList.remove("hidden");
    $("#reveal-btn").classList.add("hidden");
    $("#rate-row").classList.remove("hidden");
  });

  $$(".rate").forEach((b) => {
    b.addEventListener("click", () => {
      const q = parseInt(b.dataset.q, 10);
      const prog = getProgress();
      const key = session.deck.id + "::" + session.current;
      const st = cardState(prog, session.deck.id, session.current);

      if (q < 3) {
        st.reps = 0;
        st.interval = 0;
        st.due = todayStart(); // resta da rivedere
        session.queue.push(session.current); // rivedila ora nella sessione
      } else {
        st.reps += 1;
        st.ef = Math.max(1.3, st.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
        if (st.reps === 1) st.interval = 1;
        else if (st.reps === 2) st.interval = 6;
        else st.interval = Math.round(st.interval * st.ef);
        st.due = todayStart() + st.interval * DAY;
        session.done += 1;
      }
      prog[key] = st;
      saveJSON("sp_progress", prog);
      nextCard();
    });
  });

  $("#exit-study").addEventListener("click", backToDecks);
  $("#done-back").addEventListener("click", backToDecks);
  function backToDecks() {
    session = null;
    $("#study-area").classList.add("hidden");
    $("#deck-list").classList.remove("hidden");
    $(".add-cards").classList.remove("hidden");
    renderDecks();
  }

  // Crea il tuo mazzo
  $("#add-card-btn").addEventListener("click", () => {
    const name = $("#new-deck-name").value.trim();
    const front = $("#new-card-front").value.trim();
    const back = $("#new-card-back").value.trim();
    const msg = $("#add-card-msg");
    if (!name || !front || !back) { msg.textContent = "Compila nome mazzo, fronte e retro."; return; }

    const custom = loadJSON("sp_custom_decks", []);
    const id = "custom-" + slug(name);
    let deck = custom.find((d) => d.id === id);
    if (!deck) { deck = { id, name, cards: [] }; custom.push(deck); }
    deck.cards.push([front, back]);
    saveJSON("sp_custom_decks", custom);

    $("#new-card-front").value = "";
    $("#new-card-back").value = "";
    msg.textContent = `✓ Aggiunta a "${name}" (${deck.cards.length} carte).`;
    renderDecks();
  });

  /* =========================================================
     3) FORMULARIO — ricerca
     ========================================================= */
  function renderFormule(filter) {
    const cont = $("#formula-list");
    const f = (filter || "").toLowerCase().trim();
    cont.innerHTML = "";
    let any = false;
    window.FORMULE.forEach((g) => {
      const matches = g.items.filter(
        ([name, val]) =>
          !f || name.toLowerCase().includes(f) || val.toLowerCase().includes(f) || g.group.toLowerCase().includes(f)
      );
      if (!matches.length) return;
      any = true;
      const groupEl = document.createElement("div");
      groupEl.className = "formula-group";
      groupEl.innerHTML = `<h3>${escapeHtml(g.group)}</h3>`;
      matches.forEach(([name, val]) => {
        const row = document.createElement("div");
        row.className = "formula-row";
        row.innerHTML = `<span class="f-name">${escapeHtml(name)}</span><span class="f-val">${escapeHtml(val)}</span>`;
        groupEl.appendChild(row);
      });
      cont.appendChild(groupEl);
    });
    if (!any) cont.innerHTML = `<p class="no-results">Nessuna formula trovata per "${escapeHtml(filter)}".</p>`;
  }
  $("#formula-search").addEventListener("input", (e) => renderFormule(e.target.value));

  /* ---- util ---- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function slug(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /* =========================================================
     4) ZAINO — i tuoi file salvati nel browser (IndexedDB)
     ========================================================= */
  const bagAdd = $("#bag-add");
  if (bagAdd && "indexedDB" in window) {
    const DB_NAME = "sp_zaino", STORE = "files";

    function openDB() {
      return new Promise((res, rej) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = () => { r.result.createObjectStore(STORE, { keyPath: "id" }); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    }
    async function bagAll() {
      const d = await openDB();
      return new Promise((res, rej) => {
        const req = d.transaction(STORE, "readonly").objectStore(STORE).getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
      });
    }
    async function bagPut(item) {
      const d = await openDB();
      return new Promise((res, rej) => {
        const t = d.transaction(STORE, "readwrite");
        t.objectStore(STORE).put(item);
        t.oncomplete = () => res();
        t.onerror = () => rej(t.error);
      });
    }
    async function bagDel(id) {
      const d = await openDB();
      return new Promise((res, rej) => {
        const t = d.transaction(STORE, "readwrite");
        t.objectStore(STORE).delete(id);
        t.oncomplete = () => res();
        t.onerror = () => rej(t.error);
      });
    }

    function fmtSize(n) {
      if (n < 1024) return n + " B";
      if (n < 1048576) return (n / 1024).toFixed(0) + " KB";
      return (n / 1048576).toFixed(1) + " MB";
    }
    function iconFor(type) {
      if (/image/.test(type)) return "🖼️";
      if (/pdf/.test(type)) return "📕";
      if (/word|document|text/.test(type)) return "📄";
      return "📎";
    }

    async function renderBag() {
      const list = $("#bag-list"), info = $("#bag-info");
      let items;
      try { items = await bagAll(); }
      catch { info.textContent = "Archiviazione non disponibile in questo browser."; return; }
      items.sort((a, b) => b.date - a.date);
      if (!items.length) {
        list.innerHTML = '<p class="no-results">Ancora nessun file. Aggiungi foto, PDF o appunti: resteranno qui, sul tuo dispositivo.</p>';
        info.textContent = "";
        return;
      }
      const total = items.reduce((s, i) => s + (i.size || 0), 0);
      info.textContent = items.length + " file · " + fmtSize(total);
      list.innerHTML = "";
      items.forEach((it) => {
        const el = document.createElement("div");
        el.className = "bag-item";
        el.innerHTML =
          '<span class="bag-ic">' + iconFor(it.type) + "</span>" +
          '<div class="bag-meta"><span class="bag-name">' + escapeHtml(it.name) + "</span>" +
          '<span class="muted small">' + fmtSize(it.size) + " · " + new Date(it.date).toLocaleDateString("it-IT") + "</span></div>" +
          '<button class="link-btn bag-open" type="button">Apri</button>' +
          '<button class="link-btn bag-del" type="button">Elimina</button>';
        el.querySelector(".bag-open").addEventListener("click", () => {
          const url = URL.createObjectURL(it.blob);
          window.open(url, "_blank");
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        });
        el.querySelector(".bag-del").addEventListener("click", async () => {
          await bagDel(it.id);
          renderBag();
        });
        list.appendChild(el);
      });
    }

    const bagInput = $("#bag-input");
    bagAdd.addEventListener("click", () => bagInput.click());
    bagInput.addEventListener("change", async () => {
      const files = Array.from(bagInput.files || []);
      for (const f of files) {
        if (f.size > 25 * 1048576) { $("#bag-info").textContent = '"' + f.name + '" è troppo grande (max 25 MB).'; continue; }
        await bagPut({
          id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
          name: f.name, type: f.type, size: f.size, date: Date.now(), blob: f,
        });
      }
      bagInput.value = "";
      renderBag();
    });

    renderBag();
  }

  /* ---- init ---- */
  renderDecks();
  renderFormule("");
})();
