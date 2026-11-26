'use client';

import React, { useState } from 'react';
import { AthleteProfile, Workout, WorkoutLog } from '@/types';
import { 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Trophy, 
  Activity, 
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
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-23'); // Hoje
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showZones, setShowZones] = useState(false);

  // Mapeamento dos dias da semana atual
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
          label: 'Ritmo Alvo (Zona 5 - Tiros / VO2max)',
          pace: athlete.paceZones.z5_interval,
          color: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          bgColor: 'bg-rose-950/20',
          desc: 'Tiros fortes e consistentes',
        };
      case 'tempo_run':
        return {
          label: 'Ritmo Alvo (Zona 4 - Limiar de Lactato)',
          pace: athlete.paceZones.z4_threshold,
          color: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-950/20',
          desc: 'Esforço desconfortavelmente sustentável',
        };
      case 'longao':
        return {
          label: 'Ritmo Alvo (Zona 2 - Aeróbico Contínuo)',
          pace: athlete.paceZones.z2_aerobic,
          color: 'text-orange-400',
          borderColor: 'border-orange-500/30',
          bgColor: 'bg-orange-950/20',
          desc: 'Constância e resistência aeróbica',
        };
      case 'rodagem':
        return {
          label: 'Ritmo Alvo (Zona 2 - Rodagem Aeróbica)',
          pace: athlete.paceZones.z2_aerobic,
          color: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          bgColor: 'bg-blue-950/20',
          desc: 'Ritmo confortável de conversa',
        };
      case 'regenerativo':
        return {
          label: 'Ritmo Alvo (Zona 1 - Regenerativo Leve)',
          pace: athlete.paceZones.z1_recovery,
          color: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgColor: 'bg-emerald-950/20',
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
        return { label: 'Tiros / Intervalado', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      case 'longao':
        return { label: 'Longão de Fim de Semana', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'tempo_run':
        return { label: 'Ritmo / Tempo Run', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      case 'rodagem':
        return { label: 'Rodagem Aeróbica', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'regenerativo':
        return { label: 'Regenerativo Leve', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'forca':
        return { label: 'Fortalecimento / Funcional', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Descanso', bg: 'bg-slate-700/30 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="mx-auto w-full max-w-md pb-24 px-4 pt-3 space-y-4">
      {/* Card do Atleta e Prova Alvo */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <img
            src={athlete.avatarUrl}
            alt={athlete.name}
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-orange-500/40 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">Atleta PaceRun</span>
            <h2 className="text-lg font-bold text-white truncate">{athlete.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{athlete.targetRace}</span>
            </div>
          </div>
        </div>

        {/* Metas e Resumo Rápido */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3">
          <div className="rounded-xl bg-slate-950/60 p-2.5 text-center border border-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Objetivo</span>
            <p className="text-xs font-bold text-white mt-0.5 truncate">{athlete.targetDistance}</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-2.5 text-center border border-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Km na Semana</span>
            <p className="text-xs font-bold text-orange-400 mt-0.5">{totalKm.toFixed(1)} km</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-2.5 text-center border border-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">VDOT Base</span>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">{athlete.paceZones.vdot}</p>
          </div>
        </div>

        {/* Botão de Zonas de Pace */}
        <button
          onClick={() => setShowZones(!showZones)}
          className="mt-3 w-full flex items-center justify-between rounded-xl bg-slate-800/50 hover:bg-slate-800 px-3 py-2 text-xs text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            Minhas Zonas de Ritmo (Pace)
          </span>
          <ChevronRight className={`h-4 w-4 transition-transform ${showZones ? 'rotate-90' : ''}`} />
        </button>

        {/* Tabela expansível de Zonas */}
        {showZones && (
          <div className="mt-2.5 space-y-1.5 rounded-2xl bg-slate-950/80 p-3 text-xs border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800 text-[10px] uppercase font-semibold">
              <span>Zona de Treino (Teste 5k: {athlete.personalRecords['5k'] || '--:--'})</span>
              <span>Ritmo Alvo</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-emerald-400 font-medium">Z1 - Regenerativo</span>
              <span className="text-slate-200 font-mono">{athlete.paceZones.z1_recovery}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-blue-400 font-medium">Z2 - Rodagem Aeróbica</span>
              <span className="text-slate-200 font-mono">{athlete.paceZones.z2_aerobic}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-orange-400 font-medium">Z3 - Ritmo Prova (Tempo)</span>
              <span className="text-slate-200 font-mono">{athlete.paceZones.z3_tempo}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-amber-400 font-medium">Z4 - Limiar de Lactato</span>
              <span className="text-slate-200 font-mono">{athlete.paceZones.z4_threshold}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-rose-400 font-medium">Z5 - Tiros / VO2max</span>
              <span className="text-slate-200 font-mono">{athlete.paceZones.z5_interval}</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendário Semanal (Ribbon) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-lg">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-orange-400" />
            Semana Atual (23 a 29 Nov)
          </div>
          <span className="text-[11px] text-slate-400">
            {completedCount}/7 feitos
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
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30 scale-105 ring-1 ring-orange-300'
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800/60'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold">{d.label}</span>
                <span className="text-xs font-extrabold mt-0.5">{d.dayNum}</span>
                <div className="mt-1 h-1.5 w-1.5 rounded-full">
                  {isCompleted ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  ) : isRest ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhamento do Treino Selecionado */}
      {currentWorkout ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
          {/* Header do treino */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  getWorkoutBadge(currentWorkout.type).bg
                }`}
              >
                {getWorkoutBadge(currentWorkout.type).label}
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5">{currentWorkout.title}</h3>
              {currentWorkout.estimatedDistanceKm > 0 && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Footprints className="h-3.5 w-3.5 text-orange-400" />
                  Distância Estimada: ~{currentWorkout.estimatedDistanceKm} km
                </p>
              )}
            </div>

            {currentWorkout.status === 'completed' && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Concluído
              </span>
            )}
          </div>

          {/* Ritmo Alvo Dinâmico Baseado no VDOT/Zonas do Aluno */}
          {targetPace && currentWorkout.type !== 'descanso' && currentWorkout.type !== 'forca' && (
            <div className={`flex items-center justify-between rounded-2xl border p-3.5 shadow-sm ${targetPace.borderColor} ${targetPace.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow">
                  <Flame className={`h-5 w-5 ${targetPace.color}`} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {targetPace.label}
                  </span>
                  <span className={`text-base font-black font-mono tracking-tight ${targetPace.color}`}>
                    {targetPace.pace}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 font-bold block">
                  VDOT {athlete.paceZones.vdot}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">{targetPace.desc}</span>
              </div>
            </div>
          )}

          {/* Blocos do Treino */}
          <div className="space-y-2.5 pt-1">
            {/* Aquecimento */}
            {currentWorkout.blocks.warmup && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                  <Flame className="h-4 w-4" />
                  1. Aquecimento
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentWorkout.blocks.warmup}
                </p>
              </div>
            )}

            {/* Principal */}
            {currentWorkout.blocks.main && (
              <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-950/20 via-slate-950/70 to-slate-950/50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-extrabold text-orange-400 mb-1.5">
                  <Zap className="h-4 w-4 text-orange-500" />
                  2. Treino Principal
                </div>
                <p className="text-xs font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                  {currentWorkout.blocks.main}
                </p>
              </div>
            )}

            {/* Desaquecimento */}
            {currentWorkout.blocks.cooldown && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-1">
                  <Wind className="h-4 w-4" />
                  3. Volta à Calma / Desaquecimento
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentWorkout.blocks.cooldown}
                </p>
              </div>
            )}
          </div>

          {/* Observações do Treinador */}
          {currentWorkout.coachNotes && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 p-3.5 text-xs text-slate-300">
              <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Dica do Treinador:</strong>
                {currentWorkout.coachNotes}
              </div>
            </div>
          )}

          {/* Dados do Treino Executado (se já preenchido) */}
          {currentWorkout.log && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Resultado Registrado</span>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Distância</span>
                  <span className="text-xs font-bold text-white">{currentWorkout.log.distanceKm} km</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Pace Médio</span>
                  <span className="text-xs font-bold text-orange-400">{currentWorkout.log.avgPace}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Esforço RPE</span>
                  <span className="text-xs font-bold text-amber-400">{currentWorkout.log.rpeEffort}/10</span>
                </div>
              </div>

              {currentWorkout.log.painLevel !== 'none' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 p-2 rounded-xl">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>Dor relatada ({currentWorkout.log.painLevel}): {currentWorkout.log.painLocation}</span>
                </div>
              )}

              {currentWorkout.log.athleteFeedback && (
                <p className="text-xs text-slate-300 italic pt-1">
                  "{currentWorkout.log.athleteFeedback}"
                </p>
              )}
            </div>
          )}

          {/* Botão de Conclusão / Edição */}
          {currentWorkout.type !== 'descanso' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold shadow-lg transition-all ${
                currentWorkout.status === 'completed'
                  ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {currentWorkout.status === 'completed' ? 'Editar Dados do Treino' : 'Registrar Treino Realizado'}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          <Calendar className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <p className="text-xs font-medium">Nenhum treino prescrito para este dia.</p>
        </div>
      )}

      {/* Modal de Feedback */}
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
