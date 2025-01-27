// importações
const router = require('express').Router()

// rotas
router.get('/', (req,res) => {
    res.render('home/index')
})

router.get('/partitura', (req,res) => {
    res.render('home/partitura')
})

router.get('/pesquisa', (req,res) => {
    res.render('home/pesquisa')
})

router.get('/autor', (req,res) => {
    res.render('home/autor')
})

// exportação
module.exports = router