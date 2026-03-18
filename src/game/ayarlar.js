import { varsayilanPetId } from './petler';

export const BASLANGIC_DURUMU = {
  kullaniciAdi: 'Oyuncu',
  aclik: 45,
  mutluluk: 65,
  puan: 0,
  xp: 0,
  altin: 120,
  seviye: 1,
  streak: 1,
  combo: 0,
  aktifPetId: varsayilanPetId,
  aktifTemaId: 'gece',
  aktifAksesuarId: null,
  sahipOlunanTemalar: ['gece'],
  sahipOlunanPetler: [varsayilanPetId],
  sahipOlunanAksesuarlar: [],
  sonOynamaGunAnahtari: null,
  sonGunlukOdulGunAnahtari: null,
  gunlukGorev: null,
  sezonGorevleri: null,
  sonEtkinlikTuru: null,
  egitimTamamlandiMi: false,
  istatistikler: {
    besle: 0,
    oyna: 0,
    tur: 0,
    gunlukOdul: 0,
    magazaAlisverisi: 0,
  },
  acilanBasarimlar: [],
  oyunBittiMi: false,
};

export const SINIRLAR = {
  min: 0,
  max: 100,
};

export const OYUN_AKISI = {
  sureMs: 2000,
  aclikArtis: 6,
  mutlulukAzalis: 5,
  puanArtis: 1,
  xpArtis: 2,
  comboAzalis: 1,
  sansEtkinligiTurEsigi: 6,
};

export const EYLEMLER = {
  besle: {
    aclikDegisimi: -14,
    mutlulukDegisimi: 3,
    xpKazanci: 5,
    altinKazanci: 6,
    comboArtis: 1,
    etiket: 'Besle',
    ikon: '🍖',
  },
  oyna: {
    aclikDegisimi: 4,
    mutlulukDegisimi: 12,
    xpKazanci: 7,
    altinKazanci: 8,
    comboArtis: 2,
    etiket: 'Oyna',
    ikon: '🎾',
  },
  sev: {
    aclikDegisimi: -3,
    mutlulukDegisimi: 7,
    xpKazanci: 4,
    altinKazanci: 5,
    comboArtis: 1,
    etiket: 'Sev',
    ikon: '🫶',
  },
};
