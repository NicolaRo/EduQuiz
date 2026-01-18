// express estende Node.js per gestire rotte, richieste http e middleware
let express = require("express");

// crea un applicazione express (cioè il server)
let app = express();

// uso static per accedere alla cartella "public" dove si trova index.html e style.css. questo metodo è utile anche per gestire immagini ed altri files statici.
app.use(express.static("public"));

// middleware per gestire il parsing del corpo delle richieste in formato JSON
app.use(express.json());

// creo la variabile domande in cui creo l' oggetto domande
let domande = [
  {
    id: 1,
    question: "Qual è la capitale d'Italia?",
    options: ["Milano", "Torino", "Venezia", "Roma"],
    answer: 3,
  },
  {
    id: 2,
    question: "In quale regione si trova la capitale d'Italia?",
    options: ["Lazio", "Veneto", "Molise", "Sicilia"],
    answer: 0,
  },
  {
    id: 3,
    question: "Quale altro Stato si trova all'interno della stessa regione?",
    options: ["San Marino", "Vaticano", "Repubblica di Salò", "Comune di Roma"],
    answer: 1,
  },
  {
    id: 4,
    question: "Qual è la lingua ufficiale Italiana?",
    options: ["Latino", "Romano", "Veneto", "Italiano"],
    answer: 3,
  },
];

// creo variabile punteggio inizializzata a 0, cosi da incrementarla dopo
let punteggio = 0;

// metodo get serve per ottenere le domande
app.get("/questions", function (req, res) {
  let allQuestions = domande.map((d) => ({
    id: d.id,
    question: d.question,
    options: d.options,
  }));

  res.json(allQuestions);
});

// POST /start -> inizia il test (azzera il punteggio)
app.post("/start", function (req, res) {
  // Azzeriamo il punteggio globale a 0
  punteggio = 0;

  res.json({
    message: "Test iniziato! Punteggio azzerato.",
    punteggio: punteggio,
  });
});

app.post("/answers", function (req, res) {
  // variabile che serve a recuperare l' id della domanda fatta all' utente
  let questionId = req.body.questionId;

  // variabile che serve a salvare la risposta scelta dall' utente
  let selectedOption = req.body.selectedOption;

  // tramite il metodo .find cerco la domanda che ha l' id uguale a questionID
  let domanda = domande.find((d) => d.id === questionId);

  // se la domanda non esiste restituisco un errore 404
  if (!domanda) {
    return res.status(404).json({ error: "DOMANDA NON TROVATA" });
  }

  // verifico che la risposta dell' utente sia corretta
  let correct = selectedOption === domanda.answer;
  if (correct) {
    punteggio++;
  }

  // restituisco la risposta se è corretta e il punteggio
  res.json({ correct: correct, punteggio: punteggio });
});

// GET /score -> ottiene il punteggio corrente
app.get("/score", function (req, res) {
  res.json({
    punteggio: punteggio,
  });
});

// creo un post per aggiungere delle nuove domande
app.post("/questions", function (req, res) {
  //creo una variabile dove ci saranno le nuove domande
  let { newQuestion, newOptions, newAnswer } = req.body;

  // aggiungo anche i controlli di sicurezza: nel caso i dati siano "undefined" restituisco un errore.
  if (!newQuestion || !newOptions || newAnswer === undefined) {
    return res.status(400).json({ error: "DATI DELLA NUOVA DOMANDA NON VALIDI" });
  }

  // aggiungo anche i controlli di sicurezza: nel caso i dati siano "undefined" restituisco un errore.
  if (!Array.isArray(newOptions) || newOptions.length < 2) {
    return res.status(400).json({ error: "LE OPZIONI DEVONO ESSERE ALMENO 2" });
  }

  // nel caso venga fornita un indice di risposta esatta non corretto (inferiore a 0 o maggiore del numero di opzioni) viene restituito un errore.
  if (typeof newAnswer !== "number" || newAnswer < 0 || newAnswer >= newOptions.length) {
    return res.status(400).json({ error: "L' INDICE DELLA RISPOSTA CORRETTA NON VALIDO" });
  }

  // creo una variabile che conta quante domande ci sono nell' array domande e aggiunge 1 all' id per ogni nuova domanda
  let newId = domande.length + 1;

  // creo un oggetto che contiene le nuove domande
  let questionObject = {
    id: newId,
    question: newQuestion,
    options: newOptions,
    answer: newAnswer,
  };

  // con push aggiungo le nuove domande all' array domande e visualizzo un messaggio di conferma
  domande.push(questionObject);
  res.json({ message: "NUOVA DOMANDA AGGIUNTA CON SUCCESSO", id: newId });
});

// imposto la porta su cui il server ascolterà le richieste
let PORT = 3000;
app.listen(PORT, function () {
  console.log("EduQuiz server avviato su http://localhost:" + PORT);
});
