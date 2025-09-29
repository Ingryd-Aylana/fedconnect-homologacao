// Mapa: código/numero da apólice -> possíveis nomes de produto (array para lidar com duplicidades)
export const APOLICE_DEPARA = {
  "132": ["ALUG"],
  "238": ["ALUG"],
  "274": ["ALUG"],
  "278": ["ALUG"],
  "279": ["ALUG"],
  "280": ["ALUG"],
  "4803": ["ALUG", "VIDA"], // aparece em ambas na sua lista
  "4008": ["CONTEUDO"],
  "5008": ["CONTEUDO"],
  "9008": ["CONTEUDO"],
  "15008": ["CONTEUDO"],
  "10008": ["CONTEUDO"],
  "131": ["GARANTIA DA COTA"],
  "178": ["GARANTIA DA COTA"],
  "275": ["GARANTIA DA COTA"],
  "277": ["GARANTIA DA COTA"],
  "281": ["GARANTIA DA COTA"],
  "283": ["GARANTIA DA COTA"],
  "6008": ["LOCAÇÃO MENSAL"],
  "7008": ["LOCAÇÃO MENSAL"],
  "R'": ["LOCAÇÃO ANUAL"],
  "C": ["LOCAÇÃO ANUAL"],
  "13008": ["RUPTURA"],
  "14008": ["RUPTURA"],
  "3701": ["VIDA"],
  "4802": ["VIDA"],
  "4805": ["VIDA"],
  "4806": ["VIDA"],
  "5803": ["VIDA"],
  "6800": ["VIDA"],
  "7301": ["VIDA"],
  "7500": ["VIDA"],
  "7501": ["VIDA"],
  "7800": ["VIDA"],
  "8800": ["VIDA"],
  "BOAT": ["BOAT"],
  "BOAT01": ["BOAT"],
  "BOATRN01": ["BOAT"],
  "VR000": ["VR"],
  "VR0001": ["VR"],
  "CD000010": ["SST"],
  "CD0001": ["SST"],
  "CD00010": ["SST"],
  "CD00011": ["SST"],
  "CD00012": ["SST"],
  "CD0002": ["SST", "ASO"], // aparece como SST e também ASO
  "CD0003": ["CURSO"],
  "CD0004": ["AUTOVISTORIA"],
  "CD0005": ["SST"],
  "CD0006": ["SST"],
  "CD0007": ["VISTORIA LOCATICIA"],
  "CD0008": ["SST"],
  "CD0009": ["SST"],
  "CD0010": ["SST"],
  "CD0010.1": ["SST"],
  "CD0011": ["SST"],
  "CDBOAT01": ["CONSULTA MEDICA - EXAME"],
  "CEBOAT01": ["CONSULTA MEDICA - EXAME"],
  "BAPS001": ["BAPS"],
  "BPS": ["BAPS"],
  "BPS001": ["BAPS"],
};

// Helper: resolve pelo código (e tenta desambiguar com pistas opcionais)
export function resolveNomeApolice(codeRaw, hintTexts = []) {
  if (!codeRaw) return null;
  const code = String(codeRaw).trim().toUpperCase();
  const produtos = APOLICE_DEPARA[code];
  if (!produtos || produtos.length === 0) return null;
  if (produtos.length === 1) return produtos[0];

  // tenta desambiguar usando valores do próprio registro (ex.: PRODUTO/RAMO/TIPO)
  const hints = hintTexts
    .filter(Boolean)
    .map((h) => String(h).toUpperCase());

  for (const h of hints) {
    const match = produtos.find((p) => h.includes(String(p).toUpperCase()));
    if (match) return match;
  }

  // não deu pra desambiguar → retorna todos
  return [...new Set(produtos)].join(" / ");
}

// Conveniência: extrai o código do próprio objeto de resultado
export function resolveNomeApoliceFromRecord(seg) {
  if (!seg) return null;
  const candidateKeys = [
    "APOLICE",
    "APÓLICE",
    "APOLICE_NUM",
    "APOLICE_ID",
    "NUM_APOLICE",
    "NUMERO_APOLICE",
    "APOLICECOD",
  ];
  let code = null;
  for (const k of candidateKeys) {
    if (seg[k] != null && seg[k] !== "") {
      code = String(seg[k]).trim();
      break;
    }
  }
  if (!code) return null;

  // pistas para desambiguar
  const hints = [seg.PRODUTO, seg.RAMO, seg.TIPO];
  return resolveNomeApolice(code, hints);
}
