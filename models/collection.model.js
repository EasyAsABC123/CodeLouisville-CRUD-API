// Load mongoose package
let mongoose = require('mongoose')

let CollectionSchema = new mongoose.Schema({ name: String, documents: [mongoose.Schema.Types.Mixed], deleted: Boolean })

module.exports = CollectionSchema
