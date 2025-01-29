// importações
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid');

// config
const autor = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null,`${Date.now()}-${file.originalname}`)
    },
    destination: (req, file, cb) => {
        cb(null,path.join(__dirname,'../public/server-files/autores'))
    }
})

const musica = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null,`${uuidv4()}-${file.originalname}`)
    },
    destination: (req, file, cb) => {
        cb(null,path.join(__dirname,'../public/server-files/musicas'))
    }
})


// exportação
module.exports = {autor, musica}