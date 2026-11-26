import { PaceZones } from '@/types';

/**
 * Formata segundos por km em string "M:SS /km"
 */
export function formatPace(secondsPerKm: number): string {
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;
}

/**
 * Converte string "MM:SS", "MM.SS", "MM,SS" ou apenas minutos em segundos totais
 */
export function parseTimeString(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().replace(',', '.');

  // Formato com dois pontos: MM:SS ou HH:MM:SS
  if (clean.includes(':')) {
    const parts = clean.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs)) return mins * 60 + secs;
    }
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const mins = parseInt(parts[1], 10);
      const secs = parseInt(parts[2], 10);
      if (!isNaN(hours) && !isNaN(mins) && !isNaN(secs)) return hours * 3600 + mins * 60 + secs;
    }
  }

  // Formato com ponto: 23.45 -> 23 min e 45 seg
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs)) return mins * 60 + secs;
    }
  }

  // Apenas número inteiro (ex: 20 -> 20 minutos)
  const onlyNum = parseInt(clean, 10);
  if (!isNaN(onlyNum) && onlyNum >= 10 && onlyNum <= 90) {
    return onlyNum * 60;
  }

  return null;
}

/**
 * Formata segundos totais em string limpa "MM:SS"
 */
export function formatMinutesSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Calcula zonas de ritmo com base em teste de 5km
 * Ex: 5km em 25:00 -> pace base = 5:00/km (300 s/km)
 */
export function calculatePaceZonesFrom5k(time5kSeconds: number): PaceZones {
  const pace5k = time5kSeconds / 5; // segundos por km no teste de 5k

  // Estimativa VDOT simplificada baseada em pace de 5km
  const vdot = Math.round((300 / pace5k) * 40 * 10) / 10;

  // Fatores de ritmo padrão da corrida:
  // Z1 Recuperação: ~135% a 145% do pace 5k
  // Z2 Rodagem Aeróbica: ~120% a 130% do pace 5k
  // Z3 Ritmo Maratona / Tempo: ~110% a 118% do pace 5k
  // Z4 Limiar de Lactato: ~103% a 108% do pace 5k
  // Z5 Tiros / VO2max: ~95% a 100% do pace 5k

  return {
    vdot: Math.max(25, Math.min(85, vdot)),
    z1_recovery: `${formatPace(pace5k * 1.35)} - ${formatPace(pace5k * 1.48)}`,
    z2_aerobic: `${formatPace(pace5k * 1.20)} - ${formatPace(pace5k * 1.32)}`,
    z3_tempo: `${formatPace(pace5k * 1.10)} - ${formatPace(pace5k * 1.18)}`,
    z4_threshold: `${formatPace(pace5k * 1.03)} - ${formatPace(pace5k * 1.08)}`,
    z5_interval: `${formatPace(pace5k * 0.95)} - ${formatPace(pace5k * 1.01)}`,
  };
}

/**
 * Sincroniza referências de zonas (Z1-Z5 / Zona 1-5) em textos de treino com os ritmos atuais.
 */
export function syncWorkoutTextWithZones(text: string, zones: PaceZones): string {
  if (!text) return text;

  const zoneMap: Record<string, string> = {
    '1': zones.z1_recovery,
    '2': zones.z2_aerobic,
    '3': zones.z3_tempo,
    '4': zones.z4_threshold,
    '5': zones.z5_interval,
  };

  // Normaliza formatos legados dos mocks antes da substituição idempotente
  let result = text
    .replace(/\(forte,\s*aprox\.[^)]+\)/gi, `(${zones.z5_interval})`)
    .replace(/Z4:\s*aprox\.[^)]+/gi, `Z4 (${zones.z4_threshold})`);

  const zoneRegex =
    /\b(Zona\s*([1-5])|Z([1-5]))(?:\s*\((?:alvo:\s*)?[\d:]+\s*(?:\/km)?\s*(?:-|a)\s*[\d:]+\s*\/km\))?(?:\s*:\s*[\d:]+\s*(?:\/km)?\s*(?:-|a)\s*[\d:]+\s*\/km)?/gi;

  result = result.replace(zoneRegex, (_match, label: string, zNumA?: string, zNumB?: string) => {
    const zNum = zNumA || zNumB;
    const pace = zNum ? zoneMap[zNum] : undefined;
    if (!pace) return label;
    return `${label} (${pace})`;
  });

  return result;
}
