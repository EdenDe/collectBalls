'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'

const BALL = 'BALL'
const GAMER = 'GAMER'
const STOP = 'STOP'

const BALL_IMG = '<img src="img/ball.png">'
const GAMER_IMG = '<img src="img/gamer.png">'
const STOP_SIGN = '<i class="fa fa-hand-stop-o"></i>'
const GAMERINGLUE_IMG = '<img src="img/gamer-purple.png">'

// Model:
var gBoard
var gGamerPos
var gIsAbleToMove
var gInterval = {
    glueThrowInterval: null,
    ballsInterval: null,
    removeGlue: null,
}

function initGame() {
    document.querySelector('.gameOver').style.display = "none"
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderCountersArea()
    renderBoard(gBoard)
    gInterval.ballsInterval = setInterval(addBall, 3000)
    gInterval.glueThrowInterval = setInterval(addGlue, 5000)
    gIsAbleToMove = true
}

function renderCountersArea() {
    document.querySelector('.collectedBalls span').innerText = '0'
    document.querySelector('.ballsAround span').innerText = '0'

    ballsAround()
}

function buildBoard() {
    var board = []

    // TODO: Create the Matrix 10 * 12 
    board = createMat(10, 12)

    // TODO: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if ((i === 0 || i === board.length - 1) && j != board.length / 2) board[i][j].type = WALL
            else if ((j === 0 || j === board[i].length - 1) && i != board.length / 2) board[i][j].type = WALL
        }
    }

    // TODO: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[4][7].gameElement = BALL
    board[3][3].gameElement = BALL

    return board;
}

function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'

        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]

            var cellClass = getClassName({ i, j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})">`

            if (currCell.gameElement === GAMER) strHTML += GAMER_IMG
            else if (currCell.gameElement === BALL) strHTML += BALL_IMG

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

function moveTo(i, j) {
    if (!gIsAbleToMove) return
    const newCoord = checkTargetCell(i, j)

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0)
        || (jAbsDiff === 1 && iAbsDiff === 0)
        || iAbsDiff === gBoard.length - 1
        || jAbsDiff === gBoard[0].length - 1) {

        const targetCell = gBoard[newCoord.i][newCoord.j]
        if (targetCell.type === WALL) return

        var isElBall = targetCell.gameElement === BALL
        var isElGlue = targetCell.gameElement === STOP

        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')

        targetCell.gameElement = GAMER
        gGamerPos = {
            i: newCoord.i,
            j: newCoord.j
        }
        
        if (isElGlue) disableMovement()
        else renderCell(gGamerPos, GAMER_IMG)
       
        if (isElBall) hitBall()

        ballsAround()
    } 
}

function checkTargetCell(i, j) {
    if (i === gBoard.length) i = 0
    else if (i < 0) i = gBoard.length - 1
    else if (j === gBoard[i].length) j = 0
    else if (j < 0) j = gBoard[i].length - 1

    return { i, j }
}

function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].gameElement === BALL) return false
        }
    }

    finishGame()
}

function finishGame() {
    gIsAbleToMove = false

    clearInterval(gInterval.ballsInterval)
    clearInterval(gInterval.removeGlue)
    clearInterval(gInterval.glueThrowInterval)

    document.querySelector('.board').innerHTML = ""
    document.querySelector('.gameOver').style.display = "block"
}

function getEmptyCoord() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]

            if (cell.gameElement === null && cell.type === FLOOR) {
                emptyCells.push({ i, j })
            }
        }
    }

    const randonInx = getRandomInt(emptyCells.length, 0)
    const coord = emptyCells[randonInx]
    return coord
}

function addBall() {
    const coord = getEmptyCoord()
    if (!coord) return

    gBoard[coord.i][coord.j].gameElement = BALL
    renderCell(coord, BALL_IMG)

    ballsAround()
}

function addGlue() {
    const coord = getEmptyCoord()
    if (!coord) return

    gBoard[coord.i][coord.j].gameElement = STOP
    renderCell(coord, STOP_SIGN)

    gInterval.removeGlue = setInterval(() => {
        gBoard[coord.i][coord.j].gameElement = null
        renderCell(coord, "")
        clearInterval(gInterval.removeGlue)
    }, 3000)
}

function disableMovement() {
    gIsAbleToMove = false
    clearInterval(gInterval.removeGlue)
    renderCell(gGamerPos, GAMERINGLUE_IMG)

    var eldiv = document.querySelector('.moveTimer')
    eldiv.style.display = "block"

    var elSpan = document.querySelector('.moveTimer span')
    elSpan.innerText = 3

    var moveTimer = setInterval(() => {
        elSpan.innerText--

        if (elSpan.innerText === '0') {
            eldiv.style.display = 'none'
            clearInterval(moveTimer)
            gIsAbleToMove = true
            renderCell(gGamerPos, GAMER_IMG)
        }
    }, 1000)
}

function ballsAround() {
    var count = 0
    const rowIdx = gGamerPos.i
    const colIdx = gGamerPos.j

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i < 0 || j < 0 || i >= gBoard.length || j >= gBoard[i].length || (i === rowIdx && j === colIdx)) continue
            if (gBoard[i][j].gameElement === BALL) count++
        }
    }

    document.querySelector('.ballsAround span').innerText = count
}

function hitBall() {
    var audio = new Audio('audio/collect.mp3')
    audio.play()

    var elSpan = document.querySelector('.collectedBalls span')
    elSpan.innerText = +elSpan.innerText + 1
    checkVictory()
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function handleKey(event) {

    var i = gGamerPos.i
    var j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break;
        case 'ArrowRight':
            moveTo(i, j + 1)
            break;
        case 'ArrowUp':
            moveTo(i - 1, j)
            break;
        case 'ArrowDown':
            moveTo(i + 1, j)
            break;

    }

}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

