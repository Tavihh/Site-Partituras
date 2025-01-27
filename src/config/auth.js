// importações
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy

// config
    passport.use(new localStrategy({usernameField:'email',passwordField:'senha'},(email,senha,done)=>{
        User.findOne({where:{email:email}}).then((user)=>{
            // verifica email
            if(!user) {
                done(null,false,{message:'E-mail inválido'})
            } else {
                // verifica senha
                bcrypt.compare(senha,user.senha).then((equal)=>{
                    if(equal){
                        done(null,user)
                    } else {
                        done(null,false,{message:'Senha inválida'})
                    }
                }).catch((err)=>{
                    console.log('Erro Bcrypt Senha:', err.message)
                    done(null,false,{message:'Não foi possivel verificar a senha'})
                })
            }
        }).catch((err)=>{
            console.log('Erro Bcrypt Email:', err.message)
            done(null,false,{message:'Não foi possivel verificar o e-mail'})
        })
    }))

    passport.serializeUser((User,done)=>{
        done(null,User.id)
    })
    passport.deserializeUser((id,done)=>{
        User.findOne({where:{id:id}}).then((user)=>{
            if(user) {
                done(null,user.toJSON())
            }
        })
    })

module.exports = passport