/* eslint-disable no-undef,no-unused-vars,handle-callback-err */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

let Users = require('../models/users.model')

// Require the dev-dependencies
let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app')
let should = chai.should()

let added = false

let invalidUser = {
  'name': 'Fake User',
  'collections': []
}

let exampleUser = {
  'name': 'Test User 2',
  'username': 'testuser2',
  'collections': [
    {
      'name': 'shirts',
      'documents': [
        {
          'value': {
            'name': 'iron man',
            'price': 20.50,
            'description': 'awesome shirt with iron man on it',
            'image': 'https://images-na.ssl-images-amazon.com/images/I/71Lv55DbRyL._UX679_.jpg'
          }
        },
        {
          'value': {
            'name': 'cat',
            'price': 19.50,
            'description': 'right meow this shirt is hot',
            'image': 'https://res.cloudinary.com/teepublic/image/private/s--DYMp0_fm--/t_Preview/b_rgb:262c3a,c_limit,f_jpg,h_630,q_90,w_630/v1453089772/production/designs/397266_1.jpg'
          }
        }
      ]
    },
    {
      'name': 'pants',
      'documents': [
        {
          'value': {
            'name': 'dress pants',
            'price': 120.50,
            'description': 'awesome pants for cool stuff',
            'image': 'https://images.express.com/is/image/expressfashion/35_383_2882_098_01?cache=on&wid=960&fmt=jpeg&qlt=85,1&resmode=sharp2&op_usm=1,1,5,0&defaultImage=Photo-Coming-Soon'
          }
        },
        {
          'value': {
            'name': 'jeans',
            'price': 49.99,
            'description': "don't be blue",
            'image': 'https://cdn.shopify.com/s/files/1/0293/9277/products/Fashion_Nova_07-07_13_1000x.JPG?v=1534970983'
          }
        }
      ]
    }
  ]
}

// Polls `someCondition` every 1s
let check = (done) => {
  if (added) done()
  else setTimeout(() => { check(done) }, 1000)
}

chai.use(chaiHttp)
// Our parent block
describe('Users', () => {
  beforeEach((done) => { // Before each test we empty the database
    Users.remove({}, (err) => {
      done()
    })
  })
  /*
    * Test the /GET route
    */
  describe('/GET user', () => {
    it('it should GET a user', (done) => {
      chai.request(server)
        .get('/users/fakeuser')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.name.should.be.equal('Fake User')
          res.body.username.should.be.equal('fakeuser')
          res.body.deleted.should.be.equal(false)
          res.body.collections.should.be.a('array')
          res.body.collections.length.should.be.eql(2)

          done()
        })
    })
  })

  describe('/GET user', () => {
    it('it should fail to GET a user', (done) => {
      chai.request(server)
        .get('/users/invaliduser')
        .end((err, res) => {
          res.should.have.status(404)
          res.body.should.be.a('object')
          res.body.error.should.be.equal(404)
          res.body.message.should.be.equal('The requested user was not found')

          done()
        })
    })
  })

  /*
  * Test the /POST route
  */
  describe('/POST user', () => {
    it('it should POST a user', (done) => {

      chai.request(server)
        .post('/users')
        .send(exampleUser)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')

          added = true
          done()
        })
    })

    it('it should fail to POSt a user', (done) => {
      chai.request(server)
        .post('/users')
        .send(invalidUser)
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.a('object')
          res.body.error.should.be.equal(400)
          res.body.message.should.be.equal('name and username required')

          done()
        })
    })
  })

  describe('/PUT user', () => {
    before(function (done) {
      check(done)
    })

    it('it should PUT a user', (done) => {
      console.log(exampleUser)
      exampleUser.username = 'testuser3'
      chai.request(server)
        .put('/users/testuser2')
        .send(exampleUser)
        .end((err, res) => {
          console.log(res.body)
          res.should.have.status(200)
          res.body.should.be.a('object')

          done()
        })
    })
  })
})
