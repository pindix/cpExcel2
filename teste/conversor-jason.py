
import pandas as pd
import json

# Carregar o Excel
excel_file = pd.ExcelFile('medicamentos.xlsx')

# Converter cada planilha para JSON
data = {}
for sheet_name in excel_file.sheet_names:
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    # Converter para lista de dicionários
    data[sheet_name.lower()] = df.to_dict('records')

# Salvar como JSON
with open('medicamentos.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)