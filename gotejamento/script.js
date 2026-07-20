// Lógica do Tema Escuro com Memória
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
// DADOS DAS UNIDADES (para popular os selects personalizados)
// ============================================================
const UNIDADES_VOLUME = [
    { id: 'vol_1', value: '1', label: 'ml' },
    { id: 'vol_2', value: '1000', label: 'L' }
];

const UNIDADES_TEMPO = [
    { id: 'temp_1', value: '1', label: 'h' },
    { id: 'temp_2', value: '60', label: 'min' }
];

// ============================================================
// INICIALIZAR SELECTS PERSONALIZADOS
// ============================================================
function popularSelectUnidade(tipo) {
    const optionsId = tipo === 'volume' ? 'unidadeVolumeOptions' : 'unidadeTempoOptions';
    const displayId = tipo === 'volume' ? 'unidadeVolumeSelecionada' : 'unidadeTempoSelecionada';
    const hiddenId = tipo === 'volume' ? 'unidade_de_volume' : 'unidade_de_tempo';
    
    const container = document.getElementById(optionsId);
    if (!container) return;

    const dados = tipo === 'volume' ? UNIDADES_VOLUME : UNIDADES_TEMPO;

    let html = '';
    dados.forEach(op => {
        html += `
            <div class="custom-select-option-unidade" 
                 data-id="${op.id}" 
                 data-value="${op.value}" 
                 onclick="selecionarUnidadeGotejamento('${tipo}', '${op.id}', '${op.value}', '${op.label}')">
                <span class="option-label">${op.label}</span>
            </div>
        `;
    });
    container.innerHTML = html;

    // Seleciona a primeira opção por padrão
    const primeiraOpcao = container.querySelector('.custom-select-option-unidade');
    if (primeiraOpcao) {
        const id = primeiraOpcao.dataset.id;
        const valor = primeiraOpcao.dataset.value;
        const label = primeiraOpcao.querySelector('.option-label').textContent;
        primeiraOpcao.classList.add('selecionado');
        document.getElementById(displayId).textContent = label;
        document.getElementById(hiddenId).value = valor;
    }
}

// ============================================================
// TOGGLE DO SELECT
// ============================================================
function toggleUnidadeSelect(tipo) {
    const optionsId = tipo === 'volume' ? 'unidadeVolumeOptions' : 'unidadeTempoOptions';
    const triggerId = tipo === 'volume' ? 'selectVolume' : 'selectTempo';
    
    const options = document.getElementById(optionsId);
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-unidade`);
    
    if (!options || !trigger) return;

    // Fecha o outro select se estiver aberto
    const outroOptionsId = tipo === 'volume' ? 'unidadeTempoOptions' : 'unidadeVolumeOptions';
    const outroTriggerId = tipo === 'volume' ? 'selectTempo' : 'selectVolume';
    const outroOptions = document.getElementById(outroOptionsId);
    const outroTrigger = document.querySelector(`#${outroTriggerId} .custom-select-trigger-unidade`);
    
    if (outroOptions && outroOptions.classList.contains('aberto')) {
        outroOptions.classList.remove('aberto');
        if (outroTrigger) outroTrigger.classList.remove('aberto');
    }

    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

// ============================================================
// SELECIONAR UNIDADE (Gotejamento)
// ============================================================
function selecionarUnidadeGotejamento(tipo, id, valor, label) {
    const hiddenId = tipo === 'volume' ? 'unidade_de_volume' : 'unidade_de_tempo';
    const displayId = tipo === 'volume' ? 'unidadeVolumeSelecionada' : 'unidadeTempoSelecionada';
    const optionsId = tipo === 'volume' ? 'unidadeVolumeOptions' : 'unidadeTempoOptions';
    const triggerId = tipo === 'volume' ? 'selectVolume' : 'selectTempo';

    // Atualiza o hidden input
    document.getElementById(hiddenId).value = valor;

    // Atualiza o texto exibido
    document.getElementById(displayId).textContent = label;

    // Marca APENAS a opção com o ID específico como selecionada
    const container = document.getElementById(optionsId);
    container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.id === id) {
            opt.classList.add('selecionado');
        }
    });

    // Fecha o dropdown
    container.classList.remove('aberto');
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-unidade`);
    if (trigger) trigger.classList.remove('aberto');

    console.log(`📊 Unidade ${tipo} selecionada: ${label} (${valor}) - ID: ${id}`);
}

// ============================================================
// FECHAR SELECTS AO CLICAR FORA
// ============================================================
document.addEventListener('click', function (event) {
    const selects = ['selectVolume', 'selectTempo'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select && !select.contains(event.target)) {
            const options = select.querySelector('.custom-select-options-unidade');
            const trigger = select.querySelector('.custom-select-trigger-unidade');
            if (options) options.classList.remove('aberto');
            if (trigger) trigger.classList.remove('aberto');
        }
    });
});

// ============================================================
// FUNÇÕES ORIGINAIS (mantidas intactas)
// ============================================================

const valor_volume = document.getElementById("volume");
const valor_tempo = document.getElementById("tempo");
const valor_macrogotas = document.getElementById("macrogotas");
const valor_microgotas = document.getElementById("microgotas");
const resultado = document.getElementById("resultado");

// 🔥 Usa os valores dos hidden inputs em vez dos selects nativos
function getUnidadeVolume() {
    return parseFloat(document.getElementById("unidade_de_volume").value);
}

function getUnidadeTempo() {
    return parseFloat(document.getElementById("unidade_de_tempo").value);
}

function getTextoUnidadeVolume() {
    return document.getElementById("unidadeVolumeSelecionada").textContent;
}

function getTextoUnidadeTempo() {
    return document.getElementById("unidadeTempoSelecionada").textContent;
}

function calcular() {
    resultado.classList.remove("vibrar");
    void resultado.offsetWidth;
    resultado.classList.add("vibrar");

    // 1. Captura de valores brutos
    const unidadeVolume = getUnidadeVolume();
    const unidadeTempo = getUnidadeTempo();
    
    const v = parseFloat(valor_volume.value) * unidadeVolume;
    const t = parseFloat(valor_tempo.value) / unidadeTempo;
    const macIn = parseFloat(valor_macrogotas.value);
    const micIn = parseFloat(valor_microgotas.value);

    // 2. Identificação de Grupos Preenchidos
    const temCampo1 = (!isNaN(v) && !isNaN(t));
    const temVolume = !isNaN(v);
    const temTempo = !isNaN(t);
    const temMac = !isNaN(macIn);
    const temMic = !isNaN(micIn);
    const temCampo2 = (temMac || temMic);

    let totalPreenchidos = [temVolume, temTempo, temMac, temMic].filter(Boolean).length;
    if (totalPreenchidos < 2) {
        resultado.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; background: #f44336; color: white; padding: 16px; border-radius: 20px;">
                <i class="ri-error-warning-line" style="font-size: 2rem;"></i>
                <span>Preencha pelo menos 2 campos.</span>
            </div>
        `;
        resultado.style.background = "transparent";
        return;
    }

    if (temCampo2 && !temVolume && !temTempo) {
        resultado.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; background: #f44336; color: white; padding: 16px; border-radius: 20px;">
                <i class="ri-error-warning-line" style="font-size: 2rem;"></i>
                <span>Insira também Volume ou Tempo.</span>
            </div>
        `;
        resultado.style.background = "transparent";
        return;
    }

    let mac = temMac ? Math.round(macIn) : NaN;
    let mic = temMic ? Math.round(micIn) : NaN;

    if (temMac && temMic) {
        if (mic !== Math.round(mac * 3)) {
            resultado.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; background: #f44336; color: white; padding: 16px; border-radius: 20px;">
                    <i class="ri-error-warning-line" style="font-size: 2rem;"></i>
                    <span>Micro e Macrogotas não coincidem! Elimine-as.</span>
                </div>
            `;
            resultado.style.background = "transparent";
            return;
        }
    }

    let gotasBase = !isNaN(mac) ? mac : (mic / 3);

    if (temCampo1 && temCampo2) {
        let gEsperada = Math.round(v / (t * 3));
        let gInserida = Math.round(gotasBase);

        if (gInserida !== gEsperada) {
            resultado.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; background: #f44336; color: white; padding: 16px; border-radius: 20px;">
                    <i class="ri-error-warning-line" style="font-size: 2rem;"></i>
                    <span>As gotas não correspondem ao Volume e Tempo. Elimine-as.</span>
                </div>
            `;
            resultado.style.background = "transparent";
            return;
        }
    } else if (temCampo1) {
        gotasBase = v / (t * 3);
    } else if (temVolume && temCampo2) {
        let t_calc = v / (gotasBase * 3);
        valor_tempo.value = t_calc.toFixed(1);
    } else if (temTempo && temCampo2) {
        let v_calc = gotasBase * t * 3;
        valor_volume.value = v_calc.toFixed(1);
    }

    const macFinal = Math.round(gotasBase);
    const micFinal = macFinal * 3;
    
    valor_macrogotas.value = macFinal;
    valor_microgotas.value = micFinal;
    
    const ml = valor_volume.value;
    const horas = valor_tempo.value;
    const vExibido = getTextoUnidadeVolume();
    const tExibido = getTextoUnidadeTempo();

    let html = `
        <div class="gotejamento-container">
            <div class="gotejamento-dupla">
                <div class="gotejamento-card">
                    <div class="gotejamento-card-icon">
                        <i class="ri-flask-line"></i>
                    </div>
                    <div class="gotejamento-card-content">
                        <span class="gotejamento-card-label">Volume</span>
                        <span class="gotejamento-card-valor">${ml} <span class="gotejamento-card-unidade">${vExibido}</span></span>
                    </div>
                </div>
                
                <div class="gotejamento-card">
                    <div class="gotejamento-card-icon">
                        <i class="ri-time-line"></i>
                    </div>
                    <div class="gotejamento-card-content">
                        <span class="gotejamento-card-label">Tempo</span>
                        <span class="gotejamento-card-valor">${horas} <span class="gotejamento-card-unidade">${tExibido}</span></span>
                    </div>
                </div>
            </div>
            
            <div class="gotejamento-card-misto">
                <div class="gotejamento-item">
                    <div class="gotejamento-item-icon">
                        <i class="ri-drop-line"></i>
                    </div>
                    <div class="gotejamento-item-content">
                        <span class="gotejamento-item-label">Macrogotas</span>
                        <span class="gotejamento-item-valor">${macFinal} <span class="gotejamento-item-unidade">gts/min</span></span>
                    </div>
                </div>
                
                <div class="gotejamento-divider"></div>
                
                <div class="gotejamento-item">
                    <div class="gotejamento-item-icon">
                        <i class="ri-drizzle-line"></i>
                    </div>
                    <div class="gotejamento-item-content">
                        <span class="gotejamento-item-label">Microgotas</span>
                        <span class="gotejamento-item-valor">${micFinal} <span class="gotejamento-item-unidade">gts/min</span></span>
                    </div>
                </div>
            </div>
        </div>
    `;

    resultado.innerHTML = html;
    resultado.style.boxShadow = "none";
    resultado.style.border = "none";
}

function limpar(){
    valor_volume.value = "";
    valor_tempo.value = "";
    valor_macrogotas.value = "";
    valor_microgotas.value = "";
    resultado.innerHTML = "";
    resultado.classList.remove("vibrar");
    void resultado.offsetWidth; 
    resultado.classList.add("vibrar");
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

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
    
    // Inicializa os selects personalizados
    popularSelectUnidade('volume');
    popularSelectUnidade('tempo');
});