// importações
const { DataTypes } = require('sequelize')
const sq = require('./db')

const Instrumento = require('./Instrumento')
const Autor = require('./Autor')
const Genero = require('./Genero')

// config
const Musica = sq.define('musicas', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pathPNG: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pathPDF: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pathMXL: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pathMP3: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Definindo as chaves estrangeiras
Musica.belongsTo(Instrumento, {
    foreignKey: 'instrumento_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
Musica.belongsTo(Autor, {
    foreignKey: 'autor_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
Musica.belongsTo(Genero, {
    foreignKey: 'genero_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});

// sincronizando tabela
Musica.sync().then(() => {
    console.log("Tabela 'Musicas' OK!")
}).catch((err) => {
    console.log("Tabela 'Musicas' Não OK!")
})

// Exportando o modelo
module.exports = Musica;
