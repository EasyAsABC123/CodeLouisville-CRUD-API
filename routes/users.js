let express = require('express')
let router = express.Router()
let User = require('../models/users.model.js')

async function AddEditCollection (req, res, next) {
  let { username, collection } = req.params
  const collectionObject = {
    name: req.body.name,
    documents: req.body.documents,
    created_at: req.body.created_at
  }
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

  if (result) {
    result.deleted = false
    result.documents = Object.assign(result.documents, collectionObject.documents)
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
  user.update(options, (err, user) => {
    if (err) return res.status(500).json({ 'error': 500, 'message': err })

    return res.json(user)
  })
}

async function AddEditUser (req, res, next) {
  let user = req.params.username

  let userData = {
    name: req.body.name,
    username: req.body.username,
    collections: req.body.collections,
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
  let searchOptions = { username: username, 'collections.name': collection, 'collections.documents.id': id }
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
  let doc = docs.collections.find(n => n._id === id)
  if (doc.deleted) return res.status(404).json({ 'error': 404, 'message': 'The requested item was deleted' })

  if (req.method === 'DELETE') {
    doc.deleted = true
    result.markModified('collections')
    let save = await result.save()
    if (save) return res.status(500).json({ 'error': 500, 'message': save })
    return res.json(doc)
  } else {
    return res.json(doc)
  }
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

module.exports = router
