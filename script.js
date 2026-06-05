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
    let isGameOver = true;
    let winningCombination = null;

    function winCheck() {
        let board = gameBoard.getAll();
        winningCombination = null;
        for (let combination of winMatrix) {
            const [a, b, c] = combination;
            if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
                winningCombination = combination;
                return true;
            }
        }
        return false;
    }

    function drawCheck() {
        let board = gameBoard.getAll();
        return board.every((slot) => slot !== "");
    }

    return {
        switchTurn: function () {
            if(activePlayer === playerOne) {
                activePlayer = playerTwo;
            } else {
                activePlayer = playerOne;
            }
        },
        getActivePlayer: function() {
            return activePlayer;
        },
        getPlayerOne: function() {
            return playerOne;
        },
        getPlayerTwo: function() {
            return playerTwo;
        },
        getWinningCombination: function() {
            return winningCombination;
        },
        getIsGameOver: function() {
            return isGameOver;
        },
        playRound: function(index) {
            if (isGameOver === true) {
                return;
            }
            let board = gameBoard.getAll();
            if (board[index] !== "") {
                return;
            }
            gameBoard.placeMarker(activePlayer.marker, index);
            if (winCheck() === true) {
                isGameOver = true;
                return "win";
            } else if (drawCheck() === true) {
                isGameOver = true;
                return "draw";
            } else {
                gameController.switchTurn();
                return "continue";
            }
        },
        resetGame: function() {
            isGameOver = true;
            activePlayer = undefined;
            playerOne = undefined;
            playerTwo = undefined;
        },
        playAgain: function() {
            isGameOver = false;
            activePlayer = playerOne;
        },
        playerInputs: function(playerOneName, playerTwoName) {
            playerOne = createPlayer(playerOneName, "X");
            playerTwo = createPlayer(playerTwoName, "O");
            activePlayer = playerOne;
            isGameOver = false;
        }
    }
})();

const displayController = (function() {
    const squares = document.querySelectorAll(".sqrs");
    const gameResult = document.querySelector(".game");
    const btnReset = document.querySelector(".reset-btn");
    const playerNameContainer = document.querySelector('.player-name-container');
    const startBtn = document.querySelector(".start-btn");
    
    // New DOM elements
    const gameContainer = document.getElementById("gameContainer");
    const turnIndicator = document.getElementById("turnIndicator");
    const resultOverlay = document.getElementById("resultOverlay");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const playerOneInput = document.querySelector("#playerOne");
    const playerTwoInput = document.querySelector("#playerTwo");
    const winnerTrophy = document.getElementById("winnerTrophy");

    function updateTurnIndicator() {
        const active = gameController.getActivePlayer();
        if (!active) {
            turnIndicator.textContent = "Set names to start the match";
            turnIndicator.className = "turn-indicator";
            return;
        }

        turnIndicator.textContent = `${active.name}'s turn (${active.marker})`;
        if (active.marker === "X") {
            turnIndicator.className = "turn-indicator turn-x";
        } else {
            turnIndicator.className = "turn-indicator turn-o";
        }
    }

    function checkInputs() {
        let playerOneName = playerOneInput.value.trim();
        let playerTwoName = playerTwoInput.value.trim();
        if (playerOneName !== "" && playerTwoName !== "") {
            startBtn.disabled = false;
        } else {
            startBtn.disabled = true;
        } 
    }

    playerNameContainer.addEventListener("input", checkInputs);

    startBtn.addEventListener("click", (e)=> {
        const p1Name = playerOneInput.value.trim();
        const p2Name = playerTwoInput.value.trim();
        gameController.playerInputs(p1Name, p2Name);
        
        // Disable inputs during game
        playerOneInput.disabled = true;
        playerTwoInput.disabled = true;
        startBtn.disabled = true;

        // Enable board UI
        gameContainer.classList.remove("disabled");
        updateTurnIndicator();
    });

    function cleanBoardUI() {
        squares.forEach((square) => {
            square.textContent = "";
            square.className = "sqrs";
        });
    }

    function resetEntireGame() {
        gameBoard.resetGrid();
        gameController.resetGame();
        
        gameResult.textContent = "";
        playerOneInput.value = "";
        playerTwoInput.value = "";
        playerOneInput.disabled = false;
        playerTwoInput.disabled = false;
        startBtn.disabled = true;
        
        gameContainer.classList.add("disabled");
        resultOverlay.classList.remove("active");
        
        cleanBoardUI();
        updateTurnIndicator();
    }

    function startNextRound() {
        gameBoard.resetGrid();
        gameController.playAgain();
        
        resultOverlay.classList.remove("active");
        cleanBoardUI();
        updateTurnIndicator();
    }

    btnReset.addEventListener('click', resetEntireGame);
    playAgainBtn.addEventListener('click', startNextRound);

    squares.forEach((square, index) => {
        square.addEventListener('click', (e) => {
            if (gameController.getIsGameOver()) {
                return;
            }

            const activePlayer = gameController.getActivePlayer();
            if (!activePlayer) {
                return;
            }

            const marker = activePlayer.marker;
            let result = gameController.playRound(index);
            
            if (result === undefined) {
                return;
            }

            // Set content and apply X or O styling
            square.textContent = marker;
            square.classList.add(marker === "X" ? "mark-x" : "mark-o");

            if (result === 'win' || result === 'draw') {
                if(result === "win") {
                    const winner = gameController.getActivePlayer();
                    gameResult.textContent = `${winner.name} has won the game!`;
                    winnerTrophy.style.display = "block";

                    // Highlight winning combination
                    const winningCombo = gameController.getWinningCombination();
                    if (winningCombo) {
                        winningCombo.forEach(idx => {
                            squares[idx].classList.add("winning");
                        });
                    }
                } else {
                    gameResult.textContent = "It's a Draw!";
                    winnerTrophy.style.display = "none";
                }
                
                // Show modal overlay after a short delay for animation to play
                setTimeout(() => {
                    resultOverlay.classList.add("active");
                }, 600);
            } else {
                updateTurnIndicator();
            }
        });
    });
})();