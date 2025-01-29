module.exports = {
    logado: (req, res, next) => {
        if(req.user) {
            next()
        } else {
            req.flash('error_msg','Você precisa estar logado')
            res.redirect('/usuario/login')
        }
    },
    naoLogado: (req, res, next) => {
        if(req.user) {
            req.flash('success_msg','Você já está logado')
            res.redirect('/usuario/conta')
        } else {
            next()
        }
    }
}