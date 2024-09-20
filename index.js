import { createBoard } from './scripts/createBoard.js';
import { startTimer } from './timer.js';
import { createIconsArray, createCard } from './cards.js';
import { gameLogic } from "./gameLogic.js";

const startButton = document.querySelector('.board__button');

startButton.addEventListener("click", (event) => {
  event.preventDefault()
  const input = document.querySelector('.board__input');

  let columns = input.value;
  let count;

  if (columns >= 2 && columns <= 6 && columns % 2 == 0) {
    count = columns * columns;
  } else {
    alert("Нужно написать четное число в указанном диапазоне.");
    return;
  }

  createBoard(count, columns);
});

export function createBoard(count, columns) {
  const gameBoard = document.querySelector(".board");
  gameBoard.textContent = "";

  // Создание клона шаблона
  const template = document.querySelector('#gameTableTemplate').cloneNode(true).content;
  // В шаблоне находится таблица
  const gameTable = template.querySelector('.table');
  // В шаблоне находится кнопка "Рестарт"
  const restartBtn = template.querySelector(".table__button");

  // Создание определенного количества иконок
  const icons = createIconsArray(count);

  // Заполнение ячеек карточками
  icons.forEach((icon) => {
    gameTable.append(createCard(icon));
  });

  gameTable.style = `
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${columns}, 1fr);
  `;

  gameBoard.append(gameTable);

  restartBtn.addEventListener("click", () => {
    location.reload();
  });

  gameBoard.append(restartBtn);

  startTimer();
};

function createCard(flippedIcon) {
  // Клонирование шаблона
  const template = document.querySelector('#cardTemplate').cloneNode(true).content;
  // Поиск нужного элемента
  const card = template.querySelector('.card');
  // Добавление иконки, название которой передаем через параметр flippedIcon
  card.querySelector('#flippedIcon').classList.add(`fa-${flippedIcon}`);

  card.addEventListener('click', () => gameLogic(card));

  // ruturn card означает, что получившийся объект "выбрасывается" в то место, где будет вызвана функция createCard
  return card;
}

function createIconsArray(initialCount) {
  // Массив названий иконок
  const cardsIcons = [
    "compass",
    "cloud",
    "play",
    "bolt",
    "stop",
    "cogs",
    "atom",
    "basketball-ball",
    "arrows",
    "angle-left",
    "bars",
    "file",
    "filter",
    "gear",
    "folder",
    "folder-open",
    "shield",
    "scissors",
    "pen-clip",
  ];

  // Выбор нужного количества иконок с помощью среза
  let cards = cardsIcons.slice(0, Math.floor(initialCount / 2));
  // Создание пар элементов
  const duobleCards = dublicateElements(cards);

  // Случайное перемешивание элементов и возврат итогового массива
  return shuffleArray(duobleCards);
};

// Перемешивание элементов массива
function shuffleArray(array) {
  // Определяем количество элементов массива
  let currentIndex = array.length;

  // Повторяем до тех пор, пока текущий индекс не достиг нуля
  while (currentIndex !== 0) {
    // Отнимаем индекс
    currentIndex--;
    // Генерируем рандомный индекс
    const randomIndex = Math.floor(Math.random() * currentIndex);

    // Сохраняем элемент текущего индекса
    const temp = array[currentIndex];
    // По текущему индексу размещаем элемент по случайному индексу
    array[currentIndex] = array[randomIndex];
    // А на место элемента по случайному индексу ставим сохраненный элемент бывшего текущего индекса
    array[randomIndex] = temp;
  };

  // Возвращаем массив
  return array;
}

// Дублирование всех элементов входящего массива
function dublicateElements(array) {
  const newArr = [];

  // Перебирается массив array и каждый элемент массива (item) дважды вставляется в новый массив
  array.forEach((item) => {
    newArr.push(item, item);
  });

  return newArr;
}

export { createCard, createIconsArray };

import { stopTimer, totalTime } from "./timer.js";
// Файл gameLogic.js
import { generateConfetti } from "./confetti.js";

const confettiArray = generateConfetti(150);

let totalFlips = 0;
let isGameOver = false;

const couple = {
  first: null,
  firstClickable: true,
  second: null,
  secondClickable: true,
};

function gameLogic(card) {
  if (isGameOver) return;
  // Если время вышло - ничего не делаем
  if (totalTime === 0) return;
  // Если обе карточки не кликабельны - ничего не делаем
  if (!couple.firstClickable && !couple.secondClickable) return;

  // Переворачиваем карточку
  card.classList.add('flip');
  totalFlips++;

  // Проверяем, кликнута ли первая карточка
  if (couple.first === null) {
    // Если нет, то сохраняем на нее ссылку и считаем кликнутой
    couple.first = card;
    couple.firstClickable = false;
  } else if (couple.second === null && couple.first !== card) {
    // Если да, то проверяем, кликнута ли вторая карточка и не является ли вторая карточка то же самой карточкой, что и первая, и если нет, то сохраняем ссылку на эту карточку и считаем ее кликнутой
    couple.second = card;
    couple.secondClickable = false;
  }

  // Если какой-либо карточки не кликнуто - ничего не делаем
  if (couple.first === null || couple.second === null) return;

  // Сравниваем классы двух карточек и сохраняем логический результат в переменную (это для повышения читабельности)
  const isEqual = couple.first.firstElementChild.classList[2] === couple.second.firstElementChild.classList[2];

  // Если классы одинаковы
  if (isEqual) {
    setTimeout(() => {
      // То перекрашиваем их в зеленый с задержкой в 1 секунду
      couple.first.classList.add('successfully');
      couple.second.classList.add('successfully');

      // Сбрасываем все ссылки и состояния
      refresh();
    }, 1000);
  } else {
    setTimeout(() => {
      // Иначе переворачиваем карточки обратно с задержкой в 1 секунду
      couple.first.classList.remove('flip');
      couple.second.classList.remove('flip');

      // Сбрасываем все ссылки и состояния
      refresh();
    }, 1000);
  }

  // Функция сброса ссылок и состояний
  function refresh() {
    couple.first = null;
    couple.second = null;
    couple.firstClickable = true;
    couple.secondClickable = true;
  }

  isWin();
}


function isWin() {
  const gameTable = document.querySelector('.table');
  if (Array.from(gameTable.children).every((card) => card.classList.contains('flip'))) {
    setTimeout(() => {
      stopTimer();
      startConfetti();
      isGameOver = true;
      alert("Вы победили!");
    }, 1500)
  }
}

function startConfetti() {
  const confettiElement = document.querySelector('.confetti');
  confettiArray.forEach((item) => {
    confettiElement.append(item);
  })
}

export { gameLogic, totalFlips };
