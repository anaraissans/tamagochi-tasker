(function (App) {
    const CHAVE_PREFERENCIA = "tamagochiSomHabilitado";

    const arquivos = {
        clique: "sounds/click.ogg",
        tarefaAdicionada: "sounds/tarefa_adicionada.ogg",
        tarefaConcluida: "sounds/tarefa_concluida.ogg",
        tarefaExcluida: "sounds/tarefa_excluida.ogg",
        diaFechado: "sounds/dia_fechado.ogg",
        erro: "sounds/erro.ogg"
    };

    const cache = {};
    let habilitado = true;
    let volume = 0.45;
    let desbloqueado = false;

    function carregarPreferencia() {
        const salvo = localStorage.getItem(CHAVE_PREFERENCIA);

        if (salvo === null) {
            return true;
        }

        return salvo === "true";
    }

    function salvarPreferencia() {
        localStorage.setItem(
            CHAVE_PREFERENCIA,
            habilitado ? "true" : "false"
        );
    }

    function obterAudio(nome) {
        if (!arquivos[nome]) {
            return null;
        }

        if (!cache[nome]) {
            const audio = new Audio(arquivos[nome]);
            audio.preload = "auto";
            cache[nome] = audio;
        }

        return cache[nome];
    }

    function desbloquear() {
        desbloqueado = true;
    }

    function tocar(nome) {
        if (!habilitado) {
            return;
        }

        const audio = obterAudio(nome);

        if (!audio) {
            return;
        }

        if (!desbloqueado) {
            desbloquear();
        }

        const instancia = audio.cloneNode();
        instancia.volume = volume;

        instancia.play().catch(function () {
            /* autoplay bloqueado até interação do usuário */
        });
    }

    function alternar() {
        habilitado = !habilitado;
        salvarPreferencia();
        atualizarBotaoSom();

        if (habilitado) {
            tocar("clique");
        }
    }

    function estaHabilitado() {
        return habilitado;
    }

    function definirVolume(valor) {
        volume = Math.max(0, Math.min(1, valor));
    }

    function preload() {
        Object.keys(arquivos).forEach(function (nome) {
            obterAudio(nome);
        });
    }

    function atualizarBotaoSom() {
        const botao = document.getElementById("botao-som");

        if (!botao) {
            return;
        }

        botao.textContent = habilitado ? "🔊 Som" : "🔇 Som";
        botao.setAttribute(
            "aria-pressed",
            habilitado ? "true" : "false"
        );
        botao.title = habilitado
            ? "Desativar sons"
            : "Ativar sons";
    }

    function registrarBotaoSom() {
        const botao = document.getElementById("botao-som");

        if (!botao) {
            return;
        }

        botao.addEventListener("click", function () {
            alternar();
        });

        atualizarBotaoSom();
    }

    function inicializar() {
        habilitado = carregarPreferencia();
        preload();
        registrarBotaoSom();
    }

    App.som = {
        tocar,
        alternar,
        desbloquear,
        estaHabilitado,
        definirVolume,
        inicializar
    };
})(window.TamagochiApp = window.TamagochiApp || {});
