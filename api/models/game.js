const mongoose = require("mongoose"), Schema = mongoose.Schema;

const gameSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,    // nazwa : typ obiektu
    name: { type: String, default: "nie nazwana gra" },
    active: { type: Boolean, default: true},
    started: { type: Boolean, default: false},
    anyoneCanJoin: { type: Boolean, default: true },
    password: String,
    activePlayer: Number,
    wihte: { type: Number, default: 1 },
    player1: { type: Schema.Types.ObjectId, ref: 'Player' },
    player2: { type: Schema.Types.ObjectId, ref: 'Player' },
    pieces: [{ type: Schema.Types.ObjectId, ref: 'Piece' }]
});

module.exports = mongoose.model("Game", gameSchema);