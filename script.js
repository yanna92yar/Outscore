function blink(){
    var f = document.getElementById('score');
    setTimeout(function() {
        f.style.display = (f.style.display == 'none' ? '' : 'none');
    }, 500);
    setTimeout(function() {
        f.style.display = (f.style.display == 'none' ? '' : 'none');
    }, 1000);
}
blink();

//Tell the library which element to use for the table
cards.init({
    table: '#card-table',
    type: STANDARD
});

//Create a new deck of cards
deck = new cards.Deck();
//By default it's in the middle of the container, put it slightly to the side
deck.x -= 150;

//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all);
//No animation here, just get the deck onto the table.
deck.render({
    immediate: true
});

//Now lets create a couple of hands, one face down, one face up.
upperhand = new cards.Hand({
    faceUp: true,
    y: 60
});
lowerhand = new cards.Hand({
    faceUp: true,
    y: 340
});

//Lets add a discard pile
discardPile = new cards.Hand({
    faceUp: true
});
discardPile.x += 50;

player1 = [];
player2 = [];
scores_res = {
    player1: 0,
    player2: 0,
    lastNumWin: undefined,
    lastFaceWin: undefined
}
//Let's deal when the Deal button is pressed:
$('#deal').click(function() {
    //Deck has a built in method to deal to hands.
    $('#deal').hide();
    deck.deal(10, [upperhand, lowerhand], 50, function() {
        //This is a callback function, called when the dealing
        //is done.
        // discardPile.addCard(deck.topCard());
        discardPile.render();
        for (let index = 0; index < upperhand.length; index++) {
            type(upperhand[index]);
        }
        for (let index = 0; index < lowerhand.length; index++) {
            type(lowerhand[index]);            
        }
    });
    
});


//When you click on the top card of a deck, a card is added
//to your hand
deck.click(function(card) {
    if (card === deck.topCard()) {
        lowerhand.addCard(deck.topCard());
        lowerhand.render();
    }
});

//Finally, when you click a card in your hand, if it's
//the same suit or rank as the top card of the discard pile
//then it's added to it

// lowerhand == player1
lowerhandTurn = true;
ongoing = true;
first = true;
lowerhand.click(function(card) {
    if (!lowerhandTurn || !ongoing)
        return
    if (true || card.suit == discardPile.topCard().suit ||
        card.rank == discardPile.topCard().rank) {
        discardPile.addCard(card);
        discardPile.render();
        lowerhand.render();
    }
    player1.push(card);
    analyseIfSecond();
    first = !first
    lowerhandTurn = false;
});

// upperhand == player2
upperhand.click(function(card) {
    if (lowerhandTurn || !ongoing)
        return
    if (true || card.suit == discardPile.topCard().suit ||
        card.rank == discardPile.topCard().rank) {
        discardPile.addCard(card);
        discardPile.render();
        upperhand.render();
    }

    player2.push(card);
    analyseIfSecond();
    first = !first
    lowerhandTurn = true;
});

function analyseIfSecond(){
    if(first)
        return;
    if (player1.length > 0 && player2.length > 0) {
        console.log(player1);
        console.log(player2);
        p1 = new Set(player1.map(function(e) {
            return e.type;
        }));
        p2 = new Set(player2.map(function(e) {
            return e.type;
        }));
        v1 = p1.values().next().value;
        v2 = p2.values().next().value;
        checkFinalRound()
        if (p1.size == 1 && p2.size == 1 && v1 == v2) {
            console.log("scoring");
            scores_res = score_refresh();
        } else if (p1.size == 2 || p2.size == 2) {
            console.log("scoring");
            scores_res = score_refresh();
        } else {
            console.log("continue");
        }
        checkFinalRound()
        console.log("scores" + scores_res);
    }
}

//So, that should give you some idea about how to render a card game.
//Now you just need to write some logic around who can play when etc...
//Good luck :)

function score_refresh() {
    p1_faces = player1.map(function(e) {
        if (e.rank == 1 || e.rank > 10) return e.rank;
    }).filter(e => e != null);
    p2_faces = player2.map(function(e) {
        if (e.rank == 1 || e.rank > 10) return e.rank;
    }).filter(e => e != null);
    if (Math.max(...p1_faces) > Math.max(...p2_faces))
    {
        scores_res["lastFaceWin"] = "lowerhand";
        lowerhandTurn = true;
    }
    else
    {
        scores_res["lastFaceWin"] = "upperhand";
        lowerhandTurn = false;
    }

    p1_nums = player1.map(function(e) {
        if (e.rank > 1 && e.rank < 11) return e.rank;
    }).filter(e => e != null);
    p2_nums = player2.map(function(e) {
        if (e.rank > 1 && e.rank < 11) return e.rank;
    }).filter(e => e != null);
    if (Math.max(...p1_nums) > Math.max(...p2_nums)) {
        scores_res["player1"] += p1_nums.reduce((a, b) => a + b, 0);
        scores_res["lastNumWin"] = "lowerhand";
    } else {
        scores_res["player2"] += p2_nums.reduce((a, b) => a + b, 0);
        scores_res["lastNumWin"] = "upperhand";
    }
    player1 = [];
    player2 = [];

    throwCards();
    htmlOutput = 'Player1: ' + scores_res['player1'] + '<br>Player2: ' + scores_res['player2'];
    $('#score').fadeOut(1000, function()
    {     
        $(this).html(htmlOutput).fadeIn(1000);
    });
    return scores_res;
}

function scoreFinal(){
    p1_finals = lowerhand.map(function(e) {return e.rank;}).filter(e => e != null);
    p2_finals = upperhand.map(function(e) {return e.rank;}).filter(e => e != null);
    scores_res["player1"] += p1_finals.reduce((a, b) => a + b, 0);
    scores_res["player2"] += p2_finals.reduce((a, b) => a + b, 0);
    if(scores_res["player1"] > scores_res["player2"]){
        winner = "player 1";
    }else{
        winner = "player 2";
    }
    htmlOutput = 'Player1: ' + scores_res['player1'] + '<br>Player2: ' + scores_res['player2'] + '<br>Winner is: '+winner;
    $('#score').fadeOut(1000, function()
    {     
        $(this).html(htmlOutput).fadeIn(1000);
    });
    ongoing = false;
    blink();
}

function checkFinalRound(){
    l = new Set(lowerhand.map(function(e) {
        return e.type;
    }));
    u = new Set(upperhand.map(function(e) {
        return e.type;
    }));
    l_type = l.values().next().value;
    u_type = u.values().next().value;
    if((l.size == 1 && l_type == 1) || (u.size == 1 && u_type == 1)){
        console.log("it is final")
        scoreFinal();
    }
}

function type(card){
    if (card.rank == 1 || card.rank > 10)
        card.type = 1;
    else
        card.type = 0;
}

// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms));

async function throwCards() { // We need to wrap the loop into an async function for this to work
    for (let index = discardPile.length - 1; discardPile.length > 0; index--) {
        const card = discardPile[index];
        discardPile.removeCard(card);
        if (card.type == 0) {
            $(card.el).remove(); // <-- card.el is the actual DOM element, just remove that from the page.
            console.log(card.type)
        } else {
            console.log(card.type)
            discardPile.render();
            if (scores_res["lastFaceWin"] == "lowerhand") {
                lowerhand.addCard(card);
                lowerhand.render();
            } else {
                upperhand.addCard(card);
                upperhand.render();
            }
        }
        await timer(400); // then the created Promise can be awaited
    }
}
