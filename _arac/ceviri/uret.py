# -*- coding: utf-8 -*-
"""tr/ sayfalarindan en/, ar/, ru/ sayfalarini uretir.

Tasarim tek yerde durur (yayin/tr/). Diller ondan uretilir:
metin dugumleri ve ceviriye acik ozellikler sozlukten cevrilir,
HTML yapisi hic degismez. Sozlugu olmayan dil atlanir — yani
bu betik AR/RU sozlugu eklendiginde yeniden kosulup onlari da uretir.

Kosum:  python3 ceviri/uret.py          (sozlugu olan tum diller)
        python3 ceviri/uret.py en       (yalniz en)
"""
import os, re, sys, json, glob, shutil

KOK   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
YAYIN = os.path.join(KOK, "yayin")
CEV   = os.path.join(KOK, "ceviri")
ALAN  = "https://narionhookah.com"

sys.path.insert(0, CEV)
import kalip
from cikar import maskele, geriyaz, DUGUM, ATIF, cevrilir

DILLER = {"tr": "ltr", "en": "ltr", "ar": "rtl", "ru": "ltr"}
AD     = {"tr": "TR", "en": "EN", "ar": "AR", "ru": "RU"}


def sozluk_yukle(dil):
    """(metin sozlugu, js sozlugu) — js.json yalniz <script> icinde uygulanir."""
    d, js = {}, {}
    for f in sorted(glob.glob(os.path.join(CEV, dil, "*.json"))):
        icerik = json.load(open(f, encoding="utf-8"))
        (js if os.path.basename(f) == "js.json" else d).update(icerik)
    return d, js


SCRIPT = re.compile(r"(<script\b[^>]*>)(.*?)(</script>)", re.S)


def js_cevir(s, js):
    """Script govdelerindeki tirnakli metin degerlerini cevirir.

    Yalniz tam eslesen literal degistirilir; degisken, secici ve yol
    adlarina dokunulmaz."""
    if not js:
        return s

    def blok(m):
        govde = m.group(2)
        for a, b in sorted(js.items(), key=lambda x: -len(x[0])):
            for t in ("'", '"'):
                if t in a or t in b:
                    continue
                govde = govde.replace(f"{t}{a}{t}", f"{t}{b}{t}")
        return m.group(1) + govde + m.group(3)

    return SCRIPT.sub(blok, s)


def dil_secici(sayfa, dil, mevcut):
    """Her dil icin AYNI sayfaya baglanir; o dilde sayfa yoksa index'e duser."""
    p = []
    for d in ("tr", "en", "ar", "ru"):
        hedef = sayfa if sayfa in mevcut.get(d, ()) else "index.html"
        yol = hedef if d == dil else f"../{d}/{hedef}"
        simdi = ' class="on" aria-current="true"' if d == dil else ""
        p.append(f'<a href="{yol}" hreflang="{d}" lang="{d}"{simdi}>{AD[d]}</a>')
    return ('<div class="langs" role="navigation" aria-label="Dil">'
            + "".join(p) + "</div>")


def kafa_baglantilari(sayfa, dil, mevcut):
    """canonical + hreflang kumesi. Yalniz uretilmis dilleri bildirir."""
    s = [f'<link rel="canonical" href="{ALAN}/{dil}/{sayfa}">']
    for d in ("tr", "en", "ar", "ru"):
        if sayfa in mevcut.get(d, ()):
            s.append(f'<link rel="alternate" hreflang="{d}" href="{ALAN}/{d}/{sayfa}">')
    s.append(f'<link rel="alternate" hreflang="x-default" href="{ALAN}/tr/{sayfa}">')
    return "\n".join(s)


def cevir(s, sz, dil):
    s, saklanan = maskele(s)

    YUZDE = re.compile(r"^%(\d+(?:[.,]\d+)?)$")
    rtl = DILLER[dil] == "rtl"

    def dugum(m):
        a = " ".join(m.group(1).split())
        # Turkce yuzdeyi onde yazar (%91); diger dillerde sayidan sonra gelir.
        y = YUZDE.match(a)
        if y:
            return f">{y.group(1)}%<"
        # Saga yazilan dilde "ileri" oku ters yone bakar.
        if rtl and a in ("&rarr;", "→"):
            return ">&larr;<"
        if not cevrilir(a):
            return m.group(0)
        yeni = sz.get(a) or kalip.uygula(a, dil)
        return f">{yeni}<" if yeni else m.group(0)

    def atif(m):
        ad, deger = m.group(1), m.group(2)
        a = " ".join(deger.split())
        if not cevrilir(a):
            return m.group(0)
        yeni = sz.get(a) or kalip.uygula(a, dil)
        if not yeni or '"' in yeni:
            return m.group(0)
        return f'{ad}="{yeni}"'

    s = DUGUM.sub(dugum, s)
    s = ATIF.sub(atif, s)
    return geriyaz(s, saklanan)


def sayfa_uret(sayfa, dil, sz, js, mevcut):
    s = open(os.path.join(YAYIN, "tr", sayfa), encoding="utf-8").read()
    s = cevir(s, sz, dil)
    s = js_cevir(s, js)

    # yonlendirme stub'inin govdesindeki mutlak baglanti — hreflang eklenmeden ONCE
    # yapilmali, yoksa asagida yazilan hreflang="tr" adresi de bozulur.
    s = s.replace(f"{ALAN}/tr/", f"{ALAN}/{dil}/")

    # html etiketi
    s = re.sub(r'<html lang="[a-z-]+"(?: dir="[a-z]+")?>',
               f'<html lang="{dil}" dir="{DILLER[dil]}">', s, count=1)

    # dil secici
    s = re.sub(r'<div class="langs".*?</div>', dil_secici(sayfa, dil, mevcut), s,
               flags=re.S)

    # canonical + hreflang: varsa degistir, yoksa </head> oncesine ekle
    s = re.sub(r'\n?<link rel="canonical"[^>]*>', "", s)
    s = re.sub(r'\n?<link rel="alternate" hreflang="[^"]*"[^>]*>', "", s)
    s = s.replace("</head>", kafa_baglantilari(sayfa, dil, mevcut) + "\n</head>", 1)

    hedef = os.path.join(YAYIN, dil, sayfa)
    os.makedirs(os.path.dirname(hedef), exist_ok=True)
    open(hedef, "w", encoding="utf-8").write(s)


def main():
    istenen = sys.argv[1:] or [d for d in ("en", "ar", "ru")
                               if glob.glob(os.path.join(CEV, d, "*.json"))]
    sayfalar = sorted(os.path.basename(p) for p in
                      glob.glob(os.path.join(YAYIN, "tr", "*.html")))
    # hangi dilde hangi sayfa olacak — hreflang ve dil secici icin
    mevcut = {"tr": set(sayfalar)}
    for d in istenen:
        mevcut[d] = set(sayfalar)

    for dil in istenen:
        sz, js = sozluk_yukle(dil)
        if not sz:
            print(f"  {dil}: sozluk yok, atlandi"); continue
        for sayfa in sayfalar:
            sayfa_uret(sayfa, dil, sz, js, mevcut)
        print(f"  {dil}: {len(sayfalar)} sayfa uretildi ({len(sz)} metin + {len(js)} js kaydi)")

    # TR sayfalarinin dil secici ve hreflang'ini da ayni mantikla yenile
    for sayfa in sayfalar:
        p = os.path.join(YAYIN, "tr", sayfa)
        s = open(p, encoding="utf-8").read()
        s = re.sub(r'<div class="langs".*?</div>', dil_secici(sayfa, "tr", mevcut), s,
                   flags=re.S)
        s = re.sub(r'\n?<link rel="canonical"[^>]*>', "", s)
        s = re.sub(r'\n?<link rel="alternate" hreflang="[^"]*"[^>]*>', "", s)
        s = s.replace("</head>", kafa_baglantilari(sayfa, "tr", mevcut) + "\n</head>", 1)
        open(p, "w", encoding="utf-8").write(s)
    print(f"  tr: {len(sayfalar)} sayfa (dil secici + hreflang yenilendi)")


if __name__ == "__main__":
    main()
