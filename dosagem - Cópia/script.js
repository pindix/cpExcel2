/* ==========================================================================
   MPINDI TECMED — script.js completo (correção: feedback de fonte
   separado do resultado, classList de dose sempre limpa, exibirCampos
   a usar a fonte realmente usada em fallback, concentracaoMap reiniciado)
   ========================================================================== */

/* ---- 1. TEMA ---- */
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

themeBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'ri-moon-line';
        localStorage.setItem('tema', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
        localStorage.setItem('tema', 'dark');
    }
});

function formatarNumero(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
}

/* ---- 2. CONSTANTES DE SEGURANÇA ---- */
const PESO_MIN_PLAUSIVEL = 0.3;
const PESO_MAX_PLAUSIVEL = 300;
const IDADE_MAX_PLAUSIVEL_ANOS = 120;
const IDADE_TETO_PEDIATRICO_ANOS = 18;
const REF_PESO_ADULTO_MIN = 49;
const MAX_NOTAS_VISIVEIS = 5;

const DIAS_POR_UNIDADE = {
    'dia': 1, 'dias': 1, 'semana': 7, 'semanas': 7,
    'mes': 30, 'meses': 30, 'mês': 30, 'méses': 30,
    'ano': 365, 'anos': 365,
};
const FATORES_MASSA_PARA_MG = {
    'mg': 1, 'g': 1000, 'mcg': 0.001, 'µg': 0.001, 'ug': 0.001, 'kg': 1000000,
};

/* ---- 3. ESTADO GLOBAL ---- */
let bancoDados = {};
let medAtivo = null;
let fonteAtual = 'msf';
let concentracaoMap = {};

// 🔥 CORREÇÃO: fonte realmente usada para o medicamento em exibição, guardada
// à parte -- nunca escrita dentro de medAtivo (que é uma referência partilhada
// para dentro de bancoDados). Fica null quando não há fallback em curso.
let fonteUsadaAtual = null;

const ROTULOS_FONTE = { msf: 'Médicos Sem Fronteira', oms: 'OMS (Internacional)', angola: 'Angola' };
const ICONES_FONTE = { msf: 'ri-earth-line', oms: 'ri-earth-line', angola: 'ri-government-line' };

const inputNome = document.getElementById("nome");
const divSugestoes = document.getElementById("sugestoes_box");
const pResultado = document.getElementById("resultado");
const notaFallback = document.getElementById("notaFallbackReferencia");
// 🔥 NOVO: div própria para o feedback de troca de fonte -- nunca mais
// partilha espaço com o resultado do cálculo, por isso exibirCampos()
// já não pode apagá-la sem querer.
const fonteFeedback = document.getElementById("fonteFeedback");

const inputs = {
    peso: document.getElementById("peso"),
    idade: document.getElementById("idade"),
    dosagem: document.getElementById("dosagem"),
    dosagemManutencao: document.getElementById("dosagem_manutencao"),
};

const camposGrid = document.getElementById("camposGrid");
const campoPeso = document.getElementById("campo_de_peso");
const campoIdade = document.getElementById("campo_de_idade");
const campoDosagem = document.getElementById("campo_de_dosagem");
const campoDosagemManutencao = document.getElementById("campo_de_dosagem_manutencao");
const labelDosagem = document.getElementById("label_dosagem");
const txtUnidadeDosagem = document.getElementById("unidade_de_dosagem");
const txtUnidadeDosagemManutencao = document.getElementById("unidade_de_dosagem_manutencao");

const linhaSecundaria = document.getElementById("linhaSecundaria");
const linhaIntervaloDuplo = document.getElementById("linhaIntervaloDuplo");
const concentracaoSelect = document.getElementById("concentracaoSelect");
const concentracaoSelecionada = document.getElementById("concentracaoSelecionada");
const concentracaoOptions = document.getElementById("concentracaoOptions");


/* ---- 4. INTERPRETAÇÃO DE PESO/IDADE (operadores + unidades por extenso) ---- */
function interpretarLadoNumerico(strBruta) {
    const s = (strBruta || '').trim();
    if (s === '') return null;
    let inclusivo = true, numStr = s;
    if (s.startsWith('>=')) { numStr = s.slice(2); inclusivo = true; }
    else if (s.startsWith('<=')) { numStr = s.slice(2); inclusivo = true; }
    else if (s.startsWith('>')) { numStr = s.slice(1); inclusivo = false; }
    else if (s.startsWith('<')) { numStr = s.slice(1); inclusivo = false; }
    const valor = parseFloat(numStr.trim().replace(',', '.'));
    if (isNaN(valor)) return null;
    return { valor, inclusivo };
}

function interpretarLadoIdade(strBruta) {
    const s = (strBruta || '').trim();
    if (s === '') return null;
    let inclusivo = true, resto = s;
    if (s.startsWith('>=')) { resto = s.slice(2); inclusivo = true; }
    else if (s.startsWith('<=')) { resto = s.slice(2); inclusivo = true; }
    else if (s.startsWith('>')) { resto = s.slice(1); inclusivo = false; }
    else if (s.startsWith('<')) { resto = s.slice(1); inclusivo = false; }
    resto = resto.trim();
    const m = resto.match(/^([\d.,]+)\s*([a-zçãéêú]+)$/i);
    if (!m) return null;
    const numero = parseFloat(m[1].replace(',', '.'));
    const unidade = m[2].toLowerCase();
    const fatorDias = DIAS_POR_UNIDADE[unidade];
    if (fatorDias === undefined || isNaN(numero)) return null;
    return { valorEmDias: numero * fatorDias, inclusivo, textoOriginal: resto };
}

function resolverFaixaPeso(textoColuna) {
    const lados = (textoColuna || '').split(';').map(s => s.trim());
    let min = -Infinity, max = Infinity, minInclusive = true, maxInclusive = true;
    if (lados.length === 1 && lados[0] !== '') {
        const lado = interpretarLadoNumerico(lados[0]);
        if (lado) {
            if (lados[0].startsWith('<')) { max = lado.valor; maxInclusive = lado.inclusivo; }
            else if (lados[0].startsWith('>')) { min = lado.valor; minInclusive = lado.inclusivo; }
            else { min = max = lado.valor; }
        }
    } else if (lados.length >= 2) {
        const ladoMin = interpretarLadoNumerico(lados[0]);
        const ladoMax = interpretarLadoNumerico(lados[1]);
        if (ladoMin) { min = ladoMin.valor; minInclusive = ladoMin.inclusivo; }
        if (ladoMax) { max = ladoMax.valor; maxInclusive = ladoMax.inclusivo; }
    }
    return { min, max, minInclusive, maxInclusive };
}

function resolverFaixaIdade(textoColuna) {
    const lados = (textoColuna || '').split(';').map(s => s.trim());
    let min = -Infinity, max = Infinity, minInclusive = true, maxInclusive = true;
    let minTexto = null, maxTexto = null;
    if (lados.length === 1 && lados[0] !== '') {
        const lado = interpretarLadoIdade(lados[0]);
        if (lado) {
            if (lados[0].startsWith('<')) { max = lado.valorEmDias; maxInclusive = lado.inclusivo; maxTexto = lado.textoOriginal; }
            else if (lados[0].startsWith('>')) { min = lado.valorEmDias; minInclusive = lado.inclusivo; minTexto = lado.textoOriginal; }
            else { min = max = lado.valorEmDias; minTexto = maxTexto = lado.textoOriginal; }
        }
    } else if (lados.length >= 2) {
        const ladoMin = interpretarLadoIdade(lados[0]);
        const ladoMax = interpretarLadoIdade(lados[1]);
        if (ladoMin) { min = ladoMin.valorEmDias; minInclusive = ladoMin.inclusivo; minTexto = ladoMin.textoOriginal; }
        if (ladoMax) { max = ladoMax.valorEmDias; maxInclusive = ladoMax.inclusivo; maxTexto = ladoMax.textoOriginal; }
    }
    return { min, max, minInclusive, maxInclusive, minTexto, maxTexto };
}

function dentroDaFaixa(valor, faixa) {
    const minOK = faixa.minInclusive ? valor >= faixa.min : valor > faixa.min;
    const maxOK = faixa.maxInclusive ? valor <= faixa.max : valor < faixa.max;
    return minOK && maxOK;
}

/* ---- 5. DOSE/INTERVALO COM ATAQUE+MANUTENÇÃO ---- */
function temAtaqueManutencao(texto) {
    return /ataque\(/i.test(texto || '') || /manutencao\(/i.test(texto || '');
}

function extrairBlocoAtaqueManutencao(texto, chave) {
    const regex = new RegExp(chave + '\\(([^)]*)\\)', 'i');
    const m = (texto || '').match(regex);
    return m ? m[1].trim() : '';
}

// Para DOSE: mantém o comportamento atual (ataque/manutenção partilham)
function interpretarDoseOuIntervalo(texto) {
    if (!texto || texto.trim() === '') return { simples: '' };
    if (!temAtaqueManutencao(texto)) return { simples: texto.trim() };
    let ataque = extrairBlocoAtaqueManutencao(texto, 'ataque');
    let manutencao = extrairBlocoAtaqueManutencao(texto, 'manutencao');
    if (ataque === '' && manutencao !== '') ataque = manutencao;
    if (manutencao === '' && ataque !== '') manutencao = ataque;
    return { ataque, manutencao, temDuasFases: ataque !== manutencao };
}

// Para INTERVALO: cada lado é independente
function interpretarIntervalo(texto) {
    if (!texto || texto.trim() === '') return { simples: '' };
    if (!temAtaqueManutencao(texto)) {
        // Cenário 1: intervalo simples, aplica-se aos dois
        return { simples: texto.trim() };
    }
    // Cenário 2, 3 ou 4
    const ataque = extrairBlocoAtaqueManutencao(texto, 'ataque');
    const manutencao = extrairBlocoAtaqueManutencao(texto, 'manutencao');
    return {
        ataque: ataque || '',
        manutencao: manutencao || '',
        temAtaque: ataque !== '',
        temManutencao: manutencao !== ''
    };
}

/* ---- 6. CONVERSÃO DE UNIDADE DE DOSE PARA mg ---- */
function unidadeBase(unidadeTexto) {
    return (unidadeTexto || '').toLowerCase().trim().split('/')[0].trim();
}
function converterParaMg(valor, unidadeTexto, concentracaoTexto, fatorUnidadeTexto) {
    const base = unidadeBase(unidadeTexto);
    if (FATORES_MASSA_PARA_MG.hasOwnProperty(base)) return valor * FATORES_MASSA_PARA_MG[base];
    const concentracaoTemMesmaUnidade = base && String(concentracaoTexto || '').toLowerCase().includes(base);
    if (concentracaoTemMesmaUnidade) return valor;
    if (fatorUnidadeTexto) {
        const texto = String(fatorUnidadeTexto).replace(',', '.').trim();
        const m = texto.match(/^([\d.]+)\s*([a-zµ]+)$/i);
        if (m) {
            const valorPorUnidade = parseFloat(m[1]);
            const unidadeResultante = m[2].toLowerCase();
            const fatorParaMg = FATORES_MASSA_PARA_MG[unidadeResultante];
            if (fatorParaMg !== undefined && !isNaN(valorPorUnidade)) return valor * valorPorUnidade * fatorParaMg;
        }
    }
    return null;
}

/* ---- 7. MOTOR DE DADOS — 12 colunas ---- */
function formatarFolha(sheet) {
    const matriz = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const indexCabecalho = matriz.findIndex(linha => linha[0] && String(linha[0]).toLowerCase().trim() === "nome");
    if (indexCabecalho === -1) return [];
    const apenasDados = matriz.slice(indexCabecalho);
    const cabecalho = apenasDados[0].map(c => String(c).toLowerCase().trim());
    return apenasDados.slice(1).map(linha => {
        let obj = {};
        cabecalho.forEach((col, i) => {
            let valor = linha[i] !== undefined ? linha[i] : "";
            obj[col] = (col === "nome" && String(valor).includes("|"))
                ? String(valor).split("|").map(s => s.trim())
                : valor;
        });
        return obj;
    });
}

function carregarDados() {
    bancoDados = window.BANCO_DADOS || {};
    console.log("✅ Base de dados pronta.");
}

function nomeCorresponde(med, nomeBusca) {
    if (!med.nome) return false;
    let nomes;
    if (Array.isArray(med.nome)) nomes = med.nome;
    else if (typeof med.nome === "string" && med.nome.includes("|")) nomes = med.nome.split("|").map(s => s.trim());
    else nomes = [String(med.nome).trim()];
    return nomes.some(n => n.toLowerCase() === nomeBusca);
}
/* ---- 8. CUSTOM SELECT — genérico ---- */
function toggleCustomSelect(id) {
    const wrapper = document.getElementById(id);
    if (!wrapper) return;
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const options = wrapper.querySelector('.custom-select-options');
    const estavaAberto = options.classList.contains('aberto');
    fecharTodosCustomSelects();
    if (!estavaAberto) { options.classList.add('aberto'); trigger.classList.add('aberto'); }
}

function fecharTodosCustomSelects() {
    document.querySelectorAll('.custom-select-options.aberto').forEach(o => o.classList.remove('aberto'));
    document.querySelectorAll('.custom-select-trigger.aberto').forEach(t => t.classList.remove('aberto'));
    document.querySelectorAll('.custom-select-options-temp.aberto').forEach(o => o.classList.remove('aberto'));
    document.querySelectorAll('.custom-select-trigger-temp.aberto').forEach(t => t.classList.remove('aberto'));
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select') && !e.target.closest('.custom-select-temp-local')) {
        fecharTodosCustomSelects();
    }
});

function popularCustomSelect(prefixo, opcoes, onSelect) {
    const wrapper = document.getElementById(prefixo + 'Select');
    // Tenta 'Selecionada' (padrão antigo) e 'Selecionado' (novo padrão)
    const span = document.getElementById(prefixo + 'Selecionada')
        || document.getElementById(prefixo + 'Selecionado');
    const optionsDiv = document.getElementById(prefixo + 'Options');
    if (!wrapper || !span || !optionsDiv) return;

    optionsDiv.innerHTML = '';

    let valorAtual = wrapper.dataset.valorAtual;
    const existe = opcoes.some(o => o.valor === valorAtual);
    if (!existe) valorAtual = opcoes[0] ? opcoes[0].valor : '';

    opcoes.forEach(op => {
        const div = document.createElement('div');
        div.className = 'custom-select-option' + (op.valor === valorAtual ? ' selecionado' : '');
        div.dataset.value = op.valor;
        div.innerHTML = `${op.icone ? `<i class="${op.icone}"></i>` : ''}<div class="option-content"><span class="option-titulo">${op.texto}</span></div>`;
        div.onclick = () => {
            optionsDiv.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selecionado'));
            div.classList.add('selecionado');
            span.textContent = op.texto;
            wrapper.dataset.valorAtual = op.valor;
            fecharTodosCustomSelects();
            if (onSelect) onSelect(op.valor);
        };
        optionsDiv.appendChild(div);
    });

    const opSel = opcoes.find(o => o.valor === valorAtual);
    span.textContent = opSel ? opSel.texto : (opcoes[0] ? opcoes[0].texto : '—');
    wrapper.dataset.valorAtual = valorAtual || '';
}

function valorCustomSelect(prefixo) {
    const wrapper = document.getElementById(prefixo + 'Select');
    return wrapper ? (wrapper.dataset.valorAtual || '') : '';
}

/* ---- 9. FONTE (referência) — feedback numa div própria, persistente até
   se digitar um novo medicamento ou se limpar ---- */
function selecionarFonte(valor) {
    if (fonteAtual === valor) { fecharTodosCustomSelects(); return; }

    const nomeFonte = ROTULOS_FONTE[valor] || valor;
    fecharTodosCustomSelects();
    fonteFeedback.innerHTML = `<div class="feedback-loading"><i class="ri-loader-4-line"></i><span>Carregando padrões da <strong>${nomeFonte}</strong>...</span></div>`;
    fonteFeedback.style.display = "block";

    divSugestoes.style.display = "none";
    divSugestoes.innerHTML = "";

    setTimeout(() => {
        fonteAtual = valor;
        document.getElementById('fonteSelecionada').innerHTML =
            `<i class="${ICONES_FONTE[valor] || 'ri-earth-line'}"></i> ${nomeFonte}`;
        document.querySelectorAll('#fonteOptions .custom-select-option').forEach(opt => {
            opt.classList.toggle('selecionado', opt.dataset.value === valor);
        });
        fecharTodosCustomSelects();
        localStorage.setItem('fonte', valor);
        notaFallback.style.display = 'none';

        fonteFeedback.innerHTML = `<div class="feedback-success"><i class="ri-checkbox-circle-line"></i><span>Padrões da <strong>${nomeFonte}</strong> carregados com sucesso!</span></div>`;

        inputNome.value = "";
        inputs.peso.value = ""; inputs.idade.value = "";
        inputs.dosagem.value = ""; inputs.dosagemManutencao.value = "";
        medAtivo = null; fonteUsadaAtual = null;
        exibirCampos();
    }, 1000);
}
/* ---- 10. UNIDADE DE IDADE ---- */
function toggleTempLocalSelect(event) {
    event.stopPropagation();
    const wrapper = document.getElementById('tempLocalSelect');
    const trigger = wrapper.querySelector('.custom-select-trigger-temp');
    const options = wrapper.querySelector('.custom-select-options-temp');
    const estavaAberto = options.classList.contains('aberto');
    fecharTodosCustomSelects();
    if (!estavaAberto) { options.classList.add('aberto'); trigger.classList.add('aberto'); }
}

function selecionarUnidadeIdade(valor, event) {
    event.stopPropagation();
    const rotulos = { '365': 'anos', '30': 'meses', '7': 'semanas', '1': 'dias' };
    document.getElementById('tempLocalSelecionado').textContent = rotulos[valor] || valor;
    document.getElementById('tempLocalSelect').dataset.valorAtual = valor;
    document.querySelectorAll('#tempLocalOptions .custom-select-option-temp').forEach(o => {
        o.classList.toggle('selecionado', o.dataset.value === valor);
    });
    fecharTodosCustomSelects();
    if (inputNome.value.trim() !== "") { escolherLinha('ajuste'); exibirCampos(); }
}
document.getElementById('tempLocalSelect').dataset.valorAtual = '365';

/* ---- FIM DA PARTE 1 ---- */


/* ==========================================================================
   PARTE 2
   ========================================================================== */

/* ---- 11. SUGESTÕES ---- */
function gerirSugestoes() {
    const termo = inputNome.value.trim().toLowerCase();
    if (!termo) { divSugestoes.style.display = "none"; divSugestoes.innerHTML = ""; return; }

    const todosNomes = [];
    Object.keys(bancoDados).forEach(fonte => {
        (bancoDados[fonte] || []).forEach(m => {
            let nomes = [];
            if (Array.isArray(m.nome)) nomes = m.nome;
            else if (typeof m.nome === "string" && m.nome.includes("|")) nomes = m.nome.split("|").map(s => s.trim());
            else if (m.nome) nomes = [String(m.nome).trim()];

            nomes.forEach(n => {
                if (n && n.toLowerCase().includes(termo)) todosNomes.push({ nome: n, fonte });
            });
        });
    });

    const vistos = new Set();
    const nomesUnicos = [];
    todosNomes.forEach(item => {
        const chave = `${item.nome.toLowerCase()}|${item.fonte}`;
        if (!vistos.has(chave)) { vistos.add(chave); nomesUnicos.push(item); }
    });

    nomesUnicos.sort((a, b) => {
        const aL = a.nome.toLowerCase(), bL = b.nome.toLowerCase();
        const aC = aL.startsWith(termo), bC = bL.startsWith(termo);
        if (aC && !bC) return -1;
        if (!aC && bC) return 1;
        return aL.localeCompare(bL);
    });

    if (nomesUnicos.length === 0) { divSugestoes.style.display = "none"; return; }

    const daFonteAtual = nomesUnicos.filter(item => item.fonte === fonteAtual);
    const deOutrasFontes = nomesUnicos.filter(item => item.fonte !== fonteAtual);

    divSugestoes.innerHTML = "";
    divSugestoes.style.display = "block";

    const container = document.createElement('div');
    container.style.cssText = `max-height: 320px; overflow-y: auto; position: relative;`;

    function criarItem(item, opaco) {
        const div = document.createElement("div");
        const nome = item.nome;
        const indexHighlight = nome.toLowerCase().indexOf(termo);
        const rotuloFonte = ROTULOS_FONTE[item.fonte] || item.fonte;
        div.style.cssText = `padding:12px 16px;cursor:pointer;transition:background .15s ease;border-bottom:1px solid rgba(0,0,0,.04);display:flex;flex-direction:column;gap:2px;`;
        if (opaco) div.style.opacity = "0.7";
        div.innerHTML = `
            <div style="font-weight:${opaco ? 400 : 500};font-size:${opaco ? '0.9rem' : '0.95rem'};color:var(--text);line-height:1.3;">
                ${nome.substring(0, indexHighlight)}<strong style="color:var(--primary);">${nome.substring(indexHighlight, indexHighlight + termo.length)}</strong>${nome.substring(indexHighlight + termo.length)}
            </div>
            <div style="font-size:0.6rem;color:var(--text);opacity:0.6;letter-spacing:0.3px;">Referência: ${rotuloFonte}</div>`;
        div.onmouseenter = () => { div.style.background = 'rgba(0, 132, 61, 0.05)'; };
        div.onmouseleave = () => { div.style.background = 'transparent'; };
        div.onclick = () => {
            inputNome.value = nome;
            divSugestoes.style.display = "none";
            escolherLinhaSugestao(nome, item.fonte);
        };
        return div;
    }

    daFonteAtual.slice(0, 6).forEach(item => container.appendChild(criarItem(item, false)));

    if (deOutrasFontes.length > 0) {
        const sticky = document.createElement("div");
        sticky.style.cssText = `position:sticky;top:0;z-index:10;background:var(--card-bg);padding:10px 16px 8px;border-bottom:1px solid rgba(0,0,0,.06);display:flex;align-items:center;gap:10px;`;
        sticky.innerHTML = `<span style="flex:1;height:1px;background:rgba(0,0,0,.08);"></span><span style="font-size:.55rem;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.8px;">Outras referências</span><span style="flex:1;height:1px;background:rgba(0,0,0,.08);"></span>`;
        container.appendChild(sticky);
        deOutrasFontes.slice(0, 6).forEach(item => container.appendChild(criarItem(item, true)));
    }

    divSugestoes.appendChild(container);
}

document.addEventListener('click', (e) => {
    if (!inputNome.contains(e.target) && !divSugestoes.contains(e.target)) divSugestoes.style.display = "none";
});

/* ---- 12. ESCOLHER LINHA — fallback multi-fonte, sem tocar em medAtivo ---- */
function escolherLinha(modo) {
    const nome = inputNome.value.trim().toLowerCase();
    if (!nome) { medAtivo = null; fonteUsadaAtual = null; notaFallback.style.display = "none"; return; }

    let filtradas = (bancoDados[fonteAtual] || []).filter(m => nomeCorresponde(m, nome));
    notaFallback.style.display = "none";
    fonteUsadaAtual = fonteAtual;

    if (filtradas.length === 0) {
        const outrasFontesComOMedicamento = Object.keys(bancoDados)
            .filter(f => f !== fonteAtual)
            .filter(f => bancoDados[f].some(m => nomeCorresponde(m, nome)));

        if (outrasFontesComOMedicamento.length > 0) {
            const fonteEncontrada = outrasFontesComOMedicamento[0];
            filtradas = bancoDados[fonteEncontrada].filter(m => nomeCorresponde(m, nome));
            fonteUsadaAtual = fonteEncontrada;

            const rotuloOriginal = ROTULOS_FONTE[fonteAtual] || fonteAtual;
            const rotuloEncontrado = ROTULOS_FONTE[fonteEncontrada] || fonteEncontrada;
            notaFallback.innerHTML = `<i class="ri-information-line"></i><span>"${inputNome.value.trim()}" não está disponível para a referência "${rotuloOriginal}". A dose apresentada é baseada na referência "${rotuloEncontrado}".</span>`;
            notaFallback.style.display = "flex";
        }
    }

    if (filtradas.length === 0) { medAtivo = null; fonteUsadaAtual = null; notaFallback.style.display = "none"; return; }

    medAtivo = filtradas[0];
    aplicarFiltrosAdicionais();
}

function escolherLinhaSugestao(nome, fonteSugestao) {
    // Se a sugestão vem da fonte atual, comportamento normal
    if (fonteSugestao === fonteAtual) {
        escolherLinha('silencioso');
        exibirCampos();
        return;
    }

    const nomeLower = nome.toLowerCase();

    // Verifica se o medicamento também existe na fonte atual
    const existeNaFonteAtual = (bancoDados[fonteAtual] || []).some(m => nomeCorresponde(m, nomeLower));

    // Sugestão de outra fonte
    notaFallback.style.display = "none";
    fonteUsadaAtual = fonteSugestao;

    let filtradas = (bancoDados[fonteSugestao] || []).filter(m => nomeCorresponde(m, nomeLower));
    if (filtradas.length === 0) {
        medAtivo = null;
        exibirCampos();
        return;
    }

    medAtivo = filtradas[0];
    aplicarFiltrosAdicionais();

    const rotuloSelecionada = ROTULOS_FONTE[fonteAtual] || fonteAtual;
    const rotuloSugestao = ROTULOS_FONTE[fonteSugestao] || fonteSugestao;

    if (existeNaFonteAtual) {
        // Medicamento existe em ambas as fontes — apenas informa que estamos a usar a outra
        notaFallback.innerHTML = `<i class="ri-information-line"></i><span>"${nome}" está a ser calculado com base na referência "<strong>${rotuloSugestao}</strong>".</span>`;
    } else {
        // Medicamento só existe na outra fonte
        notaFallback.innerHTML = `<i class="ri-information-line"></i><span>"${nome}" não está disponível para a referência "${rotuloSelecionada}". A dose apresentada é baseada na referência "${rotuloSugestao}".</span>`;
    }
    notaFallback.style.display = "flex";

    exibirCampos();
}

function aplicarFiltrosAdicionais() {
    if (!medAtivo) return;

    const populacaoSel = valorCustomSelect('populacao').toLowerCase();
    const viaSel = valorCustomSelect('via').toLowerCase();
    const condicaoSel = valorCustomSelect('condicao').toLowerCase();
    const pesoVal = parseFloat(inputs.peso.value) || 0;
    const idadeVal = parseFloat(inputs.idade.value) || 0;
    const fatorIdade = parseFloat(document.getElementById('tempLocalSelect').dataset.valorAtual) || 365;
    const idadeDias = idadeVal * fatorIdade;

    // 🔥 CORREÇÃO: procura a linha correspondente na fonte REALMENTE usada
    // (fonteUsadaAtual), não sempre em fonteAtual -- é o que estava a fazer
    // condição/população/via desaparecerem durante o fallback.
    let filtradas = (bancoDados[fonteUsadaAtual || fonteAtual] || [])
        .filter(m => nomeCorresponde(m, inputNome.value.trim().toLowerCase()));
    if (filtradas.length === 0) filtradas = [medAtivo];

    if (condicaoSel) { const t = filtradas.filter(m => String(m.condicao || "").toLowerCase().trim() === condicaoSel); if (t.length) filtradas = t; }
    if (populacaoSel) { const t = filtradas.filter(m => String(m.populacao || "").toLowerCase().trim() === populacaoSel); if (t.length) filtradas = t; }
    if (viaSel) { const t = filtradas.filter(m => String(m.via || "").toLowerCase().trim() === viaSel); if (t.length) filtradas = t; }
    if (idadeDias > 0) { const t = filtradas.filter(m => dentroDaFaixa(idadeDias, resolverFaixaIdade(m.idade))); if (t.length) filtradas = t; }
    if (pesoVal > 0) { const t = filtradas.filter(m => dentroDaFaixa(pesoVal, resolverFaixaPeso(m.peso))); if (t.length) filtradas = t; }

    medAtivo = filtradas[0] || medAtivo;

    if (populacaoSel === 'pediatrica' || (medAtivo && medAtivo.populacao && medAtivo.populacao.toLowerCase() === 'pediatrica')) {
        verificarTetoPediatrico();
    }
}

function verificarTetoPediatrico() {
    if (!inputs.idade.value) return;
    const fatorConversao = parseFloat(document.getElementById('tempLocalSelect').dataset.valorAtual) || 365;
    const idadeEmDias = parseFloat(inputs.idade.value) * fatorConversao;
    if (idadeEmDias > IDADE_TETO_PEDIATRICO_ANOS * 365) {
        avisar(`⚠️ Idade implausível para população pediátrica.<br>
        Inseriste uma idade acima de ${IDADE_TETO_PEDIATRICO_ANOS} anos com "Pediátrica" selecionada.<br>
        <strong>Confirma a idade ou a população escolhida.</strong>`);
    }
}

/* ---- 13. EXIBIR CAMPOS ---- */
function exibirCampos() {
    if (!medAtivo) {
        inputs.peso.value = ""; inputs.idade.value = "";
        inputs.dosagem.value = ""; inputs.dosagemManutencao.value = "";
        [camposGrid, linhaSecundaria, linhaIntervaloDuplo].forEach(el => el && (el.style.display = "none"));
        ['viaSelect', 'intervaloSelect', 'populacaoSelect', 'condicaoSelect', 'intervaloManutencaoSelect', 'concentracaoSelect'].forEach(id => {
            const el = document.getElementById(id); if (el) el.style.display = "none";
        });
        pResultado.innerHTML = "";
        notaFallback.style.display = "none";
        exibirCampos._linhaAnterior = null;
        return;
    }

    const linhaNova = exibirCampos._linhaAnterior !== medAtivo;
    exibirCampos._linhaAnterior = medAtivo;
    if (linhaNova) concentracaoMap = {};

    // --- CAMPOS: PESO / IDADE / DOSE / DOSE MANUTENÇÃO ---
    camposGrid.style.display = "grid";

    const temPeso = medAtivo.peso && medAtivo.peso.trim() !== "";
    const temIdade = medAtivo.idade && medAtivo.idade.trim() !== "";
    campoPeso.style.display = temPeso ? "flex" : "none";
    campoIdade.style.display = temIdade ? "flex" : "none";

    const dose = interpretarDoseOuIntervalo(medAtivo.dose);
    const temDose = medAtivo.dose && medAtivo.dose.trim() !== "";
    const temDoseManutencao = dose.temDuasFases && dose.manutencao && dose.manutencao.trim() !== "";

    if (!temDose) {
        campoDosagem.style.display = "none";
        campoDosagemManutencao.style.display = "none";
        labelDosagem.textContent = "Dose";
    } else if (temDoseManutencao) {
        campoDosagem.style.display = "flex";
        campoDosagemManutencao.style.display = "flex";
        labelDosagem.textContent = "Dose de ataque";

        const partesAtaque = dose.ataque.split(',').map(p => p.trim());
        if (linhaNova && !inputs.dosagem.value) inputs.dosagem.value = partesAtaque[2] || '';
        txtUnidadeDosagem.innerText = partesAtaque[3] || '';

        const partesManut = dose.manutencao.split(',').map(p => p.trim());
        if (linhaNova && !inputs.dosagemManutencao.value) inputs.dosagemManutencao.value = partesManut[2] || '';
        txtUnidadeDosagemManutencao.innerText = partesManut[3] || '';

        // Deteta se há apenas UM campo solto (peso OU idade) antes do par ataque/manutenção
        const soltosAntes = [campoPeso, campoIdade].filter(el => el.style.display !== "none").length;
        if (temDoseManutencao && soltosAntes === 1) {
            camposGrid.classList.add('grid-unica-solta');
        } else {
            camposGrid.classList.remove('grid-unica-solta');
        }
    } else if (dose.simples !== undefined && dose.simples !== '') {
        campoDosagem.style.display = "flex";
        campoDosagemManutencao.style.display = "none";
        labelDosagem.textContent = "Dose";

        const partes = dose.simples.split(',').map(p => p.trim());
        if (linhaNova && !inputs.dosagem.value) inputs.dosagem.value = partes[2] || '';
        txtUnidadeDosagem.innerText = partes[3] || '';
    } else {
        campoDosagem.style.display = "flex";
        campoDosagemManutencao.style.display = "none";
        labelDosagem.textContent = "Dose";

        const partes = dose.ataque.split(',').map(p => p.trim());
        if (linhaNova && !inputs.dosagem.value) inputs.dosagem.value = partes[2] || '';
        txtUnidadeDosagem.innerText = partes[3] || '';
    }

    // Aplica grelha: 2 colunas por defeito; 1 coluna se só houver 1 campo visível
    const visiveis = [campoPeso, campoIdade, campoDosagem, campoDosagemManutencao]
        .filter(el => el.style.display !== "none");
    if (visiveis.length <= 1) {
        camposGrid.classList.add('grid-unica');
    } else {
        camposGrid.classList.remove('grid-unica');
    }

    // Força peso/idade a ocupar linha inteira quando há par ataque/manutenção
    if (temDoseManutencao) {
        camposGrid.classList.add('tem-dupla');
    } else {
        camposGrid.classList.remove('tem-dupla');
    }

    // --- CONDIÇÃO / POPULAÇÃO / VIA (usam a fonte realmente usada) ---
    const nomeMedicamento = inputNome.value.trim().toLowerCase();
    let baseFiltrada = (bancoDados[fonteUsadaAtual || fonteAtual] || []).filter(m => nomeCorresponde(m, nomeMedicamento));
    const condicoesUnicas = [...new Set(baseFiltrada.map(m => m.condicao).filter(c => c && String(c).trim() !== ""))];
    const condicaoSelectEl = document.getElementById('condicaoSelect');
    if (condicoesUnicas.length > 1) {
        popularCustomSelect('condicao', condicoesUnicas.map(c => ({ valor: String(c).trim(), texto: String(c).trim(), icone: 'ri-stethoscope-line' })),
            () => { escolherLinha('ajuste'); exibirCampos(); });
        condicaoSelectEl.style.display = "block";
    } else {
        condicaoSelectEl.style.display = "none";
        condicaoSelectEl.dataset.valorAtual = "";
    }

    // --- CONCENTRAÇÃO ---
    const concRaw = String(medAtivo.concentracao || "").trim();
    const temMultiplas = concRaw.includes("|") && concRaw.includes(";");

    if (temMultiplas) {
        const opcoes = [];
        const assinaturaAtual = concentracaoSelect.getAttribute("data-assinatura");
        if (concRaw !== assinaturaAtual) {
            let i = 0;
            concRaw.split(";").forEach(g => {
                const pts = g.split("|");
                if (pts.length === 2) {
                    const label = pts[0].trim();
                    const valorNumerico = parseFloat(pts[1]) || 1;
                    const chave = 'conc_' + i;
                    opcoes.push({ valor: chave, texto: label, icone: 'ri-capsule-line' });
                    concentracaoMap[chave] = { label, valorNumerico };
                    i++;
                }
            });
            if (opcoes.length > 0) {
                popularCustomSelect('concentracao', opcoes, () => calcularSePronto());
                concentracaoSelect.setAttribute("data-assinatura", concRaw);
            }
        }
        concentracaoSelect.style.display = "block";
    } else {
        concentracaoSelect.style.display = "none";
        concentracaoSelect.removeAttribute("data-assinatura");
        if (concRaw) {
            let labelUnica = concRaw;
            let valorUnico = 1;
            if (concRaw.includes("|")) {
                const pts = concRaw.split("|");
                labelUnica = pts[0].trim();
                valorUnico = parseFloat(pts[1]) || 1;
            } else {
                labelUnica = concRaw;
                valorUnico = parseFloat(concRaw.match(/(\d+\.?\d*)/)?.[0] || 1);
            }
            concentracaoMap['unica'] = { label: labelUnica, valorNumerico: valorUnico };
            const span = document.getElementById('concentracaoSelecionada');
            if (span) span.textContent = labelUnica;
            concentracaoSelect.dataset.valorAtual = 'unica';
        }
    }

    // --- POPULAÇÃO ---
    const populacoesUnicas = [...new Set(baseFiltrada
        .filter(m => !condicoesUnicas.length || String(m.condicao || "").trim() === String(medAtivo.condicao || "").trim())
        .map(m => m.populacao).filter(p => p && String(p).trim() !== ""))];
    const populacaoSelectEl = document.getElementById('populacaoSelect');
    const rotulosPop = { pediatrica: "Pediátrica", adulta: "Adulta", gravida: "Grávida" };
    const iconesPop = { pediatrica: "ri-emotion-happy-line", adulta: "ri-user-line", gravida: "ri-women-line" };
    if (populacoesUnicas.length > 1) {
        popularCustomSelect('populacao', populacoesUnicas.map(p => {
            const v = String(p).trim().toLowerCase();
            return { valor: v, texto: rotulosPop[v] || v, icone: iconesPop[v] || 'ri-user-line' };
        }), () => { verificarTetoPediatrico(); escolherLinha('ajuste'); exibirCampos(); });
        populacaoSelectEl.style.display = "block";
    } else {
        populacaoSelectEl.style.display = "none";
        populacaoSelectEl.dataset.valorAtual = "";
    }

    // --- VIA ---
    // --- VIA ---
const viasUnicas = [...new Set(baseFiltrada
    .filter(m => !condicoesUnicas.length || String(m.condicao || "").trim() === String(medAtivo.condicao || "").trim())
    .map(m => m.via).filter(v => v && String(v).trim() !== ""))];
const viaSelectEl = document.getElementById('viaSelect');
if (viasUnicas.length > 1) {
    popularCustomSelect('via', viasUnicas.map(v => ({ valor: String(v).trim().toLowerCase(), texto: String(v).trim().toUpperCase(), icone: 'ri-syringe-line' })),
        () => { escolherLinha('ajuste'); exibirCampos(); });
    viaSelectEl.style.display = "block";
} else {
    viaSelectEl.style.display = "none";
    viaSelectEl.dataset.valorAtual = "";
}

// --- INTERVALO (ataque/manutenção, independentes) ---
const intervalo = interpretarIntervalo(medAtivo.intervalo);
const intervaloSelectEl = document.getElementById('intervaloSelect');
const intervaloManutSelectEl = document.getElementById('intervaloManutencaoSelect');
const esconderSelect = (el) => { el.style.display = "none"; };

if (intervalo.simples !== undefined) {
    // Cenário 1: intervalo simples, aplica-se ao ataque (e por consequência à manutenção)
    const opcoes = gerarOpcoesIntervalo(intervalo.simples);
    linhaIntervaloDuplo.style.display = "none";
    linhaSecundaria.appendChild(intervaloSelectEl);
    esconderSelect(intervaloManutSelectEl);
    if (opcoes.length > 1) {
        popularCustomSelect('intervalo', opcoes, () => calcularSePronto());
        intervaloSelectEl.style.display = "block";
        document.getElementById('intervaloSelecionado').parentElement.querySelector('.floating-label').textContent = 'Intervalo';
    } else {
        esconderSelect(intervaloSelectEl);
        intervaloSelectEl.dataset.valorAtual = opcoes[0] ? opcoes[0].valor : '';
    }
    intervaloManutSelectEl.dataset.valorAtual = intervaloSelectEl.dataset.valorAtual || '';
} else {
    // Cenários 2, 3, 4
    const opcoesAtaque = intervalo.temAtaque ? gerarOpcoesIntervalo(intervalo.ataque) : [];
    const opcoesManut = intervalo.temManutencao ? gerarOpcoesIntervalo(intervalo.manutencao) : [];
    const mostrarAtaque = opcoesAtaque.length > 1;
    const mostrarManut = opcoesManut.length > 1;

    if (mostrarAtaque && mostrarManut) {
        // Cenário 4 com ambos visíveis: linha dupla
        linhaIntervaloDuplo.appendChild(intervaloSelectEl);
        linhaIntervaloDuplo.style.display = "flex";

        popularCustomSelect('intervalo', opcoesAtaque, () => calcularSePronto());
        intervaloSelectEl.style.display = "block";
        document.getElementById('intervaloSelecionado').parentElement.querySelector('.floating-label').textContent = 'Intervalo de ataque';

        popularCustomSelect('intervaloManutencao', opcoesManut, () => calcularSePronto());
        intervaloManutSelectEl.style.display = "block";
    } else {
        // Pelo menos um dos dois entra no fluxo normal, ou nenhum é visível
        linhaIntervaloDuplo.style.display = "none";
        linhaSecundaria.appendChild(intervaloSelectEl);
        linhaSecundaria.appendChild(intervaloManutSelectEl);

        if (mostrarAtaque) {
            popularCustomSelect('intervalo', opcoesAtaque, () => calcularSePronto());
            intervaloSelectEl.style.display = "block";
            document.getElementById('intervaloSelecionado').parentElement.querySelector('.floating-label').textContent = 'Intervalo de ataque';
        } else if (intervalo.temAtaque) {
            esconderSelect(intervaloSelectEl);
            intervaloSelectEl.dataset.valorAtual = opcoesAtaque[0] ? opcoesAtaque[0].valor : '';
        } else {
            esconderSelect(intervaloSelectEl);
            intervaloSelectEl.dataset.valorAtual = '';
        }

        if (mostrarManut) {
            popularCustomSelect('intervaloManutencao', opcoesManut, () => calcularSePronto());
            intervaloManutSelectEl.style.display = "block";
        } else if (intervalo.temManutencao) {
            esconderSelect(intervaloManutSelectEl);
            intervaloManutSelectEl.dataset.valorAtual = opcoesManut[0] ? opcoesManut[0].valor : '';
        } else {
            esconderSelect(intervaloManutSelectEl);
            intervaloManutSelectEl.dataset.valorAtual = '';
        }
    }
}

linhaSecundaria.style.display = "flex";

const selectsVisiveis = [viaSelectEl, intervaloSelectEl, intervaloManutSelectEl, populacaoSelectEl]
    .filter(el => el.style.display !== "none");
if (selectsVisiveis.length <= 1) {
    linhaSecundaria.classList.add('linha-unica');
} else {
    linhaSecundaria.classList.remove('linha-unica');
}
}

function gerarOpcoesIntervalo(textoIntervalo) {
    const valores = (textoIntervalo || '').split(",").map(h => h.trim()).filter(h => h !== "");
    const valoresUnicos = [...new Set(valores)];
    return valoresUnicos.map(h => {
        const isDoseUnica = h.includes("*") || h.includes("!") || h.includes("u");
        const horasRaw = h.replace(/[\*\!u#]/g, '');
        const horas = parseInt(horasRaw);
        let texto;
        if (isDoseUnica) texto = "Dose única";
        else if (horas > 24) {
            const dias = horas / 24;
            texto = dias === 2 ? "1 vez/2 dias" : dias === 7 ? "1 vez/semana" : `1 vez/${formatarNumero(dias)} dias`;
        } else if (horas === 24) texto = "1 vez/dia";
        else texto = `${horasRaw}/${horasRaw}h`;
        return {
            valor: h,
            texto: texto,
            icone: 'ri-repeat-line',
            vezesDia: isDoseUnica ? (24 / (horas || 24)) : (24 / horas),
            isDoseUnica: isDoseUnica,
            horasRaw: horas
        };
    });
}

/* ---- 14. MODAL ---- */
function avisar(m) {
    const modal = document.getElementById("meuModal");
    const pModal = document.getElementById("modalMensagem");
    document.body.classList.add("modal-aberto");
    if (modal.style.display === "flex") {
        if (pModal.innerHTML.includes(m)) return;
        pModal.insertAdjacentHTML('beforeend', "<hr style='margin:10px 0'>" + m);
    } else {
        pModal.innerHTML = m;
        modal.style.display = "flex";
    }
}
function fecharModal() {
    document.getElementById("meuModal").style.display = "none";
    document.getElementById("modalMensagem").innerHTML = "";
    document.body.classList.remove("modal-aberto");
}

function fraseLimitePeso(faixa) {
    const minF = isFinite(faixa.min) ? `${faixa.minInclusive ? 'maior ou igual a' : 'maior que'} ${formatarNumero(faixa.min)}` : null;
    const maxF = isFinite(faixa.max) ? `${faixa.maxInclusive ? 'menor ou igual a' : 'menor que'} ${formatarNumero(faixa.max)}` : null;
    if (minF && maxF) return `${minF} e ${maxF}`;
    return minF || maxF || 'sem limite definido';
}
function fraseLimiteIdade(faixa) {
    const minF = faixa.minTexto ? `${faixa.minInclusive ? 'maior ou igual a' : 'maior que'} ${faixa.minTexto}` : null;
    const maxF = faixa.maxTexto ? `${faixa.maxInclusive ? 'menor ou igual a' : 'menor que'} ${faixa.maxTexto}` : null;
    if (minF && maxF) return `${minF} e ${maxF}`;
    return minF || maxF || 'sem limite definido';
}

/* ---- 15. CÁLCULO PRINCIPAL ---- */
function calcular() {

    console.log('dataset:', concentracaoSelect.dataset.valorAtual, 'map keys:', Object.keys(concentracaoMap));

    pResultado.classList.remove("vibrar"); void pResultado.offsetWidth; pResultado.classList.add("vibrar");

    if (!medAtivo) {
        pResultado.innerHTML = `<div class="dosagem-erro"><i class="ri-error-warning-fill"></i><span>Medicamento não encontrado!</span></div>`;
        pResultado.style.background = "none"; pResultado.style.display = "block";
        return;
    }

    const idadeTexto = document.getElementById('tempLocalSelecionado').textContent;
    const fatorConversao = parseFloat(document.getElementById('tempLocalSelect').dataset.valorAtual) || 365;
    let peso = parseFloat(inputs.peso.value) || 1;
    let idade = parseFloat(inputs.idade.value) || 1;

    if (inputs.peso.value !== "" && (peso > PESO_MAX_PLAUSIVEL || peso < PESO_MIN_PLAUSIVEL)) {
        avisar(`⚠️ Peso implausível.<br>${peso} kg está fora do intervalo humano realista (entre ${PESO_MIN_PLAUSIVEL} e ${PESO_MAX_PLAUSIVEL} kg).<br><strong>Verifica se não há um erro de digitação.</strong>`);
        return;
    }
    if (inputs.idade.value !== "") {
        const idadeEmDiasCheck = idade * fatorConversao;
        if (idadeEmDiasCheck > IDADE_MAX_PLAUSIVEL_ANOS * 365 || idadeEmDiasCheck < 0) {
            avisar(`⚠️ Idade implausível.<br>${idade} ${idadeTexto} está fora do intervalo humano realista (entre 0 e ${IDADE_MAX_PLAUSIVEL_ANOS} anos).<br><strong>Verifica se não há um erro de digitação.</strong>`);
            return;
        }
    }

    const populacaoAtual = valorCustomSelect('populacao').toLowerCase();
    if (populacaoAtual === 'pediatrica') verificarTetoPediatrico();

    if (medAtivo.peso && inputs.peso.value !== "") {
        const faixa = resolverFaixaPeso(medAtivo.peso);
        if (!dentroDaFaixa(peso, faixa)) {
            const novoPeso = peso < faixa.min ? faixa.min : faixa.max;
            avisar(`⚠️ Peso inválido.<br>O peso tem de ser ${fraseLimitePeso(faixa)} kg.<br><strong>Corrigido para: ${formatarNumero(novoPeso)} kg</strong>`);
            peso = novoPeso; inputs.peso.value = peso;
        }
    }

    if (medAtivo.idade && inputs.idade.value !== "") {
        const faixa = resolverFaixaIdade(medAtivo.idade);
        const idadeEmDias = idade * fatorConversao;
        if (!dentroDaFaixa(idadeEmDias, faixa)) {
            const novaIdadeDias = idadeEmDias < faixa.min ? faixa.min : faixa.max;
            const novaIdade = formatarNumero(novaIdadeDias / fatorConversao);
            avisar(`⚠️ Idade inválida.<br>A idade tem de ser ${fraseLimiteIdade(faixa)}.<br><strong>Corrigida para: ${novaIdade} ${idadeTexto}</strong>`);
            idade = parseFloat(novaIdade); inputs.idade.value = idade;
        }
    }

    let notaReferenciaPeso = null;
    if (populacaoAtual && inputs.peso.value !== "") {
        if (populacaoAtual === 'adulta' && peso < REF_PESO_ADULTO_MIN) {
            notaReferenciaPeso = `Peso baixo para dose adulta (referência interna: adulto > ${REF_PESO_ADULTO_MIN} kg). Pode indicar desnutrição — considera avaliação clínica individual.`;
        } else if (populacaoAtual === 'pediatrica' && peso >= REF_PESO_ADULTO_MIN) {
            notaReferenciaPeso = `Peso alto para dose pediátrica (referência interna: pediátrico ≤ ${REF_PESO_ADULTO_MIN} kg). Confirma se a dose adulta não é mais apropriada.`;
        }
    }

    let concentracao = 1, textoExibido, indiceConcentracao = null;
    const valorSelecionado = concentracaoSelect.dataset.valorAtual || '';
    if (valorSelecionado && concentracaoMap[valorSelecionado]) {
        const dados = concentracaoMap[valorSelecionado];
        textoExibido = dados.label;
        concentracao = dados.valorNumerico || 1;
        const opcoes = concentracaoSelect.querySelectorAll('.custom-select-option');
        let idx = 0;
        opcoes.forEach((opt, i) => { if (opt.dataset.value === valorSelecionado) idx = i + 1; });
        indiceConcentracao = idx || null;
    } else {
        const concStr = String(medAtivo.concentracao || "").trim();
        if (concStr.includes("|")) {
            const pts = concStr.split("|");
            textoExibido = pts[0].trim(); concentracao = parseFloat(pts[1]) || 1;
        } else {
            const matchNumero = concStr.match(/(\d+\.?\d*)/);
            textoExibido = concStr; concentracao = matchNumero ? parseFloat(matchNumero[0]) : 1;
        }
    }

    function validarDose(inputEl, doseString, rotulo) {
        if (!doseString || inputEl.value === "") return;
        const partes = doseString.split(',').map(p => p.trim());
        const minimo = parseFloat(partes[0]), maximo = parseFloat(partes[1]), unidade = partes[3] || '';
        if (isNaN(minimo) || isNaN(maximo)) return;
        const valor = parseFloat(inputEl.value);
        if (valor < minimo || valor > maximo) {
            const novaDose = valor < minimo ? minimo : maximo;
            avisar(`⚠️ Dose${rotulo} inválida.<br>A dose tem de estar entre ${formatarNumero(minimo)} e ${formatarNumero(maximo)} ${unidade}.<br><strong>Corrigida para: ${formatarNumero(novaDose)} ${unidade}</strong>`);
            inputEl.value = novaDose;
        }
    }

    const dose = interpretarDoseOuIntervalo(medAtivo.dose);
    let dAtaqueMg = null, dManutMg = null;
    if (dose.simples !== undefined && dose.simples !== '') {
        validarDose(inputs.dosagem, dose.simples, "");
        const partesDose = dose.simples.split(',').map(p => p.trim());
        const unidade = partesDose[3] || '', fatorUnidade = partesDose[4] || '';
        const valor = parseFloat(inputs.dosagem.value) || 0;
        dAtaqueMg = converterParaMg(valor, unidade, textoExibido, fatorUnidade); if (dAtaqueMg === null) dAtaqueMg = valor;
        dManutMg = dAtaqueMg;
    } else if (dose.ataque !== undefined) {
        validarDose(inputs.dosagem, dose.ataque, " de ataque");
        if (dose.temDuasFases) validarDose(inputs.dosagemManutencao, dose.manutencao, " de manutenção");
        const partesA = dose.ataque.split(',').map(p => p.trim());
        const partesM = dose.manutencao.split(',').map(p => p.trim());
        const unidadeA = partesA[3] || '', fatorA = partesA[4] || '';
        const unidadeM = partesM[3] || '', fatorM = partesM[4] || '';
        const valorA = parseFloat(inputs.dosagem.value) || 0;
        const valorM = dose.temDuasFases ? (parseFloat(inputs.dosagemManutencao.value) || 0) : valorA;
        dAtaqueMg = converterParaMg(valorA, unidadeA, textoExibido, fatorA); if (dAtaqueMg === null) dAtaqueMg = valorA;
        dManutMg = converterParaMg(valorM, unidadeM, textoExibido, fatorM); if (dManutMg === null) dManutMg = valorM;
    }

    // --- INTERVALOS (independentes) ---
    const intervalo = interpretarIntervalo(medAtivo.intervalo);
    let iAtaque = null, iManut = null;
    let opcaoIntervaloAtiva = null, opcaoIntervaloManutAtiva = null;

    if (intervalo.simples !== undefined && intervalo.simples !== '') {
        const opcoes = gerarOpcoesIntervalo(intervalo.simples);
        if (opcoes.length > 0) {
            const valSel = valorCustomSelect('intervalo') || opcoes[0].valor;
            const opSel = opcoes.find(o => o.valor === valSel) || opcoes[0];
            iAtaque = opSel.vezesDia;
            iManut = opSel.vezesDia;
            opcaoIntervaloAtiva = opSel;
            opcaoIntervaloManutAtiva = opSel;
        }
    } else {
        if (intervalo.temAtaque) {
            const opcoesAtaque = gerarOpcoesIntervalo(intervalo.ataque);
            if (opcoesAtaque.length > 0) {
                const valSel = valorCustomSelect('intervalo') || opcoesAtaque[0].valor;
                const opSel = opcoesAtaque.find(o => o.valor === valSel) || opcoesAtaque[0];
                iAtaque = opSel.vezesDia;
                opcaoIntervaloAtiva = opSel;
            }
        }
        if (intervalo.temManutencao) {
            const opcoesManut = gerarOpcoesIntervalo(intervalo.manutencao);
            if (opcoesManut.length > 0) {
                const valSelM = valorCustomSelect('intervaloManutencao') || opcoesManut[0].valor;
                const opSelM = opcoesManut.find(o => o.valor === valSelM) || opcoesManut[0];
                iManut = opSelM.vezesDia;
                opcaoIntervaloManutAtiva = opSelM;
            }
        }
    }

    try {
        let formulaCompleta = medAtivo.formula
            .replace(/#p/g, peso).replace(/#co/g, textoExibido).replace(/#id/g, idade).replace(/#c/g, concentracao);
        if (dAtaqueMg !== null) {
            formulaCompleta = formulaCompleta.replace(/#d_ataque/g, dAtaqueMg).replace(/#d_manutencao/g, dManutMg).replace(/#d/g, dAtaqueMg);
        }
        // Intervalo: substituição individual, apenas se existir
        if (iAtaque !== null) {
            formulaCompleta = formulaCompleta.replace(/#i_ataque/g, iAtaque).replace(/#i/g, iAtaque);
        } else {
            formulaCompleta = formulaCompleta.replace(/#i_ataque/g, '').replace(/#i/g, '');
        }
        if (iManut !== null) {
            formulaCompleta = formulaCompleta.replace(/#i_manutencao/g, iManut);
        } else {
            formulaCompleta = formulaCompleta.replace(/#i_manutencao/g, '');
        }

        const regexCalculo = /{([^}]+)}/g;
        let mlValues = [], match;
        while ((match = regexCalculo.exec(formulaCompleta)) !== null) {
            try { mlValues.push(eval(match[1])); } catch (e) { mlValues.push("Erro"); }
        }

        let resultadoHTML = `<div class="dosagem-container"><div class="dosagem-card">
            <div class="card-header"><div class="card-icon"><i class="ri-medicine-bottle-line"></i></div>
            <div class="card-status"><i class="ri-information-line"></i><span>Resultado</span></div></div>`;

        if (mlValues.length === 1) {
            resultadoHTML += `<div class="dosagem-dose"><div class="dose-valor">
                ${formatarNumero(mlValues[0])} <span class="dose-unidade">mL,</span>
                <span class="dose-unidade-frasco"> frasco: ${textoExibido}</span></div></div>`;

            let horas = null, mostrarTotais = false;
            if (opcaoIntervaloAtiva && !opcaoIntervaloAtiva.isDoseUnica && opcaoIntervaloAtiva.texto !== "1 vez/dia") {
                const horasNum = opcaoIntervaloAtiva.horasRaw;
                if (horasNum > 24) {
                    const dias = horasNum / 24;
                    let txt = dias === 2 ? "1 vez a cada 2 dias" : dias === 7 ? "1 vez por semana" : `1 vez a cada ${formatarNumero(dias)} dias`;
                    resultadoHTML += `<div class="dosagem-intervalo-texto"><i class="ri-time-line"></i><span>${txt}</span></div>`;
                    horas = horasNum; mostrarTotais = false;
                } else if (horasNum !== 24 && horasNum > 0) {
                    resultadoHTML += `<div class="dosagem-intervalo-texto"><i class="ri-time-line"></i><span>de ${formatarNumero(horasNum)} em ${formatarNumero(horasNum)} horas</span></div>`;
                    horas = horasNum; mostrarTotais = (horasNum < 24);
                }
            }

            if (mostrarTotais && horas !== null && horas > 0 && horas < 24) {
                const tomasPorDia = 24 / horas;
                const volumeMl = parseFloat(mlValues[0]);
                const volumePorDia = volumeMl * tomasPorDia;
                resultadoHTML += `<div class="dosagem-totais">
                    <div class="total-item"><i class="ri-repeat-line"></i><span>${formatarNumero(tomasPorDia)} toma(s)/dia</span></div>
                    <div class="total-item"><i class="ri-drop-line"></i><span>${formatarNumero(volumePorDia)} mL/dia</span></div>`;
                if (concentracao > 0) {
                    resultadoHTML += `<div class="total-item"><i class="ri-scales-2-line"></i><span>${formatarNumero(volumeMl * concentracao * tomasPorDia)} mg/dia</span></div>`;
                }
                resultadoHTML += `</div>`;
            }

        } else if (mlValues.length >= 2) {
            const blocoFase = (icone, label, mlValor, opcao) => {
                let html = `<div class="fase-item">`;
                html += `<div class="fase-cabecalho"><i class="${icone}"></i><span class="item-label">${label}</span></div>`;
                html += `<div class="fase-linha-principal"><span class="item-valor">${formatarNumero(mlValor)} <span class="item-unidade">mL,</span></span> <span class="item-unidade-frasco">frasco: ${textoExibido}</span></div>`;
                let horasFase = null;
                if (opcao && !opcao.isDoseUnica && opcao.texto !== "1 vez/dia") {
                    const h = opcao.horasRaw;
                    if (h > 24) {
                        const dias = h / 24;
                        let txt = dias === 2 ? "1 vez a cada 2 dias" : dias === 7 ? "1 vez por semana" : `1 vez a cada ${formatarNumero(dias)} dias`;
                        html += `<div class="fase-intervalo">${txt}</div>`;
                    } else if (h !== 24 && h > 0) {
                        html += `<div class="fase-intervalo">de ${formatarNumero(h)} em ${formatarNumero(h)} horas</div>`;
                        horasFase = h;
                    }
                }
                if (horasFase !== null && horasFase < 24) {
                    const tomas = 24 / horasFase;
                    const vol = parseFloat(mlValor) * tomas;
                    html += `<div class="fase-totais">`;
                    html += `<span><i class="ri-repeat-line"></i> ${formatarNumero(tomas)} toma(s)/dia</span>`;
                    html += `<span><i class="ri-drop-line"></i> ${formatarNumero(vol)} mL/dia</span>`;
                    if (concentracao > 0) {
                        html += `<span><i class="ri-scales-2-line"></i> ${formatarNumero(parseFloat(mlValor) * concentracao * tomas)} mg/dia</span>`;
                    }
                    html += `</div>`;
                }
                html += `</div>`;
                return html;
            };

            resultadoHTML += `<div class="dosagem-ataque-manutencao">
                ${blocoFase('ri-flashlight-line', 'Dose de ataque', mlValues[0], opcaoIntervaloAtiva)}
                ${blocoFase('ri-repeat-line', 'Dose de manutenção', mlValues[1], opcaoIntervaloManutAtiva)}
            </div>`;

        } else {
            resultadoHTML += `<div class="dosagem-erro-interno"><i class="ri-error-warning-line"></i><span>Nenhuma fórmula de cálculo encontrada</span></div>`;
        }

        const notasTexto = String(medAtivo.adicionais || "");
        let notas = [];
        function filtrarNotaPorConcentracao(texto, indiceSelecionado) {
            if (!/\[\d+\]/.test(texto)) return texto;
            if (indiceSelecionado === null) return texto.replace(/\[\d+\]\s*/g, '').trim();
            const partes = texto.split(/(\[\d+\])/);
            let indiceAtual = null, resultado = "";
            for (const parte of partes) {
                const m = parte.match(/^\[(\d+)\]$/);
                if (m) { indiceAtual = parseInt(m[1], 10); continue; }
                if (indiceAtual === null || indiceAtual === indiceSelecionado) resultado += parte;
            }
            return resultado.replace(/\s+/g, ' ').trim();
        }
        if (notaReferenciaPeso) {
            notas.push(`<span style="color:#ff9800;font-weight:600;background:rgba(255,152,0,.15);padding:4px 6px;border-radius:12px;display:inline-block;">${notaReferenciaPeso}</span>`);
        }
        if (notasTexto.trim() !== "") {
            let bruto = notasTexto.trim();
            if (!bruto.startsWith('#')) bruto = '#' + bruto;
            if (!bruto.endsWith('#')) bruto += '#';
            const partes = bruto.split('#');
            for (let parte of partes) {
                parte = parte.trim();
                if (!parte) continue;
                if (parte.includes('{') || parte.includes('}') || parte.match(/^[\d\.\s%]+$/)) continue;
                parte = filtrarNotaPorConcentracao(parte, indiceConcentracao);
                if (!parte) continue;
                parte = parte.replace(/@@([^@]+)@/g, (_, c) =>
                    `<span style="color:#ff9800;font-weight:600;background:rgba(255,152,0,.15);padding:4px 6px;border-radius:12px;display:inline-block;">${c}</span>`
                ).replace(/@/g, '').trim();
                if (parte) notas.push(parte);
            }
        }

        if (notas.length > 0) {
            const referencia = String(medAtivo.nota || "").trim();
            const excedeLimite = notas.length > MAX_NOTAS_VISIVEIS;
            const indiceCorte = notas.length - 1;

            resultadoHTML += `<div class="dosagem-notas"><div class="notas-titulo"><i class="ri-information-fill"></i><span>Informações Adicionais</span></div><div class="notas-scroll">`;

            notas.forEach((n, i) => {
                if (excedeLimite && i === indiceCorte) {
                    resultadoHTML += `<button class="btn-ver-mais-notas" onclick="alternarNotasOcultas(this)"><i class="ri-arrow-down-s-line"></i> Ver mais (${notas.length - MAX_NOTAS_VISIVEIS})</button>`;
                }
                const oculta = excedeLimite && i >= MAX_NOTAS_VISIVEIS && i !== indiceCorte ? ' nota-oculta' : '';
                resultadoHTML += `<div class="nota-item${oculta}"><i class="ri-information-line"></i><span>${n}</span></div>`;
            });

            if (referencia) {
                resultadoHTML += `<div class="nota-item nota-referencia"><i class="ri-book-open-line"></i><span>${referencia}</span></div>`;
            }

            resultadoHTML += `</div></div>`;
        }

        resultadoHTML += `</div></div>`;
        pResultado.innerHTML = resultadoHTML;
        pResultado.style.background = "none"; pResultado.style.display = "block";

    } catch (e) {
        console.error("❌ Erro no cálculo:", e);
        pResultado.innerHTML = `<div class="dosagem-erro"><i class="ri-error-warning-line"></i><span>Erro na fórmula da base de dados!</span></div>`;
        pResultado.style.background = "none"; pResultado.style.display = "block";
    }
}

function alternarNotasOcultas(btn) {
    const container = btn.closest('.dosagem-notas');
    const ocultas = container.querySelectorAll('.nota-item.nota-oculta');
    if (ocultas.length > 0) {
        ocultas.forEach(n => n.classList.remove('nota-oculta'));
        btn.innerHTML = `<i class="ri-arrow-up-s-line"></i> Ver menos`;
    } else {
        const total = container.querySelectorAll('.nota-item:not(.nota-referencia)').length;
        const paraOcultar = total - MAX_NOTAS_VISIVEIS - 1;
        const visiveis = container.querySelectorAll('.nota-item:not(.nota-referencia)');
        let contador = 0;
        visiveis.forEach(n => {
            if (contador >= MAX_NOTAS_VISIVEIS && contador < MAX_NOTAS_VISIVEIS + paraOcultar) {
                n.classList.add('nota-oculta');
            }
            contador++;
        });
        btn.innerHTML = `<i class="ri-arrow-down-s-line"></i> Ver mais (${paraOcultar})`;
    }
}

/* ---- 16. GATILHOS ---- */
function calcularSePronto() {
    if (!medAtivo) return;
    const pesoOK = campoPeso.style.display === "none" || inputs.peso.value.trim() !== "";
    const idadeOK = campoIdade.style.display === "none" || inputs.idade.value.trim() !== "";
    const dosagemOK = campoDosagem.style.display === "none" || inputs.dosagem.value.trim() !== "";
    if (pesoOK && idadeOK && dosagemOK) calcular();
}

function limpar() {
    pResultado.classList.remove("vibrar"); void pResultado.offsetWidth; pResultado.classList.add("vibrar");
    inputNome.value = ""; inputs.peso.value = ""; inputs.idade.value = "";
    inputs.dosagem.value = ""; inputs.dosagemManutencao.value = "";
    medAtivo = null; fonteUsadaAtual = null;
    exibirCampos(); pResultado.innerHTML = "";
    fonteFeedback.style.display = "none"; fonteFeedback.innerHTML = ""; // 🔥 limpa também o feedback da fonte
}

inputNome.addEventListener("input", () => {
    const valor = inputNome.value.trim();
    // 🔥 o feedback de sucesso da fonte desaparece assim que se começa a digitar
    fonteFeedback.style.display = "none"; fonteFeedback.innerHTML = "";
    if (valor.length > 0) {
        escolherLinha('silencioso');
        if (medAtivo) { divSugestoes.style.display = "none"; exibirCampos(); }
        else { pResultado.style.display = "none"; gerirSugestoes(); exibirCampos(); }
    } else {
        divSugestoes.style.display = "none"; divSugestoes.innerHTML = "";
    }
});

[inputs.peso, inputs.idade, inputs.dosagem, inputs.dosagemManutencao].forEach(el => {
    el.addEventListener('input', () => { if (inputNome.value.trim() !== "") { escolherLinha('ajuste'); exibirCampos(); } });
});

/* ---- 17. MENU LATERAL ---- */
const btnHamburger = document.getElementById('btnHamburger');
const menuOverlay = document.getElementById('menuOverlay');
const menuLateral = document.getElementById('menuLateral');
const menuItems = document.querySelectorAll('.menu-item');

if (btnHamburger && menuOverlay && menuLateral) {
    function abrirMenu() { btnHamburger.classList.add('ativo'); menuOverlay.classList.add('ativo'); menuLateral.classList.add('ativo'); document.body.style.overflow = 'hidden'; }
    function fecharMenu() { btnHamburger.classList.remove('ativo'); menuOverlay.classList.remove('ativo'); menuLateral.classList.remove('ativo'); document.body.style.overflow = ''; }
    btnHamburger.addEventListener('click', () => menuLateral.classList.contains('ativo') ? fecharMenu() : abrirMenu());
    menuOverlay.addEventListener('click', fecharMenu);
    menuItems.forEach(item => item.addEventListener('click', () => { menuItems.forEach(i => i.classList.remove('active')); item.classList.add('active'); setTimeout(fecharMenu, 200); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuLateral.classList.contains('ativo')) fecharMenu(); });
}

/* ---- 18. INICIALIZAÇÃO ---- */
window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') { body.setAttribute('data-theme', 'dark'); if (themeIcon) themeIcon.className = 'ri-sun-line'; }
    const fonteSalva = localStorage.getItem('fonte');
    if (fonteSalva && ROTULOS_FONTE[fonteSalva]) selecionarFonte(fonteSalva);
    carregarDados();
});










 







// ajustar o tamanho da concentração, tamanho em sucesso, e transaprencia do label e largura do lable flutuante

// -------------
// há um problema no clique das sugestões, quando clico numa sugestão de outra referencia
// aparece sempre: "y" está a ser calculado com base na referência "y", 
// quero que seja assim: 

// quando clico numa sugestão de um medicamnto de outra fonte que existe na fonte atual, então: 
// aparece sempre: "y" está a ser calculado com base na referência "y"

// quando clico numa sugestão de um medicamnto de outra fonte que não existe na fonte atual, então: 
// "x" não está disponível para a referência "y". A dose apresentada é baseada na referência "z".

// esse problema só está no clique das sugestões, quando termino a palavra eu mesmo, acontece como descrevi.

// -------------
// vamos dar aos selects a mesma disposição que os campos
// os selects de intervalo, via, população, alinhados horizontalmente como já está, se estiver só, ocupa o espaço todo
// só que intervalo de ataque e manutenção não entram nesse fluxo, mesmo só, eles ocupam uma linha, deveriam partilahr espaço 
// se haver outro select, se ataque e manutenção, estiverem ambos exibidos, aí sim, devem ocupar uma linha só os dois.
// condição clinica/ inidicação, deve ocupar todo o espaço o tempo todo
