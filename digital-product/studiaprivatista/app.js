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
     1) RISOLVI — calcolatrice sicura + generatore di prompt
     ========================================================= */

  // Valutatore aritmetico sicuro (shunting-yard, niente eval)
  function safeCalc(raw) {
    let s = String(raw).trim().replace(/,/g, ".").replace(/\s+/g, "");
    if (!s) return null;
    // solo cifre, operatori e parentesi: altrimenti non è un calcolo
    if (!/^[0-9.+\-*/^()]+$/.test(s)) return null;

    const tokens = s.match(/(\d+(\.\d+)?|[+\-*/^()])/g);
    if (!tokens || tokens.join("") !== s) return null;

    const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
    const right = { "^": true };
    const out = [], ops = [];
    let prev = null;

    for (let t of tokens) {
      if (/^\d/.test(t)) {
        out.push(parseFloat(t));
      } else if (t === "(") {
        ops.push(t);
      } else if (t === ")") {
        while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop());
        if (!ops.length) return null; // parentesi sbilanciate
        ops.pop();
      } else {
        // gestione meno/più unario → 0 davanti
        if ((t === "-" || t === "+") && (prev === null || prev === "(" || prec[prev])) {
          out.push(0);
        }
        while (
          ops.length &&
          prec[ops[ops.length - 1]] &&
          (right[t] ? prec[ops[ops.length - 1]] > prec[t] : prec[ops[ops.length - 1]] >= prec[t])
        ) {
          out.push(ops.pop());
        }
        ops.push(t);
      }
      prev = t;
    }
    while (ops.length) {
      const op = ops.pop();
      if (op === "(") return null;
      out.push(op);
    }

    const st = [];
    for (const tok of out) {
      if (typeof tok === "number") {
        st.push(tok);
      } else {
        const b = st.pop(), a = st.pop();
        if (a === undefined || b === undefined) return null;
        let r;
        if (tok === "+") r = a + b;
        else if (tok === "-") r = a - b;
        else if (tok === "*") r = a * b;
        else if (tok === "/") r = b === 0 ? null : a / b;
        else if (tok === "^") r = Math.pow(a, b);
        if (r === null || !isFinite(r)) return null;
        st.push(r);
      }
    }
    if (st.length !== 1) return null;
    return st[0];
  }

  function fmtNum(n) {
    const rounded = Math.round(n * 1e8) / 1e8;
    return rounded.toLocaleString("it-IT", { maximumFractionDigits: 8 });
  }

  const qInput = $("#q-input");
  const calcBox = $("#calc-result");

  function updateCalc() {
    const res = safeCalc(qInput.value);
    if (res === null) {
      calcBox.classList.add("hidden");
      return;
    }
    calcBox.innerHTML = "Risultato: <b>" + fmtNum(res) + "</b>";
    calcBox.classList.remove("hidden");
  }
  qInput.addEventListener("input", updateCalc);

  // Generatore di prompt
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

  /* ---- init ---- */
  renderDecks();
  renderFormule("");
})();
