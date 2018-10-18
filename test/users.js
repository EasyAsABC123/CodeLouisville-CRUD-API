/* eslint-disable no-undef,no-unused-vars,handle-callback-err */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

let Users = require('../models/users.model')

// Require the dev-dependencies
let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app')
let should = chai.should()

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
      let user = {
        'name': 'Test User',
        'username': 'testuser',
        'collections': [
        ]
      }
      chai.request(server)
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')

          done()
        })
    })
  })
})
