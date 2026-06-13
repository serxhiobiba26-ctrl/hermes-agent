// StudyKit — generatore di comandi di studio lato client.
// Nessuna chiamata ad API a pagamento: assembla il comando da incollare in un'AI gratuita.

const $ = (id) => document.getElementById(id);

const ISTRUZIONI = {
  riassunto:
    "Fammi un riassunto chiaro e ordinato di questo argomento, diviso in sezioni con titoli. " +
    "Evidenzia in grassetto i concetti chiave e usa elenchi puntati dove aiuta. " +
    "Spiega in modo semplice ma preciso, senza saltare i passaggi importanti.",
  flashcard:
    "Crea 15 flashcard da questo materiale, in formato 'Domanda → Risposta'. " +
    "Domande brevi e risposte di massimo 2 righe. Parti dai concetti più importanti. " +
    "Numera le flashcard.",
  quiz:
    "Crea un quiz di 10 domande a risposta multipla (4 opzioni A/B/C/D) su questo materiale. " +
    "Dammi prima tutte le domande, io risponderò con le lettere, poi correggi e spiega ogni errore. " +
    "Non darmi le risposte prima che io abbia risposto.",
  interrogazione:
    "Interrogami su questo materiale. Fammi UNA domanda alla volta e aspetta la mia risposta. " +
    "Dopo ogni mia risposta: dimmi se è corretta, correggi gli errori, aggiungi cosa mancava, " +
    "poi fammi la domanda successiva. Parti facile e aumenta gradualmente la difficoltà. Iniziamo.",
  mappa:
    "Crea una mappa concettuale testuale di questo argomento: concetto centrale, poi i rami principali " +
    "e i collegamenti tra le idee. Usa l'indentazione per mostrare la gerarchia, così posso ridisegnarla a mano.",
  spiegazione:
    "Spiegami questo argomento come se lo raccontassi a un compagno che non ha seguito la lezione. " +
    "Usa esempi concreti e un linguaggio semplice. Alla fine fammi una domanda per controllare se ho capito.",
  esercizio:
    "Ho caricato un esercizio. Non darmi solo la soluzione: guidami passo passo, " +
    "e a ogni passaggio spiegami il PERCHÉ si fa così, in modo che impari a risolverlo da solo la prossima volta.",
};

function costruisciPrompt() {
  const materia = $("materia").value.trim() || "la materia indicata";
  const argomento = $("argomento").value.trim();
  const livello = $("livello").value;
  const formato = $("formato").value;

  const contesto = argomento
    ? `Materia: ${materia}. Argomento: ${argomento}.`
    : `Materia: ${materia}.`;

  return (
    `Sei un tutor paziente e bravo a spiegare, per uno studente di ${livello}. ` +
    `${ISTRUZIONI[formato]}\n\n` +
    `${contesto}\n\n` +
    `Basati ESCLUSIVAMENTE sul materiale (foto/PDF/testo) che ho caricato in questa chat: ` +
    `appunti, pagine del libro o slide. Se un dato non è nel materiale, dimmelo invece di inventarlo. ` +
    `Rispondi in italiano.`
  );
}

$("genera").addEventListener("click", () => {
  const prompt = costruisciPrompt();
  $("prompt-text").textContent = prompt;
  $("output").classList.remove("hidden");
  $("output").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

$("copia").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("prompt-text").textContent);
    $("copia").textContent = "Copiato ✓";
    setTimeout(() => ($("copia").textContent = "Copia"), 1800);
  } catch {
    $("copia").textContent = "Seleziona e copia manualmente";
  }
});
