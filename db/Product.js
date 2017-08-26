const Sequelize = require('sequelize')
const conn = require('./conn')

const Product = conn.define('product', {
  name: {
    type: Sequelize.STRING,
    //allowNull: false
  }
  /*
  image: {
    type: Sequelize.BLOB('long')
  }
  */
})

module.exports = Product
