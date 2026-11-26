'use client';

import React, { useState } from 'react';
import { AthleteProfile, PaceZones, Workout } from '@/types';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Trophy,
  Activity
} from 'lucide-react';
import { WorkoutBuilderModal } from './WorkoutBuilderModal';
import { AthleteDetailModal } from './AthleteDetailModal';

interface CoachViewProps {
  athletes: AthleteProfile[];
  workouts: Workout[];
  onAddWorkout: (workout: Workout) => void;
  onUpdatePaceZones: (athleteId: string, zones: PaceZones, new5kTime?: string) => void;
  onUpdateAthlete: (updatedAthlete: AthleteProfile) => void;
  onDeleteAthlete: (athleteId: string) => void;
}

export function CoachView({
  athletes,
  workouts,
  onAddWorkout,
  onUpdatePaceZones,
  onUpdateAthlete,
  onDeleteAthlete,
}: CoachViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthleteIdForDetail, setSelectedAthleteIdForDetail] = useState<string | null>(null);
  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
  const [prescribeAthleteId, setPrescribeAthleteId] = useState<string | undefined>(undefined);

  const selectedAthleteForDetail = athletes.find((a) => a.id === selectedAthleteIdForDetail) || null;

  const filteredAthletes = athletes.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.targetRace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAthletes = athletes.length;
  const completedWorkouts = workouts.filter((w) => w.status === 'completed').length;
  const painAlerts = workouts.filter((w) => w.log && w.log.painLevel !== 'none').length;

  const handleOpenPrescribeForAthlete = (athleteId: string) => {
    setPrescribeAthleteId(athleteId);
    setIsPrescribeOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
      {/* Top Bar com Estatísticas Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#FC4C02] uppercase tracking-wider">Painel do Treinador</span>
          <h1 className="text-2xl font-black text-[#242428] tracking-tight">Gestão da Assessoria</h1>
          <p className="text-xs text-[#6D6D78] mt-0.5">Acompanhamento de atletas e prescrição de planilhas</p>
        </div>

        <button
          onClick={() => {
            setPrescribeAthleteId(undefined);
            setIsPrescribeOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#FC4C02] hover:bg-[#E34402] px-5 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Prescrever Novo Treino
        </button>
      </div>

      {/* Cards de Métricas do Treinador */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[#6D6D78] mb-2">
            <span className="text-xs font-semibold">Atletas Ativos</span>
            <Users className="h-4 w-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-[#242428] tabular-nums">{totalAthletes}</span>
        </div>

        <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[#6D6D78] mb-2">
            <span className="text-xs font-semibold">Treinos Prescritos</span>
            <Calendar className="h-4 w-4 text-[#FC4C02]" />
          </div>
          <span className="text-2xl font-black text-[#242428] tabular-nums">{workouts.length}</span>
        </div>

        <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[#6D6D78] mb-2">
            <span className="text-xs font-semibold">Treinos Concluídos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-[#242428] tabular-nums">{completedWorkouts}</span>
        </div>

        <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-[#6D6D78] mb-2">
            <span className="text-xs font-semibold">Alertas de Dor</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-600 tabular-nums">{painAlerts}</span>
        </div>
      </div>

      {/* Lista de Atletas */}
      <div className="rounded-xl border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-[#242428] flex items-center gap-2">
            <Users className="h-4 w-4 text-[#FC4C02]" />
            Alunos Matriculados
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6D6D78]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar atleta ou prova..."
              className="w-full rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] pl-9 pr-3 py-2 text-xs text-[#242428] placeholder-[#6D6D78] focus:border-[#FC4C02] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {filteredAthletes.map((a) => {
            const athleteWorkouts = workouts.filter((w) => w.athleteId === a.id);
            const hasPain = athleteWorkouts.some((w) => w.log && w.log.painLevel !== 'none');

            return (
              <div
                key={a.id}
                className="rounded-xl border border-[#E5E5EA] bg-white p-4 hover:border-[#FC4C02]/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={a.avatarUrl}
                        alt={a.name}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-[#FC4C02]/20"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#242428]">{a.name}</h3>
                        <p className="text-[11px] text-[#6D6D78] font-mono">{a.phone}</p>
                      </div>
                    </div>
                    {hasPain && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200" title="Relatou dor recente">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="mt-3 rounded-lg bg-[#F7F7FA] border border-[#E5E5EA] p-2.5 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#242428] font-medium">
                      <Trophy className="h-3.5 w-3.5 text-[#FC4C02] shrink-0" />
                      <span className="truncate">{a.targetRace}</span>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-[#E5E5EA] text-center pt-1.5 border-t border-[#E5E5EA]">
                      <div>
                        <span className="text-[9px] uppercase font-semibold text-[#6D6D78] block">VDOT</span>
                        <strong className="text-xs text-[#FC4C02] tabular-nums">{a.paceZones.vdot}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-semibold text-[#6D6D78] block">Peso</span>
                        <strong className="text-xs text-[#242428] tabular-nums">
                          {a.initialWeightKg !== undefined ? `${a.initialWeightKg}kg` : '--'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-semibold text-[#6D6D78] block">5k</span>
                        <strong className="text-xs text-[#242428] font-mono">{a.personalRecords['5k'] || '--:--'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex gap-2">
                  <button
                    onClick={() => setSelectedAthleteIdForDetail(a.id)}
                    className="flex-1 rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] py-2 text-xs font-bold text-[#242428] hover:bg-slate-200/70 transition-all text-center"
                  >
                    Ver Ficha / Zonas
                  </button>
                  <button
                    onClick={() => handleOpenPrescribeForAthlete(a.id)}
                    className="rounded-lg bg-[#FC4C02] hover:bg-[#E34402] px-3 py-2 text-white transition-all active:scale-95"
                    title="Prescrever treino para este atleta"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feed Recente de Treinos Executados - Estilo Strava Feed */}
      <div className="rounded-xl border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
        <h2 className="text-base font-extrabold text-[#242428] flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#FC4C02]" />
          Feed de Atividades dos Alunos
        </h2>

        <div className="space-y-2.5">
          {workouts.filter((w) => w.status === 'completed' && w.log).length === 0 ? (
            <p className="text-xs text-[#6D6D78] py-4 text-center">
              Nenhuma atividade registrada pelos alunos nesta semana ainda.
            </p>
          ) : (
            workouts
              .filter((w) => w.status === 'completed' && w.log)
              .map((w) => {
                const athlete = athletes.find((a) => a.id === w.athleteId);
                return (
                  <div
                    key={w.id}
                    className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={athlete?.avatarUrl}
                        alt={athlete?.name}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-[#E5E5EA]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#242428]">{athlete?.name}</span>
                          <span className="text-[10px] text-[#6D6D78]">• {w.scheduledDate}</span>
                        </div>
                        <p className="text-xs text-[#FC4C02] font-bold">{w.title}</p>
                        {w.log?.athleteFeedback && (
                          <p className="text-xs text-[#6D6D78] italic mt-0.5">"{w.log.athleteFeedback}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center divide-x divide-[#E5E5EA] bg-white rounded-lg border border-[#E5E5EA] px-3 py-1.5 text-center">
                      <div className="pr-3">
                        <span className="text-[9px] uppercase text-[#6D6D78] block font-semibold">Distância</span>
                        <span className="text-xs font-black text-[#242428] tabular-nums">{w.log?.distanceKm} km</span>
                      </div>
                      <div className="px-3">
                        <span className="text-[9px] uppercase text-[#6D6D78] block font-semibold">Pace</span>
                        <span className="text-xs font-black text-[#FC4C02] tabular-nums">{w.log?.avgPace}</span>
                      </div>
                      <div className="pl-3">
                        <span className="text-[9px] uppercase text-[#6D6D78] block font-semibold">RPE</span>
                        <span className="text-xs font-black text-[#242428] tabular-nums">{w.log?.rpeEffort}/10</span>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Modais */}
      {isPrescribeOpen && (
        <WorkoutBuilderModal
          athletes={athletes}
          initialAthleteId={prescribeAthleteId}
          onClose={() => setIsPrescribeOpen(false)}
          onSave={(newW) => {
            onAddWorkout(newW);
            setIsPrescribeOpen(false);
          }}
        />
      )}

      {selectedAthleteForDetail && (
        <AthleteDetailModal
          athlete={selectedAthleteForDetail}
          workouts={workouts}
          onClose={() => setSelectedAthleteIdForDetail(null)}
          onUpdatePaceZones={onUpdatePaceZones}
          onUpdateAthlete={onUpdateAthlete}
          onDeleteAthlete={(id) => {
            onDeleteAthlete(id);
            setSelectedAthleteIdForDetail(null);
          }}
        />
      )}
    </div>
  );
}
