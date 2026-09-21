/* =========================================================
   MATCLÍNICA — SCRIPT PRINCIPAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HISTÓRIA — SOBRE
       ===================================================== */

    const btnHistoria = document.getElementById('btnHistoria');
    const historiaContainer = document.getElementById('historiaContainer');

    if (btnHistoria && historiaContainer) {

        btnHistoria.addEventListener('click', () => {

            const isOpen = historiaContainer.classList.toggle('active');

            btnHistoria.classList.toggle('active', isOpen);

            btnHistoria.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            historiaContainer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

            btnHistoria.querySelector('span').textContent =
                isOpen ? 'Ocultar história' : 'Ver história';
        });
    }


    /* =====================================================
       NAVBAR — ELEMENTOS
       ===================================================== */

    const pillArea = document.getElementById("mcPillArea");
    const menuToggle = document.getElementById("mcMenuToggle");
    const menuIcon = document.getElementById("mcMenuIcon");
    const themeBtn = document.getElementById("themeBtn");
    const themeIcon = document.getElementById("themeIcon");

    /* =====================================================
       NAVBAR — SÓ CORRE SE EXISTIR
       ===================================================== */

    if (pillArea && menuToggle) {

        /* =================================================
           SEÇÕES
           ================================================= */

        const sections = [
            { id: "inicio",       target: "hero",           label: "Início",        icon: "ri-home-4-line" },
            { id: "sobre",        target: "sobre",          label: "Sobre",         icon: "ri-information-line" },
            { id: "seguranca",    target: "seguranca",      label: "Refências",     icon: "ri-shield-check-line" },
            { id: "ferramentas",  target: "ferramentas",    label: "Ferramentas",   icon: "ri-tools-line" },
            { id: "reportar-erro",target: "reportar-erro",  label: "Reportar Erro", icon: "ri-error-warning-line" }
        ];

        /* =================================================
           ESTADO
           ================================================= */

        let currentIndex = 0;
        let isOpen = false;
        let renderFrame = null;
        let scrollFrame = null;

        /* =================================================
           TEMA
           ================================================= */

        function getCurrentTheme() {
            const savedTheme = localStorage.getItem("matclinica-theme");
            if (savedTheme === "dark") return "dark";
            if (savedTheme === "light") return "light";
            const htmlTheme = document.documentElement.getAttribute("data-theme");
            return htmlTheme === "dark" ? "dark" : "light";
        }

        function updateThemeIcon(theme) {
            if (!themeIcon) return;
            if (theme === "dark") {
                themeIcon.className = "ri-sun-line";
                themeBtn.setAttribute("aria-label", "Mudar para tema claro");
            } else {
                themeIcon.className = "ri-moon-line";
                themeBtn.setAttribute("aria-label", "Mudar para tema escuro");
            }
        }

        function applyTheme(theme) {
            const root = document.documentElement;
            const body = document.body;
            if (theme === "dark") {
                root.setAttribute("data-theme", "dark");
                body.setAttribute("data-theme", "dark");
                localStorage.setItem("matclinica-theme", "dark");
            } else {
                root.setAttribute("data-theme", "light");
                body.setAttribute("data-theme", "light");
                localStorage.setItem("matclinica-theme", "light");
            }
            updateThemeIcon(theme);
        }

        applyTheme(getCurrentTheme());

        if (themeBtn) {
            themeBtn.addEventListener("click", () => {
                const theme = getCurrentTheme();
                applyTheme(theme === "dark" ? "light" : "dark");
            });
        }

        /* =================================================
           CRIAR PÍLULA
           ================================================= */

        function createPill(section, className, clickHandler) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = className;
            button.textContent = section.label;
            button.setAttribute("aria-label", `Ir para ${section.label}`);
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                clickHandler();
            });
            return button;
        }

        /* =================================================
           ANIMAÇÃO
           ================================================= */

        function animateRender(renderFunction) {
            if (renderFrame) cancelAnimationFrame(renderFrame);
            pillArea.classList.add("mc-menu-changing");
            renderFrame = requestAnimationFrame(() => {
                renderFunction();
                requestAnimationFrame(() => {
                    pillArea.classList.remove("mc-menu-changing");
                });
            });
        }

        /* =================================================
           MENU FECHADO
           ================================================= */

        function renderClosedMenu() {
            pillArea.innerHTML = "";
            const wrapper = document.createElement("div");
            wrapper.className = "mc-closed-menu";

            if (currentIndex > 0) {
                const previousSection = sections[currentIndex - 1];
                const previousContainer = document.createElement("div");
                previousContainer.className = "mc-previous-pills";
                previousContainer.appendChild(
                    createPill(previousSection, "mc-previous-pill", () => {
                        goToSection(currentIndex - 1);
                    })
                );
                wrapper.appendChild(previousContainer);
            }

            const activeRow = document.createElement("div");
            activeRow.className = "mc-active-row";

            const activePill = document.createElement("div");
            activePill.className = "mc-active-pill";
            activePill.textContent = sections[currentIndex].label;

            const activeIcon = document.createElement("div");
            activeIcon.className = "mc-active-icon";
            const icon = document.createElement("i");
            icon.className = sections[currentIndex].icon;
            activeIcon.appendChild(icon);

            activeRow.appendChild(activePill);
            activeRow.appendChild(activeIcon);
            wrapper.appendChild(activeRow);

            const nextSections = sections.slice(currentIndex + 1, currentIndex + 3);
            if (nextSections.length > 0) {
                const nextContainer = document.createElement("div");
                nextContainer.className = "mc-next-pills";
                nextSections.forEach((section, relativeIndex) => {
                    const actualIndex = currentIndex + relativeIndex + 1;
                    nextContainer.appendChild(
                        createPill(section, "mc-next-pill", () => {
                            goToSection(actualIndex);
                        })
                    );
                });
                wrapper.appendChild(nextContainer);
            }

            pillArea.appendChild(wrapper);
        }

        /* =================================================
           MENU ABERTO
           ================================================= */

        function renderOpenMenu() {
            pillArea.innerHTML = "";
            const menu = document.createElement("div");
            menu.className = "mc-open-menu";

            sections.forEach((section, index) => {
                const item = document.createElement("div");
                item.className = "mc-open-item";
                if (index === currentIndex) item.classList.add("active");

                const label = document.createElement("div");
                label.className = "mc-open-label";
                label.textContent = section.label;

                const iconBox = document.createElement("div");
                iconBox.className = "mc-open-icon";
                const icon = document.createElement("i");
                icon.className = section.icon;
                iconBox.appendChild(icon);

                item.appendChild(label);
                item.appendChild(iconBox);

                item.addEventListener("click", () => goToSection(index));
                menu.appendChild(item);
            });

            pillArea.appendChild(menu);
        }

        /* =================================================
           RENDER
           ================================================= */

        function renderMenu(animated = false) {
            const renderFunction = isOpen ? renderOpenMenu : renderClosedMenu;
            if (animated) animateRender(renderFunction);
            else renderFunction();
        }

        /* =================================================
           IR PARA SECÇÃO
           ================================================= */

        function goToSection(index) {
            if (index < 0 || index >= sections.length) return;
            const section = sections[index];
            const element = document.getElementById(section.target);
            if (!element) return;

            currentIndex = index;
            isOpen = false;
            updateMenuButton();
            renderMenu(true);

            setTimeout(() => {
                if (section.target === "hero") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 80);
        }

        /* =================================================
           BOTÃO MENU
           ================================================= */

        function updateMenuButton() {
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
            if (menuIcon) {
                menuIcon.className = isOpen ? "ri-close-line" : "ri-menu-line";
            }
        }

        menuToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            isOpen = !isOpen;
            updateMenuButton();
            renderMenu(true);
        });

        /* =================================================
           DETECTAR SECÇÃO
           ================================================= */

        function detectCurrentSection() {
            const detectionPoint = window.scrollY + window.innerHeight * 0.38;
            let detectedIndex = 0;

            sections.forEach((section, index) => {
                const element = document.getElementById(section.target);
                if (!element) return;
                const rect = element.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                if (detectionPoint >= sectionTop) detectedIndex = index;
            });

            if (detectedIndex === currentIndex) return;
            currentIndex = detectedIndex;
            if (!isOpen) renderMenu(true);
        }

        window.addEventListener("scroll", () => {
            if (scrollFrame) return;
            scrollFrame = requestAnimationFrame(() => {
                detectCurrentSection();
                scrollFrame = null;
            });
        }, { passive: true });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isOpen) {
                isOpen = false;
                updateMenuButton();
                renderMenu(true);
            }
        });

        window.addEventListener("resize", () => {
            if (!isOpen) renderMenu(false);
        });

        detectCurrentSection();
        updateMenuButton();
        renderMenu(false);
    } else {
        console.warn("Navbar MatClínica não encontrada.");
    }


    /* =====================================================
       LOGIN
       ===================================================== */

    window.semLogin = function () {
        alert("Login ainda não está Disponível!");
    };


    /* =====================================================
       REPORTAR ERRO
       ===================================================== */

    const reportarForm = document.getElementById('reportarErroForm');
    const reportarSelectNative = document.getElementById('reportarFerramenta');
    const reportarSelectUI = document.getElementById('reportarErroSelect');
    const reportarSelectValue = document.getElementById('reportarErroSelectValue');
    const reportarSelectList = document.getElementById('reportarErroSelectList');
    const reportarDescricao = document.getElementById('reportarDescricao');
    const reportarEmail = document.getElementById('reportarEmail');
    const reportarPassos = document.getElementById('reportarPassos');
    const reportarSucesso = document.getElementById('reportarErroSucesso');
    const reportarMensagem = document.getElementById('reportarErroMensagem');
    const reportarResetBtn = document.getElementById('reportarErroReset');

    if (reportarForm) {

        /* -------------------------------------------------
           SELECT PERSONALIZADO
           ------------------------------------------------- */

        if (reportarSelectUI && reportarSelectList) {

            reportarSelectUI.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = reportarSelectList.classList.toggle('open');
                reportarSelectUI.classList.toggle('active', open);
                reportarSelectUI.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            reportarSelectList.querySelectorAll('li').forEach((item) => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = item.dataset.value;

                    reportarSelectNative.value = value;
                    reportarSelectValue.textContent = value;
                    reportarSelectValue.classList.add('has-value');

                    reportarSelectList.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
                    item.classList.add('selected');

                    reportarSelectList.classList.remove('open');
                    reportarSelectUI.classList.remove('active');
                    reportarSelectUI.setAttribute('aria-expanded', 'false');
                });
            });

            document.addEventListener('click', () => {
                reportarSelectList.classList.remove('open');
                reportarSelectUI.classList.remove('active');
                reportarSelectUI.setAttribute('aria-expanded', 'false');
            });
        }

        /* -------------------------------------------------
           SUBMISSÃO — ENVIA DIRETO PARA O EMAIL
           ------------------------------------------------- */

        reportarForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ferramenta = reportarSelectNative.value;
            const descricao = reportarDescricao.value.trim();

            if (!ferramenta) {
                alert('Por favor, seleciona a ferramenta onde encontraste o erro.');
                return;
            }

            if (!descricao) {
                alert('Por favor, descreve o erro que encontraste.');
                return;
            }

            const email = reportarEmail.value.trim();
            const passos = reportarPassos.value.trim();

            const formData = new FormData();
            formData.append('Ferramenta', ferramenta);
            formData.append('Descrição', descricao);
            formData.append('Email', email || 'Não fornecido');
            formData.append('Passos', passos || 'Não fornecido');
            formData.append('_subject', 'Reporte de Erro — MatClínica');
            formData.append('_captcha', 'false');
            formData.append('_template', 'table');

            try {
                const resposta = await fetch(
                    'https://formsubmit.co/ajax/sebastiaompindi@gmail.com',
                    {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' },
                        body: formData
                    }
                );

                if (!resposta.ok) throw new Error('Falha no envio');

                reportarForm.style.display = 'none';

                reportarMensagem.textContent = email
                    ? 'Obrigado por nos informar o erro. Vamos analisar e corrigir. Se deixaste o teu email, entraremos em contacto.'
                    : 'Obrigado por nos informar o erro. Vamos analisar e corrigir.';

                reportarSucesso.style.display = 'block';

            } catch (erro) {
                console.error('Erro ao enviar reporte:', erro);
                alert('Não foi possível enviar o reporte. Verifica a tua ligação à internet e tenta novamente.');
            }
        });

        /* -------------------------------------------------
           BOTÃO "ESTÁ BEM"
           ------------------------------------------------- */

        if (reportarResetBtn) {
            reportarResetBtn.addEventListener('click', () => {
                reportarForm.reset();
                reportarSelectNative.value = '';

                if (reportarSelectValue) {
                    reportarSelectValue.textContent = 'Seleciona uma ferramenta';
                    reportarSelectValue.classList.remove('has-value');
                }

                if (reportarSelectList) {
                    reportarSelectList.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
                    reportarSelectList.classList.remove('open');
                }

                if (reportarSelectUI) {
                    reportarSelectUI.classList.remove('active');
                    reportarSelectUI.setAttribute('aria-expanded', 'false');
                }

                reportarDescricao.value = '';
                reportarEmail.value = '';
                reportarPassos.value = '';

                reportarSucesso.style.display = 'none';
                reportarForm.style.display = 'block';

                reportarForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    } else {
        console.warn('Formulário "Reportar Erro" não encontrado.');
    }

});