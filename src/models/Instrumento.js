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
    part_name: {
        type: DataTypes.STRING,
        defaultValue: 'part_name'
    },
    part_abbreviation: {
        type: DataTypes.STRING,
        defaultValue: 'part_abbreviation'
    },
    instrument_name: {
        type: DataTypes.STRING,
        defaultValue: 'instrument_name'
    },
    instrument_sound: {
        type: DataTypes.STRING,
        defaultValue: 'instrument_sound'
    },
    diatonic: {
        type: DataTypes.STRING,
        defaultValue: 'diatonic'
    },
    chromatic: {
        type: DataTypes.STRING,
        defaultValue: 'chromatic'
    },
    octave_change: {
        type: DataTypes.STRING,
        defaultValue: 'octave_change'
    },
    sign: {
        type: DataTypes.STRING,
        defaultValue: 'sign'
    },
    line: {
        type: DataTypes.STRING,
        defaultValue: 'line'
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

