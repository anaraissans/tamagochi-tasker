(function (App) {
    const { CHAVES_STORAGE } = App.config;
    const { state } = App;
    const { carregarJson, salvarJson } = App.utils;
    const { criarPersonagemInicial } = App.personagem;

    function salvarTarefas() {
        salvarJson(CHAVES_STORAGE.tarefas, state.tarefas);
    }

    function carregarTarefas() {
        const carregadas = carregarJson(CHAVES_STORAGE.tarefas, []);
        return Array.isArray(carregadas) ? carregadas : [];
    }

    function salvarHistorico() {
        salvarJson(CHAVES_STORAGE.historico, state.historicoDiario);
    }

    function carregarHistorico() {
        const carregado = carregarJson(CHAVES_STORAGE.historico, []);
        return Array.isArray(carregado) ? carregado : [];
    }

    function salvarPersonagem() {
        salvarJson(CHAVES_STORAGE.personagem, state.personagem);
    }

    function carregarPersonagem() {
        const salvo = localStorage.getItem(CHAVES_STORAGE.personagem);

        if (salvo === null) {
            return criarPersonagemInicial();
        }

        try {
            return JSON.parse(salvo);
        } catch (erro) {
            console.error("Não foi possível carregar o personagem:", erro);
            return criarPersonagemInicial();
        }
    }

    App.storage = {
        salvarTarefas,
        carregarTarefas,
        salvarHistorico,
        carregarHistorico,
        salvarPersonagem,
        carregarPersonagem
    };
})(window.TamagochiApp);
