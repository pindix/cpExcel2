/* =========================================================
   MATCLÍNICA — SCRIPT DA NAVBAR
   Menu baseado no HeroSection.jsx
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const btnHistoria = document.getElementById('btnHistoria');
const historiaContainer = document.getElementById('historiaContainer');

if (btnHistoria && historiaContainer) {

    btnHistoria.addEventListener('click', () => {

        const isOpen = historiaContainer.classList.toggle('active');

        btnHistoria.classList.toggle('active', isOpen);

        btnHistoria.setAttribute(
            'aria-expanded',
            isOpen ? 'true' : 'false'
        );

        historiaContainer.setAttribute(
            'aria-hidden',
            isOpen ? 'false' : 'true'
        );

        btnHistoria.querySelector('span').textContent =
            isOpen ? 'Ocultar história' : 'Ver história';

    });

}

    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const pillArea = document.getElementById("mcPillArea");
    const menuToggle = document.getElementById("mcMenuToggle");
    const menuIcon = document.getElementById("mcMenuIcon");

    const themeBtn = document.getElementById("themeBtn");
    const themeIcon = document.getElementById("themeIcon");

    if (!pillArea || !menuToggle) {
        console.warn("Navbar MatClínica não encontrada.");
        return;
    }


    /* =====================================================
       SEÇÕES DA MATCLÍNICA
       ===================================================== */

    const sections = [
        {
            id: "inicio",
            target: "hero",
            label: "Início",
            icon: "ri-home-4-line"
        },

        {
            id: "sobre",
            target: "sobre",
            label: "Sobre",
            icon: "ri-information-line"
        },

        {
            id: "seguranca",
            target: "seguranca",
            label: "Refências",
            icon: "ri-shield-check-line"
        },

        {
            id: "ferramentas",
            target: "ferramentas",
            label: "Ferramentas",
            icon: "ri-tools-line"
        }
    ];


    /* =====================================================
       ESTADO
       ===================================================== */

    let currentIndex = 0;
    let isOpen = false;

    let renderFrame = null;
    let scrollFrame = null;


    /* =====================================================
       TEMA
       ===================================================== */

    function getCurrentTheme() {

        const savedTheme =
            localStorage.getItem("matclinica-theme");

        if (savedTheme === "dark") {
            return "dark";
        }

        if (savedTheme === "light") {
            return "light";
        }

        const htmlTheme =
            document.documentElement.getAttribute("data-theme");

        return htmlTheme === "dark"
            ? "dark"
            : "light";
    }


    function updateThemeIcon(theme) {

        if (!themeIcon) {
            return;
        }

        if (theme === "dark") {

            themeIcon.className =
                "ri-sun-line";

            themeBtn.setAttribute(
                "aria-label",
                "Mudar para tema claro"
            );

        } else {

            themeIcon.className =
                "ri-moon-line";

            themeBtn.setAttribute(
                "aria-label",
                "Mudar para tema escuro"
            );
        }
    }


    function applyTheme(theme) {

        const root =
            document.documentElement;

        const body =
            document.body;

        if (theme === "dark") {

            root.setAttribute(
                "data-theme",
                "dark"
            );

            body.setAttribute(
                "data-theme",
                "dark"
            );

            localStorage.setItem(
                "matclinica-theme",
                "dark"
            );

        } else {

            root.setAttribute(
                "data-theme",
                "light"
            );

            body.setAttribute(
                "data-theme",
                "light"
            );

            localStorage.setItem(
                "matclinica-theme",
                "light"
            );
        }

        updateThemeIcon(theme);
    }


    let currentTheme =
        getCurrentTheme();

    applyTheme(currentTheme);


    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            () => {

                const theme =
                    getCurrentTheme();

                applyTheme(
                    theme === "dark"
                        ? "light"
                        : "dark"
                );
            }
        );
    }


    /* =====================================================
       CRIAR PÍLULA
       ===================================================== */

    function createPill(
        section,
        className,
        clickHandler
    ) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            className;

        button.textContent =
            section.label;

        button.setAttribute(
            "aria-label",
            `Ir para ${section.label}`
        );

        button.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                clickHandler();
            }
        );

        return button;
    }


    /* =====================================================
       ANIMAÇÃO DE TRANSIÇÃO
       ===================================================== */

    function animateRender(renderFunction) {

        if (renderFrame) {
            cancelAnimationFrame(renderFrame);
        }

        pillArea.classList.add("mc-menu-changing");

        renderFrame = requestAnimationFrame(() => {

            renderFunction();

            requestAnimationFrame(() => {

                pillArea.classList.remove(
                    "mc-menu-changing"
                );

            });

        });
    }


    /* =====================================================
       MENU FECHADO
       ===================================================== */

    function renderClosedMenu() {

        pillArea.innerHTML = "";

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "mc-closed-menu";


        /* =================================================
           SEÇÃO ANTERIOR — SOMENTE A IMEDIATAMENTE ANTERIOR
           ================================================= */

        if (currentIndex > 0) {

            const previousSection =
                sections[currentIndex - 1];

            const previousContainer =
                document.createElement("div");

            previousContainer.className =
                "mc-previous-pills";


            const pill =
                createPill(
                    previousSection,
                    "mc-previous-pill",
                    () => {

                        goToSection(
                            currentIndex - 1
                        );
                    }
                );


            previousContainer.appendChild(pill);

            wrapper.appendChild(
                previousContainer
            );
        }


        /* =================================================
           LINHA ATIVA
           ================================================= */

        const activeRow =
            document.createElement("div");

        activeRow.className =
            "mc-active-row";


        const activePill =
            document.createElement("div");

        activePill.className =
            "mc-active-pill";

        activePill.textContent =
            sections[currentIndex].label;


        const activeIcon =
            document.createElement("div");

        activeIcon.className =
            "mc-active-icon";


        const icon =
            document.createElement("i");

        icon.className =
            sections[currentIndex].icon;


        activeIcon.appendChild(icon);

        activeRow.appendChild(
            activePill
        );

        activeRow.appendChild(
            activeIcon
        );

        wrapper.appendChild(
            activeRow
        );


        /* =================================================
           PRÓXIMAS SEÇÕES
           ================================================= */

        const nextSections =
            sections.slice(
                currentIndex + 1,
                currentIndex + 3
            );


        if (nextSections.length > 0) {

            const nextContainer =
                document.createElement("div");

            nextContainer.className =
                "mc-next-pills";


            nextSections.forEach(
                (section, relativeIndex) => {

                    const actualIndex =
                        currentIndex +
                        relativeIndex +
                        1;


                    const pill =
                        createPill(
                            section,
                            "mc-next-pill",
                            () => {

                                goToSection(
                                    actualIndex
                                );
                            }
                        );


                    nextContainer.appendChild(
                        pill
                    );
                }
            );


            wrapper.appendChild(
                nextContainer
            );
        }


        pillArea.appendChild(
            wrapper
        );
    }


    /* =====================================================
       MENU ABERTO
       ===================================================== */

    function renderOpenMenu() {

        pillArea.innerHTML = "";

        const menu =
            document.createElement("div");

        menu.className =
            "mc-open-menu";


        sections.forEach(
            (section, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "mc-open-item";


                if (
                    index === currentIndex
                ) {

                    item.classList.add(
                        "active"
                    );
                }


                const label =
                    document.createElement("div");

                label.className =
                    "mc-open-label";

                label.textContent =
                    section.label;


                const iconBox =
                    document.createElement("div");

                iconBox.className =
                    "mc-open-icon";


                const icon =
                    document.createElement("i");

                icon.className =
                    section.icon;


                iconBox.appendChild(icon);


                item.appendChild(label);

                item.appendChild(iconBox);


                item.addEventListener(
                    "click",
                    () => {

                        goToSection(index);
                    }
                );


                menu.appendChild(item);
            }
        );


        pillArea.appendChild(menu);
    }


    /* =====================================================
       RENDER GERAL
       ===================================================== */

    function renderMenu(animated = false) {

        const renderFunction =
            isOpen
                ? renderOpenMenu
                : renderClosedMenu;


        if (animated) {

            animateRender(
                renderFunction
            );

        } else {

            renderFunction();
        }
    }


    /* =====================================================
       IR PARA UMA SEÇÃO
       ===================================================== */

    function goToSection(index) {

        if (
            index < 0 ||
            index >= sections.length
        ) {
            return;
        }


        const section =
            sections[index];

        const element =
            document.getElementById(
                section.target
            );


        if (!element) {
            return;
        }


        currentIndex =
            index;


        isOpen =
            false;


        updateMenuButton();

        renderMenu(true);


        /*
         * Pequeno atraso para permitir
         * que a animação do menu comece
         * antes do scroll.
         */

        setTimeout(() => {

    if (section.target === "hero") {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        return;
    }

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}, 80);
    }


    /* =====================================================
       BOTÃO ABRIR / FECHAR
       ===================================================== */

    function updateMenuButton() {

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );


        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Fechar menu"
                : "Abrir menu"
        );


        if (menuIcon) {

            menuIcon.className =
                isOpen
                    ? "ri-close-line"
                    : "ri-menu-line";
        }
    }


    menuToggle.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            isOpen =
                !isOpen;


            updateMenuButton();

            renderMenu(true);
        }
    );


    /* =====================================================
       DETECTAR SEÇÃO ATUAL
       ===================================================== */

    function detectCurrentSection() {

        const detectionPoint =
            window.scrollY +
            window.innerHeight * 0.38;


        let detectedIndex = 0;


        sections.forEach(
            (section, index) => {

                const element =
                    document.getElementById(
                        section.target
                    );


                if (!element) {
                    return;
                }


                const rect =
                    element.getBoundingClientRect();


                const sectionTop =
                    rect.top +
                    window.scrollY;


                if (
                    detectionPoint >=
                    sectionTop
                ) {

                    detectedIndex =
                        index;
                }
            }
        );


        if (
            detectedIndex ===
            currentIndex
        ) {
            return;
        }


        currentIndex =
            detectedIndex;


        /*
         * Só atualizamos visualmente
         * quando o menu está fechado.
         */

        if (!isOpen) {

            renderMenu(true);
        }
    }


    /* =====================================================
       SCROLL OTIMIZADO
       ===================================================== */

    window.addEventListener(
        "scroll",
        () => {

            if (scrollFrame) {
                return;
            }


            scrollFrame =
                requestAnimationFrame(
                    () => {

                        detectCurrentSection();

                        scrollFrame =
                            null;
                    }
                );
        },
        {
            passive: true
        }
    );


    /* =====================================================
       ESC
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                isOpen
            ) {

                isOpen =
                    false;

                updateMenuButton();

                renderMenu(true);
            }
        }
    );


    /* =====================================================
       REDIMENSIONAMENTO
       ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (!isOpen) {

                renderMenu(false);
            }
        }
    );


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    detectCurrentSection();

    updateMenuButton();

    renderMenu(false);


    /* =====================================================
       LOGIN
       ===================================================== */

    window.semLogin =
        function () {

            alert(
                "Login ainda não está Disponível!"
            );
        };

});