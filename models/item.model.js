// Load mongoose package
let mongoose = require('mongoose')

let ItemSchema = new mongoose.Schema(
  {
    value: { type: mongoose.Schema.Types.Mixed },
    deleted: { type: Boolean, default: false }
  }
)

const Item = mongoose.model('Item', ItemSchema)

module.exports = {
  Item,
  ItemSchema
}
