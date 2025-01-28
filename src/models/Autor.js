// importações
const { DataTypes } = require('sequelize')
const sq = require('./db')

// config
const Autor = sq.define('autores', {
    nome: {
        type: DataTypes.STRING,
        allowNull:false
    },
    pathFoto: {
        type: DataTypes.TEXT,
        allowNull:false
    }
})

// sincronizando tabela
Autor.sync().then(() => {
    console.log("Tabela 'Autores' OK!")
}).catch((err) => {
    console.log("Tabela 'Autores' Não OK!")
})

// exportação
module.exports = Autor

