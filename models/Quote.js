const mongoose = require('mongoose')
const Schema = mongoose.Schema

const quoteSchema = new Schema({
  artist: {type: String, required: true},
  songName: {type: String, required: true},
  quoteContent: {type: String, required: true},
  owner: {type: Schema.Types.ObjectId}
})

const Quote = mongoose.model('Quote', quoteSchema)

module.exports = Quote