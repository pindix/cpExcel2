const valorErro = document.getElementById("valor_entrada");

// ==========================================================================
// FUNÇÃO DE FORMATAÇÃO DE NÚMEROS (remove .0 desnecessário)
// ==========================================================================
function formatarNumero(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return num.toFixed(2);
}

// ============================================================
// SELECT PERSONALIZADO - ANTROPOMETRIA
// ============================================================

// ===== TOGGLE DO SELECT =====
function toggleModoSelect() {
    const options = document.getElementById('modoOptions');
    const trigger = document.querySelector('#selectModo .custom-select-trigger-antropometria');
    
    if (!options || !trigger) return;

    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

// ===== SELECIONAR MODO =====
function selecionarModo(valor, label) {
    // Atualiza o hidden input
    document.getElementById('modo_calculo').value = valor;

    // Atualiza o texto exibido
    document.getElementById('modoSelecionado').textContent = label;

    // Marca a opção como selecionada
    const container = document.getElementById('modoOptions');
    container.querySelectorAll('.custom-select-option-antropometria').forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.value === valor) {
            opt.classList.add('selecionado');
        }
    });

    // Fecha o dropdown
    container.classList.remove('aberto');
    const trigger = document.querySelector('#selectModo .custom-select-trigger-antropometria');
    if (trigger) trigger.classList.remove('aberto');

    // Chama a função de ajuste de interface
    ajustarInterface();

    console.log(`📊 Modo selecionado: ${label} (${valor})`);
}

// ===== FECHAR SELECT AO CLICAR FORA =====
document.addEventListener('click', function (event) {
    const select = document.getElementById('selectModo');
    if (select && !select.contains(event.target)) {
        const options = document.getElementById('modoOptions');
        const trigger = document.querySelector('#selectModo .custom-select-trigger-antropometria');
        if (options) options.classList.remove('aberto');
        if (trigger) trigger.classList.remove('aberto');
    }
});

// ============================================================
// FUNÇÕES ORIGINAIS (modificadas para usar o hidden input)
// ============================================================

function ajustarInterface() {
    // 🔥 Usa o hidden input em vez do select nativo
    const modo = document.getElementById('modo_calculo').value;
    const label = document.getElementById("label_dinamica");
    const unidade = document.getElementById("unidade_dinamica");
    const icone = document.getElementById("icone_input");
    const input = document.getElementById("valor_entrada");

    input.value = ""; // Limpa ao trocar

    if (modo === "pesoParaIdade") {
        label.innerText = "Peso Atual (kg)";
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

function calcularAntropometria() {
    // 🔥 Usa o hidden input em vez do select nativo
    const modo = document.getElementById('modo_calculo').value;
    const valor = parseFloat(document.getElementById("valor_entrada").value);
    const valorErro = document.getElementById("valor_entrada");
    const res = document.getElementById("resultado");

    if (isNaN(valor) || valor <= 0) {
        res.innerHTML = '<i class="ri-error-warning-fill res-icon"></i> Insira um valor válido.';
        res.style.background = "#f44336"; 
        res.style.display = "block";
        valorErro.style.borderBottom = "solid 2px red";
        return;
    }

    // --- BLOQUEIO DE SEGURANÇA ---
    if (modo === "pesoParaIdade" && valor > 50) {
        res.innerHTML = `
            <i class="ri-error-warning-fill res-icon"></i>
            <span class="res-titulo">Limite Excedido</span>
            <span class="res-sub">O peso inserido (>50kg) sugere um paciente adulto. Estas fórmulas são exclusivas para pediatria.</span>
        `;
        res.style.background = "#f44336"; 
        res.style.display = "block";
        valorErro.style.borderBottom = "solid 2px var(--primary)";
        return;
    }

    if (modo === "idadeParaPeso" && valor > 14) {
        res.innerHTML = `
            <i class="ri-error-warning-fill res-icon"></i>
            <span class="res-titulo">Limite Excedido</span>
            <span class="res-sub">A idade inserida (>14 anos) não deve ser calculada por fórmulas de estimativa pediátrica.</span>
        `;
        res.style.background = "#f44336"; 
        res.style.display = "block";
        valorErro.style.borderBottom = "solid 2px var(--primary)";
        return;
    }
    // ----------------------------

    let titulo = "";
    let subtitulo = "";

    if (modo === "pesoParaIdade") {
        if (valor < 10) {
            let meses = (valor * 2) - 9;
            titulo = `~ ${formatarNumero(Math.max(0, meses))} Meses`;
        } else if (valor <= 20) {
            titulo = `~ ${((valor - 8) / 2)} Anos`;
        } else {
            titulo = `~ ${formatarNumero(((valor - 3) / 3))} Anos`;
        }
        subtitulo = `Estimativa de idade para ${valor} kg`;
    } else {
        let pesoEstimado = 0;
        if (valor < 1) {
            pesoEstimado = (valor * 10 + 9) / 2;
        } else if (valor <= 6) {
            pesoEstimado = (valor * 2) + 8;
        } else {
            pesoEstimado = (valor * 3) + 3;
        }
        titulo = `~ ${formatarNumero(pesoEstimado)} kg`;
        subtitulo = `Peso provável para ${valor} anos`;
    }

    res.innerHTML = `
        <i class="ri-checkbox-circle-fill res-icon"></i>
        <span class="res-titulo">${titulo}</span>
        <span class="res-sub">${subtitulo}</span>
    `;

    res.style.background = "var(--primary)";
    valorErro.style.borderBottom = "solid 2px var(--primary)";
    res.style.display = "block";
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
}

function limparAntropometria() {
    document.getElementById("valor_entrada").value = "";
    document.getElementById("resultado").style.display = "none";
    valorErro.style.borderBottom = "solid 2px var(--primary)";
}

// ========================================================================
// MENU LATERAL
// ========================================================================
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

// ========================================================================
// MODAL DE MODO TESTE
// ========================================================================
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

// Tema Escuro (Padrão Mpindi)
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

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
    
    // Inicializa a interface com o modo padrão
    ajustarInterface();
    
    // Marca a primeira opção como selecionada
    const primeiraOpcao = document.querySelector('#modoOptions .custom-select-option-antropometria');
    if (primeiraOpcao) {
        primeiraOpcao.classList.add('selecionado');
    }
});