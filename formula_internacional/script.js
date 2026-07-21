// ============================================================
// LÓGICA DO TEMA ESCURO
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
// DADOS DAS UNIDADES (LIMPEZA: Removidas opções de taxa de infusão e unidades especiais)
// ============================================================
const UNIDADES_DOSAGEM = [
    // 💊 Dose por peso
    { id: 'dosagem_1', value: '1', label: 'mg/kg', grupo: '💊 Dose por peso' },
    { id: 'dosagem_2', value: '1000', label: 'g/kg', grupo: '💊 Dose por peso' },
    { id: 'dosagem_3', value: '0.001', label: 'mcg/kg', grupo: '💊 Dose por peso' },
    { id: 'dosagem_4', value: '0.000001', label: 'ng/kg', grupo: '💊 Dose por peso' },
    { id: 'dosagem_5', value: '1', label: 'mg/kg/dia', grupo: '💊 Dose por peso' },
    { id: 'dosagem_6', value: '1000', label: 'g/kg/dia', grupo: '💊 Dose por peso' },
    // 💊 Dose fixa
    { id: 'dosagem_7', value: '1', label: 'mg', grupo: '💊 Dose fixa' },
    { id: 'dosagem_8', value: '1000', label: 'g', grupo: '💊 Dose fixa' },
    { id: 'dosagem_9', value: '0.001', label: 'mcg', grupo: '💊 Dose fixa' },
    { id: 'dosagem_10', value: '0.000001', label: 'ng', grupo: '💊 Dose fixa' },
    { id: 'dosagem_11', value: '1', label: 'mg/dia', grupo: '💊 Dose fixa' },
    { id: 'dosagem_12', value: '1000', label: 'g/dia', grupo: '💊 Dose fixa' },
    { id: 'dosagem_13', value: '0.001', label: 'mcg/dia', grupo: '💊 Dose fixa' },
    // Removido: Taxa de Infusão (/h, /min) e Unidades Especiais (UI, mEq, mmol)
];

const UNIDADES_CONCENTRACAO = [
    // 🧪 Concentração (massa/volume)
    { id: 'concentracao_1', value: '1', label: 'mg/ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_2', value: '1000', label: 'g/ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_3', value: '0.001', label: 'mcg/ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_4', value: '0.000001', label: 'ng/ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_5', value: '0.001', label: 'mg/L', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_6', value: '1', label: 'g/L', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_7', value: '0.001', label: 'mg/100ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_8', value: '0.2', label: 'mg/5ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_9', value: '100', label: 'g/10ml', grupo: '🧪 Concentração (massa/volume)' },
    // 📊 Percentual
    { id: 'concentracao_10', value: '10', label: '% (1% = 10mg/ml)', grupo: '📊 Percentual' },
    { id: 'concentracao_11', value: '1', label: '% (peso/volume)', grupo: '📊 Percentual' },
    // Removido: Unidades Especiais (UI, mEq, mmol)
];

// ============================================================
// INICIALIZAR SELECTS PERSONALIZADOS
// ============================================================
function popularSelectDosagem() {
    const container = document.getElementById('unidadeDosagemOptions');
    if (!container) return;

    let html = '';
    let grupoAtual = '';
    
    UNIDADES_DOSAGEM.forEach(op => {
        if (op.grupo !== grupoAtual) {
            grupoAtual = op.grupo;
            html += `<div class="option-group-label">${grupoAtual}</div>`;
        }
        html += `
            <div class="custom-select-option-unidade" 
                 data-id="${op.id}" 
                 data-value="${op.value}" 
                 onclick="selecionarUnidade('dosagem', '${op.id}', '${op.value}', '${op.label}')">
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
        document.getElementById('unidadeDosagemSelecionada').textContent = label;
        document.getElementById('unidade_de_dosagem').value = valor;
    }
}

function popularSelectConcentracao() {
    const container = document.getElementById('unidadeConcentracaoOptions');
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
                 onclick="selecionarUnidade('concentracao', '${op.id}', '${op.value}', '${op.label}')">
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
        document.getElementById('unidadeConcentracaoSelecionada').textContent = label;
        document.getElementById('unidade_de_concentracao').value = valor;
    }
}

// ============================================================
// TOGGLE DO SELECT
// ============================================================
function toggleUnidadeSelect(tipo) {
    const optionsId = tipo === 'dosagem' ? 'unidadeDosagemOptions' : 'unidadeConcentracaoOptions';
    const triggerId = tipo === 'dosagem' ? 'selectDosagem' : 'selectConcentracao';
    
    const options = document.getElementById(optionsId);
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-unidade`);
    
    if (!options || !trigger) return;

    // Fecha o outro select se estiver aberto
    const outroOptionsId = tipo === 'dosagem' ? 'unidadeConcentracaoOptions' : 'unidadeDosagemOptions';
    const outroTriggerId = tipo === 'dosagem' ? 'selectConcentracao' : 'selectDosagem';
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
// SELECIONAR UNIDADE (CORRIGIDO)
// ============================================================
function selecionarUnidade(tipo, id, valor, label) {
    const hiddenId = tipo === 'dosagem' ? 'unidade_de_dosagem' : 'unidade_de_concentracao';
    const displayId = tipo === 'dosagem' ? 'unidadeDosagemSelecionada' : 'unidadeConcentracaoSelecionada';
    const optionsId = tipo === 'dosagem' ? 'unidadeDosagemOptions' : 'unidadeConcentracaoOptions';
    const triggerId = tipo === 'dosagem' ? 'selectDosagem' : 'selectConcentracao';

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
    const selects = ['selectDosagem', 'selectConcentracao'];
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

const campo_peso = document.getElementById("peso");
const campo_dosagem = document.getElementById("dosagem");
const campo_concentracao = document.getElementById("concentracao");
const campo_intervalo = document.getElementById("intervalo");

function validarCampos() {
    const campos = [campo_dosagem, campo_concentracao];
    let todosPreenchidos = true;

    campos.forEach(campo => {
        if (campo.value.trim() === "") {
            campo.style.border = "solid 1px red";
            campo.style.borderRight = "none";
            campo.style.borderLeft = "none";
            todosPreenchidos = false;
            resultado.style.background = "red";
        } else {
            campo.style.border = "";
        }
    });

    return todosPreenchidos;
}

function retirar_bordas() {
    const camposObrigatorios = [campo_dosagem, campo_concentracao, campo_peso, campo_intervalo];
    camposObrigatorios.forEach(campo => {
        campo.addEventListener("input", function () {
            if (this.value.trim() !== "") {
                this.style.border = "";
            }
        });
    });
}

// ============================================================
// FUNÇÃO CALCULAR (CORRIGIDA)
// ============================================================
function calcular() {
    const resultado = document.getElementById("resultado");
    resultado.classList.remove("vibrar");
    void resultado.offsetWidth;
    resultado.classList.add("vibrar");

    if (!validarCampos()) {
        resultado.innerHTML = `<div class="internacional-erro">
            <i class="ri-error-warning-line"></i>
            <span>Por favor, preencha os campos obrigatórios!</span>
        </div>`;
        return;
    }

    const vpeso = parseFloat(campo_peso.value) || 1;
    const vdosagemInput = parseFloat(campo_dosagem.value);
    const vconcentracaoInput = parseFloat(campo_concentracao.value);
    const vintervalo_raw = campo_intervalo.value.trim();

    if (isNaN(vpeso) || vpeso <= 0) {
        resultado.innerHTML = `<div class="internacional-erro">
            <i class="ri-error-warning-line"></i>
            <span>O peso deve ser um número positivo maior que zero!</span>
        </div>`;
        campo_peso.style.borderBottom = "solid 2px red";
        return;
    }

    if (isNaN(vdosagemInput) || vdosagemInput <= 0) {
        resultado.innerHTML = `<div class="internacional-erro">
            <i class="ri-error-warning-line"></i>
            <span>A dosagem deve ser um número positivo maior que zero!</span>
        </div>`;
        campo_dosagem.style.borderBottom = "solid 2px red";
        return;
    }

    if (isNaN(vconcentracaoInput) || vconcentracaoInput <= 0) {
        resultado.innerHTML = `<div class="internacional-erro">
            <i class="ri-error-warning-line"></i>
            <span>A concentração deve ser um número positivo maior que zero!</span>
        </div>`;
        campo_concentracao.style.borderBottom = "solid 2px red";
        return;
    }

    const unidade_de_dosagem = parseFloat(document.getElementById("unidade_de_dosagem").value);
    const unidade_de_concentracao = parseFloat(document.getElementById("unidade_de_concentracao").value);

    const vdosagem = vdosagemInput * unidade_de_dosagem;
    const vconcentracao = vconcentracaoInput * unidade_de_concentracao;

    let intervaloHoras = null;
    if (vintervalo_raw !== "") {
        if (parseFloat(vintervalo_raw) <= 0) {
            resultado.innerHTML = `<div class="internacional-erro">
                <i class="ri-error-warning-line"></i>
                <span>O intervalo deve ser um número positivo maior que zero!</span>
            </div>`;
            campo_intervalo.style.borderBottom = "solid 2px red";
            return;
        }

        intervaloHoras = parseFloat(vintervalo_raw);

        if (intervaloHoras < 1) {
            resultado.innerHTML = `<div class="internacional-erro">
                <i class="ri-error-warning-line"></i>
                <span>O intervalo mínimo é de 1 hora!</span>
            </div>`;
            campo_intervalo.style.borderBottom = "solid 2px red";
            return;
        }

        if (intervaloHoras > 672) {
            resultado.innerHTML = `<div class="internacional-erro">
                <i class="ri-error-warning-line"></i>
                <span>O intervalo máximo é de 28 dias (672 horas)!</span>
            </div>`;
            campo_intervalo.style.borderBottom = "solid 2px red";
            return;
        }
    }

    function formatarNumero(valor) {
        if (Number.isInteger(valor)) {
            return valor.toString();
        }
        return valor.toFixed(2);
    }

    // CORREÇÃO: Lógica de dose diária vs dose por administração
    // Verifica se a opção da dose selecionada contém "/dia"
    const unidadeDosagemSelecionada = document.getElementById('unidadeDosagemSelecionada').textContent;
    const isDoseDiaria = unidadeDosagemSelecionada.includes('/dia');

    // Cálculo base: dose * peso (sempre em mg)
    const doseDiariaMg = vpeso * vdosagem;
    let doseAdminMg = doseDiariaMg; // Inicializa com o valor diário

    // Se NÃO for dose diária (ex: mg/kg, mg), a dose já é por administração
    if (!isDoseDiaria) {
        doseAdminMg = vdosagem; // A dose inserida já é por administração (não multiplica pelo peso)
        // Se a dose for por peso (mg/kg) mas não for diária, multiplica pelo peso
        if (unidadeDosagemSelecionada.includes('/kg') && !unidadeDosagemSelecionada.includes('/dia')) {
            doseAdminMg = vpeso * vdosagem;
        }
        // Se for dose fixa (mg, g, mcg) sem /kg, usa o valor diretamente
    }

    // O volume por administração é sempre: doseAdminMg / concentracao
    const volumePorAdmin = doseAdminMg / vconcentracao;

    let html = '';

    if (intervaloHoras !== null && intervaloHoras > 0) {
        const numeroTomas = 24 / intervaloHoras;
        let volumePorToma = volumePorAdmin; // Inicializa com o volume por administração

        // CORREÇÃO: Só divide pelo número de tomadas se for dose diária
        if (isDoseDiaria) {
            // Para dose diária, o volume por toma é o volume diário dividido pelo número de tomadas
            const doseDiariaVolume = doseAdminMg / vconcentracao;
            volumePorToma = doseDiariaVolume / numeroTomas;
        } else {
            // Para dose por administração, o volume por toma é o volume calculado diretamente
            volumePorToma = volumePorAdmin;
        }

        // CORREÇÃO: Ajuste para o caso de intervalo > 24h
        if (intervaloHoras > 24) {
            // Para intervalo > 24h, a dose é única (1 toma)
            volumePorToma = volumePorAdmin;
        }

        if (intervaloHoras === 24) {
            html = `
                <div class="internacional-container">
                    <div class="internacional-card">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="ri-global-line"></i>
                            </div>
                            <div class="card-status">
                                <i class="ri-information-line"></i>
                                <span>Resultado</span>
                            </div>
                        </div>
                        
                        <div class="dose-central">
                            <div class="dose-volume">
                                ${formatarNumero(volumePorToma)} <span class="dose-unidade">mL</span>
                            </div>
                            <div class="dose-intervalo">
                                1 vez por dia
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (intervaloHoras > 24) {
            const dias = intervaloHoras / 24;
            let textoIntervalo = '';

            if (dias === 1.5) {
                textoIntervalo = '1 vez a cada 36 horas';
            } else if (dias === 2) {
                textoIntervalo = '1 vez a cada 2 dias';
            } else if (dias === 3) {
                textoIntervalo = '1 vez a cada 3 dias';
            } else if (dias === 7) {
                textoIntervalo = '1 vez por semana';
            } else if (dias === 14) {
                textoIntervalo = '1 vez a cada 2 semanas';
            } else if (dias === 28) {
                textoIntervalo = '1 vez por mês';
            } else {
                textoIntervalo = `1 vez a cada ${formatarNumero(dias)} dias`;
            }

            html = `
                <div class="internacional-container">
                    <div class="internacional-card">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="ri-global-line"></i>
                            </div>
                            <div class="card-status">
                                <i class="ri-information-line"></i>
                                <span>Resultado</span>
                            </div>
                        </div>
                        
                        <div class="dose-central">
                            <div class="dose-volume">
                                ${formatarNumero(volumePorToma)} <span class="dose-unidade">mL</span>
                            </div>
                            <div class="dose-intervalo">
                                ${textoIntervalo}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Intervalo entre 1 e 23 horas
            html = `
                <div class="internacional-container">
                    <div class="internacional-card">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="ri-global-line"></i>
                            </div>
                            <div class="card-status">
                                <i class="ri-information-line"></i>
                                <span>Resultado</span>
                            </div>
                        </div>
                        
                        <div class="dose-central">
                            <div class="dose-volume">
                                ${formatarNumero(volumePorToma)} <span class="dose-unidade">mL</span>
                            </div>
                            <div class="dose-intervalo">
                                de ${formatarNumero(intervaloHoras)} em ${formatarNumero(intervaloHoras)} horas
                            </div>
                        </div>
                        
                        <div class="internacional-totais">
                            <div class="total-item">
                                <i class="ri-repeat-line"></i>
                                <span>${formatarNumero(numeroTomas)} toma(s)/dia</span>
                            </div>
                            <div class="total-item">
                                <i class="ri-drop-line"></i>
                                <span>${formatarNumero(volumePorToma * numeroTomas)} mL/dia</span>
                            </div>
                            <div class="total-item">
                                <i class="ri-scales-2-line"></i>
                                <span>${formatarNumero(doseAdminMg)} mg/dia</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } else {
        // Sem intervalo
        html = `
            <div class="internacional-container">
                <div class="internacional-card">
                    <div class="card-header">
                        <div class="card-icon">
                            <i class="ri-global-line"></i>
                        </div>
                        <div class="card-status">
                            <i class="ri-information-line"></i>
                            <span>Resultado</span>
                        </div>
                    </div>
                    
                    <div class="dose-central">
                        <div class="dose-volume">
                            ${formatarNumero(volumePorAdmin)} <span class="dose-unidade">mL</span>
                        </div>
                        ${isDoseDiaria ? `<div class="dose-intervalo">Dose diária total</div>` : `<div class="dose-intervalo">Dose por administração</div>`}
                    </div>
                </div>
            </div>
        `;
    }

    resultado.innerHTML = html;
    resultado.style.background = "none";

    campo_peso.style.borderBottom = "solid 2px var(--primary)";
    campo_dosagem.style.borderBottom = "solid 2px var(--primary)";
    campo_concentracao.style.borderBottom = "solid 2px var(--primary)";
    campo_intervalo.style.borderBottom = "solid 2px var(--primary)";
}


campo_peso.addEventListener("input", retirar_bordas);
campo_dosagem.addEventListener("input", retirar_bordas);
campo_concentracao.addEventListener("input", retirar_bordas);
campo_intervalo.addEventListener("input", retirar_bordas);

function limpar() {
    const campos = [campo_dosagem, campo_concentracao, campo_intervalo, campo_peso];
    campos.forEach(campo => {
        campo.style.border = "";
    });

    campo_peso.value = "";
    campo_dosagem.value = "";
    campo_concentracao.value = "";
    campo_intervalo.value = "";

    const resultado = document.getElementById("resultado");
    resultado.textContent = "";
    resultado.style.background = "var(--primary)";
    resultado.classList.remove("vibrar");
    void resultado.offsetWidth;
    resultado.classList.add("vibrar");
}

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
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }

    // Inicializa os selects personalizados
    popularSelectDosagem();
    popularSelectConcentracao();
});