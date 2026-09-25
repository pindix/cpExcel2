// ============================================================
// SISTEMA AUTOMÁTICO DE PERSISTÊNCIA DE DADOS (VERSÃO COMPLETA)
// ============================================================

let valorDoencaRestaurado = null;

(function () {
    const pageId = window.location.pathname.split('/').slice(-2, -1)[0] || 'raiz';

    function salvarEstado() {
        const estado = {};

        // ===== 1. SALVA INPUTS E SELECTS =====
        document.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.id) estado[input.id] = input.value;
        });

        // ===== 2. SALVA O NOME DO MEDICAMENTO =====
        const inputNome = document.getElementById('nome');
        if (inputNome && inputNome.value) estado.nome_medicamento = inputNome.value;

        // ===== 3. SALVA O VALOR DA DOENÇA =====
        const selDoenca = document.getElementById('selDoenca');
        if (selDoenca && selDoenca.value) estado.valor_doenca = selDoenca.value;


        // ===== SALVA OS SELECTS DO SISTEMA ABO =====
        const tipoPaciente = document.getElementById('tipo_paciente');
        if (tipoPaciente) {
            estado._tipoPaciente = tipoPaciente.value;
            const displayText = document.getElementById('pacienteSelecionado');
            if (displayText) {
                estado._tipoPacienteLabel = displayText.textContent;
            }
        }

        const tipoDoador = document.getElementById('tipo_doador');
        if (tipoDoador) {
            estado._tipoDoador = tipoDoador.value;
            const displayText = document.getElementById('doadorSelecionado');
            if (displayText) {
                estado._tipoDoadorLabel = displayText.textContent;
            }
        }

        const sanguePai = document.getElementById('sangue_pai');
        if (sanguePai) {
            estado._sanguePai = sanguePai.value;
            const displayText = document.getElementById('paiSelecionado');
            if (displayText) {
                estado._sanguePaiLabel = displayText.textContent;
            }
        }

        const sangueMae = document.getElementById('sangue_mae');
        if (sangueMae) {
            estado._sangueMae = sangueMae.value;
            const displayText = document.getElementById('maeSelecionado');
            if (displayText) {
                estado._sangueMaeLabel = displayText.textContent;
            }
        }

        // ===== 4. SALVA O medAtivo =====
        if (typeof medAtivo !== 'undefined' && medAtivo) {
            estado.medAtivo_salvo = {
                nome: medAtivo.nome,
                formula: medAtivo.formula,
                concentracao: medAtivo.concentracao,
                intervalo: medAtivo.intervalo,
                dose: medAtivo.dose,
                via: medAtivo.via,
                campos: medAtivo.campos,
                p_min: medAtivo.p_min,
                p_max: medAtivo.p_max,
                i_min: medAtivo.i_min,
                i_max: medAtivo.i_max,
                d_min: medAtivo.d_min,
                d_max: medAtivo.d_max
            };
        }

        // ===== 5. SALVA O RESULTADO (APENAS SE VISÍVEL) =====
        const resultado = document.getElementById('resultado');
        if (resultado && resultado.innerHTML && resultado.classList.contains('visivel')) {
            estado._resultadoHTML = resultado.innerHTML;
            estado._resultadoCor = resultado.style.background || '';
        }

        // ===== 6. SALVA O PACIENTE ATIVO =====
        if (typeof pacienteAtivo !== 'undefined' && pacienteAtivo) {
            estado._pacienteAtivo = pacienteAtivo;
        }

        // ===== 7. SALVA O HISTÓRICO DE MEDIÇÕES =====
        if (typeof historicoMedicoes !== 'undefined' && historicoMedicoes && historicoMedicoes.length > 0) {
            estado._historicoMedicoes = historicoMedicoes;
        }

        // ===== 8. SALVA OS SELECTS PERSONALIZADOS (Sinais Vitais) =====
        if (typeof fonteAtual !== 'undefined') {
            estado._fonteAtual = fonteAtual;
        }
        if (typeof faixaAtual !== 'undefined') {
            estado._faixaAtual = faixaAtual;
        }
        if (typeof fonteSidebarAtual !== 'undefined') {
            estado._fonteSidebarAtual = fonteSidebarAtual;
        }
        if (typeof faixaSidebarAtual !== 'undefined') {
            estado._faixaSidebarAtual = faixaSidebarAtual;
        }

        // ===== 9. SALVA OS SELECTS DE UNIDADE (Fórmula Internacional) =====
        const unidadeDosagem = document.getElementById('unidade_de_dosagem');
        if (unidadeDosagem) {
            estado._unidadeDosagemValor = unidadeDosagem.value;
            const displayText = document.getElementById('unidadeDosagemSelecionada');
            if (displayText) {
                estado._unidadeDosagemLabel = displayText.textContent;
            }
        }

        const unidadeConcentracao = document.getElementById('unidade_de_concentracao');
        if (unidadeConcentracao) {
            estado._unidadeConcentracaoValor = unidadeConcentracao.value;
            const displayText = document.getElementById('unidadeConcentracaoSelecionada');
            if (displayText) {
                estado._unidadeConcentracaoLabel = displayText.textContent;
            }
        }

        // ===== 10. SALVA OS SELECTS DO CONVERSOR =====
        const unidadeIndicado = document.getElementById('unidade_do_indicado');
        if (unidadeIndicado) {
            estado._unidadeIndicadoValor = unidadeIndicado.value;
            const displayText = document.getElementById('unidadeIndicadoSelecionada');
            if (displayText) {
                estado._unidadeIndicadoLabel = displayText.textContent;
            }
        }

        const unidadeDisponivel = document.getElementById('unidade_do_disponivel');
        if (unidadeDisponivel) {
            estado._unidadeDisponivelValor = unidadeDisponivel.value;
            const displayText = document.getElementById('unidadeDisponivelSelecionada');
            if (displayText) {
                estado._unidadeDisponivelLabel = displayText.textContent;
            }
        }

        // ===== 11. SALVA OS SELECTS DO GOTEJAMENTO =====
        const unidadeVolume = document.getElementById('unidade_de_volume');
        if (unidadeVolume) {
            estado._unidadeVolumeValor = unidadeVolume.value;
            const displayText = document.getElementById('unidadeVolumeSelecionada');
            if (displayText) {
                estado._unidadeVolumeLabel = displayText.textContent;
            }
        }

        const unidadeTempo = document.getElementById('unidade_de_tempo');
        if (unidadeTempo) {
            estado._unidadeTempoValor = unidadeTempo.value;
            const displayText = document.getElementById('unidadeTempoSelecionada');
            if (displayText) {
                estado._unidadeTempoLabel = displayText.textContent;
            }
        }

        // ===== 12. SALVA O SELECT DO ANTROPOMETRIA =====
        const modoCalculo = document.getElementById('modo_calculo');
        if (modoCalculo) {
            estado._modoCalculo = modoCalculo.value;
            const displayText = document.getElementById('modoSelecionado');
            if (displayText) {
                estado._modoCalculoLabel = displayText.textContent;
            }
        }

        // ===== 12.1. SALVA A FÓRMULA ESCOLHIDA =====
        const formulaEscolhida = document.getElementById('formula_escolhida');
        const formulaTipo = document.getElementById('formula_tipo');
        if (formulaEscolhida && formulaTipo) {
            estado._formulaEscolhida = formulaEscolhida.value;
            estado._formulaTipo = formulaTipo.value;
            const displayText = document.getElementById('formulaSelecionada');
            if (displayText) {
                estado._formulaLabel = displayText.textContent;
            }
        }

        // ===== 13. SALVA OS SELECTS DA DILUIÇÃO =====
        const massaUnidade = document.getElementById('massa_unidade');
        if (massaUnidade) {
            estado._massaUnidadeValor = massaUnidade.value;
            const displayText = document.getElementById('massaUnidadeSelecionada');
            if (displayText) {
                estado._massaUnidadeLabel = displayText.textContent;
            }
        }

        const volumeUnidadeDiluicao = document.getElementById('vol_unidade');
        if (volumeUnidadeDiluicao) {
            estado._volumeUnidadeDiluicaoValor = volumeUnidadeDiluicao.value;
            const displayText = document.getElementById('volumeUnidadeSelecionada');
            if (displayText) {
                estado._volumeUnidadeDiluicaoLabel = displayText.textContent;
            }
        }

        const doseUnidade = document.getElementById('dose_unidade');
        if (doseUnidade) {
            estado._doseUnidadeValor = doseUnidade.value;
            const displayText = document.getElementById('doseUnidadeSelecionada');
            if (displayText) {
                estado._doseUnidadeLabel = displayText.textContent;
            }
        }

        // ===== 14. SALVA O MODO DO GESTOGRAMA =====
        let modoParaSalvar = null;
        if (typeof modoAtual !== 'undefined' && modoAtual) {
            modoParaSalvar = modoAtual;
        } else if (typeof window.modoAtual !== 'undefined' && window.modoAtual) {
            modoParaSalvar = window.modoAtual;
        }
        if (modoParaSalvar) {
            estado._modoAtual = modoParaSalvar;
        }
        
        if (typeof window.estado !== 'undefined' && window.estado && typeof window.estado.intervaloAtual !== 'undefined') {
            estado._intervaloAtual = window.estado.intervaloAtual;
        }
        
        let cicloParaSalvar = null;
        if (typeof window.isCicloAtivo !== 'undefined') {
            cicloParaSalvar = window.isCicloAtivo;
        } else if (typeof window.estado !== 'undefined' && window.estado && typeof window.estado.isCicloAtivo !== 'undefined') {
            cicloParaSalvar = window.estado.isCicloAtivo;
        }
        if (cicloParaSalvar !== null) {
            estado._isCicloAtivo = cicloParaSalvar;
        }
        
        let naoSeiParaSalvar = null;
        if (typeof window.isNaoSeiDum !== 'undefined') {
            naoSeiParaSalvar = window.isNaoSeiDum;
        } else if (typeof window.estado !== 'undefined' && window.estado && typeof window.estado.isNaoSeiDum !== 'undefined') {
            naoSeiParaSalvar = window.estado.isNaoSeiDum;
        }
        if (naoSeiParaSalvar !== null) {
            estado._isNaoSeiDum = naoSeiParaSalvar;
        }

        // ===== 14.1. SALVA O PAINEL DE DETALHES MÉDICOS (GESTOGRAMA) =====
        const painelDetalhes = document.getElementById('detalhesMedicosPainel');
        const scrollDetalhes = document.getElementById('detalhesMedicosScroll');

        if (painelDetalhes) {
            estado._painelDetalhesAberto = painelDetalhes.classList.contains('aberto');
            estado._painelDetalhesDisplay = painelDetalhes.style.display || '';
        }

        if (scrollDetalhes && scrollDetalhes.innerHTML.trim()) {
            estado._painelDetalhesHTML = scrollDetalhes.innerHTML;
            estado._painelDetalhesScrollTop = scrollDetalhes.scrollTop;
        }

        sessionStorage.setItem(`matclinica_${pageId}`, JSON.stringify(estado));
    }

    function restaurarEstado() {
        const salvo = sessionStorage.getItem(`matclinica_${pageId}`);
        if (!salvo) return;

        const estado = JSON.parse(salvo);

        // ===== 1. RESTAURA INPUTS =====
        for (const [id, valor] of Object.entries(estado)) {
            if (id === '_resultadoHTML' ||
                id === '_resultadoCor' ||
                id === 'nome_medicamento' ||
                id === 'medAtivo_salvo' ||
                id === 'valor_doenca' ||
                id === '_pacienteAtivo' ||
                id === '_historicoMedicoes' ||
                id === '_fonteAtual' ||
                id === '_faixaAtual' ||
                id === '_fonteSidebarAtual' ||
                id === '_faixaSidebarAtual' ||
                id === '_modoAtual' ||
                id === '_intervaloAtual' ||
                id === '_isCicloAtivo' ||
                id === '_isNaoSeiDum' ||
                id === '_painelDetalhesAberto' ||
                id === '_painelDetalhesDisplay' ||
                id === '_painelDetalhesHTML' ||
                id === '_painelDetalhesScrollTop' ||
                id === '_unidadeDosagemValor' ||
                id === '_unidadeDosagemLabel' ||
                id === '_unidadeConcentracaoValor' ||
                id === '_unidadeConcentracaoLabel' ||
                id === '_unidadeIndicadoValor' ||
                id === '_unidadeIndicadoLabel' ||
                id === '_unidadeDisponivelValor' ||
                id === '_unidadeDisponivelLabel' ||
                id === '_unidadeVolumeValor' ||
                id === '_unidadeVolumeLabel' ||
                id === '_unidadeTempoValor' ||
                id === '_unidadeTempoLabel' ||
                id === '_modoCalculo' ||
                id === '_modoCalculoLabel' ||
                id === '_formulaEscolhida' ||
                id === '_formulaTipo' ||
                id === '_formulaLabel' ||
                id === '_massaUnidadeValor' ||
                id === '_massaUnidadeLabel' ||
                id === '_volumeUnidadeDiluicaoValor' ||
                id === '_volumeUnidadeDiluicaoLabel' ||
                id === '_doseUnidadeValor' ||
                id === '_doseUnidadeLabel' ||
                id === '_tipoPaciente' ||
                id === '_tipoPacienteLabel' ||
                id === '_tipoDoador' ||
                id === '_tipoDoadorLabel' ||
                id === '_sanguePai' ||
                id === '_sanguePaiLabel' ||
                id === '_sangueMae' ||
                id === '_sangueMaeLabel') continue;
            const campo = document.getElementById(id);
            if (campo) campo.value = valor;
        }

        // ===== 2. RESTAURA NOME DO MEDICAMENTO =====
        if (estado.nome_medicamento) {
            const inputNome = document.getElementById('nome');
            if (inputNome) inputNome.value = estado.nome_medicamento;
        }

        // ===== 3. RESTAURA medAtivo =====
        if (estado.medAtivo_salvo && typeof medAtivo !== 'undefined') {
            medAtivo = estado.medAtivo_salvo;
            if (medAtivo.dose && camposDivs?.dose) camposDivs.dose.value = medAtivo.dose.toLowerCase();
            if (medAtivo.via && camposDivs?.via) camposDivs.via.value = medAtivo.via.toLowerCase();
        }

        // ===== 4. RESTAURA O VALOR DA DOENÇA =====
        if (estado.valor_doenca) {
            window.valorDoencaRestaurado = estado.valor_doenca;
        }

        // ===== 5. RESTAURA OS SELECTS PERSONALIZADOS (Sinais Vitais) =====
        if (estado._fonteAtual && typeof selecionarFonte === 'function') {
            setTimeout(() => {
                try {
                    if (typeof fonteAtual !== 'undefined') {
                        fonteAtual = estado._fonteAtual;
                        if (typeof atualizarFaixasEtarias === 'function') {
                            atualizarFaixasEtarias();
                        }
                        const fonteSelecionada = document.getElementById('fonteSelecionada');
                        const opcoes = document.querySelectorAll('#fonteOptions .custom-select-option');
                        opcoes.forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._fonteAtual) {
                                opt.classList.add('selecionado');
                                const titulo = opt.querySelector('.option-titulo')?.textContent || estado._fonteAtual;
                                const icone = opt.querySelector('i')?.className || '';
                                fonteSelecionada.innerHTML = `<i class="${icone}"></i> ${titulo}`;
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar fonte:', e); }
            }, 300);
        }

        if (estado._faixaAtual && typeof selecionarFaixa === 'function') {
            setTimeout(() => {
                try {
                    if (typeof faixaAtual !== 'undefined') {
                        faixaAtual = estado._faixaAtual;
                        const faixaSelecionada = document.getElementById('faixaSelecionada');
                        const opcoes = document.querySelectorAll('#faixaOptions .custom-select-option');
                        opcoes.forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._faixaAtual) {
                                opt.classList.add('selecionado');
                                const label = opt.querySelector('.option-titulo')?.textContent || estado._faixaAtual;
                                faixaSelecionada.innerHTML = label;
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar faixa:', e); }
            }, 400);
        }

        if (estado._fonteSidebarAtual && typeof selecionarFonteSidebar === 'function') {
            setTimeout(() => {
                try {
                    if (typeof fonteSidebarAtual !== 'undefined') {
                        fonteSidebarAtual = estado._fonteSidebarAtual;
                        if (typeof atualizarFaixasSidebar === 'function') {
                            atualizarFaixasSidebar();
                        }
                        const fonteSelecionada = document.getElementById('fonteSelecionadaSidebar');
                        const opcoes = document.querySelectorAll('#fonteOptionsSidebar .custom-select-option-sidebar');
                        opcoes.forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._fonteSidebarAtual) {
                                opt.classList.add('selecionado');
                                const titulo = opt.querySelector('.option-titulo')?.textContent || estado._fonteSidebarAtual;
                                const icone = opt.querySelector('i')?.className || '';
                                fonteSelecionada.innerHTML = `<i class="${icone}"></i> ${titulo}`;
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar fonte sidebar:', e); }
            }, 500);
        }

        // ===== RESTAURA OS SELECTS DO SISTEMA ABO =====
        if (estado._tipoPaciente) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('tipo_paciente');
                    if (hidden) hidden.value = estado._tipoPaciente;
                    const display = document.getElementById('pacienteSelecionado');
                    if (display && estado._tipoPacienteLabel) {
                        display.textContent = estado._tipoPacienteLabel;
                        display.classList.add('selecionado');
                    }
                    const container = document.getElementById('pacienteOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-sangue').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._tipoPaciente) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar paciente:', e); }
            }, 700);
        }

        if (estado._tipoDoador) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('tipo_doador');
                    if (hidden) hidden.value = estado._tipoDoador;
                    const display = document.getElementById('doadorSelecionado');
                    if (display && estado._tipoDoadorLabel) {
                        display.textContent = estado._tipoDoadorLabel;
                        display.classList.add('selecionado');
                    }
                    const container = document.getElementById('doadorOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-sangue').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._tipoDoador) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar doador:', e); }
            }, 800);
        }

        if (estado._sanguePai) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('sangue_pai');
                    if (hidden) hidden.value = estado._sanguePai;
                    const display = document.getElementById('paiSelecionado');
                    if (display && estado._sanguePaiLabel) {
                        display.textContent = estado._sanguePaiLabel;
                        display.classList.add('selecionado');
                    }
                    const container = document.getElementById('paiOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-sangue').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._sanguePai) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar pai:', e); }
            }, 900);
        }

        if (estado._sangueMae) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('sangue_mae');
                    if (hidden) hidden.value = estado._sangueMae;
                    const display = document.getElementById('maeSelecionado');
                    if (display && estado._sangueMaeLabel) {
                        display.textContent = estado._sangueMaeLabel;
                        display.classList.add('selecionado');
                    }
                    const container = document.getElementById('maeOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-sangue').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._sangueMae) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar mãe:', e); }
            }, 1000);
        }

        if (estado._faixaSidebarAtual && typeof selecionarFaixaSidebar === 'function') {
            setTimeout(() => {
                try {
                    if (typeof faixaSidebarAtual !== 'undefined') {
                        faixaSidebarAtual = estado._faixaSidebarAtual;
                        const faixaSelecionada = document.getElementById('faixaSelecionadaSidebar');
                        const opcoes = document.querySelectorAll('#faixaOptionsSidebar .custom-select-option-sidebar');
                        opcoes.forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._faixaSidebarAtual) {
                                opt.classList.add('selecionado');
                                const label = opt.querySelector('.option-titulo')?.textContent || estado._faixaSidebarAtual;
                                faixaSelecionada.innerHTML = label;
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar faixa sidebar:', e); }
            }, 600);
        }

        // ===== 6. RESTAURA OS SELECTS DE UNIDADE (Fórmula Internacional) =====
        if (estado._unidadeDosagemValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('unidade_de_dosagem');
                    if (hidden) hidden.value = estado._unidadeDosagemValor;
                    const display = document.getElementById('unidadeDosagemSelecionada');
                    if (display && estado._unidadeDosagemLabel) {
                        display.textContent = estado._unidadeDosagemLabel;
                    }
                    const container = document.getElementById('unidadeDosagemOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._unidadeDosagemValor ||
                                opt.querySelector('.option-label')?.textContent === estado._unidadeDosagemLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade de dosagem:', e); }
            }, 700);
        }

        if (estado._unidadeConcentracaoValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('unidade_de_concentracao');
                    if (hidden) hidden.value = estado._unidadeConcentracaoValor;
                    const display = document.getElementById('unidadeConcentracaoSelecionada');
                    if (display && estado._unidadeConcentracaoLabel) {
                        display.textContent = estado._unidadeConcentracaoLabel;
                    }
                    const container = document.getElementById('unidadeConcentracaoOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._unidadeConcentracaoValor ||
                                opt.querySelector('.option-label')?.textContent === estado._unidadeConcentracaoLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade de concentração:', e); }
            }, 800);
        }

        // ===== 7. RESTAURA OS SELECTS DO CONVERSOR =====
        if (estado._unidadeIndicadoValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('unidade_do_indicado');
                    if (hidden) hidden.value = estado._unidadeIndicadoValor;
                    const display = document.getElementById('unidadeIndicadoSelecionada');
                    if (display && estado._unidadeIndicadoLabel) {
                        display.textContent = estado._unidadeIndicadoLabel;
                    }
                    const container = document.getElementById('unidadeIndicadoOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._unidadeIndicadoValor ||
                                opt.querySelector('.option-label')?.textContent === estado._unidadeIndicadoLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade indicado:', e); }
            }, 700);
        }

        if (estado._unidadeDisponivelValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('unidade_do_disponivel');
                    if (hidden) hidden.value = estado._unidadeDisponivelValor;
                    const display = document.getElementById('unidadeDisponivelSelecionada');
                    if (display && estado._unidadeDisponivelLabel) {
                        display.textContent = estado._unidadeDisponivelLabel;
                    }
                    const container = document.getElementById('unidadeDisponivelOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._unidadeDisponivelValor ||
                                opt.querySelector('.option-label')?.textContent === estado._unidadeDisponivelLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade disponível:', e); }
            }, 800);
        }

        // ===== 8. RESTAURA OS SELECTS DO GOTEJAMENTO =====
        if (estado._unidadeVolumeValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('unidade_de_volume');
                    if (hidden) hidden.value = estado._unidadeVolumeValor;
                    const display = document.getElementById('unidadeVolumeSelecionada');
                    if (display && estado._unidadeVolumeLabel) {
                        display.textContent = estado._unidadeVolumeLabel;
                    }
                    const container = document.getElementById('unidadeVolumeOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._unidadeVolumeValor ||
                                opt.querySelector('.option-label')?.textContent === estado._unidadeVolumeLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade volume:', e); }
            }, 700);
        }

        if (estado._unidadeTempoValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('unidade_de_tempo');
                    if (hidden) hidden.value = estado._unidadeTempoValor;
                    const display = document.getElementById('unidadeTempoSelecionada');
                    if (display && estado._unidadeTempoLabel) {
                        display.textContent = estado._unidadeTempoLabel;
                    }
                    const container = document.getElementById('unidadeTempoOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-unidade').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._unidadeTempoValor ||
                                opt.querySelector('.option-label')?.textContent === estado._unidadeTempoLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade tempo:', e); }
            }, 800);
        }

        // ============================================================================
        // 9. RESTAURA O SELECT E OS VALORES DO ANTROPOMETRIA
        // ============================================================================
        // ESTRATÉGIA: 
        // 1. Selecionar o modo (que chama ajustarInterface() e LIMPA o input)
        // 2. Restaurar a fórmula
        // 3. DEPOIS de ajustarInterface(), restaurar o valor do input
        // 4. Por fim, restaurar o resultado HTML
        // ============================================================================
        if (estado._modoCalculo) {
            setTimeout(() => {
                try {
                    // Passo 1: Restaura o modo
                    const hidden = document.getElementById('modo_calculo');
                    if (hidden) hidden.value = estado._modoCalculo;
                    
                    const display = document.getElementById('modoSelecionado');
                    if (display && estado._modoCalculoLabel) {
                        display.textContent = estado._modoCalculoLabel;
                    }
                    
                    const container = document.getElementById('modoOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-antropometria').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._modoCalculo) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                    
                    // Passo 2: Chama ajustarInterface() (que limpa o input)
                    if (typeof ajustarInterface === 'function') {
                        ajustarInterface();
                    }
                    
                    // Passo 3: Restaura a fórmula
                    if (estado._formulaEscolhida && typeof selecionarFormula === 'function') {
                        setTimeout(() => {
                            try {
                                const tipo = estado._formulaTipo || 'faixaEtaria';
                                const value = estado._formulaEscolhida;
                                const opcao = document.querySelector(
                                    `.formula-option[data-tipo="${tipo}"][data-value="${value}"]`
                                );
                                let label = estado._formulaLabel;
                                if (!label && opcao) {
                                    label = opcao.querySelector('.formula-nome')?.textContent || value;
                                }
                                if (!label) label = value;
                                selecionarFormula(tipo, value, label);
                            } catch (e) { console.warn('Erro ao restaurar fórmula:', e); }
                        }, 30);
                    }
                    
                    // Passo 4: RESTAURA o valor do input DEPOIS do ajustarInterface()
                    setTimeout(() => {
                        if (estado.valor_entrada) {
                            const valorInput = document.getElementById('valor_entrada');
                            if (valorInput) {
                                valorInput.value = estado.valor_entrada;
                                valorInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                        
                        // Passo 5: RESTAURA o resultado HTML com a cor
                        if (estado._resultadoHTML && typeof restaurarResultado === 'function') {
                            restaurarResultado(estado._resultadoHTML, estado._resultadoCor);
                        }
                    }, 80);
                    
                } catch (e) { console.warn('Erro ao restaurar modo de cálculo:', e); }
            }, 700);
        } else {
            // Mesmo sem _modoCalculo, tenta restaurar o valor do input e o resultado
            setTimeout(() => {
                if (estado.valor_entrada) {
                    const valorInput = document.getElementById('valor_entrada');
                    if (valorInput) {
                        valorInput.value = estado.valor_entrada;
                        valorInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
                if (estado._resultadoHTML && typeof restaurarResultado === 'function') {
                    restaurarResultado(estado._resultadoHTML, estado._resultadoCor);
                }
            }, 750);
        }

        // ===== 10. RESTAURA OS SELECTS DA DILUIÇÃO =====
        if (estado._massaUnidadeValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('massa_unidade');
                    if (hidden) hidden.value = estado._massaUnidadeValor;
                    const display = document.getElementById('massaUnidadeSelecionada');
                    if (display && estado._massaUnidadeLabel) {
                        display.textContent = estado._massaUnidadeLabel;
                    }
                    const container = document.getElementById('massaUnidadeOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-diluicao').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._massaUnidadeValor ||
                                opt.querySelector('.option-label')?.textContent === estado._massaUnidadeLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade massa:', e); }
            }, 700);
        }

        if (estado._volumeUnidadeDiluicaoValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('vol_unidade');
                    if (hidden) hidden.value = estado._volumeUnidadeDiluicaoValor;
                    const display = document.getElementById('volumeUnidadeSelecionada');
                    if (display && estado._volumeUnidadeDiluicaoLabel) {
                        display.textContent = estado._volumeUnidadeDiluicaoLabel;
                    }
                    const container = document.getElementById('volumeUnidadeOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-diluicao').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._volumeUnidadeDiluicaoValor ||
                                opt.querySelector('.option-label')?.textContent === estado._volumeUnidadeDiluicaoLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade volume diluição:', e); }
            }, 800);
        }

        if (estado._doseUnidadeValor) {
            setTimeout(() => {
                try {
                    const hidden = document.getElementById('dose_unidade');
                    if (hidden) hidden.value = estado._doseUnidadeValor;
                    const display = document.getElementById('doseUnidadeSelecionada');
                    if (display && estado._doseUnidadeLabel) {
                        display.textContent = estado._doseUnidadeLabel;
                    }
                    const container = document.getElementById('doseUnidadeOptions');
                    if (container) {
                        container.querySelectorAll('.custom-select-option-diluicao').forEach(opt => {
                            opt.classList.remove('selecionado');
                            if (opt.dataset.value === estado._doseUnidadeValor ||
                                opt.querySelector('.option-label')?.textContent === estado._doseUnidadeLabel) {
                                opt.classList.add('selecionado');
                            }
                        });
                    }
                } catch (e) { console.warn('Erro ao restaurar unidade dose:', e); }
            }, 900);
        }

        // ============================================================================
        // 11. RESTAURA O GESTOGRAMA (MODO, INPUTS, TOGGLES, PAINEL, RESULTADO)
        // ============================================================================
        const camposGestograma = [
            'dum_data', 'dpp_data',
            'ig_semanas', 'ig_dias',
            'altura_uterina',
            'mes_dum', 'semana_dum', 'ano_dum'
        ];
        
        if (estado._modoAtual && typeof selecionarModo === 'function') {
            setTimeout(() => {
                try {
                    selecionarModo(estado._modoAtual);

                    const display = document.getElementById('modoSelecionado');
                    if (display) {
                        const opcao = document.querySelector(`#modoOptions .custom-select-option[data-value="${estado._modoAtual}"]`);
                        if (opcao) {
                            const titulo = opcao.querySelector('.option-titulo')?.textContent || estado._modoAtual;
                            const icone = opcao.querySelector('i')?.className || '';
                            display.innerHTML = `<i class="${icone}"></i> ${titulo}`;
                            opcao.classList.add('selecionado');
                        }
                    }
                } catch (e) { console.warn('Erro ao restaurar modo:', e); }

                setTimeout(() => {
                    try {
                        camposGestograma.forEach(id => {
                            if (estado[id] !== undefined) {
                                const campo = document.getElementById(id);
                                if (campo) {
                                    campo.value = estado[id];
                                    campo.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }
                        });
                    } catch (e) { console.warn('Erro ao restaurar inputs do Gestograma:', e); }
                }, 80);
            }, 700);
        } else if (typeof selecionarModo === 'function') {
            setTimeout(() => {
                camposGestograma.forEach(id => {
                    if (estado[id] !== undefined) {
                        const campo = document.getElementById(id);
                        if (campo) {
                            campo.value = estado[id];
                            campo.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                });
            }, 750);
        }

        if (estado._intervaloAtual !== undefined && typeof window.atualizarIntervalo === 'function') {
            setTimeout(() => {
                try {
                    const valores = document.querySelectorAll('.intervalo-valor');
                    valores.forEach((el, idx) => {
                        if (parseInt(el.getAttribute('data-valor')) === estado._intervaloAtual) {
                            window.atualizarIntervalo(idx);
                        }
                    });
                } catch (e) { }
            }, 850);
        }

        if (estado._isCicloAtivo !== undefined) {
            setTimeout(() => {
                try {
                    const toggleModo = document.getElementById('toggleModo');
                    if (toggleModo) {
                        toggleModo.checked = estado._isCicloAtivo;
                        if (typeof window !== 'undefined') {
                            window.isCicloAtivo = estado._isCicloAtivo;
                        }
                        toggleModo.dispatchEvent(new Event('change'));
                    }
                } catch (e) { console.warn('Erro ao restaurar toggle Ciclo/Gestação:', e); }
            }, 900);
        }

        if (estado._isNaoSeiDum !== undefined) {
            setTimeout(() => {
                try {
                    const toggleNaoSei = document.getElementById('toggleNaoSeiDum');
                    if (toggleNaoSei) {
                        toggleNaoSei.checked = estado._isNaoSeiDum;
                        if (typeof window !== 'undefined') {
                            window.isNaoSeiDum = estado._isNaoSeiDum;
                        }
                        toggleNaoSei.dispatchEvent(new Event('change'));
                    }
                } catch (e) { console.warn('Erro ao restaurar toggle Não sei DUM:', e); }
            }, 950);
        }

        if (estado._painelDetalhesHTML) {
            setTimeout(() => {
                try {
                    const painel = document.getElementById('detalhesMedicosPainel');
                    const scroll = document.getElementById('detalhesMedicosScroll');

                    if (scroll) {
                        scroll.innerHTML = estado._painelDetalhesHTML;
                    }

                    if (painel && estado._painelDetalhesAberto) {
                        painel.style.display = window.innerWidth >= 1024 ? 'flex' : 'block';
                        painel.classList.add('aberto');
                    } else if (painel && estado._painelDetalhesDisplay) {
                        painel.style.display = estado._painelDetalhesDisplay;
                    }

                    if (scroll && estado._painelDetalhesScrollTop !== undefined) {
                        setTimeout(() => {
                            scroll.scrollTop = estado._painelDetalhesScrollTop;
                        }, 150);
                    }
                } catch (e) { console.warn('Erro ao restaurar painel de detalhes:', e); }
            }, 1100);
        }

        // ===== 12. RESTAURA O RESULTADO (fallback global) =====
        if (estado._resultadoHTML && !estado._modoCalculo) {
            setTimeout(() => {
                try {
                    if (typeof restaurarResultado === 'function') {
                        restaurarResultado(estado._resultadoHTML, estado._resultadoCor);
                    } else {
                        const resultado = document.getElementById('resultado');
                        if (resultado) {
                            resultado.innerHTML = estado._resultadoHTML;
                            resultado.classList.add('visivel');
                            if (estado._resultadoHTML.includes('ri-error-warning-fill')) {
                                resultado.style.background = "#f44336";
                            } else {
                                resultado.style.background = "var(--primary)";
                            }
                        }
                    }
                } catch (e) { console.warn('Erro ao restaurar resultado:', e); }
            }, 1200);
        }

        // ===== 13. RESTAURA O PACIENTE ATIVO =====
        if (estado._pacienteAtivo && typeof pacienteAtivo !== 'undefined') {
            setTimeout(() => {
                pacienteAtivo = estado._pacienteAtivo;

                const controlesPadrao = document.getElementById('controles-padrao');
                const tagPaciente = document.getElementById('tag-paciente');
                const btnExportar = document.getElementById('btn-exportar');
                const nomeExibicao = document.getElementById('nome-exibicao');
                const detalhesExibicao = document.getElementById('detalhes-exibicao');

                if (controlesPadrao) controlesPadrao.style.display = 'none';
                if (tagPaciente) tagPaciente.style.display = 'flex';
                if (btnExportar) btnExportar.style.display = 'flex';
                if (nomeExibicao) nomeExibicao.innerText = "Monitorizando: " + pacienteAtivo;

                if (pacientes && pacientes[pacienteAtivo] && detalhesExibicao) {
                    const p = pacientes[pacienteAtivo];
                    const faixasMap = {
                        "recem_nascido_0_1m": "Recém-nascido (0-1 mês)",
                        "lactente_1_12m": "Lactente (1-12 meses)",
                        "crianca_1_5": "Criança (1-5 anos)",
                        "crianca_1_3": "Criança (1-3 anos)",
                        "crianca_3_6": "Criança (3-6 anos)",
                        "crianca_6_12": "Criança (6-12 anos)",
                        "adolescente_12_18": "Adolescente (12-18 anos)",
                        "adolescente_13_18": "Adolescente (13-18 anos)",
                        "idoso_60mais": "Idoso (60 ou mais anos)",
                        "idoso_65mais": "Idoso (65 ou mais anos)",
                        "idoso": "Idoso (60+ anos)",
                        "idoso_feminino": "Idoso Feminino (60+ anos)",
                        "idoso_masculino": "Idoso Masculino (60+ anos)",
                        "adulto": "Adulto (18-60 anos)",
                        "adulto_feminino": "Adulto Feminino (18-60 anos)",
                        "adulto_masculino": "Adulto Masculino (18-60 anos)"
                    };
                    const faixaFormatada = faixasMap[p.info.faixa] || p.info.faixa;
                    detalhesExibicao.innerText = `${faixaFormatada} • ${p.info.pais}`;
                }
            }, 200);
        }

        // ===== 14. RESTAURA O HISTÓRICO DE MEDIÇÕES =====
        if (estado._historicoMedicoes && typeof historicoMedicoes !== 'undefined') {
            setTimeout(() => {
                historicoMedicoes = estado._historicoMedicoes;
                if (typeof atualizarGrafico === 'function') {
                    atualizarGrafico();
                }
            }, 900);
        }

        // ===== 15. CHAMA exibirCampos =====
        if (typeof exibirCampos === 'function') {
            setTimeout(() => exibirCampos(), 1000);
        }

        window.dispatchEvent(new CustomEvent('estadoRestaurado', { detail: { pageId } }));
    }

    // ===== EVENTOS =====
    window.addEventListener('beforeunload', salvarEstado);

    document.addEventListener('input', function (e) {
        if (e.target.matches('input, select, textarea')) salvarEstado();
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-option') || e.target.closest('.custom-select-option-sidebar')) {
            setTimeout(salvarEstado, 100);
        }
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-option-unidade')) {
            setTimeout(salvarEstado, 150);
        }
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-trigger-unidade')) {
            setTimeout(salvarEstado, 100);
        }
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-option-unidade')) {
            setTimeout(salvarEstado, 150);
        }
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-option-unidade')) {
            setTimeout(salvarEstado, 150);
        }
    });
    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-trigger-unidade')) {
            setTimeout(salvarEstado, 100);
        }
    });

    // Salva quando clica no select de modo
    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-option-antropometria')) {
            setTimeout(salvarEstado, 150);
        }
    });
    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-trigger-antropometria')) {
            setTimeout(salvarEstado, 100);
        }
    });

    // 🔥 Salva quando clica numa opção de fórmula
    document.addEventListener('click', function (e) {
        if (e.target.closest('.formula-option')) {
            setTimeout(salvarEstado, 150);
        }
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-option-diluicao')) {
            setTimeout(salvarEstado, 150);
        }
    });
    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-trigger-diluicao')) {
            setTimeout(salvarEstado, 100);
        }
    });

    const observer = new MutationObserver(() => salvarEstado());
    const resultadoEl = document.getElementById('resultado');
    if (resultadoEl) observer.observe(resultadoEl, { childList: true, subtree: true, characterData: true });

    // ===== LOAD COM DELAY =====
    window.addEventListener('load', function () {
        setTimeout(restaurarEstado, 300);
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-option-sangue')) {
            setTimeout(salvarEstado, 150);
        }
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.custom-select-trigger-sangue')) {
            setTimeout(salvarEstado, 100);
        }
    });

    // ========================================================================
    // PERSISTÊNCIA ESPECÍFICA DO GESTOGRAMA
    // ========================================================================

    document.addEventListener('click', function (e) {
        const limpador = e.target.closest('#limpador');
        if (limpador) {
            sessionStorage.removeItem(`matclinica_${pageId}`);
            console.log('🧹 Estado do Gestograma limpo da sessionStorage');
        }
    });

    const painelDetalhesEl = document.getElementById('detalhesMedicosPainel');
    if (painelDetalhesEl) {
        const observerDetalhes = new MutationObserver(() => {
            setTimeout(salvarEstado, 100);
        });
        observerDetalhes.observe(painelDetalhesEl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    const scrollDetalhesEl = document.getElementById('detalhesMedicosScroll');
    if (scrollDetalhesEl) {
        const observerScroll = new MutationObserver(() => {
            setTimeout(salvarEstado, 100);
        });
        observerScroll.observe(scrollDetalhesEl, {
            childList: true,
            subtree: true,
            characterData: true
        });

        scrollDetalhesEl.addEventListener('scroll', () => {
            clearTimeout(scrollDetalhesEl._scrollTimer);
            scrollDetalhesEl._scrollTimer = setTimeout(salvarEstado, 300);
        }, { passive: true });
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-abrir-detalhes') || e.target.closest('.detalhes-medicos-fechar')) {
            setTimeout(salvarEstado, 200);
        }
    });
})();