/* ==========================================================================
   INTERPRETADOR CLÍNICO v2 — MOTOR UNIFICADO
   Exames + Escalas. Uma só base de dados. Um só motor.
   
   FORMATOS SUPORTADOS:
   ─────────────────────
   1. Exame simples        → tipo: "exame",   sem calculo,  referencia + interpretacao por faixa
   2. Exame classificado   → tipo: "exame",   sem calculo,  interpretacao por faixa (sem referencia)
   3. Exame com padrão     → tipo: "exame",   calculo: { tipo: "padrao" },  interpretacao por padrao
   4a. Escala com pesos    → tipo: "escala",  calculo: { tipo: "soma_pesos" }, interpretacao por faixa
   4b. Escala com fórmula  → tipo: "escala",  calculo: { formula: "..." },  interpretacao por faixa
   ========================================================================== */


/* ==========================================================================
   BASE DE DADOS
   ========================================================================== */
/* ==========================================================================
   BASE DE DADOS — INTERPRETADOR CLÍNICO v2
   Centenas de exames e escalas organizados por categoria.
   
   FORMATOS:
   1. Exame simples        → tipo: "exame", sem calculo, referencia + interpretacao
   2. Exame classificado   → tipo: "exame", sem calculo, interpretacao por faixa
   3. Exame com padrão     → tipo: "exame", calculo: { tipo: "padrao" }
   4a. Escala com pesos    → tipo: "escala", calculo: { tipo: "soma_pesos" }
   4b. Escala com fórmula  → tipo: "escala", calculo: { formula: "..." }
   ========================================================================== */

const database = {
    /* ====================================================================== */
    /* LOTE 1 — B. BIOQUÍMICA / METABOLISMO (25 itens)                         */
    /* ====================================================================== */

    "Glicémia (Jejum)": {
        tipo: "exame",
        sinonimos: ["glicemia", "glucose", "açúcar no sangue", "glicemia jejum"],
        campos: [{ id: "valor", tipo: "input", label: "Resultado", unidade: "mg/dL", min: 0, max: 999 }],
        referencia: { min: 70, max: 99, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Hipoglicemia", nota: "⚠️ GLICEMIA BAIXA! Oferecer 15g de açúcar rápida e repetir em 15 min." },
            { faixa: [70, 99], status: "normal", termo: "Normoglicemia", nota: "✅ Glicemia normal." },
            { faixa: [100, 125], status: "leve", termo: "Pré-diabetes", nota: "⚠️ Glicemia de jejum alterada. Risco de diabetes. Orientar dieta e exercício." },
            { faixa: [126, 999], status: "alto", termo: "Diabetes", nota: "⚠️ GLICEMIA ALTA! Critério para diabetes (jejum). Confirmar com HbA1c." }
        ]
    },

    "Glicémia (Pós-Prandial)": {
        tipo: "exame",
        sinonimos: ["glicemia pos prandial", "glicemia 2h", "tolerancia glicose"],
        campos: [{ id: "valor", tipo: "input", label: "Glicemia 2h", unidade: "mg/dL", min: 0, max: 999 }],
        referencia: { min: 70, max: 140, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Hipoglicemia", nota: "⚠️ Hipoglicemia pós-prandial. Rever medicação." },
            { faixa: [70, 140], status: "normal", termo: "Normal", nota: "✅ Tolerância normal à glicose." },
            { faixa: [140.1, 199], status: "leve", termo: "Intolerância", nota: "⚠️ Intolerância à glicose. Risco de diabetes." },
            { faixa: [200, 999], status: "alto", termo: "Diabetes", nota: "⚠️ Critério para diabetes (2h). Confirmar." }
        ]
    },

    "Colesterol Total": {
        tipo: "exame",
        sinonimos: ["colesterol total", "colesterol", "ct"],
        campos: [{ id: "valor", tipo: "input", label: "Colesterol Total", unidade: "mg/dL", min: 0, max: 500 }],
        referencia: { min: 0, max: 190, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 190], status: "normal", termo: "Desejável", nota: "✅ Colesterol total desejável." },
            { faixa: [190.1, 239], status: "leve", termo: "Limítrofe", nota: "⚠️ Colesterol limítrofe. Orientar dieta." },
            { faixa: [239.1, 500], status: "alto", termo: "Elevado", nota: "⚠️ Colesterol elevado. Risco cardiovascular. Considerar estatina." }
        ]
    },

    "Colesterol LDL": {
        tipo: "exame",
        sinonimos: ["ldl", "colesterol ldl", "mau colesterol"],
        campos: [{ id: "valor", tipo: "input", label: "LDL", unidade: "mg/dL", min: 0, max: 400 }],
        referencia: { min: 0, max: 130, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 100], status: "bom", termo: "Óptimo", nota: "✅ LDL óptimo." },
            { faixa: [100.1, 130], status: "normal", termo: "Desejável", nota: "✅ LDL desejável." },
            { faixa: [130.1, 159], status: "leve", termo: "Limítrofe", nota: "⚠️ LDL limítrofe. Dieta e exercício." },
            { faixa: [159.1, 400], status: "alto", termo: "Elevado", nota: "⚠️ LDL elevado. Risco cardiovascular. Considerar estatina." }
        ]
    },

    "Colesterol HDL": {
        tipo: "exame",
        sinonimos: ["hdl", "colesterol hdl", "bom colesterol"],
        campos: [{ id: "valor", tipo: "input", label: "HDL", unidade: "mg/dL", min: 0, max: 150 }],
        referencia: { min: 40, max: 150, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 39], status: "baixo", termo: "Baixo", nota: "⚠️ HDL baixo. Factor de risco cardiovascular. Exercício e dieta." },
            { faixa: [40, 150], status: "bom", termo: "Desejável", nota: "✅ HDL desejável. Efeito protector." }
        ]
    },

    "Triglicéridos": {
        tipo: "exame",
        sinonimos: ["triglicerideos", "tg"],
        campos: [{ id: "valor", tipo: "input", label: "Triglicéridos", unidade: "mg/dL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 150, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 150], status: "normal", termo: "Desejável", nota: "✅ Triglicéridos desejáveis." },
            { faixa: [150.1, 199], status: "leve", termo: "Limítrofe", nota: "⚠️ Triglicéridos limítrofes. Reduzir açúcares e álcool." },
            { faixa: [199.1, 499], status: "alto", termo: "Elevado", nota: "⚠️ Triglicéridos elevados. Risco de pancreatite. Tratar." },
            { faixa: [499.1, 1000], status: "grave", termo: "Muito elevado", nota: "⚠️ Triglicéridos muito elevados. Risco de pancreatite aguda. Tratamento urgente." }
        ]
    },

    "Colesterol VLDL": {
        tipo: "exame",
        sinonimos: ["vldl", "colesterol vldl"],
        campos: [{ id: "valor", tipo: "input", label: "VLDL", unidade: "mg/dL", min: 0, max: 200 }],
        referencia: { min: 2, max: 30, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 1.9], status: "baixo", termo: "Baixo", nota: "VLDL baixo. Sem significado." },
            { faixa: [2, 30], status: "normal", termo: "Normal", nota: "✅ VLDL normal." },
            { faixa: [30.1, 200], status: "alto", termo: "Elevado", nota: "⚠️ VLDL elevado. Associado a hipertrigliceridemia." }
        ]
    },

    "Ácido Úrico": {
        tipo: "exame",
        sinonimos: ["acido urico", "urato"],
        campos: [{ id: "valor", tipo: "input", label: "Ácido Úrico", unidade: "mg/dL", min: 0, max: 20 }],
        referencia: { min: 2.4, max: 7, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 2.3], status: "baixo", termo: "Baixo", nota: "Ácido úrico baixo. Geralmente sem significado." },
            { faixa: [2.4, 7], status: "normal", termo: "Normal", nota: "✅ Ácido úrico normal." },
            { faixa: [7.1, 20], status: "alto", termo: "Hiperuricemia", nota: "⚠️ Ácido úrico elevado. Risco de gota e litíase renal. Hidratação e dieta." }
        ]
    },

    "Amilase": {
        tipo: "exame",
        sinonimos: ["amilase", "amilase total"],
        campos: [{ id: "valor", tipo: "input", label: "Amilase", unidade: "U/L", min: 0, max: 2000 }],
        referencia: { min: 28, max: 100, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 27], status: "baixo", termo: "Baixa", nota: "Amilase baixa. Raramente significativo." },
            { faixa: [28, 100], status: "normal", termo: "Normal", nota: "✅ Amilase normal." },
            { faixa: [100.1, 2000], status: "alto", termo: "Elevada", nota: "⚠️ Amilase elevada. Considerar pancreatite, parotidite ou obstrução." }
        ]
    },

    "Lipase": {
        tipo: "exame",
        sinonimos: ["lipase"],
        campos: [{ id: "valor", tipo: "input", label: "Lipase", unidade: "U/L", min: 0, max: 3000 }],
        referencia: { min: 10, max: 140, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 9], status: "baixo", termo: "Baixa", nota: "Lipase baixa. Raramente significativo." },
            { faixa: [10, 140], status: "normal", termo: "Normal", nota: "✅ Lipase normal." },
            { faixa: [140.1, 3000], status: "alto", termo: "Elevada", nota: "⚠️ Lipase elevada. Marcador de pancreatite aguda. Correlacionar com clínica." }
        ]
    },

    "Lactato": {
        tipo: "exame",
        sinonimos: ["lactato", "acido lactico"],
        campos: [{ id: "valor", tipo: "input", label: "Lactato", unidade: "mmol/L", min: 0, max: 30 }],
        referencia: { min: 0.5, max: 2.2, unidade: "mmol/L" },
        interpretacao: [
            { faixa: [0, 0.4], status: "baixo", termo: "Baixo", nota: "Lactato baixo. Sem significado." },
            { faixa: [0.5, 2.2], status: "normal", termo: "Normal", nota: "✅ Lactato normal." },
            { faixa: [2.3, 4], status: "moderado", termo: "Elevado", nota: "⚠️ Lactato elevado. Sugere hipoperfusão. Avaliar sepse." },
            { faixa: [4.1, 30], status: "grave", termo: "Muito elevado", nota: "⚠️ LACTATO MUITO ELEVADO! Choque/sepse grave. Ressuscitação imediata." }
        ]
    },

    "Albumina": {
        tipo: "exame",
        sinonimos: ["albumina", "alb"],
        campos: [{ id: "valor", tipo: "input", label: "Albumina", unidade: "g/dL", min: 0, max: 10 }],
        referencia: { min: 3.5, max: 5.5, unidade: "g/dL" },
        interpretacao: [
            { faixa: [0, 3.4], status: "baixo", termo: "Hipoalbuminemia", nota: "⚠️ Albumina baixa. Considerar desnutrição, hepatopatia ou nefropatia." },
            { faixa: [3.5, 5.5], status: "normal", termo: "Normal", nota: "✅ Albumina normal." },
            { faixa: [5.6, 10], status: "alto", termo: "Elevada", nota: "Albumina elevada. Geralmente desidratação." }
        ]
    },

    "Proteínas Totais": {
        tipo: "exame",
        sinonimos: ["proteinas totais", "pt"],
        campos: [{ id: "valor", tipo: "input", label: "Proteínas Totais", unidade: "g/dL", min: 0, max: 15 }],
        referencia: { min: 6, max: 8, unidade: "g/dL" },
        interpretacao: [
            { faixa: [0, 5.9], status: "baixo", termo: "Hipoproteinemia", nota: "⚠️ Proteínas totais baixas. Considerar desnutrição ou perda renal." },
            { faixa: [6, 8], status: "normal", termo: "Normal", nota: "✅ Proteínas totais normais." },
            { faixa: [8.1, 15], status: "alto", termo: "Hiperproteinemia", nota: "⚠️ Proteínas totais elevadas. Considerar desidratação ou mieloma." }
        ]
    },

    "Cálcio Total": {
        tipo: "exame",
        sinonimos: ["calcio total", "ca total"],
        campos: [{ id: "valor", tipo: "input", label: "Cálcio Total", unidade: "mg/dL", min: 0, max: 20 }],
        referencia: { min: 8.5, max: 10.5, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 8.4], status: "baixo", termo: "Hipocalcemia", nota: "⚠️ Hipocalcemia. Considerar hipoparatiroidismo ou deficiência de vit. D." },
            { faixa: [8.5, 10.5], status: "normal", termo: "Normal", nota: "✅ Cálcio normal." },
            { faixa: [10.6, 20], status: "alto", termo: "Hipercalcemia", nota: "⚠️ Hipercalcemia. Considerar hiperparatiroidismo ou neoplasia." }
        ]
    },

    "Cálcio Iónico": {
        tipo: "exame",
        sinonimos: ["calcio ionico", "ca ionico"],
        campos: [{ id: "valor", tipo: "input", label: "Cálcio Iónico", unidade: "mg/dL", min: 0, max: 10 }],
        referencia: { min: 4.5, max: 5.6, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 4.4], status: "baixo", termo: "Hipocalcemia iónica", nota: "⚠️ Cálcio iónico baixo. Risco de tetania." },
            { faixa: [4.5, 5.6], status: "normal", termo: "Normal", nota: "✅ Cálcio iónico normal." },
            { faixa: [5.7, 10], status: "alto", termo: "Hipercalcemia iónica", nota: "⚠️ Cálcio iónico elevado. Avaliar causa." }
        ]
    },

    "Fósforo": {
        tipo: "exame",
        sinonimos: ["fosforo", "p", "fosfato"],
        campos: [{ id: "valor", tipo: "input", label: "Fósforo", unidade: "mg/dL", min: 0, max: 15 }],
        referencia: { min: 2.5, max: 4.5, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 2.4], status: "baixo", termo: "Hipofosfatemia", nota: "Hipofosfatemia. Considerar desnutrição ou alcoolismo." },
            { faixa: [2.5, 4.5], status: "normal", termo: "Normal", nota: "✅ Fósforo normal." },
            { faixa: [4.6, 15], status: "alto", termo: "Hiperfosfatemia", nota: "⚠️ Hiperfosfatemia. Comum em insuficiência renal." }
        ]
    },

    "Magnésio": {
        tipo: "exame",
        sinonimos: ["magnesio", "mg"],
        campos: [{ id: "valor", tipo: "input", label: "Magnésio", unidade: "mg/dL", min: 0, max: 10 }],
        referencia: { min: 1.7, max: 2.2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 1.6], status: "baixo", termo: "Hipomagnesemia", nota: "Hipomagnesemia. Associada a arritmias e hipocaliemia." },
            { faixa: [1.7, 2.2], status: "normal", termo: "Normal", nota: "✅ Magnésio normal." },
            { faixa: [2.3, 10], status: "alto", termo: "Hipermagnesemia", nota: "⚠️ Hipermagnesemia. Considerar insuficiência renal ou iatrogenia." }
        ]
    },

    "Sódio (Na+)": {
        tipo: "exame",
        sinonimos: ["sodio", "na", "natremia"],
        campos: [{ id: "valor", tipo: "input", label: "Sódio", unidade: "mEq/L", min: 100, max: 180 }],
        referencia: { min: 135, max: 145, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [100, 134.9], status: "baixo", termo: "Hiponatremia", nota: "⚠️ Hiponatremia. Avaliar hidratação, SIADH, diuréticos." },
            { faixa: [135, 145], status: "normal", termo: "Normal", nota: "✅ Sódio normal." },
            { faixa: [145.1, 180], status: "alto", termo: "Hipernatremia", nota: "⚠️ Hipernatremia. Considerar desidratação ou diabetes insipidus." }
        ]
    },

    "Potássio (K+)": {
        tipo: "exame",
        sinonimos: ["potassio", "k", "caliemia"],
        campos: [{ id: "valor", tipo: "input", label: "Potássio", unidade: "mEq/L", min: 1, max: 10 }],
        referencia: { min: 3.5, max: 5.1, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [1, 3.4], status: "baixo", termo: "Hipocaliemia", nota: "⚠️ Hipocaliemia. Risco de arritmia. Repor e investigar causa." },
            { faixa: [3.5, 5.1], status: "normal", termo: "Normal", nota: "✅ Potássio normal." },
            { faixa: [5.2, 10], status: "alto", termo: "Hipercaliemia", nota: "⚠️ HIPERCALIEMIA! Risco de paragem cardíaca. ECG urgente." }
        ]
    },

    "Cloro (Cl-)": {
        tipo: "exame",
        sinonimos: ["cloro", "cl", "cloremia"],
        campos: [{ id: "valor", tipo: "input", label: "Cloro", unidade: "mEq/L", min: 70, max: 140 }],
        referencia: { min: 98, max: 107, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [70, 97.9], status: "baixo", termo: "Hipocloremia", nota: "Hipocloremia. Associada a vómitos ou alcalose metabólica." },
            { faixa: [98, 107], status: "normal", termo: "Normal", nota: "✅ Cloro normal." },
            { faixa: [107.1, 140], status: "alto", termo: "Hipercloremia", nota: "⚠️ Hipercloremia. Associada a acidose metabólica ou desidratação." }
        ]
    },

    "Bicarbonato (HCO3-)": {
        tipo: "exame",
        sinonimos: ["bicarbonato", "hco3", "co2 total"],
        campos: [{ id: "valor", tipo: "input", label: "Bicarbonato", unidade: "mEq/L", min: 0, max: 60 }],
        referencia: { min: 22, max: 26, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [0, 21.9], status: "baixo", termo: "Acidose metabólica", nota: "⚠️ Bicarbonato baixo. Acidose metabólica." },
            { faixa: [22, 26], status: "normal", termo: "Normal", nota: "✅ Bicarbonato normal." },
            { faixa: [26.1, 60], status: "alto", termo: "Alcalose metabólica", nota: "⚠️ Bicarbonato elevado. Alcalose metabólica." }
        ]
    },

    "Osmolaridade": {
        tipo: "exame",
        sinonimos: ["osmolaridade", "osmolalidade"],
        campos: [{ id: "valor", tipo: "input", label: "Osmolaridade", unidade: "mOsm/kg", min: 200, max: 500 }],
        referencia: { min: 275, max: 295, unidade: "mOsm/kg" },
        interpretacao: [
            { faixa: [200, 274.9], status: "baixo", termo: "Hipoosmolaridade", nota: "⚠️ Hipoosmolaridade. Considerar SIADH ou intoxicação hídrica." },
            { faixa: [275, 295], status: "normal", termo: "Normal", nota: "✅ Osmolaridade normal." },
            { faixa: [295.1, 500], status: "alto", termo: "Hiperosmolaridade", nota: "⚠️ Hiperosmolaridade. Considerar desidratação ou hiperglicemia." }
        ]
    },

    "Glicose (Aleatória)": {
        tipo: "exame",
        sinonimos: ["glicose aleatoria", "glicemia aleatoria"],
        campos: [{ id: "valor", tipo: "input", label: "Glicose Aleatória", unidade: "mg/dL", min: 0, max: 999 }],
        referencia: { min: 70, max: 140, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Hipoglicemia", nota: "⚠️ Hipoglicemia. Corrigir com açúcar." },
            { faixa: [70, 140], status: "normal", termo: "Normal", nota: "✅ Glicose normal." },
            { faixa: [140.1, 199], status: "leve", termo: "Elevada", nota: "⚠️ Glicose elevada. Confirmar com jejum ou HbA1c." },
            { faixa: [200, 999], status: "alto", termo: "Diabetes", nota: "⚠️ Critério para diabetes (aleatória ≥200 com sintomas)." }
        ]
    },

    "Insulina": {
        tipo: "exame",
        sinonimos: ["insulina", "insulina basal"],
        campos: [{ id: "valor", tipo: "input", label: "Insulina", unidade: "µUI/mL", min: 0, max: 200 }],
        referencia: { min: 2, max: 25, unidade: "µUI/mL" },
        interpretacao: [
            { faixa: [0, 1.9], status: "baixo", termo: "Baixa", nota: "Insulina baixa. Sugere diabetes tipo 1 ou hipopituitarismo." },
            { faixa: [2, 25], status: "normal", termo: "Normal", nota: "✅ Insulina normal." },
            { faixa: [25.1, 200], status: "alto", termo: "Alta", nota: "⚠️ Insulina alta. Sugere resistência à insulina ou insulinoma." }
        ]
    },

    "Peptídeo C": {
        tipo: "exame",
        sinonimos: ["peptideo c", "c-peptideo"],
        campos: [{ id: "valor", tipo: "input", label: "Peptídeo C", unidade: "ng/mL", min: 0, max: 20 }],
        referencia: { min: 0.8, max: 4, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.79], status: "baixo", termo: "Baixo", nota: "Peptídeo C baixo. Sugere diabetes tipo 1 ou insulinoma." },
            { faixa: [0.8, 4], status: "normal", termo: "Normal", nota: "✅ Peptídeo C normal." },
            { faixa: [4.1, 20], status: "alto", termo: "Elevado", nota: "⚠️ Peptídeo C elevado. Sugere resistência à insulina." }
        ]
    },

    "Frutuosamina": {
        tipo: "exame",
        sinonimos: ["frutosamina", "frutuosamina"],
        campos: [{ id: "valor", tipo: "input", label: "Frutuosamina", unidade: "µmol/L", min: 0, max: 1000 }],
        referencia: { min: 205, max: 285, unidade: "µmol/L" },
        interpretacao: [
            { faixa: [0, 204], status: "baixo", termo: "Baixa", nota: "Frutuosamina baixa. Considerar hipoproteinemia." },
            { faixa: [205, 285], status: "normal", termo: "Normal", nota: "✅ Frutuosamina normal." },
            { faixa: [285.1, 1000], status: "alto", termo: "Elevada", nota: "⚠️ Frutuosamina elevada. Controlo glicémico inadequado (2-3 semanas)." }
        ]
    },

        /* ====================================================================== */
    /* LOTE 2 — A. FUNÇÃO RENAL (20 itens)                                     */
    /* ====================================================================== */

    "Creatinina": {
        tipo: "exame",
        sinonimos: ["creat", "creatinina", "creatinina serica"],
        campos: [{ id: "valor", tipo: "input", label: "Creatinina", unidade: "mg/dL", min: 0, max: 20 }],
        referencia: { min: 0.6, max: 1.2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 0.5], status: "baixo", termo: "Creatinina baixa", nota: "Creatinina baixa. Pode ocorrer em sarcopenia ou desnutrição." },
            { faixa: [0.6, 1.2], status: "normal", termo: "Função renal normal", nota: "✅ Função renal preservada." },
            { faixa: [1.3, 20], status: "alto", termo: "Insuficiência renal", nota: "⚠️ CREATININA ALTA! Calcular TFG. Avaliar hidratação e nefrotóxicos." }
        ]
    },

    "Ureia": {
        tipo: "exame",
        sinonimos: ["ureia", "bun", "azoto ureico"],
        campos: [{ id: "valor", tipo: "input", label: "Ureia", unidade: "mg/dL", min: 0, max: 300 }],
        referencia: { min: 15, max: 45, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 14], status: "baixo", termo: "Ureia baixa", nota: "Ureia baixa. Considerar hepatopatia ou desnutrição." },
            { faixa: [15, 45], status: "normal", termo: "Normal", nota: "✅ Ureia normal." },
            { faixa: [45.1, 300], status: "alto", termo: "Ureia elevada", nota: "⚠️ Ureia elevada. Considerar desidratação, insuficiência renal ou dieta proteica." }
        ]
    },

    "TFG (Taxa de Filtração Glomerular)": {
        tipo: "exame",
        sinonimos: ["tfg", "egfr", "filtracao glomerular", "ckd-epi"],
        campos: [{ id: "valor", tipo: "input", label: "TFG", unidade: "mL/min/1.73m²", min: 0, max: 200 }],
        referencia: { min: 90, max: 200, unidade: "mL/min/1.73m²" },
        interpretacao: [
            { faixa: [0, 29], status: "grave", termo: "Estágio G4-G5", nota: "⚠️ TFG muito reduzida. Insuficiência renal grave. Nefrologia." },
            { faixa: [30, 59], status: "moderado", termo: "Estágio G3", nota: "⚠️ TFG moderadamente reduzida. Ajustar doses." },
            { faixa: [60, 89], status: "leve", termo: "Estágio G2", nota: "TFG levemente reduzida. Monitorizar." },
            { faixa: [90, 200], status: "normal", termo: "Estágio G1", nota: "✅ TFG normal." }
        ]
    },

    "Clearance de Creatinina (Cockcroft-Gault)": {
        tipo: "escala",
        sinonimos: ["clearance de creatinina", "cockcroft-gault", "clearance"],
        campos: [
            { id: "idade", tipo: "input", label: "Idade", unidade: "anos", min: 1, max: 120 },
            { id: "peso", tipo: "input", label: "Peso", unidade: "kg", min: 1, max: 300 },
            { id: "creatinina", tipo: "input", label: "Creatinina", unidade: "mg/dL", min: 0.1, max: 20 }
        ],
        calculo: { formula: "((140 - idade) * peso) / (72 * creatinina)", mostrarFormula: "(140 - idade) × peso / (72 × creatinina)" },
        referencia: { min: 90, max: 150, label: "Normal" },
        interpretacao: [
            { faixa: [0, 29.9], status: "grave", classificacao: "Insuficiência Renal Grave", nota: "⚠️ Clearance muito reduzido! Avaliar terapia renal substitutiva." },
            { faixa: [30, 59.9], status: "moderado", classificacao: "Insuficiência Renal Moderada", nota: "Clearance reduzido. Ajustar doses de medicamentos." },
            { faixa: [60, 89.9], status: "leve", classificacao: "Insuficiência Renal Leve", nota: "Clearance levemente reduzido." },
            { faixa: [90, 300], status: "bom", classificacao: "Normal", nota: "✅ Clearance normal." }
        ]
    },

    "Cistatina C": {
        tipo: "exame",
        sinonimos: ["cistatina c", "cistatina"],
        campos: [{ id: "valor", tipo: "input", label: "Cistatina C", unidade: "mg/L", min: 0, max: 10 }],
        referencia: { min: 0.5, max: 1.0, unidade: "mg/L" },
        interpretacao: [
            { faixa: [0, 0.49], status: "baixo", termo: "Baixa", nota: "Cistatina C baixa. Raramente significativo." },
            { faixa: [0.5, 1.0], status: "normal", termo: "Normal", nota: "✅ Cistatina C normal. Função renal preservada." },
            { faixa: [1.01, 10], status: "alto", termo: "Elevada", nota: "⚠️ Cistatina C elevada. Marcador precoce de lesão renal." }
        ]
    },

    "Microalbuminúria": {
        tipo: "exame",
        sinonimos: ["microalbuminuria", "albumina urinaria", "rac"],
        campos: [{ id: "valor", tipo: "input", label: "Microalbuminúria", unidade: "mg/g creatinina", min: 0, max: 5000 }],
        referencia: { min: 0, max: 30, unidade: "mg/g" },
        interpretacao: [
            { faixa: [0, 30], status: "normal", termo: "Normal", nota: "✅ Microalbuminúria normal." },
            { faixa: [30.1, 300], status: "leve", termo: "Microalbuminúria", nota: "⚠️ Microalbuminúria. Marcador precoce de nefropatia diabética." },
            { faixa: [300.1, 5000], status: "alto", termo: "Macroalbuminúria", nota: "⚠️ Macroalbuminúria. Nefropatia estabelecida. Nefrologia." }
        ]
    },

    "Proteinúria (24h)": {
        tipo: "exame",
        sinonimos: ["proteinuria", "proteinuria 24h"],
        campos: [{ id: "valor", tipo: "input", label: "Proteinúria 24h", unidade: "mg/24h", min: 0, max: 10000 }],
        referencia: { min: 0, max: 150, unidade: "mg/24h" },
        interpretacao: [
            { faixa: [0, 150], status: "normal", termo: "Normal", nota: "✅ Proteinúria normal." },
            { faixa: [150.1, 500], status: "leve", termo: "Proteinúria leve", nota: "⚠️ Proteinúria leve. Monitorizar função renal." },
            { faixa: [500.1, 3500], status: "moderado", termo: "Proteinúria significativa", nota: "⚠️ Proteinúria significativa. Investigar glomerulopatia." },
            { faixa: [3500.1, 10000], status: "grave", termo: "Proteinúria nefrótica", nota: "⚠️ Proteinúria em faixa nefrótica. Síndrome nefrótica. Nefrologia urgente." }
        ]
    },

    "Relação Proteína/Creatinina Urinária": {
        tipo: "exame",
        sinonimos: ["relacao proteina creatinina", "rpc"],
        campos: [{ id: "valor", tipo: "input", label: "RPC", unidade: "mg/mg", min: 0, max: 20 }],
        referencia: { min: 0, max: 0.2, unidade: "mg/mg" },
        interpretacao: [
            { faixa: [0, 0.2], status: "normal", termo: "Normal", nota: "✅ Relação proteína/creatinina normal." },
            { faixa: [0.21, 3.5], status: "alto", termo: "Proteinúria significativa", nota: "⚠️ Proteinúria significativa. Investigar causa renal." },
            { faixa: [3.51, 20], status: "grave", termo: "Proteinúria nefrótica", nota: "⚠️ Faixa nefrótica. Síndrome nefrótica. Nefrologia urgente." }
        ]
    },

    "Ureia Urinária (24h)": {
        tipo: "exame",
        sinonimos: ["ureia urinaria", "ureia 24h"],
        campos: [{ id: "valor", tipo: "input", label: "Ureia Urinária 24h", unidade: "g/24h", min: 0, max: 100 }],
        referencia: { min: 12, max: 20, unidade: "g/24h" },
        interpretacao: [
            { faixa: [0, 11.9], status: "baixo", termo: "Baixa", nota: "Ureia urinária baixa. Considerar dieta hipoproteica ou desnutrição." },
            { faixa: [12, 20], status: "normal", termo: "Normal", nota: "✅ Ureia urinária normal." },
            { faixa: [20.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ Ureia urinária elevada. Considerar catabolismo proteico ou dieta hiperproteica." }
        ]
    },

    "Creatinina Urinária (24h)": {
        tipo: "exame",
        sinonimos: ["creatinina urinaria", "creatinina 24h"],
        campos: [{ id: "valor", tipo: "input", label: "Creatinina Urinária 24h", unidade: "mg/24h", min: 0, max: 5000 }],
        referencia: { min: 800, max: 2000, unidade: "mg/24h" },
        interpretacao: [
            { faixa: [0, 799], status: "baixo", termo: "Baixa", nota: "Creatinina urinária baixa. Considerar redução de massa muscular." },
            { faixa: [800, 2000], status: "normal", termo: "Normal", nota: "✅ Creatinina urinária normal." },
            { faixa: [2000.1, 5000], status: "alto", termo: "Elevada", nota: "⚠️ Creatinina urinária elevada. Considerar dieta rica em creatina ou rabdomiólise." }
        ]
    },

    "Cálcio Urinário (24h)": {
        tipo: "exame",
        sinonimos: ["calcio urinario", "calciuria"],
        campos: [{ id: "valor", tipo: "input", label: "Cálcio Urinário 24h", unidade: "mg/24h", min: 0, max: 1000 }],
        referencia: { min: 100, max: 300, unidade: "mg/24h" },
        interpretacao: [
            { faixa: [0, 99], status: "baixo", termo: "Hipocalciúria", nota: "Hipocalciúria. Considerar hipoparatiroidismo ou deficiência de vit. D." },
            { faixa: [100, 300], status: "normal", termo: "Normal", nota: "✅ Calciúria normal." },
            { faixa: [300.1, 1000], status: "alto", termo: "Hipercalciúria", nota: "⚠️ Hipercalciúria. Risco de litíase renal." }
        ]
    },

    "Ácido Úrico Urinário (24h)": {
        tipo: "exame",
        sinonimos: ["acido urico urinario", "uricosuria"],
        campos: [{ id: "valor", tipo: "input", label: "Ácido Úrico Urinário 24h", unidade: "mg/24h", min: 0, max: 2000 }],
        referencia: { min: 250, max: 750, unidade: "mg/24h" },
        interpretacao: [
            { faixa: [0, 249], status: "baixo", termo: "Baixo", nota: "Uricosúria baixa. Considerar dieta pobre em purinas." },
            { faixa: [250, 750], status: "normal", termo: "Normal", nota: "✅ Uricosúria normal." },
            { faixa: [750.1, 2000], status: "alto", termo: "Elevado", nota: "⚠️ Uricosúria elevada. Risco de litíase úrica. Hidratação." }
        ]
    },

    "Osmolaridade Urinária": {
        tipo: "exame",
        sinonimos: ["osmolaridade urinaria", "osmolalidade urinaria"],
        campos: [{ id: "valor", tipo: "input", label: "Osmolaridade Urinária", unidade: "mOsm/kg", min: 0, max: 1500 }],
        referencia: { min: 300, max: 900, unidade: "mOsm/kg" },
        interpretacao: [
            { faixa: [0, 299], status: "baixo", termo: "Baixa", nota: "Osmolaridade urinária baixa. Considerar diabetes insipidus ou hidratação excessiva." },
            { faixa: [300, 900], status: "normal", termo: "Normal", nota: "✅ Osmolaridade urinária normal." },
            { faixa: [900.1, 1500], status: "alto", termo: "Elevada", nota: "⚠️ Osmolaridade urinária elevada. Considerar desidratação." }
        ]
    },

    "Sódio Urinário": {
        tipo: "exame",
        sinonimos: ["sodio urinario", "natriuria"],
        campos: [{ id: "valor", tipo: "input", label: "Sódio Urinário", unidade: "mEq/L", min: 0, max: 300 }],
        referencia: { min: 40, max: 220, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [0, 39], status: "baixo", termo: "Baixo", nota: "Sódio urinário baixo. Considerar depleção de volume ou SIADH." },
            { faixa: [40, 220], status: "normal", termo: "Normal", nota: "✅ Sódio urinário normal." },
            { faixa: [220.1, 300], status: "alto", termo: "Elevado", nota: "⚠️ Sódio urinário elevado. Considerar diuréticos ou insuficiência renal." }
        ]
    },

    "Potássio Urinário": {
        tipo: "exame",
        sinonimos: ["potassio urinario", "caliuria"],
        campos: [{ id: "valor", tipo: "input", label: "Potássio Urinário", unidade: "mEq/L", min: 0, max: 200 }],
        referencia: { min: 25, max: 125, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [0, 24], status: "baixo", termo: "Baixo", nota: "Potássio urinário baixo. Considerar depleção ou hipoaldosteronismo." },
            { faixa: [25, 125], status: "normal", termo: "Normal", nota: "✅ Potássio urinário normal." },
            { faixa: [125.1, 200], status: "alto", termo: "Elevado", nota: "⚠️ Potássio urinário elevado. Considerar diuréticos ou hiperaldosteronismo." }
        ]
    },

    "Depuração de Água Livre": {
        tipo: "exame",
        sinonimos: ["depuracao agua livre", "ch2o"],
        campos: [{ id: "valor", tipo: "input", label: "CH2O", unidade: "mL/min", min: -20, max: 20 }],
        referencia: { min: -1.5, max: 1.5, unidade: "mL/min" },
        interpretacao: [
            { faixa: [-20, -1.6], status: "baixo", termo: "Negativa", nota: "Depuração de água livre negativa. SIADH ou hipovolemia." },
            { faixa: [-1.5, 1.5], status: "normal", termo: "Normal", nota: "✅ Depuração de água livre normal." },
            { faixa: [1.6, 20], status: "alto", termo: "Positiva", nota: "⚠️ Depuração de água livre positiva. Diabetes insipidus ou diurese osmótica." }
        ]
    },

    "β2-Microglobulina": {
        tipo: "exame",
        sinonimos: ["b2 microglobulina", "beta 2 microglobulina"],
        campos: [{ id: "valor", tipo: "input", label: "β2-Microglobulina", unidade: "mg/L", min: 0, max: 20 }],
        referencia: { min: 0.7, max: 1.8, unidade: "mg/L" },
        interpretacao: [
            { faixa: [0, 0.69], status: "baixo", termo: "Baixa", nota: "β2-microglobulina baixa. Raramente significativo." },
            { faixa: [0.7, 1.8], status: "normal", termo: "Normal", nota: "✅ β2-microglobulina normal." },
            { faixa: [1.81, 20], status: "alto", termo: "Elevada", nota: "⚠️ β2-microglobulina elevada. Marcador de lesão tubular ou linfoma." }
        ]
    },

    "NGAL (Lipocalina Associada à Gelatinase)": {
        tipo: "exame",
        sinonimos: ["ngal", "lipocalina"],
        campos: [{ id: "valor", tipo: "input", label: "NGAL", unidade: "ng/mL", min: 0, max: 2000 }],
        referencia: { min: 0, max: 150, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 150], status: "normal", termo: "Normal", nota: "✅ NGAL normal. Baixo risco de lesão renal aguda." },
            { faixa: [150.1, 2000], status: "alto", termo: "Elevado", nota: "⚠️ NGAL elevado. Marcador precoce de lesão renal aguda." }
        ]
    },

    "KIM-1 (Molécula de Lesão Renal)": {
        tipo: "exame",
        sinonimos: ["kim 1", "kim1"],
        campos: [{ id: "valor", tipo: "input", label: "KIM-1", unidade: "ng/mL", min: 0, max: 50 }],
        referencia: { min: 0, max: 0.5, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.5], status: "normal", termo: "Normal", nota: "✅ KIM-1 normal." },
            { faixa: [0.51, 50], status: "alto", termo: "Elevado", nota: "⚠️ KIM-1 elevado. Sugere lesão tubular renal." }
        ]
    },

        /* ====================================================================== */
    /* LOTE 2 — B. FUNÇÃO HEPÁTICA (15 itens)                                  */
    /* ====================================================================== */

    "TGO (AST)": {
        tipo: "exame",
        sinonimos: ["tgo", "ast", "aspartato aminotransferase"],
        campos: [{ id: "valor", tipo: "input", label: "TGO/AST", unidade: "U/L", min: 0, max: 5000 }],
        referencia: { min: 5, max: 40, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 40], status: "normal", termo: "Normal", nota: "✅ TGO normal." },
            { faixa: [40.1, 200], status: "leve", termo: "Elevação leve", nota: "⚠️ TGO levemente elevada. Considerar hepatite, álcool ou medicação." },
            { faixa: [200.1, 5000], status: "alto", termo: "Elevação marcada", nota: "⚠️ TGO muito elevada. Lesão hepatocelular aguda. Investigar urgente." }
        ]
    },

    "TGP (ALT)": {
        tipo: "exame",
        sinonimos: ["tgp", "alt", "alanina aminotransferase"],
        campos: [{ id: "valor", tipo: "input", label: "TGP/ALT", unidade: "U/L", min: 0, max: 5000 }],
        referencia: { min: 5, max: 40, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 40], status: "normal", termo: "Normal", nota: "✅ TGP normal." },
            { faixa: [40.1, 200], status: "leve", termo: "Elevação leve", nota: "⚠️ TGP levemente elevada. Considerar esteatose ou hepatite." },
            { faixa: [200.1, 5000], status: "alto", termo: "Elevação marcada", nota: "⚠️ TGP muito elevada. Lesão hepatocelular. Investigar urgente." }
        ]
    },

    "GGT (Gama Glutamil Transferase)": {
        tipo: "exame",
        sinonimos: ["ggt", "gama gt", "gama glutamil"],
        campos: [{ id: "valor", tipo: "input", label: "GGT", unidade: "U/L", min: 0, max: 1000 }],
        referencia: { min: 5, max: 50, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 50], status: "normal", termo: "Normal", nota: "✅ GGT normal." },
            { faixa: [50.1, 1000], status: "alto", termo: "Elevada", nota: "⚠️ GGT elevada. Sensível a álcool, colestase e fármacos." }
        ]
    },

    "Fosfatase Alcalina": {
        tipo: "exame",
        sinonimos: ["fosfatase alcalina", "fa", "alp"],
        campos: [{ id: "valor", tipo: "input", label: "Fosfatase Alcalina", unidade: "U/L", min: 0, max: 2000 }],
        referencia: { min: 40, max: 130, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 39], status: "baixo", termo: "Baixa", nota: "FA baixa. Considerar hipofosfatasia ou desnutrição." },
            { faixa: [40, 130], status: "normal", termo: "Normal", nota: "✅ Fosfatase alcalina normal." },
            { faixa: [130.1, 2000], status: "alto", termo: "Elevada", nota: "⚠️ FA elevada. Considerar colestase, doença óssea ou gravidez." }
        ]
    },

    "Bilirrubina Total": {
        tipo: "exame",
        sinonimos: ["bilirrubina total", "bt", "bilirrubina"],
        campos: [{ id: "valor", tipo: "input", label: "Bilirrubina Total", unidade: "mg/dL", min: 0, max: 50 }],
        referencia: { min: 0.1, max: 1.2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 0.1], status: "baixo", termo: "Baixa", nota: "Bilirrubina baixa. Sem significado." },
            { faixa: [0.11, 1.2], status: "normal", termo: "Normal", nota: "✅ Bilirrubina normal." },
            { faixa: [1.21, 3], status: "leve", termo: "Icterícia leve", nota: "⚠️ Bilirrubina elevada. Icterícia leve. Investigar causa." },
            { faixa: [3.01, 50], status: "alto", termo: "Icterícia grave", nota: "⚠️ Bilirrubina muito elevada. Icterícia grave. Investigar urgente." }
        ]
    },

    "Bilirrubina Direta": {
        tipo: "exame",
        sinonimos: ["bilirrubina direta", "bd", "bilirrubina conjugada"],
        campos: [{ id: "valor", tipo: "input", label: "Bilirrubina Direta", unidade: "mg/dL", min: 0, max: 30 }],
        referencia: { min: 0, max: 0.3, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 0.3], status: "normal", termo: "Normal", nota: "✅ Bilirrubina direta normal." },
            { faixa: [0.31, 30], status: "alto", termo: "Elevada", nota: "⚠️ Bilirrubina direta elevada. Sugere colestase ou obstrução biliar." }
        ]
    },

    "Bilirrubina Indireta": {
        tipo: "exame",
        sinonimos: ["bilirrubina indireta", "bi", "bilirrubina nao conjugada"],
        campos: [{ id: "valor", tipo: "input", label: "Bilirrubina Indireta", unidade: "mg/dL", min: 0, max: 30 }],
        referencia: { min: 0.1, max: 0.9, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 0.09], status: "baixo", termo: "Baixa", nota: "Bilirrubina indireta baixa. Sem significado." },
            { faixa: [0.1, 0.9], status: "normal", termo: "Normal", nota: "✅ Bilirrubina indireta normal." },
            { faixa: [0.91, 30], status: "alto", termo: "Elevada", nota: "⚠️ Bilirrubina indireta elevada. Sugere hemólise ou Gilbert." }
        ]
    },

    "Albumina": {
        tipo: "exame",
        sinonimos: ["albumina", "alb", "albumina serica"],
        campos: [{ id: "valor", tipo: "input", label: "Albumina", unidade: "g/dL", min: 0, max: 10 }],
        referencia: { min: 3.5, max: 5.5, unidade: "g/dL" },
        interpretacao: [
            { faixa: [0, 3.4], status: "baixo", termo: "Hipoalbuminemia", nota: "⚠️ Albumina baixa. Considerar desnutrição, hepatopatia ou nefropatia." },
            { faixa: [3.5, 5.5], status: "normal", termo: "Normal", nota: "✅ Albumina normal." },
            { faixa: [5.6, 10], status: "alto", termo: "Elevada", nota: "Albumina elevada. Geralmente desidratação." }
        ]
    },

    "Globulina": {
        tipo: "exame",
        sinonimos: ["globulina", "globulinas"],
        campos: [{ id: "valor", tipo: "input", label: "Globulina", unidade: "g/dL", min: 0, max: 10 }],
        referencia: { min: 2, max: 3.5, unidade: "g/dL" },
        interpretacao: [
            { faixa: [0, 1.9], status: "baixo", termo: "Baixa", nota: "Globulina baixa. Considerar imunodeficiência ou síndrome nefrótica." },
            { faixa: [2, 3.5], status: "normal", termo: "Normal", nota: "✅ Globulina normal." },
            { faixa: [3.51, 10], status: "alto", termo: "Elevada", nota: "⚠️ Globulina elevada. Considerar infecção crónica, cirrose ou mieloma." }
        ]
    },

    "Relação Albumina/Globulina": {
        tipo: "exame",
        sinonimos: ["relacao albumina globulina", "a/g"],
        campos: [{ id: "valor", tipo: "input", label: "Relação A/G", unidade: "", min: 0, max: 5 }],
        referencia: { min: 1.1, max: 2.5, unidade: "" },
        interpretacao: [
            { faixa: [0, 1.09], status: "baixo", termo: "Invertida", nota: "⚠️ Relação A/G invertida. Considerar cirrose ou mieloma." },
            { faixa: [1.1, 2.5], status: "normal", termo: "Normal", nota: "✅ Relação A/G normal." },
            { faixa: [2.51, 5], status: "alto", termo: "Elevada", nota: "Relação A/G elevada. Raramente significativo." }
        ]
    },

    "Amónia (NH3)": {
        tipo: "exame",
        sinonimos: ["amonia", "nh3", "amonio"],
        campos: [{ id: "valor", tipo: "input", label: "Amónia", unidade: "µmol/L", min: 0, max: 500 }],
        referencia: { min: 11, max: 35, unidade: "µmol/L" },
        interpretacao: [
            { faixa: [0, 10], status: "baixo", termo: "Baixa", nota: "Amónia baixa. Raramente significativo." },
            { faixa: [11, 35], status: "normal", termo: "Normal", nota: "✅ Amónia normal." },
            { faixa: [35.1, 500], status: "alto", termo: "Elevada", nota: "⚠️ Amónia elevada. Risco de encefalopatia hepática. Tratar causa." }
        ]
    },

    "Tempo de Protrombina (TP)": {
        tipo: "exame",
        sinonimos: ["tp", "tempo protrombina", "atividade protrombina"],
        campos: [{ id: "valor", tipo: "input", label: "Atividade de Protrombina", unidade: "%", min: 0, max: 150 }],
        referencia: { min: 70, max: 120, unidade: "%" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Reduzida", nota: "⚠️ Actividade de protrombina reduzida. Sugere hepatopatia ou deficiência de vit. K." },
            { faixa: [70, 120], status: "normal", termo: "Normal", nota: "✅ Actividade de protrombina normal." },
            { faixa: [120.1, 150], status: "alto", termo: "Elevada", nota: "Actividade de protrombina elevada. Raramente significativo." }
        ]
    },

    "5'-Nucleotidase": {
        tipo: "exame",
        sinonimos: ["5 nucleotidase", "5nt"],
        campos: [{ id: "valor", tipo: "input", label: "5'-Nucleotidase", unidade: "U/L", min: 0, max: 100 }],
        referencia: { min: 2, max: 17, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 1.9], status: "baixo", termo: "Baixa", nota: "5'-Nucleotidase baixa. Sem significado." },
            { faixa: [2, 17], status: "normal", termo: "Normal", nota: "✅ 5'-Nucleotidase normal." },
            { faixa: [17.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ 5'-Nucleotidase elevada. Marcador específico de colestase." }
        ]
    },

    "Alfa-Fetoproteína (AFP)": {
        tipo: "exame",
        sinonimos: ["afp", "alfa fetoproteina"],
        campos: [{ id: "valor", tipo: "input", label: "AFP", unidade: "ng/mL", min: 0, max: 10000 }],
        referencia: { min: 0, max: 10, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 10], status: "normal", termo: "Normal", nota: "✅ AFP normal." },
            { faixa: [10.1, 200], status: "leve", termo: "Elevada", nota: "⚠️ AFP elevada. Considerar hepatite, cirrose ou gravidez." },
            { faixa: [200.1, 10000], status: "alto", termo: "Muito elevada", nota: "⚠️ AFP muito elevada. Sugere carcinoma hepatocelular. Investigar." }
        ]
    },

        /* ====================================================================== */
    /* LOTE 2 — C. TIRÓIDE (15 itens)                                          */
    /* ====================================================================== */

    "TSH": {
        tipo: "exame",
        sinonimos: ["tsh", "tireoestimulante", "hormona tireoestimulante"],
        campos: [{ id: "valor", tipo: "input", label: "TSH", unidade: "µUI/mL", min: 0, max: 100 }],
        referencia: { min: 0.4, max: 4.5, unidade: "µUI/mL" },
        interpretacao: [
            { faixa: [0, 0.39], status: "baixo", termo: "TSH baixo", nota: "⚠️ TSH baixo. Sugere hipertiroidismo. Dosar T3/T4 livres." },
            { faixa: [0.4, 4.5], status: "normal", termo: "Normal", nota: "✅ TSH normal." },
            { faixa: [4.51, 10], status: "leve", termo: "Hipotireoidismo subclínico", nota: "⚠️ TSH elevado. Hipotireoidismo subclínico. Repetir e dosar T4 livre." },
            { faixa: [10.1, 100], status: "alto", termo: "Hipotireoidismo", nota: "⚠️ TSH muito elevado. Hipotireoidismo manifesto. Iniciar levotiroxina." }
        ]
    },

    "T4 Livre": {
        tipo: "exame",
        sinonimos: ["t4 livre", "t4l", "tiroxina livre"],
        campos: [{ id: "valor", tipo: "input", label: "T4 Livre", unidade: "ng/dL", min: 0, max: 10 }],
        referencia: { min: 0.8, max: 1.8, unidade: "ng/dL" },
        interpretacao: [
            { faixa: [0, 0.79], status: "baixo", termo: "T4 livre baixo", nota: "⚠️ T4 livre baixo. Sugere hipotireoidismo." },
            { faixa: [0.8, 1.8], status: "normal", termo: "Normal", nota: "✅ T4 livre normal." },
            { faixa: [1.81, 10], status: "alto", termo: "T4 livre elevado", nota: "⚠️ T4 livre elevado. Sugere hipertiroidismo." }
        ]
    },

    "T4 Total": {
        tipo: "exame",
        sinonimos: ["t4 total", "tiroxina total"],
        campos: [{ id: "valor", tipo: "input", label: "T4 Total", unidade: "µg/dL", min: 0, max: 30 }],
        referencia: { min: 5, max: 12, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Baixo", nota: "⚠️ T4 total baixo. Considerar hipotireoidismo ou hipoproteinemia." },
            { faixa: [5, 12], status: "normal", termo: "Normal", nota: "✅ T4 total normal." },
            { faixa: [12.1, 30], status: "alto", termo: "Elevado", nota: "⚠️ T4 total elevado. Considerar hipertiroidismo ou gravidez." }
        ]
    },

    "T3 Livre": {
        tipo: "exame",
        sinonimos: ["t3 livre", "t3l", "triiodotironina livre"],
        campos: [{ id: "valor", tipo: "input", label: "T3 Livre", unidade: "pg/mL", min: 0, max: 30 }],
        referencia: { min: 2.3, max: 4.2, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 2.29], status: "baixo", termo: "T3 livre baixo", nota: "⚠️ T3 livre baixo. Considerar hipotireoidismo ou doença não tiroideia." },
            { faixa: [2.3, 4.2], status: "normal", termo: "Normal", nota: "✅ T3 livre normal." },
            { faixa: [4.21, 30], status: "alto", termo: "T3 livre elevado", nota: "⚠️ T3 livre elevado. Sugere hipertiroidismo." }
        ]
    },

    "T3 Total": {
        tipo: "exame",
        sinonimos: ["t3 total", "triiodotironina total"],
        campos: [{ id: "valor", tipo: "input", label: "T3 Total", unidade: "ng/dL", min: 0, max: 500 }],
        referencia: { min: 80, max: 200, unidade: "ng/dL" },
        interpretacao: [
            { faixa: [0, 79], status: "baixo", termo: "Baixo", nota: "⚠️ T3 total baixo. Considerar hipotireoidismo ou doença não tiroideia." },
            { faixa: [80, 200], status: "normal", termo: "Normal", nota: "✅ T3 total normal." },
            { faixa: [200.1, 500], status: "alto", termo: "Elevado", nota: "⚠️ T3 total elevado. Sugere hipertiroidismo." }
        ]
    },

    "Anti-TPO": {
        tipo: "exame",
        sinonimos: ["anti tpo", "anticorpo tpo", "anti peroxidase"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-TPO", unidade: "UI/mL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 35, unidade: "UI/mL" },
        interpretacao: [
            { faixa: [0, 35], status: "negativo", termo: "Negativo", nota: "✅ Anti-TPO negativo." },
            { faixa: [35.1, 5000], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-TPO positivo. Sugere tiroidite autoimune (Hashimoto)." }
        ]
    },

    "Anti-TG": {
        tipo: "exame",
        sinonimos: ["anti tg", "anticorpo tireoglobulina"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-TG", unidade: "UI/mL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 40, unidade: "UI/mL" },
        interpretacao: [
            { faixa: [0, 40], status: "negativo", termo: "Negativo", nota: "✅ Anti-TG negativo." },
            { faixa: [40.1, 5000], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-TG positivo. Sugere tiroidite autoimune." }
        ]
    },

    "Tireoglobulina": {
        tipo: "exame",
        sinonimos: ["tireoglobulina", "tg"],
        campos: [{ id: "valor", tipo: "input", label: "Tireoglobulina", unidade: "ng/mL", min: 0, max: 1000 }],
        referencia: { min: 3, max: 40, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 2.9], status: "baixo", termo: "Baixa", nota: "Tireoglobulina baixa. Considerar hipotireoidismo ou tireoidectomia." },
            { faixa: [3, 40], status: "normal", termo: "Normal", nota: "✅ Tireoglobulina normal." },
            { faixa: [40.1, 1000], status: "alto", termo: "Elevada", nota: "⚠️ Tireoglobulina elevada. Considerar bócio ou carcinoma tiroideu." }
        ]
    },

    "Calcitonina": {
        tipo: "exame",
        sinonimos: ["calcitonina"],
        campos: [{ id: "valor", tipo: "input", label: "Calcitonina", unidade: "pg/mL", min: 0, max: 2000 }],
        referencia: { min: 0, max: 10, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 10], status: "normal", termo: "Normal", nota: "✅ Calcitonina normal." },
            { faixa: [10.1, 100], status: "leve", termo: "Elevada", nota: "⚠️ Calcitonina elevada. Considerar hiperplasia de células C." },
            { faixa: [100.1, 2000], status: "alto", termo: "Muito elevada", nota: "⚠️ Calcitonina muito elevada. Sugere carcinoma medular da tiróide." }
        ]
    },

    "TRAb (Anticorpo Anti-Receptor de TSH)": {
        tipo: "exame",
        sinonimos: ["trab", "anti receptor tsh", "tsi"],
        campos: [{ id: "valor", tipo: "input", label: "TRAb", unidade: "UI/L", min: 0, max: 100 }],
        referencia: { min: 0, max: 1.75, unidade: "UI/L" },
        interpretacao: [
            { faixa: [0, 1.75], status: "negativo", termo: "Negativo", nota: "✅ TRAb negativo." },
            { faixa: [1.76, 100], status: "positivo", termo: "Positivo", nota: "⚠️ TRAb positivo. Sugere doença de Graves." }
        ]
    },

    "Tiroglobulina (Pós-Tireoidectomia)": {
        tipo: "exame",
        sinonimos: ["tireoglobulina pos tireoidectomia", "tg pos cirurgia"],
        campos: [{ id: "valor", tipo: "input", label: "Tireoglobulina", unidade: "ng/mL", min: 0, max: 100 }],
        referencia: { min: 0, max: 1, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 1], status: "normal", termo: "Indetectável", nota: "✅ Tireoglobulina indetectável. Sem evidência de recidiva." },
            { faixa: [1.01, 100], status: "alto", termo: "Detectável", nota: "⚠️ Tireoglobulina detectável. Suspeita de recidiva. Investigar." }
        ]
    },

    "Iodo Urinário": {
        tipo: "exame",
        sinonimos: ["iodo urinario", "ioduria"],
        campos: [{ id: "valor", tipo: "input", label: "Iodo Urinário", unidade: "µg/L", min: 0, max: 1000 }],
        referencia: { min: 100, max: 300, unidade: "µg/L" },
        interpretacao: [
            { faixa: [0, 99], status: "baixo", termo: "Deficiência", nota: "⚠️ Iodo urinário baixo. Deficiência de iodo. Risco de bócio." },
            { faixa: [100, 300], status: "normal", termo: "Normal", nota: "✅ Iodo urinário normal." },
            { faixa: [300.1, 1000], status: "alto", termo: "Excesso", nota: "⚠️ Iodo urinário elevado. Excesso de iodo. Considerar risco de tireoidite." }
        ]
    },

    "TBG (Globulina Transportadora de Tiroxina)": {
        tipo: "exame",
        sinonimos: ["tbg", "globulina transportadora tiroxina"],
        campos: [{ id: "valor", tipo: "input", label: "TBG", unidade: "µg/mL", min: 0, max: 100 }],
        referencia: { min: 15, max: 30, unidade: "µg/mL" },
        interpretacao: [
            { faixa: [0, 14.9], status: "baixo", termo: "Baixa", nota: "TBG baixa. Considerar hepatopatia ou síndrome nefrótica." },
            { faixa: [15, 30], status: "normal", termo: "Normal", nota: "✅ TBG normal." },
            { faixa: [30.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ TBG elevada. Considerar gravidez ou uso de estrogénios." }
        ]
    },

    "Tiroxina Livre (Índice de T4 Livre)": {
        tipo: "exame",
        sinonimos: ["indice t4 livre", "ft4i"],
        campos: [{ id: "valor", tipo: "input", label: "Índice de T4 Livre", unidade: "", min: 0, max: 20 }],
        referencia: { min: 4.5, max: 12, unidade: "" },
        interpretacao: [
            { faixa: [0, 4.4], status: "baixo", termo: "Baixo", nota: "⚠️ Índice de T4 livre baixo. Sugere hipotireoidismo." },
            { faixa: [4.5, 12], status: "normal", termo: "Normal", nota: "✅ Índice de T4 livre normal." },
            { faixa: [12.1, 20], status: "alto", termo: "Elevado", nota: "⚠️ Índice de T4 livre elevado. Sugere hipertiroidismo." }
        ]
    },

    "Prova de Captação de Iodo Radioativo (RAIU)": {
        tipo: "exame",
        sinonimos: ["raiu", "captacao iodo radioativo"],
        campos: [{ id: "valor", tipo: "input", label: "RAIU 24h", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 15, max: 35, unidade: "%" },
        interpretacao: [
            { faixa: [0, 14.9], status: "baixo", termo: "Baixa captação", nota: "⚠️ Captação baixa. Sugere tireoidite ou hipotireoidismo." },
            { faixa: [15, 35], status: "normal", termo: "Normal", nota: "✅ Captação normal." },
            { faixa: [35.1, 100], status: "alto", termo: "Alta captação", nota: "⚠️ Captação elevada. Sugere hipertiroidismo (Graves)." }
        ]
    },

        /* ====================================================================== */
    /* LOTE 3 — A. CARDIOLOGIA (20 itens)                                      */
    /* ====================================================================== */

    "Troponina I": {
        tipo: "exame",
        sinonimos: ["troponina", "troponina i", "tni", "hs-tni"],
        campos: [{ id: "valor", tipo: "input", label: "Troponina I", unidade: "ng/mL", min: 0, max: 50 }],
        referencia: { min: 0, max: 0.04, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.04], status: "normal", termo: "Normal", nota: "✅ Troponina normal. Baixa probabilidade de enfarte." },
            { faixa: [0.041, 0.5], status: "leve", termo: "Elevação leve", nota: "⚠️ Troponina levemente elevada. Considerar enfarte sem supra ou miocardite." },
            { faixa: [0.51, 50], status: "grave", termo: "Elevação grave", nota: "⚠️ TROPONINA ELEVADA! Suspeita de enfarte agudo do miocárdio. ECG urgente." }
        ]
    },

    "Troponina T": {
        tipo: "exame",
        sinonimos: ["troponina t", "tnt", "hs-tnt"],
        campos: [{ id: "valor", tipo: "input", label: "Troponina T", unidade: "ng/mL", min: 0, max: 50 }],
        referencia: { min: 0, max: 0.014, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.014], status: "normal", termo: "Normal", nota: "✅ Troponina T normal." },
            { faixa: [0.015, 0.1], status: "leve", termo: "Elevação leve", nota: "⚠️ Troponina T levemente elevada. Investigar causa cardíaca." },
            { faixa: [0.101, 50], status: "grave", termo: "Elevação grave", nota: "⚠️ TROPONINA T ELEVADA! Suspeita de síndrome coronária aguda." }
        ]
    },

    "CK Total": {
        tipo: "exame",
        sinonimos: ["ck", "creatina quinase", "ck total"],
        campos: [{ id: "valor", tipo: "input", label: "CK Total", unidade: "U/L", min: 0, max: 20000 }],
        referencia: { min: 30, max: 200, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 29], status: "baixo", termo: "Baixa", nota: "CK baixa. Raramente significativo." },
            { faixa: [30, 200], status: "normal", termo: "Normal", nota: "✅ CK total normal." },
            { faixa: [200.1, 1000], status: "leve", termo: "Elevada", nota: "⚠️ CK elevada. Considerar exercício, injecção IM ou hipotiroidismo." },
            { faixa: [1000.1, 20000], status: "grave", termo: "Muito elevada", nota: "⚠️ CK muito elevada. Considerar rabdomiólise ou enfarte. Risco renal." }
        ]
    },

    "CK-MB": {
        tipo: "exame",
        sinonimos: ["ckmb", "ck mb", "creatina quinase mb"],
        campos: [{ id: "valor", tipo: "input", label: "CK-MB", unidade: "ng/mL", min: 0, max: 200 }],
        referencia: { min: 0, max: 5, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Normal", nota: "✅ CK-MB normal." },
            { faixa: [5.1, 25], status: "leve", termo: "Elevada", nota: "⚠️ CK-MB elevada. Lesão miocárdica possível." },
            { faixa: [25.1, 200], status: "grave", termo: "Muito elevada", nota: "⚠️ CK-MB muito elevada. Lesão miocárdica significativa. ECG urgente." }
        ]
    },

    "Mioglobina": {
        tipo: "exame",
        sinonimos: ["mioglobina", "mb"],
        campos: [{ id: "valor", tipo: "input", label: "Mioglobina", unidade: "ng/mL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 85, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 85], status: "normal", termo: "Normal", nota: "✅ Mioglobina normal." },
            { faixa: [85.1, 200], status: "leve", termo: "Elevada", nota: "⚠️ Mioglobina elevada. Marcador precoce de lesão muscular." },
            { faixa: [200.1, 1000], status: "grave", termo: "Muito elevada", nota: "⚠️ Mioglobina muito elevada. Risco de rabdomiólise e lesão renal." }
        ]
    },

    "BNP (Peptídeo Natriurético Tipo B)": {
        tipo: "exame",
        sinonimos: ["bnp", "peptideo natriuretico", "brain natriuretic peptide"],
        campos: [{ id: "valor", tipo: "input", label: "BNP", unidade: "pg/mL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 100, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 100], status: "normal", termo: "Normal", nota: "✅ BNP normal. Insuficiência cardíaca pouco provável." },
            { faixa: [100.1, 500], status: "leve", termo: "Elevado", nota: "⚠️ BNP elevado. Possível insuficiência cardíaca." },
            { faixa: [500.1, 5000], status: "grave", termo: "Muito elevado", nota: "⚠️ BNP muito elevado. Insuficiência cardíaca descompensada provável." }
        ]
    },

    "NT-proBNP": {
        tipo: "exame",
        sinonimos: ["nt probnp", "probnp", "nt-probnp"],
        campos: [{ id: "valor", tipo: "input", label: "NT-proBNP", unidade: "pg/mL", min: 0, max: 35000 }],
        referencia: { min: 0, max: 125, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 125], status: "normal", termo: "Normal", nota: "✅ NT-proBNP normal." },
            { faixa: [125.1, 900], status: "leve", termo: "Elevado", nota: "⚠️ NT-proBNP elevado. Possível insuficiência cardíaca." },
            { faixa: [900.1, 35000], status: "grave", termo: "Muito elevado", nota: "⚠️ NT-proBNP muito elevado. Insuficiência cardíaca grave." }
        ]
    },

    "D-dímero (Cardíaco)": {
        tipo: "exame",
        sinonimos: ["ddimero cardiaco", "d-dimero cardiaco"],
        campos: [{ id: "valor", tipo: "input", label: "D-dímero", unidade: "µg/mL", min: 0, max: 20 }],
        referencia: { min: 0, max: 0.5, unidade: "µg/mL" },
        interpretacao: [
            { faixa: [0, 0.5], status: "normal", termo: "Normal", nota: "✅ D-dímero normal." },
            { faixa: [0.51, 20], status: "alto", termo: "Elevado", nota: "⚠️ D-dímero elevado. Considerar TEP, TVP ou dissecção aórtica." }
        ]
    },

    "Homocisteína": {
        tipo: "exame",
        sinonimos: ["homocisteina", "hcy"],
        campos: [{ id: "valor", tipo: "input", label: "Homocisteína", unidade: "µmol/L", min: 0, max: 100 }],
        referencia: { min: 5, max: 15, unidade: "µmol/L" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Baixa", nota: "Homocisteína baixa. Raramente significativo." },
            { faixa: [5, 15], status: "normal", termo: "Normal", nota: "✅ Homocisteína normal." },
            { faixa: [15.1, 30], status: "leve", termo: "Elevada", nota: "⚠️ Homocisteína elevada. Factor de risco cardiovascular." },
            { faixa: [30.1, 100], status: "grave", termo: "Muito elevada", nota: "⚠️ Homocisteína muito elevada. Risco trombótico. Investigar causa metabólica." }
        ]
    },

    "Lipoproteína (a)": {
        tipo: "exame",
        sinonimos: ["lipoproteina a", "lpa"],
        campos: [{ id: "valor", tipo: "input", label: "Lp(a)", unidade: "mg/dL", min: 0, max: 300 }],
        referencia: { min: 0, max: 30, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 30], status: "normal", termo: "Normal", nota: "✅ Lp(a) normal." },
            { faixa: [30.1, 300], status: "alto", termo: "Elevada", nota: "⚠️ Lp(a) elevada. Factor de risco cardiovascular independente." }
        ]
    },

    "Apolipoproteína A1": {
        tipo: "exame",
        sinonimos: ["apoa1", "apolipoproteina a1"],
        campos: [{ id: "valor", tipo: "input", label: "ApoA1", unidade: "mg/dL", min: 0, max: 300 }],
        referencia: { min: 100, max: 200, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 99], status: "baixo", termo: "Baixa", nota: "⚠️ ApoA1 baixa. Factor de risco cardiovascular." },
            { faixa: [100, 200], status: "normal", termo: "Normal", nota: "✅ ApoA1 normal." },
            { faixa: [200.1, 300], status: "alto", termo: "Elevada", nota: "ApoA1 elevada. Efeito protector." }
        ]
    },

    "Apolipoproteína B": {
        tipo: "exame",
        sinonimos: ["apob", "apolipoproteina b"],
        campos: [{ id: "valor", tipo: "input", label: "ApoB", unidade: "mg/dL", min: 0, max: 300 }],
        referencia: { min: 0, max: 100, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 100], status: "normal", termo: "Normal", nota: "✅ ApoB normal." },
            { faixa: [100.1, 300], status: "alto", termo: "Elevada", nota: "⚠️ ApoB elevada. Factor de risco cardiovascular." }
        ]
    },

    "Índice de Castelli (CT/HDL)": {
        tipo: "escala",
        sinonimos: ["indice castelli", "ct hdl", "colesterol hdl ratio"],
        campos: [
            { id: "ct", tipo: "input", label: "Colesterol Total", unidade: "mg/dL", min: 0, max: 500 },
            { id: "hdl", tipo: "input", label: "HDL", unidade: "mg/dL", min: 1, max: 150 }
        ],
        calculo: { formula: "ct / hdl", mostrarFormula: "CT / HDL" },
        referencia: { min: 0, max: 4.5, label: "Normal" },
        interpretacao: [
            { faixa: [0, 4.5], status: "bom", classificacao: "Normal", nota: "✅ Índice de Castelli normal. Risco cardiovascular baixo." },
            { faixa: [4.51, 6], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco cardiovascular moderado." },
            { faixa: [6.01, 20], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco cardiovascular elevado." }
        ]
    },

    "Índice de Castelli (LDL/HDL)": {
        tipo: "escala",
        sinonimos: ["indice castelli ldl", "ldl hdl ratio"],
        campos: [
            { id: "ldl", tipo: "input", label: "LDL", unidade: "mg/dL", min: 0, max: 400 },
            { id: "hdl", tipo: "input", label: "HDL", unidade: "mg/dL", min: 1, max: 150 }
        ],
        calculo: { formula: "ldl / hdl", mostrarFormula: "LDL / HDL" },
        referencia: { min: 0, max: 3.5, label: "Normal" },
        interpretacao: [
            { faixa: [0, 3.5], status: "bom", classificacao: "Normal", nota: "✅ Índice LDL/HDL normal." },
            { faixa: [3.51, 5], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco cardiovascular moderado." },
            { faixa: [5.01, 20], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco cardiovascular elevado." }
        ]
    },

    "PCR Ultrassensível (hs-CRP)": {
        tipo: "exame",
        sinonimos: ["hs crp", "pcr ultrassensivel", "pcr alta sensibilidade"],
        campos: [{ id: "valor", tipo: "input", label: "hs-CRP", unidade: "mg/L", min: 0, max: 50 }],
        referencia: { min: 0, max: 1, unidade: "mg/L" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", termo: "Baixo risco", nota: "✅ Baixo risco cardiovascular." },
            { faixa: [1.01, 3], status: "moderado", termo: "Risco médio", nota: "⚠️ Risco cardiovascular médio." },
            { faixa: [3.01, 50], status: "alto", termo: "Risco elevado", nota: "⚠️ Risco cardiovascular elevado." }
        ]
    },

    "Digoxina (Nível Sérico)": {
        tipo: "exame",
        sinonimos: ["digoxina", "nivel digoxina"],
        campos: [{ id: "valor", tipo: "input", label: "Digoxina", unidade: "ng/mL", min: 0, max: 10 }],
        referencia: { min: 0.5, max: 2, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.49], status: "baixo", termo: "Subterapêutico", nota: "Digoxina subterapêutica. Considerar ajuste de dose." },
            { faixa: [0.5, 2], status: "normal", termo: "Terapêutico", nota: "✅ Nível terapêutico de digoxina." },
            { faixa: [2.01, 10], status: "grave", termo: "Tóxico", nota: "⚠️ DIGOXINA TÓXICA! Risco de arritmia. Suspender e monitorizar." }
        ]
    },

    "Amiodarona (Nível Sérico)": {
        tipo: "exame",
        sinonimos: ["amiodarona", "nivel amiodarona"],
        campos: [{ id: "valor", tipo: "input", label: "Amiodarona", unidade: "mg/L", min: 0, max: 10 }],
        referencia: { min: 0.5, max: 2.5, unidade: "mg/L" },
        interpretacao: [
            { faixa: [0, 0.49], status: "baixo", termo: "Subterapêutico", nota: "Amiodarona subterapêutica." },
            { faixa: [0.5, 2.5], status: "normal", termo: "Terapêutico", nota: "✅ Nível terapêutico de amiodarona." },
            { faixa: [2.51, 10], status: "grave", termo: "Tóxico", nota: "⚠️ Amiodarona tóxica. Risco de toxicidade pulmonar e tireoidiana." }
        ]
    },

    "Lítio (Nível Sérico)": {
        tipo: "exame",
        sinonimos: ["litio", "nivel litio", "litemia"],
        campos: [{ id: "valor", tipo: "input", label: "Lítio", unidade: "mEq/L", min: 0, max: 5 }],
        referencia: { min: 0.6, max: 1.2, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [0, 0.59], status: "baixo", termo: "Subterapêutico", nota: "Lítio subterapêutico." },
            { faixa: [0.6, 1.2], status: "normal", termo: "Terapêutico", nota: "✅ Nível terapêutico de lítio." },
            { faixa: [1.21, 2], status: "moderado", termo: "Elevado", nota: "⚠️ Lítio elevado. Risco de toxicidade. Monitorizar." },
            { faixa: [2.01, 5], status: "grave", termo: "Tóxico", nota: "⚠️ LÍTIO TÓXICO! Risco de convulsões e insuficiência renal. Hemodiálise." }
        ]
    },

    "Magnésio (Cardíaco)": {
        tipo: "exame",
        sinonimos: ["magnesio cardiaco", "mg cardiaco"],
        campos: [{ id: "valor", tipo: "input", label: "Magnésio", unidade: "mg/dL", min: 0, max: 10 }],
        referencia: { min: 1.7, max: 2.2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 1.6], status: "baixo", termo: "Hipomagnesemia", nota: "⚠️ Hipomagnesemia. Risco de arritmias. Repor." },
            { faixa: [1.7, 2.2], status: "normal", termo: "Normal", nota: "✅ Magnésio normal." },
            { faixa: [2.3, 10], status: "alto", termo: "Hipermagnesemia", nota: "⚠️ Hipermagnesemia. Risco de bradicardia e bloqueio." }
        ]
    },

    "Potássio (Cardíaco)": {
        tipo: "exame",
        sinonimos: ["potassio cardiaco", "k cardiaco"],
        campos: [{ id: "valor", tipo: "input", label: "Potássio", unidade: "mEq/L", min: 1, max: 10 }],
        referencia: { min: 3.5, max: 5.1, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [1, 3.4], status: "baixo", termo: "Hipocaliemia", nota: "⚠️ Hipocaliemia. Risco de arritmia. Repor." },
            { faixa: [3.5, 5.1], status: "normal", termo: "Normal", nota: "✅ Potássio normal." },
            { faixa: [5.2, 10], status: "grave", termo: "Hipercaliemia", nota: "⚠️ HIPERCALIEMIA! Risco de paragem cardíaca. ECG urgente." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 3 — B. SEROLOGIA / INFECCIOSAS (20 itens)                          */
    /* ====================================================================== */

    "Malária": {
        tipo: "exame",
        sinonimos: ["malaria", "paludismo", "plasmodium"],
        campos: [{ id: "parasitemia", tipo: "input", label: "Parasitémia", unidade: "/µL", min: 0, max: 9999999 }],
        interpretacao: [
            { faixa: [0, 0], status: "negativo", classificacao: "Negativo", termo: "Negativo", nota: "Malária negativa. Descartar infecção." },
            { faixa: [1, 999], status: "leve", classificacao: "Leve", termo: "Positivo", nota: "Malária leve. Tratamento ambulatorial com Arteméter-Lumefantrina 3 dias." },
            { faixa: [1000, 9999], status: "moderado", classificacao: "Moderada", termo: "Positivo", nota: "Malária moderada. Internação. Hemograma + função renal." },
            { faixa: [10000, 99999], status: "grave", classificacao: "Grave", termo: "Positivo", nota: "⚠️ MALÁRIA GRAVE! UCI. Arteméter IV + glicemia a cada 6h." },
            { faixa: [100000, 9999999], status: "muito_grave", classificacao: "Muito Grave", termo: "Positivo", nota: "⚠️ MALÁRIA MUITO GRAVE! UCI urgente. Transfusão + artesunato IV." }
        ]
    },

    "HIV": {
        tipo: "exame",
        sinonimos: ["hiv", "aids", "vih"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Reagente", igg: "Não Reagente" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ HIV — INFECÇÃO AGUDA. Notificar e iniciar TARV." },
            { padrao: { igm: "Reagente", igg: "Reagente" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "HIV — infecção recente/soroconversão. Repetir em 2-3 semanas." },
            { padrao: { igm: "Não Reagente", igg: "Reagente" }, status: "imune", termo: "Positivo", classificacao: "Infecção Pregressa", nota: "HIV — contacto prévio. Sem infecção activa." },
            { padrao: { igm: "Não Reagente", igg: "Não Reagente" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "HIV — sorologia negativa. Susceptível." }
        ]
    },

    "Hepatite A (Anti-HAV)": {
        tipo: "exame",
        sinonimos: ["hepatite a", "hav", "anti hav"],
        campos: [
            { id: "igm", tipo: "select", label: "Anti-HAV IgM", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] },
            { id: "igg", tipo: "select", label: "Anti-HAV IgG", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Reagente", igg: "Não Reagente" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Hepatite A aguda. Notificar. Repouso e hidratação." },
            { padrao: { igm: "Reagente", igg: "Reagente" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "Hepatite A recente/em resolução." },
            { padrao: { igm: "Não Reagente", igg: "Reagente" }, status: "imune", termo: "Positivo", classificacao: "Imune", nota: "✅ Imune à hepatite A (infecção passada ou vacina)." },
            { padrao: { igm: "Não Reagente", igg: "Não Reagente" }, status: "negativo", termo: "Negativo", classificacao: "Susceptível", nota: "Susceptível à hepatite A. Considerar vacinação." }
        ]
    },

    "Hepatite B (Painel Completo)": {
        tipo: "exame",
        sinonimos: ["hepatite b", "hbv", "painel hepatite b"],
        campos: [
            { id: "hbsag", tipo: "select", label: "HBsAg", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "anti_hbs", tipo: "select", label: "Anti-HBs", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "anti_hbc", tipo: "select", label: "Anti-HBc", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "hbeag", tipo: "select", label: "HBeAg", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["hbsag", "anti_hbs", "anti_hbc", "hbeag"] },
        interpretacao: [
            { padrao: { hbsag: "Negativo", anti_hbs: "Positivo", anti_hbc: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Imune (infecção passada)", nota: "✅ Imune (infecção passada)." },
            { padrao: { hbsag: "Negativo", anti_hbs: "Positivo", anti_hbc: "Negativo" }, status: "imune", termo: "Positivo", classificacao: "Imune (vacina)", nota: "✅ Imune (vacina)." },
            { padrao: { hbsag: "Positivo", hbeag: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Hepatite B activa", nota: "⚠️ Hepatite B activa. ALTA INFECTIVIDADE! Antiviral + carga viral." },
            { padrao: { hbsag: "Positivo", hbeag: "Negativo" }, status: "moderado", termo: "Positivo", classificacao: "Hepatite B crónica inactiva", nota: "Hepatite B crónica inactiva. Repetir perfil em 6 meses." }
        ]
    },

    "Hepatite C (Anti-HCV)": {
        tipo: "exame",
        sinonimos: ["hepatite c", "hcv", "anti hcv"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-HCV", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Reagente" }, status: "grave", termo: "Positivo", classificacao: "Infectado", nota: "⚠️ Anti-HCV reagente. Confirmar com HCV-RNA. Encaminhar hepatologia." },
            { padrao: { resultado: "Não Reagente" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-HCV não reagente." }
        ]
    },

    "Hepatite D (Anti-HDV)": {
        tipo: "exame",
        sinonimos: ["hepatite d", "hdv", "anti hdv"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-HDV", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Reagente" }, status: "grave", termo: "Positivo", classificacao: "Infectado", nota: "⚠️ Anti-HDV reagente. Coinfecção/superinfecção. Hepatologia urgente." },
            { padrao: { resultado: "Não Reagente" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-HDV não reagente." }
        ]
    },

    "Hepatite E (Anti-HEV)": {
        tipo: "exame",
        sinonimos: ["hepatite e", "hev", "anti hev"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-HEV IgM", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Reagente" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Hepatite E aguda. Notificar. Risco em grávidas." },
            { padrao: { resultado: "Não Reagente" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-HEV IgM não reagente." }
        ]
    },

    "Sífilis (VDRL)": {
        tipo: "exame",
        sinonimos: ["vdrl", "sifilis", "rpr"],
        campos: [{ id: "resultado", tipo: "select", label: "VDRL", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Reagente" }, status: "grave", termo: "Positivo", classificacao: "Sífilis", nota: "⚠️ VDRL reagente. Confirmar com FTA-ABS ou TPHA. Tratar com penicilina." },
            { padrao: { resultado: "Não Reagente" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ VDRL não reagente." }
        ]
    },

    "Sífilis (FTA-ABS)": {
        tipo: "exame",
        sinonimos: ["fta abs", "fta", "sifilis confirmatorio"],
        campos: [{ id: "resultado", tipo: "select", label: "FTA-ABS", opcoes: [{ label: "Reagente", valor: "Reagente" }, { label: "Não Reagente", valor: "Não Reagente" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Reagente" }, status: "grave", termo: "Positivo", classificacao: "Sífilis Confirmada", nota: "⚠️ FTA-ABS reagente. Sífilis confirmada. Tratar com penicilina." },
            { padrao: { resultado: "Não Reagente" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ FTA-ABS não reagente." }
        ]
    },

    "Dengue (NS1/IgM/IgG)": {
        tipo: "exame",
        sinonimos: ["dengue", "ns1", "dengue igm"],
        campos: [
            { id: "ns1", tipo: "select", label: "NS1", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["ns1", "igm", "igg"] },
        interpretacao: [
            { padrao: { ns1: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Dengue Aguda", nota: "⚠️ Dengue aguda. Hidratação vigorosa. Vigiar sinais de alarme." },
            { padrao: { igm: "Positivo", igg: "Negativo" }, status: "moderado", termo: "Positivo", classificacao: "Dengue Recente", nota: "Dengue recente. Hidratação e vigilância." },
            { padrao: { igm: "Negativo", igg: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Dengue Pregressa", nota: "Dengue pregressa. Imunidade ao sorotipo." },
            { padrao: { ns1: "Negativo", igm: "Negativo", igg: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Dengue negativo." }
        ]
    },

    "Zika (IgM/IgG)": {
        tipo: "exame",
        sinonimos: ["zika", "zika virus"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Positivo", igg: "Negativo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Zika agudo. Risco de microcefalia em grávidas. Notificar." },
            { padrao: { igm: "Positivo", igg: "Positivo" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "Zika recente/em resolução." },
            { padrao: { igm: "Negativo", igg: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Infecção Pregressa", nota: "Zika pregresso. Imunidade." },
            { padrao: { igm: "Negativo", igg: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Zika negativo." }
        ]
    },

    "Chikungunya (IgM/IgG)": {
        tipo: "exame",
        sinonimos: ["chikungunya", "chik"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Positivo", igg: "Negativo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Chikungunya agudo. Hidratação e analgesia. Notificar." },
            { padrao: { igm: "Positivo", igg: "Positivo" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "Chikungunya recente." },
            { padrao: { igm: "Negativo", igg: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Infecção Pregressa", nota: "Chikungunya pregresso. Imunidade." },
            { padrao: { igm: "Negativo", igg: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Chikungunya negativo." }
        ]
    },

    "Febre Tifóide (Widal)": {
        tipo: "exame",
        sinonimos: ["widal", "febre tifoide", "salmonella typhi"],
        campos: [
            { id: "o", tipo: "select", label: "Antígeno O", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "h", tipo: "select", label: "Antígeno H", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["o", "h"] },
        interpretacao: [
            { padrao: { o: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Widal positivo. Suspeita de febre tifóide. Hemocultura e antibiótico." },
            { padrao: { h: "Positivo" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Pregressa/Vacina", nota: "Widal H positivo. Considerar infecção pregressa ou vacinação." },
            { padrao: { o: "Negativo", h: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Widal negativo." }
        ]
    },

    "Brucelose (Rose Bengal)": {
        tipo: "exame",
        sinonimos: ["brucelose", "rose bengal", "brucella"],
        campos: [{ id: "resultado", tipo: "select", label: "Rose Bengal", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Infecção", nota: "⚠️ Brucelose positiva. Confirmar com aglutinação. Tratar com doxiciclina + rifampicina." },
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Brucelose negativa." }
        ]
    },

    "Leptospirose (IgM)": {
        tipo: "exame",
        sinonimos: ["leptospirose", "leptospira"],
        campos: [{ id: "resultado", tipo: "select", label: "IgM Leptospira", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Infecção", nota: "⚠️ Leptospirose positiva. Notificar. Tratar com penicilina ou ceftriaxona." },
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Leptospirose negativa." }
        ]
    },

    "Toxoplasmose (IgM/IgG)": {
        tipo: "exame",
        sinonimos: ["toxoplasmose", "toxoplasma"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Positivo", igg: "Negativo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Toxoplasmose aguda. Risco fetal em grávidas. Tratar." },
            { padrao: { igm: "Positivo", igg: "Positivo" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "Toxoplasmose recente." },
            { padrao: { igm: "Negativo", igg: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Imune", nota: "✅ Imune à toxoplasmose." },
            { padrao: { igm: "Negativo", igg: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Susceptível", nota: "Susceptível à toxoplasmose. Cuidados em grávidas." }
        ]
    },

    "Rubéola (IgM/IgG)": {
        tipo: "exame",
        sinonimos: ["rubéola", "rubeola"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Positivo", igg: "Negativo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Rubéola aguda. Risco de síndrome congénita. Notificar." },
            { padrao: { igm: "Positivo", igg: "Positivo" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "Rubéola recente." },
            { padrao: { igm: "Negativo", igg: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Imune", nota: "✅ Imune à rubéola (infecção ou vacina)." },
            { padrao: { igm: "Negativo", igg: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Susceptível", nota: "Susceptível à rubéola. Considerar vacinação." }
        ]
    },

    "Citomegalovírus (CMV IgM/IgG)": {
        tipo: "exame",
        sinonimos: ["cmv", "citomegalovirus"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Positivo", igg: "Negativo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ CMV agudo. Risco em imunossuprimidos. Tratar." },
            { padrao: { igm: "Positivo", igg: "Positivo" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "CMV recente." },
            { padrao: { igm: "Negativo", igg: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Imune", nota: "✅ Imune ao CMV." },
            { padrao: { igm: "Negativo", igg: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Susceptível", nota: "Susceptível ao CMV." }
        ]
    },

    "Epstein-Barr (EBV)": {
        tipo: "exame",
        sinonimos: ["ebv", "epstein barr", "mononucleose"],
        campos: [
            { id: "vca_igm", tipo: "select", label: "VCA IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "vca_igg", tipo: "select", label: "VCA IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "ebna", tipo: "select", label: "EBNA IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["vca_igm", "vca_igg", "ebna"] },
        interpretacao: [
            { padrao: { vca_igm: "Positivo", vca_igg: "Positivo", ebna: "Negativo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ Mononucleose aguda (EBV). Repouso e hidratação." },
            { padrao: { vca_igm: "Negativo", vca_igg: "Positivo", ebna: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Infecção Pregressa", nota: "✅ EBV pregresso. Imunidade." },
            { padrao: { vca_igm: "Negativo", vca_igg: "Negativo", ebna: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Susceptível", nota: "Susceptível ao EBV." }
        ]
    },

    "COVID-19 (IgM/IgG)": {
        tipo: "exame",
        sinonimos: ["covid", "sars cov 2", "coronavirus"],
        campos: [
            { id: "igm", tipo: "select", label: "IgM", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] },
            { id: "igg", tipo: "select", label: "IgG", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }
        ],
        calculo: { tipo: "padrao", chave: ["igm", "igg"] },
        interpretacao: [
            { padrao: { igm: "Positivo", igg: "Negativo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Aguda", nota: "⚠️ COVID-19 agudo. Isolamento e suporte." },
            { padrao: { igm: "Positivo", igg: "Positivo" }, status: "moderado", termo: "Positivo", classificacao: "Infecção Recente", nota: "COVID-19 recente." },
            { padrao: { igm: "Negativo", igg: "Positivo" }, status: "imune", termo: "Positivo", classificacao: "Infecção Pregressa/Vacina", nota: "✅ Imunidade ao SARS-CoV-2." },
            { padrao: { igm: "Negativo", igg: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Susceptível", nota: "Susceptível ao SARS-CoV-2." }
        ]
    },

    "H. pylori (Anticorpo)": {
        tipo: "exame",
        sinonimos: ["h pylori", "helicobacter pylori"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-H. pylori", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Infectado", nota: "⚠️ H. pylori positivo. Confirmar com teste respiratório ou fezes. Tratar." },
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ H. pylori negativo." }
        ]
    },

    "Tuberculose (IGRA)": {
        tipo: "exame",
        sinonimos: ["igra", "quantiferon", "tuberculose"],
        campos: [{ id: "resultado", tipo: "select", label: "IGRA", opcoes: [{ label: "Positivo", valor: "Positivo" }, { label: "Negativo", valor: "Negativo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Infecção Latente/Activa", nota: "⚠️ IGRA positivo. Investigar TB activa. Tratar se indicado." },
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ IGRA negativo." }
        ]
    },



        /* ====================================================================== */
    /* LOTE 3 — C. URINA / LÍQUIDOS (10 itens)                                 */
    /* ====================================================================== */

    "Densidade Urinária": {
        tipo: "exame",
        sinonimos: ["densidade urinaria", "gravidade urinaria"],
        campos: [{ id: "valor", tipo: "input", label: "Densidade", unidade: "", min: 1, max: 1.06 }],
        referencia: { min: 1.005, max: 1.03, unidade: "" },
        interpretacao: [
            { faixa: [1, 1.004], status: "baixo", termo: "Hipostenúria", nota: "Densidade baixa. Considerar diabetes insipidus ou hidratação excessiva." },
            { faixa: [1.005, 1.03], status: "normal", termo: "Normal", nota: "✅ Densidade urinária normal." },
            { faixa: [1.031, 1.06], status: "alto", termo: "Hiperstenúria", nota: "⚠️ Densidade elevada. Considerar desidratação." }
        ]
    },

    "pH Urinário": {
        tipo: "exame",
        sinonimos: ["ph urinario", "ph urina"],
        campos: [{ id: "valor", tipo: "input", label: "pH Urinário", unidade: "", min: 0, max: 14 }],
        referencia: { min: 4.5, max: 8, unidade: "" },
        interpretacao: [
            { faixa: [0, 4.4], status: "baixo", termo: "Ácido", nota: "pH urinário ácido. Considerar acidose metabólica ou dieta." },
            { faixa: [4.5, 8], status: "normal", termo: "Normal", nota: "✅ pH urinário normal." },
            { faixa: [8.01, 14], status: "alto", termo: "Alcalino", nota: "⚠️ pH urinário alcalino. Considerar infecção por urease ou alcalose." }
        ]
    },

    "Glucose Urinária": {
        tipo: "exame",
        sinonimos: ["glucose urinaria", "glicosuria"],
        campos: [{ id: "resultado", tipo: "select", label: "Glucose Urinária", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "normal", termo: "Negativo", classificacao: "Normal", nota: "✅ Sem glucose na urina." },
            { padrao: { resultado: "Positivo" }, status: "alto", termo: "Positivo", classificacao: "Glicosúria", nota: "⚠️ Glucose na urina. Considerar diabetes ou limiar renal baixo." }
        ]
    },

    "Cetonas Urinárias": {
        tipo: "exame",
        sinonimos: ["cetonas urinarias", "cetonuria"],
        campos: [{ id: "resultado", tipo: "select", label: "Cetonas", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "normal", termo: "Negativo", classificacao: "Normal", nota: "✅ Sem cetonas na urina." },
            { padrao: { resultado: "Positivo" }, status: "grave", termo: "Positivo", classificacao: "Cetonúria", nota: "⚠️ Cetonas na urina. Considerar cetoacidose diabética ou jejum prolongado." }
        ]
    },

    "Sangue Oculto na Urina": {
        tipo: "exame",
        sinonimos: ["sangue oculto urina", "hematúria"],
        campos: [{ id: "resultado", tipo: "select", label: "Sangue Oculto", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "normal", termo: "Negativo", classificacao: "Normal", nota: "✅ Sem sangue na urina." },
            { padrao: { resultado: "Positivo" }, status: "alto", termo: "Positivo", classificacao: "Hematúria", nota: "⚠️ Sangue na urina. Considerar litíase, infecção ou neoplasia." }
        ]
    },

    "Leucócitos Urinários": {
        tipo: "exame",
        sinonimos: ["leucocitos urinarios", "piuria"],
        campos: [{ id: "valor", tipo: "input", label: "Leucócitos Urinários", unidade: "/campo", min: 0, max: 100 }],
        referencia: { min: 0, max: 5, unidade: "/campo" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Normal", nota: "✅ Leucócitos urinários normais." },
            { faixa: [5.1, 20], status: "leve", termo: "Piúria leve", nota: "⚠️ Leucocitúria leve. Considerar infecção urinária." },
            { faixa: [20.1, 100], status: "alto", termo: "Piúria significativa", nota: "⚠️ Piúria significativa. Infecção urinária provável. Urocultura." }
        ]
    },

    "Nitrito Urinário": {
        tipo: "exame",
        sinonimos: ["nitrito urinario", "nitrito"],
        campos: [{ id: "resultado", tipo: "select", label: "Nitrito", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "normal", termo: "Negativo", classificacao: "Normal", nota: "✅ Nitrito negativo." },
            { padrao: { resultado: "Positivo" }, status: "alto", termo: "Positivo", classificacao: "Infecção", nota: "⚠️ Nitrito positivo. Sugere infecção urinária por Gram-negativos." }
        ]
    },

    "Urocultura (Colónias)": {
        tipo: "exame",
        sinonimos: ["urocultura", "cultura urina"],
        campos: [{ id: "valor", tipo: "input", label: "Colónias", unidade: "UFC/mL", min: 0, max: 1000000 }],
        referencia: { min: 0, max: 10000, unidade: "UFC/mL" },
        interpretacao: [
            { faixa: [0, 10000], status: "negativo", termo: "Negativo", nota: "✅ Urocultura negativa ou contaminação." },
            { faixa: [10001, 100000], status: "moderado", termo: "Positivo", nota: "⚠️ Urocultura positiva (≥10⁴ UFC/mL). Correlacionar com clínica." },
            { faixa: [100001, 1000000], status: "alto", termo: "Positivo", nota: "⚠️ Urocultura significativa (≥10⁵ UFC/mL). Tratar conforme antibiograma." }
        ]
    },

    "Cristais Urinários": {
        tipo: "exame",
        sinonimos: ["cristais urinarios", "cristaluria"],
        campos: [{ id: "resultado", tipo: "select", label: "Cristais", opcoes: [{ label: "Ausentes", valor: "Ausentes" }, { label: "Presentes", valor: "Presentes" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Ausentes" }, status: "normal", termo: "Ausentes", classificacao: "Normal", nota: "✅ Sem cristais na urina." },
            { padrao: { resultado: "Presentes" }, status: "alto", termo: "Presentes", classificacao: "Cristalúria", nota: "⚠️ Cristais presentes. Considerar litíase. Hidratação." }
        ]
    },

    "Proteinúria (Dipstick)": {
        tipo: "exame",
        sinonimos: ["proteinuria dipstick", "proteinas urina"],
        campos: [{ id: "resultado", tipo: "select", label: "Proteínas", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Traços", valor: "Traços" }, { label: "1+", valor: "1+" }, { label: "2+", valor: "2+" }, { label: "3+", valor: "3+" }, { label: "4+", valor: "4+" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "normal", termo: "Negativo", classificacao: "Normal", nota: "✅ Sem proteinúria." },
            { padrao: { resultado: "Traços" }, status: "leve", termo: "Traços", classificacao: "Proteinúria leve", nota: "Proteinúria leve. Repetir." },
            { padrao: { resultado: "1+" }, status: "moderado", termo: "1+", classificacao: "Proteinúria moderada", nota: "⚠️ Proteinúria moderada. Quantificar." },
            { padrao: { resultado: "2+" }, status: "alto", termo: "2+", classificacao: "Proteinúria significativa", nota: "⚠️ Proteinúria significativa. Investigar." },
            { padrao: { resultado: "3+" }, status: "grave", termo: "3+", classificacao: "Proteinúria grave", nota: "⚠️ Proteinúria grave. Considerar síndrome nefrótica." },
            { padrao: { resultado: "4+" }, status: "muito_grave", termo: "4+", classificacao: "Proteinúria muito grave", nota: "⚠️ Proteinúria muito grave. Nefrologia urgente." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 4 — A. ESCALAS NEUROLÓGICAS (15 itens)                             */
    /* ====================================================================== */

    "Escala de Glasgow": {
        tipo: "escala",
        sinonimos: ["glasgow", "gcs", "coma"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Dor)", peso: 2 }, { label: "3 (Comando verbal)", peso: 3 }, { label: "4 (Espontânea)", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Sons)", peso: 2 }, { label: "3 (Palavras)", peso: 3 }, { label: "4 (Confuso)", peso: 4 }, { label: "5 (Orientado)", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Extensão)", peso: 2 }, { label: "3 (Flexão)", peso: 3 }, { label: "4 (Retirada)", peso: 4 }, { label: "5 (Localiza)", peso: 5 }, { label: "6 (Obedece)", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve. Observação. Reavaliar a cada 4h." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "Lesão cerebral moderada. Internação/TC. Risco de deterioração." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO CEREBRAL GRAVE! UCI/Intubação. Proteger via aérea." }
        ]
    },

    "Escala de Coma de FOUR": {
        tipo: "escala",
        sinonimos: ["four", "escala four", "coma four"],
        campos: [
            { id: "ocular", tipo: "select", label: "Resposta Ocular", opcoes: [{ label: "0 (Nenhuma)", peso: 0 }, { label: "1 (Pálpebras fechadas)", peso: 1 }, { label: "2 (Abertura sem estímulo)", peso: 2 }, { label: "3 (Abertura com estímulo)", peso: 3 }, { label: "4 (Olhar dirigido)", peso: 4 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "0 (Nenhuma)", peso: 0 }, { label: "1 (Extensão)", peso: 1 }, { label: "2 (Flexão)", peso: 2 }, { label: "3 (Localiza)", peso: 3 }, { label: "4 (Obedece)", peso: 4 }] },
            { id: "tronco", tipo: "select", label: "Reflexos do Tronco", opcoes: [{ label: "0 (Ausentes)", peso: 0 }, { label: "1 (Pupilar e corneano)", peso: 1 }, { label: "2 (Pupilar)", peso: 2 }, { label: "3 (Corneano)", peso: 3 }, { label: "4 (Presentes)", peso: 4 }] },
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 (Apneia)", peso: 0 }, { label: "1 (Respiração irregular)", peso: 1 }, { label: "2 (Respiração regular)", peso: 2 }, { label: "3 (Respiração de Cheyne-Stokes)", peso: 3 }, { label: "4 (Respiração normal)", peso: 4 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 16, label: "Normal" },
        interpretacao: [
            { faixa: [13, 16], status: "bom", classificacao: "Normal", nota: "✅ Função neurológica preservada." },
            { faixa: [9, 12], status: "moderado", classificacao: "Compromisso moderado", nota: "⚠️ Compromisso neurológico moderado. Monitorizar." },
            { faixa: [5, 8], status: "grave", classificacao: "Compromisso grave", nota: "⚠️ Compromisso grave. UCI." },
            { faixa: [0, 4], status: "muito_grave", classificacao: "Muito grave", nota: "⚠️ MUITO GRAVE! Morte cerebral iminente. UCI urgente." }
        ]
    },

    "NIHSS (AVC)": {
        tipo: "escala",
        sinonimos: ["nihss", "avc", "stroke"],
        campos: [
            { id: "consciencia", tipo: "select", label: "Nível de consciência", opcoes: [{ label: "0 — Alerta", peso: 0 }, { label: "1 — Sonolento", peso: 1 }, { label: "2 — Estuporoso", peso: 2 }, { label: "3 — Coma", peso: 3 }] },
            { id: "ocular", tipo: "select", label: "Movimento ocular", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Parcial", peso: 1 }, { label: "2 — Desvio forçado", peso: 2 }] },
            { id: "visual", tipo: "select", label: "Campo visual", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Hemianopsia parcial", peso: 1 }, { label: "2 — Hemianopsia completa", peso: 2 }, { label: "3 — Cegueira bilateral", peso: 3 }] },
            { id: "facial", tipo: "select", label: "Paralisia facial", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Completa", peso: 3 }] },
            { id: "motora_braco", tipo: "select", label: "Motor braço", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Grave", peso: 3 }, { label: "4 — Completa", peso: 4 }] },
            { id: "motora_perna", tipo: "select", label: "Motor perna", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Grave", peso: 3 }, { label: "4 — Completa", peso: 4 }] },
            { id: "ataxia", tipo: "select", label: "Ataxia", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Presente 1 membro", peso: 1 }, { label: "2 — Presente 2 membros", peso: 2 }] },
            { id: "sensorial", tipo: "select", label: "Sensibilidade", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "linguagem", tipo: "select", label: "Linguagem", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }, { label: "3 — Mudo", peso: 3 }] },
            { id: "disartria", tipo: "select", label: "Disartria", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "extincao", tipo: "select", label: "Extinção/negligência", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 4, label: "Leve" },
        interpretacao: [
            { faixa: [0, 4], status: "leve", classificacao: "AVC leve", nota: "AVC leve. Considerar trombólise." },
            { faixa: [5, 15], status: "moderado", classificacao: "AVC moderado", nota: "⚠️ AVC moderado. Trombólise se janela." },
            { faixa: [16, 20], status: "grave", classificacao: "AVC grave", nota: "⚠️ AVC grave. Trombectomia/UTI." },
            { faixa: [21, 42], status: "muito_grave", classificacao: "AVC muito grave", nota: "⚠️ AVC muito grave. Cuidados intensivos." }
        ]
    },

    "Escala de Rankin Modificada": {
        tipo: "escala",
        sinonimos: ["rankin", "rankin modificada", "mrs"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "0 — Sem sintomas", peso: 0 }, { label: "1 — Sem incapacidade significativa", peso: 1 }, { label: "2 — Incapacidade leve", peso: 2 }, { label: "3 — Incapacidade moderada", peso: 3 }, { label: "4 — Incapacidade moderada-grave", peso: 4 }, { label: "5 — Incapacidade grave", peso: 5 }, { label: "6 — Morte", peso: 6 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Bom" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Bom", nota: "✅ Sem incapacidade significativa." },
            { faixa: [2, 2], status: "leve", classificacao: "Incapacidade leve", nota: "Incapacidade leve. Independente." },
            { faixa: [3, 3], status: "moderado", classificacao: "Incapacidade moderada", nota: "⚠️ Incapacidade moderada. Necessita ajuda." },
            { faixa: [4, 5], status: "grave", classificacao: "Incapacidade grave", nota: "⚠️ Incapacidade grave. Dependente." },
            { faixa: [6, 6], status: "muito_grave", classificacao: "Morte", nota: "⚠️ Óbito." }
        ]
    },

    "Escala de Cincinnati (AVC)": {
        tipo: "escala",
        sinonimos: ["cincinnati", "avc pre hospitalar"],
        campos: [
            { id: "facial", tipo: "select", label: "Assimetria facial", opcoes: [{ label: "Normal", peso: 0 }, { label: "Assimétrico", peso: 1 }] },
            { id: "braco", tipo: "select", label: "Queda do braço", opcoes: [{ label: "Normal", peso: 0 }, { label: "Queda", peso: 1 }] },
            { id: "fala", tipo: "select", label: "Fala alterada", opcoes: [{ label: "Normal", peso: 0 }, { label: "Alterada", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Normal", nota: "✅ Sem sinais de AVC." },
            { faixa: [1, 3], status: "grave", classificacao: "Suspeita de AVC", nota: "⚠️ Suspeita de AVC. Activar código AVC. TC urgente." }
        ]
    },

    "Escala de Hunt-Hess (HSA)": {
        tipo: "escala",
        sinonimos: ["hunt hess", "hemorragia subaracnoideia"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "I — Assintomático", peso: 1 }, { label: "II — Cefaleia moderada", peso: 2 }, { label: "III — Sonolência/confusão", peso: 3 }, { label: "IV — Estupor", peso: 4 }, { label: "V — Coma", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Bom" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Bom prognóstico", nota: "✅ Bom prognóstico cirúrgico." },
            { faixa: [3, 3], status: "moderado", classificacao: "Prognóstico reservado", nota: "⚠️ Prognóstico reservado." },
            { faixa: [4, 5], status: "grave", classificacao: "Mau prognóstico", nota: "⚠️ Mau prognóstico. Alta mortalidade." }
        ]
    },

    "Escala de Fisher (HSA)": {
        tipo: "escala",
        sinonimos: ["fisher", "hemorragia subaracnoideia fisher"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "1 — Sem sangue", peso: 1 }, { label: "2 — Lâmina <1mm", peso: 2 }, { label: "3 — Coágulo >1mm", peso: 3 }, { label: "4 — Hemorragia intraventricular", peso: 4 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Baixo risco" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Baixo risco de vasoespasmo", nota: "✅ Baixo risco de vasoespasmo." },
            { faixa: [3, 3], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado de vasoespasmo." },
            { faixa: [4, 4], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de vasoespasmo. Nimodipino." }
        ]
    },

    "Escala de Cincinnati Pré-Hospitalar": {
        tipo: "escala",
        sinonimos: ["cincinnati pre hospitalar", "avc pre hospitalar"],
        campos: [
            { id: "facial", tipo: "select", label: "Assimetria facial", opcoes: [{ label: "Normal", peso: 0 }, { label: "Assimétrico", peso: 1 }] },
            { id: "braco", tipo: "select", label: "Queda do braço", opcoes: [{ label: "Normal", peso: 0 }, { label: "Queda", peso: 1 }] },
            { id: "fala", tipo: "select", label: "Fala alterada", opcoes: [{ label: "Normal", peso: 0 }, { label: "Alterada", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Normal", nota: "✅ Sem sinais de AVC." },
            { faixa: [1, 3], status: "grave", classificacao: "Suspeita de AVC", nota: "⚠️ Suspeita de AVC. Activar código AVC." }
        ]
    },

    "Escala de Coma de Jouvet": {
        tipo: "escala",
        sinonimos: ["jouvet", "coma jouvet"],
        campos: [
            { id: "vigilancia", tipo: "select", label: "Vigilância", opcoes: [{ label: "0 — Coma profundo", peso: 0 }, { label: "1 — Coma", peso: 1 }, { label: "2 — Sonolência", peso: 2 }, { label: "3 — Vigil", peso: 3 }] },
            { id: "orientacao", tipo: "select", label: "Orientação", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Confuso", peso: 1 }, { label: "2 — Orientado", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 4, max: 5, label: "Normal" },
        interpretacao: [
            { faixa: [4, 5], status: "bom", classificacao: "Normal", nota: "✅ Vigil e orientado." },
            { faixa: [2, 3], status: "moderado", classificacao: "Compromisso moderado", nota: "⚠️ Compromisso moderado. Monitorizar." },
            { faixa: [0, 1], status: "grave", classificacao: "Coma", nota: "⚠️ Coma. UCI." }
        ]
    },

    "Escala de Ramsay (Sedação)": {
        tipo: "escala",
        sinonimos: ["ramsay", "sedacao"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "1 — Ansioso", peso: 1 }, { label: "2 — Cooperante", peso: 2 }, { label: "3 — Responde a comandos", peso: 3 }, { label: "4 — Resposta rápida", peso: 4 }, { label: "5 — Resposta lenta", peso: 5 }, { label: "6 — Sem resposta", peso: 6 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 2, max: 4, label: "Adequado" },
        interpretacao: [
            { faixa: [1, 1], status: "leve", classificacao: "Ansioso", nota: "Ansioso. Considerar sedação." },
            { faixa: [2, 4], status: "bom", classificacao: "Adequado", nota: "✅ Sedação adequada." },
            { faixa: [5, 6], status: "grave", classificacao: "Excessiva", nota: "⚠️ Sedação excessiva. Reduzir sedativo." }
        ]
    },

    "RASS (Richmond Agitation-Sedation Scale)": {
        tipo: "escala",
        sinonimos: ["rass", "agitacao sedacao"],
        campos: [{ id: "valor", tipo: "select", label: "Nível", opcoes: [{ label: "+4 — Combativo", peso: -4 }, { label: "+3 — Muito agitado", peso: -3 }, { label: "+2 — Agitado", peso: -2 }, { label: "+1 — Inquieto", peso: -1 }, { label: "0 — Alerta e calmo", peso: 0 }, { label: "-1 — Sonolento", peso: 1 }, { label: "-2 — Sedação leve", peso: 2 }, { label: "-3 — Sedação moderada", peso: 3 }, { label: "-4 — Sedação profunda", peso: 4 }, { label: "-5 — Não despertável", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Alerta" },
        interpretacao: [
            { faixa: [-4, -4], status: "grave", classificacao: "Combativo", nota: "⚠️ Combativo. Risco para o doente. Sedar." },
            { faixa: [-3, -1], status: "leve", classificacao: "Agitado", nota: "Agitado. Considerar contenção/sedação." },
            { faixa: [0, 0], status: "bom", classificacao: "Alerta e calmo", nota: "✅ Alerta e calmo." },
            { faixa: [1, 2], status: "leve", classificacao: "Sonolento", nota: "Sonolento. Aceitável em UCI." },
            { faixa: [3, 5], status: "grave", classificacao: "Sedação profunda", nota: "⚠️ Sedação profunda. Avaliar necessidade." }
        ]
    },

    "CAM-ICU (Delirium)": {
        tipo: "escala",
        sinonimos: ["cam icu", "delirium"],
        campos: [
            { id: "inicio", tipo: "select", label: "Início agudo/curso flutuante", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "atencao", tipo: "select", label: "Desatenção", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "consciencia", tipo: "select", label: "Alteração do nível de consciência", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pensamento", tipo: "select", label: "Pensamento desorganizado", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Negativo" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Negativo", nota: "✅ Sem delirium." },
            { faixa: [1, 4], status: "grave", classificacao: "Positivo", nota: "⚠️ Delirium positivo. Tratar causa e ambiente." }
        ]
    },

    "Escala de Norton (Úlcera de Pressão)": {
        tipo: "escala",
        sinonimos: ["norton", "ulcera pressao"],
        campos: [
            { id: "estado", tipo: "select", label: "Estado geral", opcoes: [{ label: "1 — Muito mau", peso: 1 }, { label: "2 — Mau", peso: 2 }, { label: "3 — Médio", peso: 3 }, { label: "4 — Bom", peso: 4 }] },
            { id: "mental", tipo: "select", label: "Estado mental", opcoes: [{ label: "1 — Confuso", peso: 1 }, { label: "2 — Apático", peso: 2 }, { label: "3 — Alerta", peso: 3 }, { label: "4 — Lúcido", peso: 4 }] },
            { id: "actividade", tipo: "select", label: "Actividade", opcoes: [{ label: "1 — Acamado", peso: 1 }, { label: "2 — Cadeira", peso: 2 }, { label: "3 — Anda com ajuda", peso: 3 }, { label: "4 — Anda sozinho", peso: 4 }] },
            { id: "mobilidade", tipo: "select", label: "Mobilidade", opcoes: [{ label: "1 — Imóvel", peso: 1 }, { label: "2 — Muito limitada", peso: 2 }, { label: "3 — Ligeiramente limitada", peso: 3 }, { label: "4 — Total", peso: 4 }] },
            { id: "incontinencia", tipo: "select", label: "Incontinência", opcoes: [{ label: "1 — Dupla", peso: 1 }, { label: "2 — Urinária", peso: 2 }, { label: "3 — Ocasional", peso: 3 }, { label: "4 — Continente", peso: 4 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 14, max: 20, label: "Baixo risco" },
        interpretacao: [
            { faixa: [5, 9], status: "muito_grave", classificacao: "Risco muito alto", nota: "⚠️ Risco muito alto de úlcera. Medidas intensivas." },
            { faixa: [10, 12], status: "grave", classificacao: "Risco alto", nota: "⚠️ Risco alto. Mudanças de posição frequentes." },
            { faixa: [13, 13], status: "moderado", classificacao: "Risco moderado", nota: "Risco moderado. Monitorizar pele." },
            { faixa: [14, 20], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Cuidados de rotina." }
        ]
    },

    "Escala de Morse (Quedas)": {
        tipo: "escala",
        sinonimos: ["morse", "quedas"],
        campos: [
            { id: "historico", tipo: "select", label: "Histórico de quedas", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 25 }] },
            { id: "secundario", tipo: "select", label: "Diagnóstico secundário", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 15 }] },
            { id: "ajuda", tipo: "select", label: "Ajuda para andar", opcoes: [{ label: "Nenhuma/repouso", peso: 0 }, { label: "Bengala/muleta", peso: 15 }, { label: "Apoio móvel", peso: 30 }] },
            { id: "via", tipo: "select", label: "Via intravenosa", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 20 }] },
            { id: "marcha", tipo: "select", label: "Marcha", opcoes: [{ label: "Normal", peso: 0 }, { label: "Fraca", peso: 10 }, { label: "Alterada", peso: 20 }] },
            { id: "mental", tipo: "select", label: "Estado mental", opcoes: [{ label: "Orientado", peso: 0 }, { label: "Confuso", peso: 15 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 24, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 24], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de queda." },
            { faixa: [25, 44], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado de queda. Medidas preventivas." },
            { faixa: [45, 125], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de queda. Medidas intensivas." }
        ]
    },

    "Escala de Braden (Úlcera de Pressão)": {
        tipo: "escala",
        sinonimos: ["braden", "ulcera pressao braden"],
        campos: [
            { id: "percepcao", tipo: "select", label: "Percepção sensorial", opcoes: [{ label: "1 — Completamente limitado", peso: 1 }, { label: "2 — Muito limitado", peso: 2 }, { label: "3 — Ligeiramente limitado", peso: 3 }, { label: "4 — Nenhuma limitação", peso: 4 }] },
            { id: "humidade", tipo: "select", label: "Humidade", opcoes: [{ label: "1 — Constantemente húmido", peso: 1 }, { label: "2 — Muito húmido", peso: 2 }, { label: "3 — Ocasionalmente húmido", peso: 3 }, { label: "4 — Raramente húmido", peso: 4 }] },
            { id: "actividade", tipo: "select", label: "Actividade", opcoes: [{ label: "1 — Acamado", peso: 1 }, { label: "2 — Cadeira", peso: 2 }, { label: "3 — Anda ocasionalmente", peso: 3 }, { label: "4 — Anda frequentemente", peso: 4 }] },
            { id: "mobilidade", tipo: "select", label: "Mobilidade", opcoes: [{ label: "1 — Completamente imóvel", peso: 1 }, { label: "2 — Muito limitada", peso: 2 }, { label: "3 — Ligeiramente limitada", peso: 3 }, { label: "4 — Sem limitações", peso: 4 }] },
            { id: "nutricao", tipo: "select", label: "Nutrição", opcoes: [{ label: "1 — Muito pobre", peso: 1 }, { label: "2 — Provavelmente inadequada", peso: 2 }, { label: "3 — Adequada", peso: 3 }, { label: "4 — Excelente", peso: 4 }] },
            { id: "friccao", tipo: "select", label: "Fricção e cisalhamento", opcoes: [{ label: "1 — Problema", peso: 1 }, { label: "2 — Problema potencial", peso: 2 }, { label: "3 — Nenhum problema", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 19, max: 23, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 9], status: "muito_grave", classificacao: "Risco muito alto", nota: "⚠️ Risco muito alto de úlcera. Medidas intensivas." },
            { faixa: [10, 12], status: "grave", classificacao: "Risco alto", nota: "⚠️ Risco alto. Mudanças de posição frequentes." },
            { faixa: [13, 14], status: "moderado", classificacao: "Risco moderado", nota: "Risco moderado. Monitorizar pele." },
            { faixa: [15, 18], status: "leve", classificacao: "Risco leve", nota: "Risco leve. Cuidados de rotina." },
            { faixa: [19, 23], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Manter cuidados." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 4 — B. ESCALAS CARDIOLÓGICAS E RESPIRATÓRIAS (15 itens)            */
    /* ====================================================================== */

    "Escala de Wells (TVP)": {
        tipo: "escala",
        sinonimos: ["wells tvp", "trombose venosa profunda"],
        campos: [
            { id: "cancer", tipo: "select", label: "Cancro activo", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "paralisia", tipo: "select", label: "Paralisia/paresia", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "repouso", tipo: "select", label: "Repouso >3 dias", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "dor", tipo: "select", label: "Dor localizada", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "edema", tipo: "select", label: "Edema global", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "panturrilha", tipo: "select", label: "Panturrilha >3cm", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "edema_depressao", tipo: "select", label: "Edema com depressão", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "circulacao", tipo: "select", label: "Circulação colateral", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "tvp_previa", tipo: "select", label: "TVP prévia", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "diagnostico", tipo: "select", label: "Diagnóstico alternativo", opcoes: [{ label: "Sim (-2)", peso: -2 }, { label: "Não", peso: 0 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: -2, max: 0, label: "Baixa probabilidade" },
        interpretacao: [
            { faixa: [-2, 0], status: "bom", classificacao: "Baixa probabilidade", nota: "✅ Baixa probabilidade de TVP. D-dímero." },
            { faixa: [1, 2], status: "moderado", classificacao: "Probabilidade moderada", nota: "⚠️ Probabilidade moderada. D-dímero/eco." },
            { faixa: [3, 10], status: "grave", classificacao: "Alta probabilidade", nota: "⚠️ Alta probabilidade. Eco-Doppler urgente." }
        ]
    },

    "Escala de Wells (TEP)": {
        tipo: "escala",
        sinonimos: ["wells tep", "tromboembolismo pulmonar"],
        campos: [
            { id: "tvp", tipo: "select", label: "Sinais de TVP", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 3 }] },
            { id: "alternativo", tipo: "select", label: "Diagnóstico alternativo", opcoes: [{ label: "Sim", peso: 0 }, { label: "Não", peso: 3 }] },
            { id: "fc", tipo: "select", label: "FC >100 bpm", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1.5 }] },
            { id: "imobilizacao", tipo: "select", label: "Imobilização/cirurgia recente", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1.5 }] },
            { id: "tep_previo", tipo: "select", label: "TEP/TVP prévio", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1.5 }] },
            { id: "hemoptise", tipo: "select", label: "Hemoptise", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "cancer", tipo: "select", label: "Cancro activo", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixa probabilidade" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixa probabilidade", nota: "✅ Baixa probabilidade de TEP." },
            { faixa: [2, 6], status: "moderado", classificacao: "Probabilidade moderada", nota: "⚠️ Probabilidade moderada. D-dímero/Angio-TC." },
            { faixa: [6.5, 12.5], status: "grave", classificacao: "Alta probabilidade", nota: "⚠️ Alta probabilidade. Angio-TC urgente." }
        ]
    },

    "Escala de Geneva (TEP)": {
        tipo: "escala",
        sinonimos: ["geneva", "tep geneva"],
        campos: [
            { id: "idade", tipo: "select", label: "Idade >65", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "tvp_previo", tipo: "select", label: "TVP/TEP prévio", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 3 }] },
            { id: "cirurgia", tipo: "select", label: "Cirurgia recente", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] },
            { id: "fc", tipo: "select", label: "FC 75-94", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 3 }] },
            { id: "fc2", tipo: "select", label: "FC ≥95", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 5 }] },
            { id: "dor", tipo: "select", label: "Dor membro inferior", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 4 }] },
            { id: "hemoptise", tipo: "select", label: "Hemoptise", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] },
            { id: "cancer", tipo: "select", label: "Cancro activo", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Baixa probabilidade" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Baixa probabilidade", nota: "✅ Baixa probabilidade de TEP." },
            { faixa: [4, 10], status: "moderado", classificacao: "Probabilidade moderada", nota: "⚠️ Probabilidade moderada." },
            { faixa: [11, 22], status: "grave", classificacao: "Alta probabilidade", nota: "⚠️ Alta probabilidade. Angio-TC urgente." }
        ]
    },

    "CHADS-VASc (Fibrilhação Auricular)": {
        tipo: "escala",
        sinonimos: ["chads vasc", "fibrilhacao auricular", "fa"],
        campos: [
            { id: "icc", tipo: "select", label: "Insuficiência cardíaca", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "hta", tipo: "select", label: "Hipertensão", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "idade", tipo: "select", label: "Idade ≥75", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] },
            { id: "dm", tipo: "select", label: "Diabetes", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "avc", tipo: "select", label: "AVC/AIT prévio", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] },
            { id: "vascular", tipo: "select", label: "Doença vascular", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "idade2", tipo: "select", label: "Idade 65-74", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "sexo", tipo: "select", label: "Sexo feminino", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco tromboembólico. Sem anticoagulação." },
            { faixa: [2, 3], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Considerar anticoagulação." },
            { faixa: [4, 9], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco elevado. Anticoagulação recomendada." }
        ]
    },

    "HAS-BLED (Hemorragia)": {
        tipo: "escala",
        sinonimos: ["has bled", "hemorragia", "sangramento"],
        campos: [
            { id: "hta", tipo: "select", label: "Hipertensão", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "renal", tipo: "select", label: "Função renal alterada", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "hepatica", tipo: "select", label: "Função hepática alterada", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "avc", tipo: "select", label: "AVC prévio", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "hemorragia", tipo: "select", label: "Hemorragia prévia", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "inr", tipo: "select", label: "INR lábil", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "idoso", tipo: "select", label: "Idade >65", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "farmacos", tipo: "select", label: "Fármacos antiplaquetários", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "alcool", tipo: "select", label: "Álcool", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco hemorrágico." },
            { faixa: [3, 9], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco hemorrágico. Monitorizar." }
        ]
    },

    "GRACE (Síndrome Coronária Aguda)": {
        tipo: "escala",
        sinonimos: ["grace", "sca", "sindrome coronaria aguda"],
        campos: [
            { id: "idade", tipo: "select", label: "Idade", opcoes: [{ label: "<40", peso: 0 }, { label: "40-49", peso: 18 }, { label: "50-59", peso: 36 }, { label: "60-69", peso: 55 }, { label: "70-79", peso: 73 }, { label: "≥80", peso: 91 }] },
            { id: "fc", tipo: "select", label: "FC", opcoes: [{ label: "<70", peso: 0 }, { label: "70-89", peso: 3 }, { label: "90-109", peso: 9 }, { label: "110-149", peso: 15 }, { label: "≥150", peso: 24 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: "<80", peso: 24 }, { label: "80-99", peso: 22 }, { label: "100-119", peso: 18 }, { label: "120-139", peso: 14 }, { label: "140-159", peso: 10 }, { label: "≥160", peso: 0 }] },
            { id: "creatinina", tipo: "select", label: "Creatinina", opcoes: [{ label: "<0.4", peso: 1 }, { label: "0.4-0.79", peso: 3 }, { label: "0.8-1.19", peso: 5 }, { label: "1.2-1.59", peso: 7 }, { label: "1.6-1.99", peso: 9 }, { label: "2.0-3.99", peso: 15 }, { label: "≥4", peso: 20 }] },
            { id: "killip", tipo: "select", label: "Classe Killip", opcoes: [{ label: "I", peso: 0 }, { label: "II", peso: 21 }, { label: "III", peso: 43 }, { label: "IV", peso: 64 }] },
            { id: "paragem", tipo: "select", label: "Paragem cardíaca na admissão", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 43 }] },
            { id: "st", tipo: "select", label: "Desvio ST", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 30 }] },
            { id: "marcadores", tipo: "select", label: "Marcadores elevados", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 15 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 108, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 108], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Estratégia conservadora." },
            { faixa: [109, 140], status: "moderado", classificacao: "Risco intermédio", nota: "⚠️ Risco intermédio. Considerar invasiva." },
            { faixa: [141, 372], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Estratégia invasiva precoce." }
        ]
    },

    "TIMI (Síndrome Coronária Aguda)": {
        tipo: "escala",
        sinonimos: ["timi", "sca timi"],
        campos: [
            { id: "idade", tipo: "select", label: "Idade ≥65", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "fatores", tipo: "select", label: "≥3 fatores de risco", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "coronaria", tipo: "select", label: "Doença coronária conhecida", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "asa", tipo: "select", label: "Uso de AAS nos últimos 7 dias", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "angina", tipo: "select", label: "Angina grave recente", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "st", tipo: "select", label: "Desvio ST ≥0.5mm", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "marcadores", tipo: "select", label: "Marcadores elevados", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco (0-2)." },
            { faixa: [3, 4], status: "moderado", classificacao: "Risco intermédio", nota: "⚠️ Risco intermédio (3-4)." },
            { faixa: [5, 7], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco (5-7). Invasiva precoce." }
        ]
    },

    "Killip (Insuficiência Cardíaca)": {
        tipo: "escala",
        sinonimos: ["killip", "insuficiencia cardiaca"],
        campos: [{ id: "valor", tipo: "select", label: "Classe", opcoes: [{ label: "I — Sem IC", peso: 1 }, { label: "II — Estertores", peso: 2 }, { label: "III — Edema agudo", peso: 3 }, { label: "IV — Choque cardiogénico", peso: 4 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 1, label: "Bom" },
        interpretacao: [
            { faixa: [1, 1], status: "bom", classificacao: "Sem IC", nota: "✅ Sem insuficiência cardíaca. Bom prognóstico." },
            { faixa: [2, 2], status: "moderado", classificacao: "IC leve", nota: "⚠️ IC leve. Monitorizar." },
            { faixa: [3, 3], status: "grave", classificacao: "Edema agudo", nota: "⚠️ Edema agudo do pulmão. UCI." },
            { faixa: [4, 4], status: "muito_grave", classificacao: "Choque cardiogénico", nota: "⚠️ Choque cardiogénico. UCI urgente." }
        ]
    },

    "CURB-65 (Pneumonia)": {
        tipo: "escala",
        sinonimos: ["curb 65", "pneumonia"],
        campos: [
            { id: "confusao", tipo: "select", label: "Confusão", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "ureia", tipo: "select", label: "Ureia >42 mg/dL", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "fr", tipo: "select", label: "FR ≥30 ipm", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pa", tipo: "select", label: "PA baixa", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "idade", tipo: "select", label: "Idade ≥65", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Tratamento ambulatorial." },
            { faixa: [2, 2], status: "moderado", classificacao: "Risco intermédio", nota: "⚠️ Risco intermédio. Considerar internamento." },
            { faixa: [3, 5], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Internamento/UTI." }
        ]
    },

    "PSI/PORT (Pneumonia)": {
        tipo: "escala",
        sinonimos: ["psi", "port", "pneumonia severity index"],
        campos: [
            { id: "idade", tipo: "input", label: "Idade", unidade: "anos", min: 18, max: 120 },
            { id: "fc", tipo: "select", label: "FC ≥125", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 10 }] },
            { id: "fr", tipo: "select", label: "FR ≥30", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 20 }] },
            { id: "pas", tipo: "select", label: "PAS <90", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 20 }] },
            { id: "temp", tipo: "select", label: "Temp <35 ou ≥40", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 15 }] },
            { id: "mental", tipo: "select", label: "Alteração mental", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 20 }] }
        ],
        calculo: { formula: "idade + fc + fr + pas + temp + mental", mostrarFormula: "Idade + pontos clínicos" },
        referencia: { min: 0, max: 70, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 70], status: "bom", classificacao: "Classe I-II", nota: "✅ Baixo risco. Ambulatorial." },
            { faixa: [71, 90], status: "moderado", classificacao: "Classe III", nota: "⚠️ Risco moderado. Observação/internamento curto." },
            { faixa: [91, 130], status: "grave", classificacao: "Classe IV", nota: "⚠️ Risco alto. Internamento." },
            { faixa: [131, 300], status: "muito_grave", classificacao: "Classe V", nota: "⚠️ Risco muito alto. UCI." }
        ]
    },

    "GOLD (DPOC)": {
        tipo: "escala",
        sinonimos: ["gold", "dpoc"],
        campos: [
            { id: "fev1", tipo: "select", label: "FEV1 (% previsto)", opcoes: [{ label: "≥80% (GOLD 1)", peso: 1 }, { label: "50-79% (GOLD 2)", peso: 2 }, { label: "30-49% (GOLD 3)", peso: 3 }, { label: "<30% (GOLD 4)", peso: 4 }] },
            { id: "exacerbacoes", tipo: "select", label: "Exacerbações/ano", opcoes: [{ label: "0-1", peso: 0 }, { label: "≥2 ou 1 internamento", peso: 1 }] },
            { id: "sintomas", tipo: "select", label: "Sintomas (mMRC/CAT)", opcoes: [{ label: "Baixos", peso: 0 }, { label: "Altos", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Baixo risco" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Grupo A/B", nota: "✅ Baixo risco. Broncodilatador." },
            { faixa: [3, 4], status: "moderado", classificacao: "Grupo C", nota: "⚠️ Risco moderado. Broncodilatador + corticóide inalado." },
            { faixa: [5, 6], status: "grave", classificacao: "Grupo D", nota: "⚠️ Alto risco. Terapia tripla + reabilitação." }
        ]
    },

    "Escala de Borg (Dispneia)": {
        tipo: "escala",
        sinonimos: ["borg", "dispneia"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "0 — Nenhuma", peso: 0 }, { label: "1 — Muito leve", peso: 1 }, { label: "2 — Leve", peso: 2 }, { label: "3 — Moderada", peso: 3 }, { label: "4 — Algo intensa", peso: 4 }, { label: "5 — Intensa", peso: 5 }, { label: "7 — Muito intensa", peso: 7 }, { label: "9 — Muito muito intensa", peso: 9 }, { label: "10 — Máxima", peso: 10 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "leve", classificacao: "Leve", nota: "Dispneia leve." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dispneia moderada. Avaliar oxigénio." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Dispneia grave. Suporte ventilatório." }
        ]
    },

    "Escala de Wood-Downes (Asma)": {
        tipo: "escala",
        sinonimos: ["wood downes", "asma", "crise asmatica"],
        campos: [
            { id: "sibilos", tipo: "select", label: "Sibilos", opcoes: [{ label: "0 — Ausentes", peso: 0 }, { label: "1 — Expiratórios", peso: 1 }, { label: "2 — Inspiratórios", peso: 2 }, { label: "3 — Silencioso", peso: 3 }] },
            { id: "retracao", tipo: "select", label: "Retracção", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Subcostal", peso: 1 }, { label: "2 — Intercostal", peso: 2 }, { label: "3 — Global", peso: 3 }] },
            { id: "entrada", tipo: "select", label: "Entrada de ar", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Diminuída", peso: 1 }, { label: "2 — Muito diminuída", peso: 2 }, { label: "3 — Ausente", peso: 3 }] },
            { id: "consciencia", tipo: "select", label: "Consciência", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Agitado", peso: 1 }, { label: "2 — Sonolento", peso: 2 }, { label: "3 — Coma", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "leve", classificacao: "Crise leve", nota: "Crise leve. Beta-2 agonista." },
            { faixa: [4, 7], status: "moderado", classificacao: "Crise moderada", nota: "⚠️ Crise moderada. Corticóide + oxigénio." },
            { faixa: [8, 12], status: "grave", classificacao: "Crise grave", nota: "⚠️ Crise grave. UCI. Considerar intubação." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 4 — C. ESCALAS DE SEPSE, TRAUMA E UTI (20 itens)                   */
    /* ====================================================================== */

    "qSOFA (Sepse)": {
        tipo: "escala",
        sinonimos: ["qsofa", "sepse", "quick sofa"],
        campos: [
            { id: "fr", tipo: "select", label: "FR ≥22 ipm", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "mental", tipo: "select", label: "Alteração mental", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pas", tipo: "select", label: "PAS ≤100 mmHg", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de sepse." },
            { faixa: [2, 3], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de sepse. Avaliar SOFA, lactato e antibiótico precoce." }
        ]
    },

    "SOFA (Sepse)": {
        tipo: "escala",
        sinonimos: ["sofa", "sepse sofa"],
        campos: [
            { id: "resp", tipo: "select", label: "Respiração (PaO2/FiO2)", opcoes: [{ label: "≥400 (0)", peso: 0 }, { label: "<400 (1)", peso: 1 }, { label: "<300 (2)", peso: 2 }, { label: "<200 c/ VM (3)", peso: 3 }, { label: "<100 c/ VM (4)", peso: 4 }] },
            { id: "coag", tipo: "select", label: "Coagulação (Plaquetas)", opcoes: [{ label: "≥150 (0)", peso: 0 }, { label: "<150 (1)", peso: 1 }, { label: "<100 (2)", peso: 2 }, { label: "<50 (3)", peso: 3 }, { label: "<20 (4)", peso: 4 }] },
            { id: "figado", tipo: "select", label: "Fígado (Bilirrubina)", opcoes: [{ label: "<1.2 (0)", peso: 0 }, { label: "1.2-1.9 (1)", peso: 1 }, { label: "2.0-5.9 (2)", peso: 2 }, { label: "6.0-11.9 (3)", peso: 3 }, { label: ">12 (4)", peso: 4 }] },
            { id: "cardio", tipo: "select", label: "Cardiovascular", opcoes: [{ label: "PAM ≥70 (0)", peso: 0 }, { label: "PAM <70 (1)", peso: 1 }, { label: "Dopamina ≤5 (2)", peso: 2 }, { label: "Dopamina >5 (3)", peso: 3 }, { label: "Dopamina >15 (4)", peso: 4 }] },
            { id: "snc", tipo: "select", label: "SNC (Glasgow)", opcoes: [{ label: "15 (0)", peso: 0 }, { label: "13-14 (1)", peso: 1 }, { label: "10-12 (2)", peso: 2 }, { label: "6-9 (3)", peso: 3 }, { label: "<6 (4)", peso: 4 }] },
            { id: "renal", tipo: "select", label: "Renal (Creatinina)", opcoes: [{ label: "<1.2 (0)", peso: 0 }, { label: "1.2-1.9 (1)", peso: 1 }, { label: "2.0-3.4 (2)", peso: 2 }, { label: "3.5-4.9 (3)", peso: 3 }, { label: ">5 (4)", peso: 4 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de mortalidade." },
            { faixa: [2, 5], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Monitorizar." },
            { faixa: [6, 9], status: "alto", classificacao: "Risco elevado", nota: "⚠️ Risco elevado de mortalidade. UCI." },
            { faixa: [10, 24], status: "grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. UCI urgente." }
        ]
    },

    "APACHE II": {
        tipo: "escala",
        sinonimos: ["apache ii", "apache 2"],
        campos: [
            { id: "idade", tipo: "select", label: "Idade", opcoes: [{ label: "<45", peso: 0 }, { label: "45-54", peso: 2 }, { label: "55-64", peso: 3 }, { label: "65-74", peso: 5 }, { label: "≥75", peso: 6 }] },
            { id: "temperatura", tipo: "select", label: "Temperatura", opcoes: [{ label: "36-38.4", peso: 0 }, { label: "34-35.9", peso: 1 }, { label: "32-33.9", peso: 2 }, { label: "30-31.9", peso: 3 }, { label: "≤29.9", peso: 4 }] },
            { id: "pam", tipo: "select", label: "PAM", opcoes: [{ label: "70-109", peso: 0 }, { label: "50-69", peso: 2 }, { label: "130-159", peso: 2 }, { label: "≤49", peso: 4 }, { label: "≥160", peso: 4 }] },
            { id: "fc", tipo: "select", label: "FC", opcoes: [{ label: "70-109", peso: 0 }, { label: "55-69", peso: 2 }, { label: "110-139", peso: 2 }, { label: "≤54", peso: 4 }, { label: "≥140", peso: 4 }] },
            { id: "fr", tipo: "select", label: "FR", opcoes: [{ label: "12-24", peso: 0 }, { label: "10-11", peso: 1 }, { label: "25-34", peso: 1 }, { label: "≤9", peso: 4 }, { label: "≥35", peso: 4 }] },
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "15", peso: 0 }, { label: "13-14", peso: 1 }, { label: "10-12", peso: 2 }, { label: "7-9", peso: 3 }, { label: "4-6", peso: 4 }, { label: "3", peso: 5 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 9, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 9], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Mortalidade <10%." },
            { faixa: [10, 19], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Mortalidade 15-25%." },
            { faixa: [20, 29], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco elevado. Mortalidade 40-55%." },
            { faixa: [30, 71], status: "muito_grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. Mortalidade >70%." }
        ]
    },

    "SAPS II": {
        tipo: "escala",
        sinonimos: ["saps ii", "saps 2"],
        campos: [
            { id: "idade", tipo: "input", label: "Idade", unidade: "anos", min: 18, max: 120 },
            { id: "fc", tipo: "select", label: "FC", opcoes: [{ label: "<40", peso: 11 }, { label: "40-69", peso: 2 }, { label: "70-119", peso: 0 }, { label: "120-159", peso: 4 }, { label: "≥160", peso: 7 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: "<70", peso: 13 }, { label: "70-99", peso: 5 }, { label: "100-199", peso: 0 }, { label: "≥200", peso: 8 }] },
            { id: "temp", tipo: "select", label: "Temperatura", opcoes: [{ label: "<35", peso: 3 }, { label: "≥35", peso: 0 }] },
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "14-15", peso: 0 }, { label: "11-13", peso: 5 }, { label: "9-10", peso: 7 }, { label: "6-8", peso: 13 }, { label: "3-5", peso: 26 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 29, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 29], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Mortalidade <10%." },
            { faixa: [30, 49], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Mortalidade 20-30%." },
            { faixa: [50, 79], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco elevado. Mortalidade 50-70%." },
            { faixa: [80, 163], status: "muito_grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. Mortalidade >80%." }
        ]
    },

    "Escala de Coma de Glasgow Pediátrica": {
        tipo: "escala",
        sinonimos: ["glasgow pediatrico", "gcs pediatrico"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Dor)", peso: 2 }, { label: "3 (Voz)", peso: 3 }, { label: "4 (Espontânea)", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Gemidos)", peso: 2 }, { label: "3 (Choro inconsolável)", peso: 3 }, { label: "4 (Choro consolável)", peso: 4 }, { label: "5 (Palavras/Sorriso)", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Extensão)", peso: 2 }, { label: "3 (Flexão)", peso: 3 }, { label: "4 (Retirada)", peso: 4 }, { label: "5 (Localiza)", peso: 5 }, { label: "6 (Obedece)", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão cerebral moderada. Internação." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO CEREBRAL GRAVE! UCI." }
        ]
    },

    "Escala de Trauma de Kampala": {
        tipo: "escala",
        sinonimos: ["kampala", "trauma score"],
        campos: [
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "15", peso: 5 }, { label: "13-14", peso: 4 }, { label: "9-12", peso: 3 }, { label: "5-8", peso: 2 }, { label: "3-4", peso: 1 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: ">90", peso: 5 }, { label: "70-90", peso: 4 }, { label: "50-69", peso: 3 }, { label: "1-49", peso: 2 }, { label: "0", peso: 1 }] },
            { id: "fr", tipo: "select", label: "FR", opcoes: [{ label: "12-20", peso: 5 }, { label: "10-11 ou 21-29", peso: 4 }, { label: "6-9", peso: 3 }, { label: "1-5 ou >30", peso: 2 }, { label: "0", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 12, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [12, 15], status: "leve", classificacao: "Trauma leve", nota: "Trauma leve. Observação." },
            { faixa: [8, 11], status: "moderado", classificacao: "Trauma moderado", nota: "⚠️ Trauma moderado. Internamento." },
            { faixa: [3, 7], status: "grave", classificacao: "Trauma grave", nota: "⚠️ Trauma grave. UCI/centro de trauma." }
        ]
    },

    "ISS (Injury Severity Score)": {
        tipo: "escala",
        sinonimos: ["iss", "injury severity score"],
        campos: [
            { id: "cabeca", tipo: "select", label: "Cabeça/pescoço", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }, { label: "4 — Crítica", peso: 16 }, { label: "5 — Incompatível", peso: 25 }] },
            { id: "face", tipo: "select", label: "Face", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }] },
            { id: "torax", tipo: "select", label: "Tórax", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }, { label: "4 — Crítica", peso: 16 }, { label: "5 — Incompatível", peso: 25 }] },
            { id: "abdomen", tipo: "select", label: "Abdómen", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }, { label: "4 — Crítica", peso: 16 }, { label: "5 — Incompatível", peso: 25 }] },
            { id: "extremidades", tipo: "select", label: "Extremidades", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }] },
            { id: "externo", tipo: "select", label: "Externo", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 8, label: "Leve" },
        interpretacao: [
            { faixa: [0, 8], status: "leve", classificacao: "Leve", nota: "Trauma leve. Alta provável." },
            { faixa: [9, 15], status: "moderado", classificacao: "Moderado", nota: "⚠️ Trauma moderado. Internamento." },
            { faixa: [16, 24], status: "grave", classificacao: "Grave", nota: "⚠️ Trauma grave. UCI." },
            { faixa: [25, 75], status: "muito_grave", classificacao: "Muito grave", nota: "⚠️ Trauma muito grave. UCI urgente." }
        ]
    },

    "RTS (Revised Trauma Score)": {
        tipo: "escala",
        sinonimos: ["rts", "revised trauma score"],
        campos: [
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "13-15", peso: 4 }, { label: "9-12", peso: 3 }, { label: "6-8", peso: 2 }, { label: "4-5", peso: 1 }, { label: "3", peso: 0 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: ">89", peso: 4 }, { label: "76-89", peso: 3 }, { label: "50-75", peso: 2 }, { label: "1-49", peso: 1 }, { label: "0", peso: 0 }] },
            { id: "fr", tipo: "select", label: "FR", opcoes: [{ label: "10-29", peso: 4 }, { label: ">29", peso: 3 }, { label: "6-9", peso: 2 }, { label: "1-5", peso: 1 }, { label: "0", peso: 0 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 11, max: 12, label: "Leve" },
        interpretacao: [
            { faixa: [11, 12], status: "leve", classificacao: "Trauma leve", nota: "Trauma leve." },
            { faixa: [8, 10], status: "moderado", classificacao: "Trauma moderado", nota: "⚠️ Trauma moderado. Internamento." },
            { faixa: [0, 7], status: "grave", classificacao: "Trauma grave", nota: "⚠️ Trauma grave. UCI." }
        ]
    },

    "GCS-P (Glasgow + Pupilas)": {
        tipo: "escala",
        sinonimos: ["gcs p", "glasgow pupilas"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] },
            { id: "pupilas", tipo: "select", label: "Reactividade Pupilar", opcoes: [{ label: "2 — Ambas reactivas", peso: 0 }, { label: "1 — Uma reactiva", peso: -1 }, { label: "0 — Nenhuma reactiva", peso: -2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada. TC urgente." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI/Intubação." }
        ]
    },

    "Escala de Coma de Adelaide": {
        tipo: "escala",
        sinonimos: ["adelaide", "coma adelaide"],
        campos: [
            { id: "ocular", tipo: "select", label: "Ocular", opcoes: [{ label: "1 — Nenhuma", peso: 1 }, { label: "2 — À dor", peso: 2 }, { label: "3 — À voz", peso: 3 }, { label: "4 — Espontânea", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Verbal", opcoes: [{ label: "1 — Nenhuma", peso: 1 }, { label: "2 — Sons", peso: 2 }, { label: "3 — Palavras", peso: 3 }, { label: "4 — Confuso", peso: 4 }, { label: "5 — Orientado", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Motora", opcoes: [{ label: "1 — Nenhuma", peso: 1 }, { label: "2 — Extensão", peso: 2 }, { label: "3 — Flexão", peso: 3 }, { label: "4 — Retirada", peso: 4 }, { label: "5 — Localiza", peso: 5 }, { label: "6 — Obedece", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI." }
        ]
    },

    "Escala de Liverpool (Trauma Craniano)": {
        tipo: "escala",
        sinonimos: ["liverpool", "trauma craniano"],
        campos: [
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "15", peso: 0 }, { label: "13-14", peso: 1 }, { label: "9-12", peso: 2 }, { label: "≤8", peso: 3 }] },
            { id: "focal", tipo: "select", label: "Défice focal", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "tc", tipo: "select", label: "Alterações na TC", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Observação." },
            { faixa: [2, 3], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Internamento." },
            { faixa: [4, 5], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Neurocirurgia." }
        ]
    },

    "Escala de Fisher Modificada": {
        tipo: "escala",
        sinonimos: ["fisher modificada", "hsa fisher"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "0 — Sem HSA", peso: 0 }, { label: "1 — HSA fina", peso: 1 }, { label: "2 — HSA <1mm", peso: 2 }, { label: "3 — HSA >1mm", peso: 3 }, { label: "4 — HSA + IV", peso: 4 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de vasoespasmo." },
            { faixa: [2, 3], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado." },
            { faixa: [4, 4], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de vasoespasmo. Nimodipino." }
        ]
    },

    "Escala de WFNS (HSA)": {
        tipo: "escala",
        sinonimos: ["wfns", "hsa wfns"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "I — GCS 15 sem défice", peso: 1 }, { label: "II — GCS 13-14 sem défice", peso: 2 }, { label: "III — GCS 13-14 com défice", peso: 3 }, { label: "IV — GCS 7-12", peso: 4 }, { label: "V — GCS 3-6", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Bom" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Bom prognóstico", nota: "✅ Bom prognóstico." },
            { faixa: [3, 3], status: "moderado", classificacao: "Prognóstico reservado", nota: "⚠️ Prognóstico reservado." },
            { faixa: [4, 5], status: "grave", classificacao: "Mau prognóstico", nota: "⚠️ Mau prognóstico. UCI." }
        ]
    },

    "Escala de Maddox (HSA)": {
        tipo: "escala",
        sinonimos: ["maddox", "hsa maddox"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "0 — Sem HSA", peso: 0 }, { label: "1 — HSA leve", peso: 1 }, { label: "2 — HSA moderada", peso: 2 }, { label: "3 — HSA grave", peso: 3 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco." },
            { faixa: [2, 2], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado." },
            { faixa: [3, 3], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. UCI." }
        ]
    },

    "Escala de Clavien-Dindo (Complicações Cirúrgicas)": {
        tipo: "escala",
        sinonimos: ["clavien dindo", "complicacoes cirurgicas"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "I — Sem tratamento", peso: 1 }, { label: "II — Fármacos", peso: 2 }, { label: "IIIa — Intervenção sem anestesia", peso: 3 }, { label: "IIIb — Intervenção com anestesia", peso: 4 }, { label: "IVa — UCI 1 órgão", peso: 5 }, { label: "IVb — UCI multi-órgão", peso: 6 }, { label: "V — Morte", peso: 7 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Leve" },
        interpretacao: [
            { faixa: [1, 2], status: "leve", classificacao: "Leve", nota: "Complicação leve. Sem intervenção." },
            { faixa: [3, 4], status: "moderado", classificacao: "Moderada", nota: "⚠️ Complicação moderada. Intervenção necessária." },
            { faixa: [5, 6], status: "grave", classificacao: "Grave", nota: "⚠️ Complicação grave. UCI." },
            { faixa: [7, 7], status: "muito_grave", classificacao: "Morte", nota: "⚠️ Óbito." }
        ]
    },

    "Escala de Aldrete (Recuperação Pós-Anestésica)": {
        tipo: "escala",
        sinonimos: ["aldrete", "recuperacao anestesica"],
        campos: [
            { id: "actividade", tipo: "select", label: "Actividade", opcoes: [{ label: "0 — Imóvel", peso: 0 }, { label: "1 — 2 membros", peso: 1 }, { label: "2 — Move 4 membros", peso: 2 }] },
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 — Apneia", peso: 0 }, { label: "1 — Dispneia", peso: 1 }, { label: "2 — Normal", peso: 2 }] },
            { id: "circulacao", tipo: "select", label: "Circulação", opcoes: [{ label: "0 — PA ±50%", peso: 0 }, { label: "1 — PA ±20-50%", peso: 1 }, { label: "2 — PA ±20%", peso: 2 }] },
            { id: "consciencia", tipo: "select", label: "Consciência", opcoes: [{ label: "0 — Não responde", peso: 0 }, { label: "1 — Desperta à voz", peso: 1 }, { label: "2 — Alerta", peso: 2 }] },
            { id: "saturacao", tipo: "select", label: "SpO2", opcoes: [{ label: "0 — <90%", peso: 0 }, { label: "1 — 90-95%", peso: 1 }, { label: "2 — >95%", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 9, max: 10, label: "Alta" },
        interpretacao: [
            { faixa: [9, 10], status: "bom", classificacao: "Alta", nota: "✅ Critérios de alta da recuperação." },
            { faixa: [7, 8], status: "moderado", classificacao: "Observação", nota: "⚠️ Necessita observação." },
            { faixa: [0, 6], status: "grave", classificacao: "Não apto", nota: "⚠️ Não apto para alta. Monitorizar." }
        ]
    },

    "Escala de Ramsay Modificada": {
        tipo: "escala",
        sinonimos: ["ramsay modificada", "sedacao modificada"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "1 — Ansioso", peso: 1 }, { label: "2 — Cooperante", peso: 2 }, { label: "3 — Responde a comandos", peso: 3 }, { label: "4 — Resposta rápida", peso: 4 }, { label: "5 — Resposta lenta", peso: 5 }, { label: "6 — Sem resposta", peso: 6 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 2, max: 4, label: "Adequado" },
        interpretacao: [
            { faixa: [1, 1], status: "leve", classificacao: "Ansioso", nota: "Ansioso. Considerar sedação." },
            { faixa: [2, 4], status: "bom", classificacao: "Adequado", nota: "✅ Sedação adequada." },
            { faixa: [5, 6], status: "grave", classificacao: "Excessiva", nota: "⚠️ Sedação excessiva. Reduzir." }
        ]
    },

        /* ====================================================================== */
    /* LOTE 5 — A. ELECTRÓLITOS E MINERAIS ADICIONAIS (18 itens)               */
    /* ====================================================================== */

    "Cloro (Cl-)": {
        tipo: "exame",
        sinonimos: ["cloro", "cl", "cloremia", "cloreto"],
        campos: [{ id: "valor", tipo: "input", label: "Cloro", unidade: "mEq/L", min: 70, max: 140 }],
        referencia: { min: 98, max: 107, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [70, 97.9], status: "baixo", termo: "Hipocloremia", nota: "Hipocloremia. Associada a vómitos ou alcalose metabólica." },
            { faixa: [98, 107], status: "normal", termo: "Normal", nota: "✅ Cloro normal." },
            { faixa: [107.1, 140], status: "alto", termo: "Hipercloremia", nota: "⚠️ Hipercloremia. Associada a acidose metabólica ou desidratação." }
        ]
    },

    "Cálcio Iónico": {
        tipo: "exame",
        sinonimos: ["calcio ionico", "ca ionico", "calcio livre"],
        campos: [{ id: "valor", tipo: "input", label: "Cálcio Iónico", unidade: "mg/dL", min: 0, max: 10 }],
        referencia: { min: 4.5, max: 5.6, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 4.4], status: "baixo", termo: "Hipocalcemia iónica", nota: "⚠️ Cálcio iónico baixo. Risco de tetania." },
            { faixa: [4.5, 5.6], status: "normal", termo: "Normal", nota: "✅ Cálcio iónico normal." },
            { faixa: [5.7, 10], status: "alto", termo: "Hipercalcemia iónica", nota: "⚠️ Cálcio iónico elevado. Avaliar causa." }
        ]
    },

    "Fósforo": {
        tipo: "exame",
        sinonimos: ["fosforo", "p", "fosfato"],
        campos: [{ id: "valor", tipo: "input", label: "Fósforo", unidade: "mg/dL", min: 0, max: 15 }],
        referencia: { min: 2.5, max: 4.5, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 2.4], status: "baixo", termo: "Hipofosfatemia", nota: "Hipofosfatemia. Considerar desnutrição ou alcoolismo." },
            { faixa: [2.5, 4.5], status: "normal", termo: "Normal", nota: "✅ Fósforo normal." },
            { faixa: [4.6, 15], status: "alto", termo: "Hiperfosfatemia", nota: "⚠️ Hiperfosfatemia. Comum em insuficiência renal." }
        ]
    },

    "Magnésio": {
        tipo: "exame",
        sinonimos: ["magnesio", "mg", "mg2+"],
        campos: [{ id: "valor", tipo: "input", label: "Magnésio", unidade: "mg/dL", min: 0, max: 10 }],
        referencia: { min: 1.7, max: 2.2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 1.6], status: "baixo", termo: "Hipomagnesemia", nota: "Hipomagnesemia. Associada a arritmias e hipocaliemia." },
            { faixa: [1.7, 2.2], status: "normal", termo: "Normal", nota: "✅ Magnésio normal." },
            { faixa: [2.3, 10], status: "alto", termo: "Hipermagnesemia", nota: "⚠️ Hipermagnesemia. Considerar insuficiência renal." }
        ]
    },

    "Zinco": {
        tipo: "exame",
        sinonimos: ["zinco", "zn"],
        campos: [{ id: "valor", tipo: "input", label: "Zinco", unidade: "µg/dL", min: 0, max: 300 }],
        referencia: { min: 70, max: 120, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Deficiência", nota: "⚠️ Zinco baixo. Risco de cicatrização deficiente e imunossupressão." },
            { faixa: [70, 120], status: "normal", termo: "Normal", nota: "✅ Zinco normal." },
            { faixa: [120.1, 300], status: "alto", termo: "Excesso", nota: "Zinco elevado. Pode causar deficiência de cobre." }
        ]
    },

    "Cobre": {
        tipo: "exame",
        sinonimos: ["cobre", "cu"],
        campos: [{ id: "valor", tipo: "input", label: "Cobre", unidade: "µg/dL", min: 0, max: 400 }],
        referencia: { min: 70, max: 140, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Deficiência", nota: "⚠️ Cobre baixo. Considerar anemia e neutropenia." },
            { faixa: [70, 140], status: "normal", termo: "Normal", nota: "✅ Cobre normal." },
            { faixa: [140.1, 400], status: "alto", termo: "Excesso", nota: "⚠️ Cobre elevado. Considerar doença de Wilson." }
        ]
    },

    "Selénio": {
        tipo: "exame",
        sinonimos: ["selenio", "se"],
        campos: [{ id: "valor", tipo: "input", label: "Selénio", unidade: "µg/L", min: 0, max: 500 }],
        referencia: { min: 70, max: 150, unidade: "µg/L" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Deficiência", nota: "Selénio baixo. Considerar cardiomiopatia." },
            { faixa: [70, 150], status: "normal", termo: "Normal", nota: "✅ Selénio normal." },
            { faixa: [150.1, 500], status: "alto", termo: "Excesso", nota: "⚠️ Selénio elevado. Risco de selenose." }
        ]
    },

    "Ferro Sérico": {
        tipo: "exame",
        sinonimos: ["ferro", "ferro serico", "fe"],
        campos: [{ id: "valor", tipo: "input", label: "Ferro Sérico", unidade: "µg/dL", min: 0, max: 500 }],
        referencia: { min: 60, max: 170, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 59], status: "baixo", termo: "Hiposideremia", nota: "⚠️ Ferro baixo. Sugere anemia ferropriva." },
            { faixa: [60, 170], status: "normal", termo: "Normal", nota: "✅ Ferro sérico normal." },
            { faixa: [170.1, 500], status: "alto", termo: "Hipersideremia", nota: "⚠️ Ferro elevado. Considerar hemocromatose." }
        ]
    },

    "Transferrina": {
        tipo: "exame",
        sinonimos: ["transferrina"],
        campos: [{ id: "valor", tipo: "input", label: "Transferrina", unidade: "mg/dL", min: 0, max: 600 }],
        referencia: { min: 200, max: 360, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 199], status: "baixo", termo: "Baixa", nota: "Transferrina baixa. Considerar desnutrição ou inflamação." },
            { faixa: [200, 360], status: "normal", termo: "Normal", nota: "✅ Transferrina normal." },
            { faixa: [360.1, 600], status: "alto", termo: "Elevada", nota: "Transferrina elevada. Sugere anemia ferropriva." }
        ]
    },

    "Capacidade de Fixação do Ferro (TIBC)": {
        tipo: "exame",
        sinonimos: ["tibc", "capacidade fixacao ferro", "ctff"],
        campos: [{ id: "valor", tipo: "input", label: "TIBC", unidade: "µg/dL", min: 0, max: 800 }],
        referencia: { min: 250, max: 450, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 249], status: "baixo", termo: "Baixa", nota: "TIBC baixa. Considerar sobrecarga de ferro ou inflamação." },
            { faixa: [250, 450], status: "normal", termo: "Normal", nota: "✅ TIBC normal." },
            { faixa: [450.1, 800], status: "alto", termo: "Elevada", nota: "⚠️ TIBC elevada. Sugere anemia ferropriva." }
        ]
    },

    "Saturação de Transferrina": {
        tipo: "exame",
        sinonimos: ["saturacao transferrina", "sat transferrina", "ist"],
        campos: [{ id: "valor", tipo: "input", label: "Saturação de Transferrina", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 20, max: 50, unidade: "%" },
        interpretacao: [
            { faixa: [0, 19.9], status: "baixo", termo: "Baixa", nota: "Saturação baixa. Sugere anemia ferropriva." },
            { faixa: [20, 50], status: "normal", termo: "Normal", nota: "✅ Saturação normal." },
            { faixa: [50.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ Saturação elevada. Considerar hemocromatose." }
        ]
    },

    "Fosfatase Alcalina Óssea": {
        tipo: "exame",
        sinonimos: ["fosfatase alcalina ossea", "fao"],
        campos: [{ id: "valor", tipo: "input", label: "FA Óssea", unidade: "U/L", min: 0, max: 200 }],
        referencia: { min: 15, max: 45, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 14.9], status: "baixo", termo: "Baixa", nota: "FA óssea baixa. Considerar hipofosfatasia." },
            { faixa: [15, 45], status: "normal", termo: "Normal", nota: "✅ FA óssea normal." },
            { faixa: [45.1, 200], status: "alto", termo: "Elevada", nota: "⚠️ FA óssea elevada. Considerar doença de Paget ou metástases ósseas." }
        ]
    },

    "Osteocalcina": {
        tipo: "exame",
        sinonimos: ["osteocalcina", "oc"],
        campos: [{ id: "valor", tipo: "input", label: "Osteocalcina", unidade: "ng/mL", min: 0, max: 100 }],
        referencia: { min: 10, max: 40, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 9.9], status: "baixo", termo: "Baixa", nota: "Osteocalcina baixa. Considerar baixo turnover ósseo." },
            { faixa: [10, 40], status: "normal", termo: "Normal", nota: "✅ Osteocalcina normal." },
            { faixa: [40.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ Osteocalcina elevada. Sugere alto turnover ósseo." }
        ]
    },

    "PTH (Paratormona)": {
        tipo: "exame",
        sinonimos: ["pth", "paratormona", "hormona paratiroideia"],
        campos: [{ id: "valor", tipo: "input", label: "PTH", unidade: "pg/mL", min: 0, max: 2000 }],
        referencia: { min: 15, max: 65, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 14.9], status: "baixo", termo: "Hipoparatiroidismo", nota: "⚠️ PTH baixa. Considerar hipoparatiroidismo." },
            { faixa: [15, 65], status: "normal", termo: "Normal", nota: "✅ PTH normal." },
            { faixa: [65.1, 2000], status: "alto", termo: "Hiperparatiroidismo", nota: "⚠️ PTH elevada. Considerar hiperparatiroidismo primário ou secundário." }
        ]
    },

    "Vitamina D (25-OH)": {
        tipo: "exame",
        sinonimos: ["vitamina d", "25 oh d", "calcidiol"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina D", unidade: "ng/mL", min: 0, max: 150 }],
        referencia: { min: 30, max: 100, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 19.9], status: "baixo", termo: "Deficiência", nota: "⚠️ Vitamina D baixa. Risco de osteomalácia. Suplementar." },
            { faixa: [20, 29.9], status: "leve", termo: "Insuficiência", nota: "⚠️ Vitamina D insuficiente. Considerar suplementação." },
            { faixa: [30, 100], status: "normal", termo: "Normal", nota: "✅ Vitamina D normal." },
            { faixa: [100.1, 150], status: "alto", termo: "Excesso", nota: "⚠️ Vitamina D elevada. Risco de hipercalcemia." }
        ]
    },

    "Vitamina D (1,25-OH)": {
        tipo: "exame",
        sinonimos: ["vitamina d ativa", "calcitriol"],
        campos: [{ id: "valor", tipo: "input", label: "1,25-OH Vitamina D", unidade: "pg/mL", min: 0, max: 200 }],
        referencia: { min: 20, max: 60, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 19.9], status: "baixo", termo: "Baixa", nota: "Vitamina D ativa baixa. Considerar insuficiência renal." },
            { faixa: [20, 60], status: "normal", termo: "Normal", nota: "✅ Vitamina D ativa normal." },
            { faixa: [60.1, 200], status: "alto", termo: "Elevada", nota: "⚠️ Vitamina D ativa elevada. Considerar sarcoidose." }
        ]
    },

    "Cálcio Urinário (24h)": {
        tipo: "exame",
        sinonimos: ["calcio urinario", "calciuria 24h"],
        campos: [{ id: "valor", tipo: "input", label: "Cálcio Urinário 24h", unidade: "mg/24h", min: 0, max: 1000 }],
        referencia: { min: 100, max: 300, unidade: "mg/24h" },
        interpretacao: [
            { faixa: [0, 99], status: "baixo", termo: "Hipocalciúria", nota: "Hipocalciúria. Considerar hipoparatiroidismo." },
            { faixa: [100, 300], status: "normal", termo: "Normal", nota: "✅ Calciúria normal." },
            { faixa: [300.1, 1000], status: "alto", termo: "Hipercalciúria", nota: "⚠️ Hipercalciúria. Risco de litíase renal." }
        ]
    },

    "Magnésio Urinário": {
        tipo: "exame",
        sinonimos: ["magnesio urinario", "magnesiuria"],
        campos: [{ id: "valor", tipo: "input", label: "Magnésio Urinário", unidade: "mg/24h", min: 0, max: 500 }],
        referencia: { min: 50, max: 150, unidade: "mg/24h" },
        interpretacao: [
            { faixa: [0, 49], status: "baixo", termo: "Baixa", nota: "Magnésio urinário baixo. Considerar deficiência ou hipoparatiroidismo." },
            { faixa: [50, 150], status: "normal", termo: "Normal", nota: "✅ Magnésio urinário normal." },
            { faixa: [150.1, 500], status: "alto", termo: "Elevada", nota: "⚠️ Magnésio urinário elevado. Considerar diuréticos ou insuficiência renal." }
        ]
    },

        /* ====================================================================== */
    /* LOTE 5 — B. VITAMINAS (16 itens)                                        */
    /* ====================================================================== */

    "Vitamina A (Retinol)": {
        tipo: "exame",
        sinonimos: ["vitamina a", "retinol"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina A", unidade: "µg/dL", min: 0, max: 200 }],
        referencia: { min: 30, max: 80, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 29], status: "baixo", termo: "Deficiência", nota: "⚠️ Vitamina A baixa. Risco de cegueira nocturna. Suplementar." },
            { faixa: [30, 80], status: "normal", termo: "Normal", nota: "✅ Vitamina A normal." },
            { faixa: [80.1, 200], status: "alto", termo: "Excesso", nota: "⚠️ Vitamina A elevada. Risco de toxicidade hepática." }
        ]
    },

    "Vitamina B1 (Tiamina)": {
        tipo: "exame",
        sinonimos: ["vitamina b1", "tiamina"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina B1", unidade: "nmol/L", min: 0, max: 500 }],
        referencia: { min: 70, max: 180, unidade: "nmol/L" },
        interpretacao: [
            { faixa: [0, 69], status: "baixo", termo: "Deficiência", nota: "⚠️ Tiamina baixa. Risco de beribéri ou Wernicke. Suplementar." },
            { faixa: [70, 180], status: "normal", termo: "Normal", nota: "✅ Tiamina normal." },
            { faixa: [180.1, 500], status: "alto", termo: "Excesso", nota: "Tiamina elevada. Geralmente sem significado." }
        ]
    },

    "Vitamina B2 (Riboflavina)": {
        tipo: "exame",
        sinonimos: ["vitamina b2", "riboflavina"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina B2", unidade: "µg/L", min: 0, max: 1000 }],
        referencia: { min: 120, max: 400, unidade: "µg/L" },
        interpretacao: [
            { faixa: [0, 119], status: "baixo", termo: "Deficiência", nota: "⚠️ Riboflavina baixa. Risco de queilite e glossite." },
            { faixa: [120, 400], status: "normal", termo: "Normal", nota: "✅ Riboflavina normal." },
            { faixa: [400.1, 1000], status: "alto", termo: "Excesso", nota: "Riboflavina elevada. Sem significado clínico." }
        ]
    },

    "Vitamina B3 (Niacina)": {
        tipo: "exame",
        sinonimos: ["vitamina b3", "niacina", "acido nicotinico"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina B3", unidade: "µg/mL", min: 0, max: 50 }],
        referencia: { min: 3, max: 12, unidade: "µg/mL" },
        interpretacao: [
            { faixa: [0, 2.9], status: "baixo", termo: "Deficiência", nota: "⚠️ Niacina baixa. Risco de pelagra. Suplementar." },
            { faixa: [3, 12], status: "normal", termo: "Normal", nota: "✅ Niacina normal." },
            { faixa: [12.1, 50], status: "alto", termo: "Excesso", nota: "⚠️ Niacina elevada. Risco de hepatotoxicidade." }
        ]
    },

    "Vitamina B5 (Ácido Pantoténico)": {
        tipo: "exame",
        sinonimos: ["vitamina b5", "acido pantotenico"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina B5", unidade: "µmol/L", min: 0, max: 20 }],
        referencia: { min: 1, max: 5, unidade: "µmol/L" },
        interpretacao: [
            { faixa: [0, 0.99], status: "baixo", termo: "Deficiência", nota: "Vitamina B5 baixa. Raramente sintomática." },
            { faixa: [1, 5], status: "normal", termo: "Normal", nota: "✅ Vitamina B5 normal." },
            { faixa: [5.01, 20], status: "alto", termo: "Excesso", nota: "Vitamina B5 elevada. Sem significado." }
        ]
    },

    "Vitamina B6 (Piridoxina)": {
        tipo: "exame",
        sinonimos: ["vitamina b6", "piridoxina"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina B6", unidade: "µg/L", min: 0, max: 200 }],
        referencia: { min: 5, max: 30, unidade: "µg/L" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Deficiência", nota: "⚠️ Vitamina B6 baixa. Risco de anemia e neuropatia." },
            { faixa: [5, 30], status: "normal", termo: "Normal", nota: "✅ Vitamina B6 normal." },
            { faixa: [30.1, 200], status: "alto", termo: "Excesso", nota: "⚠️ Vitamina B6 elevada. Risco de neuropatia periférica." }
        ]
    },

    "Vitamina B7 (Biotina)": {
        tipo: "exame",
        sinonimos: ["vitamina b7", "biotina"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina B7", unidade: "ng/L", min: 0, max: 2000 }],
        referencia: { min: 200, max: 700, unidade: "ng/L" },
        interpretacao: [
            { faixa: [0, 199], status: "baixo", termo: "Deficiência", nota: "Biotina baixa. Risco de dermatite e alopecia." },
            { faixa: [200, 700], status: "normal", termo: "Normal", nota: "✅ Biotina normal." },
            { faixa: [700.1, 2000], status: "alto", termo: "Excesso", nota: "Biotina elevada. Sem significado." }
        ]
    },

    "Vitamina B9 (Folato)": {
        tipo: "exame",
        sinonimos: ["vitamina b9", "folato", "acido folico"],
        campos: [{ id: "valor", tipo: "input", label: "Folato", unidade: "ng/mL", min: 0, max: 50 }],
        referencia: { min: 3, max: 17, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 2.9], status: "baixo", termo: "Deficiência", nota: "⚠️ Folato baixo. Risco de anemia megaloblástica. Suplementar." },
            { faixa: [3, 17], status: "normal", termo: "Normal", nota: "✅ Folato normal." },
            { faixa: [17.1, 50], status: "alto", termo: "Elevado", nota: "Folato elevado. Geralmente sem significado." }
        ]
    },

    "Vitamina B12 (Cobalamina)": {
        tipo: "exame",
        sinonimos: ["vitamina b12", "cobalamina", "b12"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina B12", unidade: "pg/mL", min: 0, max: 2000 }],
        referencia: { min: 200, max: 900, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 199], status: "baixo", termo: "Deficiência", nota: "⚠️ B12 baixa. Risco de anemia megaloblástica e neuropatia." },
            { faixa: [200, 900], status: "normal", termo: "Normal", nota: "✅ B12 normal." },
            { faixa: [900.1, 2000], status: "alto", termo: "Elevada", nota: "B12 elevada. Considerar doença hepática ou mieloproliferativa." }
        ]
    },

    "Vitamina C (Ácido Ascórbico)": {
        tipo: "exame",
        sinonimos: ["vitamina c", "acido ascorbico"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina C", unidade: "mg/dL", min: 0, max: 10 }],
        referencia: { min: 0.4, max: 2, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 0.39], status: "baixo", termo: "Deficiência", nota: "⚠️ Vitamina C baixa. Risco de escorbuto. Suplementar." },
            { faixa: [0.4, 2], status: "normal", termo: "Normal", nota: "✅ Vitamina C normal." },
            { faixa: [2.01, 10], status: "alto", termo: "Excesso", nota: "Vitamina C elevada. Risco de litíase oxálica." }
        ]
    },

    "Vitamina E (Tocoferol)": {
        tipo: "exame",
        sinonimos: ["vitamina e", "tocoferol", "alfa tocoferol"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina E", unidade: "mg/L", min: 0, max: 50 }],
        referencia: { min: 5, max: 18, unidade: "mg/L" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Deficiência", nota: "⚠️ Vitamina E baixa. Risco de neuropatia e hemólise." },
            { faixa: [5, 18], status: "normal", termo: "Normal", nota: "✅ Vitamina E normal." },
            { faixa: [18.1, 50], status: "alto", termo: "Excesso", nota: "⚠️ Vitamina E elevada. Risco de hemorragia." }
        ]
    },

    "Vitamina K (Filoquinona)": {
        tipo: "exame",
        sinonimos: ["vitamina k", "filoquinona"],
        campos: [{ id: "valor", tipo: "input", label: "Vitamina K", unidade: "ng/mL", min: 0, max: 10 }],
        referencia: { min: 0.2, max: 2.2, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.19], status: "baixo", termo: "Deficiência", nota: "⚠️ Vitamina K baixa. Risco de hemorragia. Suplementar." },
            { faixa: [0.2, 2.2], status: "normal", termo: "Normal", nota: "✅ Vitamina K normal." },
            { faixa: [2.21, 10], status: "alto", termo: "Excesso", nota: "Vitamina K elevada. Geralmente sem significado." }
        ]
    },

    "Vitamina K (MK-7)": {
        tipo: "exame",
        sinonimos: ["vitamina k2", "mk 7", "menaquinona"],
        campos: [{ id: "valor", tipo: "input", label: "MK-7", unidade: "ng/mL", min: 0, max: 10 }],
        referencia: { min: 0.1, max: 1, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.09], status: "baixo", termo: "Baixa", nota: "MK-7 baixa. Considerar suplementação para saúde óssea." },
            { faixa: [0.1, 1], status: "normal", termo: "Normal", nota: "✅ MK-7 normal." },
            { faixa: [1.01, 10], status: "alto", termo: "Elevada", nota: "MK-7 elevada. Sem significado." }
        ]
    },

    "Homocisteína": {
        tipo: "exame",
        sinonimos: ["homocisteina", "hcy"],
        campos: [{ id: "valor", tipo: "input", label: "Homocisteína", unidade: "µmol/L", min: 0, max: 100 }],
        referencia: { min: 5, max: 15, unidade: "µmol/L" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Baixa", nota: "Homocisteína baixa. Raramente significativo." },
            { faixa: [5, 15], status: "normal", termo: "Normal", nota: "✅ Homocisteína normal." },
            { faixa: [15.1, 30], status: "leve", termo: "Elevada", nota: "⚠️ Homocisteína elevada. Factor de risco cardiovascular." },
            { faixa: [30.1, 100], status: "grave", termo: "Muito elevada", nota: "⚠️ Homocisteína muito elevada. Risco trombótico. Investigar causa." }
        ]
    },

    "Ácido Metilmalónico": {
        tipo: "exame",
        sinonimos: ["acido metilmalonico", "mma"],
        campos: [{ id: "valor", tipo: "input", label: "Ácido Metilmalónico", unidade: "µmol/L", min: 0, max: 100 }],
        referencia: { min: 0, max: 0.4, unidade: "µmol/L" },
        interpretacao: [
            { faixa: [0, 0.4], status: "normal", termo: "Normal", nota: "✅ Ácido metilmalónico normal." },
            { faixa: [0.41, 100], status: "alto", termo: "Elevado", nota: "⚠️ Ácido metilmalónico elevado. Sugere deficiência de B12." }
        ]
    },

    "Carnitina": {
        tipo: "exame",
        sinonimos: ["carnitina", "l carnitina"],
        campos: [{ id: "valor", tipo: "input", label: "Carnitina", unidade: "µmol/L", min: 0, max: 200 }],
        referencia: { min: 20, max: 60, unidade: "µmol/L" },
        interpretacao: [
            { faixa: [0, 19.9], status: "baixo", termo: "Deficiência", nota: "⚠️ Carnitina baixa. Risco de miopatia e hipoglicemia." },
            { faixa: [20, 60], status: "normal", termo: "Normal", nota: "✅ Carnitina normal." },
            { faixa: [60.1, 200], status: "alto", termo: "Elevada", nota: "Carnitina elevada. Considerar suplementação." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 5 — C. HORMONAS (16 itens)                                         */
    /* ====================================================================== */

    "Cortisol (Manhã)": {
        tipo: "exame",
        sinonimos: ["cortisol", "cortisol matinal"],
        campos: [{ id: "valor", tipo: "input", label: "Cortisol (8h)", unidade: "µg/dL", min: 0, max: 100 }],
        referencia: { min: 5, max: 25, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Baixo", nota: "⚠️ Cortisol baixo. Considerar insuficiência adrenal." },
            { faixa: [5, 25], status: "normal", termo: "Normal", nota: "✅ Cortisol normal." },
            { faixa: [25.1, 100], status: "alto", termo: "Elevado", nota: "⚠️ Cortisol elevado. Considerar síndrome de Cushing." }
        ]
    },

    "Cortisol (Tarde)": {
        tipo: "exame",
        sinonimos: ["cortisol tarde", "cortisol vespertino"],
        campos: [{ id: "valor", tipo: "input", label: "Cortisol (16h)", unidade: "µg/dL", min: 0, max: 100 }],
        referencia: { min: 3, max: 15, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 2.9], status: "baixo", termo: "Baixo", nota: "Cortisol baixo. Considerar insuficiência adrenal." },
            { faixa: [3, 15], status: "normal", termo: "Normal", nota: "✅ Cortisol normal." },
            { faixa: [15.1, 100], status: "alto", termo: "Elevado", nota: "⚠️ Cortisol elevado. Perda do ritmo circadiano. Cushing." }
        ]
    },

    "ACTH": {
        tipo: "exame",
        sinonimos: ["acth", "corticotrofina"],
        campos: [{ id: "valor", tipo: "input", label: "ACTH", unidade: "pg/mL", min: 0, max: 500 }],
        referencia: { min: 10, max: 60, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 9.9], status: "baixo", termo: "Baixo", nota: "⚠️ ACTH baixo. Considerar Cushing adrenal ou hipopituitarismo." },
            { faixa: [10, 60], status: "normal", termo: "Normal", nota: "✅ ACTH normal." },
            { faixa: [60.1, 500], status: "alto", termo: "Elevado", nota: "⚠️ ACTH elevado. Considerar doença de Addison ou Cushing hipofisário." }
        ]
    },

    "Prolactina": {
        tipo: "exame",
        sinonimos: ["prolactina", "prl"],
        campos: [{ id: "valor", tipo: "input", label: "Prolactina", unidade: "ng/mL", min: 0, max: 500 }],
        referencia: { min: 4, max: 15, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 3.9], status: "baixo", termo: "Baixa", nota: "Prolactina baixa. Raramente significativo." },
            { faixa: [4, 15], status: "normal", termo: "Normal", nota: "✅ Prolactina normal." },
            { faixa: [15.1, 100], status: "leve", termo: "Elevada", nota: "⚠️ Prolactina elevada. Considerar fármacos ou hipotiroidismo." },
            { faixa: [100.1, 500], status: "alto", termo: "Muito elevada", nota: "⚠️ Prolactina muito elevada. Sugere prolactinoma. RM hipófise." }
        ]
    },

    "GH (Hormona do Crescimento)": {
        tipo: "exame",
        sinonimos: ["gh", "hormona crescimento", "somatotrofina"],
        campos: [{ id: "valor", tipo: "input", label: "GH", unidade: "ng/mL", min: 0, max: 50 }],
        referencia: { min: 0, max: 5, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Normal", nota: "✅ GH normal em jejum." },
            { faixa: [5.1, 50], status: "alto", termo: "Elevada", nota: "⚠️ GH elevada. Considerar acromegalia ou gigantismo." }
        ]
    },

    "IGF-1 (Somatomedina C)": {
        tipo: "exame",
        sinonimos: ["igf 1", "somatomedina c", "igf1"],
        campos: [{ id: "valor", tipo: "input", label: "IGF-1", unidade: "ng/mL", min: 0, max: 1000 }],
        referencia: { min: 100, max: 300, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 99], status: "baixo", termo: "Baixo", nota: "IGF-1 baixo. Considerar deficiência de GH." },
            { faixa: [100, 300], status: "normal", termo: "Normal", nota: "✅ IGF-1 normal." },
            { faixa: [300.1, 1000], status: "alto", termo: "Elevado", nota: "⚠️ IGF-1 elevado. Sugere acromegalia." }
        ]
    },

    "FSH (Hormona Folículo-Estimulante)": {
        tipo: "exame",
        sinonimos: ["fsh", "foliculo estimulante"],
        campos: [{ id: "valor", tipo: "input", label: "FSH", unidade: "mUI/mL", min: 0, max: 200 }],
        referencia: { min: 1, max: 12, unidade: "mUI/mL" },
        interpretacao: [
            { faixa: [0, 0.9], status: "baixo", termo: "Baixo", nota: "FSH baixo. Considerar hipopituitarismo ou SOP." },
            { faixa: [1, 12], status: "normal", termo: "Normal", nota: "✅ FSH normal." },
            { faixa: [12.1, 200], status: "alto", termo: "Elevado", nota: "⚠️ FSH elevado. Considerar menopausa ou falência gonadal." }
        ]
    },

    "LH (Hormona Luteinizante)": {
        tipo: "exame",
        sinonimos: ["lh", "luteinizante"],
        campos: [{ id: "valor", tipo: "input", label: "LH", unidade: "mUI/mL", min: 0, max: 200 }],
        referencia: { min: 1, max: 12, unidade: "mUI/mL" },
        interpretacao: [
            { faixa: [0, 0.9], status: "baixo", termo: "Baixo", nota: "LH baixo. Considerar hipopituitarismo ou SOP." },
            { faixa: [1, 12], status: "normal", termo: "Normal", nota: "✅ LH normal." },
            { faixa: [12.1, 200], status: "alto", termo: "Elevado", nota: "⚠️ LH elevado. Considerar menopausa ou SOP." }
        ]
    },

    "Estradiol (E2)": {
        tipo: "exame",
        sinonimos: ["estradiol", "e2", "estrogenio"],
        campos: [{ id: "valor", tipo: "input", label: "Estradiol", unidade: "pg/mL", min: 0, max: 1000 }],
        referencia: { min: 20, max: 350, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 19], status: "baixo", termo: "Baixo", nota: "Estradiol baixo. Considerar hipogonadismo ou menopausa." },
            { faixa: [20, 350], status: "normal", termo: "Normal", nota: "✅ Estradiol normal." },
            { faixa: [350.1, 1000], status: "alto", termo: "Elevado", nota: "⚠️ Estradiol elevado. Considerar tumor ovariano ou hiperestimulação." }
        ]
    },

    "Progesterona": {
        tipo: "exame",
        sinonimos: ["progesterona", "p4"],
        campos: [{ id: "valor", tipo: "input", label: "Progesterona", unidade: "ng/mL", min: 0, max: 100 }],
        referencia: { min: 0.1, max: 25, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.09], status: "baixo", termo: "Baixa", nota: "Progesterona baixa. Considerar fase folicular ou insuficiência lútea." },
            { faixa: [0.1, 25], status: "normal", termo: "Normal", nota: "✅ Progesterona normal." },
            { faixa: [25.1, 100], status: "alto", termo: "Elevada", nota: "Progesterona elevada. Considerar gravidez ou tumor." }
        ]
    },

    "Testosterona Total": {
        tipo: "exame",
        sinonimos: ["testosterona", "testosterona total"],
        campos: [{ id: "valor", tipo: "input", label: "Testosterona Total", unidade: "ng/dL", min: 0, max: 2000 }],
        referencia: { min: 300, max: 1000, unidade: "ng/dL" },
        interpretacao: [
            { faixa: [0, 299], status: "baixo", termo: "Baixa", nota: "⚠️ Testosterona baixa. Considerar hipogonadismo." },
            { faixa: [300, 1000], status: "normal", termo: "Normal", nota: "✅ Testosterona normal." },
            { faixa: [1000.1, 2000], status: "alto", termo: "Elevada", nota: "⚠️ Testosterona elevada. Considerar tumor ou abuso." }
        ]
    },

    "DHEA-S": {
        tipo: "exame",
        sinonimos: ["dhea s", "dhea sulfato", "dehidroepiandrosterona"],
        campos: [{ id: "valor", tipo: "input", label: "DHEA-S", unidade: "µg/dL", min: 0, max: 1000 }],
        referencia: { min: 100, max: 400, unidade: "µg/dL" },
        interpretacao: [
            { faixa: [0, 99], status: "baixo", termo: "Baixo", nota: "DHEA-S baixo. Considerar insuficiência adrenal." },
            { faixa: [100, 400], status: "normal", termo: "Normal", nota: "✅ DHEA-S normal." },
            { faixa: [400.1, 1000], status: "alto", termo: "Elevado", nota: "⚠️ DHEA-S elevado. Considerar tumor adrenal ou SOP." }
        ]
    },

    "Aldosterona": {
        tipo: "exame",
        sinonimos: ["aldosterona"],
        campos: [{ id: "valor", tipo: "input", label: "Aldosterona", unidade: "ng/dL", min: 0, max: 100 }],
        referencia: { min: 3, max: 16, unidade: "ng/dL" },
        interpretacao: [
            { faixa: [0, 2.9], status: "baixo", termo: "Baixa", nota: "Aldosterona baixa. Considerar insuficiência adrenal." },
            { faixa: [3, 16], status: "normal", termo: "Normal", nota: "✅ Aldosterona normal." },
            { faixa: [16.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ Aldosterona elevada. Considerar hiperaldosteronismo." }
        ]
    },

    "Renina": {
        tipo: "exame",
        sinonimos: ["renina", "atividade renina"],
        campos: [{ id: "valor", tipo: "input", label: "Renina", unidade: "ng/mL/h", min: 0, max: 50 }],
        referencia: { min: 0.5, max: 4, unidade: "ng/mL/h" },
        interpretacao: [
            { faixa: [0, 0.49], status: "baixo", termo: "Baixa", nota: "Renina baixa. Considerar hiperaldosteronismo primário." },
            { faixa: [0.5, 4], status: "normal", termo: "Normal", nota: "✅ Renina normal." },
            { faixa: [4.1, 50], status: "alto", termo: "Elevada", nota: "⚠️ Renina elevada. Considerar estenose artéria renal." }
        ]
    },

    "ADH (Hormona Antidiurética)": {
        tipo: "exame",
        sinonimos: ["adh", "vasopressina", "hormona antidiuretica"],
        campos: [{ id: "valor", tipo: "input", label: "ADH", unidade: "pg/mL", min: 0, max: 20 }],
        referencia: { min: 1, max: 5, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 0.9], status: "baixo", termo: "Baixa", nota: "ADH baixa. Considerar diabetes insipidus." },
            { faixa: [1, 5], status: "normal", termo: "Normal", nota: "✅ ADH normal." },
            { faixa: [5.1, 20], status: "alto", termo: "Elevada", nota: "⚠️ ADH elevada. Considerar SIADH." }
        ]
    },

    "Péptido C": {
        tipo: "exame",
        sinonimos: ["peptideo c", "c peptideo"],
        campos: [{ id: "valor", tipo: "input", label: "Péptido C", unidade: "ng/mL", min: 0, max: 20 }],
        referencia: { min: 0.8, max: 4, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.79], status: "baixo", termo: "Baixo", nota: "Péptido C baixo. Sugere diabetes tipo 1." },
            { faixa: [0.8, 4], status: "normal", termo: "Normal", nota: "✅ Péptido C normal." },
            { faixa: [4.1, 20], status: "alto", termo: "Elevado", nota: "⚠️ Péptido C elevado. Sugere resistência à insulina." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 6 — A. MARCADORES TUMORAIS (25 itens)                              */
    /* ====================================================================== */

    "PSA Total (Antigénio Prostático Específico)": {
        tipo: "exame",
        sinonimos: ["psa", "psa total", "antigenio prostatico"],
        campos: [{ id: "valor", tipo: "input", label: "PSA Total", unidade: "ng/mL", min: 0, max: 200 }],
        referencia: { min: 0, max: 4, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 4], status: "normal", termo: "Normal", nota: "✅ PSA normal. Baixa probabilidade de cancro prostático." },
            { faixa: [4.1, 10], status: "leve", termo: "Zona cinzenta", nota: "⚠️ PSA na zona cinzenta. Considerar PSA livre e biópsia." },
            { faixa: [10.1, 200], status: "alto", termo: "Elevado", nota: "⚠️ PSA elevado. Alto risco de cancro prostático. Biópsia urgente." }
        ]
    },

    "PSA Livre": {
        tipo: "exame",
        sinonimos: ["psa livre", "free psa"],
        campos: [{ id: "valor", tipo: "input", label: "PSA Livre", unidade: "ng/mL", min: 0, max: 50 }],
        referencia: { min: 0, max: 0.9, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 0.9], status: "normal", termo: "Normal", nota: "✅ PSA livre normal." },
            { faixa: [0.91, 50], status: "alto", termo: "Elevado", nota: "⚠️ PSA livre elevado. Correlacionar com PSA total." }
        ]
    },

    "Relação PSA Livre/Total": {
        tipo: "escala",
        sinonimos: ["relacao psa", "psa livre total ratio"],
        campos: [
            { id: "livre", tipo: "input", label: "PSA Livre", unidade: "ng/mL", min: 0, max: 50 },
            { id: "total", tipo: "input", label: "PSA Total", unidade: "ng/mL", min: 0.1, max: 200 }
        ],
        calculo: { formula: "livre / total", mostrarFormula: "PSA livre / PSA total" },
        referencia: { min: 0.25, max: 1, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0.24], status: "alto", classificacao: "Suspeita de cancro", nota: "⚠️ Relação baixa. Aumenta suspeita de cancro prostático." },
            { faixa: [0.25, 1], status: "bom", classificacao: "Normal", nota: "✅ Relação normal. Favorece hiperplasia benigna." }
        ]
    },

    "CEA (Antigénio Carcinoembrionário)": {
        tipo: "exame",
        sinonimos: ["cea", "antigenio carcinoembrionario"],
        campos: [{ id: "valor", tipo: "input", label: "CEA", unidade: "ng/mL", min: 0, max: 500 }],
        referencia: { min: 0, max: 5, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Normal", nota: "✅ CEA normal." },
            { faixa: [5.1, 20], status: "leve", termo: "Elevado", nota: "⚠️ CEA elevado. Considerar neoplasia colorrectal ou tabagismo." },
            { faixa: [20.1, 500], status: "alto", termo: "Muito elevado", nota: "⚠️ CEA muito elevado. Sugere neoplasia avançada ou metástases." }
        ]
    },

    "CA 19-9": {
        tipo: "exame",
        sinonimos: ["ca 19 9", "ca19-9", "ca 199"],
        campos: [{ id: "valor", tipo: "input", label: "CA 19-9", unidade: "U/mL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 37, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 37], status: "normal", termo: "Normal", nota: "✅ CA 19-9 normal." },
            { faixa: [37.1, 200], status: "leve", termo: "Elevado", nota: "⚠️ CA 19-9 elevado. Considerar neoplasia pancreática ou biliar." },
            { faixa: [200.1, 5000], status: "alto", termo: "Muito elevado", nota: "⚠️ CA 19-9 muito elevado. Sugere neoplasia pancreática avançada." }
        ]
    },

    "CA 125": {
        tipo: "exame",
        sinonimos: ["ca 125", "ca125"],
        campos: [{ id: "valor", tipo: "input", label: "CA 125", unidade: "U/mL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 35, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 35], status: "normal", termo: "Normal", nota: "✅ CA 125 normal." },
            { faixa: [35.1, 200], status: "leve", termo: "Elevado", nota: "⚠️ CA 125 elevado. Considerar neoplasia ovariana ou endometriose." },
            { faixa: [200.1, 5000], status: "alto", termo: "Muito elevado", nota: "⚠️ CA 125 muito elevado. Sugere neoplasia ovariana avançada." }
        ]
    },

    "CA 15-3": {
        tipo: "exame",
        sinonimos: ["ca 15 3", "ca15-3"],
        campos: [{ id: "valor", tipo: "input", label: "CA 15-3", unidade: "U/mL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 30, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 30], status: "normal", termo: "Normal", nota: "✅ CA 15-3 normal." },
            { faixa: [30.1, 100], status: "leve", termo: "Elevado", nota: "⚠️ CA 15-3 elevado. Considerar neoplasia mamária." },
            { faixa: [100.1, 1000], status: "alto", termo: "Muito elevado", nota: "⚠️ CA 15-3 muito elevado. Sugere neoplasia mamária avançada." }
        ]
    },

    "CA 27-29": {
        tipo: "exame",
        sinonimos: ["ca 27 29", "ca27-29"],
        campos: [{ id: "valor", tipo: "input", label: "CA 27-29", unidade: "U/mL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 38, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 38], status: "normal", termo: "Normal", nota: "✅ CA 27-29 normal." },
            { faixa: [38.1, 1000], status: "alto", termo: "Elevado", nota: "⚠️ CA 27-29 elevado. Considerar neoplasia mamária." }
        ]
    },

    "AFP (Alfa-Fetoproteína)": {
        tipo: "exame",
        sinonimos: ["afp", "alfa fetoproteina"],
        campos: [{ id: "valor", tipo: "input", label: "AFP", unidade: "ng/mL", min: 0, max: 100000 }],
        referencia: { min: 0, max: 10, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 10], status: "normal", termo: "Normal", nota: "✅ AFP normal." },
            { faixa: [10.1, 200], status: "leve", termo: "Elevado", nota: "⚠️ AFP elevado. Considerar hepatite, cirrose ou gravidez." },
            { faixa: [200.1, 100000], status: "alto", termo: "Muito elevado", nota: "⚠️ AFP muito elevado. Sugere carcinoma hepatocelular ou tumor germinativo." }
        ]
    },

    "Beta-HCG (Gonadotrofina Coriónica)": {
        tipo: "exame",
        sinonimos: ["beta hcg", "hcg", "gonadotrofina corionica"],
        campos: [{ id: "valor", tipo: "input", label: "Beta-HCG", unidade: "mUI/mL", min: 0, max: 1000000 }],
        referencia: { min: 0, max: 5, unidade: "mUI/mL" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Negativo", nota: "✅ Beta-HCG negativo (não grávida)." },
            { faixa: [5.1, 100000], status: "alto", termo: "Positivo", nota: "⚠️ Beta-HCG positivo. Gravidez ou tumor germinativo." },
            { faixa: [100000.1, 1000000], status: "grave", termo: "Muito elevado", nota: "⚠️ Beta-HCG muito elevado. Considerar mola hidatiforme ou coriocarcinoma." }
        ]
    },

    "CA 72-4": {
        tipo: "exame",
        sinonimos: ["ca 72 4", "ca72-4"],
        campos: [{ id: "valor", tipo: "input", label: "CA 72-4", unidade: "U/mL", min: 0, max: 500 }],
        referencia: { min: 0, max: 6.9, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 6.9], status: "normal", termo: "Normal", nota: "✅ CA 72-4 normal." },
            { faixa: [7, 500], status: "alto", termo: "Elevado", nota: "⚠️ CA 72-4 elevado. Considerar neoplasia gástrica." }
        ]
    },

    "CYFRA 21-1": {
        tipo: "exame",
        sinonimos: ["cyfra 21 1", "cyfra"],
        campos: [{ id: "valor", tipo: "input", label: "CYFRA 21-1", unidade: "ng/mL", min: 0, max: 100 }],
        referencia: { min: 0, max: 3.3, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 3.3], status: "normal", termo: "Normal", nota: "✅ CYFRA 21-1 normal." },
            { faixa: [3.31, 100], status: "alto", termo: "Elevado", nota: "⚠️ CYFRA 21-1 elevado. Considerar neoplasia pulmonar." }
        ]
    },

    "NSE (Enolase Neurónio-Específica)": {
        tipo: "exame",
        sinonimos: ["nse", "enolase neuronio especifica"],
        campos: [{ id: "valor", tipo: "input", label: "NSE", unidade: "ng/mL", min: 0, max: 200 }],
        referencia: { min: 0, max: 16.3, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 16.3], status: "normal", termo: "Normal", nota: "✅ NSE normal." },
            { faixa: [16.31, 200], status: "alto", termo: "Elevado", nota: "⚠️ NSE elevado. Considerar tumor neuroendócrino ou pulmonar." }
        ]
    },

    "Cromogranina A": {
        tipo: "exame",
        sinonimos: ["cromogranina a", "cga"],
        campos: [{ id: "valor", tipo: "input", label: "Cromogranina A", unidade: "ng/mL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 100, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 100], status: "normal", termo: "Normal", nota: "✅ Cromogranina A normal." },
            { faixa: [100.1, 1000], status: "alto", termo: "Elevado", nota: "⚠️ Cromogranina A elevado. Considerar tumor neuroendócrino." }
        ]
    },

    "Calcitonina (Tumoral)": {
        tipo: "exame",
        sinonimos: ["calcitonina tumoral", "calcitonina"],
        campos: [{ id: "valor", tipo: "input", label: "Calcitonina", unidade: "pg/mL", min: 0, max: 2000 }],
        referencia: { min: 0, max: 10, unidade: "pg/mL" },
        interpretacao: [
            { faixa: [0, 10], status: "normal", termo: "Normal", nota: "✅ Calcitonina normal." },
            { faixa: [10.1, 100], status: "leve", termo: "Elevado", nota: "⚠️ Calcitonina elevada. Considerar hiperplasia de células C." },
            { faixa: [100.1, 2000], status: "alto", termo: "Muito elevado", nota: "⚠️ Calcitonina muito elevada. Sugere carcinoma medular da tiróide." }
        ]
    },

    "Tireoglobulina (Tumoral)": {
        tipo: "exame",
        sinonimos: ["tireoglobulina tumoral", "tg tumoral"],
        campos: [{ id: "valor", tipo: "input", label: "Tireoglobulina", unidade: "ng/mL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 40, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 40], status: "normal", termo: "Normal", nota: "✅ Tireoglobulina normal." },
            { faixa: [40.1, 1000], status: "alto", termo: "Elevada", nota: "⚠️ Tireoglobulina elevada. Considerar neoplasia tiroideia." }
        ]
    },

    "PAP (Fosfatase Ácida Prostática)": {
        tipo: "exame",
        sinonimos: ["pap", "fosfatase acida prostatica"],
        campos: [{ id: "valor", tipo: "input", label: "PAP", unidade: "U/L", min: 0, max: 50 }],
        referencia: { min: 0, max: 2.5, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 2.5], status: "normal", termo: "Normal", nota: "✅ PAP normal." },
            { faixa: [2.51, 50], status: "alto", termo: "Elevada", nota: "⚠️ PAP elevada. Considerar neoplasia prostática metastática." }
        ]
    },

    "HER2/neu (Extracelular)": {
        tipo: "exame",
        sinonimos: ["her2", "her2 neu", "receptor her2"],
        campos: [{ id: "valor", tipo: "input", label: "HER2/neu", unidade: "ng/mL", min: 0, max: 500 }],
        referencia: { min: 0, max: 15, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 15], status: "normal", termo: "Normal", nota: "✅ HER2/neu normal." },
            { faixa: [15.1, 500], status: "alto", termo: "Elevado", nota: "⚠️ HER2/neu elevado. Considerar neoplasia mamária HER2+." }
        ]
    },

    "MUC1 (CA 15-3 relacionado)": {
        tipo: "exame",
        sinonimos: ["muc1", "mucina 1"],
        campos: [{ id: "valor", tipo: "input", label: "MUC1", unidade: "U/mL", min: 0, max: 500 }],
        referencia: { min: 0, max: 30, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 30], status: "normal", termo: "Normal", nota: "✅ MUC1 normal." },
            { faixa: [30.1, 500], status: "alto", termo: "Elevado", nota: "⚠️ MUC1 elevado. Considerar neoplasia mamária." }
        ]
    },

    "HE4 (Proteína Epididimal 4)": {
        tipo: "exame",
        sinonimos: ["he4", "proteina epididimal 4"],
        campos: [{ id: "valor", tipo: "input", label: "HE4", unidade: "pmol/L", min: 0, max: 2000 }],
        referencia: { min: 0, max: 70, unidade: "pmol/L" },
        interpretacao: [
            { faixa: [0, 70], status: "normal", termo: "Normal", nota: "✅ HE4 normal." },
            { faixa: [70.1, 2000], status: "alto", termo: "Elevado", nota: "⚠️ HE4 elevado. Considerar neoplasia ovariana." }
        ]
    },

    "ROMA (Índice de Risco Ovariano)": {
        tipo: "escala",
        sinonimos: ["roma", "risco ovariano"],
        campos: [
            { id: "he4", tipo: "input", label: "HE4", unidade: "pmol/L", min: 0, max: 2000 },
            { id: "ca125", tipo: "input", label: "CA 125", unidade: "U/mL", min: 0, max: 5000 }
        ],
        calculo: { formula: "(he4 * 1) + (ca125 * 1)", mostrarFormula: "HE4 + CA 125 (simplificado)" },
        referencia: { min: 0, max: 100, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 100], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de neoplasia ovariana." },
            { faixa: [100.1, 1000], status: "moderado", classificacao: "Risco intermédio", nota: "⚠️ Risco intermédio. Investigar." },
            { faixa: [1000.1, 10000], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Encaminhar ginecologia oncológica." }
        ]
    },

    "Índice de Risk of Malignancy (RMI)": {
        tipo: "escala",
        sinonimos: ["rmi", "risk of malignancy index"],
        campos: [
            { id: "menopausa", tipo: "select", label: "Menopausa", opcoes: [{ label: "Pré-menopausa (1)", peso: 1 }, { label: "Pós-menopausa (3)", peso: 3 }] },
            { id: "ca125", tipo: "input", label: "CA 125", unidade: "U/mL", min: 0, max: 5000 },
            { id: "eco", tipo: "select", label: "Achados ecográficos", opcoes: [{ label: "0 — Nenhum", peso: 0 }, { label: "1 — Um", peso: 1 }, { label: "3 — ≥2", peso: 3 }] }
        ],
        calculo: { formula: "menopausa * ca125 * eco", mostrarFormula: "M × CA125 × E" },
        referencia: { min: 0, max: 200, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 200], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de malignidade." },
            { faixa: [200.1, 1000], status: "moderado", classificacao: "Risco intermédio", nota: "⚠️ Risco intermédio. Referenciar." },
            { faixa: [1000.1, 100000], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Encaminhar oncologia." }
        ]
    },

    "PSA (Densidade)": {
        tipo: "escala",
        sinonimos: ["densidade psa", "psa density"],
        campos: [
            { id: "psa", tipo: "input", label: "PSA Total", unidade: "ng/mL", min: 0, max: 200 },
            { id: "volume", tipo: "input", label: "Volume Prostático", unidade: "cm³", min: 1, max: 500 }
        ],
        calculo: { formula: "psa / volume", mostrarFormula: "PSA / Volume" },
        referencia: { min: 0, max: 0.15, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0.15], status: "bom", classificacao: "Normal", nota: "✅ Densidade normal. Favorece hiperplasia benigna." },
            { faixa: [0.151, 1], status: "alto", classificacao: "Elevada", nota: "⚠️ Densidade elevada. Aumenta suspeita de cancro. Biópsia." }
        ]
    },

    "Índice de Gleason (Biópsia)": {
        tipo: "escala",
        sinonimos: ["gleason", "score gleason"],
        campos: [{ id: "valor", tipo: "select", label: "Score Gleason", opcoes: [{ label: "6 (3+3)", peso: 6 }, { label: "7 (3+4)", peso: 7 }, { label: "7 (4+3)", peso: 8 }, { label: "8 (4+4)", peso: 9 }, { label: "9-10", peso: 10 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 6, max: 6, label: "Baixo risco" },
        interpretacao: [
            { faixa: [6, 6], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Vigilância activa possível." },
            { faixa: [7, 7], status: "moderado", classificacao: "Risco intermédio", nota: "⚠️ Risco intermédio. Tratamento curativo." },
            { faixa: [8, 8], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco elevado. Tratamento multimodal." },
            { faixa: [9, 10], status: "muito_grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. Doença avançada." }
        ]
    },

    "Índice de Ki-67 (Proliferação)": {
        tipo: "exame",
        sinonimos: ["ki 67", "ki67", "indice proliferacao"],
        campos: [{ id: "valor", tipo: "input", label: "Ki-67", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 0, max: 20, unidade: "%" },
        interpretacao: [
            { faixa: [0, 20], status: "bom", termo: "Baixo", nota: "✅ Baixo índice proliferativo. Melhor prognóstico." },
            { faixa: [20.1, 50], status: "moderado", termo: "Intermédio", nota: "⚠️ Índice intermédio. Correlacionar com clínica." },
            { faixa: [50.1, 100], status: "grave", termo: "Alto", nota: "⚠️ Alto índice proliferativo. Tumor agressivo." }
        ]
    },




        /* ====================================================================== */
    /* LOTE 6 — B. AUTOIMUNIDADE (25 itens)                                    */
    /* ====================================================================== */

    "FAN (Fator Antinuclear)": {
        tipo: "exame",
        sinonimos: ["fan", "ana", "fator antinuclear"],
        campos: [
            { id: "resultado", tipo: "select", label: "FAN", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] },
            { id: "titulo", tipo: "input", label: "Título (se positivo)", unidade: "1/", min: 0, max: 100000 }
        ],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ FAN negativo." },
            { padrao: { resultado: "Positivo" }, status: "alto", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ FAN positivo. Considerar doenças autoimunes (LES, esclerodermia)." }
        ]
    },

    "Anti-DNA de Cadeia Dupla (anti-dsDNA)": {
        tipo: "exame",
        sinonimos: ["anti dna", "anti dsdna", "dna cadeia dupla"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-dsDNA", unidade: "UI/mL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 30, unidade: "UI/mL" },
        interpretacao: [
            { faixa: [0, 30], status: "negativo", termo: "Negativo", nota: "✅ Anti-dsDNA negativo." },
            { faixa: [30.1, 200], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-dsDNA positivo. Sugere LES activo." },
            { faixa: [200.1, 1000], status: "grave", termo: "Muito elevado", nota: "⚠️ Anti-dsDNA muito elevado. LES activo com risco renal." }
        ]
    },

    "Anti-Sm (Smith)": {
        tipo: "exame",
        sinonimos: ["anti sm", "smith"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-Sm", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-Sm negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-Sm positivo. Altamente específico de LES." }
        ]
    },

    "Anti-Ro (SSA)": {
        tipo: "exame",
        sinonimos: ["anti ro", "ssa", "anti ssa"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-Ro", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-Ro negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-Ro positivo. LES/Sjögren. Risco de bloqueio cardíaco fetal." }
        ]
    },

    "Anti-La (SSB)": {
        tipo: "exame",
        sinonimos: ["anti la", "ssb", "anti ssb"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-La", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-La negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-La positivo. Sjögren/LES." }
        ]
    },

    "Anti-RNP": {
        tipo: "exame",
        sinonimos: ["anti rnp", "rnp"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-RNP", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-RNP negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-RNP positivo. Doença mista do tecido conjuntivo." }
        ]
    },

    "Anti-Scl-70": {
        tipo: "exame",
        sinonimos: ["anti scl 70", "scl 70", "topoisomerase"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-Scl-70", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-Scl-70 negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-Scl-70 positivo. Esclerodermia difusa." }
        ]
    },

    "Anti-Centrómero": {
        tipo: "exame",
        sinonimos: ["anti centromero", "centromero"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-Centrómero", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-centrómero negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-centrómero positivo. Esclerodermia limitada." }
        ]
    },

    "Anti-Jo-1": {
        tipo: "exame",
        sinonimos: ["anti jo 1", "jo 1", "anti sintetase"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-Jo-1", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-Jo-1 negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-Jo-1 positivo. Polimiosite/dermatomiosite." }
        ]
    },

    "Anti-CCP (Péptido Cíclico Citrulinado)": {
        tipo: "exame",
        sinonimos: ["anti ccp", "ccp", "peptideo citrulinado"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-CCP", unidade: "U/mL", min: 0, max: 500 }],
        referencia: { min: 0, max: 20, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 20], status: "negativo", termo: "Negativo", nota: "✅ Anti-CCP negativo." },
            { faixa: [20.1, 100], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-CCP positivo. Artrite reumatoide provável." },
            { faixa: [100.1, 500], status: "grave", termo: "Muito elevado", nota: "⚠️ Anti-CCP muito elevado. AR erosiva." }
        ]
    },

    "Fator Reumatoide (FR)": {
        tipo: "exame",
        sinonimos: ["fator reumatoide", "fr", "latex"],
        campos: [{ id: "valor", tipo: "input", label: "Fator Reumatoide", unidade: "UI/mL", min: 0, max: 1000 }],
        referencia: { min: 0, max: 14, unidade: "UI/mL" },
        interpretacao: [
            { faixa: [0, 14], status: "negativo", termo: "Negativo", nota: "✅ Fator reumatoide negativo." },
            { faixa: [14.1, 100], status: "positivo", termo: "Positivo", nota: "⚠️ FR positivo. Considerar artrite reumatoide ou hepatite C." },
            { faixa: [100.1, 1000], status: "grave", termo: "Muito elevado", nota: "⚠️ FR muito elevado. AR activa." }
        ]
    },

    "Anti-ANCA (c-ANCA)": {
        tipo: "exame",
        sinonimos: ["c anca", "anca citoplasmatico", "pr3"],
        campos: [{ id: "resultado", tipo: "select", label: "c-ANCA", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ c-ANCA negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ c-ANCA positivo. Granulomatose com poliangiite (Wegener)." }
        ]
    },

    "Anti-ANCA (p-ANCA)": {
        tipo: "exame",
        sinonimos: ["p anca", "anca perinuclear", "mpo"],
        campos: [{ id: "resultado", tipo: "select", label: "p-ANCA", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ p-ANCA negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ p-ANCA positivo. Poliangiite microscópica ou CEP." }
        ]
    },

    "Anti-MBG (Membrana Basal Glomerular)": {
        tipo: "exame",
        sinonimos: ["anti mbg", "anti gbm", "goodpasture"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-MBG", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-MBG negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-MBG positivo. Doença de Goodpasture. Urgente." }
        ]
    },

    "Anti-Mitocôndria (AMA)": {
        tipo: "exame",
        sinonimos: ["ama", "anti mitocondria"],
        campos: [{ id: "resultado", tipo: "select", label: "AMA", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ AMA negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ AMA positivo. Cirrose biliar primária." }
        ]
    },

    "Anti-Músculo Liso (AML)": {
        tipo: "exame",
        sinonimos: ["aml", "anti musculo liso", "asma"],
        campos: [{ id: "resultado", tipo: "select", label: "AML", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ AML negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ AML positivo. Hepatite autoimune." }
        ]
    },

    "Anti-LKM-1": {
        tipo: "exame",
        sinonimos: ["anti lkm 1", "lkm 1", "anti microssoma figado rim"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-LKM-1", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-LKM-1 negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-LKM-1 positivo. Hepatite autoimune tipo 2." }
        ]
    },

    "Anti-TTG (Transglutaminase)": {
        tipo: "exame",
        sinonimos: ["anti ttg", "ttg", "transglutaminase"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-TTG IgA", unidade: "U/mL", min: 0, max: 500 }],
        referencia: { min: 0, max: 10, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 10], status: "negativo", termo: "Negativo", nota: "✅ Anti-TTG negativo." },
            { faixa: [10.1, 100], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-TTG positivo. Doença celíaca provável." },
            { faixa: [100.1, 500], status: "grave", termo: "Muito elevado", nota: "⚠️ Anti-TTG muito elevado. Doença celíaca activa." }
        ]
    },

    "Anti-Endomísio": {
        tipo: "exame",
        sinonimos: ["anti endomisio", "endomisio"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-Endomísio", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-endomísio negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-endomísio positivo. Doença celíaca." }
        ]
    },

    "Anti-Gliadina": {
        tipo: "exame",
        sinonimos: ["anti gliadina", "gliadina"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-Gliadina IgA", unidade: "U/mL", min: 0, max: 200 }],
        referencia: { min: 0, max: 20, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 20], status: "negativo", termo: "Negativo", nota: "✅ Anti-gliadina negativo." },
            { faixa: [20.1, 200], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-gliadina positivo. Considerar doença celíaca." }
        ]
    },

    "Anti-Tireoglobulina (Anti-TG)": {
        tipo: "exame",
        sinonimos: ["anti tg", "anti tireoglobulina"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-TG", unidade: "UI/mL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 40, unidade: "UI/mL" },
        interpretacao: [
            { faixa: [0, 40], status: "negativo", termo: "Negativo", nota: "✅ Anti-TG negativo." },
            { faixa: [40.1, 5000], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-TG positivo. Tiroidite autoimune." }
        ]
    },

    "Anti-TPO (Anti-Peroxidase)": {
        tipo: "exame",
        sinonimos: ["anti tpo", "anti peroxidase", "tpo"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-TPO", unidade: "UI/mL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 35, unidade: "UI/mL" },
        interpretacao: [
            { faixa: [0, 35], status: "negativo", termo: "Negativo", nota: "✅ Anti-TPO negativo." },
            { faixa: [35.1, 5000], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-TPO positivo. Tiroidite de Hashimoto." }
        ]
    },

    "Anti-Receptor de Acetilcolina (Anti-AChR)": {
        tipo: "exame",
        sinonimos: ["anti achr", "achr", "miastenia gravis"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-AChR", unidade: "nmol/L", min: 0, max: 50 }],
        referencia: { min: 0, max: 0.5, unidade: "nmol/L" },
        interpretacao: [
            { faixa: [0, 0.5], status: "negativo", termo: "Negativo", nota: "✅ Anti-AChR negativo." },
            { faixa: [0.51, 50], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-AChR positivo. Miastenia gravis." }
        ]
    },

    "Anti-MuSK": {
        tipo: "exame",
        sinonimos: ["anti musk", "musk"],
        campos: [{ id: "resultado", tipo: "select", label: "Anti-MuSK", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Anti-MuSK negativo." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Anti-MuSK positivo. Miastenia gravis." }
        ]
    },

    "Anti-GAD (Descarboxilase do Ácido Glutâmico)": {
        tipo: "exame",
        sinonimos: ["anti gad", "gad", "descarboxilase"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-GAD", unidade: "U/mL", min: 0, max: 2000 }],
        referencia: { min: 0, max: 5, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 5], status: "negativo", termo: "Negativo", nota: "✅ Anti-GAD negativo." },
            { faixa: [5.1, 100], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-GAD positivo. Diabetes tipo 1 ou síndrome stiff-person." },
            { faixa: [100.1, 2000], status: "grave", termo: "Muito elevado", nota: "⚠️ Anti-GAD muito elevado. Síndrome stiff-person." }
        ]
    },

    "Anti-Transglutaminase (IgA)": {
        tipo: "exame",
        sinonimos: ["anti transglutaminase iga", "ttg iga"],
        campos: [{ id: "valor", tipo: "input", label: "Anti-TTG IgA", unidade: "U/mL", min: 0, max: 500 }],
        referencia: { min: 0, max: 10, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 10], status: "negativo", termo: "Negativo", nota: "✅ Anti-TTG IgA negativo." },
            { faixa: [10.1, 500], status: "positivo", termo: "Positivo", nota: "⚠️ Anti-TTG IgA positivo. Doença celíaca." }
        ]
    },

    "C3 (Complemento 3)": {
        tipo: "exame",
        sinonimos: ["c3", "complemento 3"],
        campos: [{ id: "valor", tipo: "input", label: "C3", unidade: "mg/dL", min: 0, max: 300 }],
        referencia: { min: 90, max: 180, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 89], status: "baixo", termo: "Baixo", nota: "⚠️ C3 baixo. Consumo complemento (LES, glomerulonefrite)." },
            { faixa: [90, 180], status: "normal", termo: "Normal", nota: "✅ C3 normal." },
            { faixa: [180.1, 300], status: "alto", termo: "Elevado", nota: "C3 elevado. Considerar inflamação." }
        ]
    },

    "C4 (Complemento 4)": {
        tipo: "exame",
        sinonimos: ["c4", "complemento 4"],
        campos: [{ id: "valor", tipo: "input", label: "C4", unidade: "mg/dL", min: 0, max: 100 }],
        referencia: { min: 10, max: 40, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 9.9], status: "baixo", termo: "Baixo", nota: "⚠️ C4 baixo. Consumo complemento (LES, crioglobulinemia)." },
            { faixa: [10, 40], status: "normal", termo: "Normal", nota: "✅ C4 normal." },
            { faixa: [40.1, 100], status: "alto", termo: "Elevado", nota: "C4 elevado. Considerar inflamação." }
        ]
    },

    "CH50 (Complemento Total)": {
        tipo: "exame",
        sinonimos: ["ch50", "complemento total"],
        campos: [{ id: "valor", tipo: "input", label: "CH50", unidade: "U/mL", min: 0, max: 200 }],
        referencia: { min: 60, max: 144, unidade: "U/mL" },
        interpretacao: [
            { faixa: [0, 59], status: "baixo", termo: "Baixo", nota: "⚠️ CH50 baixo. Deficiência de complemento ou consumo." },
            { faixa: [60, 144], status: "normal", termo: "Normal", nota: "✅ CH50 normal." },
            { faixa: [144.1, 200], status: "alto", termo: "Elevado", nota: "CH50 elevado. Considerar inflamação." }
        ]
    },





        /* ====================================================================== */
    /* LOTE 7 — A. GASOMETRIA E RESPIRATÓRIO (25 itens)                        */
    /* ====================================================================== */

    "pH Arterial": {
        tipo: "exame",
        sinonimos: ["ph", "ph arterial", "ph sanguineo"],
        campos: [{ id: "valor", tipo: "input", label: "pH", unidade: "", min: 6.5, max: 8 }],
        referencia: { min: 7.35, max: 7.45, unidade: "" },
        interpretacao: [
            { faixa: [6.5, 7.34], status: "baixo", termo: "Acidose", nota: "⚠️ Acidose. Avaliar pCO2 e HCO3 para determinar respiratória ou metabólica." },
            { faixa: [7.35, 7.45], status: "normal", termo: "Normal", nota: "✅ pH normal." },
            { faixa: [7.46, 8], status: "alto", termo: "Alcalose", nota: "⚠️ Alcalose. Avaliar pCO2 e HCO3." }
        ]
    },

    "pCO2 (Pressão Parcial de CO2)": {
        tipo: "exame",
        sinonimos: ["pco2", "dioxido de carbono", "pressao co2"],
        campos: [{ id: "valor", tipo: "input", label: "pCO2", unidade: "mmHg", min: 0, max: 150 }],
        referencia: { min: 35, max: 45, unidade: "mmHg" },
        interpretacao: [
            { faixa: [0, 34], status: "baixo", termo: "Hipocapnia", nota: "⚠️ pCO2 baixa. Sugere hiperventilação ou alcalose respiratória." },
            { faixa: [35, 45], status: "normal", termo: "Normal", nota: "✅ pCO2 normal." },
            { faixa: [45.1, 150], status: "alto", termo: "Hipercapnia", nota: "⚠️ pCO2 elevada. Sugere hipoventilação ou acidose respiratória." }
        ]
    },

    "pO2 (Pressão Parcial de O2)": {
        tipo: "exame",
        sinonimos: ["po2", "oxigenio", "pressao o2"],
        campos: [{ id: "valor", tipo: "input", label: "pO2", unidade: "mmHg", min: 0, max: 600 }],
        referencia: { min: 80, max: 100, unidade: "mmHg" },
        interpretacao: [
            { faixa: [0, 59], status: "grave", termo: "Hipoxemia grave", nota: "⚠️ HIPOXEMIA GRAVE! Oxigénio urgente. Avaliar intubação." },
            { faixa: [60, 79], status: "moderado", termo: "Hipoxemia", nota: "⚠️ Hipoxemia. Oxigénio suplementar." },
            { faixa: [80, 100], status: "normal", termo: "Normal", nota: "✅ pO2 normal." },
            { faixa: [100.1, 600], status: "alto", termo: "Hiperóxia", nota: "⚠️ Hiperóxia. Reduzir FiO2 para evitar toxicidade." }
        ]
    },

    "HCO3 (Bicarbonato)": {
        tipo: "exame",
        sinonimos: ["hco3", "bicarbonato", "co2 total"],
        campos: [{ id: "valor", tipo: "input", label: "HCO3", unidade: "mEq/L", min: 0, max: 60 }],
        referencia: { min: 22, max: 26, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [0, 21.9], status: "baixo", termo: "Acidose metabólica", nota: "⚠️ HCO3 baixo. Acidose metabólica." },
            { faixa: [22, 26], status: "normal", termo: "Normal", nota: "✅ HCO3 normal." },
            { faixa: [26.1, 60], status: "alto", termo: "Alcalose metabólica", nota: "⚠️ HCO3 elevado. Alcalose metabólica." }
        ]
    },

    "BE (Base Excess)": {
        tipo: "exame",
        sinonimos: ["be", "base excess", "excesso base"],
        campos: [{ id: "valor", tipo: "input", label: "Base Excess", unidade: "mEq/L", min: -30, max: 30 }],
        referencia: { min: -2, max: 2, unidade: "mEq/L" },
        interpretacao: [
            { faixa: [-30, -2.1], status: "baixo", termo: "Défice de base", nota: "⚠️ Défice de base. Acidose metabólica." },
            { faixa: [-2, 2], status: "normal", termo: "Normal", nota: "✅ Base excess normal." },
            { faixa: [2.1, 30], status: "alto", termo: "Excesso de base", nota: "⚠️ Excesso de base. Alcalose metabólica." }
        ]
    },

    "SaO2 (Saturação Arterial de O2)": {
        tipo: "exame",
        sinonimos: ["sao2", "saturacao arterial", "sat o2 arterial"],
        campos: [{ id: "valor", tipo: "input", label: "SaO2", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 95, max: 100, unidade: "%" },
        interpretacao: [
            { faixa: [0, 89], status: "grave", termo: "Hipoxemia grave", nota: "⚠️ HIPOXEMIA GRAVE! Oxigénio urgente." },
            { faixa: [90, 94], status: "moderado", termo: "Hipoxemia", nota: "⚠️ Hipoxemia. Oxigénio suplementar." },
            { faixa: [95, 100], status: "normal", termo: "Normal", nota: "✅ Saturação normal." }
        ]
    },

    "SpO2 (Oximetria de Pulso)": {
        tipo: "exame",
        sinonimos: ["spo2", "saturacao periferica", "oximetria"],
        campos: [{ id: "valor", tipo: "input", label: "SpO2", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 95, max: 100, unidade: "%" },
        interpretacao: [
            { faixa: [0, 89], status: "grave", termo: "Hipoxemia grave", nota: "⚠️ HIPOXEMIA GRAVE! Oxigénio urgente." },
            { faixa: [90, 94], status: "moderado", termo: "Hipoxemia", nota: "⚠️ Hipoxemia. Oxigénio suplementar." },
            { faixa: [95, 100], status: "normal", termo: "Normal", nota: "✅ Saturação normal." }
        ]
    },

    "Lactato (Gasometria)": {
        tipo: "exame",
        sinonimos: ["lactato gasometria", "lactato"],
        campos: [{ id: "valor", tipo: "input", label: "Lactato", unidade: "mmol/L", min: 0, max: 30 }],
        referencia: { min: 0.5, max: 2.2, unidade: "mmol/L" },
        interpretacao: [
            { faixa: [0, 0.4], status: "baixo", termo: "Baixo", nota: "Lactato baixo. Sem significado." },
            { faixa: [0.5, 2.2], status: "normal", termo: "Normal", nota: "✅ Lactato normal." },
            { faixa: [2.3, 4], status: "moderado", termo: "Elevado", nota: "⚠️ Lactato elevado. Sugere hipoperfusão." },
            { faixa: [4.1, 30], status: "grave", termo: "Muito elevado", nota: "⚠️ LACTATO MUITO ELEVADO! Choque/sepse grave." }
        ]
    },

    "FiO2 (Fração Inspirada de O2)": {
        tipo: "exame",
        sinonimos: ["fio2", "fracao inspirada oxigenio"],
        campos: [{ id: "valor", tipo: "input", label: "FiO2", unidade: "%", min: 21, max: 100 }],
        referencia: { min: 21, max: 21, unidade: "%" },
        interpretacao: [
            { faixa: [21, 21], status: "normal", termo: "Ar ambiente", nota: "✅ Ar ambiente (21%)." },
            { faixa: [21.1, 40], status: "leve", termo: "O2 suplementar baixo", nota: "Oxigénio suplementar baixo." },
            { faixa: [40.1, 60], status: "moderado", termo: "O2 suplementar médio", nota: "⚠️ Oxigénio suplementar médio." },
            { faixa: [60.1, 100], status: "grave", termo: "O2 suplementar alto", nota: "⚠️ Oxigénio suplementar alto. Risco de toxicidade." }
        ]
    },

    "Relação PaO2/FiO2": {
        tipo: "escala",
        sinonimos: ["pao2 fio2", "relacao p f", "indice kirby"],
        campos: [
            { id: "pao2", tipo: "input", label: "PaO2", unidade: "mmHg", min: 0, max: 600 },
            { id: "fio2", tipo: "input", label: "FiO2", unidade: "%", min: 21, max: 100 }
        ],
        calculo: { formula: "pao2 / (fio2 / 100)", mostrarFormula: "PaO2 / (FiO2/100)" },
        referencia: { min: 400, max: 500, label: "Normal" },
        interpretacao: [
            { faixa: [0, 100], status: "muito_grave", classificacao: "SDRA grave", nota: "⚠️ Relação <100. SDRA grave. Ventilação protectora." },
            { faixa: [100.1, 200], status: "grave", classificacao: "SDRA moderada", nota: "⚠️ Relação 100-200. SDRA moderada. UCI." },
            { faixa: [200.1, 300], status: "moderado", classificacao: "SDRA leve", nota: "⚠️ Relação 200-300. SDRA leve. Monitorizar." },
            { faixa: [300.1, 400], status: "leve", classificacao: "Compromisso leve", nota: "Compromisso leve da oxigenação." },
            { faixa: [400.1, 500], status: "bom", classificacao: "Normal", nota: "✅ Relação normal." }
        ]
    },

    "Gradiente A-a de O2": {
        tipo: "escala",
        sinonimos: ["gradiente aa", "a a gradient", "gradiente alvolar arterial"],
        campos: [
            { id: "pao2", tipo: "input", label: "PaO2", unidade: "mmHg", min: 0, max: 600 },
            { id: "fio2", tipo: "input", label: "FiO2", unidade: "%", min: 21, max: 100 },
            { id: "paco2", tipo: "input", label: "PaCO2", unidade: "mmHg", min: 0, max: 150 }
        ],
        calculo: { formula: "((fio2 / 100) * (760 - 47)) - (paco2 / 0.8) - pao2", mostrarFormula: "PAO2 - PaO2" },
        referencia: { min: 0, max: 20, label: "Normal" },
        interpretacao: [
            { faixa: [0, 20], status: "bom", classificacao: "Normal", nota: "✅ Gradiente normal." },
            { faixa: [20.1, 40], status: "moderado", classificacao: "Elevado", nota: "⚠️ Gradiente elevado. Considerar pneumonia ou embolia." },
            { faixa: [40.1, 600], status: "grave", classificacao: "Muito elevado", nota: "⚠️ Gradiente muito elevado. SDRA ou fibrose." }
        ]
    },

    "Shunt Intrapulmonar": {
        tipo: "exame",
        sinonimos: ["shunt", "shunt intrapulmonar"],
        campos: [{ id: "valor", tipo: "input", label: "Shunt", unidade: "%", min: 0, max: 50 }],
        referencia: { min: 0, max: 5, unidade: "%" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Normal", nota: "✅ Shunt normal." },
            { faixa: [5.1, 15], status: "leve", termo: "Elevado", nota: "⚠️ Shunt elevado. Considerar pneumonia ou atelectasia." },
            { faixa: [15.1, 30], status: "moderado", termo: "Muito elevado", nota: "⚠️ Shunt muito elevado. SDRA." },
            { faixa: [30.1, 50], status: "grave", termo: "Crítico", nota: "⚠️ Shunt crítico. Refractário a oxigénio." }
        ]
    },

    "Espaço Morto (Vd/Vt)": {
        tipo: "exame",
        sinonimos: ["espaco morto", "vd vt"],
        campos: [{ id: "valor", tipo: "input", label: "Vd/Vt", unidade: "%", min: 0, max: 80 }],
        referencia: { min: 20, max: 40, unidade: "%" },
        interpretacao: [
            { faixa: [0, 19.9], status: "baixo", termo: "Baixo", nota: "Espaço morto baixo. Raramente significativo." },
            { faixa: [20, 40], status: "normal", termo: "Normal", nota: "✅ Espaço morto normal." },
            { faixa: [40.1, 60], status: "moderado", termo: "Elevado", nota: "⚠️ Espaço morto elevado. Considerar TEP." },
            { faixa: [60.1, 80], status: "grave", termo: "Muito elevado", nota: "⚠️ Espaço morto muito elevado. TEP maciça." }
        ]
    },

    "Capnografia (EtCO2)": {
        tipo: "exame",
        sinonimos: ["etco2", "capnografia", "co2 expirado"],
        campos: [{ id: "valor", tipo: "input", label: "EtCO2", unidade: "mmHg", min: 0, max: 80 }],
        referencia: { min: 35, max: 45, unidade: "mmHg" },
        interpretacao: [
            { faixa: [0, 34], status: "baixo", termo: "Baixo", nota: "⚠️ EtCO2 baixo. Considerar hiperventilação ou TEP." },
            { faixa: [35, 45], status: "normal", termo: "Normal", nota: "✅ EtCO2 normal." },
            { faixa: [45.1, 80], status: "alto", termo: "Elevado", nota: "⚠️ EtCO2 elevado. Considerar hipoventilação." }
        ]
    },

    "FEV1 (Volume Expiratório Forçado)": {
        tipo: "exame",
        sinonimos: ["fev1", "volume expiratorio forcado"],
        campos: [{ id: "valor", tipo: "input", label: "FEV1", unidade: "% previsto", min: 0, max: 150 }],
        referencia: { min: 80, max: 120, unidade: "%" },
        interpretacao: [
            { faixa: [0, 29], status: "muito_grave", termo: "Muito grave", nota: "⚠️ FEV1 muito grave. DPOC GOLD 4." },
            { faixa: [30, 49], status: "grave", termo: "Grave", nota: "⚠️ FEV1 grave. DPOC GOLD 3." },
            { faixa: [50, 79], status: "moderado", termo: "Moderado", nota: "⚠️ FEV1 moderado. DPOC GOLD 2." },
            { faixa: [80, 120], status: "normal", termo: "Normal", nota: "✅ FEV1 normal." }
        ]
    },

    "FVC (Capacidade Vital Forçada)": {
        tipo: "exame",
        sinonimos: ["fvc", "capacidade vital forcada"],
        campos: [{ id: "valor", tipo: "input", label: "FVC", unidade: "% previsto", min: 0, max: 150 }],
        referencia: { min: 80, max: 120, unidade: "%" },
        interpretacao: [
            { faixa: [0, 49], status: "grave", termo: "Muito reduzida", nota: "⚠️ FVC muito reduzida. Restrição grave." },
            { faixa: [50, 79], status: "moderado", termo: "Reduzida", nota: "⚠️ FVC reduzida. Restrição moderada." },
            { faixa: [80, 120], status: "normal", termo: "Normal", nota: "✅ FVC normal." }
        ]
    },

    "Relação FEV1/FVC": {
        tipo: "exame",
        sinonimos: ["fev1 fvc", "indice tiffeneau"],
        campos: [{ id: "valor", tipo: "input", label: "FEV1/FVC", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 70, max: 100, unidade: "%" },
        interpretacao: [
            { faixa: [0, 69], status: "alto", termo: "Obstrução", nota: "⚠️ Relação <70%. Obstrução brônquica (DPOC/asma)." },
            { faixa: [70, 100], status: "normal", termo: "Normal", nota: "✅ Relação normal." }
        ]
    },

    "PFE (Pico de Fluxo Expiratório)": {
        tipo: "exame",
        sinonimos: ["pfe", "peak flow", "pico fluxo"],
        campos: [{ id: "valor", tipo: "input", label: "PFE", unidade: "L/min", min: 0, max: 800 }],
        referencia: { min: 400, max: 700, unidade: "L/min" },
        interpretacao: [
            { faixa: [0, 199], status: "grave", termo: "Muito reduzido", nota: "⚠️ PFE muito reduzido. Crise asmática grave." },
            { faixa: [200, 399], status: "moderado", termo: "Reduzido", nota: "⚠️ PFE reduzido. Crise moderada." },
            { faixa: [400, 700], status: "normal", termo: "Normal", nota: "✅ PFE normal." }
        ]
    },

    "Óxido Nítrico Exalado (FeNO)": {
        tipo: "exame",
        sinonimos: ["feno", "oxido nitrico exalado"],
        campos: [{ id: "valor", tipo: "input", label: "FeNO", unidade: "ppb", min: 0, max: 200 }],
        referencia: { min: 0, max: 25, unidade: "ppb" },
        interpretacao: [
            { faixa: [0, 25], status: "normal", termo: "Normal", nota: "✅ FeNO normal." },
            { faixa: [25.1, 50], status: "leve", termo: "Elevado", nota: "⚠️ FeNO elevado. Inflamação eosinofílica." },
            { faixa: [50.1, 200], status: "alto", termo: "Muito elevado", nota: "⚠️ FeNO muito elevado. Asma eosinofílica." }
        ]
    },

    "Teste de Caminhada de 6 Minutos": {
        tipo: "exame",
        sinonimos: ["tc6m", "caminhada 6 minutos"],
        campos: [{ id: "valor", tipo: "input", label: "Distância", unidade: "metros", min: 0, max: 1000 }],
        referencia: { min: 400, max: 700, unidade: "metros" },
        interpretacao: [
            { faixa: [0, 299], status: "grave", termo: "Muito reduzida", nota: "⚠️ Capacidade funcional muito reduzida." },
            { faixa: [300, 399], status: "moderado", termo: "Reduzida", nota: "⚠️ Capacidade funcional reduzida." },
            { faixa: [400, 700], status: "normal", termo: "Normal", nota: "✅ Capacidade funcional normal." }
        ]
    },

    "Escala de Borg (Dispneia)": {
        tipo: "escala",
        sinonimos: ["borg", "dispneia borg"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "0 — Nenhuma", peso: 0 }, { label: "1 — Muito leve", peso: 1 }, { label: "2 — Leve", peso: 2 }, { label: "3 — Moderada", peso: 3 }, { label: "4 — Algo intensa", peso: 4 }, { label: "5 — Intensa", peso: 5 }, { label: "7 — Muito intensa", peso: 7 }, { label: "9 — Muito muito intensa", peso: 9 }, { label: "10 — Máxima", peso: 10 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "leve", classificacao: "Leve", nota: "Dispneia leve." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dispneia moderada. Avaliar oxigénio." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Dispneia grave. Suporte ventilatório." }
        ]
    },

    "Escala de Wood-Downes (Asma)": {
        tipo: "escala",
        sinonimos: ["wood downes", "asma", "crise asmatica"],
        campos: [
            { id: "sibilos", tipo: "select", label: "Sibilos", opcoes: [{ label: "0 — Ausentes", peso: 0 }, { label: "1 — Expiratórios", peso: 1 }, { label: "2 — Inspiratórios", peso: 2 }, { label: "3 — Silencioso", peso: 3 }] },
            { id: "retracao", tipo: "select", label: "Retracção", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Subcostal", peso: 1 }, { label: "2 — Intercostal", peso: 2 }, { label: "3 — Global", peso: 3 }] },
            { id: "entrada", tipo: "select", label: "Entrada de ar", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Diminuída", peso: 1 }, { label: "2 — Muito diminuída", peso: 2 }, { label: "3 — Ausente", peso: 3 }] },
            { id: "consciencia", tipo: "select", label: "Consciência", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Agitado", peso: 1 }, { label: "2 — Sonolento", peso: 2 }, { label: "3 — Coma", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "leve", classificacao: "Crise leve", nota: "Crise leve. Beta-2 agonista." },
            { faixa: [4, 7], status: "moderado", classificacao: "Crise moderada", nota: "⚠️ Crise moderada. Corticóide + oxigénio." },
            { faixa: [8, 12], status: "grave", classificacao: "Crise grave", nota: "⚠️ Crise grave. UCI. Considerar intubação." }
        ]
    },

    "Escala de Silverman-Andersen": {
        tipo: "escala",
        sinonimos: ["silverman", "desconforto respiratorio neonatal"],
        campos: [
            { id: "torax", tipo: "select", label: "Retracção torácica", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "intercostal", tipo: "select", label: "Retracção intercostal", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "xifoide", tipo: "select", label: "Retracção xifoide", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "narinas", tipo: "select", label: "Batimento nasal", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Mínimo", peso: 1 }, { label: "2 — Marcado", peso: 2 }] },
            { id: "gemido", tipo: "select", label: "Gemido", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Audível com estetoscópio", peso: 1 }, { label: "2 — Audível sem estetoscópio", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Leve", nota: "✅ Desconforto leve. Monitorizar." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderado", nota: "⚠️ Desconforto moderado. Considerar CPAP." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Desconforto grave. Suporte ventilatório urgente." }
        ]
    },

    "Escala de Downes (Croup)": {
        tipo: "escala",
        sinonimos: ["downes", "croup", "laringite"],
        campos: [
            { id: "estridor", tipo: "select", label: "Estridor", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Com agitação", peso: 1 }, { label: "2 — Em repouso", peso: 2 }] },
            { id: "retracao", tipo: "select", label: "Retracção", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Grave", peso: 3 }] },
            { id: "entrada", tipo: "select", label: "Entrada de ar", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Diminuída", peso: 1 }, { label: "2 — Muito diminuída", peso: 2 }] },
            { id: "cianose", tipo: "select", label: "Cianose", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Com agitação", peso: 1 }, { label: "2 — Em repouso", peso: 2 }] },
            { id: "consciencia", tipo: "select", label: "Consciência", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Alterada", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Leve" },
        interpretacao: [
            { faixa: [0, 2], status: "leve", classificacao: "Leve", nota: "Croup leve. Corticóide." },
            { faixa: [3, 5], status: "moderado", classificacao: "Moderado", nota: "⚠️ Croup moderado. Adrenalina nebulizada." },
            { faixa: [6, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Croup grave. UCI. Intubação." }
        ]
    },

    /* ====================================================================== */
    /* LOTE 7 — B. NEUROLOGIA (25 itens)                                       */
    /* ====================================================================== */

    "Glicose no LCR": {
        tipo: "exame",
        sinonimos: ["glicose lcr", "glicorraquia"],
        campos: [{ id: "valor", tipo: "input", label: "Glicose no LCR", unidade: "mg/dL", min: 0, max: 500 }],
        referencia: { min: 45, max: 80, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 44], status: "baixo", termo: "Hipoglicorraquia", nota: "⚠️ Glicose baixa no LCR. Sugere meningite bacteriana." },
            { faixa: [45, 80], status: "normal", termo: "Normal", nota: "✅ Glicose no LCR normal." },
            { faixa: [80.1, 500], status: "alto", termo: "Hiperglicorraquia", nota: "Glicose elevada no LCR. Considerar hiperglicemia." }
        ]
    },

    "Proteínas no LCR": {
        tipo: "exame",
        sinonimos: ["proteinas lcr", "proteinorraquia"],
        campos: [{ id: "valor", tipo: "input", label: "Proteínas no LCR", unidade: "mg/dL", min: 0, max: 1000 }],
        referencia: { min: 15, max: 45, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 14], status: "baixo", termo: "Baixa", nota: "Proteínas baixas no LCR. Raramente significativo." },
            { faixa: [15, 45], status: "normal", termo: "Normal", nota: "✅ Proteínas no LCR normais." },
            { faixa: [45.1, 100], status: "leve", termo: "Elevada", nota: "⚠️ Proteínas elevadas no LCR. Considerar meningite viral." },
            { faixa: [100.1, 1000], status: "grave", termo: "Muito elevada", nota: "⚠️ Proteínas muito elevadas. Meningite bacteriana ou Guillain-Barré." }
        ]
    },

    "Leucócitos no LCR": {
        tipo: "exame",
        sinonimos: ["leucocitos lcr", "celulas lcr", "pleocitose"],
        campos: [{ id: "valor", tipo: "input", label: "Leucócitos no LCR", unidade: "células/µL", min: 0, max: 5000 }],
        referencia: { min: 0, max: 5, unidade: "células/µL" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Normal", nota: "✅ Leucócitos no LCR normais." },
            { faixa: [5.1, 100], status: "leve", termo: "Pleocitose leve", nota: "⚠️ Pleocitose leve. Considerar meningite viral." },
            { faixa: [100.1, 1000], status: "moderado", termo: "Pleocitose moderada", nota: "⚠️ Pleocitose moderada. Meningite bacteriana ou viral." },
            { faixa: [1000.1, 5000], status: "grave", termo: "Pleocitose grave", nota: "⚠️ Pleocitose grave. Meningite bacteriana. Antibiótico urgente." }
        ]
    },

    "Neutrófilos no LCR": {
        tipo: "exame",
        sinonimos: ["neutrofilos lcr", "polimorfonucleares lcr"],
        campos: [{ id: "valor", tipo: "input", label: "Neutrófilos no LCR", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 0, max: 10, unidade: "%" },
        interpretacao: [
            { faixa: [0, 10], status: "normal", termo: "Normal", nota: "✅ Neutrófilos no LCR normais." },
            { faixa: [10.1, 50], status: "moderado", termo: "Elevados", nota: "⚠️ Neutrófilos elevados. Sugere meningite bacteriana." },
            { faixa: [50.1, 100], status: "grave", termo: "Muito elevados", nota: "⚠️ Neutrófilos muito elevados. Meningite bacteriana." }
        ]
    },

    "Linfócitos no LCR": {
        tipo: "exame",
        sinonimos: ["linfocitos lcr", "mononucleares lcr"],
        campos: [{ id: "valor", tipo: "input", label: "Linfócitos no LCR", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 40, max: 80, unidade: "%" },
        interpretacao: [
            { faixa: [0, 39], status: "baixo", termo: "Baixos", nota: "Linfócitos baixos no LCR. Considerar meningite bacteriana." },
            { faixa: [40, 80], status: "normal", termo: "Normal", nota: "✅ Linfócitos no LCR normais." },
            { faixa: [80.1, 100], status: "alto", termo: "Elevados", nota: "⚠️ Linfócitos elevados. Sugere meningite viral ou tuberculosa." }
        ]
    },

    "Adenosina Deaminase (ADA) no LCR": {
        tipo: "exame",
        sinonimos: ["ada lcr", "adenosina deaminase lcr"],
        campos: [{ id: "valor", tipo: "input", label: "ADA no LCR", unidade: "U/L", min: 0, max: 100 }],
        referencia: { min: 0, max: 5, unidade: "U/L" },
        interpretacao: [
            { faixa: [0, 5], status: "normal", termo: "Normal", nota: "✅ ADA no LCR normal." },
            { faixa: [5.1, 10], status: "leve", termo: "Elevada", nota: "⚠️ ADA elevada. Considerar meningite tuberculosa." },
            { faixa: [10.1, 100], status: "alto", termo: "Muito elevada", nota: "⚠️ ADA muito elevada. Meningite tuberculosa provável." }
        ]
    },

    "Pressão de Abertura do LCR": {
        tipo: "exame",
        sinonimos: ["pressao lcr", "pressao abertura lcr"],
        campos: [{ id: "valor", tipo: "input", label: "Pressão de Abertura", unidade: "cmH2O", min: 0, max: 60 }],
        referencia: { min: 6, max: 20, unidade: "cmH2O" },
        interpretacao: [
            { faixa: [0, 5.9], status: "baixo", termo: "Baixa", nota: "Pressão baixa. Considerar hipotensão intracraniana." },
            { faixa: [6, 20], status: "normal", termo: "Normal", nota: "✅ Pressão normal." },
            { faixa: [20.1, 40], status: "moderado", termo: "Elevada", nota: "⚠️ Pressão elevada. Considerar hipertensão intracraniana." },
            { faixa: [40.1, 60], status: "grave", termo: "Muito elevada", nota: "⚠️ Pressão muito elevada. Risco de herniação. Tratar urgente." }
        ]
    },

    "Proteína Básica da Mielina (MBP)": {
        tipo: "exame",
        sinonimos: ["mbp", "proteina basica mielina"],
        campos: [{ id: "valor", tipo: "input", label: "MBP", unidade: "ng/mL", min: 0, max: 50 }],
        referencia: { min: 0, max: 4, unidade: "ng/mL" },
        interpretacao: [
            { faixa: [0, 4], status: "normal", termo: "Normal", nota: "✅ MBP normal." },
            { faixa: [4.1, 50], status: "alto", termo: "Elevada", nota: "⚠️ MBP elevada. Sugere desmielinização activa." }
        ]
    },

    "Bandas Oligoclonais (LCR)": {
        tipo: "exame",
        sinonimos: ["bandas oligoclonais", "oligoclonal bands"],
        campos: [{ id: "resultado", tipo: "select", label: "Bandas Oligoclonais", opcoes: [{ label: "Negativo", valor: "Negativo" }, { label: "Positivo", valor: "Positivo" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Negativo" }, status: "negativo", termo: "Negativo", classificacao: "Negativo", nota: "✅ Bandas oligoclonais negativas." },
            { padrao: { resultado: "Positivo" }, status: "positivo", termo: "Positivo", classificacao: "Positivo", nota: "⚠️ Bandas oligoclonais positivas. Sugere esclerose múltipla." }
        ]
    },

    "IgG Index (LCR)": {
        tipo: "escala",
        sinonimos: ["igg index", "indice igg lcr"],
        campos: [
            { id: "igg_lcr", tipo: "input", label: "IgG no LCR", unidade: "mg/dL", min: 0, max: 100 },
            { id: "igg_soro", tipo: "input", label: "IgG no soro", unidade: "mg/dL", min: 0, max: 5000 },
            { id: "alb_lcr", tipo: "input", label: "Albumina no LCR", unidade: "mg/dL", min: 0, max: 500 },
            { id: "alb_soro", tipo: "input", label: "Albumina no soro", unidade: "mg/dL", min: 0, max: 10000 }
        ],
        calculo: { formula: "(igg_lcr / igg_soro) / (alb_lcr / alb_soro)", mostrarFormula: "(IgG LCR/IgG soro) / (Alb LCR/Alb soro)" },
        referencia: { min: 0, max: 0.7, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0.7], status: "bom", classificacao: "Normal", nota: "✅ IgG index normal." },
            { faixa: [0.71, 2], status: "moderado", classificacao: "Elevado", nota: "⚠️ IgG index elevado. Sugere síntese intratecal (EM)." },
            { faixa: [2.01, 20], status: "grave", classificacao: "Muito elevado", nota: "⚠️ IgG index muito elevado. Esclerose múltipla provável." }
        ]
    },

    "EEG (Eletroencefalograma)": {
        tipo: "exame",
        sinonimos: ["eeg", "eletroencefalograma"],
        campos: [{ id: "resultado", tipo: "select", label: "EEG", opcoes: [{ label: "Normal", valor: "Normal" }, { label: "Alterações inespecíficas", valor: "Alterações inespecíficas" }, { label: "Descargas epileptiformes", valor: "Descargas epileptiformes" }, { label: "Estado de mal epiléptico", valor: "Estado de mal epiléptico" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Normal" }, status: "negativo", termo: "Normal", classificacao: "Normal", nota: "✅ EEG normal." },
            { padrao: { resultado: "Alterações inespecíficas" }, status: "leve", termo: "Inespecífico", classificacao: "Alterações inespecíficas", nota: "Alterações inespecíficas. Correlacionar clínica." },
            { padrao: { resultado: "Descargas epileptiformes" }, status: "grave", termo: "Epileptiforme", classificacao: "Descargas epileptiformes", nota: "⚠️ Descargas epileptiformes. Epilepsia. Anticonvulsivante." },
            { padrao: { resultado: "Estado de mal epiléptico" }, status: "muito_grave", termo: "Emergência", classificacao: "Estado de mal epiléptico", nota: "⚠️ ESTADO DE MAL EPILÉPTICO! Emergência. Benzodiazepina IV." }
        ]
    },

    "Tomografia Computadorizada (TC) Craniana": {
        tipo: "exame",
        sinonimos: ["tc craniana", "tc cranio", "tomografia cranio"],
        campos: [{ id: "resultado", tipo: "select", label: "TC Craniana", opcoes: [{ label: "Normal", valor: "Normal" }, { label: "Isquemia", valor: "Isquemia" }, { label: "Hemorragia", valor: "Hemorragia" }, { label: "Tumor", valor: "Tumor" }, { label: "Hidrocefalia", valor: "Hidrocefalia" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Normal" }, status: "negativo", termo: "Normal", classificacao: "Normal", nota: "✅ TC craniana normal." },
            { padrao: { resultado: "Isquemia" }, status: "grave", termo: "Isquemia", classificacao: "AVC isquémico", nota: "⚠️ Isquemia cerebral. AVC isquémico. Trombólise se janela." },
            { padrao: { resultado: "Hemorragia" }, status: "muito_grave", termo: "Hemorragia", classificacao: "AVC hemorrágico", nota: "⚠️ Hemorragia cerebral. UCI. Reverter anticoagulação." },
            { padrao: { resultado: "Tumor" }, status: "grave", termo: "Tumor", classificacao: "Neoplasia", nota: "⚠️ Tumor cerebral. Neurocirurgia/oncologia." },
            { padrao: { resultado: "Hidrocefalia" }, status: "grave", termo: "Hidrocefalia", classificacao: "Hidrocefalia", nota: "⚠️ Hidrocefalia. Considerar derivação ventricular." }
        ]
    },

    "Ressonância Magnética (RM) Craniana": {
        tipo: "exame",
        sinonimos: ["rm craniana", "ressonancia cranio", "rm cranio"],
        campos: [{ id: "resultado", tipo: "select", label: "RM Craniana", opcoes: [{ label: "Normal", valor: "Normal" }, { label: "Lesões desmielinizantes", valor: "Lesões desmielinizantes" }, { label: "Isquemia", valor: "Isquemia" }, { label: "Tumor", valor: "Tumor" }, { label: "Atrofia", valor: "Atrofia" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Normal" }, status: "negativo", termo: "Normal", classificacao: "Normal", nota: "✅ RM craniana normal." },
            { padrao: { resultado: "Lesões desmielinizantes" }, status: "grave", termo: "Desmielinização", classificacao: "Esclerose múltipla", nota: "⚠️ Lesões desmielinizantes. Esclerose múltipla provável." },
            { padrao: { resultado: "Isquemia" }, status: "grave", termo: "Isquemia", classificacao: "AVC isquémico", nota: "⚠️ Isquemia cerebral. AVC isquémico." },
            { padrao: { resultado: "Tumor" }, status: "grave", termo: "Tumor", classificacao: "Neoplasia", nota: "⚠️ Tumor cerebral. Neurocirurgia." },
            { padrao: { resultado: "Atrofia" }, status: "moderado", termo: "Atrofia", classificacao: "Atrofia cerebral", nota: "Atrofia cerebral. Considerar demência." }
        ]
    },

    "Escala de Rankin Modificada": {
        tipo: "escala",
        sinonimos: ["rankin", "rankin modificada", "mrs"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "0 — Sem sintomas", peso: 0 }, { label: "1 — Sem incapacidade significativa", peso: 1 }, { label: "2 — Incapacidade leve", peso: 2 }, { label: "3 — Incapacidade moderada", peso: 3 }, { label: "4 — Incapacidade moderada-grave", peso: 4 }, { label: "5 — Incapacidade grave", peso: 5 }, { label: "6 — Morte", peso: 6 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Bom" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Bom", nota: "✅ Sem incapacidade significativa." },
            { faixa: [2, 2], status: "leve", classificacao: "Incapacidade leve", nota: "Incapacidade leve. Independente." },
            { faixa: [3, 3], status: "moderado", classificacao: "Incapacidade moderada", nota: "⚠️ Incapacidade moderada. Necessita ajuda." },
            { faixa: [4, 5], status: "grave", classificacao: "Incapacidade grave", nota: "⚠️ Incapacidade grave. Dependente." },
            { faixa: [6, 6], status: "muito_grave", classificacao: "Morte", nota: "⚠️ Óbito." }
        ]
    },

    "Escala de Hunt-Hess (HSA)": {
        tipo: "escala",
        sinonimos: ["hunt hess", "hemorragia subaracnoideia"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "I — Assintomático", peso: 1 }, { label: "II — Cefaleia moderada", peso: 2 }, { label: "III — Sonolência/confusão", peso: 3 }, { label: "IV — Estupor", peso: 4 }, { label: "V — Coma", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Bom" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Bom prognóstico", nota: "✅ Bom prognóstico cirúrgico." },
            { faixa: [3, 3], status: "moderado", classificacao: "Prognóstico reservado", nota: "⚠️ Prognóstico reservado." },
            { faixa: [4, 5], status: "grave", classificacao: "Mau prognóstico", nota: "⚠️ Mau prognóstico. Alta mortalidade." }
        ]
    },

    "Escala de Fisher (HSA)": {
        tipo: "escala",
        sinonimos: ["fisher", "hemorragia subaracnoideia fisher"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "1 — Sem sangue", peso: 1 }, { label: "2 — Lâmina <1mm", peso: 2 }, { label: "3 — Coágulo >1mm", peso: 3 }, { label: "4 — Hemorragia intraventricular", peso: 4 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Baixo risco" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Baixo risco de vasoespasmo", nota: "✅ Baixo risco de vasoespasmo." },
            { faixa: [3, 3], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado de vasoespasmo." },
            { faixa: [4, 4], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de vasoespasmo. Nimodipino." }
        ]
    },

    "WFNS (HSA)": {
        tipo: "escala",
        sinonimos: ["wfns", "hsa wfns"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "I — GCS 15 sem défice", peso: 1 }, { label: "II — GCS 13-14 sem défice", peso: 2 }, { label: "III — GCS 13-14 com défice", peso: 3 }, { label: "IV — GCS 7-12", peso: 4 }, { label: "V — GCS 3-6", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Bom" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Bom prognóstico", nota: "✅ Bom prognóstico." },
            { faixa: [3, 3], status: "moderado", classificacao: "Prognóstico reservado", nota: "⚠️ Prognóstico reservado." },
            { faixa: [4, 5], status: "grave", classificacao: "Mau prognóstico", nota: "⚠️ Mau prognóstico. UCI." }
        ]
    },

    "NIHSS (AVC)": {
        tipo: "escala",
        sinonimos: ["nihss", "avc", "stroke"],
        campos: [
            { id: "consciencia", tipo: "select", label: "Nível de consciência", opcoes: [{ label: "0 — Alerta", peso: 0 }, { label: "1 — Sonolento", peso: 1 }, { label: "2 — Estuporoso", peso: 2 }, { label: "3 — Coma", peso: 3 }] },
            { id: "ocular", tipo: "select", label: "Movimento ocular", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Parcial", peso: 1 }, { label: "2 — Desvio forçado", peso: 2 }] },
            { id: "visual", tipo: "select", label: "Campo visual", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Hemianopsia parcial", peso: 1 }, { label: "2 — Hemianopsia completa", peso: 2 }, { label: "3 — Cegueira bilateral", peso: 3 }] },
            { id: "facial", tipo: "select", label: "Paralisia facial", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Completa", peso: 3 }] },
            { id: "motora_braco", tipo: "select", label: "Motor braço", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Grave", peso: 3 }, { label: "4 — Completa", peso: 4 }] },
            { id: "motora_perna", tipo: "select", label: "Motor perna", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Grave", peso: 3 }, { label: "4 — Completa", peso: 4 }] },
            { id: "ataxia", tipo: "select", label: "Ataxia", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Presente 1 membro", peso: 1 }, { label: "2 — Presente 2 membros", peso: 2 }] },
            { id: "sensorial", tipo: "select", label: "Sensibilidade", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "linguagem", tipo: "select", label: "Linguagem", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }, { label: "3 — Mudo", peso: 3 }] },
            { id: "disartria", tipo: "select", label: "Disartria", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "extincao", tipo: "select", label: "Extinção/negligência", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 4, label: "Leve" },
        interpretacao: [
            { faixa: [0, 4], status: "leve", classificacao: "AVC leve", nota: "AVC leve. Considerar trombólise." },
            { faixa: [5, 15], status: "moderado", classificacao: "AVC moderado", nota: "⚠️ AVC moderado. Trombólise se janela." },
            { faixa: [16, 20], status: "grave", classificacao: "AVC grave", nota: "⚠️ AVC grave. Trombectomia/UTI." },
            { faixa: [21, 42], status: "muito_grave", classificacao: "AVC muito grave", nota: "⚠️ AVC muito grave. Cuidados intensivos." }
        ]
    },

    "Escala de Cincinnati (AVC)": {
        tipo: "escala",
        sinonimos: ["cincinnati", "avc pre hospitalar"],
        campos: [
            { id: "facial", tipo: "select", label: "Assimetria facial", opcoes: [{ label: "Normal", peso: 0 }, { label: "Assimétrico", peso: 1 }] },
            { id: "braco", tipo: "select", label: "Queda do braço", opcoes: [{ label: "Normal", peso: 0 }, { label: "Queda", peso: 1 }] },
            { id: "fala", tipo: "select", label: "Fala alterada", opcoes: [{ label: "Normal", peso: 0 }, { label: "Alterada", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Normal", nota: "✅ Sem sinais de AVC." },
            { faixa: [1, 3], status: "grave", classificacao: "Suspeita de AVC", nota: "⚠️ Suspeita de AVC. Activar código AVC. TC urgente." }
        ]
    },

    "Escala de Coma de Glasgow": {
        tipo: "escala",
        sinonimos: ["glasgow", "gcs", "coma"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Dor)", peso: 2 }, { label: "3 (Comando verbal)", peso: 3 }, { label: "4 (Espontânea)", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Sons)", peso: 2 }, { label: "3 (Palavras)", peso: 3 }, { label: "4 (Confuso)", peso: 4 }, { label: "5 (Orientado)", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Extensão)", peso: 2 }, { label: "3 (Flexão)", peso: 3 }, { label: "4 (Retirada)", peso: 4 }, { label: "5 (Localiza)", peso: 5 }, { label: "6 (Obedece)", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve. Observação. Reavaliar a cada 4h." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "Lesão cerebral moderada. Internação/TC. Risco de deterioração." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO CEREBRAL GRAVE! UCI/Intubação. Proteger via aérea." }
        ]
    },

    "GCS-P (Glasgow + Pupilas)": {
        tipo: "escala",
        sinonimos: ["gcs p", "glasgow pupilas"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] },
            { id: "pupilas", tipo: "select", label: "Reactividade Pupilar", opcoes: [{ label: "2 — Ambas reactivas", peso: 0 }, { label: "1 — Uma reactiva", peso: -1 }, { label: "0 — Nenhuma reactiva", peso: -2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada. TC urgente." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI/Intubação." }
        ]
    },

    "Escala de FOUR": {
        tipo: "escala",
        sinonimos: ["four", "escala four", "coma four"],
        campos: [
            { id: "ocular", tipo: "select", label: "Resposta Ocular", opcoes: [{ label: "0 (Nenhuma)", peso: 0 }, { label: "1 (Pálpebras fechadas)", peso: 1 }, { label: "2 (Abertura sem estímulo)", peso: 2 }, { label: "3 (Abertura com estímulo)", peso: 3 }, { label: "4 (Olhar dirigido)", peso: 4 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "0 (Nenhuma)", peso: 0 }, { label: "1 (Extensão)", peso: 1 }, { label: "2 (Flexão)", peso: 2 }, { label: "3 (Localiza)", peso: 3 }, { label: "4 (Obedece)", peso: 4 }] },
            { id: "tronco", tipo: "select", label: "Reflexos do Tronco", opcoes: [{ label: "0 (Ausentes)", peso: 0 }, { label: "1 (Pupilar e corneano)", peso: 1 }, { label: "2 (Pupilar)", peso: 2 }, { label: "3 (Corneano)", peso: 3 }, { label: "4 (Presentes)", peso: 4 }] },
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 (Apneia)", peso: 0 }, { label: "1 (Respiração irregular)", peso: 1 }, { label: "2 (Respiração regular)", peso: 2 }, { label: "3 (Respiração de Cheyne-Stokes)", peso: 3 }, { label: "4 (Respiração normal)", peso: 4 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 16, label: "Normal" },
        interpretacao: [
            { faixa: [13, 16], status: "bom", classificacao: "Normal", nota: "✅ Função neurológica preservada." },
            { faixa: [9, 12], status: "moderado", classificacao: "Compromisso moderado", nota: "⚠️ Compromisso neurológico moderado. Monitorizar." },
            { faixa: [5, 8], status: "grave", classificacao: "Compromisso grave", nota: "⚠️ Compromisso grave. UCI." },
            { faixa: [0, 4], status: "muito_grave", classificacao: "Muito grave", nota: "⚠️ MUITO GRAVE! Morte cerebral iminente. UCI urgente." }
        ]
    },

    "Escala de Ramsay (Sedação)": {
        tipo: "escala",
        sinonimos: ["ramsay", "sedacao"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "1 — Ansioso", peso: 1 }, { label: "2 — Cooperante", peso: 2 }, { label: "3 — Responde a comandos", peso: 3 }, { label: "4 — Resposta rápida", peso: 4 }, { label: "5 — Resposta lenta", peso: 5 }, { label: "6 — Sem resposta", peso: 6 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 2, max: 4, label: "Adequado" },
        interpretacao: [
            { faixa: [1, 1], status: "leve", classificacao: "Ansioso", nota: "Ansioso. Considerar sedação." },
            { faixa: [2, 4], status: "bom", classificacao: "Adequado", nota: "✅ Sedação adequada." },
            { faixa: [5, 6], status: "grave", classificacao: "Excessiva", nota: "⚠️ Sedação excessiva. Reduzir sedativo." }
        ]
    },

    "RASS (Richmond Agitation-Sedation Scale)": {
        tipo: "escala",
        sinonimos: ["rass", "agitacao sedacao"],
        campos: [{ id: "valor", tipo: "select", label: "Nível", opcoes: [{ label: "+4 — Combativo", peso: -4 }, { label: "+3 — Muito agitado", peso: -3 }, { label: "+2 — Agitado", peso: -2 }, { label: "+1 — Inquieto", peso: -1 }, { label: "0 — Alerta e calmo", peso: 0 }, { label: "-1 — Sonolento", peso: 1 }, { label: "-2 — Sedação leve", peso: 2 }, { label: "-3 — Sedação moderada", peso: 3 }, { label: "-4 — Sedação profunda", peso: 4 }, { label: "-5 — Não despertável", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Alerta" },
        interpretacao: [
            { faixa: [-4, -4], status: "grave", classificacao: "Combativo", nota: "⚠️ Combativo. Risco para o doente. Sedar." },
            { faixa: [-3, -1], status: "leve", classificacao: "Agitado", nota: "Agitado. Considerar contenção/sedação." },
            { faixa: [0, 0], status: "bom", classificacao: "Alerta e calmo", nota: "✅ Alerta e calmo." },
            { faixa: [1, 2], status: "leve", classificacao: "Sonolento", nota: "Sonolento. Aceitável em UCI." },
            { faixa: [3, 5], status: "grave", classificacao: "Sedação profunda", nota: "⚠️ Sedação profunda. Avaliar necessidade." }
        ]
    },

    "CAM-ICU (Delirium)": {
        tipo: "escala",
        sinonimos: ["cam icu", "delirium"],
        campos: [
            { id: "inicio", tipo: "select", label: "Início agudo/curso flutuante", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "atencao", tipo: "select", label: "Desatenção", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "consciencia", tipo: "select", label: "Alteração do nível de consciência", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pensamento", tipo: "select", label: "Pensamento desorganizado", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Negativo" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Negativo", nota: "✅ Sem delirium." },
            { faixa: [1, 4], status: "grave", classificacao: "Positivo", nota: "⚠️ Delirium positivo. Tratar causa e ambiente." }
        ]
    },

    "Escala de Coma de Jouvet": {
        tipo: "escala",
        sinonimos: ["jouvet", "coma jouvet"],
        campos: [
            { id: "vigilancia", tipo: "select", label: "Vigilância", opcoes: [{ label: "0 — Coma profundo", peso: 0 }, { label: "1 — Coma", peso: 1 }, { label: "2 — Sonolência", peso: 2 }, { label: "3 — Vigil", peso: 3 }] },
            { id: "orientacao", tipo: "select", label: "Orientação", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Confuso", peso: 1 }, { label: "2 — Orientado", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 4, max: 5, label: "Normal" },
        interpretacao: [
            { faixa: [4, 5], status: "bom", classificacao: "Normal", nota: "✅ Vigil e orientado." },
            { faixa: [2, 3], status: "moderado", classificacao: "Compromisso moderado", nota: "⚠️ Compromisso moderado. Monitorizar." },
            { faixa: [0, 1], status: "grave", classificacao: "Coma", nota: "⚠️ Coma. UCI." }
        ]
    },

    "Índice de Barthel (AVD)": {
        tipo: "escala",
        sinonimos: ["barthel", "atividades vida diaria"],
        campos: [
            { id: "alimentacao", tipo: "select", label: "Alimentação", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] },
            { id: "banho", tipo: "select", label: "Banho", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Independente", peso: 5 }] },
            { id: "vestir", tipo: "select", label: "Vestir", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] },
            { id: "higiene", tipo: "select", label: "Higiene pessoal", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Independente", peso: 5 }] },
            { id: "intestino", tipo: "select", label: "Controlo intestinal", opcoes: [{ label: "0 — Incontinente", peso: 0 }, { label: "5 — Ocasional", peso: 5 }, { label: "10 — Continente", peso: 10 }] },
            { id: "bexiga", tipo: "select", label: "Controlo vesical", opcoes: [{ label: "0 — Incontinente", peso: 0 }, { label: "5 — Ocasional", peso: 5 }, { label: "10 — Continente", peso: 10 }] },
            { id: "wc", tipo: "select", label: "Uso do WC", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] },
            { id: "transferencia", tipo: "select", label: "Transferência", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Ajuda mínima", peso: 10 }, { label: "15 — Independente", peso: 15 }] },
            { id: "mobilidade", tipo: "select", label: "Mobilidade", opcoes: [{ label: "0 — Imóvel", peso: 0 }, { label: "5 — Cadeira de rodas", peso: 5 }, { label: "10 — Anda com ajuda", peso: 10 }, { label: "15 — Independente", peso: 15 }] },
            { id: "escadas", tipo: "select", label: "Escadas", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 100, max: 100, label: "Independente" },
        interpretacao: [
            { faixa: [0, 20], status: "muito_grave", classificacao: "Dependência total", nota: "⚠️ Dependência total. Cuidados continuados." },
            { faixa: [21, 60], status: "grave", classificacao: "Dependência grave", nota: "⚠️ Dependência grave. Reabilitação intensiva." },
            { faixa: [61, 90], status: "moderado", classificacao: "Dependência moderada", nota: "⚠️ Dependência moderada. Apoio." },
            { faixa: [91, 99], status: "leve", classificacao: "Dependência leve", nota: "Dependência leve." },
            { faixa: [100, 100], status: "bom", classificacao: "Independente", nota: "✅ Independente." }
        ]
    },

    "Índice de Katz (AVD)": {
        tipo: "escala",
        sinonimos: ["katz", "atividades vida diaria katz"],
        campos: [
            { id: "banho", tipo: "select", label: "Banho", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "vestir", tipo: "select", label: "Vestir", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "wc", tipo: "select", label: "Uso do WC", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "transferencia", tipo: "select", label: "Transferência", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "continencia", tipo: "select", label: "Continência", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "alimentacao", tipo: "select", label: "Alimentação", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 6, max: 6, label: "Independente" },
        interpretacao: [
            { faixa: [0, 2], status: "grave", classificacao: "Dependência grave", nota: "⚠️ Dependência grave. Cuidados continuados." },
            { faixa: [3, 4], status: "moderado", classificacao: "Dependência moderada", nota: "⚠️ Dependência moderada. Apoio." },
            { faixa: [5, 5], status: "leve", classificacao: "Dependência leve", nota: "Dependência leve." },
            { faixa: [6, 6], status: "bom", classificacao: "Independente", nota: "✅ Independente." }
        ]
    },

    "Escala de Lawton (AIVD)": {
        tipo: "escala",
        sinonimos: ["lawton", "atividades instrumentais"],
        campos: [
            { id: "telefone", tipo: "select", label: "Usar telefone", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "compras", tipo: "select", label: "Fazer compras", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "comida", tipo: "select", label: "Preparar comida", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "casa", tipo: "select", label: "Trabalhos domésticos", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "lavandaria", tipo: "select", label: "Lavar roupa", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "transporte", tipo: "select", label: "Transporte", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "medicacao", tipo: "select", label: "Gerir medicação", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "financas", tipo: "select", label: "Gerir finanças", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 8, max: 8, label: "Independente" },
        interpretacao: [
            { faixa: [0, 3], status: "grave", classificacao: "Dependência grave", nota: "⚠️ Dependência grave." },
            { faixa: [4, 5], status: "moderado", classificacao: "Dependência moderada", nota: "⚠️ Dependência moderada." },
            { faixa: [6, 7], status: "leve", classificacao: "Dependência leve", nota: "Dependência leve." },
            { faixa: [8, 8], status: "bom", classificacao: "Independente", nota: "✅ Independente." }
        ]
    },

    "Escala de Coma de Adelaide": {
        tipo: "escala",
        sinonimos: ["adelaide", "coma adelaide"],
        campos: [
            { id: "ocular", tipo: "select", label: "Ocular", opcoes: [{ label: "1 — Nenhuma", peso: 1 }, { label: "2 — À dor", peso: 2 }, { label: "3 — À voz", peso: 3 }, { label: "4 — Espontânea", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Verbal", opcoes: [{ label: "1 — Nenhuma", peso: 1 }, { label: "2 — Sons", peso: 2 }, { label: "3 — Palavras", peso: 3 }, { label: "4 — Confuso", peso: 4 }, { label: "5 — Orientado", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Motora", opcoes: [{ label: "1 — Nenhuma", peso: 1 }, { label: "2 — Extensão", peso: 2 }, { label: "3 — Flexão", peso: 3 }, { label: "4 — Retirada", peso: 4 }, { label: "5 — Localiza", peso: 5 }, { label: "6 — Obedece", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI." }
        ]
    },

    "Escala de Coma de Glasgow Pediátrica": {
        tipo: "escala",
        sinonimos: ["glasgow pediatrico", "gcs pediatrico"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Dor)", peso: 2 }, { label: "3 (Voz)", peso: 3 }, { label: "4 (Espontânea)", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Gemidos)", peso: 2 }, { label: "3 (Choro inconsolável)", peso: 3 }, { label: "4 (Choro consolável)", peso: 4 }, { label: "5 (Palavras/Sorriso)", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Extensão)", peso: 2 }, { label: "3 (Flexão)", peso: 3 }, { label: "4 (Retirada)", peso: 4 }, { label: "5 (Localiza)", peso: 5 }, { label: "6 (Obedece)", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão cerebral moderada. Internação." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO CEREBRAL GRAVE! UCI." }
        ]
    },




    /* ====================================================================== */
    /* LOTE 8 — A. OBSTETRÍCIA (18 itens)                                      */
    /* ====================================================================== */

    "Idade Gestacional (DUM)": {
        tipo: "escala",
        sinonimos: ["idade gestacional", "dum", "semanas gestacao"],
        campos: [{ id: "dias", tipo: "input", label: "Dias desde DUM", unidade: "dias", min: 0, max: 300 }],
        calculo: { formula: "Math.floor(dias / 7)", mostrarFormula: "semanas = dias / 7" },
        referencia: { min: 37, max: 42, label: "Termo" },
        interpretacao: [
            { faixa: [0, 22], status: "baixo", classificacao: "Viabilidade incerta", nota: "⚠️ Idade gestacional muito precoce. Viabilidade incerta." },
            { faixa: [23, 36], status: "moderado", classificacao: "Pré-termo", nota: "⚠️ Pré-termo. Avaliar maturidade fetal." },
            { faixa: [37, 42], status: "bom", classificacao: "Termo", nota: "✅ Gravidez a termo." },
            { faixa: [42.1, 50], status: "alto", classificacao: "Pós-termo", nota: "⚠️ Pós-termo. Avaliar indução." }
        ]
    },

    "Peso Fetal Estimado (PFE)": {
        tipo: "exame",
        sinonimos: ["peso fetal", "pfe", "estimativa peso fetal"],
        campos: [{ id: "valor", tipo: "input", label: "Peso Fetal Estimado", unidade: "g", min: 0, max: 6000 }],
        referencia: { min: 2500, max: 4000, unidade: "g" },
        interpretacao: [
            { faixa: [0, 2499], status: "baixo", termo: "Baixo peso", nota: "⚠️ Baixo peso fetal. Considerar restrição de crescimento." },
            { faixa: [2500, 4000], status: "normal", termo: "Normal", nota: "✅ Peso fetal adequado." },
            { faixa: [4000.1, 6000], status: "alto", termo: "Macrossomia", nota: "⚠️ Macrossomia fetal. Risco de distócia de ombros." }
        ]
    },

    "Altura Uterina": {
        tipo: "exame",
        sinonimos: ["altura uterina", "au"],
        campos: [{ id: "valor", tipo: "input", label: "Altura Uterina", unidade: "cm", min: 0, max: 60 }],
        referencia: { min: 20, max: 35, unidade: "cm" },
        interpretacao: [
            { faixa: [0, 19], status: "baixo", termo: "Baixa", nota: "⚠️ Altura uterina baixa. Considerar restrição de crescimento." },
            { faixa: [20, 35], status: "normal", termo: "Normal", nota: "✅ Altura uterina normal." },
            { faixa: [35.1, 60], status: "alto", termo: "Elevada", nota: "⚠️ Altura uterina elevada. Considerar polihidrâmnios ou macrossomia." }
        ]
    },

    "Líquido Amniótico (ILA)": {
        tipo: "exame",
        sinonimos: ["ila", "indice liquido amniotico"],
        campos: [{ id: "valor", tipo: "input", label: "ILA", unidade: "cm", min: 0, max: 40 }],
        referencia: { min: 8, max: 18, unidade: "cm" },
        interpretacao: [
            { faixa: [0, 4.9], status: "grave", termo: "Oligohidrâmnios", nota: "⚠️ Oligohidrâmnios grave. Risco de compressão do cordão." },
            { faixa: [5, 7.9], status: "leve", termo: "Oligohidrâmnios", nota: "⚠️ Oligohidrâmnios. Hidratação e monitorização." },
            { faixa: [8, 18], status: "normal", termo: "Normal", nota: "✅ ILA normal." },
            { faixa: [18.1, 24], status: "leve", termo: "Polihidrâmnios", nota: "⚠️ Polihidrâmnios. Investigar diabetes." },
            { faixa: [24.1, 40], status: "grave", termo: "Polihidrâmnios grave", nota: "⚠️ Polihidrâmnios grave. Risco de parto pré-termo." }
        ]
    },

    "Bishop (Indução)": {
        tipo: "escala",
        sinonimos: ["bishop", "inducao parto"],
        campos: [
            { id: "dilatacao", tipo: "select", label: "Dilatação", opcoes: [{ label: "0 — Fechado", peso: 0 }, { label: "1 — 1-2 cm", peso: 1 }, { label: "2 — 3-4 cm", peso: 2 }, { label: "3 — ≥5 cm", peso: 3 }] },
            { id: "apagamento", tipo: "select", label: "Apagamento", opcoes: [{ label: "0 — 0-30%", peso: 0 }, { label: "1 — 40-50%", peso: 1 }, { label: "2 — 60-70%", peso: 2 }, { label: "3 — ≥80%", peso: 3 }] },
            { id: "estacao", tipo: "select", label: "Estação", opcoes: [{ label: "0 — -3", peso: 0 }, { label: "1 — -2", peso: 1 }, { label: "2 — -1/0", peso: 2 }, { label: "3 — +1/+2", peso: 3 }] },
            { id: "consistencia", tipo: "select", label: "Consistência", opcoes: [{ label: "0 — Firme", peso: 0 }, { label: "1 — Média", peso: 1 }, { label: "2 — Mole", peso: 2 }] },
            { id: "posicao", tipo: "select", label: "Posição", opcoes: [{ label: "0 — Posterior", peso: 0 }, { label: "1 — Média", peso: 1 }, { label: "2 — Anterior", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 8, max: 13, label: "Favorável" },
        interpretacao: [
            { faixa: [0, 5], status: "baixo", classificacao: "Desfavorável", nota: "⚠️ Bishop desfavorável. Considerar amadurecimento cervical." },
            { faixa: [6, 7], status: "moderado", classificacao: "Intermédio", nota: "Bishop intermédio. Indução possível." },
            { faixa: [8, 13], status: "bom", classificacao: "Favorável", nota: "✅ Bishop favorável. Indução com sucesso provável." }
        ]
    },

    "Teste de O'Sullivan (50g)": {
        tipo: "exame",
        sinonimos: ["osullivan", "teste 50g", "rastreio diabetes gestacional"],
        campos: [{ id: "valor", tipo: "input", label: "Glicemia 1h", unidade: "mg/dL", min: 0, max: 300 }],
        referencia: { min: 0, max: 140, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 140], status: "normal", termo: "Normal", nota: "✅ Rastreio normal." },
            { faixa: [140.1, 300], status: "alto", termo: "Alterado", nota: "⚠️ Rastreio alterado. Realizar TTGO 100g." }
        ]
    },

    "TTGO 100g (Diabetes Gestacional)": {
        tipo: "escala",
        sinonimos: ["ttgo 100g", "diabetes gestacional"],
        campos: [
            { id: "jejum", tipo: "input", label: "Jejum", unidade: "mg/dL", min: 0, max: 300 },
            { id: "h1", tipo: "input", label: "1 hora", unidade: "mg/dL", min: 0, max: 400 },
            { id: "h2", tipo: "input", label: "2 horas", unidade: "mg/dL", min: 0, max: 400 },
            { id: "h3", tipo: "input", label: "3 horas", unidade: "mg/dL", min: 0, max: 400 }
        ],
        calculo: { formula: "jejum + h1 + h2 + h3", mostrarFormula: "Soma dos valores" },
        referencia: { min: 0, max: 500, label: "Normal" },
        interpretacao: [
            { faixa: [0, 500], status: "bom", classificacao: "Normal", nota: "✅ Sem diabetes gestacional." },
            { faixa: [500.1, 800], status: "moderado", classificacao: "Alterado 1 valor", nota: "⚠️ Diabetes gestacional. Dieta e monitorização." },
            { faixa: [800.1, 1600], status: "grave", classificacao: "Alterado ≥2 valores", nota: "⚠️ Diabetes gestacional. Considerar insulina." }
        ]
    },

    "Hemoglobina (Grávida)": {
        tipo: "exame",
        sinonimos: ["hemoglobina gravida", "hb gestacao"],
        campos: [{ id: "valor", tipo: "input", label: "Hemoglobina", unidade: "g/dL", min: 0, max: 25 }],
        referencia: { min: 11, max: 14, unidade: "g/dL" },
        interpretacao: [
            { faixa: [0, 10.9], status: "baixo", termo: "Anemia gestacional", nota: "⚠️ Anemia na gravidez. Suplementar ferro e ácido fólico." },
            { faixa: [11, 14], status: "normal", termo: "Normal", nota: "✅ Hemoglobina normal." },
            { faixa: [14.1, 25], status: "alto", termo: "Elevada", nota: "⚠️ Hemoglobina elevada. Considerar desidratação." }
        ]
    },

    "Proteinúria (Grávida)": {
        tipo: "exame",
        sinonimos: ["proteinuria gravida", "proteinuria gestacao"],
        campos: [{ id: "valor", tipo: "input", label: "Proteinúria 24h", unidade: "mg/24h", min: 0, max: 10000 }],
        referencia: { min: 0, max: 300, unidade: "mg/24h" },
        interpretacao: [
            { faixa: [0, 300], status: "normal", termo: "Normal", nota: "✅ Sem proteinúria significativa." },
            { faixa: [300.1, 5000], status: "alto", termo: "Proteinúria", nota: "⚠️ Proteinúria significativa. Investigar pré-eclâmpsia." },
            { faixa: [5000.1, 10000], status: "grave", termo: "Proteinúria grave", nota: "⚠️ Proteinúria grave. Pré-eclâmpsia. Internar." }
        ]
    },

    "Ácido Úrico (Grávida)": {
        tipo: "exame",
        sinonimos: ["acido urico gravida", "urico gestacao"],
        campos: [{ id: "valor", tipo: "input", label: "Ácido Úrico", unidade: "mg/dL", min: 0, max: 20 }],
        referencia: { min: 2.4, max: 5.8, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 2.3], status: "baixo", termo: "Baixo", nota: "Ácido úrico baixo. Sem significado." },
            { faixa: [2.4, 5.8], status: "normal", termo: "Normal", nota: "✅ Ácido úrico normal." },
            { faixa: [5.9, 20], status: "alto", termo: "Elevado", nota: "⚠️ Ácido úrico elevado. Marcador de gravidade na pré-eclâmpsia." }
        ]
    },

    "Pré-Eclâmpsia (Classificação)": {
        tipo: "escala",
        sinonimos: ["pre eclampsia", "preeclampsia"],
        campos: [
            { id: "pa", tipo: "select", label: "PA", opcoes: [{ label: "Normal", peso: 0 }, { label: "≥140/90", peso: 1 }, { label: "≥160/110", peso: 2 }] },
            { id: "proteinuria", tipo: "select", label: "Proteinúria", opcoes: [{ label: "Ausente", peso: 0 }, { label: "300mg-3g", peso: 1 }, { label: ">3g", peso: 2 }] },
            { id: "sintomas", tipo: "select", label: "Sintomas graves", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Sem pré-eclâmpsia", nota: "✅ Sem pré-eclâmpsia." },
            { faixa: [1, 2], status: "moderado", classificacao: "Pré-eclâmpsia leve", nota: "⚠️ Pré-eclâmpsia leve. Monitorização rigorosa." },
            { faixa: [3, 6], status: "grave", classificacao: "Pré-eclâmpsia grave", nota: "⚠️ Pré-eclâmpsia grave. Internar. Considerar resolução." }
        ]
    },

    "Eclâmpsia (Diagnóstico)": {
        tipo: "escala",
        sinonimos: ["eclampsia"],
        campos: [
            { id: "convulsao", tipo: "select", label: "Convulsões", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pre_eclampsia", tipo: "select", label: "Pré-eclâmpsia prévia", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Sem eclâmpsia" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Sem eclâmpsia", nota: "✅ Sem eclâmpsia." },
            { faixa: [1, 2], status: "muito_grave", classificacao: "Eclâmpsia", nota: "⚠️ ECLÂMPSIA! Sulfato de magnésio IV urgente. UCI." }
        ]
    },

    "Sulfato de Magnésio (Nível)": {
        tipo: "exame",
        sinonimos: ["sulfato magnesio", "nivel magnesio terapeutico", "mgso4"],
        campos: [{ id: "valor", tipo: "input", label: "Magnésio Sérico", unidade: "mg/dL", min: 0, max: 15 }],
        referencia: { min: 4, max: 7, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 3.9], status: "baixo", termo: "Subterapêutico", nota: "Magnésio subterapêutico. Aumentar infusão." },
            { faixa: [4, 7], status: "normal", termo: "Terapêutico", nota: "✅ Nível terapêutico." },
            { faixa: [7.1, 10], status: "grave", termo: "Toxicidade", nota: "⚠️ Toxicidade por magnésio. Suspender. Gluconato de cálcio." },
            { faixa: [10.1, 15], status: "muito_grave", termo: "Toxicidade grave", nota: "⚠️ TOXICIDADE GRAVE! Risco de paragem respiratória. UCI." }
        ]
    },

    "CTG (Cardiotocografia)": {
        tipo: "exame",
        sinonimos: ["ctg", "cardiotocografia", "monitorizacao fetal"],
        campos: [{ id: "resultado", tipo: "select", label: "CTG", opcoes: [{ label: "Categoria I (Normal)", valor: "Categoria I" }, { label: "Categoria II (Intermédio)", valor: "Categoria II" }, { label: "Categoria III (Anormal)", valor: "Categoria III" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Categoria I" }, status: "negativo", termo: "Normal", classificacao: "Categoria I", nota: "✅ CTG normal. Monitorizar." },
            { padrao: { resultado: "Categoria II" }, status: "moderado", termo: "Intermédio", classificacao: "Categoria II", nota: "⚠️ CTG intermédio. Monitorização contínua." },
            { padrao: { resultado: "Categoria III" }, status: "grave", termo: "Anormal", classificacao: "Categoria III", nota: "⚠️ CTG anormal. Sofrimento fetal. Cesariana urgente." }
        ]
    },

    "Perfil Biofísico Fetal (PBF)": {
        tipo: "escala",
        sinonimos: ["pbf", "perfil biofisico fetal"],
        campos: [
            { id: "mov_resp", tipo: "select", label: "Movimentos respiratórios", opcoes: [{ label: "0 — Ausentes", peso: 0 }, { label: "2 — Presentes", peso: 2 }] },
            { id: "mov_corpo", tipo: "select", label: "Movimentos corporais", opcoes: [{ label: "0 — Ausentes", peso: 0 }, { label: "2 — Presentes", peso: 2 }] },
            { id: "tonus", tipo: "select", label: "Tónus fetal", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "2 — Presente", peso: 2 }] },
            { id: "liquido", tipo: "select", label: "Líquido amniótico", opcoes: [{ label: "0 — Reduzido", peso: 0 }, { label: "2 — Normal", peso: 2 }] },
            { id: "ctg", tipo: "select", label: "CTG (reagente)", opcoes: [{ label: "0 — Não reagente", peso: 0 }, { label: "2 — Reagente", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 8, max: 10, label: "Normal" },
        interpretacao: [
            { faixa: [8, 10], status: "bom", classificacao: "Normal", nota: "✅ PBF normal." },
            { faixa: [6, 6], status: "moderado", classificacao: "Suspeito", nota: "⚠️ PBF suspeito. Repetir em 24h." },
            { faixa: [0, 4], status: "grave", classificacao: "Anormal", nota: "⚠️ PBF anormal. Considerar resolução da gravidez." }
        ]
    },

    "Doppler Umbilical (IR)": {
        tipo: "exame",
        sinonimos: ["doppler umbilical", "indice resistencia umbilical"],
        campos: [{ id: "valor", tipo: "input", label: "Índice de Resistência", unidade: "", min: 0, max: 2 }],
        referencia: { min: 0.5, max: 0.7, unidade: "" },
        interpretacao: [
            { faixa: [0, 0.49], status: "baixo", termo: "Baixo", nota: "IR baixo. Sem significado." },
            { faixa: [0.5, 0.7], status: "normal", termo: "Normal", nota: "✅ IR normal." },
            { faixa: [0.71, 1], status: "moderado", termo: "Elevado", nota: "⚠️ IR elevado. Considerar insuficiência placentária." },
            { faixa: [1.01, 2], status: "grave", termo: "Diástole zero/reversa", nota: "⚠️ Diástole zero/reversa. Risco fetal. Resolução." }
        ]
    },

    "Gravidez Ectópica (Beta-HCG)": {
        tipo: "exame",
        sinonimos: ["gravidez ectopica", "beta hcg ectopica"],
        campos: [{ id: "valor", tipo: "input", label: "Beta-HCG", unidade: "mUI/mL", min: 0, max: 100000 }],
        referencia: { min: 0, max: 5, unidade: "mUI/mL" },
        interpretacao: [
            { faixa: [0, 5], status: "negativo", termo: "Negativo", nota: "✅ Não grávida." },
            { faixa: [5.1, 1500], status: "moderado", termo: "Zona de incerteza", nota: "⚠️ Zona de incerteza. Ecografia transvaginal." },
            { faixa: [1500.1, 100000], status: "alto", termo: "Positivo", nota: "⚠️ Beta-HCG positivo. Ecografia urgente para localizar." }
        ]
    },

    "Idade Gestacional por Ecografia": {
        tipo: "exame",
        sinonimos: ["idade gestacional ecografia", "ig ecografia"],
        campos: [{ id: "valor", tipo: "input", label: "Idade Gestacional", unidade: "semanas", min: 0, max: 45 }],
        referencia: { min: 37, max: 42, unidade: "semanas" },
        interpretacao: [
            { faixa: [0, 22], status: "baixo", termo: "Viabilidade incerta", nota: "⚠️ Viabilidade incerta." },
            { faixa: [23, 36], status: "moderado", termo: "Pré-termo", nota: "⚠️ Pré-termo." },
            { faixa: [37, 42], status: "normal", termo: "Termo", nota: "✅ Gravidez a termo." },
            { faixa: [42.1, 45], status: "alto", termo: "Pós-termo", nota: "⚠️ Pós-termo." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 8 — B. PEDIATRIA (17 itens)                                        */
    /* ====================================================================== */

    "Escala de Apgar": {
        tipo: "escala",
        sinonimos: ["apgar", "apgar neonatal"],
        campos: [
            { id: "fc", tipo: "select", label: "FC Cardíaca", opcoes: [{ label: "0 (Ausente)", peso: 0 }, { label: "1 (<100 bpm)", peso: 1 }, { label: "2 (>100 bpm)", peso: 2 }] },
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 (Ausente)", peso: 0 }, { label: "1 (Irregular/lenta)", peso: 1 }, { label: "2 (Boa/Choro)", peso: 2 }] },
            { id: "tonus", tipo: "select", label: "Tónus Muscular", opcoes: [{ label: "0 (Flácido)", peso: 0 }, { label: "1 (Alguma flexão)", peso: 1 }, { label: "2 (Movimento activo)", peso: 2 }] },
            { id: "reflexos", tipo: "select", label: "Reflexos", opcoes: [{ label: "0 (Ausente)", peso: 0 }, { label: "1 (Careta)", peso: 1 }, { label: "2 (Choro vigoroso)", peso: 2 }] },
            { id: "cor", tipo: "select", label: "Cor da Pele", opcoes: [{ label: "0 (Azul/pálido)", peso: 0 }, { label: "1 (Cianose periférica)", peso: 1 }, { label: "2 (Rosado)", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 8, max: 10, label: "Bom" },
        interpretacao: [
            { faixa: [8, 10], status: "bom", classificacao: "Bom", nota: "✅ Apgar normal. Neonato saudável. Pele a peito." },
            { faixa: [5, 7], status: "moderado", classificacao: "Moderado", nota: "⚠️ Apgar moderado. Reanimação moderada. Monitorizar." },
            { faixa: [0, 4], status: "grave", classificacao: "Crítico", nota: "⚠️ APGAR CRÍTICO! Reanimação avançada. Intubar e massagear." }
        ]
    },

    "Peso ao Nascer": {
        tipo: "exame",
        sinonimos: ["peso nascer", "peso neonatal"],
        campos: [{ id: "valor", tipo: "input", label: "Peso ao Nascer", unidade: "g", min: 0, max: 6000 }],
        referencia: { min: 2500, max: 4000, unidade: "g" },
        interpretacao: [
            { faixa: [0, 999], status: "muito_grave", termo: "Extremo baixo peso", nota: "⚠️ Extremo baixo peso. UCI neonatal." },
            { faixa: [1000, 1499], status: "grave", termo: "Muito baixo peso", nota: "⚠️ Muito baixo peso. UCI neonatal." },
            { faixa: [1500, 2499], status: "moderado", termo: "Baixo peso", nota: "⚠️ Baixo peso. Incubadora e monitorização." },
            { faixa: [2500, 4000], status: "normal", termo: "Normal", nota: "✅ Peso normal." },
            { faixa: [4000.1, 6000], status: "alto", termo: "Macrossomia", nota: "⚠️ Macrossomia. Avaliar diabetes materna." }
        ]
    },

    "Perímetro Cefálico (PC)": {
        tipo: "exame",
        sinonimos: ["perimetro cefalico", "pc"],
        campos: [{ id: "valor", tipo: "input", label: "Perímetro Cefálico", unidade: "cm", min: 20, max: 60 }],
        referencia: { min: 33, max: 37, unidade: "cm" },
        interpretacao: [
            { faixa: [20, 32.9], status: "baixo", termo: "Microcefalia", nota: "⚠️ Microcefalia. Investigar causa (Zika, genética)." },
            { faixa: [33, 37], status: "normal", termo: "Normal", nota: "✅ PC normal." },
            { faixa: [37.1, 60], status: "alto", termo: "Macrocefalia", nota: "⚠️ Macrocefalia. Considerar hidrocefalia." }
        ]
    },

    "Índice de Apgar (5 min)": {
        tipo: "escala",
        sinonimos: ["apgar 5 min"],
        campos: [
            { id: "fc", tipo: "select", label: "FC Cardíaca", opcoes: [{ label: "0 (Ausente)", peso: 0 }, { label: "1 (<100 bpm)", peso: 1 }, { label: "2 (>100 bpm)", peso: 2 }] },
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 (Ausente)", peso: 0 }, { label: "1 (Irregular/lenta)", peso: 1 }, { label: "2 (Boa/Choro)", peso: 2 }] },
            { id: "tonus", tipo: "select", label: "Tónus Muscular", opcoes: [{ label: "0 (Flácido)", peso: 0 }, { label: "1 (Alguma flexão)", peso: 1 }, { label: "2 (Movimento activo)", peso: 2 }] },
            { id: "reflexos", tipo: "select", label: "Reflexos", opcoes: [{ label: "0 (Ausente)", peso: 0 }, { label: "1 (Careta)", peso: 1 }, { label: "2 (Choro vigoroso)", peso: 2 }] },
            { id: "cor", tipo: "select", label: "Cor da Pele", opcoes: [{ label: "0 (Azul/pálido)", peso: 0 }, { label: "1 (Cianose periférica)", peso: 1 }, { label: "2 (Rosado)", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 8, max: 10, label: "Bom" },
        interpretacao: [
            { faixa: [8, 10], status: "bom", classificacao: "Bom", nota: "✅ Apgar 5 min normal." },
            { faixa: [5, 7], status: "moderado", classificacao: "Moderado", nota: "⚠️ Apgar moderado. Monitorizar." },
            { faixa: [0, 4], status: "grave", classificacao: "Crítico", nota: "⚠️ Apgar crítico. UCI neonatal." }
        ]
    },

    "Escala de Silverman-Andersen": {
        tipo: "escala",
        sinonimos: ["silverman", "desconforto respiratorio neonatal"],
        campos: [
            { id: "torax", tipo: "select", label: "Retracção torácica", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "intercostal", tipo: "select", label: "Retracção intercostal", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "xifoide", tipo: "select", label: "Retracção xifoide", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "narinas", tipo: "select", label: "Batimento nasal", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Mínimo", peso: 1 }, { label: "2 — Marcado", peso: 2 }] },
            { id: "gemido", tipo: "select", label: "Gemido", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Audível com estetoscópio", peso: 1 }, { label: "2 — Audível sem estetoscópio", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Leve", nota: "✅ Desconforto leve. Monitorizar." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderado", nota: "⚠️ Desconforto moderado. Considerar CPAP." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Desconforto grave. Suporte ventilatório urgente." }
        ]
    },

    "Bilirrubina Neonatal": {
        tipo: "exame",
        sinonimos: ["bilirrubina neonatal", "ictericia neonatal"],
        campos: [{ id: "valor", tipo: "input", label: "Bilirrubina Total", unidade: "mg/dL", min: 0, max: 30 }],
        referencia: { min: 0, max: 12, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 12], status: "normal", termo: "Normal", nota: "✅ Bilirrubina normal para neonato." },
            { faixa: [12.1, 15], status: "leve", termo: "Icterícia leve", nota: "⚠️ Icterícia leve. Fototerapia." },
            { faixa: [15.1, 20], status: "moderado", termo: "Icterícia moderada", nota: "⚠️ Icterícia moderada. Fototerapia intensiva." },
            { faixa: [20.1, 30], status: "grave", termo: "Icterícia grave", nota: "⚠️ Icterícia grave. Risco de kernicterus. Exsanguineotransfusão." }
        ]
    },

    "Glicemia Neonatal": {
        tipo: "exame",
        sinonimos: ["glicemia neonatal", "hipoglicemia neonatal"],
        campos: [{ id: "valor", tipo: "input", label: "Glicemia", unidade: "mg/dL", min: 0, max: 200 }],
        referencia: { min: 45, max: 100, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 44], status: "baixo", termo: "Hipoglicemia", nota: "⚠️ Hipoglicemia neonatal. Alimentar ou soro glicosado." },
            { faixa: [45, 100], status: "normal", termo: "Normal", nota: "✅ Glicemia normal." },
            { faixa: [100.1, 200], status: "alto", termo: "Hiperglicemia", nota: "⚠️ Hiperglicemia. Considerar causa materna." }
        ]
    },

    "Teste do Pezinho (Triagem Neonatal)": {
        tipo: "exame",
        sinonimos: ["teste pezinho", "triagem neonatal", "pkU"],
        campos: [{ id: "resultado", tipo: "select", label: "Teste do Pezinho", opcoes: [{ label: "Normal", valor: "Normal" }, { label: "Alterado", valor: "Alterado" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Normal" }, status: "negativo", termo: "Normal", classificacao: "Normal", nota: "✅ Teste do pezinho normal." },
            { padrao: { resultado: "Alterado" }, status: "grave", termo: "Alterado", classificacao: "Alterado", nota: "⚠️ Teste do pezinho alterado. Confirmar e encaminhar." }
        ]
    },

    "Reflexos Neonatais": {
        tipo: "exame",
        sinonimos: ["reflexos neonatais", "reflexos primitivos"],
        campos: [{ id: "resultado", tipo: "select", label: "Reflexos", opcoes: [{ label: "Presentes e simétricos", valor: "Presentes" }, { label: "Ausentes", valor: "Ausentes" }, { label: "Assimétricos", valor: "Assimétricos" }] }],
        calculo: { tipo: "padrao", chave: ["resultado"] },
        interpretacao: [
            { padrao: { resultado: "Presentes" }, status: "negativo", termo: "Normal", classificacao: "Normal", nota: "✅ Reflexos neonatais normais." },
            { padrao: { resultado: "Ausentes" }, status: "grave", termo: "Ausentes", classificacao: "Ausentes", nota: "⚠️ Reflexos ausentes. Investigar lesão neurológica." },
            { padrao: { resultado: "Assimétricos" }, status: "grave", termo: "Assimétricos", classificacao: "Assimétricos", nota: "⚠️ Reflexos assimétricos. Considerar paralisia braquial." }
        ]
    },

    "Percentil de Peso (Pediatria)": {
        tipo: "exame",
        sinonimos: ["percentil peso", "peso pediatria"],
        campos: [{ id: "valor", tipo: "input", label: "Percentil", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 3, max: 97, unidade: "%" },
        interpretacao: [
            { faixa: [0, 2.9], status: "baixo", termo: "Baixo peso", nota: "⚠️ Percentil <3. Baixo peso. Investigar causa." },
            { faixa: [3, 97], status: "normal", termo: "Normal", nota: "✅ Peso adequado para a idade." },
            { faixa: [97.1, 100], status: "alto", termo: "Sobrepeso", nota: "⚠️ Percentil >97. Sobrepeso. Aconselhamento nutricional." }
        ]
    },

    "Percentil de Altura (Pediatria)": {
        tipo: "exame",
        sinonimos: ["percentil altura", "altura pediatria", "estatura"],
        campos: [{ id: "valor", tipo: "input", label: "Percentil", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 3, max: 97, unidade: "%" },
        interpretacao: [
            { faixa: [0, 2.9], status: "baixo", termo: "Baixa estatura", nota: "⚠️ Percentil <3. Baixa estatura. Investigar causa." },
            { faixa: [3, 97], status: "normal", termo: "Normal", nota: "✅ Altura adequada para a idade." },
            { faixa: [97.1, 100], status: "alto", termo: "Alta estatura", nota: "⚠️ Percentil >97. Alta estatura. Geralmente constitucional." }
        ]
    },

    "IMC Pediátrico (Percentil)": {
        tipo: "exame",
        sinonimos: ["imc pediatrico", "percentil imc"],
        campos: [{ id: "valor", tipo: "input", label: "Percentil IMC", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 5, max: 85, unidade: "%" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Baixo peso", nota: "⚠️ Percentil <5. Baixo peso." },
            { faixa: [5, 85], status: "normal", termo: "Normal", nota: "✅ IMC normal." },
            { faixa: [85.1, 95], status: "leve", termo: "Sobrepeso", nota: "⚠️ Percentil 85-95. Sobrepeso." },
            { faixa: [95.1, 100], status: "alto", termo: "Obesidade", nota: "⚠️ Percentil >95. Obesidade. Intervenção." }
        ]
    },

    "Perímetro Braquial (Pediatria)": {
        tipo: "exame",
        sinonimos: ["perimetro braquial", "pb pediatrico", "muac"],
        campos: [{ id: "valor", tipo: "input", label: "Perímetro Braquial", unidade: "cm", min: 5, max: 30 }],
        referencia: { min: 13.5, max: 20, unidade: "cm" },
        interpretacao: [
            { faixa: [5, 11.4], status: "grave", termo: "Desnutrição grave", nota: "⚠️ Desnutrição grave. Internamento urgente." },
            { faixa: [11.5, 13.4], status: "moderado", termo: "Desnutrição moderada", nota: "⚠️ Desnutrição moderada. Suplementação." },
            { faixa: [13.5, 20], status: "normal", termo: "Normal", nota: "✅ Estado nutricional adequado." }
        ]
    },

    "Idade Óssea": {
        tipo: "exame",
        sinonimos: ["idade ossea", "maturacao ossea"],
        campos: [{ id: "valor", tipo: "input", label: "Idade Óssea", unidade: "anos", min: 0, max: 20 }],
        referencia: { min: 0, max: 20, unidade: "anos" },
        interpretacao: [
            { faixa: [0, 20], status: "normal", termo: "Normal", nota: "Correlacionar com idade cronológica." }
        ]
    },

    "Desenvolvimento Neuropsicomotor": {
        tipo: "escala",
        sinonimos: ["dnpm", "desenvolvimento neuropsicomotor"],
        campos: [
            { id: "motor", tipo: "select", label: "Motor", opcoes: [{ label: "Adequado", peso: 0 }, { label: "Atrasado", peso: 1 }] },
            { id: "linguagem", tipo: "select", label: "Linguagem", opcoes: [{ label: "Adequado", peso: 0 }, { label: "Atrasado", peso: 1 }] },
            { id: "social", tipo: "select", label: "Social", opcoes: [{ label: "Adequado", peso: 0 }, { label: "Atrasado", peso: 1 }] },
            { id: "cognitivo", tipo: "select", label: "Cognitivo", opcoes: [{ label: "Adequado", peso: 0 }, { label: "Atrasado", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Adequado" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Adequado", nota: "✅ Desenvolvimento adequado." },
            { faixa: [1, 2], status: "moderado", classificacao: "Atraso leve", nota: "⚠️ Atraso leve. Estimulação precoce." },
            { faixa: [3, 4], status: "grave", classificacao: "Atraso grave", nota: "⚠️ Atraso grave. Encaminhar neuropediatria." }
        ]
    },

    "Escala de Downes (Croup)": {
        tipo: "escala",
        sinonimos: ["downes", "croup", "laringite"],
        campos: [
            { id: "estridor", tipo: "select", label: "Estridor", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Com agitação", peso: 1 }, { label: "2 — Em repouso", peso: 2 }] },
            { id: "retracao", tipo: "select", label: "Retracção", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 2 }, { label: "3 — Grave", peso: 3 }] },
            { id: "entrada", tipo: "select", label: "Entrada de ar", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Diminuída", peso: 1 }, { label: "2 — Muito diminuída", peso: 2 }] },
            { id: "cianose", tipo: "select", label: "Cianose", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Com agitação", peso: 1 }, { label: "2 — Em repouso", peso: 2 }] },
            { id: "consciencia", tipo: "select", label: "Consciência", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Alterada", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Leve" },
        interpretacao: [
            { faixa: [0, 2], status: "leve", classificacao: "Leve", nota: "Croup leve. Corticóide." },
            { faixa: [3, 5], status: "moderado", classificacao: "Moderado", nota: "⚠️ Croup moderado. Adrenalina nebulizada." },
            { faixa: [6, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Croup grave. UCI. Intubação." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 8 — C. NUTRIÇÃO (15 itens)                                         */
    /* ====================================================================== */

    "IMC (Índice de Massa Corporal)": {
        tipo: "escala",
        sinonimos: ["imc", "indice massa corporal"],
        campos: [
            { id: "peso", tipo: "input", label: "Peso", unidade: "kg", min: 1, max: 500 },
            { id: "altura", tipo: "input", label: "Altura", unidade: "m", min: 0.3, max: 2.5 }
        ],
        calculo: { formula: "peso / (altura * altura)", mostrarFormula: "peso / (altura × altura)" },
        referencia: { min: 18.5, max: 24.9, label: "Normal" },
        interpretacao: [
            { faixa: [0, 18.4], status: "baixo", classificacao: "Abaixo do peso", nota: "⚠️ IMC abaixo do normal. Avaliar estado nutricional." },
            { faixa: [18.5, 24.9], status: "bom", classificacao: "Normal", nota: "✅ IMC normal. Manter hábitos saudáveis." },
            { faixa: [25, 29.9], status: "moderado", classificacao: "Sobrepeso", nota: "⚠️ IMC indica sobrepeso. Dieta e exercício." },
            { faixa: [30, 100], status: "grave", classificacao: "Obesidade", nota: "⚠️ IMC indica obesidade. Intervenção multidisciplinar." }
        ]
    },

    "Circunferência Abdominal": {
        tipo: "exame",
        sinonimos: ["circunferencia abdominal", "ca"],
        campos: [{ id: "valor", tipo: "input", label: "Circunferência Abdominal", unidade: "cm", min: 30, max: 200 }],
        referencia: { min: 0, max: 94, unidade: "cm" },
        interpretacao: [
            { faixa: [0, 94], status: "normal", termo: "Normal", nota: "✅ Circunferência abdominal normal." },
            { faixa: [94.1, 102], status: "leve", termo: "Risco aumentado", nota: "⚠️ Risco cardiovascular aumentado." },
            { faixa: [102.1, 200], status: "alto", termo: "Risco muito aumentado", nota: "⚠️ Risco cardiovascular muito aumentado. Obesidade abdominal." }
        ]
    },

    "Relação Cintura/Quadril (RCQ)": {
        tipo: "escala",
        sinonimos: ["rcq", "relacao cintura quadril"],
        campos: [
            { id: "cintura", tipo: "input", label: "Cintura", unidade: "cm", min: 30, max: 200 },
            { id: "quadril", tipo: "input", label: "Quadril", unidade: "cm", min: 50, max: 200 }
        ],
        calculo: { formula: "cintura / quadril", mostrarFormula: "Cintura / Quadril" },
        referencia: { min: 0, max: 0.9, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0.9], status: "bom", classificacao: "Normal", nota: "✅ RCQ normal." },
            { faixa: [0.91, 1], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco cardiovascular moderado." },
            { faixa: [1.01, 3], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco cardiovascular elevado. Obesidade central." }
        ]
    },

    "Prega Cutânea Tricipital (PCT)": {
        tipo: "exame",
        sinonimos: ["pct", "prega tricipital"],
        campos: [{ id: "valor", tipo: "input", label: "PCT", unidade: "mm", min: 0, max: 50 }],
        referencia: { min: 10, max: 20, unidade: "mm" },
        interpretacao: [
            { faixa: [0, 9.9], status: "baixo", termo: "Desnutrição", nota: "⚠️ PCT baixa. Desnutrição." },
            { faixa: [10, 20], status: "normal", termo: "Normal", nota: "✅ PCT normal." },
            { faixa: [20.1, 50], status: "alto", termo: "Obesidade", nota: "⚠️ PCT elevada. Obesidade." }
        ]
    },

    "Prega Cutânea Subescapular": {
        tipo: "exame",
        sinonimos: ["prega subescapular", "pcse"],
        campos: [{ id: "valor", tipo: "input", label: "Prega Subescapular", unidade: "mm", min: 0, max: 50 }],
        referencia: { min: 8, max: 18, unidade: "mm" },
        interpretacao: [
            { faixa: [0, 7.9], status: "baixo", termo: "Baixa", nota: "⚠️ Prega baixa. Desnutrição." },
            { faixa: [8, 18], status: "normal", termo: "Normal", nota: "✅ Prega normal." },
            { faixa: [18.1, 50], status: "alto", termo: "Elevada", nota: "⚠️ Prega elevada. Obesidade." }
        ]
    },

    "Circunferência Muscular do Braço (CMB)": {
        tipo: "exame",
        sinonimos: ["cmb", "circunferencia muscular braco"],
        campos: [{ id: "valor", tipo: "input", label: "CMB", unidade: "cm", min: 5, max: 40 }],
        referencia: { min: 21, max: 28, unidade: "cm" },
        interpretacao: [
            { faixa: [5, 20.9], status: "baixo", termo: "Desnutrição", nota: "⚠️ CMB baixa. Desnutrição proteica." },
            { faixa: [21, 28], status: "normal", termo: "Normal", nota: "✅ CMB normal." },
            { faixa: [28.1, 40], status: "alto", termo: "Elevada", nota: "CMB elevada. Boa massa muscular." }
        ]
    },

    "Albumina (Nutrição)": {
        tipo: "exame",
        sinonimos: ["albumina nutricao", "albumina"],
        campos: [{ id: "valor", tipo: "input", label: "Albumina", unidade: "g/dL", min: 0, max: 10 }],
        referencia: { min: 3.5, max: 5.5, unidade: "g/dL" },
        interpretacao: [
            { faixa: [0, 3.4], status: "baixo", termo: "Desnutrição", nota: "⚠️ Albumina baixa. Desnutrição proteica." },
            { faixa: [3.5, 5.5], status: "normal", termo: "Normal", nota: "✅ Albumina normal." },
            { faixa: [5.6, 10], status: "alto", termo: "Elevada", nota: "Albumina elevada. Considerar desidratação." }
        ]
    },

    "Pré-Albumina": {
        tipo: "exame",
        sinonimos: ["pre albumina", "transtiretina"],
        campos: [{ id: "valor", tipo: "input", label: "Pré-Albumina", unidade: "mg/dL", min: 0, max: 100 }],
        referencia: { min: 20, max: 40, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 19.9], status: "baixo", termo: "Desnutrição", nota: "⚠️ Pré-albumina baixa. Desnutrição aguda." },
            { faixa: [20, 40], status: "normal", termo: "Normal", nota: "✅ Pré-albumina normal." },
            { faixa: [40.1, 100], status: "alto", termo: "Elevada", nota: "Pré-albumina elevada. Considerar insuficiência renal." }
        ]
    },

    "Transferrina (Nutrição)": {
        tipo: "exame",
        sinonimos: ["transferrina nutricao", "transferrina"],
        campos: [{ id: "valor", tipo: "input", label: "Transferrina", unidade: "mg/dL", min: 0, max: 600 }],
        referencia: { min: 200, max: 360, unidade: "mg/dL" },
        interpretacao: [
            { faixa: [0, 199], status: "baixo", termo: "Desnutrição", nota: "⚠️ Transferrina baixa. Desnutrição proteica." },
            { faixa: [200, 360], status: "normal", termo: "Normal", nota: "✅ Transferrina normal." },
            { faixa: [360.1, 600], status: "alto", termo: "Elevada", nota: "Transferrina elevada. Considerar anemia ferropriva." }
        ]
    },

    "Balanço Nitrogenado": {
        tipo: "exame",
        sinonimos: ["balanco nitrogenado", "bn"],
        campos: [{ id: "valor", tipo: "input", label: "Balanço Nitrogenado", unidade: "g/dia", min: -50, max: 50 }],
        referencia: { min: 0, max: 50, unidade: "g/dia" },
        interpretacao: [
            { faixa: [-50, -0.1], status: "baixo", termo: "Negativo", nota: "⚠️ Balanço negativo. Catabolismo proteico. Aumentar aporte." },
            { faixa: [0, 50], status: "normal", termo: "Positivo", nota: "✅ Balanço nitrogenado positivo. Anabolismo." }
        ]
    },

    "Gasto Energético Basal (Mifflin)": {
        tipo: "escala",
        sinonimos: ["geb", "gasto energetico basal", "mifflin"],
        campos: [
            { id: "peso", tipo: "input", label: "Peso", unidade: "kg", min: 1, max: 500 },
            { id: "altura", tipo: "input", label: "Altura", unidade: "cm", min: 30, max: 250 },
            { id: "idade", tipo: "input", label: "Idade", unidade: "anos", min: 1, max: 120 },
            { id: "sexo", tipo: "select", label: "Sexo", opcoes: [{ label: "Masculino (+5)", peso: 5 }, { label: "Feminino (-161)", peso: -161 }] }
        ],
        calculo: { formula: "(10 * peso) + (6.25 * altura) - (5 * idade) + sexo", mostrarFormula: "10×P + 6,25×A - 5×I + S" },
        referencia: { min: 1200, max: 2500, label: "Normal" },
        interpretacao: [
            { faixa: [0, 1199], status: "baixo", classificacao: "Baixo", nota: "GEB baixo. Considerar desnutrição." },
            { faixa: [1200, 2500], status: "bom", classificacao: "Normal", nota: "✅ GEB normal." },
            { faixa: [2500.1, 5000], status: "alto", classificacao: "Elevado", nota: "⚠️ GEB elevado. Ajustar aporte calórico." }
        ]
    },

    "Necessidade Proteica": {
        tipo: "escala",
        sinonimos: ["necessidade proteica", "aporte proteico"],
        campos: [
            { id: "peso", tipo: "input", label: "Peso", unidade: "kg", min: 1, max: 500 },
            { id: "fator", tipo: "select", label: "Condição", opcoes: [{ label: "Normal (0.8 g/kg)", peso: 0.8 }, { label: "Stress leve (1.2 g/kg)", peso: 1.2 }, { label: "Stress moderado (1.5 g/kg)", peso: 1.5 }, { label: "Stress grave (2 g/kg)", peso: 2 }] }
        ],
        calculo: { formula: "peso * fator", mostrarFormula: "Peso × Factor" },
        referencia: { min: 50, max: 100, label: "Normal" },
        interpretacao: [
            { faixa: [0, 49], status: "baixo", classificacao: "Baixa", nota: "Aporte proteico baixo." },
            { faixa: [50, 100], status: "bom", classificacao: "Normal", nota: "✅ Aporte proteico adequado." },
            { faixa: [100.1, 1000], status: "alto", classificacao: "Elevado", nota: "⚠️ Aporte proteico elevado. Monitorizar função renal." }
        ]
    },

    "Estado Nutricional (Avaliação Subjectiva)": {
        tipo: "escala",
        sinonimos: ["avaliacao subjectiva", "estado nutricional"],
        campos: [{ id: "valor", tipo: "select", label: "Classificação", opcoes: [{ label: "A — Bem nutrido", peso: 0 }, { label: "B — Moderadamente desnutrido", peso: 1 }, { label: "C — Gravemente desnutrido", peso: 2 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Bem nutrido" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Bem nutrido", nota: "✅ Estado nutricional adequado." },
            { faixa: [1, 1], status: "moderado", classificacao: "Desnutrição moderada", nota: "⚠️ Desnutrição moderada. Suporte nutricional." },
            { faixa: [2, 2], status: "grave", classificacao: "Desnutrição grave", nota: "⚠️ Desnutrição grave. Suporte nutricional intensivo." }
        ]
    },

    "Triagem de Risco Nutricional (NRS 2002)": {
        tipo: "escala",
        sinonimos: ["nrs 2002", "triagem nutricional"],
        campos: [
            { id: "imc", tipo: "select", label: "IMC", opcoes: [{ label: ">20.5 (0)", peso: 0 }, { label: "18.5-20.5 (2)", peso: 2 }, { label: "<18.5 (3)", peso: 3 }] },
            { id: "perda", tipo: "select", label: "Perda de peso", opcoes: [{ label: "Nenhuma (0)", peso: 0 }, { label: ">5% em 3 meses (1)", peso: 1 }, { label: ">5% em 2 meses (2)", peso: 2 }, { label: ">5% em 1 mês (3)", peso: 3 }] },
            { id: "ingestao", tipo: "select", label: "Ingestão alimentar", opcoes: [{ label: "Normal (0)", peso: 0 }, { label: "50-75% (1)", peso: 1 }, { label: "25-50% (2)", peso: 2 }, { label: "0-25% (3)", peso: 3 }] },
            { id: "gravidade", tipo: "select", label: "Gravidade da doença", opcoes: [{ label: "Ausente (0)", peso: 0 }, { label: "Leve (1)", peso: 1 }, { label: "Moderada (2)", peso: 2 }, { label: "Grave (3)", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco nutricional." },
            { faixa: [3, 4], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Monitorizar." },
            { faixa: [5, 12], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Suporte nutricional urgente." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 9 — A. PSIQUIATRIA (18 itens)                                      */
    /* ====================================================================== */

    "PHQ-9 (Depressão)": {
        tipo: "escala",
        sinonimos: ["phq 9", "depressao", "phq9"],
        campos: [
            { id: "q1", tipo: "select", label: "Pouco interesse/prazer", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q2", tipo: "select", label: "Sentir-se para baixo", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q3", tipo: "select", label: "Dificuldade em dormir", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q4", tipo: "select", label: "Cansaço/falta de energia", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q5", tipo: "select", label: "Alteração apetite", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q6", tipo: "select", label: "Sentir-se mal consigo", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q7", tipo: "select", label: "Dificuldade concentração", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q8", tipo: "select", label: "Agitação/retardamento", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q9", tipo: "select", label: "Pensamentos negativos", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 4, label: "Mínima" },
        interpretacao: [
            { faixa: [0, 4], status: "bom", classificacao: "Mínima", nota: "✅ Sem depressão significativa." },
            { faixa: [5, 9], status: "leve", classificacao: "Leve", nota: "Depressão leve. Considerar terapia." },
            { faixa: [10, 14], status: "moderado", classificacao: "Moderada", nota: "⚠️ Depressão moderada. Terapia + farmacoterapia." },
            { faixa: [15, 27], status: "grave", classificacao: "Grave", nota: "⚠️ Depressão grave. Psiquiatria. Risco de suicídio." }
        ]
    },

    "GAD-7 (Ansiedade)": {
        tipo: "escala",
        sinonimos: ["gad 7", "ansiedade", "gad7"],
        campos: [
            { id: "q1", tipo: "select", label: "Sentir-se nervoso", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q2", tipo: "select", label: "Não conseguir parar de preocupar", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q3", tipo: "select", label: "Preocupar-se demasiado", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q4", tipo: "select", label: "Dificuldade em relaxar", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q5", tipo: "select", label: "Inquietação", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q6", tipo: "select", label: "Irritabilidade", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] },
            { id: "q7", tipo: "select", label: "Medo de algo terrível", opcoes: [{ label: "Nenhum (0)", peso: 0 }, { label: "Vários dias (1)", peso: 1 }, { label: "Mais de metade (2)", peso: 2 }, { label: "Quase todos (3)", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 4, label: "Mínima" },
        interpretacao: [
            { faixa: [0, 4], status: "bom", classificacao: "Mínima", nota: "✅ Sem ansiedade significativa." },
            { faixa: [5, 9], status: "leve", classificacao: "Leve", nota: "Ansiedade leve. Técnicas de relaxamento." },
            { faixa: [10, 14], status: "moderado", classificacao: "Moderada", nota: "⚠️ Ansiedade moderada. Terapia." },
            { faixa: [15, 21], status: "grave", classificacao: "Grave", nota: "⚠️ Ansiedade grave. Psiquiatria." }
        ]
    },

    "Escala de Hamilton (Depressão - HAM-D)": {
        tipo: "escala",
        sinonimos: ["ham d", "hamilton depressao"],
        campos: [{ id: "valor", tipo: "select", label: "Pontuação total", opcoes: [{ label: "0-7 — Normal", peso: 0 }, { label: "8-13 — Leve", peso: 8 }, { label: "14-18 — Moderada", peso: 14 }, { label: "19-22 — Grave", peso: 19 }, { label: "≥23 — Muito grave", peso: 23 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 7, label: "Normal" },
        interpretacao: [
            { faixa: [0, 7], status: "bom", classificacao: "Normal", nota: "✅ Sem depressão." },
            { faixa: [8, 13], status: "leve", classificacao: "Leve", nota: "Depressão leve." },
            { faixa: [14, 18], status: "moderado", classificacao: "Moderada", nota: "⚠️ Depressão moderada." },
            { faixa: [19, 22], status: "grave", classificacao: "Grave", nota: "⚠️ Depressão grave." },
            { faixa: [23, 52], status: "muito_grave", classificacao: "Muito grave", nota: "⚠️ Depressão muito grave. Risco de suicídio." }
        ]
    },

    "Escala de Hamilton (Ansiedade - HAM-A)": {
        tipo: "escala",
        sinonimos: ["ham a", "hamilton ansiedade"],
        campos: [{ id: "valor", tipo: "select", label: "Pontuação total", opcoes: [{ label: "0-17 — Leve", peso: 0 }, { label: "18-24 — Moderada", peso: 18 }, { label: "25-30 — Grave", peso: 25 }, { label: "≥31 — Muito grave", peso: 31 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 17, label: "Leve" },
        interpretacao: [
            { faixa: [0, 17], status: "bom", classificacao: "Leve", nota: "✅ Ansiedade leve." },
            { faixa: [18, 24], status: "moderado", classificacao: "Moderada", nota: "⚠️ Ansiedade moderada." },
            { faixa: [25, 30], status: "grave", classificacao: "Grave", nota: "⚠️ Ansiedade grave." },
            { faixa: [31, 56], status: "muito_grave", classificacao: "Muito grave", nota: "⚠️ Ansiedade muito grave. Psiquiatria." }
        ]
    },

    "MMSE (Mini-Mental State Examination)": {
        tipo: "escala",
        sinonimos: ["mmse", "mini mental", "estado mental"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-30)", unidade: "pontos", min: 0, max: 30 }],
        referencia: { min: 24, max: 30, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 9], status: "grave", termo: "Demência grave", nota: "⚠️ Demência grave. Cuidados continuados." },
            { faixa: [10, 18], status: "moderado", termo: "Demência moderada", nota: "⚠️ Demência moderada. Apoio." },
            { faixa: [19, 23], status: "leve", termo: "Défice leve", nota: "⚠️ Défice cognitivo leve. Investigar." },
            { faixa: [24, 30], status: "normal", termo: "Normal", nota: "✅ Cognição normal." }
        ]
    },

    "MoCA (Montreal Cognitive Assessment)": {
        tipo: "escala",
        sinonimos: ["moca", "montreal cognitive"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-30)", unidade: "pontos", min: 0, max: 30 }],
        referencia: { min: 26, max: 30, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 9], status: "grave", termo: "Défice grave", nota: "⚠️ Défice cognitivo grave." },
            { faixa: [10, 17], status: "moderado", termo: "Défice moderado", nota: "⚠️ Défice cognitivo moderado." },
            { faixa: [18, 25], status: "leve", termo: "Défice leve", nota: "⚠️ Défice cognitivo leve. Investigar." },
            { faixa: [26, 30], status: "normal", termo: "Normal", nota: "✅ Cognição normal." }
        ]
    },

    "Mini-Cog": {
        tipo: "escala",
        sinonimos: ["mini cog", "minicog"],
        campos: [
            { id: "memoria", tipo: "select", label: "Recordação (3 palavras)", opcoes: [{ label: "0", peso: 0 }, { label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }] },
            { id: "relogio", tipo: "select", label: "Desenho do relógio", opcoes: [{ label: "0 — Anormal", peso: 0 }, { label: "2 — Normal", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 3, max: 5, label: "Normal" },
        interpretacao: [
            { faixa: [0, 2], status: "grave", classificacao: "Défice cognitivo", nota: "⚠️ Défice cognitivo. Investigar demência." },
            { faixa: [3, 5], status: "bom", classificacao: "Normal", nota: "✅ Cognição normal." }
        ]
    },

    "Escala de Depressão Geriátrica (GDS)": {
        tipo: "escala",
        sinonimos: ["gds", "depressao geriatrica"],
        campos: [{ id: "valor", tipo: "input", label: "Respostas afirmativas (0-15)", unidade: "pontos", min: 0, max: 15 }],
        referencia: { min: 0, max: 4, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 4], status: "bom", termo: "Normal", nota: "✅ Sem depressão." },
            { faixa: [5, 8], status: "leve", termo: "Depressão leve", nota: "⚠️ Depressão leve." },
            { faixa: [9, 11], status: "moderado", termo: "Depressão moderada", nota: "⚠️ Depressão moderada." },
            { faixa: [12, 15], status: "grave", termo: "Depressão grave", nota: "⚠️ Depressão grave. Psiquiatria." }
        ]
    },

    "CAGE (Alcoolismo)": {
        tipo: "escala",
        sinonimos: ["cage", "alcoolismo"],
        campos: [
            { id: "c1", tipo: "select", label: "Cut down (reduzir)", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "c2", tipo: "select", label: "Annoyed (irritado)", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "c3", tipo: "select", label: "Guilty (culpado)", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "c4", tipo: "select", label: "Eye-opener (matinal)", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de alcoolismo." },
            { faixa: [2, 2], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Avaliar consumo." },
            { faixa: [3, 4], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de alcoolismo. Intervenção." }
        ]
    },

    "AUDIT (Consumo de Álcool)": {
        tipo: "escala",
        sinonimos: ["audit", "consumo alcool"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-40)", unidade: "pontos", min: 0, max: 40 }],
        referencia: { min: 0, max: 7, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 7], status: "bom", termo: "Baixo risco", nota: "✅ Consumo de baixo risco." },
            { faixa: [8, 15], status: "leve", termo: "Uso perigoso", nota: "⚠️ Uso perigoso. Aconselhamento." },
            { faixa: [16, 19], status: "moderado", termo: "Uso nocivo", nota: "⚠️ Uso nocivo. Intervenção breve." },
            { faixa: [20, 40], status: "grave", termo: "Dependência", nota: "⚠️ Dependência alcoólica. Tratamento especializado." }
        ]
    },

    "Fagerström (Dependência de Nicotina)": {
        tipo: "escala",
        sinonimos: ["fagerstrom", "nicotina", "tabagismo"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-10)", unidade: "pontos", min: 0, max: 10 }],
        referencia: { min: 0, max: 2, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", termo: "Muito baixa", nota: "✅ Dependência muito baixa." },
            { faixa: [3, 4], status: "leve", termo: "Baixa", nota: "Dependência baixa." },
            { faixa: [5, 7], status: "moderado", termo: "Média", nota: "⚠️ Dependência média. Aconselhamento." },
            { faixa: [8, 10], status: "grave", termo: "Alta", nota: "⚠️ Dependência alta. Tratamento intensivo." }
        ]
    },

    "Escala de Risco de Suicídio (Columbia)": {
        tipo: "escala",
        sinonimos: ["columbia", "risco suicidio"],
        campos: [
            { id: "desejo", tipo: "select", label: "Desejo de morrer", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pensamento", tipo: "select", label: "Pensamento suicida", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "plano", tipo: "select", label: "Plano", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] },
            { id: "intencao", tipo: "select", label: "Intenção", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] },
            { id: "comportamento", tipo: "select", label: "Comportamento preparatório", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de suicídio." },
            { faixa: [1, 2], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Avaliação psiquiátrica." },
            { faixa: [3, 5], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco elevado. Internamento psiquiátrico." },
            { faixa: [6, 9], status: "muito_grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. Internamento urgente." }
        ]
    },

    "Escala de Impressão Clínica Global (CGI)": {
        tipo: "escala",
        sinonimos: ["cgi", "impressao clinica global"],
        campos: [{ id: "valor", tipo: "select", label: "Gravidade", opcoes: [{ label: "1 — Normal", peso: 1 }, { label: "2 — Limítrofe", peso: 2 }, { label: "3 — Leve", peso: 3 }, { label: "4 — Moderada", peso: 4 }, { label: "5 — Marcada", peso: 5 }, { label: "6 — Grave", peso: 6 }, { label: "7 — Extremamente grave", peso: 7 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 1, max: 2, label: "Normal" },
        interpretacao: [
            { faixa: [1, 2], status: "bom", classificacao: "Normal", nota: "✅ Sem perturbação significativa." },
            { faixa: [3, 4], status: "moderado", classificacao: "Leve a moderada", nota: "⚠️ Perturbação leve a moderada." },
            { faixa: [5, 7], status: "grave", classificacao: "Grave", nota: "⚠️ Perturbação grave. Intervenção urgente." }
        ]
    },

    "Escala de Mania de Young (YMRS)": {
        tipo: "escala",
        sinonimos: ["ymrs", "young mania"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-60)", unidade: "pontos", min: 0, max: 60 }],
        referencia: { min: 0, max: 12, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 12], status: "bom", termo: "Normal", nota: "✅ Sem mania." },
            { faixa: [13, 19], status: "leve", termo: "Hipomania", nota: "⚠️ Hipomania. Monitorizar." },
            { faixa: [20, 29], status: "moderado", termo: "Mania moderada", nota: "⚠️ Mania moderada. Estabilizador de humor." },
            { faixa: [30, 60], status: "grave", termo: "Mania grave", nota: "⚠️ Mania grave. Internamento." }
        ]
    },

    "Escala de Avaliação Global (GAF)": {
        tipo: "escala",
        sinonimos: ["gaf", "avaliacao global funcionamento"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-100)", unidade: "pontos", min: 0, max: 100 }],
        referencia: { min: 81, max: 100, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 30], status: "grave", termo: "Incapacidade grave", nota: "⚠️ Incapacidade grave. Supervisão intensiva." },
            { faixa: [31, 50], status: "moderado", termo: "Incapacidade moderada", nota: "⚠️ Incapacidade moderada. Apoio." },
            { faixa: [51, 70], status: "leve", termo: "Sintomas leves", nota: "Sintomas leves. Funcionamento razoável." },
            { faixa: [71, 80], status: "bom", termo: "Bom funcionamento", nota: "✅ Bom funcionamento." },
            { faixa: [81, 100], status: "bom", termo: "Funcionamento superior", nota: "✅ Funcionamento superior." }
        ]
    },

    "PANSS (Esquizofrenia)": {
        tipo: "escala",
        sinonimos: ["panss", "esquizofrenia"],
        campos: [
            { id: "positiva", tipo: "input", label: "Subescala positiva", unidade: "pontos", min: 7, max: 49 },
            { id: "negativa", tipo: "input", label: "Subescala negativa", unidade: "pontos", min: 7, max: 49 },
            { id: "psicopatologia", tipo: "input", label: "Psicopatologia geral", unidade: "pontos", min: 16, max: 112 }
        ],
        calculo: { formula: "positiva + negativa + psicopatologia", mostrarFormula: "P + N + PG" },
        referencia: { min: 30, max: 60, label: "Normal" },
        interpretacao: [
            { faixa: [30, 60], status: "bom", classificacao: "Normal", nota: "✅ Sem sintomas significativos." },
            { faixa: [60.1, 90], status: "moderado", classificacao: "Moderadamente doente", nota: "⚠️ Esquizofrenia moderada." },
            { faixa: [90.1, 130], status: "grave", classificacao: "Gravemente doente", nota: "⚠️ Esquizofrenia grave." },
            { faixa: [130.1, 210], status: "muito_grave", classificacao: "Extremamente doente", nota: "⚠️ Esquizofrenia extremamente grave. Internamento." }
        ]
    },


        /* ====================================================================== */
    /* LOTE 9 — B. DOR (16 itens)                                              */
    /* ====================================================================== */

    "Escala Visual Analógica (EVA)": {
        tipo: "escala",
        sinonimos: ["eva", "escala visual analoga", "dor"],
        campos: [{ id: "valor", tipo: "select", label: "Intensidade", opcoes: [{ label: "0 — Sem dor", peso: 0 }, { label: "1-3 — Leve", peso: 2 }, { label: "4-6 — Moderada", peso: 5 }, { label: "7-9 — Intensa", peso: 8 }, { label: "10 — Máxima", peso: 10 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Leve", nota: "Dor leve. Analgésico simples se necessário." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada. Analgésico opióide fraco." },
            { faixa: [7, 10], status: "grave", classificacao: "Intensa", nota: "⚠️ Dor intensa. Opióide maior. Reavaliar em 30 min." }
        ]
    },

    "Escala Numérica da Dor (NRS)": {
        tipo: "escala",
        sinonimos: ["nrs", "escala numerica dor"],
        campos: [{ id: "valor", tipo: "input", label: "Intensidade (0-10)", unidade: "pontos", min: 0, max: 10 }],
        referencia: { min: 0, max: 3, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", termo: "Leve", nota: "Dor leve." },
            { faixa: [4, 6], status: "moderado", termo: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [7, 10], status: "grave", termo: "Intensa", nota: "⚠️ Dor intensa. Intervenção." }
        ]
    },

    "Escala de Faces de Wong-Baker": {
        tipo: "escala",
        sinonimos: ["wong baker", "faces dor", "dor pediatrica"],
        campos: [{ id: "valor", tipo: "select", label: "Face", opcoes: [{ label: "0 — Sem dor", peso: 0 }, { label: "2 — Dor leve", peso: 2 }, { label: "4 — Dor moderada", peso: 4 }, { label: "6 — Dor intensa", peso: 6 }, { label: "8 — Dor muito intensa", peso: 8 }, { label: "10 — Pior dor", peso: 10 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Leve" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", classificacao: "Leve", nota: "✅ Dor leve." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [8, 10], status: "grave", classificacao: "Intensa", nota: "⚠️ Dor intensa. Intervenção." }
        ]
    },

    "Escala FLACC (Dor Pediátrica)": {
        tipo: "escala",
        sinonimos: ["flacc", "dor pediatrica"],
        campos: [
            { id: "face", tipo: "select", label: "Face", opcoes: [{ label: "0 — Sorriso", peso: 0 }, { label: "1 — Careta ocasional", peso: 1 }, { label: "2 — Careta frequente", peso: 2 }] },
            { id: "legs", tipo: "select", label: "Pernas", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Inquietas", peso: 1 }, { label: "2 — Flectidas", peso: 2 }] },
            { id: "activity", tipo: "select", label: "Actividade", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Agitado", peso: 1 }, { label: "2 — Rígido", peso: 2 }] },
            { id: "cry", tipo: "select", label: "Choro", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Gemidos", peso: 1 }, { label: "2 — Choro vigoroso", peso: 2 }] },
            { id: "consolability", tipo: "select", label: "Consolabilidade", opcoes: [{ label: "0 — Calmo", peso: 0 }, { label: "1 — Consolável", peso: 1 }, { label: "2 — Inconsolável", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Leve", nota: "✅ Dor leve." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Dor grave. Intervenção urgente." }
        ]
    },

    "Escala de Dor Neuropática (DN4)": {
        tipo: "escala",
        sinonimos: ["dn4", "dor neuropatica"],
        campos: [
            { id: "queimadura", tipo: "select", label: "Queimadura", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "frio", tipo: "select", label: "Frio doloroso", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "choque", tipo: "select", label: "Choque eléctrico", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "formigueiro", tipo: "select", label: "Formigueiro", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "alfinetes", tipo: "select", label: "Alfinetes", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "adormecimento", tipo: "select", label: "Adormecimento", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "coceira", tipo: "select", label: "Coceira", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "hipoestesia", tipo: "select", label: "Hipoestesia ao toque", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "hipoestesia_picada", tipo: "select", label: "Hipoestesia à picada", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "hiperalgesia", tipo: "select", label: "Hiperalgesia", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Não neuropática" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Não neuropática", nota: "✅ Dor não neuropática." },
            { faixa: [4, 10], status: "grave", classificacao: "Neuropática", nota: "⚠️ Dor neuropática. Anticonvulsivante/antidepressivo." }
        ]
    },

    "Escala de Dor de McGill": {
        tipo: "escala",
        sinonimos: ["mcgill", "dor mcgill"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação total", unidade: "pontos", min: 0, max: 78 }],
        referencia: { min: 0, max: 10, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 10], status: "bom", termo: "Leve", nota: "✅ Dor leve." },
            { faixa: [11, 30], status: "moderado", termo: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [31, 78], status: "grave", termo: "Grave", nota: "⚠️ Dor grave. Intervenção multidisciplinar." }
        ]
    },

    "Escala de Dor Crónica (CPGS)": {
        tipo: "escala",
        sinonimos: ["cpgs", "dor cronica"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-70)", unidade: "pontos", min: 0, max: 70 }],
        referencia: { min: 0, max: 20, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 20], status: "bom", termo: "Leve", nota: "✅ Dor crónica leve." },
            { faixa: [21, 40], status: "moderado", termo: "Moderada", nota: "⚠️ Dor crónica moderada." },
            { faixa: [41, 70], status: "grave", termo: "Grave", nota: "⚠️ Dor crónica grave. Centro de dor." }
        ]
    },

    "Escala de Dor de face, pernas, actividade, choro, consolabilidade (FLACC)": {
        tipo: "escala",
        sinonimos: ["flacc repetido", "dor pediatrica flacc"],
        campos: [
            { id: "face", tipo: "select", label: "Face", opcoes: [{ label: "0", peso: 0 }, { label: "1", peso: 1 }, { label: "2", peso: 2 }] },
            { id: "legs", tipo: "select", label: "Pernas", opcoes: [{ label: "0", peso: 0 }, { label: "1", peso: 1 }, { label: "2", peso: 2 }] },
            { id: "activity", tipo: "select", label: "Actividade", opcoes: [{ label: "0", peso: 0 }, { label: "1", peso: 1 }, { label: "2", peso: 2 }] },
            { id: "cry", tipo: "select", label: "Choro", opcoes: [{ label: "0", peso: 0 }, { label: "1", peso: 1 }, { label: "2", peso: 2 }] },
            { id: "consolability", tipo: "select", label: "Consolabilidade", opcoes: [{ label: "0", peso: 0 }, { label: "1", peso: 1 }, { label: "2", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Leve", nota: "✅ Dor leve." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Dor grave." }
        ]
    },

    "Escala de Dor de CRIES (Neonatal)": {
        tipo: "escala",
        sinonimos: ["cries", "dor neonatal"],
        campos: [
            { id: "choro", tipo: "select", label: "Choro", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Agudo", peso: 1 }, { label: "2 — Inconsolável", peso: 2 }] },
            { id: "oxigenio", tipo: "select", label: "Necessidade O2", opcoes: [{ label: "0 — Não", peso: 0 }, { label: "1 — <30%", peso: 1 }, { label: "2 — >30%", peso: 2 }] },
            { id: "fc", tipo: "select", label: "FC", opcoes: [{ label: "0 — Aumento <10%", peso: 0 }, { label: "1 — 10-20%", peso: 1 }, { label: "2 — >20%", peso: 2 }] },
            { id: "expressao", tipo: "select", label: "Expressão facial", opcoes: [{ label: "0 — Relaxada", peso: 0 }, { label: "1 — Grimace", peso: 1 }, { label: "2 — Careta", peso: 2 }] },
            { id: "sono", tipo: "select", label: "Sono", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Desperta", peso: 1 }, { label: "2 — Inquieto", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Leve", nota: "✅ Dor leve." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Dor grave. Intervenção." }
        ]
    },

    "Escala de Dor de BPS (Behavioral Pain Scale)": {
        tipo: "escala",
        sinonimos: ["bps", "behavioral pain scale", "dor uci"],
        campos: [
            { id: "expressao", tipo: "select", label: "Expressão facial", opcoes: [{ label: "1 — Relaxada", peso: 1 }, { label: "2 — Parcialmente tensa", peso: 2 }, { label: "3 — Totalmente tensa", peso: 3 }, { label: "4 — Careta", peso: 4 }] },
            { id: "membros", tipo: "select", label: "Membros superiores", opcoes: [{ label: "1 — Sem movimento", peso: 1 }, { label: "2 — Parcialmente flectidos", peso: 2 }, { label: "3 — Totalmente flectidos", peso: 3 }, { label: "4 — Retraídos", peso: 4 }] },
            { id: "ventilacao", tipo: "select", label: "Ventilação", opcoes: [{ label: "1 — Tolerando", peso: 1 }, { label: "2 — Tosse", peso: 2 }, { label: "3 — Luta com ventilador", peso: 3 }, { label: "4 — Incapaz de ventilar", peso: 4 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 3, max: 5, label: "Leve" },
        interpretacao: [
            { faixa: [3, 5], status: "bom", classificacao: "Leve", nota: "✅ Dor leve ou ausente." },
            { faixa: [6, 8], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada. Analgesia." },
            { faixa: [9, 12], status: "grave", classificacao: "Grave", nota: "⚠️ Dor grave. Analgesia intensiva." }
        ]
    },

    "Escala de Dor de CPOT (Critical Care Pain Observation Tool)": {
        tipo: "escala",
        sinonimos: ["cpot", "critical care pain"],
        campos: [
            { id: "expressao", tipo: "select", label: "Expressão facial", opcoes: [{ label: "0 — Relaxada", peso: 0 }, { label: "1 — Tensa", peso: 1 }, { label: "2 — Careta", peso: 2 }] },
            { id: "movimento", tipo: "select", label: "Movimentos corporais", opcoes: [{ label: "0 — Ausentes", peso: 0 }, { label: "1 — Protecção", peso: 1 }, { label: "2 — Inquietação", peso: 2 }] },
            { id: "tonus", tipo: "select", label: "Tónus muscular", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Aumentado", peso: 1 }, { label: "2 — Muito aumentado", peso: 2 }] },
            { id: "ventilacao", tipo: "select", label: "Ventilação", opcoes: [{ label: "0 — Tolerando", peso: 0 }, { label: "1 — Tosse", peso: 1 }, { label: "2 — Luta", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Leve" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", classificacao: "Leve", nota: "✅ Dor leve." },
            { faixa: [3, 5], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [6, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Dor grave. Analgesia." }
        ]
    },

    "Escala de Dor de Abbey (Demência)": {
        tipo: "escala",
        sinonimos: ["abbey", "dor demencia"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (0-18)", unidade: "pontos", min: 0, max: 18 }],
        referencia: { min: 0, max: 2, unidade: "pontos" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", termo: "Sem dor", nota: "✅ Sem dor." },
            { faixa: [3, 7], status: "leve", termo: "Dor leve", nota: "⚠️ Dor leve." },
            { faixa: [8, 13], status: "moderado", termo: "Dor moderada", nota: "⚠️ Dor moderada." },
            { faixa: [14, 18], status: "grave", termo: "Dor grave", nota: "⚠️ Dor grave. Analgesia." }
        ]
    },

    "Escala de Dor de PAINAD (Demência)": {
        tipo: "escala",
        sinonimos: ["painad", "dor demencia avançada"],
        campos: [
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Ocasional", peso: 1 }, { label: "2 — Ruidoso", peso: 2 }] },
            { id: "vocal", tipo: "select", label: "Vocalização", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Gemidos", peso: 1 }, { label: "2 — Choro", peso: 2 }] },
            { id: "expressao", tipo: "select", label: "Expressão facial", opcoes: [{ label: "0 — Sorriso", peso: 0 }, { label: "1 — Triste", peso: 1 }, { label: "2 — Careta", peso: 2 }] },
            { id: "linguagem", tipo: "select", label: "Linguagem corporal", opcoes: [{ label: "0 — Relaxado", peso: 0 }, { label: "1 — Tensão", peso: 1 }, { label: "2 — Rígido", peso: 2 }] },
            { id: "consolabilidade", tipo: "select", label: "Consolabilidade", opcoes: [{ label: "0 — Calmo", peso: 0 }, { label: "1 — Distraído", peso: 1 }, { label: "2 — Inconsolável", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Sem dor" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Sem dor", nota: "✅ Sem dor." },
            { faixa: [2, 4], status: "leve", classificacao: "Dor leve", nota: "⚠️ Dor leve." },
            { faixa: [5, 7], status: "moderado", classificacao: "Dor moderada", nota: "⚠️ Dor moderada." },
            { faixa: [8, 10], status: "grave", classificacao: "Dor grave", nota: "⚠️ Dor grave. Analgesia." }
        ]
    },

    "Escala de Dor de NIPS (Neonatal)": {
        tipo: "escala",
        sinonimos: ["nips", "dor neonatal"],
        campos: [
            { id: "expressao", tipo: "select", label: "Expressão facial", opcoes: [{ label: "0 — Relaxada", peso: 0 }, { label: "1 — Careta", peso: 1 }] },
            { id: "choro", tipo: "select", label: "Choro", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Agudo", peso: 1 }] },
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Irregular", peso: 1 }] },
            { id: "bracos", tipo: "select", label: "Braços", opcoes: [{ label: "0 — Relaxados", peso: 0 }, { label: "1 — Flectidos", peso: 1 }] },
            { id: "pernas", tipo: "select", label: "Pernas", opcoes: [{ label: "0 — Relaxadas", peso: 0 }, { label: "1 — Flectidas", peso: 1 }] },
            { id: "estado", tipo: "select", label: "Estado de alerta", opcoes: [{ label: "0 — Dormindo", peso: 0 }, { label: "1 — Inquieto", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 2, label: "Leve" },
        interpretacao: [
            { faixa: [0, 2], status: "bom", classificacao: "Leve", nota: "✅ Dor leve." },
            { faixa: [3, 4], status: "moderado", classificacao: "Moderada", nota: "⚠️ Dor moderada." },
            { faixa: [5, 7], status: "grave", classificacao: "Grave", nota: "⚠️ Dor grave. Intervenção." }
        ]
    },

    "Escala de Dor de Comfort (Neonatal)": {
        tipo: "escala",
        sinonimos: ["comfort", "dor neonatal comfort"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (8-40)", unidade: "pontos", min: 8, max: 40 }],
        referencia: { min: 8, max: 16, unidade: "pontos" },
        interpretacao: [
            { faixa: [8, 16], status: "bom", termo: "Confortável", nota: "✅ Neonato confortável." },
            { faixa: [17, 24], status: "moderado", termo: "Desconforto", nota: "⚠️ Desconforto. Intervenção." },
            { faixa: [25, 40], status: "grave", termo: "Dor grave", nota: "⚠️ Dor grave. Analgesia." }
        ]
    },

    "Escala de Dor de COMFORT-B": {
        tipo: "escala",
        sinonimos: ["comfort b", "dor pediatrica comfort"],
        campos: [{ id: "valor", tipo: "input", label: "Pontuação (6-30)", unidade: "pontos", min: 6, max: 30 }],
        referencia: { min: 6, max: 10, unidade: "pontos" },
        interpretacao: [
            { faixa: [6, 10], status: "bom", termo: "Confortável", nota: "✅ Confortável." },
            { faixa: [11, 17], status: "moderado", termo: "Desconforto", nota: "⚠️ Desconforto moderado." },
            { faixa: [18, 30], status: "grave", termo: "Dor grave", nota: "⚠️ Dor grave. Analgesia." }
        ]
    },



        /* ====================================================================== */
    /* LOTE 9 — C. CUIDADOS E ENFERMAGEM (16 itens)                            */
    /* ====================================================================== */

    "Escala de Braden (Úlcera de Pressão)": {
        tipo: "escala",
        sinonimos: ["braden", "ulcera pressao"],
        campos: [
            { id: "percepcao", tipo: "select", label: "Percepção sensorial", opcoes: [{ label: "1 — Completamente limitado", peso: 1 }, { label: "2 — Muito limitado", peso: 2 }, { label: "3 — Ligeiramente limitado", peso: 3 }, { label: "4 — Nenhuma limitação", peso: 4 }] },
            { id: "humidade", tipo: "select", label: "Humidade", opcoes: [{ label: "1 — Constantemente húmido", peso: 1 }, { label: "2 — Muito húmido", peso: 2 }, { label: "3 — Ocasionalmente húmido", peso: 3 }, { label: "4 — Raramente húmido", peso: 4 }] },
            { id: "actividade", tipo: "select", label: "Actividade", opcoes: [{ label: "1 — Acamado", peso: 1 }, { label: "2 — Cadeira", peso: 2 }, { label: "3 — Anda ocasionalmente", peso: 3 }, { label: "4 — Anda frequentemente", peso: 4 }] },
            { id: "mobilidade", tipo: "select", label: "Mobilidade", opcoes: [{ label: "1 — Completamente imóvel", peso: 1 }, { label: "2 — Muito limitada", peso: 2 }, { label: "3 — Ligeiramente limitada", peso: 3 }, { label: "4 — Sem limitações", peso: 4 }] },
            { id: "nutricao", tipo: "select", label: "Nutrição", opcoes: [{ label: "1 — Muito pobre", peso: 1 }, { label: "2 — Provavelmente inadequada", peso: 2 }, { label: "3 — Adequada", peso: 3 }, { label: "4 — Excelente", peso: 4 }] },
            { id: "friccao", tipo: "select", label: "Fricção e cisalhamento", opcoes: [{ label: "1 — Problema", peso: 1 }, { label: "2 — Problema potencial", peso: 2 }, { label: "3 — Nenhum problema", peso: 3 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 19, max: 23, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 9], status: "muito_grave", classificacao: "Risco muito alto", nota: "⚠️ Risco muito alto de úlcera. Medidas intensivas." },
            { faixa: [10, 12], status: "grave", classificacao: "Risco alto", nota: "⚠️ Risco alto. Mudanças de posição frequentes." },
            { faixa: [13, 14], status: "moderado", classificacao: "Risco moderado", nota: "Risco moderado. Monitorizar pele." },
            { faixa: [15, 18], status: "leve", classificacao: "Risco leve", nota: "Risco leve. Cuidados de rotina." },
            { faixa: [19, 23], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Manter cuidados." }
        ]
    },

    "Escala de Norton (Úlcera de Pressão)": {
        tipo: "escala",
        sinonimos: ["norton", "ulcera pressao norton"],
        campos: [
            { id: "estado", tipo: "select", label: "Estado geral", opcoes: [{ label: "1 — Muito mau", peso: 1 }, { label: "2 — Mau", peso: 2 }, { label: "3 — Médio", peso: 3 }, { label: "4 — Bom", peso: 4 }] },
            { id: "mental", tipo: "select", label: "Estado mental", opcoes: [{ label: "1 — Confuso", peso: 1 }, { label: "2 — Apático", peso: 2 }, { label: "3 — Alerta", peso: 3 }, { label: "4 — Lúcido", peso: 4 }] },
            { id: "actividade", tipo: "select", label: "Actividade", opcoes: [{ label: "1 — Acamado", peso: 1 }, { label: "2 — Cadeira", peso: 2 }, { label: "3 — Anda com ajuda", peso: 3 }, { label: "4 — Anda sozinho", peso: 4 }] },
            { id: "mobilidade", tipo: "select", label: "Mobilidade", opcoes: [{ label: "1 — Imóvel", peso: 1 }, { label: "2 — Muito limitada", peso: 2 }, { label: "3 — Ligeiramente limitada", peso: 3 }, { label: "4 — Total", peso: 4 }] },
            { id: "incontinencia", tipo: "select", label: "Incontinência", opcoes: [{ label: "1 — Dupla", peso: 1 }, { label: "2 — Urinária", peso: 2 }, { label: "3 — Ocasional", peso: 3 }, { label: "4 — Continente", peso: 4 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 14, max: 20, label: "Baixo risco" },
        interpretacao: [
            { faixa: [5, 9], status: "muito_grave", classificacao: "Risco muito alto", nota: "⚠️ Risco muito alto de úlcera. Medidas intensivas." },
            { faixa: [10, 12], status: "grave", classificacao: "Risco alto", nota: "⚠️ Risco alto. Mudanças de posição frequentes." },
            { faixa: [13, 13], status: "moderado", classificacao: "Risco moderado", nota: "Risco moderado. Monitorizar pele." },
            { faixa: [14, 20], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Cuidados de rotina." }
        ]
    },

    "Escala de Morse (Quedas)": {
        tipo: "escala",
        sinonimos: ["morse", "quedas"],
        campos: [
            { id: "historico", tipo: "select", label: "Histórico de quedas", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 25 }] },
            { id: "secundario", tipo: "select", label: "Diagnóstico secundário", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 15 }] },
            { id: "ajuda", tipo: "select", label: "Ajuda para andar", opcoes: [{ label: "Nenhuma/repouso", peso: 0 }, { label: "Bengala/muleta", peso: 15 }, { label: "Apoio móvel", peso: 30 }] },
            { id: "via", tipo: "select", label: "Via intravenosa", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 20 }] },
            { id: "marcha", tipo: "select", label: "Marcha", opcoes: [{ label: "Normal", peso: 0 }, { label: "Fraca", peso: 10 }, { label: "Alterada", peso: 20 }] },
            { id: "mental", tipo: "select", label: "Estado mental", opcoes: [{ label: "Orientado", peso: 0 }, { label: "Confuso", peso: 15 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 24, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 24], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de queda." },
            { faixa: [25, 44], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado de queda. Medidas preventivas." },
            { faixa: [45, 125], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de queda. Medidas intensivas." }
        ]
    },

    "Escala de Hendrich II (Quedas)": {
        tipo: "escala",
        sinonimos: ["hendrich", "quedas hendrich"],
        campos: [
            { id: "confusao", tipo: "select", label: "Confusão/desorientação", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 4 }] },
            { id: "depressao", tipo: "select", label: "Depressão", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 2 }] },
            { id: "eliminacao", tipo: "select", label: "Alteração eliminação", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "vertigem", tipo: "select", label: "Vertigem", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "sexo", tipo: "select", label: "Sexo masculino", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "medicamentos", tipo: "select", label: "Medicamentos de risco", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 3 }] },
            { id: "mobilidade", tipo: "select", label: "Mobilidade", opcoes: [{ label: "Normal", peso: 0 }, { label: "Fraca", peso: 1 }, { label: "Sentado", peso: 1 }, { label: "Acamado", peso: 0 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 4, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 4], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de queda." },
            { faixa: [5, 8], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Medidas preventivas." },
            { faixa: [9, 20], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de queda. Medidas intensivas." }
        ]
    },

    "Escala de Glasgow Modificada (Pediatria)": {
        tipo: "escala",
        sinonimos: ["glasgow pediatrico modificado"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão cerebral moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão cerebral grave. UCI." }
        ]
    },

    "Escala de Ramsay (Sedação)": {
        tipo: "escala",
        sinonimos: ["ramsay", "sedacao ramsay"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "1 — Ansioso", peso: 1 }, { label: "2 — Cooperante", peso: 2 }, { label: "3 — Responde a comandos", peso: 3 }, { label: "4 — Resposta rápida", peso: 4 }, { label: "5 — Resposta lenta", peso: 5 }, { label: "6 — Sem resposta", peso: 6 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 2, max: 4, label: "Adequado" },
        interpretacao: [
            { faixa: [1, 1], status: "leve", classificacao: "Ansioso", nota: "Ansioso. Considerar sedação." },
            { faixa: [2, 4], status: "bom", classificacao: "Adequado", nota: "✅ Sedação adequada." },
            { faixa: [5, 6], status: "grave", classificacao: "Excessiva", nota: "⚠️ Sedação excessiva. Reduzir sedativo." }
        ]
    },

    "RASS (Richmond Agitation-Sedation Scale)": {
        tipo: "escala",
        sinonimos: ["rass", "agitacao sedacao"],
        campos: [{ id: "valor", tipo: "select", label: "Nível", opcoes: [{ label: "+4 — Combativo", peso: -4 }, { label: "+3 — Muito agitado", peso: -3 }, { label: "+2 — Agitado", peso: -2 }, { label: "+1 — Inquieto", peso: -1 }, { label: "0 — Alerta e calmo", peso: 0 }, { label: "-1 — Sonolento", peso: 1 }, { label: "-2 — Sedação leve", peso: 2 }, { label: "-3 — Sedação moderada", peso: 3 }, { label: "-4 — Sedação profunda", peso: 4 }, { label: "-5 — Não despertável", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Alerta" },
        interpretacao: [
            { faixa: [-4, -4], status: "grave", classificacao: "Combativo", nota: "⚠️ Combativo. Risco para o doente. Sedar." },
            { faixa: [-3, -1], status: "leve", classificacao: "Agitado", nota: "Agitado. Considerar contenção/sedação." },
            { faixa: [0, 0], status: "bom", classificacao: "Alerta e calmo", nota: "✅ Alerta e calmo." },
            { faixa: [1, 2], status: "leve", classificacao: "Sonolento", nota: "Sonolento. Aceitável em UCI." },
            { faixa: [3, 5], status: "grave", classificacao: "Sedação profunda", nota: "⚠️ Sedação profunda. Avaliar necessidade." }
        ]
    },

    "CAM-ICU (Delirium)": {
        tipo: "escala",
        sinonimos: ["cam icu", "delirium"],
        campos: [
            { id: "inicio", tipo: "select", label: "Início agudo/curso flutuante", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "atencao", tipo: "select", label: "Desatenção", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "consciencia", tipo: "select", label: "Alteração do nível de consciência", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pensamento", tipo: "select", label: "Pensamento desorganizado", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Negativo" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Negativo", nota: "✅ Sem delirium." },
            { faixa: [1, 4], status: "grave", classificacao: "Positivo", nota: "⚠️ Delirium positivo. Tratar causa e ambiente." }
        ]
    },

    "Escala de Avaliação de Risco de Lesão por Pressão (EVARUCI)": {
        tipo: "escala",
        sinonimos: ["evaruci", "ulcera pressao evaruci"],
        campos: [
            { id: "consciencia", tipo: "select", label: "Nível de consciência", opcoes: [{ label: "0 — Alertar", peso: 0 }, { label: "1 — Sonolento", peso: 1 }, { label: "2 — Coma", peso: 2 }] },
            { id: "mov", tipo: "select", label: "Movilidade", opcoes: [{ label: "0 — Moviliza-se", peso: 0 }, { label: "1 — Limitada", peso: 1 }, { label: "2 — Imóvel", peso: 2 }] },
            { id: "incontinencia", tipo: "select", label: "Incontinência", opcoes: [{ label: "0 — Continente", peso: 0 }, { label: "1 — Ocasional", peso: 1 }, { label: "2 — Frequente", peso: 2 }] },
            { id: "nutricao", tipo: "select", label: "Nutrição", opcoes: [{ label: "0 — Adequada", peso: 0 }, { label: "1 — Inadequada", peso: 1 }, { label: "2 — Desnutrida", peso: 2 }] },
            { id: "edad", tipo: "select", label: "Idade", opcoes: [{ label: "0 — <65", peso: 0 }, { label: "1 — 65-79", peso: 1 }, { label: "2 — ≥80", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco." },
            { faixa: [4, 6], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado." },
            { faixa: [7, 10], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Medidas intensivas." }
        ]
    },

    "Escala de Waterlow (Úlcera de Pressão)": {
        tipo: "escala",
        sinonimos: ["waterlow", "ulcera pressao waterlow"],
        campos: [
            { id: "imc", tipo: "select", label: "IMC", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — >25 ou <20", peso: 1 }, { label: "2 — >30 ou <18.5", peso: 2 }] },
            { id: "mov", tipo: "select", label: "Mobilidade", opcoes: [{ label: "0 — Normal", peso: 0 }, { label: "1 — Inquieto", peso: 1 }, { label: "2 — Apático", peso: 2 }, { label: "3 — Imóvel", peso: 3 }] },
            { id: "continencia", tipo: "select", label: "Continência", opcoes: [{ label: "0 — Continente", peso: 0 }, { label: "1 — Ocasional", peso: 1 }, { label: "2 — Cateter", peso: 2 }, { label: "3 — Incontinente", peso: 3 }] },
            { id: "pele", tipo: "select", label: "Estado da pele", opcoes: [{ label: "0 — Saudável", peso: 0 }, { label: "1 — Manchas", peso: 1 }, { label: "2 — Seca", peso: 2 }, { label: "3 — Edema", peso: 3 }] },
            { id: "idade", tipo: "select", label: "Idade", opcoes: [{ label: "0 — <65", peso: 0 }, { label: "1 — 65-79", peso: 1 }, { label: "2 — ≥80", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 9, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 9], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco." },
            { faixa: [10, 14], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado." },
            { faixa: [15, 19], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco." },
            { faixa: [20, 30], status: "muito_grave", classificacao: "Risco muito alto", nota: "⚠️ Risco muito alto." }
        ]
    },

    "Escala de Rankin Modificada (mRS)": {
        tipo: "escala",
        sinonimos: ["rankin", "rankin modificada", "mrs"],
        campos: [{ id: "valor", tipo: "select", label: "Grau", opcoes: [{ label: "0 — Sem sintomas", peso: 0 }, { label: "1 — Sem incapacidade significativa", peso: 1 }, { label: "2 — Incapacidade leve", peso: 2 }, { label: "3 — Incapacidade moderada", peso: 3 }, { label: "4 — Incapacidade moderada-grave", peso: 4 }, { label: "5 — Incapacidade grave", peso: 5 }, { label: "6 — Morte", peso: 6 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Bom" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Bom", nota: "✅ Sem incapacidade significativa." },
            { faixa: [2, 2], status: "leve", classificacao: "Incapacidade leve", nota: "Incapacidade leve. Independente." },
            { faixa: [3, 3], status: "moderado", classificacao: "Incapacidade moderada", nota: "⚠️ Incapacidade moderada. Necessita ajuda." },
            { faixa: [4, 5], status: "grave", classificacao: "Incapacidade grave", nota: "⚠️ Incapacidade grave. Dependente." },
            { faixa: [6, 6], status: "muito_grave", classificacao: "Morte", nota: "⚠️ Óbito." }
        ]
    },

    "Índice de Barthel (AVD)": {
        tipo: "escala",
        sinonimos: ["barthel", "atividades vida diaria"],
        campos: [
            { id: "alimentacao", tipo: "select", label: "Alimentação", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] },
            { id: "banho", tipo: "select", label: "Banho", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Independente", peso: 5 }] },
            { id: "vestir", tipo: "select", label: "Vestir", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] },
            { id: "higiene", tipo: "select", label: "Higiene pessoal", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Independente", peso: 5 }] },
            { id: "intestino", tipo: "select", label: "Controlo intestinal", opcoes: [{ label: "0 — Incontinente", peso: 0 }, { label: "5 — Ocasional", peso: 5 }, { label: "10 — Continente", peso: 10 }] },
            { id: "bexiga", tipo: "select", label: "Controlo vesical", opcoes: [{ label: "0 — Incontinente", peso: 0 }, { label: "5 — Ocasional", peso: 5 }, { label: "10 — Continente", peso: 10 }] },
            { id: "wc", tipo: "select", label: "Uso do WC", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] },
            { id: "transferencia", tipo: "select", label: "Transferência", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Ajuda mínima", peso: 10 }, { label: "15 — Independente", peso: 15 }] },
            { id: "mobilidade", tipo: "select", label: "Mobilidade", opcoes: [{ label: "0 — Imóvel", peso: 0 }, { label: "5 — Cadeira de rodas", peso: 5 }, { label: "10 — Anda com ajuda", peso: 10 }, { label: "15 — Independente", peso: 15 }] },
            { id: "escadas", tipo: "select", label: "Escadas", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "5 — Ajuda", peso: 5 }, { label: "10 — Independente", peso: 10 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 100, max: 100, label: "Independente" },
        interpretacao: [
            { faixa: [0, 20], status: "muito_grave", classificacao: "Dependência total", nota: "⚠️ Dependência total. Cuidados continuados." },
            { faixa: [21, 60], status: "grave", classificacao: "Dependência grave", nota: "⚠️ Dependência grave. Reabilitação intensiva." },
            { faixa: [61, 90], status: "moderado", classificacao: "Dependência moderada", nota: "⚠️ Dependência moderada. Apoio." },
            { faixa: [91, 99], status: "leve", classificacao: "Dependência leve", nota: "Dependência leve." },
            { faixa: [100, 100], status: "bom", classificacao: "Independente", nota: "✅ Independente." }
        ]
    },

    "Índice de Katz (AVD)": {
        tipo: "escala",
        sinonimos: ["katz", "atividades vida diaria katz"],
        campos: [
            { id: "banho", tipo: "select", label: "Banho", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "vestir", tipo: "select", label: "Vestir", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "wc", tipo: "select", label: "Uso do WC", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "transferencia", tipo: "select", label: "Transferência", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "continencia", tipo: "select", label: "Continência", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "alimentacao", tipo: "select", label: "Alimentação", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 6, max: 6, label: "Independente" },
        interpretacao: [
            { faixa: [0, 2], status: "grave", classificacao: "Dependência grave", nota: "⚠️ Dependência grave. Cuidados continuados." },
            { faixa: [3, 4], status: "moderado", classificacao: "Dependência moderada", nota: "⚠️ Dependência moderada. Apoio." },
            { faixa: [5, 5], status: "leve", classificacao: "Dependência leve", nota: "Dependência leve." },
            { faixa: [6, 6], status: "bom", classificacao: "Independente", nota: "✅ Independente." }
        ]
    },

    "Escala de Lawton (AIVD)": {
        tipo: "escala",
        sinonimos: ["lawton", "atividades instrumentais"],
        campos: [
            { id: "telefone", tipo: "select", label: "Usar telefone", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "compras", tipo: "select", label: "Fazer compras", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "comida", tipo: "select", label: "Preparar comida", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "casa", tipo: "select", label: "Trabalhos domésticos", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "lavandaria", tipo: "select", label: "Lavar roupa", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "transporte", tipo: "select", label: "Transporte", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "medicacao", tipo: "select", label: "Gerir medicação", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] },
            { id: "financas", tipo: "select", label: "Gerir finanças", opcoes: [{ label: "0 — Dependente", peso: 0 }, { label: "1 — Independente", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 8, max: 8, label: "Independente" },
        interpretacao: [
            { faixa: [0, 3], status: "grave", classificacao: "Dependência grave", nota: "⚠️ Dependência grave." },
            { faixa: [4, 5], status: "moderado", classificacao: "Dependência moderada", nota: "⚠️ Dependência moderada." },
            { faixa: [6, 7], status: "leve", classificacao: "Dependência leve", nota: "Dependência leve." },
            { faixa: [8, 8], status: "bom", classificacao: "Independente", nota: "✅ Independente." }
        ]
    },

    "Escala de Coma de Glasgow (GCS)": {
        tipo: "escala",
        sinonimos: ["glasgow", "gcs", "coma"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Dor)", peso: 2 }, { label: "3 (Comando verbal)", peso: 3 }, { label: "4 (Espontânea)", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Sons)", peso: 2 }, { label: "3 (Palavras)", peso: 3 }, { label: "4 (Confuso)", peso: 4 }, { label: "5 (Orientado)", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1 (Nenhuma)", peso: 1 }, { label: "2 (Extensão)", peso: 2 }, { label: "3 (Flexão)", peso: 3 }, { label: "4 (Retirada)", peso: 4 }, { label: "5 (Localiza)", peso: 5 }, { label: "6 (Obedece)", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão cerebral moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO CEREBRAL GRAVE! UCI." }
        ]
    },


    /* ====================================================================== */
    /* LOTE 10 — A. UTI / SEPSE / CHOQUE (20 itens)                            */
    /* ====================================================================== */

    "qSOFA (Sepse)": {
        tipo: "escala",
        sinonimos: ["qsofa", "sepse", "quick sofa"],
        campos: [
            { id: "fr", tipo: "select", label: "FR ≥22 ipm", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "mental", tipo: "select", label: "Alteração mental", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pas", tipo: "select", label: "PAS ≤100 mmHg", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de sepse." },
            { faixa: [2, 3], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco de sepse. Avaliar SOFA, lactato e antibiótico precoce." }
        ]
    },

    "SOFA (Sepse)": {
        tipo: "escala",
        sinonimos: ["sofa", "sepse sofa"],
        campos: [
            { id: "resp", tipo: "select", label: "Respiração (PaO2/FiO2)", opcoes: [{ label: "≥400 (0)", peso: 0 }, { label: "<400 (1)", peso: 1 }, { label: "<300 (2)", peso: 2 }, { label: "<200 c/ VM (3)", peso: 3 }, { label: "<100 c/ VM (4)", peso: 4 }] },
            { id: "coag", tipo: "select", label: "Coagulação (Plaquetas)", opcoes: [{ label: "≥150 (0)", peso: 0 }, { label: "<150 (1)", peso: 1 }, { label: "<100 (2)", peso: 2 }, { label: "<50 (3)", peso: 3 }, { label: "<20 (4)", peso: 4 }] },
            { id: "figado", tipo: "select", label: "Fígado (Bilirrubina)", opcoes: [{ label: "<1.2 (0)", peso: 0 }, { label: "1.2-1.9 (1)", peso: 1 }, { label: "2.0-5.9 (2)", peso: 2 }, { label: "6.0-11.9 (3)", peso: 3 }, { label: ">12 (4)", peso: 4 }] },
            { id: "cardio", tipo: "select", label: "Cardiovascular", opcoes: [{ label: "PAM ≥70 (0)", peso: 0 }, { label: "PAM <70 (1)", peso: 1 }, { label: "Dopamina ≤5 (2)", peso: 2 }, { label: "Dopamina >5 (3)", peso: 3 }, { label: "Dopamina >15 (4)", peso: 4 }] },
            { id: "snc", tipo: "select", label: "SNC (Glasgow)", opcoes: [{ label: "15 (0)", peso: 0 }, { label: "13-14 (1)", peso: 1 }, { label: "10-12 (2)", peso: 2 }, { label: "6-9 (3)", peso: 3 }, { label: "<6 (4)", peso: 4 }] },
            { id: "renal", tipo: "select", label: "Renal (Creatinina)", opcoes: [{ label: "<1.2 (0)", peso: 0 }, { label: "1.2-1.9 (1)", peso: 1 }, { label: "2.0-3.4 (2)", peso: 2 }, { label: "3.5-4.9 (3)", peso: 3 }, { label: ">5 (4)", peso: 4 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco de mortalidade." },
            { faixa: [2, 5], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Monitorizar." },
            { faixa: [6, 9], status: "alto", classificacao: "Risco elevado", nota: "⚠️ Risco elevado de mortalidade. UCI." },
            { faixa: [10, 24], status: "grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. UCI urgente." }
        ]
    },

    "APACHE II": {
        tipo: "escala",
        sinonimos: ["apache ii", "apache 2"],
        campos: [
            { id: "idade", tipo: "select", label: "Idade", opcoes: [{ label: "<45", peso: 0 }, { label: "45-54", peso: 2 }, { label: "55-64", peso: 3 }, { label: "65-74", peso: 5 }, { label: "≥75", peso: 6 }] },
            { id: "temperatura", tipo: "select", label: "Temperatura", opcoes: [{ label: "36-38.4", peso: 0 }, { label: "34-35.9", peso: 1 }, { label: "32-33.9", peso: 2 }, { label: "30-31.9", peso: 3 }, { label: "≤29.9", peso: 4 }] },
            { id: "pam", tipo: "select", label: "PAM", opcoes: [{ label: "70-109", peso: 0 }, { label: "50-69", peso: 2 }, { label: "130-159", peso: 2 }, { label: "≤49", peso: 4 }, { label: "≥160", peso: 4 }] },
            { id: "fc", tipo: "select", label: "FC", opcoes: [{ label: "70-109", peso: 0 }, { label: "55-69", peso: 2 }, { label: "110-139", peso: 2 }, { label: "≤54", peso: 4 }, { label: "≥140", peso: 4 }] },
            { id: "fr", tipo: "select", label: "FR", opcoes: [{ label: "12-24", peso: 0 }, { label: "10-11", peso: 1 }, { label: "25-34", peso: 1 }, { label: "≤9", peso: 4 }, { label: "≥35", peso: 4 }] },
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "15", peso: 0 }, { label: "13-14", peso: 1 }, { label: "10-12", peso: 2 }, { label: "7-9", peso: 3 }, { label: "4-6", peso: 4 }, { label: "3", peso: 5 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 9, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 9], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Mortalidade <10%." },
            { faixa: [10, 19], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Mortalidade 15-25%." },
            { faixa: [20, 29], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco elevado. Mortalidade 40-55%." },
            { faixa: [30, 71], status: "muito_grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. Mortalidade >70%." }
        ]
    },

    "SAPS II": {
        tipo: "escala",
        sinonimos: ["saps ii", "saps 2"],
        campos: [
            { id: "idade", tipo: "input", label: "Idade", unidade: "anos", min: 18, max: 120 },
            { id: "fc", tipo: "select", label: "FC", opcoes: [{ label: "<40", peso: 11 }, { label: "40-69", peso: 2 }, { label: "70-119", peso: 0 }, { label: "120-159", peso: 4 }, { label: "≥160", peso: 7 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: "<70", peso: 13 }, { label: "70-99", peso: 5 }, { label: "100-199", peso: 0 }, { label: "≥200", peso: 8 }] },
            { id: "temp", tipo: "select", label: "Temperatura", opcoes: [{ label: "<35", peso: 3 }, { label: "≥35", peso: 0 }] },
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "14-15", peso: 0 }, { label: "11-13", peso: 5 }, { label: "9-10", peso: 7 }, { label: "6-8", peso: 13 }, { label: "3-5", peso: 26 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 29, label: "Baixo" },
        interpretacao: [
            { faixa: [0, 29], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Mortalidade <10%." },
            { faixa: [30, 49], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Mortalidade 20-30%." },
            { faixa: [50, 79], status: "grave", classificacao: "Risco elevado", nota: "⚠️ Risco elevado. Mortalidade 50-70%." },
            { faixa: [80, 163], status: "muito_grave", classificacao: "Risco muito elevado", nota: "⚠️ Risco muito elevado. Mortalidade >80%." }
        ]
    },

    "Pressão Arterial Média (PAM)": {
        tipo: "escala",
        sinonimos: ["pam", "pressao arterial media"],
        campos: [
            { id: "pas", tipo: "input", label: "PAS", unidade: "mmHg", min: 0, max: 300 },
            { id: "pad", tipo: "input", label: "PAD", unidade: "mmHg", min: 0, max: 200 }
        ],
        calculo: { formula: "((pas - pad) / 3) + pad", mostrarFormula: "(PAS - PAD)/3 + PAD" },
        referencia: { min: 70, max: 105, label: "Normal" },
        interpretacao: [
            { faixa: [0, 59], status: "grave", classificacao: "Hipotensão grave", nota: "⚠️ PAM <60. Hipoperfusão de órgãos. Choque." },
            { faixa: [60, 69], status: "moderado", classificacao: "Hipotensão", nota: "⚠️ PAM baixa. Reposição volémica." },
            { faixa: [70, 105], status: "bom", classificacao: "Normal", nota: "✅ PAM normal." },
            { faixa: [105.1, 200], status: "alto", classificacao: "Hipertensão", nota: "⚠️ PAM elevada. Tratar hipertensão." }
        ]
    },

    "Índice de Choque": {
        tipo: "escala",
        sinonimos: ["indice choque", "shock index"],
        campos: [
            { id: "fc", tipo: "input", label: "FC", unidade: "bpm", min: 0, max: 300 },
            { id: "pas", tipo: "input", label: "PAS", unidade: "mmHg", min: 1, max: 300 }
        ],
        calculo: { formula: "fc / pas", mostrarFormula: "FC / PAS" },
        referencia: { min: 0.5, max: 0.7, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0.49], status: "baixo", classificacao: "Baixo", nota: "Índice de choque baixo." },
            { faixa: [0.5, 0.7], status: "bom", classificacao: "Normal", nota: "✅ Índice de choque normal." },
            { faixa: [0.71, 0.9], status: "moderado", classificacao: "Alterado", nota: "⚠️ Índice de choque alterado. Avaliar perfusão." },
            { faixa: [0.91, 2], status: "grave", classificacao: "Choque", nota: "⚠️ Índice de choque >0.9. Choque. Ressuscitação." }
        ]
    },

    "Débito Urinário": {
        tipo: "exame",
        sinonimos: ["debito urinario", "diurese", "urina 24h"],
        campos: [{ id: "valor", tipo: "input", label: "Débito Urinário", unidade: "mL/h", min: 0, max: 2000 }],
        referencia: { min: 30, max: 200, unidade: "mL/h" },
        interpretacao: [
            { faixa: [0, 0.4], status: "muito_grave", termo: "Anúria", nota: "⚠️ Anúria. Lesão renal aguda. UCI." },
            { faixa: [0.5, 29.9], status: "grave", termo: "Oligúria", nota: "⚠️ Oligúria (<30 mL/h). Considerar hipoperfusão." },
            { faixa: [30, 200], status: "normal", termo: "Normal", nota: "✅ Débito urinário normal." },
            { faixa: [200.1, 2000], status: "alto", termo: "Poliúria", nota: "⚠️ Poliúria. Considerar diabetes insipidus." }
        ]
    },

    "Balanço Hídrico": {
        tipo: "exame",
        sinonimos: ["balanco hidrico", "balanco fluidos"],
        campos: [{ id: "valor", tipo: "input", label: "Balanço", unidade: "mL/24h", min: -10000, max: 10000 }],
        referencia: { min: -500, max: 500, unidade: "mL/24h" },
        interpretacao: [
            { faixa: [-10000, -1500], status: "grave", termo: "Balanço negativo grave", nota: "⚠️ Balanço muito negativo. Desidratação. Repor." },
            { faixa: [-1499, -501], status: "moderado", termo: "Balanço negativo", nota: "⚠️ Balanço negativo. Monitorizar." },
            { faixa: [-500, 500], status: "normal", termo: "Neutro", nota: "✅ Balanço neutro." },
            { faixa: [501, 1500], status: "moderado", termo: "Balanço positivo", nota: "⚠️ Balanço positivo. Risco de edema." },
            { faixa: [1500.1, 10000], status: "grave", termo: "Balanço positivo grave", nota: "⚠️ Balanço muito positivo. Risco de edema agudo." }
        ]
    },

    "Glasgow (UTI)": {
        tipo: "escala",
        sinonimos: ["glasgow uti", "gcs uti"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão cerebral leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada. TC." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO GRAVE! UCI/Intubação." }
        ]
    },

    "RASS (UTI)": {
        tipo: "escala",
        sinonimos: ["rass uti", "sedacao rass"],
        campos: [{ id: "valor", tipo: "select", label: "Nível", opcoes: [{ label: "+4 — Combativo", peso: -4 }, { label: "+3 — Muito agitado", peso: -3 }, { label: "+2 — Agitado", peso: -2 }, { label: "+1 — Inquieto", peso: -1 }, { label: "0 — Alerta e calmo", peso: 0 }, { label: "-1 — Sonolento", peso: 1 }, { label: "-2 — Sedação leve", peso: 2 }, { label: "-3 — Sedação moderada", peso: 3 }, { label: "-4 — Sedação profunda", peso: 4 }, { label: "-5 — Não despertável", peso: 5 }] }],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Alerta" },
        interpretacao: [
            { faixa: [-4, -4], status: "grave", classificacao: "Combativo", nota: "⚠️ Combativo. Sedar." },
            { faixa: [-3, -1], status: "leve", classificacao: "Agitado", nota: "Agitado. Considerar contenção." },
            { faixa: [0, 0], status: "bom", classificacao: "Alerta e calmo", nota: "✅ Alerta e calmo." },
            { faixa: [1, 2], status: "leve", classificacao: "Sonolento", nota: "Sonolento. Aceitável." },
            { faixa: [3, 5], status: "grave", classificacao: "Sedação profunda", nota: "⚠️ Sedação profunda. Avaliar." }
        ]
    },

    "CAM-ICU (UTI)": {
        tipo: "escala",
        sinonimos: ["cam icu uti", "delirium uti"],
        campos: [
            { id: "inicio", tipo: "select", label: "Início agudo/curso flutuante", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "atencao", tipo: "select", label: "Desatenção", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "consciencia", tipo: "select", label: "Alteração do nível de consciência", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "pensamento", tipo: "select", label: "Pensamento desorganizado", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Negativo" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Negativo", nota: "✅ Sem delirium." },
            { faixa: [1, 4], status: "grave", classificacao: "Positivo", nota: "⚠️ Delirium. Tratar causa." }
        ]
    },

    "Lactato (UTI)": {
        tipo: "exame",
        sinonimos: ["lactato uti", "lactato"],
        campos: [{ id: "valor", tipo: "input", label: "Lactato", unidade: "mmol/L", min: 0, max: 30 }],
        referencia: { min: 0.5, max: 2.2, unidade: "mmol/L" },
        interpretacao: [
            { faixa: [0, 0.4], status: "baixo", termo: "Baixo", nota: "Lactato baixo. Sem significado." },
            { faixa: [0.5, 2.2], status: "normal", termo: "Normal", nota: "✅ Lactato normal." },
            { faixa: [2.3, 4], status: "moderado", termo: "Elevado", nota: "⚠️ Lactato elevado. Hipoperfusão." },
            { faixa: [4.1, 30], status: "grave", termo: "Muito elevado", nota: "⚠️ LACTATO MUITO ELEVADO! Choque/sepse. UCI." }
        ]
    },

    "PVC (Pressão Venosa Central)": {
        tipo: "exame",
        sinonimos: ["pvc", "pressao venosa central"],
        campos: [{ id: "valor", tipo: "input", label: "PVC", unidade: "cmH2O", min: 0, max: 40 }],
        referencia: { min: 5, max: 12, unidade: "cmH2O" },
        interpretacao: [
            { faixa: [0, 4.9], status: "baixo", termo: "Baixa", nota: "⚠️ PVC baixa. Hipovolemia. Reposição volémica." },
            { faixa: [5, 12], status: "normal", termo: "Normal", nota: "✅ PVC normal." },
            { faixa: [12.1, 20], status: "moderado", termo: "Elevada", nota: "⚠️ PVC elevada. Considerar sobrecarga ou IC." },
            { faixa: [20.1, 40], status: "grave", termo: "Muito elevada", nota: "⚠️ PVC muito elevada. Risco de edema pulmonar." }
        ]
    },

    "Índice Cardíaco": {
        tipo: "exame",
        sinonimos: ["indice cardiaco", "ic"],
        campos: [{ id: "valor", tipo: "input", label: "Índice Cardíaco", unidade: "L/min/m²", min: 0, max: 10 }],
        referencia: { min: 2.5, max: 4, unidade: "L/min/m²" },
        interpretacao: [
            { faixa: [0, 2.1], status: "grave", termo: "Choque cardiogénico", nota: "⚠️ IC <2.2. Choque cardiogénico. Inotrópicos." },
            { faixa: [2.2, 2.4], status: "moderado", termo: "Baixo", nota: "⚠️ IC baixo. Avaliar perfusão." },
            { faixa: [2.5, 4], status: "normal", termo: "Normal", nota: "✅ IC normal." },
            { faixa: [4.1, 10], status: "alto", termo: "Elevado", nota: "⚠️ IC elevado. Considerar sépsis." }
        ]
    },

    "SvO2 (Saturação Venosa Mista)": {
        tipo: "exame",
        sinonimos: ["svo2", "saturacao venosa mista"],
        campos: [{ id: "valor", tipo: "input", label: "SvO2", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 65, max: 75, unidade: "%" },
        interpretacao: [
            { faixa: [0, 49], status: "grave", termo: "Muito baixa", nota: "⚠️ SvO2 muito baixa. Choque. Aumentar débito." },
            { faixa: [50, 64], status: "moderado", termo: "Baixa", nota: "⚠️ SvO2 baixa. Baixo débito cardíaco." },
            { faixa: [65, 75], status: "normal", termo: "Normal", nota: "✅ SvO2 normal." },
            { faixa: [75.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ SvO2 elevada. Considerar sépsis ou shunt." }
        ]
    },

    "Gap Aniónico": {
        tipo: "escala",
        sinonimos: ["gap anionico", "anion gap"],
        campos: [
            { id: "sodio", tipo: "input", label: "Sódio", unidade: "mEq/L", min: 100, max: 180 },
            { id: "cloro", tipo: "input", label: "Cloro", unidade: "mEq/L", min: 70, max: 140 },
            { id: "bicarbonato", tipo: "input", label: "Bicarbonato", unidade: "mEq/L", min: 0, max: 60 }
        ],
        calculo: { formula: "sodio - (cloro + bicarbonato)", mostrarFormula: "Na - (Cl + HCO3)" },
        referencia: { min: 8, max: 12, label: "Normal" },
        interpretacao: [
            { faixa: [0, 7.9], status: "baixo", classificacao: "Baixo", nota: "Gap baixo. Considerar hipoalbuminemia." },
            { faixa: [8, 12], status: "bom", classificacao: "Normal", nota: "✅ Gap aniónico normal." },
            { faixa: [12.1, 20], status: "moderado", classificacao: "Elevado", nota: "⚠️ Gap elevado. Acidose metabólica (cetoacidose, lactato)." },
            { faixa: [20.1, 50], status: "grave", classificacao: "Muito elevado", nota: "⚠️ Gap muito elevado. Acidose grave. Tratar causa." }
        ]
    },

    "Saturação Venosa Central (ScvO2)": {
        tipo: "exame",
        sinonimos: ["scvo2", "saturacao venosa central"],
        campos: [{ id: "valor", tipo: "input", label: "ScvO2", unidade: "%", min: 0, max: 100 }],
        referencia: { min: 70, max: 80, unidade: "%" },
        interpretacao: [
            { faixa: [0, 59], status: "grave", termo: "Muito baixa", nota: "⚠️ ScvO2 muito baixa. Choque." },
            { faixa: [60, 69], status: "moderado", termo: "Baixa", nota: "⚠️ ScvO2 baixa. Optimizar débito." },
            { faixa: [70, 80], status: "normal", termo: "Normal", nota: "✅ ScvO2 normal." },
            { faixa: [80.1, 100], status: "alto", termo: "Elevada", nota: "⚠️ ScvO2 elevada. Sépsis." }
        ]
    },

    "Capnografia (EtCO2)": {
        tipo: "exame",
        sinonimos: ["etco2 uti", "capnografia"],
        campos: [{ id: "valor", tipo: "input", label: "EtCO2", unidade: "mmHg", min: 0, max: 80 }],
        referencia: { min: 35, max: 45, unidade: "mmHg" },
        interpretacao: [
            { faixa: [0, 34], status: "baixo", termo: "Baixo", nota: "⚠️ EtCO2 baixo. Hiperventilação ou TEP." },
            { faixa: [35, 45], status: "normal", termo: "Normal", nota: "✅ EtCO2 normal." },
            { faixa: [45.1, 80], status: "alto", termo: "Elevado", nota: "⚠️ EtCO2 elevado. Hipoventilação." }
        ]
    },

    "Escala de Coma de Glasgow (Trauma)": {
        tipo: "escala",
        sinonimos: ["glasgow trauma", "gcs trauma"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "TCE leve. Observação." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderado", nota: "⚠️ TCE moderado. TC urgente." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ TCE grave. UCI/Intubação." }
        ]
    },



    /* ====================================================================== */
    /* LOTE 10 — B. TRAUMA (15 itens)                                          */
    /* ====================================================================== */

    "ISS (Injury Severity Score)": {
        tipo: "escala",
        sinonimos: ["iss", "injury severity score"],
        campos: [
            { id: "cabeca", tipo: "select", label: "Cabeça/pescoço", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }, { label: "4 — Crítica", peso: 16 }, { label: "5 — Incompatível", peso: 25 }] },
            { id: "face", tipo: "select", label: "Face", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }] },
            { id: "torax", tipo: "select", label: "Tórax", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }, { label: "4 — Crítica", peso: 16 }, { label: "5 — Incompatível", peso: 25 }] },
            { id: "abdomen", tipo: "select", label: "Abdómen", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }, { label: "4 — Crítica", peso: 16 }, { label: "5 — Incompatível", peso: 25 }] },
            { id: "extremidades", tipo: "select", label: "Extremidades", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }] },
            { id: "externo", tipo: "select", label: "Externo", opcoes: [{ label: "0 — Sem lesão", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Moderada", peso: 4 }, { label: "3 — Grave", peso: 9 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 8, label: "Leve" },
        interpretacao: [
            { faixa: [0, 8], status: "leve", classificacao: "Leve", nota: "Trauma leve. Alta provável." },
            { faixa: [9, 15], status: "moderado", classificacao: "Moderado", nota: "⚠️ Trauma moderado. Internamento." },
            { faixa: [16, 24], status: "grave", classificacao: "Grave", nota: "⚠️ Trauma grave. UCI." },
            { faixa: [25, 75], status: "muito_grave", classificacao: "Muito grave", nota: "⚠️ Trauma muito grave. UCI urgente." }
        ]
    },

    "RTS (Revised Trauma Score)": {
        tipo: "escala",
        sinonimos: ["rts", "revised trauma score"],
        campos: [
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "13-15", peso: 4 }, { label: "9-12", peso: 3 }, { label: "6-8", peso: 2 }, { label: "4-5", peso: 1 }, { label: "3", peso: 0 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: ">89", peso: 4 }, { label: "76-89", peso: 3 }, { label: "50-75", peso: 2 }, { label: "1-49", peso: 1 }, { label: "0", peso: 0 }] },
            { id: "fr", tipo: "select", label: "FR", opcoes: [{ label: "10-29", peso: 4 }, { label: ">29", peso: 3 }, { label: "6-9", peso: 2 }, { label: "1-5", peso: 1 }, { label: "0", peso: 0 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 11, max: 12, label: "Leve" },
        interpretacao: [
            { faixa: [11, 12], status: "leve", classificacao: "Trauma leve", nota: "Trauma leve." },
            { faixa: [8, 10], status: "moderado", classificacao: "Trauma moderado", nota: "⚠️ Trauma moderado." },
            { faixa: [0, 7], status: "grave", classificacao: "Trauma grave", nota: "⚠️ Trauma grave. UCI." }
        ]
    },

    "TRISS (Trauma Score)": {
        tipo: "escala",
        sinonimos: ["triss", "trauma score injury severity"],
        campos: [
            { id: "rts", tipo: "input", label: "RTS", unidade: "pontos", min: 0, max: 12 },
            { id: "iss", tipo: "input", label: "ISS", unidade: "pontos", min: 0, max: 75 },
            { id: "idade", tipo: "input", label: "Idade", unidade: "anos", min: 0, max: 120 }
        ],
        calculo: { formula: "(rts * 0.5) + (iss * 0.3) + (idade * 0.2)", mostrarFormula: "RTS×0.5 + ISS×0.3 + Idade×0.2" },
        referencia: { min: 0, max: 30, label: "Leve" },
        interpretacao: [
            { faixa: [0, 30], status: "leve", classificacao: "Leve", nota: "Trauma leve. Alta provável." },
            { faixa: [30.1, 60], status: "moderado", classificacao: "Moderado", nota: "⚠️ Trauma moderado. Internamento." },
            { faixa: [60.1, 100], status: "grave", classificacao: "Grave", nota: "⚠️ Trauma grave. UCI." }
        ]
    },

    "Escala de Coma de Glasgow (TCE)": {
        tipo: "escala",
        sinonimos: ["glasgow tce", "tce glasgow"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "TCE leve", nota: "TCE leve. Observação 24h." },
            { faixa: [9, 12], status: "moderado", classificacao: "TCE moderado", nota: "⚠️ TCE moderado. TC urgente." },
            { faixa: [3, 8], status: "grave", classificacao: "TCE grave", nota: "⚠️ TCE grave. UCI/Intubação." }
        ]
    },

    "Escala de Kampala (Trauma)": {
        tipo: "escala",
        sinonimos: ["kampala", "trauma score kampala"],
        campos: [
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "15", peso: 5 }, { label: "13-14", peso: 4 }, { label: "9-12", peso: 3 }, { label: "5-8", peso: 2 }, { label: "3-4", peso: 1 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: ">90", peso: 5 }, { label: "70-90", peso: 4 }, { label: "50-69", peso: 3 }, { label: "1-49", peso: 2 }, { label: "0", peso: 1 }] },
            { id: "fr", tipo: "select", label: "FR", opcoes: [{ label: "12-20", peso: 5 }, { label: "10-11 ou 21-29", peso: 4 }, { label: "6-9", peso: 3 }, { label: "1-5 ou >30", peso: 2 }, { label: "0", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 12, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [12, 15], status: "leve", classificacao: "Trauma leve", nota: "Trauma leve. Observação." },
            { faixa: [8, 11], status: "moderado", classificacao: "Trauma moderado", nota: "⚠️ Trauma moderado. Internamento." },
            { faixa: [3, 7], status: "grave", classificacao: "Trauma grave", nota: "⚠️ Trauma grave. UCI/centro de trauma." }
        ]
    },

    "Escala de Aldrete (Recuperação Pós-Anestésica)": {
        tipo: "escala",
        sinonimos: ["aldrete", "recuperacao anestesica"],
        campos: [
            { id: "actividade", tipo: "select", label: "Actividade", opcoes: [{ label: "0 — Imóvel", peso: 0 }, { label: "1 — 2 membros", peso: 1 }, { label: "2 — Move 4 membros", peso: 2 }] },
            { id: "resp", tipo: "select", label: "Respiração", opcoes: [{ label: "0 — Apneia", peso: 0 }, { label: "1 — Dispneia", peso: 1 }, { label: "2 — Normal", peso: 2 }] },
            { id: "circulacao", tipo: "select", label: "Circulação", opcoes: [{ label: "0 — PA ±50%", peso: 0 }, { label: "1 — PA ±20-50%", peso: 1 }, { label: "2 — PA ±20%", peso: 2 }] },
            { id: "consciencia", tipo: "select", label: "Consciência", opcoes: [{ label: "0 — Não responde", peso: 0 }, { label: "1 — Desperta à voz", peso: 1 }, { label: "2 — Alerta", peso: 2 }] },
            { id: "saturacao", tipo: "select", label: "SpO2", opcoes: [{ label: "0 — <90%", peso: 0 }, { label: "1 — 90-95%", peso: 1 }, { label: "2 — >95%", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 9, max: 10, label: "Alta" },
        interpretacao: [
            { faixa: [9, 10], status: "bom", classificacao: "Alta", nota: "✅ Critérios de alta da recuperação." },
            { faixa: [7, 8], status: "moderado", classificacao: "Observação", nota: "⚠️ Necessita observação." },
            { faixa: [0, 6], status: "grave", classificacao: "Não apto", nota: "⚠️ Não apto para alta. Monitorizar." }
        ]
    },

    "Escala de Trauma Craniano de Liverpool": {
        tipo: "escala",
        sinonimos: ["liverpool", "trauma craniano liverpool"],
        campos: [
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "15", peso: 0 }, { label: "13-14", peso: 1 }, { label: "9-12", peso: 2 }, { label: "≤8", peso: 3 }] },
            { id: "focal", tipo: "select", label: "Défice focal", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] },
            { id: "tc", tipo: "select", label: "Alterações na TC", opcoes: [{ label: "Não", peso: 0 }, { label: "Sim", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 1, label: "Baixo risco" },
        interpretacao: [
            { faixa: [0, 1], status: "bom", classificacao: "Baixo risco", nota: "✅ Baixo risco. Observação." },
            { faixa: [2, 3], status: "moderado", classificacao: "Risco moderado", nota: "⚠️ Risco moderado. Internamento." },
            { faixa: [4, 5], status: "grave", classificacao: "Alto risco", nota: "⚠️ Alto risco. Neurocirurgia." }
        ]
    },

    "Escala de Coma de Glasgow (Pediátrico)": {
        tipo: "escala",
        sinonimos: ["glasgow pediatrico", "gcs pediatrico"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI." }
        ]
    },

    "Escala de Silverman-Andersen (Trauma Neonatal)": {
        tipo: "escala",
        sinonimos: ["silverman trauma", "desconforto neonatal"],
        campos: [
            { id: "torax", tipo: "select", label: "Retracção torácica", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "intercostal", tipo: "select", label: "Retracção intercostal", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "xifoide", tipo: "select", label: "Retracção xifoide", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Leve", peso: 1 }, { label: "2 — Grave", peso: 2 }] },
            { id: "narinas", tipo: "select", label: "Batimento nasal", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Mínimo", peso: 1 }, { label: "2 — Marcado", peso: 2 }] },
            { id: "gemido", tipo: "select", label: "Gemido", opcoes: [{ label: "0 — Ausente", peso: 0 }, { label: "1 — Audível com estetoscópio", peso: 1 }, { label: "2 — Audível sem estetoscópio", peso: 2 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 3, label: "Leve" },
        interpretacao: [
            { faixa: [0, 3], status: "bom", classificacao: "Leve", nota: "✅ Desconforto leve." },
            { faixa: [4, 6], status: "moderado", classificacao: "Moderado", nota: "⚠️ Desconforto moderado. CPAP." },
            { faixa: [7, 10], status: "grave", classificacao: "Grave", nota: "⚠️ Desconforto grave. Ventilação." }
        ]
    },

    "Escala de Cincinnati (Trauma)": {
        tipo: "escala",
        sinonimos: ["cincinnati trauma", "avc trauma"],
        campos: [
            { id: "facial", tipo: "select", label: "Assimetria facial", opcoes: [{ label: "Normal", peso: 0 }, { label: "Assimétrico", peso: 1 }] },
            { id: "braco", tipo: "select", label: "Queda do braço", opcoes: [{ label: "Normal", peso: 0 }, { label: "Queda", peso: 1 }] },
            { id: "fala", tipo: "select", label: "Fala alterada", opcoes: [{ label: "Normal", peso: 0 }, { label: "Alterada", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 0, max: 0, label: "Normal" },
        interpretacao: [
            { faixa: [0, 0], status: "bom", classificacao: "Normal", nota: "✅ Sem sinais de AVC." },
            { faixa: [1, 3], status: "grave", classificacao: "Suspeita de AVC", nota: "⚠️ Suspeita de AVC. Código AVC." }
        ]
    },

    "Escala de Coma de Glasgow (Neurocirurgia)": {
        tipo: "escala",
        sinonimos: ["glasgow neurocirurgia", "gcs neuro"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve. Observação." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada. TC urgente." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. Neurocirurgia." }
        ]
    },

    "Escala de Coma de Glasgow (UTI Neonatal)": {
        tipo: "escala",
        sinonimos: ["glasgow neonatal", "gcs neonatal"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI neonatal." }
        ]
    },

    "Escala de Trauma de Kampala (Pediátrico)": {
        tipo: "escala",
        sinonimos: ["kampala pediatrico", "trauma pediatrico"],
        campos: [
            { id: "glasgow", tipo: "select", label: "Glasgow", opcoes: [{ label: "15", peso: 5 }, { label: "13-14", peso: 4 }, { label: "9-12", peso: 3 }, { label: "5-8", peso: 2 }, { label: "3-4", peso: 1 }] },
            { id: "pas", tipo: "select", label: "PAS", opcoes: [{ label: ">90", peso: 5 }, { label: "70-90", peso: 4 }, { label: "50-69", peso: 3 }, { label: "1-49", peso: 2 }, { label: "0", peso: 1 }] },
            { id: "fr", tipo: "select", label: "FR", opcoes: [{ label: "12-20", peso: 5 }, { label: "10-11 ou 21-29", peso: 4 }, { label: "6-9", peso: 3 }, { label: "1-5 ou >30", peso: 2 }, { label: "0", peso: 1 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 12, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [12, 15], status: "leve", classificacao: "Trauma leve", nota: "Trauma leve." },
            { faixa: [8, 11], status: "moderado", classificacao: "Trauma moderado", nota: "⚠️ Trauma moderado." },
            { faixa: [3, 7], status: "grave", classificacao: "Trauma grave", nota: "⚠️ Trauma grave. UCI." }
        ]
    },

    "Escala de Coma de Glasgow (Trauma Pediátrico)": {
        tipo: "escala",
        sinonimos: ["glasgow trauma pediatrico"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI." }
        ]
    },

    /* ====================================================================== */
    /* LOTE 10 — C. DIVERSOS E ESPECIAIS (15 itens)                            */
    /* ====================================================================== */

    "Escala de Coma de Glasgow (Emergência)": {
        tipo: "escala",
        sinonimos: ["glasgow emergencia", "gcs emergencia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada. TC urgente." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO GRAVE! UCI/Intubação." }
        ]
    },

    "Escala de Coma de Glasgow (Pré-Hospitalar)": {
        tipo: "escala",
        sinonimos: ["glasgow pre hospitalar", "gcs pre hospitalar"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve. Observação." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada. Transporte urgente." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ LESÃO GRAVE! Transporte imediato." }
        ]
    },

    "Escala de Coma de Glasgow (Pediatria Geral)": {
        tipo: "escala",
        sinonimos: ["glasgow pediatria", "gcs pediatria"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI." }
        ]
    },

    "Escala de Coma de Glasgow (Neuropediatria)": {
        tipo: "escala",
        sinonimos: ["glasgow neuropediatria", "gcs neuroped"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI." }
        ]
    },

    "Escala de Coma de Glasgow (Geriatria)": {
        tipo: "escala",
        sinonimos: ["glasgow geriatria", "gcs geriatria"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI." }
        ]
    },

    "Escala de Coma de Glasgow (Obstetrícia)": {
        tipo: "escala",
        sinonimos: ["glasgow obstetricia", "gcs obstetricia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada. TC." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI obstétrica." }
        ]
    },

    "Escala de Coma de Glasgow (Cardiologia)": {
        tipo: "escala",
        sinonimos: ["glasgow cardiologia", "gcs cardiologia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI cardiológica." }
        ]
    },

    "Escala de Coma de Glasgow (Pneumologia)": {
        tipo: "escala",
        sinonimos: ["glasgow pneumologia", "gcs pneumologia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI respiratória." }
        ]
    },

    "Escala de Coma de Glasgow (Nefrologia)": {
        tipo: "escala",
        sinonimos: ["glasgow nefrologia", "gcs nefrologia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI nefrológica." }
        ]
    },

    "Escala de Coma de Glasgow (Gastroenterologia)": {
        tipo: "escala",
        sinonimos: ["glasgow gastro", "gcs gastro"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI gastro." }
        ]
    },

    "Escala de Coma de Glasgow (Infectologia)": {
        tipo: "escala",
        sinonimos: ["glasgow infectologia", "gcs infectologia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI infectologia." }
        ]
    },

    "Escala de Coma de Glasgow (Hematologia)": {
        tipo: "escala",
        sinonimos: ["glasgow hematologia", "gcs hematologia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. UCI hematológica." }
        ]
    },

    "Escala de Coma de Glasgow (Oncologia)": {
        tipo: "escala",
        sinonimos: ["glasgow oncologia", "gcs oncologia"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. Cuidados paliativos/UCI." }
        ]
    },

    "Escala de Coma de Glasgow (Cuidados Paliativos)": {
        tipo: "escala",
        sinonimos: ["glasgow paliativos", "gcs paliativos"],
        campos: [
            { id: "ocular", tipo: "select", label: "Abertura Ocular", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }] },
            { id: "verbal", tipo: "select", label: "Resposta Verbal", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }] },
            { id: "motora", tipo: "select", label: "Resposta Motora", opcoes: [{ label: "1", peso: 1 }, { label: "2", peso: 2 }, { label: "3", peso: 3 }, { label: "4", peso: 4 }, { label: "5", peso: 5 }, { label: "6", peso: 6 }] }
        ],
        calculo: { tipo: "soma_pesos" },
        referencia: { min: 13, max: 15, label: "Leve" },
        interpretacao: [
            { faixa: [13, 15], status: "leve", classificacao: "Leve", nota: "Lesão leve." },
            { faixa: [9, 12], status: "moderado", classificacao: "Moderada", nota: "⚠️ Lesão moderada." },
            { faixa: [3, 8], status: "grave", classificacao: "Grave", nota: "⚠️ Lesão grave. Conforto e cuidados paliativos." }
        ]
    }






};

/* ==========================================================================
   CONFIGURAÇÃO VISUAL DOS STATUS
   ========================================================================== */
const STATUS_CONFIG = {
    baixo:       { cor: "#f59e0b", icone: "ri-arrow-down-circle-fill", label: "Baixo" },
    normal:      { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Normal" },
    alto:        { cor: "#ef4444", icone: "ri-arrow-up-circle-fill",   label: "Alto" },
    negativo:    { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Negativo" },
    leve:        { cor: "#f59e0b", icone: "ri-alert-fill",             label: "Leve" },
    moderado:    { cor: "#f97316", icone: "ri-alert-fill",             label: "Moderado" },
    grave:       { cor: "#ef4444", icone: "ri-error-warning-fill",     label: "Grave" },
    muito_grave: { cor: "#dc2626", icone: "ri-skull-fill",             label: "Muito Grave" },
    imune:       { cor: "#00843d", icone: "ri-check-double-fill",      label: "Imune" },
    bom:         { cor: "#00843d", icone: "ri-checkbox-circle-fill",   label: "Bom" },
    desconhecido:{ cor: "#94a3b8", icone: "ri-question-line",          label: "Desconhecido" }
};


/* ==========================================================================
   ESTADO GLOBAL
   ========================================================================== */
let itemAtual = null;
let valoresAtuais = {};

const inputSearch = document.getElementById("exame_nome");
const inputValor = document.getElementById("exame_valor");
const uniTag = document.getElementById("unidade_display");
const divSugestoes = document.getElementById("sugestoes_box");
const pResultado = document.getElementById("resultado");
const campoValorContainer = document.getElementById("campo_valor_container");
const camposDinamicosContainer = document.getElementById("campos_dinamicos_container");


/* ==========================================================================
   TEMA
   ========================================================================== */
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

function aplicarTema(tema) {
    if (tema === 'dark') {
        body.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'ri-sun-line';
        localStorage.setItem('tema', 'dark');
    } else {
        body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        if (themeIcon) themeIcon.className = 'ri-moon-line';
        localStorage.setItem('tema', 'light');
    }
}

if (localStorage.getItem('tema') === 'dark') {
    aplicarTema('dark');
} else {
    aplicarTema('light');
}

if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const temaAtual = body.getAttribute('data-theme');
        aplicarTema(temaAtual === 'dark' ? 'light' : 'dark');
    });
}


/* ==========================================================================
   MENU LATERAL
   ========================================================================== */
const btnHamburger = document.getElementById('btnHamburger');
const menuOverlay = document.getElementById('menuOverlay');
const menuLateral = document.getElementById('menuLateral');

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
    btnHamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        menuLateral.classList.contains('ativo') ? fecharMenu() : abrirMenu();
    });
    menuOverlay.addEventListener('click', fecharMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuLateral.classList.contains('ativo')) fecharMenu();
    });
}


/* ==========================================================================
   FECHAR SELECTS AO CLICAR FORA
   ========================================================================== */
function fecharTodosSelects() {
    document.querySelectorAll('.interpretador-select-options.aberto').forEach(options => {
        options.classList.remove('aberto');
        const trigger = options.closest('.interpretador-select-wrapper')?.querySelector('.interpretador-select-trigger');
        if (trigger) trigger.classList.remove('aberto');
    });
}

document.addEventListener('click', function(event) {
    document.querySelectorAll('.interpretador-select-wrapper').forEach(wrapper => {
        if (!wrapper.contains(event.target)) {
            const options = wrapper.querySelector('.interpretador-select-options');
            const trigger = wrapper.querySelector('.interpretador-select-trigger');
            if (options) options.classList.remove('aberto');
            if (trigger) trigger.classList.remove('aberto');
        }
    });
    if (!inputSearch.contains(event.target) && !divSugestoes.contains(event.target)) {
        divSugestoes.style.display = "none";
    }
});


/* ==========================================================================
   CRIAR SELECT PERSONALIZADO
   ========================================================================== */
function criarSelectPersonalizado(campo) {
    const wrapper = document.createElement("div");
    wrapper.className = "interpretador-select-wrapper";
    wrapper.style.marginBottom = "8px";

    const icon = document.createElement("i");
    icon.className = "ri-checkbox-line";
    wrapper.appendChild(icon);

    const group = document.createElement("div");
    group.className = "interpretador-select-group";

    const trigger = document.createElement("div");
    trigger.className = "interpretador-select-trigger";
    trigger.setAttribute("data-campo", campo.id);

    const spanSelecionado = document.createElement("span");
    spanSelecionado.className = "select-selecionado";
    spanSelecionado.textContent = "Selecione";
    trigger.appendChild(spanSelecionado);

    const arrow = document.createElement("i");
    arrow.className = "ri-arrow-down-s-line select-arrow";
    trigger.appendChild(arrow);

    trigger.addEventListener("click", function(e) {
        e.stopPropagation();
        fecharTodosSelects();
        const wrapper = this.closest('.interpretador-select-wrapper');
        const options = wrapper.querySelector('.interpretador-select-options');
        if (!options) return;
        options.classList.toggle('aberto');
        this.classList.toggle('aberto');
    });

    group.appendChild(trigger);

    const label = document.createElement("label");
    label.className = "label-flutuante";
    label.textContent = campo.label;
    group.appendChild(label);

    wrapper.appendChild(group);

    if (campo.unidade) {
        const divider = document.createElement("div");
        divider.className = "interpretador-select-divider";
        wrapper.appendChild(divider);
        const unidadeSpan = document.createElement("span");
        unidadeSpan.className = "interpretador-select-unidade";
        unidadeSpan.textContent = campo.unidade;
        wrapper.appendChild(unidadeSpan);
    }

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "interpretador-select-options";

    campo.opcoes.forEach((opt, idx) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "interpretador-select-option";
        if (idx === 0) optionDiv.classList.add("selecionado");

        const labelSpan = document.createElement("span");
        labelSpan.className = "option-label";
        labelSpan.textContent = opt.label;
        optionDiv.appendChild(labelSpan);

        optionDiv.addEventListener("click", function(e) {
            e.stopPropagation();

            const label = opt.label;
            const parentWrapper = this.closest('.interpretador-select-wrapper');
            const triggerEl = parentWrapper.querySelector('.interpretador-select-trigger');
            const selectedSpan = triggerEl.querySelector('.select-selecionado');
            const optionsContainer = parentWrapper.querySelector('.interpretador-select-options');

            selectedSpan.textContent = label;

            optionsContainer.querySelectorAll('.interpretador-select-option').forEach(o => {
                o.classList.remove('selecionado');
            });
            this.classList.add('selecionado');

            optionsContainer.classList.remove('aberto');
            triggerEl.classList.remove('aberto');

            if (opt.peso !== undefined) {
                valoresAtuais[campo.id] = {
                    label: opt.label,
                    valor: opt.valor !== undefined ? opt.valor : opt.label,
                    peso: opt.peso
                };
            } else {
                valoresAtuais[campo.id] = {
                    label: opt.label,
                    valor: opt.valor !== undefined ? opt.valor : opt.label
                };
            }
        });

        optionsContainer.appendChild(optionDiv);
    });

    wrapper.appendChild(optionsContainer);
    return wrapper;
}


/* ==========================================================================
   CRIAR INPUT PERSONALIZADO
   ========================================================================== */
function criarInputPersonalizado(campo) {
    const wrapper = document.createElement("div");
    wrapper.className = "interpretador-input-wrapper";
    wrapper.style.marginBottom = "8px";

    const icon = document.createElement("i");
    icon.className = "ri-ruler-2-line";
    wrapper.appendChild(icon);

    const group = document.createElement("div");
    group.className = "interpretador-input-group";

    const input = document.createElement("input");
    input.type = "number";
    input.id = campo.id;
    input.placeholder = " ";
    input.step = "0.01";

    if (campo.min !== undefined) input.min = campo.min;
    if (campo.max !== undefined) input.max = campo.max;

    input.addEventListener("input", (e) => {
        const valor = e.target.value;
        if (valor === "") {
            delete valoresAtuais[campo.id];
        } else {
            valoresAtuais[campo.id] = valor;
        }
    });

    group.appendChild(input);

    const label = document.createElement("label");
    label.className = "label-flutuante";
    label.textContent = campo.label;
    group.appendChild(label);

    wrapper.appendChild(group);

    if (campo.unidade) {
        const divider = document.createElement("div");
        divider.className = "interpretador-input-divider";
        wrapper.appendChild(divider);

        const unidadeSpan = document.createElement("span");
        unidadeSpan.className = "interpretador-input-unidade";
        unidadeSpan.textContent = campo.unidade;
        wrapper.appendChild(unidadeSpan);
    }

    return wrapper;
}


/* ==========================================================================
   MOSTRAR CAMPOS DO ITEM
   ========================================================================== */
function mostrarCamposDoItem(item) {
    if (!camposDinamicosContainer) return;

    camposDinamicosContainer.innerHTML = "";
    valoresAtuais = {};

    inputValor.value = "";
    inputValor.removeEventListener("input", handleInputValor);

    if (!item || !item.campos) {
        camposDinamicosContainer.style.display = "none";
        campoValorContainer.style.display = "none";
        return;
    }

    const temMultiplosCampos = item.campos.length > 1;
    const primeiroCampoNumerico = item.campos[0] && item.campos[0].tipo === "input";
    const temCalculo = !!item.calculo;

    if (temMultiplosCampos || !primeiroCampoNumerico || temCalculo) {
        campoValorContainer.style.display = "none";
        camposDinamicosContainer.style.display = "grid";
        camposDinamicosContainer.style.gridTemplateColumns = "1fr 1fr";
        camposDinamicosContainer.style.gap = "8px";
        camposDinamicosContainer.style.width = "100%";
        camposDinamicosContainer.style.marginTop = "10px";

        item.campos.forEach((campo) => {
            let elemento;
            if (campo.tipo === "select") {
                elemento = criarSelectPersonalizado(campo);
            } else {
                elemento = criarInputPersonalizado(campo);
            }
            camposDinamicosContainer.appendChild(elemento);
        });
    } else {
        campoValorContainer.style.display = "flex";
        inputValor.style.display = "flex";
        inputValor.type = "number";
        inputValor.value = "";
        inputValor.id = item.campos[0].id;

        if (item.campos[0].min !== undefined) inputValor.min = item.campos[0].min;
        if (item.campos[0].max !== undefined) inputValor.max = item.campos[0].max;

        camposDinamicosContainer.style.display = "none";

        const primeiroCampo = item.campos[0];
        if (primeiroCampo.unidade) {
            uniTag.textContent = primeiroCampo.unidade;
        } else {
            uniTag.textContent = "--";
        }

        const labelValor = document.querySelector("#campo_valor_container .label-flutuante");
        if (labelValor && primeiroCampo.label) {
            labelValor.textContent = primeiroCampo.label;
        }

        inputValor.removeEventListener("input", handleInputValor);
        inputValor.addEventListener("input", handleInputValor);
    }
}

function handleInputValor(e) {
    if (itemAtual && itemAtual.campos && itemAtual.campos.length === 1) {
        const valor = e.target.value;
        const campoId = itemAtual.campos[0].id;
        if (valor === "") {
            delete valoresAtuais[campoId];
        } else {
            valoresAtuais[campoId] = valor;
        }
    }
}


/* ==========================================================================
   FILTRAR EXAMES — VERSÃO SIMPLIFICADA E PREVISÍVEL
   Regras (por ordem de prioridade):
     1. Match exacto (nome ou sinónimo)           → prioridade 0
     2. Começa com o termo (nome ou sinónimo)     → prioridade 1
     3. Contém o termo como palavra inteira        → prioridade 2
     4. Contém o termo em qualquer parte           → prioridade 3 (só se ≥2 letras)
     5. Senão → ignora
   ========================================================================== */
function filtrarExames() {
    const termo = inputSearch.value.trim().toLowerCase();

    if (!termo) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    // Normaliza: remove acentos para comparação
    const normalizar = (s) => s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const termoNorm = normalizar(termo);
    const termoLen = termoNorm.length;

    const resultados = [];

    Object.keys(database).forEach(nome => {
        const config = database[nome];
        const tipo = config.tipo;

        const textos = [nome, ...(config.sinonimos || [])];

        let melhorPrioridade = null;
        let textoQueCasou = null;

        for (const texto of textos) {
            const textoNorm = normalizar(texto);

            // 1. Match exacto
            if (textoNorm === termoNorm) {
                if (melhorPrioridade === null || 0 < melhorPrioridade) {
                    melhorPrioridade = 0;
                    textoQueCasou = texto;
                }
                continue;
            }

            // Palavras do texto (separadas)
            const palavras = textoNorm.split(/[\s\-()\/,.:;]+/).filter(Boolean);

            // 2. Começa com o termo (primeira palavra)
            if (palavras.length > 0 && palavras[0].startsWith(termoNorm)) {
                if (melhorPrioridade === null || 1 < melhorPrioridade) {
                    melhorPrioridade = 1;
                    textoQueCasou = texto;
                }
                continue;
            }

            // 3. Alguma palavra começa com o termo
            if (palavras.some(p => p.startsWith(termoNorm))) {
                if (melhorPrioridade === null || 2 < melhorPrioridade) {
                    melhorPrioridade = 2;
                    textoQueCasou = texto;
                }
                continue;
            }

            // 4. Contém o termo em qualquer parte
            //    Só a partir de 2 letras (com 1 letra seria ruído demais)
            if (termoLen >= 2 && textoNorm.includes(termoNorm)) {
                if (melhorPrioridade === null || 3 < melhorPrioridade) {
                    melhorPrioridade = 3;
                    textoQueCasou = texto;
                }
            }
        }

        if (melhorPrioridade !== null) {
            resultados.push({
                nomeAlvo: nome,
                textoExibido: textoQueCasou || nome,
                tipo: tipo,
                prioridade: melhorPrioridade
            });
        }
    });

    // Ordena por prioridade e depois alfabeticamente
    resultados.sort((a, b) => {
        if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
        return a.nomeAlvo.localeCompare(b.nomeAlvo);
    });

    if (resultados.length === 0) {
        divSugestoes.style.display = "none";
        divSugestoes.innerHTML = "";
        return;
    }

    mostrarSugestoes(resultados.slice(0, 10), termo);
}


/* ==========================================================================
   MOSTRAR SUGESTÕES
   ========================================================================== */
function mostrarSugestoes(itens, termo) {
    divSugestoes.innerHTML = "";
    divSugestoes.style.display = "block";

    itens.forEach(item => {
        const div = document.createElement("div");
        div.className = "sugestao-item";

        const badge = document.createElement("span");
        badge.className = `sugestao-badge ${item.tipo}`;
        badge.textContent = item.tipo === "exame" ? "EXAME" : "ESCALA";

        const texto = document.createElement("span");
        texto.className = "sugestao-texto";
        // Mostra o nome real do item (não o sinónimo), mas destaca o termo pesquisado
        texto.innerHTML = destacarTexto(item.nomeAlvo, termo);

        div.appendChild(badge);
        div.appendChild(texto);

        div.addEventListener("click", () => {
            inputSearch.value = item.nomeAlvo;
            carregarItem(item.nomeAlvo);
            divSugestoes.style.display = "none";
        });

        divSugestoes.appendChild(div);
    });
}


/* ==========================================================================
   DESTACAR TEXTO — destaca o termo em qualquer posição, desde a 1ª letra
   ========================================================================== */
function destacarTexto(texto, termo) {
    if (!termo || !texto) return texto;

    const termoLimpo = termo.trim();
    if (!termoLimpo) return texto;

    // Escapa caracteres especiais de regex
    const termoEscapado = termoLimpo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Destaca em qualquer posição, sem exigir palavra inteira
    const regex = new RegExp(`(${termoEscapado})`, 'gi');

    return texto.replace(
        regex,
        '<strong style="font-weight: 700; color: var(--primary);">$1</strong>'
    );
}


/* ==========================================================================
   CARREGAR ITEM
   ========================================================================== */
function carregarItem(nome) {
    const config = database[nome];
    if (!config) return;

    valoresAtuais = {};
    inputValor.value = "";

    itemAtual = { nome, ...config };

    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) {
        labelBusca.textContent = config.tipo === "exame" ? "Exame" : "Escala";
    }

    if (camposDinamicosContainer) {
        camposDinamicosContainer.innerHTML = "";
    }

    mostrarCamposDoItem(config);

    pResultado.innerHTML = "";
    pResultado.style.display = "none";
}


/* ==========================================================================
   OBTER VALORES PREENCHIDOS
   ========================================================================== */
function getValoresPreenchidos() {
    const valores = {};
    let todosPreenchidos = true;
    let camposVazios = [];

    if (!itemAtual || !itemAtual.campos) {
        return { valores, todosPreenchidos: false, camposVazios: ['Nenhum campo disponível'] };
    }

    const temCamposDinamicos = camposDinamicosContainer &&
                               camposDinamicosContainer.children.length > 0 &&
                               camposDinamicosContainer.style.display !== "none";

    if (temCamposDinamicos) {
        for (const campo of itemAtual.campos) {
            let valor = valoresAtuais[campo.id];

            if (typeof valor === 'object' && valor !== null) {
                if (valor.valor === undefined || valor.valor === null || valor.valor === "") {
                    todosPreenchidos = false;
                    camposVazios.push(campo.label);
                } else {
                    valores[campo.id] = valor;
                }
            } else {
                if (valor === undefined || valor === null || valor === "") {
                    todosPreenchidos = false;
                    camposVazios.push(campo.label);
                } else {
                    valores[campo.id] = valor;
                }
            }
        }
    } else {
        const valor = inputValor.value.trim();
        const campo = itemAtual.campos[0];

        if (!valor || valor === "") {
            todosPreenchidos = false;
            camposVazios.push(campo.label);
        } else {
            valores[campo.id] = valor;
        }
    }

    return { valores, todosPreenchidos, camposVazios };
}


/* ==========================================================================
   CALCULAR FORMULA (segura)
   ========================================================================== */
function calcularFormula(formula, valores, campos) {
    const nomes = campos.map(c => c.id);

    const funcoesPermitidas = [
        'Math.sqrt', 'Math.pow', 'Math.log10', 'Math.log', 'Math.abs',
        'Math.min', 'Math.max', 'Math.round', 'Math.floor', 'Math.ceil',
        'Math.exp', 'Math.PI'
    ];

    let sobra = formula;
    for (const termo of funcoesPermitidas) sobra = sobra.split(termo).join(' ');
    for (const nome of nomes) sobra = sobra.split(nome).join(' ');

    if (!/^[\d\s+\-*/().,]*$/.test(sobra)) {
        console.error("Fórmula contém termos não permitidos:", formula);
        return null;
    }

    const args = nomes.map(nome => parseFloat(valores[nome]));
    if (args.some(v => isNaN(v))) return null;

    try {
        const fn = new Function(...nomes, `return (${formula});`);
        const resultado = fn(...args);
        return (typeof resultado === 'number' && isFinite(resultado)) ? resultado : null;
    } catch (erro) {
        console.error("Erro ao calcular fórmula:", erro);
        return null;
    }
}


/* ==========================================================================
   VALIDAR LIMITES POR CAMPO
   ========================================================================== */
function campoForaDoLimite(valores, campos) {
    for (const campo of campos) {
        if (campo.min === undefined && campo.max === undefined) continue;
        const valor = parseFloat(valores[campo.id]);
        if (isNaN(valor)) continue;
        if (campo.min !== undefined && valor < campo.min) {
            return { campo, valor, limite: campo.min, direcao: "baixo" };
        }
        if (campo.max !== undefined && valor > campo.max) {
            return { campo, valor, limite: campo.max, direcao: "alto" };
        }
    }
    return null;
}

function mensagemCampoForaDoLimite(violacao) {
    const tipoLimite = violacao.direcao === "baixo" ? "mínimo" : "máximo";
    const unidade = violacao.campo.unidade ? ` ${violacao.campo.unidade}` : "";
    return `⚠️ ${violacao.campo.label} fora do limite (${tipoLimite} ${violacao.limite}${unidade}). Verifique o valor inserido.`;
}


/* ==========================================================================
   CALCULAR VALOR FINAL
   ========================================================================== */
function calcularValorFinal(config, valores) {
    if (!config.calculo) {
        const primeiroCampo = config.campos[0];
        const v = valores[primeiroCampo.id];
        if (v && typeof v === "object") return v.valor;
        return isNaN(parseFloat(v)) ? null : parseFloat(v);
    }

    const calc = config.calculo;

    if (calc.tipo === "soma_pesos") {
        let soma = 0;
        for (const campo of config.campos) {
            const v = valores[campo.id];
            if (v && typeof v === "object" && v.peso !== undefined) {
                soma += v.peso;
            }
        }
        return soma;
    }

    if (calc.formula) {
        return calcularFormula(calc.formula, valores, config.campos);
    }

    if (calc.tipo === "padrao") {
        const padrao = {};
        for (const chave of calc.chave) {
            const v = valores[chave];
            if (v && typeof v === "object") padrao[chave] = v.valor;
            else padrao[chave] = v;
        }
        return padrao;
    }

    return null;
}


/* ==========================================================================
   ENCONTRAR INTERPRETAÇÃO
   ========================================================================== */
function encontrarInterpretacao(config, valorFinal) {
    const lista = config.interpretacao || [];

    if (valorFinal && typeof valorFinal === "object" && !Array.isArray(valorFinal)) {
        for (const item of lista) {
            if (!item.padrao) continue;
            let ok = true;
            for (const [k, v] of Object.entries(item.padrao)) {
                if (valorFinal[k] !== v) { ok = false; break; }
            }
            if (ok) return item;
        }
        return null;
    }

    const num = parseFloat(valorFinal);
    if (isNaN(num)) return null;

    for (const item of lista) {
        if (!item.faixa) continue;
        if (num >= item.faixa[0] && num <= item.faixa[1]) return item;
    }
    return null;
}


/* ==========================================================================
   VERIFICAR LIMITES GLOBAIS
   ========================================================================== */
function validarLimitesGlobais(config, valorFinal) {
    if (typeof valorFinal !== "number") return null;
    const limites = config.limites;
    if (!limites) return null;
    if (valorFinal < limites.min || valorFinal > limites.max) {
        const direcao = valorFinal < limites.min ? "BAIXO" : "ALTO";
        return `⚠️ VALOR EXTREMAMENTE ${direcao}! Fora dos limites clinicamente esperados (${limites.min} - ${limites.max}). Verificar resultado.`;
    }
    return null;
}


/* ==========================================================================
   INFERIR CATEGORIA UNIVERSAL (só para escalas)
   Regra: se está dentro da referência → NORMAL, abaixo → BAIXO, acima → ALTO
   ========================================================================== */
function inferirCategoriaEscala(valorFinal, config) {
    if (typeof valorFinal !== "number") return "NORMAL";
    const ref = config.referencia;
    if (!ref) return "NORMAL";
    if (valorFinal < ref.min) return "BAIXO";
    if (valorFinal > ref.max) return "ALTO";
    return "NORMAL";
}

/* ==========================================================================
   INFERIR CATEGORIA UNIVERSAL
   --------------------------------------------------------------------------
   Regra:
     - SE tem referência E NÃO tem estágios (leve/moderado/grave/muito_grave)
         → usa a referência: valor < min → BAIXO | > max → ALTO | senão NORMAL
     - SENÃO (exame classificado ou escala)
         → mapeia pelo status
   ========================================================================== */
function inferirCategoriaUniversal(valorFinal, config, status) {
    // Deteta se o item tem estágios (exame classificado / escala)
    const temEstagios = (config.interpretacao || []).some(i =>
        i.status === "leve" ||
        i.status === "moderado" ||
        i.status === "grave" ||
        i.status === "muito_grave"
    );

    const temReferencia = !!config.referencia;

    // Objeto (padrão sorológico) → mapeia pelo status
    if (valorFinal && typeof valorFinal === "object") {
        return mapearStatus(status);
    }

    // Exame simples (tem referência E NÃO tem estágios) → usa referência
    if (
        typeof valorFinal === "number" &&
        !isNaN(valorFinal) &&
        temReferencia &&
        !temEstagios
    ) {
        if (valorFinal < config.referencia.min) return "BAIXO";
        if (valorFinal > config.referencia.max) return "ALTO";
        return "NORMAL";
    }

    // Escala com referência e sem estágios → mesma lógica
    if (
        typeof valorFinal === "number" &&
        !isNaN(valorFinal) &&
        temReferencia &&
        config.tipo === "escala"
    ) {
        if (valorFinal < config.referencia.min) return "BAIXO";
        if (valorFinal > config.referencia.max) return "ALTO";
        return "NORMAL";
    }

    // Tudo o resto → mapeia pelo status
    return mapearStatus(status);
}

function mapearStatus(status) {
    switch (status) {
        case "negativo":    return "NEGATIVO";
        case "imune":       return "POSITIVO";
        case "baixo":       return "BAIXO";
        case "normal":      return "NORMAL";
        case "alto":        return "ALTO";
        case "bom":         return "NORMAL";
        case "leve":        return "LEVE";
        case "moderado":    return "MODERADO";
        case "grave":       return "GRAVE";
        case "muito_grave": return "MUITO GRAVE";
        default:            return "NORMAL";
    }
}


/* ==========================================================================
   EXIBIR RESULTADO
   ========================================================================== */
function exibirResultado(resultado, config) {
    if (!resultado) {
        mostrarErro("Erro ao interpretar os dados.");
        return;
    }

    const configStatus = STATUS_CONFIG[resultado.status] || STATUS_CONFIG.desconhecido;
    let statusCor = configStatus.cor;
    let statusIcone = configStatus.icone;

    // ========== VALOR PRINCIPAL ==========
    let valorDisplay = "—";
    let unidadeDisplay = "";
    const tipo = config.tipo;

    if (typeof resultado.valorOriginal === "number") {
        valorDisplay = Number.isInteger(resultado.valorOriginal)
            ? resultado.valorOriginal.toString()
            : resultado.valorOriginal.toFixed(1);
    } else if (resultado.valorOriginal !== undefined) {
        valorDisplay = resultado.valorOriginal;
    }

    if (resultado.unidade) unidadeDisplay = resultado.unidade;
    else if (tipo === "escala" && config.calculo && config.calculo.tipo === "soma_pesos") {
        unidadeDisplay = "pontos";
    }

    // ========== TEXTO DO CARD ESQUERDO ==========
    const statusLabel = inferirCategoriaUniversal(
        resultado.valorOriginal,
        config,
        resultado.status
    );

    // ========== INFO ESQUERDA (referência) ==========
    let infoEsquerda = "";
    if (config.referencia) {
        const refLabel = config.referencia.label || "Referência";
        const unidadeRef = config.referencia.unidade ? ` ${config.referencia.unidade}` : "";
        infoEsquerda = `${refLabel}: ${config.referencia.min} - ${config.referencia.max}${unidadeRef}`;
    }

    // ========== INFO DIREITA (termo técnico) ==========
    let infoDireita = "";
    if (resultado.termo && resultado.classificacao) {
        infoDireita = resultado.classificacao;
    } else if (resultado.termo) {
        infoDireita = resultado.termo;
    } else if (resultado.classificacao) {
        infoDireita = resultado.classificacao;
    }

    // ========== BARRA DE PROGRESSO ==========
    // Regras:
    //   BAIXO → amarela, curta (10%)
    //   NORMAL → verde, posicionada conforme o valor no intervalo
    //   ALTO → vermelha, cheia (100%)
    let percentualBarra = 0;
    let corBarra = statusCor;
    let mostrarBarra = false;

    const statusLower = (resultado.status || "").toLowerCase();

    // Deteta se é "baixo" pelo label (para exames simples com referência)
    const ehBaixo = statusLower === "baixo" || statusLabel === "BAIXO";
    const ehAlto  = statusLower === "alto"  || statusLabel === "ALTO";
    const ehNormal = statusLower === "normal" ||
                     statusLower === "bom"    ||
                     statusLower === "negativo" ||
                     statusLower === "imune"  ||
                     statusLabel === "NORMAL"  ||
                     statusLabel === "NEGATIVO";

    if (ehBaixo) {
        mostrarBarra = true;
        percentualBarra = 10;
        corBarra = "#f59e0b"; // amarelo
    } else if (ehAlto) {
        mostrarBarra = true;
        percentualBarra = 100;
        corBarra = "#ef4444"; // vermelho
    } else if (ehNormal && typeof resultado.valorOriginal === "number" && config.referencia) {
        mostrarBarra = true;
        const refMin = config.referencia.min;
        const refMax = config.referencia.max;
        const intervalo = refMax - refMin;

        if (intervalo > 0) {
            percentualBarra = ((resultado.valorOriginal - refMin) / intervalo) * 100;
            percentualBarra = Math.max(20, Math.min(95, percentualBarra));
        } else {
            percentualBarra = 50;
        }
        // Verde com ligeira variação conforme posição
        const intensidade = percentualBarra / 100;
        const r = Math.round(74 - (74 - 0) * intensidade);
        const g = Math.round(222 - (222 - 132) * intensidade);
        const b = Math.round(128 - (128 - 61) * intensidade);
        corBarra = `rgb(${r}, ${g}, ${b})`;
    } else if (ehNormal) {
        // Normal sem referência (perfis, etc.)
        mostrarBarra = true;
        percentualBarra = 50;
        corBarra = "#00843d";
    } else if (typeof resultado.valorOriginal === "number" && !isNaN(resultado.valorOriginal)) {
        // Fallback (ex.: gravidade sem ser baixo/alto/normal)
        const todasFaixas = (config.interpretacao || [])
            .filter(i => Array.isArray(i.faixa))
            .map(i => i.faixa);

        if (todasFaixas.length > 0) {
            const minGeral = Math.min(...todasFaixas.map(f => f[0]));
            const maxGeral = Math.max(...todasFaixas.map(f => f[1]));
            const intervalo = maxGeral - minGeral;

            if (intervalo > 0) {
                percentualBarra = ((resultado.valorOriginal - minGeral) / intervalo) * 100;
                percentualBarra = Math.max(2, Math.min(98, percentualBarra));
                mostrarBarra = true;
            }
        }
    }

    // ========== CLASSE DA NOTA ==========
    let notaClasse = "normal";
    if (resultado.status === "baixo" || resultado.status === "leve" || resultado.status === "moderado") {
        notaClasse = "alerta";
    } else if (resultado.status === "alto" || resultado.status === "grave" || resultado.status === "muito_grave") {
        notaClasse = "critico";
    }

    // ========== MONTA CARD ==========
    let html = `
        <div class="interpretador-card" style="background: var(--card-bg); border-radius: 20px; padding: 20px 22px;">
            <div class="interpretador-card-header">
                <div class="interpretador-card-status" style="color: ${statusCor};">
                    <i class="${statusIcone}"></i>
                    <span class="status-label">${statusLabel}</span>
                </div>
                <div class="interpretador-card-valor" style="color: ${statusCor};">
                    <span class="valor-numero">${valorDisplay}</span>${unidadeDisplay ? `<span class="valor-unidade"> ${unidadeDisplay}</span>` : ''}
                </div>
            </div>

            <div class="interpretador-card-sub">
                <span class="interpretador-card-referencia">${infoEsquerda}</span>
                <span class="interpretador-card-termo">${infoDireita}</span>
            </div>
    `;

    if (mostrarBarra) {
        html += `
            <div class="interpretador-card-bar-wrapper">
                <div class="interpretador-card-bar">
                    <div class="interpretador-card-bar-fill" style="width: ${percentualBarra}%; background: ${corBarra};"></div>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="interpretador-card-bar-wrapper">
                <div class="interpretador-card-bar vazia">
                    <div class="interpretador-card-bar-fill" style="width: 0%;"></div>
                </div>
            </div>
        `;
    }

    html += `
            <div class="interpretador-card-nota ${notaClasse}">
                ${resultado.nota}
            </div>
        </div>
    `;

    pResultado.innerHTML = html;
    pResultado.style.display = "block";
    animarResultado();
}


/* ==========================================================================
   INTERPRETAR (motor unificado)
   ========================================================================== */
function interpretar(config, valores) {
    const valorFinal = calcularValorFinal(config, valores);

    if (valorFinal === null) return null;

    const erroLimites = validarLimitesGlobais(config, valorFinal);
    if (erroLimites) {
        return {
            status: "desconhecido",
            nota: erroLimites,
            valorOriginal: valorFinal,
            unidade: config.campos[0]?.unidade || config.referencia?.unidade || ""
        };
    }

    const interpretacao = encontrarInterpretacao(config, valorFinal);

    if (!interpretacao) {
        return {
            status: "desconhecido",
            nota: "Valor não se enquadra em nenhuma categoria conhecida. Verificar resultado.",
            valorOriginal: valorFinal,
            unidade: config.campos[0]?.unidade || config.referencia?.unidade || ""
        };
    }

    return {
        status: interpretacao.status,
        nota: interpretacao.nota,
        termo: interpretacao.termo || null,
        classificacao: interpretacao.classificacao || null,
        valorOriginal: valorFinal,
        unidade: config.campos[0]?.unidade || config.referencia?.unidade || ""
    };
}


/* ==========================================================================
   ANALISAR
   ========================================================================== */
function analisar() {
    const nome = inputSearch.value.trim();

    if (!nome) {
        mostrarErro("⚠️ Pesquise um exame ou escala!");
        return;
    }

    const config = database[nome];
    if (!config) {
        mostrarErro(`⚠️ "${nome}" não encontrado na base de dados!`);
        return;
    }

    if (!itemAtual || itemAtual.nome !== nome) {
        carregarItem(nome);
        setTimeout(() => executarAnalise(config), 150);
    } else {
        executarAnalise(config);
    }
}


function executarAnalise(config) {
    const { valores, todosPreenchidos, camposVazios } = getValoresPreenchidos();

    if (!todosPreenchidos) {
        mostrarErro(`⚠️ Preencha todos os campos: ${camposVazios.join(', ')}.`);
        return;
    }

    const violacao = campoForaDoLimite(valores, config.campos);
    if (violacao) {
        mostrarErro(mensagemCampoForaDoLimite(violacao));
        return;
    }

    try {
        const resultado = interpretar(config, valores);

        if (!resultado) {
            mostrarErro("⚠️ Não foi possível interpretar os dados. Verifique os valores.");
            return;
        }

        exibirResultado(resultado, config);

    } catch (error) {
        console.error("Erro na análise:", error);
        mostrarErro("⚠️ Ocorreu um erro ao interpretar os dados. Tente novamente.");
    }
}


/* ==========================================================================
   MOSTRAR ERRO
   ========================================================================== */
function mostrarErro(mensagem) {
    pResultado.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border-radius: 20px; padding: 20px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2);">
            <i class="ri-error-warning-fill" style="font-size: 2.5rem; color: #ef4444; display: block; margin-bottom: 10px;"></i>
            <span style="color: var(--text); font-weight: 500; font-size: 0.95rem;">${mensagem}</span>
        </div>
    `;
    pResultado.style.display = "block";
    animarResultado();
}


/* ==========================================================================
   ANIMAR RESULTADO
   ========================================================================== */
function animarResultado() {
    if (!pResultado) return;
    pResultado.classList.remove("vibrar");
    void pResultado.offsetWidth;
    pResultado.classList.add("vibrar");
}


/* ==========================================================================
   LIMPAR
   ========================================================================== */
function limpar() {
    inputSearch.value = "";

    divSugestoes.style.display = "none";
    divSugestoes.innerHTML = "";

    inputValor.value = "";
    inputValor.removeEventListener("input", handleInputValor);
    campoValorContainer.style.display = "none";
    uniTag.textContent = "--";

    if (camposDinamicosContainer) {
        camposDinamicosContainer.innerHTML = "";
        camposDinamicosContainer.style.display = "none";
    }

    pResultado.innerHTML = "";
    pResultado.style.display = "none";
    pResultado.classList.remove("vibrar");

    valoresAtuais = {};
    itemAtual = null;

    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) {
        labelBusca.textContent = "Exame ou Escala";
    }

    fecharTodosSelects();

    setTimeout(() => inputSearch.focus(), 100);
}


/* ==========================================================================
   EVENTOS
   ========================================================================== */
inputSearch.addEventListener("input", function() {
    filtrarExames();
});


inputSearch.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const primeiroItem = divSugestoes.querySelector('.sugestao-item');
        if (primeiroItem) {
            primeiroItem.click();
        } else {
            const nome = inputSearch.value.trim();
            if (nome && database[nome]) {
                carregarItem(nome);
                setTimeout(() => analisar(), 150);
            } else {
                analisar();
            }
        }
    }
});

document.getElementById("btnAnalisar").addEventListener("click", function(e) {
    e.preventDefault();
    analisar();
});

document.getElementById("btnLimpar").addEventListener("click", function(e) {
    e.preventDefault();
    limpar();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharTodosSelects();
        divSugestoes.style.display = "none";
    }
});


/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
function inicializar() {
    console.log("🚀 Interpretador Clínico v2 — Exames & Escalas");

    const labelBusca = document.querySelector("#exame_nome + .label-flutuante");
    if (labelBusca) labelBusca.textContent = "Exame ou Escala";

    if (camposDinamicosContainer) {
        camposDinamicosContainer.style.display = "none";
        camposDinamicosContainer.innerHTML = "";
    }

    if (campoValorContainer) campoValorContainer.style.display = "none";

    if (pResultado) {
        pResultado.innerHTML = "";
        pResultado.style.display = "none";
    }

    if (uniTag) uniTag.textContent = "--";

    valoresAtuais = {};
    itemAtual = null;

    const urlParams = new URLSearchParams(window.location.search);
    const itemParam = urlParams.get('item');
    if (itemParam && database[itemParam]) {
        setTimeout(() => {
            inputSearch.value = itemParam;
            carregarItem(itemParam);
            setTimeout(() => analisar(), 200);
        }, 500);
    }

    console.log(`✅ ${Object.keys(database).length} itens disponíveis.`);
    console.log(`📋 Exames: ${Object.values(database).filter(i => i.tipo === 'exame').length} | Escalas: ${Object.values(database).filter(i => i.tipo === 'escala').length}`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}


/* ==========================================================================
   DEBUG
   ========================================================================== */
window.__interpretador = {
    database,
    itemAtual: () => itemAtual,
    valoresAtuais: () => valoresAtuais,
    analisar,
    limpar,
    carregarItem,
    fecharTodosSelects
};
console.log("📌 Debug: window.__interpretador");





