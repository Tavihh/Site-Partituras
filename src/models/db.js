// importações
const { Sequelize } = require('sequelize')

// config
const sequelize = new Sequelize('SitePartituras', 'root', 'P@cienc1a', {
    host: '147.93.68.67',
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