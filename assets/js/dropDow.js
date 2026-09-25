// ================================================================
// DROPDOWN PERSONALIZADO - Substitui selects nativos
// ================================================================

(function() {
    'use strict';
    
    // ================================================================
    // ESTILOS DO DROPDOWN PERSONALIZADO
    // ================================================================
    
    const styles = `
        /* Remove a aparência nativa do select */
        .custom-select-hidden {
            position: absolute !important;
            opacity: 0 !important;
            pointer-events: none !important;
            width: 100% !important;
            height: 100% !important;
            z-index: -1 !important;
        }
        
        /* Wrapper principal */
        .custom-select-wrapper {
            position: relative;
            width: 100%;
            display: block;
            min-height: 48px;
            margin: 4px 0;
        }
        
        /* Display - o que o usuário vê */
        .custom-select-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            min-height: 48px;
            padding: 0 16px;
            background: var(--card-bg, #ffffff);
            border: 1.5px solid var(--primary, #00843d);
            border-radius: 14px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text, #1a2a21);
            transition: all 0.2s ease;
            box-sizing: border-box;
            user-select: none;
            position: relative;
            background-color: var(--white, #ffffff);
        }
        
        /* Efeito hover */
        .custom-select-display:hover {
            border-color: #00a54c;
            box-shadow: 0 2px 8px rgba(0, 132, 61, 0.1);
        }
        
        /* Quando está ativo (aberto) */
        .custom-select-display.active {
            border-color: var(--primary, #00843d);
            box-shadow: 0 2px 12px rgba(0, 132, 61, 0.15);
        }
        
        /* Texto selecionado */
        .custom-select-text {
            flex: 1;
            color: var(--text, #1a2a21);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 8px;
        }
        
        /* Placeholder (quando nenhuma opção está selecionada) */
        .custom-select-text.placeholder {
            color: var(--gray, #6d7c74);
            font-weight: 400;
        }
        
        /* Seta animada */
        .custom-select-arrow {
            color: var(--primary, #00843d);
            font-size: 0.8rem;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            margin-left: 8px;
        }
        
        .custom-select-arrow.open {
            transform: rotate(180deg);
        }
        
        /* Container das opções */
        .custom-select-options {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            width: 100%;
            min-width: 100%;
            background: var(--white, #ffffff);
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            z-index: 10000;
            display: none;
            max-height: 0;
            overflow: hidden;
            padding: 0;
            border: 1px solid rgba(0, 132, 61, 0.08);
            box-sizing: border-box;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
        }
        
        /* Quando aberto */
        .custom-select-options.open {
            display: block;
            max-height: 280px;
            overflow-y: auto;
            padding: 6px;
            opacity: 1;
            transform: translateY(0) scale(1);
            animation: selectFadeIn 0.2s ease-out;
        }
        
        /* Scrollbar */
        .custom-select-options::-webkit-scrollbar {
            width: 4px;
        }
        
        .custom-select-options::-webkit-scrollbar-track {
            background: var(--bg, #f0f2f0);
            border-radius: 4px;
        }
        
        .custom-select-options::-webkit-scrollbar-thumb {
            background: var(--primary, #00843d);
            border-radius: 4px;
        }
        
        .custom-select-options::-webkit-scrollbar-thumb:hover {
            background: #00a54c;
        }
        
        /* Cada opção */
        .custom-select-option {
            padding: 10px 14px;
            cursor: pointer;
            background: transparent;
            color: var(--text, #1a2a21);
            margin: 2px 0;
            border-radius: 12px;
            transition: all 0.2s ease;
            font-size: 0.85rem;
            font-weight: 500;
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .custom-select-option:hover {
            background: rgba(0, 132, 61, 0.08);
            transform: translateX(4px);
        }
        
        .custom-select-option.selected {
            background: rgba(0, 132, 61, 0.12);
            color: var(--primary, #00843d);
        }
        
        .custom-select-option.selected::after {
            content: '✓';
            margin-left: auto;
            color: var(--primary, #00843d);
            font-weight: 700;
        }
        
        .custom-select-option.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }
        
        /* Label flutuante (opcional) */
        .custom-select-floating-label {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--gray, #6d7c74);
            pointer-events: none;
            transition: all 0.2s ease;
            opacity: 0;
            visibility: hidden;
        }
        
        .custom-select-wrapper.has-value .custom-select-floating-label {
            opacity: 0.7;
            visibility: visible;
            top: 6px;
            transform: translateY(0);
            font-size: 0.6rem;
        }
        
        .custom-select-wrapper.has-value .custom-select-display {
            padding-top: 18px;
            padding-bottom: 4px;
        }
        
        /* Animação */
        @keyframes selectFadeIn {
            from {
                opacity: 0;
                transform: translateY(-8px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        /* Tema escuro */
        [data-theme="dark"] .custom-select-display {
            background: #1a1a1a;
            border-color: #333;
            color: #f0f2f0;
        }
        
        [data-theme="dark"] .custom-select-text {
            color: #f0f2f0;
        }
        
        [data-theme="dark"] .custom-select-options {
            background: #1a1a1a;
            border-color: #333;
        }
        
        [data-theme="dark"] .custom-select-option {
            color: #f0f2f0;
        }
        
        [data-theme="dark"] .custom-select-option:hover {
            background: rgba(0, 132, 61, 0.15);
        }
        
        [data-theme="dark"] .custom-select-option.selected {
            background: rgba(0, 132, 61, 0.2);
            color: #00a54c;
        }
        
        [data-theme="dark"] .custom-select-option.selected::after {
            color: #00a54c;
        }
    `;
    
    // ================================================================
    // CRIAÇÃO DO DROPDOWN PERSONALIZADO
    // ================================================================
    
    function criarDropdownPersonalizado(select) {
        // Verifica se já foi processado
        if (select.dataset.customDropdown === 'true') return;
        select.dataset.customDropdown = 'true';
        
        // Salva o valor inicial
        const valorInicial = select.value;
        
        // Cria o wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        // Adiciona classe se tiver valor selecionado
        if (valorInicial) {
            wrapper.classList.add('has-value');
        }
        
        // Cria o display (o que o usuário vê)
        const display = document.createElement('div');
        display.className = 'custom-select-display';
        display.setAttribute('role', 'combobox');
        display.setAttribute('aria-haspopup', 'listbox');
        display.setAttribute('aria-expanded', 'false');
        
        // Texto do display
        const textSpan = document.createElement('span');
        textSpan.className = 'custom-select-text';
        const optionSelecionada = select.options[select.selectedIndex];
        if (optionSelecionada && optionSelecionada.value) {
            textSpan.textContent = optionSelecionada.textContent;
        } else {
            textSpan.textContent = select.getAttribute('data-placeholder') || 'Selecione...';
            textSpan.classList.add('placeholder');
        }
        display.appendChild(textSpan);
        
        // Seta
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'custom-select-arrow';
        arrowSpan.innerHTML = '▼';
        display.appendChild(arrowSpan);
        
        // Container das opções
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-select-options';
        optionsContainer.setAttribute('role', 'listbox');
        
        // Adiciona as opções
        Array.from(select.options).forEach((opt, index) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'custom-select-option';
            optDiv.textContent = opt.textContent;
            optDiv.dataset.value = opt.value;
            optDiv.dataset.index = index;
            optDiv.setAttribute('role', 'option');
            
            // Se estiver selecionada
            if (opt.selected) {
                optDiv.classList.add('selected');
            }
            
            // Se estiver desabilitada
            if (opt.disabled) {
                optDiv.classList.add('disabled');
            }
            
            // Evento de clique
            optDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                const valor = this.dataset.value;
                const texto = this.textContent;
                
                // Atualiza o select original
                select.value = valor;
                
                // Atualiza o display
                textSpan.textContent = texto;
                textSpan.classList.remove('placeholder');
                wrapper.classList.add('has-value');
                
                // Remove seleção de todas as opções
                optionsContainer.querySelectorAll('.custom-select-option').forEach(el => {
                    el.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Fecha o dropdown
                fecharDropdown();
                
                // Dispara evento change no select original
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
            });
            
            optionsContainer.appendChild(optDiv);
        });
        
        // ================================================================
        // FUNÇÕES DE CONTROLE DO DROPDOWN
        // ================================================================
        
        function abrirDropdown() {
            // Fecha outros dropdowns abertos
            document.querySelectorAll('.custom-select-options.open').forEach(el => {
                if (el !== optionsContainer) {
                    el.classList.remove('open');
                    el.closest('.custom-select-wrapper').querySelector('.custom-select-display').classList.remove('active');
                    el.closest('.custom-select-wrapper').querySelector('.custom-select-arrow').classList.remove('open');
                }
            });
            
            optionsContainer.classList.add('open');
            display.classList.add('active');
            arrowSpan.classList.add('open');
            display.setAttribute('aria-expanded', 'true');
        }
        
        function fecharDropdown() {
            optionsContainer.classList.remove('open');
            display.classList.remove('active');
            arrowSpan.classList.remove('open');
            display.setAttribute('aria-expanded', 'false');
        }
        
        function toggleDropdown() {
            if (optionsContainer.classList.contains('open')) {
                fecharDropdown();
            } else {
                abrirDropdown();
            }
        }
        
        // ================================================================
        // EVENTOS
        // ================================================================
        
        // Clique no display abre/fecha
        display.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown();
        });
        
        // Atualiza o select quando o valor muda programaticamente
        select.addEventListener('change', function() {
            const opt = this.options[this.selectedIndex];
            if (opt && opt.value) {
                textSpan.textContent = opt.textContent;
                textSpan.classList.remove('placeholder');
                wrapper.classList.add('has-value');
                
                optionsContainer.querySelectorAll('.custom-select-option').forEach(el => {
                    el.classList.remove('selected');
                    if (el.dataset.value === this.value) {
                        el.classList.add('selected');
                    }
                });
            } else {
                textSpan.textContent = select.getAttribute('data-placeholder') || 'Selecione...';
                textSpan.classList.add('placeholder');
                wrapper.classList.remove('has-value');
                
                optionsContainer.querySelectorAll('.custom-select-option').forEach(el => {
                    el.classList.remove('selected');
                });
            }
        });
        
        // Fecha ao clicar fora
        document.addEventListener('click', function(e) {
            if (!wrapper.contains(e.target)) {
                fecharDropdown();
            }
        });
        
        // Fecha com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                fecharDropdown();
            }
            if (e.key === 'Enter' || e.key === ' ') {
                if (display === document.activeElement) {
                    e.preventDefault();
                    toggleDropdown();
                }
            }
        });
        
        // Navegação por teclado (setas)
        document.addEventListener('keydown', function(e) {
            if (!optionsContainer.classList.contains('open')) return;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const options = optionsContainer.querySelectorAll('.custom-select-option:not(.disabled)');
                const current = optionsContainer.querySelector('.custom-select-option.hover');
                let index = -1;
                
                if (current) {
                    index = Array.from(options).indexOf(current);
                }
                
                if (e.key === 'ArrowDown') {
                    index = Math.min(index + 1, options.length - 1);
                } else {
                    index = Math.max(index - 1, 0);
                }
                
                options.forEach(el => el.classList.remove('hover'));
                if (options[index]) {
                    options[index].classList.add('hover');
                    options[index].scrollIntoView({ block: 'nearest' });
                }
            }
            
            if (e.key === 'Enter') {
                const hovered = optionsContainer.querySelector('.custom-select-option.hover');
                if (hovered) {
                    hovered.click();
                }
            }
        });
        
        // ================================================================
        // MONTA O DROPDOWN
        // ================================================================
        
        // Adiciona os elementos ao wrapper
        wrapper.appendChild(display);
        wrapper.appendChild(optionsContainer);
        
        // Adiciona o select original ao wrapper (escondido)
        select.style.position = 'absolute';
        select.style.opacity = '0';
        select.style.pointerEvents = 'none';
        select.style.width = '100%';
        select.style.height = '100%';
        select.style.zIndex = '-1';
        wrapper.appendChild(select);
        
        // Substitui o select pelo wrapper
        select.parentNode.replaceChild(wrapper, select);
        
        // Retorna o wrapper para referência
        return wrapper;
    }
    
    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    
    function initDropdowns() {
        // Aplica a TODOS os selects
        const selects = document.querySelectorAll('select:not([data-custom-dropdown="true"])');
        
        selects.forEach(select => {
            // Ignora selects que já estão dentro de um wrapper
            if (select.closest('.custom-select-wrapper')) return;
            
            // Ignora selects com atributo data-native="true"
            if (select.dataset.native === 'true') return;
            
            criarDropdownPersonalizado(select);
        });
        
        console.log(`✅ Dropdown personalizado aplicado a ${selects.length} select(s)`);
    }
    
    // ================================================================
    // ADICIONA OS ESTILOS AO HEAD
    // ================================================================
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // ================================================================
    // INICIA QUANDO O DOM ESTIVER PRONTO
    // ================================================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdowns);
    } else {
        initDropdowns();
    }




    // ================================================================
    // OBSERVA MUDANÇAS NO DOM (para selects adicionados dinamicamente)
    // ================================================================
    
    const observer = new MutationObserver(function(mutations) {
        let precisaAplicar = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.matches && node.matches('select')) {
                        precisaAplicar = true;
                    }
                    if (node.querySelectorAll && node.querySelectorAll('select').length > 0) {
                        precisaAplicar = true;
                    }
                }
            });
        });
        if (precisaAplicar) {
            setTimeout(initDropdowns, 50);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // ================================================================
    // EXPÕE FUNÇÃO GLOBAL (para uso manual)
    // ================================================================
    
    window.initCustomDropdowns = initDropdowns;
    
    console.log('🚀 Dropdown Personalizado carregado com sucesso!');
    console.log('💡 Para aplicar a novos selects, chame: initCustomDropdowns()');
    
})();

      