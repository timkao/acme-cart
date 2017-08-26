// key is to use the same conn from conn.js and not to create another conn by declaring new Sequelize(process.env.DATABASE_URL)

const conn = require('./conn')
const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const Product = require('./product')
const Order = require('./Order')
const LineItem = require('./LineItem')

Order.hasMany(LineItem)
LineItem.belongsTo(Order)
LineItem.belongsTo(Product)

const models = {
  Product,
  Order,
  LineItem
}

const seed = function() {
  /*
  var blackTeaImage = fs.readFileSync(path.join(__dirname, '../taiwanblacktea.jpg'))
  var cakeImage = fs.readFileSync(path.join(__dirname, '../pineapplecake.jpeg'))
  var bubbleTeaImage = fs.readFileSync(path.join(__dirname, '../bubbletea.jpg'))
  */
  var onshelf = [
    ['Sun Moon Lake Black Tea'],//, blackTeaImage],
    ['Pineapple Cake'],//, cakeImage],
    ['Bubble Tea']//, bubbleTeaImage]
  ]

  return Promise.all(onshelf.map(function(item){
    Product.create({
      name: item[0]
      //image: item[1]
    })
  }))
}

const sync = () => conn.sync({force: true, logging: false})

module.exports = {
  sync,
  models,
  seed
}
