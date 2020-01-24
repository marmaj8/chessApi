const mongoose = require("mongoose"), Schema = mongoose.Schema;

const pieceSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,    // nazwa : typ obiektu
    captured: { type: Boolean, default: false },
    color: Number,
    posX: Number,
    posY: Number,
    figure: Number,   // 0-pion, 1-skoczek, 2-wieza, 3-goniec, 4-dama, 5-krol
    game: { type: Schema.Types.ObjectId, ref: 'Game' }
});

module.exports = mongoose.model("Piece", pieceSchema);