export const BASARIMLAR = [
  {
    id: 'ilk_adim',
    ad: 'Ilk Adim',
    aciklama: 'Evcil hayvani ilk kez besle.',
    kontrol: (durum) => durum.istatistikler.besle >= 1,
  },
  {
    id: 'oyun_arkadasi',
    ad: 'Oyun Arkadasi',
    aciklama: 'Toplam 5 kez oyun oyna.',
    kontrol: (durum) => durum.istatistikler.oyna >= 5,
  },
  {
    id: 'puan_ustasi',
    ad: 'Puan Ustasi',
    aciklama: '25 puana ulas.',
    kontrol: (durum) => durum.puan >= 25,
  },
  {
    id: 'harika_mod',
    ad: 'Harika Mod',
    aciklama: 'Mutluluk 90+ iken acligi 30 altinda tut.',
    kontrol: (durum) => durum.mutluluk >= 90 && durum.aclik <= 30,
  },
  {
    id: 'zengin_kasa',
    ad: 'Zengin Kasa',
    aciklama: '300 altina ulas.',
    kontrol: (durum) => durum.altin >= 300,
  },
  {
    id: 'streak_3',
    ad: 'Seri Basladi',
    aciklama: '3 gunluk streak yap.',
    kontrol: (durum) => (durum.streak ?? 0) >= 3,
  },
];

export const acilanBasarimlariBul = (durum) => {
  const acilanlar = new Set(durum.acilanBasarimlar);

  BASARIMLAR.forEach((basarim) => {
    if (!acilanlar.has(basarim.id) && basarim.kontrol(durum)) {
      acilanlar.add(basarim.id);
    }
  });

  return Array.from(acilanlar);
};

export const basarimMetaHaritasi = BASARIMLAR.reduce((harita, basarim) => {
  harita[basarim.id] = basarim;
  return harita;
}, {});
