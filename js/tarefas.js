(function (App) {
    const { rotulos } = App.config;
    const { dom } = App;
    const { state } = App;
    const {
        calcularPontos,
        calcularResumo,
        formatarData,
        formatarRotulo
    } = App.utils;
    const { salvarTarefas } = App.storage;
    const { atualizarTamagochi } = App.tamagochi;
    const { tocar: tocarSom } = App.som;

    function limparFormulario() {
        dom.campoNome.value = "";
        dom.campoTipo.value = "";
        dom.campoData.value = "";
        dom.campoDificuldade.value = "";
        dom.campoNome.focus();
    }

    function adicionarTarefa(evento) {
        evento.preventDefault();

        const nome = dom.campoNome.value.trim();
        const tipo = dom.campoTipo.value;
        const data = dom.campoData.value;
        const dificuldade = dom.campoDificuldade.value;

        if (!nome || !tipo || !data || !dificuldade) {
            tocarSom("erro");
            alert("Preencha todos os campos.");
            return;
        }

        state.tarefas.push({
            id: Date.now(),
            nome,
            tipo,
            data,
            dificuldade,
            pontos: calcularPontos(dificuldade),
            status: "pendente"
        });

        salvarTarefas();
        limparFormulario();
        tocarSom("tarefaAdicionada");
        mostrarTarefas();
    }

    function criarItemTarefa(tarefa) {
        const item = document.createElement("li");

        if (tarefa.status === "concluida") {
            item.classList.add("tarefa-concluida");
        }

        const textoBotaoStatus =
            tarefa.status === "pendente" ? "Concluir" : "Reabrir";

        item.innerHTML = `
            <strong>${tarefa.nome}</strong>
            <br>
            <span class="tarefa-meta tarefa-meta--${tarefa.tipo}">
                ${formatarRotulo(rotulos.tipo, tarefa.tipo)}
            </span>
            <span class="tarefa-meta">
                ${formatarRotulo(rotulos.dificuldade, tarefa.dificuldade)}
            </span>
            <span class="tarefa-meta">${tarefa.pontos} pts</span>
            <br>
            <small>
                ${formatarData(tarefa.data)} ·
                ${formatarRotulo(rotulos.status, tarefa.status)}
            </small>
            <div class="tarefa-acoes">
                <button
                    type="button"
                    class="btn-secundario"
                    data-acao="alternar"
                    data-id="${tarefa.id}"
                >
                    ${textoBotaoStatus}
                </button>
                <button
                    type="button"
                    class="btn-perigo"
                    data-acao="excluir"
                    data-id="${tarefa.id}"
                >
                    Excluir
                </button>
            </div>
        `;

        return item;
    }

    function atualizarResumo() {
        const resumo = calcularResumo(state.tarefas);

        dom.totalTarefas.textContent = resumo.totalTarefas;
        dom.tarefasConcluidas.textContent = resumo.quantidadeConcluidas;
        dom.pontosPlanejados.textContent = resumo.pontosPlanejados;
        dom.pontosConquistados.textContent = resumo.pontosConquistados;
        dom.percentualConclusao.textContent = `${resumo.percentualConclusao}%`;
    }

    function mostrarTarefas() {
        dom.listaTarefas.innerHTML = "";

        if (state.tarefas.length === 0) {
            dom.listaTarefas.innerHTML =
                '<li class="lista-vazia">Nenhuma tarefa cadastrada.</li>';
            atualizarResumo();
            atualizarTamagochi();
            return;
        }

        state.tarefas.forEach(function (tarefa) {
            dom.listaTarefas.appendChild(criarItemTarefa(tarefa));
        });

        atualizarResumo();
        atualizarTamagochi();
    }

    function alternarStatus(idTarefa) {
        const tarefa = state.tarefas.find(function (item) {
            return item.id === idTarefa;
        });

        if (!tarefa) {
            return;
        }

        const novoStatus =
            tarefa.status === "pendente" ? "concluida" : "pendente";

        tarefa.status = novoStatus;

        salvarTarefas();

        if (novoStatus === "concluida") {
            tocarSom("tarefaConcluida");
        } else {
            tocarSom("clique");
        }

        mostrarTarefas();
    }

    function excluirTarefa(idTarefa) {
        tocarSom("clique");

        const confirmar = confirm(
            "Tem certeza de que deseja excluir esta tarefa?"
        );

        if (!confirmar) {
            return;
        }

        state.tarefas = state.tarefas.filter(function (tarefa) {
            return tarefa.id !== idTarefa;
        });

        salvarTarefas();
        tocarSom("tarefaExcluida");
        mostrarTarefas();
    }

    function tratarCliqueNaListaDeTarefas(evento) {
        const botao = evento.target.closest("button[data-acao]");

        if (!botao) {
            return;
        }

        const idTarefa = Number(botao.dataset.id);
        const acao = botao.dataset.acao;

        if (acao === "alternar") {
            alternarStatus(idTarefa);
        }

        if (acao === "excluir") {
            excluirTarefa(idTarefa);
        }
    }

    App.tarefas = {
        adicionarTarefa,
        atualizarResumo,
        mostrarTarefas,
        tratarCliqueNaListaDeTarefas
    };
})(window.TamagochiApp);
