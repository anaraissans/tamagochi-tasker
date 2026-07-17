(function (App) {
    const { HORARIO_FIM_DO_DIA, pontosPorDificuldade } = App.config;

    function limitarValor(valor) {
        return Math.max(0, Math.min(100, valor));
    }

    function obterDataAtual() {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const dia = String(agora.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    function obterHorarioAtual() {
        const agora = new Date();
        return {
            data: obterDataAtual(),
            hora: agora.getHours(),
            minuto: agora.getMinutes()
        };
    }

    function diaEstaEncerrado(data) {
        const horario = obterHorarioAtual();

        if (data < horario.data) {
            return true;
        }

        if (data === horario.data) {
            return (
                horario.hora > HORARIO_FIM_DO_DIA.hora ||
                (
                    horario.hora === HORARIO_FIM_DO_DIA.hora &&
                    horario.minuto >= HORARIO_FIM_DO_DIA.minuto
                )
            );
        }

        return false;
    }

    function formatarData(data) {
        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function calcularPontos(dificuldade) {
        return pontosPorDificuldade[dificuldade] || 0;
    }

    function formatarRotulo(mapa, chave) {
        return mapa[chave] || chave;
    }

    function filtrarConcluidas(lista) {
        return lista.filter(function (tarefa) {
            return tarefa.status === "concluida";
        });
    }

    function somarPontos(lista) {
        return lista.reduce(function (total, tarefa) {
            return total + Number(tarefa.pontos);
        }, 0);
    }

    function calcularPercentual(conquistados, planejados) {
        if (planejados === 0) {
            return 0;
        }

        return Math.round((conquistados / planejados) * 100);
    }

    function encontrarTipoDominante(tipos) {
        const entradas = Object.entries(tipos);
        const total = entradas.reduce(function (soma, entrada) {
            return soma + entrada[1];
        }, 0);

        if (total === 0) {
            return { tipo: null, quantidade: 0, percentual: 0 };
        }

        const maiorTipo = entradas.reduce(function (maior, atual) {
            return atual[1] > maior[1] ? atual : maior;
        });

        return {
            tipo: maiorTipo[0],
            quantidade: maiorTipo[1],
            percentual: maiorTipo[1] / total
        };
    }

    function calcularResumo(listaTarefas) {
        const concluidas = filtrarConcluidas(listaTarefas);
        const pendentes = listaTarefas.filter(function (tarefa) {
            return (
                tarefa.status === "pendente" ||
                tarefa.status === "nao_concluida"
            );
        });

        const pontosPlanejados = somarPontos(listaTarefas);
        const pontosConquistados = somarPontos(concluidas);

        return {
            totalTarefas: listaTarefas.length,
            quantidadeConcluidas: concluidas.length,
            quantidadePendentes: pendentes.length,
            pontosPlanejados,
            pontosConquistados,
            cargaTotal: pontosPlanejados,
            percentualConclusao: calcularPercentual(
                pontosConquistados,
                pontosPlanejados
            )
        };
    }

    function calcularDistribuicaoTipos(listaTarefas) {
        const distribuicao = {
            trabalho: 0,
            lazer: 0,
            saude: 0,
            estudo: 0
        };

        listaTarefas.forEach(function (tarefa) {
            if (distribuicao[tarefa.tipo] !== undefined) {
                distribuicao[tarefa.tipo] += 1;
            }
        });

        return distribuicao;
    }

    function calcularEquilibrioTipos(distribuicao) {
        const quantidades = Object.values(distribuicao);
        const total = quantidades.reduce(function (soma, quantidade) {
            return soma + quantidade;
        }, 0);

        if (total === 0) {
            return {
                indice: 100,
                tiposUsados: 0,
                tipoDominante: null
            };
        }

        const tipoDominante = encontrarTipoDominante(distribuicao);
        const tiposUsados = quantidades.filter(function (quantidade) {
            return quantidade > 0;
        }).length;

        return {
            indice: Math.round((1 - tipoDominante.percentual) * 100),
            tiposUsados,
            tipoDominante: tipoDominante.tipo
        };
    }

    function carregarJson(chave, valorPadrao) {
        const salvo = localStorage.getItem(chave);

        if (salvo === null) {
            return valorPadrao;
        }

        try {
            return JSON.parse(salvo);
        } catch (erro) {
            console.error(`Não foi possível carregar "${chave}":`, erro);
            return valorPadrao;
        }
    }

    function salvarJson(chave, valor) {
        localStorage.setItem(chave, JSON.stringify(valor));
    }

    App.utils = {
        limitarValor,
        obterDataAtual,
        obterHorarioAtual,
        diaEstaEncerrado,
        formatarData,
        calcularPontos,
        formatarRotulo,
        filtrarConcluidas,
        somarPontos,
        calcularPercentual,
        encontrarTipoDominante,
        calcularResumo,
        calcularDistribuicaoTipos,
        calcularEquilibrioTipos,
        carregarJson,
        salvarJson
    };
})(window.TamagochiApp = window.TamagochiApp || {});
