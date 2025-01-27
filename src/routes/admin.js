// importações
const router = require('express').Router()
const Instrumento = require('../models/Instrumento')
const Genero = require('../models/Genero')

// rotas
router.get('/', (req,res) => {
    Promise.all([
        Instrumento.findAll(),
        Genero.findAll()
    ]).then(([instrumentos,generos]) =>{
        res.locals.instrumentos = instrumentos.map(item => item.toJSON())
        res.locals.generos = generos.map(item => item.toJSON())

        res.render('admin/index', {layout:'admin'})
    }).catch((err) => {
        req.flash('error_msg','Não foi possivel buscar no banco de dados')
        res.render('admin/index', {layout:'admin'})
    })
})

// Rotas de Cadastro
router.get('/musica', (req,res) => {
    res.render('admin/addMusica', {layout:'admin'})
})

router.get('/autor', (req,res) => {
    res.render('admin/addAutor', {layout:'admin'})
})

router.get('/genero', (req,res) => {
    res.render('admin/addGenero', {layout:'admin'})
})

router.get('/instrumento', (req,res) => {
    res.render('admin/addInstrumento', {layout:'admin'})
})

router.post('/addInstrumento', (req,res) => {
    const nome = req.body.instrumento
    const nomeExibicao = req.body.nomeExibicao

    // verificando os inputs
    let erros = []

    if(!nome) {
        erros.push({texto:'Nome inválido'})
    }
    if(!nomeExibicao) {
        erros.push({texto:'Nome de Exibição inválido'})
    }
    if(nome < 3) {
        erros.push({texto:'Nome muito curto'})
    }
    if(nomeExibicao < 3) {
        erros.push({texto:'Nome de Exibição muito curto'})
    }
    // retornando os erros
    if(erros.length > 0) {
        res.render('usuario/registrar', {erros})
    } else {
        Instrumento.create({
            nome:nome,
            nomeExibicao:nomeExibicao
        }).then(() => {
            req.flash('success_msg', 'Instrumento cadastrado com sucesso')
            res.redirect('/admin/instrumento')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao cadastrar instrumento')
            res.redirect('/admin/instrumento')
        })
    }
})

router.post('/addGenero', (req,res) => {
    const nome = req.body.genero

    // verificando os inputs
    let erros = []

    if(!nome) {
        erros.push({texto:'Nome inválido'})
    }
    if(nome < 3) {
        erros.push({texto:'Nome muito curto'})
    }
    // retornando os erros
    if(erros.length > 0) {
        res.render('usuario/registrar', {erros})
    } else {
        Genero.create({
            nome:nome,

        }).then(() => {
            req.flash('success_msg', 'Genero cadastrado com sucesso')
            res.redirect('/admin/genero')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao cadastrar genero')
            res.redirect('/admin/genero')
        })
    }
})


// exportação
module.exports = router