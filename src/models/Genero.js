// importações
const { DataTypes } = require('sequelize')
const sq = require('./db')

// config
const Genero = sq.define('generos', {
    nome: {
        type: DataTypes.STRING,
        allowNull:false
    }
})

// sincronizando tabela
Genero.sync().then(() => {
    console.log("Tabela 'Generos' OK!")
}).catch((err) => {
    console.log("Tabela 'Generos' Não OK!")
})

// exportação
module.exports = Genero

