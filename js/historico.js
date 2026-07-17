(function (App) {
    const {
        HORARIO_FIM_DO_DIA,
        INTERVALO_VERIFICACAO_FECHAMENTO_MS
    } = App.config;
    const { dom } = App;
    const { state } = App;
    const {
        calcularDistribuicaoTipos,
        calcularEquilibrioTipos,
        calcularResumo,
        diaEstaEncerrado,
        formatarData,
        obterDataAtual
    } = App.utils;
    const {
        salvarHistorico,
        salvarPersonagem,
        salvarTarefas
    } = App.storage;
    const { atualizarPersonagemAposFechamento } = App.personagem;
    const {
        calcularEstadoTamagochi,
        definirEstadoVisual
    } = App.tamagochi;
    const { mostrarTarefas } = App.tarefas;
    const { tocar: tocarSom } = App.som;

    function calcularExperienciaDoDia(resumo, estadoFinal) {
        let experiencia = resumo.pontosConquistados;

        if (resumo.percentualConclusao === 100) {
            experiencia += 10;
        } else if (resumo.percentualConclusao >= 70) {
            experiencia += 5;
        }

        if (estadoFinal.estresse >= 80 || estadoFinal.energia <= 10) {
            experiencia -= 5;
        }

        return Math.max(0, experiencia);
    }

    function criarItemHistorico(registro) {
        const item = document.createElement("li");
        item.classList.add("item-historico");

        const tipoFechamento = registro.fechamentoAutomatico
            ? " · fechamento automático"
            : "";

        const pendentes = registro.tarefasPendentes || 0;

        item.innerHTML = `
            <strong>${formatarData(registro.data)}</strong>
            <br>
            <span class="historico-estado">${registro.estado}</span>
            <br>
            <small>
                ${registro.tarefasConcluidas}/${registro.totalTarefas} concluídas ·
                ${pendentes} não concluídas ·
                ${registro.percentualConclusao}% ·
                ${registro.pontosConquistados}/${registro.pontosPlanejados} pts ·
                +${registro.experienciaGanha} XP${tipoFechamento}
            </small>
            <br>
            <small>
                😊 ${registro.satisfacao} ·
                ⚡ ${registro.energia} ·
                😣 ${registro.estresse} ·
                🥱 ${registro.tedio}
            </small>
        `;

        return item;
    }

    function mostrarHistorico() {
        dom.listaHistorico.innerHTML = "";

        if (state.historicoDiario.length === 0) {
            dom.listaHistorico.innerHTML =
                '<li class="lista-vazia">Nenhum dia encerrado.</li>';
            return;
        }

        const ordenado = [...state.historicoDiario].sort(function (a, b) {
            return b.data.localeCompare(a.data);
        });

        ordenado.forEach(function (registro) {
            dom.listaHistorico.appendChild(criarItemHistorico(registro));
        });
    }

    function diaJaFechado(data) {
        return state.historicoDiario.some(function (registro) {
            return registro.data === data;
        });
    }

    function obterTarefasDoDia(data) {
        return state.tarefas.filter(function (tarefa) {
            return tarefa.data === data;
        });
    }

    function prepararTarefasParaFechamento(tarefasDoDia, automatico) {
        return tarefasDoDia.map(function (tarefa) {
            const copia = { ...tarefa };

            if (automatico && copia.status === "pendente") {
                copia.status = "nao_concluida";
            }

            return copia;
        });
    }

    function obterDatasPendentesDeFechamento() {
        const datasUnicas = [];

        state.tarefas.forEach(function (tarefa) {
            if (!datasUnicas.includes(tarefa.data)) {
                datasUnicas.push(tarefa.data);
            }
        });

        return datasUnicas
            .filter(function (data) {
                return diaEstaEncerrado(data) && !diaJaFechado(data);
            })
            .sort();
    }

    function executarFechamentoDia(data, opcoes) {
        const opcoesFechamento = opcoes || {};
        const automatico = opcoesFechamento.automatico === true;

        if (diaJaFechado(data)) {
            return { sucesso: false, motivo: "ja_fechado", data };
        }

        const tarefasOriginais = obterTarefasDoDia(data);

        if (tarefasOriginais.length === 0) {
            return { sucesso: false, motivo: "sem_tarefas", data };
        }

        const tarefasDoDia = prepararTarefasParaFechamento(
            tarefasOriginais,
            automatico
        );

        const resumo = calcularResumo(tarefasDoDia);
        const distribuicaoTipos = calcularDistribuicaoTipos(tarefasDoDia);
        const equilibrioTipos = calcularEquilibrioTipos(distribuicaoTipos);
        const estadoFinal = calcularEstadoTamagochi(tarefasDoDia);
        const estadoVisual = definirEstadoVisual(estadoFinal);
        const experienciaGanha = calcularExperienciaDoDia(resumo, estadoFinal);

        const novoRegistro = {
            id: Date.now(),
            data,
            totalTarefas: resumo.totalTarefas,
            tarefasConcluidas: resumo.quantidadeConcluidas,
            tarefasPendentes: resumo.quantidadePendentes,
            pontosPlanejados: resumo.pontosPlanejados,
            pontosConquistados: resumo.pontosConquistados,
            cargaTotal: resumo.cargaTotal,
            percentualConclusao: resumo.percentualConclusao,
            distribuicaoTipos,
            equilibrioTipos,
            satisfacao: estadoFinal.satisfacao,
            energia: estadoFinal.energia,
            estresse: estadoFinal.estresse,
            tedio: estadoFinal.tedio,
            estado: estadoVisual.nome,
            experienciaGanha,
            fechamentoAutomatico: automatico,
            tarefas: tarefasDoDia
        };

        state.historicoDiario.push(novoRegistro);
        atualizarPersonagemAposFechamento(novoRegistro, tarefasDoDia);

        state.tarefas = state.tarefas.filter(function (tarefa) {
            return tarefa.data !== data;
        });

        salvarHistorico();
        salvarTarefas();
        salvarPersonagem();

        return {
            sucesso: true,
            data,
            registro: novoRegistro,
            experienciaGanha,
            automatico
        };
    }

    function verificarFechamentoAutomatico() {
        const datasPendentes = obterDatasPendentesDeFechamento();

        if (datasPendentes.length === 0) {
            return [];
        }

        const fechamentos = [];

        datasPendentes.forEach(function (data) {
            const resultado = executarFechamentoDia(data, {
                automatico: true
            });

            if (resultado.sucesso) {
                fechamentos.push(resultado);
            }
        });

        if (fechamentos.length === 0) {
            return [];
        }

        tocarSom("diaFechado");

        mostrarTarefas();
        mostrarHistorico();

        if (fechamentos.length === 1) {
            const fechamento = fechamentos[0];
            const pendentes = fechamento.registro.tarefasPendentes;

            alert(
                `Dia ${formatarData(fechamento.data)} encerrado automaticamente às ` +
                `${String(HORARIO_FIM_DO_DIA.hora).padStart(2, "0")}:` +
                `${String(HORARIO_FIM_DO_DIA.minuto).padStart(2, "0")}.\n` +
                `${fechamento.registro.tarefasConcluidas} tarefa(s) concluída(s), ` +
                `${pendentes} não concluída(s).\n` +
                `Experiência ganha: ${fechamento.experienciaGanha} XP.`
            );
        } else {
            alert(
                `${fechamentos.length} dias foram encerrados automaticamente ` +
                "com base no horário limite do dia."
            );
        }

        return fechamentos;
    }

    function iniciarMonitoramentoDeFechamento() {
        verificarFechamentoAutomatico();

        if (state.monitorFechamentoAutomatico !== null) {
            clearInterval(state.monitorFechamentoAutomatico);
        }

        state.monitorFechamentoAutomatico = setInterval(
            verificarFechamentoAutomatico,
            INTERVALO_VERIFICACAO_FECHAMENTO_MS
        );
    }

    function fecharDia() {
        tocarSom("clique");

        const dataAtual = obterDataAtual();
        const tarefasDoDia = obterTarefasDoDia(dataAtual);

        if (tarefasDoDia.length === 0) {
            tocarSom("erro");
            alert("Não existem tarefas cadastradas para hoje.");
            return;
        }

        if (diaJaFechado(dataAtual)) {
            tocarSom("erro");
            alert("O dia de hoje já foi encerrado.");
            return;
        }

        const confirmar = confirm(
            "Deseja realmente fechar o dia? " +
            "As tarefas de hoje serão movidas para o histórico."
        );

        if (!confirmar) {
            return;
        }

        const resultado = executarFechamentoDia(dataAtual, {
            automatico: false
        });

        if (!resultado.sucesso) {
            tocarSom("erro");
            alert("Não foi possível encerrar o dia.");
            return;
        }

        tocarSom("diaFechado");

        mostrarTarefas();
        mostrarHistorico();

        alert(
            `Dia encerrado! Você ganhou ${resultado.experienciaGanha} pontos de experiência.`
        );
    }

    App.historico = {
        mostrarHistorico,
        executarFechamentoDia,
        verificarFechamentoAutomatico,
        iniciarMonitoramentoDeFechamento,
        fecharDia
    };
})(window.TamagochiApp);
