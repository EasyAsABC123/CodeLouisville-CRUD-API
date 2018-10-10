// Load mongoose package
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const Collection = require('./collection.model.js')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  collections: { type: [Collection], default: [] },
  created_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false }
})

UserSchema.plugin(uniqueValidator);
const User = mongoose.model('User', UserSchema)

User.countDocuments({}, function (err, count) {
  if (err) {
    throw err
  }
  if (count > 0) return

  const seedUsers = require('./users.seed.json')
  User.create(seedUsers, function (err, newUsers) {
    if (err) {
      throw err
    }
    console.log('DB seeded w/', newUsers)
  })
})

module.exports = User
