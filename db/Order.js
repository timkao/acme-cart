const Sequelize = require('sequelize')
const conn = require('./conn')

const Order = conn.define('order', {
  isCart: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  address: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'address required'
      }
    }
  }
}
)

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

Order.findOrdersInfo = function() {
  var orders;
  // get only placed orders
  return this.findAll({
    where: {
      isCart: false
    }
  })
  .then( allFOrders => {
    orders = allFOrders;
    var orderIdArr = orders.map(function(order){
      return order.id
    })

    return conn.models.lineitem.findAll({
      where: {
        orderId: {
          $in: orderIdArr
        }
      }
    })
  })
  .then( allFItems => {
    var tempArr2 = allFItems.map(function(item){
      return conn.models.lineitem.findOne({
        where: {
          id: item.id
        },
        include: [conn.models.product, conn.models.order]
      })
    })
    return Promise.all(tempArr2)
  })
  .then( allFInfo => {
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
    return FinalOrderInfo
  })

}

Order.findEverything = function() {
  var products, items;
  return conn.models.product.findAll()
  .then( allProducts => {
      //   /* for generating the pictures. only need to do it the first time.
      //   products.forEach(function(item){
      //     fs.writeFileSync(__dirname + '/../public/' + item.name + '.jpg', item.image)
      //   })
      //   */
    products = allProducts
    return this.findAll({
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
          return conn.models.lineitem.findOne({
            where: {
              id: item.id
            },
            include: [conn.models.product]
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
        return this.findOrdersInfo()
      })
      .then( finalOrdersInfo => {
        return {
          products: products,
          items: items,
          orders: finalOrdersInfo
        }
      })
    }
    else {
      return this.findOrdersInfo()
      .then( finalOrdersInfo => {
        return {
          products: products,
          orders: finalOrdersInfo
        }
      })
    }
  })
}

module.exports = Order
