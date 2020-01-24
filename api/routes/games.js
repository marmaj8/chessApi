const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Game = require("../models/game");
const Player = require("../models/player");
const Piece = require("../models/piece");

router.get('/', (req,res,next) => {
    Game.find( {active: true})
    .populate('player1')
    .populate('player2')
    .exec()
    .then(docs => {
        var games = []
        docs.forEach(game => {
            var player1 = null;
            var player2 = null;
            if (game.player1 != null)
            {
                player1 = game.player1.name
            }
            if (game.player2 != null)
            {
                player2 = game.player2.name
            }

            games.push( {
                _id: game._id,
                name: game.name,
                active: game.active,
                started: game.started,
                anyoneCanJoin: game.anyoneCanJoin,
                activePlayer: game.activePlayer,
                wihte: game.wihte,
                player1: player1,
                player2: player2,
            });
        })
        res.status(200).json(games);
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    })
});

router.get('/:gameId', (req,res,next) => {
    Game.findById( { _id: req.params.gameId, active: true})
    .populate('player1')
    .populate('player2')
    .populate('pieces')
    .exec()
    .then(docs => {
        var player1 = null
        var player2 = null
        
            if (docs.player1 != null)
            {
                player1 = docs.player1.name
            }
            if (docs.player2 != null)
            {
                player2 = docs.player2.name
            }
        var game = {
            _id: docs._id,
            name: docs.name,
            active: docs.active,
            started: docs.started,
            anyoneCanJoin: docs.anyoneCanJoin,
            activePlayer: docs.activePlayer,
            wihte: docs.wihte,
            player1: player1,
            player2: player2,
            pieces: docs.pieces
        }
        res.status(200).json(game);
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            message: "Nie znaleziono gry!"
        })
    })
});

router.put('/', (req,res,next) => {
    Player.findById(req.body.playerId)
    .exec()
    .then(docs => {
        var game = new Game({
            _id: new mongoose.Types.ObjectId(),
            player1: req.body.playerId,
        });
        if (req.body.name != null){ game.name = req.body.name }
        if (req.body.anyoneCanJoin == false)
        {
            game.anyoneCanJoin = false
            game.password = req.body.password
            if (game.password == null)
            {
                throw "Nie podano hasła!" 
            }
        }

        var piecesId = []
        var pieces = []
            for(var i = 1; i < 9; i++)
            {
                var figure
                var piece
                switch(i)
                {
                    case 1:
                        figure = 2
                        break;
                    case 2:
                        figure = 1
                        break;
                    case 3:
                        figure = 3
                        break;
                    case 4:
                        figure = 4
                        break;
                    case 5:
                        figure = 5
                        break;
                    case 6:
                        figure = 3
                        break;
                    case 7:
                        figure = 1
                        break;
                    case 8:
                        figure = 2
                        break;
                }
                piece = new Piece({
                    _id: mongoose.Types.ObjectId(),    // nazwa : typ obiektu
                    color: 1,
                    posX: i,
                    posY: 2,
                    figure: 0,   // 0-pion, 1-skoczek, 2-wieza, 3-goniec, 4-dama, 5-krol
                    game: game._id
                })
                pieces.push(piece)
                piecesId.push(piece._id)
                piece = new Piece({
                    _id: mongoose.Types.ObjectId(),    // nazwa : typ obiektu
                    color: 2,
                    posX: i,
                    posY: 7,
                    figure: 0,   // 0-pion, 1-skoczek, 2-wieza, 3-goniec, 4-dama, 5-krol
                    game: game._id
                })
                pieces.push(piece)
                piecesId.push(piece._id)
                piece = new Piece({
                    _id: mongoose.Types.ObjectId(),    // nazwa : typ obiektu
                    color: 1,
                    posX: i,
                    posY: 1,
                    figure: figure,   // 0-pion, 1-skoczek, 2-wieza, 3-goniec, 4-dama, 5-krol
                    game: game._id
                })
                pieces.push(piece)
                piecesId.push(piece._id)
                piece = new Piece({
                    _id: mongoose.Types.ObjectId(),    // nazwa : typ obiektu
                    color: 2,
                    posX: i,
                    posY: 8,
                    figure: figure,   // 0-pion, 1-skoczek, 2-wieza, 3-goniec, 4-dama, 5-krol
                    game: game._id
                })
                pieces.push(piece)
                piecesId.push(piece._id)
            }
            Piece.insertMany(pieces)
            .then(result => {
                //console.log(result)
            })
            .catch(err => {
                console.log(`Error: ${err}`);
            });


        game.pieces = piecesId
        game.save()
        .then(result => {
            
            var player1 = null
            var player2 = null
            
                if (game.player1 != null)
                {
                    player1 = game.player1.name
                }
                if (game.player2 != null)
                {
                    player2 = game.player2.name
                }
            var ggame = {
                _id: game._id,
                name: game.name,
                active: game.active,
                started: game.started,
                anyoneCanJoin: game.anyoneCanJoin,
                activePlayer: game.activePlayer,
                wihte: game.wihte,
                player1: player1,
                player2: player2,
                pieces: game.pieces
            }
            
            const io = req.app.get('socketio');
            io.emit('newGame', ggame);
            res.status(200).json({
                message: "Utworzono gre",
                createdGame: game._id
            });
        })
        .catch(error => {
            console.log(error);
            throw error
        });
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    })
});

router.patch('/', (req,res,next) => {
    Game.findById(req.body.gameId)
    .populate('player1')
    .populate('player2')
    .populate('pieces')
    .exec()
    .then(docs => {
        if (docs.player1._id == req.body.playerId)
        {
            console.log("\t"+req.body.password)
            console.log("\t"+req.body.anyoneCanJoin)
            console.log("\t"+req.body.name)
            game = docs
            if (req.body.password != null)
            {
                game.anyoneCanJoin = false;
                game.password = req.body.password
            }
            if (req.body.anyoneCanJoin == true)
            {
                game.anyoneCanJoin = true
                game.password = null
            }
            
            if (req.body.name != null)
            {
                game.name = req.body.name
            }

            game.save()
            .then(result => {
                const io = req.app.get('socketio');

                res.status(200).json({
                    message: "Zmieniono gre"
                })
            
                var player1 = null
                var player2 = null
                
                    if (game.player1 != null)
                    {
                        player1 = game.player1.name
                    }
                    if (game.player2 != null)
                    {
                        player2 = game.player2.name
                    }
                var ggame = {
                    _id: game._id,
                    name: game.name,
                    active: game.active,
                    started: game.started,
                    anyoneCanJoin: game.anyoneCanJoin,
                    activePlayer: game.activePlayer,
                    wihte: game.wihte,
                    player1: player1,
                    player2: player2,
                    pieces: game.pieces
                }

                io.emit('gameChanged-'+game._id, ggame);
                game.pieces = null
                io.emit('gameChanged', ggame);
                //console.log(result);
            })
            .catch(error => {
                console.log(error);
            });
        }
        else
        {
            throw "Nie masz uprawnień"
        }
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    })
});

router.post('/join', (req,res,next) => {
    Game.findById(req.body.gameId)
    .populate('player1')
    .populate('player2')
    .populate('pieces')
    .exec()
    .then(docs => {
        var game = docs
        if(game.player2 == null && game.player1 != req.body.playerId)
        {
            if (game.anyoneCanJoin == true || game.password == req.body.password)
            {
                Player.findById(req.body.playerId).exec()
                .then(docs => {
                    if (docs == null)
                    {
                        throw "Gracz nie istnieje!"
                    }
                    else
                    {
                        game.player2 = docs._id
                        game.save()
                        .then(result => {
                            const io = req.app.get('socketio');


                            res.status(200).json({
                                message: "Dołączono do gry",
                                gameId: game._id
                            })
            
                            var player1 = null
                            var player2 = null
                            
                                if (game.player1 != null)
                                {
                                    player1 = game.player1.name
                                }
                                if (game.player2 != null)
                                {
                                    player2 = game.player2.name
                                }
                            var ggame = {
                                _id: game._id,
                                name: game.name,
                                active: game.active,
                                started: game.started,
                                anyoneCanJoin: game.anyoneCanJoin,
                                activePlayer: game.activePlayer,
                                wihte: game.wihte,
                                player1: player1,
                                player2: player2,
                                pieces: game.pieces
                            }

                            io.emit('gameChanged-'+game._id, ggame);
                            game.pieces=null
                            io.emit('gameChanged', ggame);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                    }
                })
                .catch(err => {
                    throw err
                })
            }
        }
        else
        {
            throw "Nie możesz dołączyć do tej gry"
        }
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    })
});

router.patch('/start', (req,res,next) => {
    Game.findById(req.body.gameId)
    .populate('player1')
    .populate('player2')
    .populate('pieces')
    .exec()
    .then(docs => {
        if (docs.player1._id == req.body.playerId)
        {
            game = docs

            if (game.player1 != null && game.player2 != null)
            {
                game.started = true
                game.activePlayer = 1
                game.save()
                .then(result => {
                    const io = req.app.get('socketio');
                    game.player1 = game.player1.name
                    game.player2 = game.player2.name

                    //console.log(result);
    
                    res.status(200).json({
                        message: "Wystartowano gre"
                    })
            
                    var player1 = null
                    var player2 = null
                    
                        if (game.player1 != null)
                        {
                            player1 = game.player1.name
                        }
                        if (game.player2 != null)
                        {
                            player2 = game.player2.name
                        }
                    var ggame = {
                        _id: game._id,
                        name: game.name,
                        active: game.active,
                        started: game.started,
                        anyoneCanJoin: game.anyoneCanJoin,
                        activePlayer: game.activePlayer,
                        wihte: game.wihte,
                        player1: player1,
                        player2: player2,
                        pieces: game.pieces
                    }

                    io.emit('gameStarted-'+game._id, ggame);
                    game.pieces = null;
                    io.emit('gameChanged', ggame);
                    
                })
                .catch(error => {
                    throw "Błąd serwra"
                });
            }
            else
            {
                throw "Brakuje gracza"
            }
        }
        else
        {
            throw "Nie masz uprawnień"
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            message: err
        })
    })
});

router.post('/move', (req,res,next) => {
    Game.findById(req.body.gameId)
    .populate('player1')
    .populate('player2')
    .populate('pieces')
    .exec()
    .then(docs => {
        var game = docs
        if (!game.started){
            throw "Gra nie wystartowana!"
        }
        if (!game.active){
            throw "Gra zakończona!"
        }
        if (game.activePlayer == 1 && game.player1._id == req.body.playerId
         || game.activePlayer == 2 && game.player2._id == req.body.playerId)
        {
            var start = req.body.start
            var end = req.body.end

            var active
            var onLine =[]
            var onTarget
            var dx = end.x - start.x
            var dy = end.y - start.y

            if( dx == 0 && dy == 0)
            {
                throw "Ruch w to samo miejsce"
            }
            game.pieces.forEach(piece => {
                if (piece.posX == start.x && piece.posY == start.y && !piece.captured)
                {
                    active = piece
                }
                if (piece.posX == end.x && piece.posY == end.y)
                {
                    onTarget = piece
                }
                var dxx = piece.posX - start.x
                var dyy = piece.posY - start.y

                if ( !piece.captured
                    &&
                    (start.x == end.x && start.x == piece.posX // pionowo
                    && (start.y < piece.posY && piece.posY < end.y || start.y > piece.posY && piece.posY > end.y)
                    ||
                    start.y == end.y && start.y == piece.posY // poziomo
                    && (start.x < piece.posX && piece.posX < end.x || start.x > piece.posX && piece.posX > end.x )
                    ||
                    (dx*dx == dy*dy && dxx*dxx == dyy*dyy) // skos
                    && (start.x < piece.posX && piece.posX < end.x || start.x > piece.posX && piece.posX > end.x )
                    )){
                        onLine.push(piece)
                    }
            })

            if (active == null)
            {
                throw "Na polu nie ma figury!"
            }
            var playerColor = 1
        
            if (game.player2._id == req.body.playerId)
            {
                playerColor = 2
            }
            if(game.wihte == 2)
            {
                playerColor = 1
            }
            console.log("p1: " + game.player1._id)
            console.log("p2: " + game.player2._id)
            console.log("pp: " + req.body.playerId)
            if (active.color != playerColor)
            {
                throw "To nie twoja figura"
            }
            if ( onTarget != null)
            {
                if (onTarget.color == active.color)
                {
                    throw "Nie można bić własnej figury"
                }
            }
            switch(active.figure)
            {
                case 0: //pion
                {
                    if(start.x == end.x) // ruch
                    {
                        console.log(dy)
                        console.log(active.color)
                        if(active.color == 2)
                        {
                            dy = -dy
                        }
                        console.log(dy)
                        if (dy < 0 || dy > 2 || dy == 2 && 
                            (start.y != 2 && playerColor == 1 
                                || start.y != 7 && playerColor ==2))
                        {
                            throw "Niedozwolony ruch!"
                        }
                        if (onLine.length > 0)
                        {
                            throw "Inna figura blokuje droge!"
                        }
                    }
                    else // skos - bicie
                    {
                        if(onTarget == null || dx*dx != 1
                            || (playerColor == 1 && dy != 1 || playerColor == 2 && dy != -1))
                        {
                            throw "Niedozwolony ruch!"
                        }
                    }
                    console.log(active.color)
                    console.log(active.posY)

                    if (active.color == 1 &&  end.y == 8 || active.color == 2 && end.posY == 1){
                        if (req.body.upgrade != null){
                            active.figure = req.body.upgrade
                        }
                        else
                        {
                            active.figure = 4
                        }
                        console.log('aaa')
                    }
                }
                break;
                case 1: // skoczek
                {
                    if((dx*dx != 1 || dy*dy != 4) && (dx*dx != 4 || dy*dy != 1))
                    {
                        throw "Niedozwolony ruch!"
                    }
                }
                break;
                case 2: // wieza
                {
                    if(onLine.length > 0)
                    {
                        throw "Inna figura blokuje droge!"
                    }
                    if(start.x != end.x && start.y != end.y)
                    {
                        throw "Niedozwolony ruch!"
                    }
                }
                break;
                case 3: // goniec
                {
                    if(onLine.length > 0)
                    {
                        throw "Inna figura blokuje droge!"
                    }
                    if(dx*dx != dy*dy)
                    {
                        throw "Niedozwolony ruch!"
                    }
                }
                break;
                case 4: // dama
                {
                    console.log(onLine)
                    if(onLine.length > 0)
                    {
                        throw "Inna figura blokuje droge!"
                    }
                    if(dx*dx != dy*dy && (start.x != end.x && start.y != end.y))
                    {
                        throw "Niedozwolony ruch!"
                    }
                }
                break;
                case 5: // krol
                {
                    if(onLine.length > 0)
                    {
                        throw "Inna figura blokuje droge!"
                    }
                    if(dx > 1 || dy > 1)
                    {
                        throw "Niedozwolony ruch!"
                    }
                }
                break;
            }
            if (onTarget != null)
            {
                onTarget.captured = true;
                onTarget.save()
                .then()
                .catch((err) => {
                    throw err
                })

                if (onTarget.figure == 5){
                    game.active = false
                }
            }

            active.posX = end.x;
            active.posY = end.y;

            active.save()
            if (game.active && game.activePlayer == 1) {game.activePlayer = 2}
            else if (game.active){ game.activePlayer = 1}
            game.save()
            
            const io = req.app.get('socketio');

            
        var player1 = null
        var player2 = null
        
            if (docs.player1 != null)
            {
                player1 = docs.player1.name
            }
            if (docs.player2 != null)
            {
                player2 = docs.player2.name
            }
            
            var player1 = null
            var player2 = null
            
                if (game.player1 != null)
                {
                    player1 = game.player1.name
                }
                if (game.player2 != null)
                {
                    player2 = game.player2.name
                }
            var ggame = {
                _id: game._id,
                name: game.name,
                active: game.active,
                started: game.started,
                anyoneCanJoin: game.anyoneCanJoin,
                activePlayer: game.activePlayer,
                wihte: game.wihte,
                player1: player1,
                player2: player2,
                pieces: game.pieces
            }

            var msg
            if (game.active){
                io.emit('gameMove-'+game._id, ggame);
                io.emit('gameWin', ggame);
                msg = "Wykonano ruch"
            }
            else{
                io.emit('gameWin-'+game._id, ggame);
                msg = "KONIEC"
            }

            res.status(200).json({
                message: msg,
                game: ggame
            });
        }
        else
        {
            throw "Nie twój ruch!"
        }
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    })
});

module.exports = router;