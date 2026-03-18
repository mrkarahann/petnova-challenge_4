export const PETLER = [
  {
    id: 'kedi',
    ad: 'Misket',
    tur: 'Kedi',
    emoji: '🐱',
    vurguRengi: '#FFD166',
  },
  {
    id: 'kopek',
    ad: 'Pati',
    tur: 'Kopek',
    emoji: '🐶',
    vurguRengi: '#8ED1FC',
  },
  {
    id: 'tavsan',
    ad: 'Pamuk',
    tur: 'Tavsan',
    emoji: '🐰',
    vurguRengi: '#F7B7F2',
  },
];

export const varsayilanPetId = PETLER[0].id;

export const petBul = (petId) => PETLER.find((pet) => pet.id === petId) ?? PETLER[0];
