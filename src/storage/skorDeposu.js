import AsyncStorage from '@react-native-async-storage/async-storage';

const EN_YUKSEK_PUAN_ANAHTARI = 'en_yuksek_puan_v1';

export const enYuksekPuaniYukle = async () => {
  try {
    const kayitliDeger = await AsyncStorage.getItem(EN_YUKSEK_PUAN_ANAHTARI);

    if (!kayitliDeger) {
      return 0;
    }

    const sayiDegeri = Number(kayitliDeger);

    if (Number.isNaN(sayiDegeri)) {
      return 0;
    }

    return sayiDegeri;
  } catch (_hata) {
    return 0;
  }
};

export const enYuksekPuaniKaydet = async (puan) => {
  try {
    await AsyncStorage.setItem(EN_YUKSEK_PUAN_ANAHTARI, String(puan));
  } catch (_hata) {
    // Kaydetme hatası oyunu durdurmamalı.
  }
};
