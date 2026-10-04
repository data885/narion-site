# NARION — info@ kutusu ve form arka ucu

Hedef: sitedeki **üç formun** (ön kayıt, B2B, iletişim) gönderimi
**info@narionhookah.com**'a mail olarak düşsün ve **"NARION — Talepler"**
e-tablosuna satır olarak yazılsın.

> **Durum (05.10.2026):** site tarafı HAZIR ve canlı. Arka uç kurulmadı.
> Uç nokta tanımlı olmadığı için formlar şu an **mailto'ya düşüyor** —
> yanlış "alındı" mesajı vermiyorlar. Aşağıdaki adımlar bitince
> `yayin/assets/form.js` içindeki `UC` değişkenine `/exec` adresi yazılır.

---

## Neden gerekti

Üç form da `onsubmit="event.preventDefault(); …başarı divini göster"` ile
yazılmıştı: ziyaretçi "✓ Başvurunuz Alındı" görüyor, talep **hiçbir yere
gitmiyordu**. Ön kayıt formu üstüne `Math.random()` ile rezervasyon kodu
uyduruyordu. 4 dil × 3 form = 12 canlı formun tamamı böyleydi.

---

## DNS — zaten hazır (Cloudflare, data@almitagroup.com hesabı)

| Tür | Ad | Değer | Durum |
|---|---|---|---|
| MX | `@` | `smtp.google.com` (öncelik 1) | ✅ var |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | ✅ var |
| TXT | `@` | `google-site-verification=…KuchB30uq…` | ✅ var |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; adkim=r; aspf=r` | ✅ var |
| TXT | `google._domainkey` | DKIM anahtarı | ❌ **EKSİK — adım 2** |

---

## 1. Kullanıcıyı aç (admin.google.com, **mursel.alkan@almitagroup.com** ile)

`narionhookah.com` zaten **ikincil alan adı** olarak ekli ve doğrulanmış.

**Dizin → Kullanıcılar → Yeni kullanıcı ekle**
- Birincil e-posta: `info` · alan adı açılırından **narionhookah.com**
- 1 lisans tüketir.

## 2. DKIM (aynı konsol)

**Uygulamalar → Google Workspace → Gmail → E-posta kimlik doğrulama**
1. Alan adı olarak `narionhookah.com` seç
2. **Yeni kayıt oluştur** (2048 bit, seçici `google`)
3. Verdiği TXT'yi Cloudflare'e ekle: ad `google._domainkey`, **DNS only (gri bulut)**
4. DNS yayılınca konsolda **Kimlik doğrulamayı başlat**

Doğrulama: `dig +short TXT google._domainkey.narionhookah.com` dolu dönmeli.

## 3. Apps Script'i kur (**info@narionhookah.com** ile giriş yapılmış tarayıcıda)

1. https://script.google.com → **Yeni proje** → ad: `NARION Formlar`
2. Varsayılan `Code.gs` içeriğini sil, bu klasördeki **`Code.gs`**'i olduğu gibi yapıştır → Kaydet
3. Fonksiyon listesinden **`kurulumTesti`** → **Çalıştır** → izinleri onayla
   (Gmail gönderme + E-Tablo). info@'ya üç TEST maili gelmeli; Drive'da
   "NARION — Talepler" tablosu üç sayfayla oluşmalı.
4. **Dağıt → Yeni dağıtım → Tür: Web uygulaması**
   - Yürüten: **Ben (info@narionhookah.com)**
   - Erişim: **Herkes** ← form anonim POST edecek, şart
5. Çıkan `https://script.google.com/macros/s/…/exec` adresini kopyala.

## 4. Siteye bağla

`/exec` adresini bana ver; `yayin/assets/form.js` içindeki

```js
var UC = '';
```

satırına yazılır, `?v=` artırılır, dört dile basılır ve push edilir.
O andan itibaren formlar gerçekten gönderir; gönderemezse kırmızı uyarı
verip info@ adresine yönlendirir — asla sahte "alındı" göstermez.

---

## Test (yayın sonrası)

1. `narionhookah.com/tr/hakkinda.html` → formu doldur → gönder
2. info@'ya mail düşmeli, "Yanıtla" doğrudan gönderene gitmeli
3. "NARION — Talepler" → **İletişim** sayfasında yeni satır
4. Ön kayıtta ekrandaki **rezervasyon kodu** ile tablodaki **Kod** sütunu aynı olmalı
   (kod artık sunucuda üretiliyor, tarayıcıda değil)

## Spam korumaları (Code.gs içinde)

- Gizli **tuzak alan** (`website`) doluysa sessizce yutulur
- Form 4 saniyeden hızlı gönderildiyse yutulur
- Aynı e-posta/telefondan 10 dakikada en çok 3 gönderim
- Hücreler `= + - @` ile başlıyorsa metne çevrilir (e-tablo formül enjeksiyonu)
