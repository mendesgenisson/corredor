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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Global */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/30">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
                Pace<span className="text-orange-500">Run</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium">
                Assessoria Esportiva PWA
              </span>
            </div>
          </div>

          {/* Switcher de Visão (Atleta PWA vs Treinador) */}
          <div className="flex items-center gap-2">
            {role === 'athlete' && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setRole('athlete')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  role === 'athlete'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Visão</span> Atleta (PWA)
              </button>

              <button
                onClick={() => setRole('coach')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  role === 'coach'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Painel</span> Treinador
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {role === 'athlete' ? (
          <AthleteView
            athlete={currentAthlete}
            workouts={workouts}
            onUpdateWorkout={handleUpdateWorkout}
          />
        ) : (
          <CoachView
            athletes={athletes}
            workouts={workouts}
            onAddWorkout={handleAddWorkout}
            onUpdatePaceZones={handleUpdatePaceZones}
          />
        )}
      </main>

      {/* Footer discreto */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        PaceRun © 2026 • Plataforma de Corrida e PWA Instalável
      </footer>
    </div>
  );
}
