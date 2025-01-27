// importações
const { DataTypes } = require('sequelize')
const sq = require('./db')

// config
const User = sq.define('usuarios', {
    nome: {
        type: DataTypes.STRING,
        allowNull:false
    },
    sobrenome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type:DataTypes.STRING,
        allowNull: false
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    eAdmin: {
        type:DataTypes.BOOLEAN,
        defaultValue: false
    }
})

// sincronizando tabela
User.sync().then(() => {
    console.log("Tabela 'Usúarios' OK!")
}).catch((err) => {
    console.log("Tabela 'Usúarios' Não OK!")
})

// exportação
module.exports = User

