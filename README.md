# PetNova

PetNova, React Native + Expo ile gelistirilmis oyunlastirilmis bir dijital evcil hayvan oyunudur. Amaç, oyuncunun petinin ihtiyaçlarini dengede tutarken görevleri tamamlamasi, seviye atlamasi ve koleksiyonunu gelistirmesidir.

## Projenin Amaci

Kisa sureli ama tekrar oynanabilir bir mobil deneyim sunmak:

- Petin aclik/mutluluk dengesini yonetme
- Aksiyonlarla ilerleme (Besle, Oyna, Sev)
- Odul ekonomisi ile uzun sureli baglilik saglama

## Oyunlastirma Ozellikleri

- XP ve seviye sistemi
- Basarimlar ve rozet koleksiyonu
- Gunluk gorevler ve streak sistemi
- Sezon gorevleri ve odul toplama
- Altin ekonomisi (tema/aksesuar magazasi)
- Sans etkinlikleri (secime dayali mini olaylar)
- Haptic geri bildirim ve oyun ici popup bildirimleri

## Kurulum ve Calistirma (Installation & Run)

### Gereksinimler

- Node.js (LTS onerilir)
- npm
- Expo Go (Android/iOS)

### 1) Projeyi klonla

```bash
git clone <REPO_URL>
cd <REPO_KLASOR_ADI>
```

### 2) Bagimliliklari yukle

```bash
npm install
```

### 3) Uygulamayi baslat

```bash
npx expo start
```

Terminalde cikan QR kodu Expo Go ile okut ve uygulamayi cihazda test et.

## APK (Direkt Kurulum)

Bu repo icinde APK dosyasi bulunur:

- `./PetNova.apk`

Dosyayi indirip Android cihaza kurarak uygulamayi dogrudan deneyebilirsin.

## Oynanis Videosu

Repo icinde oynanis videosu:

- `./Ekran Videosu.mp4`

## 1 Dakikalik YouTube Tanitim Videosu

- YouTube (Unlisted): `https://youtube.com/shorts/cQIzOAcS04o?feature=share`

## Kullanilan Teknolojiler

- React Native
- Expo
- AsyncStorage
- Expo Haptics

## Not

Play Store dagitimi icin `aab`, cihazda hizli test ve dagitim icin `apk` build alinabilir.
