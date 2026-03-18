export const TEMALAR = [
  {
    id: 'gece',
    ad: 'Gece Neonu',
    fiyat: 0,
    arkaPlan: '#1A2548',
    kart: 'rgba(255,255,255,0.14)',
  },
  {
    id: 'gunduz',
    ad: 'Gunduz Bahcesi',
    fiyat: 150,
    arkaPlan: '#2C6E49',
    kart: 'rgba(255,255,255,0.18)',
  },
  {
    id: 'lav',
    ad: 'Lav Diyari',
    fiyat: 240,
    arkaPlan: '#5A1E1E',
    kart: 'rgba(255,255,255,0.13)',
  },
  {
    id: 'uzay',
    ad: 'Uzay Ussu',
    fiyat: 320,
    arkaPlan: '#101A33',
    kart: 'rgba(147, 206, 255, 0.2)',
  },
  {
    id: 'siber',
    ad: 'Siber Iz',
    fiyat: 380,
    arkaPlan: '#14243B',
    kart: 'rgba(96, 247, 211, 0.18)',
  },
  {
    id: 'aurora',
    ad: 'Aurora',
    fiyat: 450,
    arkaPlan: '#1B3A5A',
    kart: 'rgba(177, 147, 255, 0.2)',
  },
  {
    id: 'gunbatimi',
    ad: 'Gun Batimi',
    fiyat: 420,
    arkaPlan: '#5A2B38',
    kart: 'rgba(255, 199, 140, 0.18)',
  },
  {
    id: 'buz',
    ad: 'Buz Kralligi',
    fiyat: 520,
    arkaPlan: '#1F3D58',
    kart: 'rgba(184, 230, 255, 0.2)',
  },
];

export const temaBul = (temaId) => TEMALAR.find((tema) => tema.id === temaId) ?? TEMALAR[0];

export const AKSESUARLAR = [
  { id: 'sapka_kirmizi', ad: 'Kirmizi Sapka', emoji: '🎩', fiyat: 140 },
  { id: 'gozluk', ad: 'Neon Gozluk', emoji: '🕶️', fiyat: 170 },
  { id: 'tac', ad: 'Altin Tac', emoji: '👑', fiyat: 260 },
  { id: 'fular', ad: 'Mavi Fular', emoji: '🧣', fiyat: 120 },
  { id: 'kanat', ad: 'Melek Kanadi', emoji: '🪽', fiyat: 300 },
  { id: 'kulaklik', ad: 'DJ Kulaklik', emoji: '🎧', fiyat: 190 },
  { id: 'yildiz', ad: 'Yildiz Efekti', emoji: '✨', fiyat: 220 },
  { id: 'robot', ad: 'Robot Vizoru', emoji: '🤖', fiyat: 340 },
];

export const aksesuarBul = (aksesuarId) =>
  AKSESUARLAR.find((aksesuar) => aksesuar.id === aksesuarId) ?? null;
