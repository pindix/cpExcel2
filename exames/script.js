const examesDB = {
    "Glicémia": { min: 70, max: 99, unit: "mg/dL" },
    "Ureia": { min: 15, max: 45, unit: "mg/dL" },
    "Creatinina": { min: 0.6, max: 1.2, unit: "mg/dL" }
};

// Autocomplete e Unidade
function filtrarExames() {
    const input = document.getElementById("exame_nome");
    const box = document.getElementById("sugestoes_box");
    const uniTag = document.getElementById("unidade_display");
    const termo = input.value.toLowerCase();
    
    box.innerHTML = "";
    if (!termo) { box.style.display = "none"; return; }

    const filtrados = Object.keys(examesDB).filter(n => n.toLowerCase().includes(termo));
    filtrados.forEach(nome => {
        const d = document.createElement("div");
        d.className = "sugestao-item";
        d.textContent = nome;
        d.onclick = () => {
            input.value = nome;
            uniTag.textContent = examesDB[nome].unit;
            box.style.display = "none";
        };
        box.appendChild(d);
    });
    box.style.display = filtrados.length ? "block" : "none";
}

// Analisar com V ou X e Referência
function analisar() {
    const nome = document.getElementById("exame_nome").value;
    const valor = parseFloat(document.getElementById("exame_valor").value);
    const res = document.getElementById("resultado");
    const ref = examesDB[nome];

    if (!ref || isNaN(valor)) return;

    const eNormal = valor >= ref.min && valor <= ref.max;
    const icone = eNormal ? 'ri-check-line' : 'ri-close-line';
    const cor = eNormal ? "var(--primary)" : "#f44336";

    res.innerHTML = `
        <i class="${icone} res-icon"></i>
        <b>${eNormal ? 'NORMAL' : 'ALTERADO'}</b><br>
        <small>Referência: ${ref.min} - ${ref.max} ${ref.unit}</small>
    `;

    res.style.background = cor;
    res.style.display = "block";
    
    // Vibração original do teu modelo
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
}

function limpar() {
    document.getElementById("exame_nome").value = "";
    document.getElementById("exame_valor").value = "";
    document.getElementById("unidade_display").textContent = "--";
    document.getElementById("resultado").style.display = "none";
}

// Tema (Teu original)
document.getElementById('themeBtn').addEventListener('click', () => {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        icon.className = 'ri-moon-line';
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.className = 'ri-sun-line';
    }
});