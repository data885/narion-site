# Yapım araçları (site içeriği değildir)

Bu klasör yayımlanan siteyi **üreten** araçların yedeğidir. Burada
çalıştırılmazlar — çalışma yerleri `yayin/` ile aynı seviyededir:

```
narion/
├── ceviri/     <- bu klasördeki ceviri/ ile aynı
├── film/       <- bu klasördeki film/ ile aynı
└── yayin/      <- git deposu, yayımlanan site
    └── _arac/  <- bu yedek
```

Araçlar `yayin/` dışında durduğu için GitHub'a gitmiyordu; makine
kaybolursa dil altyapısı tümüyle kaybolurdu. Bu yüzden kaynakları
buraya kopyalıyoruz.

## ceviri/ — çok dilli üretim

Tasarım tek yerde durur: `yayin/tr/`. Diğer diller ondan üretilir.

| dosya | işi |
|---|---|
| `cikar.py` | HTML'den çevrilebilir metinleri çıkarır / geri yazar |
| `kalip.py` | 17 model sayfasında tekrar eden cümle kalıpları (10 kural ≈ 136 metin) |
| `uret.py`  | üretici — `python3 ceviri/uret.py [en ru ar]` |
| `<dil>/*.json` | metin sözlükleri; `js.json` yalnız `<script>` içinde uygulanır |

Kural: **`yayin/en|ar|ru/` altındaki dosyalar elle düzenlenmez.** Değişiklik
`yayin/tr/` kaynağına veya sözlüğe yapılır, sonra `uret.py` koşturulur.

## film/ — marka filmi

`python3 film/film_yap.py` → `yayin/film/narion.{mp4,webm}` + poster.

Tipografi ve logo PNG olarak `parca/` altında gömülüdür. Sebebi:
`woff2 → ttf` dönüşümü bozuk glif üretti (hepsi .notdef kutusu çiziyordu).
Metinler bunun yerine `film/kaynak/_film-*.html` sayfaları 800 px
genişlikte tarayıcıda açılıp ekran görüntüsünden ayıklandı. Yeni bir
yazı gerekirse aynı yol izlenir.
