# NARION — info@ kutusu ve form arka ucu

Hedef: sitedeki **üç formun** (ön kayıt, B2B, iletişim) gönderimi
**info@narionhookah.com**'a mail olarak düşsün ve **"NARION — Talepler"**
e-tablosuna satır olarak yazılsın.

> **Durum (05.10.2026): KURULUM TAMAM.** Üç adım da bitti — DKIM doğrulandı,
> `info@narionhookah.com` açıldı, Apps Script dağıtıldı ve `UC` siteye yazıldı.
>
> | ne | değer |
> |---|---|
> | Apps Script projesi | **NARION Formlar** (info@narionhookah.com hesabında) |
> | dağıtım | web uygulaması, "Site formlari v1", çalıştıran: info@, erişim: **Herkes** |
> | `/exec` | `https://script.google.com/macros/s/AKfycbxorhyQVZvEZC7KFM-NIzekI1XDqCVw_RcjohQP1xwC84itMyVlBY7Vze3Oe-VLgd0Q4g/exec` |
> | tablo | **NARION — Talepler** — `1TPos38mEjx1eT827eQlfjRRE5N91E4NsWA-0OBqQk80` |
> | siteye yazıldı | `yayin/assets/form.js` → `UC`, etiketler `form.js?v=2` |
>
> **Uç noktayı değiştirirken:** `Code.gs`'i düzenledikten sonra **Dağıt → Dağıtımları
> yönet → kalem → Sürüm: Yeni sürüm** ile güncelleyin. "Yeni dağıtım" açarsanız
> `/exec` adresi değişir ve sitedeki `UC` bayatlar.

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
| TXT | `google._domainkey` | DKIM anahtarı (2048 bit, seçici `google`) | ✅ **eklendi 05.10.2026** |

---

## 1. Kullanıcıyı aç (admin.google.com, **mursel.alkan@almitagroup.com** ile)

`narionhookah.com` zaten **ikincil alan adı** olarak ekli ve doğrulanmış.

**Dizin → Kullanıcılar → Yeni kullanıcı ekle**
- Birincil e-posta: `info` · alan adı açılırından **narionhookah.com**
- 1 lisans tüketir.

## 2. DKIM (aynı konsol) — ✅ TAMAMLANDI 05.10.2026

> Konsol durumu: **"DKIM ile e-postanın kimliği doğrulanıyor"**.
> Anahtar `dkim-narionhookah.txt` dosyasında; DNS'teki değerle byte-byte aynı
> (`dig +short TXT google._domainkey.narionhookah.com` → `…PjG0KXSQIDAQAB`).
> Aşağıdaki adımlar kayıt amaçlı duruyor, tekrar yapılmayacak.

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


---

## Doğrulama (05.10.2026)

Dağıtımdan sonra uç nokta beş senaryoyla sınandı:

| senaryo | beklenen | sonuç |
|---|---|---|
| geçerli ön kayıt | `ok:true` + sunucu kodu | `NAR-2026-B1-1003` ✅ |
| tuzak alan (`website`) dolu | sessiz `ok:true`, **kayıt yok** | tabloda satır oluşmadı ✅ |
| `sure < 4` | sessiz `ok:true`, **kayıt yok** | tabloda satır oluşmadı ✅ |
| bilinmeyen `tur` | `ok:false, neden:"tur"` | ✅ |
| geçersiz e-posta | `ok:false, neden:"eksik"` | ✅ |

Ardından yerelde (`localhost:8101`) gerçek gönderim yapıldı:
- `tr/on-kayit.html` → başarı paneli **sunucunun ürettiği** `NAR-2026-B1-1004` kodunu gösterdi
- `en/b2b-kurumsal.html` → tabloya "İngilizce" dilinde satır düştü

**Yolda bulunan ayrı hata:** ön kayıt sayfaları `assets/form.js`'i hiç yüklemiyordu
(form `data-narion` taşıyor ama script etiketi yoktu). Yani ön kayıt formu
tarayıcıda native submit yapıyor, sayfayı yeniliyor ve talebi kaybediyordu.
Beş `on-kayit.html` dosyasına da script etiketi eklendi.

Tabloda kalan test satırları ("TEST —", "CURL TEST", "YEREL TEST", "EN B2B TEST")
silinebilir; kasıtlı olarak bırakıldı.
