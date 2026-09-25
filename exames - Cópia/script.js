/* ==========================================================================
   INTERPRETADOR CLÍNICO v2 — MOTOR UNIFICADO
   Exames + Escalas. Uma só base de dados. Um só motor.
   ========================================================================== */

/* ==========================================================================
   BASE DE DADOS
   --------------------------------------------------------------------------
   Cada item tem APENAS:
     tipo           → "exame" | "escala"
     sinonimos      → array de strings (aparecem na pesquisa)
     campos         → o que o utilizador preenche
     calculo        → COMO chegar ao valor final (opcional)
     referencia     → o que é "normal" (opcional)
     interpretacao  → como classificar (obrigatório)
   ========================================================================== */
const database = {

    /* ---------------------------------------------------------------------- */
    /* EXAME SIMPLES                                                          */
    /* ---------------------------------------------------------------------- */
    "Glicémia (Jejum)": {
        tipo: "exame",
        sinonimos: ["glicemia", "glucose", "açúcar no sangue"],
        campos: [
            { id: "valor", tipo: "input", label: "Resultado", unidade: "mg/dL",
              min: 0, max: 999 }
        ],
        referencia: { min: 70, max: 99, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 69],      status: "baixo",   termo: "Hipoglicemia",
              nota: "Glicemia baixa. Risco de hipoglicemia. Oferecer 15g de açúcar de absorção rápida e repetir glicemia em 15 minutos." },
            { faixa: [70, 99],     status: "normal",  termo: "Normoglicemia",
              nota: "Glicemia normal. Manter estilo de vida saudável e medicações conforme prescrição." },
            { faixa: [100, 999],   status: "alto",    termo: "Hiperglicemia",
              nota: "Glicemia alta. Avaliar adesão à medicação e regime alimentar. Considerar ajuste de insulina/antidiabético oral." }
        ]
    },

    /* ---------------------------------------------------------------------- */
    /* EXAME SIMPLES                                                          */
    /* ---------------------------------------------------------------------- */
    "Creatinina": {
        tipo: "exame",
        sinonimos: ["creat"],
        campos: [
            { id: "valor", tipo: "input", label: "Resultado", unidade: "mg/dL",
              min: 0, max: 20 }
        ],
        referencia: { min: 0.6, max: 1.2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 0.5],     status: "baixo",  termo: "Creatinina baixa",
              nota: "Creatinina baixa. Geralmente sem significado clínico, pode ocorrer em sarcopenia ou desnutrição." },
            { faixa: [0.6, 1.2],   status: "normal", termo: "Função renal normal",
              nota: "Função renal preservada." },
            { faixa: [1.3, 20],    status: "alto",   termo: "Insuficiência renal",
              nota: "Creatinina alta. Possível lesão renal. Calcular TFG. Avaliar hidratação e medicamentos nefrotóxicos." }
        ]
    },

    /* ---------------------------------------------------------------------- */
    /* EXAME CLASSIFICADO (ex-diagnóstico)                                    */
    /* ---------------------------------------------------------------------- */
    "Malária": {
        tipo: "exame",
        sinonimos: ["malaria", "paludismo"],
        campos: [
            { id: "parasitemia", tipo: "input", label: "Parasitémia", unidade: "/µL",
              min: 0, max: 9999999 }
        ],
        interpretacao: [
            { faixa: [0, 0],             status: "negativo",     termo: "Negativo",
              nota: "Malária negativa. Descartar infecção." },
            { faixa: [1, 999],           status: "leve",         termo: "Leve",
              nota: "Malária leve. Tratamento ambulatorial com Arteméter-Lumefantrina por 3 dias." },
            { faixa: [1000, 9999],       status: "moderado",     termo: "Moderada",
              nota: "Malária moderada. Internação. Hemograma completo + função renal." },
            { faixa: [10000, 99999],     status: "grave",        termo: "Grave",
              nota: "MALÁRIA GRAVE! UCI. Arteméter IV + monitorizar glicemia a cada 6h." },
            { faixa: [100000, 9999999],  status: "muito_grave",  termo: "Muito Grave",
              nota: "MALÁRIA MUITO GRAVE! UCI urgente. Transfusão + artesunato IV + glicose 50%." }
        ]
    },

    /* ---------------------------------------------------------------------- */
    /* EXAME COM PADRÃO (perfil sorológico)                                   */
    /* ---------------------------------------------------------------------- */
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
              status: "grave",    classificacao: "Infecção Aguda",
              nota: "Perfil sugestivo de infecção aguda. Notificar se aplicável e iniciar conduta clínica adequada." },
            { padrao: { igm: "Reagente", igg: "Reagente" },
              status: "moderado", classificacao: "Infecção Recente/em Evolução",
              nota: "Perfil sugestivo de infecção recente ou em fase de soroconversão. Repetir sorologia em 2-3 semanas." },
            { padrao: { igm: "Não Reagente", igg: "Reagente" },
              status: "imune",    classificacao: "Infecção Pregressa/Imunidade",
              nota: "Perfil sugestivo de contacto prévio ou imunidade. Sem sinais de infecção ativa." },
            { padrao: { igm: "Não Reagente", igg: "Não Reagente" },
              status: "negativo", classificacao: "Negativo/Susceptível",
              nota: "Sorologia negativa. Paciente susceptível; considerar vacinação se disponível e indicada." }
        ]
    },

    /* ---------------------------------------------------------------------- */
    /* ESCALA DE PONTUAÇÃO (soma de pesos)                                    */
    /* ---------------------------------------------------------------------- */
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
                  { label: "1 (Nenhuma)",  peso: 1 },
                  { label: "2 (Sons)",     peso: 2 },
                  { label: "3 (Palavras)", peso: 3 },
                  { label: "4 (Confuso)",  peso: 4 },
                  { label: "5 (Orientado)",peso: 5 }
              ]},
            { id: "motora", tipo: "select", label: "Resposta Motora",
              opcoes: [
                  { label: "1 (Nenhuma)",   peso: 1 },
                  { label: "2 (Extensão)",  peso: 2 },
                  { label: "3 (Flexão)",    peso: 3 },
                  { label: "4 (Retirada)",  peso: 4 },
                  { label: "5 (Localiza)",  peso: 5 },
                  { label: "6 (Obedece)",   peso: 6 }
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
              nota: "LESÃO CEREBRAL GRAVE! UCI/Intubação. COMA! Proteger via aérea. Considerar intubação." }
        ]
    },

    /* ---------------------------------------------------------------------- */
    /* ESCALA CALCULADA (fórmula)                                             */
    /* ---------------------------------------------------------------------- */
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
            { faixa: [0, 18.4],  status: "baixo",    classificacao: "Abaixo do peso",
              nota: "IMC abaixo do normal. Avaliar estado nutricional e possíveis causas." },
            { faixa: [18.5, 24.9], status: "bom",    classificacao: "Normal",
              nota: "IMC normal. Manter hábitos saudáveis." },
            { faixa: [25, 29.9], status: "moderado", classificacao: "Sobrepeso",
              nota: "IMC indica sobrepeso. Orientar dieta e atividade física." },
            { faixa: [30, 100],  status: "grave",    classificacao: "Obesidade",
              nota: "IMC indica obesidade. Avaliar comorbidades e planear intervenção multidisciplinar." }
        ]
    },

    /* ---------------------------------------------------------------------- */
    /* ESCALA CALCULADA (fórmula com função matemática)                       */
    /* ---------------------------------------------------------------------- */
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
            { faixa: [0, 29.9],  status: "grave",    classificacao: "Insuficiência Renal Grave",
              nota: "Clearance muito reduzido. Avaliar necessidade de terapia renal substitutiva." },
            { faixa: [30, 59.9], status: "moderado", classificacao: "Insuficiência Renal Moderada",
              nota: "Clearance reduzido. Ajustar doses de medicamentos." },
            { faixa: [60, 89.9], status: "leve",     classificacao: "Insuficiência Renal Leve",
              nota: "Clearance levemente reduzido." },
            { faixa: [90, 300],  status: "bom",      classificacao: "Normal",
              nota: "Clearance de creatinina normal." }
        ]
    }
};


/* ==========================================================================
   CONFIGURAÇÃO VISUAL DOS STATUS
   ========================================================================== */
const STATUS_CONFIG = {
    baixo:       { cor: "#f59e0b", icone: "ri-arrow-down-circle-fill", label: "Baixo",       classe: "alerta"  },
    normal:      { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Normal",      classe: "normal"  },
    alto:        { cor: "#ef4444", icone: "ri-arrow-up-circle-fill",   label: "Alto",        classe: "critico" },
    negativo:    { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Negativo",    classe: "normal"  },
    leve:        { cor: "#f59e0b", icone: "ri-alert-fill",             label: "Leve",        classe: "alerta"  },
    moderado:    { cor: "#f97316", icone: "ri-alert-fill",             label: "Moderado",    classe: "alerta"  },
    grave:       { cor: "#ef4444", icone: "ri-error-warning-fill",     label: "Grave",       classe: "critico" },
    muito_grave: { cor: "#dc2626", icone: "ri-skull-fill",             label: "Muito Grave", classe: "critico" },
    imune:       { cor: "#00843d", icone: "ri-check-double-fill",      label: "Imune",       classe: "normal"  },
    bom:         { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Bom",         classe: "normal"  }
};


/* ==========================================================================
   ESTADO GLOBAL
   ========================================================================== */
let itemAtual = null;
let valoresAtuais = {};

/* Elementos do DOM */
const inputSearch = document.getElementById("exame_nome");
const inputValor = document.getElementById("exame_valor");
const uniTag = document.getElementById("unidade_display");
const labelValor = document.getElementById("label_valor");
const divSugestoes = document.getElementById("sugestoes_box");
const pResultado = document.getElementById("resultado");
const campoValorContainer = document.getElementById("campo_valor_container");
const camposDinamicosContainer = document.getElementById("campos_dinamicos_container");


/* ==========================================================================
   TEMA
   ========================================================================== */
const body = document.body;
const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");

function aplicarTema(tema) {
    if (tema === "dark") {
        body.setAttribute("data-theme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        if (themeIcon) themeIcon.className = "ri-sun-line";
        localStorage.setItem("tema", "dark");
    } else {
        body.removeAttribute("data-theme");
        document.documentElement.removeAttribute("data-theme");
        if (themeIcon) themeIcon.className = "ri-moon-line";
        localStorage.setItem("tema", "light");
    }
}

if (localStorage.getItem("tema") === "dark") {
    aplicarTema("dark");
} else {
    aplicarTema("light");
}

if (themeBtn) {
    themeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const atual = body.getAttribute("data-theme");
        aplicarTema(atual === "dark" ? "light" : "dark");
    });
}


/* ==========================================================================
   MENU LATERAL
   ========================================================================== */
const btnHamburger = document.getElementById("btnHamburger");
const menuOverlay = document.getElementById("menuOverlay");
const menuLateral = document.getElementById("menuLateral");

function abrirMenu() {
    btnHamburger.classList.add("ativo");
    menuOverlay.classList.add("ativo");
    menuLateral.classList.add("ativo");
    document.body.style.overflow = "hidden";
}
function fecharMenu() {
    btnHamburger.classList.remove("ativo");
    menuOverlay.classList.remove("ativo");
    menuLateral.classList.remove("ativo");
    document.body.style.overflow = "";
}

if (btnHamburger && menuOverlay && menuLateral) {
    btnHamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        menuLateral.classList.contains("ativo") ? fecharMenu() : abrirMenu();
    });
    menuOverlay.addEventListener("click", fecharMenu);
}


/* ==========================================================================
   UTILITÁRIOS
   ========================================================================== */
function fecharTodosSelects() {
    document.querySelectorAll(".campo-select-options.aberto").forEach((opt) => {
        opt.classList.remove("aberto");
        const trigger = opt.closest(".campo-select-wrapper")?.querySelector(".campo-select-trigger");
        if (trigger) trigger.classList.remove("aberto");
    });
}

document.addEventListener("click", (event) => {
    document.querySelectorAll(".campo-select-wrapper").forEach((wrapper) => {
        if (!wrapper.contains(event.target)) {
            const opts = wrapper.querySelector(".campo-select-options");
            const trg = wrapper.querySelector(".campo-select-trigger");
            if (opts) opts.classList.remove("aberto");
            if (trg) trg.classList.remove("aberto");
        }
    });
    if (!inputSearch.contains(event.target) && !divSugestoes.contains(event.target)) {
        divSugestoes.style.display = "none";
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        fecharTodosSelects();
        divSugestoes.style.display = "none";
    }
});


/* ==========================================================================
   CRIAR INPUT (campo numérico)
   ========================================================================== */
function criarInput(campo) {
    const wrapper = document.createElement("div");
    wrapper.className = "campo-input-wrapper";

    const icon = document.createElement("i");
    icon.className = "ri-ruler-2-line";
    wrapper.appendChild(icon);

    const group = document.createElement("div");
    group.className = "campo-input-group";

    const input = document.createElement("input");
    input.type = "number";
    input.id = campo.id;
    input.placeholder = " ";
    input.step = "0.01";
    if (campo.min !== undefined) input.min = campo.min;
    if (campo.max !== undefined) input.max = campo.max;

    input.addEventListener("input", (e) => {
        const v = e.target.value;
        if (v === "") delete valoresAtuais[campo.id];
        else valoresAtuais[campo.id] = v;
    });

    group.appendChild(input);

    const label = document.createElement("label");
    label.className = "label-flutuante";
    label.textContent = campo.label;
    group.appendChild(label);

    wrapper.appendChild(group);

    if (campo.unidade) {
        const unidade = document.createElement("span");
        unidade.className = "campo-input-unidade";
        unidade.textContent = campo.unidade;
        wrapper.appendChild(unidade);
    }

    return wrapper;
}


/* ==========================================================================
   CRIAR SELECT (campo com opções)
   ========================================================================== */
function criarSelect(campo) {
    const wrapper = document.createElement("div");
    wrapper.className = "campo-select-wrapper";

    const icon = document.createElement("i");
    icon.className = "ri-checkbox-line";
    wrapper.appendChild(icon);

    const group = document.createElement("div");
    group.className = "campo-select-group";

    const trigger = document.createElement("div");
    trigger.className = "campo-select-trigger";

    const spanSel = document.createElement("span");
    spanSel.className = "select-selecionado";
    spanSel.textContent = "Selecione";
    trigger.appendChild(spanSel);

    const arrow = document.createElement("i");
    arrow.className = "ri-arrow-down-s-line select-arrow";
    trigger.appendChild(arrow);

    trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        fecharTodosSelects();
        const parent = this.closest(".campo-select-wrapper");
        const opts = parent.querySelector(".campo-select-options");
        opts.classList.toggle("aberto");
        this.classList.toggle("aberto");
    });

    group.appendChild(trigger);

    const label = document.createElement("label");
    label.className = "label-flutuante";
    label.textContent = campo.label;
    group.appendChild(label);

    wrapper.appendChild(group);

    const optsContainer = document.createElement("div");
    optsContainer.className = "campo-select-options";

    campo.opcoes.forEach((opt, idx) => {
        const optDiv = document.createElement("div");
        optDiv.className = "campo-select-option";
        if (idx === 0) optDiv.classList.add("selecionado");
        optDiv.textContent = opt.label;

        optDiv.addEventListener("click", function (e) {
            e.stopPropagation();
            const parent = this.closest(".campo-select-wrapper");
            const triggerEl = parent.querySelector(".campo-select-trigger");
            const selSpan = triggerEl.querySelector(".select-selecionado");
            const optsCont = parent.querySelector(".campo-select-options");

            selSpan.textContent = opt.label;
            optsCont.querySelectorAll(".campo-select-option").forEach((o) => o.classList.remove("selecionado"));
            this.classList.add("selecionado");
            optsCont.classList.remove("aberto");
            triggerEl.classList.remove("aberto");

            // Guarda o valor/peso escolhido
            valoresAtuais[campo.id] = {
                label: opt.label,
                valor: opt.valor !== undefined ? opt.valor : opt.label,
                peso: opt.peso
            };
        });

        optsContainer.appendChild(optDiv);
    });

    wrapper.appendChild(optsContainer);
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

    // Decide se é um campo único (input simples) ou vários campos
    const ehCampoUnico = item.campos.length === 1 &&
                         item.campos[0].tipo === "input" &&
                         !item.calculo;

    if (ehCampoUnico) {
        const campo = item.campos[0];
        campoValorContainer.style.display = "flex";
        inputValor.value = "";
        inputValor.id = campo.id;
        if (campo.min !== undefined) inputValor.min = campo.min;
        if (campo.max !== undefined) inputValor.max = campo.max;

        uniTag.textContent = campo.unidade || "--";
        labelValor.textContent = campo.label;

        inputValor.removeEventListener("input", handleInputValor);
        inputValor.addEventListener("input", handleInputValor);

        camposDinamicosContainer.style.display = "none";
    } else {
        campoValorContainer.style.display = "none";
        camposDinamicosContainer.style.display = "grid";
        camposDinamicosContainer.style.gridTemplateColumns = "1fr 1fr";
        camposDinamicosContainer.style.gap = "8px";
        camposDinamicosContainer.style.width = "100%";
        camposDinamicosContainer.style.marginTop = "10px";

        item.campos.forEach((campo) => {
            const el = campo.tipo === "select" ? criarSelect(campo) : criarInput(campo);
            camposDinamicosContainer.appendChild(el);
        });
    }
}

function handleInputValor(e) {
    if (!itemAtual || !itemAtual.campos) return;
    const campoId = itemAtual.campos[0].id;
    const v = e.target.value;
    if (v === "") delete valoresAtuais[campoId];
    else valoresAtuais[campoId] = v;
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

    // Atualiza o label do campo de busca
    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) {
        labelBusca.textContent = config.tipo === "exame" ? "Exame" : "Escala";
    }

    camposDinamicosContainer.innerHTML = "";
    mostrarCamposDoItem(config);

    pResultado.innerHTML = "";
    pResultado.style.display = "none";
}


/* ==========================================================================
   PESQUISA E SUGESTÕES
   ========================================================================== */
function filtrarExames() {
    const termo = inputSearch.value.trim().toLowerCase();
    if (!termo) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    const todos = Object.keys(database).map((nome) => ({
        nome,
        tipo: database[nome].tipo,
        sinonimos: database[nome].sinonimos || []
    }));

    // Verifica se o termo corresponde a um sinónimo
    // e devolve o item correspondente com o sinónimo como "aliás"
    const resultados = [];

    todos.forEach((item) => {
        const nomeLower = item.nome.toLowerCase();
        let aliasEncontrado = null;

        if (nomeLower.includes(termo)) {
            resultados.push({ ...item, match: "nome" });
        } else {
            for (const sin of item.sinonimos) {
                if (sin.toLowerCase().includes(termo) || termo.includes(sin.toLowerCase())) {
                    aliasEncontrado = sin;
                    break;
                }
            }
            if (aliasEncontrado) {
                resultados.push({ ...item, match: "sinonimo", alias: aliasEncontrado });
            }
        }
    });

    if (resultados.length === 0) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    mostrarSugestoes(resultados, termo);
}


function mostrarSugestoes(itens, termo) {
    divSugestoes.innerHTML = "";
    divSugestoes.style.display = "block";

    itens.slice(0, 10).forEach((item) => {
        const div = document.createElement("div");
        div.className = "sugestao-item";

        // Badge do tipo
        const badge = document.createElement("span");
        badge.className = `sugestao-badge ${item.tipo}`;
        badge.textContent = item.tipo === "exame" ? "Exame" : "Escala";
        div.appendChild(badge);

        // Texto (nome ou "sinónimo → nome")
        const texto = document.createElement("span");
        texto.className = "sugestao-texto";

        if (item.match === "sinonimo" && item.alias) {
            // Mostra o sinónimo como a opção principal
            // ex: "açúcar no sangue" → Glicémia (Jejum)
            texto.innerHTML = `${destacarTexto(item.alias, termo)} <span style="opacity:0.5;">→ ${item.nome}</span>`;
        } else {
            texto.innerHTML = destacarTexto(item.nome, termo);
        }
        div.appendChild(texto);

        div.addEventListener("click", () => {
            inputSearch.value = item.nome;
            carregarItem(item.nome);
            divSugestoes.style.display = "none";
        });

        divSugestoes.appendChild(div);
    });
}


function destacarTexto(texto, termo) {
    if (!termo || !texto) return texto;
    const esc = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${esc})`, "gi");
    return texto.replace(regex, "<strong>$1</strong>");
}


/* ==========================================================================
   MOTOR DE CÁLCULO
   ========================================================================== */
function calcularValorFinal(config, valores) {
    if (!config.calculo) {
        // Sem cálculo: usa o valor do primeiro campo numérico
        const primeiroCampo = config.campos[0];
        const v = valores[primeiroCampo.id];
        return isNaN(parseFloat(v)) ? null : parseFloat(v);
    }

    const calc = config.calculo;

    // A) Soma de pesos (escalas de pontuação)
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

    // B) Fórmula matemática
    if (calc.formula) {
        return calcularFormula(calc.formula, valores, config.campos);
    }

    // C) Padrão (perfis sorológicos) — devolve um objeto
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
   CALCULAR FÓRMULA (seguro)
   ========================================================================== */
function calcularFormula(formula, valores, campos) {
    const nomes = campos.map((c) => c.id);

    // Validação de segurança
    let sobra = formula;
    const permitidos = ["Math.sqrt", "Math.pow", "Math.log10", "Math.log", "Math.abs",
                        "Math.min", "Math.max", "Math.round", "Math.floor", "Math.ceil",
                        "Math.exp", "Math.PI"];
    for (const termo of permitidos) sobra = sobra.split(termo).join(" ");
    for (const n of nomes) sobra = sobra.split(n).join(" ");
    if (!/^[\d\s+\-*/().,]*$/.test(sobra)) {
        console.error("Fórmula inválida:", formula);
        return null;
    }

    const args = nomes.map((n) => parseFloat(valores[n]));
    if (args.some((v) => isNaN(v))) return null;

    try {
        const fn = new Function(...nomes, `return (${formula});`);
        const r = fn(...args);
        return typeof r === "number" && isFinite(r) ? r : null;
    } catch (e) {
        console.error("Erro na fórmula:", e);
        return null;
    }
}


/* ==========================================================================
   ENCONTRAR INTERPRETAÇÃO
   ========================================================================== */
function encontrarInterpretacao(config, valorFinal) {
    const lista = config.interpretacao || [];

    // Caso A: valor é um objeto (padrão sorológico)
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

    // Caso B: valor é numérico → procura faixa
    const num = parseFloat(valorFinal);
    if (isNaN(num)) return null;

    for (const item of lista) {
        if (!item.faixa) continue;
        if (num >= item.faixa[0] && num <= item.faixa[1]) return item;
    }
    return null;
}


/* ==========================================================================
   VALIDAR CAMPOS
   ========================================================================== */
function validarCampos(config) {
    const vazios = [];
    for (const campo of config.campos) {
        const v = valoresAtuais[campo.id];
        if (v === undefined || v === null || v === "") {
            vazios.push(campo.label);
        } else if (typeof v === "object" && (v.valor === undefined && v.peso === undefined)) {
            vazios.push(campo.label);
        }
    }
    return vazios;
}

function validarLimites(config) {
    for (const campo of config.campos) {
        if (campo.tipo !== "input") continue;
        if (campo.min === undefined && campo.max === undefined) continue;
        const v = parseFloat(valoresAtuais[campo.id]);
        if (isNaN(v)) continue;
        if (campo.min !== undefined && v < campo.min) {
            return `⚠️ ${campo.label} abaixo do mínimo (${campo.min} ${campo.unidade || ""}).`;
        }
        if (campo.max !== undefined && v > campo.max) {
            return `⚠️ ${campo.label} acima do máximo (${campo.max} ${campo.unidade || ""}).`;
        }
    }
    return null;
}


/* ==========================================================================
   RENDERIZAR RESULTADO — CARD NOVO
   ========================================================================== */
function renderizarResultado(config, valorFinal, interpretacao) {
    const statusConf = STATUS_CONFIG[interpretacao.status] || STATUS_CONFIG.normal;
    const ehEscala = config.tipo === "escala";

    // -------- Formatação do valor principal --------
    let valorDisplay = "";
    let unidadeDisplay = "";

    if (typeof valorFinal === "object" && valorFinal !== null) {
        // Perfil sorológico: mostra o primeiro campo como valor principal
        const primeiraChave = config.calculo.chave[0];
        valorDisplay = valorFinal[primeiraChave] || "—";
    } else if (ehEscala) {
        valorDisplay = Number.isInteger(valorFinal) ? valorFinal : valorFinal.toFixed(1);
        unidadeDisplay = config.calculo && config.calculo.tipo === "soma_pesos" ? "pontos" : "";
    } else {
        valorDisplay = Number.isInteger(valorFinal) ? valorFinal : valorFinal.toFixed(2).replace(/\.?0+$/, "");
        unidadeDisplay = config.referencia && config.referencia.unidade ? config.referencia.unidade : "";
    }

    // -------- Barra de progresso com marcador --------
    let barraHTML = "";
    if (config.referencia && interpretacao.faixa && !isNaN(parseFloat(valorFinal))) {
        const num = parseFloat(valorFinal);
        const todasFaixas = config.interpretacao.map((i) => i.faixa).filter(Boolean);
        const minGeral = Math.min(...todasFaixas.map((f) => f[0]));
        const maxGeral = Math.max(...todasFaixas.map((f) => f[1]));

        // Percentagem onde está o marcador
        const pct = ((num - minGeral) / (maxGeral - minGeral)) * 100;
        const pctClamped = Math.max(0, Math.min(100, pct));

        // Labels: min, meio e max
        const labelMin = formatarNumero(minGeral);
        const labelMax = formatarNumero(maxGeral);

        // Tenta encontrar o nome da faixa "normal/bom" para o meio
        const faixaNormal = config.interpretacao.find((i) =>
            i.status === "normal" || i.status === "bom" || i.status === "negativo"
        );
        let labelMeio = "";
        if (faixaNormal) {
            labelMeio = faixaNormal.termo || faixaNormal.classificacao || "Normal";
        }

        barraHTML = `
            <div class="result-barra-bloco">
                <div class="result-barra">
                    <div class="result-barra-fill"
                         style="width:${pctClamped}%;
                                background:${statusConf.cor};"></div>
                    <div class="result-barra-marcador"
                         style="left:${pctClamped}%;
                                color:${statusConf.cor};"></div>
                </div>
                <div class="result-barra-labels">
                    <span>${labelMin}</span>
                    <span>${labelMeio}</span>
                    <span>${labelMax}</span>
                </div>
            </div>
        `;
    }

    // -------- Nota clínica --------
    const notaClasse = statusConf.classe;
    const notaIcone = statusConf.icone;

    // -------- Bloco de detalhes (colapsado) --------
    let detalhesHTML = "";
    const linhasDetalhes = [];

    // Campos preenchidos
    for (const campo of config.campos) {
        const v = valoresAtuais[campo.id];
        if (v === undefined) continue;
        const valorMostrado = typeof v === "object" ? v.label : v;
        linhasDetalhes.push(
            `<div class="linha"><span>${campo.label}</span><span>${valorMostrado}${campo.unidade ? " " + campo.unidade : ""}</span></div>`
        );
    }

    // Fórmula (se aplicável)
    let formulaHTML = "";
    if (config.calculo && config.calculo.mostrarFormula) {
        formulaHTML = `<div class="formula">${config.calculo.mostrarFormula}</div>`;
    }

    // Valor final
    const valorFinalStr = typeof valorFinal === "object"
        ? JSON.stringify(valorFinal)
        : (Number.isInteger(valorFinal) ? valorFinal : valorFinal.toFixed(2));

    if (linhasDetalhes.length > 0) {
        detalhesHTML = `
            <div class="result-detalhes" id="resultDetalhes">
                <div class="result-detalhes-conteudo">
                    ${linhasDetalhes.join("")}
                    <div class="linha" style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--borda);">
                        <span><strong>Resultado final</strong></span>
                        <span>${valorFinalStr}${unidadeDisplay ? " " + unidadeDisplay : ""}</span>
                    </div>
                    ${formulaHTML}
                </div>
            </div>
        `;
    }

    // -------- HTML do card --------
    const html = `
        <div class="result-card ${ehEscala ? "escala" : "exame"}">
            <div class="result-header">
                <span class="result-badge ${config.tipo}">
                    <i class="${ehEscala ? "ri-bar-chart-box-line" : "ri-flask-line"}"></i>
                    ${ehEscala ? "Escala" : "Exame"}
                </span>
                ${linhasDetalhes.length > 0 ? `
                    <button class="btn-detalhes" id="btnDetalhes" title="Ver detalhes">
                        <i class="ri-settings-3-line"></i>
                    </button>
                ` : ""}
            </div>

            <div class="result-nome">${itemAtual.nome}</div>

            <div class="result-valor-bloco">
                <div class="valor">
                    <span class="valor-numero">${valorDisplay}</span>
                    ${unidadeDisplay ? `<span class="valor-unidade">${unidadeDisplay}</span>` : ""}
                </div>
                <span class="status-pill status-${statusConf.classe}">
                    <i class="${statusConf.icone}"></i>
                    ${interpretacao.termo || interpretacao.classificacao || statusConf.label}
                </span>
            </div>

            ${barraHTML}

            <div class="result-nota ${notaClasse}">
                <i class="${notaIcone}"></i>
                <p>${interpretacao.nota}</p>
            </div>

            ${detalhesHTML}
        </div>
    `;

    pResultado.innerHTML = html;
    pResultado.style.display = "block";

    // Botão de detalhes
    const btnDetalhes = document.getElementById("btnDetalhes");
    const resultDetalhes = document.getElementById("resultDetalhes");
    if (btnDetalhes && resultDetalhes) {
        btnDetalhes.addEventListener("click", () => {
            btnDetalhes.classList.toggle("aberto");
            resultDetalhes.classList.toggle("aberto");
        });
    }

    animarResultado();
}


function formatarNumero(n) {
    if (Number.isInteger(n)) return n.toString();
    return n.toFixed(2).replace(/\.?0+$/, "");
}


function animarResultado() {
    if (!pResultado) return;
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");
}


/* ==========================================================================
   MOSTRAR ERRO
   ========================================================================== */
function mostrarErro(msg) {
    pResultado.innerHTML = `
        <div class="result-card" style="border-left-color:#ef4444;">
            <div class="result-nota critico" style="margin:16px;">
                <i class="ri-error-warning-fill"></i>
                <p>${msg}</p>
            </div>
        </div>
    `;
    pResultado.style.display = "block";
    animarResultado();
}


/* ==========================================================================
   ANALISAR
   ========================================================================== */
function analisar() {
    const nome = inputSearch.value.trim();
    if (!nome) {
        mostrarErro("⚠️ Pesquise um exame ou escala.");
        return;
    }

    const config = database[nome];
    if (!config) {
        mostrarErro(`⚠️ "${nome}" não encontrado na base de dados.`);
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
    // 1. Validação de campos vazios
    const vazios = validarCampos(config);
    if (vazios.length > 0) {
        mostrarErro(`⚠️ Preencha todos os campos: ${vazios.join(", ")}.`);
        return;
    }

    // 2. Validação de limites individuais
    const erroLimite = validarLimites(config);
    if (erroLimite) {
        mostrarErro(erroLimite);
        return;
    }

    // 3. Cálculo
    const valorFinal = calcularValorFinal(config, valoresAtuais);
    if (valorFinal === null) {
        mostrarErro("⚠️ Não foi possível calcular o resultado. Verifique os valores.");
        return;
    }

    // 4. Interpretação
    const interpretacao = encontrarInterpretacao(config, valorFinal);
    if (!interpretacao) {
        mostrarErro("⚠️ Nenhuma interpretação corresponde aos valores inseridos.");
        return;
    }

    // 5. Renderizar
    renderizarResultado(config, valorFinal, interpretacao);
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
    labelValor.textContent = "Resultado";

    camposDinamicosContainer.innerHTML = "";
    camposDinamicosContainer.style.display = "none";

    pResultado.innerHTML = "";
    pResultado.style.display = "none";
    pResultado.classList.remove("vibrar");

    valoresAtuais = {};
    itemAtual = null;

    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) labelBusca.textContent = "Exame ou Escala";

    fecharTodosSelects();

    setTimeout(() => inputSearch.focus(), 100);
}


/* ==========================================================================
   EVENTOS
   ========================================================================== */
let timeoutBusca = null;
inputSearch.addEventListener("input", () => {
    if (timeoutBusca) clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(filtrarExames, 250);
});

inputSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const primeiro = divSugestoes.querySelector(".sugestao-item");
        if (primeiro) {
            primeiro.click();
        } else {
            analisar();
        }
    }
});

document.getElementById("btnAnalisar").addEventListener("click", (e) => {
    e.preventDefault();
    analisar();
});

document.getElementById("btnLimpar").addEventListener("click", (e) => {
    e.preventDefault();
    limpar();
});


/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
function inicializar() {
    console.log("🚀 Interpretador Clínico v2 — Exames & Escalas");
    console.log(`📊 ${Object.keys(database).length} itens disponíveis.`);

    camposDinamicosContainer.style.display = "none";
    campoValorContainer.style.display = "none";
    pResultado.style.display = "none";
    uniTag.textContent = "--";

    valoresAtuais = {};
    itemAtual = null;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
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
};
console.log("📌 Debug: window.__interpretador");