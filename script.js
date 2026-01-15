const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const boardEl = document.getElementById("board");
const winlineEl = document.getElementById("winline");
const cells = Array.from(document.querySelectorAll(".cell"));

let state = Array(9).fill(null);
let turn = "X";
let gameOver = false;

/**
 * Win patterns with a simple "line map" for drawing a win line:
 * - pos: approximate line position in % on the board
 * - angle: degrees to rotate the line
 */
const WINS = [
  { pattern: [0,1,2], line: { x: 14, y: 16.5, angle: 0 } },
  { pattern: [3,4,5], line: { x: 14, y: 50, angle: 0 } },
  { pattern: [6,7,8], line: { x: 14, y: 83.5, angle: 0 } },

  { pattern: [0,3,6], line: { x: 16.5, y: 14, angle: 90 } },
  { pattern: [1,4,7], line: { x: 50, y: 14, angle: 90 } },
  { pattern: [2,5,8], line: { x: 83.5, y: 14, angle: 90 } },

  { pattern: [0,4,8], line: { x: 16, y: 16, angle: 45 } },
  { pattern: [2,4,6], line: { x: 84, y: 16, angle: 135 } },
];

function setStatus(text){
  statusEl.textContent = text;
}

function checkWinner(){
  for (const w of WINS){
    const [a,b,c] = w.pattern;
    if (state[a] && state[a] === state[b] && state[a] === state[c]){
      return { winner: state[a], line: w.line };
    }
  }
  if (state.every(Boolean)) return { winner: "DRAW" };
  return null;
}

function drawWinLine(line){
  // Place the line near the winning row/col/diag.
  // We use percentages so it scales with the board.
  boardEl.classList.add("showline");

  // For diagonals we need a longer line
  const isDiag = line.angle === 45 || line.angle === 135;
  const targetWidth = isDiag ? 120 : 92; // in %

  winlineEl.style.left = `${line.x}%`;
  winlineEl.style.top = `${line.y}%`;
  winlineEl.style.transform = `translate(-50%, -50%) rotate(${line.angle}deg) translateZ(25px)`;
  // Animate width
  requestAnimationFrame(() => {
    winlineEl.style.width = `${targetWidth}%`;
  });
}

function clearWinLine(){
  boardEl.classList.remove("showline");
  winlineEl.style.width = "0";
  winlineEl.style.left = "50%";
  winlineEl.style.top = "50%";
  winlineEl.style.transform = `translate(-50%, -50%) translateZ(25px)`;
}

function lockBoard(lock){
  cells.forEach(c => (c.disabled = lock));
}

function renderCell(i){
  const cell = cells[i];
  const mark = cell.querySelector(".mark");

  cell.classList.remove("x","o","filled");
  mark.textContent = "";

  if (state[i] === "X"){
    cell.classList.add("x","filled");
    mark.textContent = "X";
  } else if (state[i] === "O"){
    cell.classList.add("o","filled");
    mark.textContent = "O";
  }
}

function renderAll(){
  for (let i=0;i<9;i++) renderCell(i);
}

function onCellClick(e){
  if (gameOver) return;
  const cell = e.currentTarget;
  const i = Number(cell.dataset.i);

  if (state[i]) return;

  state[i] = turn;
  renderCell(i);

  const result = checkWinner();
  if (result){
    gameOver = true;
    lockBoard(true);

    if (result.winner === "DRAW"){
      setStatus("Draw! Reset to play again.");
    } else {
      setStatus(`${result.winner} wins! 🎉`);
      drawWinLine(result.line);
    }
    return;
  }

  turn = (turn === "X") ? "O" : "X";
  setStatus(`${turn}’s turn`);
}

function reset(){
  state = Array(9).fill(null);
  turn = "X";
  gameOver = false;
  lockBoard(false);
  clearWinLine();
  renderAll();
  setStatus("X’s turn");
}

cells.forEach(c => c.addEventListener("click", onCellClick));
resetBtn.addEventListener("click", reset);

reset();
