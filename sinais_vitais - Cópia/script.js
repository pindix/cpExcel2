// ============================================================================
// MATCLÍNICA - SINAIS VITAIS
// SCRIPT PRINCIPAL — v3.0
// ============================================================================

console.log("MatClínica v3.0 — carregando...");

// ============================================================================
// SECÇÃO 1: CONSTANTES E VARIÁVEIS GLOBAIS
// ============================================================================

const body = document.body;

let pacientes = JSON.parse(localStorage.getItem('pacientes_monitorados')) || {};
let pacienteAtivo = null;

let referencias = {
    idade: { valor: null, unidade: 'anos' },
    fontes: {
        fc:    { fonte: 'OMS' },
        fr:    { fonte: 'OMS' },
        temp:  { fonte: 'OMS', local: 'axilar' },
        sato2: { fonte: 'OMS' },
        ta:    { fonte: 'OMS' }
    }
};

let cacheGravidade = new Map();
function limparCacheGravidade() { cacheGravidade = new Map(); }

let historicoMedicoes = [];
let graficoAtual = null;

// ── Estado do gráfico (para o clique nos pontos) ──
let mapaIndicesGrafico = [];       // mapeia índice visível no gráfico → índice real no histórico
let pontoSelecionado = null;       // { idxReal, campo, datasetIndex }

// Estado temporário do painel (antes de "Aplicar")
let painelTemp = {
    idade: { valor: null, unidade: 'anos' },
    fontes: {
        fc:    { fonte: 'OMS' },
        fr:    { fonte: 'OMS' },
        temp:  { fonte: 'OMS', local: 'axilar' },
        sato2: { fonte: 'OMS' },
        ta:    { fonte: 'OMS' }
    }
};

// ============================================================================
// SECÇÃO 2: UNIDADES DE IDADE E CONVERSÕES
// ============================================================================

const UNIDADES_IDADE = [
    { value: 'anos',    label: 'Anos',    paraMeses: (v) => v * 12 },
    { value: 'meses',   label: 'Meses',   paraMeses: (v) => v },
    { value: 'semanas', label: 'Semanas', paraMeses: (v) => v / 4.345 },
    { value: 'dias',    label: 'Dias',    paraMeses: (v) => v / 30 }
];

function idadeEmMeses() {
    if (!referencias.idade || referencias.idade.valor == null) return null;
    const valor = parseFloat(referencias.idade.valor);
    if (isNaN(valor) || valor < 0) return null;
    const unidade = UNIDADES_IDADE.find(u => u.value === referencias.idade.unidade);
    if (!unidade) return null;
    return unidade.paraMeses(valor);
}

function idadeFormatada() {
    if (!referencias.idade || referencias.idade.valor == null) return 'Não definida';
    const valor = referencias.idade.valor;
    const unidade = UNIDADES_IDADE.find(u => u.value === referencias.idade.unidade);
    if (!unidade) return `${valor}`;
    const num = parseFloat(valor);
    const plural = num === 1 ? unidade.label.slice(0, -1) : unidade.label;
    return `${valor} ${plural.toLowerCase()}`;
}

// ============================================================================
// SECÇÃO 3: BASE DE DADOS CLÍNICA
// ============================================================================

function CATEGORIAS_TEMP_PADRAO(minNormal, maxNormal) {
    const maxHipertermia = maxNormal + 0.5;
    const maxFebre = maxNormal + 1.5;
    const maxHiperpirexia = 42.0;
    return [
        { min: -Infinity, max: 34.9, termo: "Hipotermia grave" },
        { min: 35, max: minNormal - 0.1, termo: "Hipotermia" },
        { min: minNormal, max: maxNormal, termo: "Aprexia" },
        { min: maxNormal + 0.1, max: maxHipertermia, termo: "Hipertermia" },
        { min: maxHipertermia + 0.1, max: maxFebre, termo: "Febre" },
        { min: maxFebre + 0.1, max: maxHiperpirexia, termo: "Hiperpirexia" },
        { min: 42.1, max: Infinity, termo: "Hipertermia maligna" }
    ];
}

function CATEGORIAS_SATO2_PADRAO() {
    return [
        { min: -Infinity, max: 89, termo: "Hipoxemia grave" },
        { min: 90, max: 94, termo: "Hipoxemia" },
        { min: 95, max: 100, termo: "Normoxemia" }
    ];
}

const DB_VITALS = {
    "OMS": {
        // ─── FC ───
        fc: {
            "recem_nascido_0_1m": {
                minMeses: 0, maxMeses: 1,
                ref: [100, 160],
                categorias: [
                    { min: -Infinity, max: 99, termo: "Bradicardia grave" },
                    { min: 100, max: 119, termo: "Bradicardia" },
                    { min: 120, max: 160, termo: "Normocardia" },
                    { min: 161, max: 180, termo: "Taquicardia" },
                    { min: 181, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "lactente_1_12m": {
                minMeses: 1, maxMeses: 12,
                ref: [80, 140],
                categorias: [
                    { min: -Infinity, max: 79, termo: "Bradicardia grave" },
                    { min: 80, max: 99, termo: "Bradicardia" },
                    { min: 100, max: 140, termo: "Normocardia" },
                    { min: 141, max: 160, termo: "Taquicardia" },
                    { min: 161, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "crianca_1_3": {
                minMeses: 12, maxMeses: 36,
                ref: [80, 130],
                categorias: [
                    { min: -Infinity, max: 69, termo: "Bradicardia grave" },
                    { min: 70, max: 79, termo: "Bradicardia" },
                    { min: 80, max: 130, termo: "Normocardia" },
                    { min: 131, max: 150, termo: "Taquicardia" },
                    { min: 151, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "crianca_3_6": {
                minMeses: 36, maxMeses: 72,
                ref: [80, 120],
                categorias: [
                    { min: -Infinity, max: 69, termo: "Bradicardia grave" },
                    { min: 70, max: 79, termo: "Bradicardia" },
                    { min: 80, max: 120, termo: "Normocardia" },
                    { min: 121, max: 140, termo: "Taquicardia" },
                    { min: 141, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "crianca_6_12": {
                minMeses: 72, maxMeses: 144,
                ref: [70, 110],
                categorias: [
                    { min: -Infinity, max: 59, termo: "Bradicardia grave" },
                    { min: 60, max: 69, termo: "Bradicardia" },
                    { min: 70, max: 110, termo: "Normocardia" },
                    { min: 111, max: 130, termo: "Taquicardia" },
                    { min: 131, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "adolescente_12_18": {
                minMeses: 144, maxMeses: 216,
                ref: [60, 100],
                categorias: [
                    { min: -Infinity, max: 49, termo: "Bradicardia grave" },
                    { min: 50, max: 59, termo: "Bradicardia" },
                    { min: 60, max: 100, termo: "Normocardia" },
                    { min: 101, max: 120, termo: "Taquicardia" },
                    { min: 121, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "adulto": {
                minMeses: 216, maxMeses: 720,
                ref: [60, 100],
                categorias: [
                    { min: -Infinity, max: 49, termo: "Bradicardia grave" },
                    { min: 50, max: 59, termo: "Bradicardia" },
                    { min: 60, max: 100, termo: "Normocardia" },
                    { min: 101, max: 120, termo: "Taquicardia" },
                    { min: 121, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS/Medscape"
            },
            "idoso_60mais": {
                minMeses: 720, maxMeses: 9999,
                ref: [60, 100],
                categorias: [
                    { min: -Infinity, max: 49, termo: "Bradicardia grave" },
                    { min: 50, max: 59, termo: "Bradicardia" },
                    { min: 60, max: 100, termo: "Normocardia" },
                    { min: 101, max: 120, termo: "Taquicardia" },
                    { min: 121, max: Infinity, termo: "Taquicardia grave" }
                ],
                fonte: "OMS/Medscape"
            }
        },
        // ─── FR ───
        fr: {
            "recem_nascido_0_1m": {
                minMeses: 0, maxMeses: 1,
                ref: [30, 60],
                categorias: [
                    { min: -Infinity, max: 29, termo: "Bradipneia grave" },
                    { min: 30, max: 39, termo: "Bradipneia" },
                    { min: 40, max: 60, termo: "Eupneia" },
                    { min: 61, max: 70, termo: "Taquipneia" },
                    { min: 71, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "lactente_1_12m": {
                minMeses: 1, maxMeses: 12,
                ref: [25, 40],
                categorias: [
                    { min: -Infinity, max: 19, termo: "Bradipneia grave" },
                    { min: 20, max: 24, termo: "Bradipneia" },
                    { min: 25, max: 40, termo: "Eupneia" },
                    { min: 41, max: 50, termo: "Taquipneia" },
                    { min: 51, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "crianca_1_3": {
                minMeses: 12, maxMeses: 36,
                ref: [20, 30],
                categorias: [
                    { min: -Infinity, max: 14, termo: "Bradipneia grave" },
                    { min: 15, max: 19, termo: "Bradipneia" },
                    { min: 20, max: 30, termo: "Eupneia" },
                    { min: 31, max: 40, termo: "Taquipneia" },
                    { min: 41, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "crianca_3_6": {
                minMeses: 36, maxMeses: 72,
                ref: [20, 25],
                categorias: [
                    { min: -Infinity, max: 14, termo: "Bradipneia grave" },
                    { min: 15, max: 19, termo: "Bradipneia" },
                    { min: 20, max: 25, termo: "Eupneia" },
                    { min: 26, max: 35, termo: "Taquipneia" },
                    { min: 36, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "crianca_6_12": {
                minMeses: 72, maxMeses: 144,
                ref: [18, 25],
                categorias: [
                    { min: -Infinity, max: 12, termo: "Bradipneia grave" },
                    { min: 13, max: 17, termo: "Bradipneia" },
                    { min: 18, max: 25, termo: "Eupneia" },
                    { min: 26, max: 35, termo: "Taquipneia" },
                    { min: 36, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "adolescente_12_18": {
                minMeses: 144, maxMeses: 216,
                ref: [12, 20],
                categorias: [
                    { min: -Infinity, max: 8, termo: "Bradipneia grave" },
                    { min: 9, max: 11, termo: "Bradipneia" },
                    { min: 12, max: 20, termo: "Eupneia" },
                    { min: 21, max: 28, termo: "Taquipneia" },
                    { min: 29, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS (IMCI)"
            },
            "adulto": {
                minMeses: 216, maxMeses: 720,
                ref: [12, 20],
                categorias: [
                    { min: -Infinity, max: 8, termo: "Bradipneia grave" },
                    { min: 9, max: 11, termo: "Bradipneia" },
                    { min: 12, max: 20, termo: "Eupneia" },
                    { min: 21, max: 28, termo: "Taquipneia" },
                    { min: 29, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS/Medscape"
            },
            "idoso_60mais": {
                minMeses: 720, maxMeses: 9999,
                ref: [12, 20],
                categorias: [
                    { min: -Infinity, max: 8, termo: "Bradipneia grave" },
                    { min: 9, max: 11, termo: "Bradipneia" },
                    { min: 12, max: 20, termo: "Eupneia" },
                    { min: 21, max: 28, termo: "Taquipneia" },
                    { min: 29, max: Infinity, termo: "Taquipneia grave" }
                ],
                fonte: "OMS/Medscape"
            }
        },
        // ─── TEMP ───
        temp: {
            "recem_nascido_0_1m": {
                minMeses: 0, maxMeses: 1,
                local: {
                    oral:      { ref: [36.5, 37.5], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.5), fonte: "OMS" },
                    axilar:    { ref: [36.5, 37.4], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.4), fonte: "MISAU Angola" },
                    timpanico: { ref: [36.6, 37.6], categorias: CATEGORIAS_TEMP_PADRAO(36.6, 37.6), fonte: "OMS" },
                    retal:     { ref: [36.8, 37.8], categorias: CATEGORIAS_TEMP_PADRAO(36.8, 37.8), fonte: "OMS" }
                },
                fonte: "OMS/MISAU Angola"
            },
            "lactente_1_12m": {
                minMeses: 1, maxMeses: 12,
                local: {
                    oral:      { ref: [36.5, 37.5], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.5), fonte: "OMS" },
                    axilar:    { ref: [36.5, 37.4], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.4), fonte: "MISAU Angola" },
                    timpanico: { ref: [36.6, 37.6], categorias: CATEGORIAS_TEMP_PADRAO(36.6, 37.6), fonte: "OMS" },
                    retal:     { ref: [36.8, 37.8], categorias: CATEGORIAS_TEMP_PADRAO(36.8, 37.8), fonte: "OMS" }
                },
                fonte: "OMS/MISAU Angola"
            },
            "crianca_1_3": {
                minMeses: 12, maxMeses: 36,
                local: {
                    oral:      { ref: [36.5, 37.5], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.5), fonte: "OMS" },
                    axilar:    { ref: [36.5, 37.4], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.4), fonte: "MISAU Angola" },
                    timpanico: { ref: [36.6, 37.6], categorias: CATEGORIAS_TEMP_PADRAO(36.6, 37.6), fonte: "OMS" },
                    retal:     { ref: [36.8, 37.8], categorias: CATEGORIAS_TEMP_PADRAO(36.8, 37.8), fonte: "OMS" }
                },
                fonte: "OMS/MISAU Angola"
            },
            "crianca_3_6": {
                minMeses: 36, maxMeses: 72,
                local: {
                    oral:      { ref: [36.5, 37.5], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.5), fonte: "OMS" },
                    axilar:    { ref: [36.5, 37.4], categorias: CATEGORIAS_TEMP_PADRAO(36.5, 37.4), fonte: "MISAU Angola" },
                    timpanico: { ref: [36.6, 37.6], categorias: CATEGORIAS_TEMP_PADRAO(36.6, 37.6), fonte: "OMS" },
                    retal:     { ref: [36.8, 37.8], categorias: CATEGORIAS_TEMP_PADRAO(36.8, 37.8), fonte: "OMS" }
                },
                fonte: "OMS/MISAU Angola"
            },
            "crianca_6_12": {
                minMeses: 72, maxMeses: 144,
                local: {
                    oral:      { ref: [36.0, 37.2], categorias: CATEGORIAS_TEMP_PADRAO(36.0, 37.2), fonte: "OMS" },
                    axilar:    { ref: [35.5, 36.7], categorias: CATEGORIAS_TEMP_PADRAO(35.5, 36.7), fonte: "OMS" },
                    timpanico: { ref: [36.1, 37.3], categorias: CATEGORIAS_TEMP_PADRAO(36.1, 37.3), fonte: "OMS" },
                    retal:     { ref: [36.3, 37.5], categorias: CATEGORIAS_TEMP_PADRAO(36.3, 37.5), fonte: "OMS" }
                },
                fonte: "OMS"
            },
            "adolescente_12_18": {
                minMeses: 144, maxMeses: 216,
                local: {
                    oral:      { ref: [36.0, 37.2], categorias: CATEGORIAS_TEMP_PADRAO(36.0, 37.2), fonte: "OMS" },
                    axilar:    { ref: [35.5, 36.7], categorias: CATEGORIAS_TEMP_PADRAO(35.5, 36.7), fonte: "OMS" },
                    timpanico: { ref: [36.1, 37.3], categorias: CATEGORIAS_TEMP_PADRAO(36.1, 37.3), fonte: "OMS" },
                    retal:     { ref: [36.3, 37.5], categorias: CATEGORIAS_TEMP_PADRAO(36.3, 37.5), fonte: "OMS" }
                },
                fonte: "OMS"
            },
            "adulto": {
                minMeses: 216, maxMeses: 720,
                local: {
                    oral:      { ref: [36.0, 37.2], categorias: CATEGORIAS_TEMP_PADRAO(36.0, 37.2), fonte: "OMS" },
                    axilar:    { ref: [35.5, 36.7], categorias: CATEGORIAS_TEMP_PADRAO(35.5, 36.7), fonte: "OMS" },
                    timpanico: { ref: [36.1, 37.3], categorias: CATEGORIAS_TEMP_PADRAO(36.1, 37.3), fonte: "OMS" },
                    retal:     { ref: [36.3, 37.5], categorias: CATEGORIAS_TEMP_PADRAO(36.3, 37.5), fonte: "OMS" }
                },
                fonte: "OMS"
            },
            "idoso_60mais": {
                minMeses: 720, maxMeses: 9999,
                local: {
                    oral:      { ref: [36.0, 37.0], categorias: CATEGORIAS_TEMP_PADRAO(36.0, 37.0), fonte: "OMS" },
                    axilar:    { ref: [35.5, 36.5], categorias: CATEGORIAS_TEMP_PADRAO(35.5, 36.5), fonte: "OMS" },
                    timpanico: { ref: [36.1, 37.1], categorias: CATEGORIAS_TEMP_PADRAO(36.1, 37.1), fonte: "OMS" },
                    retal:     { ref: [36.3, 37.3], categorias: CATEGORIAS_TEMP_PADRAO(36.3, 37.3), fonte: "OMS" }
                },
                fonte: "OMS"
            }
        },
        // ─── SatO2 ───
        sato2: {
            "recem_nascido_0_1m": { minMeses: 0, maxMeses: 1, ref: [95, 100], categorias: CATEGORIAS_SATO2_PADRAO(), fonte: "OMS" },
            "lactente_1_12m":     { minMeses: 1, maxMeses: 12, ref: [95, 100], categorias: CATEGORIAS_SATO2_PADRAO(), fonte: "OMS" },
            "crianca_1_3":        { minMeses: 12, maxMeses: 36, ref: [95, 100], categorias: CATEGORIAS_SATO2_PADRAO(), fonte: "OMS" },
            "crianca_3_6":        { minMeses: 36, maxMeses: 72, ref: [95, 100], categorias: CATEGORIAS_SATO2_PADRAO(), fonte: "OMS" },
            "crianca_6_12":       { minMeses: 72, maxMeses: 144, ref: [95, 100], categorias: CATEGORIAS_SATO2_PADRAO(), fonte: "OMS" },
            "adolescente_12_18":  { minMeses: 144, maxMeses: 216, ref: [95, 100], categorias: CATEGORIAS_SATO2_PADRAO(), fonte: "OMS" },
            "adulto":             { minMeses: 216, maxMeses: 720, ref: [95, 100], categorias: CATEGORIAS_SATO2_PADRAO(), fonte: "OMS" },
            "idoso_60mais":       { minMeses: 720, maxMeses: 9999, ref: [94, 99], categorias: [
                { min: -Infinity, max: 88, termo: "Hipoxemia grave" },
                { min: 89, max: 93, termo: "Hipoxemia" },
                { min: 94, max: 99, termo: "Normoxemia" }
            ], fonte: "OMS" }
        },
        // ─── TA (sis + dia) ───
        ta: {
            "recem_nascido_0_1m": {
                minMeses: 0, maxMeses: 1,
                sis: { ref: [60, 90], categorias: [
                    { min: -Infinity, max: 49, termo: "Hipotensão grave" },
                    { min: 50, max: 59, termo: "Hipotensão" },
                    { min: 60, max: 90, termo: "Normotensão" },
                    { min: 91, max: 110, termo: "Pré-hipertensão" },
                    { min: 111, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                dia: { ref: [30, 60], categorias: [
                    { min: -Infinity, max: 19, termo: "Hipotensão grave" },
                    { min: 20, max: 29, termo: "Hipotensão" },
                    { min: 30, max: 60, termo: "Normotensão" },
                    { min: 61, max: 75, termo: "Pré-hipertensão" },
                    { min: 76, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                fonte: "AAP/AHA (Flynn et al., 2017)"
            },
            "lactente_1_12m": {
                minMeses: 1, maxMeses: 12,
                sis: { ref: [72, 104], categorias: [
                    { min: -Infinity, max: 59, termo: "Hipotensão grave" },
                    { min: 60, max: 71, termo: "Hipotensão" },
                    { min: 72, max: 104, termo: "Normotensão" },
                    { min: 105, max: 115, termo: "Pré-hipertensão" },
                    { min: 116, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                dia: { ref: [37, 56], categorias: [
                    { min: -Infinity, max: 29, termo: "Hipotensão grave" },
                    { min: 30, max: 36, termo: "Hipotensão" },
                    { min: 37, max: 56, termo: "Normotensão" },
                    { min: 57, max: 70, termo: "Pré-hipertensão" },
                    { min: 71, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                fonte: "AAP/AHA (Flynn et al., 2017)"
            },
            "crianca_1_3": {
                minMeses: 12, maxMeses: 36,
                sis: { ref: [86, 106], categorias: [
                    { min: -Infinity, max: 69, termo: "Hipotensão grave" },
                    { min: 70, max: 85, termo: "Hipotensão" },
                    { min: 86, max: 106, termo: "Normotensão" },
                    { min: 107, max: 119, termo: "Pré-hipertensão" },
                    { min: 120, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                dia: { ref: [42, 63], categorias: [
                    { min: -Infinity, max: 34, termo: "Hipotensão grave" },
                    { min: 35, max: 41, termo: "Hipotensão" },
                    { min: 42, max: 63, termo: "Normotensão" },
                    { min: 64, max: 79, termo: "Pré-hipertensão" },
                    { min: 80, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                fonte: "AAP/AHA (Flynn et al., 2017)"
            },
            "crianca_3_6": {
                minMeses: 36, maxMeses: 72,
                sis: { ref: [89, 112], categorias: [
                    { min: -Infinity, max: 69, termo: "Hipotensão grave" },
                    { min: 70, max: 88, termo: "Hipotensão" },
                    { min: 89, max: 112, termo: "Normotensão" },
                    { min: 113, max: 129, termo: "Pré-hipertensão" },
                    { min: 130, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                dia: { ref: [46, 72], categorias: [
                    { min: -Infinity, max: 34, termo: "Hipotensão grave" },
                    { min: 35, max: 45, termo: "Hipotensão" },
                    { min: 46, max: 72, termo: "Normotensão" },
                    { min: 73, max: 89, termo: "Pré-hipertensão" },
                    { min: 90, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                fonte: "AAP/AHA (Flynn et al., 2017)"
            },
            "crianca_6_12": {
                minMeses: 72, maxMeses: 144,
                sis: { ref: [97, 115], categorias: [
                    { min: -Infinity, max: 79, termo: "Hipotensão grave" },
                    { min: 80, max: 96, termo: "Hipotensão" },
                    { min: 97, max: 115, termo: "Normotensão" },
                    { min: 116, max: 129, termo: "Pré-hipertensão" },
                    { min: 130, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                dia: { ref: [57, 76], categorias: [
                    { min: -Infinity, max: 44, termo: "Hipotensão grave" },
                    { min: 45, max: 56, termo: "Hipotensão" },
                    { min: 57, max: 76, termo: "Normotensão" },
                    { min: 77, max: 89, termo: "Pré-hipertensão" },
                    { min: 90, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                fonte: "AAP/AHA (Flynn et al., 2017)"
            },
            "adolescente_12_18": {
                minMeses: 144, maxMeses: 216,
                sis: { ref: [110, 131], categorias: [
                    { min: -Infinity, max: 89, termo: "Hipotensão grave" },
                    { min: 90, max: 109, termo: "Hipotensão" },
                    { min: 110, max: 131, termo: "Normotensão" },
                    { min: 132, max: 139, termo: "Pré-hipertensão" },
                    { min: 140, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                dia: { ref: [64, 83], categorias: [
                    { min: -Infinity, max: 49, termo: "Hipotensão grave" },
                    { min: 50, max: 63, termo: "Hipotensão" },
                    { min: 64, max: 83, termo: "Normotensão" },
                    { min: 84, max: 89, termo: "Pré-hipertensão" },
                    { min: 90, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AAP/AHA" },
                fonte: "AAP/AHA (Flynn et al., 2017)"
            },
            "adulto": {
                minMeses: 216, maxMeses: 720,
                sis: { ref: [90, 120], categorias: [
                    { min: -Infinity, max: 79, termo: "Hipotensão grave" },
                    { min: 80, max: 89, termo: "Hipotensão" },
                    { min: 90, max: 120, termo: "Normotensão" },
                    { min: 121, max: 129, termo: "Pré-hipertensão" },
                    { min: 130, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AHA/ACC 2017" },
                dia: { ref: [60, 80], categorias: [
                    { min: -Infinity, max: 49, termo: "Hipotensão grave" },
                    { min: 50, max: 59, termo: "Hipotensão" },
                    { min: 60, max: 80, termo: "Normotensão" },
                    { min: 81, max: 89, termo: "Pré-hipertensão" },
                    { min: 90, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AHA/ACC 2017" },
                fonte: "AHA/ACC 2017"
            },
            "idoso_60mais": {
                minMeses: 720, maxMeses: 9999,
                sis: { ref: [90, 130], categorias: [
                    { min: -Infinity, max: 79, termo: "Hipotensão grave" },
                    { min: 80, max: 89, termo: "Hipotensão" },
                    { min: 90, max: 130, termo: "Normotensão" },
                    { min: 131, max: 139, termo: "Pré-hipertensão" },
                    { min: 140, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AHA/ACC 2017" },
                dia: { ref: [60, 80], categorias: [
                    { min: -Infinity, max: 49, termo: "Hipotensão grave" },
                    { min: 50, max: 59, termo: "Hipotensão" },
                    { min: 60, max: 80, termo: "Normotensão" },
                    { min: 81, max: 89, termo: "Pré-hipertensão" },
                    { min: 90, max: Infinity, termo: "Hipertensão" }
                ], fonte: "AHA/ACC 2017" },
                fonte: "AHA/ACC 2017"
            }
        }
    },
};



// ============================================================================
// SECÇÃO 4: MAPAS AUXILIARES
// ============================================================================

const GRAVIDADE_MAP = {
    'critico':        { label: '🔴 Crítico',         cor: '#ef4444' },
    'muito_urgente':  { label: '🟠 Muito Urgente',   cor: '#f97316' },
    'urgente':        { label: '🟡 Urgente',         cor: '#eab308' },
    'pouco_urgente':  { label: '🟢 Pouco Urgente',   cor: '#22c55e' },
    'nao_urgente':    { label: '🔵 Não Urgente',     cor: '#3b82f6' },
    'sem_dados':      { label: '⚪ Sem dados',       cor: '#9ca3af' }
};

const FONTE_LABELS = {
    'OMS': '🌍 OMS',
    'Medscape': '💊 Medscape',
    'AHA/ACC': '❤️ AHA/ACC 2017',
    'AAP/AHA': '👶 AAP/AHA 2017',
    'ESC/ESH': '🇪🇺 ESC/ESH 2018',
    'NICE': '🇬🇧 NICE NG136',
    'Angola': '🇦🇴 Angola'
};

const LOCAL_TEMP_LABELS = {
    'oral': 'Oral',
    'axilar': 'Axilar',
    'timpanico': 'Timpânico',
    'retal': 'Retal'
};

// ============================================================================
// SECÇÃO 5: UTILITÁRIOS CLÍNICOS
// ============================================================================

function obterBlocoSinal(sinal, idadeMeses) {
    const cfg = referencias.fontes[sinal];
    if (!cfg) return null;

    let fonte = cfg.fonte || 'OMS';
    let fonteDB = DB_VITALS[fonte];

    // Se a fonte selecionada não existir ou não possuir
    // dados para este sinal, usar OMS como fallback
    if (!fonteDB || !fonteDB[sinal]) {
        fonte = 'OMS';
        fonteDB = DB_VITALS['OMS'];
    }

    if (!fonteDB || !fonteDB[sinal]) return null;

    const sinalDB = fonteDB[sinal];

    // Sem idade definida → usar referência de adulto
    if (idadeMeses == null) {
        return sinalDB['adulto']
            ? { chave: 'adulto', ...sinalDB['adulto'] }
            : null;
    }

    // Procurar a faixa etária correspondente
    for (const chave in sinalDB) {
        const bloco = sinalDB[chave];

        if (
            idadeMeses >= bloco.minMeses &&
            idadeMeses <= bloco.maxMeses
        ) {
            return {
                chave,
                ...bloco
            };
        }
    }

    // Fallback final para adulto
    return sinalDB['adulto']
        ? { chave: 'adulto', ...sinalDB['adulto'] }
        : null;
}

function obterBlocoPorFonte(fonte, sinal, idadeMeses) {
    const fonteDB = DB_VITALS[fonte];
    if (!fonteDB) return null;
    const sinalDB = fonteDB[sinal];
    if (!sinalDB) return null;
    if (idadeMeses == null) {
        return sinalDB['adulto'] ? { chave: 'adulto', ...sinalDB['adulto'] } : null;
    }
    for (const chave in sinalDB) {
        const bloco = sinalDB[chave];
        if (idadeMeses >= bloco.minMeses && idadeMeses <= bloco.maxMeses) {
            return { chave, ...bloco };
        }
    }
    return null;
}

function obterFonteSinal(sinal) {
    return referencias.fontes[sinal]?.fonte || 'OMS';
}

function obterLocalTemp() {
    return referencias.fontes.temp?.local || 'axilar';
}

function obterTermoClinico(valor, categorias) {
    if (!categorias || !Array.isArray(categorias) || categorias.length === 0) return null;
    for (const cat of categorias) {
        if (valor >= cat.min && valor <= cat.max) return cat.termo;
    }
    return null;
}

function obterTermoTemperatura(valor, blocoTemp, local) {
    if (typeof valor !== 'number' || isNaN(valor)) return null;
    if (!blocoTemp || !blocoTemp.local) return null;
    const localData = blocoTemp.local[local] || blocoTemp.local.oral;
    if (!localData || !localData.categorias) return null;
    return obterTermoClinico(valor, localData.categorias);
}

function unidadeParaMeses(valor, unidade) {
    if (valor == null) return null;
    const v = parseFloat(valor);
    if (isNaN(v)) return null;
    const u = UNIDADES_IDADE.find(x => x.value === unidade);
    return u ? u.paraMeses(v) : null;
}

function obterReferenciasParaTriagem(fontes, idadeMeses) {
    const r = {};
    const fcBloco = obterBlocoPorFonte(fontes.fc?.fonte || 'OMS', 'fc', idadeMeses);
    const frBloco = obterBlocoPorFonte(fontes.fr?.fonte || 'OMS', 'fr', idadeMeses);
    const tempBloco = obterBlocoPorFonte(fontes.temp?.fonte || 'OMS', 'temp', idadeMeses);
    const sato2Bloco = obterBlocoPorFonte(fontes.sato2?.fonte || 'OMS', 'sato2', idadeMeses);
    const taBloco = obterBlocoPorFonte(fontes.ta?.fonte || 'OMS', 'ta', idadeMeses);
    if (fcBloco) r.fc = fcBloco.ref;
    if (frBloco) r.fr = frBloco.ref;
    if (tempBloco) {
        const local = fontes.temp?.local || 'axilar';
        const localData = tempBloco.local?.[local] || tempBloco.local?.oral;
        if (localData) r.temp = localData.ref;
    }
    if (sato2Bloco) r.sato2 = sato2Bloco.ref;
    if (taBloco) {
        if (taBloco.sis) r.sis = taBloco.sis.ref;
        if (taBloco.dia) r.dia = taBloco.dia.ref;
    }
    return r;
}

// ============================================================================
// SECÇÃO 6: PLACEHOLDERS E ESTADO VAZIO
// ============================================================================

function mostrarPlaceholderResultado() {
    const res = document.getElementById("resultado");
    if (!res) return;
    res.innerHTML = `
        <div class="resultado-placeholder">
            <i class="ri-file-chart-line"></i>
            <div class="info">
                <h4>Aguardando interpretação</h4>
                <p>Insira os sinais vitais e clique em <strong>Interpretar</strong>.</p>
            </div>
        </div>`;
    res.style.background = "var(--card-bg)";
    res.style.color = "var(--text)";
    res.style.display = "block";
    res.style.boxShadow = "none";
}

function mostrarErro(mensagem) {
    const res = document.getElementById("resultado");
    res.innerHTML = `<div style="display: flex; align-items: center; gap: 12px; justify-content: center; text-align: center;">
        <i class="ri-error-warning-fill" style="font-size: 2rem;"></i>
        <span>${mensagem}</span>
    </div>`;
    res.style.background = "#ef4444";
    res.style.color = "white";
    res.style.display = "block";
    res.style.width = "100%";
}

// ============================================================================
// SECÇÃO 7: TEMA E MENU LATERAL
// ============================================================================

const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

if (themeBtn) {
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
}

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
        menuLateral.classList.contains('ativo') ? fecharMenu() : abrirMenu();
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
}

// ============================================================================
// SECÇÃO 8: GRAVIDADE / TRIAGEM
// ============================================================================

function calcularGravidade(nomePaciente) {
    if (!pacientes[nomePaciente]) {
        return { nivel: 'nao_urgente', cor: 'blue', pontuacao: 0, temDados: false, label: '🔵 Não Urgente' };
    }
    const hist = pacientes[nomePaciente].historico;
    if (!hist || hist.length === 0) {
        return { nivel: 'sem_dados', cor: 'gray', pontuacao: 0, temDados: false, label: '⚪ Sem dados' };
    }

    const ultima = hist[hist.length - 1];
    const fc = parseFloat(ultima.fc);
    const pas = parseFloat(ultima.sis);
    const spo2 = parseFloat(ultima.sato2);
    const temp = parseFloat(ultima.temp);
    const fr = parseFloat(ultima.fr);

    const temDados = !isNaN(fc) || !isNaN(pas) || !isNaN(spo2) || !isNaN(temp) || !isNaN(fr);
    if (!temDados) {
        return { nivel: 'sem_dados', cor: 'gray', pontuacao: 0, temDados: false, label: '⚪ Sem dados' };
    }

    const info = pacientes[nomePaciente].info;
    const idadeM = info.idade ? unidadeParaMeses(info.idade.valor, info.idade.unidade) : null;
    const refs = obterReferenciasParaTriagem(info.referencias?.fontes || referencias.fontes, idadeM);

    let nivel = 'nao_urgente';
    let pontuacao = 0;

    if (!isNaN(fc) && !isNaN(pas) && pas > 0 && (fc / pas) > 1.4) { nivel = 'critico'; pontuacao = 5; }
    if (!isNaN(spo2) && spo2 < 85) { nivel = 'critico'; pontuacao = 5; }
    if (!isNaN(fc) && (fc < 30 || fc > 200)) { nivel = 'critico'; pontuacao = 5; }
    if (!isNaN(pas) && (pas < 60 || pas > 200)) { nivel = 'critico'; pontuacao = 5; }
    if (!isNaN(temp) && (temp < 33 || temp > 41)) { nivel = 'critico'; pontuacao = 5; }
    if (!isNaN(fr) && (fr < 5 || fr > 40)) { nivel = 'critico'; pontuacao = 5; }

    if (nivel === 'nao_urgente' || nivel === 'pouco_urgente') {
        let laranja = false;
        if (!isNaN(fc) && !isNaN(pas) && pas > 0 && (fc / pas) > 1.0) laranja = true;
        if (!isNaN(spo2) && spo2 < 90) laranja = true;
        if (!isNaN(fc) && ((fc < 50 && fc >= 30) || fc > 150)) laranja = true;
        if (!isNaN(pas) && ((pas < 80 && pas >= 60) || pas > 180)) laranja = true;
        if (!isNaN(temp) && temp > 39.5) laranja = true;
        if (!isNaN(fr) && (fr < 8 || fr > 35)) laranja = true;
        if (laranja) { nivel = 'muito_urgente'; pontuacao = 4; }
    }

    if ((nivel === 'nao_urgente' || nivel === 'pouco_urgente') && refs) {
        let amarelo = false;
        if (!isNaN(fc) && refs.fc) {
            const centro = (refs.fc[0] + refs.fc[1]) / 2;
            if (Math.abs(fc - centro) / centro > 0.40) amarelo = true;
        }
        if (!isNaN(fr) && refs.fr) {
            const centro = (refs.fr[0] + refs.fr[1]) / 2;
            if (Math.abs(fr - centro) / centro > 0.40) amarelo = true;
        }
        if (!isNaN(temp) && refs.temp) {
            const limite = refs.temp[1] < 37.5 ? 38.0 : 38.5;
            if (temp > limite && temp <= 39.5) amarelo = true;
        }
        if (!isNaN(pas) && refs.sis) {
            if (pas > refs.sis[1] * 1.15 || pas < refs.sis[0] * 0.85) amarelo = true;
        }
        if (amarelo) { nivel = 'urgente'; pontuacao = 3; }
    }

    if (nivel === 'nao_urgente' && refs) {
        let verde = false;
        if (!isNaN(fc) && refs.fc) {
            const centro = (refs.fc[0] + refs.fc[1]) / 2;
            const d = Math.abs(fc - centro) / centro;
            if (d >= 0.20 && d <= 0.40) verde = true;
        }
        if (!isNaN(fr) && refs.fr && !verde) {
            const centro = (refs.fr[0] + refs.fr[1]) / 2;
            const d = Math.abs(fr - centro) / centro;
            if (d >= 0.20 && d <= 0.40) verde = true;
        }
        if (verde) { nivel = 'pouco_urgente'; pontuacao = 2; }
    }

    const labels = {
        'critico': '🔴 Crítico', 'muito_urgente': '🟠 Muito Urgente',
        'urgente': '🟡 Urgente', 'pouco_urgente': '🟢 Pouco Urgente',
        'nao_urgente': '🔵 Não Urgente', 'sem_dados': '⚪ Sem dados'
    };

    return { nivel, cor: 'auto', pontuacao, temDados: true, label: labels[nivel] };
}

function atualizarInterfaceGravidade(nomePaciente, elementoCard) {
    if (!elementoCard) return;
    let grav;
    if (cacheGravidade.has(nomePaciente)) {
        grav = cacheGravidade.get(nomePaciente);
    } else {
        grav = calcularGravidade(nomePaciente);
        cacheGravidade.set(nomePaciente, grav);
    }

    const bolha = elementoCard.querySelector('.bolha-gravidade');
    if (bolha) {
        const cores = { 'critico':'#ef4444','muito_urgente':'#f97316','urgente':'#eab308','pouco_urgente':'#22c55e','nao_urgente':'#3b82f6','sem_dados':'#9ca3af' };
        bolha.style.backgroundColor = cores[grav.nivel] || '#3b82f6';
        bolha.className = `bolha-gravidade ${grav.nivel}`;
        bolha.title = grav.temDados ? grav.label : 'Sem medições';
    }

    const txt = elementoCard.querySelector('.perfil-gravidade');
    if (txt) {
        txt.textContent = grav.label;
        txt.className = `perfil-gravidade ${grav.nivel}`;
    }
}

function ordenarListaPorTriagem() {
    const lista = document.getElementById('lista-pacientes');
    if (!lista) return;
    const itens = Array.from(lista.querySelectorAll('.perfil-item'));
    if (itens.length === 0) return;

    const ordem = { 'critico':0,'muito_urgente':1,'urgente':2,'pouco_urgente':3,'nao_urgente':4,'sem_dados':5 };

    itens.forEach(item => {
        const n = item.getAttribute('data-nome');
        if (n && !cacheGravidade.has(n)) cacheGravidade.set(n, calcularGravidade(n));
    });

    itens.sort((a, b) => {
        const gA = cacheGravidade.get(a.getAttribute('data-nome')) || { nivel: 'nao_urgente' };
        const gB = cacheGravidade.get(b.getAttribute('data-nome')) || { nivel: 'nao_urgente' };
        return ordem[gA.nivel] - ordem[gB.nivel];
    });
    itens.forEach(i => lista.appendChild(i));
    itens.forEach(i => atualizarInterfaceGravidade(i.getAttribute('data-nome'), i));
}

// ============================================================================
// SECÇÃO 9: ALERTAS CRUZADOS
// ============================================================================

function gerarAlertas(fc, pas, spo2, temp, fr) {
    const alertas = [];
    const temDados = !isNaN(fc) || !isNaN(pas) || !isNaN(spo2) || !isNaN(temp) || !isNaN(fr);
    if (!temDados) return [];

    if (!isNaN(temp) && !isNaN(fc) && temp > 38 && fc < 90)
        alertas.push({ tipo: 'dissociacao', gravidade: 'alto', icone: 'ri-alert-line', mensagem: 'Dissociação Pulso-Temperatura', detalhe: `Temp ${temp}°C com FC ${fc} bpm` });

    if (!isNaN(fc) && !isNaN(pas) && pas > 0 && (fc / pas) > 1.0)
        alertas.push({ tipo: 'choque', gravidade: 'critico', icone: 'ri-heart-pulse-line', mensagem: 'Risco de Choque', detalhe: `FC/PAS = ${(fc / pas).toFixed(2)}` });

    if (!isNaN(spo2) && !isNaN(fr) && spo2 < 90 && fr > 30)
        alertas.push({ tipo: 'desconforto', gravidade: 'critico', icone: 'ri-lungs-line', mensagem: 'Desconforto Respiratório Grave', detalhe: `SpO2 ${spo2}% com FR ${fr} ipm` });

    if (!isNaN(fc) && !isNaN(pas) && fc < 60 && pas < 90)
        alertas.push({ tipo: 'bradi_hipo', gravidade: 'alto', icone: 'ri-arrow-down-circle-line', mensagem: 'Bradicardia com Hipotensão', detalhe: `FC ${fc} bpm com PAS ${pas} mmHg` });

    if (!isNaN(fc) && !isNaN(temp) && fc > 100 && temp > 38)
        alertas.push({ tipo: 'taqui_febre', gravidade: 'medio', icone: 'ri-temp-hot-line', mensagem: 'Taquicardia com Febre', detalhe: `FC ${fc} bpm com Temp ${temp}°C` });

    if (!isNaN(spo2) && spo2 < 92 && spo2 >= 90)
        alertas.push({ tipo: 'hipoxemia_leve', gravidade: 'medio', icone: 'ri-drop-line', mensagem: 'Hipoxemia ligeira', detalhe: `SpO2 ${spo2}%` });

    return alertas;
}

function renderizarCardResultados() {
    const container = document.getElementById('card-resultados-principal');
    if (!container) return;

    const fcVal   = parseFloat(document.getElementById('fc')?.value);
    const frVal   = parseFloat(document.getElementById('fr')?.value);
    const tempVal = parseFloat(document.getElementById('temp')?.value);
    const spo2Val = parseFloat(document.getElementById('sato2')?.value);
    const pasVal  = parseFloat(document.getElementById('sis')?.value);

    const temValores = !isNaN(fcVal) || !isNaN(frVal) || !isNaN(tempVal) || !isNaN(spo2Val) || !isNaN(pasVal);

    let alertas = [];
    let titulo = 'Alertas Cruzados';
    let descricao = 'Insira valores ou selecione um paciente.';

    if (temValores) {
        alertas = gerarAlertas(fcVal, pasVal, spo2Val, tempVal, frVal);
        titulo = 'Alertas Cruzados (medição atual)';
    } else if (pacienteAtivo && pacientes[pacienteAtivo]) {
        const hist = pacientes[pacienteAtivo].historico;
        if (hist && hist.length > 0) {
            const u = hist[hist.length - 1];
            alertas = gerarAlertas(parseFloat(u.fc), parseFloat(u.sis), parseFloat(u.sato2), parseFloat(u.temp), parseFloat(u.fr));
            titulo = `Alertas Cruzados - ${pacienteAtivo}`;
            descricao = 'Última medição sem alertas.';
        } else {
            titulo = `Alertas Cruzados - ${pacienteAtivo}`;
            descricao = 'Sem medições registadas.';
        }
    }

    let html = '';
    if (alertas.length === 0) {
        html = `
            <div class="card-resultados-container card-resultados-vazio">
                <div class="card-resultados-header">
                    <div class="card-resultados-titulo">
                        <i class="ri-checkbox-circle-fill" style="color: #22c55e;"></i>
                        <span>${titulo}</span>
                    </div>
                    <span class="card-resultados-badge" style="background: rgba(34, 197, 94, 0.1); color: #22c55e;">0 alertas</span>
                </div>
                <div class="card-resultados-vazio-conteudo">
                    <i class="ri-check-double-line" style="color: #22c55e;"></i>
                    <div class="card-resultados-vazio-texto">
                        <span class="card-resultados-vazio-titulo">Nenhum alerta cruzado</span>
                        <span class="card-resultados-vazio-desc">${descricao}</span>
                    </div>
                </div>
            </div>`;
    } else {
        html = `
            <div class="card-resultados-container">
                <div class="card-resultados-header">
                    <div class="card-resultados-titulo">
                        <i class="ri-alert-fill" style="color: #f59e0b;"></i>
                        <span>${titulo}</span>
                    </div>
                    <span class="card-resultados-badge">${alertas.length} alerta${alertas.length > 1 ? 's' : ''}</span>
                </div>
                <ul class="card-resultados-lista">`;
        alertas.forEach(a => {
            const cores = { critico:'#ef4444', alto:'#f59e0b', medio:'#3b82f6' };
            const cor = cores[a.gravidade] || '#6b7280';
            const ico = a.gravidade === 'critico' ? '🔴' : a.gravidade === 'alto' ? '🟠' : '🟡';
            html += `
                <li class="card-resultados-item ${a.gravidade}">
                    <div class="card-resultados-icon" style="background: ${cor}20; color: ${cor};">
                        <i class="${a.icone}"></i>
                    </div>
                    <div class="card-resultados-conteudo">
                        <div class="card-resultados-mensagem">${a.mensagem}</div>
                        <div class="card-resultados-detalhe">${a.detalhe}</div>
                    </div>
                    <div class="card-resultados-gravidade ${a.gravidade}">${ico}</div>
                </li>`;
        });
        html += `</ul></div>`;
    }

    container.innerHTML = html;
    container.style.display = 'block';
}

// ============================================================================
// SECÇÃO 10: GESTÃO DE PACIENTES (SIDEBAR)
// ============================================================================

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    if (overlay) overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
}

function fecharSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function toggleCadastro() {
    const f = document.getElementById('cadastroFields');
    const i = document.getElementById('toggleIcon');
    if (f) f.classList.toggle('aberto');
    if (i) i.classList.toggle('rotated');
}

function atualizarContador() {
    const c = document.getElementById('contadorPacientes');
    if (c) c.textContent = Object.keys(pacientes).length;
}

function cadastrarPaciente() {
    const nome = document.getElementById('p-nome').value.trim();
    if (!nome) { alert("Informe o nome do paciente."); return; }
    if (pacientes[nome]) { alert("Já existe um paciente com este nome!"); return; }

    if (!referencias.idade || referencias.idade.valor == null) {
        alert("Defina a idade no painel de referências antes de cadastrar.");
        return;
    }

    pacientes[nome] = {
        info: {
            idade: { ...referencias.idade },
            referencias: {
                fontes: JSON.parse(JSON.stringify(referencias.fontes))
            }
        },
        historico: []
    };
    localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
    limparCacheGravidade();
    renderListaNomes();
    document.getElementById('p-nome').value = '';

    const f = document.getElementById('cadastroFields');
    const i = document.getElementById('toggleIcon');
    if (f) f.classList.remove('aberto');
    if (i) i.classList.remove('rotated');
}

function removerPerfil(nome) {
    if (!confirm(`Remover ${nome} e todo o histórico?`)) return;
    if (pacienteAtivo === nome) ativarModoPadrao();
    delete pacientes[nome];
    localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
    limparCacheGravidade();
    renderListaNomes();
}

function renderListaNomes() {
    const lista = document.getElementById('lista-pacientes');
    if (!lista) return;

    Object.keys(pacientes).forEach(n => {
        cacheGravidade.set(n, calcularGravidade(n));
    });

    lista.innerHTML = Object.keys(pacientes).reverse().map(nome => {
        const p = pacientes[nome];
        const idadeFmt = p.info.idade
            ? `${p.info.idade.valor} ${p.info.idade.unidade}`
            : 'sem idade';
        const grav = cacheGravidade.get(nome) || { nivel: 'nao_urgente', temDados: false };
        const infoGrav = GRAVIDADE_MAP[grav.nivel] || GRAVIDADE_MAP['nao_urgente'];

        return `
        <div class="perfil-item" data-nome="${nome}">
            <div class="perfil-info" onclick="selecionarPaciente('${nome.replace(/'/g, "\\'")}')">
                <div class="perfil-header">
                    <span class="bolha-gravidade ${grav.nivel}" style="background-color: ${infoGrav.cor};" title="${grav.temDados ? infoGrav.label : 'Sem dados'}"></span>
                    <strong>${nome}</strong>
                </div>
                <div class="perfil-detalhes">
                    <span class="perfil-faixa">${idadeFmt}</span>
                    <span class="perfil-separador">•</span>
                    <span class="perfil-gravidade ${grav.nivel}">${grav.temDados ? infoGrav.label : '⚪ Sem dados'}</span>
                </div>
            </div>
            <button class="btn-remover-perfil" onclick="removerPerfil('${nome.replace(/'/g, "\\'")}')">
                <i class="ri-delete-bin-7-line"></i>
            </button>
        </div>`;
    }).join('');

    if (pacienteAtivo) {
        document.querySelectorAll('#lista-pacientes .perfil-item').forEach(el => {
            el.classList.toggle('selecionado', el.getAttribute('data-nome') === pacienteAtivo);
        });
        renderizarCardResultados();
    }
    atualizarContador();
}

function selecionarPaciente(nome) {
    pacienteAtivo = nome;
    const p = pacientes[nome];

    referencias.idade = { ...p.info.idade };
    referencias.fontes = JSON.parse(JSON.stringify(p.info.referencias.fontes));

    sincronizarTempLocalDoCampo();
    atualizarBarraResumo();

    document.getElementById('controles-padrao').style.display = 'none';
    document.getElementById('tag-paciente').style.display = 'flex';
    document.getElementById('btn-exportar').style.display = 'flex';
    document.getElementById('nome-exibicao').innerText = "Monitorizando: " + nome;
    document.getElementById('detalhes-exibicao').innerText = `${p.info.idade.valor} ${p.info.idade.unidade}`;

    document.querySelectorAll('#lista-pacientes .perfil-item').forEach(el => {
        el.classList.remove('selecionado');
        if (el.getAttribute('data-nome') === nome) el.classList.add('selecionado');
    });

    carregarGraficoPaciente();
    renderizarCardResultados();
    fecharSidebar();
}

function ativarModoPadrao() {
    pacienteAtivo = null;
    document.getElementById('controles-padrao').style.display = 'none';
    document.getElementById('tag-paciente').style.display = 'none';
    document.getElementById('btn-exportar').style.display = 'none';

    document.querySelectorAll('#lista-pacientes .perfil-item').forEach(el => el.classList.remove('selecionado'));

    ["sis", "dia", "fc", "fr", "temp", "sato2"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    mostrarPlaceholderResultado();
    document.getElementById("caixa_ta").classList.remove("campo-incompleto");

    historicoMedicoes = [];
    if (graficoAtual) { graficoAtual.destroy(); graficoAtual = null; }

    carregarReferenciasGuardadas();
    sincronizarTempLocalDoCampo();
    atualizarBarraResumo();

    fecharSidebar();
    atualizarGrafico();
    renderizarCardResultados();
}

function filtrarPacientes() {
    const termo = document.getElementById('buscarPaciente').value.toLowerCase().trim();
    const container = document.getElementById('lista-pacientes');
    const antigo = document.getElementById('semResultados');
    if (antigo) antigo.remove();

    function removerAcentos(t) { return t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    const termoSem = removerAcentos(termo);

    const nomes = Object.keys(pacientes).reverse();
    const filtrados = nomes.filter(n => termo === '' || removerAcentos(n.toLowerCase()).includes(termoSem));

    if (termo !== '' && filtrados.length === 0) {
        container.innerHTML = `<div id="semResultados" style="padding: 30px 20px; text-align: center; color: var(--text); opacity: 0.5;">
            <i class="ri-search-2-line" style="font-size: 2rem; display: block; margin-bottom: 8px; opacity: 0.4;"></i>
            <span style="font-size: 0.85rem;">Nenhum paciente encontrado</span>
        </div>`;
        return;
    }

    container.innerHTML = filtrados.map(nome => {
        const p = pacientes[nome];
        const idadeFmt = p.info.idade ? `${p.info.idade.valor} ${p.info.idade.unidade}` : 'sem idade';
        const grav = calcularGravidade(nome);
        const infoGrav = GRAVIDADE_MAP[grav.nivel] || GRAVIDADE_MAP['nao_urgente'];
        return `
        <div class="perfil-item" data-nome="${nome}">
            <div class="perfil-info" onclick="selecionarPaciente('${nome.replace(/'/g, "\\'")}')">
                <div class="perfil-header">
                    <span class="bolha-gravidade ${grav.nivel}" style="background-color: ${infoGrav.cor};"></span>
                    <strong>${nome}</strong>
                </div>
                <div class="perfil-detalhes">
                    <span class="perfil-faixa">${idadeFmt}</span>
                    <span class="perfil-separador">•</span>
                    <span class="perfil-gravidade ${grav.nivel}">${grav.temDados ? infoGrav.label : '⚪ Sem dados'}</span>
                </div>
            </div>
            <button class="btn-remover-perfil" onclick="removerPerfil('${nome.replace(/'/g, "\\'")}')">
                <i class="ri-delete-bin-7-line"></i>
            </button>
        </div>`;
    }).join('');

    document.querySelectorAll('#lista-pacientes .perfil-item').forEach(item => {
        atualizarInterfaceGravidade(item.getAttribute('data-nome'), item);
    });
    atualizarContador();
}

function abrirSidebarPacientes() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const mO = document.getElementById('menuOverlay');
    const mL = document.getElementById('menuLateral');
    if (mO?.classList.contains('ativo')) {
        mO.classList.remove('ativo');
        mL?.classList.remove('ativo');
        document.body.style.overflow = '';
    }

    sidebar.classList.toggle('active');
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
}

// ============================================================================
// SECÇÃO 11: SELECT DE TEMPERATURA LOCAL NO CAMPO PRINCIPAL
// ============================================================================

function toggleTempLocalSelect(event) {
    if (event) event.stopPropagation();
    if (pacienteAtivo) return;
    const options = document.getElementById('tempLocalOptions');
    const trigger = document.querySelector('#tempLocalSelect .custom-select-trigger-temp');
    if (!options || !trigger) return;

    fecharTodosOsSelectsPainel();

    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

function selecionarLocalTemp(valor, event) {
    if (event) event.stopPropagation();
    if (pacienteAtivo) return;

    const el = document.getElementById('tempLocalSelecionado');

    document.querySelectorAll('#tempLocalOptions .custom-select-option-temp').forEach(o => {
        o.classList.toggle('selected', o.dataset.value === valor);
    });
    if (el) el.textContent = LOCAL_TEMP_LABELS[valor] || 'Axilar';

    document.getElementById('tempLocalOptions')?.classList.remove('aberto');
    document.querySelector('#tempLocalSelect .custom-select-trigger-temp')?.classList.remove('aberto');

    referencias.fontes.temp.local = valor;
    gravarReferencias();
    atualizarBarraResumo();
}

// ============================================================================
// SECÇÃO 12: PAINEL DE REFERÊNCIAS + BARRA DE RESUMO
// ============================================================================

function togglePainelReferencias() {
    const painel = document.getElementById('painelReferencias');
    if (!painel) return;
    if (painel.classList.contains('aberto')) {
        fecharPainelReferencias();
    } else {
        painel.classList.toggle('readonly', !!pacienteAtivo);
        painel.classList.add('aberto');
        sincronizarPainelComEstado();
    }
}

function fecharPainelReferencias() {
    document.getElementById('painelReferencias')?.classList.remove('aberto');
    fecharTodosOsSelectsPainel();
}

// Fontes disponíveis por sinal
const FONTES_DISPONIVEIS = {
    fc:    ['OMS', 'Medscape'],
    fr:    ['OMS', 'Medscape'],
    temp:  ['OMS'],
    sato2: ['OMS'],
    ta:    ['OMS', 'AHA/ACC', 'AAP/AHA', 'ESC/ESH', 'NICE']
};

// No painel, gerar opções dinamicamente:
function gerarOpcoesFonte(sinal, fonteAtual) {
    const fontes = FONTES_DISPONIVEIS[sinal] || ['OMS'];
    const container = document.getElementById('painelOptions_' + sinal);
    if (!container) return;
    
    container.innerHTML = fontes.map(f => `
        <div class="custom-select-option-painel ${f === fonteAtual ? 'selected' : ''}" 
             data-value="${f}"
             onclick="selecionarPainelFonte('${sinal}', '${f}', '${FONTE_LABELS[f] || f}', event)">
            <span class="option-label">${FONTE_LABELS[f] || f}</span>
        </div>
    `).join('');
}

function aplicarPainelReferencias() {
    if (pacienteAtivo) return;

    const inpIdade = document.getElementById('painelIdadeValor');
    const val = parseFloat(inpIdade.value);
    if (inpIdade.value.trim() !== '' && (isNaN(val) || val < 0)) {
        alert('A idade deve ser um número positivo.');
        return;
    }

    referencias.idade = {
        valor: inpIdade.value.trim() === '' ? null : val,
        unidade: painelTemp.idade.unidade
    };
    referencias.fontes = JSON.parse(JSON.stringify(painelTemp.fontes));

    gravarReferencias();
    atualizarBarraResumo();
    sincronizarTempLocalDoCampo();
    fecharPainelReferencias();

    // Se havia resultado na tela, re-interpreta
    const res = document.getElementById('resultado');
    if (res && !res.querySelector('.resultado-placeholder')) {
        interpretar();
    }
}

function gravarReferencias() {
    if (pacienteAtivo) return;
    localStorage.setItem('referencias_ativas', JSON.stringify(referencias));
}

function carregarReferenciasGuardadas() {
    const salvo = localStorage.getItem('referencias_ativas');
    if (!salvo) return;
    try {
        const parsed = JSON.parse(salvo);
        if (parsed && parsed.fontes) {
            referencias = {
                idade: parsed.idade || { valor: null, unidade: 'anos' },
                fontes: parsed.fontes
            };
        }
    } catch (e) { console.warn('Erro a ler referências guardadas:', e); }
}

function atualizarBarraResumo() {
    const elIdade = document.getElementById('resumoIdade');
    const elFontes = document.getElementById('resumoFontes');

    if (elIdade) elIdade.textContent = idadeFormatada();

    if (elFontes) {
        const partes = [];
        ['fc', 'fr', 'temp', 'sato2', 'ta'].forEach(s => {
            const f = referencias.fontes[s]?.fonte || 'OMS';
            const sigla = { fc:'FC', fr:'FR', temp:'Temp', sato2:'SatO2', ta:'TA' }[s];
            partes.push(`${sigla}: ${f}`);
        });
        elFontes.textContent = partes.join('  •  ');
    }
}

function sincronizarTempLocalDoCampo() {
    const local = referencias.fontes.temp?.local || 'axilar';

    const el = document.getElementById('tempLocalSelecionado');
    if (el) el.textContent = LOCAL_TEMP_LABELS[local] || 'Axilar';

    document.querySelectorAll('#tempLocalOptions .custom-select-option-temp').forEach(o => {
        o.classList.toggle('selected', o.dataset.value === local);
    });
}

// ─── SELECT: Unidade de Idade (dentro do painel) ───
function toggleIdadeUnidadeSelect(event) {
    if (event) event.stopPropagation();
    if (pacienteAtivo) return;

    const options = document.getElementById('idadeUnidadeOptions');
    const trigger = document.querySelector('#idadeUnidadeSelect .custom-select-trigger-idade');
    if (!options || !trigger) return;

    const estavaAberto = options.classList.contains('aberto');
    fecharTodosOsSelectsPainel();

    if (!estavaAberto) {
        options.classList.add('aberto');
        trigger.classList.add('aberto');
    }
}

function selecionarUnidadeIdade(valor, event) {
    if (event) event.stopPropagation();
    if (pacienteAtivo) return;

    painelTemp.idade.unidade = valor;

    const u = UNIDADES_IDADE.find(x => x.value === valor);
    const span = document.getElementById('idadeUnidadeSelecionada');
    if (span) span.textContent = u ? u.label : 'Anos';

    document.querySelectorAll('#idadeUnidadeOptions .custom-select-option-idade').forEach(o => {
        o.classList.toggle('selected', o.dataset.value === valor);
    });

    fecharSelectIdade();
}

function fecharSelectIdade() {
    document.getElementById('idadeUnidadeOptions')?.classList.remove('aberto');
    document.querySelector('#idadeUnidadeSelect .custom-select-trigger-idade')?.classList.remove('aberto');
}

// ─── SELECTS: Fontes no painel ───
function togglePainelSelect(sinal, event) {
    if (event) event.stopPropagation();
    if (pacienteAtivo) return;

    const options = document.getElementById('painelOptions_' + sinal);
    const trigger = document.querySelector(`#painelSelect_${sinal} .custom-select-trigger-painel`);
    if (!options || !trigger) return;

    const estavaAberto = options.classList.contains('aberto');
    fecharTodosOsSelectsPainel();

    if (!estavaAberto) {
        options.classList.add('aberto');
        trigger.classList.add('aberto');
    }
}

function selecionarPainelFonte(sinal, valor, label, event) {
    if (event) event.stopPropagation();
    if (pacienteAtivo) return;

    painelTemp.fontes[sinal] = { ...(painelTemp.fontes[sinal] || {}), fonte: valor };

    const span = document.getElementById('painelFonteSelecionada_' + sinal);
    if (span) span.textContent = label;

    document.querySelectorAll(`#painelOptions_${sinal} .custom-select-option-painel`).forEach(o => {
        o.classList.toggle('selected', o.dataset.value === valor);
    });

    fecharSelectPainel(sinal);
}



function fecharSelectPainel(sinal) {
    document.getElementById('painelOptions_' + sinal)?.classList.remove('aberto');
    document.querySelector(`#painelSelect_${sinal} .custom-select-trigger-painel`)?.classList.remove('aberto');
}

function fecharTodosOsSelectsPainel() {
    document.querySelectorAll('.custom-select-options-painel.aberto').forEach(el => el.classList.remove('aberto'));
    document.querySelectorAll('.custom-select-trigger-painel.aberto').forEach(el => el.classList.remove('aberto'));
    fecharSelectIdade();
}



// ============================================================================
// SECÇÃO 12.5: MODAL DE EDIÇÃO DE PONTO DO GRÁFICO
// ============================================================================

// Traduz o label do dataset (usado no gráfico) para o campo do histórico
function traduzirLabelParaCampo(label) {
    const mapa = {
        'FC': 'fc',
        'FR': 'fr',
        'Temp': 'temp',
        'SatO2': 'sato2',
        'Sistólica': 'sis',
        'Diastólica': 'dia'
    };
    return mapa[label] || null;
}

// Metadados de cada campo (para o modal)
const CAMPOS_MODAL = {
    fc:    { nome: 'Frequência Cardíaca',     icone: 'ri-heart-pulse-fill', unidade: 'bpm',   min: 0, max: 500 },
    fr:    { nome: 'Frequência Respiratória', icone: 'ri-lungs-fill',       unidade: 'ipm',   min: 0, max: 200 },
    temp:  { nome: 'Temperatura',             icone: 'ri-temp-hot-line',    unidade: '°C',    min: 20, max: 45 },
    sato2: { nome: 'Saturação O₂',            icone: 'ri-drop-line',        unidade: '%',     min: 0, max: 100 },
    sis:   { nome: 'PA Sistólica',            icone: 'ri-h-1',              unidade: 'mmHg',  min: 0, max: 350 },
    dia:   { nome: 'PA Diastólica',           icone: 'ri-h-2',              unidade: 'mmHg',  min: 0, max: 250 }
};

// Abre o modal com os dados do ponto clicado
function abrirModalPonto(idxReal, campo, datasetIndex) {
    let registo = null;

    // Com paciente ativo: usa o histórico do paciente
    if (pacienteAtivo && pacientes[pacienteAtivo]) {
        const hist = pacientes[pacienteAtivo].historico;
        if (!hist || !hist[idxReal]) return;
        registo = hist[idxReal];
    } else {
        // Sem paciente: usa o histórico em memória
        if (!historicoMedicoes || !historicoMedicoes[idxReal]) return;
        registo = historicoMedicoes[idxReal];
    }

    const valor = registo[campo];
    const meta = CAMPOS_MODAL[campo];
    if (!meta) return;

    pontoSelecionado = { idxReal, campo, datasetIndex };

    // Data + hora
    const elData = document.getElementById('modalPontoData');
    if (elData) {
        const data = registo.data || (registo.timestamp ? new Date(registo.timestamp).toLocaleDateString() : '—');
        const hora = registo.hora || (registo.timestamp ? new Date(registo.timestamp).toLocaleTimeString() : '—');
        elData.textContent = `📅 ${data}  •  ${hora}`;
    }

    const elIcone = document.getElementById('modalPontoSinalIcone');
    if (elIcone) elIcone.innerHTML = `<i class="${meta.icone}"></i>`;

    const elNome = document.getElementById('modalPontoSinalNome');
    if (elNome) elNome.textContent = meta.nome;

    const valorNum = parseFloat(valor);
    const valorTexto = (!isNaN(valorNum)) ? `${valorNum} ${meta.unidade}` : '—';
    const elValor = document.getElementById('modalPontoSinalValor');
    if (elValor) elValor.textContent = valorTexto;

    const elStatus = document.getElementById('modalPontoSinalStatus');
    if (elStatus) {
        if (!isNaN(valorNum)) {
            const status = obterStatusPonto(valorNum, campo);
            elStatus.textContent = `${status.icone} ${status.texto}`;
            elStatus.className = `modal-ponto-sinal-status ${status.classe}`;
        } else {
            elStatus.textContent = '—';
            elStatus.className = 'modal-ponto-sinal-status';
        }
    }

    const input = document.getElementById('modalPontoInput');
    if (input) input.value = (!isNaN(valorNum)) ? valorNum : '';

    const overlay = document.getElementById('modalPontoOverlay');
    if (overlay) overlay.classList.add('aberto');
}

// Fecha o modal
function fecharModalPonto() {
    const overlay = document.getElementById('modalPontoOverlay');
    if (overlay) overlay.classList.remove('aberto');
    pontoSelecionado = null;
}

// Devolve o status do valor face às referências ativas
function obterStatusPonto(valor, campo) {
    const idadeM = pacienteAtivo && pacientes[pacienteAtivo]
        ? unidadeParaMeses(pacientes[pacienteAtivo].info.idade.valor, pacientes[pacienteAtivo].info.idade.unidade)
        : idadeEmMeses();

    const fontesPaciente = pacienteAtivo && pacientes[pacienteAtivo]
        ? (pacientes[pacienteAtivo].info.referencias?.fontes || referencias.fontes)
        : referencias.fontes;

    let ref = null;

    if (campo === 'sis' || campo === 'dia') {
        const bloco = obterBlocoPorFonte(fontesPaciente.ta?.fonte || 'OMS', 'ta', idadeM);
        if (bloco && bloco[campo]) ref = bloco[campo].ref;
    } else if (campo === 'temp') {
        const bloco = obterBlocoPorFonte(fontesPaciente.temp?.fonte || 'OMS', 'temp', idadeM);
        if (bloco) {
            const local = fontesPaciente.temp?.local || 'axilar';
            const localData = bloco.local?.[local] || bloco.local?.oral;
            if (localData) ref = localData.ref;
        }
    } else {
        const bloco = obterBlocoPorFonte(fontesPaciente[campo]?.fonte || 'OMS', campo, idadeM);
        if (bloco) ref = bloco.ref;
    }

    if (!ref) {
        return { texto: 'Sem referência', icone: '?', classe: '' };
    }

    if (valor < ref[0]) return { texto: 'Baixo',  icone: '↓', classe: 'baixo' };
    if (valor > ref[1]) return { texto: 'Alto',   icone: '↑', classe: 'alto' };
    return { texto: 'Normal', icone: '✓', classe: 'normal' };
}

// Guarda a edição do valor
function guardarPontoGrafico() {
    if (!pontoSelecionado) return;

    const input = document.getElementById('modalPontoInput');
    if (!input) return;

    const valorRaw = input.value.trim();
    const { idxReal, campo } = pontoSelecionado;

    if (valorRaw === '') {
        fecharModalPonto();
        return;
    }

    const novoValor = parseFloat(valorRaw);
    if (isNaN(novoValor)) {
        fecharModalPonto();
        return;
    }

    const meta = CAMPOS_MODAL[campo];
    if (novoValor < meta.min || novoValor > meta.max) {
        alert(`${meta.nome} deve estar entre ${meta.min} e ${meta.max}!`);
        return;
    }

    // ─────────────────────────────────────────────
    // MODO PACIENTE: guarda no histórico do paciente
    // ─────────────────────────────────────────────
    if (pacienteAtivo && pacientes[pacienteAtivo]) {
        const hist = pacientes[pacienteAtivo].historico;
        if (!hist || !hist[idxReal]) { fecharModalPonto(); return; }

        const valorAtual = hist[idxReal][campo];
        if (parseFloat(valorAtual) === novoValor) { fecharModalPonto(); return; }

        hist[idxReal][campo] = novoValor;
        localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
        limparCacheGravidade();

        renderListaNomes();
        const toggleTriagem = document.getElementById('toggle-triagem');
        if (toggleTriagem && toggleTriagem.checked) ordenarListaPorTriagem();
        carregarGraficoPaciente();
        renderizarCardResultados();
    }
    // ─────────────────────────────────────────────
    // MODO SEM PACIENTE: guarda só em memória
    // ─────────────────────────────────────────────
    else {
        if (!historicoMedicoes[idxReal]) { fecharModalPonto(); return; }

        const valorAtual = historicoMedicoes[idxReal][campo];
        if (parseFloat(valorAtual) === novoValor) { fecharModalPonto(); return; }

        historicoMedicoes[idxReal][campo] = novoValor;

        // Re-render do gráfico apenas
        atualizarGrafico();
    }

    fecharModalPonto();
}

// Remove o valor do ponto
function removerPontoGrafico() {
    if (!pontoSelecionado) return;

    const { idxReal, campo } = pontoSelecionado;
    const meta = CAMPOS_MODAL[campo];

    if (!confirm(`Remover ${meta ? meta.nome : 'este valor'}?`)) return;

    // ─────────────────────────────────────────────
    // MODO PACIENTE
    // ─────────────────────────────────────────────
    if (pacienteAtivo && pacientes[pacienteAtivo]) {
        const hist = pacientes[pacienteAtivo].historico;
        if (!hist || !hist[idxReal]) { fecharModalPonto(); return; }

        hist[idxReal][campo] = '';

        const camposSinais = ['fc', 'fr', 'temp', 'sato2', 'sis', 'dia'];
        const tudoVazio = camposSinais.every(c => !hist[idxReal][c] || hist[idxReal][c] === '');
        if (tudoVazio) hist.splice(idxReal, 1);

        localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
        limparCacheGravidade();

        renderListaNomes();
        const toggleTriagem = document.getElementById('toggle-triagem');
        if (toggleTriagem && toggleTriagem.checked) ordenarListaPorTriagem();
        carregarGraficoPaciente();
        renderizarCardResultados();
    }
    // ─────────────────────────────────────────────
    // MODO SEM PACIENTE
    // ─────────────────────────────────────────────
    else {
        if (!historicoMedicoes[idxReal]) { fecharModalPonto(); return; }

        historicoMedicoes[idxReal][campo] = '';

        // Se a medição ficou toda vazia, remove-a
        const camposSinais = ['fc', 'fr', 'temp', 'sato2', 'sis', 'dia'];
        const tudoVazio = camposSinais.every(c => !historicoMedicoes[idxReal][c] || historicoMedicoes[idxReal][c] === '');
        if (tudoVazio) historicoMedicoes.splice(idxReal, 1);

        atualizarGrafico();
    }

    fecharModalPonto();
}




// ============================================================================
// SECÇÃO 13: GRÁFICO
// ============================================================================

function resetarGrafico() {
    historicoMedicoes = [];
    if (graficoAtual) { graficoAtual.destroy(); graficoAtual = null; }

    const ph = document.getElementById('graficoPlaceholder');
    const cv = document.getElementById('graficoSinais');
    const bd = document.getElementById('graficoBadge');
    const ins = document.getElementById('graficoInstrucao');
    const lg = document.getElementById('graficoLegenda');

    if (bd) { bd.textContent = 'Aguardando dados'; bd.classList.add('aguardando'); }
    if (ins) ins.style.display = 'none';
    if (lg) { lg.innerHTML = ''; lg.style.display = 'none'; }
    if (ph) {
        ph.style.display = 'block';
        ph.innerHTML = `<div class="grafico-indisponivel">
            <i class="ri-bar-chart-2-line"></i>
            <div class="info"><h4>Sem medições registadas</h4><p>Adicione a primeira medição para ver o gráfico.</p></div>
        </div>`;
    }
    if (cv) cv.style.display = 'none';
}

function adicionarMedicao(registro) {
    historicoMedicoes.push(registro);
    if (historicoMedicoes.length > 20) historicoMedicoes.shift();
    atualizarGrafico();
}

function carregarGraficoPaciente() {
    if (!pacienteAtivo || !pacientes[pacienteAtivo]) {
        historicoMedicoes = [];
        atualizarGrafico();
        return;
    }
    const p = pacientes[pacienteAtivo];
    if (!p.historico || p.historico.length === 0) {
        historicoMedicoes = [];
        atualizarGrafico();
        return;
    }
    historicoMedicoes = p.historico.map(r => {
        const dp = r.data.split('/');
        const hp = r.hora.split(':');
        return {
            timestamp: new Date(parseInt(dp[2]), parseInt(dp[1]) - 1, parseInt(dp[0]), parseInt(hp[0]) || 0, parseInt(hp[1]) || 0).getTime(),
            fc: r.fc || "", fr: r.fr || "", temp: r.temp || "", sato2: r.sato2 || "", sis: r.sis || "", dia: r.dia || ""
        };
    });
    if (historicoMedicoes.length > 20) historicoMedicoes = historicoMedicoes.slice(-20);
    atualizarGrafico();
}

function atualizarGrafico() {
    const ph = document.getElementById('graficoPlaceholder');
    const cv = document.getElementById('graficoSinais');
    const bd = document.getElementById('graficoBadge');
    const ins = document.getElementById('graficoInstrucao');
    const lg = document.getElementById('graficoLegenda');

    if (historicoMedicoes.length === 0) {
        if (bd) { bd.textContent = 'Aguardando dados'; bd.classList.add('aguardando'); }
        if (ins) ins.style.display = 'none';
        if (lg) { lg.innerHTML = ''; lg.style.display = 'none'; }
        if (ph) {
            ph.style.display = 'block';
            ph.innerHTML = `<div class="grafico-indisponivel">
                <i class="ri-bar-chart-2-line"></i>
                <div class="info"><h4>Sem medições registadas</h4><p>Adicione a primeira medição para ver o gráfico.</p></div>
            </div>`;
        }
        if (cv) cv.style.display = 'none';
        return;
    }

    if (bd) { bd.textContent = `${historicoMedicoes.length} medições • Tendência`; bd.classList.remove('aguardando'); }
    if (ins) ins.style.display = 'flex';
    if (lg) lg.style.display = 'flex';
    if (ph) ph.style.display = 'none';
    if (cv) { cv.style.display = 'block'; criarGrafico(); setTimeout(gerarLegendaToggle, 100); }
}

function gerarLegendaToggle() {
    const c = document.getElementById('graficoLegenda');
    if (!c || !graficoAtual || historicoMedicoes.length === 0) { if (c) c.style.display = 'none'; return; }
    c.style.display = 'flex';
    let html = '';
    graficoAtual.data.datasets.forEach((ds, i) => {
        const hidden = graficoAtual.getDatasetMeta(i).hidden || false;
        html += `<div class="legenda-toggle-item ${hidden ? 'oculto' : 'ativo'}" data-dataset-index="${i}" onclick="toggleDataset(${i})">
            <span class="legenda-cor" style="background: ${ds.borderColor};"></span>
            <span class="legenda-nome">${ds.label}</span>
            <span class="legenda-slider"></span>
        </div>`;
    });
    c.innerHTML = html;
}

function toggleDataset(index) {
    if (!graficoAtual) return;
    const meta = graficoAtual.getDatasetMeta(index);
    meta.hidden = !meta.hidden;
    graficoAtual.update();
    gerarLegendaToggle();
}

function criarGrafico() {
    const canvas = document.getElementById('graficoSinais');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const idadeM = idadeEmMeses();
    const refMap = {};
    ['fc', 'fr', 'temp', 'sato2', 'ta'].forEach(s => {
        const bloco = obterBlocoSinal(s, idadeM);
        if (!bloco) return;
        if (s === 'temp') {
            const local = obterLocalTemp();
            const localData = bloco.local?.[local] || bloco.local?.oral;
            if (localData) refMap.temp = localData.ref;
        } else if (s === 'ta') {
            if (bloco.sis) refMap.sis = bloco.sis.ref;
            if (bloco.dia) refMap.dia = bloco.dia.ref;
        } else {
            refMap[s] = bloco.ref;
        }
    });

    const labelMap = { fc:'FC', fr:'FR', temp:'Temp', sato2:'SatO2', sis:'Sistólica', dia:'Diastólica' };
    const unidadeMap = { fc:'bpm', fr:'ipm', temp:'°C', sato2:'%', sis:'mmHg', dia:'mmHg' };

    function getStatus(valor, campo) {
        if (valor == null || isNaN(valor)) return null;
        const lim = refMap[campo]; if (!lim) return null;
        if (valor < lim[0]) return { texto:'Baixo', icone:'↓' };
        if (valor > lim[1]) return { texto:'Alto', icone:'↑' };
        return { texto:'Normal', icone:'✓' };
    }

    const datas = historicoMedicoes.map(h => new Date(h.timestamp));
    const usarDias = [...new Set(datas.map(d => d.toDateString()))].length > 1;
    const labels = historicoMedicoes.map(h => {
        const d = new Date(h.timestamp);
        if (usarDias) return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    });

    const maxLabels = 10;
    let indicesExibidos = historicoMedicoes.map((_, i) => i);
    let labelsExibidas = labels;
    if (labels.length > maxLabels) {
        const step = Math.ceil(labels.length / maxLabels);
        indicesExibidos = [];
        for (let i = 0; i < labels.length; i += step) indicesExibidos.push(i);
        if (indicesExibidos[indicesExibidos.length-1] !== labels.length-1) indicesExibidos.push(labels.length-1);
        labelsExibidas = indicesExibidos.map(i => labels[i]);
    }
    // Guarda o mapeamento para o clique nos pontos
    mapaIndicesGrafico = [...indicesExibidos];

    const configs = [
        { label:'FC',         key:'fc',    cor:'#00843d' },
        { label:'FR',         key:'fr',    cor:'#2563eb' },
        { label:'Temp',       key:'temp',  cor:'#d97706' },
        { label:'SatO2',      key:'sato2', cor:'#7c3aed' },
        { label:'Sistólica',  key:'sis',   cor:'#dc2626' },
        { label:'Diastólica', key:'dia',   cor:'#db2777' }
    ];

    const uma = historicoMedicoes.length === 1;
    const datasets = [];
    configs.forEach(c => {
        const data = historicoMedicoes.map(h => {
            const v = h[c.key];
            return v && v !== "" && !isNaN(parseFloat(v)) ? parseFloat(v) : null;
        });
        if (data.some(v => v !== null)) {
            datasets.push({
                label: c.label,
                data: indicesExibidos.map(i => data[i]),
                borderColor: c.cor,
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: uma ? 5 : 2.5,
                pointBackgroundColor: c.cor,
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                spanGaps: true,
                fill: false,
                borderWidth: uma ? 0 : 1.5
            });
        }
    });

    if (datasets.length === 0) return;
    if (graficoAtual) { graficoAtual.destroy(); graficoAtual = null; }

    graficoAtual = new Chart(ctx, {
    type: 'line',
    data: { labels: labelsExibidas, datasets },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        interaction: { mode: 'nearest', intersect: false },
        onClick: (event, elements) => {
            if (elements.length === 0) return;
            const el = elements[0];
            const dataIndexVisivel = el.index;
            const idxReal = mapaIndicesGrafico[dataIndexVisivel];
            if (idxReal == null) return;

            const labelDataset = el.element.$context.dataset.label;
            const campo = traduzirLabelParaCampo(labelDataset);
            if (!campo) return;

            abrirModalPonto(idxReal, campo, el.datasetIndex);
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.85)',
                titleFont: { size: 11, weight: '600' },
                bodyFont: { size: 10 },
                padding: 14,
                cornerRadius: 10,
                displayColors: false,
                callbacks: {
                    title: (items) => {
                        const orig = indicesExibidos[items[0].dataIndex];
                        const d = historicoMedicoes[orig];
                        if (!d) return '';
                        return new Date(d.timestamp).toLocaleString();
                    },
                    label: (c) => {
                        const val = c.parsed.y;
                        if (val == null || isNaN(val)) return null;
                        const lbl = c.dataset.label;
                        let campoKey = 'fc';
                        for (const [k, v] of Object.entries(labelMap)) if (v === lbl) { campoKey = k; break; }
                        const st = getStatus(val, campoKey);
                        const stText = st ? `${st.icone} ${st.texto}` : '--';
                        const lim = refMap[campoKey];
                        const refText = lim ? `${lim[0]} - ${lim[1]}` : '--';
                        return [
                            `${lbl}: ${val} ${unidadeMap[campoKey] || ''}`,
                            `  Status: ${stText}`,
                            `  Referência: ${refText} ${unidadeMap[campoKey] || ''}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(150,150,150,0.4)' },
                ticks: { font: { size: 8 }, color: '#888', maxRotation: 30, autoSkip: true, maxTicksLimit: 10 },
                title: { display: true, text: usarDias ? 'Data/Hora' : 'Horário', font: { size: 9 }, color: '#888' }
            },
            y: {
                grid: { color: 'rgba(150,150,150,0.4)' },
                ticks: { font: { size: 8 }, color: '#888' },
                title: { display: true, text: 'Valores', font: { size: 9 }, color: '#888' }
            }
        }
    }
});
    setTimeout(gerarLegendaToggle, 50);
}

// ============================================================================
// SECÇÃO 14: INTERPRETAR
// ============================================================================

function interpretar() {
    const res = document.getElementById("resultado");
    const sis = document.getElementById("sis");
    const dia = document.getElementById("dia");
    const fc = document.getElementById("fc");
    const fr = document.getElementById("fr");
    const temp = document.getElementById("temp");
    const sato2 = document.getElementById("sato2");
    const caixaTa = document.getElementById("caixa_ta");

    const campos = [
        { id:'fc', nome:'Frequência Cardíaca', min:0, max:500, el:fc },
        { id:'fr', nome:'Frequência Respiratória', min:0, max:200, el:fr },
        { id:'temp', nome:'Temperatura', min:20, max:45, el:temp },
        { id:'sato2', nome:'SatO2', min:0, max:100, el:sato2 },
        { id:'sis', nome:'Sistólica', min:0, max:350, el:sis },
        { id:'dia', nome:'Diastólica', min:0, max:250, el:dia }
    ];

    for (const c of campos) {
        if (c.el.value && c.el.value !== "") {
            const v = parseFloat(c.el.value);
            if (isNaN(v) || v < c.min || v > c.max) {
                c.el.classList.add('campo-incompleto');
                setTimeout(() => c.el.classList.remove('campo-incompleto'), 3000);
                mostrarErro(`${c.nome} deve estar entre ${c.min} e ${c.max}!`);
                return;
            }
        }
    }

    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
    [sis, dia, fc, fr, temp, sato2, caixaTa].forEach(el => el?.classList.remove("campo-incompleto"));

    if (!sis.value && !dia.value && !fc.value && !fr.value && !temp.value && !sato2.value) {
        mostrarErro("Insira pelo menos um sinal vital!");
        return;
    }
    if ((sis.value && !dia.value) || (!sis.value && dia.value)) {
        caixaTa.classList.add("campo-incompleto");
        mostrarErro("Pressão Arterial incompleta!");
        return;
    }

    const idadeM = idadeEmMeses();
    const resultados = [];

    // FC
    const blocoFC = obterBlocoSinal('fc', idadeM);
    if (blocoFC && fc.value) {
        const v = parseFloat(fc.value);
        if (!isNaN(v)) {
            let status = "normal", texto = "Normal", cor = "#00843d", ico = "ri-checkbox-circle-fill";
            if (v < blocoFC.ref[0]) { status="baixo"; texto="Baixo"; cor="#f59e0b"; ico="ri-arrow-down-circle-fill"; }
            if (v > blocoFC.ref[1]) { status="alto";  texto="Alto";  cor="#ef4444"; ico="ri-arrow-up-circle-fill"; }
            resultados.push({
                nome: "FC", valor: v, unidade: "bpm", status, statusTexto: texto, statusCor: cor, statusIcone: ico,
                icone: "ri-heart-pulse-fill", cor: "#00843d",
                min: blocoFC.ref[0], max: blocoFC.ref[1],
                termoClinico: obterTermoClinico(v, blocoFC.categorias),
                fonte: blocoFC.fonte
            });
        }
    }

    // FR
    const blocoFR = obterBlocoSinal('fr', idadeM);
    if (blocoFR && fr.value) {
        const v = parseFloat(fr.value);
        if (!isNaN(v)) {
            let status = "normal", texto = "Normal", cor = "#00843d", ico = "ri-checkbox-circle-fill";
            if (v < blocoFR.ref[0]) { status="baixo"; texto="Baixo"; cor="#f59e0b"; ico="ri-arrow-down-circle-fill"; }
            if (v > blocoFR.ref[1]) { status="alto";  texto="Alto";  cor="#ef4444"; ico="ri-arrow-up-circle-fill"; }
            resultados.push({
                nome: "FR", valor: v, unidade: "ipm", status, statusTexto: texto, statusCor: cor, statusIcone: ico,
                icone: "ri-lungs-fill", cor: "#3b82f6",
                min: blocoFR.ref[0], max: blocoFR.ref[1],
                termoClinico: obterTermoClinico(v, blocoFR.categorias),
                fonte: blocoFR.fonte
            });
        }
    }

    // SatO2
    const blocoSat = obterBlocoSinal('sato2', idadeM);
    if (blocoSat && sato2.value) {
        const v = parseFloat(sato2.value);
        if (!isNaN(v)) {
            let status = "normal", texto = "Normal", cor = "#00843d", ico = "ri-checkbox-circle-fill";
            if (v < blocoSat.ref[0]) { status="baixo"; texto="Baixo"; cor="#f59e0b"; ico="ri-arrow-down-circle-fill"; }
            if (v > blocoSat.ref[1]) { status="alto";  texto="Alto";  cor="#ef4444"; ico="ri-arrow-up-circle-fill"; }
            resultados.push({
                nome: "SatO₂", valor: v, unidade: "%", status, statusTexto: texto, statusCor: cor, statusIcone: ico,
                icone: "ri-drop-line", cor: "#8b5cf6",
                min: blocoSat.ref[0], max: blocoSat.ref[1],
                termoClinico: obterTermoClinico(v, blocoSat.categorias),
                fonte: blocoSat.fonte
            });
        }
    }

    // Temp
    const blocoTemp = obterBlocoSinal('temp', idadeM);
    if (blocoTemp && temp.value) {
        const v = parseFloat(temp.value);
        if (!isNaN(v)) {
            const local = obterLocalTemp();
            const localData = blocoTemp.local?.[local] || blocoTemp.local?.oral;
            if (localData) {
                let status = "normal", texto = "Normal", cor = "#00843d", ico = "ri-checkbox-circle-fill";
                if (v < localData.ref[0]) { status="baixo"; texto="Baixo"; cor="#f59e0b"; ico="ri-arrow-down-circle-fill"; }
                if (v > localData.ref[1]) { status="alto";  texto="Alto";  cor="#ef4444"; ico="ri-arrow-up-circle-fill"; }
                resultados.push({
                    nome: "Temperatura", valor: v, unidade: "°C", status, statusTexto: texto, statusCor: cor, statusIcone: ico,
                    icone: "ri-temp-hot-line", cor: "#f97316",
                    min: localData.ref[0], max: localData.ref[1],
                    termoClinico: obterTermoTemperatura(v, blocoTemp, local),
                    fonte: localData.fonte || blocoTemp.fonte
                });
            }
        }
    }

    // TA
    const blocoTA = obterBlocoSinal('ta', idadeM);
    if (blocoTA && sis.value && dia.value) {
        const vSis = parseFloat(sis.value);
        const vDia = parseFloat(dia.value);
        if (!isNaN(vSis) && blocoTA.sis) {
            let status = "normal", texto = "Normal", cor = "#00843d", ico = "ri-checkbox-circle-fill";
            if (vSis < blocoTA.sis.ref[0]) { status="baixo"; texto="Baixo"; cor="#f59e0b"; ico="ri-arrow-down-circle-fill"; }
            if (vSis > blocoTA.sis.ref[1]) { status="alto";  texto="Alto";  cor="#ef4444"; ico="ri-arrow-up-circle-fill"; }
            resultados.push({
                nome: "PA Sistólica", valor: vSis, unidade: "mmHg", status, statusTexto: texto, statusCor: cor, statusIcone: ico,
                icone: "ri-h-1", cor: "#ef4444",
                min: blocoTA.sis.ref[0], max: blocoTA.sis.ref[1],
                termoClinico: obterTermoClinico(vSis, blocoTA.sis.categorias),
                fonte: blocoTA.sis.fonte
            });
        }
        if (!isNaN(vDia) && blocoTA.dia) {
            let status = "normal", texto = "Normal", cor = "#00843d", ico = "ri-checkbox-circle-fill";
            if (vDia < blocoTA.dia.ref[0]) { status="baixo"; texto="Baixo"; cor="#f59e0b"; ico="ri-arrow-down-circle-fill"; }
            if (vDia > blocoTA.dia.ref[1]) { status="alto";  texto="Alto";  cor="#ef4444"; ico="ri-arrow-up-circle-fill"; }
            resultados.push({
                nome: "PA Diastólica", valor: vDia, unidade: "mmHg", status, statusTexto: texto, statusCor: cor, statusIcone: ico,
                icone: "ri-h-2", cor: "#ec4899",
                min: blocoTA.dia.ref[0], max: blocoTA.dia.ref[1],
                termoClinico: obterTermoClinico(vDia, blocoTA.dia.categorias),
                fonte: blocoTA.dia.fonte
            });
        }
    }

    let html = `<div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background: rgba(0, 132, 61, 0.1); padding: 8px 16px; border-radius: 50px; font-size: 0.75rem; color: var(--primary);">
            <i class="ri-book-open-line"></i> Idade: ${idadeFormatada()}
        </div>
    </div><div class="resultados-grid">`;

    resultados.forEach(r => {
        const percent = ((r.valor - r.min) / (r.max - r.min)) * 100;
        const pctClamp = Math.min(100, Math.max(0, percent));
        const temTermo = r.termoClinico && r.termoClinico !== "Normal" && r.termoClinico !== "Aprexia";
        html += `<div class="resultado-card ${r.status}">
            <div class="card-header">
                <div class="card-icon" style="background: ${r.cor}20; color: ${r.cor};"><i class="${r.icone}"></i></div>
                <div class="card-status-group">
                    <div class="card-status" style="color: ${r.statusCor}"><i class="${r.statusIcone}"></i><span>${r.statusTexto}</span></div>
                    ${temTermo ? `<div class="card-termo-clinico">${r.termoClinico}</div>` : ''}
                </div>
            </div>
            <div class="card-valor">${r.valor}<span class="card-unidade">${r.unidade}</span></div>
            <div class="card-nome">${r.nome}</div>
            <div class="card-range"><span>Ref: ${r.min} - ${r.max} ${r.unidade}</span>${r.fonte ? `<span class="card-fonte">• ${r.fonte}</span>` : ''}</div>
            <div class="card-bar"><div class="card-bar-fill" style="width: ${pctClamp}%; background: ${r.cor};"></div></div>
        </div>`;
    });
    html += `</div>`;

    const totalBaixo = resultados.filter(r => r.status === "baixo").length;
    const totalAlto = resultados.filter(r => r.status === "alto").length;
    const totalNorm = resultados.filter(r => r.status === "normal").length;
    if (totalBaixo > 0 || totalAlto > 0) {
        html += `<div class="resumo-alertas">
            <div class="alerta-item ${totalBaixo > 0 ? 'tem-alerta' : ''}"><i class="ri-arrow-down-circle-fill"></i><span>${totalBaixo} abaixo</span></div>
            <div class="alerta-item"><i class="ri-checkbox-circle-fill"></i><span>${totalNorm} normal</span></div>
            <div class="alerta-item ${totalAlto > 0 ? 'tem-alerta' : ''}"><i class="ri-arrow-up-circle-fill"></i><span>${totalAlto} acima</span></div>
        </div>`;
    }

    const registro = {
        timestamp: Date.now(),
        fc: fc.value || "", fr: fr.value || "", temp: temp.value || "",
        sato2: sato2.value || "", sis: sis.value || "", dia: dia.value || ""
    };
    const temValor = Object.values(registro).some(v => v !== "" && v !== null && v !== undefined);
    if (temValor) {
        if (pacienteAtivo) carregarGraficoPaciente();
        else adicionarMedicao(registro);
    }

    res.innerHTML = html;
    res.style.background = "var(--card-bg)";
    res.style.color = "var(--text)";
    res.style.display = "block";
    res.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
    res.style.width = "100%";

    if (pacienteAtivo) {
        const agora = new Date();
        pacientes[pacienteAtivo].historico.push({
            data: agora.toLocaleDateString(),
            hora: agora.toLocaleTimeString(),
            fc: fc.value, fr: fr.value, temp: temp.value,
            sato2: sato2.value, sis: sis.value, dia: dia.value
        });
        localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
        limparCacheGravidade();

        const toggleTriagem = document.getElementById('toggle-triagem');
        const triagemAtiva = toggleTriagem && toggleTriagem.checked;
        renderListaNomes();
        if (triagemAtiva) ordenarListaPorTriagem();
        renderizarCardResultados();
        carregarGraficoPaciente();
    }
}

function limparSinais() {
    ["sis", "dia", "fc", "fr", "temp", "sato2"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    mostrarPlaceholderResultado();
    document.getElementById("caixa_ta").classList.remove("campo-incompleto");
    renderizarCardResultados();
    if (pacienteAtivo) { carregarGraficoPaciente(); return; }
    historicoMedicoes = [];
    if (graficoAtual) { graficoAtual.destroy(); graficoAtual = null; }
    atualizarGrafico();
}



async function exportarPDF() {
    const btn = document.getElementById('btn-exportar');
    if (!btn) return;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Gerando PDF...';
    btn.disabled = true;

    try {
        if (!pacienteAtivo) { alert("Nenhum paciente selecionado."); return; }
        const p = pacientes[pacienteAtivo];
        if (!p.historico || p.historico.length === 0) { alert("Sem medições para exportar."); return; }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const hist = p.historico;

        // ── Dimensões A4 (mm) ──
        const PAGE_W = 210;
        const PAGE_H = 297;
        const MARGIN = 15;
        const MARGIN_BOTTOM = 22;
        const RESUMO_ALTURA = 50;

        // ── Dados do paciente ──
        const info = p.info;
        const idadeM = info.idade ? unidadeParaMeses(info.idade.valor, info.idade.unidade) : null;
        const fontesPaciente = info.referencias?.fontes || referencias.fontes;
        const idadeFmt = info.idade ? `${info.idade.valor} ${info.idade.unidade}` : '—';

        // ── Estatísticas ──
        const totalMed = hist.length;
        const diasUnicos = [...new Set(hist.map(h => h.data))];
        const totalDias = diasUnicos.length;
        const primeiraData = hist[0].data;
        const ultimaData = hist[hist.length - 1].data;

        let soma = { fc:0, fr:0, temp:0, sato2:0 };
        let count = { fc:0, fr:0, temp:0, sato2:0 };
        hist.forEach(h => {
            ['fc','fr','temp','sato2'].forEach(k => {
                if (h[k] && h[k] !== "" && !isNaN(parseFloat(h[k]))) { soma[k] += parseFloat(h[k]); count[k]++; }
            });
        });
        const media = {
            fc:    count.fc    > 0 ? (soma.fc/count.fc).toFixed(0)       : '-',
            fr:    count.fr    > 0 ? (soma.fr/count.fr).toFixed(0)       : '-',
            temp:  count.temp  > 0 ? (soma.temp/count.temp).toFixed(1)   : '-',
            sato2: count.sato2 > 0 ? (soma.sato2/count.sato2).toFixed(0) : '-'
        };

        // ── Blocos de referência ──
        const blocoFC = obterBlocoPorFonte(fontesPaciente.fc?.fonte || 'OMS', 'fc', idadeM);
        const blocoFR = obterBlocoPorFonte(fontesPaciente.fr?.fonte || 'OMS', 'fr', idadeM);
        const blocoTemp = obterBlocoPorFonte(fontesPaciente.temp?.fonte || 'OMS', 'temp', idadeM);
        const blocoSat = obterBlocoPorFonte(fontesPaciente.sato2?.fonte || 'OMS', 'sato2', idadeM);
        const blocoTA = obterBlocoPorFonte(fontesPaciente.ta?.fonte || 'OMS', 'ta', idadeM);

        const localTemp = fontesPaciente.temp?.local || 'axilar';
        const localData = blocoTemp?.local?.[localTemp] || blocoTemp?.local?.oral;

        // ── Contagem de anormalidades ──
        let alertas = { fc:0, fr:0, temp:0, sato2:0, ta:0 };
        hist.forEach(r => {
            if (r.fc && blocoFC && !isNaN(parseFloat(r.fc))) {
                const v = parseFloat(r.fc);
                if (v < blocoFC.ref[0] || v > blocoFC.ref[1]) alertas.fc++;
            }
            if (r.fr && blocoFR && !isNaN(parseFloat(r.fr))) {
                const v = parseFloat(r.fr);
                if (v < blocoFR.ref[0] || v > blocoFR.ref[1]) alertas.fr++;
            }
            if (r.temp && localData && !isNaN(parseFloat(r.temp))) {
                const v = parseFloat(r.temp);
                if (v < localData.ref[0] || v > localData.ref[1]) alertas.temp++;
            }
            if (r.sato2 && blocoSat && !isNaN(parseFloat(r.sato2))) {
                const v = parseFloat(r.sato2);
                if (v < blocoSat.ref[0]) alertas.sato2++;
            }
            if (blocoTA && ((r.sis && !isNaN(parseFloat(r.sis))) || (r.dia && !isNaN(parseFloat(r.dia))))) {
                let ok = true;
                if (r.sis && blocoTA.sis) { const v = parseFloat(r.sis); if (v < blocoTA.sis.ref[0] || v > blocoTA.sis.ref[1]) ok = false; }
                if (r.dia && blocoTA.dia) { const v = parseFloat(r.dia); if (v < blocoTA.dia.ref[0] || v > blocoTA.dia.ref[1]) ok = false; }
                if (!ok) alertas.ta++;
            }
        });

        const usarDias = totalDias > 1;
        const labelsGrafico = hist.map(h => {
            if (usarDias) { const pp = h.data.split('/'); return pp.length === 3 ? `${pp[0]}/${pp[1]}` : h.data; }
            return h.hora.substring(0, 5);
        });
        const limiteLabels = hist.length > 12 ? 8 : (hist.length > 6 ? 6 : hist.length);

        // ── Gráfico temporário (alta resolução) ──
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = 2400;
        canvasTemp.height = 1600;
        canvasTemp.style.cssText = 'position:fixed;left:0;top:0;z-index:-1;opacity:0;pointer-events:none';
        document.body.appendChild(canvasTemp);
        const ctx = canvasTemp.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasTemp.width, canvasTemp.height);

        if (window.chartPDF) { try { window.chartPDF.destroy(); } catch (e) {} }
        window.chartPDF = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsGrafico,
                datasets: [
                    { label:'FC', data: hist.map(h => h.fc && !isNaN(parseFloat(h.fc)) ? parseFloat(h.fc) : null), borderColor:'#00843d', backgroundColor:'transparent', tension:0.3, borderWidth:5, pointRadius:8, pointBackgroundColor:'#00843d', spanGaps:true },
                    { label:'FR', data: hist.map(h => h.fr && !isNaN(parseFloat(h.fr)) ? parseFloat(h.fr) : null), borderColor:'#2196F3', backgroundColor:'transparent', tension:0.3, borderWidth:5, pointRadius:8, pointBackgroundColor:'#2196F3', spanGaps:true },
                    { label:'Temp', data: hist.map(h => h.temp && !isNaN(parseFloat(h.temp)) ? parseFloat(h.temp) : null), borderColor:'#FF9800', backgroundColor:'transparent', tension:0.3, borderWidth:5, pointRadius:8, pointBackgroundColor:'#FF9800', spanGaps:true },
                    { label:'SatO2', data: hist.map(h => h.sato2 && !isNaN(parseFloat(h.sato2)) ? parseFloat(h.sato2) : null), borderColor:'#9C27B0', backgroundColor:'transparent', tension:0.3, borderWidth:5, pointRadius:8, pointBackgroundColor:'#9C27B0', spanGaps:true },
                    { label:'Sistólica', data: hist.map(h => h.sis && !isNaN(parseFloat(h.sis)) ? parseFloat(h.sis) : null), borderColor:'#f44336', backgroundColor:'transparent', tension:0.3, borderWidth:5, pointRadius:8, pointBackgroundColor:'#f44336', spanGaps:true },
                    { label:'Diastólica', data: hist.map(h => h.dia && !isNaN(parseFloat(h.dia)) ? parseFloat(h.dia) : null), borderColor:'#E91E63', backgroundColor:'transparent', borderDash:[16,10], tension:0.3, borderWidth:5, pointRadius:8, pointBackgroundColor:'#E91E63', spanGaps:true }
                ]
            },
            options: {
                responsive: false, animation: false, maintainAspectRatio: true,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { position: 'bottom', labels: { boxWidth: 24, font: { size: 22, weight: 'bold' }, padding: 22 } }
                },
                scales: {
                    x: {
                        grid: { display:true, color:'#cccccc', borderDash:[12,8], lineWidth:1 },
                        ticks: { font: { size: 20, weight:'bold' }, maxRotation:0, autoSkip:true, maxTicksLimit:limiteLabels },
                        title: { display:true, text: usarDias ? 'Data' : 'Horário', font: { size: 22, weight:'bold' }, padding: 18 }
                    },
                    y: {
                        grid: { display:true, color:'#cccccc', borderDash:[12,8], lineWidth:1 },
                        ticks: { font: { size: 20, weight:'bold' }, stepSize:20 },
                        title: { display:true, text:'Valores', font: { size: 22, weight:'bold' }, padding: 18 }
                    }
                },
                layout: { padding: { top: 30, bottom: 30, left: 25, right: 25 } }
            }
        });
        await new Promise(r => setTimeout(r, 900));
        const imgGrafico = canvasTemp.toDataURL('image/png');
        if (window.chartPDF) window.chartPDF.destroy();
        document.body.removeChild(canvasTemp);

        // ═══════════════════════════════════════════════════════════════
        // PÁGINA 1 — CABEÇALHO + IDENTIFICAÇÃO + REFERÊNCIAS + GRÁFICO + RESUMO
        // ═══════════════════════════════════════════════════════════════

        // ── Cabeçalho verde ──
        doc.setFillColor(0, 132, 61);
        doc.rect(0, 0, PAGE_W, 34, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text("RELATÓRIO DE MONITORIZAÇÃO", MARGIN, 16);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("MatClínica - Sinais Vitais", MARGIN, 25);

        // ── Identificação + Referências (mesma cor e tamanho) ──
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        doc.text(`PACIENTE: ${pacienteAtivo.toUpperCase()}`, MARGIN, 46);
        doc.text(`Idade: ${idadeFmt}`, MARGIN, 52);
        doc.text(`Data de emissão: ${new Date().toLocaleDateString()}`, MARGIN, 58);

        // ── Referências na horizontal (mesma cor e tamanho da identificação) ──
        const refTexto =
            `Referências: ` +
            `FC: ${fontesPaciente.fc?.fonte || 'OMS'} | ` +
            `FR: ${fontesPaciente.fr?.fonte || 'OMS'} | ` +
            `Temp: ${fontesPaciente.temp?.fonte || 'OMS'} (${localTemp}) | ` +
            `SatO2: ${fontesPaciente.sato2?.fonte || 'OMS'} | ` +
            `TA: ${fontesPaciente.ta?.fonte || 'OMS'}`;

        // Quebra em várias linhas se necessário (largura útil)
        const refLinhas = doc.splitTextToSize(refTexto, PAGE_W - 2 * MARGIN);
        let refY = 65;
        refLinhas.forEach(linha => {
            doc.text(linha, MARGIN, refY);
            refY += 5;
        });

        // ═══════════════════════════════════════════════════════════════
        // CÁLCULO DINÂMICO DE POSIÇÕES
        // ═══════════════════════════════════════════════════════════════

        const GAP_REF_GRAFICO = 4;
        const GAP_GRAFICO_RESUMO = 6;

        const resumoY = PAGE_H - MARGIN_BOTTOM - RESUMO_ALTURA;

        // Gráfico absorve TODO o espaço restante
        const graficoY = refY + GAP_REF_GRAFICO;
        const graficoAltura = resumoY - GAP_GRAFICO_RESUMO - graficoY;

        doc.addImage(imgGrafico, 'PNG', MARGIN, graficoY, PAGE_W - 2 * MARGIN, graficoAltura);

        // ═══════════════════════════════════════════════════════════════
        // RESUMO — caixa com título + 2 blocos horizontais + divisória
        // ═══════════════════════════════════════════════════════════════

        const RESU_LARG = PAGE_W - 2 * MARGIN;
        const RESU_X = MARGIN;

        doc.setFillColor(248, 250, 248);
        doc.setDrawColor(0, 132, 61);
        doc.setLineWidth(0.3);
        doc.rect(RESU_X, resumoY, RESU_LARG, RESUMO_ALTURA, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(0, 132, 61);
        doc.setFont('helvetica', 'bold');
        doc.text("RESUMO", RESU_X + 5, resumoY + 7);

        doc.setDrawColor(200, 220, 200);
        doc.setLineWidth(0.2);
        doc.line(RESU_X + 5, resumoY + 9, RESU_X + RESU_LARG - 5, resumoY + 9);

        const padding = 5;
        const gapCol = 6;
        const larguraCol = (RESU_LARG - 2 * padding - gapCol) / 2;
        const xEsq = RESU_X + padding;
        const xDir = xEsq + larguraCol + gapCol;

        const divisorX = xEsq + larguraCol + gapCol / 2;
        doc.setDrawColor(200, 220, 200);
        doc.setLineWidth(0.2);
        doc.line(divisorX, resumoY + 12, divisorX, resumoY + RESUMO_ALTURA - 4);

        // GERAIS
        doc.setFontSize(8.5);
        doc.setTextColor(0, 132, 61);
        doc.setFont('helvetica', 'bold');
        doc.text("GERAIS", xEsq, resumoY + 15);

        doc.setDrawColor(220, 230, 220);
        doc.setLineWidth(0.15);
        doc.line(xEsq, resumoY + 16.5, xEsq + larguraCol, resumoY + 16.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);

        let yEsq = resumoY + 21;
        doc.text(`Medições: ${totalMed}`, xEsq, yEsq); yEsq += 4.2;
        doc.text(`Dias: ${totalDias}`, xEsq, yEsq); yEsq += 4.2;
        doc.text(`Período: ${primeiraData} - ${ultimaData}`, xEsq, yEsq); yEsq += 4.2;
        doc.text(`Média FC: ${media.fc} bpm`, xEsq, yEsq); yEsq += 4.2;
        doc.text(`Média FR: ${media.fr} ipm`, xEsq, yEsq); yEsq += 4.2;
        doc.text(`Média Temp: ${media.temp} °C`, xEsq, yEsq); yEsq += 4.2;
        doc.text(`Média SatO2: ${media.sato2}%`, xEsq, yEsq);

        // ANORMALIDADES
        doc.setFontSize(8.5);
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.text("ANORMALIDADES", xDir, resumoY + 15);

        doc.setDrawColor(240, 220, 220);
        doc.setLineWidth(0.15);
        doc.line(xDir, resumoY + 16.5, xDir + larguraCol, resumoY + 16.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);

        let yDir = resumoY + 21;
        doc.text(`FC: ${alertas.fc}`, xDir, yDir); yDir += 4.2;
        doc.text(`FR: ${alertas.fr}`, xDir, yDir); yDir += 4.2;
        doc.text(`SatO2: ${alertas.sato2}`, xDir, yDir); yDir += 4.2;
        doc.text(`Temperatura: ${alertas.temp}`, xDir, yDir); yDir += 4.2;
        doc.text(`Tensão Arterial: ${alertas.ta}`, xDir, yDir);

        // ═══════════════════════════════════════════════════════════════
        // PÁGINA 2 — TABELA
        // ═══════════════════════════════════════════════════════════════
        doc.addPage();
        doc.autoTable({
            startY: 20,
            head: [['Data/Hora','FC (bpm)','FR (ipm)','Temp (°C)','SatO2 (%)','Sis (mmHg)','Dia (mmHg)']],
            body: hist.map(r => [`${r.data} ${r.hora}`, r.fc || "-", r.fr || "-", r.temp || "-", r.sato2 || "-", r.sis || "-", r.dia || "-"]),
            headStyles: { fillColor: [0, 132, 61] },
            theme: 'striped',
            margin: { bottom: 40 }
        });

        // ═══════════════════════════════════════════════════════════════
        // PARÁGRAFO FINAL
        // ═══════════════════════════════════════════════════════════════
        const ult = doc.internal.getNumberOfPages();
        doc.setPage(ult);

        const fy = doc.lastAutoTable.finalY + 12;

        doc.setDrawColor(0, 132, 61);
        doc.setLineWidth(0.4);
        doc.line(MARGIN, fy, PAGE_W - MARGIN, fy);

        const textoRodape =
            `Este documento foi gerado automaticamente pelo sistema MatClínica, ` +
            `a partir dos dados inseridos pelo profissional de saúde responsável. ` +
            `As interpretações apresentadas baseiam-se nas referências indicadas acima e ` +
            `têm como único objetivo auxiliar a decisão clínica. Não substituem, em caso algum, ` +
            `o julgamento clínico, a avaliação presencial nem a responsabilidade do profissional ` +
            `de saúde. Qualquer decisão terapêutica deve ser tomada com base na avaliação ` +
            `integral do doente e no contexto clínico em que se encontra.`;

        doc.setFontSize(7.5);
        doc.setTextColor(110, 110, 110);
        doc.setFont('helvetica', 'normal');

        const paragrafo = doc.splitTextToSize(textoRodape, PAGE_W - 2 * MARGIN);
        doc.text(paragrafo, MARGIN, fy + 5);

        // ═══════════════════════════════════════════════════════════════
        // Guardar / exportar
        // ═══════════════════════════════════════════════════════════════
        const nome = `Relatorio | ${pacienteAtivo}.pdf`;
        const isCap = window.Capacitor && window.Capacitor.isNativePlatform();
        if (isCap) {
            const { Filesystem } = window.Capacitor.Plugins;
            const uri = doc.output('datauristring');
            await Filesystem.writeFile({ path: nome, data: uri.split(',')[1], directory: 'DOCUMENTS', recursive: true });
            alert("✅ PDF guardado! Clique em OK para terminar");
        } else {
            doc.save(nome);
            alert("✅ PDF gerado! Clique em Ok para terminar");
        }
    } catch (e) {
        console.error(e);
        alert("Erro ao gerar PDF: " + e.message);
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}



// ============================================================================
// SECÇÃO 16: INICIALIZAÇÃO
// ============================================================================

window.addEventListener('load', () => {
    // 1. Tema
    if (localStorage.getItem('tema') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
    }

    // 2. Referências guardadas
    carregarReferenciasGuardadas();

    // 3. Sincronizar UI da temperatura
    sincronizarTempLocalDoCampo();

    // 4. Pacientes
    renderListaNomes();

    // 5. Gráfico
    resetarGrafico();
    carregarGraficoPaciente();

    // 6. Barra de resumo
    atualizarBarraResumo();

    // 7. Alertas cruzados
    renderizarCardResultados();

    // 8. Placeholder do resultado
    mostrarPlaceholderResultado();

    console.log("✅ MatClínica carregada. Referências:", referencias);
});

// ─── Fechar painel e selects ao clicar fora ───
document.addEventListener('click', (e) => {
    const painel = document.getElementById('painelReferencias');
    const btn = document.getElementById('btnAbrirPainel');

    // Fecha os selects internos do painel se clicar fora deles
    const dentroDeAlgumSelectPainel =
        e.target.closest('.custom-select-painel') ||
        e.target.closest('.custom-select-idade');
    if (!dentroDeAlgumSelectPainel) {
        fecharTodosOsSelectsPainel();
    }

    // Fecha o painel se clicar fora dele e fora do botão
    if (painel && painel.classList.contains('aberto')
        && !painel.contains(e.target)
        && btn && !btn.contains(e.target)) {
        fecharPainelReferencias();
    }

    // Fecha select de temperatura local
    const tSel = document.getElementById('tempLocalSelect');
    if (tSel && !tSel.contains(e.target)) {
        document.getElementById('tempLocalOptions')?.classList.remove('aberto');
        document.querySelector('#tempLocalSelect .custom-select-trigger-temp')?.classList.remove('aberto');
    }
});

// ─── Fechar modal do ponto com ESC ───
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('modalPontoOverlay');
        if (overlay && overlay.classList.contains('aberto')) {
            fecharModalPonto();
        }
    }
});

// ─── Guardar com Enter dentro do input do modal ───
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'modalPontoInput') {
        e.preventDefault();
        guardarPontoGrafico();
    }
});

// ─── Fechar sidebar ao clicar fora ───
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const btnPac = document.querySelector('.btn-abrir-menu');
    if (!sidebar || !sidebar.classList.contains('active')) return;
    if (sidebar.contains(e.target)) return;
    if (btnPac && btnPac.contains(e.target)) return;
    if (overlay && overlay.contains(e.target)) return;
    fecharSidebar();
});

// ─── Toggle triagem ───
document.addEventListener('change', (e) => {
    if (e.target.id === 'toggle-triagem') {
        requestAnimationFrame(() => {
            if (e.target.checked) ordenarListaPorTriagem();
            else renderListaNomes();
        });
    }
});

console.log("MatClínica v3.0 — script carregado.");





