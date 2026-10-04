# -*- coding: utf-8 -*-
"""NARION marka filmi — site hero'su icin sessiz, donguye giren klip.

Kararlar ve nedenleri:
  * Metin yalnizca dilden bagimsiz ifadelerden olusur (model adi, SMART HMD,
    45° BAYONET, alan adi). Boylece TEK film dort dile birden hizmet eder;
    ceviri yuku yok, ve filme dogrulanmamis bir iddia girmiyor.
  * 1280x720: kaynaklarin en darı 1376 px. Bu olcude her plan KUCULEREK
    gelir, hicbir karede buyutme olmaz — yumusama yok.
  * Yakinlastirma en fazla 1.06: 720*1.06 = 763 px, en kisa kaynak 768 px.
  * Tipografi ve logo PNG olarak gomulu. Sebebi: woff2 -> ttf donusumu
    bozuk glif uretti (hepsi .notdef kutusu), bu yuzden metinler sitenin
    kendi fontuyla tarayicida uretilip film/parca/ altina alindi.
    Yeniden uretmek icin: film/kaynak/*.html sayfalarini 800 px genislikte
    acip ekran goruntusunden ayikla.
  * Ses yok: hero videosu sessiz ve otomatik oynar.

Kosum: python3 film/film_yap.py
Cikti: yayin/film/narion.mp4 · narion.webm · narion-poster.jpg
"""
import os, subprocess
import numpy as np
from PIL import Image

KOK   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GORS  = os.path.join(KOK, "yayin", "gorsel")
PARCA = os.path.join(KOK, "film", "parca")
CIKTI = os.path.join(KOK, "yayin", "film")

G, Y, FPS = 1280, 720, 25
ZEMIN = (12, 11, 15)
KREM  = (238, 232, 220)
ALTIN = (198, 164, 94)

GECIS = 0.75
PLAN  = 3.0
ACILIS, KAPANIS = 3.2, 3.4

# (dosya, tur, odak_x, odak_y, zoom_bas, zoom_son, altyazi, parlaklik)
# parlaklik: planlar arasi pozlama farkini kapatmak icin carpan (1.0 = dokunma)
SAHNELER = [
    ("aile-salon.webp",          "yatay", 0.50, 0.40, 1.00, 1.06, None,          1.00),
    ("koza-perspektif-aci.webp", "dikey", 0.50, 0.50, 1.04, 1.00, "narion-koza", 1.00),
    ("bayonet-makro.webp",       "yatay", 0.50, 0.50, 1.06, 1.00, "45-bayonet",  0.74),
    ("baz-istasyonu.jpg",        "yatay", 0.50, 0.50, 1.00, 1.05, "smart-hmd",   0.96),
    ("kutu-luks-sunum.webp",     "yatay", 0.50, 0.50, 1.05, 1.00, None,          1.00),
    ("aile-tas.webp",            "yatay", 0.50, 0.45, 1.00, 1.05, None,          0.94),
    ("lounge-uygulama.jpg",      "yatay", 0.45, 0.45, 1.04, 1.00, None,          1.00),
]


def yumusak(t):
    t = float(np.clip(t, 0, 1))
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ kaynak
def yatay_hazirla(ad, ox, oy, zoom):
    """16:9'a kirpar, en buyuk yakinlastirmanin istedigi olcude tutar."""
    im = Image.open(os.path.join(GORS, ad)).convert("RGB")
    w, h = im.size
    if w / h > G / Y:
        yw = int(h * G / Y); x0 = int((w - yw) * ox)
        im = im.crop((x0, 0, x0 + yw, h))
    else:
        yh = int(w * Y / G); y0 = int((h - yh) * oy)
        im = im.crop((0, y0, w, y0 + yh))
    hedef = (int(G * zoom + .5), int(Y * zoom + .5))
    return im.resize(hedef, Image.LANCZOS)


def dikey_hazirla(ad, zoom):
    """Dikey urun cekimini kirpmak yerine kadraja yerlestirir.

    Duz koyu bir zemine yapistirinca gorselin kendi fonu ile tuval
    arasinda kutu kenari goruluyordu. Onun yerine ayni gorselin
    bulanik-koyu hali arka plani doldurur, keskin urun uzerine
    kenarlari yumusatilarak biner — birlesme yeri kaybolur."""
    from PIL import ImageFilter
    urun = Image.open(os.path.join(GORS, ad)).convert("RGB")
    hb, he = int(Y * zoom + .5), int(G * zoom + .5)

    # arka plan: ayni kareden doldurulmus, agir bulanik, koyultulmus
    ap = urun.copy()
    o = max(he / ap.width, hb / ap.height)
    ap = ap.resize((int(ap.width * o + 1), int(ap.height * o + 1)), Image.LANCZOS)
    x0, y0 = (ap.width - he) // 2, (ap.height - hb) // 2
    ap = ap.crop((x0, y0, x0 + he, y0 + hb)).filter(ImageFilter.GaussianBlur(42))
    ap = Image.fromarray(
        np.clip(np.asarray(ap, np.float32) * 0.34 + np.array(ZEMIN, np.float32) * 0.30,
                0, 255).astype(np.uint8), "RGB")

    # keskin urun, kenarlari yumusatilmis maske ile
    oy = int(hb * 0.96)
    ox = int(urun.width * oy / urun.height)
    urun = urun.resize((ox, oy), Image.LANCZOS)
    maske = Image.new("L", (ox, oy), 255)
    kenar = max(8, ox // 14)
    gr = np.asarray(maske, np.float32)
    ramp = np.linspace(0, 1, kenar) ** 0.8
    gr[:, :kenar] *= ramp; gr[:, -kenar:] *= ramp[::-1]
    gr[:kenar, :] *= ramp[:, None]; gr[-kenar:, :] *= ramp[::-1, None]
    maske = Image.fromarray(gr.astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(kenar / 3))

    ap.paste(urun, ((he - ox) // 2, (hb - oy) // 2), maske)
    return ap


def kare_al(kaynak, zb, zs, t):
    z = zb + (zs - zb) * yumusak(t)
    kw, kh = kaynak.size
    azami = max(zb, zs)
    aw, ah = int(kw * z / azami ** 0 / z * (azami / z) ** 0), 0   # (asagida net)
    aw = int(kw / z * (azami / azami))
    aw = int(G * (azami / z))
    ah = int(Y * (azami / z))
    aw, ah = min(aw, kw), min(ah, kh)
    x0, y0 = (kw - aw) // 2, (kh - ah) // 2
    kirp = kaynak.crop((x0, y0, x0 + aw, y0 + ah))
    return kirp if kirp.size == (G, Y) else kirp.resize((G, Y), Image.LANCZOS)


# --------------------------------------------------------------- kaplamalar
def vinyet_yap():
    yy, xx = np.mgrid[0:Y, 0:G]
    r = np.sqrt(((xx - G/2) / (G/2))**2 + ((yy - Y/2) / (Y/2))**2)
    return np.clip(1 - .36 * np.clip((r - .55) / .85, 0, 1) ** 1.6, 0, 1)[:, :, None].astype(np.float32)

VINYET = vinyet_yap()
_rng = np.random.default_rng(7)
GRAIN = [_rng.normal(0, 2.4, (Y, G, 1)).astype(np.float32) for _ in range(12)]


def kaplama(im, k):
    a = np.asarray(im, np.float32) * VINYET + GRAIN[k % len(GRAIN)]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")


# -------------------------------------------------------------- yazi/logo
def yukle(yol):
    return Image.open(os.path.join(PARCA, yol))

LOGO  = yukle("logo-krem.png")
LOGO_A = yukle("logo-altin.png")
YAZI = {ad: yukle(f"metin/{ad}.png") for ad in
        ("narion-koza", "45-bayonet", "smart-hmd", "haute", "adres", "istanbul")}


def boya(maske, renk, alfa):
    o = Image.new("RGBA", maske.size, renk + (0,))
    o.putalpha(maske.getchannel("A").point(lambda v: v * alfa // 255))
    return o


def bas(im, parca, xy):
    kat = Image.new("RGBA", (G, Y), (0, 0, 0, 0))
    kat.paste(parca, xy, parca)
    return Image.alpha_composite(im.convert("RGBA"), kat).convert("RGB")


def olcek(im, en):
    return im.resize((en, max(1, int(im.height * en / im.width))), Image.LANCZOS)


# ------------------------------------------------------------------ kartlar
def acilis_kare(t):
    im = Image.new("RGB", (G, Y), ZEMIN)
    a1 = int(255 * yumusak((t - .10) / .55))
    if a1 > 0:
        lg = olcek(LOGO, int(520 * (1 + .03 * (1 - yumusak((t - .10) / .55)))))
        im = bas(im, boya(lg, KREM, a1), ((G - lg.width)//2, (Y - lg.height)//2 - 22))
    a2 = int(205 * yumusak((t - .42) / .45))
    if a2 > 0:
        s = olcek(YAZI["haute"], 236)
        im = bas(im, boya(s, ALTIN, a2), ((G - s.width)//2, Y//2 + 34))
    return im


def kapanis_kare(t):
    im = Image.new("RGB", (G, Y), ZEMIN)
    a1 = int(255 * yumusak(t / .32))
    lg = olcek(LOGO_A, 470)
    im = bas(im, boya(lg, ALTIN, a1), ((G - lg.width)//2, (Y - lg.height)//2 - 30))
    a2 = int(230 * yumusak((t - .26) / .40))
    if a2 > 0:
        s = olcek(YAZI["adres"], 206)
        im = bas(im, boya(s, KREM, a2), ((G - s.width)//2, Y//2 + 28))
        s2 = olcek(YAZI["istanbul"], 112)
        im = bas(im, boya(s2, (168, 162, 152), int(a2 * .9)), ((G - s2.width)//2, Y//2 + 66))
    return im


_perde_h = int(Y * 0.30)
_PERDE = (np.linspace(0, 1, _perde_h) ** 1.7)[:, None, None].astype(np.float32)


def altyazi(im, ad, alfa):
    """Altyazi + altina yumusak karartma perdesi.

    Perde sart: bayonet makrosu gibi parlak plakalarda krem yazi
    zemine karisiyordu. Perde yalnizca yazi gorunurken ve onun
    siddetiyle orantili olarak gelir, kesilme hissi vermez."""
    if not ad or alfa <= 0:
        return im
    a = np.asarray(im, np.float32)
    a[Y - _perde_h:] *= (1.0 - 0.60 * _PERDE * (alfa / 255.0))
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")

    from PIL import ImageDraw, ImageFilter
    s = olcek(YAZI[ad], int(YAZI[ad].width * 0.86))
    x, y = 68, Y - 84
    kat = Image.new("RGBA", (G, Y), (0, 0, 0, 0))

    # Yazinin kendi golgesi: perde tek basina yetmiyordu, bayonet
    # makrosunda parlak metal krem harfleri yutuyordu. Golge her
    # zemin uzerinde okunurlugu garantiye alir.
    golge = Image.new("RGBA", (G, Y), (0, 0, 0, 0))
    gm = boya(s, (0, 0, 0), int(alfa * 0.85))
    for dx, dy in ((0, 2), (2, 0), (-2, 0), (0, -2), (0, 0)):
        golge.paste(gm, (x + 44 + dx, y + dy), gm)
    golge = golge.filter(ImageFilter.GaussianBlur(4))
    kat = Image.alpha_composite(kat, golge)

    ImageDraw.Draw(kat).rectangle([x, y + 8, x + 28, y + 9], fill=ALTIN + (alfa,))
    yz = boya(s, KREM, alfa)
    kat.paste(yz, (x + 44, y), yz)
    return Image.alpha_composite(im.convert("RGBA"), kat).convert("RGB")


# ------------------------------------------------------------------- kurgu
def main():
    os.makedirs(CIKTI, exist_ok=True)
    t = 0.0
    parcalar = [(t, t + ACILIS, "acilis", None)]
    t += ACILIS - GECIS
    for s in SAHNELER:
        parcalar.append((t, t + PLAN, "plan", s))
        t += PLAN - GECIS
    parcalar.append((t, t + KAPANIS, "kapanis", None))
    toplam = t + KAPANIS

    kaynak = {}
    for ad, tur, ox, oy, zb, zs, _, parlak in SAHNELER:
        z = max(zb, zs)
        im0 = dikey_hazirla(ad, z) if tur == "dikey" else yatay_hazirla(ad, ox, oy, z)
        if parlak != 1.0:
            im0 = Image.fromarray(
                np.clip(np.asarray(im0, np.float32) * parlak, 0, 255).astype(np.uint8), "RGB")
        kaynak[ad] = im0
        print(f"  {ad:<28} {kaynak[ad].size}")
    print(f"  sure {toplam:.1f} sn · {int(toplam*FPS)} kare · {G}x{Y}@{FPS}")

    def karesi(p, zaman):
        bas_, bit, tur, veri = p
        tt = (zaman - bas_) / (bit - bas_)
        if tur == "acilis":  return acilis_kare(tt)
        if tur == "kapanis": return kapanis_kare(tt)
        ad, _, _, _, zb, zs, alt, _ = veri
        im = kare_al(kaynak[ad], zb, zs, tt)
        ag = np.clip((zaman - bas_ - GECIS) / .5, 0, 1) * np.clip((bit - GECIS*.5 - zaman) / .5, 0, 1)
        return altyazi(im, alt, int(235 * yumusak(ag)))

    mp4 = os.path.join(CIKTI, "narion.mp4")
    pr = subprocess.Popen(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{G}x{Y}", "-r", str(FPS), "-i", "-",
         "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "24",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-g", str(FPS*2), mp4],
        stdin=subprocess.PIPE)

    n = int(toplam * FPS)
    for k in range(n):
        z = k / FPS
        etkin = [p for p in parcalar if p[0] <= z < p[1]]
        if not etkin:
            kare = Image.new("RGB", (G, Y), ZEMIN)
        elif len(etkin) == 1:
            kare = karesi(etkin[0], z)
        else:
            a, b = etkin[0], etkin[1]
            kare = Image.blend(karesi(a, z), karesi(b, z), yumusak((z - b[0]) / GECIS))
        pr.stdin.write(kaplama(kare, k).tobytes())
        if k % 100 == 0: print(f"    {k}/{n}")
    pr.stdin.close(); pr.wait()
    print(f"  MP4  {os.path.getsize(mp4)//1024} KB")

    webm = os.path.join(CIKTI, "narion.webm")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", mp4,
                    "-an", "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
                    "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm], check=True)
    print(f"  WebM {os.path.getsize(webm)//1024} KB")

    # Poster acilis kartindan DEGIL, ilk planin ortasindan alinir:
    # acilis karti neredeyse siyah oldugu icin otomatik oynatma
    # engellenirse ziyaretci bos bir dikdortgen goruyordu.
    poster = os.path.join(CIKTI, "narion-poster.jpg")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-ss", "4.0", "-i", mp4, "-frames:v", "1",
                    "-q:v", "3", poster], check=True)
    print(f"  poster {os.path.getsize(poster)//1024} KB")


if __name__ == "__main__":
    main()
