function ajustarInterface() {
    const modo = document.getElementById("modo_calculo").value;
    const label = document.getElementById("label_dinamica");
    const unidade = document.getElementById("unidade_dinamica");
    const icone = document.getElementById("icone_input");
    const input = document.getElementById("valor_entrada");

    input.value = ""; // Limpa ao trocar

    if (modo === "pesoParaIdade") {
        label.innerText = "Peso Atual (kg)";
        unidade.innerText = "kg";
        icone.className = "ri-scales-3-line";
    } else {
        label.innerText = "Idade da Criança";
        unidade.innerText = "anos";
        icone.className = "ri-calendar-line";
    }
}
function calcularAntropometria() {
    const modo = document.getElementById("modo_calculo").value;
    const valor = parseFloat(document.getElementById("valor_entrada").value);
    const res = document.getElementById("resultado");

    if (isNaN(valor) || valor <= 0) {
        res.innerHTML = "⚠️ Insira um valor válido.";
        res.style.background = "#f44336"; res.style.display = "block";
        return;
    }

    // --- BLOQUEIO DE SEGURANÇA ---
    if (modo === "pesoParaIdade" && valor > 50) {
        res.innerHTML = `
            <i class="ri-error-warning-fill res-icon"></i>
            <span class="res-titulo">Limite Excedido</span>
            <span class="res-sub">O peso inserido (>50kg) sugere um paciente adulto. Estas fórmulas são exclusivas para pediatria.</span>
        `;
        res.style.background = "#f44336"; res.style.display = "block";
        return;
    }

    if (modo === "idadeParaPeso" && valor > 14) {
        res.innerHTML = `
            <i class="ri-error-warning-fill res-icon"></i>
            <span class="res-titulo">Limite Excedido</span>
            <span class="res-sub">A idade inserida (>14 anos) não deve ser calculada por fórmulas de estimativa pediátrica.</span>
        `;
        res.style.background = "#f44336"; res.style.display = "block";
        return;
    }
    // ----------------------------

    let titulo = "";
    let subtitulo = "";

    if (modo === "pesoParaIdade") {
        if (valor < 10) {
            let meses = (valor * 2) - 9;
            titulo = `~ ${Math.max(0, meses).toFixed(0)} Meses`;
        } else if (valor <= 20) {
            titulo = `~ ${((valor - 8) / 2).toFixed(1)} Anos`;
        } else {
            // Até 50kg (limite validado acima)
            titulo = `~ ${((valor - 3) / 3).toFixed(1)} Anos`;
        }
        subtitulo = `Estimativa de idade para ${valor}kg`;
    } else {
        let pesoEstimado = 0;
        if (valor < 1) {
            pesoEstimado = (valor * 10 + 9) / 2; // Aproximação para meses em decimal
        } else if (valor <= 6) {
            pesoEstimado = (valor * 2) + 8;
        } else {
            // Até 14 anos (limite validado acima)
            pesoEstimado = (valor * 3) + 3;
        }
        titulo = `~ ${pesoEstimado.toFixed(1)} kg`;
        subtitulo = `Peso provável para ${valor} anos`;
    }

    res.innerHTML = `
        <i class="ri-checkbox-circle-fill res-icon"></i>
        <span class="res-titulo">${titulo}</span>
        <span class="res-sub">${subtitulo}</span>
    `;

    res.style.background = "var(--primary)";
    res.style.display = "block";
    res.classList.remove("vibrar");
    void res.offsetWidth;
    res.classList.add("vibrar");
}

// ... (ajustarInterface e limpar igual ao anterior)

function limparAntropometria() {
    document.getElementById("valor_entrada").value = "";
    document.getElementById("resultado").style.display = "none";
}

// Tema Escuro (Padrão Mpindi)
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

window.addEventListener('load', () => {
    if (localStorage.getItem('tema') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
});