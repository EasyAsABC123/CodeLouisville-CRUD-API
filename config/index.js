var path = require('path')
require('dotenv-flow').config({ cwd: path.resolve(__dirname) })

module.exports = {
  port: process.env.PORT || 3030,
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dbName: process.env.DB_NAME
  }
}
