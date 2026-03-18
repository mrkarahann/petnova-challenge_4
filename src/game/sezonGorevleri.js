export const SEZON_GOREVLERI_HAVUZU = [
  {
    id: 'besle_20',
    baslik: '20 kez besle',
    tip: 'besle',
    hedef: 20,
    odulAltin: 120,
    odulXp: 40,
  },
  {
    id: 'oyna_20',
    baslik: '20 kez oyna',
    tip: 'oyna',
    hedef: 20,
    odulAltin: 140,
    odulXp: 45,
  },
  {
    id: 'tur_40',
    baslik: '40 tur hayatta kal',
    tip: 'tur',
    hedef: 40,
    odulAltin: 180,
    odulXp: 55,
  },
];

const metrikDegeriGetir = (durum, tip) => durum.istatistikler?.[tip] ?? 0;

export const sezonGorevleriniHazirla = (durum) =>
  SEZON_GOREVLERI_HAVUZU.map((gorev) => {
    const baslangicDegeri = metrikDegeriGetir(durum, gorev.tip);
    return {
      ...gorev,
      baslangicDegeri,
      ilerleme: 0,
      tamamlandiMi: false,
      odulAlindiMi: false,
    };
  });

export const sezonIlerlemesiniGuncelle = (durum) => {
  if (!Array.isArray(durum.sezonGorevleri) || durum.sezonGorevleri.length === 0) {
    return durum;
  }

  const guncelGorevler = durum.sezonGorevleri.map((gorev) => {
    const guncelDeger = metrikDegeriGetir(durum, gorev.tip);
    const hamIlerleme = Math.max(0, guncelDeger - (gorev.baslangicDegeri ?? 0));
    const ilerleme = Math.min(gorev.hedef, hamIlerleme);
    return {
      ...gorev,
      ilerleme,
      tamamlandiMi: gorev.tamamlandiMi || ilerleme >= gorev.hedef,
    };
  });

  return {
    ...durum,
    sezonGorevleri: guncelGorevler,
  };
};
