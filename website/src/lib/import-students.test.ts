import { describe, it, expect } from 'vitest';
import {
  ageFromBirthdate,
  brDateToIso,
  digitsOnly,
  findHeaderRow,
  genderToDependent,
  genderToStudent,
  mapRow,
  mapSheet,
  normalizeCep,
  normalizeCpf,
  normalizeHeader,
  normalizePhone,
  pickBestSheet,
  toMutationInput,
} from './import-students';

describe('header normalization', () => {
  it('aceita cabeçalho exato', () => {
    expect(normalizeHeader('prospect_nome')).toBe('prospect_nome');
  });
  it('aceita variação sem underscore', () => {
    expect(normalizeHeader('prospectdatanascimento')).toBe('prospect_data_nascimento');
  });
  it('aceita maiúsculas e espaços', () => {
    expect(normalizeHeader(' Prospect Nome ')).toBe('prospect_nome');
  });
  it('retorna null para coluna desconhecida', () => {
    expect(normalizeHeader('foo_bar')).toBeNull();
  });
});

describe('numeric helpers', () => {
  it('digitsOnly tira tudo que não é dígito', () => {
    expect(digitsOnly('(16) 99176-7737')).toBe('16991767737');
    expect(digitsOnly(null)).toBe('');
  });
  it('normalizeCpf valida tamanho', () => {
    expect(normalizeCpf('222.730.338-77')).toBe('22273033877');
    expect(normalizeCpf('123')).toBeUndefined();
  });
  it('normalizeCep valida tamanho', () => {
    expect(normalizeCep('14021-682')).toBe('14021682');
    expect(normalizeCep('14021')).toBeUndefined();
  });
  it('normalizePhone aceita 10–13 dígitos', () => {
    expect(normalizePhone('(16) 99176-7737')).toBe('16991767737');
    expect(normalizePhone('(16) 3623-1526')).toBe('1636231526');
    expect(normalizePhone('123')).toBeUndefined();
  });
});

describe('brDateToIso', () => {
  const today = new Date('2026-05-11T00:00:00Z');
  it('aceita DD/MM/YYYY', () => {
    expect(brDateToIso('25/07/1975', today)).toBe('1975-07-25');
  });
  it('aceita D/M/YYYY com 1 dígito', () => {
    expect(brDateToIso('5/7/1975', today)).toBe('1975-07-05');
  });
  it('aceita D/MM/YYYY e DD/M/YYYY mistos', () => {
    expect(brDateToIso('5/07/1975', today)).toBe('1975-07-05');
    expect(brDateToIso('25/7/1975', today)).toBe('1975-07-25');
  });
  it('aceita separador - e .', () => {
    expect(brDateToIso('25-7-1975', today)).toBe('1975-07-25');
    expect(brDateToIso('25.07.1975', today)).toBe('1975-07-25');
  });
  it('aceita ano com 2 dígitos', () => {
    expect(brDateToIso('25/07/75', today)).toBe('1975-07-25');
    expect(brDateToIso('25/07/05', today)).toBe('2005-07-25');
  });
  it('aceita ISO direto', () => {
    expect(brDateToIso('2020-12-27', today)).toBe('2020-12-27');
    expect(brDateToIso('2020-12-27T00:00:00', today)).toBe('2020-12-27');
  });
  it('rejeita formato lixo', () => {
    expect(brDateToIso('15/052020', today)).toBeUndefined();
    expect(brDateToIso('', today)).toBeUndefined();
    expect(brDateToIso(null, today)).toBeUndefined();
  });
  it('rejeita dia/mês inválido (31/04, 29/02 não-bissexto)', () => {
    expect(brDateToIso('31/04/2020', today)).toBeUndefined();
    expect(brDateToIso('29/02/2021', today)).toBeUndefined();
    expect(brDateToIso('29/02/2020', today)).toBe('2020-02-29');
  });
  it('rejeita ano absurdo (< 1900 ou no futuro distante)', () => {
    expect(brDateToIso('25/07/1899', today)).toBeUndefined();
    expect(brDateToIso('25/07/2099', today)).toBeUndefined();
  });
  it('aceita objeto Date (sheetjs cellDates: true)', () => {
    expect(brDateToIso(new Date(Date.UTC(1975, 6, 25)), today)).toBe('1975-07-25');
    expect(brDateToIso(new Date('invalid'), today)).toBeUndefined();
  });
});

describe('ageFromBirthdate', () => {
  it('calcula idade considerando mês/dia', () => {
    const today = new Date('2026-05-11T00:00:00Z');
    expect(ageFromBirthdate('2000-05-11', today)).toBe(26);
    expect(ageFromBirthdate('2000-05-12', today)).toBe(25);
    expect(ageFromBirthdate('2000-04-30', today)).toBe(26);
  });
});

describe('gender mapping', () => {
  it('Student: F/M/outro', () => {
    expect(genderToStudent('Feminino')).toBe('female');
    expect(genderToStudent('Masculino')).toBe('male');
    expect(genderToStudent('Não-binário')).toBe('other');
    expect(genderToStudent(undefined)).toBeUndefined();
  });
  it('Dependent: girl/boy/other', () => {
    expect(genderToDependent('Feminino')).toBe('girl');
    expect(genderToDependent('Masculino')).toBe('boy');
    expect(genderToDependent('outro')).toBe('other');
  });
});

describe('mapRow — adulto vs família', () => {
  it('detecta adulto quando responsavel_nome ausente', () => {
    const row = mapRow(
      {
        prospect_nome: 'ANA CAROLINA PRESTES CAMPESI',
        prospect_data_nascimento: '25/07/1975',
        prospect_sexo: 'Feminino',
        prospect_cpf: '222.730.338-77',
        responsavel_celular: '(14) 99176-7737',
        responsavel_email: 'carolprestes23@hotmail.com',
        emergencia_contato: 'BARBARA FORMENTE',
        emergencia_celular: '(14) 98141-9647',
        endereco_cep: '14021-682',
        endereco_rua: 'RUA CLÁUDIO SCODRO',
        endereco_numero: '160',
        endereco_complemento: 'APT 03',
        endereco_bairro: 'BOSQUE DAS JURITIS',
        endereco_cidade: 'RIBEIRÃO PRETO',
        endereco_uf: 'SP',
      },
      2,
    );
    expect(row.kind).toBe('student');
    expect(row.name).toBe('ANA CAROLINA PRESTES CAMPESI');
    expect(row.email).toBe('carolprestes23@hotmail.com');
    expect(row.cpf).toBe('22273033877');
    expect(row.phone).toBe('14991767737');
    expect(row.gender).toBe('female');
    expect(row.birthdate).toBe('1975-07-25');
    expect(row.address?.cep).toBe('14021682');
    expect(row.address?.street).toBe('RUA CLÁUDIO SCODRO');
    expect(row.emergencyContactName).toBe('BARBARA FORMENTE');
    expect(row._errors).toHaveLength(0);
  });

  it('detecta adulto quando responsavel_nome === prospect_nome', () => {
    const row = mapRow(
      {
        prospect_nome: 'JOÃO',
        responsavel_nome: 'joão',
      },
      3,
    );
    expect(row.kind).toBe('student');
  });

  it('detecta família quando nomes diferem', () => {
    const row = mapRow(
      {
        prospect_nome: 'AYLLA DE PAULA MASSON',
        prospect_data_nascimento: '25/05/2019',
        prospect_sexo: 'Feminino',
        responsavel_nome: 'ADRIANO MENDONÇA MASSON',
        responsavel_cpf: '122.279.718-60',
        responsavel_celular: '(16) 98616-5382',
        responsavel_email: 'adriano@profieng.com.br',
        emergencia_contato: 'MIRIÃ SOUSA OLIVEIRA DE PAULA',
        emergencia_celular: '(16) 99177-7443',
      },
      4,
    );
    expect(row.kind).toBe('family');
    expect(row.name).toBe('ADRIANO MENDONÇA MASSON');
    expect(row.email).toBe('adriano@profieng.com.br');
    expect(row.cpf).toBe('12227971860');
    expect(row.dependentName).toBe('AYLLA DE PAULA MASSON');
    expect(row.dependentBirthdate).toBe('2019-05-25');
    expect(row.dependentGender).toBe('girl');
    expect(row.emergencyContactName).toBe('MIRIÃ SOUSA OLIVEIRA DE PAULA');
  });

  it('reporta erro quando prospect_nome ausente', () => {
    const row = mapRow({}, 5);
    expect(row._errors).toContain('Nome do aluno (prospect_nome) é obrigatório.');
  });

  it('reporta erro quando família vem sem data de nascimento do dependente', () => {
    const row = mapRow(
      {
        prospect_nome: 'ELIZ CAMILLE FELIX',
        responsavel_nome: 'ISABELLA FELIX',
        responsavel_cpf: '433.127.768-21',
      },
      13,
    );
    expect(row.kind).toBe('family');
    expect(row._errors.some((e) => e.includes('data de nascimento'))).toBe(true);
  });

  it('gera e-mail automático quando ausente e marca warning', () => {
    const row = mapRow(
      {
        prospect_nome: 'SUELI APARECIDA ARJONA',
        prospect_data_nascimento: '01/01/1959',
      },
      6,
    );
    expect(row.email).toBe('sueli.aparecida.arjona@sem-email.local');
    expect(row._warnings.some((w) => w.includes('gerado automaticamente'))).toBe(true);
  });

  it('avisa quando data de nascimento está em formato inválido', () => {
    const row = mapRow(
      {
        prospect_nome: 'JOÃO',
        prospect_data_nascimento: '15/052020',
      },
      7,
    );
    expect(row.birthdate).toBeUndefined();
    expect(row._warnings.some((w) => w.includes('Data de nascimento'))).toBe(true);
  });
});

describe('mapSheet', () => {
  it('processa matriz com header + linhas e ignora vazias', () => {
    const matrix: unknown[][] = [
      ['prospect_nome', 'responsavel_nome', 'prospect_data_nascimento'],
      ['ANA', '', '25/07/1975'],
      ['', '', ''],
      ['BIA', 'CARLOS', '04/09/2020'],
    ];
    const rows = mapSheet(matrix);
    expect(rows).toHaveLength(2);
    expect(rows[0].kind).toBe('student');
    expect(rows[0].rowNumber).toBe(2);
    expect(rows[1].kind).toBe('family');
    expect(rows[1].rowNumber).toBe(4);
  });

  it('aceita variantes de cabeçalho', () => {
    const matrix: unknown[][] = [
      ['prospectdatanascimento', 'prospect_nome'],
      ['25/07/1975', 'ANA'],
    ];
    const rows = mapSheet(matrix);
    expect(rows[0].birthdate).toBe('1975-07-25');
    expect(rows[0].name).toBe('ANA');
  });
});

describe('findHeaderRow', () => {
  it('escolhe a linha com mais cabeçalhos reconhecidos', () => {
    const matrix: unknown[][] = [
      ['ALUNO', '', '', '', '', '', 'RESPONSÁVEL FINANCEIRO'],
      [
        'prospect_nome',
        'prospectdatanascimento',
        'prospect_idade',
        'prospect_sexo',
        'prospect_cpf',
        'prospect_dataatestado',
        'responsavel_nome',
      ],
      ['ANA', '25/07/1975', '50 ANOS', 'Feminino', '111.222.333-44', '', 'CARLOS'],
    ];
    const out = findHeaderRow(matrix);
    expect(out.headerIndex).toBe(1);
    expect(out.matched).toBeGreaterThanOrEqual(6);
    expect(out.cols[0]).toBe('prospect_nome');
  });

  it('cai no índice 0 se a primeira linha já é boa', () => {
    const matrix: unknown[][] = [
      ['prospect_nome', 'responsavel_nome'],
      ['ANA', ''],
    ];
    expect(findHeaderRow(matrix).headerIndex).toBe(0);
  });
});

describe('pickBestSheet', () => {
  it('escolhe a aba com mais cabeçalhos, não a com mais linhas', () => {
    const sheets = [
      {
        name: 'Aba1',
        matrix: [
          ['prospect_nome', 'responsavel_nome', 'prospect_data_nascimento'],
          ['ANA', '', '25/07/1975'],
          ['BIA', 'CARLOS', '04/09/2020'],
        ],
      },
      {
        // Aba "anexo" maior, mas sem nenhum cabeçalho útil.
        name: 'Aba2',
        matrix: [
          ['lorem', 'ipsum'],
          ['x', 'y'],
          ['x', 'y'],
          ['x', 'y'],
          ['x', 'y'],
          ['x', 'y'],
        ],
      },
    ];
    const best = pickBestSheet(sheets);
    expect(best?.sheet.name).toBe('Aba1');
  });
});

describe('mapSheet com cabeçalho deslocado', () => {
  it('reproduz o caso da aba 2 do plan_cadstro_aluno.xlsx', () => {
    const matrix: unknown[][] = [
      // Linha 1: cabeçalho de grupo (mesclado no Excel original)
      ['ALUNO', '', '', '', '', '', 'RESPONSÁVEL FINANCEIRO', '', '', '', '', '', '', ''],
      // Linha 2: cabeçalho real
      [
        'prospect_nome',
        'prospectdatanascimento',
        'prospect_idade',
        'prospect_sexo',
        'prospect_cpf',
        'prospect_dataatestado',
        'responsavel_nome',
        'responsavel_cpf',
        'responsavel_celular',
        'responsavel_email',
        'emergencia_contato',
        'emergencia_celular',
        'endereco_cep',
        'endereco_rua',
      ],
      // Linha 3+: dados (uma família + um adulto)
      [
        'AYLLA DE PAULA MASSON',
        '25/05/2019',
        '6 ANOS',
        'Feminino',
        '',
        '',
        'ADRIANO MENDONÇA MASSON',
        '122.279.718-60',
        '(16) 98616-5382',
        'adriano@profieng.com.br',
        'MIRIÃ',
        '(16) 99177-7443',
        '14026-554',
        'RUA GERALDO ALONSO',
      ],
      [
        'ANA CAROLINA PRESTES',
        '25/07/1975',
        '50 ANOS',
        'Feminino',
        '222.730.338-77',
        '',
        '',
        '',
        '(14) 99176-7737',
        'caro@hotmail.com',
        'BARBARA',
        '(14) 98141-9647',
        '14021-682',
        'RUA CLÁUDIO',
      ],
    ];
    const rows = mapSheet(matrix);
    expect(rows).toHaveLength(2);
    expect(rows[0].kind).toBe('family');
    expect(rows[0].name).toBe('ADRIANO MENDONÇA MASSON');
    expect(rows[0].dependentName).toBe('AYLLA DE PAULA MASSON');
    expect(rows[0].rowNumber).toBe(3);
    expect(rows[1].kind).toBe('student');
    expect(rows[1].name).toBe('ANA CAROLINA PRESTES');
    expect(rows[1].cpf).toBe('22273033877');
  });
});

describe('toMutationInput', () => {
  it('descarta linhas com erro e remove campos privados', () => {
    const rows = [
      {
        ...mapRow({ prospect_nome: 'ANA' }, 1),
      },
      {
        ...mapRow({}, 2),
      },
    ];
    const out = toMutationInput(rows);
    expect(out).toHaveLength(1);
    expect(out[0]).not.toHaveProperty('_warnings');
    expect(out[0]).not.toHaveProperty('_errors');
  });
});
