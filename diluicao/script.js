// ============================================================
// SELECTS PERSONALIZADOS - DILUIÇÃO
// ============================================================

// Dados das unidades (UNIDADES ESPECIAIS REMOVIDAS)
const UNIDADES_MASSA = [
    { id: 'massa_1', value: 'mg', label: 'mg', grupo: 'Massa' },
    { id: 'massa_2', value: 'g', label: 'g', grupo: 'Massa' },
    { id: 'massa_3', value: 'mcg', label: 'mcg (µg)', grupo: 'Massa' },
    { id: 'massa_4', value: 'ng', label: 'ng', grupo: 'Massa' },
    { id: 'massa_5', value: 'kg', label: 'kg', grupo: 'Massa' }
];

const UNIDADES_VOLUME = [
    { id: 'vol_1', value: 'ml', label: 'mL', grupo: 'Volume' },
    { id: 'vol_2', value: 'l', label: 'L', grupo: 'Volume' },
    { id: 'vol_3', value: 'mcl', label: 'µL (microlitro)', grupo: 'Volume' }
];

const UNIDADES_DOSE = [
    { id: 'dose_1', value: 'mg', label: 'mg' },
    { id: 'dose_2', value: 'g', label: 'g' },
    { id: 'dose_3', value: 'mcg', label: 'mcg (µg)' },
    { id: 'dose_4', value: 'ng', label: 'ng' }
];

// ===== INICIALIZAR SELECTS =====
function popularSelectDiluicao(tipo) {
    const optionsId = tipo === 'massa' ? 'massaUnidadeOptions' : 
                     tipo === 'volume' ? 'volumeUnidadeOptions' : 
                     'doseUnidadeOptions';
    const displayId = tipo === 'massa' ? 'massaUnidadeSelecionada' : 
                     tipo === 'volume' ? 'volumeUnidadeSelecionada' : 
                     'doseUnidadeSelecionada';
    const hiddenId = tipo === 'massa' ? 'massa_unidade' : 
                    tipo === 'volume' ? 'vol_unidade' : 
                    'dose_unidade';
    
    const container = document.getElementById(optionsId);
    if (!container) return;

    let dados;
    let temGrupos = false;
    
    if (tipo === 'massa') {
        dados = UNIDADES_MASSA;
        temGrupos = true;
    } else if (tipo === 'volume') {
        dados = UNIDADES_VOLUME;
        temGrupos = true;
    } else {
        dados = UNIDADES_DOSE;
        temGrupos = false;
    }

    let html = '';
    let grupoAtual = '';
    
    dados.forEach(op => {
        if (temGrupos && op.grupo !== grupoAtual) {
            grupoAtual = op.grupo;
            html += `<div class="option-group-label">${grupoAtual}</div>`;
        }
        html += `
            <div class="custom-select-option-diluicao" 
                 data-id="${op.id}" 
                 data-value="${op.value}" 
                 onclick="selecionarUnidadeDiluicao('${tipo}', '${op.id}', '${op.value}', '${op.label}')">
                <span class="option-label">${op.label}</span>
            </div>
        `;
    });
    container.innerHTML = html;

    // Seleciona a primeira opção por padrão
    const primeiraOpcao = container.querySelector('.custom-select-option-diluicao');
    if (primeiraOpcao) {
        const id = primeiraOpcao.dataset.id;
        const valor = primeiraOpcao.dataset.value;
        const label = primeiraOpcao.querySelector('.option-label').textContent;
        primeiraOpcao.classList.add('selecionado');
        document.getElementById(displayId).textContent = label;
        document.getElementById(hiddenId).value = valor;
    }
}

// ===== TOGGLE DO SELECT =====
function toggleDiluicaoSelect(tipo) {
    const optionsId = tipo === 'massa' ? 'massaUnidadeOptions' : 
                     tipo === 'volume' ? 'volumeUnidadeOptions' : 
                     'doseUnidadeOptions';
    const triggerId = tipo === 'massa' ? 'selectMassa' : 
                     tipo === 'volume' ? 'selectVolume' : 
                     'selectDose';
    
    const options = document.getElementById(optionsId);
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-diluicao`);
    
    if (!options || !trigger) return;

    // Fecha os outros selects
    const outros = ['massa', 'volume', 'dose'].filter(t => t !== tipo);
    outros.forEach(outro => {
        const outroOptionsId = outro === 'massa' ? 'massaUnidadeOptions' : 
                              outro === 'volume' ? 'volumeUnidadeOptions' : 
                              'doseUnidadeOptions';
        const outroTriggerId = outro === 'massa' ? 'selectMassa' : 
                              outro === 'volume' ? 'selectVolume' : 
                              'selectDose';
        const outroOptions = document.getElementById(outroOptionsId);
        const outroTrigger = document.querySelector(`#${outroTriggerId} .custom-select-trigger-diluicao`);
        if (outroOptions) outroOptions.classList.remove('aberto');
        if (outroTrigger) outroTrigger.classList.remove('aberto');
    });

    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

// ===== SELECIONAR UNIDADE =====
function selecionarUnidadeDiluicao(tipo, id, valor, label) {
    const hiddenId = tipo === 'massa' ? 'massa_unidade' : 
                    tipo === 'volume' ? 'vol_unidade' : 
                    'dose_unidade';
    const displayId = tipo === 'massa' ? 'massaUnidadeSelecionada' : 
                     tipo === 'volume' ? 'volumeUnidadeSelecionada' : 
                     'doseUnidadeSelecionada';
    const optionsId = tipo === 'massa' ? 'massaUnidadeOptions' : 
                     tipo === 'volume' ? 'volumeUnidadeOptions' : 
                     'doseUnidadeOptions';
    const triggerId = tipo === 'massa' ? 'selectMassa' : 
                     tipo === 'volume' ? 'selectVolume' : 
                     'selectDose';

    // Atualiza o hidden input
    document.getElementById(hiddenId).value = valor;

    // Atualiza o texto exibido
    document.getElementById(displayId).textContent = label;

    // Marca a opção como selecionada
    const container = document.getElementById(optionsId);
    container.querySelectorAll('.custom-select-option-diluicao').forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.id === id) {
            opt.classList.add('selecionado');
        }
    });

    // Fecha o dropdown
    container.classList.remove('aberto');
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-diluicao`);
    if (trigger) trigger.classList.remove('aberto');

    console.log(`📊 Unidade ${tipo} selecionada: ${label} (${valor}) - ID: ${id}`);
}

// ===== FECHAR SELECTS AO CLICAR FORA =====
document.addEventListener('click', function (event) {
    const selects = ['selectMassa', 'selectVolume', 'selectDose'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select && !select.contains(event.target)) {
            const options = select.querySelector('.custom-select-options-diluicao');
            const trigger = select.querySelector('.custom-select-trigger-diluicao');
            if (options) options.classList.remove('aberto');
            if (trigger) trigger.classList.remove('aberto');
        }
    });
});

// ============================================================
// FUNÇÕES ORIGINAIS (modificadas para usar os hidden inputs)
// ============================================================

// --- TEMA ---
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

const volume = document.getElementById("vol_valor");
const massa = document.getElementById("massa_valor");

// ==========================================================================
// FUNÇÃO DE FORMATAÇÃO DE NÚMEROS
// ==========================================================================
function formatarNumero(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return num.toFixed(2);
}

// ===== FUNÇÃO PARA OBTER OS VALORES DOS HIDDEN INPUTS =====
function getUnidadeMassa() {
    return document.getElementById('massa_unidade').value;
}

function getUnidadeVolume() {
    return document.getElementById('vol_unidade').value;
}

function getUnidadeDose() {
    return document.getElementById('dose_unidade').value;
}

function getLabelUnidadeMassa() {
    return document.getElementById('massaUnidadeSelecionada').textContent;
}

function getLabelUnidadeVolume() {
    return document.getElementById('volumeUnidadeSelecionada').textContent;
}

function getLabelUnidadeDose() {
    return document.getElementById('doseUnidadeSelecionada').textContent;
}

function calcularDiluicao() {
    const res = document.getElementById("resultado");
    const m_val = parseFloat(document.getElementById("massa_valor").value);
    const m_uni = getUnidadeMassa();
    const v_val = parseFloat(document.getElementById("vol_valor").value);
    const v_uni = getUnidadeVolume();
    const dose = parseFloat(document.getElementById("dose_indicada").value);
    const dose_unidade = getUnidadeDose();

    // Reset Animação
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
    massa.style.borderBottom = "2px solid var(--primary)";
    volume.style.borderBottom = "2px solid var(--primary)";

    // Validação de erro
    if (isNaN(m_val)) {
        massa.style.borderBottom = "2px solid #f44336";
        mostrarErroDiluicao("Preencha a Massa do medicamento!");
        return;
    }
    
    if (isNaN(v_val)) {
        volume.style.borderBottom = "2px solid #f44336";
        mostrarErroDiluicao("Preencha o Volume do diluente!");
        return;
    }

    // Normalização da Massa (para mg)
    let m_mg;
    switch (m_uni) {
        case 'g': m_mg = m_val * 1000; break;
        case 'mcg': m_mg = m_val * 0.001; break;
        case 'ng': m_mg = m_val * 0.000001; break;
        case 'kg': m_mg = m_val * 1000000; break;
        default: m_mg = m_val; break;
    }

    // Normalização do Volume (para mL)
    let v_ml;
    switch (v_uni) {
        case 'l': v_ml = v_val * 1000; break;
        case 'mcl': v_ml = v_val * 0.001; break;
        default: v_ml = v_val; break;
    }

    const concentracao = m_mg / v_ml;
    
    // Unidades para exibição
    const unidadeMassa = getLabelUnidadeMassa();
    const valorMassaDisplay = m_val;
    const valorVolumeDisplay = v_val;

    let html = `
        <div class="diluicao-container">
            <div class="diluicao-card">
                <div class="card-header">
                    <div class="card-icon" style="background: #00843d20; color: #00843d;">
                        <i class="ri-flask-line"></i>
                    </div>
                    <div class="card-status" style="color: #00843d;">
                        <i class="ri-information-line"></i>
                        <span>Solução Preparada</span>
                    </div>
                </div>
                
                <div class="diluicao-concentracao">
                    <div class="concentracao-valor">
                        ${formatarNumero(concentracao)} <span class="concentracao-unidade">mg/mL</span>
                    </div>
                    <div class="concentracao-descricao">Concentração final</div>
                </div>
    `;

    // Se houver dose indicada
    if (!isNaN(dose) && dose !== "" && dose > 0) {
        // Converter a dose para mg (se necessário)
        let dose_convertida;
        switch (dose_unidade) {
            case 'g': dose_convertida = dose * 1000; break;
            case 'mcg': dose_convertida = dose * 0.001; break;
            case 'ng': dose_convertida = dose * 0.000001; break;
            default: dose_convertida = dose; break;
        }
        
        const volume_final = dose_convertida / concentracao;
        const labelDose = getLabelUnidadeDose();
        
        html += `
                <div class="diluicao-destaque">
                    <i class="ri-syringe-line"></i>
                    <div>
                        <span class="destaque-label">Administrar</span>
                        <span class="destaque-valor">${formatarNumero(volume_final)} mL</span>
                        <span class="destaque-detalhe">(para ${formatarNumero(dose)} ${labelDose} da substância)</span>
                    </div>
                </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    res.innerHTML = html;
    res.style.color = "var(--text)";
    res.style.display = "block";
    res.style.boxShadow = "none";
    res.style.padding = "0";
    res.style.width = "100%";
}

function mostrarErroDiluicao(mensagem) {
    const res = document.getElementById("resultado");
    res.innerHTML = `
        <div class="diluicao-erro">
            <i class="ri-error-warning-line"></i>
            <span>${mensagem}</span>
        </div>
    `;
    res.style.background = "none";
    res.style.display = "block";
    res.style.padding = "0";
    res.style.width = "90%";
}

function limparDiluicao() {
    ["massa_valor", "vol_valor", "dose_indicada"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("resultado").style.display = "none";
    volume.style.borderBottom = "2px solid var(--primary)";
    massa.style.borderBottom = "2px solid var(--primary)";
}

function retirar_bordas(){
    const camposObrigatorios = [massa, volume];
    camposObrigatorios.forEach(campo => {
        campo.addEventListener("input", function(){
            if (this.value.trim() !== ""){
                this.style.borderBottom = "solid 2px var(--primary)";
            }
        })
    });
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

massa.addEventListener("input", retirar_bordas);
volume.addEventListener("input", retirar_bordas);

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('load', () => {
    if (localStorage.getItem('tema') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
    
    // Inicializa os selects personalizados
    popularSelectDiluicao('massa');
    popularSelectDiluicao('volume');
    popularSelectDiluicao('dose');
});