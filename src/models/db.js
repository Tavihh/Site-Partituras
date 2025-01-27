// importações
const { Sequelize } = require('sequelize')

// config
const sequelize = new Sequelize('SitePartituras', 'root', 'P@cienc1a', {
    host: 'localhost',
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