const router = require('express').Router()
const db = require('../db')
const Promise = require('bluebird')
const Product = db.models.Product
const LineItem = db.models.LineItem
const Order = db.models.Order
const fs = require('fs')

router.get('/', (req, res, next)=> {
      var products, items;
      return Product.findAll()
      .then( allProducts => {
        products = allProducts
        products.forEach(function(item){
          fs.writeFileSync(__dirname + '/../public/' + item.name + '.jpg', item.image)
        })
        return Order.findAll()
      })
      .then( orders => {
        if (orders.length !== 0) {
          return orders[0].getLineitems()
          .then( allItems => {

            var tempArr = allItems.map(function(item){
              return LineItem.findOne({
                where: {
                  id: item.id
                },
                include: [Product]
              })
            })
            return Promise.all(tempArr)
          })
          .then( finalItems => {
            // make it in order
            // is there any other way? I was thinking to use Promise.each but the order of the items still random...
            var sortedItems = []
            finalItems.forEach(function(item){
              sortedItems[item.id - 1] = item
            })

            res.render('index', {products: products, items: sortedItems})
          })
        }
        else {
          res.render('index', {products: products})
        }
      })

})

router.post('/:id/lineItems', (req, res, next) => {
  Order.addProductToCart(req.params.id * 1)
  .then( result => {
    res.redirect('/')
  })

})

module.exports = router

