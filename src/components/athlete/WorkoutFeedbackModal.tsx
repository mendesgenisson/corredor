'use client';

import React, { useState } from 'react';
import { Workout, WorkoutLog } from '@/types';
import { X, CheckCircle2, AlertTriangle, Flame, Clock, Navigation } from 'lucide-react';

interface WorkoutFeedbackModalProps {
  workout: Workout;
  onClose: () => void;
  onSave: (log: WorkoutLog) => void;
}

export function WorkoutFeedbackModal({ workout, onClose, onSave }: WorkoutFeedbackModalProps) {
  const [distanceKm, setDistanceKm] = useState<string>(
    workout.estimatedDistanceKm > 0 ? workout.estimatedDistanceKm.toString() : '5.0'
  );
  const [durationMinutes, setDurationMinutes] = useState<string>('30');
  const [rpeEffort, setRpeEffort] = useState<number>(7);
  const [painLevel, setPainLevel] = useState<'none' | 'mild' | 'moderate' | 'severe'>('none');
  const [painLocation, setPainLocation] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const dist = parseFloat(distanceKm);
  const dur = parseFloat(durationMinutes);
  let calculatedPace = '--:-- /km';

  if (!isNaN(dist) && dist > 0 && !isNaN(dur) && dur > 0) {
    const totalSeconds = dur * 60;
    const secPerKm = totalSeconds / dist;
    const paceMins = Math.floor(secPerKm / 60);
    const paceSecs = Math.round(secPerKm % 60);
    calculatedPace = `${paceMins}:${paceSecs < 10 ? '0' : ''}${paceSecs} /km`;
  }

  const rpeDescriptions: Record<number, { text: string }> = {
    1: { text: 'Extremamente Leve (quase repouso)' },
    2: { text: 'Muito Fácil (conversa contínua)' },
    3: { text: 'Fácil (confortável)' },
    4: { text: 'Moderado Leve (respiração cadenciada)' },
    5: { text: 'Moderado (esforço perceptível)' },
    6: { text: 'Moderado Intenso (frases curtas)' },
    7: { text: 'Forte (foco exigido)' },
    8: { text: 'Muito Forte (limiar/tiros pesados)' },
    9: { text: 'Quase Máximo (respiração ofegante)' },
    10: { text: 'Máximo Exaustivo (sprint final/teste)' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      workoutId: workout.id,
      completedAt: new Date().toISOString(),
      distanceKm: dist || 0,
      durationMinutes: dur || 0,
      avgPace: calculatedPace,
      rpeEffort,
      painLevel,
      painLocation: painLevel !== 'none' ? painLocation : undefined,
      athleteFeedback: feedback,
    };
    onSave(newLog);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-all animate-in fade-in">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-xl border border-[#E5E5EA] bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5EA]">
          <div>
            <span className="text-[11px] font-bold text-[#FC4C02] uppercase tracking-wider">Registrar Atividade</span>
            <h3 className="text-lg font-extrabold text-[#242428]">{workout.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6D6D78] hover:bg-[#F7F7FA] hover:text-[#242428] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Distância e Tempo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-3.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6D6D78]">
                <Navigation className="h-3.5 w-3.5 text-[#FC4C02]" /> Distância (km)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="mt-1.5 w-full bg-transparent text-xl font-black text-[#242428] focus:outline-none tabular-nums"
                placeholder="0.00"
                required
              />
            </div>

            <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-3.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6D6D78]">
                <Clock className="h-3.5 w-3.5 text-[#FC4C02]" /> Duração (minutos)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="mt-1.5 w-full bg-transparent text-xl font-black text-[#242428] focus:outline-none tabular-nums"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Ritmo Médio Calculado */}
          <div className="flex items-center justify-between rounded-lg bg-[#FFF2EC] border border-[#FC4C02]/25 px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#FC4C02]" />
              <span className="text-xs font-bold text-[#242428]">Ritmo Médio (Pace)</span>
            </div>
            <span className="text-base font-black text-[#FC4C02] font-mono tabular-nums">{calculatedPace}</span>
          </div>

          {/* Escala de Percepção de Esforço (Borg RPE 1-10) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#242428]">
                Percepção Subjetiva de Esforço (Borg RPE)
              </label>
              <span className="text-xs font-black text-[#FC4C02]">{rpeEffort} / 10</span>
            </div>
            <p className="text-xs text-[#6D6D78] mb-2.5">
              {rpeDescriptions[rpeEffort]?.text}
            </p>
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = rpeEffort === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRpeEffort(num)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#FC4C02] text-white shadow-sm scale-105'
                        : 'bg-[#F7F7FA] border border-[#E5E5EA] text-[#6D6D78] hover:bg-slate-200 hover:text-[#242428]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dores ou desconfortos */}
          <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-4">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#242428] mb-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Sentiu dores ou incômodos anormais?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'none', label: 'Nenhuma' },
                { key: 'mild', label: 'Leve' },
                { key: 'moderate', label: 'Moderada' },
                { key: 'severe', label: 'Forte' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPainLevel(item.key as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    painLevel === item.key
                      ? item.key === 'none'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-white border-[#E5E5EA] text-[#6D6D78] hover:text-[#242428]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {painLevel !== 'none' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={painLocation}
                  onChange={(e) => setPainLocation(e.target.value)}
                  placeholder="Onde sentiu a dor? (Ex: Joelho direito, canela, tendão...)"
                  className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs text-[#242428] placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Comentários ao Treinador */}
          <div>
            <label className="block text-xs font-bold text-[#242428] mb-1">
              Feedback / Como você se sentiu hoje?
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex: Treino fluiu bem, consegui manter 4:15 nos tiros. O vento estava contra na volta..."
              className="w-full rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-3 text-xs text-[#242428] placeholder-slate-400 focus:border-[#FC4C02] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#E5E5EA] bg-white py-3 text-xs font-bold text-[#6D6D78] hover:bg-[#F7F7FA] hover:text-[#242428] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] flex items-center justify-center gap-2 rounded-lg bg-[#FC4C02] hover:bg-[#E34402] py-3 text-xs font-bold text-white shadow-sm active:scale-[0.99] transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              Salvar Atividade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
