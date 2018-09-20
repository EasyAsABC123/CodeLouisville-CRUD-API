let createError = require('http-errors')
let express = require('express')
let cookieParser = require('cookie-parser')
let logger = require('morgan')

let usersRouter = require('./routes/users')

let mongoose = require('mongoose')
let config = require('./config')
mongoose.connect(`mongodb://${config.db.username}:${config.db.password}@${config.db.host}/${config.db.dbName}`, { useNewUrlParser: true })

let app = express()

app.set('forceSSLOptions', {
  enable301Redirects: true,
  trustXFPHeader: false,
  httpsPort: 443,
  sslRequiredMessage: 'SSL Required.'
});

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./public/swagger.json')

let options = {
  'explorer': true
}

app.use('/users', usersRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
app.use('/', (req, res) => {
  res.redirect('/api-docs')
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
})

app.listen(config.port, () => {
  console.log(`${config.appName} is listening on port ${config.port}`)
})
