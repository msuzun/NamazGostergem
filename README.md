# NamazGöstergem

Namaz sırasında rükû / secde / kıyam hareketlerini algılayarak hangi rekatta olduğunu hatırlatmayı amaçlayan deneysel bir React Native / Expo uygulaması.

> **Uyarı:** Bu uygulama **yardımcı** bir araçtır. Fıkhî açıdan tek kaynak veya garanti olarak kullanılmamalıdır.

---

## Özellikler

- **Namaz seçimi:** Sabah, Öğle, İkindi, Akşam, Yatsı, Teravih
- **Her namaz için:**
  - Rekat sayısı ayarı
  - [0/1] pattern dizisi (`0 = Otur`, `1 = Kalk`)
- **Oturum ekranı:**
  - Ekranı karartma, wakelock (ekranın kapanmasını engelleme)
  - Accelerometer ile hareket algılama (~50 Hz)
  - Rakat state machine (Ayakta → Rükû → Secde 1 → Oturuş → Secde 2 → Kalkış)
  - SAJDAH_2 → RISING anında pattern'e göre titreşim
- **Ayarlar:**
  - Eşik değerleri (açı & debounce süreleri) düzenleme
  - Kalibrasyon sihirbazı (ayakta / rükû / secde ölçümü)
- **Hata ayıklama araçları:**
  - Canlı sensör değerleri
  - Rakat state machine logları
  - Tekrar / Simülasyon modu (kayıtlı JSON verisi ile test)

---

## Kurulum

### Gereksinimler

- **Node.js** 18+ önerilir
- **npm** veya **yarn**
- **Expo CLI** (proje içinde `npx expo` kullanılır, global kurulum opsiyonel):
  ```bash
  npm install -g expo-cli
  ```

### Projeyi çalıştırma

```bash
# Bağımlılıkları yükle
npm install
# veya
yarn

# Geliştirme sunucusunu başlat
npx expo start
```

Ardından:

- **Android emülatör:** `a` tuşu
- **iOS simülatör (macOS):** `i` tuşu
- **Fiziksel cihaz:** Expo Go uygulamasını indirip terminaldeki QR kodu okutarak bağlan

---

## İzinler ve platform notları

### Sensör (hareket) izinleri

**iOS:**

- `NSMotionUsageDescription` açıklaması `app.json` içinde tanımlıdır:  
  *"Namaz rekatlarını algılamak için hareket sensörü kullanılır."*
- Uygulama ilk açıldığında veya oturum başlarken hareket sensörüne erişim izni isteyebilir.
- İzin verilmezse oturum ekranında “Hareket sensörü izni gerekli” overlay’i gösterilir; “İzni İste”, “Sensörsüz devam et” veya “Ana sayfaya dön” seçenekleri sunulur.

**Android:**

- Hareket sensörleri genelde ek bir izin gerektirmez; ancak `WAKE_LOCK`, `VIBRATE` gibi izinler `app.json` içinde tanımlanmıştır.

### Android DND (Rahatsız Etmeyin) davranışı

Expo managed workflow sebebiyle uygulama Android DND modunu **otomatik açıp kapatamaz**.

- Oturum başında bir bilgilendirme modalı gösterilir.
- “Android DND Ayarlarını Aç” butonu ile sistem ayarlarına yönlendirilirsin.
- **Öneri:** Namaza başlamadan önce cihazını sessize alman veya DND kullanman.

### iOS DND sınırlaması

iOS’ta DND (Rahatsız Etmeyin) modu uygulama tarafından programatik olarak **değiştirilemez**.

- Uygulama yalnızca Ayarlar ekranına yönlendirebilir.
- Kullanıcı DND’yi kendisi açmalıdır.

---

## Build / çıktı alma

### Geliştirme

Zaten `npx expo start` ile çalışıyor. Emülatör/simülatör veya Expo Go ile test edebilirsin.

### EAS Build (opsiyonel)

App Store / Play Store için paketlemek istersen:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android
eas build -p ios
```

EAS hesabı ve sertifika yönetimi gerekir; [Expo dokümantasyonuna](https://docs.expo.dev/build/introduction/) bakabilirsin.

---

## Tekrar / Simülasyon modu

- **Hata ayıklama ekranına git:** Ana sayfa üst barından **[Hata Ayık.]** butonu.
- **“Tekrar / Simülasyon”** butonuna tıkla.
- İçeride örnek bir JSON (ör. `sample_salah_1.json`) ile:
  - Kayıtlı ivme verisine karşı state machine çalıştırılır.
  - Kaç rekat algılandığı ve durum zaman çizelgesi gösterilir.
- Bu özellik algoritma ayarı ve hata ayıklama içindir.

---

## Kalibrasyon sihirbazı

**Ayarlar → Kalibrasyon Sihirbazı** yolunu izle.

1. **Adım 1:** Ayakta 3 sn dur.
2. **Adım 2:** Rükû yap (2 sn).
3. **Adım 3:** Secde yap (2 sn).

Uygulama pitch açılarını ölçer, ayakta / rükû / secde için ortalama açıları hesaplar ve bu verilere göre **önerilen eşik değerlerini** sunar.  
“Önerilen Değerleri Uygula” dersen eşikler AsyncStorage’a kaydedilir ve yeni oturumlarda bu değerler kullanılır.

---

## Hata yönetimi

- **Global hata sınırı (Error Boundary):** Herhangi bir ekranda beklenmeyen bir runtime hatası olursa, Türkçe bir hata mesajı ve **“Yeniden Dene”** butonu gösterilir; buton hata ekranını kapatıp uygulamayı tekrar dener.
- **Sensör hataları:** İvmeölçer başlatılamazsa veya izin verilmezse oturum ekranında Türkçe uyarı gösterilir; uygulama sensörsüz (sadece görsel sayaç) modda devam edebilir.

---

## Bilinen sınırlamalar

- **Fıkhî garanti yok:** Hareket algılama tamamen fiziksel konuma ve cihaz tutuşuna bağlıdır. Uygulama sadece yardımcı bilgi verir; hatalı algılayabilir.
- **DND otomasyonu sınırlı:**
  - **Android:** Sadece ayarlara yönlendirme.
  - **iOS:** Tamamen manuel; sadece Ayarlar’a kısayol.
- **Sensör hassasiyeti:** Farklı cihazlar, farklı sensör kalitesi. Çok gürültülü veri alıyorsan Ayarlar ekranından debounce ve açı eşiklerini artırmayı deneyebilirsin.
- **Expo managed workflow** nedeniyle tam native DND kontrolü yoktur.

---

## Katkı

Bu proje kişisel kullanım ve deneysel geliştirme içindir.  
Pull request / issue açmadan önce lütfen README’deki sınırlamaları göz önünde bulundur.
