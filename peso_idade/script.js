// script.js
const valorErro = document.getElementById("valor_entrada");

// ==========================================================================
// DADOS DAS FÓRMULAS
// ==========================================================================
const FORMULAS = {
    faixaEtaria: {
        unica: {
            nome: "Fórmula única",
            precisao: "Moderada",
            descricao: "Acerta ~35% dentro de ±10% do peso real.",
            aviso: "Prefira peso real ou fita de Broselow em emergências.",
            pesoParaIdade: (kg) => {
                if (kg < 10) return { valor: Math.floor(Math.max(0, (kg * 2) - 9)), unidade: "Meses" };
                if (kg <= 20) return { valor: Math.floor((kg - 8) / 2), unidade: "Anos" };
                return { valor: Math.floor((kg - 3) / 3), unidade: "Anos" };
            },
            idadeParaPeso: (anos) => {
                if (anos < 1) return (anos * 10 + 9) / 2;
                if (anos <= 6) return (anos * 2) + 8;
                return (anos * 3) + 3;
            }
        },
        apls: {
            nome: "APLS (Original)",
            precisao: "Moderada",
            descricao: "Acerta ~35% dentro de ±10%. Amplamente usada mas desatualizada.",
            aviso: "Subestima o peso em crianças mais velhas.",
            pesoParaIdade: (kg) => {
                if (kg < 10) return { valor: Math.floor(Math.max(0, (kg - 4) / 0.5)), unidade: "Meses" };
                if (kg <= 20) return { valor: Math.floor((kg - 8) / 2), unidade: "Anos" };
                return { valor: Math.floor((kg - 7) / 3), unidade: "Anos" };
            },
            idadeParaPeso: (anos) => {
                if (anos < 1) return (0.5 * (anos * 12)) + 4;
                if (anos <= 5) return (2 * anos) + 8;
                return (3 * anos) + 7;
            }
        },
        bestguess: {
            nome: "Best Guess",
            precisao: "Boa",
            descricao: "Acerta ~44% dentro de ±10%. Melhor que APLS em todas as faixas.",
            aviso: "Menos fiável em crianças obesas.",
            pesoParaIdade: (kg) => {
                if (kg < 10) return { valor: Math.floor(Math.max(0, (kg - 4.5) / 0.5)), unidade: "Meses" };
                if (kg <= 20) return { valor: Math.floor((kg - 10) / 2), unidade: "Anos" };
                return { valor: Math.floor(kg / 4), unidade: "Anos" };
            },
            idadeParaPeso: (anos) => {
                if (anos < 1) return (0.5 * (anos * 12)) + 4;
                if (anos <= 5) return (2 * anos) + 10;
                return 4 * anos;
            }
        },
        luscombe: {
            nome: "Luscombe & Owens",
            precisao: "Boa",
            descricao: "Acerta ~50% dentro de ±10%. Mais precisa que APLS.",
            aviso: "Validada em população do Reino Unido.",
            pesoParaIdade: (kg) => {
                if (kg < 10) return { valor: Math.floor(Math.max(0, (kg - 4) / 0.5)), unidade: "Meses" };
                return { valor: Math.floor((kg - 7) / 3), unidade: "Anos" };
            },
            idadeParaPeso: (anos) => (3 * anos) + 7
        },
        michigan: {
            nome: "Michigan",
            precisao: "Muito Boa",
            descricao: "Acerta ~92% dentro de ±10%. Desenvolvida para crianças contemporâneas.",
            aviso: "Validada em população americana, incluindo obesos.",
            pesoParaIdade: (kg) => {
                if (kg < 10) return { valor: Math.floor(Math.max(0, (kg - 4) / 0.5)), unidade: "Meses" };
                return { valor: Math.floor((kg - 10) / 3), unidade: "Anos" };
            },
            idadeParaPeso: (anos) => (3 * anos) + 10
        }
    },
    populacao: {
        oms: {
            nome: "OMS (Genérica)",
            precisao: "Variável",
            descricao: "Baseada nas curvas de crescimento da OMS para crianças saudáveis.",
            aviso: "Pode não refletir a tua população local.",
            pesoParaIdade: (kg) => {
                if (kg < 10) return { valor: Math.floor(Math.max(0, (kg - 4) / 0.5)), unidade: "Meses" };
                if (kg <= 20) return { valor: Math.floor((kg - 8) / 2), unidade: "Anos" };
                return { valor: Math.floor((kg - 7) / 3), unidade: "Anos" };
            },
            idadeParaPeso: (anos) => {
                if (anos < 1) return (0.5 * (anos * 12)) + 4;
                if (anos <= 5) return (2 * anos) + 8;
                return (3 * anos) + 7;
            }
        },
        portugal: {
            nome: "Portugal",
            precisao: "Variável",
            descricao: "Baseada nas curvas de crescimento portuguesas.",
            aviso: "Pode não ser aplicável fora de Portugal.",
            pesoParaIdade: (kg) => {
                if (kg < 10) return { valor: Math.floor(Math.max(0, (kg - 4) / 0.5)), unidade: "Meses" };
                if (kg <= 20) return { valor: Math.floor((kg - 8.5) / 2), unidade: "Anos" };
                return { valor: Math.floor((kg - 7.5) / 3), unidade: "Anos" };
            },
            idadeParaPeso: (anos) => {
                if (anos < 1) return (0.5 * (anos * 12)) + 4;
                if (anos <= 5) return (2 * anos) + 8.5;
                return (3 * anos) + 7.5;
            }
        }
    }
};

// Fórmula atualmente selecionada
let formulaAtual = { tipo: 'faixaEtaria', value: 'unica' };

// ==========================================================================
// FORMATAR NÚMERO
// ==========================================================================
function formatarNumero(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
}

// ==========================================================================
// SELECT DE MODO (Idade pelo Peso / Peso pela Idade)
// ==========================================================================
function toggleModoSelect() {
    const options = document.getElementById('modoOptions');
    const trigger = document.querySelector('#selectModo .custom-select-trigger-antropometria');
    if (!options || !trigger) return;
    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

function selecionarModo(valor, label) {
    document.getElementById('modo_calculo').value = valor;
    document.getElementById('modoSelecionado').textContent = label;
    const container = document.getElementById('modoOptions');
    container.querySelectorAll('.custom-select-option-antropometria').forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.value === valor) opt.classList.add('selecionado');
    });
    container.classList.remove('aberto');
    const trigger = document.querySelector('#selectModo .custom-select-trigger-antropometria');
    if (trigger) trigger.classList.remove('aberto');
    ajustarInterface();
}

// ==========================================================================
// SELECT DE FÓRMULA (duas colunas)
// ==========================================================================
function toggleFormulaSelect() {
    const options = document.getElementById('formulaOptions');
    const trigger = document.querySelector('#selectFormula .custom-select-trigger-antropometria');
    if (!options || !trigger) return;
    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

function selecionarFormula(tipo, value, label) {
    formulaAtual.tipo = tipo;
    formulaAtual.value = value;

    document.getElementById('formula_escolhida').value = value;
    document.getElementById('formula_tipo').value = tipo;
    document.getElementById('formulaSelecionada').textContent = label;

    // Marcar opção selecionada
    const container = document.getElementById('formulaOptions');
    container.querySelectorAll('.formula-option').forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.tipo === tipo && opt.dataset.value === value) {
            opt.classList.add('selecionado');
        }
    });

    // Fechar dropdown
    container.classList.remove('aberto');
    const trigger = document.querySelector('#selectFormula .custom-select-trigger-antropometria');
    if (trigger) trigger.classList.remove('aberto');

    atualizarInfoCard();
}

// Fechar selects ao clicar fora
document.addEventListener('click', function (event) {
    document.querySelectorAll('.custom-select-antropometria, .custom-select-formula').forEach(select => {
        if (!select.contains(event.target)) {
            const options = select.querySelector('.custom-select-options-antropometria');
            const trigger = select.querySelector('.custom-select-trigger-antropometria');
            if (options) options.classList.remove('aberto');
            if (trigger) trigger.classList.remove('aberto');
        }
    });
});

// ==========================================================================
// AJUSTAR INTERFACE
// ==========================================================================
function ajustarInterface() {
    const modo = document.getElementById('modo_calculo').value;
    const label = document.getElementById("label_dinamica");
    const unidade = document.getElementById("unidade_dinamica");
    const icone = document.getElementById("icone_input");
    const input = document.getElementById("valor_entrada");

    input.value = "";

    if (modo === "pesoParaIdade") {
        label.innerText = "Peso";
        unidade.innerText = "kg";
        icone.className = "ri-scales-3-line";
    } else {
        label.innerText = "Idade da Criança";
        unidade.innerText = "anos";
        icone.className = "ri-calendar-line";
    }
}

function removerValorErro() {
    valorErro.style.borderBottom = "solid 2px var(--primary)";
}

// ==========================================================================
// ATUALIZAR INFO CARD
// ==========================================================================
function obterFormulaAtual() {
    if (formulaAtual.tipo === 'faixaEtaria') {
        return FORMULAS.faixaEtaria[formulaAtual.value];
    } else {
        return FORMULAS.populacao[formulaAtual.value];
    }
}

function atualizarInfoCard() {
    const formula = obterFormulaAtual();
    if (!formula) return;

    document.getElementById('infoFormula').textContent = formula.nome;
    document.getElementById('infoPrecisao').textContent = formula.precisao;
    document.getElementById('infoDescricao').textContent = formula.descricao;
    document.getElementById('infoAviso').textContent = formula.aviso;
}

// ==========================================================================
// CÁLCULO PRINCIPAL
// ==========================================================================
function calcularAntropometria() {
    const modo = document.getElementById('modo_calculo').value;
    const valor = parseFloat(document.getElementById("valor_entrada").value);
    const valorErro = document.getElementById("valor_entrada");
    const res = document.getElementById("resultado");

    if (isNaN(valor) || valor <= 0) {
        res.innerHTML = '<i class="ri-error-warning-fill res-icon"></i> Insira um valor válido.';
        res.style.background = "#f44336";
        res.classList.add('visivel');
        valorErro.style.borderBottom = "solid 2px red";
        document.getElementById("infoCard").style.display = "none";
        return;
    }

    if (modo === "pesoParaIdade" && valor > 50) {
        res.innerHTML = `
            <i class="ri-error-warning-fill res-icon"></i>
            <span class="res-titulo">Limite Excedido</span>
            <span class="res-sub">O peso inserido (>50kg) sugere um paciente adulto.</span>
        `;
        res.style.background = "#f44336";
        res.classList.add('visivel');
        valorErro.style.borderBottom = "solid 2px var(--primary)";
        document.getElementById("infoCard").style.display = "none";
        return;
    }

    if (modo === "idadeParaPeso" && valor > 14) {
        res.innerHTML = `
            <i class="ri-error-warning-fill res-icon"></i>
            <span class="res-titulo">Limite Excedido</span>
            <span class="res-sub">A idade inserida (>14 anos) não é pediátrica.</span>
        `;
        res.style.background = "#f44336";
        res.classList.add('visivel');
        valorErro.style.borderBottom = "solid 2px var(--primary)";

        document.getElementById("infoCard").style.display = "none";
        return;
    }

    const formula = obterFormulaAtual();
    let titulo = "";
    let subtitulo = "";

    if (modo === "pesoParaIdade") {
        const r = formula.pesoParaIdade(valor);
        titulo = `~ ${r.valor} ${r.unidade}`;
        subtitulo = `Estimativa de idade para ${valor} kg`;
    } else {
        const peso = formula.idadeParaPeso(valor);
        titulo = `~ ${formatarNumero(peso)} kg`;
        subtitulo = `Peso provável para ${valor} anos`;
    }

    res.innerHTML = `
        <i class="ri-checkbox-circle-fill res-icon"></i>
        <span class="res-titulo">${titulo}</span>
        <span class="res-sub">${subtitulo}</span>
    `;

    res.style.background = "var(--primary)";
    valorErro.style.borderBottom = "solid 2px var(--primary)";
    res.classList.add('visivel');
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
    document.getElementById("infoCard").style.display = "block";
}

// ==========================================================================
// RESTAURAR RESULTADO
// ==========================================================================
function restaurarResultado(html, corFundo) {
    const res = document.getElementById("resultado");
    if (!res) return;
    res.innerHTML = html;
    if (corFundo) {
        res.style.background = corFundo;
    } else if (html.includes('ri-error-warning-fill')) {
        res.style.background = "#f44336";
    } else {
        res.style.background = "var(--primary)";
    }
    res.classList.add('visivel');
}

// ==========================================================================
// LIMPAR
// ==========================================================================
function limparAntropometria() {
    document.getElementById("valor_entrada").value = "";
    document.getElementById("resultado").classList.remove("visivel");
    valorErro.style.borderBottom = "solid 2px var(--primary)";
    document.getElementById("infoCard").style.display = "none";
}

// ==========================================================================
// MENU LATERAL
// ==========================================================================
const btnHamburger = document.getElementById('btnHamburger');
const menuOverlay = document.getElementById('menuOverlay');
const menuLateral = document.getElementById('menuLateral');
const menuItems = document.querySelectorAll('.menu-item');

if (btnHamburger && menuOverlay && menuLateral) {
    function abrirMenu() {
        btnHamburger.classList.add('ativo');
        menuOverlay.classList.add('ativo');
        menuLateral.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }

    function fecharMenu() {
        btnHamburger.classList.remove('ativo');
        menuOverlay.classList.remove('ativo');
        menuLateral.classList.remove('ativo');
        document.body.style.overflow = '';
    }

    btnHamburger.addEventListener('click', () => {
        if (menuLateral.classList.contains('ativo')) {
            fecharMenu();
        } else {
            abrirMenu();
        }
    });

    menuOverlay.addEventListener('click', fecharMenu);

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            setTimeout(fecharMenu, 200);
            const page = item.getAttribute('data-page');
            console.log(`Navegar para: ${page}`);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuLateral.classList.contains('ativo')) {
            fecharMenu();
        }
    });

    let touchStartXMenu = 0;
    menuLateral.addEventListener('touchstart', (e) => {
        touchStartXMenu = e.touches[0].clientX;
    }, { passive: true });

    menuLateral.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartXMenu - touchEndX;
        if (diff < -50) {
            fecharMenu();
        }
    });
}

// ==========================================================================
// MODAL DE MODO TESTE
// ==========================================================================
const testModal = document.getElementById('testModeModal');
const acceptBtn = document.getElementById('btnAcceptTest');

if (testModal && acceptBtn) {
    if (!sessionStorage.getItem('testModeAccepted')) {
        testModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    acceptBtn.addEventListener('click', () => {
        sessionStorage.setItem('testModeAccepted', 'true');
        testModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// ==========================================================================
// TEMA ESCURO
// ==========================================================================
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

themeBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'ri-moon-line';
        localStorage.setItem('tema', 'light');
        document.documentElement.style.backgroundColor = '#f0f2f0';
        document.body.style.backgroundColor = '#f0f2f0';
    } else {
        body.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
        localStorage.setItem('tema', 'dark');
        document.documentElement.style.backgroundColor = '#000000';
        document.body.style.backgroundColor = '#000000';
    }
});

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }

    ajustarInterface();
    atualizarInfoCard();

    // Marcar opção inicial no select de modo
    const primeiraOpcaoModo = document.querySelector('#modoOptions .custom-select-option-antropometria');
    if (primeiraOpcaoModo) {
        primeiraOpcaoModo.classList.add('selecionado');
    }
}); 