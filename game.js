let boardInitialized = false;
let firstCard=null, secondCard=null;
let lockBoard=false;
let score=0;
let cards=[];
let timer=30;
let timerInterval=null;


document.querySelector(".score").textContent = '--';
document.querySelector(".timer").textContent = timer;
if (getHighScore() === null) {
    document.querySelector(".high_score").textContent = '--';
} else{
    document.querySelector(".high_score").textContent = getHighScore();
}
  


document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        const data = await (await fetch('./data/cards.json')).json();
        cards = [...data, ...data];
        shuffleCards();
    })();
});

function setHighScore(score) {
  let currentHigh = getHighScore();

  // If first time, create the key
  if (currentHigh === null) {
    localStorage.setItem("highScore", score);
    return;
  }

  // Otherwise compare and update
  if (score < currentHigh) {
    localStorage.setItem("highScore", score);
  }
}

function getHighScore() {
  const stored = localStorage.getItem("highScore");
  return stored === null ? null : Number(stored);
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;
  if (this.classList.contains('matched')) return;

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  document.querySelector(".score").textContent = score;
  lockBoard = true;
  checkMatch();
}

function initBoard() {
  const cardElems = document.querySelectorAll('.card');

  lockBoard = true;
  firstCard = null;
  secondCard = null;

  cardElems.forEach((cardElem, i) => {
        
    // temporarily disable the flip transition on the inner element
    const inner = cardElem.querySelector('.card-inner');
    if (inner) inner.style.transition = 'none';

    // clear previous visual state
    cardElem.classList.remove('flipped', 'matched');

    const back = cardElem.querySelector('.back');
    const entry = cards[i];
    const src = entry && typeof entry.image === "string"
      ? entry.image
      : 'back-card.png';

    const name = entry && typeof entry.name === "string"
      ? entry.name
      : src;

    // set data-name on the card element (not on back) so dataset is accessible on the card
    cardElem.setAttribute('data-name', name);

    // hide image until it's loaded to avoid flashes
    back.innerHTML = `<img src="${src}" style="visibility:hidden" onload="this.style.visibility='visible'">`;

    // fill back image
    back.innerHTML = `<img src="${src}">`;

    // ensure we don't double-bind the same handler
    cardElem.removeEventListener('click', flipCard);
    cardElem.addEventListener('click', flipCard);
  });

  // re-enable transitions after a tick so future flips animate normally
  setTimeout(() => {
    cardElems.forEach(cardElem => {
      const inner = cardElem.querySelector('.card-inner');
      if (inner) inner.style.transition = '';
    });
    // allow clicks again
    lockBoard = false;
  }, 30);
}

function shuffleCards() {
  let currentIndex = cards.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
  }
}

async function play() {
  switchDivs();
  fTimer();
  if (!cards || cards.length === 0) {
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (cards && cards.length > 0) {
          clearInterval(check);
          resolve();
        }
      }, 30);
    });
  }

  if (boardInitialized) return; // prevent re-running on repeated clicks
  initBoard();       
  boardInitialized = true;
}

function checkMatch() {
    const isMatch = firstCard.dataset.name === secondCard.dataset.name;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    checkForWin(); 
    resetBoard();
}

function unflipCards() {
    setTimeout(() => {
        if (firstCard) firstCard.classList.remove("flipped");
        if (secondCard) secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function Restart() {
  hideWinPopup();
  hideTimeUpPopup();
  resetBoard();
  shuffleCards();
  score = 0;
  timer = 30;
  if (timerInterval) clearInterval(timerInterval);
  document.querySelector(".score").textContent = '--';
  document.querySelector(".timer").textContent = '--';
  initBoard();
  fTimer();
}

function fTimer(){
  timerInterval = setInterval(() => {
    const matchedCards = document.querySelectorAll(".card.matched").length;
    const totalCards = cards.length;
    
    // Stop timer if all cards matched
    if (matchedCards === totalCards){
      clearInterval(timerInterval);
    }
    timer--;
    document.querySelector(".timer").textContent = timer;
    // Check if time is up
    if (timer <= 0) {
      clearInterval(timerInterval);
      lockBoard = true;
      showTimeUpPopup();
    }
  }, 1000);
}

function switchDivs() {
    let s1 = document.querySelector(".wrapper");
    let s2 = document.getElementById("game");

    if (s1.style.display === "none") {
        s1.style.display = "block";
        s2.style.display = "none";
    } else {
        s1.style.display = "none";
        s2.style.display = "block";
    }
}

function checkForWin() {
    const totalCards = document.querySelectorAll('.card').length;
    const matchedCards = document.querySelectorAll('.card.matched').length;

    if (matchedCards === totalCards) {
        setHighScore(score);
        showWinPopup();
    }
}

function showWinPopup() {
    document.querySelector(".score_w").textContent = score;
    document.querySelector("#win .high_score").textContent = getHighScore();
    document.getElementById("win").style.display = "block";
    document.getElementById("win").style.display = "flex"; 
}

function hideWinPopup() {
    document.getElementById("win").style.display = "none";
}

function showTimeUpPopup() {
    const matchedCards = document.querySelectorAll('.card.matched').length;
    document.querySelector(".score_f").textContent = score;
    document.querySelector(".matches").textContent = matchedCards;
    document.getElementById("timeup").style.display = "block";
    document.getElementById("timeup").style.display = "flex";
}

function hideTimeUpPopup() {
    document.getElementById("timeup").style.display = "none";
}