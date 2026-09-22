import { NutritionPlan } from '../types/nutrition';

export const DEFAULT_PLAN_MARKDOWN = `## PLANO ALIMENTAR WILLIAN BACKHAUS

14/01/2026

## PEQUENO ALMOÇO (9H30)

## OPÇÃO 1)
- Iogurte skyr/proteico
- 1 peça de fruta (banana)

## OPÇÃO 2)
- 4 colheres de sopa de iogurte grego ligeiro 0%
- 1 peça de fruta
- 2 colheres de sopa de aveia/corn flackes 0%
- Canela

## OPÇÃO 3)
- 1 fatia de pão centeio/integral (50g)
- 1 fatia de queijo ou queijo de barrar light ou queijo cottage
- 1 chávena de leite magro ou 1 iogurte magro

## ALMOÇO (13H)
- Legumes/salada: 1/4 do prato
- Proteína (Carne/peixe/2 ovos): 1/2 do prato = 140g carne ou 150g peixe (tamanho da palma da mão). Preferir carnes brancas (frango, peru, coelho) ou peixes magros (pescada, robalo, carapau, dourada)
- Hidratos (Arroz/massa/batata/quinoa/couscous): 1/2 do prato = 4 colheres de sopa (100g) ou 3 batatas tamanho 1 ovo (110g) OU 5 colheres sopa leguminosas (feijão, grão, lentilhas, ervilhas) – 120g
- + 1 Peça de fruta
- 1 colher sopa de azeite para confeção
- Bebida: água (OU optar por refeições Revolution Food)

## LANCHE (17H) – Pré treino

## OPÇÃO 1) (juntar tudo numa tigela)
- 4 colheres de sopa de iogurte grego ligeiro 0%
- 1 peça de fruta
- 2 colheres de sopa de aveia/corn flackes 0%
- 1 fio de mel (colher de café)

## OPÇÃO 2)
- 1 ovo
- 3 tortilhas/marinheiras
- 1 peça de fruta

## OPÇÃO 3) (caso não tenhas comido pão no pequeno almoço)
- 1 fatia de pão centeio/integral (50g)
- 1 fatia de queijo ou queijo de barrar light ou queijo cottage
- 1 chávena de leite magro ou 1 iogurte magro

Pós Treino: Caseína

## JANTAR (20H30)
## Sopa de legumes sem batata + mini prato:
- Legumes/salada: 1/4 do prato
- Proteína (Carne/peixe/2 ovos): 1/2 do prato = 120g carne ou 130g peixe OU lata atum/salmão OU 2 ovos
- Hidratos: 1/2 do prato = 3 colheres sopa leguminosas (80g)
- 1 colher sopa de azeite para confeção
- Bebida: água

## CEIA SOS:
OPÇÃO 1) Chávena de leite com café sem açúcar + 2-3 tortilhas/marinheiras
OPÇÃO 2) 1 iogurte natural/aromas magro + 1 peça de fruta

## COMPROMISSOS ATÉ À PRÓXIMA CONSULTA:
- Encomendar 2x semana (1x h3 sem batata frita + 1x fast food menu mais simples)
- Apenas 1 lata cola 0 por dia
- Aumentar o consumo de água diário (2L por dia)
- Deitar mais cedo

## LISTA DE EQUIVALÊNCIAS DE FRUTA:
- Banana (80g): 1 unidade pequena da madeira ou 1/2 unidade banana equador
- Cereja (90g): 10 a 15 unidades
- Figo (80g): 1 unidade pequena
- Laranja (170g): 1 unidade média
- Maçã (90g): 1 unidade pequena
- Manga (100g): 1/2 manga pequena
- Melancia (200g): 1 fatia média
- Melão (200g): 1 fatia média
- Morangos (200g): 12 morangos pequenos ou 6 grandes
- Framboesas (240g)
- Mirtilos (50g)
- Kiwi (100g): 1 unidade média
- Romã (170g): 1 unidade média
- Tangerina (150g): 2 unidades pequenas
`;

export const DEFAULT_NUTRITION_PLAN: NutritionPlan = {
  id: 'current_plan',
  title: 'Plano Alimentar Willian Backhaus',
  date: '2026-01-14',
  markdownContent: DEFAULT_PLAN_MARKDOWN,
  meals: [
    {
      mealType: 'pequeno_almoco',
      label: 'Pequeno Almoço',
      recommendedTime: '09:30',
      options: [
        {
          optionNumber: 1,
          items: ['Iogurte skyr/proteico', '1 peça de fruta (banana 80g)'],
        },
        {
          optionNumber: 2,
          items: [
            '4 colheres sopa iogurte grego ligeiro 0%',
            '1 peça de fruta',
            '2 colheres sopa aveia ou corn flakes 0%',
            'Canela a gosto',
          ],
        },
        {
          optionNumber: 3,
          items: [
            '1 fatia pão centeio/integral (50g)',
            '1 fatia queijo / queijo de barrar light / cottage',
            '1 chávena de leite magro ou 1 iogurte magro',
          ],
        },
      ],
    },
    {
      mealType: 'almoco',
      label: 'Almoço',
      recommendedTime: '13:00',
      options: [
        {
          optionNumber: 1,
          items: [
            'Legumes ou salada fria (1/4 do prato)',
            'Proteína: 140g carne branca (frango, peru, coelho) ou 150g peixe magro (pescada, dourada, robalo) ou 2 ovos (1/2 prato)',
            'Hidratos: 4 colheres sopa arroz/massa/quinoa/couscous (100g) ou 3 batatas pequenas (110g) ou 5 colheres leguminosas (120g)',
            '1 peça de fruta',
            '1 colher de sopa de azeite para confeção',
          ],
        },
      ],
      rulesNotes: ['Água à discrição', 'Alternativa: refeição Revolution Food'],
    },
    {
      mealType: 'lanche',
      label: 'Lanche (Pré-treino)',
      recommendedTime: '17:00',
      options: [
        {
          optionNumber: 1,
          items: [
            '4 colheres sopa iogurte grego ligeiro 0%',
            '1 peça de fruta',
            '2 colheres sopa aveia/corn flakes 0%',
            '1 fio de mel (colher de café)',
          ],
        },
        {
          optionNumber: 2,
          items: ['1 ovo cozido ou mexido', '3 marinheiras / tortilhas', '1 peça de fruta'],
        },
        {
          optionNumber: 3,
          items: [
            '1 fatia de pão centeio/integral (50g) (se não comido ao pequeno almoço)',
            '1 fatia de queijo ou queijo cottage',
            '1 chávena leite magro ou iogurte magro',
          ],
        },
      ],
      rulesNotes: ['Pós-treino: Caseína'],
    },
    {
      mealType: 'jantar',
      label: 'Jantar',
      recommendedTime: '20:30',
      options: [
        {
          optionNumber: 1,
          items: [
            'Sopa de legumes sem batata',
            'Legumes/salada (1/4 do prato)',
            'Proteína: 120g carne ou 130g peixe ou lata atum/salmão ou 2 ovos (1/2 prato)',
            'Hidratos: 3 colheres sopa leguminosas (80g)',
            '1 colher sopa azeite para confeção',
          ],
        },
      ],
    },
    {
      mealType: 'ceia',
      label: 'Ceia SOS',
      recommendedTime: '22:30',
      options: [
        {
          optionNumber: 1,
          items: ['Chávena de leite com café sem açúcar', '2-3 marinheiras/tortilhas'],
        },
        {
          optionNumber: 2,
          items: ['1 iogurte natural/aromas magro', '1 peça de fruta'],
        },
      ],
    },
  ],
  commitments: [
    'Encomendar 2x semana (1x h3 sem batata frita + 1x fast food simples)',
    'Apenas 1 lata cola 0 por dia',
    'Consumo de 2L de água por dia',
    'Deitar mais cedo para descanso e recuperação',
  ],
  rules: [
    '1/2 prato com hortícolas, 1/4 cereais/tubérculos, 1/4 proteína nas refeições principais',
    'Prefira confeções saudáveis (cozidos, grelhados e estufados)',
    'Evitar bolos, doces, fritos, produtos processados e enchidos',
  ],
  fruitEquivalencies: [
    { fruit: 'Banana', portion: '80g (1 unidade pequena madeira ou 1/2 equador)' },
    { fruit: 'Maçã', portion: '90g (1 unidade pequena)' },
    { fruit: 'Laranja', portion: '170g (1 unidade média)' },
    { fruit: 'Morangos', portion: '200g (12 pequenos ou 6 grandes)' },
    { fruit: 'Melancia / Melão', portion: '200g (1 fatia média)' },
    { fruit: 'Kiwi', portion: '100g (1 unidade média)' },
    { fruit: 'Manga', portion: '100g (1/2 unidade pequena)' },
    { fruit: 'Mirtilos', portion: '50g' },
    { fruit: 'Framboesas', portion: '240g' },
    { fruit: 'Cereja', portion: '90g (10-15 unidades)' },
    { fruit: 'Figo', portion: '80g (1 unidade pequena)' },
    { fruit: 'Tangerina', portion: '150g (2 pequenas)' },
  ],
  updatedAt: new Date().toISOString(),
};
