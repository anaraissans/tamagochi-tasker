(function (App) {
    const { rotulos, spritesEvolucao } = App.config;
    const { dom } = App;
    const { state } = App;
    const {
        filtrarConcluidas,
        formatarRotulo,
        limitarValor,
        obterDataAtual,
        encontrarTipoDominante
    } = App.utils;

    function criarPersonagemInicial() {
        const dataAtual = obterDataAtual();

        return {
            nome: "Tama",
            faseBase: "ovo",
            evolucaoAtual: "ovo",
            nivel: 1,
            experienciaTotal: 0,
            experienciaNivel: 0,
            experienciaProximoNivel: 100,
            diasVividos: 0,
            satisfacaoBase: 50,
            energiaBase: 70,
            estresseBase: 20,
            tedioBase: 40,
            historicoEstados: {
                equilibrado: 0,
                burnout: 0,
                cabecaVazia: 0,
                exausto: 0,
                obsessivo: 0,
                caotico: 0,
                sombrio: 0,
                vazio: 0
            },
            contagemTipos: {
                trabalho: 0,
                lazer: 0,
                saude: 0,
                estudo: 0,
                criatividade: 0
            },
            totalTarefasPlanejadas: 0,
            totalTarefasConcluidas: 0,
            diasConsecutivosAtivos: 0,
            diasSemAtividade: 0,
            diasComSobrecarga: 0,
            diasComBaixaAtividade: 0,
            formaAnterior: null,
            dataCriacao: dataAtual,
            ultimaAtualizacao: dataAtual
        };
    }

    function obterSpriteEvolucao() {
        const { personagem } = state;

        return (
            spritesEvolucao[personagem.evolucaoAtual] ||
            spritesEvolucao[personagem.faseBase] ||
            spritesEvolucao.ovo
        );
    }

    function atualizarSpritePersonagem() {
        const { personagem } = state;
        const evolucao = personagem.evolucaoAtual;

        dom.personagem.textContent = obterSpriteEvolucao();
        dom.personagem.dataset.evolucao = evolucao;
        dom.personagem.title = formatarRotulo(rotulos.evolucao, evolucao);
    }

    function atualizarInfoPersonagem() {
        const { personagem } = state;

        dom.valorNivel.textContent = personagem.nivel;
        dom.valorDiasVividos.textContent = personagem.diasVividos;
        dom.valorFase.textContent = formatarRotulo(
            rotulos.fase,
            personagem.faseBase
        );
        dom.valorEvolucao.textContent = formatarRotulo(
            rotulos.evolucao,
            personagem.evolucaoAtual
        );
        dom.valorExperiencia.textContent = personagem.experienciaNivel;
        dom.valorExperienciaProximoNivel.textContent =
            personagem.experienciaProximoNivel;
        dom.valorExperienciaTotal.textContent =
            `Total: ${personagem.experienciaTotal} XP`;
        dom.barraExperiencia.max = personagem.experienciaProximoNivel;
        dom.barraExperiencia.value = personagem.experienciaNivel;

        atualizarSpritePersonagem();
    }

    function atualizarContagemTipos(tarefasDoDia) {
        const { personagem } = state;

        filtrarConcluidas(tarefasDoDia).forEach(function (tarefa) {
            if (personagem.contagemTipos[tarefa.tipo] !== undefined) {
                personagem.contagemTipos[tarefa.tipo] += 1;
            }
        });
    }

    function atualizarSequenciasDoPersonagem(registro) {
        const { personagem } = state;

        if (registro.tarefasConcluidas > 0) {
            personagem.diasConsecutivosAtivos += 1;
            personagem.diasSemAtividade = 0;
        } else {
            personagem.diasConsecutivosAtivos = 0;
            personagem.diasSemAtividade += 1;
        }

        if (registro.estresse >= 70 || registro.energia <= 20) {
            personagem.diasComSobrecarga += 1;
        } else {
            personagem.diasComSobrecarga = 0;
        }

        if (registro.pontosConquistados < 10) {
            personagem.diasComBaixaAtividade += 1;
        } else {
            personagem.diasComBaixaAtividade = 0;
        }
    }

    function atualizarContagemDeEstados(registro) {
        const { personagem } = state;
        const estado = registro.estado.toLowerCase().replaceAll(" ", "");

        if (estado === "equilibrado") {
            personagem.historicoEstados.equilibrado += 1;
        }

        if (estado === "exausto") {
            personagem.historicoEstados.exausto += 1;
        }

        if (estado === "sobrecarregado") {
            personagem.historicoEstados.burnout += 1;
        }

        if (estado === "entediado") {
            personagem.historicoEstados.cabecaVazia += 1;
        }
    }

    function atualizarIndicadoresBase(registro) {
        const { personagem } = state;

        personagem.satisfacaoBase = limitarValor(
            Math.round(registro.satisfacao * 0.4 + 50 * 0.6)
        );
        personagem.energiaBase = limitarValor(
            Math.round(registro.energia * 0.3 + 70 * 0.7)
        );
        personagem.estresseBase = limitarValor(
            Math.round(registro.estresse * 0.4 + 20 * 0.6)
        );
        personagem.tedioBase = limitarValor(
            Math.round(registro.tedio * 0.4 + 40 * 0.6)
        );
    }

    function calcularExperienciaProximoNivel(nivel) {
        return Math.round(100 * Math.pow(1.25, nivel - 1));
    }

    function verificarSubidaDeNivel() {
        const { personagem } = state;

        while (
            personagem.experienciaNivel >= personagem.experienciaProximoNivel
        ) {
            personagem.experienciaNivel -= personagem.experienciaProximoNivel;
            personagem.nivel += 1;
            personagem.experienciaProximoNivel =
                calcularExperienciaProximoNivel(personagem.nivel);
        }
    }

    function verificarFaseBase() {
        const { personagem } = state;

        if (
            personagem.faseBase === "ovo" &&
            personagem.diasVividos >= 3 &&
            personagem.experienciaTotal >= 50
        ) {
            personagem.formaAnterior = personagem.evolucaoAtual;
            personagem.faseBase = "pintinho";
            personagem.evolucaoAtual = "pintinho";
        }
    }

    function estaEmBurnout() {
        const { personagem } = state;

        return (
            personagem.diasComSobrecarga >= 3 ||
            (personagem.estresseBase >= 80 && personagem.energiaBase <= 20)
        );
    }

    function estaComCabecaVazia() {
        const { personagem } = state;

        return (
            personagem.diasComBaixaAtividade >= 3 ||
            personagem.tedioBase >= 75
        );
    }

    function calcularEvolucaoPrincipal() {
        const { personagem } = state;
        const tipos = personagem.contagemTipos;
        const tipoDominante = encontrarTipoDominante(tipos);

        const taxaConclusao =
            personagem.totalTarefasPlanejadas === 0
                ? 0
                : personagem.totalTarefasConcluidas /
                  personagem.totalTarefasPlanejadas;

        const quantidadeTiposUsados = Object.values(tipos).filter(
            function (quantidade) {
                return quantidade > 0;
            }
        ).length;

        if (personagem.diasSemAtividade >= 7 && personagem.tedioBase >= 70) {
            return "vazio";
        }

        if (
            personagem.estresseBase >= 70 &&
            personagem.satisfacaoBase <= 35 &&
            personagem.tedioBase >= 60
        ) {
            return "sombrio";
        }

        if (taxaConclusao < 0.4 && personagem.totalTarefasPlanejadas >= 20) {
            return "caotico";
        }

        if (tipoDominante.percentual >= 0.8 && quantidadeTiposUsados <= 2) {
            return "obsessivo";
        }

        if (
            personagem.historicoEstados.exausto >= 5 &&
            personagem.estresseBase >= 60
        ) {
            return "exausto";
        }

        if (tipoDominante.tipo === "trabalho" && taxaConclusao >= 0.7) {
            return "trabalhador";
        }

        if (tipoDominante.tipo === "estudo") {
            return "sabio";
        }

        if (tipoDominante.tipo === "saude") {
            return "atleta";
        }

        if (tipoDominante.tipo === "criatividade") {
            return "criativo";
        }

        if (quantidadeTiposUsados >= 4 && tipoDominante.percentual <= 0.45) {
            return "explorador";
        }

        if (personagem.diasConsecutivosAtivos >= 7 && taxaConclusao >= 0.7) {
            return "responsavel";
        }

        return "pintinho";
    }

    function verificarEvolucaoIntermediaria() {
        const { personagem } = state;

        if (personagem.faseBase === "ovo") {
            return;
        }

        if (estaEmBurnout()) {
            if (personagem.evolucaoAtual !== "burnout") {
                personagem.formaAnterior = personagem.evolucaoAtual;
            }

            personagem.evolucaoAtual = "burnout";
            return;
        }

        if (estaComCabecaVazia()) {
            if (personagem.evolucaoAtual !== "cabecaVazia") {
                personagem.formaAnterior = personagem.evolucaoAtual;
            }

            personagem.evolucaoAtual = "cabecaVazia";
            return;
        }

        if (
            personagem.evolucaoAtual === "burnout" ||
            personagem.evolucaoAtual === "cabecaVazia"
        ) {
            personagem.evolucaoAtual =
                personagem.formaAnterior || personagem.faseBase;
            personagem.formaAnterior = null;
        }
    }

    function verificarEvolucaoPrincipal() {
        const { personagem } = state;

        if (personagem.faseBase !== "pintinho") {
            return;
        }

        if (personagem.diasVividos < 14 || personagem.nivel < 3) {
            return;
        }

        if (
            personagem.evolucaoAtual === "burnout" ||
            personagem.evolucaoAtual === "cabecaVazia"
        ) {
            return;
        }

        personagem.evolucaoAtual = calcularEvolucaoPrincipal();
    }

    function atualizarPersonagemAposFechamento(registro, tarefasDoDia) {
        const { personagem } = state;

        personagem.diasVividos += 1;
        personagem.experienciaTotal += registro.experienciaGanha;
        personagem.experienciaNivel += registro.experienciaGanha;
        personagem.totalTarefasPlanejadas += registro.totalTarefas;
        personagem.totalTarefasConcluidas += registro.tarefasConcluidas;
        personagem.ultimaAtualizacao = registro.data;

        atualizarContagemTipos(tarefasDoDia);
        atualizarSequenciasDoPersonagem(registro);
        atualizarContagemDeEstados(registro);
        atualizarIndicadoresBase(registro);

        verificarSubidaDeNivel();
        verificarFaseBase();
        verificarEvolucaoPrincipal();
        verificarEvolucaoIntermediaria();
    }

    App.personagem = {
        criarPersonagemInicial,
        obterSpriteEvolucao,
        atualizarSpritePersonagem,
        atualizarInfoPersonagem,
        atualizarPersonagemAposFechamento
    };
})(window.TamagochiApp);
