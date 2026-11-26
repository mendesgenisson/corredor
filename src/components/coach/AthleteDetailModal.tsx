'use client';

import React, { useState, useEffect } from 'react';
import { AthleteProfile, PaceZones, Workout } from '@/types';
import { X, Flame, Calculator, Check, AlertTriangle, Trophy, Calendar } from 'lucide-react';
import { calculatePaceZonesFrom5k, parseTimeString, formatMinutesSeconds } from '@/lib/vdot';

interface AthleteDetailModalProps {
  athlete: AthleteProfile;
  workouts: Workout[];
  onClose: () => void;
  onUpdatePaceZones: (athleteId: string, zones: PaceZones, new5kTime?: string) => void;
}

export function AthleteDetailModal({
  athlete,
  workouts,
  onClose,
  onUpdatePaceZones,
}: AthleteDetailModalProps) {
  const [testTime5k, setTestTime5k] = useState(athlete.personalRecords['5k'] || '23:45');
  const [zones, setZones] = useState<PaceZones>(athlete.paceZones);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sincroniza se o atleta mudar externamente
  useEffect(() => {
    if (athlete.personalRecords['5k']) {
      setTestTime5k(athlete.personalRecords['5k']);
    }
    setZones(athlete.paceZones);
  }, [athlete.id, athlete.personalRecords['5k'], athlete.paceZones]);

  const athleteWorkouts = workouts.filter((w) => w.athleteId === athlete.id);
  const painAlerts = athleteWorkouts.filter((w) => w.log && w.log.painLevel !== 'none');

  const handleCalculateZones = () => {
    const totalSeconds = parseTimeString(testTime5k);
    if (totalSeconds) {
      const newZones = calculatePaceZonesFrom5k(totalSeconds);
      const formattedTime = formatMinutesSeconds(totalSeconds);
      setZones(newZones);
      setTestTime5k(formattedTime);
      onUpdatePaceZones(athlete.id, newZones, formattedTime);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 2500);
    }
  };

  const handleSave = () => {
    let finalZones = { ...zones };
    let savedTimeStr = testTime5k.trim();
    const totalSeconds = parseTimeString(testTime5k);
    if (totalSeconds) {
      finalZones = calculatePaceZonesFrom5k(totalSeconds);
      setZones(finalZones);
      savedTimeStr = formatMinutesSeconds(totalSeconds);
      setTestTime5k(savedTimeStr);
    }

    onUpdatePaceZones(athlete.id, finalZones, savedTimeStr);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={athlete.avatarUrl}
              alt={athlete.name}
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-orange-500/30"
            />
            <div>
              <h3 className="text-lg font-bold text-white">{athlete.name}</h3>
              <p className="text-xs text-slate-400">{athlete.email} • {athlete.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerta de Dores recentes (se houver) */}
        {painAlerts.length > 0 && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              Atenção: Relato recente de dores
            </div>
            {painAlerts.map((w) => (
              <p key={w.id} className="text-xs text-rose-200">
                • {w.scheduledDate} ({w.title}): Dor {w.log?.painLevel} em {w.log?.painLocation}
              </p>
            ))}
          </div>
        )}

        {/* Metas e Recordes */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-amber-400" /> Prova Alvo Principal
            </span>
            <p className="text-sm font-bold text-white mt-1">{athlete.targetRace}</p>
            <p className="text-xs text-orange-400 mt-0.5">{athlete.targetDistance}</p>
          </div>

          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Recordes Pessoais (RPs)</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Object.entries({ ...athlete.personalRecords, '5k': testTime5k }).map(([dist, time]) => (
                <div key={dist} className="rounded-lg bg-slate-900 p-1.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{dist}</span>
                  <p className="text-xs font-bold text-white font-mono">{time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calculadora VDOT e Gestão de Zonas de Pace */}
        <div className="mt-5 rounded-2xl border border-orange-500/20 bg-slate-950/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
              <Calculator className="h-4 w-4" />
              Calculadora de Zonas de Ritmo (VDOT Jack Daniels)
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              VDOT: {zones.vdot}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[11px] text-slate-400 mb-1">
                Tempo no último teste de 5km (MM:SS)
              </label>
              <input
                type="text"
                value={testTime5k}
                onChange={(e) => {
                  const val = e.target.value;
                  setTestTime5k(val);
                  const secs = parseTimeString(val);
                  if (secs && secs >= 600 && secs <= 3600) {
                    const previewZones = calculatePaceZonesFrom5k(secs);
                    setZones(previewZones);
                  }
                }}
                placeholder="23:45"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleCalculateZones}
              className="mt-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-2 text-xs font-semibold shadow transition-all active:scale-95"
            >
              Recalcular Zonas
            </button>
          </div>

          {/* Tabela de Zonas Editáveis */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {[
              { key: 'z1_recovery', label: 'Z1 - Regenerativo', color: 'text-emerald-400' },
              { key: 'z2_aerobic', label: 'Z2 - Rodagem Aeróbica', color: 'text-blue-400' },
              { key: 'z3_tempo', label: 'Z3 - Ritmo Maratona / Tempo', color: 'text-orange-400' },
              { key: 'z4_threshold', label: 'Z4 - Limiar de Lactato', color: 'text-amber-400' },
              { key: 'z5_interval', label: 'Z5 - Tiros / VO2max', color: 'text-rose-400' },
            ].map((z) => (
              <div key={z.key} className="flex items-center justify-between gap-3 text-xs">
                <span className={`w-48 font-medium ${z.color}`}>{z.label}</span>
                <input
                  type="text"
                  value={(zones as any)[z.key]}
                  onChange={(e) => setZones({ ...zones, [z.key]: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 font-mono text-right focus:border-orange-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-xs font-bold text-white shadow transition-all hover:from-orange-600 hover:to-amber-600 active:scale-95"
          >
            <Check className="h-4 w-4" />
            {savedSuccess ? '✓ Salvo e Sincronizado com os Treinos do Atleta!' : 'Salvar Novas Zonas do Aluno'}
          </button>
        </div>
      </div>
    </div>
  );
}
