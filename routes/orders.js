const router = require('express').Router()
const db = require('../db')
const Promise = require('bluebird')
const Product = db.models.Product
const LineItem = db.models.LineItem
const Order = db.models.Order
//const fs = require('fs')  was for generating pictures in public folder

router.get('/', (req, res, next)=> {
  Order.findEverything()
  .then( result => {
    res.render('index', result)
  })
      // var products, items;
      // return Product.findAll()
      // .then( allProducts => {
      //   products = allProducts

      //   /* for generating the pictures. only need to do it the first time.
      //   products.forEach(function(item){
      //     fs.writeFileSync(__dirname + '/../public/' + item.name + '.jpg', item.image)
      //   })
      //   */

      //   return Order.findAll({
      //     where: {
      //       isCart: true
      //     }
      //   })
      // })
      // .then( orders => {
      //   if (orders.length !== 0) {
      //     return orders[0].getLineitems()
      //     .then( allItems => {

      //       var tempArr = allItems.map(function(item){
      //         return LineItem.findOne({
      //           where: {
      //             id: item.id
      //           },
      //           include: [Product]
      //         })
      //       })
      //       return Promise.all(tempArr)
      //     })
      //     .then( finalItems => {
      //       // make it in order
      //       // is there any other way? I was thinking to use Promise.each but the order of the items still random...
      //       var sortedItems = []
      //       finalItems.forEach(function(item){
      //         sortedItems[item.id - 1] = item
      //       })
      //       items = sortedItems.filter(function(item) {
      //         return item.quantity !== null
      //       })
      //       return Order.findOrdersInfo()
      //     })
      //     .then( finalOrdersInfo => {
      //       res.render('index', {
      //         products: products,
      //         items: items,
      //         orders: finalOrdersInfo
      //       })
      //     })
      //   }
      //   else {
      //     Order.findOrdersInfo()
      //     .then( finalOrderInfo => {
      //       res.render('index', {products: products, orders: finalOrderInfo})
      //     })
      //   }
      // })
})

router.post('/:id/lineItems', (req, res, next) => {
  Order.addProductToCart(req.params.id * 1)
  .then( () => {
    res.redirect('/')
  })
  .catch(next)
})

router.delete('/:orderId/lineItems/:id', (req, res, next) => {
  Order.destroyLineItem(req.params.orderId, req.params.id)
  .then( () => res.redirect('/'))
  .catch(next)
})

router.put('/:id', (req, res, next)=> {

  Order.updateFromRequestBody(req.params.id, req.body)
    .then( () => res.redirect('/'))
    .catch(ex => {
      if (ex.errors[0].message === 'address required') {
        return Order.findEverything()
        .then( result => {
          result.error = ex;
          return res.render('index', result)
        })

        // var products, items;
        // return Product.findAll()
        // .then( allProducts => {
        //   products = allProducts

        //   return Order.findAll({
        //     where: {
        //       isCart: true
        //     }
        //   })
        // })
        // .then( orders => {
        //   if (orders.length !== 0) {
        //     return orders[0].getLineitems()
        //     .then( allItems => {

        //       var tempArr = allItems.map(function(item){
        //         return LineItem.findOne({
        //           where: {
        //             id: item.id
        //           },
        //           include: [Product]
        //         })
        //       })
        //       return Promise.all(tempArr)
        //     })
        //     .then( finalItems => {

        //       var sortedItems = []
        //       finalItems.forEach(function(item){
        //         sortedItems[item.id - 1] = item
        //       })
        //       items = sortedItems.filter(function(item) {
        //         return item.quantity !== null
        //       })
        //       return Order.findOrdersInfo()

        //     })
        //     .then( finalOrdersInfo => {
        //       return res.render('index', {
        //         products: products,
        //         items: items,
        //         orders: finalOrdersInfo,
        //         error: ex
        //       })
        //     })
        //   }
        //   else {
        //     Order.findOrdersInfo()
        //     .then( finalOrderInfo => {
        //       return res.render('index', {products: products, orders: finalOrderInfo, error: ex})
        //     })

        //   }
        // })
      }
      next(ex);
    });

})

module.exports = router

