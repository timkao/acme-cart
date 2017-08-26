const Sequelize = require('sequelize')
const conn = require('./conn')

const Order = conn.define('order', {
  isCart: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  address: {
    type: Sequelize.STRING
  }
})

// key: should use "conn", instead of importing again the models from their js file!
Order.addProductToCart = function(id) {

  var target, currentCart;
  return this.findAll({
    where: {
      isCart: true
    }
  })
  .then( result => {
    currentCart = result
    if (result.length === 0) {
      return conn.models.lineitem.create()
      .then( line => {
        target = line
        return conn.models.product.findById(id)
      })
      .then( product => {
        return target.setProduct(product)
      })
      .then( result => {
        return this.create({isCart: true})
      })
      .then( cart => {
        return cart.addLineitem(target)
      })
      .then( cart => {
        return target.setOrder(cart)
      })
    }
    else {
      // search in the cart to see if the product already exist
      return result[0].getLineitems() //array
      .then( items => {
        if (items.some(function(item){return item.productId === id})){
          // found match => do not create another lineitem
          return conn.models.lineitem.findOne({
            where: {
              productId: id
            }
          })
          .then( line => {
            line.quantity += 1
            return line.save()
          })
        }
        else {
          // no mathc => create a new lineitem
          return conn.models.lineitem.create()
          .then( line => {
            target = line
            return conn.models.product.findById(id)
          })
          .then( product => {
            return target.setProduct(product)
          })
          .then( result => {
            return currentCart[0].addLineitem(target)
          })
          .then( result => {
            return target.setOrder(currentCart[0])
          })
        }
      })
    }

  })
}

Order.destroyLineItem = function(orderId, itemId) {
  return this.findById(orderId)
  .then( order => {
    return conn.models.lineitem.findById(itemId)
    .then( item => {
      return order.removeLineitem(item)
    })
    .then( result => {
      return conn.models.lineitem.destroy({
        where: {
          id: itemId
        }
      })
    })
  })
}

Order.updateFromRequestBody = function(orderId, reqBody) {
  return this.update({
    isCart: false,
    address: reqBody.address
  }, {
    where: {
      id: orderId
    }
  })
}


module.exports = Order
