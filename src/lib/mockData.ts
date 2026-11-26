import { AthleteProfile, Workout, WorkoutTemplate } from '@/types';
import { calculatePaceZonesFrom5k } from './vdot';

// Segunda-feira corrente: 2026-11-23
export const MOCK_ATHLETES: AthleteProfile[] = [
  {
    id: 'ath-1',
    name: 'Mariana Silva',
    email: 'mariana.silva@email.com',
    phone: '(11) 98765-4321',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    targetRace: 'Meia Maratona Internacional',
    targetDate: '2027-04-18',
    targetDistance: '21km (Meta: Sub-1h50)',
    personalRecords: {
      '5k': '23:45',
      '10k': '49:30',
      '21k': '1:54:12',
    },
    paceZones: calculatePaceZonesFrom5k(23 * 60 + 45), // baseado nos 23:45 de 5k
  },
  {
    id: 'ath-2',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@email.com',
    phone: '(11) 99123-8877',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    targetRace: '10km das Estações',
    targetDate: '2027-02-28',
    targetDistance: '10km (Meta: Sub-43 min)',
    personalRecords: {
      '5k': '20:30',
      '10k': '43:50',
    },
    paceZones: calculatePaceZonesFrom5k(20 * 60 + 30),
  },
  {
    id: 'ath-3',
    name: 'Carlos Alberto',
    email: 'carlos.alberto@email.com',
    phone: '(11) 97456-1122',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    targetRace: 'Circuito Caixa 5k',
    targetDate: '2027-01-20',
    targetDistance: '5km (Concluir sem caminhar)',
    personalRecords: {
      '5k': '29:50',
    },
    paceZones: calculatePaceZonesFrom5k(29 * 60 + 50),
  },
];

export const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'w-1',
    athleteId: 'ath-1',
    scheduledDate: '2026-11-23', // Hoje
    title: 'Intervalado: 8x 400m em Z5',
    type: 'intervalado',
    estimatedDistanceKm: 7.5,
    blocks: {
      warmup: '2 km trote leve em Z1/Z2 + 4x educativas de corrida (skipping, anfersen, passadas).',
      main: '8x 400m em ritmo Z5 (forte, aprox. 4:10/km a 4:20/km), com intervalo de 1min30s de trote suave ou caminhada.',
      cooldown: '1.2 km de trote bem solto para desaquecimento + 10 min de alongamentos estáticos.',
    },
    coachNotes: 'Foco total na mecânica da passada e cadência. Não estoure os dois primeiros tiros; mantenha a constância em todos os 8.',
    status: 'pending',
  },
  {
    id: 'w-2',
    athleteId: 'ath-1',
    scheduledDate: '2026-11-24', // Terça
    title: 'Fortalecimento e Mobilidade',
    type: 'forca',
    estimatedDistanceKm: 0,
    blocks: {
      warmup: '10 min mobilidade articular (tornozelo, quadril e coluna torácica).',
      main: '3 séries de: Afundo x12/lado, Elevação Pélvica x15, Panturrilha unilateral x15, Prancha frontal 45s.',
      cooldown: 'Alongamento passivo de membros inferiores.',
    },
    coachNotes: 'Treino essencial de prevenção de canelite e dor patelar.',
    status: 'pending',
  },
  {
    id: 'w-3',
    athleteId: 'ath-1',
    scheduledDate: '2026-11-25', // Quarta
    title: 'Rodagem Regenerativa 7km',
    type: 'regenerativo',
    estimatedDistanceKm: 7.0,
    blocks: {
      warmup: '1 km caminhada acelerada e trote inicial bem leve.',
      main: '5 km contínuos em Zona 2 (ritmo de conversa, respiração nasal se possível, sem pressa).',
      cooldown: '1 km trote final + hidratação imediata.',
    },
    coachNotes: 'Objetivo é soltar as pernas e recuperar do intervalado de segunda. Respeite a Zona 2!',
    status: 'pending',
  },
  {
    id: 'w-4',
    athleteId: 'ath-1',
    scheduledDate: '2026-11-26', // Quinta
    title: 'Descanso Total',
    type: 'descanso',
    estimatedDistanceKm: 0,
    blocks: {
      warmup: 'Nenhum.',
      main: 'Dia de descanso completo. Priorize sono de qualidade e alimentação balanceada.',
      cooldown: 'Nenhum.',
    },
    status: 'pending',
  },
  {
    id: 'w-5',
    athleteId: 'ath-1',
    scheduledDate: '2026-11-27', // Sexta
    title: 'Tempo Run 8km (Limiar Z4)',
    type: 'tempo_run',
    estimatedDistanceKm: 8.0,
    blocks: {
      warmup: '2 km trote progressivo Z1 -> Z2.',
      main: '4 km contínuos cravados em Ritmo Limiar (Z4: aprox. 4:40 a 4:55/km).',
      cooldown: '2 km trote bem leve para retorno à calma.',
    },
    coachNotes: 'Sensação de esforço desconfortavelmente sustentável. Mantenha o ritmo estável no km 3 e 4.',
    status: 'pending',
  },
  {
    id: 'w-6',
    athleteId: 'ath-1',
    scheduledDate: '2026-11-28', // Sábado
    title: 'Longão de Fim de Semana 16km',
    type: 'longao',
    estimatedDistanceKm: 16.0,
    blocks: {
      warmup: '2 km trote leve em Z1.',
      main: '12 km em Z2 sustentado, com os últimos 2 km progressivos para Z3 (ritmo pretendido da prova).',
      cooldown: '2 km trote muito solto + hidratação com eletrólitos.',
    },
    coachNotes: 'Leve gel de carboidrato para consumir no km 7 e km 13. Teste a estratégia nutricional!',
    status: 'pending',
  },
  {
    id: 'w-7',
    athleteId: 'ath-1',
    scheduledDate: '2026-11-29', // Domingo
    title: 'Descanso e Liberação Miofascial',
    type: 'descanso',
    estimatedDistanceKm: 0,
    blocks: {
      warmup: 'Nenhum.',
      main: 'Descanso total ou 20 min de rolinho de liberação nas pernas e banho de contraste.',
      cooldown: 'Nenhum.',
    },
    status: 'pending',
  },
];

export const MOCK_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Intervalado Clássico 8x 400m',
    type: 'intervalado',
    estimatedDistanceKm: 7.5,
    blocks: {
      warmup: '2km trote leve em Z1 + 4 retas acelerando.',
      main: '8x 400m em Z5 com 1min30s de intervalo ativo.',
      cooldown: '1.5km trote regenerativo.',
    },
    defaultNotes: 'Excelente para ganho de VO2max e velocidade.',
  },
  {
    id: 'tpl-2',
    title: 'Tiros Curtos 10x 200m (Potência)',
    type: 'intervalado',
    estimatedDistanceKm: 6.0,
    blocks: {
      warmup: '2km trote Z1 + educativas de corrida.',
      main: '10x 200m velocidade máxima controlada com 1min caminhada.',
      cooldown: '1km trote leve.',
    },
    defaultNotes: 'Foco em postura, amplitude de passada e aceleração.',
  },
  {
    id: 'tpl-3',
    title: 'Rodagem Aeróbica Contínua 10km',
    type: 'rodagem',
    estimatedDistanceKm: 10.0,
    blocks: {
      warmup: '1km progressivo.',
      main: '8km firmes em Zona 2.',
      cooldown: '1km trote solto.',
    },
    defaultNotes: 'Base aeróbica e queima de gordura.',
  },
  {
    id: 'tpl-4',
    title: 'Longão Progressivo 18km',
    type: 'longao',
    estimatedDistanceKm: 18.0,
    blocks: {
      warmup: '2km Z1.',
      main: '12km Z2 + 4km Z3 ritmo de maratona.',
      cooldown: 'Hidratação e caminhada leve.',
    },
    defaultNotes: 'Treino chave para meia e maratona.',
  },
  {
    id: 'tpl-5',
    title: 'Fartlek Piramidal 1-2-3-2-1 min',
    type: 'intervalado',
    estimatedDistanceKm: 8.5,
    blocks: {
      warmup: '2km trote solto.',
      main: 'Tiros fortes de 1 min, 2 min, 3 min, 2 min, 1 min, com mesmo tempo de trote suave de recuperação.',
      cooldown: '1.5km desaquecimento.',
    },
    defaultNotes: 'Treino dinâmico para quebrar monotonia e trabalhar trocas de ritmo.',
  },
];
