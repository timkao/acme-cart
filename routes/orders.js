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
        /*
        products.forEach(function(item){
          fs.writeFileSync(__dirname + '/../public/' + item.name + '.jpg', item.image)
        })
        */
        return Order.findAll({
          where: {
            isCart: true
          }
        })
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
            items = sortedItems.filter(function(item) {
              return item.quantity !== null
            })
            return Order.findOrdersInfo()
            //res.render('index', {products: products, items: items})
          })
          .then( finalOrdersInfo => {
            res.render('index', {
              products: products,
              items: items,
              orders: finalOrdersInfo
            })
          })
        }
        else {
          Order.findOrdersInfo()
          .then( finalOrderInfo => {
            res.render('index', {products: products, orders: finalOrderInfo})
          })
          /*
          return Order.findAll({
            where: {
              isCart: false
            }
          })
          .then( allFOrders => {
            orders = allFOrders;
            var orderIdArr = orders.map(function(order){
              return order.id
            })

            return LineItem.findAll({
              where: {
                orderId: {
                  $in: orderIdArr
                }
              }
            })
          })
          .then( allFItems => {
            var tempArr2 = allFItems.map(function(item){
              return LineItem.findOne({
                where: {
                  id: item.id
                },
                include: [Product, Order]
              })
            })
            return Promise.all(tempArr2)
          })
          .then( allFInfo => {
            //console.log(allFInfo)
            var FinalOrderInfo = {}
            // Order ID, order address, product name, product quantity

            allFInfo.forEach(function(line) {
              if (!Object.keys(FinalOrderInfo).includes(line.orderId.toString())) {
                FinalOrderInfo[line.orderId] = []
                var temp = {}
                temp['address'] = line.order.address
                temp['name'] = line.product.name
                temp['quantity'] = line.quantity
                FinalOrderInfo[line.orderId].push(temp)
              }
              else {
                var temp2 = {}
                temp2['address'] = line.order.address
                temp2['name'] = line.product.name
                temp2['quantity'] = line.quantity
                FinalOrderInfo[line.orderId].push(temp2)
              }
            })
            //console.log(FinalOrderInfo)
            res.render('index', {products: products, orders: FinalOrderInfo})
          })
          */
        }
      })

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
        var products, items;
        return Product.findAll()
        .then( allProducts => {
          products = allProducts

          return Order.findAll({
            where: {
              isCart: true
            }
          })
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

              var sortedItems = []
              finalItems.forEach(function(item){
                sortedItems[item.id - 1] = item
              })
              items = sortedItems.filter(function(item) {
                return item.quantity !== null
              })
              return Order.findOrdersInfo()

            })
            .then( finalOrdersInfo => {
              return res.render('index', {
                products: products,
                items: items,
                orders: finalOrdersInfo,
                error: ex
              })
            })
          }
          else {
            Order.findOrdersInfo()
            .then( finalOrderInfo => {
              return res.render('index', {products: products, orders: finalOrderInfo, error: ex})
            })

          }
        })
      }
      next(ex);
    });

})

module.exports = router

