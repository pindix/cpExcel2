// ============================================================================
// 1. CONFIGURAÇÕES GLOBAIS
// ============================================================================

const DOM = {
    customSelect: document.getElementById("customSelect"),
    customSelectTrigger: document.getElementById("customSelectTrigger"),
    customSelectDropdown: document.getElementById("customSelectDropdown"),
    customSelectValue: document.getElementById("customSelectValue"),
    customSelectOptions: document.querySelectorAll(".custom-select-option"),
    
    dumInput: document.getElementById("dum_data"),
    dppInput: document.getElementById("dpp_data"),
    igSemanas: document.getElementById("ig_semanas"),
    igDias: document.getElementById("ig_dias"),
    auInput: document.getElementById("altura_uterina"),
    dumField: document.getElementById("dumField"),
    modoCampos: document.querySelectorAll(".modo-campos"),
    
    toggleModo: document.getElementById("toggleModo"),
    toggleContainer: document.getElementById("toggleContainer"),
    toggleNaoSeiDum: document.getElementById("toggleNaoSeiDum"),
    camposSemana: document.getElementById("camposSemana"),
    
    intervaloValores: document.querySelectorAll(".intervalo-valor"),
    intervaloMenos: document.getElementById("intervaloMenos"),
    intervaloMais: document.getElementById("intervaloMais"),
    
    btnCalcular: document.getElementById("btnCalcular"),
    limpar: document.getElementById("limpador"),
    resultado: document.getElementById("resultado"),
    
    themeBtn: document.getElementById("themeBtn"),
    themeIcon: document.getElementById("themeIcon"),
};

// ============================================================================
// 2. ESTADO GLOBAL
// ============================================================================

let estado = {
    modoSelecionado: "dum",
    intervaloAtual: 28,
    isCicloAtivo: false,
    isNaoSeiDum: false,
    modosComToggle: ["dum", "ig", "dpp"],
};

// ============================================================================
// 3. TEMA ESCURO/CLARO
// ============================================================================

const body = document.body;

if (localStorage.getItem("tema") === "dark") {
    body.setAttribute("data-theme", "dark");
    if (DOM.themeIcon) DOM.themeIcon.className = "ri-sun-line";
}

DOM.themeBtn.addEventListener("click", () => {
    const isDark = body.getAttribute("data-theme") === "dark";
    if (isDark) {
        body.removeAttribute("data-theme");
        document.documentElement.removeAttribute("data-theme");
        DOM.themeIcon.className = "ri-moon-line";
        localStorage.setItem("tema", "light");
    } else {
        body.setAttribute("data-theme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        DOM.themeIcon.className = "ri-sun-line";
        localStorage.setItem("tema", "dark");
    }
});

// ============================================================================
// 4. SELECT PERSONALIZADO DE MODO
// ============================================================================

let modoAtual = 'dum';

function toggleModoSelect() {
    const options = document.getElementById('modoOptions');
    const trigger = document.querySelector('#customSelect .custom-select-trigger');
    
    if (!options || !trigger) return;
    
    options.classList.toggle('aberto');
    trigger.classList.toggle('aberto');
}

function selecionarModo(valor) {
    modoAtual = valor;
    
    const modoSelecionado = document.getElementById('modoSelecionado');
    const opcoes = document.querySelectorAll('#modoOptions .custom-select-option');
    const trigger = document.querySelector('#customSelect .custom-select-trigger');
    
    opcoes.forEach(opt => {
        opt.classList.remove('selecionado');
        if (opt.dataset.value === valor) {
            opt.classList.add('selecionado');
            const titulo = opt.querySelector('.option-titulo')?.textContent || valor;
            const icone = opt.querySelector('i')?.className || '';
            modoSelecionado.innerHTML = `<i class="${icone}"></i> ${titulo}`;
        }
    });
    
    const options = document.getElementById('modoOptions');
    if (options) options.classList.remove('aberto');
    if (trigger) trigger.classList.remove('aberto');
    
    estado.modoSelecionado = valor;
    atualizarModo(valor);
    limparObstetricia();
}

document.addEventListener('click', function(event) {
    const select = document.getElementById('customSelect');
    if (!select) return;
    
    const isClickInside = select.contains(event.target);
    if (!isClickInside) {
        const options = document.getElementById('modoOptions');
        const trigger = document.querySelector('#customSelect .custom-select-trigger');
        if (options) options.classList.remove('aberto');
        if (trigger) trigger.classList.remove('aberto');
    }
});

function inicializarModoSelect() {
    const opcaoPadrao = document.querySelector('#modoOptions .custom-select-option[data-value="dum"]');
    if (opcaoPadrao) {
        opcaoPadrao.classList.add('selecionado');
        const modoSelecionado = document.getElementById('modoSelecionado');
        if (modoSelecionado) {
            const titulo = opcaoPadrao.querySelector('.option-titulo')?.textContent || 'Trabalhar com DUM';
            const icone = opcaoPadrao.querySelector('i')?.className || '';
            modoSelecionado.innerHTML = `<i class="${icone}"></i> ${titulo}`;
        }
    }
}

// ============================================================================
// 5. ATUALIZAR MODO
// ============================================================================

function atualizarModo(modo) {
    if (estado.modoSelecionado === "dum" && modo !== "dum") {
        DOM.toggleNaoSeiDum.checked = false;
        estado.isNaoSeiDum = false;
        DOM.camposSemana.classList.remove("ativo");
        DOM.camposSemana.style.display = "none";
        DOM.dumField.classList.remove("oculto");
        DOM.toggleModo.checked = false;
        estado.isCicloAtivo = false;
    }
    
    DOM.modoCampos.forEach((campo) => {
        const modoCampo = campo.getAttribute("data-modo");
        campo.classList.remove("active");
        if (modoCampo === modo) {
            campo.classList.add("active");
        }
    });
    
    estado.modoSelecionado = modo;
    
    const deveMostrarToggle = (modo === "dum") && !estado.isNaoSeiDum;
    DOM.toggleContainer.classList.toggle("oculto", !deveMostrarToggle);
    
    if (modo === "dum") {
        DOM.toggleNaoSeiDum.closest(".toggle-naosei-container").style.display = "flex";
    } else {
        DOM.toggleNaoSeiDum.closest(".toggle-naosei-container").style.display = "none";
    }
    
    atualizarTextoBotao();
}

// ============================================================================
// 6. TOGGLE "NÃO SEI A DUM"
// ============================================================================

DOM.toggleNaoSeiDum.addEventListener("change", function() {
    estado.isNaoSeiDum = this.checked;
    
    if (this.checked) {
        DOM.camposSemana.classList.add("ativo");
        DOM.camposSemana.style.display = "grid";
        DOM.dumField.classList.add("oculto");
        DOM.toggleContainer.classList.add("oculto");
        DOM.toggleModo.checked = false;
        estado.isCicloAtivo = false;
    } else {
        DOM.camposSemana.classList.remove("ativo");
        DOM.camposSemana.style.display = "none";
        DOM.dumField.classList.remove("oculto");
        if (estado.modoSelecionado === "dum") {
            DOM.toggleContainer.classList.remove("oculto");
        }
    }
    
    atualizarTextoBotao();
});

// ============================================================================
// 7. TOGGLE HORIZONTAL
// ============================================================================

DOM.toggleModo.addEventListener("change", function() {
    estado.isCicloAtivo = this.checked;
    atualizarTextoBotao();
});

// ============================================================================
// 8. ATUALIZAR TEXTO DO BOTÃO
// ============================================================================

function atualizarTextoBotao() {
    const modo = estado.modoSelecionado;
    const isCiclo = estado.isCicloAtivo;
    const isNaoSei = estado.isNaoSeiDum;
    let texto = "Calcular";
    
    switch(modo) {
        case "dum":
            texto = isNaoSei ? "Estimar DPP e IG" : (isCiclo ? "Calcular Ciclo" : "Calcular DPP e IG");
            break;
        case "ig":
            texto = "Calcular DUM";
            break;
        case "dpp":
            texto = "Calcular DUM";
            break;
        case "au":
            texto = "Estimar IG";
            break;
    }
    
    DOM.btnCalcular.textContent = texto;
}

// ============================================================================
// 9. INTERVALO - CARROSSEL (21-31)
// ============================================================================

function initIntervalo() {
    const container = document.getElementById("intervaloValores");
    const btnMenos = document.getElementById("intervaloMenos");
    const btnMais = document.getElementById("intervaloMais");
    
    if (!container || !btnMenos || !btnMais) return;
    
    const wrapper = container.parentElement;
    const valores = Array.from(container.querySelectorAll(".intervalo-valor"));
    if (valores.length === 0) return;
    
    let indiceAtivo = valores.findIndex(el => el.classList.contains("ativo"));
    if (indiceAtivo === -1) indiceAtivo = 7;
    
    const total = valores.length;
    let visiveis = 6;
    let passo = 0;
    
    function atualizarCarrossel() {
        valores.forEach((el, idx) => {
            el.classList.toggle("ativo", idx === indiceAtivo);
        });
        
        btnMais.disabled = (indiceAtivo === total - 1);
        
        const wrapperWidth = wrapper.getBoundingClientRect().width;
        const primeiroItem = valores[0];
        const larguraItem = primeiroItem.getBoundingClientRect().width;
        const estiloPai = window.getComputedStyle(container);
        const gap = parseFloat(estiloPai.gap) || 2;
        passo = larguraItem + gap;
        
        visiveis = Math.floor(wrapperWidth / passo);
        if (visiveis < 3) visiveis = 3;
        if (visiveis > total) visiveis = total;
        
        const centroDesejado = (visiveis - 1) / 2;
        let offset = indiceAtivo - centroDesejado;
        
        const minOffset = 0;
        const maxOffset = Math.max(0, total - visiveis);
        offset = Math.max(minOffset, Math.min(maxOffset, offset));
        
        const deslocamento = -(offset * passo);
        container.style.transform = `translateX(${deslocamento}px)`;
        
        const valorSelecionado = parseInt(valores[indiceAtivo].getAttribute("data-valor"));
        if (!isNaN(valorSelecionado)) {
            estado.intervaloAtual = valorSelecionado;
        }
    }
    
    btnMenos.addEventListener("click", function(e) {
        e.preventDefault();
        if (indiceAtivo > 0) {
            indiceAtivo--;
            atualizarCarrossel();
        }
    });
    
    btnMais.addEventListener("click", function(e) {
        e.preventDefault();
        if (indiceAtivo < total - 1) {
            indiceAtivo++;
            atualizarCarrossel();
        }
    });
    
    valores.forEach((elemento, idx) => {
        elemento.addEventListener("click", function(e) {
            e.preventDefault();
            indiceAtivo = idx;
            atualizarCarrossel();
        });
    });
    
    wrapper.addEventListener("wheel", function(e) {
        e.preventDefault();
        const delta = e.deltaY || e.deltaX;
        
        if (delta > 0) {
            if (indiceAtivo < total - 1) { indiceAtivo++; atualizarCarrossel(); }
        } else if (delta < 0) {
            if (indiceAtivo > 0) { indiceAtivo--; atualizarCarrossel(); }
        }
    }, { passive: false });
    
    let startX = 0;
    let isDragging = false;
    
    wrapper.addEventListener("mousedown", function(e) {
        startX = e.clientX;
        isDragging = true;
        wrapper.style.cursor = "grabbing";
    });
    
    window.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        const diff = startX - e.clientX;
        const threshold = 30;
        
        if (diff > threshold && indiceAtivo < total - 1) {
            indiceAtivo++;
            atualizarCarrossel();
            isDragging = false;
            wrapper.style.cursor = "default";
        } else if (diff < -threshold && indiceAtivo > 0) {
            indiceAtivo--;
            atualizarCarrossel();
            isDragging = false;
            wrapper.style.cursor = "default";
        }
    });
    
    window.addEventListener("mouseup", function() {
        if (isDragging) {
            isDragging = false;
            wrapper.style.cursor = "default";
        }
    });
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    wrapper.addEventListener("touchstart", function(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });
    
    wrapper.addEventListener("touchmove", function(e) {
        const touch = e.touches[0];
        const diffX = touchStartX - touch.clientX;
        const diffY = touchStartY - touch.clientY;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            e.preventDefault();
            const threshold = 20;
            if (diffX > threshold && indiceAtivo < total - 1) {
                indiceAtivo++;
                atualizarCarrossel();
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            } else if (diffX < -threshold && indiceAtivo > 0) {
                indiceAtivo--;
                atualizarCarrossel();
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            }
        }
    }, { passive: false });
    
    setTimeout(atualizarCarrossel, 100);
    
    let timer;
    window.addEventListener("resize", function() {
        clearTimeout(timer);
        timer = setTimeout(atualizarCarrossel, 200);
    });
    
    document.addEventListener("menuToggled", function() {
        setTimeout(atualizarCarrossel, 300);
    });
    
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(atualizarCarrossel, 150);
        });
        resizeObserver.observe(wrapper);
    }
    
    window.atualizarIntervalo = function(novoIndice) {
        if (novoIndice >= 0 && novoIndice < total) {
            indiceAtivo = novoIndice;
            atualizarCarrossel();
        }
    };
}

// ============================================================================
// 10. LIMPAR
// ============================================================================
function limparObstetricia() {
    DOM.dumInput.value = "";
    DOM.dppInput.value = "";
    DOM.igSemanas.value = "";
    DOM.igDias.value = "";
    DOM.auInput.value = "";
    DOM.resultado.innerHTML = "";
    
    const painel = document.getElementById('detalhesMedicosPainel');
    const scroll = document.getElementById('detalhesMedicosScroll');
    if (painel) {
        painel.classList.remove('aberto');
        painel.style.display = 'none';
    }
    if (scroll) scroll.innerHTML = '';
    
    atualizarTextoBotao();
}
// ============================================================================
// 11. FUNÇÕES DE UTILIDADE - DATAS
// ============================================================================

function formatarData(data, formato = 'completo') {
    if (!data || isNaN(data.getTime())) return 'Data inválida';
    
    const diasSemana = { 0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta', 6: 'Sábado' };
    const diasSemanaCurto = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };
    const meses = { 0: 'janeiro', 1: 'fevereiro', 2: 'março', 3: 'abril', 4: 'maio', 5: 'junho', 6: 'julho', 7: 'agosto', 8: 'setembro', 9: 'outubro', 10: 'novembro', 11: 'dezembro' };
    
    const dia = data.getDate();
    const mes = data.getMonth();
    const ano = data.getFullYear();
    const diaSemana = data.getDay();
    
    const nomeDia = diasSemana[diaSemana];
    const nomeDiaCurto = diasSemanaCurto[diaSemana];
    const nomeMes = meses[mes];
    const nomeMesCurto = nomeMes.substring(0, 3);
    
    switch (formato) {
        case 'completo': return `${nomeDia}, ${dia} de ${nomeMes} de ${ano}`;
        case 'curto': return `${nomeDiaCurto}, ${dia} de ${nomeMesCurto} de ${ano}`;
        case 'numero': 
            const diaStr = String(dia).padStart(2, '0');
            const mesStr = String(mes + 1).padStart(2, '0');
            return `${diaStr}/${mesStr}/${ano}`;
        case 'mes_ano': return `${nomeMes} de ${ano}`;
        case 'dia_mes': return `${dia} de ${nomeMes}`;
        default: return `${nomeDia}, ${dia} de ${nomeMes} de ${ano}`;
    }
}

function calcularIdadeGestacional(dum) {
    const hoje = new Date();
    const diff = hoje - dum;
    const totalDias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(totalDias / 7);
    const dias = totalDias % 7;
    return { semanas, dias, totalDias };
}

function calcularDPP(dum, ciclo) {
    const ajusteCiclo = ciclo - 28;
    const dpp = new Date(dum);
    dpp.setDate(dpp.getDate() + 280 + ajusteCiclo);
    return dpp;
}

function calcularDUMporDPP(dpp) {
    const dum = new Date(dpp);
    dum.setDate(dum.getDate() - 280);
    return dum;
}

function calcularDUMporIG(semanas, dias) {
    const hoje = new Date();
    const totalDias = (semanas * 7) + dias;
    const dum = new Date(hoje);
    dum.setDate(dum.getDate() - totalDias);
    return dum;
}

function estimarIGporAU(au) {
    const semanas = Math.round(au);
    const dias = Math.round((au - semanas) * 7);
    return { semanas, dias };
}

function obterPrecisaoAU(au) {
    if (au >= 12 && au <= 20) {
        return { nivel: 'moderada', texto: 'Precisão moderada (12-20 semanas)', aviso: 'A altura uterina é menos precisa no 1º trimestre.' };
    } else if (au > 20 && au <= 32) {
        return { nivel: 'boa', texto: '✅ Precisão boa (20-32 semanas)', aviso: 'Variação de ±2 semanas é esperada.' };
    } else if (au > 32 && au <= 40) {
        return { nivel: 'reduzida', texto: 'Precisão reduzida (32-40 semanas)', aviso: 'A altura uterina pode ser afetada pela posição fetal.' };
    }
    return { nivel: 'desconhecida', texto: 'Fora do intervalo recomendado', aviso: 'A altura uterina deve estar entre 12 e 40 cm.' };
}

function animarResultado() {
    const el = DOM.resultado;
    el.classList.remove("vibrar");
    void el.offsetWidth;
    el.classList.add("vibrar");
}

function animardetalhes() {
    const painel = document.getElementById('detalhesMedicosPainel');
    const el = painel;
    el.classList.remove("vibrar");
    void el.offsetWidth;
    el.classList.add("vibrar");
}

function mostrarErro(mensagem) {
    DOM.resultado.innerHTML = `
        <div class="erro-global">
            <i class="ri-error-warning-fill"></i>
            <span>${mensagem}</span>
        </div>
    `;
    animarResultado();
}

// ============================================================================
// 12. FUNÇÕES PARA DETALHES MÉDICOS
// ============================================================================

function calcularDiasRestantes(dpp) {
    const hoje = new Date();
    const diff = dpp - hoje;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function classificarFeto(semanas) {
    if (semanas < 37) return { label: 'Pré-termo', classe: 'alerta', emoji: '⚠️' };
    if (semanas >= 37 && semanas <= 40) return { label: 'Termo', classe: 'sucesso', emoji: '✅' };
    if (semanas > 40 && semanas <= 42) return { label: 'Pós-termo (até 42s)', classe: 'atencao', emoji: '📌' };
    if (semanas > 42) return { label: 'Pós-termo (>42s)', classe: 'perigo', emoji: '🚨' };
}

function obterExamesPorIG(semanas) {
    const exames = [
        { nome: 'Beta-HCG / USG transvaginal', periodo: '≤ 8s', icone: 'ri-microscope-line', inicio: 0, fim: 8, alerta: 2 },
        { nome: 'USG 1º Trimestre (Translucência Nucal)', periodo: '10–13s', icone: 'ri-heart-pulse-line', inicio: 10, fim: 13, alerta: 2 },
        { nome: 'Biópsia de Vilosidades (se indicado)', periodo: '11–14s', icone: 'ri-test-tube-line', inicio: 11, fim: 14, alerta: 2 },
        { nome: 'Teste do Pezinho', periodo: '16–18s', icone: 'ri-footprint-line', inicio: 16, fim: 18, alerta: 2 },
        { nome: 'USG Morfológico 2º Trimestre', periodo: '20–24s', icone: 'ri-baby-line', inicio: 20, fim: 24, alerta: 2 },
        { nome: 'Teste de Tolerância à Glicose (TTG)', periodo: '24–28s', icone: 'ri-droplet-line', inicio: 24, fim: 28, alerta: 2 },
        { nome: 'USG 3º Trimestre (Crescimento)', periodo: '28–32s', icone: 'ri-ruler-line', inicio: 28, fim: 32, alerta: 2 },
        { nome: 'Estreptococo B (Raspado Vaginal)', periodo: '35–37s', icone: 'ri-virus-line', inicio: 35, fim: 37, alerta: 2 },
        { nome: 'Cardiotocografia (CTG) semanal', periodo: '37–40s', icone: 'ri-heart-3-line', inicio: 37, fim: 40, alerta: 1 },
        { nome: 'Avaliar Indução do Parto', periodo: '> 41s', icone: 'ri-alert-line', inicio: 41, fim: 44, alerta: 0 }
    ];
    
    return exames.map(exame => {
        let status = 'pendente';
        let recomendado = false;
        let proximo = false;
        
        if (semanas >= exame.inicio && semanas <= exame.fim) {
            status = 'urgente';
            recomendado = true;
        } else if (semanas >= exame.inicio - exame.alerta && semanas < exame.inicio) {
            status = 'proximo';
            proximo = true;
        } else if (semanas > exame.fim && exame.fim < 41) {
            status = 'realizado';
        }
        
        return { ...exame, recomendado, proximo, status };
    });
}

function obterVacinasRecomendadas(semanas) {
    const obrigatorias = [
        { nome: 'dTpa (Coqueluche)', periodo: '27–36s', icone: 'ri-medicine-bottle-line', tipo: 'obrigatoria', ideal: semanas >= 27 && semanas <= 36, alerta: semanas >= 24 && semanas < 27 },
        { nome: 'Influenza (Gripe)', periodo: 'Qualquer trimestre (sazonal)', icone: 'ri-virus-line', tipo: 'obrigatoria', ideal: true, alerta: false },
        { nome: 'dT (Tétano)', periodo: '1ª consulta / reforço 10/10 anos', icone: 'ri-syringe-line', tipo: 'obrigatoria', ideal: true, alerta: false }
    ];
    
    const sugestoes = [
        { nome: 'COVID-19', periodo: 'Qualquer trimestre', icone: 'ri-covid-19-line', tipo: 'sugestao', ideal: true, alerta: false, nota: 'Conforme orientação do Ministério da Saúde' },
        { nome: 'Hepatite B', periodo: 'Se não vacinada/não imune', icone: 'ri-liver-line', tipo: 'sugestao', ideal: true, alerta: false, nota: 'Apenas se não vacinada anteriormente' },
        { nome: 'Meningite (ACWY)', periodo: 'Se grupo de risco', icone: 'ri-shield-line', tipo: 'sugestao', ideal: false, alerta: false, nota: 'Apenas para grupos específicos' }
    ];
    
    return { obrigatorias, sugestoes };
}

function obterSinaisAlerta() {
    return [
        { texto: 'Sangramento vaginal (qualquer quantidade)', urgencia: 'Procure ajuda imediata' },
        { texto: 'Perda de líquido (fluxo contínuo ou em jato)', urgencia: 'Procure ajuda imediata' },
        { texto: 'Contrações dolorosas (≥ 4 em 1 hora antes da 37s)', urgencia: 'Contacte o seu médico' },
        { texto: 'Diminuição dos movimentos fetais (<10 em 2h após 28s)', urgencia: 'Contacte o seu médico' },
        { texto: 'Cefaleia intensa + turvação visual', urgencia: 'Procure ajuda imediata' },
        { texto: 'Dor abdominal forte (localizada ou generalizada)', urgencia: 'Procure ajuda imediata' },
        { texto: 'Febre ≥ 38°C', urgencia: 'Contacte o seu médico' },
        { texto: 'Edema súbito (face/mãos)', urgencia: 'Contacte o seu médico' }
    ];
}

function obterPesoRecomendado() {
    return [
        { categoria: 'Baixo peso (<18,5)', total: '12,5–18 kg', semanal: '0,5–0,6 kg' },
        { categoria: 'Normal (18,5–24,9)', total: '11,5–16 kg', semanal: '0,4–0,5 kg' },
        { categoria: 'Sobrepeso (25–29,9)', total: '7–11,5 kg', semanal: '0,2–0,3 kg' },
        { categoria: 'Obesidade (≥30)', total: '5–9 kg', semanal: '0,2–0,3 kg' }
    ];
}

function calcularConsultasRecomendadas(semanas) {
    if (semanas < 13) return '1 consulta/mês';
    if (semanas < 28) return '2 consultas/mês';
    return '1 consulta/semana';
}

// ============================================================================
// 13. CALCULADORA DE GANHO DE PESO
// ============================================================================

function calcularGanhoPeso() {
    const imcInput = document.getElementById('peso_imc');
    const ganhoInput = document.getElementById('peso_atual');
    const container = document.getElementById('resultado_peso');
    
    if (!imcInput || !ganhoInput || !container) return;
    
    const imc = parseFloat(imcInput.value);
    const ganhoAtual = parseFloat(ganhoInput.value);
    
    if (!imc || !ganhoAtual || imc < 10 || imc > 60) {
        container.style.display = 'block';
        container.innerHTML = `
            <div class="resultado-peso-card alerta">
                <i class="ri-error-warning-line" style="color: #f59e0b;"></i>
                <div class="peso-detalhes">
                    <strong>Por favor, preencha ambos os campos</strong>
                    <div style="font-size: 0.7rem; opacity: 0.6;">IMC (10-60) e ganho atual em kg</div>
                </div>
            </div>
        `;
        return;
    }
    
    let categoria, totalRecomendado, semanalRecomendado, cor, icone;
    
    if (imc < 18.5) {
        categoria = 'Baixo peso';
        totalRecomendado = { min: 12.5, max: 18 };
        semanalRecomendado = { min: 0.5, max: 0.6 };
        cor = '#10b981';
        icone = 'ri-arrow-up-line';
    } else if (imc < 25) {
        categoria = 'Normal';
        totalRecomendado = { min: 11.5, max: 16 };
        semanalRecomendado = { min: 0.4, max: 0.5 };
        cor = 'var(--primary)';
        icone = 'ri-check-line';
    } else if (imc < 30) {
        categoria = 'Sobrepeso';
        totalRecomendado = { min: 7, max: 11.5 };
        semanalRecomendado = { min: 0.2, max: 0.3 };
        cor = '#f59e0b';
        icone = 'ri-arrow-right-line';
    } else {
        categoria = 'Obesidade';
        totalRecomendado = { min: 5, max: 9 };
        semanalRecomendado = { min: 0.2, max: 0.3 };
        cor = '#ef4444';
        icone = 'ri-arrow-down-line';
    }
    
    let avaliacao, classe;
    if (ganhoAtual < totalRecomendado.min) {
        avaliacao = `Abaixo do recomendado (mínimo: ${totalRecomendado.min} kg)`;
        classe = 'alerta';
        icone = 'ri-arrow-down-line';
        cor = '#f59e0b';
    } else if (ganhoAtual > totalRecomendado.max) {
        avaliacao = `Acima do recomendado (máximo: ${totalRecomendado.max} kg)`;
        classe = 'perigo';
        icone = 'ri-arrow-up-line';
        cor = '#ef4444';
    } else {
        avaliacao = '✅ Dentro do recomendado';
        classe = 'sucesso';
        icone = 'ri-check-line';
        cor = 'var(--primary)';
    }
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="resultado-peso-card ${classe}" style="border-left-color: ${cor};">
            <i class="${icone}" style="color: ${cor};"></i>
            <div class="peso-detalhes">
                <div>
                    <strong>${categoria}</strong>
                    <span style="font-size: 0.7rem; opacity: 0.6; margin-left: 8px;">(IMC: ${imc.toFixed(1)})</span>
                </div>
                <div class="peso-recomendado">
                    Ganho recomendado: ${totalRecomendado.min} – ${totalRecomendado.max} kg 
                    <span style="font-size: 0.65rem; opacity: 0.5;">(${semanalRecomendado.min}-${semanalRecomendado.max} kg/semana)</span>
                </div>
                <div style="font-size: 0.7rem; margin-top: 2px; font-weight: 600; color: ${cor};">
                    ${avaliacao} (atual: ${ganhoAtual.toFixed(1)} kg)
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// 14. TOGGLE DOS DETALHES MÉDICOS
// ============================================================================
function toggleDetalhesMedicos(btn) {
    const painel = document.getElementById('detalhesMedicosPainel');
    const scroll = document.getElementById('detalhesMedicosScroll');
    
    if (!painel || !scroll) return;
    if (!scroll.innerHTML.trim()) return;
    
    // 🔑 Escolhe o display correto consoante a largura da tela
    if (window.innerWidth >= 1024) {
        painel.style.display = 'flex';      // Desktop: flex para o scroll funcionar
    } else {
        painel.style.display = 'block';     // Mobile/tablet: block para não partir o layout
    }
    
    painel.classList.add('aberto');
    
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    animardetalhes();
}


function fecharDetalhesMedicos() {
    const painel = document.getElementById('detalhesMedicosPainel');
    if (!painel) return;
    painel.classList.remove('aberto');
    painel.style.display = 'none';
}

// ============================================================================
// 15. RENDERIZAR DETALHES MÉDICOS (conteúdo interno)
// ============================================================================

function renderizarDetalhesMedicos(semanas, dias, dpp, dum = null) {
    const diasRestantes = calcularDiasRestantes(dpp);
    const classificacao = classificarFeto(semanas);
    const exames = obterExamesPorIG(semanas);
    const vacinas = obterVacinasRecomendadas(semanas);
    const alertas = obterSinaisAlerta();
    const consultas = calcularConsultasRecomendadas(semanas);
    
    const examesProximos = exames.filter(e => e.proximo || e.recomendado);
    const examesFuturos = exames.filter(e => e.status === 'pendente' && !e.proximo && !e.recomendado);
    
    return `
        <div class="detalhes-secao">
            <div class="detalhes-secao-titulo">
                <i class="ri-bar-chart-2-line"></i>
                Indicadores Clínicos
            </div>
            
            <div class="detalhes-item">
                <span class="detalhes-item-label"><i class="ri-calendar-2-line"></i>Dias restantes para o parto</span>
                <span class="detalhes-item-valor ${diasRestantes > 0 ? 'destaque' : 'alerta'}">
                    ${diasRestantes > 0 ? `${diasRestantes} dias` : '✅ Data ultrapassada'}
                </span>
            </div>
            
            <div class="detalhes-item">
                <span class="detalhes-item-label"><i class="ri-baby-line"></i>Classificação do feto</span>
                <span class="detalhes-item-valor">
                    <span class="detalhes-badge ${classificacao.classe}">
                        ${classificacao.emoji} ${classificacao.label}
                    </span>
                </span>
            </div>
            
            <div class="detalhes-item">
                <span class="detalhes-item-label"><i class="ri-hospital-line"></i>Consultas recomendadas</span>
                <span class="detalhes-item-valor destaque">${consultas}</span>
            </div>
            
            ${dum ? `
            <div class="detalhes-item">
                <span class="detalhes-item-label"><i class="ri-calendar-event-line"></i>Semanas completas</span>
                <span class="detalhes-item-valor">${semanas} semanas + ${dias} dias</span>
            </div>
            ` : ''}
        </div>
        
        <div class="detalhes-secao">
            <div class="detalhes-secao-titulo">
                <i class="ri-flask-line"></i>
                Exames e Procedimentos
            </div>
            
            ${examesProximos.length > 0 ? `
                <div style="margin-bottom: 8px;">
                    <div style="font-size: 0.65rem; font-weight: 600; color: #f59e0b; margin-bottom: 4px;">
                        Próximos ou Recomendados
                    </div>
                    <div class="exames-grid">
                        ${examesProximos.map(exame => `
                            <div class="exame-item" style="${exame.recomendado ? 'border-left: 3px solid #ef4444' : ''};">
                                <i class="${exame.icone}" style="color: ${exame.recomendado ? '#ef4444' : 'var(--primary)'};"></i>
                                <span>${exame.nome}</span>
                                <span class="exame-periodo">${exame.periodo}</span>
                                <span class="exame-status ${exame.recomendado ? 'urgente' : 'pendente'}">
                                    ${exame.recomendado ? '⚠️ Agora' : 'Breve'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${examesFuturos.length > 0 ? `
                <div>
                    <div style="font-size: 0.65rem; font-weight: 600; opacity: 0.5; margin-bottom: 4px;">
                        📋 Próximos exames
                    </div>
                    <div class="exames-grid">
                        ${examesFuturos.slice(0, 3).map(exame => `
                            <div class="exame-item">
                                <i class="${exame.icone}" style="opacity: 0.4;"></i>
                                <span style="opacity: 0.6;">${exame.nome}</span>
                                <span class="exame-periodo">${exame.periodo}</span>
                                <span class="exame-status pendente">Agendar</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div class="detalhes-secao">
            <div class="detalhes-secao-titulo">
                <i class="ri-syringe-line"></i>
                Vacinas Recomendadas
            </div>
            
            <div style="margin-bottom: 8px;">
                <div style="font-size: 0.6rem; font-weight: 600; opacity: 0.4; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    <i class="ri-checkbox-circle-line"></i> Obrigatórias / Fortemente Recomendadas
                </div>
                ${vacinas.obrigatorias.map(vacina => `
                    <div class="vacina-item">
                        <i class="${vacina.icone}" style="color: var(--primary);"></i>
                        <div class="vacina-info">
                            <span class="vacina-nome">${vacina.nome}</span>
                            <span class="vacina-periodo">${vacina.periodo}</span>
                        </div>
                        <span class="vacina-status ${vacina.ideal ? 'ideal' : vacina.alerta ? 'alerta' : 'recomendada'}">
                            ${vacina.ideal ? '✅ Recomendada' : vacina.alerta ? '📌 Em breve' : '📋 Consultar'}
                        </span>
                    </div>
                `).join('')}
            </div>
            
            <div>
                <div style="font-size: 0.6rem; font-weight: 600; opacity: 0.4; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    <i class="ri-information-line"></i> Sugestões (casos específicos)
                </div>
                ${vacinas.sugestoes.map(vacina => `
                    <div class="vacina-item" style="opacity: 0.6;">
                        <i class="${vacina.icone}" style="opacity: 0.5;"></i>
                        <div class="vacina-info">
                            <span class="vacina-nome">${vacina.nome}</span>
                            <span class="vacina-periodo">${vacina.periodo}</span>
                            ${vacina.nota ? `<span style="font-size: 0.55rem; opacity: 0.5; display: block;">${vacina.nota}</span>` : ''}
                        </div>
                        <span class="vacina-status recomendada" style="opacity: 0.5;">${vacina.ideal ? 'Avaliar' : 'Consultar'}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="detalhes-secao">
            <div class="detalhes-secao-titulo">
                <i class="ri-weight-line"></i>
                Calculadora de Ganho de Peso
            </div>
            
            <div class="peso-calculadora">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <div class="entradas_de_dados floating-group" style="height: 44px;">
                        <i class="ri-weight-line"></i>
                        <input type="number" id="peso_imc" placeholder=" " step="0.1" min="10" max="60" style="padding-left: 35px; padding-top: 12px;">
                        <label class="label-flutuante" style="left: 35px;">IMC pré-gestacional</label>
                    </div>
                    <div class="entradas_de_dados floating-group" style="height: 44px;">
                        <i class="ri-arrow-up-down-line"></i>
                        <input type="number" id="peso_atual" placeholder=" " step="0.1" min="0" max="50" style="padding-left: 35px; padding-top: 12px;">
                        <label class="label-flutuante" style="left: 35px;">Ganho atual (kg)</label>
                    </div>
                </div>
                <button onclick="calcularGanhoPeso()" style="width: 100%; padding: 10px; background: var(--primary); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 0.8rem; transition: all 0.2s ease;">
                    <i class="ri-calculator-line"></i> Avaliar Ganho de Peso
                </button>
                <div id="resultado_peso" style="margin-top: 10px; display: none;"></div>
            </div>
        </div>
        
        <div class="detalhes-secao">
            <div class="detalhes-secao-titulo">
                <i class="ri-alert-line" style="color: #ef4444;"></i>
                Sinais de Alerta
            </div>
            
            <div class="alertas-lista">
                ${alertas.map(alerta => `
                    <div class="alerta-item">
                        <i class="ri-error-warning-line"></i>
                        <span class="alerta-texto">${alerta.texto}</span>
                        <span class="alerta-urgencia">${alerta.urgencia}</span>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 10px; padding: 10px 14px; background: rgba(239, 68, 68, 0.04); border-radius: 12px; font-size: 0.7rem; opacity: 0.6; text-align: center;">
                <i class="ri-information-line"></i>
                Estes sinais requerem avaliação médica imediata. Não hesite em contactar um profissional de saúde.
            </div>
        </div>
    `;
}

// ============================================================================
// 16. RENDERIZAR CARD DE PROGRESSO
// ============================================================================

function renderizarCardProgressoUnificado(semanas, dias, dpp, dum = null, isEstimado = false, tituloAdicional = null) {
    const percentual = Math.min((semanas / 40) * 100, 100);
    
    let trimestre = { nome: '', icone: '', cor: '' };
    if (semanas < 13) {
        trimestre = { nome: '1º Trimestre', icone: 'ri-seedling-line', cor: '#10b981' };
    } else if (semanas < 27) {
        trimestre = { nome: '2º Trimestre', icone: 'ri-heart-pulse-line', cor: '#f59e0b' };
    } else if (semanas < 37) {
        trimestre = { nome: '3º Trimestre', icone: 'ri-baby-line', cor: '#ef4444' };
    } else if (semanas <= 42) {
        trimestre = { nome: '✅ Feto a Termo', icone: 'ri-checkbox-circle-fill', cor: '#00843d' };
    } else {
        trimestre = { nome: 'Pós-Termo', icone: 'ri-error-warning-line', cor: '#f59e0b' };
    }
    
    const alertaPosTermo = (semanas >= 42 && semanas <= 44) ? `
        <div class="alerta-pos-termo" style="margin-top: 12px;">
            <i class="ri-alert-line"></i>
            <span>Gravidez pós-termo (≥ 42 semanas). Recomenda-se avaliação médica urgente.</span>
        </div>
    ` : '';
    
    const estimadoBadge = isEstimado ? '<span style="font-size: 0.6rem; margin-left: 8px;">[estimado]</span>' : '';
    
    // Preenche o painel lateral (mas NÃO abre — o utilizador abre com o botão)
    const painelScroll = document.getElementById('detalhesMedicosScroll');
    const painel = document.getElementById('detalhesMedicosPainel');
    if (painelScroll) {
        painelScroll.innerHTML = renderizarDetalhesMedicos(semanas, dias, dpp, dum);
    }
    // Fecha o painel ao recalcular
    if (painel) painel.classList.remove('aberto');
    
    let cardsHtml = '';
    
    if (dum) {
        cardsHtml += `
            <div class="card-resultado card-dum">
                <div class="card-icon"><i class="ri-calendar-event-line"></i></div>
                <div class="card-content">
                    <div class="card-label">Data da Última Menstruação</div>
                    <div class="card-valor">${formatarData(dum)}</div>
                    <div class="card-sub">${isEstimado ? 'Estimada com ±7 dias de margem' : 'Data confirmada'}</div>
                </div>
                <span class="card-badge">${isEstimado ? 'Estimativa' : '✓ Confirmada'}</span>
            </div>
        `;
    }
    
    cardsHtml += `
        <div class="card-resultado card-dpp">
            <div class="card-icon"><i class="ri-calendar-event-fill"></i></div>
            <div class="card-content">
                <div class="card-label">Data Provável do Parto</div>
                <div class="card-valor">${formatarData(dpp)}</div>
                <div class="card-sub">${isEstimado ? 'Estimada a partir da DUM' : 'Calculada pela Regra de Naegele'}</div>
            </div>
        </div>
    `;
    
    cardsHtml += `
        <div class="card-resultado card-ig">
            <div class="card-icon"><i class="ri-bar-chart-2-line"></i></div>
            <div class="card-content">
                <div class="card-label">Idade Gestacional</div>
                <div class="card-valor">${semanas} semanas ${dias > 0 ? `e ${dias} dias` : ''}</div>
                <div class="card-sub">${percentual.toFixed(0)}% da gestação concluída</div>
            </div>
            <span class="card-badge">${trimestre.nome.replace('✅ ', '')}</span>
        </div>
    `;
    
    const tituloExtra = tituloAdicional ? `
        <div style="text-align: center; margin-top: 8px; font-size: 0.7rem; opacity: 0.5;">
            ${tituloAdicional}
        </div>
    ` : '';
    
    const botaoDetalhes = `
        <button class="btn-abrir-detalhes" onclick="toggleDetalhesMedicos(this)">
            <span class="toggle-left">
                <i class="ri-stethoscope-line"></i>
                <span>Ver Detalhes Médicos</span>
            </span>
            <i class="ri-arrow-right-s-line toggle-icon"></i>
        </button>
    `;
    
    return `
        <div class="card-progresso">
            <div class="progresso-header">
                <div class="progresso-titulo">
                    <i class="ri-bar-chart-line"></i>
                    <span>Progresso da Gestação ${estimadoBadge}</span>
                </div>
                <div class="progresso-semanas">
                    ${semanas} semanas ${dias > 0 ? `e ${dias} dias` : ''}
                </div>
            </div>
            
            <div class="progresso-barra-wrapper">
                <div class="progresso-barra">
                    <div class="progresso-barra-preenchimento" style="width: ${percentual}%;"></div>
                </div>
                <div class="progresso-marcadores">
                    <span class="progresso-marcador ${semanas >= 13 ? 'ativo' : ''}">1º Tri</span>
                    <span class="progresso-marcador ${semanas >= 27 ? 'ativo' : ''}">2º Tri</span>
                    <span class="progresso-marcador ${semanas >= 37 ? 'ativo' : ''}">3º Tri</span>
                    <span class="progresso-marcador ${semanas >= 40 ? 'ativo' : ''}">Termo</span>
                </div>
            </div>
            
            <div class="trimestre-badge" style="background: ${trimestre.cor};">
                <i class="${trimestre.icone}"></i>
                <span>${trimestre.nome}</span>
            </div>
            
            ${alertaPosTermo}
            
            <div class="resultado-cards">
                ${cardsHtml}
            </div>
            
            ${tituloExtra}
            
            ${botaoDetalhes}
        </div>
    `;
}

// ============================================================================
// 17. CÁLCULO POR DUM
// ============================================================================

function calcularPorDUM(intervalo, isCicloAtivo) {
    const dumValue = DOM.dumInput.value;
    const hoje = new Date();
    
    if (estado.isNaoSeiDum) {
        const mes = parseInt(document.getElementById('mes_dum').value);
        const semana = parseInt(document.getElementById('semana_dum').value);
        const ano = parseInt(document.getElementById('ano_dum').value) || hoje.getFullYear();
        
        const dumEstimada = new Date(ano, mes, 1);
        const diaSemana = (semana - 1) * 7 + 4;
        dumEstimada.setDate(diaSemana);
        
        if (dumEstimada > hoje) {
            dumEstimada.setFullYear(ano - 1);
        }
        
        const dumFinal = dumEstimada;
        const gestacao = calcularIdadeGestacional(dumFinal);
        const dpp = calcularDPP(dumFinal, intervalo);
        
        if (gestacao.semanas > 44) {
            mostrarErro(`A data estimada resulta em uma gestação de ${gestacao.semanas} semanas.`);
            return null;
        }
        
        return `
            <div class="precisao-card aviso">
                <i class="ri-information-line"></i>
                <div>
                    <strong>Data estimada</strong>
                    <p>A DUM foi estimada com base na semana e ano informados. Margem de erro: ±7 dias.</p>
                </div>
            </div>
            ${renderizarCardProgressoUnificado(gestacao.semanas, gestacao.dias, dpp, dumFinal, true)}
        `;
    }
    
    if (!dumValue) {
        mostrarErro('Por favor, selecione a data da DUM!');
        return null;
    }
    
    const dum = new Date(dumValue);
    
    if (dum > hoje) {
        mostrarErro('A DUM não pode ser no futuro!');
        return null;
    }
    
    const gestacao = calcularIdadeGestacional(dum);
    const dpp = calcularDPP(dum, intervalo);
    
    if (gestacao.semanas > 44) {
        mostrarErro(`A data informada resulta em uma gestação de ${gestacao.semanas} semanas. As gestações normais variam até 42 semanas.`);
        return null;
    }
    
    if (isCicloAtivo) {
        const cicloInfo = calcularCicloMenstrual(dum, intervalo);
        return cicloInfo ? renderizarCardCiclo(cicloInfo) : `
            <div class="card-ciclo erro">
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px;">
                    <i class="ri-error-warning-line" style="color: #f59e0b; font-size: 1.5rem;"></i>
                    <span>Não foi possível calcular o ciclo. Verifique os dados.</span>
                </div>
            </div>
        `;
    }
    
    return renderizarCardProgressoUnificado(gestacao.semanas, gestacao.dias, dpp);
}

// ============================================================================
// 18. CÁLCULO POR IG
// ============================================================================

function calcularPorIG(intervalo, isCicloAtivo) {
    const semanas = parseInt(DOM.igSemanas.value) || 0;
    const dias = parseInt(DOM.igDias.value) || 0;
    
    if (semanas === 0 && dias === 0) {
        mostrarErro('Por favor, informe a idade gestacional!');
        return null;
    }
    
    if (semanas < 0 || semanas > 44) {
        mostrarErro('A IG deve estar entre 0 e 44 semanas!');
        return null;
    }
    
    if (dias < 0 || dias > 6) {
        mostrarErro('Os dias devem estar entre 0 e 6!');
        return null;
    }
    
    const dum = calcularDUMporIG(semanas, dias);
    const dpp = calcularDPP(dum, intervalo);
    
    return `
        <div class="precisao-card sucesso">
            <i class="ri-check-line"></i>
            <div>
                <strong>✅ Cálculo a partir da IG</strong>
                <p>A DUM foi calculada a partir da idade gestacional informada.</p>
            </div>
        </div>
        ${renderizarCardProgressoUnificado(semanas, dias, dpp, dum)}
    `;
}

// ============================================================================
// 19. CÁLCULO POR DPP
// ============================================================================

function calcularPorDPP(intervalo, isCicloAtivo) {
    const dppValue = DOM.dppInput.value;
    
    if (!dppValue) {
        mostrarErro('Por favor, selecione a data da DPP!');
        return null;
    }
    
    const dpp = new Date(dppValue);
    const hoje = new Date();
    const dum = calcularDUMporDPP(dpp);
    const estaNoIntervalo = hoje >= dum && hoje <= dpp;
    
    if (estaNoIntervalo) {
        const gestacao = calcularIdadeGestacional(dum);
        
        return `
            <div class="precisao-card sucesso">
                <i class="ri-check-line"></i>
                <div>
                    <strong>✅ Cálculo a partir da DPP</strong>
                    <p>A data atual está dentro do intervalo esperado.</p>
                </div>
            </div>
            ${renderizarCardProgressoUnificado(gestacao.semanas, gestacao.dias, dpp, dum)}
        `;
    }
    
    let motivo = '';
    let icone = '';
    let cor = '';
    
    if (hoje > dpp) {
        motivo = 'passado (a DPP já ocorreu)';
        icone = 'ri-calendar-close-line';
        cor = '#dc2626';
    } else if (hoje < dum) {
        motivo = 'futuro distante (a DUM ainda não ocorreu)';
        icone = 'ri-calendar-2-line';
        cor = '#2563eb';        
    } else {
        motivo = 'fora do intervalo esperado';
        icone = 'ri-error-warning-line';
        cor = '#d97706';         
    }
    
    return `
        <div class="precisao-card aviso">
            <i class="ri-error-warning-line"></i>
            <div>
                <strong>Não foi possível calcular o progresso</strong>
                <p>A data atual está no ${motivo}.</p>
            </div>
        </div>
        
        <div class="card-resultado card-dum" style="margin-top: 12px;">
            <div class="card-icon"><i class="ri-calendar-event-line"></i></div>
            <div class="card-content">
                <div class="card-label">Data da Última Menstruação</div>
                <div class="card-valor">${formatarData(dum)}</div>
                <div class="card-sub" style="color: ${cor}; font-weight: 800; opacity: 0.6;">
                    <i class="${icone}" style="margin-right: 4px;"></i>
                    Calculada a partir da DPP: ${formatarData(dpp)}
                </div>
            </div>
            <span class="card-badge" style="background: ${cor}15; color: ${cor};">
                ${hoje > dpp ? 'DPP passada' : hoje < dum ? 'DUM futura' : ' Fora do intervalo'}
            </span>
        </div>
    `;
}

// ============================================================================
// 20. CÁLCULO POR AU
// ============================================================================

function calcularPorAU(intervalo) {
    const au = parseFloat(DOM.auInput.value);
    
    if (!au || au <= 0) {
        mostrarErro('Por favor, informe a altura uterina!');
        return null;
    }
    
    if (au < 12 || au > 40) {
        mostrarErro('A altura uterina deve estar entre 12 e 40 cm!');
        return null;
    }
    
    const ig = estimarIGporAU(au);
    const precisao = obterPrecisaoAU(au);
    const dum = calcularDUMporIG(ig.semanas, ig.dias);
    const dpp = calcularDPP(dum, intervalo);
    
    return `
        <div class="precisao-card aviso">
            <i class="ri-information-line"></i>
            <div>
                <strong>Estimativa por Altura Uterina</strong>
                <p>${precisao.texto}. ${precisao.aviso}</p>
            </div>
        </div>
        ${renderizarCardProgressoUnificado(ig.semanas, ig.dias, dpp, dum, true, `Altura Uterina: ${au} cm`)}
    `;
}

// ============================================================================
// 21. CÁLCULO DO CICLO MENSTRUAL
// ============================================================================

function calcularCicloMenstrual(dum, ciclo) {
    if (!dum || !ciclo) return null;
    
    const hoje = new Date();
    const diffTime = hoje - dum;
    const diasDesdeDUM = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diasDesdeDUM < 0) return null;
    
    const proximasMenstruacoes = [];
    for (let i = 1; i <= 3; i++) {
        const data = new Date(dum);
        data.setDate(data.getDate() + (ciclo * i));
        proximasMenstruacoes.push(data);
    }
    
    const proximaMenstruacao = proximasMenstruacoes[0];
    const dataOvulacao = new Date(proximaMenstruacao);
    dataOvulacao.setDate(dataOvulacao.getDate() - 14);
    
    const inicioJanelaFertil = new Date(dataOvulacao);
    inicioJanelaFertil.setDate(inicioJanelaFertil.getDate() - 5);
    const fimJanelaFertil = new Date(dataOvulacao);
    fimJanelaFertil.setDate(fimJanelaFertil.getDate() + 1);
    
    const hojeDate = new Date(hoje);
    hojeDate.setHours(0, 0, 0, 0);
    
    const estaNoPeriodoFertil = hojeDate >= inicioJanelaFertil && hojeDate <= fimJanelaFertil;
    const estaNaOvulacao = hojeDate.toDateString() === dataOvulacao.toDateString();
    const diffProxima = proximaMenstruacao - hojeDate;
    const diasFaltam = Math.ceil(diffProxima / (1000 * 60 * 60 * 24));
    
    return {
        diasDesdeDUM,
        proximaMenstruacao: formatarData(proximaMenstruacao, 'completo'),
        diasFaltam,
        dataOvulacao: formatarData(dataOvulacao, 'completo'),
        inicioJanelaFertil: formatarData(inicioJanelaFertil),
        fimJanelaFertil: formatarData(fimJanelaFertil),
        estaNoPeriodoFertil,
        estaNaOvulacao,
        ciclo,
        proximasMenstruacoes: proximasMenstruacoes.map(d => formatarData(d, 'completo'))
    };
}

// ============================================================================
// 22. RENDERIZAR CARD DO CICLO MENSTRUAL
// ============================================================================

function renderizarCardCiclo(cicloInfo) {
    if (!cicloInfo) {
        return `
            <div class="card-ciclo erro">
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px;">
                    <i class="ri-error-warning-line" style="color: #f59e0b; font-size: 1.5rem;"></i>
                    <span>Não foi possível calcular o ciclo. Verifique os dados.</span>
                </div>
            </div>
        `;
    }
    
    let statusIcon = 'ri-check-line';
    let statusCor = '#00843d';
    let statusTexto = 'Ciclo regular';
    
    if (cicloInfo.estaNaOvulacao) {
        statusIcon = 'ri-flashlight-fill';
        statusCor = '#f59e0b';
        statusTexto = '🔴 Dia da Ovulação!';
    } else if (cicloInfo.estaNoPeriodoFertil) {
        statusIcon = 'ri-heart-3-fill';
        statusCor = '#ef4444';
        statusTexto = '❤️ Período Fértil';
    } else if (cicloInfo.diasFaltam <= 3 && cicloInfo.diasFaltam >= 0) {
        statusIcon = 'ri-rainy-line';
        statusCor = '#3b82f6';
        statusTexto = '🩸 Menstruação próxima';
    } else if (cicloInfo.diasFaltam < 0) {
        statusIcon = 'ri-error-warning-line';
        statusCor = '#ef4444';
        statusTexto = 'Ciclo atrasado';
    }
    
    return `
        <div class="card-ciclo">
            <div class="card-ciclo-header">
                <div class="card-ciclo-titulo">
                    <i class="ri-calendar-2-line"></i>
                    <span>Ciclo Menstrual</span>
                </div>
                <div class="card-ciclo-status" style="color: ${statusCor};">
                    <i class="${statusIcon}"></i>
                    <span>${statusTexto}</span>
                </div>
            </div>
            
            <div class="card-ciclo-periodicidade">
                <div class="periodicidade-item">
                    <span class="periodicidade-label">Intervalo</span>
                    <span class="periodicidade-valor">${cicloInfo.ciclo} dias</span>
                </div>
                <div class="periodicidade-item" style="gap: 3px;">
                    <span class="periodicidade-label">Próxima menstruação</span>
                    <span class="periodicidade-valor" style="font-size: 0.8rem;">${cicloInfo.proximaMenstruacao}</span>
                    <span class="periodicidade-dias">${cicloInfo.diasFaltam > 0 ? `(faltam ${cicloInfo.diasFaltam} dias)` : cicloInfo.diasFaltam === 0 ? '(hoje!)' : `(há ${Math.abs(cicloInfo.diasFaltam)} dias)`}</span>
                </div>
            </div>
            
            <div class="card-ciclo-previsoes">
                <div class="previsao-titulo">
                    <i class="ri-calendar-event-line"></i>
                    <span>Previsão das próximas menstruações</span>
                </div>
                <div class="previsao-lista">
                    ${cicloInfo.proximasMenstruacoes.map((data, index) => `
                        <div class="previsao-item ${index === 0 ? 'previsao-destaque' : ''}">
                            <span class="previsao-numero">${index + 1}º</span>
                            <span class="previsao-data">${data}</span>
                            ${index === 0 ? `<span class="previsao-badge">Próxima</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="card-ciclo-ovulacao">
                <div class="ciclo-item">
                    <span class="ciclo-item-label">📅 Data da ovulação</span>
                    <span class="ciclo-item-valor">${cicloInfo.dataOvulacao}</span>
                </div>
                <div class="ciclo-item" style="margin-top: 10px;">
                    <span class="ciclo-item-label">🌿 Período fértil</span>
                    <span class="ciclo-item-valor">${cicloInfo.inicioJanelaFertil} - ${cicloInfo.fimJanelaFertil}</span>
                </div>
            </div>
            
            <div class="card-ciclo-nota">
                <i class="ri-information-line"></i>
                <span>Este cálculo assume um ciclo regular de ${cicloInfo.ciclo} dias. Variações de até 7 dias são consideradas normais.</span>
            </div>
        </div>
    `;
}

// ============================================================================
// 23. FUNÇÃO PRINCIPAL DE CÁLCULO
// ============================================================================

function calcular() {
    const modo = estado.modoSelecionado;
    const isCicloAtivo = estado.isCicloAtivo;
    const intervalo = estado.intervaloAtual;
    
    let html = '';
    
    switch(modo) {
        case 'dum':
            html = calcularPorDUM(intervalo, isCicloAtivo);
            break;
        case 'ig':
            html = calcularPorIG(intervalo, isCicloAtivo);
            break;
        case 'dpp':
            html = calcularPorDPP(intervalo, isCicloAtivo);
            break;
        case 'au':
            html = calcularPorAU(intervalo);
            break;
        default:
            mostrarErro('Modo de cálculo não reconhecido!');
            return;
    }
    
    if (html) {
        DOM.resultado.innerHTML = html;
        animarResultado();
    }
}

// ============================================================================
// 24. EVENTOS E INICIALIZAÇÃO
// ============================================================================

DOM.btnCalcular.addEventListener('click', calcular);

document.querySelectorAll(".entradas_de_dados input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            calcular();
        }
    });
});

function init() {
    inicializarModoSelect();
    initIntervalo();
    atualizarModo("dum");
    atualizarTextoBotao();
}

// ============================================================================
// 25. MENU LATERAL
// ============================================================================

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
        document.dispatchEvent(new Event('menuToggled'));
    }

    function fecharMenu() {
        btnHamburger.classList.remove('ativo');
        menuOverlay.classList.remove('ativo');
        menuLateral.classList.remove('ativo');
        document.body.style.overflow = '';
        document.dispatchEvent(new Event('menuToggled'));
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

// ============================================================================
// 26. INICIALIZAÇÃO
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}



// Ajusta o display do painel se a janela for redimensionada
window.addEventListener('resize', () => {
    const painel = document.getElementById('detalhesMedicosPainel');
    if (!painel || !painel.classList.contains('aberto')) return;
    
    if (window.innerWidth >= 1024) {
        painel.style.display = 'flex';
    } else {
        painel.style.display = 'block';
    }
});