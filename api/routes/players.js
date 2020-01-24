const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Player = require("../models/player");


router.get('/', (req,res,next) => {
    console.log("kupa get")
    Player.find().exec()
    .then(docs => {
        var players = []
        docs.forEach(player => {
            players.push( { name: player.name, wins: player.wins})
        });
        res.status(200).json(players);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});

router.post('/', (req,res,next) => {
    console.log("kupa post")
    Player.findOne({ name: req.body.login})
    .exec()
    .then(docs => {
        if (docs === null)
        {
            player = new Player({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.login,
                password: req.body.password
           });
    
           player.save()
           .then(result => {
            console.log(result);
            })
            .catch(error => {
                console.log(error);
            });

            res.status(200).json({
                message: "Utworzono nowego gracza",
                playerId: player._id
            });
        }
        else if (docs.password == req.body.password)
        {
            res.status(200).json({
                message: "Udane logowanie",
                playerId: docs._id
            });
        }
        else
        {
            res.status(401).json({
                message: "Login zajęty!\nNieprawidłowe Hasło!"
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: "Problem w połączeniu z bazą danych!"
        })
    })
});

router.patch('/', (req,res,next) => {
    Player.findById(req.body.id)
    .exec()
    .then(docs => {
        docs.password = req.body.password
        docs.save()

        res.status(200).json({
            message: "Zmieniono haslo"
        })
    })
    .catch(err => {
        res.status(500).json({
            error: "Nie znaleziono gracza!"
        })
    })
});

module.exports = router;