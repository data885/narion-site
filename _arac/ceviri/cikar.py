# -*- coding: utf-8 -*-
"""TR v3 sayfalarindaki cevrilebilir metinleri cikarir / geri yazar.

Mantik: HTML yapisi uc dilde AYNI kalir, yalniz metin dugumleri ve
belirli ozellikler (meta content, alt, title, aria-label) degisir.
Boylece tasarim tek yerde (tr/) bakimi yapilir, diller ondan uretilir.

Cevrilmeyecekler: script/style icerigi, sinif/stil degerleri, URL'ler,
sayi+birim kaliplari (52 cm, 3.8 kg, 0 ppm), marka adlari.
"""
import re, json, os, glob

ATIF = re.compile(r'(content|alt|title|aria-label|placeholder)="([^"]*)"')
DUGUM = re.compile(r'>([^<>]+)<')
BLOK = re.compile(r'<(script|style)\b.*?</\1>|<!--.*?-->', re.S)

# cevrilmeyecek kaliplar
ATLA = [
    re.compile(r'^[\s\W\d]*$'),                      # sadece noktalama/sayi
    re.compile(r'^(width=|https?:|\.\.?/|#|mailto:)'),
    re.compile(r'^[\d.,]+\s*(cm|mm|kg|g|ppm|°C|dk|V|W|%|/|x)?$', re.I),
    re.compile(r'^(NARION|ALMITA GROUP|Eastman Tritan™|Smart HMD|HaaS|PVD|MCH|PID|CNC)$'),
]
def cevrilir(t):
    t = t.strip()
    if len(t) < 2: return False
    return not any(p.match(t) for p in ATLA)


def maskele(s):
    """script/style/yorum bloklarini gecici olarak cikar."""
    saklanan = []
    def tut(m):
        saklanan.append(m.group(0)); return f"\x00{len(saklanan)-1}\x00"
    return BLOK.sub(tut, s), saklanan

def geriyaz(s, saklanan):
    return re.sub(r'\x00(\d+)\x00', lambda m: saklanan[int(m.group(1))], s)


def metinleri_bul(yol):
    s = open(yol, encoding="utf-8").read()
    s, _ = maskele(s)
    bulunan = []
    for m in DUGUM.finditer(s):
        t = " ".join(m.group(1).split())
        if cevrilir(t): bulunan.append(t)
    for m in ATIF.finditer(s):
        t = " ".join(m.group(2).split())
        if cevrilir(t): bulunan.append(t)
    return bulunan


def uygula(kaynak_yol, hedef_yol, sozluk, dil, yon="ltr"):
    """TR sayfasini sozlukle cevirip hedef dile yazar."""
    s = open(kaynak_yol, encoding="utf-8").read()
    s, saklanan = maskele(s)

    def cev(t):
        a = " ".join(t.split())
        return sozluk.get(a, t)

    def dugum(m):
        ic = m.group(1)
        a = " ".join(ic.split())
        if not cevrilir(a): return m.group(0)
        yeni = sozluk.get(a)
        return f">{yeni}<" if yeni else m.group(0)
    s = DUGUM.sub(dugum, s)

    def atif(m):
        ad, deger = m.group(1), m.group(2)
        a = " ".join(deger.split())
        if not cevrilir(a): return m.group(0)
        yeni = sozluk.get(a)
        return f'{ad}="{yeni}"' if yeni else m.group(0)
    s = ATIF.sub(atif, s)

    s = geriyaz(s, saklanan)
    s = re.sub(r'<html lang="[a-z]+" dir="[a-z]+">', f'<html lang="{dil}" dir="{yon}">', s)
    # dil secicide "simdiki dil" isaretini tasi
    s = re.sub(r'(<a href="[^"]*" hreflang="tr" lang="tr")[^>]*>', r'\1>', s)
    s = re.sub(rf'(<a href="[^"]*" hreflang="{dil}" lang="{dil}")>',
               r'\1 class="on" aria-current="true">', s)
    os.makedirs(os.path.dirname(hedef_yol), exist_ok=True)
    open(hedef_yol, "w", encoding="utf-8").write(s)
