// Load mongoose package
let mongoose = require('mongoose')
const Item = require('./item.model.js')

let CollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    documents: { type: [ Item ], default: [] },
    deleted: { type: Boolean, default: false }
  }
)

module.exports = CollectionSchema
