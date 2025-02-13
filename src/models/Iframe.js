// importações
const { DataTypes, UUIDV4 } = require('sequelize')
const sq = require('./db')

const Musica = require('./Musica')
const Usuario = require('./User')
const Instrumento = require('./Instrumento')
const Autor = require('./Autor')


// config
const Iframe = sq.define('iframes', {
    UUID: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    iframeCode: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pendente','aprovado','rejeitado'),
        allowNull: false,
        defaultValue:'pendente'
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // inicializa com 0 visualizações
    }
});

// Definindo as chaves estrangeiras
Iframe.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Iframe.belongsTo(Musica, {
    foreignKey: 'musica_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Iframe.belongsTo(Instrumento, {
    foreignKey: 'instrumento_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Iframe.belongsTo(Autor, {
    foreignKey: 'autor_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

// sincronizando tabela
Iframe.sync().then(() => {
    console.log("Tabela 'Iframes' OK!")
}).catch((err) => {
    console.log("Tabela 'Iframes' Não OK!")
})

// Exportando o modelo
module.exports = Iframe;
