const mongoose = require("mongoose"), Schema = mongoose.Schema;

const playerSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,    // nazwa : typ obiektu
    name: String,
    password: String,
    wins: { type: Number, default: 0 },
    games: [{ type: Schema.Types.ObjectId, ref: 'Game' }]
});

module.exports = mongoose.model("Player", playerSchema);