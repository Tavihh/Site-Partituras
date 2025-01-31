// importações
const { Sequelize } = require('sequelize')
require('dotenv').config({path:'.env'})

const user = process.env.DB_USER
const pass = process.env.DB_PASS
const host = process.env.DB_HOST
const database = process.env.DB_DATABASE

// config
const sequelize = new Sequelize(database, user, pass, {
    host: host,
    dialect: 'mysql',
    logging: false
})

// autenticando conexão
sequelize.authenticate().then(() => {
    console.log("MySQL conectado!")
}).catch((err) => {
    console.log("MySQL falhou!")
})

// exportação
module.exports = sequelize