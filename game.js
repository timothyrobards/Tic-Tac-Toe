/* 
    Revisions:
        - tic tac toe animated in cells on start, fadeout
        - modals instead of alerts
        - emojis in the messages
            - https://stackoverflow.com/questions/13093126/insert-unicode-character-into-javascript
            - https://unicode.org/emoji/charts/full-emoji-list.html#1f648
        - Set difficulty level? Easy/Medium/Impossible

*/


/* AI STUFF (HOW THE COMPUTER DECIDES WHAT TO DO) */
function cpuMove() {
  movesMade++;

  if (winOrBlock('win')) return;
  else if (winOrBlock('block')) return;
  else if (goInCentre()) return;
  else if (coverOppositeCorners()) return;
  else if (coverAdjoiningEdges()) return;
  else if (offensiveMove()) return;
  else goInRemaining();
}

function winOrBlock(which) {
  const letter = which === 'win' ? 'O' : 'X';
  // Look for 2 in a row, where we can win or block a win
  const board = buildBoard();
  const twos = wins.filter(win => isPotentialLineForming(board, win, letter, 1));

  if (twos.length === 0) {
    // We can't win/block on this turn
    return false;
  } else {
    // We can win/block! Grab one of the winning moves, and fill in the blank
    markOneOfThese(shuffle(twos).pop());
    return true;
  }
}

// Check if there are: two OR one matching letters out of three, with one OR two blank spaces
function isPotentialLineForming(board = buildBoard(), winningPattern, letter, blanksRequired) {
  let blanks = 0;
  let letters = 0;

  for (let i = 0; i < winningPattern.length; i++) {
    const cellContents = cells[winningPattern[i]].textContent;
    if (cellContents === '') {
      blanks++;
    } else if (cellContents === letter) {
      letters++;
    }
  }
  if (blanksRequired === 1) {
    return (blanks === 1 && letters === 2);
  } else {
    return (blanks === 2 && letters === 1);
  }
}

function goInCentre() {
  if (isEmpty(4)) {
    markCell(4);
    return true;
  } else {
    return false;
  }
}

// Prevent losing due to this: http://www.wikihow.com/Win-at-Tic-Tac-Toe
function coverOppositeCorners() {
  if (!oppositeCornerDanger()) return false;

  const middleEdges = shuffle([1, 3, 5, 7]);
  markOneOfThese(middleEdges);
  return true;
}

function oppositeCornerDanger() {
  let blankCorners = 0, opponentCorners = 0;
  const corners = [0, 2, 6, 8];
  corners.forEach(corner => {
    if (isEmpty(corner)) {
      blankCorners++;
    } else if (cells[corner].textContent === 'X') {
      opponentCorners++;
    }
  });
  return (blankCorners === 2 && opponentCorners === 2);
}

/* Stop user from being able to win across two edges.
 * e.g. in the following situation: 
 * 
 *    - - O
 *    X O O
 *    - - X
 * 
 * The user could go in the bottom-left, and then we can't cover the win!
 * This is prevented by checking for two edges with one X in each.
*/
function coverAdjoiningEdges() {
  const dangerousCorner = [0, 2, 6, 8].filter(corner => {
    if (!isEmpty(corner)) return false;
    const board = buildBoard();
    // From a corner, can we see one other X in this column, and one in this row? If so, it must be blocked!
    return (checkHorizontally(corner, board) && checkVertically(corner, board));
  });

  if (dangerousCorner.length === 0) {
    return false;
  } else {
    markOneOfThese(dangerousCorner);
    return true;
  }
}

function checkHorizontally(corner, board) {
  let cell1, cell2;
  if (corner % 3 === 0) {  // left column
    cell1 = corner + 1;
    cell2 = corner + 2;
  } else {                 // right column
    cell1 = corner - 1;
    cell2 = corner - 2;
  }
  return oneEmptyOneX(board, cell1, cell2);
}

function checkVertically(corner, board) {
  let cell1, cell2;
  if (corner < 3) {       // top row
    cell1 = corner + 3;
    cell2 = corner + 6;
  } else {                 // bottom row
    cell1 = corner - 3;
    cell2 = corner - 6;
  }
  return oneEmptyOneX(board, cell1, cell2);
}

function oneEmptyOneX(board, cell1, cell2) {
  return (board[cell1] === 'X' && board[cell2] === '' ||
          board[cell1] === '' && board[cell2] === 'X');
}

function offensiveMove() {
  // Look for a 'O' with two blank spaces, where we can make it one away from a win
  const board = buildBoard();
  const moves = wins.filter(win => isPotentialLineForming(board, win, 'O', 2));

  if (moves.length === 0) {
    // We can't go one the offensive on this turn
    return false;
  } else {
    // We can! Grab one of the winning moves, and get one step closer to it
    markOneOfThese(shuffle(moves).pop());
    return true;
  }
}

function goInRemaining() {
  const corners = shuffle([0, 2, 6, 8]);
  const remaining = shuffle([1, 3, 5, 7]);
  markOneOfThese([...corners, ...remaining]);
}

function markOneOfThese(potentialMoves) {
  for (let i = 0; i < potentialMoves.length; i++) {
    if (isEmpty(potentialMoves[i])) {
      markCell(potentialMoves[i]);
      return true;
    }
  }
  return false;
}

function markCell(index) {
  cells[index].textContent = 'O';
  cells[index].classList.add('red');
}

function shuffle(arr) {
  return arr.sort(() => 0.5 - Math.random());
}


/* EVERYTHING ELSE */

const cells = document.querySelectorAll('.cell');

const wins = [
  [0,1,2], [3,4,5], [6,7,8],  // horizontal
  [0,3,6], [1,4,7], [2,5,8],  // vertical
  [0,4,8], [2,4,6]            // diagonal
];

let movesMade = 0;

function makeMove() {
  if (!isEmpty(this.dataset.index)) return;

  stopClicks();

  this.textContent = 'X';
  this.classList.add('blue');
  movesMade++;
  
  if (isGameOver('Player')) return;

  // Allow a little time for DOM to update (and simulate 'thinking')
  setTimeout(() => {
    cpuMove();
    if (!isGameOver('CPU')) allowClicks();
  }, 500);
}

function isGameOver(lastPlayer) {
  if (checkForWinner()) {
    gameOver(lastPlayer);
    return true;
  } else if (checkForDraw()) {
    gameOver('Draw');
    return true;
  } else {
    return false;
  }
}

function checkForWinner() {
  const board = buildBoard();
  
  // Check the board against 'wins' array
  let result = false;
  wins.forEach(win => {
    if (threeInARow(board, ...win)) {
      result = true;
    }
  });
  return result;
}

// Build array to represent the board
function buildBoard() {
  const board = [];
  cells.forEach(c => board.push(c.textContent));
  return board;
}

function checkForDraw() {
  return (movesMade >= 9);
}

function isEmpty(index) {
  return cells[index].textContent === '';
}

function threeInARow(board, first, second, third) {
  const b = board;
  return (b[first] !== '' && b[first] === b[second] && b[second] === b[third]);
}

function gameOver(winner) {
  // Allow a little time for DOM to update
  setTimeout(() => {
    winner === 'Draw' ? alert(`It's a draw!`) : alert(`${winner} wins!`);
    newGame();
  }, 15);
}

function newGame() {
  movesMade = 0;
  cells.forEach(c => {
    c.classList.remove('blue', 'red');
    c.textContent = '';
  });
  // Refreshing the clicks like this fixes a pesky bug where sometimes no clicks are allowed
  stopClicks();
  allowClicks();
}

function allowClicks() {
  cells.forEach(c => c.addEventListener('click', makeMove));
}

function stopClicks() {
  cells.forEach(c => c.removeEventListener('click', makeMove));
}

allowClicks();