export const SANSETKINLIKLERI = [
  {
    id: 'park',
    baslik: 'Park Etkinligi',
    metin: 'Petin parkta enerjik bir grup buldu. Katilsin mi?',
    secenekler: [
      {
        id: 'katil',
        etiket: 'Katilsin',
        sonuc: { mutluluk: 12, aclik: 4, xp: 10, altin: 8 },
      },
      {
        id: 'dinlen',
        etiket: 'Dinlensin',
        sonuc: { mutluluk: 4, xp: 4 },
      },
    ],
  },
  {
    id: 'hazine',
    baslik: 'Mini Hazine',
    metin: 'Eski bir kutu bulundu. Acmak ister misin?',
    secenekler: [
      {
        id: 'ac',
        etiket: 'Ac',
        sonuc: { altin: 35, xp: 6, mutluluk: 3 },
      },
      {
        id: 'birak',
        etiket: 'Bosver',
        sonuc: { mutluluk: 2, xp: 2 },
      },
    ],
  },
  {
    id: 'antrenman',
    baslik: 'Hizli Antrenman',
    metin: 'Pet antrenman yapmak istiyor. Kabul edilsin mi?',
    secenekler: [
      {
        id: 'egit',
        etiket: 'Antrenman',
        sonuc: { xp: 18, mutluluk: 5, aclik: 5 },
      },
      {
        id: 'ertele',
        etiket: 'Ertele',
        sonuc: { mutluluk: -2, xp: 2 },
      },
    ],
  },
];

export const sansEtkinligiSec = (anahtar) => {
  const indeks = anahtar % SANSETKINLIKLERI.length;
  return SANSETKINLIKLERI[indeks];
};
