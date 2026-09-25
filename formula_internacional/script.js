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
// DADOS DAS UNIDADES
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
    // 👇 NOVAS UNIDADES ADICIONADAS 👇
    { id: 'concentracao_12', value: '200', label: 'g/5ml', grupo: '🧪 Concentração (massa/volume)' },
    { id: 'concentracao_13', value: '0.1', label: 'mg/10ml', grupo: '🧪 Concentração (massa/volume)' },
    // 📊 Percentual
    { id: 'concentracao_10', value: '10', label: '% (1% = 10mg/ml)', grupo: '📊 Percentual' },
    { id: 'concentracao_11', value: '1', label: '% (peso/volume)', grupo: '📊 Percentual' },
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
// SELECIONAR UNIDADE
// ============================================================
function selecionarUnidade(tipo, id, valor, label) {
    const hiddenId = tipo === 'dosagem' ? 'unidade_de_dosagem' : 'unidade_de_concentracao';
    const displayId = tipo === 'dosagem' ? 'unidadeDosagemSelecionada' : 'unidadeConcentracaoSelecionada';
    const optionsId = tipo === 'dosagem' ? 'unidadeDosagemOptions' : 'unidadeConcentracaoOptions';
    const triggerId = tipo === 'dosagem' ? 'selectDosagem' : 'selectConcentracao';

    document.getElementById(hiddenId).value = valor;
    document.getElementById(displayId).textContent = label;

    const container = document.getElementById(optionsId);
    container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.id === id) {
            opt.classList.add('selecionado');
        }
    });

    container.classList.remove('aberto');
    const trigger = document.querySelector(`#${triggerId} .custom-select-trigger-unidade`);
    if (trigger) trigger.classList.remove('aberto');
}

// ============================================================
// FECHAR SELECTS AO CLICAR FORA
// ============================================================
document.addEventListener('click', function (event) {
    ['selectDosagem', 'selectConcentracao'].forEach(id => {
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
// CAMPOS
// ============================================================
const campo_peso = document.getElementById("peso");
const campo_dosagem = document.getElementById("dosagem");
const campo_concentracao = document.getElementById("concentracao");
const campo_intervalo = document.getElementById("intervalo");

// ============================================================
// UTILITÁRIOS
// ============================================================
function formatarNumero(valor) {
    if (Number.isInteger(valor)) return valor.toString();
    return valor.toFixed(2);
}

function limparBorda(campo) {
    if (campo.value.trim() !== "") {
        campo.style.borderBottom = "";
    }
}

// Remove borda ao escrever (listener único por campo, sem acumular)
[campo_peso, campo_dosagem, campo_concentracao, campo_intervalo].forEach(campo => {
    campo.addEventListener("input", () => limparBorda(campo));
});

// ============================================================
// VALIDAÇÃO
// ============================================================
function validarCampos() {
    const campos = [campo_dosagem, campo_concentracao];
    let todosPreenchidos = true;

    campos.forEach(campo => {
        if (campo.value.trim() === "") {
            campo.style.borderBottom = "solid 2px red";
            todosPreenchidos = false;
        } else {
            campo.style.borderBottom = "";
        }
    });

    return todosPreenchidos;
}

// ============================================================
// FUNÇÃO CALCULAR
// ============================================================
function calcular() {
    const resultado = document.getElementById("resultado");

    resultado.classList.remove("vibrar");
    void resultado.offsetWidth;
    resultado.classList.add("vibrar");

    // ---------- Validação básica ----------
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

    // ---------- Validação do intervalo ----------
    let intervaloHoras = null;
    if (vintervalo_raw !== "") {
        const vintervalo = parseFloat(vintervalo_raw);

        if (isNaN(vintervalo) || vintervalo <= 0) {
            resultado.innerHTML = `<div class="internacional-erro">
                <i class="ri-error-warning-line"></i>
                <span>O intervalo deve ser um número positivo maior que zero!</span>
            </div>`;
            campo_intervalo.style.borderBottom = "solid 2px red";
            return;
        }

        if (vintervalo < 1) {
            resultado.innerHTML = `<div class="internacional-erro">
                <i class="ri-error-warning-line"></i>
                <span>O intervalo mínimo é de 1 hora!</span>
            </div>`;
            campo_intervalo.style.borderBottom = "solid 2px red";
            return;
        }

        if (vintervalo > 672) {
            resultado.innerHTML = `<div class="internacional-erro">
                <i class="ri-error-warning-line"></i>
                <span>O intervalo máximo é de 28 dias (672 horas)!</span>
            </div>`;
            campo_intervalo.style.borderBottom = "solid 2px red";
            return;
        }

        intervaloHoras = vintervalo;
    }

    // ---------- Converter unidades para base (mg e mg/ml) ----------
    const unidade_de_dosagem = parseFloat(document.getElementById("unidade_de_dosagem").value);
    const unidade_de_concentracao = parseFloat(document.getElementById("unidade_de_concentracao").value);

    const vdosagem = vdosagemInput * unidade_de_dosagem;       // em mg (ou mg/kg)
    const vconcentracao = vconcentracaoInput * unidade_de_concentracao; // em mg/ml

    // ---------- Interpretar a unidade selecionada ----------
    const unidadeDosagemSelecionada = document.getElementById('unidadeDosagemSelecionada').textContent;
    const isDoseDiaria = unidadeDosagemSelecionada.includes('/dia');
    const isPorPeso = unidadeDosagemSelecionada.includes('/kg');

    // Nº de tomas em 24h (usa 1 se não houver intervalo)
    const numeroTomas = intervaloHoras ? 24 / intervaloHoras : 1;

    // ---------- Dose POR TOMA (mg) ----------
    let dosePorTomaMg;
    if (isDoseDiaria) {
        // Dose escrita = total diário → distribuir pelas tomas
        const doseDiariaTotalMg = isPorPeso ? vpeso * vdosagem : vdosagem;
        dosePorTomaMg = doseDiariaTotalMg / numeroTomas;
    } else {
        // Dose escrita = dose de cada toma
        dosePorTomaMg = isPorPeso ? vpeso * vdosagem : vdosagem;
    }

    // ---------- Volume por toma ----------
    const volumePorToma = dosePorTomaMg / vconcentracao;

    // ---------- Massa total diária (só para exibir) ----------
    let massaTotalDiariaMg;
    if (isDoseDiaria) {
        // Já é o total do dia
        massaTotalDiariaMg = isPorPeso ? vpeso * vdosagem : vdosagem;
    } else {
        // Dose por toma × nº de tomas
        massaTotalDiariaMg = dosePorTomaMg * numeroTomas;
    }

    // ============================================================
    // RENDERIZAÇÃO
    // ============================================================
    let html = '';

    if (intervaloHoras !== null) {

        if (intervaloHoras === 24) {
            html = `
                <div class="internacional-container">
                    <div class="internacional-card">
                        <div class="card-header">
                            <div class="card-icon"><i class="ri-global-line"></i></div>
                            <div class="card-status">
                                <i class="ri-information-line"></i>
                                <span>Resultado</span>
                            </div>
                        </div>
                        <div class="dose-central">
                            <div class="dose-volume">
                                ${formatarNumero(volumePorToma)} <span class="dose-unidade">mL</span>
                            </div>
                            <div class="dose-intervalo">1 vez por dia</div>
                        </div>
                        <div class="internacional-totais">
                            <div class="total-item">
                                <i class="ri-drop-line"></i>
                                <span>${formatarNumero(volumePorToma)} mL/dia</span>
                            </div>
                            <div class="total-item">
                                <i class="ri-scales-2-line"></i>
                                <span>${formatarNumero(massaTotalDiariaMg)} mg/dia</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (intervaloHoras > 24) {
            const dias = intervaloHoras / 24;
            let textoIntervalo;

            if (dias === 1.5) textoIntervalo = '1 vez a cada 36 horas';
            else if (dias === 2) textoIntervalo = '1 vez a cada 2 dias';
            else if (dias === 3) textoIntervalo = '1 vez a cada 3 dias';
            else if (dias === 7) textoIntervalo = '1 vez por semana';
            else if (dias === 14) textoIntervalo = '1 vez a cada 2 semanas';
            else if (dias === 28) textoIntervalo = '1 vez por mês';
            else textoIntervalo = `1 vez a cada ${formatarNumero(dias)} dias`;

            html = `
                <div class="internacional-container">
                    <div class="internacional-card">
                        <div class="card-header">
                            <div class="card-icon"><i class="ri-global-line"></i></div>
                            <div class="card-status">
                                <i class="ri-information-line"></i>
                                <span>Resultado</span>
                            </div>
                        </div>
                        <div class="dose-central">
                            <div class="dose-volume">
                                ${formatarNumero(volumePorToma)} <span class="dose-unidade">mL</span>
                            </div>
                            <div class="dose-intervalo">${textoIntervalo}</div>
                        </div>
                        <div class="internacional-totais">
                            <div class="total-item">
                                <i class="ri-scales-2-line"></i>
                                <span>${formatarNumero(massaTotalDiariaMg)} mg/dia (média)</span>
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
                            <div class="card-icon"><i class="ri-global-line"></i></div>
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
                                <span>${formatarNumero(massaTotalDiariaMg)} mg/dia</span>
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
                        <div class="card-icon"><i class="ri-global-line"></i></div>
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
                            ${isDoseDiaria ? 'Dose diária total' : 'Dose por administração'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    resultado.innerHTML = html;
    resultado.style.background = "none";

    // Repõe as bordas normais de todos os campos
    [campo_peso, campo_dosagem, campo_concentracao, campo_intervalo].forEach(c => {
        c.style.borderBottom = "solid 2px var(--primary)";
    });
}

// ============================================================
// LIMPAR
// ============================================================
function limpar() {
    [campo_dosagem, campo_concentracao, campo_intervalo, campo_peso].forEach(campo => {
        campo.style.borderBottom = "";
        campo.value = "";
    });

    const resultado = document.getElementById("resultado");
    resultado.textContent = "";
    resultado.style.background = "none";
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
        if (menuLateral.classList.contains('ativo')) fecharMenu();
        else abrirMenu();
    });

    menuOverlay.addEventListener('click', fecharMenu);

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            setTimeout(fecharMenu, 200);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuLateral.classList.contains('ativo')) fecharMenu();
    });

    let touchStartXMenu = 0;
    menuLateral.addEventListener('touchstart', (e) => {
        touchStartXMenu = e.touches[0].clientX;
    }, { passive: true });

    menuLateral.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartXMenu - touchEndX;
        if (diff < -50) fecharMenu();
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

    popularSelectDosagem();
    popularSelectConcentracao();
});