// importações
const express = require('express')
const app = express()
const passport = require('passport')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')

// config
    // session
    app.use(session({
        secret:'sitedepartituras',
        resave:true,
        saveUninitialized:true
    }))
    app.use(flash())
    app.use(passport.initialize())
    app.use(passport.session())
    // middleware
    app.use((req, res, next) =>{
        res.locals.error_msg = req.flash('error_msg')
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        next()
    })
    // view engine
    app.engine('handlebars', handlebars.engine({defaultLayout:'main'}))
    app.set('view engine', 'handlebars')
    // json
    app.use(express.urlencoded({extended:true}))
    app.use(express.json())
    // public
    app.use(express.static(path.join(__dirname,'../public')))
    app.set('views','src/views')

// exportação
module.exports = app