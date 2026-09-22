import { MealType } from '../../shared/types/nutrition';

export function buildMealExtractionPrompt(
  userInput?: string,
  preferredMealType?: MealType
): string {
  return `Você é um nutricionista especialista encarregado de decompor esta refeição (a partir da foto ou do texto fornecido) em dados nutricionais estruturados em formato JSON estrito.

Contexto fornecido pelo utilizador: "${userInput || 'Analisar imagem da refeição'}".
${preferredMealType ? `Tipo de refeição sugerido: ${preferredMealType}.` : ''}

Instruções rigorosas:
1. Identifique todos os alimentos presentes no prato.
2. Para cada alimento, estime a quantidade/porção realista (ex: "140g", "4 colheres de sopa", "1 unidade").
3. Estime calorias (kcal), proteínas (g), hidratos de carbono (g) e gorduras (g).
4. Verifique se o prato cumpre a proporção do plano da nutricionista: aproximadamente 1/2 do prato com hortícolas/salada, 1/4 hidratos e 1/4 proteína ("adheresToPlateRule": true ou false).
5. Atribua o "mealType" apropriado entre: "pequeno_almoco", "almoco", "lanche", "jantar", "ceia", "snack".

DEVOLVA EXCLUSIVAMENTE UM OBJETO JSON VÁLIDO (sem markdown \`\`\`json, sem texto antes ou depois) com esta estrutura exata:
{
  "name": "Nome resumido da refeição",
  "mealType": "almoco",
  "items": [
    {
      "name": "Peito de Frango Grelhado",
      "portion": "140g",
      "calories": 230,
      "protein": 43,
      "carbs": 0,
      "fat": 5
    }
  ],
  "totals": {
    "calories": 450,
    "protein": 45,
    "carbs": 42,
    "fat": 8
  },
  "adheresToPlateRule": true,
  "notes": "Observação breve sobre a refeição"
}`;
}
