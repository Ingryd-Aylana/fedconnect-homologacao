export const PRODUTOS = [
  {
    id: 'ruptura-encanamentos',
    nome: 'Ruptura de Encanamentos',
    categoria: 'Residencial',
    preco: 'R$ 21,90/mês',
    imagens: [
      '/imagens/produtos/ruptura-encanamentos1.jpg',
      '/imagens/produtos/ruptura-encanamentos2.jpg'
    ],
    destaques: [
      'Cobertura de R$ 5.000,00 para danos no apartamento',
      'Cobertura de R$ 20.000,00 para danos aos vizinhos e áreas comuns',
      'Cobertura de incêndio conteúdo de R$ 100.000,00',
      'Cobertura de perda de aluguel até R$ 10.000,00'
    ],
    observacao: 'Carência de 30 dias a partir da vigência.'
  },
  {
    id: 'saude-corporativo',
    nome: 'Planos de Saúde Corporativos',
    categoria: 'Saúde',
    preco: 'Sob consulta',
    imagens: [
      '/imagens/produtos/saude-corporativo1.jpg',
      '/imagens/produtos/saude-corporativo2.jpg'
    ],
    destaques: [
      'Planos sob medida para empresas',
      'Foco em atração e retenção de talentos',
      'Redução de custos indiretos com afastamentos',
      'Possibilidade de incluir planos odontológicos'
    ]
  },
  {
    id: 'seguro-condominio',
    nome: 'Seguro Condomínio',
    categoria: 'Condomínio',
    preco: 'Sob consulta',
    imagens: [
      '/imagens/produtos/seguro-condominio1.jpg',
      '/imagens/produtos/seguro-condominio2.jpg'
    ],
    destaques: [
      'Cobertura Básica Simples ou Ampla',
      'Proteção para prédio e áreas comuns',
      'Coberturas adicionais como danos elétricos, vendaval e roubo',
      'Assistência 24h e pagamento facilitado'
    ]
  },
  {
    id: 'incendio-locacao',
    nome: 'Incêndio Locação',
    categoria: 'Residencial',
    preco: 'Sob consulta',
    imagens: ['/imagens/produtos/incendio-locacao.jpg'],
    destaques: [
      'Cobertura para incêndio, raio e explosão',
      'Indenização sobre prejuízos na edificação do imóvel',
      'Assistência residencial 24h (chaveiro, eletricista, bombeiro)'
    ]
  },
  {
    id: 'incendio-conteudo',
    nome: 'Incêndio Conteúdo + Clube de Descontos',
    categoria: 'Residencial',
    preco: 'R$ 9,90/mês',
    imagens: [
      '/imagens/produtos/incendio-conteudo1.jpg',
      '/imagens/produtos/incendio-conteudo2.jpg'
    ],
    destaques: [
      'Cobertura para móveis, eletros e utensílios',
      'R$ 80.000,00 para imóveis residenciais',
      'R$ 60.000,00 para imóveis comerciais',
      'Perda de aluguel: indenização adicional de R$ 6.000,00',
      'Assistência residencial 24h e Clube de Descontos'
    ]
  },
  {
    id: 'garantia-cota-condominial',
    nome: 'Garantia Cota Condominial',
    categoria: 'Garantias',
    preco: 'R$ 9,00/mês',
    imagens: ['/imagens/produtos/garantia-cota1.jpg'],
    destaques: [
      'Cobre até 3 meses de condomínio em caso de desemprego involuntário',
      'Cobertura de até 6 meses em caso de morte ou invalidez',
      'Limite de até R$ 1.400,00/mês para morte/invalidez',
      'Até R$ 800,00/mês para desemprego'
    ]
  },
  {
    id: 'seguro-alug',
    nome: 'ALUG',
    categoria: 'Garantias',
    preco: '0,15% do capital segurado',
    imagens: ['/imagens/produtos/seguro-alug.jpg'],
    destaques: [
      'Garante aluguel, condomínio e IPTU',
      'Até 6 meses de aluguéis (limite R$ 30.000,00)',
      'Indenização por desemprego e incapacidade temporária',
      'Proteção em caso de morte ou invalidez por acidente'
    ]
  },
  {
    id: 'seguro-vida-funcionarios',
    nome: 'Vida Funcionários Condomínio',
    categoria: 'Vida',
    preco: 'Sob consulta',
    imagens: ['/imagens/produtos/seguro-vida.jpg'],
    destaques: [
      'Atende 100% da convenção coletiva',
      'Morte natural/acidental: 25x salário mínimo',
      'Invalidez até 25x salário mínimo',
      'Complementação salarial e auxílio funeral',
      'Cobre também rescisão trabalhista (até 10% do capital segurado)'
    ]
  },
  {
    id: 'seguro-auto',
    nome: 'Automóvel',
    categoria: 'Auto',
    preco: 'Sob consulta',
    imagens: ['/imagens/produtos/seguro-auto.jpg'],
    destaques: [
      'Cobertura contra colisão, incêndio e roubo/furto',
      'Cobertura para passageiros (APP)',
      'Cobertura para terceiros (danos materiais e corporais)',
      'Cobertura para acessórios, carroceria, blindagem e kit-gás'
    ],
  },
    {
    id: 'institucional-fedcorp',
    nome: 'Apresentação Institucional Grupo Fedcorp',
    categoria: 'Institucional',
    tipo: 'pdf',
    pdf: '/imagens/produtos/Fedcorp-institucional.pdf',
    destaques: [
      'Visão geral do Grupo Fedcorp e atuação no setor imobiliário e corporativo',
      'Portfólio completo de seguros, benefícios, garantias locatícias e serviços',
      'Foco em automação de processos, integração de sistemas e plataformas digitais',
      'Estrutura para atender administradoras, condomínios e empresas com soluções sob medida'
    ]
  },
  {
    id: 'institucional-condominial',
    nome: 'Soluções Condominiais Fedcorp',
    categoria: 'Institucional',
    tipo: 'pdf',
    pdf: '/imagens/produtos/Solucoes-Condominiais.pdf',
    destaques: [
      'Soluções completas para a gestão condominial com foco em tecnologia e eficiência',
      'Portfólio de produtos para prédios, síndicos, administradoras e funcionários',
      'Marketplace digital para oferta de seguros e serviços aos condôminos',
      'Integração com plataformas e sistemas da administradora via API'
    ]
  },
  {
    id: 'institucional-locaticias',
    nome: 'Soluções Locatícias Automatizadas',
    categoria: 'Institucional',
    tipo: 'pdf',
    pdf: '/imagens/produtos/Solucoes-Locaticias.pdf',
    destaques: [
      'Automação completa do ciclo de locação imobiliária, da análise ao contrato',
      'Plataformas de Incêndio Locação, Seguro Fiança e Capitalização',
      'Esteira de locação digital, incluindo vistoria, garantias e assinatura online',
      'Plataforma online de sinistros e marketplace para comercialização de produtos'
    ]
  }
];
