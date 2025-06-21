// importações
const router = require('express').Router()
const Musica = require('../models/Musica')
const Instrumento = require('../models/Instrumento');
const Autor = require('../models/Autor');
const Genero = require('../models/Genero');
const Op = require('sequelize').Op
const { viewsMusica, viewsIframe } = require('../helpers/views'); 
const Iframe = require('../models/Iframe');
const { musica } = require('../config/multer');
const { Partitura } = require('../helpers/Partitura')
const path = require('path')
const fs = require('fs')
const MusicaVersoes = require('../models/MusicaVersoes');
const { where } = require('sequelize');

// rotas
router.get('/', async (req,res) => {
    // Busca os generos
    let genero = await Genero.findAll();

    genero = await Promise.all(genero.map(async (item) => {
        item = item.toJSON()
        // Para cada genero ele busca suas músicas
        let musicas = await Musica.findAll({where:{genero_id:item.id},limit:20})
        item.musicas = await Promise.all(musicas.map(musica => musica.toJSON()))
        // Caso não tenha alguma adiciona um valor booleano true
        if(musicas.length > 0) {
        item.temMusica = true
        }
        return item
    }));
    // renderiza
    res.locals.genero = genero
    res.render('home/home')
})

router.get('/partitura/:id', async (req,res) => {

    const id = req.params.id
    Promise.all([
        Musica.findOne({
        where:{id:id},
        include:[
            {model:Autor,attributes:['id','nome','pathFoto']},
            {model:Instrumento,attributes:['id','nome','order_index']},
            {model:Genero,attributes:['id','nome']}
        ],
        order: [[Instrumento,'order_index', 'ASC']]
    }),
        Instrumento.findAll()

    ]).then( async ([musica, instrumentos]) => {
    let musicas = await Musica.findAll({where:{instrumento_id:musica.instrumento_id}})
            let iframe = await Iframe.findOne({where:{musica_id:id, status:'aprovado'}}) 
            if (iframe) {
                await viewsIframe(iframe.UUID)
                res.locals.iframe = iframe.toJSON()
            }
            res.locals.instrumentos = instrumentos.map(item => {
            item = item.toJSON()
            if (item.id == musica.instrumento_id) {
                item.selected = true
            }
            return item
        })

            musica.pathMXL = `/musicas/${musica.pathMXL}`
            res.locals.musica = musica.toJSON()
            res.locals.musicas = musicas.map(item => item.toJSON())

            
            // Incrementa as Views
            await viewsMusica(id)

            // Renderiza
            res.render('home/partitura')
    }).catch((err) => {
        req.flash('error_msg','Música não existe')
        res.redirect('/')
    })
})

router.get('/partitura/:id/versao/:idinstrumento', (req, res) => {
  const id = req.params.id;
  const IdInstrumento = req.params.idinstrumento;

  Promise.all([
    MusicaVersoes.findOne({
      where: { id, instrumento_id:IdInstrumento },
      include: [
        {
          model: Musica,
          attributes: ['id', 'nome', 'instrumento_id'],
          include: [
            { model: Autor, attributes: ['id', 'nome', 'pathFoto'] }
          ]
        },
        { model: Instrumento, attributes: ['id', 'nome', 'order_index'] },
        { model: Genero, attributes: ['id', 'nome'] }
      ]
    }),
    Instrumento.findAll({ order: [['order_index', 'ASC']] }),
    Musica.findAll()
  ]).then(async ([musicaVersao, instrumentos, musicas]) => {
    if (!musicaVersao) throw new Error('Versão não encontrada');

    const musica = musicaVersao.toJSON();

    res.locals.instrumentos = instrumentos.map(item => {
      item = item.toJSON();
      if (item.id == musica.instrumento_id) item.selected = true;
      if (item.id == musica.musica.instrumento_id) item.original = true
      return item;
    });
    
    res.locals.musica = musica;
    res.locals.musicas = musicas.map(item => item.toJSON());

    res.render('home/partituraVersao');
  }).catch(err => {
    // versão não existe ainda, cria agora

    Promise.all([
      Musica.findOne({
        where: { id },
        include: [
          { model: Autor, attributes: ['id', 'nome', 'pathFoto'] },
          { model: Instrumento, attributes: ['id', 'nome', 'chromatic', 'octave_change', 'order_index'] },
          { model: Genero, attributes: ['id', 'nome'] }
        ]
      }),
      Instrumento.findOne({ where: { id: IdInstrumento } })
    ]).then(([musica, instrumento]) => {
      const part = new Partitura(path.join(__dirname, '../public/server-files/musicas/', musica.pathMXL));

      part.inicializar().then(() => {
        part.setInstrumento(instrumento);
        part.transporArmadura(musica.instrumento.chromatic - instrumento.chromatic);
        part.transporNotas(
          musica.instrumento.chromatic - instrumento.chromatic -
          (12 * musica.instrumento.octave_change) +
          (12 * instrumento.octave_change)
        );

        const pasta = path.join(__dirname, '../public/server-files/versoes');
        if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

        const pathMXL = `${musica.id} - ${musica.nome} - ${instrumento.id}.musicxml`;
        part.salvarXML(path.join(pasta, pathMXL));

        MusicaVersoes.create({
          nome: musica.nome,
          pathMXL: pathMXL,
          musica_id: musica.id,
          genero_id: musica.genero.id,
          instrumento_id: IdInstrumento
        }).then(novaVersao => {
          res.redirect(`/partitura/${novaVersao.id}/versao/${IdInstrumento}`);
        });
      });
    }).catch(error => {
      console.error(error);
      res.status(500).send("Erro ao criar nova versão.");
    });
  });
});

router.get('/pesquisa', async (req, res) => {
    const psq = req.query.psq;

    // Busca autores que tenham nome parecido com o termo pesquisado
    const autores = await Autor.findAll({
        where: {
            nome: {
                [Op.like]: `%${psq}%`
            }
        }
    });

    // Gêneros cujo NOME bate com a pesquisa
    const generosPorNome = await Genero.findAll({
        where: {
            nome: {
                [Op.like]: `%${psq}%`
            }
        }
    });

    // Todos os gêneros para verificar se possuem músicas com o nome pesquisado
    const todosGeneros = await Genero.findAll();

    const generosComResultados = await Promise.all(todosGeneros.map(async (genero) => {
        const generoJSON = genero.toJSON();

        // Busca músicas que batem com o nome pesquisado dentro do gênero
        const musicas = await Musica.findAll({
            where: {
                genero_id: genero.id,
                nome: {
                    [Op.like]: `%${psq}%`
                }
            },
            limit: 20
        });

        generoJSON.musicas = musicas.map(m => m.toJSON());

        // Define true se: tem músicas OU o nome do gênero bate com a pesquisa
        if (musicas.length > 0 || generosPorNome.find(g => g.id === genero.id)) {
            generoJSON.temMusica = true;
            return generoJSON;
        }

        // Caso contrário, exclui o gênero (não retorna nada)
        return null;
    }));

    // Filtra os que realmente têm algo a mostrar
    const generosFiltrados = generosComResultados.filter(g => g !== null);

    res.locals.autores = autores.map(a => a.toJSON());
    res.locals.genero = generosFiltrados;

    res.render('home/pesquisa');
});

router.get('/autor/:id', async (req,res) => {
    const id = req.params.id
    // Busca o Autor
    let autor = await Autor.findOne({where:{id:id}})

        // Busca os generos
        let genero = await Genero.findAll();

        genero = await Promise.all(genero.map(async (item) => {
            item = item.toJSON()
            // Para cada genero ele busca suas músicas
            let musicas = await Musica.findAll({where:{genero_id:item.id,autor_id:id}})
            item.musicas = await Promise.all(musicas.map(musica => musica.toJSON()))
            // Caso não tenha alguma adiciona um valor booleano true
            if(musicas.length > 0) {
            item.temMusica = true
            }
            return item
        }));
        // renderiza
        res.locals.genero = genero
    res.locals.autor = autor.toJSON()
    res.render('home/autor')
})

router.get('/teste', (req,res) => {
    res.render('layouts/teste', {layout:'admin'})
})

// exportação
module.exports = router