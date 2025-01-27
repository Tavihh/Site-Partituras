// importações
const app = require('./config/config')
const home = require('./routes/home')
const usuario = require('./routes/usuario')
const admin = require('./routes/admin')

process.noDeprecation = true

// rotas
app.use ('/', home)
app.use('/usuario', usuario)
app.use('/admin', admin)

// Outros
const PORTA = 1010
app.listen(PORTA, () => {
    console.log(`Servidor rodando em: http://localhost:${PORTA}`)
})