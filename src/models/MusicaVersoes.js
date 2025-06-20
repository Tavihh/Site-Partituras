// importações
const { DataTypes } = require('sequelize')
const sq = require('./db')

const Musica = require('./Musica')
const Instrumento = require('./Instrumento')
const Autor = require('./Autor')
const Genero = require('./Genero')

// config
const MusicaVersoes = sq.define('musicaversoes', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pathMXL: {
        type: DataTypes.STRING,
        allowNull: true
    },
});

// Definindo as chaves estrangeiras
MusicaVersoes.belongsTo(Musica, {
    foreignKey: 'musica_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
MusicaVersoes.belongsTo(Instrumento, {
    foreignKey: 'instrumento_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
MusicaVersoes.belongsTo(Autor, {
    foreignKey: 'autor_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
MusicaVersoes.belongsTo(Genero, {
    foreignKey: 'genero_id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
    
// sincronizando tabela
MusicaVersoes.sync().then(() => {
    console.log("Tabela 'Musicas Versões' OK!")
}).catch((err) => {
    console.log("Tabela 'Musicas Versões' Não OK!")
})

// Exportando o modelo
module.exports = MusicaVersoes;
