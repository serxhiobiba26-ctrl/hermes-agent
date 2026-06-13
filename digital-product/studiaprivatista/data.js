/* ============================================================
   Studia da Privatista — dati statici
   FORMULE: formulario consultabile
   DECKS:   mazzi di flashcard di partenza
   Tutto in italiano, fatti verificati e di uso comune all'esame.
   ============================================================ */

window.FORMULE = [
  {
    group: "Matematica — Geometria piana",
    items: [
      ["Area del quadrato", "A = l²"],
      ["Area del rettangolo", "A = b × h"],
      ["Area del triangolo", "A = (b × h) / 2"],
      ["Area del trapezio", "A = ((B + b) × h) / 2"],
      ["Area del cerchio", "A = π × r²"],
      ["Circonferenza", "C = 2 × π × r"],
      ["Teorema di Pitagora", "i² = c₁² + c₂²"],
      ["Area del rombo", "A = (d₁ × d₂) / 2"],
    ],
  },
  {
    group: "Matematica — Algebra",
    items: [
      ["Equazione di 2° grado", "x = (−b ± √(b²−4ac)) / 2a"],
      ["Discriminante (Δ)", "Δ = b² − 4ac"],
      ["Prodotto notevole (somma)", "(a + b)² = a² + 2ab + b²"],
      ["Prodotto notevole (differenza)", "(a − b)² = a² − 2ab + b²"],
      ["Differenza di quadrati", "a² − b² = (a + b)(a − b)"],
      ["Proprietà potenze (prodotto)", "aᵐ × aⁿ = aᵐ⁺ⁿ"],
      ["Proprietà potenze (quoziente)", "aᵐ / aⁿ = aᵐ⁻ⁿ"],
      ["Logaritmo (definizione)", "log_b(x) = y  ⇔  bʸ = x"],
    ],
  },
  {
    group: "Matematica — Analisi",
    items: [
      ["Derivata di xⁿ", "f'(x) = n × xⁿ⁻¹"],
      ["Derivata del prodotto", "(f·g)' = f'g + fg'"],
      ["Derivata del seno", "(sin x)' = cos x"],
      ["Derivata del coseno", "(cos x)' = −sin x"],
      ["Integrale di xⁿ", "∫xⁿ dx = xⁿ⁺¹/(n+1) + C"],
      ["Limite notevole", "lim(x→0) sin(x)/x = 1"],
    ],
  },
  {
    group: "Fisica — Cinematica e dinamica",
    items: [
      ["Velocità media", "v = Δs / Δt"],
      ["Accelerazione", "a = Δv / Δt"],
      ["Moto uniformemente accelerato", "s = s₀ + v₀t + ½at²"],
      ["Secondo principio (Newton)", "F = m × a"],
      ["Forza peso", "P = m × g   (g ≈ 9,81 m/s²)"],
      ["Energia cinetica", "Eₖ = ½ × m × v²"],
      ["Energia potenziale", "Eₚ = m × g × h"],
      ["Lavoro", "L = F × s × cos(θ)"],
      ["Legge di Ohm", "V = R × I"],
      ["Potenza elettrica", "P = V × I"],
    ],
  },
  {
    group: "Chimica e Scienze",
    items: [
      ["Mole", "n = m / M"],
      ["Densità", "d = m / V"],
      ["Concentrazione molare", "M = n / V(L)"],
      ["pH", "pH = −log[H⁺]"],
      ["Legge dei gas perfetti", "p × V = n × R × T"],
    ],
  },
  {
    group: "Inglese — Tempi verbali (regola base)",
    items: [
      ["Present Simple", "Soggetto + verbo (+s alla 3ª sing.)"],
      ["Present Continuous", "am/is/are + verbo-ing"],
      ["Past Simple (reg.)", "verbo + -ed"],
      ["Present Perfect", "have/has + participio passato"],
      ["Future (will)", "will + forma base del verbo"],
      ["Be going to", "am/is/are going to + verbo"],
      ["First Conditional", "If + present, … will + verbo"],
      ["Second Conditional", "If + past, … would + verbo"],
    ],
  },
  {
    group: "Italiano — Figure retoriche",
    items: [
      ["Metafora", "Paragone senza 'come' (es. sei un leone)"],
      ["Similitudine", "Paragone con 'come/simile a'"],
      ["Anafora", "Ripetizione a inizio di versi/frasi"],
      ["Allitterazione", "Ripetizione di suoni uguali"],
      ["Iperbole", "Esagerazione voluta"],
      ["Ossimoro", "Due termini opposti accostati"],
      ["Climax", "Successione crescente di intensità"],
    ],
  },
];

/* ---- Mazzi di flashcard di partenza ---- */
window.STARTER_DECKS = [
  {
    id: "storia-900",
    name: "Storia — date chiave del '900",
    cards: [
      ["Inizio Prima guerra mondiale", "1914"],
      ["Fine Prima guerra mondiale", "1918"],
      ["Rivoluzione russa", "1917"],
      ["Marcia su Roma (Mussolini al potere)", "1922"],
      ["Crollo di Wall Street", "1929"],
      ["Inizio Seconda guerra mondiale", "1939"],
      ["Fine Seconda guerra mondiale", "1945"],
      ["Liberazione d'Italia (25 aprile)", "1945"],
      ["Nascita della Repubblica Italiana", "1946"],
      ["Entrata in vigore della Costituzione", "1948"],
      ["Caduta del Muro di Berlino", "1989"],
      ["Nascita dell'Unione Europea (Maastricht)", "1992"],
    ],
  },
  {
    id: "civica",
    name: "Educazione civica",
    cards: [
      ["Quanti sono gli articoli della Costituzione?", "139"],
      ["Articolo 1 della Costituzione", "L'Italia è una Repubblica democratica fondata sul lavoro"],
      ["Le tre funzioni dello Stato", "Legislativa, esecutiva, giudiziaria"],
      ["Chi esercita il potere legislativo?", "Il Parlamento (Camera e Senato)"],
      ["Chi è il Capo dello Stato?", "Il Presidente della Repubblica"],
      ["Durata in carica del Presidente della Repubblica", "7 anni"],
      ["Le due camere del Parlamento", "Camera dei Deputati e Senato della Repubblica"],
      ["Cos'è l'ONU?", "Organizzazione delle Nazioni Unite (pace e cooperazione)"],
    ],
  },
  {
    id: "inglese-verbi",
    name: "Inglese — verbi irregolari",
    cards: [
      ["go (past – participle)", "went – gone"],
      ["do (past – participle)", "did – done"],
      ["have (past – participle)", "had – had"],
      ["make (past – participle)", "made – made"],
      ["take (past – participle)", "took – taken"],
      ["see (past – participle)", "saw – seen"],
      ["come (past – participle)", "came – come"],
      ["give (past – participle)", "gave – given"],
      ["write (past – participle)", "wrote – written"],
      ["speak (past – participle)", "spoke – spoken"],
    ],
  },
  {
    id: "scienze",
    name: "Scienze — concetti base",
    cards: [
      ["Unità di base degli esseri viventi", "La cellula"],
      ["Processo con cui le piante producono nutrimento", "Fotosintesi clorofilliana"],
      ["Molecola che contiene l'informazione genetica", "DNA"],
      ["Simbolo chimico dell'acqua", "H₂O"],
      ["Numero atomico = numero di…", "Protoni"],
      ["Forza che attira i corpi verso la Terra", "Gravità"],
      ["Stati della materia", "Solido, liquido, aeriforme"],
    ],
  },
];
