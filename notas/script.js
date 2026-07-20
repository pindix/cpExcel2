// ============================================================================
// BLOCO DE NOTAS - SCRIPT COMPLETO (COM TÍTULOS E GRID)
// ============================================================================

const STORAGE_KEY = 'matclinica_notas';

let notas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let notaEditando = null;
let modoLista = false;

// ============================================================================
// ELEMENTOS DOM
// ============================================================================
const areaEdicao = document.getElementById('area-edicao');
const areaLista = document.getElementById('area-lista');
const listaNotas = document.getElementById('lista-notas');
const editorNota = document.getElementById('editor-nota');
const editorTitulo = document.getElementById('editor-titulo');
const editorStatus = document.getElementById('editor-status');
const editorData = document.getElementById('editor-data');

const btnNovaNota = document.getElementById('btn-nova-nota');
const btnListarNotas = document.getElementById('btn-listar-notas');
const btnSalvar = document.getElementById('btn-salvar');
const btnLimparTodas = document.getElementById('btn-limpar-todas');
const badgeContador = document.getElementById('badge-contador');

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

function salvarNotas() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
    atualizarBadge();
}

function atualizarBadge() {
    badgeContador.textContent = notas.length;
}

function formatarData(dataStr) {
    const data = new Date(dataStr);
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function gerarTituloPadrao() {
    const agora = new Date();
    const dia = agora.getDate().toString().padStart(2, '0');
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    return `📌 Nota ${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function copiarTexto(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarFeedback('✅ Nota copiada!');
        }).catch(() => fallbackCopiar(texto));
    } else {
        fallbackCopiar(texto);
    }
}

function fallbackCopiar(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    mostrarFeedback('✅ Nota copiada!');
}

function mostrarFeedback(mensagem) {
    const feedback = document.createElement('div');
    feedback.textContent = mensagem;
    feedback.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary);
        color: white;
        padding: 12px 24px;
        border-radius: 20px;
        font-size: 0.85rem;
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    `;
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transition = 'opacity 0.3s';
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// ============================================================================
// MOSTRAR/ESCONDER MODOS
// ============================================================================

function mostrarEditor(notaIndex = null) {
    modoLista = false;
    areaLista.style.display = 'none';
    areaEdicao.style.display = 'flex';
    btnNovaNota.classList.add('active');
    btnListarNotas.classList.remove('active');
    btnSalvar.style.display = 'flex';
    
    notaEditando = notaIndex;
    
    if (notaIndex !== null && notas[notaIndex]) {
        const nota = notas[notaIndex];
        editorTitulo.value = nota.titulo || '';
        editorNota.value = nota.texto;
        editorStatus.textContent = '✏️ Editando nota';
        editorData.textContent = `Última edição: ${formatarData(nota.data)}`;
    } else {
        editorTitulo.value = '';
        editorNota.value = '';
        editorStatus.textContent = '📝 Nova nota';
        editorData.textContent = '';
        notaEditando = null;
    }
    
    setTimeout(() => editorNota.focus(), 100);
}

function mostrarLista() {
    modoLista = true;
    areaEdicao.style.display = 'none';
    areaLista.style.display = 'flex';
    btnNovaNota.classList.remove('active');
    btnListarNotas.classList.add('active');
    btnSalvar.style.display = 'none';
    renderizarLista();
}

function salvarNotaEditor() {
    const texto = editorNota.value.trim();
    const titulo = editorTitulo.value.trim();
    
    if (!texto) {
        mostrarFeedback('⚠️ A nota não pode estar vazia!');
        return;
    }
    
    const tituloFinal = titulo || gerarTituloPadrao();
    const agora = new Date().toISOString();
    
    if (notaEditando !== null) {
        notas[notaEditando].titulo = tituloFinal;
        notas[notaEditando].texto = texto;
        notas[notaEditando].data = agora;
        mostrarFeedback('✅ Nota atualizada!');
    } else {
        notas.push({
            titulo: tituloFinal,
            texto: texto,
            data: agora
        });
        mostrarFeedback('✅ Nota adicionada!');
    }
    
    salvarNotas();
    
    editorTitulo.value = '';
    editorNota.value = '';
    notaEditando = null;
    editorStatus.textContent = '📝 Nova nota';
    editorData.textContent = '';
    
    mostrarLista();
}

// ============================================================================
// RENDERIZAR LISTA
// ============================================================================

function renderizarLista() {
    if (!listaNotas) return;
    
    if (notas.length === 0) {
        listaNotas.innerHTML = `
            <div class="nota-vazio">
                <i class="ri-sticky-note-line"></i>
                <p>Nenhuma nota clínica</p>
                <small>Clique em "+" para adicionar</small>
            </div>
        `;
        return;
    }
    
    const notasOrdenadas = [...notas].reverse();
    
    listaNotas.innerHTML = notasOrdenadas.map((nota, idx) => {
        const originalIndex = notas.length - 1 - idx;
        const tituloHTML = nota.titulo ? `<div class="nota-titulo">${escapeHtml(nota.titulo)}</div>` : '';
        
        const textoLength = nota.texto.length;
        const precisaExpandir = textoLength > 120;
        const textoId = `nota-texto-${originalIndex}`;
        const textoClasse = precisaExpandir ? 'nota-texto colapsado' : 'nota-texto';
        
        return `
            <div class="nota-item" data-index="${originalIndex}">
                ${tituloHTML}
                <div id="${textoId}" class="${textoClasse}">${escapeHtml(nota.texto)}</div>
                ${precisaExpandir ? `
                    <button class="btn-expandir" onclick="expandirNota('${textoId}', this)" data-expandido="false">
                        <i class="ri-arrow-down-s-line"></i> Ver mais
                    </button>
                ` : ''}
                <div class="nota-footer">
                    <span class="nota-data">
                        <i class="ri-time-line"></i> ${formatarData(nota.data)}
                    </span>
                    <div class="nota-acoes">
                        <button class="btn-nota" onclick="editarNota(${originalIndex})" title="Editar">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="btn-nota" onclick="copiarNota(${originalIndex})" title="Copiar">
                            <i class="ri-file-copy-line"></i>
                        </button>
                        <button class="btn-nota danger" onclick="removerNota(${originalIndex})" title="Remover">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// EXPANDIR NOTA (CORRIGIDO)
// ============================================================================

function expandirNota(elementId, button) {
    const textoEl = document.getElementById(elementId);
    if (!textoEl) return;
    
    const isExpanded = button.dataset.expandido === 'true';
    
    if (isExpanded) {
        // RECOLHER
        textoEl.classList.remove('expandido');
        textoEl.classList.add('colapsado');
        textoEl.style.maxHeight = '';
        textoEl.style.overflow = '';
        button.dataset.expandido = 'false';
        button.innerHTML = '<i class="ri-arrow-down-s-line"></i> Ver mais';
    } else {
        // EXPANDIR
        textoEl.classList.remove('colapsado');
        textoEl.classList.add('expandido');
        textoEl.style.maxHeight = 'none';
        textoEl.style.overflow = 'visible';
        button.dataset.expandido = 'true';
        button.innerHTML = '<i class="ri-arrow-up-s-line"></i> Ver menos';
    }
}

// ============================================================================
// AÇÕES DAS NOTAS
// ============================================================================

function removerNota(index) {
    if (!confirm('Remover esta nota?')) return;
    notas.splice(index, 1);
    salvarNotas();
    renderizarLista();
    mostrarFeedback('🗑️ Nota removida');
}

function editarNota(index) {
    if (!notas[index]) return;
    mostrarEditor(index);
}

function copiarNota(index) {
    if (!notas[index]) return;
    copiarTexto(notas[index].texto);
}

function limparTodasNotas() {
    if (notas.length === 0) return;
    if (!confirm('Tem certeza que deseja remover TODAS as notas?')) return;
    notas = [];
    salvarNotas();
    renderizarLista();
    mostrarFeedback('🗑️ Todas as notas removidas');
}

// ============================================================================
// EVENTOS
// ============================================================================

btnNovaNota.addEventListener('click', () => mostrarEditor(null));
btnListarNotas.addEventListener('click', mostrarLista);
btnSalvar.addEventListener('click', salvarNotaEditor);
btnLimparTodas.addEventListener('click', limparTodasNotas);

editorNota.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        salvarNotaEditor();
    }
    if (e.key === 'Escape' && !modoLista) {
        mostrarLista();
    }
});

// ============================================================================
// TEMA
// ============================================================================
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

if (localStorage.getItem('tema') === 'dark') {
    body.setAttribute('data-theme', 'dark');
}

// ============================================================================
// MENU LATERAL
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
    }
    function fecharMenu() {
        btnHamburger.classList.remove('ativo');
        menuOverlay.classList.remove('ativo');
        menuLateral.classList.remove('ativo');
        document.body.style.overflow = '';
    }
    btnHamburger.addEventListener('click', () => {
        if (menuLateral.classList.contains('ativo')) fecharMenu();
        else abrirMenu();
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
        if (e.key === 'Escape' && menuLateral.classList.contains('ativo')) fecharMenu();
    });
    let touchStartXMenu = 0;
    menuLateral.addEventListener('touchstart', (e) => {
        touchStartXMenu = e.touches[0].clientX;
    }, { passive: true });
    menuLateral.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartXMenu - touchEndX;
        if (diff < -50) fecharMenu();
    });
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
mostrarEditor(null);
atualizarBadge();

const params = new URLSearchParams(window.location.search);
const editarId = params.get('editar');
if (editarId !== null && notas[parseInt(editarId)]) {
    setTimeout(() => mostrarEditor(parseInt(editarId)), 300);
}

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