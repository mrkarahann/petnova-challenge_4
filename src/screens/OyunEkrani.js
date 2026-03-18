import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import EylemButonu from '../components/EylemButonu';
import StatCubugu from '../components/StatCubugu';
import { EYLEMLER, OYUN_AKISI } from '../game/ayarlar';
import { BASARIMLAR, basarimMetaHaritasi } from '../game/basarimlar';
import { sansEtkinligiSec } from '../game/etkinlikler';
import { gunAnahtariOlustur } from '../game/gunlukGorev';
import { AKSESUARLAR, TEMALAR, aksesuarBul, temaBul } from '../game/magaza';
import { PETLER, petBul } from '../game/petler';
import {
  aksesuarDegistir,
  aksesuarSatinAl,
  durumHazirla,
  eylemUygula,
  gunlukOdulTalepEt,
  ruhHali,
  sansEtkinligiUygula,
  temaDegistir,
  temaSatinAl,
  yeniOyunDurumu,
  zamanIlerle,
} from '../game/motor';
import { oyunDurumunuKaydet, oyunDurumunuYukle } from '../storage/oyunDeposu';
import { enYuksekPuaniKaydet, enYuksekPuaniYukle } from '../storage/skorDeposu';
import stiller from '../styles/oyunStilleri';

const OYUN_MARKASI = 'PetNova';

const petIfadesiBul = (durum) => {
  if (durum.oyunBittiMi) {
    return { ikon: '☠️', etiket: 'Baygin', renk: '#F87171' };
  }
  if (durum.aclik >= 85) {
    return { ikon: '😫', etiket: 'Cok Ac', renk: '#FB7185' };
  }
  if (durum.mutluluk <= 20) {
    return { ikon: '😢', etiket: 'Mutsuz', renk: '#93C5FD' };
  }
  if (durum.mutluluk >= 80 && durum.aclik <= 40) {
    return { ikon: '😎', etiket: 'Formda', renk: '#86EFAC' };
  }
  return { ikon: '🙂', etiket: 'Dengede', renk: '#FDE68A' };
};

const secenekSonucMetni = (sonuc) => {
  const parcali = [];
  if (sonuc.xp) parcali.push(`${sonuc.xp > 0 ? '+' : ''}${sonuc.xp} XP`);
  if (sonuc.altin) parcali.push(`${sonuc.altin > 0 ? '+' : ''}${sonuc.altin} altin`);
  if (sonuc.mutluluk) parcali.push(`${sonuc.mutluluk > 0 ? '+' : ''}${sonuc.mutluluk} mutluluk`);
  if (sonuc.aclik) parcali.push(`${sonuc.aclik > 0 ? '+' : ''}${sonuc.aclik} aclik`);
  return parcali.join(' | ');
};

export default function OyunEkrani() {
  const [durum, setDurum] = useState(yeniOyunDurumu);
  const [enYuksekPuan, setEnYuksekPuan] = useState(0);
  const [depoHazirMi, setDepoHazirMi] = useState(false);
  const [aktifSayfa, setAktifSayfa] = useState('menu');
  const [sonAcilanBasarimId, setSonAcilanBasarimId] = useState(null);
  const [seviyeAtladiMesaji, setSeviyeAtladiMesaji] = useState(null);
  const [uyariMesaji, setUyariMesaji] = useState('');
  const [aktifEtkinlik, setAktifEtkinlik] = useState(null);

  const kartGirisAnimasyonu = useRef(new Animated.Value(0)).current;
  const petNefesAnimasyonu = useRef(new Animated.Value(1)).current;
  const oncekiBasarimlarRef = useRef([]);
  const oncekiSeviyeRef = useRef(1);
  const oncekiOyunBittiRef = useRef(false);

  useEffect(() => {
    Animated.timing(kartGirisAnimasyonu, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [kartGirisAnimasyonu]);

  useEffect(() => {
    const verileriYukle = async () => {
      const [yukluPuan, yukluDurum] = await Promise.all([enYuksekPuaniYukle(), oyunDurumunuYukle()]);
      const hazirDurum = durumHazirla(yukluDurum);
      setEnYuksekPuan(yukluPuan);
      oncekiBasarimlarRef.current = hazirDurum.acilanBasarimlar ?? [];
      oncekiSeviyeRef.current = hazirDurum.seviye ?? 1;
      setDurum(hazirDurum);
      setDepoHazirMi(true);
    };
    verileriYukle();
  }, []);

  useEffect(() => {
    if (!depoHazirMi) return;
    if (durum.puan > enYuksekPuan) {
      setEnYuksekPuan(durum.puan);
      enYuksekPuaniKaydet(durum.puan);
    }
  }, [durum.puan, enYuksekPuan, depoHazirMi]);

  useEffect(() => {
    if (!depoHazirMi) return;
    oyunDurumunuKaydet(durum);
  }, [durum, depoHazirMi]);

  useEffect(() => {
    const oncekiBasarimlar = oncekiBasarimlarRef.current;
    const yeniBasarimId = durum.acilanBasarimlar.find((id) => !oncekiBasarimlar.includes(id));
    oncekiBasarimlarRef.current = durum.acilanBasarimlar;
    if (!yeniBasarimId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSonAcilanBasarimId(yeniBasarimId);
    const temizleme = setTimeout(() => setSonAcilanBasarimId(null), 2400);
    return () => clearTimeout(temizleme);
  }, [durum.acilanBasarimlar]);

  useEffect(() => {
    if (!depoHazirMi) return;
    if (durum.seviye > oncekiSeviyeRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSeviyeAtladiMesaji(`Seviye ${durum.seviye}!`);
      const temizle = setTimeout(() => setSeviyeAtladiMesaji(null), 2200);
      oncekiSeviyeRef.current = durum.seviye;
      return () => clearTimeout(temizle);
    }
    oncekiSeviyeRef.current = durum.seviye;
  }, [durum.seviye, depoHazirMi]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(petNefesAnimasyonu, {
        toValue: 1.08,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(petNefesAnimasyonu, {
        toValue: 1,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [durum.aclik, durum.mutluluk, durum.oyunBittiMi, petNefesAnimasyonu]);

  useEffect(() => {
    if (!depoHazirMi || aktifSayfa !== 'game' || aktifEtkinlik) return undefined;
    const sayac = setInterval(() => {
      setDurum((oncekiDurum) => {
        if (oncekiDurum.oyunBittiMi) return oncekiDurum;
        return zamanIlerle(oncekiDurum);
      });
    }, OYUN_AKISI.sureMs);
    return () => clearInterval(sayac);
  }, [depoHazirMi, aktifSayfa, aktifEtkinlik]);

  useEffect(() => {
    if (aktifSayfa !== 'game' || aktifEtkinlik || durum.oyunBittiMi) return;
    const tur = durum.istatistikler?.tur ?? 0;
    if (tur === 0 || tur % OYUN_AKISI.sansEtkinligiTurEsigi !== 0) return;
    const anahtar = `tur-${tur}`;
    if (durum.sonEtkinlikTuru === anahtar) return;
    const etkinlik = sansEtkinligiSec(tur + durum.seviye);
    setAktifEtkinlik(etkinlik);
    setDurum((onceki) => ({ ...onceki, sonEtkinlikTuru: anahtar }));
  }, [aktifSayfa, aktifEtkinlik, durum]);

  useEffect(() => {
    if (!uyariMesaji) return;
    const timer = setTimeout(() => setUyariMesaji(''), 2100);
    return () => clearTimeout(timer);
  }, [uyariMesaji]);

  useEffect(() => {
    const geriDinleyici = BackHandler.addEventListener('hardwareBackPress', () => {
      if (aktifEtkinlik) {
        setAktifEtkinlik(null);
        return true;
      }

      if (aktifSayfa === 'shop' || aktifSayfa === 'profile') {
        setAktifSayfa('game');
        return true;
      }

      return false;
    });

    return () => geriDinleyici.remove();
  }, [aktifSayfa, aktifEtkinlik]);

  useEffect(() => {
    if (durum.oyunBittiMi && !oncekiOyunBittiRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setUyariMesaji('Kaybettin! Yeni oyun baslatabilirsin.');
    }
    oncekiOyunBittiRef.current = durum.oyunBittiMi;
  }, [durum.oyunBittiMi]);

  const guncelRuhHali = useMemo(() => ruhHali(durum), [durum]);
  const aktifPet = useMemo(() => petBul(durum.aktifPetId), [durum.aktifPetId]);
  const aktifTema = useMemo(() => temaBul(durum.aktifTemaId), [durum.aktifTemaId]);
  const aktifAksesuar = useMemo(() => aksesuarBul(durum.aktifAksesuarId), [durum.aktifAksesuarId]);
  const petIfadesi = useMemo(() => petIfadesiBul(durum), [durum]);

  const kartAnimasyonStili = {
    opacity: kartGirisAnimasyonu,
    transform: [
      {
        translateY: kartGirisAnimasyonu.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const petAnimasyonStili = { transform: [{ scale: petNefesAnimasyonu }] };

  const eylemYap = (eylemAdi) => {
    Haptics.selectionAsync();
    setDurum((oncekiDurum) => eylemUygula(oncekiDurum, eylemAdi));
  };

  const yenidenBasla = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDurum((oncekiDurum) =>
      durumHazirla({
        ...yeniOyunDurumu(),
        aktifPetId: oncekiDurum.aktifPetId,
        aktifTemaId: oncekiDurum.aktifTemaId,
        aktifAksesuarId: oncekiDurum.aktifAksesuarId,
        sahipOlunanTemalar: oncekiDurum.sahipOlunanTemalar,
        sahipOlunanAksesuarlar: oncekiDurum.sahipOlunanAksesuarlar,
      })
    );
  };

  const petSec = (petId) => {
    Haptics.selectionAsync();
    setDurum((oncekiDurum) => durumHazirla({ ...oncekiDurum, aktifPetId: petId }));
  };

  const gunlukOdulAl = () => {
    const sonuc = gunlukOdulTalepEt(durum, gunAnahtariOlustur());
    if (sonuc.odulAlindiMi) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDurum(sonuc.durum);
      setUyariMesaji(`Gunluk odul: +${sonuc.odul} altin`);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setUyariMesaji('Bugunun odulu alindi.');
  };

  const etkinlikSec = (secenek) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDurum((oncekiDurum) => sansEtkinligiUygula(oncekiDurum, secenek.sonuc));
    setUyariMesaji('Etkinlik tamamlandi!');
    setAktifEtkinlik(null);
  };

  const temaIslemiYap = (temaId) => {
    const sahipMi = (durum.sahipOlunanTemalar ?? []).includes(temaId);
    if (sahipMi) {
      setDurum((onceki) => temaDegistir(onceki, temaId));
      setUyariMesaji('Tema aktif edildi.');
      return;
    }
    const sonuc = temaSatinAl(durum, temaId);
    if (!sonuc.basariliMi) {
      setUyariMesaji(sonuc.mesaj);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setDurum((onceki) => durumHazirla({ ...onceki, ...sonuc.durum }));
    setUyariMesaji(sonuc.mesaj);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const aksesuarIslemiYap = (aksesuarId) => {
    const sahipMi = (durum.sahipOlunanAksesuarlar ?? []).includes(aksesuarId);
    if (sahipMi) {
      setDurum((onceki) => aksesuarDegistir(onceki, aksesuarId));
      setUyariMesaji('Aksesuar aktif edildi.');
      return;
    }
    const sonuc = aksesuarSatinAl(durum, aksesuarId);
    if (!sonuc.basariliMi) {
      setUyariMesaji(sonuc.mesaj);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setDurum((onceki) => durumHazirla({ ...onceki, ...sonuc.durum }));
    setUyariMesaji(sonuc.mesaj);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const sezonOdulAl = (gorevId) => {
    const gorevler = durum.sezonGorevleri ?? [];
    const hedefGorev = gorevler.find((item) => item.id === gorevId);
    if (!hedefGorev || !hedefGorev.tamamlandiMi || hedefGorev.odulAlindiMi) return;
    const guncel = gorevler.map((item) =>
      item.id === gorevId ? { ...item, odulAlindiMi: true } : item
    );
    setDurum((onceki) =>
      durumHazirla({
        ...onceki,
        altin: onceki.altin + (hedefGorev.odulAltin ?? 0),
        xp: onceki.xp + (hedefGorev.odulXp ?? 0),
        sezonGorevleri: guncel,
      })
    );
    setUyariMesaji('Sezon odulu alindi!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const egitimiTamamla = () => {
    setDurum((onceki) => ({ ...onceki, egitimTamamlandiMi: true }));
    setUyariMesaji('Egitim tamamlandi. Hazirsin!');
  };

  const mevcutSeviyeBaslangicXp = (durum.seviye - 1) * 60;
  const sonrakiSeviyeXp = durum.seviye * 60;
  const seviyeIlerlemeYuzdesi =
    ((durum.xp - mevcutSeviyeBaslangicXp) / (sonrakiSeviyeXp - mevcutSeviyeBaslangicXp)) * 100;
  const gorev = durum.gunlukGorev;
  const gorevIlerleme = gorev ? `${gorev.ilerleme} / ${gorev.hedef}` : '-';
  const sonBasarim = sonAcilanBasarimId ? basarimMetaHaritasi[sonAcilanBasarimId] : null;

  if (!depoHazirMi) {
    return (
      <View style={[stiller.disKapsayici, { backgroundColor: '#101B33' }]}>
        <View style={stiller.yuklemeKart}>
          <Text style={stiller.yuklemeBaslik}>{OYUN_MARKASI}</Text>
          <Text style={stiller.yuklemeMetni}>Yukleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[stiller.disKapsayici, { backgroundColor: aktifTema.arkaPlan ?? guncelRuhHali.arkaPlan }]}>
      <View style={stiller.ustBar}>
        <View>
          <Text style={stiller.markaYazisi}>{OYUN_MARKASI}</Text>
          <Text style={stiller.markaAltYazi}>
            {aktifPet.emoji} {aktifPet.ad} • {durum.altin} altin
          </Text>
        </View>
        <View style={stiller.ustAksiyonKolon}>
          <TouchableOpacity style={stiller.yuvarlakMiniButon} onPress={() => setAktifSayfa('profile')}>
            <Text style={stiller.yuvarlakMiniButonYazi}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={stiller.yuvarlakMiniButon} onPress={() => setAktifSayfa('shop')}>
            <Text style={stiller.yuvarlakMiniButonYazi}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {aktifSayfa === 'menu' && (
        <ScrollView contentContainerStyle={stiller.sayfaIcerik}>
          {!durum.egitimTamamlandiMi && (
            <View style={stiller.kart}>
              <Text style={stiller.kartBaslik}>Hizli Egitim</Text>
              <Text style={stiller.kartAciklama}>
                Aksiyon yaparak combo arttir, daha cok XP ve altin kazan. Her 6 turda sans etkinligi gelir.
              </Text>
              <EylemButonu
                yazi="Egitimi Tamamla"
                ikon="✅"
                onPress={egitimiTamamla}
                stiller={stiller}
                tema="vurgu"
                tamGenislik
              />
            </View>
          )}

          <Animated.View style={[stiller.kart, kartAnimasyonStili]}>
            <Text style={stiller.kartBaslik}>Komuta Merkezi</Text>
            <View style={stiller.petSahne}>
              <Animated.Text style={[stiller.petEmoji, petAnimasyonStili]}>{aktifPet.emoji}</Animated.Text>
              {!!aktifAksesuar && <Text style={stiller.aksesuarRozeti}>{aktifAksesuar.emoji}</Text>}
              <View style={[stiller.ifadeRozeti, { borderColor: petIfadesi.renk }]}>
                <Text style={stiller.ifadeRozetiYazi}>{petIfadesi.ikon} {petIfadesi.etiket}</Text>
              </View>
            </View>

            <View style={stiller.menuGrid}>
              <View style={stiller.menuBilgiKart}>
                <Text style={stiller.menuBilgiEtiket}>Seviye</Text>
                <Text style={stiller.menuBilgiDeger}>{durum.seviye}</Text>
              </View>
              <View style={stiller.menuBilgiKart}>
                <Text style={stiller.menuBilgiEtiket}>Streak</Text>
                <Text style={stiller.menuBilgiDeger}>{durum.streak} gun</Text>
              </View>
              <View style={stiller.menuBilgiKart}>
                <Text style={stiller.menuBilgiEtiket}>En Yuksek</Text>
                <Text style={stiller.menuBilgiDeger}>{enYuksekPuan}</Text>
              </View>
              <View style={stiller.menuBilgiKart}>
                <Text style={stiller.menuBilgiEtiket}>Altin</Text>
                <Text style={stiller.menuBilgiDeger}>{durum.altin}</Text>
              </View>
            </View>

            <EylemButonu yazi="Oyuna Gir" ikon="🚀" onPress={() => setAktifSayfa('game')} stiller={stiller} tema="vurgu" tamGenislik />
            <EylemButonu yazi="Gunluk Odul" ikon="🎁" onPress={gunlukOdulAl} stiller={stiller} tema="birincil" tamGenislik />
          </Animated.View>

          <View style={stiller.kart}>
            <Text style={stiller.kartBaslik}>Pet Secimi</Text>
            <View style={stiller.petSecimSatiri}>
              {PETLER.map((pet) => {
                const secili = pet.id === durum.aktifPetId;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => petSec(pet.id)}
                    style={[stiller.petSecimKarti, secili && stiller.petSecimKartiAktif]}
                  >
                    <Text style={stiller.petSecimEmoji}>{pet.emoji}</Text>
                    <Text style={stiller.petSecimAd}>{pet.ad}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <EylemButonu yazi="Yeni Macera" ikon="🔁" onPress={yenidenBasla} stiller={stiller} tema="ikincil" tamGenislik />
          </View>
        </ScrollView>
      )}

      {aktifSayfa === 'game' && (
        <ScrollView contentContainerStyle={stiller.sayfaIcerik}>
          <Animated.View style={[stiller.kart, kartAnimasyonStili]}>
            <View style={stiller.oyunUstSatir}>
              <Text style={stiller.baslik}>Arena</Text>
              <TouchableOpacity style={stiller.kucukMenuButon} onPress={() => setAktifSayfa('menu')}>
                <Text style={stiller.kucukMenuButonYazi}>Ana Menu</Text>
              </TouchableOpacity>
            </View>

            <View style={stiller.petSahne}>
              <Animated.Text style={[stiller.petEmoji, petAnimasyonStili]}>{aktifPet.emoji}</Animated.Text>
              {!!aktifAksesuar && <Text style={stiller.aksesuarRozeti}>{aktifAksesuar.emoji}</Text>}
              <View style={[stiller.ifadeRozeti, { borderColor: petIfadesi.renk }]}>
                <Text style={stiller.ifadeRozetiYazi}>{petIfadesi.ikon} {petIfadesi.etiket}</Text>
              </View>
              <Text style={stiller.mesaj}>{guncelRuhHali.mesaj}</Text>
            </View>

            <StatCubugu etiket="Aclik" deger={durum.aclik} ilerlemeRengi="#FF8A80" arkaPlanRengi="rgba(255,138,128,0.25)" stiller={stiller} />
            <StatCubugu etiket="Mutluluk" deger={durum.mutluluk} ilerlemeRengi="#A5D6A7" arkaPlanRengi="rgba(165,214,167,0.25)" stiller={stiller} />

            <View style={stiller.puanKutusu}>
              <Text style={stiller.puanYazisi}>Puan: {durum.puan}</Text>
              <Text style={stiller.enYuksekPuanYazisi}>En Yuksek: {enYuksekPuan} | Combo x{(1 + (durum.combo ?? 0) * 0.08).toFixed(2)}</Text>
            </View>

            <View style={stiller.seviyeKutusu}>
              <View style={stiller.seviyeUstSatir}>
                <Text style={stiller.seviyeBaslik}>Seviye {durum.seviye}</Text>
                <Text style={stiller.seviyeXpYazisi}>XP {durum.xp} / {sonrakiSeviyeXp}</Text>
              </View>
              <View style={stiller.seviyeCubuguDis}>
                <View style={[stiller.seviyeCubuguIc, { width: `${Math.max(0, Math.min(100, seviyeIlerlemeYuzdesi))}%` }]} />
              </View>
            </View>

            <View style={stiller.gunlukGorevKutusu}>
              <Text style={stiller.gunlukGorevBaslik}>Gunluk Gorev</Text>
              <Text style={stiller.gunlukGorevMetni}>{gorev?.baslik ?? 'Hazirlaniyor...'}</Text>
              <Text style={stiller.gunlukGorevIlerleme}>Ilerleme: {gorevIlerleme}</Text>
              <Text style={stiller.gunlukGorevOdul}>Odul: {gorev?.odulXp ?? 0} XP + {gorev?.odulAltin ?? 0} altin</Text>
            </View>

            {seviyeAtladiMesaji && <View style={stiller.seviyeBildirimKutusu}><Text style={stiller.seviyeBildirimMetni}>{seviyeAtladiMesaji}</Text></View>}
            {sonBasarim && <View style={stiller.basarimBildirimKutusu}><Text style={stiller.basarimBildirimBaslik}>Yeni Basarim</Text><Text style={stiller.basarimBildirimMetni}>{sonBasarim.ad}</Text></View>}

            <View style={stiller.butonSatiri}>
              {Object.entries(EYLEMLER).map(([eylemAdi, eylem]) => (
                <EylemButonu key={eylemAdi} yazi={eylem.etiket} ikon={eylem.ikon} onPress={() => eylemYap(eylemAdi)} stiller={stiller} devreDisi={durum.oyunBittiMi} />
              ))}
            </View>

          </Animated.View>
        </ScrollView>
      )}

      {aktifSayfa === 'profile' && (
        <ScrollView contentContainerStyle={stiller.sayfaIcerik}>
          <View style={stiller.kart}>
            <View style={stiller.oyunUstSatir}>
              <Text style={stiller.kartBaslik}>Hesabim</Text>
              <TouchableOpacity style={stiller.kucukMenuButon} onPress={() => setAktifSayfa('menu')}>
                <Text style={stiller.kucukMenuButonYazi}>Menu</Text>
              </TouchableOpacity>
            </View>
            <Text style={stiller.kartAciklama}>Rozetler, istatistikler ve sezon gorevlerin burada.</Text>

            <View style={stiller.menuGrid}>
              <View style={stiller.menuBilgiKart}><Text style={stiller.menuBilgiEtiket}>Seviye</Text><Text style={stiller.menuBilgiDeger}>{durum.seviye}</Text></View>
              <View style={stiller.menuBilgiKart}><Text style={stiller.menuBilgiEtiket}>Toplam Puan</Text><Text style={stiller.menuBilgiDeger}>{durum.puan}</Text></View>
              <View style={stiller.menuBilgiKart}><Text style={stiller.menuBilgiEtiket}>En Yuksek</Text><Text style={stiller.menuBilgiDeger}>{enYuksekPuan}</Text></View>
              <View style={stiller.menuBilgiKart}><Text style={stiller.menuBilgiEtiket}>Altin</Text><Text style={stiller.menuBilgiDeger}>{durum.altin}</Text></View>
            </View>

            <Text style={stiller.hesapAltBaslik}>Rozet Koleksiyonu</Text>
            <View style={stiller.basarimRozetSatiri}>
              {BASARIMLAR.map((basarim) => {
                const acikMi = durum.acilanBasarimlar.includes(basarim.id);
                return (
                  <View key={basarim.id} style={[stiller.rozet, acikMi ? stiller.rozetAcik : stiller.rozetKilitli]}>
                    <Text style={stiller.rozetYazisi}>{basarim.ad}</Text>
                    <Text style={stiller.rozetAciklama}>{basarim.aciklama}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={stiller.hesapAltBaslik}>Sezon Gorevleri</Text>
            <View style={stiller.sezonGorevListesi}>
              {(durum.sezonGorevleri ?? []).map((gorevItem) => (
                <View key={gorevItem.id} style={stiller.sezonGorevKart}>
                  <Text style={stiller.sezonGorevBaslik}>{gorevItem.baslik}</Text>
                  <Text style={stiller.sezonGorevIlerleme}>{gorevItem.ilerleme}/{gorevItem.hedef}</Text>
                  <Text style={stiller.sezonGorevIlerleme}>Odul: +{gorevItem.odulAltin} altin +{gorevItem.odulXp} XP</Text>
                  <EylemButonu
                    yazi={gorevItem.odulAlindiMi ? 'Odul Alindi' : gorevItem.tamamlandiMi ? 'Odulu Al' : 'Devam Et'}
                    ikon={gorevItem.odulAlindiMi ? '✅' : '🏆'}
                    onPress={() => sezonOdulAl(gorevItem.id)}
                    stiller={stiller}
                    tema={gorevItem.tamamlandiMi && !gorevItem.odulAlindiMi ? 'vurgu' : 'ikincil'}
                    devreDisi={!gorevItem.tamamlandiMi || gorevItem.odulAlindiMi}
                    tamGenislik
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {aktifSayfa === 'shop' && (
        <ScrollView contentContainerStyle={stiller.sayfaIcerik}>
          <View style={stiller.kart}>
            <View style={stiller.oyunUstSatir}>
              <Text style={stiller.kartBaslik}>Magaza</Text>
              <TouchableOpacity style={stiller.kucukMenuButon} onPress={() => setAktifSayfa('menu')}>
                <Text style={stiller.kucukMenuButonYazi}>Menu</Text>
              </TouchableOpacity>
            </View>
            <Text style={stiller.kartAciklama}>Temalar ve aksesuarlarla petini ozellestir.</Text>

            <Text style={stiller.hesapAltBaslik}>Temalar</Text>
            <View style={stiller.magazaListe}>
              {TEMALAR.map((tema) => {
                const sahipMi = (durum.sahipOlunanTemalar ?? []).includes(tema.id);
                const aktifMi = durum.aktifTemaId === tema.id;
                return (
                  <View key={tema.id} style={stiller.magazaKart}>
                    <View style={[stiller.magazaRenkOrnek, { backgroundColor: tema.arkaPlan }]} />
                    <View style={stiller.magazaBilgi}>
                      <Text style={stiller.magazaBaslik}>{tema.ad}</Text>
                      <Text style={stiller.magazaFiyat}>{tema.fiyat === 0 ? 'Baslangic' : `${tema.fiyat} altin`}</Text>
                    </View>
                    <EylemButonu
                      yazi={aktifMi ? 'Aktif' : sahipMi ? 'Kullan' : 'Satin Al'}
                      ikon={aktifMi ? '✨' : sahipMi ? '🎨' : '🪙'}
                      onPress={() => temaIslemiYap(tema.id)}
                      stiller={stiller}
                      tema={aktifMi ? 'ikincil' : 'vurgu'}
                    />
                  </View>
                );
              })}
            </View>

            <Text style={stiller.hesapAltBaslik}>Aksesuarlar</Text>
            <View style={stiller.magazaListe}>
              {AKSESUARLAR.map((aksesuar) => {
                const sahipMi = (durum.sahipOlunanAksesuarlar ?? []).includes(aksesuar.id);
                const aktifMi = durum.aktifAksesuarId === aksesuar.id;
                return (
                  <View key={aksesuar.id} style={stiller.magazaKart}>
                    <Text style={stiller.magazaAksesuarEmoji}>{aksesuar.emoji}</Text>
                    <View style={stiller.magazaBilgi}>
                      <Text style={stiller.magazaBaslik}>{aksesuar.ad}</Text>
                      <Text style={stiller.magazaFiyat}>{aksesuar.fiyat} altin</Text>
                    </View>
                    <EylemButonu
                      yazi={aktifMi ? 'Aktif' : sahipMi ? 'Kullan' : 'Satin Al'}
                      ikon={aktifMi ? '✅' : '🧩'}
                      onPress={() => aksesuarIslemiYap(aksesuar.id)}
                      stiller={stiller}
                      tema={aktifMi ? 'ikincil' : 'birincil'}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {durum.oyunBittiMi && aktifSayfa === 'game' && (
        <View style={stiller.modalKaplama}>
          <View style={stiller.kaybetmeModalKart}>
            <Text style={stiller.kaybetmeBaslik}>Kaybettin!</Text>
            <Text style={stiller.kaybetmeMetin}>
              Petin yoruldu. Hemen tekrar deneyip daha yuksek skor yapabilirsin.
            </Text>
            <View style={stiller.modalButonSatiri}>
              <EylemButonu
                yazi="Tekrar Oyna"
                ikon="🔁"
                onPress={yenidenBasla}
                stiller={stiller}
                tema="vurgu"
                tamGenislik
              />
              <EylemButonu
                yazi="Ana Menu"
                ikon="🏠"
                onPress={() => setAktifSayfa('menu')}
                stiller={stiller}
                tema="ikincil"
                tamGenislik
              />
            </View>
          </View>
        </View>
      )}

      {aktifEtkinlik && !durum.oyunBittiMi && (
        <View style={stiller.modalKaplama}>
          <View style={stiller.modalKart}>
            <Text style={stiller.modalBaslik}>{aktifEtkinlik.baslik}</Text>
            <Text style={stiller.modalMetin}>{aktifEtkinlik.metin}</Text>
            <View style={stiller.modalButonSatiri}>
              {aktifEtkinlik.secenekler.map((secenek) => (
                <TouchableOpacity key={secenek.id} style={stiller.etkinlikSecenekKart} onPress={() => etkinlikSec(secenek)}>
                  <Text style={stiller.etkinlikSecenekBaslik}>{secenek.etiket}</Text>
                  <Text style={stiller.etkinlikSecenekSonuc}>{secenekSonucMetni(secenek.sonuc)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {!!uyariMesaji && (
        <View style={stiller.toastKutusu}>
          <Text style={stiller.toastYazi}>{uyariMesaji}</Text>
        </View>
      )}
    </View>
  );
}
