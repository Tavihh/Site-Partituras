// importações
const router = require('express').Router()
const Musica = require('../models/Musica')
const Instrumento = require('../models/Instrumento');
const Autor = require('../models/Autor');
const Genero = require('../models/Genero');
const Op = require('sequelize').Op

// rotas
router.get('/', async (req,res) => {
    // Busca os Instrumentos
    let instrumentos = await Instrumento.findAll();
    instrumentos = await Promise.all(instrumentos.map(async (item) => {
        item = item.toJSON()
        // Para cada instrumento ele busca suas músicas
        let musicas = await Musica.findAll({where:{instrumento_id:item.id},limit:20})
        item.musicas = await Promise.all(musicas.map(musica => musica.toJSON()))
        // Caso não tenha nenhumca adiciona um valor booleano true
        if(musicas.length > 0) {
        item.temMusica = true
        }
        return item
    }));
    // renderiza
    res.locals.instrumentos = instrumentos
    res.render('home/index')
})

router.get('/partitura/:id', async (req,res) => {
    const id = req.params.id
    Musica.findOne({
        where:{id:id},
        include:[
            {model:Autor,attributes:['id','nome','pathFoto']},
            {model:Instrumento,attributes:['id','nome']},
            {model:Genero,attributes:['id','nome']}
        ]
    }).then(async (musica) => {
        let musicas = await Musica.findAll({where:{instrumento_id:musica.instrumento_id}})

        res.locals.musica = musica.toJSON()
        res.locals.musicas = musicas.map(item => item.toJSON())
        res.render('home/partitura')
    }).catch((err) => {
        req.flash('error_msg','Música não existe')
        res.redirect('/')
    })

})

router.get('/pesquisa', async (req,res) => {
    const psq = req.query.psq

    // Busca os Autores
    let autores = await Autor.findAll({where:{nome:{[Op.like]:`%${psq}%`}}})
    // Busca os Instrumentos
    let instrumentos = await Instrumento.findAll();
    instrumentos = await Promise.all(instrumentos.map(async (item) => {
        item = item.toJSON()
        // Para cada instrumento ele busca suas músicas
        let musicas = await Musica.findAll({where:{instrumento_id:item.id,nome:{[Op.like]:`%${psq}%`}},limit:20})
        item.musicas = await Promise.all(musicas.map(musica => musica.toJSON()))
        // Caso não tenha nenhumca adiciona um valor booleano true
        if(musicas.length > 0) {
        item.temMusica = true
        }
        return item
    }));
    // renderiza
    res.locals.instrumentos = instrumentos
    res.locals.autores = await autores.map(item => item.toJSON())
    res.render('home/pesquisa')
})

router.get('/autor/:id', async (req,res) => {
    const id = req.params.id
    // Busca o Autor
    let autor = await Autor.findOne({where:{id:id}})

    // Busca os Instrumentos
    let instrumentos = await Instrumento.findAll();
    instrumentos = await Promise.all(instrumentos.map(async (item) => {
        item = item.toJSON()
        // Para cada instrumento ele busca suas músicas
        let musicas = await Musica.findAll({where:{instrumento_id:item.id,autor_id:id}})
        item.musicas = await Promise.all(musicas.map(musica => musica.toJSON()))
        // Caso não tenha nenhumca adiciona um valor booleano true
        if(musicas.length > 0) {
        item.temMusica = true
        }
        return item
    }));
    // renderiza
    res.locals.instrumentos = instrumentos
    res.locals.autor = autor.toJSON()
    res.render('home/autor')
})

// exportação
module.exports = router