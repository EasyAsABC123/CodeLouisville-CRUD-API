let express = require('express')
let router = express.Router()
let User = require('../models/users.model.js')

/* GET users listing. */
router.get('/:username', (req, res, next) => {
  let user = req.params.username
  User.findOne({ username: user, deleted: { $ne: true } }, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested user was not found' })
    }

    return res.json(result)
  })
})

router.post('/:username', (req, res, next) => {
  let user = req.params.username

  let userData = {
    name: req.body.name,
    username: req.body.username,
    collections: req.body.collections,
    created_at: req.body.created_at,
    deleted: req.body.deleted
  }
  let options = { strict: false, upsert: true, new: true, setDefaultsOnInsert: true }

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
})

router.put('/:username', (req, res, next) => {
  let user = req.params.username

  let userData = {
    name: req.body.name,
    username: req.body.username,
    collections: req.body.collections,
    created_at: req.body.created_at,
    deleted: req.body.deleted
  }
  let options = { strict: false, upsert: true, setDefaultsOnInsert: true }

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
})

router.delete('/:username', (req, res, next) => {
  let user = req.params.username

  User.findOne({ username: user }, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested user was not found' })
    }

    result.deleted = true
    result.save(error => {
      if (error) return res.status(500).json(error)

      // saved!
      return res.json(result)
    })
  })
})

router.get('/:username/:collection', (req, res, next) => {
  let { username, collection } = req.params
  User.findOne({ username: username, 'collections.name': collection, deleted: { $ne: true } }, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested collection was not found or the username was not found' })
    }

    let docs = result.collections.find(n => n.name === collection)
    if (docs.deleted) return res.status(404).json({ 'error': 404, 'not found': 'The requested collection was deleted' })

    return res.json(docs.documents)
  })
})

router.delete('/:username/:collection', (req, res, next) => {
  let { username, collection } = req.params
  User.findOne({ username: username, deleted: { $ne: true } }, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    if (!result) {
      return res.status(404).json({ 'error': 404, 'not found': 'The requested user was not found' })
    }

    result.collections.find(n => n.name === collection).deleted = true
    result.save(error => {
      if (error) return res.status(500).json(error)

      return res.json(result.collections.find(n => n.name === collection))
    })
  })
})

router.post('/:username/:collection', (req, res, next) => {
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
})

router.put('/:username/:collection', (req, res, next) => {
  let { username, collection } = req.params
  const collectionObject = {
    name: req.body.name,
    documents: req.body.documents,
    created_at: req.body.created_at,
    deleted: req.body.deleted
  }

  User.findOne({ username: username, deleted: { $ne: true } }, (error, result) => {
    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }
    let col = result.collections.find(n => n.name === collection)

    if (col) {
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
})

module.exports = router
