module.exports = {
    eAdmin: (req, res, next) => {
        if(req.user && req.user.eAdmin == 1) {
            res.locals.layout = 'admin'
            next()
        } else {
            res.redirect('/usuario/login')
        }
    }
}