// -- dichiarazione variabili globali --

// array che contiene tutte le domande ricevute dal server
let questions = [];
// indice della domanda corrente
let currentQuestionIndex = 0;
// variabile che contiene l' opzione selezionata dall' utente
let selectedOptionsIndex = null;

// -- funzioni --

//Funzione per mostrare il feedback modale
function showFeedback(type, title, message, duration = 2000){
  const modal = document.getElementById("feedback-modal");
  const titleEl = document.getElementById("feedback-title");
  const messageEl = document.getElementById("feedback-message");

  //Rimuovo classi precedenti
  modal.classList.remove("correct", "incorrect", "info");

  //Aggiungo la classe giusta in base al tipo
  modal.classList.add(type);

  //Imposto i testi 
  titleEl.textContent = title;
  messageEl.textContent = message;

  //Mostro il modale
  modal.classList.add("show");

  //Nascondo automaticamente dopo il tempo specificato
  setTimeout (()=> {
    modal.classList.remove("show");
  }, duration);
}

// funzione per iniziare il quiz

async function startQuiz() {
  try {
    // nascondo i risultati se visibili
    document.getElementById("results-screen").style.display = "none";

    // resetto l' indice della domanda corrente
    currentQuestionIndex = 0;

    // azzero la selezione
    selectedOptionsIndex = null;

    // faccio la richiesta al server per iniziare il quiz
    // chiamo POST/start per azzerare il punteggio
    const responseStart = await fetch("http://localhost:3000/start", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    // trasformo la risposta in json
    const dataStart = await responseStart.json();

    // faccio apparire in console il messaggio di punteggio azzerato
    console.log("Punteggio azzerato", dataStart);
    // Sostituisco l'alert con il feedback modale
    showFeedback("info", "Quiz Iniziato!", "Punteggio azzerato. Buona fortuna! 🍀", 1500);

    // richiesta al server per ottenere le domande
    const responseQuestions = await fetch("http://localhost:3000/questions");

    // trasformo la risposta in un json
    const domande = await responseQuestions.json();

    // salvo le domande nella variabile globale
    questions = domande;

    // Aspetto che il feedback scompaia prima di mostrare la prima domanda
    setTimeout(() => {
      // nascondo la schermata iniziale
      document.getElementById("start-screen").style.display = "none";
      // mostro la schermata del quiz (che contiene le domande)
      document.getElementById("quiz-screen").style.display = "block";
      // mostro la prima domanda
      showQuestion();
    }, 1600);
  } catch (error) {
    console.error("Errore nell' avvio del quiz", error);
    showFeedback("incorrect", "Errore", "Impossibile avviare il quiz!", 3000);
  }
}

// funzione per mostrare la domanda corrente
function showQuestion() {
  // prendo la domanda corrente dall' array delle domande
  const currentQuestion = questions[currentQuestionIndex];

  //Prendo il testo della domanda tramite la sua classe CSS
  const questionElement = document.getElementById("question-text");
  //Rimuovo la classe per resettare l'animazione
  questionElement.classList.remove("tracking-in-expand");
  //Aspetto un frame prima di ri-aggiungere la classe (così l'animaione riparte)
  setTimeout(()=>{
    questionElement.textContent = currentQuestion.question;
    questionElement.classList.add("tracking-in-expand");
  }, 10);

  

  /* svuoto il contenitore dalle opzioni precedenti.
  cioè rimuovo i bottoni delle opzioni precedenti.
  in caso contrario ad ogni nuova domanda comparirebbero i bottoni delle opzioni precedenti*/
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";

  /* //mostro il testo della domanda nell' elemento html
  document.getElementById("question-text").textContent = currentQuestion.question; */

  // Resetto la selezione (nessuna opzione selezionata ancora)
  selectedOptionsIndex = null;

  // creo ciclo per creare i bottoni delle opzioni
  currentQuestion.options.forEach((option, index) => {
    // creo bottone per ogni opzione
    const button = document.createElement("button");
    button.textContent = option;

    // aggiungo una classe css per lo stile
    button.classList.add("option-button");

    // creo event listener che gestisce il click sul bottone
    button.onclick = function () {
      //salvo quale opzione ha selezionato l' utente
      selectedOptionsIndex = index;

      //rimuovo la classe "selected" da tutti i bottoni
      document.querySelectorAll(".option-button").forEach((btn) => {
        btn.classList.remove("selected");
      });

      //aggiungo la classe "selected" al bottone cliccato
      button.classList.add("selected");
    };

    //aggiungo il bottone al contenitore delle opzioni
    optionsContainer.appendChild(button);
  });
}

// funzione submitAnswer per inviare la risposta al server
async function submitAnswer() {
  try {
    // controllo se l' utente ha selezionato un' opzione
    if (selectedOptionsIndex === null) {
      alert("Seleziona un' opzione prima di inviare la risposta");
      return;
    }
    // prendo la domande corrente
    const currentQuestion = questions[currentQuestionIndex];

    //invio la risposta al server tramite fetch POST
    const response = await fetch("http://localhost:3000/answers", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      /* il corpo della richiesta contiene l' id della domanda e l' opzione selezionata dall' utente
      json.stringify serve per trasformare l' oggetto in una stringa JSON */
      body: JSON.stringify({
        questionId: currentQuestion.id,
        selectedOption: selectedOptionsIndex,
      }),
    });

    //trasformo la risposta in JSON
    const result = await response.json();

    //mostriamo feedback all' utente
    if (result.correct) {
      showFeedback(
        "correct", 
        "Corretto! 🎉", 
        `Punteggio: ${result.punteggio}`, 
        2000
      );
    } else {
      showFeedback(
        "incorrect", 
        "Sbagliato! 😔", 
        `Punteggio: ${result.punteggio}`, 
        2000
      );
    }
    // Aspetto che il feedback scompaia prima di passare alla domanda successiva
    setTimeout(() => {

    // passo alla domanda successiva
    currentQuestionIndex++;

    // controllo se ci sono altre domande
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 2100);
 } catch (error) {
    console.error("Errore nell' invio della risposta", error);
    showFeedback("incorrect", "Errore", "Impossibile inviare la risposta!", 3000);
  }
}

// funzione per mostrare i risultati finali
async function showResults() {
  try {
    // faccio la richiesta al server per ottenere il punteggio finale
    const response = await fetch("http://localhost:3000/score");

    // trasformo la risposta in JSON
    const data = await response.json();

    //creo il messaggio con il punteggio
    const messaggio = `Hai totalizzato ${data.punteggio} punti su ${questions.length}!`;

    //nascondo la schermata del quiz
    document.getElementById("quiz-screen").style.display = "none";

    //mostro la schermata dei risultati
    document.getElementById("results-screen").style.display = "block";

    //mostro il messaggio con il punteggio finale
    document.getElementById("score-text").textContent = messaggio;
  } catch (error) {
    console.error("Errore durante il caricamento dei risultati:", error);
    alert("Errore: impossibile caricare i risultati!");
  }
}
