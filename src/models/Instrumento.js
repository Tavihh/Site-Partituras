// importações
const { DataTypes } = require('sequelize')
const sq = require('./db')

// config
const Instrumento = sq.define('instrumentos', {
    nome: {
        type: DataTypes.STRING,
        allowNull:false
    },
    nomeExibicao: {
        type: DataTypes.STRING,
        allowNull:false
    }
})

// sincronizando tabela
Instrumento.sync().then(() => {
    console.log("Tabela 'Instrumentos' OK!")
}).catch((err) => {
    console.log("Tabela 'Instrumentos' Não OK!")
})

// exportação
module.exports = Instrumento

