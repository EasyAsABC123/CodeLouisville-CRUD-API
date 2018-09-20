let express = require('express')
let router = express.Router()
let User = require('../models/users.model.js')

function AddEditCollection (req, res, next) {
  let { username, collection } = req.params
  const collectionObject = {
    name: req.body.name,
    documents: req.body.documents,
    created_at: req.body.created_at
  }

  User.findOne({ username: username, deleted: { $ne: true } }, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }
    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested user was not found' })
    }

    let col = result.collections.find(n => n.name === collection)

    if (col) {
      col.deleted = false
      col.documents = Object.assign(col.documents, collectionObject.documents)
    } else {
      result.collections.push(collectionObject)
    }
    result.save((error) => {
      if (error) return res.status(500).json(error)

      // saved!
      return res.json(result.collections.find(n => n.name === collection))
    })
  })
}

function AddEditUser (req, res, next) {
  let user = req.params.username

  let userData = {
    name: req.body.name,
    username: req.body.username,
    collections: req.body.collections,
    created_at: req.body.created_at,
    deleted: req.body.deleted
  }

  let options
  if (req.method === 'POST') {
    options = { strict: false, upsert: true, new: true, setDefaultsOnInsert: true }
  } else {
    options = { strict: false, upsert: true, setDefaultsOnInsert: true }
  }

  // Find the document
  User.findOneAndUpdate({ username: user, deleted: { $ne: true } }, userData, options, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested user was not found' })
    }

    return res.json(result)
  })
}

function GetDeleteUser (req, res, next) {
  let user = req.params.username
  let searchOptions = { username: user }
  if (req.method === 'GET') Object.assign(searchOptions, { deleted: { $ne: true } })

  User.findOne(searchOptions, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested user was not found' })
    }

    if (req.method === 'DELETE') {
      result.deleted = true
      result.save(error => {
        if (error) return res.status(500).json(error)

        // saved!
        return res.json(result)
      })
    } else {
      return res.json(result)
    }
  })
}

function GetDeleteCollection(req, res, next) {
  let { username, collection } = req.params
  let searchOptions = { username: username, 'collections.name': collection }
  if (req.method === 'GET') Object.assign(searchOptions, { deleted: { $ne: true } })
  User.findOne(searchOptions, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested collection was not found or the username was not found' })
    }

    let docs = result.collections.find(n => n.name === collection)
    if (docs.deleted) return res.status(404).json({ 'error': 404, 'not found': 'The requested collection was deleted' })

    if(req.method === 'DELETE') {
      docs.deleted = true
      result.save(error => {
        if (error) return res.status(500).json(error)

        return res.json(docs)
      })
    } else {
      return res.json(docs.documents)
    }
  })
}

/* GET users listing. */
router.get('/:username', GetDeleteUser)

router.post('/:username', AddEditUser)

router.put('/:username', AddEditUser)

router.delete('/:username', GetDeleteUser)

router.get('/:username/:collection', GetDeleteCollection)

router.delete('/:username/:collection', GetDeleteCollection)

router.post('/:username/:collection', AddEditCollection)

router.put('/:username/:collection', AddEditCollection)

module.exports = router
