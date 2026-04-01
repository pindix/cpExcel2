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


// Botão Ver Mais - com animação e texto dinâmico
const btnVerMais = document.getElementById('btnVerMais');
const ferramentasOcultas = document.getElementById('ferramentasOcultas');
const iconeSeta = document.getElementById('iconeSeta');
const textoBotao = document.getElementById('textoBotao');

// Estado inicial (não usei style.display para permitir animação)
ferramentasOcultas.classList.remove('visivel');

btnVerMais.addEventListener('click', () => {
    // Alterna a classe 'visivel' para animar
    ferramentasOcultas.classList.toggle('visivel');
    
    // Muda o texto do botão
    if (ferramentasOcultas.classList.contains('visivel')) {
        textoBotao.textContent = 'Ver menos ferramentas';
    } else {
        textoBotao.textContent = 'Ver outras ferramentas';
    }
    
    // Muda a classe ativo para girar a seta
    btnVerMais.classList.toggle('ativo');
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
