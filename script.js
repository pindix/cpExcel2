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

// Quando a página carrega, recupera as escolhas anonimamente
window.addEventListener('load', () => {
    // Restaurar Tema
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'ri-sun-line';
    }
    
    // Inicia o carregamento do Excel
    carregarDados();
});
