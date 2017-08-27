const router = require('express').Router()
const db = require('../db')
const Promise = require('bluebird')
const Product = db.models.Product
const LineItem = db.models.LineItem
const Order = db.models.Order

router.get('/', (req, res, next)=> {
  Order.findEverything()
  .then( result => {
    res.render('index', result)
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
        return Order.findEverything()
        .then( result => {
          result.error = ex;
          return res.render('index', result)
        })
      }
      next(ex);
    });
})

module.exports = router

