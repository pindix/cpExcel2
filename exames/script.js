// ============================================================================
// INTERPRETADOR DE EXAMES - Mpindi TecMed
// ============================================================================

const examesDB = {
    // Metabolismo Glicémico
    "Glicémia (Jejum)": { min: 70, max: 99, unit: "mg/dL" },
    "Glicémia (Pós-prandial)": { min: 70, max: 140, unit: "mg/dL" },
    "Hemoglobina Glicada (HbA1c)": { min: 4.0, max: 5.6, unit: "%" },
    
    // Perfil Renal
    "Ureia": { min: 15, max: 45, unit: "mg/dL" },
    "Creatinina": { min: 0.6, max: 1.2, unit: "mg/dL" },
    "Creatinina (Mulher)": { min: 0.5, max: 1.1, unit: "mg/dL" },
    "Ácido Úrico": { min: 2.4, max: 7.0, unit: "mg/dL" },
    "Ácido Úrico (Mulher)": { min: 2.4, max: 5.7, unit: "mg/dL" },
    "TFG (Taxa Filtração Glomerular)": { min: 90, max: 120, unit: "mL/min/1.73m²" },
    
    // Perfil Hepático
    "TGO (AST)": { min: 5, max: 40, unit: "U/L" },
    "TGP (ALT)": { min: 7, max: 56, unit: "U/L" },
    "GGT (Gama GT)": { min: 9, max: 48, unit: "U/L" },
    "Fosfatase Alcalina": { min: 44, max: 147, unit: "U/L" },
    "Bilirrubina Total": { min: 0.1, max: 1.2, unit: "mg/dL" },
    "Bilirrubina Direta": { min: 0.0, max: 0.3, unit: "mg/dL" },
    "Bilirrubina Indireta": { min: 0.1, max: 0.9, unit: "mg/dL" },
    "Albumina": { min: 3.5, max: 5.5, unit: "g/dL" },
    "Proteínas Totais": { min: 6.0, max: 8.3, unit: "g/dL" },
    
    // Perfil Lipídico
    "Colesterol Total": { min: 0, max: 190, unit: "mg/dL" },
    "HDL Colesterol": { min: 40, max: 60, unit: "mg/dL" },
    "LDL Colesterol": { min: 0, max: 130, unit: "mg/dL" },
    "Triglicéridos": { min: 0, max: 150, unit: "mg/dL" },
    
    // Eletrólitos
    "Sódio (Na+)": { min: 135, max: 145, unit: "mEq/L" },
    "Potássio (K+)": { min: 3.5, max: 5.2, unit: "mEq/L" },
    "Cloro (Cl-)": { min: 96, max: 106, unit: "mEq/L" },
    "Cálcio Total": { min: 8.5, max: 10.5, unit: "mg/dL" },
    "Cálcio Iónico": { min: 4.5, max: 5.6, unit: "mg/dL" },
    "Magnésio (Mg2+)": { min: 1.7, max: 2.2, unit: "mg/dL" },
    "Fósforo": { min: 2.5, max: 4.5, unit: "mg/dL" },
    
    // Hemograma - Série Vermelha
    "Hemoglobina (Homem)": { min: 13.5, max: 17.5, unit: "g/dL" },
    "Hemoglobina (Mulher)": { min: 12.0, max: 16.0, unit: "g/dL" },
    "Hemoglobina (Criança)": { min: 11.0, max: 14.0, unit: "g/dL" },
    "Hematócrito (Homem)": { min: 40, max: 52, unit: "%" },
    "Hematócrito (Mulher)": { min: 36, max: 48, unit: "%" },
    "VCM (Volume Corpuscular Médio)": { min: 80, max: 100, unit: "fL" },
    "HCM": { min: 27, max: 33, unit: "pg" },
    "CHCM": { min: 32, max: 36, unit: "g/dL" },
    "RDW": { min: 11.5, max: 14.5, unit: "%" },
    "Plaquetas": { min: 150000, max: 450000, unit: "/mm³" },
    
    // Hemograma - Série Branca
    "Leucócitos Totais": { min: 4000, max: 11000, unit: "/mm³" },
    "Neutrófilos": { min: 2000, max: 7500, unit: "/mm³" },
    "Linfócitos": { min: 1000, max: 4500, unit: "/mm³" },
    "Monócitos": { min: 200, max: 800, unit: "/mm³" },
    "Eosinófilos": { min: 40, max: 400, unit: "/mm³" },
    "Basófilos": { min: 10, max: 100, unit: "/mm³" },
    
    // Coagulação
    "TP (Tempo Protrombina)": { min: 10, max: 14, unit: "segundos" },
    "TTPA": { min: 25, max: 35, unit: "segundos" },
    "INR (Normal)": { min: 0.8, max: 1.2, unit: "" },
    "INR (Terapêutico - Varfarina)": { min: 2.0, max: 3.0, unit: "" },
    "INR (Prótese Mecânica)": { min: 2.5, max: 3.5, unit: "" },
    "Fibrinogénio": { min: 200, max: 400, unit: "mg/dL" },
    "Dímero-D": { min: 0, max: 500, unit: "ng/mL" },
    
    // Marcadores Cardíacos
    "Troponina I": { min: 0, max: 0.04, unit: "ng/mL" },
    "CK Total": { min: 30, max: 200, unit: "U/L" },
    "CK-MB": { min: 0, max: 5, unit: "ng/mL" },
    "BNP": { min: 0, max: 100, unit: "pg/mL" },
    "Mioglobina": { min: 25, max: 72, unit: "ng/mL" },
    
    // Perfil Tiroideu
    "TSH": { min: 0.4, max: 4.5, unit: "mUI/L" },
    "T4 Livre": { min: 0.7, max: 1.8, unit: "ng/dL" },
    "T3 Livre": { min: 2.3, max: 4.2, unit: "pg/mL" },
    
    // Marcadores Inflamatórios
    "PCR (Proteína C Reativa)": { min: 0, max: 5, unit: "mg/L" },
    "VHS (Homem)": { min: 0, max: 15, unit: "mm/h" },
    "VHS (Mulher)": { min: 0, max: 20, unit: "mm/h" },
    "Procalcitonina": { min: 0, max: 0.05, unit: "ng/mL" },
    
    // Outros
    "Amilase": { min: 25, max: 115, unit: "U/L" },
    "Lipase": { min: 0, max: 160, unit: "U/L" },
    "Ferro Sérico": { min: 60, max: 170, unit: "µg/dL" },
    "Ferritina (Homem)": { min: 30, max: 400, unit: "ng/mL" },
    "Ferritina (Mulher)": { min: 15, max: 150, unit: "ng/mL" },
    "Lactato": { min: 0.5, max: 2.2, unit: "mmol/L" },
    "Gasometria - pH": { min: 7.35, max: 7.45, unit: "" },
    "Gasometria - pCO2": { min: 35, max: 45, unit: "mmHg" },
    "Gasometria - HCO3": { min: 22, max: 26, unit: "mEq/L" },
    "Gasometria - pO2": { min: 75, max: 100, unit: "mmHg" },
    "Saturação O2": { min: 95, max: 100, unit: "%" }
};

// ============================================================================
// ELEMENTOS DOM
// ============================================================================
const inputExame = document.getElementById("exame_nome");
const inputValor = document.getElementById("exame_valor");
const uniTag = document.getElementById("unidade_display");
const divSugestoes = document.getElementById("sugestoes_box");
const pResultado = document.getElementById("resultado");

// ============================================================================
// TEMA (Mantido do original)
// ============================================================================
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

if (localStorage.getItem('tema') === 'dark') {
    body.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.className = 'ri-sun-line';
}

themeBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'ri-moon-line';
        localStorage.setItem('tema', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
        localStorage.setItem('tema', 'dark');
    }
});

// ============================================================================
// AUTOCOMPLETE (MESMA LÓGICA DA DOSAGEM)
// ============================================================================
function filtrarExames() {
    const termoOriginal = inputExame.value;
    const termo = termoOriginal.trim().toLowerCase();
    
    // Se não houver texto ou forem apenas espaços
    if (!termo || termo.length === 0) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        uniTag.textContent = "--";
        return;
    }
    
    // Busca exata: se o nome completo já foi digitado corretamente
    const nomesExatos = Object.keys(examesDB).filter(nome => 
        String(nome).toLowerCase().trim() === termo
    );
    
    if (nomesExatos.length === 1) {
        // Encontrou correspondência exata
        inputExame.value = nomesExatos[0];
        uniTag.textContent = examesDB[nomesExatos[0]].unit;
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }
    
    // Filtro com Prioridade de Início (Relevância)
    const nomesFiltrados = Object.keys(examesDB)
        .filter(nome => String(nome).toLowerCase().includes(termo))
        .sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aComeca = aLower.startsWith(termo);
            const bComeca = bLower.startsWith(termo);
            if (aComeca && !bComeca) return -1;
            if (!aComeca && bComeca) return 1;
            return aLower.localeCompare(bLower);
        });
    
    if (nomesFiltrados.length === 0) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }
    
    divSugestoes.innerHTML = "";
    divSugestoes.style.display = "block";
    
    nomesFiltrados.slice(0, 8).forEach(nome => {
        const item = document.createElement("div");
        item.className = "sugestao-item";
        
        const index = nome.toLowerCase().indexOf(termo);
        const parteAntes = nome.substring(0, index);
        const parteMatch = nome.substring(index, index + termo.length);
        const parteDepois = nome.substring(index + termo.length);
        
        item.innerHTML = `${parteAntes}<strong>${parteMatch}</strong>${parteDepois}`;
        
        item.onclick = () => {
            inputExame.value = nome;
            uniTag.textContent = examesDB[nome].unit;
            divSugestoes.style.display = "none";
            divSugestoes.innerHTML = "";
        };
        divSugestoes.appendChild(item);
    });
}

// Fecha as sugestões ao clicar fora
document.addEventListener('click', (event) => {
    const clicouNoInput = inputExame.contains(event.target);
    const clicouNasSugestoes = divSugestoes.contains(event.target);
    
    if (!clicouNoInput && !clicouNasSugestoes) {
        divSugestoes.style.display = "none";
    }
});

// ============================================================================
// ANALISAR (Com validações)
// ============================================================================
function analisar() {
    const nome = inputExame.value.trim();
    const valorStr = inputValor.value.trim();
    
    // Validação 1: Exame vazio
    if (!nome || nome.length === 0) {
        pResultado.innerHTML = "Preencha o nome do exame!";
        pResultado.style.background = "#f44336";
        pResultado.style.color = "white";
        pResultado.style.textAlign = "center";
        pResultado.style.display = "block";
        pResultado.classList.remove("vibrar");
        void pResultado.offsetWidth;
        pResultado.classList.add("vibrar");
        return;
    }
    
    // Validação 2: Valor vazio
    if (!valorStr || valorStr.length === 0) {
        pResultado.innerHTML = "Preencha o valor do exame!";
        pResultado.style.background = "#f44336";
        pResultado.style.color = "white";
        pResultado.style.textAlign = "center";
        pResultado.style.display = "block";
        pResultado.classList.remove("vibrar");
        void pResultado.offsetWidth;
        pResultado.classList.add("vibrar");
        return;
    }
    
    // Validação 3: Exame não encontrado
    const nomeLower = nome.toLowerCase();
    const chaveEncontrada = Object.keys(examesDB).find(k => 
        String(k).toLowerCase().trim() === nomeLower
    );
    
    if (!chaveEncontrada) {
        pResultado.innerHTML = "Exame não encontrado. Selecione um exame da lista!";
        pResultado.style.background = "#f44336";
        pResultado.style.color = "white";
        pResultado.style.textAlign = "center";
        pResultado.style.display = "block";
        pResultado.classList.remove("vibrar");
        void pResultado.offsetWidth;
        pResultado.classList.add("vibrar");
        return;
    }
    
    const ref = examesDB[chaveEncontrada];
    const valor = parseFloat(valorStr);
    
    // Validação 4: Valor inválido
    if (isNaN(valor)) {
        pResultado.innerHTML = "Valor inválido! Insira um número.";
        pResultado.style.background = "#f44336";
        pResultado.style.color = "white";
        pResultado.style.textAlign = "center";
        pResultado.style.display = "block";
        pResultado.classList.remove("vibrar");
        void pResultado.offsetWidth;
        pResultado.classList.add("vibrar");
        return;
    }
    
    // Análise do resultado
    const eNormal = valor >= ref.min && valor <= ref.max;
    const icone = eNormal ? 'ri-check-line' : 'ri-close-line';
    const cor = eNormal ? "var(--primary)" : "#f44336";
    const status = eNormal ? 'NORMAL' : 'ALTERADO';
    
    pResultado.innerHTML = `
        <i class="${icone} res-icon"></i>
        <b>${status}</b><br>
        <small>Referência: ${ref.min} - ${ref.max} ${ref.unit}</small>
    `;
    
    pResultado.style.background = cor;
    pResultado.style.color = "white";
    pResultado.style.textAlign = "left";
    pResultado.style.display = "block";
    
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");
}

// ============================================================================
// LIMPAR
// ============================================================================
function limpar() {
    inputExame.value = "";
    inputValor.value = "";
    uniTag.textContent = "--";
    divSugestoes.style.display = "none";
    divSugestoes.innerHTML = "";
    pResultado.innerHTML = "";
    pResultado.style.display = "none";
    pResultado.style.background = "var(--primary)";
}