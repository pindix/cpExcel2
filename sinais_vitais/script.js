// --- LÓGICA DO TEMA ---
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

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

// --- BASE DE DADOS CLÍNICA ---
// --- BASE DE DADOS CLÍNICA - PAÍSES DA CPLP E PARCEIROS ---
// Fontes: Diretrizes da Sociedade Brasileira de Cardiologia, NHS (Reino Unido),
//         Ministério da Saúde de Angola, diretrizes da OMS
const DB_VITALS = {
    // ==================== PAÍSES DA CPLP ====================
    
    // 1. ANGOLA (Fonte: Ministério da Saúde de Angola / Diretrizes Africanas da OMS)
    "Angola": {
        "recem_nascido_0_1m": { fc: [120, 160], fr: [40, 60], sis: [60, 75], dia: [30, 45], temp: [36.5, 37.5], sato2: [95, 100] },
        "lactente_1_12m": { fc: [100, 150], fr: [25, 40], sis: [70, 95], dia: [45, 65], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_1_3": { fc: [80, 130], fr: [20, 30], sis: [85, 105], dia: [50, 70], temp: [36.0, 37.5], sato2: [95, 100] },
        "crianca_3_6": { fc: [80, 120], fr: [20, 25], sis: [90, 110], dia: [55, 75], temp: [36.0, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 110], fr: [18, 25], sis: [95, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_12_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso_60mais": { fc: [60, 90], fr: [16, 24], sis: [90, 139], dia: [60, 89], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 2. BRASIL (Fonte: Sociedade Brasileira de Cardiologia - Diretrizes 2024)
    "Brasil": {
        "recem_nascido_0_1m": { fc: [120, 160], fr: [40, 60], sis: [65, 85], dia: [45, 55], temp: [36.5, 37.5], sato2: [95, 100] },
        "lactente_1_12m": { fc: [100, 150], fr: [25, 40], sis: [70, 100], dia: [50, 65], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_1_3": { fc: [80, 130], fr: [20, 30], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_3_6": { fc: [80, 120], fr: [20, 25], sis: [90, 110], dia: [55, 75], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 110], fr: [18, 25], sis: [100, 120], dia: [60, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_12_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [70, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto_feminino": { fc: [64, 104], fr: [12, 20], sis: [90, 120], dia: [60, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto_masculino": { fc: [60, 100], fr: [12, 20], sis: [90, 120], dia: [60, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso_feminino": { fc: [60, 90], fr: [16, 24], sis: [90, 140], dia: [60, 90], temp: [35.8, 37.0], sato2: [94, 99] },
        "idoso_masculino": { fc: [60, 90], fr: [16, 24], sis: [90, 140], dia: [60, 90], temp: [35.8, 37.0], sato2: [94, 99] }
    },
    
    // 3. CABO VERDE (Fonte: Ministério da Saúde de Cabo Verde / OMS)
    "Cabo_Verde": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_13_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso": { fc: [60, 90], fr: [16, 24], sis: [90, 139], dia: [60, 89], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 4. GUINÉ-BISSAU (Fonte: Ministério da Saúde Pública / Diretrizes OMS África)
    "Guine_Bissau": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_13_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] }
    },
    
    // 5. GUINÉ EQUATORIAL (Fonte: Ministério da Saúde / OMS, único país africano com espanhol como oficial, mas membro CPLP desde 2014)
    "Guine_Equatorial": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] }
    },
    
    // 6. MOÇAMBIQUE (Fonte: Ministério da Saúde de Moçambique)
    "Mocambique": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_13_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] }
    },
    
    // 7. PORTUGAL (Fonte: Sociedade Portuguesa de Cardiologia / DGS)
    "Portugal": {
        "recem_nascido_0_1m": { fc: [120, 160], fr: [40, 60], sis: [65, 85], dia: [45, 55], temp: [36.5, 37.5], sato2: [95, 100] },
        "lactente_1_12m": { fc: [100, 150], fr: [25, 40], sis: [70, 100], dia: [50, 65], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_1_3": { fc: [80, 130], fr: [20, 30], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_3_6": { fc: [80, 120], fr: [20, 25], sis: [90, 110], dia: [55, 75], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 110], fr: [18, 25], sis: [95, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_12_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso_60mais": { fc: [60, 90], fr: [16, 24], sis: [90, 139], dia: [60, 89], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 8. SÃO TOMÉ E PRÍNCIPE (Fonte: Ministério da Saúde / OMS África)
    "Sao_Tome_Principe": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_13_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] }
    },
    
    // 9. TIMOR-LESTE (Fonte: Ministério da Saúde / OMS Sudeste Asiático)
    "Timor_Leste": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_13_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] }
    },
    
    // ==================== PAÍSES ADICIONAIS (PARCEIROS) ====================
    
    // 10. ESTADOS UNIDOS (Fonte: American Heart Association - Guidelines 2024)
    "Estados_Unidos": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_13_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 18], sis: [90, 120], dia: [60, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso_65mais": { fc: [60, 90], fr: [16, 25], sis: [90, 130], dia: [60, 80], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 11. REINO UNIDO (Fonte: NHS - National Health Service)
    "Reino_Unido": {
        "crianca_1_5": { fc: [80, 140], fr: [22, 34], sis: [85, 105], dia: [50, 70], temp: [36.5, 37.5], sato2: [95, 100] },
        "crianca_6_12": { fc: [70, 120], fr: [18, 30], sis: [90, 115], dia: [55, 75], temp: [36.0, 37.2], sato2: [95, 100] },
        "adolescente_13_18": { fc: [60, 100], fr: [12, 20], sis: [100, 120], dia: [65, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 18], sis: [90, 120], dia: [60, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso": { fc: [60, 90], fr: [16, 24], sis: [90, 139], dia: [60, 89], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 12. ALEMANHA (Fonte: Deutsche Hochdruckliga - Diretrizes Europeias ESC/ESH)
    "Alemanha": {
        "adulto": { fc: [60, 100], fr: [12, 18], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso": { fc: [60, 90], fr: [16, 24], sis: [90, 139], dia: [60, 89], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 13. CANADÁ (Fonte: Heart and Stroke Foundation of Canada)
    "Canada": {
        "adulto": { fc: [60, 100], fr: [12, 18], sis: [90, 120], dia: [60, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso": { fc: [60, 90], fr: [16, 24], sis: [90, 130], dia: [60, 80], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 14. AUSTRÁLIA (Fonte: Heart Foundation Australia)
    "Australia": {
        "adulto": { fc: [60, 100], fr: [12, 18], sis: [90, 120], dia: [60, 80], temp: [36.0, 37.2], sato2: [95, 100] },
        "idoso": { fc: [60, 90], fr: [16, 24], sis: [90, 139], dia: [60, 89], temp: [36.0, 37.0], sato2: [94, 99] }
    },
    
    // 15. JAPÃO (Fonte: Japanese Society of Hypertension 2019)
    "Japao": {
        "adulto": { fc: [60, 100], fr: [12, 18], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] }
    }
};

function interpretar() {
    const res = document.getElementById("resultado");
    const sis = document.getElementById("sis");
    const dia = document.getElementById("dia");
    const fc = document.getElementById("fc");
    const fr = document.getElementById("fr");
    const temp = document.getElementById("temp");
    const sato2 = document.getElementById("sato2");
    const caixaTa = document.getElementById("caixa_ta");

    // 1. Determinar a Referência Dinâmica
    let paisRef, faixaRef;
    
    if (pacienteAtivo) {
        paisRef = pacientes[pacienteAtivo].info.pais;
        faixaRef = pacientes[pacienteAtivo].info.faixa;
    } else {
        paisRef = document.getElementById("pais_referencia").value;
        faixaRef = document.getElementById("faixa_etaria").value;
        
        // Validar se o país foi selecionado no modo sem paciente
        if (!paisRef || paisRef === "Selecione um País") {
            res.innerHTML = "Selecione um país válido!";
            res.style.background = "#f44336";
            res.style.display = "block";
            return;
        }
        
        // Validar se a faixa etária foi selecionada
        if (!faixaRef || faixaRef === "— Selecione a Faixa Etária —") {
            res.innerHTML = "Selecione uma faixa etária válida!";
            res.style.background = "#f44336";
            res.style.display = "block";
            return;
        }
    }

    // Garantir que a faixa existe no DB_VITALS
    if (!DB_VITALS[paisRef] || !DB_VITALS[paisRef][faixaRef]) {
        console.warn(`Faixa ${faixaRef} não encontrada para ${paisRef}, usando adulto como fallback`);
        faixaRef = "adulto";
    }

    const ref = DB_VITALS[paisRef]?.[faixaRef] || DB_VITALS["Angola"]["adulto"];

    // 2. Limpeza de estados anteriores
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
    [sis, dia, fc, fr, temp, sato2, caixaTa].forEach(el => el.classList.remove("campo-incompleto"));

    // 3. Validações
    if (!sis.value && !dia.value && !fc.value && !fr.value && !temp.value && !sato2.value) {
        res.innerHTML = "Insira pelo menos um sinal vital!";
        res.style.background = "#f44336";
        res.style.display = "block";
        return;
    }

    if ((sis.value && !dia.value) || (!sis.value && dia.value)) {
        caixaTa.classList.add("campo-incompleto");
        res.innerHTML = "Tensão Arterial incompleta!";
        res.style.background = "#f44336";
        res.style.display = "block";
        return;
    }

    // 4. Análise dos Dados
    let html = `<b>Resultados:</b><br>`;
    function analisar(valor, min, max, label, unidade) {
        if (!valor) return "";
        let v = parseFloat(valor);
        let status = "Normal", cor = "#00843d";
        if (v < min) { status = "BAIXO"; cor = "orange"; }
        if (v > max) { status = "ALTO"; cor = "red"; }
        return `<div style="margin-top:8px">• ${label}: <b>${v}${unidade}</b> <span style="color:${cor}; font-weight: bold; background: white; border-radius: 8px; padding: 0.3rem";>${status}</span></div>`;
    }

    html += analisar(fc.value, ref.fc[0], ref.fc[1], "FC", " bpm");
    html += analisar(fr.value, ref.fr[0], ref.fr[1], "FR", " ipm");
    html += analisar(temp.value, ref.temp[0], ref.temp[1], "Temp.", "°C");
    html += analisar(sato2.value, ref.sato2[0], ref.sato2[1], "Sat. O2", "%");
    if(sis.value) html += analisar(sis.value, ref.sis[0], ref.sis[1], "Sistol", " mmHg");
    if(dia.value) html += analisar(dia.value, ref.dia[0], ref.dia[1], "Diastol", " mmHg");

    res.innerHTML = html;
    res.style.background = "var(--primary)";
    res.style.display = "block";

    // 5. Salvamento Automático (Modo Monitorização)
    if (pacienteAtivo) {
        const agora = new Date();
        const registro = {
            data: agora.toLocaleDateString(),
            hora: agora.toLocaleTimeString(),
            fc: fc.value, 
            fr: fr.value, 
            temp: temp.value, 
            sato2: sato2.value,
            sis: sis.value, 
            dia: dia.value
        };
        pacientes[pacienteAtivo].historico.push(registro);
        localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
    }
}



function limparSinais() {
    ["sis", "dia", "fc", "fr", "temp", "sato2"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("resultado").style.display = "none";
    document.getElementById("caixa_ta").classList.remove("campo-incompleto");
}

let pacientes = JSON.parse(localStorage.getItem('pacientes_monitorados')) || {};
let pacienteAtivo = null;

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
}

function cadastrarPaciente() {
    const nome = document.getElementById('p-nome').value.trim();
    const pais = document.getElementById('p-pais').value;
    const faixa = document.getElementById('p-faixa').value;

    if (!nome) { 
        alert("Insira o nome do paciente"); 
        return; 
    }
    
    // Validar se o país foi selecionado
    if (!pais || pais === "Selecione um País") { 
        alert("Selecione um país válido"); 
        return; 
    }
    
    // Validar se a faixa etária foi selecionada
    if (!faixa || faixa === "Selecione a Faixa Etária") { 
        alert("Selecione uma faixa etária válida"); 
        return; 
    }

    if (pacientes[nome]) {
        alert("Já existe um paciente com este nome!");
        return;
    }

    pacientes[nome] = { info: { pais, faixa }, historico: [] };
    localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
    renderListaNomes();
    document.getElementById('p-nome').value = '';
    
}
// Renderizar lista vertical com botão de remover



function renderListaNomes() {
    const lista = document.getElementById('lista-pacientes');
    if (!lista) return;
    
    lista.innerHTML = Object.keys(pacientes).map(nome => {
        let faixaOriginal = pacientes[nome].info.faixa;
        let faixaFormatada = "";
        
        // RECÉM-NASCIDO (0-1 mês)
        if (faixaOriginal === "recem_nascido_0_1m") {
            faixaFormatada = "Recém-nascido (0-1 mês)";
        }
        // LACTENTE (1-12 meses)
        else if (faixaOriginal === "lactente_1_12m") {
            faixaFormatada = "Lactente (1-12 meses)";
        }
        // Criança 1-5 anos (padrão internacional)
        else if (faixaOriginal === "crianca_1_5") {
            faixaFormatada = "Criança (1-5 anos)";
        }
        // Criança 1-3 anos (CPLP)
        else if (faixaOriginal === "crianca_1_3") {
            faixaFormatada = "Criança (1-3 anos)";
        }
        // Criança 3-6 anos (CPLP)
        else if (faixaOriginal === "crianca_3_6") {
            faixaFormatada = "Criança (3-6 anos)";
        }
        // Criança 6-12 anos
        else if (faixaOriginal === "crianca_6_12") {
            faixaFormatada = "Criança (6-12 anos)";
        }
        // Adolescente 12-18 anos (CPLP)
        else if (faixaOriginal === "adolescente_12_18") {
            faixaFormatada = "Adolescente (12-18 anos)";
        }
        // Adolescente 13-18 anos (internacional)
        else if (faixaOriginal === "adolescente_13_18") {
            faixaFormatada = "Adolescente (13-18 anos)";
        }
        // Idoso 60+ anos (Angola/Portugal)
        else if (faixaOriginal === "idoso_60mais") {
            faixaFormatada = "Idoso (60 ou mais anos)";
        }
        // Idoso 65+ anos (EUA)
        else if (faixaOriginal === "idoso_65mais") {
            faixaFormatada = "Idoso (65 ou mais anos)";
        }
        // Idoso genérico
        else if (faixaOriginal === "idoso") {
            faixaFormatada = "Idoso (60+ anos)";
        }
        // Idoso feminino (Brasil)
        else if (faixaOriginal === "idoso_feminino") {
            faixaFormatada = "Idoso Feminino (60+ anos)";
        }
        // Idoso masculino (Brasil)
        else if (faixaOriginal === "idoso_masculino") {
            faixaFormatada = "Idoso Masculino (60+ anos)";
        }
        // Adulto genérico
        else if (faixaOriginal === "adulto") {
            faixaFormatada = "Adulto (18-60 anos)";
        }
        // Adulto feminino (Brasil)
        else if (faixaOriginal === "adulto_feminino") {
            faixaFormatada = "Adulto Feminino (18-60 anos)";
        }
        // Adulto masculino (Brasil)
        else if (faixaOriginal === "adulto_masculino") {
            faixaFormatada = "Adulto Masculino (18-60 anos)";
        }
        // Fallback para qualquer outro formato
        else {
            faixaFormatada = faixaOriginal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (faixaFormatada.match(/\d+_\d+/)) {
                faixaFormatada = faixaFormatada.replace(/(\d+) (\d+)/g, '$1-$2') + ' anos';
            }
        }
        
        return `
        <div class="perfil-item">
            <div class="perfil-info" onclick="selecionarPaciente('${nome.replace(/'/g, "\\'")}')">
                <strong>${nome}</strong>
                <span>${faixaFormatada} • ${pacientes[nome].info.pais}</span>
            </div>
            <button class="btn-remover-perfil" onclick="removerPerfil('${nome.replace(/'/g, "\\'")}')">
                <i class="ri-delete-bin-7-line"></i>
            </button>
        </div>
    `}).join('');
}





function removerPerfil(nome) {
    if (confirm(`Deseja remover o perfil de ${nome} e todo o seu histórico?`)) {
        if (pacienteAtivo === nome) ativarModoPadrao();
        delete pacientes[nome];
        localStorage.setItem('pacientes_monitorados', JSON.stringify(pacientes));
        renderListaNomes();
    }
}








function selecionarPaciente(nome) {
    pacienteAtivo = nome;
    const p = pacientes[nome];

    const controlesPadrao = document.getElementById('controles-padrao');
    const tagPaciente = document.getElementById('tag-paciente');
    const btnExportar = document.getElementById('btn-exportar');
    const nomeExibicao = document.getElementById('nome-exibicao');
    const detalhesExibicao = document.getElementById('detalhes-exibicao');
    
    if (controlesPadrao) controlesPadrao.style.display = 'none';
    if (tagPaciente) tagPaciente.style.display = 'flex';
    if (btnExportar) btnExportar.style.display = 'flex';
    if (nomeExibicao) nomeExibicao.innerText = "Monitorizando: " + nome;
    
    let faixaOriginal = p.info.faixa;
    let faixaFormatada = "";
    
    // RECÉM-NASCIDO (0-1 mês)
    if (faixaOriginal === "recem_nascido_0_1m") {
        faixaFormatada = "Recém-nascido (0-1 mês)";
    }
    // LACTENTE (1-12 meses)
    else if (faixaOriginal === "lactente_1_12m") {
        faixaFormatada = "Lactente (1-12 meses)";
    }
    // Criança 1-5 anos (padrão internacional)
    else if (faixaOriginal === "crianca_1_5") {
        faixaFormatada = "Criança (1-5 anos)";
    }
    // Criança 1-3 anos (CPLP)
    else if (faixaOriginal === "crianca_1_3") {
        faixaFormatada = "Criança (1-3 anos)";
    }
    // Criança 3-6 anos (CPLP)
    else if (faixaOriginal === "crianca_3_6") {
        faixaFormatada = "Criança (3-6 anos)";
    }
    // Criança 6-12 anos
    else if (faixaOriginal === "crianca_6_12") {
        faixaFormatada = "Criança (6-12 anos)";
    }
    // Adolescente 12-18 anos (CPLP)
    else if (faixaOriginal === "adolescente_12_18") {
        faixaFormatada = "Adolescente (12-18 anos)";
    }
    // Adolescente 13-18 anos (internacional)
    else if (faixaOriginal === "adolescente_13_18") {
        faixaFormatada = "Adolescente (13-18 anos)";
    }
    // Idoso 60+ anos (Angola/Portugal)
    else if (faixaOriginal === "idoso_60mais") {
        faixaFormatada = "Idoso (60 ou mais anos)";
    }
    // Idoso 65+ anos (EUA)
    else if (faixaOriginal === "idoso_65mais") {
        faixaFormatada = "Idoso (65 ou mais anos)";
    }
    // Idoso genérico
    else if (faixaOriginal === "idoso") {
        faixaFormatada = "Idoso (60+ anos)";
    }
    // Idoso feminino (Brasil)
    else if (faixaOriginal === "idoso_feminino") {
        faixaFormatada = "Idoso Feminino (60+ anos)";
    }
    // Idoso masculino (Brasil)
    else if (faixaOriginal === "idoso_masculino") {
        faixaFormatada = "Idoso Masculino (60+ anos)";
    }
    // Adulto genérico
    else if (faixaOriginal === "adulto") {
        faixaFormatada = "Adulto (18-60 anos)";
    }
    // Adulto feminino (Brasil)
    else if (faixaOriginal === "adulto_feminino") {
        faixaFormatada = "Adulto Feminino (18-60 anos)";
    }
    // Adulto masculino (Brasil)
    else if (faixaOriginal === "adulto_masculino") {
        faixaFormatada = "Adulto Masculino (18-60 anos)";
    }
    // Fallback para qualquer outro formato
    else {
        faixaFormatada = faixaOriginal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (faixaFormatada.match(/\d+_\d+/)) {
            faixaFormatada = faixaFormatada.replace(/(\d+) (\d+)/g, '$1-$2') + ' anos';
        }
    }
    
    if (detalhesExibicao) detalhesExibicao.innerText = `${faixaFormatada} • ${p.info.pais}`;
    
    toggleMenu();
}






function ativarModoPadrao() {
    pacienteAtivo = null;
    
    const controlesPadrao = document.getElementById('controles-padrao');
    const tagPaciente = document.getElementById('tag-paciente');
    const btnExportar = document.getElementById('btn-exportar');
    
    if (controlesPadrao) controlesPadrao.style.display = 'flex';
    if (tagPaciente) tagPaciente.style.display = 'none';
    if (btnExportar) btnExportar.style.display = 'none';
    
    limparSinais();
    
    // Fechar sidebar se estiver aberta
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) overlay.style.display = 'none';
    }
}














async function exportarPDF() {
    // --- VALIDAÇÕES INICIAIS ---
    if (!pacienteAtivo) {
        alert("Nenhum paciente selecionado. Selecione um paciente na lista.");
        return;
    }
    
    if (!pacientes[pacienteAtivo]) {
        alert("Paciente não encontrado.");
        return;
    }
    
    if (!pacientes[pacienteAtivo].historico || pacientes[pacienteAtivo].historico.length === 0) {
        alert("Adicione pelo menos uma medição ao histórico do paciente antes de exportar.");
        return;
    }

    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("Erro: Biblioteca jsPDF não carregada. Recarregue a página.");
            return;
        }
        
        if (typeof Chart === 'undefined') {
            alert("Erro: Biblioteca Chart.js não carregada. Recarregue a página.");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const p = pacientes[pacienteAtivo];
        const hist = p.historico;

        // --- CÁLCULO DE ESTATÍSTICAS ---
        const totalMedicoes = hist.length;
        const diasUnicos = [...new Set(hist.map(h => h.data))];
        const totalDias = diasUnicos.length;
        const primeiraData = hist[0].data;
        const ultimaData = hist[hist.length - 1].data;
        
        // --- CALCULAR MÉDIAS ---
        let somaFC = 0, somaSatO2 = 0;
        let countFC = 0, countSatO2 = 0;
        
        hist.forEach(h => {
            if (h.fc && h.fc !== "" && !isNaN(parseFloat(h.fc))) { 
                somaFC += parseFloat(h.fc); 
                countFC++; 
            }
            if (h.sato2 && h.sato2 !== "" && !isNaN(parseFloat(h.sato2))) { 
                somaSatO2 += parseFloat(h.sato2); 
                countSatO2++; 
            }
        });
        
        const mediaFC = countFC > 0 ? (somaFC / countFC).toFixed(0) : "-";
        const mediaSatO2 = countSatO2 > 0 ? (somaSatO2 / countSatO2).toFixed(0) : "-";
        
        // --- CALCULAR ALERTAS ---
        const paisRef = p.info.pais;
        let faixaRef = p.info.faixa;

        // Verificar se a faixa existe no DB_VITALS para este país
        if (!DB_VITALS[paisRef] || !DB_VITALS[paisRef][faixaRef]) {
            console.warn(`Faixa ${faixaRef} não encontrada para ${paisRef}, usando adulto como fallback`);
            faixaRef = "adulto";
        }
        
        const ref = DB_VITALS[paisRef]?.[faixaRef] || DB_VITALS["Angola"]["adulto"];
        
        let alertas = { fc: 0, fr: 0, temp: 0, sato2: 0, ta: 0 };
        
        hist.forEach(registro => {
            if (registro.fc && registro.fc !== "" && !isNaN(parseFloat(registro.fc))) {
                let fc = parseFloat(registro.fc);
                if (fc < ref.fc[0] || fc > ref.fc[1]) alertas.fc++;
            }
            if (registro.fr && registro.fr !== "" && !isNaN(parseFloat(registro.fr))) {
                let fr = parseFloat(registro.fr);
                if (fr < ref.fr[0] || fr > ref.fr[1]) alertas.fr++;
            }
            if (registro.temp && registro.temp !== "" && !isNaN(parseFloat(registro.temp))) {
                let temp = parseFloat(registro.temp);
                if (temp < ref.temp[0] || temp > ref.temp[1]) alertas.temp++;
            }
            if (registro.sato2 && registro.sato2 !== "" && !isNaN(parseFloat(registro.sato2))) {
                let sato2 = parseFloat(registro.sato2);
                if (sato2 < ref.sato2[0]) alertas.sato2++;
            }
            if ((registro.sis && registro.sis !== "") || (registro.dia && registro.dia !== "")) {
                let sisOk = true, diaOk = true;
                if (registro.sis && registro.sis !== "" && !isNaN(parseFloat(registro.sis))) {
                    let sis = parseFloat(registro.sis);
                    if (sis < ref.sis[0] || sis > ref.sis[1]) sisOk = false;
                }
                if (registro.dia && registro.dia !== "" && !isNaN(parseFloat(registro.dia))) {
                    let dia = parseFloat(registro.dia);
                    if (dia < ref.dia[0] || dia > ref.dia[1]) diaOk = false;
                }
                if (!sisOk || !diaOk) alertas.ta++;
            }
        });
        
        // --- LÓGICA PARA DATAS DO GRÁFICO ---
        const usarDias = totalDias > 1;
        
        const labels = hist.map(h => {
            if (usarDias) {
                const partes = h.data.split('/');
                if (partes.length === 3) {
                    return `${partes[0]}/${partes[1]}`;
                }
                return h.data;
            } else {
                return h.hora.substring(0, 5);
            }
        });
        
        const limiteLabels = hist.length > 12 ? 8 : (hist.length > 6 ? 6 : hist.length);
        
        // --- GRÁFICO ---
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = 1200;
        canvasTemp.height = 600;
        canvasTemp.style.position = 'absolute';
        canvasTemp.style.left = '-9999px';
        canvasTemp.style.top = '-9999px';
        document.body.appendChild(canvasTemp);
        
        const ctx = canvasTemp.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasTemp.width, canvasTemp.height);
        
        if (window.chartPDF) window.chartPDF.destroy();
        
        window.chartPDF = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'FC', data: hist.map(h => h.fc && !isNaN(parseFloat(h.fc)) ? parseFloat(h.fc) : 0), borderColor: '#00843d', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#00843d' },
                    { label: 'FR', data: hist.map(h => h.fr && !isNaN(parseFloat(h.fr)) ? parseFloat(h.fr) : 0), borderColor: '#2196F3', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#2196F3' },
                    { label: 'Temp', data: hist.map(h => h.temp && !isNaN(parseFloat(h.temp)) ? parseFloat(h.temp) : 0), borderColor: '#FF9800', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#FF9800' },
                    { label: 'SatO2', data: hist.map(h => h.sato2 && !isNaN(parseFloat(h.sato2)) ? parseFloat(h.sato2) : 0), borderColor: '#9C27B0', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#9C27B0' },
                    { label: 'Sistólica', data: hist.map(h => h.sis && !isNaN(parseFloat(h.sis)) ? parseFloat(h.sis) : 0), borderColor: '#f44336', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#f44336' },
                    { label: 'Diastólica', data: hist.map(h => h.dia && !isNaN(parseFloat(h.dia)) ? parseFloat(h.dia) : 0), borderColor: '#E91E63', backgroundColor: 'transparent', borderDash: [8, 5], tension: 0.3, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#E91E63' }
                ]
            },
            options: { 
                responsive: false, animation: false, maintainAspectRatio: true,
                plugins: {
                    tooltip: { enabled: true, titleFont: { size: 13 }, bodyFont: { size: 12 },
                        callbacks: { title: function(tooltipItems) {
                            const idx = tooltipItems[0].dataIndex;
                            const original = hist[idx];
                            return `${original.data} ${original.hora}`;
                        }}
                    },
                    legend: { position: 'bottom', labels: { boxWidth: 16, font: { size: 14, weight: 'bold' }, padding: 14 } }
                },
                scales: {
                    x: {
                        grid: { display: true, drawBorder: true, drawOnChartArea: true, color: '#cccccc', borderDash: [6, 4], lineWidth: 0.5 },
                        ticks: { font: { size: 13, weight: 'bold' }, maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: limiteLabels, autoSkipPadding: 15 },
                        title: { display: true, text: usarDias ? 'Data da Medição' : 'Horário da Medição', font: { size: 14, weight: 'bold' }, padding: 12 }
                    },
                    y: {
                        grid: { display: true, drawBorder: true, drawOnChartArea: true, color: '#cccccc', borderDash: [6, 4], lineWidth: 0.5 },
                        ticks: { font: { size: 13, weight: 'bold' }, stepSize: 20 },
                        title: { display: true, text: 'Valores', font: { size: 14, weight: 'bold' }, padding: 12 }
                    }
                },
                layout: { padding: { top: 20, bottom: 20, left: 15, right: 15 } }
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 800));
        const imgGrafico = canvasTemp.toDataURL('image/png');
        
        if (window.chartPDF) window.chartPDF.destroy();
        document.body.removeChild(canvasTemp);
        
        // --- CONSTRUIR PDF - PÁGINA 1 ---
        // Cabeçalho
        doc.setFillColor(0, 132, 61);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("RELATÓRIO DE MONITORIZAÇÃO", 15, 20);
        doc.setFontSize(10);
        doc.text("Mpindi TecMed - Sinais Vitais", 15, 28);
        
        // Info Paciente
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(12);
        doc.text(`PACIENTE: ${pacienteAtivo.toUpperCase()}`, 15, 52);
        doc.setFontSize(10);
        
        // Dentro da função exportarPDF, substitua este bloco:
let nomeFaixa = p.info.faixa;

// Formatação correta do perfil
if (nomeFaixa === "recem_nascido_0_1m") {
    nomeFaixa = "Recém-nascido (0-1 mês)";
}
else if (nomeFaixa === "lactente_1_12m") {
    nomeFaixa = "Lactente (1-12 meses)";
}
else if (nomeFaixa === "crianca_1_5") {
    nomeFaixa = "Criança (1-5 anos)";
}
else if (nomeFaixa === "crianca_1_3") {
    nomeFaixa = "Criança (1-3 anos)";
}
else if (nomeFaixa === "crianca_3_6") {
    nomeFaixa = "Criança (3-6 anos)";
}
else if (nomeFaixa === "crianca_6_12") {
    nomeFaixa = "Criança (6-12 anos)";
}
else if (nomeFaixa === "adolescente_12_18") {
    nomeFaixa = "Adolescente (12-18 anos)";
}
else if (nomeFaixa === "adolescente_13_18") {
    nomeFaixa = "Adolescente (13-18 anos)";
}
else if (nomeFaixa === "idoso_60mais") {
    nomeFaixa = "Idoso (60 ou mais anos)";
}
else if (nomeFaixa === "idoso_65mais") {
    nomeFaixa = "Idoso (65 ou mais anos)";
}
else if (nomeFaixa === "idoso") {
    nomeFaixa = "Idoso (60+ anos)";
}
else if (nomeFaixa === "idoso_feminino") {
    nomeFaixa = "Idoso Feminino (60+ anos)";
}
else if (nomeFaixa === "idoso_masculino") {
    nomeFaixa = "Idoso Masculino (60+ anos)";
}
else if (nomeFaixa === "adulto") {
    nomeFaixa = "Adulto (18-60 anos)";
}
else if (nomeFaixa === "adulto_feminino") {
    nomeFaixa = "Adulto Feminino (18-60 anos)";
}
else if (nomeFaixa === "adulto_masculino") {
    nomeFaixa = "Adulto Masculino (18-60 anos)";
}
else {
    // Fallback para qualquer outro formato
    nomeFaixa = nomeFaixa.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (nomeFaixa.match(/\d+_\d+/)) {
        nomeFaixa = nomeFaixa.replace(/(\d+) (\d+)/g, '$1-$2') + ' anos';
    }
}

// Depois continue com o resto do código:
doc.text(`Faixa Etéria: ${nomeFaixa} | País: ${p.info.pais}`, 15, 58);
        
        
        
        doc.text(`Data de emissão: ${new Date().toLocaleDateString()}`, 15, 64);
        
        // Gráfico
        doc.addImage(imgGrafico, 'PNG', 15, 72, 180, 80);
        
        // --- TABELA + RESUMO CONTÍNUOS ---
        // Vamos desenhar o resumo PRIMEIRO, pois ele vem antes da tabela
        // Mas o resumo tem altura fixa (85mm), então vamos posicionar a tabela logo abaixo
        
        const alturaResumo = 85;
        const inicioResumoY = 165; // Após gráfico (72 + 80 = 152, mais um pequeno espaço)
        
        // Desenhar retângulo do resumo
        doc.setFillColor(248, 248, 248);
        doc.setDrawColor(0, 132, 61);
        doc.setLineWidth(0.5);
        doc.rect(15, inicioResumoY, 180, alturaResumo, 'FD');
        
        doc.setFontSize(11);
        doc.setTextColor(0, 132, 61);
        doc.setFont('helvetica', 'bold');
        doc.text("RESUMO DA MONITORIZAÇÃO", 20, inicioResumoY + 8);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, inicioResumoY + 12, 190, inicioResumoY + 12);
        
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        
        let yPosResumo = inicioResumoY + 20;
        doc.text(`• Vezes de medições: ${totalMedicoes}`, 20, yPosResumo);
        yPosResumo += 6;
        doc.text(`• Dias de medições: ${totalDias}`, 20, yPosResumo);
        yPosResumo += 6;
        doc.text(`• Período: ${primeiraData} - ${ultimaData}`, 20, yPosResumo);
        yPosResumo += 6;
        doc.text(`• Média da FC: ${mediaFC} bpm`, 20, yPosResumo);
        yPosResumo += 6;
        doc.text(`• Média da SatO2: ${mediaSatO2}%`, 20, yPosResumo);
        yPosResumo += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text("• Total de alertas:", 20, yPosResumo);
        yPosResumo += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`   - FC: ${alertas.fc}`, 25, yPosResumo);
        yPosResumo += 5;
        doc.text(`   - FR: ${alertas.fr}`, 25, yPosResumo);
        yPosResumo += 5;
        doc.text(`   - SatO2: ${alertas.sato2}`, 25, yPosResumo);
        yPosResumo += 5;
        doc.text(`   - Temperatura: ${alertas.temp}`, 25, yPosResumo);
        yPosResumo += 5;
        doc.text(`   - Tensão Arterial: ${alertas.ta}`, 25, yPosResumo);
        
        // Rodapé do resumo (linha final)
        const rodapeResumoY = inicioResumoY + alturaResumo - 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, rodapeResumoY, 190, rodapeResumoY);
        
        // --- TABELA (começa logo após o resumo) ---
        doc.autoTable({
            startY: inicioResumoY + alturaResumo + 5,
            head: [['Data/Hora', 'FC', 'FR', 'Temp', 'SatO2', 'Sistólica', 'Diastólica']],
            body: hist.map(r => [
                `${r.data} ${r.hora}`, 
                `${r.fc && r.fc !== "" ? r.fc + " bpm" : "-"}`,
                `${r.fr && r.fr !== "" ? r.fr + " ipm" : "-"}`,
                `${r.temp && r.temp !== "" ? r.temp + "°C" : "-"}`,
                `${r.sato2 && r.sato2 !== "" ? r.sato2 + "%" : "-"}`,
                `${r.sis && r.sis !== "" ? r.sis + " mmHg" : "-"}`,
                `${r.dia && r.dia !== "" ? r.dia + " mmHg" : "-"}`
            ]),
            headStyles: { fillColor: [0, 132, 61] },
            theme: 'striped',
            margin: { bottom: 20, top: 5 },
            pageBreak: 'auto',  // ← A tabela quebra automaticamente entre páginas
            showHead: 'everyPage'  // ← Repete o cabeçalho em cada página
        });
        
        // Rodapé final (na última página, após a tabela)
        const ultimaPagina = doc.internal.getNumberOfPages();
        doc.setPage(ultimaPagina);
        
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFillColor(245, 245, 245);
        doc.rect(15, finalY, 180, 10, 'F');
        

        
        doc.setFillColor(245, 245, 245);
doc.rect(15, finalY, 180, 22, 'F');  // Altura aumentada para 22mm

doc.setFontSize(9);  // Fonte aumentada de 7 para 9
doc.setTextColor(100, 100, 100);
doc.setFont('helvetica', 'normal');

// Texto com quebra de linha automática (o jsPDF quebra sozinho com maxWidth)
doc.text("Este documento é informativo e gerado pela Mpindi TecMed. Não substitui aconselhamento médico profissional. As referências dos padrões baseiam-se nas diretrizes do Ministério da Saúde de cada país ou da Organização Mundial da Saúde.", 17, finalY + 7, { maxWidth: 176 });
        
        doc.save(`Relatorio_${pacienteAtivo}.pdf`);
        
    } catch (erro) {
        console.error("Erro na exportação:", erro);
        alert("Ocorreu um erro ao gerar o PDF: " + erro.message);
    }
}









        



function atualizarFaixasPorPais() {
    const paisSelecionado = document.getElementById("pais_referencia").value;
    const faixaSelect = document.getElementById("faixa_etaria");
    const opcoes = document.querySelectorAll("#faixa_etaria .faixa-option");
    
    // Se não há país válido, esconder TODAS as opções e resetar o select
    if (!paisSelecionado || paisSelecionado === "Selecione um País") {
        opcoes.forEach(opt => opt.classList.add("oculto"));
        
        return;
    }
    
    // Mostrar todas primeiro
    opcoes.forEach(opt => opt.classList.remove("oculto"));
    
    // Esconder opções que não incluem o país selecionado
    opcoes.forEach(opt => {
        const paisesPermitidos = opt.getAttribute("data-paises");
        if (paisesPermitidos && !paisesPermitidos.split(",").includes(paisSelecionado)) {
            opt.classList.add("oculto");
        }
    });
    
    // Selecionar primeira opção visível automaticamente
    const primeiraVisivel = document.querySelector("#faixa_etaria .faixa-option:not(.oculto)");
    if (primeiraVisivel) {
        faixaSelect.value = primeiraVisivel.value;
    } else {
        faixaSelect.value = "";
    }
}








function atualizarFaixasPorPaisMenu() {
    const paisSelecionado = document.getElementById("p-pais").value;
    const opcoes = document.querySelectorAll("#p-faixa .faixa-option");
    
    // Se não há país válido, esconder TODAS as opções
    if (!paisSelecionado || paisSelecionado === "Selecione um País") {
        opcoes.forEach(opt => opt.classList.add("oculto"));
        return;
    }
    
    // Mostrar todas primeiro
    opcoes.forEach(opt => opt.classList.remove("oculto"));
    
    // Esconder opções que não incluem o país selecionado
    opcoes.forEach(opt => {
        const paisesPermitidos = opt.getAttribute("data-paises");
        if (paisesPermitidos && !paisesPermitidos.split(",").includes(paisSelecionado)) {
            opt.classList.add("oculto");
        }
    });
    
    // Selecionar primeira opção visível automaticamente
    const primeiraVisivel = document.querySelector("#p-faixa .faixa-option:not(.oculto)");
    if (primeiraVisivel) {
        document.getElementById("p-faixa").value = primeiraVisivel.value;
    } else {
        document.getElementById("p-faixa").value = "";
    }
}









window.addEventListener('load', () => {
    renderListaNomes();
    
    // --- INICIALIZAR MODO SEM PACIENTE ---
    const paisReferencia = document.getElementById("pais_referencia");
    if (paisReferencia) {
        paisReferencia.addEventListener("change", atualizarFaixasPorPais);
        atualizarFaixasPorPais();
    }
    
    // --- INICIALIZAR MENU DA SIDEBAR ---
    const paisMenu = document.getElementById("p-pais");
    if (paisMenu) {
        paisMenu.addEventListener("change", atualizarFaixasPorPaisMenu);
        // 🔴 ADICIONAR ESTA LINHA: inicializar sem opções visíveis
        atualizarFaixasPorPaisMenu();
    }
    
    // Tema
    if (localStorage.getItem('tema') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
});