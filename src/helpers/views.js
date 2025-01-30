const Musica = require('../models/Musica')
const Iframe = require('../models/Iframe')

module.exports = {
    // Função para incrementar as visualizações em Música
    viewsMusica : async (musicaID) => {
        try {
            const musica = await Musica.findByPk(musicaID);
            if (musica) {
                musica.views += 1;
                await musica.save();
            }
        } catch (err) {
            console.error('Erro ao incrementar visualizações:', err);
        }
    },

    // Função para incrementar as visualizações
    viewsIframe: async (UUID) => {
        try {
            const iframe = await Iframe.findByPk(UUID);
            if (iframe) {
                iframe.views += 1;
                await iframe.save();
            }
        } catch (err) {
            console.error('Erro ao incrementar visualizações:', err);
        }
    }
}