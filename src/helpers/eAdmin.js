module.exports = {
    eAdmin: (req, res, next) => {
        if(req.user && req.user.eAdmin == 1) {
            next()
        } else {
            res.redirect('/usuario/login')
        }
    }
}