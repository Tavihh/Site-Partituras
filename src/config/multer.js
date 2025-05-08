// importações
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')

// config
const autor = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null,`${Date.now()}-${file.originalname}`)
    },
    destination: (req, file, cb) => {
        const pasta = path.join(__dirname,'../public/server-files/autores')
        if(!fs.existsSync(pasta)) {
            fs.mkdirSync(pasta, {recursive:true})
        }
        cb(null,pasta)
    }
})

const musica = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null,`${uuidv4()}-${file.originalname}`)
    },
    destination: (req, file, cb) => {
        const pasta = path.join(__dirname,'../public/server-files/musicas')
        if(!fs.existsSync(pasta)) {
            fs.mkdirSync(pasta, {recursive:true})
        }
        cb(null,pasta)
    }
})


// exportação
module.exports = {autor, musica}