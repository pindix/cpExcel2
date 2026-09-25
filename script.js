// Aguarda que o DOM esteja totalmente carregado para mapear os elementos da interface
document.addEventListener('DOMContentLoaded', () => {

    // ========================================================================
    // 1. MAPEAMENTO DE ELEMENTOS
    // ========================================================================
    const btnHamburger = document.getElementById('btnHamburger');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuLateral = document.getElementById('menuLateral');
    const menuItems = document.querySelectorAll('.menu-item');
    
    const testModal = document.getElementById('testModeModal');
    const acceptBtn = document.getElementById('btnAcceptTest');

    const themeBtn = document.getElementById('themeBtn');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // Atalho para verificar se está a correr no APK com Capacitor
    const isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();

    // ========================================================================
    // 2. FUNÇÃO AUXILIAR PARA ATUALIZAR ÍCONES DA STATUSBAR
    // ========================================================================
    function atualizarEstiloStatusBar(tema) {
        if (isCapacitor) {
            const { StatusBar } = window.Capacitor.Plugins;
            if (tema === 'dark') {
                StatusBar.setStyle({ style: 'LIGHT' }); // Ícones brancos para fundo escuro
            } else {
                StatusBar.setStyle({ style: 'DARK' });  // Ícones escuros para fundo claro
            }
        }
    }

    // ========================================================================
    // 3. MENU LATERAL (LÓGICA E EVENTOS)
    // ========================================================================
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
                const page = item.getAttribute('data-page');
                console.log(`Navegar para: ${page}`);
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

    // ========================================================================
    // 4. MODAL DE MODO TESTE
    // ========================================================================
    if (testModal && acceptBtn) {
        if (!sessionStorage.getItem('testModeAccepted')) {
            testModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        acceptBtn.addEventListener('click', () => {
            sessionStorage.setItem('testModeAccepted', 'true');
            testModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    } 

    // ========================================================================
    // 5. GESTÃO DE TEMA (MODO CLARO / ESCURO)
    // ========================================================================
    // Restaurar tema salvo ao abrir a aplicação
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
    }

    
themeBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        // Mudar para tema claro
        body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'ri-moon-line';
        localStorage.setItem('tema', 'light');
        // Aplica fundo claro imediatamente
        document.documentElement.style.backgroundColor = '#ffff';
        document.body.style.backgroundColor = '#ffff';
    } else {
        // Mudar para tema escuro
        body.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
        localStorage.setItem('tema', 'dark');
        // Aplica fundo escuro imediatamente
        document.documentElement.style.backgroundColor = '#000000';
        document.body.style.backgroundColor = '#000000';
    }
});   

});