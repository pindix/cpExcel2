// Lógica do Tema Escuro com Memória
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

themeBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'ri-moon-line';
        localStorage.setItem('tema', 'light'); // Guarda que é light
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
        localStorage.setItem('tema', 'dark');  // Guarda que é dark
    }
});


// LÓGICA DE INICIALIZAÇÃO (Ao carregar a página)
window.addEventListener('load', () => {

    // (Opcional) Restaurar Tema Escuro se já tiver essa lógica
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('themeIcon');
        if(themeIcon) themeIcon.className = 'ri-sun-line';
    }
});

// Lógica do Modal de Modo Teste
document.addEventListener("DOMContentLoaded", () => {
    const testModal = document.getElementById("testModeModal");
    const acceptBtn = document.getElementById("btnAcceptTest");

    // Verifica se o usuário já aceitou nesta sessão
    if (!sessionStorage.getItem("testModeAccepted")) {
        testModal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Bloqueia scroll enquanto não aceitar
    }

    acceptBtn.addEventListener("click", () => {
        sessionStorage.setItem("testModeAccepted", "true");
        testModal.style.fadeOut = "0.3s";
        testModal.style.display = "none";
        document.body.style.overflow = "auto"; // Libera scroll
    });
});