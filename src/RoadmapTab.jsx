import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Target, Clock, CalendarPlus, StickyNote, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';
import { syncToSupabase } from './services/dataService';

// --- ROADMAP MINGGUAN (template berulang tiap minggu) ---
export const ROADMAP_TEMPLATE = [
  {
    day: 'Senin', focus: 'Pemrograman C & Logika',
    activities: [
      { id: 'rm-mon-1', hours: 1, topic: 'C', title: 'Pelajari & kerjakan modul interaktif Zybook COMP 6047' },
      { id: 'rm-mon-2', hours: 1, topic: 'C', title: 'Terapkan konsep Zybook langsung ke tantangan HackerRank (C Track)' }
    ]
  },
  {
    day: 'Selasa', focus: 'Pemrograman C & Logika',
    activities: [
      { id: 'rm-tue-1', hours: 1, topic: 'C', title: 'Lanjut eksplorasi Zybook (fokus pointers & manajemen memori)' },
      { id: 'rm-tue-2', hours: 1, topic: 'LeetCode', title: 'LeetCode tingkat Easy untuk topik Array atau Linked List' }
    ]
  },
  {
    day: 'Rabu', focus: 'Matematika (Aljabar Linear)',
    activities: [
      { id: 'rm-wed-1', hours: 1, topic: 'Matematika', title: 'Teori operasi matriks, vektor, dan transformasi linear' },
      { id: 'rm-wed-2', hours: 1, topic: 'Matematika', title: 'Latihan soal manual di kertas, verifikasi hasil dengan fx-991CW' }
    ]
  },
  {
    day: 'Kamis', focus: 'Matematika (Kalkulus / Statistika)',
    activities: [
      { id: 'rm-thu-1', hours: 1, topic: 'Matematika', title: 'Konsep turunan (derivatives) atau distribusi probabilitas' },
      { id: 'rm-thu-2', hours: 1, topic: 'Matematika', title: 'Pecahkan studi kasus statistik (pondasi cara model AI menebak data)' }
    ]
  },
  {
    day: 'Jumat', focus: 'Intensive Problem Solving',
    activities: [
      { id: 'rm-fri-1', hours: 2, topic: 'LeetCode', title: 'LeetCode 2-3 soal dengan timer, fokus optimasi kompleksitas waktu (Big O)' }
    ]
  },
  {
    day: 'Sabtu', focus: 'Implementasi Proyek Mini',
    activities: [
      { id: 'rm-sat-1', hours: 2, topic: 'Proyek', title: 'Buat program C murni dari nol yang menggabungkan pelajaran minggu ini (mis. perkalian dua matriks besar secara efisien)' }
    ]
  },
  {
    day: 'Minggu', focus: 'Review & Buffer Time',
    activities: [
      { id: 'rm-sun-1', hours: 1, topic: 'Review', title: 'Tinjau ulang konsep Zybook atau LeetCode yang masih membingungkan' },
      { id: 'rm-sun-2', hours: 1, topic: 'Buffer', title: 'Waktu fleksibel (materi kuliah, tugas, atau istirahat total)' }
    ]
  }
];

const TOPIC_STYLE = {
  C: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  LeetCode: 'bg-amber-50 text-amber-800 border-amber-200',
  Matematika: 'bg-sky-50 text-sky-800 border-sky-200',
  Proyek: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Review: 'bg-purple-50 text-purple-700 border-purple-200',
  Buffer: 'bg-zinc-100 text-zinc-600 border-zinc-200'
};

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const STORAGE_KEY = 'study_roadmap_progress';
const NOTES_KEY = 'study_roadmap_notes';

const pad = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Tanggal Senin pada minggu yang berisi `date`
const getMonday = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
};

const formatShort = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

const loadLocal = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Jam default saat dijadwalkan: mulai 20.30, panjang sesuai durasi aktivitas
const defaultTimeFor = (hours) => {
  const endH = 20 + hours;
  return `20.30 - ${pad(endH)}.30`;
};

export default function RoadmapTab({ onSchedule }) {
  const [weekOffset, setWeekOffset] = useState(0);
  // map: "YYYY-MM-DD(senin)_activityId" -> boolean
  const [progress, setProgress] = useState(() => loadLocal(STORAGE_KEY));
  // map: "YYYY-MM-DD(senin)_activityId" -> string catatan hasil
  const [notes, setNotes] = useState(() => loadLocal(NOTES_KEY));
  const [openNote, setOpenNote] = useState(null); // activity key yang catatannya sedang dibuka
  const [scheduling, setScheduling] = useState(null); // { activity, focus, date, time }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  // Muat progres dari Supabase (jika tersedia)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    (async () => {
      try {
        const { data, error } = await supabase.from('roadmap_progress').select('*');
        if (error || !data || data.length === 0) return;
        const map = {};
        const noteMap = {};
        data.forEach((r) => {
          map[r.id] = r.is_checked;
          if (r.note) noteMap[r.id] = r.note;
        });
        setProgress((prev) => ({ ...prev, ...map }));
        setNotes((prev) => ({ ...prev, ...noteMap }));
      } catch (e) {
        console.warn('Gagal memuat roadmap_progress:', e);
      }
    })();
  }, []);

  const today = new Date();
  const currentMonday = getMonday(today);
  const monday = useMemo(() => {
    const m = new Date(currentMonday);
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset, toDateStr(currentMonday)]);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const weekKey = toDateStr(monday);
  const todayName = DAY_NAMES[today.getDay()];

  const keyOf = (activityId) => `${weekKey}_${activityId}`;

  const buildRow = (activity, overrides = {}) => {
    const id = keyOf(activity.id);
    return {
      id,
      week: weekKey,
      activity_id: activity.id,
      is_checked: !!progress[id],
      note: notes[id] || null,
      updated_at: new Date().toISOString(),
      ...overrides
    };
  };

  const toggle = (activity) => {
    const id = keyOf(activity.id);
    const next = !progress[id];
    setProgress((prev) => ({ ...prev, [id]: next }));
    syncToSupabase('roadmap_progress', buildRow(activity, { is_checked: next }));
  };

  const saveNote = (activity, text) => {
    const id = keyOf(activity.id);
    setNotes((prev) => ({ ...prev, [id]: text }));
    syncToSupabase('roadmap_progress', buildRow(activity, { note: text || null }));
  };

  const dateForDayIndex = (idx) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + idx);
    return toDateStr(d);
  };

  const confirmSchedule = (e) => {
    e.preventDefault();
    if (!scheduling || !onSchedule) return;
    onSchedule({
      date: scheduling.date,
      time: scheduling.time,
      title: `🗺️ ${scheduling.activity.title}`,
      desc: `Roadmap: ${scheduling.focus} (${scheduling.activity.hours} jam)`
    });
    setScheduling(null);
  };

  const allActivities = ROADMAP_TEMPLATE.flatMap((d) => d.activities);
  const totalHours = allActivities.reduce((s, a) => s + a.hours, 0);
  const doneHours = allActivities.reduce((s, a) => s + (progress[keyOf(a.id)] ? a.hours : 0), 0);
  const percent = Math.round((doneHours / totalHours) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900">Roadmap Mingguan</h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Target belajar per topik: C, Matematika, LeetCode, dan proyek mini.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50" title="Minggu sebelumnya">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700">
            {formatShort(monday)} – {formatShort(sunday)}{weekOffset === 0 ? ' (Minggu ini)' : ''}
          </button>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50" title="Minggu berikutnya">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress mingguan */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
            <Target className="w-4 h-4 text-indigo-500" /> Progres Minggu Ini
          </div>
          <span className="text-sm font-bold text-zinc-900">{doneHours} / {totalHours} jam ({percent}%)</span>
        </div>
        <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Kartu per hari */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROADMAP_TEMPLATE.map((d, dayIdx) => {
          const isToday = weekOffset === 0 && d.day === todayName;
          const dayHours = d.activities.reduce((s, a) => s + a.hours, 0);
          const dayDone = d.activities.reduce((s, a) => s + (progress[keyOf(a.id)] ? a.hours : 0), 0);
          return (
            <div key={d.day} className={`bg-white rounded-2xl p-5 shadow-xs border transition ${isToday ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-zinc-200/80'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-zinc-900">{d.day}</h4>
                    {isToday && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500 text-white">Hari ini</span>}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{d.focus}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold ${dayDone === dayHours ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  <Clock className="w-3 h-3" /> {dayDone}/{dayHours} jam
                </span>
              </div>
              <div className="space-y-2">
                {d.activities.map((a) => {
                  const key = keyOf(a.id);
                  const checked = !!progress[key];
                  const note = notes[key] || '';
                  const noteOpen = openNote === key;
                  return (
                    <div
                      key={a.id}
                      className={`rounded-xl border transition hover:shadow-sm ${checked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-zinc-50/50 border-zinc-200/70 hover:bg-white'}`}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <button onClick={() => toggle(a)} className="shrink-0 mt-0.5" title={checked ? 'Tandai belum selesai' : 'Tandai selesai'}>
                          {checked
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            : <Circle className="w-5 h-5 text-zinc-300 hover:text-zinc-500" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p onClick={() => toggle(a)} className={`text-sm font-medium cursor-pointer ${checked ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>{a.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TOPIC_STYLE[a.topic] || TOPIC_STYLE.Buffer}`}>{a.topic}</span>
                            <span className="text-[11px] text-zinc-500">{a.hours} jam</span>
                            <span className="flex-1" />
                            <button
                              onClick={() => setOpenNote(noteOpen ? null : key)}
                              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border transition ${note ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800'}`}
                              title="Catatan hasil"
                            >
                              <StickyNote className="w-3 h-3" /> {note ? 'Catatan' : 'Catat'}
                            </button>
                            {onSchedule && (
                              <button
                                onClick={() => setScheduling({ activity: a, focus: d.focus, date: dateForDayIndex(dayIdx), time: defaultTimeFor(a.hours) })}
                                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-zinc-200 bg-white text-zinc-500 hover:text-indigo-700 hover:border-indigo-200 transition"
                                title="Masukkan ke jadwal harian"
                              >
                                <CalendarPlus className="w-3 h-3" /> Jadwalkan
                              </button>
                            )}
                          </div>
                          {note && !noteOpen && (
                            <p className="mt-2 text-xs text-zinc-600 whitespace-pre-wrap border-l-2 border-amber-300 pl-2">{note}</p>
                          )}
                          {noteOpen && (
                            <textarea
                              autoFocus
                              defaultValue={note}
                              onBlur={(e) => { saveNote(a, e.target.value.trim()); setOpenNote(null); }}
                              placeholder="Mis. LeetCode #1 Two Sum, #206 Reverse Linked List — 3 soal, 45 menit"
                              rows={3}
                              className="mt-2 w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Jadwalkan */}
      {scheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4" onClick={() => setScheduling(null)}>
          <form onSubmit={confirmSchedule} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-zinc-900">Jadwalkan ke Jadwal Harian</h4>
                <p className="text-xs text-zinc-500 mt-0.5">{scheduling.activity.title}</p>
              </div>
              <button type="button" onClick={() => setScheduling(null)} className="p-1 rounded-lg hover:bg-zinc-100"><X className="w-4 h-4" /></button>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-zinc-700">Tanggal</span>
              <input
                type="date"
                required
                value={scheduling.date}
                onChange={(e) => setScheduling({ ...scheduling, date: e.target.value })}
                className="mt-1 w-full text-sm p-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-zinc-700">Jam (format HH.MM - HH.MM)</span>
              <input
                type="text"
                required
                pattern="\d{2}\.\d{2} - \d{2}\.\d{2}"
                value={scheduling.time}
                onChange={(e) => setScheduling({ ...scheduling, time: e.target.value })}
                className="mt-1 w-full text-sm p-2 rounded-lg border border-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <p className="text-[11px] text-zinc-500">Ditambahkan sebagai kegiatan khusus tanggal ini (tidak mengubah master template).</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setScheduling(null)} className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 hover:bg-zinc-50">Batal</button>
              <button type="submit" className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800">
                <CalendarPlus className="w-4 h-4" /> Jadwalkan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
