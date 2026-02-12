/* ==========================================================================
   1. CONFIGURAÇÕES E TEMA
   ========================================================================== */
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
   2. MOTOR DE DADOS E LIMPEZA
   ========================================================================== */

function extrairRegra(stringCampos, chave) {
    if (!stringCampos || typeof stringCampos !== 'string') return null;
    const regex = new RegExp(`${chave}\\(([^)]+)\\)`, "i");
    const match = stringCampos.match(regex);
    return match ? match[1].split(',').map(item => item.trim()) : null;
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
        cabecalho.forEach((col, i) => { obj[col] = linha[i] !== undefined ? linha[i] : ""; });
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
        console.log("Base de dados pronta.");
    } catch (e) { console.error("Erro ao carregar Excel:", e); }
}


/* ==========================================================================
   3. LÓGICA DE INTERFACE (A TUA ESSÊNCIA)
   ========================================================================== */
function gerirSugestoes() {
    const termoOriginal = inputNome.value;
    const termo = termoOriginal.trim().toLowerCase();
    const paisAtivo = selectPais.value.toLowerCase();

    // BLOQUEIO ABSOLUTO: Se não houver texto ou se forem apenas espaços
    if (!termo || termo.length === 0) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    let baseTotal = [...(bancoDados[paisAtivo] || []), ...(bancoDados["oms"] || [])];

    // Filtro com Prioridade de Início (Relevância)
    const nomesFiltrados = [...new Set(
        baseTotal
            .filter(m => m.nome && String(m.nome).toLowerCase().includes(termo))
            .map(m => String(m.nome).trim())
    )].sort((a, b) => {
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

    // 1. Pega todas as linhas do medicamento
    let basePais = bancoDados[pais] || [];
    let filtradas = basePais.filter(m => m.nome && String(m.nome).toLowerCase().trim() === nome);
    if (filtradas.length === 0) {
        filtradas = (bancoDados["oms"] || []).filter(m => m.nome && String(m.nome).toLowerCase().trim() === nome);
    }
    if (filtradas.length === 0) { medAtivo = null; return; }

    // 2. FUNIL DE FILTRAGEM
    const doseSel = (camposDivs.dose.value || "").toLowerCase().trim();
    const viaSel = (camposDivs.via.value || "").toLowerCase().trim();
    const pesoVal = parseFloat(inputs.peso.value) || 0;
    const idadeVal = parseFloat(inputs.idade.value) || 0;
    const fatorIdade = parseFloat(inputs.unidadeIdade.value) || 1;
    const idadeDias = idadeVal * fatorIdade;
    const doencaSel = (camposDivs.selDoenca.value || "").toLowerCase().trim();
    
    
    // A) Filtrar por DOENÇA (Deve ser o primeiro filtro do funil)
if (doencaSel) {
    let temp = filtradas.filter(m => String(m.doenca || "").toLowerCase().trim() === doencaSel);
    if (temp.length > 0) filtradas = temp;
}

    // B) Filtrar por DOSE (Se o usuário selecionou e a linha tem dose definida)
    if (doseSel) {
        let temp = filtradas.filter(m => String(m.dose || "").toLowerCase().trim() === doseSel);
        if (temp.length > 0) filtradas = temp;
    }

    // C) Filtrar por VIA (Dentro das que sobraram da dose)
    if (viaSel) {
        let temp = filtradas.filter(m => String(m.via || "").toLowerCase().trim() === viaSel);
        if (temp.length > 0) filtradas = temp;
    }

    // D) Filtrar por IDADE (O critério final de desempate)
    if (idadeDias > 0) {
        let temp = filtradas.filter(m => {
            const r = extrairRegra(m.campos, "idade");
            return r && idadeDias >= parseFloat(r[0]) && idadeDias <= parseFloat(r[1]);
        });
        if (temp.length > 0) filtradas = temp;
    }

    // E) Filtrar por PESO
    if (pesoVal > 0) {
        let temp = filtradas.filter(m => {
            const r = extrairRegra(m.campos, "peso");
            return r && pesoVal >= parseFloat(r[0]) && pesoVal <= parseFloat(r[1]);
        });
        if (temp.length > 0) filtradas = temp;
    }

    // Define a melhor linha encontrada após o funil
    medAtivo = filtradas[0];

    // Sincroniza a interface
    if (medAtivo.dose) camposDivs.dose.value = medAtivo.dose.toLowerCase();
    if (medAtivo.via) camposDivs.via.value = medAtivo.via.toLowerCase();
}


function exibirCampos() {
    if (!medAtivo) {
        inputs.peso.value = ""; 
        inputs.idade.value = ""; 
        inputs.dosagem.value = "";
        pResultado.style.background = "var(--primary)";
        Object.values(camposDivs).forEach(div => { if(div) div.style.display = "none"; });
        pResultado.innerHTML = "";
        return;
    }

    const regras = medAtivo.campos || "";

    // Exibição condicional de Peso, Idade, Dosagem
    const p = extrairRegra(regras, "peso");
    camposDivs.peso.style.display = p ? "flex" : "none";
    if(p) { medAtivo.p_min = parseFloat(p[0]); medAtivo.p_max = parseFloat(p[1]); }

    const i = extrairRegra(regras, "idade");
    camposDivs.idade.style.display = i ? "flex" : "none";
    if(i) { medAtivo.i_min = parseFloat(i[0]); medAtivo.i_max = parseFloat(i[1]); }

    const d = extrairRegra(regras, "dosagem");
    camposDivs.dosagem.style.display = d ? "flex" : "none";
    if(d) { 
        medAtivo.d_min = parseFloat(d[0]); medAtivo.d_max = parseFloat(d[1]); 
        if(!inputs.dosagem.value) inputs.dosagem.value = d[2];
        txtUnidadeDosagem.innerText = d[3];
    }
    
    
// --- LÓGICA DE DOENÇA (INDICAÇÃO) ---
    const selectD = camposDivs.selDoenca;
    const nomeMedicamento = inputNome.value.trim().toLowerCase();
    const paisAtivo = selectPais.value.toLowerCase();

    let baseFiltrada = [...(bancoDados[paisAtivo] || []), ...(bancoDados["oms"] || [])]
                        .filter(m => String(m.nome).toLowerCase().trim() === nomeMedicamento);

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
    
    
// 1. Preparamos os dados da nova concentração
    const concRaw = String(medAtivo.concentracao || "");
    const selectC = camposDivs.selConcentracao;

    if (concRaw.includes("|")) {
        // 2. Criamos uma "assinatura" da nova lista para comparar
        // Se a string for a mesma, não precisamos de apagar o que lá está
        const assinaturaNova = concRaw; 
        const assinaturaAtual = selectC.getAttribute("data-assinatura");

        if (assinaturaNova !== assinaturaAtual) {
            // SÓ ENTRA AQUI se mudares de medicamento ou se a lista mudar de facto
            selectC.innerHTML = "";
            concRaw.split(";").forEach(g => {
                const pts = g.split("|");
                if(pts.length === 2) {
                    const opt = document.createElement("option");
                    opt.innerText = pts[0].trim(); 
                    opt.value = pts[1].trim();
                    selectC.appendChild(opt);
                }
            });
            // Guardamos a assinatura para a próxima verificação
            selectC.setAttribute("data-assinatura", assinaturaNova);
        }
        selectC.style.display = "block";
    } else {
        selectC.style.display = "none";
        selectC.removeAttribute("data-assinatura");
    }
    
    
    
    
    

    if (medAtivo.intervalo) {
        camposDivs.intervalo.style.display = "block";
        camposDivs.intervalo.innerHTML = "";
        String(medAtivo.intervalo).split(",").forEach(h => {
            const opt = document.createElement("option");
            opt.value = 24 / parseInt(h); opt.innerText = `${h.trim()}/${h.trim()}h`;
            camposDivs.intervalo.appendChild(opt);
        });
    } else {
        camposDivs.intervalo.style.display = "none";
    }

    // CORREÇÃO: Dose e Via só aparecem se o medicamento selecionado os tiver definidos
    camposDivs.dose.style.display = medAtivo.dose ? "block" : "none";
    camposDivs.via.style.display = medAtivo.via ? "block" : "none";
}

/* ==========================================================================
   4. CÁLCULO E SEGURANÇA
   ========================================================================== */
function avisar(m) {
    const modal = document.getElementById("meuModal");
    const pModal = document.getElementById("modalMensagem");

    if (modal.style.display === "flex") {
        // Adiciona uma linha e a nova mensagem sem recriar o modal todo
        pModal.insertAdjacentHTML('beforeend', "<hr style='margin:10px 0'>" + m);
    } else {
        pModal.innerHTML = m;
        modal.style.display = "flex";
    }
}
function fecharModal() {
    document.getElementById("meuModal").style.display = "none";
    document.getElementById("modalMensagem").innerHTML = ""; // Limpa os avisos acumulados
}

function calcular() {
    pResultado.classList.remove("vibrar"); void pResultado.offsetWidth; pResultado.classList.add("vibrar");

    // CORREÇÃO: Feedback de medicamento não encontrado (TUA ESSÊNCIA)
    if (!medAtivo) {
        pResultado.innerHTML = "Medicamento não encontrado!";
        pResultado.style.background = "red";
        pResultado.style.textAlign = "center";
        return;
    }
    
     
    const idadeTexto = inputs.unidadeIdade.options[inputs.unidadeIdade.selectedIndex].text;
    const fatorConversao = parseFloat(inputs.unidadeIdade.value) || 1; 
    const unidadeDosagem = txtUnidadeDosagem.innerText;
    let peso = parseFloat(inputs.peso.value) || 1
    let idade = parseFloat(inputs.idade.value) || 1;
    let dosagem = parseFloat(inputs.dosagem.value) || 1;
    let intervalo = parseFloat(camposDivs.intervalo.value) || 1;
    let concentracao = camposDivs.selConcentracao.style.display !== "none" ? parseFloat(camposDivs.selConcentracao.value) : parseFloat(medAtivo.concentracao) || 1;
    const textoExibido = camposDivs.selConcentracao.style.display !== "none" ? camposDivs.selConcentracao.options[camposDivs.selConcentracao.selectedIndex].text : String(medAtivo.concentracao || "");
    



    
    // --- SEGURANÇA: PESO ---
    if (medAtivo.p_min !== undefined && inputs.peso.value !== "") {
        if (peso < medAtivo.p_min || peso > medAtivo.p_max) {
            const novoPeso = (peso < medAtivo.p_min) ? medAtivo.p_min : medAtivo.p_max;
            avisar(`Peso inválido. <br>
            Deve estar entre ${medAtivo.p_min} - ${medAtivo.p_max} kg. <br>
            Corrigido para: ${novoPeso} kg`);
            peso = novoPeso;
            inputs.peso.value = peso;
        }
    }
    
// 2. Segurança de Idade (Comparando na unidade selecionada)
    if (medAtivo.i_min && inputs.idade.value) {
        // Convertemos os limites da BD (dias) para a unidade do ecrã (ex: anos)
        const minNaUnidade = medAtivo.i_min / fatorConversao;
        const maxNaUnidade = medAtivo.i_max / fatorConversao;

        // Comparamos o que o user digitou (idade) com os limites convertidos
        if (idade < minNaUnidade || idade > maxNaUnidade) {
            
            // Ajustamos a 'idade' para o limite (ainda na unidade do ecrã)
            idade = idade < minNaUnidade ? minNaUnidade : maxNaUnidade;
            
            avisar(`Idade inválida. <br>
            Deve estar entre ${minNaUnidade.toFixed(0)} - ${maxNaUnidade.toFixed(0)} ${idadeTexto}. <br>
            Corrigida para: ${idade.toFixed(0)} ${idadeTexto}`);
            
            // Atualiza o campo visual
            inputs.idade.value = idade;
        }
    }

    if (medAtivo.d_min && inputs.dosagem.value && (dosagem < medAtivo.d_min || dosagem > medAtivo.d_max)) {
        dosagem = dosagem < medAtivo.d_min ? medAtivo.d_min : medAtivo.d_max;
        avisar(`Dosagem inválida. <br>
        Deve estar entre ${medAtivo.d_min} - ${medAtivo.d_max} ${unidadeDosagem}. <br>
Corrigida para: ${dosagem} ${unidadeDosagem}`);
        inputs.dosagem.value = dosagem;
    }
try {
        let res = medAtivo.formula 
            .replace(/#p/g, peso)
            .replace(/#co/g, textoExibido) // texto do select de concentração
            .replace(/#id/g, idade) 
            .replace(/#d/g, dosagem)
            .replace(/#c/g, concentracao) // valor ds concetração  usado na formula
            .replace(/#i/g, intervalo)
            .replace(/@@([^@]+)@/g, '<span style="color: orange; font-weight: bold;">$1</span>')
            .replace(/%([^%]+)%/g, '<span style="text-align: center; display: block;">$1</span>')
            .replace(/{([^}]+)}/g, (m, exp) => { //calculo
                try {
                    return eval(exp).toFixed(1);
                } catch (e) { return "Erro"; }
            })
            .replace(/\[([^\]]+)\]/g, '<span class="ml">$1</span>')
            .replace(/#/g, "<br>");
          
        pResultado.innerHTML = res;
        pResultado.style.color = "white";
        pResultado.style.textAlign = "left";
        pResultado.style.background = "var(--primary)";
    } catch (e) { 
        pResultado.innerText = "Erro na fórmula da base de dados!";
        pResultado.style.textAlign = "center";
        pResultado.style.background = "red"; 
    }
    
    
}
/* ==========================================================================
   GATILHO AUTOMÁTICO PARA CONCENTRAÇÃO
   ========================================================================== */

// Função que verifica se os campos obrigatórios visíveis estão preenchidos
function calcularSePronto() {
    if (!medAtivo) return;

    // 1. Verificar se o Peso é necessário e se está preenchido
    const pesoOK = camposDivs.peso.style.display === "none" || inputs.peso.value.trim() !== "";
    
    // 2. Verificar se a Idade é necessária e se está preenchida
    const idadeOK = camposDivs.idade.style.display === "none" || inputs.idade.value.trim() !== "";
    
    // 3. Verificar se a Dosagem é necessária e se está preenchida
    const dosagemOK = camposDivs.dosagem.style.display === "none" || inputs.dosagem.value.trim() !== "";

    // Se todos os campos que aparecem no ecrã tiverem dados, calcula automaticamente
    if (pesoOK && idadeOK && dosagemOK) {
        calcular();
    }
}



// Opcional: Aplicar também ao Intervalo para automatizar ainda mais
camposDivs.intervalo.addEventListener('change', () => {
    calcularSePronto();
});
/* ==========================================================================
   5. GATILHOS
   ========================================================================== */

function limpar() {
    pResultado.classList.remove("vibrar"); void pResultado.offsetWidth; pResultado.classList.add("vibrar");
    inputNome.value = ""; inputs.peso.value = ""; inputs.idade.value = ""; inputs.dosagem.value = "";
    medAtivo = null; exibirCampos(); pResultado.innerHTML = "";
    pResultado.style.background = "var(--primary)";
}
// Aplicar o gatilho ao Select de Concentração
camposDivs.selConcentracao.addEventListener('change', () => {
    calcularSePronto();
});
// Fecha as sugestões ao clicar fora da caixa ou do input
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
        // Tenta encontrar o medicamento enquanto digita
        escolherLinha('silencioso');
        if (medAtivo) {
            divSugestoes.style.display = "none";
            exibirCampos();
        } else {
            // Se ainda está a meio da palavra, gere as sugestões
            gerirSugestoes();
            exibirCampos(); // Vai esconder os campos porque medAtivo é null
        }
    } else {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
    }
});
 
[camposDivs.dose, camposDivs.via, inputs.peso, inputs.idade, inputs.unidadeIdade].forEach(el => {
    el.addEventListener('input', () => { 
        if(inputNome.value.trim() !== "") { 
            escolherLinha('ajuste'); 
            exibirCampos();
        } 
    });
});
camposDivs.selDoenca.addEventListener('change', () => {
    escolherLinha('ajuste');
    exibirCampos();
});


/* ==========================================================================
   5. GATILHOS (VERSÃO OTIMIZADA)
   ========================================================================== */

// Variável de controle para evitar que o HTML seja reconstruído sem necessidade





selectPais.addEventListener('change', () => {
    localStorage.setItem('pais', selectPais.value);
    const nomePais = selectPais.options[selectPais.selectedIndex].text;
    
    // 1. Limpa tudo o que estava no ecrã antes
    limpar();
    
    // 2. Feedback de "A carregar"
    pResultado.innerHTML = "A carregar...";
    pResultado.style.background = "orange";
    pResultado.style.color = "white";
    pResultado.style.textAlign = "left";
    
    // 3. Simulação de atualização (Timeout)
    setTimeout(() => {
        pResultado.innerHTML = `Padrões da <b>${nomePais}</b> carregados. <br> Tudo pronto.`;
        pResultado.style.background = "var(--primary)"; // Usa a cor principal do teu CSS
    }, 1200);
});

window.addEventListener('load', () => {
    // 1. Restaurar Tema
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
    }

    // 2. Restaurar País
    const paisSalvo = localStorage.getItem('pais');
    if (paisSalvo) {
        selectPais.value = paisSalvo;
    }
    
    // 3. Inicia o carregamento da base de dados
    carregarDados();
});