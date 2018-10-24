let express = require('express')
let router = express.Router()
let User = require('../models/users.model.js')
let { Collection } = require('../models/collection.model.js')
let { Item } = require('../models/item.model.js')

async function AddEditCollection (req, res, next) {
  const { username, collection } = req.params
  const collectionObject = mapCollection(req.body, res)

  let searchOptions = { username: username, deleted: { $ne: true } }
  if (req.method === 'PUT') {
    searchOptions = Object.assign(searchOptions, { 'collections.name': collection })
  }

  let result = await User.findOne(searchOptions)
  if (!result) {
    return res.status(404).json({ 'error': 404, 'message': 'The requested user was not found' })
  }
  if (result.errors) {
    console.error(result.errors)
    return res.status(500).json({ 'error': 500, 'message': result.errors })
  }

  let col = result.collections.find(n => n.name === collection)

  if (col) {
    col.deleted = false
    col.documents = Object.assign(col.documents, collectionObject.documents)
    result.markModified('collections')
  } else {
    result.collections.push(collectionObject)
  }

  result.save((error) => {
    if (error) return res.status(500).json(error)

    return res.json(result.collections.find(n => n.name === collection))
  })
}

async function SaveUser (userData, res, options = {}) {
  let user = new User(userData)
  user.save(options, (err, user) => {
    if (err) return res.status(500).json({ 'error': 500, 'message': err })

    return res.json(user)
  })
}

async function UpdateUser (userData, res, options = {}) {
  let user = new User(userData)
  
  let updatedUser = {};
  updatedUser = Object.assign(updatedUser, user._doc);
  delete updatedUser._id;

  User.update({ username: user.username }, updatedUser, (err, user) => {
    if (err) return res.status(500).json({ 'error': 500, 'message': err })

    return res.json(user)
  })
}

async function AddEditUser (req, res, next) {
  let user = req.params.username

  let userData = {
    name: req.body.name,
    username: req.body.username,
    collections: mapCollections(req.body.collections, res),
    created_at: req.body.created_at,
    deleted: req.body.deleted
  }

  if (!userData.name || !userData.username) {
    return res.status(400).json({ 'error': 400, 'message': 'name and username required' })
  }

  if (req.method === 'POST') {
    return SaveUser(userData, res)
  } else {
    if (user.toLowerCase() !== userData.username.toLowerCase()) {
      let result = await User.findOne({ username: userData.username })
      if (!result) {
        return UpdateUser(userData, res)
      }

      return res.status(409).json({ 'error': 409, 'message': 'username already in use' })
    }

    return UpdateUser(userData, res)
  }
}

async function GetDeleteUser (req, res, next) {
  let user = req.params.username
  let searchOptions = { username: user }
  if (req.method === 'GET') Object.assign(searchOptions, { deleted: { $ne: true } })

  let result = await User.findOne(searchOptions)
  if (!result) {
    return res.status(404).json({ 'error': 404, 'message': 'The requested user was not found' })
  }
  if (result.errors) {
    return res.status(500).json({ 'error': 500, 'message': result.errors })
  }

  if (req.method === 'DELETE') {
    result.deleted = true
    result.save((error) => {
      if (error) return res.status(500).json(error.message)
      return res.json(result)
    })
  } else {
    return res.json(result)
  }
}

async function GetDeleteCollection (req, res, next) {
  let { username, collection } = req.params
  let searchOptions = { username: username, 'collections.name': collection }
  if (req.method === 'GET') Object.assign(searchOptions, { deleted: { $ne: true } })
  let result = await User.findOne(searchOptions)
  if (!result) {
    return res.status(404).json({ 'error': 404, 'message': 'The requested collection was not found or the username was not found' })
  }
  if (result.errors) {
    console.error(result.errors)
    return res.status(500).json({ 'error': 500, 'message': result.errors })
  }

  let docs = result.collections.find(n => n.name === collection)
  if (docs.deleted) return res.status(404).json({ 'error': 404, 'message': 'The requested collection was deleted' })

  if (req.method === 'DELETE') {
    docs.deleted = true
    result.markModified('collections')
    result.save((error) => {
      if (error) return res.status(500).json({ 'error': 500, 'message': error.message })
      return res.json(docs)
    })
  } else {
    return res.json(docs.documents)
  }
}

async function GetDeleteItem (req, res, next) {
  let { username, collection, id } = req.params
  let searchOptions = { username: username, 'collections.name': collection, 'collections.documents._id': id }
  if (req.method === 'GET') Object.assign(searchOptions, { deleted: { $ne: true } })
  let result = await User.findOne(searchOptions)
  if (!result) {
    return res.status(404).json({ 'error': 404, 'message': 'The requested collection was not found or the username was not found' })
  }
  if (result.errors) {
    console.error(result.errors)
    return res.status(500).json({ 'error': 500, 'message': result.errors })
  }

  let docs = result.collections.find(n => n.name === collection)
  let doc = docs.documents.find(n => n.id === id)
  if (doc.deleted) return res.status(404).json({ 'error': 404, 'message': 'The requested item was deleted' })

  if (req.method === 'DELETE') {
    doc.deleted = true
    result.markModified('collections')
    let save = await result.save()
    if (!save) return res.status(500).json({ 'error': 500, 'message': save })
    return res.json(doc)
  } else {
    return res.json(doc)
  }
}

/* Model instance utility functions */
const mapCollections = (collections, res) => collections.map(c => mapCollection(c, res))
const mapCollection = (collection, res) => {
  let col = new Collection(collection)
  col.documents = mapItems(collection.documents, res)
  return col
}
const mapItems = (documents, res) => documents
  .map(d => new Item(validateItem(d, res)))

const validateItem = (item, res) => {
  return item.value 
    ? item
    : res.status(400).json({ 'error': 400, 'message': 'Items must include a "value" field.' })
}

router.get('/:username', GetDeleteUser)
router.post('/', AddEditUser)
router.put('/:username', AddEditUser)
router.delete('/:username', GetDeleteUser)
router.get('/:username/:collection', GetDeleteCollection)
router.delete('/:username/:collection', GetDeleteCollection)
router.post('/:username/:collection', AddEditCollection)
router.put('/:username/:collection', AddEditCollection)
router.get('/:username/:collection/:id', GetDeleteItem)
router.delete('/:username/:collection/:id', GetDeleteItem)

module.exports = router
