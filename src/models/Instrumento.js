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
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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

