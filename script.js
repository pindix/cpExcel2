/*
 * script.js — Mpindi TecMed / MatClínica
 * Comportamento da interface: navbar (efeito "mitose"), deteção da secção
 * ativa no scroll, alternância de tema claro/escuro com persistência, e
 * reposicionamento em resize. Organizado em blocos numerados abaixo.
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. SELETORES E ANCORAGENS
    // ==========================================================================
    const themeBtn = document.getElementById('themeBtn');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    const navLinks = document.querySelectorAll('.nav-link');
    const mitoseBlob = document.querySelector('.mitose-blob');
    const sections = document.querySelectorAll('.section-scroll');
    const floatingToolsBtn = document.getElementById('stickyToolsBtn');

    // ==========================================================================
    // 2. MOTOR DO EFEITO MITOSE (NAVBAR TOGGLE)
    // ==========================================================================
    function atualizarPosicaoMitose(targetLink) {
        if (!targetLink || !mitoseBlob) return;
        
        // Alinha a largura e o deslocamento à esquerda com base no link ativo
        mitoseBlob.style.width = `${targetLink.offsetWidth}px`;
        mitoseBlob.style.left = `${targetLink.offsetLeft}px`;
    }

    // Inicializa a Mitose no primeiro item ativo ao carregar a página
    const activeLinkInicial = document.querySelector('.nav-link.active');
    if (activeLinkInicial) {
        // Um pequeno timeout garante que o navegador já calculou as dimensões do DOM
        setTimeout(() => atualizarPosicaoMitose(activeLinkInicial), 100);
    }

    // Clique manual nas opções da Navbar
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            atualizarPosicaoMitose(link);
        });
    });

    // ==========================================================================
    // 3. MONITORIZAÇÃO DO SCROLL (ROLAMENTO DINÂMICO)
    // ==========================================================================
    window.addEventListener('scroll', () => {
        let seccaoAtualId = 'hero';

        // Deteta qual secção está visível no viewport (margem de 140px para compensar a navbar)
        sections.forEach(seccao => {
            const seccaoTop = seccao.offsetTop - 140;
            if (window.scrollY >= seccaoTop) {
                seccaoAtualId = seccao.getAttribute('id');
            }
        });

        // Se a secção mudar no scroll, atualiza o estado ativo e dispara a animação mitose
        const linkCorrespondente = document.querySelector(`.nav-link[data-sec="${seccaoAtualId}"]`);
        if (linkCorrespondente && !linkCorrespondente.classList.contains('active')) {
            navLinks.forEach(l => l.classList.remove('active'));
            linkCorrespondente.classList.add('active');
            atualizarPosicaoMitose(linkCorrespondente);
        }

        // Regra do Botão Fixo: Esconde se entrarmos na secção de ferramentas/dosagem
        const ferramentasSec = document.getElementById('ferramentas');
        if (ferramentasSec && floatingToolsBtn) {
            const limiteFerramentas = ferramentasSec.offsetTop - 250;
            if (window.scrollY >= limiteFerramentas) {
                floatingToolsBtn.classList.add('hidden');
            } else {
                floatingToolsBtn.classList.remove('hidden');
            }
        }
    });

    // ==========================================================================
    // 4. GESTÃO DE TEMA (CLARO/ESCURO) COM PERSISTÊNCIA
    // ==========================================================================
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = body.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                body.removeAttribute('data-theme');
                if (themeIcon) themeIcon.className = 'ri-moon-line';
                localStorage.setItem('matclinica-theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                if (themeIcon) themeIcon.className = 'ri-sun-line';
                localStorage.setItem('matclinica-theme', 'dark');
            }

            // Recalcula o blob da mitose caso a fonte mude levemente de peso no tema escuro
            const linkAtivoAtual = document.querySelector('.nav-link.active');
            setTimeout(() => atualizarPosicaoMitose(linkAtivoAtual), 50);
        });
    }

    // Aplica o tema guardado no histórico do utilizador ao iniciar
    const temaGuardado = localStorage.getItem('matclinica-theme');
    if (temaGuardado === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
        const linkAtivoAtual = document.querySelector('.nav-link.active');
        setTimeout(() => atualizarPosicaoMitose(linkAtivoAtual), 150);
    }

    // ==========================================================================
    // 5. REDIMENSIONAMENTO DA JANELA (CORREÇÃO DE LAYOUT)
    // ==========================================================================
    window.addEventListener('resize', () => {
        const linkAtivoAtual = document.querySelector('.nav-link.active');
        atualizarPosicaoMitose(linkAtivoAtual);
    });

    // Nota: a imagem de fundo da secção Segurança é estática (acompanha o
    // scroll normalmente, como qualquer outro conteúdo) — ver
    // .seguranca-bg-image em style.css. Não precisa de JavaScript.
});


