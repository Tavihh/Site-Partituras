// importações
const { Sequelize } = require('sequelize')

// config
const sq = new Sequelize({
    storage: 'src/config/database.sqlite',
    dialect: 'sqlite',
    logging: false
})

// autenticando conexão
sq.authenticate().then(() => {
    console.log("MySQL conectado!")
}).catch((err) => {
    console.log("MySQL falhou!")
})



// exportação
module.exports = sq