// ============================================================
// SELECTS PERSONALIZADOS - SISTEMA ABO
// ============================================================

const TIPOS_SANGUE = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
];

const TIPOS_SANGUE_HERANCA = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' }
];

// ===== INICIALIZAR SELECTS =====
function popularSelectSangue(tipo) {
    const optionsId = tipo === 'paciente' ? 'pacienteOptions' :
                     tipo === 'doador' ? 'doadorOptions' :
                     tipo === 'pai' ? 'paiOptions' : 'maeOptions';
    const displayId = tipo === 'paciente' ? 'pacienteSelecionado' :
                     tipo === 'doador' ? 'doadorSelecionado' :
                     tipo === 'pai' ? 'paiSelecionado' : 'maeSelecionado';
    const hiddenId = tipo === 'paciente' ? 'tipo_paciente' :
                    tipo === 'doador' ? 'tipo_doador' :
                    tipo === 'pai' ? 'sangue_pai' : 'sangue_mae';
    
    const container = document.getElementById(optionsId);
    if (!container) return;

    const dados = (tipo === 'pai' || tipo === 'mae') ? TIPOS_SANGUE_HERANCA : TIPOS_SANGUE;
    const placeholder = tipo === 'paciente' ? 'Paciente...' :
                       tipo === 'doador' ? 'Doador...' :
                       tipo === 'pai' ? 'Pai...' : 'Mãe...';

    let html = '';
    dados.forEach(op => {
        html += `
            <div class="custom-select-option-sangue" 
                 data-value="${op.value}" 
                 onclick="selecionarSangue('${tipo}', '${op.value}', '${op.label}')">
                <span class="option-label">${op.label}</span>
            </div>
        `;
    });
    container.innerHTML = html;

    // Define o placeholder
    document.getElementById(displayId).textContent = placeholder;
    document.getElementById(displayId).classList.remove('selecionado');
}

// ===== TOGGLE DO SELECT =====
function toggleSangueSelect(tipo) {
    const optionsId = tipo === 'paciente' ? 'pacienteOptions' :
                     tipo === 'doador' ? 'doadorOptions' :
                     tipo === 'pai' ? 'paiOptions' : 'maeOptions';
    const triggerId = tipo === 'paciente' ? 'selectPaciente' :
                     tipo === 'doador' ? 'selectDoador' :
                     tipo === 'pai' ? 'selectPai' : 'selectMae';
    
    const options = document.getElementById(optionsId);
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-sangue`);
    
    if (!options || !trigger) return;

    // Fecha os outros selects
    const outros = ['paciente', 'doador', 'pai', 'mae'].filter(t => t !== tipo);
    outros.forEach(outro => {
        const outroOptionsId = outro === 'paciente' ? 'pacienteOptions' :
                              outro === 'doador' ? 'doadorOptions' :
                              outro === 'pai' ? 'paiOptions' : 'maeOptions';
        const outroTriggerId = outro === 'paciente' ? 'selectPaciente' :
                              outro === 'doador' ? 'selectDoador' :
                              outro === 'pai' ? 'selectPai' : 'selectMae';
        const outroOptions = document.getElementById(outroOptionsId);
        const outroTrigger = document.querySelector(`#${outroTriggerId} .custom-select-trigger-sangue`);
        if (outroOptions) outroOptions.classList.remove('aberto');
        if (outroTrigger) outroTrigger.classList.remove('aberto');
    });

    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

// ===== SELECIONAR OPÇÃO =====
function selecionarSangue(tipo, valor, label) {
    const hiddenId = tipo === 'paciente' ? 'tipo_paciente' :
                    tipo === 'doador' ? 'tipo_doador' :
                    tipo === 'pai' ? 'sangue_pai' : 'sangue_mae';
    const displayId = tipo === 'paciente' ? 'pacienteSelecionado' :
                     tipo === 'doador' ? 'doadorSelecionado' :
                     tipo === 'pai' ? 'paiSelecionado' : 'maeSelecionado';
    const optionsId = tipo === 'paciente' ? 'pacienteOptions' :
                     tipo === 'doador' ? 'doadorOptions' :
                     tipo === 'pai' ? 'paiOptions' : 'maeOptions';
    const triggerId = tipo === 'paciente' ? 'selectPaciente' :
                     tipo === 'doador' ? 'selectDoador' :
                     tipo === 'pai' ? 'selectPai' : 'selectMae';

    // Atualiza o hidden input
    document.getElementById(hiddenId).value = valor;

    // Atualiza o texto exibido
    const display = document.getElementById(displayId);
    display.textContent = label;
    display.classList.add('selecionado');

    // Marca a opção como selecionada
    const container = document.getElementById(optionsId);
    container.querySelectorAll('.custom-select-option-sangue').forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.value === valor) {
            opt.classList.add('selecionado');
        }
    });

    // Fecha o dropdown
    container.classList.remove('aberto');
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-sangue`);
    if (trigger) trigger.classList.remove('aberto');

    console.log(`📊 ${tipo} selecionado: ${label} (${valor})`);
}

// ===== FECHAR SELECTS AO CLICAR FORA =====
document.addEventListener('click', function (event) {
    const selects = ['selectPaciente', 'selectDoador', 'selectPai', 'selectMae'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select && !select.contains(event.target)) {
            const options = select.querySelector('.custom-select-options-sangue');
            const trigger = select.querySelector('.custom-select-trigger-sangue');
            if (options) options.classList.remove('aberto');
            if (trigger) trigger.classList.remove('aberto');
        }
    });
});

// ============================================================
// FUNÇÃO ANALISAR - VERSÃO CORRIGIDA
// ============================================================

function analisarSangue() {
    const paciente = document.getElementById("tipo_paciente").value;
    const doador = document.getElementById("tipo_doador").value;
    const pai = document.getElementById("sangue_pai").value;
    const mae = document.getElementById("sangue_mae").value;
    const res = document.getElementById("resultado");

    if (!paciente && !doador && !pai && !mae) {
        res.innerHTML = `
            <div class="sangue-container">
                <div class="sangue-card" style="background: #f44336; color: white; border: none;">
                    <div class="card-header">
                        <div class="card-icon" style="background: rgba(255,255,255,0.2); color: white;">
                            <i class="ri-error-warning-line"></i>
                        </div>
                        <div class="card-status" style="background: rgba(255,255,255,0.2); color: white;">
                            <i class="ri-information-line"></i>
                            <span>Atenção</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; justify-content: center; padding: 10px 0;">
                        <span>Selecione os dados para análise.</span>
                    </div>
                </div>
            </div>
        `;
        res.style.display = "block";
        return;
    }

    let html = `<div class="sangue-container"><div class="sangue-card">`;
    let corStatus = "#00843d";
    let iconeCard = "ri-blood-line";
    let tituloStatus = "Análise Sanguínea";

    // 1. COMPATIBILIDADE
    if (paciente && doador) {
        const tabela = {
            "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"],
            "B+": ["B+", "B-", "O+", "O-"], "B-": ["B-", "O-"],
            "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            "AB-": ["A-", "B-", "AB-", "O-"], "O+": ["O+", "O-"], "O-": ["O-"]
        };
        
        const eCompativel = tabela[paciente].includes(doador);
        const iconeCompativel = eCompativel ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill';
        const corCompativel = eCompativel ? '#22c55e' : '#ef4444';
        const textoCompativel = eCompativel ? 'COMPATÍVEL' : 'INCOMPATÍVEL';
        
        if (!eCompativel) corStatus = "#ef4444";
        
        html += `
            <div class="card-header">
                <div class="card-icon">
                    <i class="ri-knife-blood-line"></i>
                </div>
                <div class="card-status" style="color: ${corCompativel}">
                    <i class="${iconeCompativel}"></i>
                    <span>${textoCompativel}</span>
                </div>
            </div>
            
            <div class="sangue-icone-central">
                <i class="${iconeCompativel}" style="color: ${corCompativel};"></i>
            </div>
            
            <div class="sangue-status">
                <span class="status-texto ${eCompativel ? 'compativel' : 'incompativel'}">${textoCompativel}</span>
            </div>
            
            <div class="sangue-info">
                <div class="sangue-info-item">
                    <i class="ri-hand-heart-line"></i>
                    <span>Doador: <span class="sangue-tipo doador-tipo">${doador}</span></span>
                </div>
                <div class="sangue-info-divider"></div>
                <div class="sangue-info-item">
                    <i class="ri-arrow-right-line" style="color: var(--text); opacity: 0.4;"></i>
                </div>
                <div class="sangue-info-divider"></div>
                <div class="sangue-info-item">
                    <i class="ri-user-received-line"></i>
                    <span>Paciente: <span class="sangue-tipo paciente-tipo">${paciente}</span></span>
                </div>
            </div>
        `;
    }

    // Separador se houver ambas as análises
    if ((paciente && doador) && (pai && mae)) {
        html += `<hr class="sangue-divisor">`;
    }

    // 2. HERANÇA - CORRIGIDO (TODAS AS CHAVES ADICIONADAS)
    if (pai && mae) {
        const genetica = {
            "AA": ["A", "O"],
            "AB": ["A", "B", "AB", "O"],
            "AAB": ["A", "B", "AB"],
            "ABB": ["A", "B", "AB"],  // 🔥 CHAVE ADICIONADA
            "AO": ["A", "O"],
            "BB": ["B", "O"],
            "BAB": ["A", "B", "AB"],
            "BO": ["B", "O"],
            "ABAB": ["A", "B", "AB"],
            "ABO": ["A", "B"],
            "OO": ["O"]
        };
        
        // Ordena e junta para formar a chave
        let combinacao = [pai, mae].sort().join("");
        let possiveis = genetica[combinacao] || ["Análise especial necessária"];
        
        html += `
            <div class="sangue-heranca">
                <div class="heranca-titulo">
                    <i class="ri-dna-line"></i>
                    <span>Possíveis grupos dos filhos</span>
                </div>
                <div class="heranca-grupos">
                    ${possiveis.map(g => `<span class="grupo-sangue-badge">${g}</span>`).join('')}
                </div>
            </div>
        `;
    }

    html += `</div></div>`;

    res.innerHTML = html;
    res.style.background = "none";
    res.style.display = "block";
    
    // Animação
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
}

function limparSangue() {
    // Limpa hidden inputs
    ["tipo_paciente", "tipo_doador", "sangue_pai", "sangue_mae"].forEach(id => {
        document.getElementById(id).value = "";
    });
    
    // Reseta os textos dos selects
    const selects = [
        { id: 'pacienteSelecionado', placeholder: 'Selecione...' },
        { id: 'doadorSelecionado', placeholder: 'Selecione...' },
        { id: 'paiSelecionado', placeholder: 'Selecione...' },
        { id: 'maeSelecionado', placeholder: 'Selecione...' }
    ];
    
    selects.forEach(({ id, placeholder }) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = placeholder;
            el.classList.remove('selecionado');
        }
    });
    
    // Remove seleção das opções
    ['pacienteOptions', 'doadorOptions', 'paiOptions', 'maeOptions'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.querySelectorAll('.custom-select-option-sangue').forEach(opt => {
                opt.classList.remove('selecionado');
            });
        }
    });
    
    document.getElementById("resultado").style.display = "none";
}

// ============================================================
// LÓGICA DE TEMA
// ============================================================
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
// MENU LATERAL
// ============================================================
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

// ============================================================
// MODAL DE MODO TESTE
// ============================================================
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
    if (localStorage.getItem('tema') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
    
    // Inicializa os selects personalizados
    popularSelectSangue('paciente');
    popularSelectSangue('doador');
    popularSelectSangue('pai');
    popularSelectSangue('mae');
});