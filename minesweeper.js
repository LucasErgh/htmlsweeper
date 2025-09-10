const columns = 10;
const rows = 10;
const cellSize = 20;

const mineCount = 13;

var inGame = true;

const directions = [
    [-1, -1], [0, -1], [ 1, -1],
    [-1,  0],          [ 1,  0],
    [-1,  1], [0,  1], [ 1,  1]
];

var hoverCell = {
    x:0,
    y:0,
    isHovering:false
};

var mines = Array.from({ length:columns }, () =>
    new Array(rows).fill(0)
);

var shownCells = Array.from({ length:columns }, () =>
    new Array(rows).fill(0)
);

var flags = Array.from({ length:columns }, () =>
    new Array(rows).fill(false)
);

for (let i = 0; i < mineCount; ++i) {
    var column = Math.floor(Math.random() * columns);
    var row = Math.floor(Math.random() * rows);
    if (mines[row][column] == -1) i--;
    else mines[row][column] = -1;
}

fillAdjacentMines(mines);

var titleBar = document.getElementById("titleText");
var mineCounter = document.getElementById("mineCounter").innerText = "Mines: " + mineCount;

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.stroke();
ctx.fontSize = cellSize;
draw();

c.addEventListener("click", click);
c.addEventListener("mousemove", hover);
c.addEventListener("contextmenu", rightClick);

function loadBody(e){
    mineCounter.innerText = "Mines: " + mineCount;
}

function resetGame() {
    mines = Array.from({ length:columns }, () =>
        new Array(rows).fill(0)
    );

    shownCells = Array.from({ length:columns }, () =>
        new Array(rows).fill(0)
    );

    flags = Array.from({ length:columns }, () =>
        new Array(rows).fill(false)
    );

    for (let i = 0; i < mineCount; ++i) {
        var column = Math.floor(Math.random() * columns);
        var row = Math.floor(Math.random() * rows);
        if (mines[row][column] == -1) i--;
        else mines[row][column] = -1;

        // console.log("( " + row + ", " + column + " ), ");
    }
    fillAdjacentMines(mines);
    titleBar.innerText = "MineSweeper!";
    draw();
    inGame = true;
}

function rightClick(e) {
    e.preventDefault();
    if (!inGame) return;

    var [x, y] = getCellByPos(e.clientX, e.clientY);
    flags[x][y] = !flags[x][y];
    if (checkWin() == true) {
        revealBoard();
        draw();
        titleBar.innerText = "You Won!";
        inGame = false;
    }
    
    draw();
}

function click(e) {
    if (!inGame) return;

    var [x, y] = getCellByPos(e.clientX, e.clientY);
    if (mines[x][y] == -1){
        revealBoard();
        draw();
        titleBar.innerText = "You Lost!";
        inGame = false;
    } else{
        updateView(x, y);
    }
    draw();
}

function hover(e) {
    if (!withinCanvas(e.clientX, e.clientY))
        return;

    var [cellX, cellY] = getCellByPos(e.clientX, e.clientY);
    hoverCell.x = cellX;
    hoverCell.y = cellY;
    hoverCell.isHovering = true;
    draw();
}

function revealBoard() {
    for(let x = 0; x < columns; ++x) {
        for(let y = 0; y < rows; ++y) {
            shownCells[x][y] = 1;
        }
    }
}

function checkWin() {
    var win = true;
    for(let x = 0; x < columns; ++x) {
        for(let y = 0; y < rows; ++y) {
            if (shownCells[x][y] != 1
                && flags[x][y] == true && mines[x][y] != -1
                || flags[x][y] == false && mines[x][y] == -1
            ) {
                win = false;
            }
        }
    }
    return win;
}

function draw() {
    drawBackgroundColor();
    drawMineCount();
    drawFlags();
    drawGrid();
}

function drawBackgroundColor() {
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            if (shownCells[x][y] == 0) {
                ctx.fillStyle = "#5c809e";
                ctx.fillRect(cellSize * x, cellSize * y, cellSize, cellSize);
            } else if (mines[x][y] == -1) {
                ctx.fillStyle = "#000000";
                ctx.fillRect(cellSize * x, cellSize * y, cellSize, cellSize);
            } else {
                ctx.fillStyle = "white";
                ctx.fillRect(cellSize * x, cellSize * y, cellSize, cellSize);

            }
        }
    }
    ctx.fillStyle = "gray";
    
    if (!isOutOfBounds([hoverCell.x, hoverCell.y])
        && hoverCell.isHovering
        && shownCells[hoverCell.x][hoverCell.y] == 0
    ) {
        ctx.fillRect(cellSize * hoverCell.x, cellSize * hoverCell.y, cellSize, cellSize);
    }
}

function drawMineCount() {
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            if (shownCells[x][y] == 1) {
                var curMineCount = mines[x][y];
                switch(curMineCount) {
                    case -1:
                    case 0: continue;
                    case 1: ctx.fillStyle = "#6ac7daff"; break;
                    case 2: ctx.fillStyle = "#2692b3"; break;
                    case 3: ctx.fillStyle = "#517689"; break;
                    case 4: ctx.fillStyle = "#105166"; break;
                    case 5: ctx.fillStyle = "#0f4656"; break;
                    case 6: ctx.fillStyle = "#073040"; break;
                    case 8: ctx.fillStyle = "#001017"; break;
                }
                ctx.fillText(curMineCount, cellSize * x + cellSize/2, cellSize * y + cellSize/2);
            }
        }
    }
}

function drawFlags() {
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            if (shownCells[x][y] == 0 && flags[x][y] == true) {
                if (flags[x][y] == true) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(cellSize * x + cellSize*.2, cellSize * y + cellSize*.2, cellSize*.6, cellSize*.6);
                }
            }
        }
    }
}

function drawGrid() {
    ctx.fillStyle = "#000000";
    for (let num = 0; num < columns + 1; num++) {
        ctx.moveTo(num*cellSize, 0);
        ctx.lineTo(num*cellSize, c.height)
        ctx.stroke();

        ctx.moveTo(0, num*cellSize);
        ctx.lineTo(c.width, num*cellSize);
        ctx.stroke();
    }
}

function withinCanvas(x, y) {
    var boundingRect = c.getBoundingClientRect();
    if (boundingRect.left <= x
        && x <= boundingRect.left + boundingRect.width
        && boundingRect.top <= y
        && y <= boundingRect.top + boundingRect.height
    ) return true;
}

function getCanvasPos([x, y]){
    var rect = c.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top;
    return [x, y];
}

function getCellByPos(x, y) {
    var rect = c.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top;
    var cellX = Math.floor(x/cellSize);
    var cellY = Math.floor(y/cellSize);
    return [cellX, cellY];
}

function fillAdjacentMines(mines){
    for (let x = 0; x < columns; ++x){
        for (let y = 0; y < rows; ++y){
            if (mines[x][y] != -1)
                mines[x][y] = getAdjacentMineCount(x, y);
        }
    }
}

function getAdjacentMineCount(x, y) {
    var curAdjacentMines = 0;
    for (let [dx, dy] of directions) {
        var nx = x + dx;
        var ny = y + dy;

        // Skip out-of-bounds neighbors
        if (nx < 0 || ny < 0 || nx >= columns || ny >= rows) continue;

        if (mines[nx][ny] == -1) {
            curAdjacentMines++;
        }
    }
    // console.log(curAdjacentMines);
    return curAdjacentMines;
}

function updateView(x, y){
    if (mines[x][y] > 0) {
        shownCells[x][y] = 1;
        return;
    }

    let visited = new Set();
    let queue = [[x, y]];
    visited.add(x + "," + y);

    while (queue.length > 0) {
        let [cx, cy] = queue.shift();
        shownCells[cx][cy] = 1;

        // If numbered cell, reveal but don't expand further
        if (mines[cx][cy] > 0) continue;

        for (let [dx, dy] of directions) {
            let nx = cx + dx;
            let ny = cy + dy;

            if (isOutOfBounds([nx, ny])) continue;

            let key = nx + "," + ny;
            if (!visited.has(key) && mines[nx][ny] != -1) {
                visited.add(key);
                queue.push([nx, ny]);
            }
        }
    }
}

function isOutOfBounds([x, y]){
    return x < 0 || y < 0 || x >= columns || y >= rows;
}
