let boardInitialized = false;
let firstCard=null, secondCard=null;
let lockBoard=false;
let score=0;
let cards=[];

document.querySelector(".score").textContent = score;

document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        const data = await (await fetch('./data/cards.json')).json();
        cards = [...data, ...data];
        shuffleCards();
    })();
});

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
    const entry = cards[i] ?? {};
    const src = (entry && (entry.image ?? entry)) ?? 'black.jpg';
    const name = (entry && (entry.name ?? entry)) ?? src;

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
  resetBoard();
  shuffleCards();
  score = 0;
  document.querySelector(".score").textContent = score;
  initBoard();
}