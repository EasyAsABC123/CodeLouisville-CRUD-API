// Load mongoose package
let mongoose = require('mongoose')
const { ItemSchema } = require('./item.model.js')

let CollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    documents: { type: [ ItemSchema ], default: [] },
    deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
  }
)

const Collection = mongoose.model('Collection', CollectionSchema)

module.exports = {
  Collection,
  CollectionSchema
}
