let createError = require('http-errors')
let express = require('express')
let path = require('path')
let cookieParser = require('cookie-parser')
let logger = require('morgan')

let indexRouter = require('./routes/index')
let usersRouter = require('./routes/users')

let mongoose = require('mongoose')
let config = require('./config')
mongoose.connect(`mongodb://${config.db.username}:${config.db.password}@${config.db.host}/${config.db.dbName}`, { useNewUrlParser: true })

let app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
let publicPath = path.resolve(__dirname, './public')
app.use(express.static(publicPath))

app.use('/', indexRouter)
app.use('/users', usersRouter)

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
