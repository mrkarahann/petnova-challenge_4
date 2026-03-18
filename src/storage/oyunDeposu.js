import AsyncStorage from '@react-native-async-storage/async-storage';
import { yeniOyunDurumu } from '../game/motor';

const OYUN_DURUMU_ANAHTARI = 'oyun_durumu_v1';

export const oyunDurumunuYukle = async () => {
  try {
    const hamVeri = await AsyncStorage.getItem(OYUN_DURUMU_ANAHTARI);

    if (!hamVeri) {
      return yeniOyunDurumu();
    }

    const parsed = JSON.parse(hamVeri);
    const ilkDurum = yeniOyunDurumu();

    return {
      ...ilkDurum,
      ...parsed,
      sahipOlunanTemalar: Array.isArray(parsed.sahipOlunanTemalar)
        ? parsed.sahipOlunanTemalar
        : ilkDurum.sahipOlunanTemalar,
      sahipOlunanPetler: Array.isArray(parsed.sahipOlunanPetler)
        ? parsed.sahipOlunanPetler
        : ilkDurum.sahipOlunanPetler,
      sahipOlunanAksesuarlar: Array.isArray(parsed.sahipOlunanAksesuarlar)
        ? parsed.sahipOlunanAksesuarlar
        : ilkDurum.sahipOlunanAksesuarlar,
      istatistikler: {
        ...ilkDurum.istatistikler,
        ...(parsed.istatistikler ?? {}),
      },
      acilanBasarimlar: Array.isArray(parsed.acilanBasarimlar)
        ? parsed.acilanBasarimlar
        : ilkDurum.acilanBasarimlar,
      sezonGorevleri: Array.isArray(parsed.sezonGorevleri)
        ? parsed.sezonGorevleri
        : ilkDurum.sezonGorevleri,
    };
  } catch (_hata) {
    return yeniOyunDurumu();
  }
};

export const oyunDurumunuKaydet = async (durum) => {
  try {
    await AsyncStorage.setItem(OYUN_DURUMU_ANAHTARI, JSON.stringify(durum));
  } catch (_hata) {
    // Kayit hatasi oyunu durdurmamali.
  }
};
