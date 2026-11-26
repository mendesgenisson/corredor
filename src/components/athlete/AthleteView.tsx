'use client';

import React, { useState } from 'react';
import { AthleteProfile, Workout, WorkoutLog } from '@/types';
import { 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Trophy, 
  ChevronRight, 
  Zap, 
  Wind, 
  ShieldAlert, 
  Footprints,
  Info
} from 'lucide-react';
import { WorkoutFeedbackModal } from './WorkoutFeedbackModal';

interface AthleteViewProps {
  athlete: AthleteProfile;
  workouts: Workout[];
  onUpdateWorkout: (workout: Workout) => void;
}

export function AthleteView({ athlete, workouts, onUpdateWorkout }: AthleteViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-23');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showZones, setShowZones] = useState(false);

  const weekDays = [
    { label: 'Seg', date: '2026-11-23', dayNum: '23' },
    { label: 'Ter', date: '2026-11-24', dayNum: '24' },
    { label: 'Qua', date: '2026-11-25', dayNum: '25' },
    { label: 'Qui', date: '2026-11-26', dayNum: '26' },
    { label: 'Sex', date: '2026-11-27', dayNum: '27' },
    { label: 'Sáb', date: '2026-11-28', dayNum: '28' },
    { label: 'Dom', date: '2026-11-29', dayNum: '29' },
  ];

  const currentWorkout = workouts.find((w) => w.scheduledDate === selectedDate && w.athleteId === athlete.id);

  const getTargetPaceForWorkout = (type: string) => {
    switch (type) {
      case 'intervalado':
        return {
          label: 'Ritmo Alvo • Zona 5 (Tiros / VO2max)',
          pace: athlete.paceZones.z5_interval,
          accent: 'text-[#FC4C02]',
          bgColor: 'bg-[#FFF2EC] border-[#FC4C02]/25',
          desc: 'Tiros fortes e consistentes',
        };
      case 'tempo_run':
        return {
          label: 'Ritmo Alvo • Zona 4 (Limiar de Lactato)',
          pace: athlete.paceZones.z4_threshold,
          accent: 'text-[#D95D00]',
          bgColor: 'bg-amber-50 border-amber-200',
          desc: 'Esforço desconfortavelmente sustentável',
        };
      case 'longao':
        return {
          label: 'Ritmo Alvo • Zona 2 (Aeróbico Contínuo)',
          pace: athlete.paceZones.z2_aerobic,
          accent: 'text-[#FC4C02]',
          bgColor: 'bg-[#FFF2EC] border-[#FC4C02]/25',
          desc: 'Constância e resistência aeróbica',
        };
      case 'rodagem':
        return {
          label: 'Ritmo Alvo • Zona 2 (Rodagem Aeróbica)',
          pace: athlete.paceZones.z2_aerobic,
          accent: 'text-sky-700',
          bgColor: 'bg-sky-50 border-sky-200',
          desc: 'Ritmo confortável de conversa',
        };
      case 'regenerativo':
        return {
          label: 'Ritmo Alvo • Zona 1 (Regenerativo Leve)',
          pace: athlete.paceZones.z1_recovery,
          accent: 'text-emerald-700',
          bgColor: 'bg-emerald-50 border-emerald-200',
          desc: 'Trote muito leve para soltura',
        };
      default:
        return null;
    }
  };

  const targetPace = currentWorkout ? getTargetPaceForWorkout(currentWorkout.type) : null;

  const completedCount = workouts.filter((w) => w.status === 'completed' && w.athleteId === athlete.id).length;
  const totalKm = workouts
    .filter((w) => w.athleteId === athlete.id)
    .reduce((acc, curr) => {
      if (curr.log) return acc + curr.log.distanceKm;
      return acc + (curr.status === 'completed' ? curr.estimatedDistanceKm : 0);
    }, 0);

  const handleSaveFeedback = (log: WorkoutLog) => {
    if (!currentWorkout) return;
    const updated: Workout = {
      ...currentWorkout,
      status: 'completed',
      log,
    };
    onUpdateWorkout(updated);
    setIsModalOpen(false);
  };

  const getWorkoutBadge = (type: string) => {
    switch (type) {
      case 'intervalado':
        return { label: 'Tiros / Intervalado', bg: 'bg-[#FFF2EC] text-[#FC4C02] border-[#FC4C02]/30' };
      case 'longao':
        return { label: 'Longão de Fim de Semana', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'tempo_run':
        return { label: 'Ritmo / Tempo Run', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'rodagem':
        return { label: 'Rodagem Aeróbica', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'regenerativo':
        return { label: 'Regenerativo Leve', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'forca':
        return { label: 'Fortalecimento / Funcional', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Descanso', bg: 'bg-slate-100 text-[#6D6D78] border-[#E5E5EA]' };
    }
  };

  return (
    <div className="mx-auto w-full max-w-md pb-24 px-4 pt-4 space-y-4">
      {/* Card de Perfil do Atleta - Estilo Strava */}
      <div className="rounded-xl border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3.5">
          <img
            src={athlete.avatarUrl}
            alt={athlete.name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-[#FC4C02]/30"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-[#FC4C02] uppercase tracking-wider">Atleta PaceRun</span>
              {athlete.initialWeightKg !== undefined && (
                <span className="text-[11px] font-semibold text-[#6D6D78] bg-[#F7F7FA] border border-[#E5E5EA] px-2 py-0.5 rounded-full">
                  {athlete.initialWeightKg} kg
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-[#242428] truncate">{athlete.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#6D6D78] mt-0.5">
              <Trophy className="h-3.5 w-3.5 text-[#FC4C02] shrink-0" />
              <span className="truncate font-medium">{athlete.targetRace}</span>
            </div>
          </div>
        </div>

        {/* Faixa de Métricas Horizontais Strava */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-[#E5E5EA] border-t border-[#E5E5EA] pt-3.5">
          <div className="pr-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-[#6D6D78] block">Objetivo</span>
            <p className="text-xs font-bold text-[#242428] mt-0.5 truncate">{athlete.targetDistance}</p>
          </div>
          <div className="px-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-[#6D6D78] block">Km na Semana</span>
            <p className="text-sm font-black text-[#242428] tabular-nums mt-0.5">{totalKm.toFixed(1)} km</p>
          </div>
          <div className="pl-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-[#6D6D78] block">VDOT Base</span>
            <p className="text-sm font-black text-[#FC4C02] tabular-nums mt-0.5">{athlete.paceZones.vdot}</p>
          </div>
        </div>

        {/* Botão de Zonas de Pace */}
        <button
          onClick={() => setShowZones(!showZones)}
          className="mt-3.5 w-full flex items-center justify-between rounded-lg bg-[#F7F7FA] hover:bg-slate-100 border border-[#E5E5EA] px-3 py-2 text-xs font-semibold text-[#242428] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-[#FC4C02]" />
            Minhas Zonas de Ritmo (Pace)
          </span>
          <ChevronRight className={`h-4 w-4 text-[#6D6D78] transition-transform ${showZones ? 'rotate-90' : ''}`} />
        </button>

        {/* Tabela expansível de Zonas */}
        {showZones && (
          <div className="mt-2.5 space-y-1.5 rounded-lg bg-[#F7F7FA] p-3 text-xs border border-[#E5E5EA]">
            <div className="flex justify-between items-center text-[#6D6D78] pb-1.5 border-b border-[#E5E5EA] text-[10px] uppercase font-bold">
              <span>Zona de Treino (5k: {athlete.personalRecords['5k'] || '--:--'})</span>
              <span>Ritmo Alvo</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-emerald-700 font-semibold">Z1 - Regenerativo</span>
              <span className="text-[#242428] font-mono font-semibold">{athlete.paceZones.z1_recovery}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sky-700 font-semibold">Z2 - Rodagem Aeróbica</span>
              <span className="text-[#242428] font-mono font-semibold">{athlete.paceZones.z2_aerobic}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-amber-700 font-semibold">Z3 - Ritmo Prova (Tempo)</span>
              <span className="text-[#242428] font-mono font-semibold">{athlete.paceZones.z3_tempo}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-orange-600 font-semibold">Z4 - Limiar de Lactato</span>
              <span className="text-[#242428] font-mono font-semibold">{athlete.paceZones.z4_threshold}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#FC4C02] font-bold">Z5 - Tiros / VO2max</span>
              <span className="text-[#242428] font-mono font-bold">{athlete.paceZones.z5_interval}</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendário Semanal */}
      <div className="rounded-xl border border-[#E5E5EA] bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#242428]">
            <Calendar className="h-3.5 w-3.5 text-[#FC4C02]" />
            Semana Atual (23 a 29 Nov)
          </div>
          <span className="text-[11px] font-semibold text-[#6D6D78]">
            {completedCount}/7 concluídos
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((d) => {
            const isSelected = selectedDate === d.date;
            const dayWorkout = workouts.find((w) => w.scheduledDate === d.date && w.athleteId === athlete.id);
            const isCompleted = dayWorkout?.status === 'completed';
            const isRest = dayWorkout?.type === 'descanso';

            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-[#FC4C02] text-white font-bold shadow-sm'
                    : 'bg-[#F7F7FA] text-[#242428] hover:bg-slate-200/70 border border-[#E5E5EA]'
                }`}
              >
                <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-white/90' : 'text-[#6D6D78]'}`}>
                  {d.label}
                </span>
                <span className="text-xs font-extrabold mt-0.5 tabular-nums">{d.dayNum}</span>
                <div className="mt-1 h-1.5 w-1.5 rounded-full">
                  {isCompleted ? (
                    <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  ) : isRest ? (
                    <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white/50' : 'bg-slate-300'}`} />
                  ) : (
                    <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#FC4C02]'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card de Treino do Dia (Estilo Activity Card do Strava) */}
      {currentWorkout ? (
        <div className="rounded-xl border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  getWorkoutBadge(currentWorkout.type).bg
                }`}
              >
                {getWorkoutBadge(currentWorkout.type).label}
              </span>
              <h3 className="text-lg font-extrabold text-[#242428] mt-1.5 leading-snug">{currentWorkout.title}</h3>
              {currentWorkout.estimatedDistanceKm > 0 && (
                <p className="text-xs text-[#6D6D78] flex items-center gap-1 mt-1 font-medium">
                  <Footprints className="h-3.5 w-3.5 text-[#FC4C02]" />
                  Distância Estimada: <strong className="text-[#242428]">~{currentWorkout.estimatedDistanceKm} km</strong>
                </p>
              )}
            </div>

            {currentWorkout.status === 'completed' && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Concluído
              </span>
            )}
          </div>

          {/* Ritmo Alvo Dinâmico */}
          {targetPace && currentWorkout.type !== 'descanso' && currentWorkout.type !== 'forca' && (
            <div className={`flex items-center justify-between rounded-lg border p-3.5 ${targetPace.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#E5E5EA] shadow-xs">
                  <Flame className={`h-5 w-5 ${targetPace.accent}`} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6D78] block">
                    {targetPace.label}
                  </span>
                  <span className={`text-base font-black font-mono tracking-tight ${targetPace.accent}`}>
                    {targetPace.pace}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#242428] bg-white px-2.5 py-1 rounded-md border border-[#E5E5EA] font-bold block tabular-nums">
                  VDOT {athlete.paceZones.vdot}
                </span>
                <span className="text-[9px] text-[#6D6D78] mt-0.5 block">{targetPace.desc}</span>
              </div>
            </div>
          )}

          {/* Blocos do Treino */}
          <div className="space-y-2.5 pt-1">
            {currentWorkout.blocks.warmup && (
              <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#242428] mb-1">
                  <Flame className="h-4 w-4 text-amber-500" />
                  1. Aquecimento
                </div>
                <p className="text-xs text-[#6D6D78] leading-relaxed">
                  {currentWorkout.blocks.warmup}
                </p>
              </div>
            )}

            {currentWorkout.blocks.main && (
              <div className="rounded-lg border border-[#FC4C02]/30 border-l-4 border-l-[#FC4C02] bg-[#FFF8F5] p-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#FC4C02] mb-1.5">
                  <Zap className="h-4 w-4 text-[#FC4C02]" />
                  2. Treino Principal
                </div>
                <p className="text-xs font-semibold text-[#242428] leading-relaxed whitespace-pre-line">
                  {currentWorkout.blocks.main}
                </p>
              </div>
            )}

            {currentWorkout.blocks.cooldown && (
              <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#242428] mb-1">
                  <Wind className="h-4 w-4 text-sky-600" />
                  3. Volta à Calma / Desaquecimento
                </div>
                <p className="text-xs text-[#6D6D78] leading-relaxed">
                  {currentWorkout.blocks.cooldown}
                </p>
              </div>
            )}
          </div>

          {/* Observações do Treinador */}
          {currentWorkout.coachNotes && (
            <div className="flex items-start gap-2.5 rounded-lg bg-[#F7F7FA] border border-[#E5E5EA] p-3.5 text-xs text-[#6D6D78]">
              <Info className="h-4 w-4 text-[#FC4C02] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#242428] block mb-0.5">Dica do Treinador:</strong>
                {currentWorkout.coachNotes}
              </div>
            </div>
          )}

          {/* Dados do Treino Executado */}
          {currentWorkout.log && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Resultado Registrado</span>
              <div className="grid grid-cols-3 divide-x divide-emerald-200 bg-white rounded-lg border border-emerald-200 p-2.5 text-center">
                <div>
                  <span className="text-[10px] text-[#6D6D78] block">Distância</span>
                  <span className="text-xs font-black text-[#242428] tabular-nums">{currentWorkout.log.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6D6D78] block">Pace Médio</span>
                  <span className="text-xs font-black text-[#FC4C02] tabular-nums">{currentWorkout.log.avgPace}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6D6D78] block">Esforço RPE</span>
                  <span className="text-xs font-black text-[#242428] tabular-nums">{currentWorkout.log.rpeEffort}/10</span>
                </div>
              </div>

              {currentWorkout.log.painLevel !== 'none' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Dor relatada ({currentWorkout.log.painLevel}): {currentWorkout.log.painLocation}</span>
                </div>
              )}

              {currentWorkout.log.athleteFeedback && (
                <p className="text-xs text-[#242428] italic pt-0.5">
                  "{currentWorkout.log.athleteFeedback}"
                </p>
              )}
            </div>
          )}

          {/* Botão CTA Strava */}
          {currentWorkout.type !== 'descanso' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold transition-all active:scale-[0.99] ${
                currentWorkout.status === 'completed'
                  ? 'border border-[#E5E5EA] bg-[#F7F7FA] text-[#242428] hover:bg-slate-200/70'
                  : 'bg-[#FC4C02] hover:bg-[#E34402] text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {currentWorkout.status === 'completed' ? 'Editar Dados do Treino' : 'Registrar Treino Realizado'}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E5EA] bg-white p-8 text-center text-[#6D6D78]">
          <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-medium">Nenhum treino prescrito para este dia.</p>
        </div>
      )}

      {isModalOpen && currentWorkout && (
        <WorkoutFeedbackModal
          workout={currentWorkout}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFeedback}
        />
      )}
    </div>
  );
}
