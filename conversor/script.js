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
const UNIDADES_CONCENTRACAO = [
    { id: 'conc_1', value: '1', label: 'mg/ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_2', value: '1000', label: 'g/ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_3', value: '0.001', label: 'mcg/ml', grupo: '🧪 Concentração (massa/volume)' },

    
    { id: 'conc_33', value: '5', label: 'mg/5ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_44', value: '10', label: 'mg/10ml', grupo: '🧪 Concentração (massa/volume)' },

    { id: 'conc_55', value: '500', label: 'g/5ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_66', value: '1000', label: 'g/10ml', grupo: '🧪 Concentração (massa/volume)' },

    { id: 'conc_4', value: '0.000001', label: 'ng/ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_5', value: '0.001', label: 'mg/L', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_6', value: '1', label: 'g/L', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_7', value: '0.01', label: 'mg/100ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'conc_8', value: '10', label: '% (1% = 10mg/ml)', grupo: '📊 Percentual' },
    { id: 'conc_9', value: '1', label: '% (peso/volume)', grupo: '📊 Percentual' },
    
];

// ============================================================
// INICIALIZAR SELECTS PERSONALIZADOS
// ============================================================
function popularSelectConcentracao(tipo) {
    const optionsId = tipo === 'indicado' ? 'unidadeIndicadoOptions' : 'unidadeDisponivelOptions';
    const displayId = tipo === 'indicado' ? 'unidadeIndicadoSelecionada' : 'unidadeDisponivelSelecionada';
    const hiddenId = tipo === 'indicado' ? 'unidade_do_indicado' : 'unidade_do_disponivel';
    
    const container = document.getElementById(optionsId);
    if (!container) return;

    let html = '';
    let grupoAtual = '';
    
    UNIDADES_CONCENTRACAO.forEach(op => {
        if (op.grupo !== grupoAtual) {
            grupoAtual = op.grupo;
            html += `<div class="option-group-label">${grupoAtual}</div>`;
        }
        html += `
            <div class="custom-select-option-unidade" 
                 data-id="${op.id}" 
                 data-value="${op.value}" 
                 onclick="selecionarUnidadeConversor('${tipo}', '${op.id}', '${op.value}', '${op.label}')">
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
    const optionsId = tipo === 'indicado' ? 'unidadeIndicadoOptions' : 'unidadeDisponivelOptions';
    const triggerId = tipo === 'indicado' ? 'selectIndicado' : 'selectDisponivel';
    
    const options = document.getElementById(optionsId);
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-unidade`);
    
    if (!options || !trigger) return;

    // Fecha o outro select se estiver aberto
    const outroOptionsId = tipo === 'indicado' ? 'unidadeDisponivelOptions' : 'unidadeIndicadoOptions';
    const outroTriggerId = tipo === 'indicado' ? 'selectDisponivel' : 'selectIndicado';
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
// SELECIONAR UNIDADE (Conversor)
// ============================================================
function selecionarUnidadeConversor(tipo, id, valor, label) {
    const hiddenId = tipo === 'indicado' ? 'unidade_do_indicado' : 'unidade_do_disponivel';
    const displayId = tipo === 'indicado' ? 'unidadeIndicadoSelecionada' : 'unidadeDisponivelSelecionada';
    const optionsId = tipo === 'indicado' ? 'unidadeIndicadoOptions' : 'unidadeDisponivelOptions';
    const triggerId = tipo === 'indicado' ? 'selectIndicado' : 'selectDisponivel';

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
    const selects = ['selectIndicado', 'selectDisponivel'];
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

const indicado_valor = document.getElementById("indicado");
const ml_valor = document.getElementById("ml");
const disponivel_valor = document.getElementById("disponivel");
const resultado = document.getElementById("resultado");

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

function validarCampos() {
    const campos = [indicado_valor, ml_valor, disponivel_valor]; 
    let todosPreenchidos = true;

    campos.forEach(campo => {
        if (campo.value.trim() === "") {
            campo.style.border = "solid 1px red";
            campo.style.borderRight = "none";
            campo.style.borderLeft = "none";
            todosPreenchidos = false;
            resultado.style.textAlign = "center"; 
            resultado.style.background = "red"; 
        } else {
            campo.style.border = ""; 
        }
    });

    return todosPreenchidos;
}

function retirar_bordas(){
    const camposObrigatorios = [indicado_valor, ml_valor, disponivel_valor];
    camposObrigatorios.forEach(campo => {
        campo.addEventListener("input", function(){
            if (this.value.trim() !== ""){
                this.style.border = "";
            }
        })
    });
};

function calcular() {
    const resultado = document.getElementById("resultado");
    resultado.classList.remove("vibrar");
    void resultado.offsetWidth;
    resultado.classList.add("vibrar");

    if (!validarCampos()) {
        mostrarErroConversor("Preencha todos os campos!");
        return;
    }

    // 🔥 Usa os valores dos hidden inputs
    const unidadeDisponivel = parseFloat(document.getElementById("unidade_do_disponivel").value);
    const unidadeIndicado = parseFloat(document.getElementById("unidade_do_indicado").value);

    const indicadoMg = parseFloat(indicado_valor.value) * unidadeIndicado;
    const disponivelMg = parseFloat(disponivel_valor.value) * unidadeDisponivel;
    const volumeMl = parseFloat(ml_valor.value);

    const volumeNecessario = volumeMl * (indicadoMg / disponivelMg);

    // 🔥 Obtém o texto da unidade selecionada
    const textoDisponivel = document.getElementById('unidadeDisponivelSelecionada').textContent;
    const concentracaoDisplay = `${disponivel_valor.value} ${textoDisponivel}`;

    let html = `
        <div class="conversor-container">
            <div class="conversor-card">
                <div class="card-header">
                    <div class="card-icon">
                        <i class="ri-syringe-line"></i>
                    </div>
                    <div class="card-status">
                        <i class="ri-flask-line"></i>
                        <span>Convertido</span>
                    </div>
                </div>
                
                <div class="conversor-mensagem">
                    Pode usar <span class="conversor-destaque">${formatarNumero(volumeNecessario)} mL</span>
                </div>
                
                <div class="conversor-origem">
                    do frasco de <strong>${concentracaoDisplay}</strong>
                </div>
                
            </div>
        </div>
    `;

    resultado.innerHTML = html;
    resultado.style.background = "none";
    resultado.style.color = "var(--text)";
    resultado.style.display = "block";
    resultado.style.boxShadow = "none";
    resultado.style.padding = "0";
    resultado.style.width = "100%";
    resultado.style.textAlign = "left";
}

function mostrarErroConversor(mensagem) {
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `
        <div class="conversor-erro">
            <i class="ri-error-warning-line"></i>
            <span>${mensagem}</span>
        </div>
    `;
    resultado.style.background = "none";
    resultado.style.display = "block";
    resultado.style.padding = "0";
    resultado.style.width = "90%";
}

indicado_valor.addEventListener("input", retirar_bordas);
ml_valor.addEventListener("input", retirar_bordas);
disponivel_valor.addEventListener("input", retirar_bordas);

function limpar(){
    const campos = [indicado_valor, ml_valor, disponivel_valor];
    campos.forEach(campo => {
        campo.style.border = "";
    });
    
    indicado_valor.value = "";
    ml_valor.value = "";
    disponivel_valor.value = "";

    resultado.textContent = "";
    resultado.style.background = "var(--primary)";
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
    popularSelectConcentracao('indicado');
    popularSelectConcentracao('disponivel');
});