// ImmoAI Kit — generatore di prompt lato client.
// Nessuna chiamata ad API a pagamento: assembla il prompt da incollare in un'AI gratuita.

const $ = (id) => document.getElementById(id);

const ISTRUZIONI = {
  annuncio:
    "Scrivi un annuncio immobiliare per un portale (tipo Immobiliare.it o Idealista). " +
    "Struttura: un titolo accattivante (max 60 caratteri), un paragrafo di apertura che crea desiderio, " +
    "un elenco puntato dei punti di forza, una chiusura con invito a contattare l'agenzia. " +
    "Lunghezza 120-180 parole. Niente promesse non verificabili.",
  instagram:
    "Scrivi un post per Instagram/Facebook che promuova questo immobile. " +
    "Inizia con un gancio nella prima riga, usa frasi brevi, inserisci 1-2 emoji pertinenti, " +
    "chiudi con una call to action ('Scrivimi in DM per la visita') e proponi 8 hashtag locali pertinenti. " +
    "Tono adatto ai social, max 120 parole.",
  email:
    "Scrivi un'email da inviare alla mia lista di contatti per presentare questo immobile. " +
    "Includi: oggetto dell'email (max 50 caratteri, invogliante), saluto, corpo che valorizza l'immobile, " +
    "una sola call to action chiara per prenotare la visita. Tono cordiale e professionale, max 160 parole.",
  whatsapp:
    "Scrivi un messaggio WhatsApp breve e personale da inviare a un cliente potenzialmente interessato. " +
    "Massimo 60 parole, tono diretto e amichevole, una sola domanda finale per stimolare la risposta. " +
    "Niente formattazione complicata.",
};

function costruisciPrompt() {
  const tipo = $("tipo").value.trim() || "immobile";
  const zona = $("zona").value.trim() || "zona non specificata";
  const mq = $("mq").value.trim();
  const prezzo = $("prezzo").value.trim();
  const caratteristiche = $("caratteristiche").value.trim();
  const formato = $("formato").value;
  const tono = $("tono").value;

  const dettagli = [
    `- Tipologia: ${tipo}`,
    `- Zona: ${zona}`,
    mq ? `- Superficie: ${mq} mq` : null,
    prezzo ? `- Prezzo: ${prezzo}` : null,
    caratteristiche ? `- Caratteristiche: ${caratteristiche}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    `Sei un copywriter immobiliare esperto. ${ISTRUZIONI[formato]}\n\n` +
    `Usa un tono ${tono}.\n\n` +
    `Dati dell'immobile:\n${dettagli}\n\n` +
    `Restituisci solo il testo finale, pronto da pubblicare, in italiano.`
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
