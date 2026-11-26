'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, AthleteProfile, Workout, PaceZones } from '@/types';
import { MOCK_ATHLETES, MOCK_WORKOUTS } from '@/lib/mockData';
import { syncWorkoutTextWithZones } from '@/lib/vdot';
import { AthleteView } from '@/components/athlete/AthleteView';
import { CoachView } from '@/components/coach/CoachView';
import { Flame, Smartphone, Laptop, Users } from 'lucide-react';

const STORAGE_KEY_ATHLETES = 'pacerun_athletes_v1';
const STORAGE_KEY_WORKOUTS = 'pacerun_workouts_v1';

export default function Home() {
  const [role, setRole] = useState<UserRole>('athlete');
  const [athletes, setAthletes] = useState<AthleteProfile[]>(MOCK_ATHLETES);
  const [workouts, setWorkouts] = useState<Workout[]>(MOCK_WORKOUTS);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('ath-1');
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega dados salvos no localStorage (permanência real)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAthletes = localStorage.getItem(STORAGE_KEY_ATHLETES);
        if (savedAthletes) {
          const parsed = JSON.parse(savedAthletes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAthletes(parsed);
          }
        }
        const savedWorkouts = localStorage.getItem(STORAGE_KEY_WORKOUTS);
        if (savedWorkouts) {
          const parsedW = JSON.parse(savedWorkouts);
          if (Array.isArray(parsedW) && parsedW.length > 0) {
            setWorkouts(parsedW);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar dados salvos do localStorage:', err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  const handleUpdateWorkout = (updated: Workout) => {
    setWorkouts((prev) => {
      const next = prev.map((w) => (w.id === updated.id ? updated : w));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  };

  const handleAddWorkout = (newW: Workout) => {
    setWorkouts((prev) => {
      const next = [newW, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  };

  const handleUpdatePaceZones = (athleteId: string, zones: PaceZones, new5kTime?: string) => {
    // 1. Atualiza dados do atleta (Zonas de ritmo e recorde de 5k)
    let updatedAthletesList: AthleteProfile[] = [];

    setAthletes((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== athleteId) return a;
        return {
          ...a,
          paceZones: zones,
          personalRecords: {
            ...a.personalRecords,
            ...(new5kTime ? { '5k': new5kTime } : {}),
          },
        };
      });
      updatedAthletesList = updated;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_ATHLETES, JSON.stringify(updated));
        } catch (e) {
          console.error('Erro ao salvar atletas no localStorage:', e);
        }
      }

      return updated;
    });

    // Também atualiza em memória nos mocks para garantir consistência
    const targetMock = MOCK_ATHLETES.find((m) => m.id === athleteId);
    if (targetMock) {
      targetMock.paceZones = zones;
      if (new5kTime) targetMock.personalRecords['5k'] = new5kTime;
    }

    // 2. Atualiza todos os blocos (aquecimento, principal e desaquecimento) dos treinos da semana do atleta
    setWorkouts((prev) => {
      const updated = prev.map((w) => {
        if (w.athleteId !== athleteId) return w;

        return {
          ...w,
          blocks: {
            warmup: syncWorkoutTextWithZones(w.blocks.warmup, zones),
            main: syncWorkoutTextWithZones(w.blocks.main, zones),
            cooldown: syncWorkoutTextWithZones(w.blocks.cooldown, zones),
          },
        };
      });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(updated));
        } catch (e) {
          console.error('Erro ao salvar treinos no localStorage:', e);
        }
      }

      return updated;
    });
  };

  const handleUpdateAthlete = (updatedAthlete: AthleteProfile) => {
    setAthletes((prev) => {
      const updated = prev.map((a) => (a.id === updatedAthlete.id ? updatedAthlete : a));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_ATHLETES, JSON.stringify(updated));
        } catch (e) {
          console.error('Erro ao atualizar atleta no localStorage:', e);
        }
      }
      return updated;
    });

    const targetMock = MOCK_ATHLETES.find((m) => m.id === updatedAthlete.id);
    if (targetMock) {
      Object.assign(targetMock, updatedAthlete);
    }
  };

  const handleDeleteAthlete = (athleteId: string) => {
    setAthletes((prev) => {
      const updated = prev.filter((a) => a.id !== athleteId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_ATHLETES, JSON.stringify(updated));
        } catch (e) {
          console.error('Erro ao excluir atleta no localStorage:', e);
        }
      }
      return updated;
    });

    // Remove também todos os treinos vinculados a este atleta
    setWorkouts((prev) => {
      const updated = prev.filter((w) => w.athleteId !== athleteId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(updated));
        } catch (e) {
          console.error('Erro ao excluir treinos do atleta no localStorage:', e);
        }
      }
      return updated;
    });

    // Se o atleta atualmente selecionado na visão do atleta foi o excluído, seleciona outro
    setSelectedAthleteId((current) => {
      if (current === athleteId) {
        const remaining = athletes.filter((a) => a.id !== athleteId);
        return remaining.length > 0 ? remaining[0].id : '';
      }
      return current;
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] text-[#242428] flex flex-col">
      {/* Top Header Global - Estilo Strava */}
      <header className="sticky top-0 z-40 border-b border-[#E5E5EA] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FC4C02] text-white shadow-sm">
              <Flame className="h-5 w-5 fill-white/20" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black tracking-tight text-[#242428]">
                PACE<span className="text-[#FC4C02]">RUN</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] text-[#6D6D78] font-medium">
                Assessoria Esportiva
              </span>
            </div>
          </div>

          {/* Switcher de Visão (Atleta PWA vs Treinador) */}
          <div className="flex items-center gap-3 h-full">
            {role === 'athlete' && athletes.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] px-2.5 py-1.5 text-xs">
                <Users className="h-3.5 w-3.5 text-[#6D6D78]" />
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#242428] focus:outline-none cursor-pointer"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id} className="bg-white text-[#242428]">
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <nav className="flex items-center h-full gap-1 sm:gap-2">
              <button
                onClick={() => setRole('athlete')}
                className={`flex items-center gap-1.5 h-full px-3 text-xs font-bold border-b-2 transition-colors ${
                  role === 'athlete'
                    ? 'border-[#FC4C02] text-[#FC4C02]'
                    : 'border-transparent text-[#6D6D78] hover:text-[#242428]'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Visão Atleta</span>
              </button>

              <button
                onClick={() => setRole('coach')}
                className={`flex items-center gap-1.5 h-full px-3 text-xs font-bold border-b-2 transition-colors ${
                  role === 'coach'
                    ? 'border-[#FC4C02] text-[#FC4C02]'
                    : 'border-transparent text-[#6D6D78] hover:text-[#242428]'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Painel Treinador</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {role === 'athlete' ? (
          currentAthlete ? (
            <AthleteView
              athlete={currentAthlete}
              workouts={workouts}
              onUpdateWorkout={handleUpdateWorkout}
            />
          ) : (
            <div className="mx-auto max-w-md p-8 text-center text-sm text-[#6D6D78]">
              Nenhum atleta cadastrado no momento.
            </div>
          )
        ) : (
          <CoachView
            athletes={athletes}
            workouts={workouts}
            onAddWorkout={handleAddWorkout}
            onUpdatePaceZones={handleUpdatePaceZones}
            onUpdateAthlete={handleUpdateAthlete}
            onDeleteAthlete={handleDeleteAthlete}
          />
        )}
      </main>

      {/* Footer discreto */}
      <footer className="border-t border-[#E5E5EA] bg-white py-4 text-center text-xs text-[#6D6D78]">
        PaceRun © 2026 • Assessoria de Corrida &amp; PWA
      </footer>
    </div>
  );
}
