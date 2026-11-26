'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AthleteProfile, PaceZones, Workout } from '@/types';
import { 
  X, 
  Calculator, 
  Check, 
  AlertTriangle, 
  Trophy, 
  Calendar, 
  User, 
  Scale, 
  Trash2, 
  Save, 
  Activity, 
  Mail, 
  Phone, 
  Target, 
  Image as ImageIcon,
  Upload,
  Camera
} from 'lucide-react';
import { calculatePaceZonesFrom5k, parseTimeString, formatMinutesSeconds } from '@/lib/vdot';

/**
 * Aplica máscara automática de telefone brasileiro (fixo 10 dígitos ou celular 11 dígitos)
 */
function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

interface AthleteDetailModalProps {
  athlete: AthleteProfile;
  workouts: Workout[];
  onClose: () => void;
  onUpdatePaceZones: (athleteId: string, zones: PaceZones, new5kTime?: string) => void;
  onUpdateAthlete: (updatedAthlete: AthleteProfile) => void;
  onDeleteAthlete: (athleteId: string) => void;
}

export function AthleteDetailModal({
  athlete,
  workouts,
  onClose,
  onUpdatePaceZones,
  onUpdateAthlete,
  onDeleteAthlete,
}: AthleteDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'cadastro'>('performance');
  
  // Estados de Zonas e VDOT
  const [testTime5k, setTestTime5k] = useState(athlete.personalRecords['5k'] || '23:45');
  const [zones, setZones] = useState<PaceZones>(athlete.paceZones);
  const [savedZonesSuccess, setSavedZonesSuccess] = useState(false);

  // Estados do Formulário de Cadastro do Aluno
  const [name, setName] = useState(athlete.name);
  const [email, setEmail] = useState(athlete.email);
  const [phone, setPhone] = useState(formatPhoneMask(athlete.phone));
  const [initialWeightKg, setInitialWeightKg] = useState<string>(
    athlete.initialWeightKg !== undefined ? athlete.initialWeightKg.toString() : ''
  );
  const [targetRace, setTargetRace] = useState(athlete.targetRace);
  const [targetDistance, setTargetDistance] = useState(athlete.targetDistance);
  const [targetDate, setTargetDate] = useState(athlete.targetDate);
  const [avatarUrl, setAvatarUrl] = useState(athlete.avatarUrl);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado de confirmação de exclusão
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Sincroniza se o atleta mudar externamente
  useEffect(() => {
    if (athlete.personalRecords['5k']) {
      setTestTime5k(athlete.personalRecords['5k']);
    }
    setZones(athlete.paceZones);
    setName(athlete.name);
    setEmail(athlete.email);
    setPhone(formatPhoneMask(athlete.phone));
    setInitialWeightKg(athlete.initialWeightKg !== undefined ? athlete.initialWeightKg.toString() : '');
    setTargetRace(athlete.targetRace);
    setTargetDistance(athlete.targetDistance);
    setTargetDate(athlete.targetDate);
    setAvatarUrl(athlete.avatarUrl);
  }, [athlete]);

  /**
   * Lê e redimensiona a foto selecionada do computador para manter o localStorage leve
   */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
        } else {
          setAvatarUrl(dataUrl);
        }
      };
      img.onerror = () => setAvatarUrl(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

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
      setSavedZonesSuccess(true);
      setTimeout(() => {
        setSavedZonesSuccess(false);
      }, 2500);
    }
  };

  const handleSaveZones = () => {
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
    setSavedZonesSuccess(true);
    setTimeout(() => {
      setSavedZonesSuccess(false);
    }, 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = initialWeightKg.trim() !== '' ? parseFloat(initialWeightKg.replace(',', '.')) : undefined;

    const updated: AthleteProfile = {
      ...athlete,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      initialWeightKg: !isNaN(parsedWeight as number) ? parsedWeight : undefined,
      targetRace: targetRace.trim(),
      targetDistance: targetDistance.trim(),
      targetDate: targetDate.trim(),
      avatarUrl: avatarUrl.trim() || athlete.avatarUrl,
    };

    onUpdateAthlete(updated);
    setSavedProfileSuccess(true);
    setTimeout(() => {
      setSavedProfileSuccess(false);
    }, 2500);
  };

  const handleDeleteConfirmed = () => {
    onDeleteAthlete(athlete.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl rounded-xl border border-[#E5E5EA] bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header do Aluno */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl || athlete.avatarUrl}
              alt={name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[#FC4C02]/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#242428]">{name}</h3>
                {initialWeightKg && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#242428] bg-[#F7F7FA] border border-[#E5E5EA] px-2 py-0.5 rounded-full">
                    <Scale className="h-3 w-3 text-[#FC4C02]" />
                    {initialWeightKg} kg
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6D6D78]">{email} • {phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6D6D78] hover:bg-[#F7F7FA] hover:text-[#242428] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação por Abas */}
        <div className="mt-4 flex rounded-lg bg-[#F7F7FA] p-1 border border-[#E5E5EA]">
          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'performance'
                ? 'bg-[#FC4C02] text-white shadow-xs'
                : 'text-[#6D6D78] hover:text-[#242428]'
            }`}
          >
            <Activity className="h-4 w-4" />
            Zonas e Performance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cadastro')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'cadastro'
                ? 'bg-[#FC4C02] text-white shadow-xs'
                : 'text-[#6D6D78] hover:text-[#242428]'
            }`}
          >
            <User className="h-4 w-4" />
            Alterar Cadastro
          </button>
        </div>

        {/* Conteúdo Aba 1: Performance e Zonas */}
        {activeTab === 'performance' && (
          <div className="mt-4 space-y-4">
            {/* Alerta de Dores recentes (se houver) */}
            {painAlerts.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Atenção: Relato recente de dores
                </div>
                {painAlerts.map((w) => (
                  <p key={w.id} className="text-xs text-rose-700">
                    • {w.scheduledDate} ({w.title}): Dor {w.log?.painLevel} em {w.log?.painLocation}
                  </p>
                ))}
              </div>
            )}

            {/* Metas e Recordes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#F7F7FA] border border-[#E5E5EA] p-3.5">
                <span className="text-[10px] uppercase font-bold text-[#6D6D78] flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-[#FC4C02]" /> Prova Alvo Principal
                </span>
                <p className="text-sm font-bold text-[#242428] mt-1">{athlete.targetRace}</p>
                <p className="text-xs font-semibold text-[#FC4C02] mt-0.5">{athlete.targetDistance}</p>
                {athlete.targetDate && (
                  <p className="text-[11px] text-[#6D6D78] mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Data: {athlete.targetDate}
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-[#F7F7FA] border border-[#E5E5EA] p-3.5">
                <span className="text-[10px] uppercase font-bold text-[#6D6D78]">Recordes Pessoais (RPs)</span>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {Object.entries({ ...athlete.personalRecords, '5k': testTime5k }).map(([dist, time]) => (
                    <div key={dist} className="rounded-md bg-white border border-[#E5E5EA] p-1.5 text-center">
                      <span className="text-[10px] text-[#6D6D78] uppercase font-bold">{dist}</span>
                      <p className="text-xs font-bold text-[#242428] font-mono">{time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculadora VDOT e Gestão de Zonas de Pace */}
            <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#242428]">
                  <Calculator className="h-4 w-4 text-[#FC4C02]" />
                  Calculadora de Zonas (VDOT Jack Daniels)
                </div>
                <span className="text-xs font-black text-[#FC4C02] bg-[#FFF2EC] px-2.5 py-0.5 rounded-full border border-[#FC4C02]/30 font-mono">
                  VDOT: {zones.vdot}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-[#6D6D78] mb-1">
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
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs font-bold text-[#242428] font-mono focus:border-[#FC4C02] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCalculateZones}
                  className="mt-5 rounded-lg bg-[#242428] hover:bg-black text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  Recalcular Zonas
                </button>
              </div>

              {/* Tabela de Zonas Editáveis */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5EA]">
                {[
                  { key: 'z1_recovery', label: 'Z1 - Regenerativo', color: 'text-emerald-700' },
                  { key: 'z2_aerobic', label: 'Z2 - Rodagem Aeróbica', color: 'text-sky-700' },
                  { key: 'z3_tempo', label: 'Z3 - Ritmo Maratona / Tempo', color: 'text-amber-700' },
                  { key: 'z4_threshold', label: 'Z4 - Limiar de Lactato', color: 'text-orange-600' },
                  { key: 'z5_interval', label: 'Z5 - Tiros / VO2max', color: 'text-[#FC4C02]' },
                ].map((z) => (
                  <div key={z.key} className="flex items-center justify-between gap-3 text-xs">
                    <span className={`w-48 font-bold ${z.color}`}>{z.label}</span>
                    <input
                      type="text"
                      value={(zones as any)[z.key]}
                      onChange={(e) => setZones({ ...zones, [z.key]: e.target.value })}
                      className="flex-1 rounded-lg border border-[#E5E5EA] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#242428] font-mono text-right focus:border-[#FC4C02] focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveZones}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#FC4C02] hover:bg-[#E34402] py-3 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
              >
                <Check className="h-4 w-4" />
                {savedZonesSuccess ? '✓ Salvo e Sincronizado com os Treinos do Atleta!' : 'Salvar Novas Zonas do Aluno'}
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo Aba 2: Formulário de Alteração de Cadastro */}
        {activeTab === 'cadastro' && (
          <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
            <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FC4C02] flex items-center gap-1.5">
                <User className="h-4 w-4" /> Informações Pessoais e Físicas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#242428] mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs text-[#242428] focus:border-[#FC4C02] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#242428] mb-1 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-[#FC4C02]" />
                    Peso Inicial (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={initialWeightKg}
                    onChange={(e) => setInitialWeightKg(e.target.value)}
                    placeholder="Ex: 68.5"
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs text-[#242428] focus:border-[#FC4C02] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#242428] mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-[#6D6D78]" /> E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs text-[#242428] focus:border-[#FC4C02] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#242428] mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#6D6D78]" /> Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs text-[#242428] focus:border-[#FC4C02] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Foto de Perfil (Upload do computador ou URL) */}
              <div className="pt-3 border-t border-[#E5E5EA] space-y-2.5">
                <label className="block text-[11px] font-bold text-[#242428] flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5 text-[#FC4C02]" /> Foto do Perfil
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl || athlete.avatarUrl}
                      alt={name}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-[#FC4C02]/30 bg-white"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#FC4C02] bg-[#FFF2EC] hover:bg-[#FC4C02] hover:text-white px-3.5 py-2 text-xs font-bold text-[#FC4C02] transition-all active:scale-95"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Buscar Foto no Computador
                    </button>
                    <p className="text-[10px] text-[#6D6D78]">
                      Formatos JPG, PNG ou WebP. A imagem é otimizada automaticamente.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#6D6D78] mb-1 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Ou cole uma URL de imagem (opcional)
                  </label>
                  <input
                    type="text"
                    value={avatarUrl.startsWith('data:image') ? '' : avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={
                      avatarUrl.startsWith('data:image')
                        ? '✓ Foto carregada do computador (cole uma URL para substituir)'
                        : 'https://...'
                    }
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-1.5 text-[11px] text-[#242428] focus:border-[#FC4C02] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Metas Esportivas */}
            <div className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#242428] flex items-center gap-1.5">
                <Target className="h-4 w-4 text-[#FC4C02]" /> Objetivos e Prova Alvo
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#242428] mb-1">
                    Nome da Prova Alvo
                  </label>
                  <input
                    type="text"
                    value={targetRace}
                    onChange={(e) => setTargetRace(e.target.value)}
                    placeholder="Ex: Meia Maratona Internacional"
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs text-[#242428] focus:border-[#FC4C02] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#242428] mb-1">
                    Data da Prova
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs text-[#242428] focus:border-[#FC4C02] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-[#242428] mb-1">
                    Distância / Meta de Tempo
                  </label>
                  <input
                    type="text"
                    value={targetDistance}
                    onChange={(e) => setTargetDistance(e.target.value)}
                    placeholder="Ex: 21km (Meta: Sub-1h50)"
                    className="w-full rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-xs text-[#242428] focus:border-[#FC4C02] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Botão de Salvar Cadastro */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FC4C02] hover:bg-[#E34402] py-3 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
            >
              <Save className="h-4 w-4" />
              {savedProfileSuccess ? '✓ Cadastro Atualizado com Sucesso!' : 'Salvar Alterações do Cadastro'}
            </button>

            {/* Zona de Perigo: Exclusão do Aluno */}
            <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50/70 p-4 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" /> Zona de Perigo: Excluir Aluno
                </h4>
                <p className="text-[11px] text-rose-700/80 mt-0.5">
                  Essa ação removerá o aluno e todos os seus treinos e históricos da assessoria.
                </p>
              </div>

              {!isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir Cadastro do Aluno
                </button>
              ) : (
                <div className="rounded-lg border border-rose-300 bg-white p-3 space-y-2 animate-in fade-in">
                  <p className="text-xs font-bold text-rose-700">
                    Tem certeza que deseja excluir o cadastro de {athlete.name}?
                  </p>
                  <p className="text-[11px] text-[#6D6D78]">
                    Esta ação é irreversível e excluirá todas as planilhas e feedbacks vinculados.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="rounded-lg border border-[#E5E5EA] bg-[#F7F7FA] px-3 py-1.5 text-xs font-semibold text-[#242428] hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirmed}
                      className="rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
                    >
                      Sim, Confirmar Exclusão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
