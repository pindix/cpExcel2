/* ==========================================================================
   INTERPRETADOR CLÍNICO v2 — MOTOR UNIFICADO
   Exames + Escalas. Uma só base de dados. Um só motor.
   
   FORMATOS SUPORTADOS:
   ─────────────────────
   1. Exame simples        → tipo: "exame",   sem calculo,  referencia + interpretacao por faixa
   2. Exame classificado   → tipo: "exame",   sem calculo,  interpretacao por faixa (sem referencia)
   3. Exame com padrão     → tipo: "exame",   calculo: { tipo: "padrao" },  interpretacao por padrao
   4a. Escala com pesos    → tipo: "escala",  calculo: { tipo: "soma_pesos" }, interpretacao por faixa
   4b. Escala com fórmula  → tipo: "escala",  calculo: { formula: "..." },  interpretacao por faixa
   ========================================================================== */


/* ==========================================================================
   BASE DE DADOS
   ========================================================================== */
const database = {

    /* ====================================================================== */
    /* FORMATO 1 — EXAME SIMPLES                                              */
    /* ====================================================================== */
    "Glicémia (Jejum)": {
        tipo: "exame",
        sinonimos: ["glicemia", "glucose", "açúcar no sangue"],
        campos: [
            { id: "valor", tipo: "input", label: "Resultado",
              unidade: "mg/dL", min: 0, max: 999 }
        ],
        referencia: { min: 70, max: 99, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 69],     status: "baixo",  termo: "Hipoglicemia",
              nota: "⚠️ GLICEMIA BAIXA! Risco de hipoglicemia. Oferecer 15g de açúcar de absorção rápida e repetir glicemia em 15 minutos." },
            { faixa: [70, 99],    status: "normal", termo: "Normoglicemia",
              nota: "✅ Glicemia normal. Manter estilo de vida saudável e medicações conforme prescrição." },
            { faixa: [100, 999],  status: "alto",   termo: "Hiperglicemia",
              nota: "⚠️ GLICEMIA ALTA! Hiperglicemia. Avaliar adesão à medicação e regime alimentar. Considerar ajuste de insulina/antidiabético oral." }
        ]
    },

    "Creatinina": {
        tipo: "exame",
        sinonimos: ["creat", "creatinina"],
        campos: [
            { id: "valor", tipo: "input", label: "Resultado",
              unidade: "mg/dL", min: 0, max: 20 }
        ],
        referencia: { min: 0.6, max: 1.2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 0.5],   status: "baixo",  termo: "Creatinina baixa",
              nota: "Creatinina baixa. Geralmente sem significado clínico, pode ocorrer em sarcopenia ou desnutrição." },
            { faixa: [0.6, 1.2], status: "normal", termo: "Função renal normal",
              nota: "✅ Função renal preservada." },
            { faixa: [1.3, 20],  status: "alto",   termo: "Insuficiência renal",
              nota: "⚠️ CREATININA ALTA! Possível lesão renal. Calcular TFG. Avaliar hidratação e medicamentos nefrotóxicos." }
        ]
    },

    /* ====================================================================== */
    /* FORMATO 2 — EXAME CLASSIFICADO (ex-diagnóstico)                        */
    /* ====================================================================== */
    "Malária": {
        tipo: "exame",
        sinonimos: ["malaria", "paludismo"],
        campos: [
            { id: "parasitemia", tipo: "input", label: "Parasitémia",
              unidade: "/µL", min: 0, max: 9999999 }
        ],
        interpretacao: [
            { faixa: [0, 0],            status: "negativo",    classificacao: "Negativo",    termo: "Negativo",
              nota: "Malária negativa. Descartar infecção." },
            { faixa: [1, 999],          status: "leve",        classificacao: "Leve",        termo: "Positivo",
              nota: "Malária leve. Tratamento ambulatorial com Arteméter-Lumefantrina por 3 dias." },
            { faixa: [1000, 9999],      status: "moderado",    classificacao: "Moderada",    termo: "Positivo",
              nota: "Malária moderada. Internação. Hemograma completo + função renal." },
            { faixa: [10000, 99999],    status: "grave",       classificacao: "Grave",       termo: "Positivo",
              nota: "⚠️ MALÁRIA GRAVE! UCI. Arteméter IV + monitorizar glicemia a cada 6h." },
            { faixa: [100000, 9999999], status: "muito_grave", classificacao: "Muito Grave", termo: "Positivo",
              nota: "⚠️ MALÁRIA MUITO GRAVE! UCI urgente. Transfusão + artesunato IV + glicose 50%." }
        ]
    },

    /* ====================================================================== */
    /* FORMATO 3 — EXAME COM PADRÃO (perfil sorológico)                       */
    /* ====================================================================== */
    "HIV": {
        tipo: "exame",
        sinonimos: ["hiv", "aids"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM",
              opcoes: [
                  { label: "Reagente",     valor: "Reagente" },
                  { label: "Não Reagente", valor: "Não Reagente" }
              ]},
            { id: "igg", tipo: "select", label: "IgG",
              opcoes: [
                  { label: "Reagente",     valor: "Reagente" },
                  { label: "Não Reagente", valor: "Não Reagente" }
              ]}
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Reagente", igg: "Não Reagente" },
              status: "grave",    termo: "Positivo", classificacao: "Infecção Aguda",
              nota: "⚠️ HIV — perfil sugestivo de INFECÇÃO AGUDA. Notificar se aplicável e iniciar conduta clínica adequada." },
            { padrao: { igm: "Reagente", igg: "Reagente" },
              status: "moderado", termo: "Positivo", classificacao: "Infecção Recente/em Evolução",
              nota: "HIV — perfil sugestivo de infecção recente ou em fase de soroconversão. Repetir sorologia em 2-3 semanas." },
            { padrao: { igm: "Não Reagente", igg: "Reagente" },
              status: "imune",    termo: "Positivo", classificacao: "Infecção Pregressa/Imunidade",
              nota: "HIV — perfil sugestivo de contato prévio ou imunidade. Sem sinais de infecção ativa." },
            { padrao: { igm: "Não Reagente", igg: "Não Reagente" },
              status: "negativo", termo: "Negativo", classificacao: "Negativo/Susceptível",
              nota: "HIV — sorologia negativa. Paciente susceptível; considerar vacinação se disponível e indicada." }
        ]
    },

    /* ====================================================================== */
    /* FORMATO 4A — ESCALA COM SOMA DE PESOS                                  */
    /* ====================================================================== */
    "Escala de Glasgow": {
        tipo: "escala",
        sinonimos: ["glasgow", "gcs"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular",
              opcoes: [
                  { label: "1 (Nenhuma)",        peso: 1 },
                  { label: "2 (Dor)",            peso: 2 },
                  { label: "3 (Comando verbal)", peso: 3 },
                  { label: "4 (Espontânea)",     peso: 4 }
              ]},
            { id: "verbal", tipo: "select", label: "Resposta Verbal",
              opcoes: [
                  { label: "1 (Nenhuma)",   peso: 1 },
                  { label: "2 (Sons)",      peso: 2 },
                  { label: "3 (Palavras)",  peso: 3 },
                  { label: "4 (Confuso)",   peso: 4 },
                  { label: "5 (Orientado)", peso: 5 }
              ]},
            { id: "motora", tipo: "select", label: "Resposta Motora",
              opcoes: [
                  { label: "1 (Nenhuma)",  peso: 1 },
                  { label: "2 (Extensão)", peso: 2 },
                  { label: "3 (Flexão)",   peso: 3 },
                  { label: "4 (Retirada)", peso: 4 },
                  { label: "5 (Localiza)", peso: 5 },
                  { label: "6 (Obedece)",  peso: 6 }
              ]}
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve",     classificacao: "Leve",
              nota: "Lesão cerebral leve. Observação. Reavaliar a cada 4 horas." },
            { faixa: [9, 12],  status: "moderado", classificacao: "Moderada",
              nota: "Lesão cerebral moderada. Internação/TC. Risco de deterioração. TC craniana urgente." },
            { faixa: [3, 8],   status: "grave",    classificacao: "Grave",
              nota: "⚠️ LESÃO CEREBRAL GRAVE! UCI/Intubação. COMA! Proteger via aérea. Considerar intubação." }
        ]
    },

    /* ====================================================================== */
    /* FORMATO 4B — ESCALA COM FÓRMULA MATEMÁTICA                             */
    /* ====================================================================== */
    "IMC (Índice de Massa Corporal)": {
        tipo: "escala",
        sinonimos: ["imc", "índice de massa corporal", "massa corporal"],
        campos: [
            { id: "peso",   tipo: "input", label: "Peso",   unidade: "kg", min: 1,   max: 500 },
            { id: "altura", tipo: "input", label: "Altura", unidade: "m",  min: 0.3, max: 2.5 }
        ],
        calculo: {
            formula: "peso / (altura * altura)",
            mostrarFormula: "peso / (altura × altura)"
        },
        referencia: { min: 18.5, max: 24.9 },
        interpretacao: [
            { faixa: [0, 18.4],    status: "baixo",    classificacao: "Abaixo do peso",
              nota: "IMC abaixo do normal. Avaliar estado nutricional e possíveis causas." },
            { faixa: [18.5, 24.9], status: "bom",      classificacao: "Normal",
              nota: "✅ IMC normal. Manter hábitos saudáveis." },
            { faixa: [25, 29.9],   status: "moderado", classificacao: "Sobrepeso",
              nota: "IMC indica sobrepeso. Orientar dieta e atividade física." },
            { faixa: [30, 100],    status: "grave",    classificacao: "Obesidade",
              nota: "⚠️ IMC indica obesidade. Avaliar comorbidades e planejar intervenção multidisciplinar." }
        ]
    },

    /* ====================================================================== */
    /* MAIS ITENS DE TESTE                                                    */
    /* ====================================================================== */
    "Hemoglobina": {
        tipo: "exame",
        sinonimos: ["hb"],
        campos: [
            { id: "valor", tipo: "input", label: "Hemoglobina",
              unidade: "g/dL", min: 0, max: 25 }
        ],
        referencia: { min: 12, max: 16, unidade: "g/dL" },
        interpretacao: [
            { faixa: [0, 11],  status: "baixo",  termo: "Baixa",
              nota: "⚠️ HEMOGLOBINA BAIXA! Avaliar contexto clínico e repetir se necessário." },
            { faixa: [12, 16], status: "normal", termo: "Normal",
              nota: "✅ Hemoglobina dentro da faixa de referência." },
            { faixa: [17, 25], status: "alto",   termo: "Alta",
              nota: "⚠️ HEMOGLOBINA ALTA! Avaliar contexto clínico e repetir se necessário." }
        ]
    },

    "Hepatite B (Painel)": {
        tipo: "exame",
        sinonimos: ["hepatite b", "hbv"],
        campos: [
            { id: "hbsag",    tipo: "select", label: "HBsAg",
              opcoes: [
                  { label: "Positivo", valor: "Positivo" },
                  { label: "Negativo", valor: "Negativo" }
              ]},
            { id: "anti_hbs", tipo: "select", label: "Anti-HBs",
              opcoes: [
                  { label: "Positivo", valor: "Positivo" },
                  { label: "Negativo", valor: "Negativo" }
              ]},
            { id: "anti_hbc", tipo: "select", label: "Anti-HBc",
              opcoes: [
                  { label: "Positivo", valor: "Positivo" },
                  { label: "Negativo", valor: "Negativo" }
              ]},
            { id: "hbeag",    tipo: "select", label: "HBeAg",
              opcoes: [
                  { label: "Positivo", valor: "Positivo" },
                  { label: "Negativo", valor: "Negativo" }
              ]}
        ],
        calculo: { tipo: "padrao", chave: ["hbsag", "anti_hbs", "anti_hbc", "hbeag"] },
        interpretacao: [
            { padrao: { hbsag: "Negativo", anti_hbs: "Positivo", anti_hbc: "Positivo" },
              status: "imune",    termo: "Positivo", classificacao: "Imune (infecção passada)",
              nota: "Imune (infecção passada). Proteção natural." },
            { padrao: { hbsag: "Negativo", anti_hbs: "Positivo", anti_hbc: "Negativo" },
              status: "imune",    termo: "Positivo", classificacao: "Imune (vacina)",
              nota: "Imune (vacina). Proteção garantida pela vacina." },
            { padrao: { hbsag: "Positivo", hbeag: "Positivo" },
              status: "grave",    termo: "Positivo", classificacao: "Hepatite B ativa",
              nota: "⚠️ Hepatite B ativa. ALTA INFECTIVIDADE! Iniciar antiviral. Solicitar carga viral e função hepática." },
            { padrao: { hbsag: "Positivo", hbeag: "Negativo" },
              status: "moderado", termo: "Positivo", classificacao: "Hepatite B crónica inativa",
              nota: "Hepatite B crónica inativa. Baixa infectividade. Repetir perfil em 6 meses." }
        ]
    },

    "Escala de Apgar": {
        tipo: "escala",
        sinonimos: ["apgar"],
        campos: [
            { id: "fc",       tipo: "select", label: "FC Cardíaca",
              opcoes: [
                  { label: "0 (Ausente)",     peso: 0 },
                  { label: "1 (<100 bpm)",    peso: 1 },
                  { label: "2 (>100 bpm)",    peso: 2 }
              ]},
            { id: "resp",     tipo: "select", label: "Respiração",
              opcoes: [
                  { label: "0 (Ausente)",         peso: 0 },
                  { label: "1 (Irregular/lenta)", peso: 1 },
                  { label: "2 (Boa/Choro)",       peso: 2 }
              ]},
            { id: "tonus",    tipo: "select", label: "Tónus Muscular",
              opcoes: [
                  { label: "0 (Flácido)",          peso: 0 },
                  { label: "1 (Alguma flexão)",    peso: 1 },
                  { label: "2 (Movimento ativo)",  peso: 2 }
              ]},
            { id: "reflexos", tipo: "select", label: "Reflexos",
              opcoes: [
                  { label: "0 (Ausente)",          peso: 0 },
                  { label: "1 (Careta)",           peso: 1 },
                  { label: "2 (Choro vigoroso)",   peso: 2 }
              ]},
            { id: "cor",      tipo: "select", label: "Cor da Pele",
              opcoes: [
                  { label: "0 (Azul/pálido)",       peso: 0 },
                  { label: "1 (Cianose periférica)", peso: 1 },
                  { label: "2 (Rosado)",            peso: 2 }
              ]}
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 8, max: 10, label: "Bom" },
        interpretacao: [
            { faixa: [8, 10], status: "bom",      classificacao: "Bom",
              nota: "Apgar normal. Neonato saudável. Pele a peito." },
            { faixa: [5, 7],  status: "moderado", classificacao: "Moderado",
              nota: "Apgar moderado. Reanimação moderada. Monitorizar de perto. Aspirar vias aéreas." },
            { faixa: [0, 4],  status: "grave",    classificacao: "Crítico",
              nota: "⚠️ APGAR CRÍTICO! Reanimação avançada. Risco de vida iminente. Intubar e massagear." }
        ]
    },

    "Clearance de Creatinina (Cockcroft-Gault)": {
        tipo: "escala",
        sinonimos: ["clearance de creatinina", "cockcroft-gault"],
        campos: [
            { id: "idade",      tipo: "input", label: "Idade",      unidade: "anos",  min: 1,   max: 120 },
            { id: "peso",       tipo: "input", label: "Peso",       unidade: "kg",    min: 1,   max: 300 },
            { id: "creatinina", tipo: "input", label: "Creatinina", unidade: "mg/dL", min: 0.1, max: 20 }
        ],
        calculo: {
            formula: "((140 - idade) * peso) / (72 * creatinina)",
            mostrarFormula: "(140 - idade) × peso / (72 × creatinina)"
        },
        referencia: { min: 90, max: 150, label: "Normal" },
        interpretacao: [
            { faixa: [0, 29.9],   status: "grave",    classificacao: "Insuficiência Renal Grave",
              nota: "⚠️ Clearance muito reduzido! Avaliar necessidade de terapia renal substitutiva." },
            { faixa: [30, 59.9],  status: "moderado", classificacao: "Insuficiência Renal Moderada",
              nota: "Clearance reduzido. Ajustar doses de medicamentos." },
            { faixa: [60, 89.9],  status: "leve",     classificacao: "Insuficiência Renal Leve",
              nota: "Clearance levemente reduzido." },
            { faixa: [90, 300],   status: "bom",      classificacao: "Normal",
              nota: "✅ Clearance de creatinina normal." }
        ]
    }
};


/* ==========================================================================
   CONFIGURAÇÃO VISUAL DOS STATUS
   ========================================================================== */
const STATUS_CONFIG = {
    baixo:       { cor: "#f59e0b", icone: "ri-arrow-down-circle-fill", label: "Baixo" },
    normal:      { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Normal" },
    alto:        { cor: "#ef4444", icone: "ri-arrow-up-circle-fill",   label: "Alto" },
    negativo:    { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Negativo" },
    leve:        { cor: "#f59e0b", icone: "ri-alert-fill",             label: "Leve" },
    moderado:    { cor: "#f97316", icone: "ri-alert-fill",             label: "Moderado" },
    grave:       { cor: "#ef4444", icone: "ri-error-warning-fill",     label: "Grave" },
    muito_grave: { cor: "#dc2626", icone: "ri-skull-fill",             label: "Muito Grave" },
    imune:       { cor: "#00843d", icone: "ri-check-double-fill",      label: "Imune" },
    bom:         { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Bom" },
    desconhecido:{ cor: "#94a3b8", icone: "ri-question-line",          label: "Desconhecido" }
};


/* ==========================================================================
   ESTADO GLOBAL
   ========================================================================== */
let itemAtual = null;
let valoresAtuais = {};

const inputSearch = document.getElementById("exame_nome");
const inputValor = document.getElementById("exame_valor");
const uniTag = document.getElementById("unidade_display");
const divSugestoes = document.getElementById("sugestoes_box");
const pResultado = document.getElementById("resultado");
const campoValorContainer = document.getElementById("campo_valor_container");
const camposDinamicosContainer = document.getElementById("campos_dinamicos_container");


/* ==========================================================================
   TEMA
   ========================================================================== */
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

function aplicarTema(tema) {
    if (tema === 'dark') {
        body.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
        localStorage.setItem('tema', 'dark');
    } else {
        body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        if (themeIcon) themeIcon.className = 'ri-moon-line';
        localStorage.setItem('tema', 'light');
    }
}

if (localStorage.getItem('tema') === 'dark') {
    aplicarTema('dark');
} else {
    aplicarTema('light');
}

if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const temaAtual = body.getAttribute('data-theme');
        aplicarTema(temaAtual === 'dark' ? 'light' : 'dark');
    });
}


/* ==========================================================================
   MENU LATERAL
   ========================================================================== */
const btnHamburger = document.getElementById('btnHamburger');
const menuOverlay = document.getElementById('menuOverlay');
const menuLateral = document.getElementById('menuLateral');

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
    btnHamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        menuLateral.classList.contains('ativo') ? fecharMenu() : abrirMenu();
    });
    menuOverlay.addEventListener('click', fecharMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuLateral.classList.contains('ativo')) fecharMenu();
    });
}


/* ==========================================================================
   FECHAR SELECTS AO CLICAR FORA
   ========================================================================== */
function fecharTodosSelects() {
    document.querySelectorAll('.interpretador-select-options.aberto').forEach(options => {
        options.classList.remove('aberto');
        const trigger = options.closest('.interpretador-select-wrapper')?.querySelector('.interpretador-select-trigger');
        if (trigger) trigger.classList.remove('aberto');
    });
}

document.addEventListener('click', function(event) {
    document.querySelectorAll('.interpretador-select-wrapper').forEach(wrapper => {
        if (!wrapper.contains(event.target)) {
            const options = wrapper.querySelector('.interpretador-select-options');
            const trigger = wrapper.querySelector('.interpretador-select-trigger');
            if (options) options.classList.remove('aberto');
            if (trigger) trigger.classList.remove('aberto');
        }
    });
    if (!inputSearch.contains(event.target) && !divSugestoes.contains(event.target)) {
        divSugestoes.style.display = "none";
    }
});


/* ==========================================================================
   CRIAR SELECT PERSONALIZADO
   ========================================================================== */
function criarSelectPersonalizado(campo) {
    const wrapper = document.createElement("div");
    wrapper.className = "interpretador-select-wrapper";
    wrapper.style.marginBottom = "8px";

    const icon = document.createElement("i");
    icon.className = "ri-checkbox-line";
    wrapper.appendChild(icon);

    const group = document.createElement("div");
    group.className = "interpretador-select-group";

    const trigger = document.createElement("div");
    trigger.className = "interpretador-select-trigger";
    trigger.setAttribute("data-campo", campo.id);

    const spanSelecionado = document.createElement("span");
    spanSelecionado.className = "select-selecionado";
    spanSelecionado.textContent = "Selecione";
    trigger.appendChild(spanSelecionado);

    const arrow = document.createElement("i");
    arrow.className = "ri-arrow-down-s-line select-arrow";
    trigger.appendChild(arrow);

    trigger.addEventListener("click", function(e) {
        e.stopPropagation();
        fecharTodosSelects();
        const wrapper = this.closest('.interpretador-select-wrapper');
        const options = wrapper.querySelector('.interpretador-select-options');
        if (!options) return;
        options.classList.toggle('aberto');
        this.classList.toggle('aberto');
    });

    group.appendChild(trigger);

    const label = document.createElement("label");
    label.className = "label-flutuante";
    label.textContent = campo.label;
    group.appendChild(label);

    wrapper.appendChild(group);

    if (campo.unidade) {
        const divider = document.createElement("div");
        divider.className = "interpretador-select-divider";
        wrapper.appendChild(divider);
        const unidadeSpan = document.createElement("span");
        unidadeSpan.className = "interpretador-select-unidade";
        unidadeSpan.textContent = campo.unidade;
        wrapper.appendChild(unidadeSpan);
    }

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "interpretador-select-options";

    campo.opcoes.forEach((opt, idx) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "interpretador-select-option";
        if (idx === 0) optionDiv.classList.add("selecionado");

        const labelSpan = document.createElement("span");
        labelSpan.className = "option-label";
        labelSpan.textContent = opt.label;
        optionDiv.appendChild(labelSpan);

        optionDiv.addEventListener("click", function(e) {
            e.stopPropagation();

            const label = opt.label;
            const parentWrapper = this.closest('.interpretador-select-wrapper');
            const triggerEl = parentWrapper.querySelector('.interpretador-select-trigger');
            const selectedSpan = triggerEl.querySelector('.select-selecionado');
            const optionsContainer = parentWrapper.querySelector('.interpretador-select-options');

            selectedSpan.textContent = label;

            optionsContainer.querySelectorAll('.interpretador-select-option').forEach(o => {
                o.classList.remove('selecionado');
            });
            this.classList.add('selecionado');

            optionsContainer.classList.remove('aberto');
            triggerEl.classList.remove('aberto');

            if (opt.peso !== undefined) {
                valoresAtuais[campo.id] = {
                    label: opt.label,
                    valor: opt.valor !== undefined ? opt.valor : opt.label,
                    peso: opt.peso
                };
            } else {
                valoresAtuais[campo.id] = {
                    label: opt.label,
                    valor: opt.valor !== undefined ? opt.valor : opt.label
                };
            }
        });

        optionsContainer.appendChild(optionDiv);
    });

    wrapper.appendChild(optionsContainer);
    return wrapper;
}


/* ==========================================================================
   CRIAR INPUT PERSONALIZADO
   ========================================================================== */
function criarInputPersonalizado(campo) {
    const wrapper = document.createElement("div");
    wrapper.className = "interpretador-input-wrapper";
    wrapper.style.marginBottom = "8px";

    const icon = document.createElement("i");
    icon.className = "ri-ruler-2-line";
    wrapper.appendChild(icon);

    const group = document.createElement("div");
    group.className = "interpretador-input-group";

    const input = document.createElement("input");
    input.type = "number";
    input.id = campo.id;
    input.placeholder = " ";
    input.step = "0.01";

    if (campo.min !== undefined) input.min = campo.min;
    if (campo.max !== undefined) input.max = campo.max;

    input.addEventListener("input", (e) => {
        const valor = e.target.value;
        if (valor === "") {
            delete valoresAtuais[campo.id];
        } else {
            valoresAtuais[campo.id] = valor;
        }
    });

    group.appendChild(input);

    const label = document.createElement("label");
    label.className = "label-flutuante";
    label.textContent = campo.label;
    group.appendChild(label);

    wrapper.appendChild(group);

    if (campo.unidade) {
        const divider = document.createElement("div");
        divider.className = "interpretador-input-divider";
        wrapper.appendChild(divider);

        const unidadeSpan = document.createElement("span");
        unidadeSpan.className = "interpretador-input-unidade";
        unidadeSpan.textContent = campo.unidade;
        wrapper.appendChild(unidadeSpan);
    }

    return wrapper;
}


/* ==========================================================================
   MOSTRAR CAMPOS DO ITEM
   ========================================================================== */
function mostrarCamposDoItem(item) {
    if (!camposDinamicosContainer) return;

    camposDinamicosContainer.innerHTML = "";
    valoresAtuais = {};

    inputValor.value = "";
    inputValor.removeEventListener("input", handleInputValor);

    if (!item || !item.campos) {
        camposDinamicosContainer.style.display = "none";
        campoValorContainer.style.display = "none";
        return;
    }

    const temMultiplosCampos = item.campos.length > 1;
    const primeiroCampoNumerico = item.campos[0] && item.campos[0].tipo === "input";
    const temCalculo = !!item.calculo;

    if (temMultiplosCampos || !primeiroCampoNumerico || temCalculo) {
        campoValorContainer.style.display = "none";
        camposDinamicosContainer.style.display = "grid";
        camposDinamicosContainer.style.gridTemplateColumns = "1fr 1fr";
        camposDinamicosContainer.style.gap = "8px";
        camposDinamicosContainer.style.width = "100%";
        camposDinamicosContainer.style.marginTop = "10px";

        item.campos.forEach((campo) => {
            let elemento;
            if (campo.tipo === "select") {
                elemento = criarSelectPersonalizado(campo);
            } else {
                elemento = criarInputPersonalizado(campo);
            }
            camposDinamicosContainer.appendChild(elemento);
        });
    } else {
        campoValorContainer.style.display = "flex";
        inputValor.style.display = "flex";
        inputValor.type = "number";
        inputValor.value = "";
        inputValor.id = item.campos[0].id;

        if (item.campos[0].min !== undefined) inputValor.min = item.campos[0].min;
        if (item.campos[0].max !== undefined) inputValor.max = item.campos[0].max;

        camposDinamicosContainer.style.display = "none";

        const primeiroCampo = item.campos[0];
        if (primeiroCampo.unidade) {
            uniTag.textContent = primeiroCampo.unidade;
        } else {
            uniTag.textContent = "--";
        }

        const labelValor = document.querySelector("#campo_valor_container .label-flutuante");
        if (labelValor && primeiroCampo.label) {
            labelValor.textContent = primeiroCampo.label;
        }

        inputValor.removeEventListener("input", handleInputValor);
        inputValor.addEventListener("input", handleInputValor);
    }
}

function handleInputValor(e) {
    if (itemAtual && itemAtual.campos && itemAtual.campos.length === 1) {
        const valor = e.target.value;
        const campoId = itemAtual.campos[0].id;
        if (valor === "") {
            delete valoresAtuais[campoId];
        } else {
            valoresAtuais[campoId] = valor;
        }
    }
}


/* ==========================================================================
   FILTRAR EXAMES — SUGESTÕES
   ========================================================================== */
function filtrarExames() {
    const termo = inputSearch.value.trim().toLowerCase();
    if (!termo) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    const sugestoes = [];

    Object.keys(database).forEach(nome => {
        const config = database[nome];
        const tipo = config.tipo;

        sugestoes.push({
            texto: nome,
            nomeAlvo: nome,
            tipo: tipo
        });

        (config.sinonimos || []).forEach(sin => {
            sugestoes.push({
                texto: sin,
                nomeAlvo: nome,
                tipo: tipo
            });
        });
    });

    const filtrados = sugestoes.filter(s => {
        const textoLower = s.texto.toLowerCase();
        if (textoLower.includes(termo)) return true;
        const palavrasTermo = termo.split(' ').filter(Boolean);
        const palavrasTexto = textoLower.split(' ').filter(Boolean);
        return palavrasTermo.some(tp =>
            palavrasTexto.some(t => t.includes(tp) || tp.includes(t))
        );
    });

    if (filtrados.length === 0) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    const vistos = new Set();
    const unicos = filtrados.filter(s => {
        const chave = `${s.tipo}|${s.texto}|${s.nomeAlvo}`;
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
    });

    mostrarSugestoes(unicos.slice(0, 10), termo);
}


/* ==========================================================================
   MOSTRAR SUGESTÕES — Badge pill colorido
   ========================================================================== */
function mostrarSugestoes(itens, termo) {
    divSugestoes.innerHTML = "";
    divSugestoes.style.display = "block";

    itens.forEach(item => {
        const div = document.createElement("div");
        div.className = "sugestao-item";

        const badge = document.createElement("span");
        badge.className = `sugestao-badge ${item.tipo}`;
        badge.textContent = item.tipo === "exame" ? "EXAME" : "ESCALA";

        const texto = document.createElement("span");
        texto.className = "sugestao-texto";
        texto.innerHTML = destacarTexto(item.texto, termo);

        div.appendChild(badge);
        div.appendChild(texto);

        div.addEventListener("click", () => {
            inputSearch.value = item.nomeAlvo;
            carregarItem(item.nomeAlvo);
            divSugestoes.style.display = "none";
        });

        divSugestoes.appendChild(div);
    });
}


/* ==========================================================================
   DESTACAR TEXTO
   ========================================================================== */
function destacarTexto(texto, termo) {
    if (!termo || !texto) return texto;
    const termoEscapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${termoEscapado})`, 'gi');
    return texto.replace(regex, '<strong style="font-weight: 700; color: var(--primary);">$1</strong>');
}


/* ==========================================================================
   CARREGAR ITEM
   ========================================================================== */
function carregarItem(nome) {
    const config = database[nome];
    if (!config) return;

    valoresAtuais = {};
    inputValor.value = "";

    itemAtual = { nome, ...config };

    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) {
        labelBusca.textContent = config.tipo === "exame" ? "Exame" : "Escala";
    }

    if (camposDinamicosContainer) {
        camposDinamicosContainer.innerHTML = "";
    }

    mostrarCamposDoItem(config);

    pResultado.innerHTML = "";
    pResultado.style.display = "none";
}


/* ==========================================================================
   OBTER VALORES PREENCHIDOS
   ========================================================================== */
function getValoresPreenchidos() {
    const valores = {};
    let todosPreenchidos = true;
    let camposVazios = [];

    if (!itemAtual || !itemAtual.campos) {
        return { valores, todosPreenchidos: false, camposVazios: ['Nenhum campo disponível'] };
    }

    const temCamposDinamicos = camposDinamicosContainer &&
                               camposDinamicosContainer.children.length > 0 &&
                               camposDinamicosContainer.style.display !== "none";

    if (temCamposDinamicos) {
        for (const campo of itemAtual.campos) {
            let valor = valoresAtuais[campo.id];

            if (typeof valor === 'object' && valor !== null) {
                if (valor.valor === undefined || valor.valor === null || valor.valor === "") {
                    todosPreenchidos = false;
                    camposVazios.push(campo.label);
                } else {
                    valores[campo.id] = valor;
                }
            } else {
                if (valor === undefined || valor === null || valor === "") {
                    todosPreenchidos = false;
                    camposVazios.push(campo.label);
                } else {
                    valores[campo.id] = valor;
                }
            }
        }
    } else {
        const valor = inputValor.value.trim();
        const campo = itemAtual.campos[0];

        if (!valor || valor === "") {
            todosPreenchidos = false;
            camposVazios.push(campo.label);
        } else {
            valores[campo.id] = valor;
        }
    }

    return { valores, todosPreenchidos, camposVazios };
}


/* ==========================================================================
   CALCULAR FORMULA (segura)
   ========================================================================== */
function calcularFormula(formula, valores, campos) {
    const nomes = campos.map(c => c.id);

    const funcoesPermitidas = [
        'Math.sqrt', 'Math.pow', 'Math.log10', 'Math.log', 'Math.abs',
        'Math.min', 'Math.max', 'Math.round', 'Math.floor', 'Math.ceil',
        'Math.exp', 'Math.PI'
    ];

    let sobra = formula;
    for (const termo of funcoesPermitidas) sobra = sobra.split(termo).join(' ');
    for (const nome of nomes) sobra = sobra.split(nome).join(' ');

    if (!/^[\d\s+\-*/().,]*$/.test(sobra)) {
        console.error("Fórmula contém termos não permitidos:", formula);
        return null;
    }

    const args = nomes.map(nome => parseFloat(valores[nome]));
    if (args.some(v => isNaN(v))) return null;

    try {
        const fn = new Function(...nomes, `return (${formula});`);
        const resultado = fn(...args);
        return (typeof resultado === 'number' && isFinite(resultado)) ? resultado : null;
    } catch (erro) {
        console.error("Erro ao calcular fórmula:", erro);
        return null;
    }
}


/* ==========================================================================
   VALIDAR LIMITES POR CAMPO
   ========================================================================== */
function campoForaDoLimite(valores, campos) {
    for (const campo of campos) {
        if (campo.min === undefined && campo.max === undefined) continue;
        const valor = parseFloat(valores[campo.id]);
        if (isNaN(valor)) continue;
        if (campo.min !== undefined && valor < campo.min) {
            return { campo, valor, limite: campo.min, direcao: "baixo" };
        }
        if (campo.max !== undefined && valor > campo.max) {
            return { campo, valor, limite: campo.max, direcao: "alto" };
        }
    }
    return null;
}

function mensagemCampoForaDoLimite(violacao) {
    const tipoLimite = violacao.direcao === "baixo" ? "mínimo" : "máximo";
    const unidade = violacao.campo.unidade ? ` ${violacao.campo.unidade}` : "";
    return `⚠️ ${violacao.campo.label} fora do limite (${tipoLimite} ${violacao.limite}${unidade}). Verifique o valor inserido.`;
}


/* ==========================================================================
   CALCULAR VALOR FINAL
   ========================================================================== */
function calcularValorFinal(config, valores) {
    if (!config.calculo) {
        const primeiroCampo = config.campos[0];
        const v = valores[primeiroCampo.id];
        if (v && typeof v === "object") return v.valor;
        return isNaN(parseFloat(v)) ? null : parseFloat(v);
    }

    const calc = config.calculo;

    if (calc.tipo === "soma_pesos") {
        let soma = 0;
        for (const campo of config.campos) {
            const v = valores[campo.id];
            if (v && typeof v === "object" && v.peso !== undefined) {
                soma += v.peso;
            }
        }
        return soma;
    }

    if (calc.formula) {
        return calcularFormula(calc.formula, valores, config.campos);
    }

    if (calc.tipo === "padrao") {
        const padrao = {};
        for (const chave of calc.chave) {
            const v = valores[chave];
            if (v && typeof v === "object") padrao[chave] = v.valor;
            else padrao[chave] = v;
        }
        return padrao;
    }

    return null;
}


/* ==========================================================================
   ENCONTRAR INTERPRETAÇÃO
   ========================================================================== */
function encontrarInterpretacao(config, valorFinal) {
    const lista = config.interpretacao || [];

    if (valorFinal && typeof valorFinal === "object" && !Array.isArray(valorFinal)) {
        for (const item of lista) {
            if (!item.padrao) continue;
            let ok = true;
            for (const [k, v] of Object.entries(item.padrao)) {
                if (valorFinal[k] !== v) { ok = false; break; }
            }
            if (ok) return item;
        }
        return null;
    }

    const num = parseFloat(valorFinal);
    if (isNaN(num)) return null;

    for (const item of lista) {
        if (!item.faixa) continue;
        if (num >= item.faixa[0] && num <= item.faixa[1]) return item;
    }
    return null;
}


/* ==========================================================================
   VERIFICAR LIMITES GLOBAIS
   ========================================================================== */
function validarLimitesGlobais(config, valorFinal) {
    if (typeof valorFinal !== "number") return null;
    const limites = config.limites;
    if (!limites) return null;
    if (valorFinal < limites.min || valorFinal > limites.max) {
        const direcao = valorFinal < limites.min ? "BAIXO" : "ALTO";
        return `⚠️ VALOR EXTREMAMENTE ${direcao}! Fora dos limites clinicamente esperados (${limites.min} - ${limites.max}). Verificar resultado.`;
    }
    return null;
}


/* ==========================================================================
   INFERIR CATEGORIA UNIVERSAL (só para escalas)
   Regra: se está dentro da referência → NORMAL, abaixo → BAIXO, acima → ALTO
   ========================================================================== */
function inferirCategoriaEscala(valorFinal, config) {
    if (typeof valorFinal !== "number") return "NORMAL";
    const ref = config.referencia;
    if (!ref) return "NORMAL";
    if (valorFinal < ref.min) return "BAIXO";
    if (valorFinal > ref.max) return "ALTO";
    return "NORMAL";
}

/* ==========================================================================
   INFERIR CATEGORIA UNIVERSAL
   --------------------------------------------------------------------------
   Regra:
     - SE tem referência E NÃO tem estágios (leve/moderado/grave/muito_grave)
         → usa a referência: valor < min → BAIXO | > max → ALTO | senão NORMAL
     - SENÃO (exame classificado ou escala)
         → mapeia pelo status
   ========================================================================== */
function inferirCategoriaUniversal(valorFinal, config, status) {
    // Deteta se o item tem estágios (exame classificado / escala)
    const temEstagios = (config.interpretacao || []).some(i =>
        i.status === "leve" ||
        i.status === "moderado" ||
        i.status === "grave" ||
        i.status === "muito_grave"
    );

    const temReferencia = !!config.referencia;

    // Objeto (padrão sorológico) → mapeia pelo status
    if (valorFinal && typeof valorFinal === "object") {
        return mapearStatus(status);
    }

    // Exame simples (tem referência E NÃO tem estágios) → usa referência
    if (
        typeof valorFinal === "number" &&
        !isNaN(valorFinal) &&
        temReferencia &&
        !temEstagios
    ) {
        if (valorFinal < config.referencia.min) return "BAIXO";
        if (valorFinal > config.referencia.max) return "ALTO";
        return "NORMAL";
    }

    // Escala com referência e sem estágios → mesma lógica
    if (
        typeof valorFinal === "number" &&
        !isNaN(valorFinal) &&
        temReferencia &&
        config.tipo === "escala"
    ) {
        if (valorFinal < config.referencia.min) return "BAIXO";
        if (valorFinal > config.referencia.max) return "ALTO";
        return "NORMAL";
    }

    // Tudo o resto → mapeia pelo status
    return mapearStatus(status);
}

function mapearStatus(status) {
    switch (status) {
        case "negativo":    return "NEGATIVO";
        case "imune":       return "POSITIVO";
        case "baixo":       return "BAIXO";
        case "normal":      return "NORMAL";
        case "alto":        return "ALTO";
        case "bom":         return "NORMAL";
        case "leve":        return "LEVE";
        case "moderado":    return "MODERADO";
        case "grave":       return "GRAVE";
        case "muito_grave": return "MUITO GRAVE";
        default:            return "NORMAL";
    }
}


/* ==========================================================================
   EXIBIR RESULTADO
   ========================================================================== */
function exibirResultado(resultado, config) {
    if (!resultado) {
        mostrarErro("Erro ao interpretar os dados.");
        return;
    }

    const configStatus = STATUS_CONFIG[resultado.status] || STATUS_CONFIG.desconhecido;
    let statusCor = configStatus.cor;
    let statusIcone = configStatus.icone;

    // ========== VALOR PRINCIPAL ==========
    let valorDisplay = "—";
    let unidadeDisplay = "";
    const tipo = config.tipo;

    if (typeof resultado.valorOriginal === "number") {
        valorDisplay = Number.isInteger(resultado.valorOriginal)
            ? resultado.valorOriginal.toString()
            : resultado.valorOriginal.toFixed(1);
    } else if (resultado.valorOriginal !== undefined) {
        valorDisplay = resultado.valorOriginal;
    }

    if (resultado.unidade) unidadeDisplay = resultado.unidade;
    else if (tipo === "escala" && config.calculo && config.calculo.tipo === "soma_pesos") {
        unidadeDisplay = "pontos";
    }

    // ========== TEXTO DO CARD ESQUERDO ==========
    const statusLabel = inferirCategoriaUniversal(
        resultado.valorOriginal,
        config,
        resultado.status
    );

    // ========== INFO ESQUERDA (referência) ==========
    let infoEsquerda = "";
    if (config.referencia) {
        const refLabel = config.referencia.label || "Referência";
        const unidadeRef = config.referencia.unidade ? ` ${config.referencia.unidade}` : "";
        infoEsquerda = `${refLabel}: ${config.referencia.min} - ${config.referencia.max}${unidadeRef}`;
    }

    // ========== INFO DIREITA (termo técnico) ==========
    let infoDireita = "";
    if (resultado.termo && resultado.classificacao) {
        infoDireita = resultado.classificacao;
    } else if (resultado.termo) {
        infoDireita = resultado.termo;
    } else if (resultado.classificacao) {
        infoDireita = resultado.classificacao;
    }

    // ========== BARRA DE PROGRESSO ==========
    // Regras:
    //   BAIXO → amarela, curta (10%)
    //   NORMAL → verde, posicionada conforme o valor no intervalo
    //   ALTO → vermelha, cheia (100%)
    let percentualBarra = 0;
    let corBarra = statusCor;
    let mostrarBarra = false;

    const statusLower = (resultado.status || "").toLowerCase();

    // Deteta se é "baixo" pelo label (para exames simples com referência)
    const ehBaixo = statusLower === "baixo" || statusLabel === "BAIXO";
    const ehAlto  = statusLower === "alto"  || statusLabel === "ALTO";
    const ehNormal = statusLower === "normal" ||
                     statusLower === "bom"    ||
                     statusLower === "negativo" ||
                     statusLower === "imune"  ||
                     statusLabel === "NORMAL"  ||
                     statusLabel === "NEGATIVO";

    if (ehBaixo) {
        mostrarBarra = true;
        percentualBarra = 10;
        corBarra = "#f59e0b"; // amarelo
    } else if (ehAlto) {
        mostrarBarra = true;
        percentualBarra = 100;
        corBarra = "#ef4444"; // vermelho
    } else if (ehNormal && typeof resultado.valorOriginal === "number" && config.referencia) {
        mostrarBarra = true;
        const refMin = config.referencia.min;
        const refMax = config.referencia.max;
        const intervalo = refMax - refMin;

        if (intervalo > 0) {
            percentualBarra = ((resultado.valorOriginal - refMin) / intervalo) * 100;
            percentualBarra = Math.max(20, Math.min(95, percentualBarra));
        } else {
            percentualBarra = 50;
        }
        // Verde com ligeira variação conforme posição
        const intensidade = percentualBarra / 100;
        const r = Math.round(74 - (74 - 0) * intensidade);
        const g = Math.round(222 - (222 - 132) * intensidade);
        const b = Math.round(128 - (128 - 61) * intensidade);
        corBarra = `rgb(${r}, ${g}, ${b})`;
    } else if (ehNormal) {
        // Normal sem referência (perfis, etc.)
        mostrarBarra = true;
        percentualBarra = 50;
        corBarra = "#00843d";
    } else if (typeof resultado.valorOriginal === "number" && !isNaN(resultado.valorOriginal)) {
        // Fallback (ex.: gravidade sem ser baixo/alto/normal)
        const todasFaixas = (config.interpretacao || [])
            .filter(i => Array.isArray(i.faixa))
            .map(i => i.faixa);

        if (todasFaixas.length > 0) {
            const minGeral = Math.min(...todasFaixas.map(f => f[0]));
            const maxGeral = Math.max(...todasFaixas.map(f => f[1]));
            const intervalo = maxGeral - minGeral;

            if (intervalo > 0) {
                percentualBarra = ((resultado.valorOriginal - minGeral) / intervalo) * 100;
                percentualBarra = Math.max(2, Math.min(98, percentualBarra));
                mostrarBarra = true;
            }
        }
    }

    // ========== CLASSE DA NOTA ==========
    let notaClasse = "normal";
    if (resultado.status === "baixo" || resultado.status === "leve" || resultado.status === "moderado") {
        notaClasse = "alerta";
    } else if (resultado.status === "alto" || resultado.status === "grave" || resultado.status === "muito_grave") {
        notaClasse = "critico";
    }

    // ========== MONTA CARD ==========
    let html = `
        <div class="interpretador-card" style="background: var(--card-bg); border-radius: 20px; padding: 20px 22px;">
            <div class="interpretador-card-header">
                <div class="interpretador-card-status" style="color: ${statusCor};">
                    <i class="${statusIcone}"></i>
                    <span class="status-label">${statusLabel}</span>
                </div>
                <div class="interpretador-card-valor" style="color: ${statusCor};">
                    <span class="valor-numero">${valorDisplay}</span>${unidadeDisplay ? `<span class="valor-unidade"> ${unidadeDisplay}</span>` : ''}
                </div>
            </div>

            <div class="interpretador-card-sub">
                <span class="interpretador-card-referencia">${infoEsquerda}</span>
                <span class="interpretador-card-termo">${infoDireita}</span>
            </div>
    `;

    if (mostrarBarra) {
        html += `
            <div class="interpretador-card-bar-wrapper">
                <div class="interpretador-card-bar">
                    <div class="interpretador-card-bar-fill" style="width: ${percentualBarra}%; background: ${corBarra};"></div>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="interpretador-card-bar-wrapper">
                <div class="interpretador-card-bar vazia">
                    <div class="interpretador-card-bar-fill" style="width: 0%;"></div>
                </div>
            </div>
        `;
    }

    html += `
            <div class="interpretador-card-nota ${notaClasse}">
                ${resultado.nota}
            </div>
        </div>
    `;

    pResultado.innerHTML = html;
    pResultado.style.display = "block";
    animarResultado();
}


/* ==========================================================================
   INTERPRETAR (motor unificado)
   ========================================================================== */
function interpretar(config, valores) {
    const valorFinal = calcularValorFinal(config, valores);

    if (valorFinal === null) return null;

    const erroLimites = validarLimitesGlobais(config, valorFinal);
    if (erroLimites) {
        return {
            status: "desconhecido",
            nota: erroLimites,
            valorOriginal: valorFinal,
            unidade: config.campos[0]?.unidade || config.referencia?.unidade || ""
        };
    }

    const interpretacao = encontrarInterpretacao(config, valorFinal);

    if (!interpretacao) {
        return {
            status: "desconhecido",
            nota: "Valor não se enquadra em nenhuma categoria conhecida. Verificar resultado.",
            valorOriginal: valorFinal,
            unidade: config.campos[0]?.unidade || config.referencia?.unidade || ""
        };
    }

    return {
        status: interpretacao.status,
        nota: interpretacao.nota,
        termo: interpretacao.termo || null,
        classificacao: interpretacao.classificacao || null,
        valorOriginal: valorFinal,
        unidade: config.campos[0]?.unidade || config.referencia?.unidade || ""
    };
}


/* ==========================================================================
   ANALISAR
   ========================================================================== */
function analisar() {
    const nome = inputSearch.value.trim();

    if (!nome) {
        mostrarErro("⚠️ Pesquise um exame ou escala!");
        return;
    }

    const config = database[nome];
    if (!config) {
        mostrarErro(`⚠️ "${nome}" não encontrado na base de dados!`);
        return;
    }

    if (!itemAtual || itemAtual.nome !== nome) {
        carregarItem(nome);
        setTimeout(() => executarAnalise(config), 150);
    } else {
        executarAnalise(config);
    }
}


function executarAnalise(config) {
    const { valores, todosPreenchidos, camposVazios } = getValoresPreenchidos();

    if (!todosPreenchidos) {
        mostrarErro(`⚠️ Preencha todos os campos: ${camposVazios.join(', ')}.`);
        return;
    }

    const violacao = campoForaDoLimite(valores, config.campos);
    if (violacao) {
        mostrarErro(mensagemCampoForaDoLimite(violacao));
        return;
    }

    try {
        const resultado = interpretar(config, valores);

        if (!resultado) {
            mostrarErro("⚠️ Não foi possível interpretar os dados. Verifique os valores.");
            return;
        }

        exibirResultado(resultado, config);

    } catch (error) {
        console.error("Erro na análise:", error);
        mostrarErro("⚠️ Ocorreu um erro ao interpretar os dados. Tente novamente.");
    }
}


/* ==========================================================================
   MOSTRAR ERRO
   ========================================================================== */
function mostrarErro(mensagem) {
    pResultado.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border-radius: 20px; padding: 20px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2);">
            <i class="ri-error-warning-fill" style="font-size: 2.5rem; color: #ef4444; display: block; margin-bottom: 10px;"></i>
            <span style="color: var(--text); font-weight: 500; font-size: 0.95rem;">${mensagem}</span>
        </div>
    `;
    pResultado.style.display = "block";
    animarResultado();
}


/* ==========================================================================
   ANIMAR RESULTADO
   ========================================================================== */
function animarResultado() {
    if (!pResultado) return;
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");
}


/* ==========================================================================
   LIMPAR
   ========================================================================== */
function limpar() {
    inputSearch.value = "";

    divSugestoes.style.display = "none";
    divSugestoes.innerHTML = "";

    inputValor.value = "";
    inputValor.removeEventListener("input", handleInputValor);
    campoValorContainer.style.display = "none";
    uniTag.textContent = "--";

    if (camposDinamicosContainer) {
        camposDinamicosContainer.innerHTML = "";
        camposDinamicosContainer.style.display = "none";
    }

    pResultado.innerHTML = "";
    pResultado.style.display = "none";
    pResultado.classList.remove("vibrar");

    valoresAtuais = {};
    itemAtual = null;

    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) {
        labelBusca.textContent = "Exame ou Escala";
    }

    fecharTodosSelects();

    setTimeout(() => inputSearch.focus(), 100);
}


/* ==========================================================================
   EVENTOS
   ========================================================================== */
let timeoutBusca = null;

inputSearch.addEventListener("input", function(e) {
    if (timeoutBusca) clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(() => filtrarExames(), 250);
});

inputSearch.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const primeiroItem = divSugestoes.querySelector('.sugestao-item');
        if (primeiroItem) {
            primeiroItem.click();
        } else {
            const nome = inputSearch.value.trim();
            if (nome && database[nome]) {
                carregarItem(nome);
                setTimeout(() => analisar(), 150);
            } else {
                analisar();
            }
        }
    }
});

document.getElementById("btnAnalisar").addEventListener("click", function(e) {
    e.preventDefault();
    analisar();
});

document.getElementById("btnLimpar").addEventListener("click", function(e) {
    e.preventDefault();
    limpar();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharTodosSelects();
        divSugestoes.style.display = "none";
    }
});


/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
function inicializar() {
    console.log("🚀 Interpretador Clínico v2 — Exames & Escalas");

    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) labelBusca.textContent = "Exame ou Escala";

    if (camposDinamicosContainer) {
        camposDinamicosContainer.style.display = "none";
        camposDinamicosContainer.innerHTML = "";
    }

    if (campoValorContainer) campoValorContainer.style.display = "none";

    if (pResultado) {
        pResultado.innerHTML = "";
        pResultado.style.display = "none";
    }

    if (uniTag) uniTag.textContent = "--";

    valoresAtuais = {};
    itemAtual = null;

    const urlParams = new URLSearchParams(window.location.search);
    const itemParam = urlParams.get('item');
    if (itemParam && database[itemParam]) {
        setTimeout(() => {
            inputSearch.value = itemParam;
            carregarItem(itemParam);
            setTimeout(() => analisar(), 200);
        }, 500);
    }

    console.log(`✅ ${Object.keys(database).length} itens disponíveis.`);
    console.log(`📋 Exames: ${Object.values(database).filter(i => i.tipo === 'exame').length} | Escalas: ${Object.values(database).filter(i => i.tipo === 'escala').length}`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}


/* ==========================================================================
   DEBUG
   ========================================================================== */
window.__interpretador = {
    database,
    itemAtual: () => itemAtual,
    valoresAtuais: () => valoresAtuais,
    analisar,
    limpar,
    carregarItem,
    fecharTodosSelects
};
console.log("📌 Debug: window.__interpretador");





