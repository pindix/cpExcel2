"""
Injetor de Dados — MatClínica (Mpindi TecMed)
================================================
Lê medicamentos escritos no FORMULÁRIO INTERMÉDIO (key: value, indentado)
e gera as 12 colunas da base de dados.

Suporta: mg, g, mcg, UI, MIU, mEq, mmol
"""

import re
import sys
from openpyxl import load_workbook


class ErroFormato(Exception):
    def __init__(self, mensagem, contexto=None):
        prefixo = f"[{contexto}] " if contexto else ""
        super().__init__(f"{prefixo}{mensagem}")


# ============================================================================
# TABELAS DE CONVERSÃO (com suporte a UI e MIU)
# ============================================================================

FATORES_MASSA_PARA_MG = {
    # Unidades lineares (massa)
    'mg': 1, 'g': 1000, 'mcg': 0.001, 'µg': 0.001, 'ug': 0.001, 'kg': 1_000_000,
    'mgs': 1, 'gs': 1000, 'mcgs': 0.001, 'µgs': 0.001, 'ugs': 0.001, 'kgs': 1_000_000,
    
    # Unidades de potência (UI, MIU) — são tratadas como valores numéricos
    # A conversão real para mg é feita pelo fatorUnidade
    'ui': 1,
    'uis': 1,
    'miu': 1_000_000,  # 1 MIU = 1.000.000 UI
    'mius': 1_000_000,
}

FATORES_VOLUME_PARA_ML = {'ml': 1, 'mls': 1, 'l': 1000, 'ls': 1000}
INTERVALO_DOSE_UNICA = {'dose única', 'dose unica', 'toma única', 'toma unica'}


def parse_valor_unidade(texto, tabela_unidades=None):
    """Parseia '1.2 g' → (1.2, 'g'). Suporta MIU e UI."""
    texto = (texto or '').strip()
    if texto == '':
        return None
    
    # Remove conteúdo entre parênteses (ex: "1 MIU (600 mg)" → "1 MIU")
    texto = re.sub(r'\s*\([^)]*\)', '', texto).strip()
    
    # Detecta MIU (Milhões de Unidades Internacionais)
    m_miu = re.match(r'^([\d.,]+)\s*MIU', texto, re.IGNORECASE)
    if m_miu:
        valor = float(m_miu.group(1).replace(',', '.'))
        return valor * 1_000_000, 'ui'  # 1 MIU = 1.000.000 UI
    
    # Detecta UI
    m_ui = re.match(r'^([\d.,]+)\s*UI', texto, re.IGNORECASE)
    if m_ui:
        valor = float(m_ui.group(1).replace(',', '.'))
        return valor, 'ui'
    
    # Parse normal
    m = re.match(r'^([\d.,]+)\s*([a-zA-Zµ]+)$', texto)
    if not m:
        raise ErroFormato(f"Não consegui interpretar '{texto}' como 'valor unidade' (ex. '20 mg')")
    
    valor = float(m.group(1).replace(',', '.'))
    unidade = m.group(2).lower()
    
    if tabela_unidades is not None and unidade not in tabela_unidades:
        raise ErroFormato(f"Unidade '{unidade}' não reconhecida em '{texto}'")
    
    return valor, unidade


def converter_massa_para_mg(valor, unidade):
    """Converte massa para mg. Para UI, retorna o valor em UI."""
    base = unidade.lower()
    
    # UI é tratada como unidade de potência, não converte para mg diretamente
    if base in ('ui', 'uis', 'miu', 'mius'):
        return valor
    
    if base in FATORES_MASSA_PARA_MG:
        return valor * FATORES_MASSA_PARA_MG[base]
    
    return None


# ============================================================================
# PARSER DO FORMULÁRIO
# ============================================================================

def dividir_linha_chave_valor(linha):
    linha = linha.strip()
    if ':' in linha:
        chave, _, valor = linha.partition(':')
        return chave.strip().lower(), valor.strip()
    return linha.strip().lower(), ''


CHAVES_CONDICAO_NIVEL_SUPERIOR = {'populacao', 'via', 'pesominimo', 'pesomaximo', 'idademinima', 'idademaxima'}
CHAVES_FASE = {'doseminima', 'dosemaxima', 'dosepadrao', 'unidadedose', 'fatorunidade', 'intervalo'}


def parse_formulario(texto):
    linhas = [l.rstrip() for l in texto.split('\n')]
    medicamentos = []
    med = None
    estado = None
    concentracao_atual = None
    condicao_atual = None
    lista_notas_ref = None

    def novo_medicamento():
        return {'nome': None, 'concentracoes': [], 'condicoes': [], 'notas_gerais': []}

    def nova_condicao():
        return {
            'nome': None, 'populacao': '', 'via': '',
            'pesoMinimo': '', 'pesoMaximo': '', 'idadeMinima': '', 'idadeMaxima': '',
            'simples': {'doseMinima': '', 'doseMaxima': '', 'dosePadrao': '', 'unidadeDose': '', 'fatorUnidade': '', 'intervalo': ''},
            'ataque': None, 'manutencao': None,
            'notas': [],
        }

    def fechar_medicamento_atual():
        nonlocal concentracao_atual
        if med is not None and estado == 'concentracao' and concentracao_atual is not None:
            med['concentracoes'].append(concentracao_atual)
            concentracao_atual = None
        if med is not None:
            medicamentos.append(med)

    for num, linha_bruta in enumerate(linhas, start=1):
        linha = linha_bruta.strip()
        if linha == '' or linha.startswith('#'):
            continue

        m_nota = re.match(r'^(\d+)\.\s*(.*)$', linha)
        if m_nota and estado in ('notaExclusiva', 'notaGeral') and lista_notas_ref is not None:
            if m_nota.group(2).strip():
                lista_notas_ref.append(m_nota.group(2).strip())
            continue

        if linha == '.' and estado == 'concentracao':
            med['concentracoes'].append(concentracao_atual)
            concentracao_atual = {'massa': '', 'volume': '', 'instrucao': ''}
            continue

        chave, valor = dividir_linha_chave_valor(linha)

        if chave == 'nome':
            fechar_medicamento_atual()
            med = novo_medicamento()
            med['nome'] = valor
            estado = None
            continue

        if med is None:
            raise ErroFormato(f"Linha {num}: conteúdo antes de 'nome:' — todo medicamento começa por aí", linha)

        if chave == 'concentracao':
            estado = 'concentracao'
            concentracao_atual = {'massa': '', 'volume': '', 'instrucao': ''}
            continue

        if estado == 'concentracao' and chave in ('massa', 'volume', 'instrucao'):
            concentracao_atual[chave] = valor
            continue

        if chave == 'condicaoclinica':
            if estado == 'concentracao' and concentracao_atual is not None:
                med['concentracoes'].append(concentracao_atual)
                concentracao_atual = None
            condicao_atual = nova_condicao()
            condicao_atual['nome'] = valor
            med['condicoes'].append(condicao_atual)
            estado = 'condicao'
            continue

        if chave == 'ataque':
            condicao_atual['ataque'] = {'doseMinima': '', 'doseMaxima': '', 'dosePadrao': '', 'unidadeDose': '', 'fatorUnidade': '', 'intervalo': ''}
            estado = 'ataque'
            continue
        if chave == 'manutencao':
            condicao_atual['manutencao'] = {'doseMinima': '', 'doseMaxima': '', 'dosePadrao': '', 'unidadeDose': '', 'fatorUnidade': '', 'intervalo': ''}
            estado = 'manutencao'
            continue

        if chave == 'notaexclusiva':
            estado = 'notaExclusiva'
            lista_notas_ref = condicao_atual['notas']
            continue

        if chave == 'notageral':
            estado = 'notaGeral'
            lista_notas_ref = med['notas_gerais']
            continue

        if estado == 'condicao' and chave in CHAVES_CONDICAO_NIVEL_SUPERIOR:
            mapa = {'pesominimo': 'pesoMinimo', 'pesomaximo': 'pesoMaximo',
                    'idademinima': 'idadeMinima', 'idademaxima': 'idadeMaxima'}
            condicao_atual[mapa.get(chave, chave)] = valor
            continue

        if estado == 'condicao' and chave in CHAVES_FASE:
            mapa = {'doseminima': 'doseMinima', 'dosemaxima': 'doseMaxima', 'dosepadrao': 'dosePadrao',
                    'unidadedose': 'unidadeDose', 'fatorunidade': 'fatorUnidade', 'intervalo': 'intervalo'}
            condicao_atual['simples'][mapa[chave]] = valor
            continue

        if estado in ('ataque', 'manutencao') and chave in CHAVES_FASE:
            mapa = {'doseminima': 'doseMinima', 'dosemaxima': 'doseMaxima', 'dosepadrao': 'dosePadrao',
                    'unidadedose': 'unidadeDose', 'fatorunidade': 'fatorUnidade', 'intervalo': 'intervalo'}
            condicao_atual[estado][mapa[chave]] = valor
            continue

        raise ErroFormato(f"Linha {num} não reconhecida no estado atual ({estado}): '{linha_bruta}'")

    fechar_medicamento_atual()
    return medicamentos


# ============================================================================
# CONSTRUÇÃO DAS LINHAS FINAIS
# ============================================================================

def montar_concentracao_e_preparo(medicamento):
    if not medicamento['concentracoes']:
        raise ErroFormato("CONCENTRACAO em falta — campo obrigatório", medicamento['nome'])
    
    partes_concentracao, instrucoes = [], []
    for i, c in enumerate(medicamento['concentracoes'], start=1):
        if not c['massa'] or not c['volume']:
            raise ErroFormato(f"Concentração #{i} sem massa/volume", medicamento['nome'])
        
        valor_massa, unidade_massa = parse_valor_unidade(c['massa'])
        valor_volume, unidade_volume = parse_valor_unidade(c['volume'], FATORES_VOLUME_PARA_ML)
        
        # Detecta se a massa está em UI
        is_ui = unidade_massa.lower() in ('ui', 'uis', 'miu', 'mius')
        
        if is_ui:
            volume_ml = valor_volume * FATORES_VOLUME_PARA_ML[unidade_volume]
            fator = valor_massa / volume_ml  # UI/ml
        else:
            massa_mg = converter_massa_para_mg(valor_massa, unidade_massa)
            if massa_mg is None:
                raise ErroFormato(f"Unidade de massa '{unidade_massa}' não linear na concentração", medicamento['nome'])
            volume_ml = valor_volume * FATORES_VOLUME_PARA_ML[unidade_volume]
            fator = massa_mg / volume_ml  # mg/ml
        
        partes_concentracao.append(f"{c['massa'].strip()}/{c['volume'].strip()}|{fator:g}")
        
        if c['instrucao'].strip():
            instrucoes.append(f"[{i}] {c['instrucao'].strip()}")
    
    return ';'.join(partes_concentracao), (' '.join(instrucoes) if instrucoes else '')


def montar_peso_idade(condicao):
    def lado_peso(v):
        return v.replace(' kg', '').replace('kg', '').strip() if v else ''
    peso_str = f"{lado_peso(condicao['pesoMinimo'])};{lado_peso(condicao['pesoMaximo'])}" \
        if (condicao['pesoMinimo'] or condicao['pesoMaximo']) else ''
    idade_str = f"{condicao['idadeMinima'].strip()};{condicao['idadeMaxima'].strip()}" \
        if (condicao['idadeMinima'] or condicao['idadeMaxima']) else ''
    return peso_str, idade_str


def eh_invariavel(minimo, maximo, padrao):
    try:
        return float(minimo) == float(maximo) == float(padrao)
    except (TypeError, ValueError):
        return False


def montar_termo_dose(fase, nome_medicamento, sufixo, pedacos_dose):
    minimo, maximo, padrao = fase['doseMinima'], fase['doseMaxima'], fase['dosePadrao']
    unidade = fase['unidadeDose'].strip()
    
    if minimo == '' or maximo == '' or padrao == '':
        raise ErroFormato(f"doseMinima/doseMaxima/dosePadrao incompletos ({sufixo})", nome_medicamento)
    
    if eh_invariavel(minimo, maximo, padrao):
        # Se for UI, usa o fatorUnidade para converter para mg
        if 'ui' in unidade.lower():
            if not fase['fatorUnidade'].strip():
                raise ErroFormato(f"Dose invariável ({sufixo}) em UI sem fatorUnidade", nome_medicamento)
            
            valor_fator, unidade_fator = parse_valor_unidade(fase['fatorUnidade'])
            fator_mg = converter_massa_para_mg(valor_fator, unidade_fator)
            if fator_mg is None:
                raise ErroFormato(f"fatorUnidade '{fase['fatorUnidade']}' não é uma massa reconhecida", nome_medicamento)
            
            valor_mg = float(minimo) * fator_mg
            return _fmt(valor_mg)
        
        # Conversão normal para mg
        valor_mg = converter_massa_para_mg(float(minimo), unidade)
        if valor_mg is None:
            if not fase['fatorUnidade'].strip():
                raise ErroFormato(f"Dose invariável ({sufixo}) em unidade não linear ('{unidade}') sem fatorUnidade", nome_medicamento)
            valor_fator, unidade_fator = parse_valor_unidade(fase['fatorUnidade'])
            fator_mg = converter_massa_para_mg(valor_fator, unidade_fator)
            if fator_mg is None:
                raise ErroFormato(f"fatorUnidade '{fase['fatorUnidade']}' não é uma massa reconhecida", nome_medicamento)
            valor_mg = float(minimo) * valor_fator * fator_mg
        return _fmt(valor_mg)
    else:
        pedacos_dose.append(f"{minimo},{maximo},{padrao},{unidade}" + (f",{fase['fatorUnidade']}" if fase['fatorUnidade'].strip() else ""))
        return f"#d_{sufixo}" if sufixo != 'simples' else "#d"


def montar_termo_intervalo(fase, sufixo):
    txt = fase['intervalo'].strip()
    valor_intervalo = "24*" if txt.lower() in INTERVALO_DOSE_UNICA else txt.replace(' h', '').replace('h', '').strip()
    return (f"#i_{sufixo}" if sufixo != 'simples' else "#i"), valor_intervalo


def _fmt(v):
    return str(int(v)) if float(v).is_integer() else f"{v:g}"


def _aplicar_peso_unidade(termo_dose, unidade, termo_intervalo):
    unidade = (unidade or '').lower()
    calc = termo_dose
    if '/kg' in unidade:
        calc = f"#p*{calc}"
    if '/dia' in unidade:
        calc = f"{calc}/{termo_intervalo}"
    return f"{calc}/#c"


def montar_formula_e_dose_intervalo(condicao, nome_medicamento):
    if condicao['ataque'] or condicao['manutencao']:
        ataque = condicao['ataque'] or condicao['manutencao']
        manutencao = condicao['manutencao'] or condicao['ataque']
        pedacos_dose = []
        termo_dose_a = montar_termo_dose(ataque, nome_medicamento, 'ataque', pedacos_dose)
        termo_dose_m = montar_termo_dose(manutencao, nome_medicamento, 'manutencao', pedacos_dose)
        termo_int_a, val_int_a = montar_termo_intervalo(ataque, 'ataque')
        termo_int_m, val_int_m = montar_termo_intervalo(manutencao, 'manutencao')
        calc_a = _aplicar_peso_unidade(termo_dose_a, ataque['unidadeDose'], termo_int_a)
        calc_m = _aplicar_peso_unidade(termo_dose_m, manutencao['unidadeDose'], termo_int_m)
        formula = "{" + calc_a + "} ml {" + calc_m + "} ml"
        dose_col = f"ataque({ataque['doseMinima']},{ataque['doseMaxima']},{ataque['dosePadrao']},{ataque['unidadeDose']});manutencao({manutencao['doseMinima']},{manutencao['doseMaxima']},{manutencao['dosePadrao']},{manutencao['unidadeDose']})"
        intervalo_col = f"ataque({val_int_a});manutencao({val_int_m})"
        return dose_col, intervalo_col, formula
    else:
        fase = condicao['simples']
        pedacos_dose = []
        termo_dose = montar_termo_dose(fase, nome_medicamento, 'simples', pedacos_dose)
        termo_int, val_int = montar_termo_intervalo(fase, 'simples')
        calc = _aplicar_peso_unidade(termo_dose, fase['unidadeDose'], termo_int)
        formula = "{" + calc + "} ml"
        dose_col = '' if termo_dose != '#d' else f"{fase['doseMinima']},{fase['doseMaxima']},{fase['dosePadrao']},{fase['unidadeDose']}"
        return dose_col, val_int, formula


def montar_adicionais(condicao, preparo_texto, notas_gerais_sem_referencia):
    segmentos = [('destaque', n) for n in condicao['notas']]
    if preparo_texto:
        segmentos.append(('normal', preparo_texto))
    for n in notas_gerais_sem_referencia:
        segmentos.append(('normal', n))
    if not segmentos:
        return ''
    texto = '#'
    for tipo, conteudo in segmentos:
        texto += f"@@{conteudo}@" if tipo == 'destaque' else conteudo
        texto += '#'
    return texto.replace('##', '#')


def extrair_referencia(notas_gerais):
    if not notas_gerais:
        return [], ''
    ultima = notas_gerais[-1]
    m = re.match(r'^referencia:\s*(.*)$', ultima.strip(), re.IGNORECASE)
    if m:
        return notas_gerais[:-1], m.group(1).strip()
    return notas_gerais, ''


def construir_linhas(medicamento):
    concentracao_final, preparo_texto = montar_concentracao_e_preparo(medicamento)
    notas_gerais_restantes, referencia = extrair_referencia(medicamento['notas_gerais'])
    condicoes_unicas = len(medicamento['condicoes'])
    linhas = []

    for cond in medicamento['condicoes']:
        peso_str, idade_str = montar_peso_idade(cond)
        dose_col, intervalo_col, formula = montar_formula_e_dose_intervalo(cond, medicamento['nome'])
        adicionais = montar_adicionais(cond, preparo_texto, notas_gerais_restantes)

        condicao_col = cond['nome'] if condicoes_unicas > 1 else ''
        populacoes_unicas = len({c['populacao'] for c in medicamento['condicoes'] if c['nome'] == cond['nome']})
        vias_unicas = len({c['via'] for c in medicamento['condicoes'] if c['nome'] == cond['nome'] and c['populacao'] == cond['populacao']})
        populacao_col = cond['populacao'] if populacoes_unicas > 1 else ''
        via_col = cond['via'] if vias_unicas > 1 else ''

        linhas.append([
            medicamento['nome'], condicao_col, populacao_col, via_col,
            idade_str, peso_str, dose_col, concentracao_final,
            intervalo_col, formula, adicionais, referencia
        ])
    return linhas


# ============================================================================
# INJEÇÃO NA PLANILHA
# ============================================================================

def injetar_na_planilha(arquivo_xlsx, aba, linhas_para_inserir, nome_medicamento_por_linha):
    wb = load_workbook(arquivo_xlsx)
    ws = wb[aba]
    linha_vaga = max(8, ws.max_row + 1)
    medicamento_anterior = None
    for linha, nome_med in zip(linhas_para_inserir, nome_medicamento_por_linha):
        if medicamento_anterior is not None and nome_med != medicamento_anterior:
            linha_vaga += 1
        for col_idx, valor in enumerate(linha, start=1):
            ws.cell(row=linha_vaga, column=col_idx).value = valor
        linha_vaga += 1
        medicamento_anterior = nome_med
    wb.save(arquivo_xlsx)
    print(f"✅ Sucesso! {len(linhas_para_inserir)} linhas adicionadas.")


def processar_texto(texto):
    medicamentos = parse_formulario(texto)
    todas_as_linhas, nomes = [], []
    for med in medicamentos:
        if not med['nome']:
            raise ErroFormato("Medicamento sem 'nome:' — campo obrigatório")
        linhas = construir_linhas(med)
        todas_as_linhas.extend(linhas)
        nomes.extend([med['nome']] * len(linhas))
    return todas_as_linhas, nomes


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python seringa.py <formulario.txt> <medicamentos.xlsx>")
        sys.exit(1)
    
    with open(sys.argv[1], encoding='utf-8') as f:
        texto = f.read()
    
    try:
        linhas, nomes = processar_texto(texto)
    except ErroFormato as e:
        print(f"❌ ERRO DE FORMATO — nada foi escrito na planilha:\n{e}")
        sys.exit(1)
    
    for l in linhas:
        print(l)
    
    injetar_na_planilha(sys.argv[2], 'msf', linhas, nomes)