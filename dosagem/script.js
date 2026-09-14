/* ==========================================================================
   1. CONFIGURAÇÕES E TEMA (inalterado)
   ========================================================================== */
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const concentracaoWrapper = document.getElementById('concentracaoWrapper');

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

function formatarNumero(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
}

/* ==========================================================================
   2. CONSTANTES DE SEGURANÇA
   ========================================================================== */
const PESO_MIN_PLAUSIVEL = 0.3;
const PESO_MAX_PLAUSIVEL = 300;
const IDADE_MAX_PLAUSIVEL_ANOS = 120;
const IDADE_TETO_PEDIATRICO_ANOS = 18; // sempre aplicado, mesmo sem estar na base
const REF_PESO_ADULTO_MIN = 49;

const DIAS_POR_UNIDADE = {
    'dia': 1, 'dias': 1,
    'semana': 7, 'semanas': 7,
    'mes': 30, 'meses': 30, 'mês': 30, 'méses': 30,
    'ano': 365, 'anos': 365,
};

const FATORES_MASSA_PARA_MG = {
    'mg': 1, 'g': 1000, 'mcg': 0.001, 'µg': 0.001, 'ug': 0.001, 'kg': 1000000,
};

/* ==========================================================================
   3. VARIÁVEIS GLOBAIS
   ========================================================================== */
let bancoDados = {};
let medAtivo = null;

const inputNome = document.getElementById("nome");
const selectPais = document.getElementById("pais");
const divSugestoes = document.getElementById("sugestoes_box");

const camposDivs = {
    peso: document.getElementById("campo_de_peso"),
    idade: document.getElementById("campo_de_idade"),
    dosagem: document.getElementById("campo_de_dosagem"),
    dosagemManutencao: document.getElementById("campo_de_dosagem_manutencao"),
    dose: document.getElementById("dose"),
    via: document.getElementById("via"),
    intervalo: document.getElementById("intervalo"),
    intervaloManutencaoWrapper: document.getElementById("campo_intervalo_manutencao"),
    intervaloManutencao: document.getElementById("intervalo_manutencao"),
    selConcentracao: document.getElementById("selConcentracao"),
    selDoenca: document.getElementById("selDoenca")
};

const inputs = {
    peso: document.getElementById("peso"),
    idade: document.getElementById("idade"),
    unidadeIdade: document.getElementById("unidade_de_idade"),
    dosagem: document.getElementById("dosagem"),
    dosagemManutencao: document.getElementById("dosagem_manutencao")
};

const txtUnidadeDosagem = document.getElementById("unidade_de_dosagem");
const txtUnidadeDosagemManutencao = document.getElementById("unidade_de_dosagem_manutencao");
const labelDosagem = document.getElementById("label_dosagem");
const pResultado = document.getElementById("resultado");

/* ==========================================================================
   4. INTERPRETAÇÃO DE PESO/IDADE — operadores (<, <=, >, >=), sem parênteses,
   idade sempre com unidade por extenso em cada lado (ex. "2 meses;5 anos").
   Guarda também o TEXTO ORIGINAL de cada lado, para os avisos mostrarem
   a unidade tal como está escrita na base — nunca convertida.
   ========================================================================== */

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

// idade: devolve também o texto original (sem operador) para exibir nos avisos
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

// idade: além dos valores em dias, guarda o texto original de cada lado
// (ex. "2 meses", "5 anos") para os avisos usarem tal e qual
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

/* ==========================================================================
   5. DOSE/INTERVALO COM ATAQUE+MANUTENÇÃO
   "ataque(...)" / "manutencao(...)" — lado vazio usa o valor do outro
   ========================================================================== */

function temAtaqueManutencao(texto) {
    return /ataque\(/i.test(texto || '') || /manutencao\(/i.test(texto || '');
}

function extrairBlocoAtaqueManutencao(texto, chave) {
    const regex = new RegExp(chave + '\\(([^)]*)\\)', 'i');
    const m = (texto || '').match(regex);
    return m ? m[1].trim() : '';
}

function interpretarDoseOuIntervalo(texto) {
    if (!texto || texto.trim() === '') return { simples: '' };
    if (!temAtaqueManutencao(texto)) return { simples: texto.trim() };
    let ataque = extrairBlocoAtaqueManutencao(texto, 'ataque');
    let manutencao = extrairBlocoAtaqueManutencao(texto, 'manutencao');
    if (ataque === '' && manutencao !== '') ataque = manutencao;
    if (manutencao === '' && ataque !== '') manutencao = ataque;
    return { ataque, manutencao, temDuasFases: ataque !== manutencao };
}

/* ==========================================================================
   6. CONVERSÃO DE UNIDADE DE DOSE PARA mg
   ========================================================================== */

function unidadeBase(unidadeTexto) {
    return (unidadeTexto || '').toLowerCase().trim().split('/')[0].trim();
}

function converterParaMg(valor, unidadeTexto, concentracaoTexto, fatorUnidadeTexto) {
    const base = unidadeBase(unidadeTexto);
    if (FATORES_MASSA_PARA_MG.hasOwnProperty(base)) {
        return valor * FATORES_MASSA_PARA_MG[base];
    }

    // Unidade sem conversão linear (ex. UI, mEq): se a concentração desta
    // linha já estiver na mesma unidade, os dois lados já são compatíveis
    // -- não converte nada, o fatorUnidade fica sem uso.
    const concentracaoTemMesmaUnidade = base && String(concentracaoTexto || '').toLowerCase().includes(base);
    if (concentracaoTemMesmaUnidade) return valor;

    // Concentração numa unidade diferente: usa o fatorUnidade fornecido
    // (5º elemento de dose(...)), ex. "0.6 mcg" = 1 unidade da dose.
    if (fatorUnidadeTexto) {
        const texto = String(fatorUnidadeTexto).replace(',', '.').trim();
        const m = texto.match(/^([\d.]+)\s*([a-zµ]+)$/i);
        if (m) {
            const valorPorUnidade = parseFloat(m[1]);
            const unidadeResultante = m[2].toLowerCase();
            const fatorParaMg = FATORES_MASSA_PARA_MG[unidadeResultante];
            if (fatorParaMg !== undefined && !isNaN(valorPorUnidade)) {
                return valor * valorPorUnidade * fatorParaMg;
            }
        }
    }

    return null; // sem informação suficiente para converter
}

/* ==========================================================================
   7. MOTOR DE DADOS — 12 colunas:
   nome, condicao, populacao, via, idade, peso, dose, concentracao,
   intervalo, formula, adicionais, nota
   ========================================================================== */

function formatarFolha(sheet) {
    const matriz = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const indexCabecalho = matriz.findIndex(linha =>
        linha[0] && String(linha[0]).toLowerCase().trim() === "nome"
    );
    if (indexCabecalho === -1) return [];

    const apenasDados = matriz.slice(indexCabecalho);
    const cabecalho = apenasDados[0].map(c => String(c).toLowerCase().trim());
    return apenasDados.slice(1).map(linha => {
        let obj = {};
        cabecalho.forEach((col, i) => {
            let valor = linha[i] !== undefined ? linha[i] : "";
            if (col === "nome" && String(valor).includes("|")) {
                obj[col] = String(valor).split("|").map(s => s.trim());
            } else {
                obj[col] = valor;
            }
        });
        return obj;
    });
}

async function carregarDados() {
    try {
        const response = await fetch('medicamentos.xlsx?v=' + Math.random());
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data);
        bancoDados = {};
        workbook.SheetNames.forEach(nome => {
            bancoDados[nome.toLowerCase().trim()] = formatarFolha(workbook.Sheets[nome]);
        });
        console.log("✅ Base de dados pronta.");
    } catch (e) {
        console.error("❌ Erro ao carregar Excel:", e);
    }
}

/* ---- FIM DA PARTE 1/3 ---- */


/* ==========================================================================
   8. SUGESTÕES (praticamente inalterado — só o nome do país)
   ========================================================================== */

function gerirSugestoes() {
    const termoOriginal = inputNome.value;
    const termo = termoOriginal.trim().toLowerCase();
    const paisAtivo = selectPais.value.toLowerCase();

    if (!termo || termo.length === 0) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    let baseTotal = [...(bancoDados[paisAtivo] || []), ...(bancoDados["oms"] || [])];

    const todosNomes = [];
    baseTotal.forEach(m => {
        if (Array.isArray(m.nome)) {
            m.nome.forEach(nomeSin => {
                if (nomeSin.toLowerCase().includes(termo)) todosNomes.push(nomeSin);
            });
        } else if (m.nome && String(m.nome).toLowerCase().includes(termo)) {
            todosNomes.push(String(m.nome).trim());
        }
    });

    const nomesFiltrados = [...new Set(todosNomes)].sort((a, b) => {
        const aLower = a.toLowerCase(), bLower = b.toLowerCase();
        const aComeca = aLower.startsWith(termo), bComeca = bLower.startsWith(termo);
        if (aComeca && !bComeca) return -1;
        if (!aComeca && bComeca) return 1;
        return aLower.localeCompare(bLower);
    });

    if (nomesFiltrados.length === 0) {
        divSugestoes.style.display = "none";
        return;
    }

    divSugestoes.innerHTML = "";
    divSugestoes.style.display = "block";

    nomesFiltrados.slice(0, 6).forEach(nome => {
        const item = document.createElement("div");
        item.className = "sugestao_item";
        const index = nome.toLowerCase().indexOf(termo);
        const parteAntes = nome.substring(0, index);
        const parteMatch = nome.substring(index, index + termo.length);
        const parteDepois = nome.substring(index + termo.length);
        item.innerHTML = `${parteAntes}<strong>${parteMatch}</strong>${parteDepois}`;
        item.onclick = () => {
            inputNome.value = nome;
            divSugestoes.style.display = "none";
            escolherLinha('silencioso');
            exibirCampos();
        };
        divSugestoes.appendChild(item);
    });
}

/* ==========================================================================
   9. ESCOLHER LINHA — filtra por peso/idade/via/população/condição usando
   as colunas novas (m.peso, m.idade, m.via, m.populacao, m.condicao).
   Teto pediátrico de 18 anos aplicado aqui, sempre, mesmo sem estar na base.
   ========================================================================== */

function escolherLinha(modo) {
    const nome = inputNome.value.trim().toLowerCase();
    const pais = selectPais.value.toLowerCase();
    if (!nome) { medAtivo = null; return; }

    let basePais = bancoDados[pais] || [];

    const nomeCorresponde = (med, nomeBusca) => {
        if (Array.isArray(med.nome)) return med.nome.some(n => n.toLowerCase().trim() === nomeBusca);
        return med.nome && String(med.nome).toLowerCase().trim() === nomeBusca;
    };

    let filtradas = basePais.filter(m => nomeCorresponde(m, nome));
    if (filtradas.length === 0) filtradas = (bancoDados["oms"] || []).filter(m => nomeCorresponde(m, nome));
    if (filtradas.length === 0) { medAtivo = null; return; }

    const populacaoSel = (camposDivs.dose.value || "").toLowerCase().trim(); // select "dose" = população
    const viaSel = (camposDivs.via.value || "").toLowerCase().trim();
    const condicaoSel = (camposDivs.selDoenca.value || "").toLowerCase().trim();
    const pesoVal = parseFloat(inputs.peso.value) || 0;
    const idadeVal = parseFloat(inputs.idade.value) || 0;
    const fatorIdade = parseFloat(inputs.unidadeIdade.value) || 1;
    const idadeDias = idadeVal * fatorIdade;

    if (condicaoSel) {
        let temp = filtradas.filter(m => String(m.condicao || "").toLowerCase().trim() === condicaoSel);
        if (temp.length > 0) filtradas = temp;
    }

    if (populacaoSel) {
        let temp = filtradas.filter(m => String(m.populacao || "").toLowerCase().trim() === populacaoSel);
        if (temp.length > 0) filtradas = temp;
    }

    if (viaSel) {
        let temp = filtradas.filter(m => String(m.via || "").toLowerCase().trim() === viaSel);
        if (temp.length > 0) filtradas = temp;
    }

    if (idadeDias > 0) {
        let temp = filtradas.filter(m => dentroDaFaixa(idadeDias, resolverFaixaIdade(m.idade)));
        if (temp.length > 0) filtradas = temp;
    }

    if (pesoVal > 0) {
        let temp = filtradas.filter(m => dentroDaFaixa(pesoVal, resolverFaixaPeso(m.peso)));
        if (temp.length > 0) filtradas = temp;
    }

    medAtivo = filtradas[0];

    if (medAtivo.populacao) camposDivs.dose.value = String(medAtivo.populacao).toLowerCase();
    if (medAtivo.via) camposDivs.via.value = String(medAtivo.via).toLowerCase();

    // Teto pediátrico automático — dispara aqui, além de calcular()
    if (populacaoSel === 'pediatrica' || (medAtivo.populacao || '').toLowerCase() === 'pediatrica') {
        verificarTetoPediatrico();
    }
}

// Sempre 18 anos, mesmo que a linha não defina máximo nenhum.
// Não corrige nada -- só avisa.
function verificarTetoPediatrico() {
    if (!inputs.idade.value) return;
    const fatorConversao = parseFloat(inputs.unidadeIdade.value) || 365;
    const idadeEmDias = parseFloat(inputs.idade.value) * fatorConversao;
    const tetoDias = IDADE_TETO_PEDIATRICO_ANOS * 365;
    if (idadeEmDias > tetoDias) {
        avisar(`⚠️ Idade implausível para população pediátrica.<br>
        Inseriste uma idade acima de ${IDADE_TETO_PEDIATRICO_ANOS} anos com "Dose Pediátrica" selecionada.<br>
        <strong>Confirma a idade ou a população escolhida.</strong>`);
    }
}

/* ==========================================================================
   10. EXIBIR CAMPOS — peso/idade (novas colunas), dose/intervalo com
   ataque+manutenção (mostra o 2º campo só quando as fases são diferentes),
   condição (antiga "doença"), concentração (inalterado).
   ========================================================================== */

function exibirCampos() {
    if (!medAtivo) {
        inputs.peso.value = ""; inputs.idade.value = "";
        inputs.dosagem.value = ""; inputs.dosagemManutencao.value = "";
        pResultado.style.background = "var(--primary)";
        const wrapper = document.getElementById('concentracaoWrapper');
        if (wrapper) wrapper.style.display = "none";
        Object.values(camposDivs).forEach(div => { if (div) div.style.display = "none"; });
        pResultado.innerHTML = "";
        exibirCampos._linhaAnterior = null;
        return;
    }

    // Só preenche o valor padrão da dose quando a linha muda de facto --
    // repetir isto a cada tecla impedia apagar o último algarismo, porque
    // o campo ficava vazio por um instante e era logo reposto.
    const linhaNova = exibirCampos._linhaAnterior !== medAtivo;
    exibirCampos._linhaAnterior = medAtivo;

    // --- PESO / IDADE ---
    camposDivs.peso.style.display = medAtivo.peso ? "flex" : "none";
    camposDivs.idade.style.display = medAtivo.idade ? "flex" : "none";

    // --- DOSE (com ataque/manutenção) ---
    const dose = interpretarDoseOuIntervalo(medAtivo.dose);
    if (!medAtivo.dose || dose.simples === '') {
        // dose vazia = valor invariável já embutido na fórmula pelo preenchedor
        camposDivs.dosagem.style.display = "none";
        camposDivs.dosagemManutencao.style.display = "none";
    } else if (dose.simples !== undefined) {
        camposDivs.dosagem.style.display = "flex";
        camposDivs.dosagemManutencao.style.display = "none";
        labelDosagem.textContent = "Dose";
        const partes = dose.simples.split(',').map(p => p.trim());
        if (linhaNova && !inputs.dosagem.value) inputs.dosagem.value = partes[2] || '';
        txtUnidadeDosagem.innerText = partes[3] || '';
    } else {
        camposDivs.dosagem.style.display = "flex";
        labelDosagem.textContent = dose.temDuasFases ? "Dose (ataque)" : "Dose";
        const partesAtaque = dose.ataque.split(',').map(p => p.trim());
        if (linhaNova && !inputs.dosagem.value) inputs.dosagem.value = partesAtaque[2] || '';
        txtUnidadeDosagem.innerText = partesAtaque[3] || '';

        if (dose.temDuasFases) {
            camposDivs.dosagemManutencao.style.display = "flex";
            const partesManut = dose.manutencao.split(',').map(p => p.trim());
            if (linhaNova && !inputs.dosagemManutencao.value) inputs.dosagemManutencao.value = partesManut[2] || '';
            txtUnidadeDosagemManutencao.innerText = partesManut[3] || '';
        } else {
            camposDivs.dosagemManutencao.style.display = "none";
        }
    }

    // --- CONDIÇÃO (antiga "doença") ---
    const selectD = camposDivs.selDoenca;
    const nomeMedicamento = inputNome.value.trim().toLowerCase();
    const paisAtivo = selectPais.value.toLowerCase();
    let baseFiltrada = [...(bancoDados[paisAtivo] || []), ...(bancoDados["oms"] || [])]
        .filter(m => Array.isArray(m.nome)
            ? m.nome.some(n => n.toLowerCase().trim() === nomeMedicamento)
            : String(m.nome).toLowerCase().trim() === nomeMedicamento);

    const condicoesUnicas = [...new Set(baseFiltrada.map(m => m.condicao).filter(c => c && String(c).trim() !== ""))];

    if (condicoesUnicas.length > 0) {
        const assinatura = condicoesUnicas.join("|");
        if (assinatura !== selectD.getAttribute("data-assinatura-condicao")) {
            selectD.innerHTML = "";
            condicoesUnicas.forEach(c => {
                const opt = document.createElement("option");
                opt.value = String(c).trim();
                opt.innerText = String(c).trim();
                selectD.appendChild(opt);
            });
            selectD.setAttribute("data-assinatura-condicao", assinatura);
        }
        selectD.style.display = "block";
    } else {
        selectD.style.display = "none";
        selectD.removeAttribute("data-assinatura-condicao");
        selectD.value = "";
    }

    // --- CONCENTRAÇÃO (inalterado) ---
    const wrapper = document.getElementById('concentracaoWrapper');
    const selectC = camposDivs.selConcentracao;
    const concRaw = String(medAtivo.concentracao || "").trim();
    const temMultiplas = concRaw.includes("|") && concRaw.includes(";");

    if (temMultiplas) {
        const assinaturaAtual = selectC.getAttribute("data-assinatura");
        if (concRaw !== assinaturaAtual) {
            selectC.innerHTML = "";
            concRaw.split(";").forEach(g => {
                const pts = g.split("|");
                if (pts.length === 2) {
                    const opt = document.createElement("option");
                    opt.innerText = pts[0].trim();
                    opt.value = pts[1].trim();
                    selectC.appendChild(opt);
                }
            });
            selectC.setAttribute("data-assinatura", concRaw);
        }
        if (wrapper) wrapper.style.display = "flex";
        selectC.style.display = "block";
    } else {
        if (wrapper) wrapper.style.display = "none";
        selectC.style.display = "none";
        selectC.removeAttribute("data-assinatura");
    }

    // --- INTERVALO (ataque/manutenção) ---
    const intervalo = interpretarDoseOuIntervalo(medAtivo.intervalo);
    if (!medAtivo.intervalo || intervalo.simples === '') {
        camposDivs.intervalo.style.display = "none";
        camposDivs.intervaloManutencaoWrapper.style.display = "none";
    } else if (intervalo.simples !== undefined) {
        const qtd = preencherSelectIntervalo(camposDivs.intervalo, intervalo.simples);
        camposDivs.intervalo.style.display = qtd > 1 ? "block" : "none";
        camposDivs.intervaloManutencaoWrapper.style.display = "none";
    } else {
        const qtdAtaque = preencherSelectIntervalo(camposDivs.intervalo, intervalo.ataque);
        camposDivs.intervalo.style.display = qtdAtaque > 1 ? "block" : "none";
        if (intervalo.temDuasFases) {
            const qtdManut = preencherSelectIntervalo(camposDivs.intervaloManutencao, intervalo.manutencao);
            camposDivs.intervaloManutencaoWrapper.style.display = qtdManut > 1 ? "block" : "none";
        } else {
            camposDivs.intervaloManutencaoWrapper.style.display = "none";
        }
    }

    // --- POPULAÇÃO: reconstruída a partir da base, com a regra "só 2+" ---
    const populacoesUnicas = [...new Set(baseFiltrada
        .filter(m => !condicoesUnicas.length || String(m.condicao || "").trim() === String(medAtivo.condicao || "").trim())
        .map(m => m.populacao).filter(p => p && String(p).trim() !== ""))];

    if (populacoesUnicas.length > 1) {
        const assinaturaPop = populacoesUnicas.join("|");
        if (assinaturaPop !== camposDivs.dose.getAttribute("data-assinatura-populacao")) {
            const rotulos = { pediatrica: "Dose Pediátrica", adulta: "Dose Adulta", gravida: "Grávida" };
            camposDivs.dose.innerHTML = "";
            populacoesUnicas.forEach(p => {
                const opt = document.createElement("option");
                opt.value = String(p).trim().toLowerCase();
                opt.innerText = rotulos[String(p).trim().toLowerCase()] || String(p).trim();
                camposDivs.dose.appendChild(opt);
            });
            camposDivs.dose.setAttribute("data-assinatura-populacao", assinaturaPop);
        }
        camposDivs.dose.style.display = "block";
    } else {
        camposDivs.dose.style.display = "none";
        camposDivs.dose.removeAttribute("data-assinatura-populacao");
        camposDivs.dose.innerHTML = "";
    }

    camposDivs.via.style.display = medAtivo.via ? "block" : "none";
}

function preencherSelectIntervalo(selectEl, textoIntervalo) {
    const novaAssinatura = String(textoIntervalo);
    const valores = novaAssinatura.split(",").map(h => h.trim()).filter(h => h !== "");
    const valoresUnicos = [...new Set(valores)];

    if (novaAssinatura === selectEl.getAttribute("data-intervalo-assinatura") && selectEl.options.length > 0) {
        return valoresUnicos.length;
    }

    selectEl.innerHTML = "";

    valoresUnicos.forEach(h => {
        const opt = document.createElement("option");
        const isDoseUnica = h.includes("*") || h.includes("!") || h.includes("u");
        const horasRaw = h.replace(/[\*\!u#]/g, '');
        const horas = parseInt(horasRaw);

        // #i = 24/horas (vezes/dia), sempre -- inclusive multi-dia
        opt.setAttribute("data-vezes-dia", String(24 / horas));

        if (isDoseUnica) {
            opt.value = 1; opt.innerText = "Dose única"; opt.setAttribute("data-dose-unica", "true");
        } else if (horas > 24) {
            const dias = horas / 24;
            opt.value = horas;
            opt.innerText = dias === 2 ? "1 vez/2 dias" : dias === 7 ? "1 vez/semana" : `1 vez/${formatarNumero(dias)} dias`;
        } else if (horas === 24) {
            opt.value = 1; opt.innerText = "1 vez/dia";
        } else {
            opt.value = 24 / horas; opt.innerText = `${horasRaw}/${horasRaw}h`;
        }
        selectEl.appendChild(opt);
    });
    selectEl.setAttribute("data-intervalo-assinatura", novaAssinatura);
    return valoresUnicos.length;
}

/* ==========================================================================
   11. MODAL DE SEGURANÇA (inalterado)
   ========================================================================== */
function avisar(m) {
    const modal = document.getElementById("meuModal");
    const pModal = document.getElementById("modalMensagem");
    document.body.classList.add("modal-aberto");
    if (modal.style.display === "flex") {
        // Não empilha a mesma mensagem outra vez (ex. idade acima do teto
        // pediátrico enquanto o utilizador continua a digitar)
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

/* ---- FIM DA PARTE 2/3 ---- */


/* ==========================================================================
   12. FRASES DE LIMITE — peso em kg (numérico); idade com o TEXTO
   ORIGINAL da base (nunca convertido para a unidade selecionada).
   ========================================================================== */

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

/* ==========================================================================
   13. CÁLCULO PRINCIPAL
   ========================================================================== */

function calcular() {
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");

    if (!medAtivo) {
        pResultado.innerHTML = `<div class="dosagem-erro"><i class="ri-error-warning-fill"></i><span>Medicamento não encontrado!</span></div>`;
        pResultado.style.background = "none"; pResultado.style.display = "block";
        pResultado.style.width = "90%"; pResultado.style.padding = "0";
        return;
    }

    const idadeTexto = inputs.unidadeIdade.options[inputs.unidadeIdade.selectedIndex].text;
    const fatorConversao = parseFloat(inputs.unidadeIdade.value) || 1;
    const unidadeDosagem = txtUnidadeDosagem.innerText;

    let peso = parseFloat(inputs.peso.value) || 1;
    let idade = parseFloat(inputs.idade.value) || 1;

    // --- PLAUSIBILIDADE ABSOLUTA ---
    if (inputs.peso.value !== "" && (peso > PESO_MAX_PLAUSIVEL || peso < PESO_MIN_PLAUSIVEL)) {
        avisar(`⚠️ Peso implausível.<br>${peso} kg está fora do intervalo humano realista
        (entre ${PESO_MIN_PLAUSIVEL} e ${PESO_MAX_PLAUSIVEL} kg).<br>
        <strong>Verifica se não há um erro de digitação.</strong>`);
        return;
    }
    if (inputs.idade.value !== "") {
        const idadeEmDiasCheck = idade * fatorConversao;
        if (idadeEmDiasCheck > IDADE_MAX_PLAUSIVEL_ANOS * 365 || idadeEmDiasCheck < 0) {
            avisar(`⚠️ Idade implausível.<br>${idade} ${idadeTexto} está fora do intervalo humano
            realista (entre 0 e ${IDADE_MAX_PLAUSIVEL_ANOS} anos).<br>
            <strong>Verifica se não há um erro de digitação.</strong>`);
            return;
        }
    }

    // Teto pediátrico automático (repete aqui para o caso de calcular sem
    // ter mexido na idade depois de escolher a população)
    const populacaoAtual = (camposDivs.dose.value || "").toLowerCase();
    if (populacaoAtual === 'pediatrica') verificarTetoPediatrico();

    // --- VALIDAÇÃO PESO CONTRA A LINHA ---
    if (medAtivo.peso && inputs.peso.value !== "") {
        const faixa = resolverFaixaPeso(medAtivo.peso);
        if (!dentroDaFaixa(peso, faixa)) {
            const novoPeso = peso < faixa.min ? faixa.min : faixa.max;
            avisar(`⚠️ Peso inválido.<br>O peso tem de ser ${fraseLimitePeso(faixa)} kg.<br>
            <strong>Corrigido para: ${formatarNumero(novoPeso)} kg</strong>`);
            peso = novoPeso; inputs.peso.value = peso;
        }
    }

    // --- VALIDAÇÃO IDADE CONTRA A LINHA (unidades da base no aviso) ---
    if (medAtivo.idade && inputs.idade.value !== "") {
        const faixa = resolverFaixaIdade(medAtivo.idade);
        const idadeEmDias = idade * fatorConversao;
        if (!dentroDaFaixa(idadeEmDias, faixa)) {
            const novaIdadeDias = idadeEmDias < faixa.min ? faixa.min : faixa.max;
            const novaIdade = formatarNumero(novaIdadeDias / fatorConversao);
            avisar(`⚠️ Idade inválida.<br>A idade tem de ser ${fraseLimiteIdade(faixa)}.<br>
            <strong>Corrigida para: ${novaIdade} ${idadeTexto}</strong>`);
            idade = parseFloat(novaIdade); inputs.idade.value = idade;
        }
    }

    // --- AVISO DE REFERÊNCIA (não bloqueia): peso alto/baixo para a população ---
    // Vai para as notas do resultado, em destaque -- não é mais um pop-up.
    let notaReferenciaPeso = null;
    if (populacaoAtual && inputs.peso.value !== "") {
        if (populacaoAtual === 'adulta' && peso < REF_PESO_ADULTO_MIN) {
            notaReferenciaPeso = `Peso baixo para dose adulta (referência interna: adulto > ${REF_PESO_ADULTO_MIN} kg). Pode indicar desnutrição — considera avaliação clínica individual.`;
        } else if (populacaoAtual === 'pediatrica' && peso >= REF_PESO_ADULTO_MIN) {
            notaReferenciaPeso = `Peso alto para dose pediátrica (referência interna: pediátrico ≤ ${REF_PESO_ADULTO_MIN} kg). Confirma se a dose adulta não é mais apropriada.`;
        }
    }

    // --- CONCENTRAÇÃO ---
    let concentracao = 1;
    let textoExibido;
    let indiceConcentracao = null; // 1-based; null = só há uma apresentação
    if (camposDivs.selConcentracao.style.display !== "none") {
        textoExibido = camposDivs.selConcentracao.options[camposDivs.selConcentracao.selectedIndex].text;
        concentracao = parseFloat(camposDivs.selConcentracao.value) || 1;
        indiceConcentracao = camposDivs.selConcentracao.selectedIndex + 1;
    } else {
        const concStr = String(medAtivo.concentracao || "").trim();
        if (concStr.includes("|")) {
            const pts = concStr.split("|");
            textoExibido = pts[0].trim();
            concentracao = parseFloat(pts[1]) || 1;
        } else {
            const matchNumero = concStr.match(/(\d+\.?\d*)/);
            textoExibido = concStr;
            concentracao = matchNumero ? parseFloat(matchNumero[0]) : 1;
        }
    }

    // --- SEGURANÇA: DOSE (min/max), na mesma unidade exibida ao utilizador ---
    function validarDose(inputEl, doseString, rotulo) {
        if (!doseString || inputEl.value === "") return;
        const partes = doseString.split(',').map(p => p.trim());
        const minimo = parseFloat(partes[0]);
        const maximo = parseFloat(partes[1]);
        const unidade = partes[3] || '';
        if (isNaN(minimo) || isNaN(maximo)) return;
        const valor = parseFloat(inputEl.value);
        if (valor < minimo || valor > maximo) {
            const novaDose = valor < minimo ? minimo : maximo;
            avisar(`⚠️ Dose${rotulo} inválida.<br>A dose tem de estar entre ${formatarNumero(minimo)} e ${formatarNumero(maximo)} ${unidade}.<br>
            <strong>Corrigida para: ${formatarNumero(novaDose)} ${unidade}</strong>`);
            inputEl.value = novaDose;
        }
    }

    // --- DOSE (ataque/manutenção) → mg ---
    const dose = interpretarDoseOuIntervalo(medAtivo.dose);
    let dAtaqueMg = null, dManutMg = null;
    if (dose.simples !== undefined && dose.simples !== '') {
        validarDose(inputs.dosagem, dose.simples, "");
        const partesDose = dose.simples.split(',').map(p => p.trim());
        const unidade = partesDose[3] || '';
        const fatorUnidade = partesDose[4] || '';
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

    // --- INTERVALO (ataque/manutenção) → vezes/dia ---
    const intervalo = interpretarDoseOuIntervalo(medAtivo.intervalo);
    let iAtaque = null, iManut = null;
    if (camposDivs.intervalo.style.display !== "none") {
        const opt = camposDivs.intervalo.options[camposDivs.intervalo.selectedIndex];
        iAtaque = opt ? parseFloat(opt.getAttribute("data-vezes-dia")) || 1 : 1;
    }
    if (camposDivs.intervaloManutencaoWrapper.style.display !== "none") {
        const opt = camposDivs.intervaloManutencao.options[camposDivs.intervaloManutencao.selectedIndex];
        iManut = opt ? parseFloat(opt.getAttribute("data-vezes-dia")) || 1 : 1;
    } else {
        iManut = iAtaque;
    }

    try {
        let formulaCompleta = medAtivo.formula
            .replace(/#p/g, peso)
            .replace(/#co/g, textoExibido)
            .replace(/#id/g, idade)
            .replace(/#c/g, concentracao);

        if (dAtaqueMg !== null) {
            formulaCompleta = formulaCompleta
                .replace(/#d_ataque/g, dAtaqueMg)
                .replace(/#d_manutencao/g, dManutMg)
                .replace(/#d/g, dAtaqueMg);
        }
        if (iAtaque !== null) {
            formulaCompleta = formulaCompleta
                .replace(/#i_ataque/g, iAtaque)
                .replace(/#i_manutencao/g, iManut)
                .replace(/#i/g, iAtaque);
        }

        const regexCalculo = /{([^}]+)}/g;
        let mlValues = [], match;
        while ((match = regexCalculo.exec(formulaCompleta)) !== null) {
            try { mlValues.push(eval(match[1])); } catch (e) { mlValues.push("Erro"); }
        }

        let resultadoHTML = `
            <div class="dosagem-container"><div class="dosagem-card">
                <div class="card-header">
                    <div class="card-icon"><i class="ri-medicine-bottle-line"></i></div>
                    <div class="card-status"><i class="ri-information-line"></i><span>Resultado</span></div>
                </div>`;

        if (mlValues.length === 1) {
            resultadoHTML += `<div class="dosagem-dose"><div class="dose-valor">
                ${formatarNumero(mlValues[0])} <span class="dose-unidade">mL,</span>
                <span class="dose-unidade-frasco"> frasco: ${textoExibido}</span>
            </div></div>`;
        } else if (mlValues.length >= 2) {
            resultadoHTML += `<div class="dosagem-ataque-manutencao">
                <div class="ataque-item"><i class="ri-flashlight-line"></i><div>
                    <span class="item-label">Dose de ataque</span>
                    <span class="item-valor">${formatarNumero(mlValues[0])} <span class="item-unidade">mL, </span><span class="item-unidade-frasco">frasco: ${textoExibido} </span></span>
                </div></div>
                <div class="manutencao-item"><i class="ri-repeat-line"></i><div>
                    <span class="item-label">Dose de manutenção</span>
                    <span class="item-valor">${formatarNumero(mlValues[1])} <span class="item-unidade">mL, </span><span class="item-unidade-frasco">frasco: ${textoExibido}</span></span>
                </div></div>
            </div>`;
        } else {
            resultadoHTML += `<div class="dosagem-erro-interno"><i class="ri-error-warning-line"></i><span>Nenhuma fórmula de cálculo encontrada</span></div>`;
        }

        // --- INTERVALO E TOTAIS (usa o intervalo de ataque para o texto/totais) ---
        let horas = null, mostrarTotais = false;
        if (camposDivs.intervalo.style.display !== "none" && camposDivs.intervalo.value) {
            const opt = camposDivs.intervalo.options[camposDivs.intervalo.selectedIndex];
            const isDoseUnica = opt && opt.getAttribute("data-dose-unica") === "true";
            const textoIntervalo = opt?.text || "";
            const valorIntervalo = parseFloat(camposDivs.intervalo.value);

            if (isDoseUnica || textoIntervalo === "1 vez/dia") {
                horas = null; mostrarTotais = false;
            } else {
                const horasNum = valorIntervalo;
                if (horasNum > 24) {
                    const dias = horasNum / 24;
                    let txt = dias === 2 ? "1 vez a cada 2 dias" : dias === 7 ? "1 vez por semana" : `1 vez a cada ${formatarNumero(dias)} dias`;
                    resultadoHTML += `<div class="dosagem-intervalo-texto"><i class="ri-time-line"></i><span>${txt}</span></div>`;
                    horas = horasNum; mostrarTotais = false;
                } else if (horasNum !== 24 && horasNum > 0) {
                    const horasDisplay = 24 / horasNum;
                    resultadoHTML += `<div class="dosagem-intervalo-texto"><i class="ri-time-line"></i><span>de ${formatarNumero(horasDisplay)} em ${formatarNumero(horasDisplay)} horas</span></div>`;
                    horas = horasNum; mostrarTotais = (horasNum < 24);
                }
            }
        }

        // --- NOTAS: agora vêm de medAtivo.adicionais, não da fórmula ---
        const notasTexto = String(medAtivo.adicionais || "");
        let notas = [];

        // Filtra trechos [N] pela concentração escolhida -- texto antes do
        // primeiro [N] é sempre geral; se só há uma concentração, ignora
        // os marcadores e mostra tudo.
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
            notas.push(`<span style="color: #ff9800; font-weight: 600; background: rgba(255, 152, 0, 0.15); padding: 4px 6px; border-radius: 12px; display: inline-block;">${notaReferenciaPeso}</span>`);
        }

        if (notasTexto.trim() !== "") {
            let bruto = notasTexto.trim();
            if (!bruto.startsWith('#')) bruto = '#' + bruto;
            if (!bruto.endsWith('#')) bruto += '#';
            const partes = bruto.split('#');
            for (let parte of partes) {
                parte = parte.trim();
                if (!parte) continue;
                const isLixo = parte.includes('{') || parte.includes('}') || parte.match(/^[\d\.\s%]+$/);
                if (isLixo) continue;
                parte = filtrarNotaPorConcentracao(parte, indiceConcentracao);
                if (!parte) continue;
                parte = parte.replace(/@@([^@]+)@/g, (_, c) =>
                    `<span style="color: #ff9800; font-weight: 600; background: rgba(255, 152, 0, 0.15); padding: 4px 6px; border-radius: 12px; display: inline-block;">${c}</span>`
                ).replace(/@/g, '').trim();
                if (parte) notas.push(parte);
            }
        }

        if (notas.length > 0) {
            resultadoHTML += `<div class="dosagem-notas"><div class="notas-titulo"><i class="ri-information-fill"></i><span>Informações Adicionais</span></div>`;
            notas.forEach(n => { resultadoHTML += `<div class="nota-item"><i class="ri-information-line"></i><span>${n}</span></div>`; });
            resultadoHTML += `</div>`;
        }

        // --- TOTAIS ---
        if (mostrarTotais && horas !== null && mlValues.length > 0 && horas < 24) {
            const tomasPorDia = 24 / horas;
            const volumeMl = parseFloat(mlValues[0]);
            const volumePorDia = volumeMl * tomasPorDia;
            resultadoHTML += `<div class="dosagem-totais">
                <div class="total-item"><i class="ri-repeat-line"></i><span>${formatarNumero(tomasPorDia)} toma(s)/dia</span></div>
                <div class="total-item"><i class="ri-drop-line"></i><span>${formatarNumero(volumePorDia)} mL/dia</span></div>`;
            if (concentracao && concentracao > 0) {
                const massaTotal = volumeMl * concentracao * tomasPorDia;
                resultadoHTML += `<div class="total-item"><i class="ri-scales-2-line"></i><span>${formatarNumero(massaTotal)} mg/dia</span></div>`;
            }
            resultadoHTML += `</div>`;
        }

        resultadoHTML += `</div></div>`;
        pResultado.innerHTML = resultadoHTML;
        pResultado.style.color = "var(--text)"; pResultado.style.textAlign = "left";
        pResultado.style.background = "none"; pResultado.style.display = "block";
        pResultado.style.padding = "0"; pResultado.style.width = "100%";

    } catch (e) {
        console.error("❌ Erro no cálculo:", e);
        pResultado.innerHTML = `<div class="dosagem-erro"><i class="ri-error-warning-line"></i><span>Erro na fórmula da base de dados!</span></div>`;
        pResultado.style.background = "none"; pResultado.style.display = "block";
        pResultado.style.width = "100%"; pResultado.style.padding = "0";
    }
}

/* ==========================================================================
   14. GATILHOS
   ========================================================================== */

function calcularSePronto() {
    if (!medAtivo) return;
    const pesoOK = camposDivs.peso.style.display === "none" || inputs.peso.value.trim() !== "";
    const idadeOK = camposDivs.idade.style.display === "none" || inputs.idade.value.trim() !== "";
    const dosagemOK = camposDivs.dosagem.style.display === "none" || inputs.dosagem.value.trim() !== "";
    if (pesoOK && idadeOK && dosagemOK) calcular();
}

function limpar() {
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");
    inputNome.value = "";
    inputs.peso.value = ""; inputs.idade.value = "";
    inputs.dosagem.value = ""; inputs.dosagemManutencao.value = "";
    medAtivo = null;
    exibirCampos();
    pResultado.innerHTML = "";
    pResultado.style.background = "var(--primary)";
}

camposDivs.intervalo.addEventListener('change', () => calcularSePronto());
camposDivs.intervaloManutencao.addEventListener('change', () => calcularSePronto());
camposDivs.selConcentracao.addEventListener('change', () => calcularSePronto());

document.addEventListener('click', (event) => {
    const clicouNoInput = inputNome.contains(event.target);
    const clicouNasSugestoes = divSugestoes.contains(event.target);
    if (!clicouNoInput && !clicouNasSugestoes) divSugestoes.style.display = "none";
});

inputNome.addEventListener("input", () => {
    const valor = inputNome.value.trim();
    if (valor.length > 0) {
        escolherLinha('silencioso');
        if (medAtivo) { divSugestoes.style.display = "none"; exibirCampos(); }
        else { pResultado.style.display = "none"; gerirSugestoes(); exibirCampos(); }
    } else {
        divSugestoes.style.display = "none"; divSugestoes.innerHTML = "";
    }
});

[camposDivs.dose, camposDivs.via, inputs.peso, inputs.dosagem, inputs.dosagemManutencao, inputs.unidadeIdade].forEach(el => {
    if (el) el.addEventListener('input', () => {
        if (inputNome.value.trim() !== "") { escolherLinha('ajuste'); exibirCampos(); }
    });
});

// idade recalcula a linha; o teto pediátrico já é conferido dentro de
// escolherLinha() -- chamar aqui outra vez duplicava o aviso a cada tecla
inputs.idade.addEventListener('input', () => {
    if (inputNome.value.trim() !== "") { escolherLinha('ajuste'); exibirCampos(); }
});

if (camposDivs.selDoenca) {
    camposDivs.selDoenca.addEventListener('change', () => { escolherLinha('ajuste'); exibirCampos(); });
}

/* ==========================================================================
   15. MENU LATERAL (inalterado)
   ========================================================================== */
const btnHamburger = document.getElementById('btnHamburger');
const menuOverlay = document.getElementById('menuOverlay');
const menuLateral = document.getElementById('menuLateral');
const menuItems = document.querySelectorAll('.menu-item');

if (btnHamburger && menuOverlay && menuLateral) {
    function abrirMenu() {
        btnHamburger.classList.add('ativo'); menuOverlay.classList.add('ativo');
        menuLateral.classList.add('ativo'); document.body.style.overflow = 'hidden';
    }
    function fecharMenu() {
        btnHamburger.classList.remove('ativo'); menuOverlay.classList.remove('ativo');
        menuLateral.classList.remove('ativo'); document.body.style.overflow = '';
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
    let touchStartXMenu = 0;
    menuLateral.addEventListener('touchstart', (e) => { touchStartXMenu = e.touches[0].clientX; }, { passive: true });
    menuLateral.addEventListener('touchend', (e) => {
        const diff = touchStartXMenu - e.changedTouches[0].clientX;
        if (diff < -50) fecharMenu();
    });
}

/* ==========================================================================
   16. INICIALIZAÇÃO (inalterado)
   ========================================================================== */
selectPais.addEventListener('change', () => {
    localStorage.setItem('pais', selectPais.value);
    const nomePais = selectPais.options[selectPais.selectedIndex].text;
    inputNome.value = ""; inputs.peso.value = ""; inputs.idade.value = "";
    inputs.dosagem.value = ""; inputs.dosagemManutencao.value = ""; medAtivo = null;
    Object.values(camposDivs).forEach(div => { if (div) div.style.display = "none"; });
    const wrapper = document.getElementById('concentracaoWrapper');
    if (wrapper) wrapper.style.display = "none";
    pResultado.innerHTML = `<div class="feedback-loading"><i class="ri-loader-4-line"></i><span>Carregando padrões da <strong>${nomePais}</strong>...</span></div>`;
    pResultado.style.background = "none"; pResultado.style.width = "90%"; pResultado.style.display = "block";
    setTimeout(() => {
        pResultado.innerHTML = `<div class="feedback-success"><i class="ri-checkbox-circle-line"></i><span>Padrões da <strong>${nomePais}</strong> carregados com sucesso!</span></div>`;
    }, 1200);
});

window.addEventListener('estadoRestaurado', function (e) {
    if (e.detail.pageId === 'dosagem') {
        const nomeMedicamento = document.getElementById('nome').value;
        if (nomeMedicamento && !medAtivo) {
            escolherLinha('silencioso'); exibirCampos();
            setTimeout(function () { if (medAtivo) calcular(); }, 100);
        }
    }
});

window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') { body.setAttribute('data-theme', 'dark'); if (themeIcon) themeIcon.className = 'ri-sun-line'; }
    const paisSalvo = localStorage.getItem('pais');
    if (paisSalvo) selectPais.value = paisSalvo;
    carregarDados();
});

/* ---- FIM DA PARTE 3/3 ---- */