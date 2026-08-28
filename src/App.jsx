import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Code,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sun,
  FileText,
  Edit3,
  X,
  RefreshCw,
  CalendarCheck,
  ArrowRight,
  Flame,
  Sparkles,
  Trophy,
  Filter,
  Coffee,
  BarChart3,
  BookOpen,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Printer,
  Timer,
  Lock,
  AlertCircle,
  Database,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Layers
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';
import { syncToSupabase, deleteFromSupabase } from './services/dataService';

// --- CATEGORY METADATA WITH PASTEL ACCENTS & SPREADSHEET LEGEND MATCHING ---
const CATEGORY_MAP = {
  study: { label: 'Belajar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  class: { label: 'Kuliah', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  hobby: { label: 'Hobi', color: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  social: { label: 'Sosial', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  'self-dev': { label: 'Self-Dev', color: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  routine: { label: 'Rutinitas', color: 'bg-zinc-100 text-zinc-700 border-zinc-200', dot: 'bg-zinc-400' },
  commute: { label: 'Perjalanan', color: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' },
  sleep: { label: 'Istirahat', color: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-300' }
};

// --- DEFAULT SCHEDULE V2 WITH EXACT BREAKS ---
const DEFAULT_SCHEDULE_V2 = {
  senin: {
    title: 'Senin',
    tagline: 'Fokus Logika: AlgoProg Marathon & Linear Algebra',
    items: [
      { id: 'mon-1', time: '06.00 - 06.45', title: 'Bangun Pagi & Rutinitas', desc: 'Mandi segar, sarapan bernutrisi', category: 'routine', priority: 'C' },
      { id: 'mon-2', time: '06.45 - 07.30', title: 'Berangkat ke Kampus', desc: 'Perjalanan awal hindari macet', category: 'commute', priority: 'C' },
      { id: 'mon-3', time: '07.30 - 08.00', title: 'Early Campus Warm-up', desc: 'Pemanasan logika koding', category: 'study', priority: 'A' },
      { id: 'mon-4', time: '08.00 - 09.30', title: 'Kuliah: Algoritma & Programming (Sesi 1)', desc: 'Perkuliahan teori & konsep inti', category: 'class', priority: 'A' },
      { id: 'mon-cb1', time: '09.30 - 10.00', title: 'Coffee Break Pagi ☕', desc: 'Minum kopi, rehat mata & otak', category: 'routine', priority: 'C' },
      { id: 'mon-5', time: '10.00 - 11.30', title: 'Kuliah: Algoritma & Programming (Sesi 2)', desc: 'Praktikum lab & hands-on code', category: 'class', priority: 'A' },
      { id: 'mon-lunch', time: '11.30 - 13.00', title: 'Istirahat Siang & Makan 🍲', desc: 'Makan siang, rehat & sosialisasi', category: 'routine', priority: 'C' },
      { id: 'mon-6', time: '13.00 - 14.30', title: 'Praktikum Lab Mandiri / Task', desc: 'Pengerjaan problem set koding', category: 'study', priority: 'B' },
      { id: 'mon-cb2', time: '14.30 - 15.00', title: 'Coffee Break Sore ☕', desc: 'Kopi sore, peregangan santai', category: 'routine', priority: 'C' },
      { id: 'mon-7', time: '15.00 - 16.30', title: 'Pengayaan Algo & Review Dosen', desc: 'Evaluasi hasil lab & diskusi', category: 'study', priority: 'B' },
      { id: 'mon-8', time: '16.30 - 17.15', title: 'Perjalanan Pulang', desc: 'Cooling down', category: 'commute', priority: 'C' },
      { id: 'mon-9', time: '17.15 - 18.30', title: 'Sesi Hobi & Refreshing', desc: 'Gaming, musik, olahraga santai', category: 'hobby', priority: 'B' },
      { id: 'mon-10', time: '18.30 - 20.00', title: 'Pengembangan Diri', desc: 'Eksplorasi portofolio & tech stack', category: 'self-dev', priority: 'B' },
      { id: 'mon-11', time: '20.00 - 20.30', title: 'Makan Malam', desc: 'Makan malam bergizi', category: 'routine', priority: 'C' },
      { id: 'mon-12', time: '20.30 - 22.45', title: 'AlgoProg Deep Focus', desc: 'Implementasi ulang problem dosen', category: 'study', priority: 'A' },
      { id: 'mon-13', time: '22.45 - 23.00', title: 'Rehat Mata', desc: 'Peregangan singkat', category: 'routine', priority: 'C' },
      { id: 'mon-14', time: '23.00 - 01.00', title: 'Linear Algebra Drill', desc: 'Latihan matriks & persamaan', category: 'study', priority: 'B' },
      { id: 'mon-15', time: '01.00 - 02.00', title: 'Algo Speed Challenge', desc: '1 problem Leetcode ringan', category: 'study', priority: 'A' },
      { id: 'mon-16', time: '02.00 - 06.00', title: 'Tidur Malam Berkualitas', desc: 'Recharge penuh', category: 'sleep', priority: 'C' },
    ]
  },
  selasa: {
    title: 'Selasa',
    tagline: 'Fokus Data: PDM, B. Indo & Statistik',
    items: [
      { id: 'tue-1', time: '06.00 - 06.45', title: 'Bangun Pagi & Rutinitas', desc: 'Persiapan awal hari', category: 'routine', priority: 'C' },
      { id: 'tue-2', time: '06.45 - 07.30', title: 'Berangkat ke Kampus', desc: 'Perjalanan lancar', category: 'commute', priority: 'C' },
      { id: 'tue-3', time: '07.30 - 08.00', title: 'PDM Pre-reading', desc: 'Baca modul sebelum kelas', category: 'study', priority: 'B' },
      { id: 'tue-4', time: '08.00 - 09.30', title: 'Kuliah: PDM (Sesi 1)', desc: 'Konsep ERD & relasi database', category: 'class', priority: 'B' },
      { id: 'tue-cb1', time: '09.30 - 10.00', title: 'Coffee Break Pagi ☕', desc: 'Kopi & rehat sejenak', category: 'routine', priority: 'C' },
      { id: 'tue-5', time: '10.00 - 11.30', title: 'Kuliah: PDM (Sesi 2)', desc: 'Praktikum Query SQL', category: 'class', priority: 'B' },
      { id: 'tue-lunch', time: '11.30 - 13.00', title: 'Istirahat Siang & Makan 🍲', desc: 'Istirahat bareng teman kampus', category: 'social', priority: 'C' },
      { id: 'tue-6', time: '13.00 - 14.30', title: 'Kuliah: Bahasa Indonesia', desc: 'Tata tulis ilmiah & artikel', category: 'class', priority: 'B' },
      { id: 'tue-cb2', time: '14.30 - 15.00', title: 'Coffee Break Sore ☕', desc: 'Segarkan pikiran dengan kopi', category: 'routine', priority: 'C' },
      { id: 'tue-7', time: '15.00 - 16.30', title: 'Latihan Basic Statistics', desc: 'Kalkulasi statistik mandiri', category: 'study', priority: 'B' },
      { id: 'tue-8', time: '16.30 - 17.15', title: 'Perjalanan Pulang', desc: 'Pulang kerumah', category: 'commute', priority: 'C' },
      { id: 'tue-9', time: '17.15 - 18.30', title: 'Sesi Hobi', desc: 'Gaming, hobi favorit', category: 'hobby', priority: 'B' },
      { id: 'tue-10', time: '18.30 - 20.00', title: 'Pengembangan Diri', desc: 'Workflow koding & Git', category: 'self-dev', priority: 'B' },
      { id: 'tue-11', time: '20.00 - 20.30', title: 'Makan Malam', desc: 'Makan malam santai', category: 'routine', priority: 'C' },
      { id: 'tue-12', time: '20.30 - 22.45', title: 'AlgoProg Daily Mastery', desc: 'Latihan logika harian wajib', category: 'study', priority: 'A' },
      { id: 'tue-13', time: '22.45 - 23.00', title: 'Rehat Singkat', desc: 'Istirahatkan mata', category: 'routine', priority: 'C' },
      { id: 'tue-14', time: '23.00 - 01.00', title: 'PDM & Statistics Drill', desc: 'Modul database & rumus', category: 'study', priority: 'B' },
      { id: 'tue-15', time: '01.00 - 02.00', title: 'Tugas Bahasa Indonesia', desc: 'Tugas penulisan', category: 'study', priority: 'C' },
      { id: 'tue-16', time: '02.00 - 06.00', title: 'Tidur Malam', desc: 'Recharge penuh', category: 'sleep', priority: 'C' },
    ]
  },
  rabu: {
    title: 'Rabu',
    tagline: 'Fokus Hitungan & Analisis: Algeo, Stat & Matdis',
    items: [
      { id: 'wed-1', time: '06.00 - 06.45', title: 'Bangun Pagi', desc: 'Rutinitas segar', category: 'routine', priority: 'C' },
      { id: 'wed-2', time: '06.45 - 07.30', title: 'Berangkat ke Kampus', desc: 'Perjalanan pagi', category: 'commute', priority: 'C' },
      { id: 'wed-3', time: '07.30 - 08.00', title: 'Review Rumus Algeo', desc: 'Matriks & determinan', category: 'study', priority: 'B' },
      { id: 'wed-4', time: '08.00 - 09.30', title: 'Kuliah: Linear Algebra', desc: 'Aljabar linear & matriks', category: 'class', priority: 'B' },
      { id: 'wed-cb1', time: '09.30 - 10.00', title: 'Coffee Break Pagi ☕', desc: 'Rehat sejenak & ngopi', category: 'routine', priority: 'C' },
      { id: 'wed-5', time: '10.00 - 11.30', title: 'Kuliah: Basic Statistics', desc: 'Statistik dasar & probabilitas', category: 'class', priority: 'B' },
      { id: 'wed-lunch', time: '11.30 - 13.00', title: 'Istirahat Siang & Makan 🍲', desc: 'Makan siang & istirahat', category: 'routine', priority: 'C' },
      { id: 'wed-6', time: '13.00 - 14.30', title: 'Discrete Math Drill (Sesi 1)', desc: 'Latihan logika pembuktian', category: 'study', priority: 'B' },
      { id: 'wed-cb2', time: '14.30 - 15.00', title: 'Coffee Break Sore ☕', desc: 'Kopi sore penambah energi', category: 'routine', priority: 'C' },
      { id: 'wed-7', time: '15.00 - 16.30', title: 'Discrete Math Drill (Sesi 2)', desc: 'Lanjutan problem set', category: 'study', priority: 'B' },
      { id: 'wed-8', time: '16.30 - 17.15', title: 'Perjalanan Pulang', desc: 'Pulang', category: 'commute', priority: 'C' },
      { id: 'wed-9', time: '17.15 - 18.30', title: 'Sesi Hobi', desc: 'Waktu bebas penat', category: 'hobby', priority: 'B' },
      { id: 'wed-10', time: '18.30 - 20.00', title: 'Pengembangan Diri', desc: 'Eksplorasi wawasan baru', category: 'self-dev', priority: 'B' },
      { id: 'wed-11', time: '20.00 - 20.30', title: 'Makan Malam', desc: 'Makan malam', category: 'routine', priority: 'C' },
      { id: 'wed-12', time: '20.30 - 22.30', title: 'AlgoProg Practice', desc: 'Problem solving', category: 'study', priority: 'A' },
      { id: 'wed-13', time: '22.30 - 22.45', title: 'Rehat Sejenak', desc: 'Istirahat', category: 'routine', priority: 'C' },
      { id: 'wed-14', time: '22.45 - 00.45', title: 'Discrete Math Deep Drill', desc: 'Kupas soal logika', category: 'study', priority: 'B' },
      { id: 'wed-15', time: '00.45 - 02.00', title: 'Review Algeo & Stat', desc: 'PR & rumus', category: 'study', priority: 'B' },
      { id: 'wed-16', time: '02.00 - 06.00', title: 'Tidur Malam', desc: 'Tidur nyenyak', category: 'sleep', priority: 'C' },
    ]
  },
  kamis: {
    title: 'Kamis',
    tagline: 'Fokus Logika & Bisnis: Discrete Math & Management',
    items: [
      { id: 'thu-1', time: '06.00 - 06.45', title: 'Bangun Pagi', desc: 'Mandi, sarapan', category: 'routine', priority: 'C' },
      { id: 'thu-2', time: '06.45 - 07.30', title: 'Berangkat ke Kampus', desc: 'Perjalanan lancar', category: 'commute', priority: 'C' },
      { id: 'thu-3', time: '07.30 - 08.00', title: 'Quick Algo Warm-up', desc: '1 logic challenge', category: 'study', priority: 'A' },
      { id: 'thu-4', time: '08.00 - 09.30', title: 'Kuliah: Discrete Math (Sesi 1)', desc: 'Matematika diskrit & teori graf', category: 'class', priority: 'B' },
      { id: 'thu-cb1', time: '09.30 - 10.00', title: 'Coffee Break Pagi ☕', desc: 'Kopi hangat & rehat', category: 'routine', priority: 'C' },
      { id: 'thu-5', time: '10.00 - 11.30', title: 'Kuliah: Discrete Math (Sesi 2)', desc: 'Latihan soal & kuis', category: 'class', priority: 'B' },
      { id: 'thu-lunch', time: '11.30 - 13.00', title: 'Istirahat Siang & Makan 🍲', desc: 'Istirahat siang di kampus', category: 'social', priority: 'C' },
      { id: 'thu-6', time: '13.00 - 14.30', title: 'Kuliah: Management (Sesi 1)', desc: 'Teori manajemen & organisasi', category: 'class', priority: 'B' },
      { id: 'thu-cb2', time: '14.30 - 15.00', title: 'Coffee Break Sore ☕', desc: 'Sesi rehat santai', category: 'routine', priority: 'C' },
      { id: 'thu-7', time: '15.00 - 16.30', title: 'Kuliah: Management (Sesi 2)', desc: 'Studi kasus & diskusi kelompok', category: 'class', priority: 'B' },
      { id: 'thu-8', time: '16.30 - 17.15', title: 'Perjalanan Pulang', desc: 'Pulang', category: 'commute', priority: 'C' },
      { id: 'thu-9', time: '17.15 - 18.30', title: 'Sesi Hobi', desc: 'Me-time, olahraga', category: 'hobby', priority: 'B' },
      { id: 'thu-10', time: '18.30 - 20.00', title: 'Pengembangan Diri', desc: 'Leadership & produktivitas', category: 'self-dev', priority: 'B' },
      { id: 'thu-11', time: '20.00 - 20.30', title: 'Makan Malam', desc: 'Santai', category: 'routine', priority: 'C' },
      { id: 'thu-12', time: '20.30 - 22.45', title: 'AlgoProg Mastery', desc: 'Latihan koding advance', category: 'study', priority: 'A' },
      { id: 'thu-13', time: '22.45 - 23.00', title: 'Rehat Sejenak', desc: 'Istirahat', category: 'routine', priority: 'C' },
      { id: 'thu-14', time: '23.00 - 00.30', title: 'Management Summary', desc: 'Mindmap materi', category: 'study', priority: 'B' },
      { id: 'thu-15', time: '00.30 - 02.00', title: 'Matdis Problem Solving', desc: 'Evaluasi kuis', category: 'study', priority: 'B' },
      { id: 'thu-16', time: '02.00 - 06.00', title: 'Tidur Malam', desc: 'Istirahat penuh', category: 'sleep', priority: 'C' },
    ]
  },
  jumat: {
    title: 'Jumat',
    tagline: 'Fokus Kreativitas & Proyek Mandiri',
    items: [
      { id: 'fri-1', time: '06.00 - 06.45', title: 'Bangun Pagi', desc: 'Sarapan sehat', category: 'routine', priority: 'C' },
      { id: 'fri-2', time: '06.45 - 07.30', title: 'Berangkat ke Kampus', desc: 'Perjalanan santai', category: 'commute', priority: 'C' },
      { id: 'fri-3', time: '07.30 - 09.30', title: 'AlgoProg Lab Mandiri', desc: 'Ngoding intensif (Prioritas A)', category: 'study', priority: 'A' },
      { id: 'fri-cb1', time: '09.30 - 10.00', title: 'Coffee Break Pagi ☕', desc: 'Kopi & rehat sejenak', category: 'routine', priority: 'C' },
      { id: 'fri-4', time: '10.00 - 11.30', title: 'Kuliah: Creativity & Innovation', desc: 'Brainstorming ide akhir', category: 'class', priority: 'C' },
      { id: 'fri-lunch', time: '11.30 - 13.00', title: 'Ishoma / Sholat Jumat & Makan 🕌', desc: 'Ibadah & makan siang', category: 'routine', priority: 'C' },
      { id: 'fri-5', time: '13.00 - 14.30', title: 'Review Mingguan Kampus (Sesi 1)', desc: 'Bereskan tugas minggu ini', category: 'study', priority: 'B' },
      { id: 'fri-cb2', time: '14.30 - 15.00', title: 'Coffee Break Sore ☕', desc: 'Kopi sore & rehat', category: 'routine', priority: 'C' },
      { id: 'fri-6', time: '15.00 - 16.30', title: 'Review Mingguan Kampus (Sesi 2)', desc: 'Finalisasi tugas', category: 'study', priority: 'B' },
      { id: 'fri-7', time: '16.30 - 17.15', title: 'Perjalanan Pulang', desc: 'Pulang kerumah', category: 'commute', priority: 'C' },
      { id: 'fri-8', time: '17.15 - 18.30', title: 'Sesi Hobi Santai', desc: 'Film, game, hobi', category: 'hobby', priority: 'B' },
      { id: 'fri-9', time: '18.30 - 20.00', title: 'Pengembangan Diri', desc: 'Side-project ideation', category: 'self-dev', priority: 'B' },
      { id: 'fri-10', time: '20.00 - 20.30', title: 'Makan Malam', desc: 'Santai bersama keluarga', category: 'routine', priority: 'C' },
      { id: 'fri-11', time: '20.30 - 22.30', title: 'Proyek Creativity', desc: 'Cicil pengerjaan inovasi', category: 'study', priority: 'C' },
      { id: 'fri-12', time: '22.30 - 00.30', title: 'Algo Coding Fun', desc: 'Eksperimen script', category: 'study', priority: 'A' },
      { id: 'fri-13', time: '00.30 - 02.00', title: 'Review PDM', desc: 'Eksplorasi modul bebas', category: 'study', priority: 'B' },
      { id: 'fri-14', time: '02.00 - 06.00', title: 'Tidur Malam', desc: 'Persiapan akhir pekan', category: 'sleep', priority: 'C' },
    ]
  },
  sabtu: {
    title: 'Sabtu',
    tagline: 'Weekend Tekun 1: Algoritma (A) + Matdis + Algeo',
    items: [
      { id: 'sat-1', time: '06.00 - 07.30', title: 'Bangun & Olahraga Pagi', desc: 'Udara segar, sarapan', category: 'routine', priority: 'C' },
      { id: 'sat-2', time: '07.30 - 09.30', title: 'Pengembangan Diri & Warmup', desc: 'Arsitektur software', category: 'self-dev', priority: 'B' },
      { id: 'sat-cb1', time: '09.30 - 10.00', title: 'Coffee Break Pagi ☕', desc: 'Nikmati kopi akhir pekan', category: 'routine', priority: 'C' },
      { id: 'sat-3', time: '10.00 - 11.30', title: 'TEKUN 1: Algoritma Programming', desc: 'Competitive programming & problem set', category: 'study', priority: 'A' },
      { id: 'sat-lunch', time: '11.30 - 13.00', title: 'Istirahat Siang & Makan 🍲', desc: 'Istirahat siang santai', category: 'routine', priority: 'C' },
      { id: 'sat-4', time: '13.00 - 14.30', title: 'TEKUN 2: Discrete Mathematics', desc: 'Bedah soal logika pembuktian', category: 'study', priority: 'B' },
      { id: 'sat-cb2', time: '14.30 - 15.00', title: 'Coffee Break Sore ☕', desc: 'Kopi sore & rehat', category: 'routine', priority: 'C' },
      { id: 'sat-5', time: '15.00 - 16.30', title: 'Pendalaman Matdis & Diskus', desc: 'Kaji ulang materi pembuktian', category: 'study', priority: 'B' },
      { id: 'sat-6', time: '16.30 - 18.00', title: 'Hobi Ekstra', desc: 'Me-time bebas', category: 'hobby', priority: 'B' },
      { id: 'sat-7', time: '18.00 - 19.30', title: 'Makan Malam', desc: 'Sosial / Keluarga', category: 'social', priority: 'C' },
      { id: 'sat-8', time: '19.30 - 22.30', title: 'TEKUN 3: Linear Algebra', desc: 'Bedah soal UTS & matriks', category: 'study', priority: 'B' },
      { id: 'sat-9', time: '22.30 - 00.30', title: 'Algo Sandbox', desc: 'Eksperimen santai', category: 'study', priority: 'A' },
      { id: 'sat-10', time: '00.30 - 06.00', title: 'Tidur Malam', desc: 'Recharge penuh', category: 'sleep', priority: 'C' },
    ]
  },
  minggu: {
    title: 'Minggu',
    tagline: 'Weekend Tekun 2: Basic Stats + PDM + Management',
    items: [
      { id: 'sun-1', time: '06.00 - 07.30', title: 'Bangun Pagi', desc: 'Peregangan, sarapan', category: 'routine', priority: 'C' },
      { id: 'sun-2', time: '07.30 - 09.30', title: 'Hobi Pagi', desc: 'Fotografi, gaming, olahraga', category: 'hobby', priority: 'B' },
      { id: 'sun-cb1', time: '09.30 - 10.00', title: 'Coffee Break Pagi ☕', desc: 'Kopi pagi santai', category: 'routine', priority: 'C' },
      { id: 'sun-3', time: '10.00 - 11.30', title: 'TEKUN 1: Basic Statistics', desc: 'Distribusi & probabilitas', category: 'study', priority: 'B' },
      { id: 'sun-lunch', time: '11.30 - 13.00', title: 'Istirahat Siang & Power Nap 🍲', desc: 'Makan siang & tidur siang', category: 'routine', priority: 'C' },
      { id: 'sun-4', time: '13.00 - 14.30', title: 'TEKUN 2: PDM', desc: 'Desain ERD & query', category: 'study', priority: 'B' },
      { id: 'sun-cb2', time: '14.30 - 15.00', title: 'Coffee Break Sore ☕', desc: 'Coffee break santai', category: 'routine', priority: 'C' },
      { id: 'sun-5', time: '15.00 - 16.30', title: 'Pengembangan Diri Sore', desc: 'Evaluasi & rencana karier', category: 'self-dev', priority: 'B' },
      { id: 'sun-6', time: '16.30 - 18.00', title: 'Persiapan Mingguan', desc: 'Checklist target minggu depan', category: 'self-dev', priority: 'B' },
      { id: 'sun-7', time: '18.00 - 19.30', title: 'Makan Malam', desc: 'Istirahat santai', category: 'social', priority: 'C' },
      { id: 'sun-8', time: '19.30 - 22.30', title: 'TEKUN 3: Management Case Study', desc: 'Analisis manajerial & teori', category: 'study', priority: 'B' },
      { id: 'sun-9', time: '22.30 - 23.30', title: 'Algo Weekly Wrap-up', desc: '1 problem logika akhir minggu', category: 'study', priority: 'A' },
      { id: 'sun-10', time: '23.30 - 00.30', title: 'Weekly Prep', desc: 'Siapkan tas & cek jadwal esok', category: 'routine', priority: 'C' },
      { id: 'sun-11', time: '00.30 - 06.00', title: 'Tidur Malam Nyenyak', desc: 'Siap hadapi Senin', category: 'sleep', priority: 'C' },
    ]
  }
};

const INITIAL_TASKS = [
  { id: 't-1', subject: 'Algoritma & Pemrograman', priority: 'A', title: 'Sorting & DP Exercise', deadline: '2026-09-02', notes: 'Selesaikan 5 variasi problem dengan optimal time complexity O(n log n).', status: 'in-progress' },
  { id: 't-2', subject: 'Discrete Mathematics', priority: 'B', title: 'Logika Proposisi (Modul 3)', deadline: '2026-09-03', notes: 'Latihan no. 4 - 12 dari buku.', status: 'todo' },
];

// EXAM COUNTDOWNS INCLUDING UTC MIDTERM EXAM STARTING 28 SEPTEMBER 2026
const DEFAULT_EXAMS = [
  { id: 'ex-utc', title: 'UTC (Ujian Tengah Semester)', subject: 'Semua Matkul', date: '2026-09-28' },
  { id: 'ex-1', title: 'Kuis 2 Discrete Mathematics', subject: 'Matdis', date: '2026-09-08' },
  { id: 'ex-2', title: 'Praktikum PDM Database', subject: 'PDM', date: '2026-09-12' },
];

const DEFAULT_FORMULAS = [
  { id: 'f-1', subject: 'Algoritma & Pemrograman', title: 'Binary Search (Time Complexity)', code: 'O(log n) - Array harus terurut (Sorted).\nMid = low + (high - low) / 2' },
  { id: 'f-2', subject: 'Linear Algebra', title: 'Determinan & Invers Matriks 2x2', code: 'det(A) = ad - bc untuk A = [[a,b],[c,d]]\nInvers A = (1/det) * [[d,-b],[-c,a]]' },
  { id: 'f-3', subject: 'PDM (Database)', title: 'SQL Inner Join & Group By', code: 'SELECT d.nama, COUNT(e.id)\nFROM dept d JOIN emp e ON d.id = e.dept_id\nGROUP BY d.nama HAVING COUNT(e.id) > 5;' },
  { id: 'f-4', subject: 'Discrete Mathematics', title: 'Hukum De Morgan (Logika Proposisi)', code: '¬(P ∧ Q) ≡ ¬P ∨ ¬Q\n¬(P ∨ Q) ≡ ¬P ∧ ¬Q' },
];

const getFormattedDateStr = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLogicalDateStr = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  if (d.getHours() < 6) {
    d.setDate(d.getDate() - 1);
  }
  return getFormattedDateStr(d);
};

const getDayNameFromDateStr = (dateStr) => {
  if (!dateStr) return 'senin';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  return days[dateObj.getDay()];
};

const getLogicalDayName = (dateObj) => {
  const d = new Date(dateObj);
  if (d.getHours() < 6) {
    d.setDate(d.getDate() - 1);
  }
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  return days[d.getDay()];
};

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split('.').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const getTimePeriod = (timeStr) => {
  if (!timeStr) return 'Malam & Dini Hari';
  const startStr = timeStr.split(' - ')[0];
  const mins = parseTime(startStr);
  if (mins >= 360 && mins < 720) return 'Pagi (06.00 - 12.00)';
  if (mins >= 720 && mins < 1080) return 'Siang & Sore (12.00 - 18.00)';
  return 'Malam & Dini Hari (18.00 - 06.00)';
};

// Web Audio Synthesized Chime (No MP3 file needed)
const playChimeSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio Context block fallback
  }
};

export default function App() {
  const [scheduleData, setScheduleData] = useState(() => {
    const saved = localStorage.getItem('study_schedule_v2');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE_V2;
  });

  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('study_checked');
    return saved ? JSON.parse(saved) : {};
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('study_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('study_exams_utc');
    return saved ? JSON.parse(saved) : DEFAULT_EXAMS;
  });

  const [formulas, setFormulas] = useState(() => {
    const saved = localStorage.getItem('study_formulas');
    return saved ? JSON.parse(saved) : DEFAULT_FORMULAS;
  });

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [showDbModal, setShowDbModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDay, setActiveDay] = useState(() => {
    const saved = localStorage.getItem('study_active_day');
    return saved || getLogicalDayName(new Date());
  });
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('study_active_tab');
    return saved || 'schedule';
  });
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Persist State to Local Storage
  useEffect(() => {
    localStorage.setItem('study_schedule_v2', JSON.stringify(scheduleData));
  }, [scheduleData]);

  useEffect(() => {
    localStorage.setItem('study_checked', JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('study_exams_utc', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('study_formulas', JSON.stringify(formulas));
  }, [formulas]);

  const [selectedDateStr, setSelectedDateStr] = useState(() => getLogicalDateStr(new Date()));
  const [dailyOverrides, setDailyOverrides] = useState(() => {
    const saved = localStorage.getItem('study_daily_overrides');
    return saved ? JSON.parse(saved) : {};
  });

  const changeSelectedDate = (dateStr) => {
    setSelectedDateStr(dateStr);
    const dayName = getDayNameFromDateStr(dateStr);
    setActiveDay(dayName);
  };

  useEffect(() => {
    localStorage.setItem('study_daily_overrides', JSON.stringify(dailyOverrides));
  }, [dailyOverrides]);

  useEffect(() => {
    localStorage.setItem('study_active_tab', activeTab);
  }, [activeTab]);

  // Load Cloud Data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const loadCloudData = async () => {
      try {
        const [tasksRes, examsRes, formulasRes, checkedRes, overridesRes] = await Promise.all([
          supabase.from('tasks').select('*'),
          supabase.from('exams').select('*'),
          supabase.from('formulas').select('*'),
          supabase.from('checked_items').select('*'),
          supabase.from('daily_overrides').select('*')
        ]);

        if (tasksRes.data && tasksRes.data.length > 0) setTasks(tasksRes.data);
        if (examsRes.data && examsRes.data.length > 0) {
          setExams(examsRes.data);
        } else if (isSupabaseConfigured && supabase) {
          DEFAULT_EXAMS.forEach((ex) => syncToSupabase('exams', ex));
        }
        if (formulasRes.data && formulasRes.data.length > 0) setFormulas(formulasRes.data);
        if (checkedRes.data && checkedRes.data.length > 0) {
          const map = {};
          checkedRes.data.forEach((c) => {
            map[c.id] = c.is_checked;
          });
          setCheckedItems(map);
        }
        if (overridesRes.data && overridesRes.data.length > 0) {
          const grouped = {};
          overridesRes.data.forEach((o) => {
            if (!grouped[o.date]) grouped[o.date] = [];
            grouped[o.date].push(o);
          });
          setDailyOverrides(grouped);
        }
      } catch (e) {
        console.warn('Gagal memuat data dari Supabase cloud:', e);
      }
    };

    loadCloudData();
  }, []);

  // Global Keyboard Shortcuts (1-5, Alt+1..5)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        return;
      }

      if (e.key === '1' || (e.altKey && e.key === '1')) {
        e.preventDefault();
        setActiveTab('schedule');
        showToast('📍 Shortcut: Pindah ke Tab Jadwal (1)');
      } else if (e.key === '2' || (e.altKey && e.key === '2')) {
        e.preventDefault();
        setActiveTab('tasks');
        showToast('📝 Shortcut: Pindah ke Tab Tugas (2)');
      } else if (e.key === '3' || (e.altKey && e.key === '3')) {
        e.preventDefault();
        setActiveTab('pomodoro');
        showToast('⏱️ Shortcut: Pindah ke Tab Fokus Pomodoro (3)');
      } else if (e.key === '4' || (e.altKey && e.key === '4')) {
        e.preventDefault();
        setActiveTab('stats');
        showToast('📊 Shortcut: Pindah ke Tab Statistik (4)');
      } else if (e.key === '5' || (e.altKey && e.key === '5')) {
        e.preventDefault();
        setActiveTab('formulas');
        showToast('📚 Shortcut: Pindah ke Tab Rumus (5)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Realtime Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentLogicalDayName = getLogicalDayName(currentTime);

  const getCurrentActivity = () => {
    const todayItems = scheduleData[currentLogicalDayName]?.items || [];
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (const item of todayItems) {
      const [startStr, endStr] = item.time.split(' - ');
      const startMin = parseTime(startStr);
      const endMin = parseTime(endStr);

      if (endMin < startMin) {
        if (currentMins >= startMin || currentMins < endMin) return item;
      } else {
        if (currentMins >= startMin && currentMins < endMin) return item;
      }
    }
    return null;
  };

  const currentActivityItem = getCurrentActivity();

  // Filter Tasks
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals & Forms
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activityForm, setActivityForm] = useState({ time: '', title: '', desc: '', category: 'study', priority: 'B', targetDay: 'senin' });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ subject: 'Algoritma & Pemrograman', priority: 'A', title: '', deadline: '', notes: '', status: 'todo' });

  const [showExamModal, setShowExamModal] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', subject: 'AlgoProg', date: '' });

  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [newFormula, setNewFormula] = useState({ subject: 'Algoritma & Pemrograman', title: '', code: '' });

  // Pomodoro State
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState('focus');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((p) => {
          if (p <= 1) {
            setIsTimerRunning(false);
            if (isAudioEnabled) playChimeSound();
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroTime, isAudioEnabled]);

  const formatTimeStr = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Activity Actions with Date-Based History
  const toggleCheck = (id) => {
    const checkKey = `${selectedDateStr}_${id}`;
    const isToday = selectedDateStr === getLogicalDateStr(currentTime);

    setCheckedItems((p) => {
      const currentVal = !!p[checkKey] || (isToday && !!p[id]);
      const updated = { ...p, [checkKey]: !currentVal };
      if (updated[checkKey] && isAudioEnabled) playChimeSound();
      syncToSupabase('checked_items', {
        id: checkKey,
        date: selectedDateStr,
        item_id: id,
        is_checked: updated[checkKey],
        updated_at: new Date().toISOString()
      });
      return updated;
    });

    if (!isToday) {
      showToast(`📜 Menyimpan riwayat kegiatan tanggal ${selectedDateStr}`);
    }
  };
  
  const handleOpenAddActivity = () => {
    setEditingItem(null);
    setActivityForm({ time: '16.30 - 18.00', title: '', desc: '', category: 'study', priority: 'B', targetDay: activeDay, saveScope: 'template' });
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setActivityForm({ time: item.time, title: item.title, desc: item.desc, category: item.category, priority: item.priority, targetDay: activeDay, saveScope: 'template' });
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = (e) => {
    e.preventDefault();
    if (!activityForm.title.trim()) return;

    if (activityForm.saveScope === 'dateOnly') {
      const overrideObj = { id: `ov-${Date.now()}`, date: selectedDateStr, ...activityForm };
      const currentList = dailyOverrides[selectedDateStr] || [];
      setDailyOverrides({ ...dailyOverrides, [selectedDateStr]: [...currentList, overrideObj] });
      syncToSupabase('daily_overrides', overrideObj);
      showToast(`🗓️ Kegiatan ditambahkan khusus untuk tanggal ${selectedDateStr}`);
    } else {
      const dayKey = activityForm.targetDay || activeDay;
      const currentList = [...(scheduleData[dayKey]?.items || [])];

      if (editingItem) {
        const updatedList = currentList.map((itm) =>
          itm.id === editingItem.id ? { ...itm, ...activityForm } : itm
        );
        setScheduleData({ ...scheduleData, [dayKey]: { ...scheduleData[dayKey], items: updatedList } });
      } else {
        setScheduleData({ ...scheduleData, [dayKey]: { ...scheduleData[dayKey], items: [...currentList, { id: `act-${Date.now()}`, ...activityForm }] } });
      }
      showToast(`📌 Master Template hari ${scheduleData[dayKey]?.title || dayKey} diperbarui.`);
    }
    setIsActivityModalOpen(false);
  };

  const handleDeleteActivity = (id, e) => {
    e.stopPropagation();
    const dayKey = activeDay;
    setScheduleData({
      ...scheduleData,
      [dayKey]: { ...scheduleData[dayKey], items: scheduleData[dayKey].items.filter((i) => i.id !== id) }
    });
  };

  const handleResetSchedule = () => {
    if (window.confirm('Reset jadwal ke pengaturan jam baru (Coffee Break 09.30 & 14.30, Istirahat Siang 11.30 - 13.00)?')) {
      setScheduleData(DEFAULT_SCHEDULE_V2);
      setExams(DEFAULT_EXAMS);
      setCheckedItems({});
      localStorage.removeItem('study_schedule');
      localStorage.removeItem('study_schedule_v2');
      localStorage.removeItem('study_exams_utc');
      localStorage.removeItem('study_checked');
    }
  };

  // Task Actions
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setNewTask({ subject: 'Algoritma & Pemrograman', priority: 'A', title: '', deadline: '', notes: '', status: 'todo' });
    setShowTaskModal(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      subject: task.subject,
      priority: task.priority,
      title: task.title,
      deadline: task.deadline || '',
      notes: task.notes || '',
      status: task.status || 'todo'
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    if (editingTask) {
      const updatedTask = { ...editingTask, ...newTask };
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      syncToSupabase('tasks', updatedTask);
      showToast('📝 Catatan tugas berhasil diperbarui!');
    } else {
      const taskObj = { ...newTask, id: 't-' + Date.now() };
      setTasks((prev) => [taskObj, ...prev]);
      syncToSupabase('tasks', taskObj);
      showToast('📝 Tugas baru berhasil ditambahkan!');
    }

    setEditingTask(null);
    setNewTask({ subject: 'Algoritma & Pemrograman', priority: 'A', title: '', deadline: '', notes: '', status: 'todo' });
    setShowTaskModal(false);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, status: newStatus };
          syncToSupabase('tasks', updated);
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteFromSupabase('tasks', taskId);
  };

  // Exam Actions
  const handleAddExam = (e) => {
    e.preventDefault();
    if (!newExam.title.trim()) return;
    const examObj = { ...newExam, id: 'ex-' + Date.now() };
    setExams((prev) => [examObj, ...prev]);
    syncToSupabase('exams', examObj);
    setNewExam({ title: '', subject: 'AlgoProg', date: '' });
    setShowExamModal(false);
  };

  const deleteExam = (id) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    deleteFromSupabase('exams', id);
  };

  // Formula Actions
  const handleAddFormula = (e) => {
    e.preventDefault();
    if (!newFormula.title.trim()) return;
    const formulaObj = { ...newFormula, id: 'f-' + Date.now() };
    setFormulas((prev) => [formulaObj, ...prev]);
    syncToSupabase('formulas', formulaObj);
    setNewFormula({ subject: 'Algoritma & Pemrograman', title: '', code: '' });
    setShowFormulaModal(false);
  };

  const deleteFormula = (id) => {
    setFormulas((prev) => prev.filter((f) => f.id !== id));
    deleteFromSupabase('formulas', id);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const data = { scheduleData, checkedItems, tasks, exams, formulas, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_tracker_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  // Import JSON Backup
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.scheduleData) setScheduleData(data.scheduleData);
        if (data.checkedItems) setCheckedItems(data.checkedItems);
        if (data.tasks) setTasks(data.tasks);
        if (data.exams) setExams(data.exams);
        if (data.formulas) setFormulas(data.formulas);
        alert('Data backup berhasil diimpor!');
      } catch {
        alert('File backup JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Calculate Days Remaining
  const getDaysLeft = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const now = new Date();
    now.setHours(0,0,0,0);
    const target = new Date(targetDateStr);
    target.setHours(0,0,0,0);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Unify Active Task Deadlines & Exams for the Countdown Widget Bar
  const activeTaskCountdowns = tasks
    .filter((t) => t.status !== 'done' && t.deadline)
    .map((t) => ({ id: `task-cd-${t.id}`, title: `📝 ${t.title}`, subject: t.subject, date: t.deadline, isTask: true }));

  const allCountdownItems = [
    ...exams.map((ex) => ({ ...ex, isTask: false })),
    ...activeTaskCountdowns
  ];

  const masterDaySchedule = scheduleData[activeDay]?.items || [];
  const customDayOverrides = dailyOverrides[selectedDateStr] || [];
  const rawDaySchedule = [...masterDaySchedule, ...customDayOverrides.filter((o) => !o.is_deleted)];
  const currentDaySchedule = rawDaySchedule.filter(
    (item) => categoryFilter === 'all' || item.category === categoryFilter
  );

  const completedCount = rawDaySchedule.filter((item) => {
    const checkKey = `${selectedDateStr}_${item.id}`;
    return !!checkedItems[checkKey] || (selectedDateStr === getLogicalDateStr(currentTime) && !!checkedItems[item.id]);
  }).length;
  const progressPercent = rawDaySchedule.length ? Math.round((completedCount / rawDaySchedule.length) * 100) : 0;
  
  const filteredTasks = tasks.filter(
    (t) =>
      (filterSubject === 'All' || t.subject === filterSubject) &&
      (filterStatus === 'All' || t.status === filterStatus)
  );

  const periods = ['Pagi (06.00 - 12.00)', 'Siang & Sore (12.00 - 18.00)', 'Malam & Dini Hari (18.00 - 06.00)'];
  const groupedSchedule = periods.reduce((acc, period) => {
    acc[period] = currentDaySchedule.filter((item) => getTimePeriod(item.time) === period);
    return acc;
  }, {});

  const formatterJam = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatterTanggal = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-zinc-50/80 text-zinc-900 font-sans antialiased selection:bg-zinc-200 pb-24">
      
      {/* HEADER MINIMALIST WITH AUDIO TOGGLE & TABS */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-xs">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900">StudyTracker</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>5 Hari Streak</span>
                </span>
                <button
                  onClick={() => setShowDbModal(true)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition ${
                    isSupabaseConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100'
                  }`}
                  title="Status Database Cloud"
                >
                  <Database className={`w-3 h-3 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span>{isSupabaseConfigured ? 'Cloud Sync ON' : 'Database Status'}</span>
                </button>
                <button
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`p-1 rounded-lg transition ${isAudioEnabled ? 'text-amber-600 bg-amber-50' : 'text-zinc-400 bg-zinc-100'}`}
                  title={isAudioEnabled ? 'Suara Bel Aktif' : 'Suara Bel Mute'}
                >
                  {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-0.5">
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Bangun 06.00</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                <Coffee className="w-3 h-3 text-amber-700" />
                <span>Break 09.30 & 14.30</span>
              </div>
            </div>
          </div>

          {/* MAIN NAV TABS */}
          <nav className="flex items-center bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/50 overflow-x-auto scrollbar-none">
            {[
              { id: 'schedule', icon: CalendarCheck, label: 'Jadwal', keyHint: '1' },
              { id: 'tasks', icon: FileText, label: 'Tugas', keyHint: '2' },
              { id: 'pomodoro', icon: Clock, label: 'Fokus', keyHint: '3' },
              { id: 'stats', icon: BarChart3, label: 'Statistik', keyHint: '4' },
              { id: 'formulas', icon: BookOpen, label: 'Rumus', keyHint: '5' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={`Shortcut: Tekan ${tab.keyHint} atau Alt+${tab.keyHint}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <kbd className="hidden sm:inline-block text-[10px] font-mono font-normal px-1 rounded bg-zinc-200/60 text-zinc-600 border border-zinc-300/50">{tab.keyHint}</kbd>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* --- INTEGRATED COUNTDOWN WIDGET BAR (UTC MIDTERM + TASKS + QUIZZES) --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Timer className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Countdown Ujian, Quiz & Deadlines Tugas (UTC 28 Sep 2026):</span>
            </div>
            <button onClick={() => setShowExamModal(true)} className="px-2.5 py-1 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5"/> Tambah Ujian/Kuis
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {allCountdownItems.map((item) => {
              const daysLeft = getDaysLeft(item.date);
              const isUTC = item.id === 'ex-utc' || item.title.includes('UTC');

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs border whitespace-nowrap shadow-2xs ${
                    isUTC
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : item.isTask
                      ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                      : 'bg-white text-zinc-800 border-amber-200'
                  }`}
                >
                  <span className="font-bold">{item.title}</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded-md text-[11px] ${
                      isUTC
                        ? 'bg-amber-400 text-zinc-900'
                        : daysLeft <= 3
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    H-{daysLeft} Hari ({item.date})
                  </span>
                  {!item.isTask && !isUTC && (
                    <button onClick={() => deleteExam(item.id)} className="text-zinc-400 hover:text-red-500 ml-0.5"><X className="w-3.5 h-3.5"/></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- CURRENT ACTIVITY BANNER --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-zinc-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-zinc-800/40 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="z-10">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-300" />
              <span>{formatterTanggal.format(currentTime)}</span>
              <span>•</span>
              <span className="text-white font-mono font-medium">{formatterJam.format(currentTime)} WIB</span>
            </div>
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Sedang Berlangsung Saat Ini:
            </h2>
            <p className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
              {currentActivityItem ? currentActivityItem.title : "Waktu Bebas / Istirahat Mandiri"}
            </p>
            {currentActivityItem?.desc && (
              <p className="text-xs text-zinc-400 mt-1">{currentActivityItem.desc}</p>
            )}
          </div>
          {currentActivityItem && (
            <div className="z-10 px-3.5 py-2 bg-zinc-800/90 rounded-xl border border-zinc-700/80 text-xs font-semibold flex items-center gap-2 shadow-xs">
               <ArrowRight className="w-4 h-4 text-emerald-400" />
               <span className="font-mono text-zinc-200">{currentActivityItem.time}</span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* --- TAB 1: SCHEDULE --- */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            
            {/* DATE HISTORY & CALENDAR NAVIGATOR */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">Riwayat & Tanggal:</span>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 capitalize">
                      {scheduleData[getDayNameFromDateStr(selectedDateStr)]?.title || getDayNameFromDateStr(selectedDateStr)}, {selectedDateStr}
                    </span>
                  </div>
                  {selectedDateStr === getLogicalDateStr(currentTime) ? (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Hari Ini (Aktif Realtime)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 mt-0.5">
                      <History className="w-3.5 h-3.5 text-amber-600" />
                      <span>Mode Riwayat Lampau / Mendatang</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => {
                    const [y, m, d] = selectedDateStr.split('-').map(Number);
                    const dt = new Date(y, m - 1, d - 1);
                    changeSelectedDate(getFormattedDateStr(dt));
                  }}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">H-1</span>
                </button>

                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => changeSelectedDate(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-zinc-800 outline-none cursor-pointer shadow-2xs"
                />

                <button
                  onClick={() => {
                    const [y, m, d] = selectedDateStr.split('-').map(Number);
                    const dt = new Date(y, m - 1, d + 1);
                    changeSelectedDate(getFormattedDateStr(dt));
                  }}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                  title="Hari Berikutnya"
                >
                  <span className="hidden sm:inline">H+1</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {selectedDateStr !== getLogicalDateStr(currentTime) && (
                  <button
                    onClick={() => changeSelectedDate(getLogicalDateStr(currentTime))}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition whitespace-nowrap shadow-xs"
                  >
                    Ke Hari Ini
                  </button>
                )}
              </div>
            </div>

            {/* Day Selector */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-200/80">
              <div className="flex items-center gap-1 sm:gap-2">
                {['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'].map((day) => {
                  const isSelected = activeDay === day;
                  const isLogicalToday = currentLogicalDayName === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`relative px-3.5 py-2 text-xs font-semibold capitalize transition-all rounded-lg ${
                        isSelected ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{day}</span>
                        {isLogicalToday && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-zinc-900'}`}></span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => window.print()} className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition" title="Cetak / Save PDF Jadwal">
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={handleResetSchedule} className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition" title="Reset Jadwal Jam Terbaru">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Read-Only Banner when selected day is not today */}
            {activeDay !== currentLogicalDayName && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
                <div className="flex items-center gap-2.5 font-medium">
                  <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span>
                    <strong>Ceklis Terkunci:</strong> Anda sedang melihat jadwal hari <strong>{scheduleData[activeDay]?.title}</strong>. Menceklis kegiatan hanya dapat dilakukan pada hari ini (<strong>{scheduleData[currentLogicalDayName]?.title}</strong>).
                  </span>
                </div>
                <button
                  onClick={() => setActiveDay(currentLogicalDayName)}
                  className="self-start sm:self-auto px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold transition whitespace-nowrap"
                >
                  Kembali ke Hari Ini ({scheduleData[currentLogicalDayName]?.title})
                </button>
              </div>
            )}

            {/* Category Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'study', label: 'Belajar 📚' },
                { id: 'class', label: 'Kuliah 🏛️' },
                { id: 'hobby', label: 'Hobi 🎮' },
                { id: 'social', label: 'Sosial 👥' },
                { id: 'self-dev', label: 'Self-Dev 💡' },
                { id: 'routine', label: 'Rutinitas/Break ☕' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Schedule Header */}
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-900">Jadwal {scheduleData[activeDay]?.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{scheduleData[activeDay]?.tagline}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200/80 transition shadow-2xs"
                  title="Pindah ke Catatan Tugas (Shortcut: Tekan 2)"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ke Catatan Tugas [2]</span>
                </button>
                <button
                  onClick={handleOpenAddActivity}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kegiatan Baru</span>
                </button>
              </div>
            </div>

            {/* Gamified Progress Bar */}
            <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-zinc-700 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Progress Hari Ini</span>
                </span>
                <span className="text-zinc-900 font-bold">{progressPercent}% Selesai ({completedCount}/{rawDaySchedule.length})</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
              {progressPercent === 100 && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold mt-2 animate-fade-in">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Luar Biasa! Semua target kegiatan hari ini selesai 100%! 🎉</span>
                </div>
              )}
            </div>

            {/* Time-Blocked Groups */}
            <div className="space-y-6">
              {currentDaySchedule.length === 0 ? (
                <div className="py-12 text-center bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
                  <p className="text-sm font-medium text-zinc-500">Tidak ada kegiatan di kategori ini.</p>
                  <button onClick={() => setCategoryFilter('all')} className="mt-3 px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-200">
                    Tampilkan Semua Kegiatan
                  </button>
                </div>
              ) : (
                periods.map((period) => {
                  const itemsInPeriod = groupedSchedule[period] || [];
                  if (itemsInPeriod.length === 0) return null;

                  return (
                    <div key={period} className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-zinc-200/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{period}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                          {itemsInPeriod.length} Kegiatan
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {itemsInPeriod.map((item) => {
                          const checkKey = `${selectedDateStr}_${item.id}`;
                          const isChecked = !!checkedItems[checkKey] || (selectedDateStr === getLogicalDateStr(currentTime) && !!checkedItems[item.id]);
                          const isCurrent = selectedDateStr === getLogicalDateStr(currentTime) && currentActivityItem?.id === item.id;
                          const catMeta = CATEGORY_MAP[item.category] || CATEGORY_MAP.routine;

                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleCheck(item.id)}
                              className={`group flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                                isChecked ? 'bg-zinc-50/70 border-zinc-200 opacity-60' 
                                : isCurrent ? 'bg-white border-zinc-900 shadow-md ring-2 ring-zinc-900/10'
                                : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs'
                              }`}
                            >
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCheck(item.id);
                                }}
                                className={`mt-0.5 transition-colors ${
                                  isChecked 
                                    ? 'text-zinc-400' 
                                    : 'text-zinc-300 group-hover:text-zinc-500'
                                }`}
                              >
                                {isChecked ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="font-mono text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                                    {item.time}
                                  </span>

                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${catMeta.color} flex items-center gap-1`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dot}`}></span>
                                    <span>{catMeta.label}</span>
                                  </span>

                                  {item.priority === 'A' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white">Grade A</span>
                                  )}
                                  
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-zinc-900 bg-zinc-900 text-white flex items-center gap-1 animate-pulse">
                                      Saat ini
                                    </span>
                                  )}
                                </div>

                                <h4 className={`text-sm font-bold tracking-tight ${isChecked ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                                  {item.title}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{item.desc}</p>
                              </div>

                              <div className="flex flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleOpenEditActivity(item, e)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => handleDeleteActivity(item.id, e)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: TASKS --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200/80 pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-900">Catatan Tugas Kampus</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Kelola daftar prioritas dan deadline tugas (Otomatis masuk ke widget countdown).</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold border border-zinc-200 transition shadow-2xs"
                  title="Pindah ke Jadwal Harian (Shortcut: Tekan 1)"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Ke Jadwal Harian [1]</span>
                </button>
                <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 rounded-xl px-3 py-2 outline-none shadow-xs">
                  <option value="All">Semua Matkul</option>
                  <option value="Algoritma & Pemrograman">AlgoProg</option>
                  <option value="Discrete Mathematics">Matdis</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 rounded-xl px-3 py-2 outline-none shadow-xs">
                  <option value="All">Semua Status</option>
                  <option value="todo">Belum Selesai</option>
                  <option value="in-progress">Sedang Dikerjakan</option>
                  <option value="done">Selesai</option>
                </select>
                <button onClick={handleOpenAddTask} className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition shadow-xs">
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
                <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-zinc-700">Belum ada catatan tugas.</p>
                <p className="text-xs text-zinc-400 mt-1">Klik tombol "+ Tambah" untuk mencatat tugas baru.</p>
                <button onClick={handleOpenAddTask} className="mt-4 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-xl hover:bg-zinc-800">
                  + Tambah Tugas Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map(task => (
                  <div key={task.id} className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition shadow-xs hover:shadow-sm ${task.status === 'done' ? 'border-zinc-200/80 opacity-60' : task.priority === 'A' ? 'border-zinc-900' : 'border-zinc-200/80'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">{task.subject}</span>
                        {task.priority === 'A' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white">Grade A</span>}
                      </div>
                      <h4 className={`text-base font-bold tracking-tight ${task.status === 'done' ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>{task.title}</h4>
                      <p className="text-xs text-zinc-600 mt-2.5 p-3 bg-zinc-50 rounded-xl border border-zinc-100 leading-relaxed">{task.notes || 'Tidak ada catatan khusus.'}</p>
                      {task.deadline && (
                        <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                          <span className="text-zinc-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Deadline: {task.deadline}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px]">
                            H-{getDaysLeft(task.deadline)} Hari
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center">
                       <select value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value)} className="text-xs font-semibold bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 outline-none cursor-pointer">
                          <option value="todo">Belum Selesai</option>
                          <option value="in-progress">Sedang Dikerjakan</option>
                          <option value="done">Selesai</option>
                       </select>
                       <div className="flex items-center gap-1">
                         <button onClick={() => handleOpenEditTask(task)} className="text-zinc-400 hover:text-zinc-900 transition p-1.5 rounded-lg hover:bg-zinc-100" title="Edit Tugas">
                           <Edit3 className="w-4 h-4" />
                         </button>
                         <button onClick={() => deleteTask(task.id)} className="text-zinc-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50" title="Hapus Tugas">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: POMODORO --- */}
        {activeTab === 'pomodoro' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-white border border-zinc-200/80 p-8 sm:p-10 rounded-3xl w-full max-w-md text-center shadow-sm">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold mb-8">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sesi Fokus Belajar (Deep Work)</span>
              </span>
              
              <div className="text-7xl sm:text-8xl font-mono font-bold tracking-tighter text-zinc-900 mb-8">
                {formatTimeStr(pomodoroTime)}
              </div>

              <div className="flex justify-center gap-2 mb-8">
                <button onClick={() => { setPomodoroMode('focus'); setPomodoroTime(25*60); setIsTimerRunning(false); }} className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${pomodoroMode === 'focus' ? 'bg-zinc-900 text-white shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>Fokus 25m</button>
                <button onClick={() => { setPomodoroMode('deep'); setPomodoroTime(50*60); setIsTimerRunning(false); }} className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${pomodoroMode === 'deep' ? 'bg-zinc-900 text-white shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>Deep 50m</button>
                <button onClick={() => { setPomodoroMode('short'); setPomodoroTime(5*60); setIsTimerRunning(false); }} className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${pomodoroMode === 'short' ? 'bg-zinc-900 text-white shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>Istirahat 5m</button>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="flex items-center gap-2 px-7 py-3 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition shadow-xs">
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isTimerRunning ? 'Jeda' : 'Mulai Fokus'}</span>
                </button>
                <button onClick={() => { setIsTimerRunning(false); setPomodoroTime(25*60); }} className="p-3 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: STATISTIK & ANALYTICS --- */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200/80 pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-900">Analistik & Statistik Belajar</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Laporan produktivitas dan alokasi waktu mingguan.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleExportBackup} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-200">
                  <Download className="w-3.5 h-3.5"/> Export JSON
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-200 cursor-pointer">
                  <Upload className="w-3.5 h-3.5"/> Import Backup
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Kegiatan Harian</p>
                <p className="text-3xl font-bold font-mono text-zinc-900 mt-2">{rawDaySchedule.length}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Hari {activeDay}</p>
              </div>
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tugas Selesai</p>
                <p className="text-3xl font-bold font-mono text-emerald-600 mt-2">
                  {tasks.filter(t => t.status === 'done').length} / {tasks.length}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">Total Catatan Tugas</p>
              </div>
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Disiplin Harian</p>
                <p className="text-3xl font-bold font-mono text-indigo-600 mt-2">{progressPercent}%</p>
                <p className="text-[11px] text-zinc-400 mt-1">Rasio Ceklis Hari Ini</p>
              </div>
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target Ujian & Deadlines</p>
                <p className="text-3xl font-bold font-mono text-amber-600 mt-2">{allCountdownItems.length}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Countdown Aktif</p>
              </div>
            </div>

            {/* Category Hours Breakdown */}
            <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-zinc-900">Distribusi Kategori Waktu Belajar</h4>
              <div className="space-y-3">
                {[
                  { key: 'study', name: 'Belajar & Coding Mandiri', color: 'bg-indigo-500', percent: 40 },
                  { key: 'class', name: 'Kuliah & Lab Kampus', color: 'bg-purple-500', percent: 30 },
                  { key: 'routine', name: 'Rutinitas & Coffee Break', color: 'bg-zinc-400', percent: 15 },
                  { key: 'hobby', name: 'Hobi & Refreshing', color: 'bg-amber-500', percent: 10 },
                  { key: 'self-dev', name: 'Pengembangan Diri', color: 'bg-sky-500', percent: 5 }
                ].map(cat => (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-700">{cat.name}</span>
                      <span className="text-zinc-900">{cat.percent}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: CATATAN RUMUS & CHEAT-SHEET --- */}
        {activeTab === 'formulas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200/80 pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-900">Catatan Rumus & Cheat-Sheet</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Ringkasan rumus, rumus matematika, dan sintaks penting per mata kuliah.</p>
              </div>
              <button onClick={() => setShowFormulaModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition shadow-xs">
                <Plus className="w-4 h-4"/> Tambah Rumus
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formulas.map((f) => (
                <div key={f.id} className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">{f.subject}</span>
                      <button onClick={() => deleteFormula(f.id)} className="text-zinc-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900">{f.title}</h4>
                    <pre className="text-xs font-mono bg-zinc-900 text-zinc-100 p-3.5 rounded-xl mt-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {f.code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- ACTIVITY MODAL --- */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-zinc-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">{editingItem ? 'Edit Kegiatan' : 'Kegiatan Baru'}</h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveActivity} className="space-y-4 text-sm">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <label className="block text-zinc-700 font-bold text-xs">Cakupan Simpan Kegiatan:</label>
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="flex items-center gap-2 font-semibold text-zinc-800 cursor-pointer">
                    <input
                      type="radio"
                      name="saveScope"
                      value="template"
                      checked={activityForm.saveScope !== 'dateOnly'}
                      onChange={() => setActivityForm({ ...activityForm, saveScope: 'template' })}
                    />
                    <span>📌 Simpan ke Master Template (Rutinitas Setiap Hari {scheduleData[activityForm.targetDay]?.title || activityForm.targetDay})</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-indigo-700 cursor-pointer">
                    <input
                      type="radio"
                      name="saveScope"
                      value="dateOnly"
                      checked={activityForm.saveScope === 'dateOnly'}
                      onChange={() => setActivityForm({ ...activityForm, saveScope: 'dateOnly' })}
                    />
                    <span>🗓️ Simpan Khusus Tanggal Ini Saja ({selectedDateStr})</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Hari</label>
                  <select value={activityForm.targetDay} onChange={e => setActivityForm({...activityForm, targetDay: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold">
                    {['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Jam (HH.MM - HH.MM)</label>
                  <input required value={activityForm.time} onChange={e => setActivityForm({...activityForm, time: e.target.value})} placeholder="08.00 - 10.00" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"/>
                </div>
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Nama Kegiatan</label>
                <input required value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} placeholder="Rapat, Belajar, dll" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Kategori</label>
                  <select value={activityForm.category} onChange={e => setActivityForm({...activityForm, category: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold">
                    <option value="study">Belajar</option>
                    <option value="class">Kuliah</option>
                    <option value="hobby">Hobi</option>
                    <option value="self-dev">Self-Dev</option>
                    <option value="social">Sosial</option>
                    <option value="routine">Rutinitas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Prioritas</label>
                  <select value={activityForm.priority} onChange={e => setActivityForm({...activityForm, priority: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold">
                    <option value="A">A (Paling Penting)</option>
                    <option value="B">B (Standar)</option>
                    <option value="C">C (Bebas)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsActivityModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-600 text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TASK MODAL --- */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-zinc-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">{editingTask ? 'Edit Catatan Tugas' : 'Tambah Tugas Baru'}</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-zinc-400 hover:text-zinc-700 p-1">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Mata Kuliah</label>
                <input
                  required
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  placeholder="Contoh: Algoritma & Pemrograman"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Judul Tugas</label>
                <input
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Contoh: Modul 4 Sorting"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Deadline (Otomatis Masuk Countdown)</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Prioritas</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"
                  >
                    <option value="A">Grade A (Penting)</option>
                    <option value="B">Grade B (Standar)</option>
                    <option value="C">Grade C (Opsional)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Catatan</label>
                <textarea
                  rows={3}
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  placeholder="Catatan pengerjaan..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-600 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
                >
                  {editingTask ? 'Simpan Perubahan' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EXAM MODAL --- */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-zinc-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">Tambah Countdown Ujian / UTC</h3>
              <button onClick={() => setShowExamModal(false)} className="text-zinc-400 hover:text-zinc-700 p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddExam} className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Nama Ujian / Kuis / UTC</label>
                <input required value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} placeholder="Contoh: UTC Semester" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Mata Kuliah</label>
                  <input required value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})} placeholder="Semua Matkul" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"/>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1 text-xs">Tanggal Pelaksanaan</label>
                  <input type="date" required value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"/>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowExamModal(false)} className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-600 text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700">Simpan Ujian</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FORMULA MODAL --- */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-zinc-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">Tambah Catatan Rumus</h3>
              <button onClick={() => setShowFormulaModal(false)} className="text-zinc-400 hover:text-zinc-700 p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddFormula} className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Mata Kuliah</label>
                <input required value={newFormula.subject} onChange={e => setNewFormula({...newFormula, subject: e.target.value})} placeholder="Algoritma & Pemrograman" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"/>
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Judul Rumus / Sintaks</label>
                <input required value={newFormula.title} onChange={e => setNewFormula({...newFormula, title: e.target.value})} placeholder="Contoh: Binary Search" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold"/>
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1 text-xs">Rumus / Sintaks Kode</label>
                <textarea rows={4} required value={newFormula.code} onChange={e => setNewFormula({...newFormula, code: e.target.value})} placeholder="Ketik rumus atau sintaks..." className="w-full bg-zinc-900 text-zinc-100 font-mono border border-zinc-800 rounded-xl px-3 py-2 outline-none text-xs leading-relaxed"/>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFormulaModal(false)} className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-600 text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold">Simpan Rumus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DATABASE SETUP MODAL --- */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-zinc-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-zinc-900">Status Database Cloud</h3>
              </div>
              <button onClick={() => setShowDbModal(false)} className="text-zinc-400 hover:text-zinc-700 p-1">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                isSupabaseConfigured ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className={`p-2 rounded-lg shrink-0 ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs">
                    {isSupabaseConfigured ? '🟢 Supabase Cloud Database Terhubung!' : '🟠 Mode Penyimpanan Lokal (LocalStorage)'}
                  </p>
                  <p className="mt-0.5 text-[11px]">
                    {isSupabaseConfigured
                      ? 'Semua perubahan tugas, rumus, dan ceklis tersinkronisasi otomatis ke cloud.'
                      : 'Data tersimpan di browser ini. Hubungkan Supabase agar data tersinkronisasi di semua HP & Laptop.'}
                  </p>
                </div>
              </div>

              {!isSupabaseConfigured && (
                <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 text-xs">Cara Menghubungkan Supabase (Gratis):</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 font-medium">
                    <li>Buat proyek gratis di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">Supabase.com</a></li>
                    <li>Buka <strong>SQL Editor</strong> dan jalankan script file <code>supabase_schema.sql</code></li>
                    <li>Di <strong>Vercel Dashboard</strong> ➔ Settings ➔ Environment Variables, tambahkan:
                      <ul className="list-disc list-inside pl-4 mt-1 font-mono text-[11px] text-zinc-800 space-y-0.5">
                        <li><code>VITE_SUPABASE_URL</code></li>
                        <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                      </ul>
                    </li>
                  </ol>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowDbModal(false)} className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATION POPUP --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-zinc-700 flex items-center gap-2.5 animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white ml-2 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}