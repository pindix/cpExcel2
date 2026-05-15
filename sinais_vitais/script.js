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
const DB_VITALS = {
    "Angola": {
        "recem_nascido": { fc: [120, 160], fr: [40, 60], sis: [60, 90], dia: [20, 60], temp: [36.5, 37.5], sato2: [95, 100] },
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 130], dia: [60, 85], temp: [36.0, 37.2], sato2: [95, 100] }
    },
    "Portugal": {
        "adulto": { fc: [60, 100], fr: [12, 20], sis: [90, 129], dia: [60, 84], temp: [36.0, 37.2], sato2: [95, 100] }
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
    const paisRef = pacienteAtivo ? pacientes[pacienteAtivo].info.pais : document.getElementById("pais_referencia").value;
    const faixaRef = pacienteAtivo ? pacientes[pacienteAtivo].info.faixa : document.getElementById("faixa_etaria").value;

    const ref = DB_VITALS[paisRef][faixaRef] || DB_VITALS["Angola"]["adulto"];

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

    if (!nome) { alert("Insira o nome do paciente"); return; }

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
    
    lista.innerHTML = Object.keys(pacientes).map(nome => `
        <div class="perfil-item">
            <div class="perfil-info" onclick="selecionarPaciente('${nome.replace(/'/g, "\\'")}')">
                <strong>${nome}</strong>
                <span>${pacientes[nome].info.faixa.replace('_', ' ')} • ${pacientes[nome].info.pais}</span>
            </div>
            <button class="btn-remover-perfil" onclick="removerPerfil('${nome.replace(/'/g, "\\'")}')">
                <i class="ri-delete-bin-7-line"></i>
            </button>
        </div>
    `).join('');
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
    if (detalhesExibicao) detalhesExibicao.innerText = `${p.info.faixa.replace('_', ' ')} • ${p.info.pais}`;
    
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
    if (!pacienteAtivo || !pacientes[pacienteAtivo] || pacientes[pacienteAtivo].historico.length === 0) {
        alert("Adicione pelo menos uma medição ao histórico do paciente antes de exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const p = pacientes[pacienteAtivo];
    const hist = p.historico;

    // Criar um canvas temporário
    const canvasTemp = document.createElement('canvas');
    canvasTemp.width = 1200;
    canvasTemp.height = 600;
    canvasTemp.style.position = 'absolute';
    canvasTemp.style.left = '-9999px';
    canvasTemp.style.top = '-9999px';
    document.body.appendChild(canvasTemp);
    
    const ctx = canvasTemp.getContext('2d');
    
    // Limpar com fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasTemp.width, canvasTemp.height);
    
    // GRÁFICO COM FUNDO BRANCO, GRELHAS TRACEJADAS, TEXTOS MAIORES E EIXO X HORIZONTAL
// GRÁFICO COM FUNDO BRANCO, GRELHAS TRACEJADAS, TEXTOS AINDA MAIORES
window.chartPDF = new Chart(ctx, {
    type: 'line',
    data: {
        labels: hist.map(h => h.hora),
        datasets: [
            { 
                label: 'FC', 
                data: hist.map(h => h.fc || 0), 
                borderColor: '#00843d', 
                backgroundColor: 'transparent',
                tension: 0.3, 
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#00843d'
            },
            { 
                label: 'FR', 
                data: hist.map(h => h.fr || 0), 
                borderColor: '#2196F3', 
                backgroundColor: 'transparent',
                tension: 0.3, 
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#2196F3'
            },
            { 
                label: 'Temp', 
                data: hist.map(h => h.temp || 0), 
                borderColor: '#FF9800', 
                backgroundColor: 'transparent',
                tension: 0.3, 
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#FF9800'
            },
            { 
                label: 'SatO2', 
                data: hist.map(h => h.sato2 || 0), 
                borderColor: '#9C27B0', 
                backgroundColor: 'transparent',
                tension: 0.3, 
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#9C27B0'
            },
            { 
                label: 'Sistólica', 
                data: hist.map(h => h.sis || 0), 
                borderColor: '#f44336', 
                backgroundColor: 'transparent',
                tension: 0.3, 
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#f44336'
            },
            { 
                label: 'Diastólica',
                data: hist.map(h => h.dia || 0), 
                borderColor: '#E91E63', 
                backgroundColor: 'transparent',
                borderDash: [8, 5],
                tension: 0.3, 
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#E91E63'
            }
        ]
    },
    options: { 
        responsive: false, 
        animation: false,
        maintainAspectRatio: true,
        plugins: {
            tooltip: { enabled: true, titleFont: { size: 13 }, bodyFont: { size: 12 } },
            legend: { 
                position: 'bottom',
                labels: { 
                    boxWidth: 16, 
                    font: { size: 14, weight: 'bold' },
                    padding: 14
                } 
            }
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    drawBorder: true,
                    drawOnChartArea: true,
                    color: '#cccccc',
                    borderDash: [6, 4],
                    lineWidth: 0.5
                },
                ticks: { 
                    font: { size: 20, weight: 'bold' },  // Aumentado para 13 negrito
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 5
                },
                title: { 
                    display: true, 
                    text: 'Horário das Medições', 
                    font: { size: 30, weight: 'bold' },
                    padding: 12
                }
            },
            y: {
                grid: {
                    display: true,
                    drawBorder: true,
                    drawOnChartArea: true,
                    color: '#cccccc',
                    borderDash: [6, 4],
                    lineWidth: 0.5
                },
                ticks: { 
                    font: { size: 20, weight: 'bold' },  // Aumentado para 13 negrito
                    stepSize: 20
                },
                title: { 
                    display: true, 
                    text: 'Valores', 
                    font: { size: 30, weight: 'bold' },
                    padding: 12
                }
            }
        },
        layout: {
            padding: { top: 20, bottom: 20, left: 15, right: 15 }
        }
    }
});
    // Aguardar renderização
    await new Promise(resolve => setTimeout(resolve, 500));
    const imgGrafico = canvasTemp.toDataURL('image/png');
    
    // Destruir gráfico e remover canvas temporário
    if (window.chartPDF) window.chartPDF.destroy();
    document.body.removeChild(canvasTemp);
    
    // --- CONSTRUIR PDF ---
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
    doc.text(`Referência: ${p.info.pais} (${p.info.faixa.replace('_', ' ')})`, 15, 58);
    doc.text(`Data de emissão: ${new Date().toLocaleDateString()}`, 15, 64);
    
    // Gráfico
    doc.addImage(imgGrafico, 'PNG', 15, 72, 180, 80);
    
    // Tabela de histórico
    doc.autoTable({
        startY: 160,
        head: [['Data/Hora', 'FC', 'FR', 'Temp', 'SatO2', 'Sistólica', 'Diastólica']],
        body: hist.map(r => [
            `${r.data} ${r.hora}`, 
            `${r.fc || '-'} bpm`, 
            `${r.fr || '-'} ipm`, 
            `${r.temp || '-'}°C`, 
            `${r.sato2 || '-'}%`, 
            `${r.sis || '-'} mmHg`,
            `${r.dia || '-'} mmHg`
        ]),
        headStyles: { fillColor: [0, 132, 61] },
        theme: 'striped',
        margin: { bottom: 30 }
    });
    
    // Rodapé informativo
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
        "Este documento é informativo e gerado pela Mpindi TecMed. " +
        "Não substitui aconselhamento médico profissional.", 
        15, 
        finalY,
        { maxWidth: 180 }
    );
    
    // Guardar o PDF
    doc.save(`Relatorio_${pacienteAtivo}.pdf`);
}

// Inicializar ao carregar a página
window.addEventListener('load', () => {
    renderListaNomes();
    
    if (localStorage.getItem('tema') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
});