import { BASLANGIC_DURUMU, EYLEMLER, OYUN_AKISI, SINIRLAR } from './ayarlar';
import { acilanBasarimlariBul } from './basarimlar';
import { gunlukIlerlemeyiGuncelle } from './gunlukGorev';
import { sezonGorevleriniHazirla, sezonIlerlemesiniGuncelle } from './sezonGorevleri';
import { AKSESUARLAR, TEMALAR } from './magaza';

const sinirla = (deger) => Math.max(SINIRLAR.min, Math.min(SINIRLAR.max, deger));
const seviyeHesapla = (xp) => Math.max(1, Math.floor(xp / 60) + 1);
const themeVarmi = (temaId) => TEMALAR.some((tema) => tema.id === temaId);
const aksesuarVarmi = (aksesuarId) => AKSESUARLAR.some((aksesuar) => aksesuar.id === aksesuarId);

const ilerlemeDurumunuGuncelle = (durum) => {
  let guncelDurum = gunlukIlerlemeyiGuncelle(durum);
  if (!Array.isArray(guncelDurum.sezonGorevleri) || guncelDurum.sezonGorevleri.length === 0) {
    guncelDurum = {
      ...guncelDurum,
      sezonGorevleri: sezonGorevleriniHazirla(guncelDurum),
    };
  }

  guncelDurum = sezonIlerlemesiniGuncelle(guncelDurum);
  const acilanBasarimlar = acilanBasarimlariBul(guncelDurum);

  return {
    ...guncelDurum,
    seviye: seviyeHesapla(guncelDurum.xp),
    acilanBasarimlar,
  };
};

export const yeniOyunDurumu = () => ({
  ...BASLANGIC_DURUMU,
  istatistikler: { ...BASLANGIC_DURUMU.istatistikler },
  acilanBasarimlar: [...BASLANGIC_DURUMU.acilanBasarimlar],
});

export const durumHazirla = (durum) => ilerlemeDurumunuGuncelle(durum);

export const oyunBittiMi = (aclik, mutluluk) =>
  aclik >= SINIRLAR.max || mutluluk <= SINIRLAR.min;

export const zamanIlerle = (durum) => {
  const aclik = sinirla(durum.aclik + OYUN_AKISI.aclikArtis);
  const mutluluk = sinirla(durum.mutluluk - OYUN_AKISI.mutlulukAzalis);
  const bittiMi = oyunBittiMi(aclik, mutluluk);

  return ilerlemeDurumunuGuncelle({
    ...durum,
    aclik,
    mutluluk,
    puan: bittiMi ? durum.puan : durum.puan + OYUN_AKISI.puanArtis,
    xp: bittiMi ? durum.xp : durum.xp + OYUN_AKISI.xpArtis,
    combo: Math.max(0, (durum.combo ?? 0) - OYUN_AKISI.comboAzalis),
    istatistikler: {
      ...durum.istatistikler,
      tur: durum.istatistikler.tur + 1,
    },
    oyunBittiMi: bittiMi,
  });
};

export const eylemUygula = (durum, eylemAdi) => {
  if (durum.oyunBittiMi) {
    return durum;
  }

  const eylem = EYLEMLER[eylemAdi];

  if (!eylem) {
    return durum;
  }

  const aclik = sinirla(durum.aclik + eylem.aclikDegisimi);
  const mutluluk = sinirla(durum.mutluluk + eylem.mutlulukDegisimi);
  const bittiMi = oyunBittiMi(aclik, mutluluk);
  const yeniCombo = Math.min(10, (durum.combo ?? 0) + (eylem.comboArtis ?? 1));
  const comboCarpani = 1 + yeniCombo * 0.08;
  const xpKazanci = Math.round((eylem.xpKazanci ?? 0) * comboCarpani);
  const altinKazanci = Math.round((eylem.altinKazanci ?? 0) * comboCarpani);

  return ilerlemeDurumunuGuncelle({
    ...durum,
    aclik,
    mutluluk,
    xp: durum.xp + xpKazanci,
    altin: durum.altin + altinKazanci,
    combo: yeniCombo,
    istatistikler: {
      ...durum.istatistikler,
      [eylemAdi]: (durum.istatistikler[eylemAdi] ?? 0) + 1,
    },
    oyunBittiMi: bittiMi,
  });
};

export const sansEtkinligiUygula = (durum, sonuc) =>
  ilerlemeDurumunuGuncelle({
    ...durum,
    aclik: sinirla(durum.aclik + (sonuc.aclik ?? 0)),
    mutluluk: sinirla(durum.mutluluk + (sonuc.mutluluk ?? 0)),
    xp: durum.xp + (sonuc.xp ?? 0),
    altin: Math.max(0, durum.altin + (sonuc.altin ?? 0)),
  });

export const gunlukOdulTalepEt = (durum, gunAnahtari) => {
  if (durum.sonGunlukOdulGunAnahtari === gunAnahtari) {
    return { durum, odulAlindiMi: false };
  }

  const odul = 35 + Math.min((durum.streak ?? 1) * 5, 40);
  const guncel = ilerlemeDurumunuGuncelle({
    ...durum,
    altin: durum.altin + odul,
    sonGunlukOdulGunAnahtari: gunAnahtari,
    istatistikler: {
      ...durum.istatistikler,
      gunlukOdul: (durum.istatistikler.gunlukOdul ?? 0) + 1,
    },
  });

  return { durum: guncel, odulAlindiMi: true, odul };
};

export const temaSatinAl = (durum, temaId) => {
  const tema = TEMALAR.find((item) => item.id === temaId);
  if (!tema) {
    return { durum, basariliMi: false, mesaj: 'Tema bulunamadi.' };
  }

  const sahipMi = (durum.sahipOlunanTemalar ?? []).includes(temaId);
  if (sahipMi) {
    return {
      durum: { ...durum, aktifTemaId: temaId },
      basariliMi: true,
      mesaj: 'Tema aktif edildi.',
    };
  }

  if ((durum.altin ?? 0) < tema.fiyat) {
    return { durum, basariliMi: false, mesaj: 'Yetersiz altin.' };
  }

  return {
    basariliMi: true,
    mesaj: 'Tema satin alindi.',
    durum: {
      ...durum,
      altin: durum.altin - tema.fiyat,
      aktifTemaId: temaId,
      sahipOlunanTemalar: [...(durum.sahipOlunanTemalar ?? []), temaId],
      istatistikler: {
        ...durum.istatistikler,
        magazaAlisverisi: (durum.istatistikler?.magazaAlisverisi ?? 0) + 1,
      },
    },
  };
};

export const temaDegistir = (durum, temaId) => {
  if (!themeVarmi(temaId)) {
    return durum;
  }
  if (!(durum.sahipOlunanTemalar ?? []).includes(temaId)) {
    return durum;
  }
  return { ...durum, aktifTemaId: temaId };
};

export const aksesuarSatinAl = (durum, aksesuarId) => {
  const aksesuar = AKSESUARLAR.find((item) => item.id === aksesuarId);
  if (!aksesuar) {
    return { durum, basariliMi: false, mesaj: 'Aksesuar bulunamadi.' };
  }

  const sahipMi = (durum.sahipOlunanAksesuarlar ?? []).includes(aksesuarId);
  if (sahipMi) {
    return {
      durum: { ...durum, aktifAksesuarId: aksesuarId },
      basariliMi: true,
      mesaj: 'Aksesuar aktif edildi.',
    };
  }

  if ((durum.altin ?? 0) < aksesuar.fiyat) {
    return { durum, basariliMi: false, mesaj: 'Yetersiz altin.' };
  }

  return {
    basariliMi: true,
    mesaj: 'Aksesuar satin alindi.',
    durum: {
      ...durum,
      altin: durum.altin - aksesuar.fiyat,
      aktifAksesuarId: aksesuarId,
      sahipOlunanAksesuarlar: [...(durum.sahipOlunanAksesuarlar ?? []), aksesuarId],
      istatistikler: {
        ...durum.istatistikler,
        magazaAlisverisi: (durum.istatistikler?.magazaAlisverisi ?? 0) + 1,
      },
    },
  };
};

export const aksesuarDegistir = (durum, aksesuarId) => {
  if (aksesuarId === null) {
    return { ...durum, aktifAksesuarId: null };
  }
  if (!aksesuarVarmi(aksesuarId)) {
    return durum;
  }
  if (!(durum.sahipOlunanAksesuarlar ?? []).includes(aksesuarId)) {
    return durum;
  }
  return { ...durum, aktifAksesuarId: aksesuarId };
};

export const ruhHali = (durum) => {
  if (durum.oyunBittiMi) {
    return {
      emoji: '💀',
      mesaj: 'Evcil hayvan çok yoruldu.',
      arkaPlan: '#4A1C1C',
    };
  }

  if (durum.aclik > 80) {
    return {
      emoji: '😫',
      mesaj: 'Çok açım, hemen besle!',
      arkaPlan: '#5A2A2A',
    };
  }

  if (durum.mutluluk < 30) {
    return {
      emoji: '😢',
      mesaj: 'Moralim bozuk, biraz oyun oynayalım.',
      arkaPlan: '#2B2A5A',
    };
  }

  if (durum.mutluluk > 80 && durum.aclik < 40) {
    return {
      emoji: '😄',
      mesaj: 'Harika hissediyorum!',
      arkaPlan: '#1E4D35',
    };
  }

  return {
    emoji: '🙂',
    mesaj: 'Şimdilik iyiyim.',
    arkaPlan: '#263B5A',
  };
};
