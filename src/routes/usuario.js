// importações
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Musica = require('../models/Musica')
const Instrumento = require('../models/Instrumento')
const passport = require('../config/auth')
const Iframe = require('../models/Iframe')
const { logado , naoLogado} = require('../helpers/logado')

// rotas

// Rotas GET
router.get('/login', naoLogado, (req,res) => {
    res.render('usuario/login')
})

router.get('/registrar', naoLogado, (req,res) => {
    res.render('usuario/registrar')
})

router.get('/logout', logado, (req,res)=>{
    req.logout(()=>{
        req.flash('success_msg','Deslogado com sucesso')
        res.redirect('/')
    })
})

router.get('/interpretacoes', logado, (req,res) => {

    Iframe.findAll({
        where: { usuario_id: req.user.id },
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
        res.locals.iframes = iframes.map(item => item.toJSON())
        res.render('usuario/interpretacoes')
    })
})

router.get('/listas', logado, (req,res) => {
    res.render('usuario/listas')
})

router.get('/enviarIframe/:musica_id/:instrumento_id/:autor_id', logado, (req,res) => {
    const musica_id = req.params.musica_id
    const instrumento_id = req.params.instrumento_id
    const autor_id = req.params.autor_id

    res.locals.musica_id = musica_id
    res.locals.instrumento_id = instrumento_id
    res.locals.autor_id = autor_id
    res.render('usuario/enviarIframe')
})

router.get('/conta', logado, (req,res) => {
    res.render('usuario/conta')
})

router.get('/confirmDelIframe/:uuid', logado, (req,res) => {
    const uuid = req.params.uuid
    // Busca o iframe
    Iframe.findByPk(uuid).then((iframe) => {
        res.locals.iframe = iframe.toJSON()
        res.render('usuario/delIframe')
    // Trata o Erro
    }).catch((err) => {
        req.flash('error_msg','Interpretação não encontrada')
        res.redirect('/usuario/interpretacoes')
    })

})

// Rotas POST
router.post('/login', naoLogado, (req,res,next)=>{
    passport.authenticate('local', {
        successRedirect:'/admin',
        failureRedirect:'/usuario/login',
        failureFlash:true,
    })(req,res,next)
})

router.post('/registrar', naoLogado, (req,res) => {
    // função que capitaliza as palavras
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    let nome = capitalize(req.body.nome.trim())
    let sobrenome = capitalize(req.body.sobrenome.trim())
    let email = req.body.email.trim().toLowerCase()
    let senha = req.body.senha.trim()
    let senha2 = req.body.senha2.trim()

    // verificando os inputs
    let erros = []

    if(!nome) {
        erros.push({texto:'Nome inválido'})
    }
    if(!sobrenome) {
        erros.push({texto:'Sobrenome inválido'})
    }
    if(!email) {
        erros.push({texto:'E-mail inválido'})
    }
    if(!senha) {
        erros.push({texto:'Senha inválida'})
    }
    if(senha !== senha2) {
        erros.push({texto:'Senhas não coincidem'})
    }
    if(nome.length < 2) {
        erros.push({texto:'Nome muito curto'})
    }
    if(sobrenome.length < 2) {
        erros.push({texto:'Sobrenome muito curto'})
    }
    if(senha.length < 8) {
        erros.push({texto:'Senha muito curta'})
    }
    // retornando os erros
    if(erros.length >= 1) {
        res.render('usuario/registrar', {erros})
    } else {
        // verificando se email já existe
        User.findOne({where:{email:email}}).then((user)=>{
            if(user){
                req.flash('error_msg','E-mail já em uso')
                res.redirect('/usuario/registrar')
            } else {
                // criptografando senha
                bcrypt.genSalt(10).then((salt)=>{
                    bcrypt.hash(senha,salt).then((senha)=>{
                        // salvando usúario
                        User.create({
                            nome:nome,
                            sobrenome:sobrenome,
                            email:email,
                            senha:senha
                        }).then(()=>{
                            // retornando a página de login com novo usúario cadastrado
                            req.flash('success_msg','Usúario criado com sucesso')
                            res.redirect('/usuario/login')
                            // tratando erros
                        }).catch((err)=>{
                            console.log("Erro ao salvar a conta de um usúario no banco de dados, Erro:",err.message)
                            req.flash('error_msg','Erro interno, tente novamente mais tarde')
                            res.redirect('/usuario/registrar')
                        })
                    }).catch((err)=>{
                        console.log('Erro ao gerar o hash da senha no bcrypt, Erro:',err.message)
                        req.flash('error_msg','Erro interno, tente novamente mais tarde')
                        res.redirect('/usuario/registrar')
                    })
                }).catch((err)=>{
                    console.log('Erro ao gerar o salt da senha no bcrypt, Erro:',err.message)
                    req.flash('error_msg','Erro interno, tente novamente mais tarde')
                    res.redirect('/usuario/registrar')
                })
            }
        }).catch((err)=>{
            req.flash('error_msg','Não foi possivel verificar seu E-mail')
            console.log("erro ao verificar o e-mail de um usúario no banco de dados, Erro:",err.message)
            res.redirect('/usuario/registrar')
        })
    }
})

router.post('/atualizarDados', logado, (req,res) => {
    // função que capitaliza as palavras
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    let nome = capitalize(req.body.nome.trim())
    let sobrenome = capitalize(req.body.sobrenome.trim())
    let email = req.body.email.trim().toLowerCase()

    // verificando os inputs
    let erros = []

    if(!nome) {
        erros.push({texto:'Nome inválido'})
    }
    if(!sobrenome) {
        erros.push({texto:'Sobrenome inválido'})
    }
    if(!email) {
        erros.push({texto:'E-mail inválido'})
    }
    if(nome.length < 2) {
        erros.push({texto:'Nome muito curto'})
    }
    if(sobrenome.length < 2) {
        erros.push({texto:'Sobrenome muito curto'})
    }
    // retornando os erros
    if(erros.length >= 1) {
        res.render('usuario/conta', {erros})
    } else {
        // verificando se email já existe
        User.findOne({where:{email:email}}).then((user)=>{
            if(user){
                if (user.email == req.user.email) {
                    // atualizando usúario
                    User.update({
                        nome:nome,
                        sobrenome:sobrenome,
                        email:email,
                    },{where:{id:req.user.id}}).then(()=>{
                        // retornando a página de login com novo usúario cadastrado
                        req.flash('success_msg','Usúario atualizado com sucesso')
                        res.redirect('/usuario/conta')
                        // tratando erros
                    }).catch((err)=>{
                        console.log("Erro ao atualizar a conta de um usúario no banco de dados, Erro:",err.message)
                        req.flash('error_msg','Erro interno, tente novamente mais tarde')
                        res.redirect('/usuario/conta')
                    })
                } else {                    
                    req.flash('error_msg','E-mail já em uso')
                    res.redirect('/usuario/conta')
                }
            } else {
                // atualizando usúario
                User.update({
                    nome:nome,
                    sobrenome:sobrenome,
                    email:email,
                },{where:{id:req.user.id}}).then(()=>{
                    // retornando a página de login com novo usúario cadastrado
                    req.flash('success_msg','Usúario atualizado com sucesso')
                    res.redirect('/usuario/conta')
                    // tratando erros
                }).catch((err)=>{
                    console.log("Erro ao atualizar a conta de um usúario no banco de dados, Erro:",err.message)
                    req.flash('error_msg','Erro interno, tente novamente mais tarde')
                    res.redirect('/usuario/conta')
                })
            }
        }).catch((err)=>{
            req.flash('error_msg','Não foi possivel verificar seu E-mail')
            console.log("erro ao verificar o e-mail de um usúario no banco de dados, Erro:",err.message)
            res.redirect('/usuario/conta')
        })
    }
})

router.post('/atualizarSenha', logado, (req,res) => {
    let senha = req.body.senha.trim()
    let newsenha = req.body.newsenha.trim()
    let newsenha2 = req.body.newsenha2.trim()

    // verificando os inputs
    let erros = []

    if(!senha) {
        erros.push({texto:'Senha inválida'})
    }
    if(!newsenha) {
        erros.push({texto:'Senha inválida'})
    }
    if(!newsenha2) {
        erros.push({texto:'Senha inválida'})
    }
    if(newsenha !== newsenha2) {
        erros.push({texto:'Nova senha digitada errada em um dos campos'})
    }
    if(newsenha.length < 8) {
        erros.push({texto:'Nova Senha muito curta'})
    }
    // retornando os erros
    if(erros.length >= 1) {
        res.render('usuario/conta', {erros})
    } else {
        // verificando se email já existe
        User.findOne({where:{id:req.user.id}}).then((user)=>{
            if(user){
                bcrypt.compare(senha, req.user.senha).then((equal) => {
                    if (equal) {
                        // criptografando senha
                        bcrypt.genSalt(10).then((salt)=>{
                            bcrypt.hash(newsenha,salt).then((hashsenha)=>{
                                // salvando usúario
                                User.update({
                                    senha:hashsenha
                                },{where:{id:req.user.id}}).then(()=>{
                                    // retornando a página de login com novo usúario cadastrado
                                    req.flash('success_msg','Usúario atualizado com sucesso')
                                    res.redirect('/usuario/conta')
                                    // tratando erros
                                }).catch((err) => {
                                    console.log("Erro ao atualizar a senha de um usúario no banco de dados, Erro:",err.message)
                                    req.flash('error_msg','Erro interno, tente novamente mais tarde')
                                    res.redirect('/usuario/conta')
                                })
                            }).catch((err) => {
                                console.log('Erro ao gerar o hash da senha no bcrypt, Erro:',err.message)
                                req.flash('error_msg','Erro interno, tente novamente mais tarde')
                                res.redirect('/usuario/conta')
                            })
                        }).catch((err) => {
                            console.log('Erro ao gerar o salt da senha no bcrypt, Erro:',err.message)
                            req.flash('error_msg','Erro interno, tente novamente mais tarde')
                            res.redirect('/usuario/conta')
                        })
                    } else {
                        req.flash('error_msg','Senha atual não consta no banco de dados')
                        res.redirect('/usuario/conta')
                    }
                }).catch((err) => {
                    req.flash('error_msg','Não foi possivel comparar sua senha')
                    res.redirect('/usuario/conta')
                })
            } else {
                req.flash('error_msg','Não foi possivel encontrar seu usúario')
                res.redirect('/usuario/conta')
            }
        }).catch((err) => {
            req.flash('error_msg','Não foi possivel verificar sua conta')
            console.log("erro ao verificar a conta de um usúario no banco de dados, Erro:",err.message)
            res.redirect('/usuario/conta')
        })
    }
})

router.post('/enviarIframe', logado, (req,res) => {

    // Pegando os dados que vieram pelos parametros
    const musica_id = req.body.musica_id
    const instrumento_id = req.body.instrumento_id
    const usuario_id = req.body.usuario_id
    const autor_id = req.body.autor_id
    const iframe = req.body.iframe

    Iframe.create({
        iframeCode: iframe,
        usuario_id: usuario_id,
        musica_id: musica_id,
        instrumento_id: instrumento_id,
        autor_id: autor_id
    }).then(() => {
        req.flash('success_msg','Sua interpretação foi enviada com sucesso')
        res.redirect('/usuario/interpretacoes')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno ao enviar a sua interpretação')
        res.redirect('/usuario/interpretacoes')
    })

})

router.post('/delIframe', logado, (req,res) => {
    const uuid = req.body.uuid
    Iframe.destroy({where:{UUID:uuid}}).then(() => {
        req.flash('success_msg', 'Interpretação deletada com sucesso')
        res.redirect('/usuario/interpretacoes')
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg','informações necessárias não encontradas ou Interpretação não existe')
        res.redirect('/usuario/interpretacoes')
    })
})




// exportação
module.exports = router