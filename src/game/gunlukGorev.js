const GUNLUK_GOREV_HAVUZU = [
  {
    id: 'besle_3',
    baslik: 'Bugun 3 kez besle',
    tip: 'besle',
    hedef: 3,
    odulXp: 20,
    odulAltin: 20,
  },
  {
    id: 'oyna_4',
    baslik: 'Bugun 4 kez oyna',
    tip: 'oyna',
    hedef: 4,
    odulXp: 24,
    odulAltin: 25,
  },
  {
    id: 'tur_8',
    baslik: '8 tur hayatta kal',
    tip: 'tur',
    hedef: 8,
    odulXp: 18,
    odulAltin: 18,
  },
  {
    id: 'altin_90',
    baslik: 'Bugun 90 altin topla',
    tip: 'altin',
    hedef: 90,
    odulXp: 22,
    odulAltin: 30,
  },
];

const metrikDegeriGetir = (durum, tip) => {
  if (tip === 'xp') {
    return durum.xp;
  }
  if (tip === 'altin') {
    return durum.altin;
  }

  return durum.istatistikler?.[tip] ?? 0;
};

const hashUret = (metin) =>
  metin.split('').reduce((toplam, karakter) => toplam + karakter.charCodeAt(0), 0);

const gunFarkiniHesapla = (oncekiGun, yeniGun) => {
  const [oy, om, og] = oncekiGun.split('-').map(Number);
  const [yy, ym, yg] = yeniGun.split('-').map(Number);
  const oncekiTarih = new Date(oy, om - 1, og);
  const yeniTarih = new Date(yy, ym - 1, yg);
  const farkMs = yeniTarih.getTime() - oncekiTarih.getTime();
  return Math.round(farkMs / 86400000);
};

export const gunAnahtariOlustur = (tarih = new Date()) => {
  const yil = tarih.getFullYear();
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const gun = String(tarih.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
};

const gorevOlustur = (durum, gunAnahtari) => {
  const secimIndeksi = hashUret(gunAnahtari) % GUNLUK_GOREV_HAVUZU.length;
  const seciliGorev = GUNLUK_GOREV_HAVUZU[secimIndeksi];
  const baslangicDegeri = metrikDegeriGetir(durum, seciliGorev.tip);

  return {
    ...seciliGorev,
    gunAnahtari,
    baslangicDegeri,
    ilerleme: 0,
    tamamlandiMi: false,
  };
};

const gorevIlerlemesiniHesapla = (durum, gorev) => {
  const guncelDeger = metrikDegeriGetir(durum, gorev.tip);
  return Math.max(0, guncelDeger - gorev.baslangicDegeri);
};

export const gunlukIlerlemeyiGuncelle = (durum) => {
  const bugunAnahtari = gunAnahtariOlustur();
  let sonrakiDurum = { ...durum };

  if (!sonrakiDurum.gunlukGorev || sonrakiDurum.gunlukGorev.gunAnahtari !== bugunAnahtari) {
    const oncekiGunAnahtari = sonrakiDurum.sonOynamaGunAnahtari;
    let streak = 1;

    if (oncekiGunAnahtari && oncekiGunAnahtari !== bugunAnahtari) {
      const fark = gunFarkiniHesapla(oncekiGunAnahtari, bugunAnahtari);
      streak = fark === 1 ? (sonrakiDurum.streak ?? 0) + 1 : 1;
    } else if (oncekiGunAnahtari === bugunAnahtari) {
      streak = sonrakiDurum.streak ?? 1;
    }

    sonrakiDurum = {
      ...sonrakiDurum,
      streak,
      sonOynamaGunAnahtari: bugunAnahtari,
      gunlukGorev: gorevOlustur(sonrakiDurum, bugunAnahtari),
    };
  }

  const gorev = sonrakiDurum.gunlukGorev;
  if (!gorev) {
    return sonrakiDurum;
  }

  const hamIlerleme = gorevIlerlemesiniHesapla(sonrakiDurum, gorev);
  const ilerleme = Math.min(gorev.hedef, hamIlerleme);
  const yeniTamamlandiMi = gorev.tamamlandiMi || ilerleme >= gorev.hedef;
  const gorevYeniTamamlandi = !gorev.tamamlandiMi && yeniTamamlandiMi;

  return {
    ...sonrakiDurum,
    xp: gorevYeniTamamlandi ? sonrakiDurum.xp + gorev.odulXp : sonrakiDurum.xp,
    altin: gorevYeniTamamlandi
      ? sonrakiDurum.altin + (gorev.odulAltin ?? 0)
      : sonrakiDurum.altin,
    gunlukGorev: {
      ...gorev,
      ilerleme,
      tamamlandiMi: yeniTamamlandiMi,
    },
  };
};
