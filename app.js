const port = process.env.PORT || 3000
const db = require('./db')
const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const path = require('path')
const router = require('./routes/orders')
const methodOverride = require('method-override')
const BodyParser = require('body-parser')


nunjucks.configure('views', {noCache: true})
app.engine('html', nunjucks.render)
app.set('view engine', 'html')

app.use(BodyParser.urlencoded({extended: false}))
app.use(methodOverride('_method'));
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')))

app.use('/', router)


// which way is better?
// A?
/*
db.sync()
.then( () => {
  return db.seed()
})
.then( () => {
  app.listen(port, function(){
    console.log(`listening on port ${port}`)
  })
})
*/


  app.listen(port, function() {
    console.log(`listening on port ${port}`)
    db.sync()
    .then(()=> {
      return db.seed()
    })
  })

