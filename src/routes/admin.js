// importações
const router = require('express').Router()
const Musica = require('../models/Musica')
const Instrumento = require('../models/Instrumento')
const Genero = require('../models/Genero')
const Autor = require('../models/Autor')
const multer = require('multer')
const { autor, musica } = require('../config/multer')
const path = require('path')
const fs = require('fs')
const Iframe = require('../models/Iframe')
const { Op } = require('sequelize')
const User = require('../models/User')

// rotas
router.get('/', (req,res) => {
    Promise.all([
        Musica.findAll({include:[{model:Instrumento, attributes:['id','nome']}]}),
        Autor.findAll(),
        Instrumento.findAll(),
        Genero.findAll(),
        Iframe.findAll({include:[
            {model:Instrumento, attributes:['id','nome']},
            {model:Musica,attributes:['id','nome']},
            {model:User,attributes:['id','nome']}
        ],where:{
            [Op.or]: [
                { status:{[Op.like]: `aprovado`}},
                { status:{[Op.like]: `rejeitado`}}

            ]
        }}),
    ]).then(([musicas, autores ,instrumentos,generos,iframe]) =>{
        res.locals.musicas = musicas.map(item => item.toJSON())
        res.locals.autores = autores.map(item => item.toJSON())
        res.locals.instrumentos = instrumentos.map(item => item.toJSON())
        res.locals.generos = generos.map(item => item.toJSON())
        res.locals.iframes = iframe.map(item => item.toJSON())

        res.render('admin/index')
    }).catch((err) => {
        req.flash('error_msg','Não foi possivel buscar no banco de dados')
        res.render('admin/index')
    })
})

// Pesquisa
router.get('/psq', (req,res) => {
    const psq = req.query.psq

    Promise.all([
        Musica.findAll({include:[{model:Instrumento, attributes:['id','nome']}],where:{nome:{[Op.like]:`%${psq}%`}}}),
        Autor.findAll({where:{nome:{[Op.like]:`%${psq}%`}}}),
        Instrumento.findAll({where:{[Op.or]:[
            {nome:{[Op.like]:`%${psq}%`}},
            {nomeExibicao:{[Op.like]:`%${psq}%`}}
        ]}}),
        Genero.findAll({where:{nome:{[Op.like]:`%${psq}%`}}}),
        Iframe.findAll({include:[
            {model:Instrumento, attributes:['id','nome']},
            {model:Musica,attributes:['id','nome']},
            {model:User,attributes:['id','nome']}
        ],where:{
            [Op.or]: [
                { status:{[Op.like]: `aprovado`}},
                { status:{[Op.like]: `rejeitado`}},
                {'$usuario.nome$':{[Op.like]: `%${psq}%`}},
                {'$musica.nome$':{[Op.like]: `%${psq}%`}},
                {'$instrumento.nome$':{[Op.like]: `%${psq}%`}}
            ]
        }}),
    ]).then(([musicas, autores ,instrumentos, generos, iframes]) =>{
        res.locals.musicas = musicas.map(item => item.toJSON())
        res.locals.autores = autores.map(item => item.toJSON())
        res.locals.instrumentos = instrumentos.map(item => item.toJSON())
        res.locals.generos = generos.map(item => item.toJSON())
        res.locals.iframes = iframes.map(item => item.toJSON())

        res.render('admin/index')
    }).catch((err) => {
        req.flash('error_msg','Não foi possivel buscar no banco de dados')
        res.render('admin/index')
    })
})

// Rotas Interpretação
router.get('/interpretacoes', (req,res) => {

    // Pegando os Iframes
        Iframe.findAll({
            where: { status:'pendente' },
            include: [
                {
                    model: Musica,
                    attributes: ['id', 'nome']
                },
                {
                    model: Instrumento,
                    attributes: ['id', 'nome']
                }
            ]
    }).then((iframes) => {
        // Transformando em JSONS
        res.locals.iframes = iframes.map(item => item.toJSON())
        // Renderizando
        res.render('admin/interpretacoes')
    }).catch((err) => {
        req.flash('error_msg','Não foi possivel buscar os iframes')
        res.redirect('/admin')
    })

})

router.get('/interpretacoes/reject/:uuid', (req,res) => {
    const uuid = req.params.uuid

    Iframe.update({status:'rejeitado'},{where:{UUID:uuid}}).then(() => {
        req.flash('success_msg', "Iframe Atualizado para REJEITADO")
        res.redirect('/admin/interpretacoes')
    }).catch((err) => {
        req.flash('error_msg','Erro ao tentar atualizar Iframe')
        res.redirect('/admin/interpretacoes')
    })
})

router.get('/interpretacoes/accept/:uuid', (req,res) => {
    const uuid = req.params.uuid
    
    Iframe.update({status:'aprovado'},{where:{UUID:uuid}}).then(() => {
        req.flash('success_msg', "Iframe Atualizado para ACEITO")
        res.redirect('/admin/interpretacoes')
    }).catch((err) => {
        req.flash('error_msg','Erro ao tentar atualizar Iframe')
        res.redirect('/admin/interpretacoes')
    })
})

router.get('/view/:uuid', (req,res) => {
    const uuid = req.params.uuid

    Iframe.findOne({
        where:{UUID:uuid},
        include:[
            {
                model:Musica,
                attributes:['id','nome','pathPDF','pathMXL','pathMP3']
            },
            {
                model:Instrumento,
                attributes:['id','nome']
            },
            {
                model:Autor,
                attributes:['id','nome','pathFoto']
            }
        ]
    }).then((iframe) => {
        res.locals.iframe = iframe.toJSON()
        res.render('admin/view')
    }).catch((err) => {
        req.flash('error_msg', 'Interpretação não encontrada')
        res.redirect('/admin/interpretacoes')
    })
})


// Rotas GET Cadastro
router.get('/musica', (req,res) => {

    Promise.all([
        Instrumento.findAll(),
        Genero.findAll(),
        Autor.findAll()
    ]).then(([instrumento, genero, autor]) => {
        res.locals.instrumento = instrumento.map(item => item.toJSON())
        res.locals.genero = genero.map(item => item.toJSON())
        res.locals.autor = autor.map(item => item.toJSON())

        res.render('admin/add/addMusica')
    }).catch((err) => {
        req.flash('error_msg','Não foi possivel buscar as informações necessárias')
        res.redirect('/admin')
    })

})

router.get('/autor', (req,res) => {
    res.render('admin/add/addAutor')
})

router.get('/genero', (req,res) => {
    res.render('admin/add/addGenero')
})

router.get('/instrumento', (req,res) => {
    res.render('admin/add/addInstrumento')
})

// Rotas GET Editar
router.get('/musica/:id', (req,res) => {
    // Buscando dados
    Promise.all([
        Musica.findOne({where:{id:req.params.id}}),
        Instrumento.findAll(),
        Genero.findAll(),
        Autor.findAll()
    ]).then(([musica, instrumento, genero, autor]) => {
       res.locals.musica = musica.toJSON()
        // Adiciona os Selecteds e converte para JSON
       res.locals.instrumento = instrumento.map(item => {
            item = item.toJSON()
            if (item.id == musica.instrumento_id) {
                item.selected = true
            }
            return item
        })
       res.locals.genero = genero.map(item => {
            item = item.toJSON()
            if (item.id == musica.genero_id) {
                item.selected = true
            }
            return item
        })
       res.locals.autor = autor.map(item => {
            item = item.toJSON()
            if (item.id == musica.autor_id) {
                item.selected = true
            }
            return item
        })

        // renderizando a tela
        res.render('admin/edit/editMusica')

    // tratando erros
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg','informações necessárias não encontradas ou Música não existe')
        res.redirect('/admin')
    })

})

router.get('/autor/:id', (req,res) => {
    // Buscando dados
    Autor.findOne({where:{id:req.params.id}}).then((autor) => {
        if (autor) {
            res.locals.autor =  autor.toJSON()
            res.render('admin/edit/editAutor')
        } else {
            req.flash('error_msg','Esse Autor não existe')
            res.redirect('/admin')
        }
    })

})

router.get('/genero/:id', (req,res) => {
    // Buscando dados
    Genero.findOne({where:{id:req.params.id}}).then((genero) => {
        if (genero) {
            res.locals.genero =  genero.toJSON()
            res.render('admin/edit/editGenero')
        } else {
            req.flash('error_msg','Esse Gênero não existe')
            res.redirect('/admin')
        }
    })
})

router.get('/instrumento/:id', (req,res) => {
    // Buscando dados
    Instrumento.findOne({where:{id:req.params.id}}).then((instrumento) => {
        if (instrumento) {
            res.locals.instrumento =  instrumento.toJSON()
            res.render('admin/edit/editInstrumento')
        } else {
            req.flash('error_msg','Esse Instrumento não existe')
            res.redirect('/admin')
        }
    })
})

// Rotas GET Deletar
router.get('/confirmDelMusica/:id', (req,res) => {
    const id = req.params.id

    // Busca a Música
    Musica.findByPk(id).then((musica) => {
        res.locals.musica = musica.toJSON()
        res.render('admin/del/delMusica')
    // Trata o Erro
    }).catch((err) => {
        req.flash('error_msg','Música não encontrada')
        res.redirect('/admin')
    })
})

router.get('/confirmDelAutor/:id', (req,res) => {
    const id = req.params.id

    // Busca o Autor
    Autor.findByPk(id).then((autor) => {
        res.locals.autor = autor.toJSON()
        res.render('admin/del/delAutor')
    // Trata o Erro
    }).catch((err) => {
        req.flash('error_msg','Autor não encontrado')
        res.redirect('/admin')
    })
    
})

router.get('/confirmDelGenero/:id', (req,res) => {
    const id = req.params.id

    // Busca o Gênero
    Genero.findByPk(id).then((genero) => {
        res.locals.genero = genero.toJSON()
        res.render('admin/del/delGenero')
    // Trata o Erro
    }).catch((err) => {
        req.flash('error_msg','Gênero não encontrado')
        res.redirect('/admin')
    })
    
})

router.get('/confirmDelInstrumento/:id', (req,res) => {
    const id = req.params.id
    // Busca o Instrumento
    Instrumento.findByPk(id).then((instrumento) => {
        res.locals.instrumento = instrumento.toJSON()
        res.render('admin/del/delInstrumento')
    // Trata o Erro
    }).catch((err) => {
        req.flash('error_msg','Instrumento não encontrado')
        res.redirect('/admin')
    })

})

// Rotas POST Cadastro
router.post('/addMusica', (req,res) => {
    // upload da foto
    const upload = multer({storage:musica}).fields([
        {name:'file-PNG',maxCount:1},
        {name:'file-PDF',maxCount:1},
        {name:'file-MXL',maxCount:1},
        {name:'file-MP3',maxCount:1},
    ])

    upload(req, res, (err) => {
        if(err) {
            console.log(err)
            req.flash('error_msg', 'Erro interno do multer')
            res.redirect('/admin/musica')
        } else {

            // verifica quais arquivos foram enviados
            let files = []
            if(req.files['file-PNG']) {
                files.push({pathPNG:req.files['file-PNG'][0].filename})
            }
            if(req.files['file-PDF']) {
                files.push({pathPDF:req.files['file-PDF'][0].filename})
            }
            if(req.files['file-MXL']) {
                files.push({pathMXL:req.files['file-MXL'][0].filename})
            }
            if(req.files['file-MP3']) {
                files.push({pathMP3:req.files['file-MP3'][0].filename})
            }

            // validações
            const nome = req.body.nome.trim()
            const instrumento = req.body.instrumento.trim()
            const genero = req.body.genero.trim()
            const autor = req.body.autor.trim()


            let erros = []

            if(!nome) {
                erros.push({texto:'Nome inválido'})
            }
            if(!instrumento) {
                erros.push({texto:'Instrumento inválido'})
            }
            if(!genero) {
                erros.push({texto:'Gênero inválido'})
            }
            if(!autor) {
                erros.push({texto:'Autor inválido'})
            }
            if(nome < 2) {
                erros.push({texto:'Nome muito curto'})
            }
            if(erros.length > 0) {
                // Apagando arquivos enviados
                files.forEach(item => {
                    for (let key in item) {
                        fs.unlink(path.join(__dirname,`../public/server-files/musicas/${item[key]}`), (err) =>{
                            if (err) {
                                // console.log(err)
                            }
                        })
                    }
                })
                // redirecionando
                req.flash('erros', erros)
                res.redirect('/admin/musica')
            } else {
                // salvando no banco de dados
                Musica.create({
                    nome:nome,
                    pathPNG: files.find(file => file.pathPNG) ?.pathPNG || null,
                    pathPDF: files.find(file => file.pathPDF) ?.pathPDF || null,
                    pathMXL: files.find(file => file.pathMXL) ?.pathMXL || null,
                    pathMP3: files.find(file => file.pathMP3) ?.pathMP3 || null,
                    instrumento_id: instrumento,
                    genero_id: genero,
                    autor_id: autor,
                }).then(() =>{
                    req.flash('success_msg','Musica salva com sucesso')
                    res.redirect('/admin/musica')
                    // tratando erros
                }).catch((err) => {
                    files.forEach(item => {
                        for (let key in item) {
                            fs.unlink(path.join(__dirname,`../public/server-files/musicas/${item[key]}`), (err) =>{
                                if (err) {
                                    console.log('ERRO:', err)
                                }
                            })
                        }
                    })
                    req.flash('error_msg', 'Erro ao salvar no Banco de dados')
                    res.redirect('/admin/musica')
                })
            }
        }
    })
})

router.post('/addAutor', (req,res) => {
    // upload da foto
    const upload = multer({storage:autor}).single('file')
    upload(req, res, (err) => {
        if(err) {
            req.flash('error_msg', 'Erro interno do multer')
            res.redirect('/admin/autor')
        } else {
            // validações
            const nome = req.body.nome.trim()
            let erros = []

            if(!nome) {
                erros.push({texto:'Nome inválido'})
            }
            if(!req.file) {
                erros.push({texto:'Arquivo inválido'})
            }
            if(nome < 2) {
                erros.push({texto:'Nome muito curto'})
            }
            if(erros.length > 0) {
                res.render('admin/add/addAutor', {erros})
            } else {
                // salvando no banco de dados
                Autor.create({
                    nome:nome,
                    pathFoto:req.file.filename
                }).then(() =>{
                    req.flash('success_msg','Autor salvo com sucesso')
                    res.redirect('/admin/autor')
                    // tratando erros
                }).catch((err) => {
                    // tenta apagar o arquivo em caso de erro
                    fs.unlink(path.join(__dirname,`../public/server-files/autores/${req.file.filename}`), (err) =>{
                        if (err) {
                            console.log('ERRO:', err)
                        }
                    })
                    req.flash('error_msg', 'Erro ao salvar no Banco de dados')
                    res.redirect('/admin/autor')
                })
            }
        }
    })
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
        res.render('admin/add/addGenero', {erros})
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
        res.render('admin/add/addInstrumento', {erros})
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

// Rotas POST Editar
router.post('/editMusica', (req,res) => {
    // upload da foto
    const upload = multer({storage:musica}).fields([
        {name:'file-PNG',maxCount:1},
        {name:'file-PDF',maxCount:1},
        {name:'file-MXL',maxCount:1},
        {name:'file-MP3',maxCount:1},
    ])

    upload(req, res, (err) => {
        if(err) {
            console.log(err)
            req.flash('error_msg', 'Erro interno do multer')
            res.redirect(`/admin/musica/${id}`)
        } else {

            // verifica quais arquivos foram enviados
            let files = []
            let oldFiles = []
            if(req.files['file-PNG']) {
                files.push({pathPNG:req.files['file-PNG'][0].filename})
                oldFiles.push({OldPNG:req.body.pathPNG})
            }
            if(req.files['file-PDF']) {
                files.push({pathPDF:req.files['file-PDF'][0].filename})
                oldFiles.push({OldPDF:req.body.pathPDF})
            }
            if(req.files['file-MXL']) {
                files.push({pathMXL:req.files['file-MXL'][0].filename})
                oldFiles.push({OldMXL:req.body.pathMXL})
            }
            if(req.files['file-MP3']) {
                files.push({pathMP3:req.files['file-MP3'][0].filename})
                oldFiles.push({OldMP3:req.body.pathMP3})
            }

            // Arquivos antigos
            const pathPNG = req.body.pathPNG
            const pathPDF = req.body.pathPDF
            const pathMXL = req.body.pathMXL
            const pathMP3 = req.body.pathMP3

            // validações
            const id = req.body.id
            const nome = req.body.nome.trim()
            const instrumento = req.body.instrumento.trim()
            const genero = req.body.genero.trim()
            const autor = req.body.autor.trim()
            let erros = []

            if(!nome) {
                erros.push({texto:'Nome inválido'})
            }
            if(!instrumento) {
                erros.push({texto:'Instrumento inválido'})
            }
            if(!genero) {
                erros.push({texto:'Gênero inválido'})
            }
            if(!autor) {
                erros.push({texto:'Autor inválido'})
            }
            if(nome < 2) {
                erros.push({texto:'Nome muito curto'})
            }
            if(erros.length > 0) {
                files.forEach(item => {
                    for (let key in item) {
                        fs.unlink(path.join(__dirname,`../public/server-files/musicas/${item[key]}`), (err) =>{
                            // if (err) { console.log(err) }
                        })
                    }
                })

                req.flash('erros', erros)
                res.redirect(`/admin/musica/${id}`)
            } else {

                // Verifica se foi enviado algum arquivo e apaga o antigo
             oldFiles.forEach(item => {
                    for (let key in item) {
                        fs.unlink(path.join(__dirname,`../public/server-files/musicas/${item[key]}`), (err) =>{
                            // if (err) { console.log(err) }
                        })
                    }
                })
                // salvando no banco de dados
                Musica.update({
                    nome:nome,
                    pathPNG: files.find(file => file.pathPNG) ?.pathPNG || pathPNG,
                    pathPDF: files.find(file => file.pathPDF) ?.pathPDF || pathPDF,
                    pathMXL: files.find(file => file.pathMXL) ?.pathMXL || pathMXL,
                    pathMP3: files.find(file => file.pathMP3) ?.pathMP3 || pathMP3,
                    instrumento_id: instrumento,
                    genero_id: genero,
                    autor_id: autor,
                },{where:{id:id}}).then(() =>{
                    req.flash('success_msg','Musica atualizada com sucesso')
                    res.redirect(`/admin/musica/${id}`)
                    // tratando erros
                }).catch((err) => {
                    files.forEach(item => {
                        for (let key in item) {
                            fs.unlink(path.join(__dirname,`../public/server-files/musicas/${item[key]}`), (err) =>{
                                if (err) {
                                    // console.log(err)
                                }
                            })
                        }
                    })
                    req.flash('error_msg', 'Erro ao Atualizar o Banco de dados')
                    res.redirect(`/admin/musica/${id}`)
                })
            }
        }
    })
})

router.post('/editAutor', (req,res) => {
    // upload da foto
    const upload = multer({storage:autor}).single('file')
    upload(req, res, (err) => {
        if(err) {
            req.flash('error_msg', 'Erro interno do multer')
            res.redirect(`/admin/autor/${id}`)
        } else {

            const id = req.body.id
            const nome = req.body.nome.trim()
            const pathFoto = req.body.pathFoto

            // validações
            let erros = []

            if(!nome) {
                erros.push({texto:'Nome inválido'})
            }
            if(!req.file) {
                erros.push({texto:'Arquivo inválido'})
            }
            if(nome < 2) {
                erros.push({texto:'Nome muito curto'})
            }
            if(erros.length > 0) {
                req.flash('erros', erros)
                res.redirect(`/admin/autor/${id}`)
            } else {
                // Verifica se foi enviado algum arquivo
                if(req.file) {
                    // tenta apagar o antigo arquivo
                    fs.unlink(path.join(__dirname,`../public/server-files/autores/${pathFoto}`), (err) =>{
                        if (err) {
                            // console.log(err)
                        }
                    })
                }
                // salvando no banco de dados
                Autor.update({
                    nome:nome,
                    pathFoto:req.file.filename
                },{where:{id:id}}).then(() =>{
                    req.flash('success_msg','Autor Atualizado com sucesso')
                    res.redirect(`/admin/autor/${id}`)
                    // tratando erros
                }).catch((err) => {
                    // Tenta apagar o arquivo caso dê erro
                    fs.unlink(path.join(__dirname,`../public/server-files/autores/${req.file.filename}`), (err) =>{
                        if (err) {
                            // console.log(err)
                        }
                    })
                    req.flash('error_msg', 'Erro ao Atualizar o Banco de dados')
                    res.redirect(`/admin/autor/${id}`)
                })
            }
        }
    })
})

router.post('/editGenero', (req,res) => {
    const id = req.body.id
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
        req.flash('erros', erros)
        res.redirect(`/admin/genero/${id}`)
    } else {
        Genero.update({
            nome:nome,
        },{where:{id:id}}).then(() => {
            req.flash('success_msg', 'Genero Atualizado com sucesso')
            res.redirect(`/admin/genero/${id}`)
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao Atualizar gênero')
            res.redirect(`/admin/genero/${id}`)
        })
    }
})

router.post('/editInstrumento', (req,res) => {
    const id = req.body.id
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
        req.flash('erros', erros)
        res.redirect(`/admin/instrumento/${id}`)
    } else {
        Instrumento.update({
            nome:nome,
            nomeExibicao:nomeExibicao
        },{where:{id:id}}).then(() => {
            req.flash('success_msg', 'Instrumento Atualizado com sucesso')
            res.redirect(`/admin/instrumento/${id}`)
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao Atualizar instrumento')
            res.redirect(`/admin/instrumento/${id}`)
        })
    }
})

// Rotas POST Deletar
router.post('/delMusica', (req,res) => {
    const id = req.body.id
    Musica.findOne({where:{id:id}}).then((musica) => {
        // salva as músicas para caso falhe em deletar do banco
        musica_json = musica.toJSON()
        files = [
            musica_json.pathPNG,
            musica_json.pathMXL,
            musica_json.pathMP3,
            musica_json.pathPDF
        ]
        musica.destroy().then(() => {
            // Pega cada um dos arquivos da música
            files.forEach(item => {                
                // deleta esses arquivos
                fs.unlink(path.join(__dirname,`../public/server-files/musicas/${item}`), (err) =>{
                    if (err) {
                        // console.log(err)
                    }
                })
            })
            // redireciona
            req.flash('success_msg', 'Música deletada com sucesso')
            res.redirect('/admin')
        // tratando erros
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao tentar deletar música')
            res.redirect('/admin')
        })
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg','informações necessárias não encontradas ou Música não existe')
        res.redirect('/admin')
    })
})

router.post('/delAutor', (req,res) => {
    const id = req.body.id
    Autor.findOne({where:{id:id}}).then((autor) => {
        // salva as músicas para caso falhe em deletar do banco
        const autor_json = autor.toJSON()
        const pathFoto = autor_json.pathFoto

        autor.destroy().then(() => {
            // deleta esses arquivos
            fs.unlink(path.join(__dirname,`../public/server-files/autores/${pathFoto}`), (err) =>{
                if (err) {
                    // console.log(err)
                }
            })
            // redireciona
            req.flash('success_msg', 'Autor deletado com sucesso')
            res.redirect('/admin')
        // tratando erros
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao tentar deletar Autor')
            res.redirect('/admin')
        })
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg','informações necessárias não encontradas ou Autor não existe')
        res.redirect('/admin')
    })

})

router.post('/delGenero', (req,res) => {
    const id = req.body.id
    Genero.destroy({where:{id:id}}).then(() => {
        req.flash('success_msg', 'Gênero deletado com sucesso')
        res.redirect('/admin')
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg','informações necessárias não encontradas ou Gênero não existe')
        res.redirect('/admin')
    })
})

router.post('/delInstrumento', (req,res) => {
    const id = req.body.id
    Instrumento.destroy({where:{id:id}}).then(() => {
        req.flash('success_msg', 'Instrumento deletado com sucesso')
        res.redirect('/admin')
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg','informações necessárias não encontradas ou Instrumento não existe')
        res.redirect('/admin')
    })
})


// exportação
module.exports = router