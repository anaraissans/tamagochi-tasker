(function (App) {
    const { dom } = App;
    const { state } = App;
    const {
        carregarHistorico,
        carregarPersonagem,
        carregarTarefas
    } = App.storage;
    const {
        adicionarTarefa,
        mostrarTarefas,
        tratarCliqueNaListaDeTarefas
    } = App.tarefas;
    const {
        fecharDia,
        iniciarMonitoramentoDeFechamento,
        mostrarHistorico
    } = App.historico;
    const { inicializar: inicializarSom, tocar: tocarSom } = App.som;

    function registrarEventos() {
        dom.formulario.addEventListener("submit", adicionarTarefa);
        dom.botaoFecharDia.addEventListener("click", fecharDia);
        dom.listaTarefas.addEventListener(
            "click",
            tratarCliqueNaListaDeTarefas
        );

        document.addEventListener("click", function (evento) {
            const botao = evento.target.closest("button");

            if (!botao || botao.id === "botao-som") {
                return;
            }

            if (botao.closest("#lista-tarefas")) {
                return;
            }

            if (botao.closest("#form-tarefa")) {
                return;
            }

            if (botao.id === "botao-fechar-dia") {
                return;
            }

            tocarSom("clique");
        });
    }

    function iniciarApp() {
        state.tarefas = carregarTarefas();
        state.historicoDiario = carregarHistorico();
        state.personagem = carregarPersonagem();

        inicializarSom();
        registrarEventos();
        iniciarMonitoramentoDeFechamento();
        mostrarTarefas();
        mostrarHistorico();
    }

    iniciarApp();
})(window.TamagochiApp);
