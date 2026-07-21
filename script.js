/*
 * script.js — Mpindi TecMed / MatClínica
 * SOLUÇÃO EXCLUSIVA - Sem interferências do Bloco de Notas
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. TEMA - APENAS FUNCIONALIDADE BÁSICA
    // ==========================================================================
    const themeBtn = document.getElementById('themeBtn');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    // Verificar se o tema já foi aplicado pelo script no head
    const temaAtual = localStorage.getItem('matclinica-theme');
    if (temaAtual === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
    } else {
        body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.className = 'ri-moon-line';
    }
    
    // Alternar tema
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = body.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                body.removeAttribute('data-theme');
                document.documentElement.removeAttribute('data-theme');
                if (themeIcon) themeIcon.className = 'ri-moon-line';
                localStorage.setItem('matclinica-theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('data-theme', 'dark');
                if (themeIcon) themeIcon.className = 'ri-sun-line';
                localStorage.setItem('matclinica-theme', 'dark');
            }
        });
    }
    
    // ==========================================================================
    // 2. NAVEGAÇÃO - EFEITO MITOSE (SE EXISTIR)
    // ==========================================================================
    const navLinks = document.querySelectorAll('.nav-link');
    const mitoseBlob = document.querySelector('.mitose-blob');
    
    function atualizarPosicaoMitose(targetLink) {
        if (!targetLink || !mitoseBlob) return;
        mitoseBlob.style.width = `${targetLink.offsetWidth}px`;
        mitoseBlob.style.left = `${targetLink.offsetLeft}px`;
    }
    
    const activeLinkInicial = document.querySelector('.nav-link.active');
    if (activeLinkInicial) {
        setTimeout(() => atualizarPosicaoMitose(activeLinkInicial), 100);
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            atualizarPosicaoMitose(link);
        });
    });
    
    // ==========================================================================
    // 3. SCROLL - SECÇÃO ATIVA
    // ==========================================================================
    const sections = document.querySelectorAll('.section-scroll');
    const floatingToolsBtn = document.getElementById('stickyToolsBtn');
    
    window.addEventListener('scroll', () => {
        let seccaoAtualId = 'hero';
        
        sections.forEach(seccao => {
            const seccaoTop = seccao.offsetTop - 140;
            if (window.scrollY >= seccaoTop) {
                seccaoAtualId = seccao.getAttribute('id');
            }
        });
        
        const linkCorrespondente = document.querySelector(`.nav-link[data-sec="${seccaoAtualId}"]`);
        if (linkCorrespondente && !linkCorrespondente.classList.contains('active')) {
            navLinks.forEach(l => l.classList.remove('active'));
            linkCorrespondente.classList.add('active');
            atualizarPosicaoMitose(linkCorrespondente);
        }
        
        // Botão flutuante
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
    // 4. REDIMENSIONAMENTO
    // ==========================================================================
    window.addEventListener('resize', () => {
        const linkAtivoAtual = document.querySelector('.nav-link.active');
        atualizarPosicaoMitose(linkAtivoAtual);
    });
    
    // ==========================================================================
    // 5. INICIALIZAR AOS
    // ==========================================================================
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    }
});





/*
 * UNIFICAÇÃO: Menu lateral unificado
 * Script para controlar o menu lateral (abrir/fechar, overlay, animações)
 */
document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================================
    // MENU LATERAL UNIFICADO
    // ==========================================================================
    const btnHamburger = document.querySelector('.btn-hamburger-menu') || document.getElementById('btnHamburgerMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuLateral = document.getElementById('menuLateral');
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Se o botão hamburger não existir, criar um na navbar
    if (!btnHamburger) {
        const navRight = document.querySelector('.nav-right-actions');
        if (navRight) {
            const hamburger = document.createElement('button');
            hamburger.className = 'btn-hamburger-menu';
            hamburger.id = 'btnHamburgerMenu';
            hamburger.setAttribute('aria-label', 'Menu');
            hamburger.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            // Inserir antes do primeiro elemento ou no início
            navRight.insertBefore(hamburger, navRight.firstChild);
        }
    }
    
    // Re-atribuir após possível criação
    const btnHamburgerFinal = document.querySelector('.btn-hamburger-menu') || document.getElementById('btnHamburgerMenu');
    
    if (btnHamburgerFinal && menuOverlay && menuLateral) {
        function abrirMenu() {
            btnHamburgerFinal.classList.add('ativo');
            menuOverlay.classList.add('ativo');
            menuLateral.classList.add('ativo');
            document.body.style.overflow = 'hidden';
        }
        
        function fecharMenu() {
            btnHamburgerFinal.classList.remove('ativo');
            menuOverlay.classList.remove('ativo');
            menuLateral.classList.remove('ativo');
            document.body.style.overflow = '';
        }
        
        btnHamburgerFinal.addEventListener('click', () => {
            if (menuLateral.classList.contains('ativo')) {
                fecharMenu();
            } else {
                abrirMenu();
            }
        });
        
        menuOverlay.addEventListener('click', fecharMenu);
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remover active de todos
                menuItems.forEach(i => i.classList.remove('active'));
                // Adicionar active ao clicado
                item.classList.add('active');
                // Fechar menu após clicar
                setTimeout(fecharMenu, 200);
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuLateral.classList.contains('ativo')) {
                fecharMenu();
            }
        });
        
        // Suporte a toque para deslizar fechar (mobile)
        let touchStartXMenu = 0;
        let touchStartYMenu = 0;
        menuLateral.addEventListener('touchstart', (e) => {
            touchStartXMenu = e.touches[0].clientX;
            touchStartYMenu = e.touches[0].clientY;
        }, { passive: true });
        
        menuLateral.addEventListener('touchmove', (e) => {
            // Prevenir scroll enquanto arrasta para fechar
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const diffX = touchStartXMenu - touchX;
            const diffY = Math.abs(touchStartYMenu - touchY);
            
            // Se arrastar para a direita (diffX < 0) e movimento for mais horizontal que vertical
            if (diffX < -30 && diffY < 50) {
                e.preventDefault();
                fecharMenu();
            }
        }, { passive: false });
        
        menuLateral.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchStartXMenu - touchEndX;
            const diffY = Math.abs(touchStartYMenu - touchEndY);
            
            if (diffX < -50 && diffY < 100) {
                fecharMenu();
            }
        });
    }
    
    // ==========================================================================
    // TEMA DO MENU (Sincronizar com o tema principal)
    // ==========================================================================
    const themeBtnMenu = document.getElementById('themeBtnMenu');
    const themeIconMenu = document.getElementById('themeIconMenu');
    const body = document.body;
    
    // Função para atualizar ícone do tema no menu
    function atualizarIconeMenu() {
        if (themeIconMenu) {
            const isDark = body.getAttribute('data-theme') === 'dark';
            themeIconMenu.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
        }
    }
    
    // Atualizar ícone inicial
    atualizarIconeMenu();
    
    // Sincronizar com o botão de tema principal
    const themeBtnPrincipal = document.getElementById('themeBtn');
    if (themeBtnPrincipal) {
        themeBtnPrincipal.addEventListener('click', function() {
            // Atualizar após mudança de tema (com pequeno delay)
            setTimeout(atualizarIconeMenu, 50);
        });
    }
    
    // Alternar tema pelo menu
    if (themeBtnMenu) {
        themeBtnMenu.addEventListener('click', function() {
            // Simular clique no botão de tema principal
            if (themeBtnPrincipal) {
                themeBtnPrincipal.click();
            } else {
                // Fallback: alternar manualmente
                const isDark = body.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    body.removeAttribute('data-theme');
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('matclinica-theme', 'light');
                    if (themeIconMenu) themeIconMenu.className = 'ri-moon-line';
                } else {
                    body.setAttribute('data-theme', 'dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('matclinica-theme', 'dark');
                    if (themeIconMenu) themeIconMenu.className = 'ri-sun-line';
                }
            }
            // Fechar menu após mudar tema
            if (menuLateral && menuLateral.classList.contains('ativo')) {
                setTimeout(() => {
                    if (btnHamburgerFinal) btnHamburgerFinal.classList.remove('ativo');
                    menuOverlay.classList.remove('ativo');
                    menuLateral.classList.remove('ativo');
                    document.body.style.overflow = '';
                }, 200);
            }
        });
    }
});


function semLogin() {
    alert('Login ainda não está Disponível!')
}