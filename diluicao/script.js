// --- TEMA ---
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

// Sincronizar Label da Dose
document.getElementById('massa_unidade').addEventListener('change', function() {
    document.getElementById('label_unidade_dinamica').innerText = this.value;
});


const volume = document.getElementById("vol_valor");
const massa = document.getElementById("massa_valor");

// --- CÁLCULO ---
function calcularDiluicao() {
    const res = document.getElementById("resultado");
    const m_val = parseFloat(document.getElementById("massa_valor").value);
    const m_uni = document.getElementById("massa_unidade").value;
    const v_val = parseFloat(document.getElementById("vol_valor").value);
    const v_uni = document.getElementById("vol_unidade").value;
    const dose = parseFloat(document.getElementById("dose_indicada").value);
    const caixaMestre = document.getElementById("caixa_mestre");


    // Reset Animação
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
    massa.style.borderBottom = "2px solid var(--primary)";
    volume.style.borderBottom = "2px solid var(--primary)";

    // Validação de erro
    if (isNaN(m_val) || isNaN(v_val)) {
        volume.style.borderBottom = "2px solid #f44336";
        massa.style.borderBottom = "2px solid #f44336";
        res.innerHTML = "Preencha a Massa e a Capacidade!";
        res.style.background = "#f44336";
        res.style.display = "block";
        return;
    }

    // Normalização (Internal calculation in mg and ml)
    let m_mg = (m_uni === "g") ? m_val * 1000 : m_val;
    let v_ml = (v_uni === "l") ? v_val * 1000 : v_val;

    const concentracao = m_mg / v_ml;

    let html = `<b>Resultado:</b><br>`;
    html += `<div style="margin-top:10px">• Concentração: <b>${concentracao.toFixed(2)} ${m_uni}/ml</b></div>`;

    if (!isNaN(dose)) {
        let dose_mg = (m_uni === "g") ? dose * 1000 : dose;
        const volume_final = dose_mg / concentracao;
        
        html += `<hr style="margin:10px 0; opacity:0.2;">`;
        html += `<div style="text-align:center;">Administrar:<br>`;
        html += `<b style="font-size:1.4rem;">${volume_final.toFixed(2)} ml</b></div>`;
    }

    res.innerHTML = html;
    res.style.background = "var(--primary)";
    res.style.display = "block";
}

function limparDiluicao() {
    ["massa_valor", "vol_valor", "dose_indicada"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("resultado").style.display = "none";
    volume.style.borderBottom = "2px solid var(--primary)";
    massa.style.borderBottom = "2px solid var(--primary)";
    
}


function retirar_bordas(){
    const camposObrigatorios = [massa, volume];
    camposObrigatorios.forEach(campo => {
        campo.addEventListener("input", function(){
            if (this.value.trim() !== ""){
                this.style.borderBottom = "solid 2px var(--primary)";
            }
        })
    });
};

massa.addEventListener("input", retirar_bordas);
volume.addEventListener("input", retirar_bordas);

window.addEventListener('load', () => {
    if (localStorage.getItem('tema') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
});