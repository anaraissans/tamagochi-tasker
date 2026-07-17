window.TamagochiApp = window.TamagochiApp || {};

window.TamagochiApp.config = {
    CHAVES_STORAGE: {
        tarefas: "tarefasTamagochi",
        historico: "historicoTamagochi",
        personagem: "personagemTamagochi"
    },
    efeitosPorTipo: {
        trabalho: { satisfacao: 0.6, energia: -0.7, estresse: 0.6, tedio: -0.4 },
        estudo: { satisfacao: 0.7, energia: -0.6, estresse: 0.1, tedio: -0.7 },
        saude: { satisfacao: 0.8, energia: 0.3, estresse: -0.4, tedio: -0.4 },
        lazer: { satisfacao: 0.6, energia: 0.5, estresse: -0.6, tedio: -0.8 }
    },
    pontosPorDificuldade: {
        facil: 5,
        media: 10,
        dificil: 15
    },
    HORARIO_FIM_DO_DIA: {
        hora: 23,
        minuto: 59
    },
    INTERVALO_VERIFICACAO_FECHAMENTO_MS: 30000,
    rotulos: {
        status: {
            pendente: "Pendente",
            concluida: "Concluída",
            nao_concluida: "Não concluída"
        },
        tipo: {
            trabalho: "Trabalho",
            lazer: "Lazer",
            saude: "Saúde",
            estudo: "Estudo"
        },
        dificuldade: {
            facil: "Fácil",
            media: "Média",
            dificil: "Difícil"
        },
        fase: {
            ovo: "Ovo",
            pintinho: "Pintinho"
        },
        evolucao: {
            ovo: "Ovo",
            pintinho: "Pintinho",
            burnout: "Burnout",
            cabecaVazia: "Cabeça vazia",
            vazio: "Vazio",
            sombrio: "Sombrio",
            caotico: "Caótico",
            obsessivo: "Obsessivo",
            exausto: "Exausto",
            trabalhador: "Trabalhador",
            sabio: "Sábio",
            atleta: "Atleta",
            criativo: "Criativo",
            explorador: "Explorador",
            responsavel: "Responsável"
        }
    },
    spritesEvolucao: {
        ovo: "🥚",
        pintinho: "🐣",
        burnout: "😵",
        cabecaVazia: "😶",
        trabalhador: "👷",
        sabio: "👨‍🎓",
        atleta: "💪",
        criativo: "🖌️",
        explorador: "🧭",
        responsavel: "🕴️",
        vazio: "👤",
        sombrio: "👿",
        caotico: "🤪",
        obsessivo: "🙀",
        exausto: "🥱"
    }
};
