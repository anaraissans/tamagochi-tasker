(function (App) {
    const { efeitosPorTipo } = App.config;
    const { dom } = App;
    const { state } = App;
    const { filtrarConcluidas, limitarValor } = App.utils;
    const { atualizarInfoPersonagem } = App.personagem;

    function calcularEstadoTamagochi(tarefasParaCalcular) {
        const lista = tarefasParaCalcular || state.tarefas;
        const { personagem } = state;

        const estado = {
            satisfacao: personagem.satisfacaoBase,
            energia: personagem.energiaBase,
            estresse: personagem.estresseBase,
            tedio: personagem.tedioBase
        };

        filtrarConcluidas(lista).forEach(function (tarefa) {
            const efeitos = efeitosPorTipo[tarefa.tipo];

            if (!efeitos) {
                return;
            }

            estado.satisfacao += tarefa.pontos * efeitos.satisfacao;
            estado.energia += tarefa.pontos * efeitos.energia;
            estado.estresse += tarefa.pontos * efeitos.estresse;
            estado.tedio += tarefa.pontos * efeitos.tedio;
        });

        estado.satisfacao = limitarValor(Math.round(estado.satisfacao));
        estado.energia = limitarValor(Math.round(estado.energia));
        estado.estresse = limitarValor(Math.round(estado.estresse));
        estado.tedio = limitarValor(Math.round(estado.tedio));

        return estado;
    }

    function definirEstadoVisual(estado) {
        if (estado.estresse >= 80 && estado.energia <= 30) {
            return {
                nome: "Sobrecarregado",
                mensagem: "Seu Tamagochi está no limite e precisa descansar."
            };
        }

        if (estado.energia <= 20) {
            return {
                nome: "Exausto",
                mensagem: "Seu Tamagochi está sem energia."
            };
        }

        if (estado.estresse >= 65) {
            return {
                nome: "Estressado",
                mensagem: "Há muitas responsabilidades acumuladas."
            };
        }

        if (estado.tedio >= 70) {
            return {
                nome: "Entediado",
                mensagem: "Seu Tamagochi precisa de mais estímulos."
            };
        }

        if (estado.satisfacao <= 30) {
            return {
                nome: "Desanimado",
                mensagem: "Poucas conquistas foram realizadas."
            };
        }

        if (
            estado.satisfacao >= 80 &&
            estado.estresse <= 40 &&
            estado.tedio <= 40
        ) {
            return {
                nome: "Muito feliz",
                mensagem: "Seu Tamagochi está muito satisfeito!"
            };
        }

        if (
            estado.satisfacao >= 60 &&
            estado.energia >= 40 &&
            estado.estresse <= 50 &&
            estado.tedio <= 50
        ) {
            return {
                nome: "Equilibrado",
                mensagem: "Seu Tamagochi está mantendo uma rotina saudável."
            };
        }

        return {
            nome: "Neutro",
            mensagem: "Seu Tamagochi está aguardando novas atividades."
        };
    }

    function atualizarTamagochi() {
        const estado = calcularEstadoTamagochi();
        const visual = definirEstadoVisual(estado);

        dom.nomeEstado.textContent = visual.nome;
        dom.mensagemEstado.textContent = visual.mensagem;
        dom.valorSatisfacao.textContent = estado.satisfacao;
        dom.valorEnergia.textContent = estado.energia;
        dom.valorEstresse.textContent = estado.estresse;
        dom.valorTedio.textContent = estado.tedio;
        dom.barraSatisfacao.value = estado.satisfacao;
        dom.barraEnergia.value = estado.energia;
        dom.barraEstresse.value = estado.estresse;
        dom.barraTedio.value = estado.tedio;

        atualizarInfoPersonagem();
    }

    App.tamagochi = {
        calcularEstadoTamagochi,
        definirEstadoVisual,
        atualizarTamagochi
    };
})(window.TamagochiApp);
