/* ==========================================================================
   1. CONFIGURAÇÕES E TEMA
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

/* ==========================================================================
   2. FUNÇÃO DE FORMATAÇÃO DE NÚMEROS
   ========================================================================== */
function formatarNumero(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return num.toFixed(2);
}

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
    dose: document.getElementById("dose"),
    via: document.getElementById("via"),
    intervalo: document.getElementById("intervalo"),
    selConcentracao: document.getElementById("selConcentracao"),
    selDoenca: document.getElementById("selDoenca")
};

const inputs = {
    peso: document.getElementById("peso"),
    idade: document.getElementById("idade"),
    unidadeIdade: document.getElementById("unidade_de_idade"),
    dosagem: document.getElementById("dosagem")
};

const txtUnidadeDosagem = document.getElementById("unidade_de_dosagem");
const pResultado = document.getElementById("resultado");

/* ==========================================================================
   4. MOTOR DE DADOS
   ========================================================================== */

function extrairRegra(stringCampos, chave) {
    if (!stringCampos || typeof stringCampos !== 'string') return null;
    const regex = new RegExp(`${chave}\\(([^)]+)\\)`, "i");
    const match = stringCampos.match(regex);
    return match ? match[1].split(',').map(item => item.trim()) : null;
}

// Interpreta um lado de um intervalo (ex. "40", ">=40", "<40", "" ).
// Devolve null se vazio (= sem limite nesse lado), ou {valor, inclusivo, operador}.
// Sem operador (número simples) = inclusivo, para manter compatibilidade com
// tudo o que já foi preenchido antes desta funcionalidade existir.
function interpretarLimite(strBruta) {
    const s = (strBruta === undefined || strBruta === null) ? "" : String(strBruta).trim();
    if (s === "") return null;
    let operador = null, inclusivo = true, numStr = s;
    if (s.startsWith(">=")) { operador = ">="; numStr = s.slice(2); inclusivo = true; }
    else if (s.startsWith("<=")) { operador = "<="; numStr = s.slice(2); inclusivo = true; }
    else if (s.startsWith(">")) { operador = ">"; numStr = s.slice(1); inclusivo = false; }
    else if (s.startsWith("<")) { operador = "<"; numStr = s.slice(1); inclusivo = false; }
    const valor = parseFloat(numStr.trim());
    if (isNaN(valor)) return null;
    return { valor, inclusivo, operador };
}

// Resolve o array devolvido por extrairRegra (ex. peso(...)/idade(...)) numa
// faixa { min, max, minInclusive, maxInclusive }. Suporta tanto o formato
// antigo peso(min,max) como o novo com operador isolado peso(<40) / peso(>=40).
function resolverFaixa(r) {
    let min = -Infinity, max = Infinity, minInclusive = true, maxInclusive = true;
    if (!r) return { min, max, minInclusive, maxInclusive };

    if (r.length === 1) {
        const lado = interpretarLimite(r[0]);
        if (lado) {
            if (lado.operador === ">" || lado.operador === ">=") {
                min = lado.valor; minInclusive = lado.inclusivo;
            } else if (lado.operador === "<" || lado.operador === "<=") {
                max = lado.valor; maxInclusive = lado.inclusivo;
            } else {
                // número solto sem vírgula nem operador: trata como valor único
                min = lado.valor; max = lado.valor;
            }
        }
    } else if (r.length >= 2) {
        const ladoMin = interpretarLimite(r[0]);
        const ladoMax = interpretarLimite(r[1]);
        if (ladoMin) { min = ladoMin.valor; minInclusive = ladoMin.inclusivo; }
        if (ladoMax) { max = ladoMax.valor; maxInclusive = ladoMax.inclusivo; }
    }
    return { min, max, minInclusive, maxInclusive };
}

// Testa se um valor cai dentro de uma faixa resolvida por resolverFaixa(),
// respeitando se cada lado é inclusivo ou exclusivo.
function dentroDaFaixa(valor, faixa) {
    const minOK = faixa.minInclusive ? valor >= faixa.min : valor > faixa.min;
    const maxOK = faixa.maxInclusive ? valor <= faixa.max : valor < faixa.max;
    return minOK && maxOK;
}

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
            if (col === "nome" && valor.includes("|")) {
                obj[col] = valor.split("|").map(s => s.trim());
            } else {
                obj[col] = valor;
            }
        });
        return obj;
    });
}

// Substitua a função carregarDados() por:
async function carregarDados() {
    try {
        // Carregar JSON local
        const response = await fetch('medicamentos.json');
        const data = await response.json();
        bancoDados = data;
        console.log("✅ Base de dados pronta.");
    } catch (e) {
        console.error("❌ Erro ao carregar dados:", e);
    }
}


/* ==========================================================================
   5. LÓGICA DE INTERFACE
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
                if (nomeSin.toLowerCase().includes(termo)) {
                    todosNomes.push(nomeSin);
                }
            });
        } else if (m.nome && String(m.nome).toLowerCase().includes(termo)) {
            todosNomes.push(String(m.nome).trim());
        }
    });

    const nomesFiltrados = [...new Set(todosNomes)].sort((a, b) => {
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

function escolherLinha(modo) {
    const nome = inputNome.value.trim().toLowerCase();
    const pais = selectPais.value.toLowerCase();
    if (!nome) { medAtivo = null; return; }

    let basePais = bancoDados[pais] || [];

    const nomeCorresponde = (med, nomeBusca) => {
        if (Array.isArray(med.nome)) {
            return med.nome.some(n => n.toLowerCase().trim() === nomeBusca);
        }
        return med.nome && String(med.nome).toLowerCase().trim() === nomeBusca;
    };

    let filtradas = basePais.filter(m => nomeCorresponde(m, nome));
    if (filtradas.length === 0) {
        filtradas = (bancoDados["oms"] || []).filter(m => nomeCorresponde(m, nome));
    }
    if (filtradas.length === 0) { medAtivo = null; return; }

    const doseSel = (camposDivs.dose.value || "").toLowerCase().trim();
    const viaSel = (camposDivs.via.value || "").toLowerCase().trim();
    const pesoVal = parseFloat(inputs.peso.value) || 0;
    const idadeVal = parseFloat(inputs.idade.value) || 0;
    const fatorIdade = parseFloat(inputs.unidadeIdade.value) || 1;
    const idadeDias = idadeVal * fatorIdade;
    const doencaSel = (camposDivs.selDoenca.value || "").toLowerCase().trim();

    if (doencaSel) {
        let temp = filtradas.filter(m => String(m.doenca || "").toLowerCase().trim() === doencaSel);
        if (temp.length > 0) filtradas = temp;
    }

    if (doseSel) {
        let temp = filtradas.filter(m => String(m.dose || "").toLowerCase().trim() === doseSel);
        if (temp.length > 0) filtradas = temp;
    }

    if (viaSel) {
        let temp = filtradas.filter(m => String(m.via || "").toLowerCase().trim() === viaSel);
        if (temp.length > 0) filtradas = temp;
    }

    if (idadeDias > 0) {
        let temp = filtradas.filter(m => {
            const r = extrairRegra(m.campos, "idade");
            if (!r) return false;
            return dentroDaFaixa(idadeDias, resolverFaixa(r));
        });
        if (temp.length > 0) filtradas = temp;
    }

    if (pesoVal > 0) {
        let temp = filtradas.filter(m => {
            const r = extrairRegra(m.campos, "peso");
            if (!r) return false;
            return dentroDaFaixa(pesoVal, resolverFaixa(r));
        });
        if (temp.length > 0) filtradas = temp;
    }

    medAtivo = filtradas[0];

    if (medAtivo.dose) camposDivs.dose.value = medAtivo.dose.toLowerCase();
    if (medAtivo.via) camposDivs.via.value = medAtivo.via.toLowerCase();
}

function exibirCampos() {
    if (!medAtivo) {
        inputs.peso.value = "";
        inputs.idade.value = "";
        inputs.dosagem.value = "";
        pResultado.style.background = "var(--primary)";
        const wrapper = document.getElementById('concentracaoWrapper');
        if (wrapper) wrapper.style.display = "none";
        Object.values(camposDivs).forEach(div => { if (div) div.style.display = "none"; });
        pResultado.innerHTML = "";
        return;
    }

    const regras = medAtivo.campos || "";

    const p = extrairRegra(regras, "peso");
    camposDivs.peso.style.display = p ? "flex" : "none";
    if (p) {
        // Lado vazio = sem limite nesse sentido (ex. peso(40,) = só mínimo, sem máximo)
        // Operadores <, <=, >, >= também suportados (ex. peso(<40), peso(>=3,<40))
        const faixaP = resolverFaixa(p);
        medAtivo.p_min = faixaP.min;
        medAtivo.p_max = faixaP.max;
        medAtivo.p_minInclusive = faixaP.minInclusive;
        medAtivo.p_maxInclusive = faixaP.maxInclusive;
    }

    const i = extrairRegra(regras, "idade");
    camposDivs.idade.style.display = i ? "flex" : "none";
    if (i) {
        const faixaI = resolverFaixa(i);
        medAtivo.i_min = faixaI.min;
        medAtivo.i_max = faixaI.max;
        medAtivo.i_minInclusive = faixaI.minInclusive;
        medAtivo.i_maxInclusive = faixaI.maxInclusive;
    }

    const d = extrairRegra(regras, "dosagem");
    camposDivs.dosagem.style.display = d ? "flex" : "none";
    if (d) {
        medAtivo.d_min = parseFloat(d[0]);
        medAtivo.d_max = parseFloat(d[1]);
        if (!inputs.dosagem.value) inputs.dosagem.value = d[2];
        txtUnidadeDosagem.innerText = d[3];
    }

    // --- LÓGICA DE DOENÇA ---
    const selectD = camposDivs.selDoenca;
    const nomeMedicamento = inputNome.value.trim().toLowerCase();
    const paisAtivo = selectPais.value.toLowerCase();

    let baseFiltrada = [...(bancoDados[paisAtivo] || []), ...(bancoDados["oms"] || [])]
        .filter(m => {
            if (Array.isArray(m.nome)) {
                return m.nome.some(n => n.toLowerCase().trim() === nomeMedicamento);
            }
            return String(m.nome).toLowerCase().trim() === nomeMedicamento;
        });

    const doencasUnicas = [...new Set(baseFiltrada.map(m => m.doenca).filter(d => d && String(d).trim() !== ""))];

    if (doencasUnicas.length > 0) {
        const assinaturaDoenca = doencasUnicas.join("|");
        const assinaturaAtualD = selectD.getAttribute("data-assinatura-doenca");

        if (assinaturaDoenca !== assinaturaAtualD) {
            selectD.innerHTML = "";
            doencasUnicas.forEach(d => {
                const opt = document.createElement("option");
                opt.value = String(d).trim();
                opt.innerText = String(d).trim();
                selectD.appendChild(opt);
            });
            selectD.setAttribute("data-assinatura-doenca", assinaturaDoenca);
        }
        selectD.style.display = "block";
    } else {
        selectD.style.display = "none";
        selectD.removeAttribute("data-assinatura-doenca");
        selectD.value = "";
    }

    // --- LÓGICA DE CONCENTRAÇÃO ---
    const wrapper = document.getElementById('concentracaoWrapper');
    const selectC = camposDivs.selConcentracao;
    const concRaw = String(medAtivo.concentracao || "").trim();
    const gruposConcentracao = concRaw.split(";").map(g => g.trim()).filter(g => g !== "");
    const temMultiplasConcentracoes = gruposConcentracao.length > 1;

    if (temMultiplasConcentracoes) {
        const assinaturaNova = concRaw;
        const assinaturaAtual = selectC.getAttribute("data-assinatura");

        if (assinaturaNova !== assinaturaAtual) {
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
            selectC.setAttribute("data-assinatura", assinaturaNova);
        }

        if (wrapper) wrapper.style.display = "flex";
        selectC.style.display = "block";
    } else {
        if (wrapper) wrapper.style.display = "none";
        selectC.style.display = "none";
        selectC.removeAttribute("data-assinatura");
    }

    // --- INTERVALO ---
    if (medAtivo.intervalo) {
        const novaAssinatura = String(medAtivo.intervalo);
        const assinaturaAtual = camposDivs.intervalo.getAttribute("data-intervalo-assinatura");

        if (novaAssinatura !== assinaturaAtual || camposDivs.intervalo.options.length === 0) {
            camposDivs.intervalo.innerHTML = "";

            const valores = String(medAtivo.intervalo).split(",").map(h => h.trim());
            const valoresUnicos = [];
            const visto = new Set();

            for (const h of valores) {
                if (!visto.has(h)) {
                    visto.add(h);
                    valoresUnicos.push(h);
                }
            }

            valoresUnicos.forEach(h => {
                const opt = document.createElement("option");

                const isDoseUnica = h.includes("*") || h.includes("!") || h.includes("u");
                const horasRaw = h.replace(/[\*\!u#]/g, '');
                const horas = parseInt(horasRaw);

                if (isDoseUnica) {
                    opt.value = 1;
                    opt.innerText = "Dose única";
                    opt.setAttribute("data-dose-unica", "true");
                }
                else if (horas > 24) {
                    const dias = horas / 24;
                    opt.value = horas;
                    if (dias === 2) {
                        opt.innerText = "1 vez/2 dias";
                    } else if (dias === 3) {
                        opt.innerText = "1 vez/3 dias";
                    } else if (dias === 7) {
                        opt.innerText = "1 vez/semana";
                    } else if (dias === 14) {
                        opt.innerText = "1 vez/2 semanas";
                    } else if (dias === 28) {
                        opt.innerText = "1 vez/mês";
                    } else {
                        opt.innerText = `1 vez/${formatarNumero(dias)} dias`;
                    }
                }
                else if (horas === 24) {
                    opt.value = 1;
                    opt.innerText = "1 vez/dia";
                }
                else {
                    opt.value = 24 / horas;
                    opt.innerText = `${horasRaw}/${horasRaw}h`;
                }

                camposDivs.intervalo.appendChild(opt);
            });

            camposDivs.intervalo.setAttribute("data-intervalo-assinatura", novaAssinatura);

            camposDivs.intervalo.style.display = valoresUnicos.length > 1 ? "block" : "none";
        } else {
            // já construído antes (assinatura igual); só reaplica a visibilidade
            camposDivs.intervalo.style.display = camposDivs.intervalo.options.length > 1 ? "block" : "none";
        }

    } else {
        camposDivs.intervalo.style.display = "none";
    }

    camposDivs.dose.style.display = medAtivo.dose ? "block" : "none";
    camposDivs.via.style.display = medAtivo.via ? "block" : "none";
}

/* ==========================================================================
   6. MODAL DE SEGURANÇA
   ========================================================================== */
function avisar(m) {
    const modal = document.getElementById("meuModal");
    const pModal = document.getElementById("modalMensagem");

    document.body.classList.add("modal-aberto");

    if (modal.style.display === "flex") {
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

/* ==========================================================================
   7. CÁLCULO PRINCIPAL
   ========================================================================== */

function calcular() {
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");

    if (!medAtivo) {
        pResultado.innerHTML = `
            <div class="dosagem-erro">
                <i class="ri-error-warning-fill"></i>
                <span>Medicamento não encontrado!</span>
            </div>
        `;
        pResultado.style.background = "none";
        pResultado.style.display = "block";
        pResultado.style.width = "90%";
        pResultado.style.padding = "0";
        return;
    }

    const idadeTexto = inputs.unidadeIdade.options[inputs.unidadeIdade.selectedIndex].text;
    const fatorConversao = parseFloat(inputs.unidadeIdade.value) || 1;
    const unidadeDosagem = txtUnidadeDosagem.innerText;

    let peso = parseFloat(inputs.peso.value) || 1;
    let idade = parseFloat(inputs.idade.value) || 1;
    let dosagem = parseFloat(inputs.dosagem.value) || 1;
    let intervalo = parseFloat(camposDivs.intervalo.value) || 1;

    // --- SEGURANÇA: PLAUSIBILIDADE FISIOLÓGICA ABSOLUTA ---
    // Independente da faixa peso()/idade() do medicamento (que pode estar
    // aberta, ex. peso(40,)), nenhum peso/idade humano real ultrapassa isto.
    // Protege contra erro de digitação (ex. 400 em vez de 40), não contra
    // a faixa clínica do fármaco em si — essa validação continua abaixo.
    const PESO_MAX_PLAUSIVEL = 300; // kg
    const PESO_MIN_PLAUSIVEL = 0.3; // kg (recém-nascido extremamente prematuro)

    if (inputs.peso.value !== "" && (peso > PESO_MAX_PLAUSIVEL || peso < PESO_MIN_PLAUSIVEL)) {
        avisar(`⚠️ Peso implausível.<br>
        ${peso} kg está fora do intervalo humano realista (${PESO_MIN_PLAUSIVEL} - ${PESO_MAX_PLAUSIVEL} kg).<br>
        <strong>Verifica se não há um erro de digitação.</strong>`);
        return;
    }

    const IDADE_MAX_PLAUSIVEL_DIAS = 43800; // ~120 anos
    const IDADE_MIN_PLAUSIVEL_DIAS = 0;

    if (inputs.idade.value !== "") {
        const idadeEmDiasPlausibilidade = idade * fatorConversao;
        if (idadeEmDiasPlausibilidade > IDADE_MAX_PLAUSIVEL_DIAS || idadeEmDiasPlausibilidade < IDADE_MIN_PLAUSIVEL_DIAS) {
            avisar(`⚠️ Idade implausível.<br>
            ${idade} ${idadeTexto} está fora do intervalo humano realista (0 - 120 anos).<br>
            <strong>Verifica se não há um erro de digitação.</strong>`);
            return;
        }
    }
    
    // 🔥 VALIDAÇÃO DA CONCENTRAÇÃO - extrai apenas o número
    let concentracao = 1;
    let textoExibido;
    // Índice (1-based) da concentração escolhida, para filtrar notas com [N];
    // fica null quando só há uma apresentação (select escondido) — nesse caso
    // qualquer [N] na nota é ignorado e o texto aparece sempre inteiro.
    let indiceConcentracaoSelecionada = null;

    if (camposDivs.selConcentracao.style.display !== "none") {
        // Múltiplas apresentações: usa a opção selecionada no select
        textoExibido = camposDivs.selConcentracao.options[camposDivs.selConcentracao.selectedIndex].text;
        concentracao = parseFloat(camposDivs.selConcentracao.value) || 1;
        indiceConcentracaoSelecionada = camposDivs.selConcentracao.selectedIndex + 1;
    } else {
        // Uma única apresentação: separa "texto|valor" manualmente,
        // o fator é sempre o número depois do '|', nunca o primeiro número da string
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

    // --- SEGURANÇA: PESO ---
    if (medAtivo.p_min !== undefined && inputs.peso.value !== "") {
        const foraDoMin = medAtivo.p_minInclusive ? peso < medAtivo.p_min : peso <= medAtivo.p_min;
        const foraDoMax = medAtivo.p_maxInclusive ? peso > medAtivo.p_max : peso >= medAtivo.p_max;
        if (foraDoMin || foraDoMax) {
            const EPS_PESO = 0.1; // menor passo prático para "abrir espaço" num limite exclusivo
            let novoPeso;
            if (foraDoMin) {
                novoPeso = medAtivo.p_minInclusive ? medAtivo.p_min : medAtivo.p_min + EPS_PESO;
            } else {
                novoPeso = medAtivo.p_maxInclusive ? medAtivo.p_max : medAtivo.p_max - EPS_PESO;
            }
            novoPeso = parseFloat(novoPeso.toFixed(1));

            const minTexto = isFinite(medAtivo.p_min) ? `${medAtivo.p_minInclusive ? '>=' : '>'} ${medAtivo.p_min}` : "sem mínimo";
            const maxTexto = isFinite(medAtivo.p_max) ? `${medAtivo.p_maxInclusive ? '<=' : '<'} ${medAtivo.p_max}` : "sem máximo";
            avisar(`⚠️ Peso inválido.<br>
            Deve ser ${minTexto} e ${maxTexto} kg.<br>
            <strong>Corrigido para: ${novoPeso} kg</strong>`);
            peso = novoPeso;
            inputs.peso.value = peso;
        }
    }

    
    
    // --- SEGURANÇA: IDADE ---
    if (medAtivo.i_min !== undefined && inputs.idade.value !== "") {
        const idadeEmDias = idade * fatorConversao;
        const foraDoMinI = medAtivo.i_minInclusive ? idadeEmDias < medAtivo.i_min : idadeEmDias <= medAtivo.i_min;
        const foraDoMaxI = medAtivo.i_maxInclusive ? idadeEmDias > medAtivo.i_max : idadeEmDias >= medAtivo.i_max;
        if (foraDoMinI || foraDoMaxI) {
            const EPS_DIAS = 1; // menor unidade prática (1 dia)
            let novaIdadeDias;
            if (foraDoMinI) {
                novaIdadeDias = medAtivo.i_minInclusive ? medAtivo.i_min : medAtivo.i_min + EPS_DIAS;
            } else {
                novaIdadeDias = medAtivo.i_maxInclusive ? medAtivo.i_max : medAtivo.i_max - EPS_DIAS;
            }
            let novaIdade = parseFloat((novaIdadeDias / fatorConversao).toFixed(1));

            const minDisplay = isFinite(medAtivo.i_min) ? `${medAtivo.i_minInclusive ? '>=' : '>'} ${(medAtivo.i_min / fatorConversao).toFixed(1)}` : "sem mínimo";
            const maxDisplay = isFinite(medAtivo.i_max) ? `${medAtivo.i_maxInclusive ? '<=' : '<'} ${(medAtivo.i_max / fatorConversao).toFixed(1)}` : "sem máximo";

            avisar(`⚠️ Idade inválida.<br>
            Deve ser ${minDisplay} e ${maxDisplay} ${idadeTexto}.<br>
            <strong>Corrigida para: ${novaIdade} ${idadeTexto}</strong>`);

            idade = novaIdade;
            inputs.idade.value = idade;
        }
    }

    // --- ALERTA DE REFERÊNCIA: peso atípico para a dose pediátrica/adulta ---
    // Isto NUNCA bloqueia nem corrige o cálculo (ao contrário das validações
    // acima) — é só um aviso, porque um adulto desnutrido pode pesar menos
    // que a referência, e não faz sentido impedir o cálculo nesse caso.
    // Referência interna (não da fonte do medicamento): pediátrico até 49kg,
    // adulto a partir de 49kg.
    let notasSistema = [];
    const REF_PESO_ADULTO_MIN = 49; // kg — referência interna do sistema
    if (medAtivo.dose && inputs.peso.value !== "") {
        const doseAtualRef = String(medAtivo.dose).toLowerCase();
        const destaqueLaranja = (texto) =>
            `<span style="color: #ff9800; font-weight: 600; background: rgba(255, 152, 0, 0.15); padding: 4px 6px; border-radius: 12px; display: inline-block;">${texto}</span>`;

        if (doseAtualRef === "adulta" && peso < REF_PESO_ADULTO_MIN) {
            notasSistema.push(destaqueLaranja(
                `Peso baixo para dose adulta (referência interna: adulto > ${REF_PESO_ADULTO_MIN} kg). Pode indicar desnutrição ou baixo peso — considera avaliação clínica individual antes de administrar.`
            ));
        } else if (doseAtualRef === "pediatrica" && peso >= REF_PESO_ADULTO_MIN) {
            notasSistema.push(destaqueLaranja(
                `Peso alto para dose pediátrica (referência interna: pediátrico ≤ ${REF_PESO_ADULTO_MIN} kg). Confirma se a dose adulta não é mais apropriada.`
            ));
        }
    }

    // --- SEGURANÇA: DOSAGEM ---
    if (medAtivo.d_min !== undefined && inputs.dosagem.value !== "") {
        if (dosagem < medAtivo.d_min || dosagem > medAtivo.d_max) {
            const novaDosagem = (dosagem < medAtivo.d_min) ? medAtivo.d_min : medAtivo.d_max;
            avisar(`⚠️ Dose inválida.<br>
            Deve estar entre ${medAtivo.d_min} - ${medAtivo.d_max} ${unidadeDosagem}.<br>
            <strong>Corrigida para: ${novaDosagem} ${unidadeDosagem}</strong>`);
            dosagem = novaDosagem;
            inputs.dosagem.value = dosagem;
        }
    }

    try {
        // 🔥 Substituir placeholders (incluindo #co)
        let formulaCompleta = medAtivo.formula
            .replace(/#p/g, peso)
            .replace(/#co/g, textoExibido)
            .replace(/#id/g, idade)
            .replace(/#d/g, dosagem)
            .replace(/#c/g, concentracao)
            .replace(/#i/g, intervalo);

        // 🔥 Extrair valores de ml (sem toFixed - será aplicado depois)
        const regexCalculo = /{([^}]+)}/g;
        let mlValues = [];
        let match;

        while ((match = regexCalculo.exec(formulaCompleta)) !== null) {
            try {
                const valor = eval(match[1]);
                mlValues.push(valor);
            } catch (e) {
                mlValues.push("Erro");
            }
        }

        // --- CONSTRUIR RESULTADO ---
        let resultadoHTML = `
            <div class="dosagem-container">
                <div class="dosagem-card">
                    <div class="card-header">
                        <div class="card-icon">
                            <i class="ri-medicine-bottle-line"></i>
                        </div>
                        <div class="card-status">
                            <i class="ri-information-line"></i>
                            <span>Resultado</span>
                        </div>
                    </div>
        `;

        // Área da dose principal
        if (mlValues.length === 1) {
            resultadoHTML += `
                    <div class="dosagem-dose">
                        <div class="dose-valor">
                            ${formatarNumero(mlValues[0])} <span class="dose-unidade">mL,</span> <span class="dose-unidade-frasco"> frasco: ${textoExibido}</span>
                        </div>
                    </div>
            `;
        }
        else if (mlValues.length >= 2) {
            resultadoHTML += `
                    <div class="dosagem-ataque-manutencao">
                        <div class="ataque-item">
                            <i class="ri-flashlight-line"></i>
                            <div>
                                <span class="item-label">Dose de ataque</span>
                                <span class="item-valor">${formatarNumero(mlValues[0])} <span class="item-unidade">mL, </span> <span class="item-unidade-frasco">frasco: ${textoExibido} </span> </span>
                            </div>
                        </div>
                        <div class="manutencao-item">
                            <i class="ri-repeat-line"></i>
                            <div>
                                <span class="item-label">Dose de manutenção</span>
                                <span class="item-valor">${formatarNumero(mlValues[1])} <span class="item-unidade">mL, </span> <span class="item-unidade-frasco">frasco: ${textoExibido}</span></span>
                            </div>
                        </div>
                    </div>
            `;
        }
        else {
            resultadoHTML += `
                    <div class="dosagem-erro-interno">
                        <i class="ri-error-warning-line"></i>
                        <span>Nenhuma fórmula de cálculo encontrada</span>
                    </div>
            `;
        }

        // --- INTERVALO E TOTAIS ---
        let horas = null;
        let mostrarTotais = false;

        if (camposDivs.intervalo.value) {
            const selectElement = camposDivs.intervalo;
            const opcaoSelecionada = selectElement.options[selectElement.selectedIndex];
            const isDoseUnica = opcaoSelecionada && opcaoSelecionada.getAttribute("data-dose-unica") === "true";
            const textoIntervalo = opcaoSelecionada?.text || "";
            const valorIntervalo = parseFloat(selectElement.value);

            if (isDoseUnica) {
                horas = null;
                mostrarTotais = false;
            }
            else if (textoIntervalo === "1 vez/dia") {
                horas = null;
                mostrarTotais = false;
            }
            else {
                const horasNum = valorIntervalo;

                if (horasNum > 24) {
                    const dias = horasNum / 24;
                    let textoIntervaloAmigavel = "";
                    if (dias === 2) textoIntervaloAmigavel = "1 vez a cada 2 dias";
                    else if (dias === 3) textoIntervaloAmigavel = "1 vez a cada 3 dias";
                    else if (dias === 7) textoIntervaloAmigavel = "1 vez por semana";
                    else if (dias === 14) textoIntervaloAmigavel = "1 vez a cada 2 semanas";
                    else if (dias === 28) textoIntervaloAmigavel = "1 vez por mês";
                    else textoIntervaloAmigavel = `1 vez a cada ${formatarNumero(dias)} dias`;

                    resultadoHTML += `
                        <div class="dosagem-intervalo-texto">
                            <i class="ri-time-line"></i>
                            <span>${textoIntervaloAmigavel}</span>
                        </div>
                    `;
                    horas = horasNum;
                    mostrarTotais = false;
                } else if (horasNum !== 24 && horasNum > 0) {
                    // 🔥 Mostra "de X em X horas" (ex: de 8 em 8 horas)
                    const horasDisplay = 24 / horasNum;
                    resultadoHTML += `
                        <div class="dosagem-intervalo-texto">
                            <i class="ri-time-line"></i>
                            <span>de ${formatarNumero(horasDisplay)} em ${formatarNumero(horasDisplay)} horas</span>
                        </div>
                    `;
                    horas = horasNum;
                    // 🔥 Só mostra totais se horas < 24 (ou seja, horasNum < 24)
                    mostrarTotais = (horasNum < 24);
                }
            }
        }

        // --- EXTRAIR NOTAS ---
        const formulaOriginal = medAtivo.formula;
        const ultimoFechaChaves = formulaOriginal.lastIndexOf('}');

        if (ultimoFechaChaves !== -1) {
            let depoisDaFormula = formulaOriginal.substring(ultimoFechaChaves + 1);
            const primeiroHash = depoisDaFormula.indexOf('#');
            if (primeiroHash !== -1) {
                depoisDaFormula = depoisDaFormula.substring(primeiroHash);
            }
            if (!depoisDaFormula.endsWith('#')) {
                depoisDaFormula = depoisDaFormula + '#';
            }
        // Filtra trechos marcados com [N] dentro da nota: texto antes do
        // primeiro [N] é sempre geral; cada [N] seguinte só aparece quando
        // N corresponde à concentração escolhida (1ª, 2ª, 3ª opção do select).
        function filtrarNotaPorConcentracao(texto, indiceSelecionado) {
            if (!/\[\d+\]/.test(texto)) return texto; // sem marcadores: nota geral, mostra tudo

            if (indiceSelecionado === null) {
                // só há uma concentração (select escondido): [N] não faz sentido, remove os marcadores e mostra tudo
                return texto.replace(/\[\d+\]\s*/g, '').trim();
            }

            const partes = texto.split(/(\[\d+\])/);
            let indiceAtual = null; // null = texto geral, antes do primeiro marcador
            let resultado = "";

            for (const parte of partes) {
                const m = parte.match(/^\[(\d+)\]$/);
                if (m) {
                    indiceAtual = parseInt(m[1], 10);
                    continue;
                }
                if (indiceAtual === null || indiceAtual === indiceSelecionado) {
                    resultado += parte;
                }
            }
            return resultado.replace(/\s+/g, ' ').trim();
        }

            const partes = depoisDaFormula.split('#');
            let notas = [...notasSistema];

            for (let i = 0; i < partes.length; i++) {
                let notaRaw = partes[i].trim();
                if (!notaRaw || notaRaw.length === 0) continue;
                const isLixo = notaRaw.includes('{') || notaRaw.includes('}') ||
                               notaRaw.includes('/') || notaRaw.includes('*') ||
                               notaRaw.match(/^[\d\.\s%]+$/);
                if (isLixo) continue;

                notaRaw = filtrarNotaPorConcentracao(notaRaw, indiceConcentracaoSelecionada);
                if (!notaRaw) continue;

                let notaProcessada = notaRaw;
                const regexDestaque = /@@([^@]+)@/g;
                notaProcessada = notaProcessada.replace(regexDestaque, (match, conteudo) => {
                    return `<span style="color: #ff9800; font-weight: 600; background: rgba(255, 152, 0, 0.15); padding: 4px 6px; border-radius: 12px; display: inline-block;">${conteudo}</span>`;
                });
                notaProcessada = notaProcessada.replace(/@/g, '');
                notaProcessada = notaProcessada.trim();
                if (notaProcessada.length > 0) {
                    notas.push(notaProcessada);
                }
            }

            if (notas.length > 0) {
                resultadoHTML += `
                    <div class="dosagem-notas">
                        <div class="notas-titulo">
                            <i class="ri-information-fill"></i>
                            <span>Informações Adicionais</span>
                        </div>
                `;
                notas.forEach(nota => {
                    resultadoHTML += `
                        <div class="nota-item">
                            <i class="ri-information-line"></i>
                            <span>${nota}</span>
                        </div>
                    `;
                });
                resultadoHTML += `</div>`;
            }
        }

        // --- TOTAIS (SÓ SE horas < 24) ---
        if (mostrarTotais && horas !== null && mlValues.length > 0 && horas < 24) {
            // 🔥 CORREÇÃO: tomasPorDia = 24 / horas (horas é o valor do intervalo em horas)
            const tomasPorDia = 24 / horas;
            const volumeMl = parseFloat(mlValues[0]);
            const volumePorDia = volumeMl * tomasPorDia;

            resultadoHTML += `<div class="dosagem-totais">`;
            resultadoHTML += `
                <div class="total-item">
                    <i class="ri-repeat-line"></i>
                    <span>${formatarNumero(tomasPorDia)} toma(s)/dia</span>
                </div>
                <div class="total-item">
                    <i class="ri-drop-line"></i>
                    <span>${formatarNumero(volumePorDia)} mL/dia</span>
                </div> 
            `;
            if (concentracao && concentracao > 0) {
                const massaMl = volumeMl * concentracao;
                const massaTotal = massaMl * tomasPorDia;
                resultadoHTML += `
                    <div class="total-item">
                        <i class="ri-scales-2-line"></i>
                        <span>${formatarNumero(massaTotal)} mg/dia</span>
                    </div>
                `;
            }
            resultadoHTML += `</div>`;
        }

        resultadoHTML += `
                </div>
            </div>
        `;

        pResultado.innerHTML = resultadoHTML;
        pResultado.style.color = "var(--text)";
        pResultado.style.textAlign = "left";
        pResultado.style.background = "none";
        pResultado.style.display = "block";
        pResultado.style.padding = "0";
        pResultado.style.width = "100%";

    } catch (e) {
        console.error("❌ Erro no cálculo:", e);
        pResultado.innerHTML = `
            <div class="dosagem-erro">
                <i class="ri-error-warning-line"></i>
                <span>Erro na fórmula da base de dados!</span>
            </div>
        `;
        pResultado.style.background = "none";
        pResultado.style.display = "block";
        pResultado.style.width = "100%";
        pResultado.style.padding = "0";
    }
}

/* ==========================================================================
   8. GATILHOS
   ========================================================================== */

function calcularSePronto() {
    if (!medAtivo) return;
    const pesoOK = camposDivs.peso.style.display === "none" || inputs.peso.value.trim() !== "";
    const idadeOK = camposDivs.idade.style.display === "none" || inputs.idade.value.trim() !== "";
    const dosagemOK = camposDivs.dosagem.style.display === "none" || inputs.dosagem.value.trim() !== "";
    if (pesoOK && idadeOK && dosagemOK) {
        calcular();
    }
}

function limpar() {
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");
    inputNome.value = "";
    inputs.peso.value = "";
    inputs.idade.value = "";
    inputs.dosagem.value = "";
    medAtivo = null;
    exibirCampos();
    pResultado.innerHTML = "";
    pResultado.style.background = "var(--primary)";
    
}

camposDivs.intervalo.addEventListener('change', () => {
    calcularSePronto();
});

camposDivs.selConcentracao.addEventListener('change', () => {
    calcularSePronto();
});

document.addEventListener('click', (event) => {
    const clicouNoInput = inputNome.contains(event.target);
    const clicouNasSugestoes = divSugestoes.contains(event.target);
    if (!clicouNoInput && !clicouNasSugestoes) {
        divSugestoes.style.display = "none";
    }
});

inputNome.addEventListener("input", () => {
    const valor = inputNome.value.trim();
    if (valor.length > 0) {
        escolherLinha('silencioso');
        if (medAtivo) {
            divSugestoes.style.display = "none";
            exibirCampos();
        } else {
            pResultado.style.display = "none";
            gerirSugestoes();
            exibirCampos();
        }
    } else {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
    }
});

// via, dose e doença mudam a *linha* de medicamento usada (o regime em si),
// por isso a dosagem deve voltar ao padrão da nova combinação
function aoMudarRegime() {
    if (inputNome.value.trim() !== "") {
        inputs.dosagem.value = "";
        escolherLinha('ajuste');
        exibirCampos();
    }
}

[camposDivs.dose, camposDivs.via].forEach(el => {
    if (el) el.addEventListener('input', aoMudarRegime);
});

if (camposDivs.selDoenca) {
    camposDivs.selDoenca.addEventListener('change', aoMudarRegime);
}

// peso, idade e unidade de idade são características do paciente, não do regime:
// só reavaliam/validam a linha atual, sem apagar uma dosagem já ajustada manualmente
[inputs.peso, inputs.idade, inputs.unidadeIdade].forEach(el => {
    if (el) {
        el.addEventListener('input', () => {
            if (inputNome.value.trim() !== "") {
                escolherLinha('ajuste');
                exibirCampos();
            }
        });
    }
});

/* ==========================================================================
   9. MENU LATERAL
   ========================================================================== */
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

/* ==========================================================================
   10. INICIALIZAÇÃO
   ========================================================================== */

selectPais.addEventListener('change', () => {
    localStorage.setItem('pais', selectPais.value);
    const nomePais = selectPais.options[selectPais.selectedIndex].text;

    inputNome.value = "";
    inputs.peso.value = "";
    inputs.idade.value = "";
    inputs.dosagem.value = "";
    medAtivo = null;

    Object.values(camposDivs).forEach(div => { if (div) div.style.display = "none"; });
    const wrapper = document.getElementById('concentracaoWrapper');
    if (wrapper) wrapper.style.display = "none";

    pResultado.innerHTML = `
        <div class="feedback-loading">
            <i class="ri-loader-4-line"></i>
            <span>Carregando padrões da <strong>${nomePais}</strong>...</span>
        </div>
    `;
    pResultado.style.background = "none";
    pResultado.style.width = "90%";
    pResultado.style.display = "block";

    setTimeout(() => {
        pResultado.innerHTML = `
            <div class="feedback-success">
                <i class="ri-checkbox-circle-line"></i>
                <span>Padrões da <strong>${nomePais}</strong> carregados com sucesso!</span>
            </div>
        `;
    }, 1200);
});

window.addEventListener('estadoRestaurado', function (e) {
    if (e.detail.pageId === 'dosagem') {
        const nomeMedicamento = document.getElementById('nome').value;
        if (nomeMedicamento && !medAtivo) {
            console.log('🔄 Recriando medicamento a partir do nome:', nomeMedicamento);
            escolherLinha('silencioso');
            exibirCampos();
            setTimeout(function () {
                if (medAtivo) calcular();
            }, 100);
        }
    }
});

window.addEventListener('load', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
    }
    const paisSalvo = localStorage.getItem('pais');
    if (paisSalvo) {
        selectPais.value = paisSalvo;
    }
    carregarDados();
});
    
    
    
    
    