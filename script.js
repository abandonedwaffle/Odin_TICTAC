const gameBoard = (function () {
    let grid = ["", "", "", "", "", "", "", "", ""];

   return {
    getAll: function () {
        return [...grid];
    },
    placeMarker: function (marker, index) {
        return grid[index] = marker;
    },
    resetGrid: function() {
        grid = ["", "", "", "", "", "", "", "", ""];
    }
   } 
})();

function createPlayer(name, marker) {
    return {
        name: name,
        marker: marker
    };
}

const gameController = (function () {
    let playerOne; 
    let playerTwo;  
    let activePlayer;
    const winMatrix = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    // const drawMatrix = "";
    let isGameOver = true;


    function winCheck() {
        let board = gameBoard.getAll();
        return winMatrix.some(combination => {
            const [a, b, c] = combination;

            return board[a] !== "" && board[a] === board [b] && board[a] === board[c];
        })
    }
    function drawCheck() {
        let board = gameBoard.getAll();
        return board.every((slot) => {
            if (slot !== "") {
                return true
            } else {
                return false
            }
        })
    }

    
    return {
        switchTurn: function () {
            if(activePlayer == playerOne) {
                activePlayer = playerTwo;
            } else {
                activePlayer = playerOne;
            }
        },
        getActivePlayer: function() {
            return activePlayer;
        },
        playRound: function(index) {
            if (isGameOver == true) {
                return
            }
            let board = gameBoard.getAll();
            if (board[index] !== "") {
                return;
            }
            gameBoard.placeMarker(activePlayer.marker, index);
            if (winCheck() == true) {
                isGameOver = true;
                return "win";
            } else if (drawCheck() == true) {
                isGameOver = true;
                return "draw";
            } else {
                gameController.switchTurn();
                return "continue";
            }
        },
        resetGame: function() {
            isGameOver = true;
            activePlayer = playerOne;
            

        },
        playerInputs: function(playerOneName, playerTwoName) {
            playerOne = createPlayer(playerOneName, "X");
            playerTwo= createPlayer(playerTwoName, "O");
            activePlayer = playerOne;
            isGameOver = false;
        }
    }
    
})();


const displayController = (function() {
    const squares = document.querySelectorAll(".sqrs")
    const gameResult = document.querySelector(".game")
    const btnReset = document.querySelector(".reset-btn")
    const playerNameContainer = document.querySelector('.player-name-container');
    const startBtn = document.querySelector(".start-btn");

    playerNameContainer.addEventListener("input", (e) => {
    let playerOneName = document.querySelector("#playerOne").value;
    let playerTwoName = document.querySelector("#playerTwo").value;
    if (playerOneName !== "" && playerTwoName !== "") {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    } 

    })

    startBtn.addEventListener("click", (e)=> {
        gameController.playerInputs(document.querySelector("#playerOne").value, document.querySelector("#playerTwo").value);
        startBtn.disabled = true;
    })

    btnReset.addEventListener('click', (e) => {
        gameBoard.resetGrid();
        gameController.resetGame();
        gameResult.textContent = "";
        document.querySelector("#playerOne").value = "";
        document.querySelector("#playerTwo").value = "";
        startBtn.disabled = true;
        squares.forEach((square, index) => {
            square.textContent = "";
        }) 
    })

    squares.forEach((square, index) => {
        square.addEventListener('click', (e) => {
            let currentActivePlayer = gameController.getActivePlayer().marker;
            let result = gameController.playRound(index);
            if (result == undefined) {
                return
            } else {
                square.textContent = currentActivePlayer;
                if (result == 'win' || result == 'draw') {
                    if(result == "win") {
                        let winningPlayer = gameController.getActivePlayer().name;
                        gameResult.textContent = `${winningPlayer} has one the game`;

                    }  else {
                        gameResult.textContent = "Draw";
                    }
            }
            }
            
            
        })
    })
})();