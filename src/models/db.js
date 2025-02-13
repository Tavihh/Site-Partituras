// importações
const { Sequelize } = require('sequelize')

// config
const sequelize = new Sequelize({
    storage: 'database.sqlite',
    dialect: 'sqlite',
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