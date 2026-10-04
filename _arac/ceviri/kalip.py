# -*- coding: utf-8 -*-
"""Model sayfalarindaki tekrar eden cumleler icin kalip cevirisi.

17 model sayfasinda ayni cumle yalniz model adi degisterek tekrar eder.
Her birini tek tek cevirmek yerine kalipla cozuyoruz: 8 kural ~136 metni
kapsar ve yeni model eklendiginde kendiliginden calisir.
"""
import re

# seri adlari — kalip icinde gecen alt parcalar
SERI = {
    "en": {"Modern Seri":"Modern Series", "Klasik & Prestij":"Classic & Prestige",
           "Teknoloji Serisi":"Technology Series", "Lokomotif Seri":"Lead Series",
           "Prestij Serisi":"Prestige Series", "Klasik Seri":"Classic Series"},
    "ru": {"Modern Seri":"Серия Modern", "Klasik & Prestij":"Classic и Prestige",
           "Teknoloji Serisi":"Серия Technology", "Lokomotif Seri":"Ведущая серия",
           "Prestij Serisi":"Серия Prestige", "Klasik Seri":"Серия Classic"},
    "ar": {"Modern Seri":"سلسلة Modern", "Klasik & Prestij":"Classic وPrestige",
           "Teknoloji Serisi":"سلسلة Technology", "Lokomotif Seri":"السلسلة الأولى",
           "Prestij Serisi":"سلسلة Prestige", "Klasik Seri":"سلسلة Classic"},
}

KALIP = {
"en": [
 (r"^(.+), NARION'un patentli akıllı elektrikli Smart HMD başlığıyla kusursuz çalışır\. Közsüz, külsüz ve baş ağrısız temiz nargile çağı\.$",
  r"\1 runs seamlessly with NARION's patented Smart HMD electric head — a clean era of hookah, with no charcoal, no ash and no headache."),
 (r"^Her bir NARION (.+), özel tasarım sert kapaklı manyetik lüks kutusunda özenle paketlenmiş olarak teslim edilir\.$",
  r"Every NARION \1 is delivered carefully packed in its own rigid-lid magnetic presentation case."),
 (r"^(.+) sunum kutusu, nargilenizi hem yaşam alanınızda şık bir şekilde muhafaza etmek hem de güvenle taşımak üzere geliştirildi\.$",
  r"The \1 presentation case is built both to display your hookah well at home and to carry it safely."),
 (r"^(.+) gövdesi, kırılmaya dayanıklı kristal haznesi ve Smart HMD için özel sünger yuvalar\.$",
  r"Dedicated foam cradles for the \1 body, its impact-resistant crystal base and the Smart HMD."),
 (r"^(.+)['’](?:yi|yı|yu|yü) Kutulu Olarak Rezerve Edin →$",
  r"Reserve \1 With Its Case →"),
 (r"^NARION (.+) Manyetik Sunum Kutusu ve Ambalajı$",
  r"NARION \1 magnetic presentation case and packaging"),
 (r"^NARION (.+) — (.+) \| Haute Hookah Systems$",
  r"NARION \1 — \2 | Haute Hookah Systems"),
 (r"^/ (.+) / NARION (.+)$",
  r"/ \1 / NARION \2"),
 (r"^(.+) Özel Manyetik Sunum Kutusu$",
  r"\1 Magnetic Presentation Case"),
 (r"^NARION (.+) Nargile$",
  r"NARION \1 Hookah"),
],
"ru": [
 (r"^(.+), NARION'un patentli akıllı elektrikli Smart HMD başlığıyla kusursuz çalışır\. Közsüz, külsüz ve baş ağrısız temiz nargile çağı\.$",
  r"\1 безупречно работает с запатентованной электрической головкой NARION Smart HMD — чистая эпоха кальяна без углей, пепла и головной боли."),
 (r"^Her bir NARION (.+), özel tasarım sert kapaklı manyetik lüks kutusunda özenle paketlenmiş olarak teslim edilir\.$",
  r"Каждый NARION \1 поставляется бережно упакованным в собственный магнитный презентационный кейс с жёсткой крышкой."),
 (r"^(.+) sunum kutusu, nargilenizi hem yaşam alanınızda şık bir şekilde muhafaza etmek hem de güvenle taşımak üzere geliştirildi\.$",
  r"Презентационный кейс \1 создан и для того, чтобы кальян достойно стоял дома, и для того, чтобы его было безопасно возить."),
 (r"^(.+) gövdesi, kırılmaya dayanıklı kristal haznesi ve Smart HMD için özel sünger yuvalar\.$",
  r"Отдельные гнёзда в пене для корпуса \1, его ударопрочной кристальной колбы и Smart HMD."),
 (r"^(.+)['’](?:yi|yı|yu|yü) Kutulu Olarak Rezerve Edin →$",
  r"Забронировать \1 в кейсе →"),
 (r"^NARION (.+) Manyetik Sunum Kutusu ve Ambalajı$",
  r"Магнитный презентационный кейс и упаковка NARION \1"),
 (r"^NARION (.+) — (.+) \| Haute Hookah Systems$",
  r"NARION \1 — \2 | Haute Hookah Systems"),
 (r"^/ (.+) / NARION (.+)$",
  r"/ \1 / NARION \2"),
 (r"^(.+) Özel Manyetik Sunum Kutusu$",
  r"Магнитный презентационный кейс \1"),
 (r"^NARION (.+) Nargile$",
  r"Кальян NARION \1"),
],
"ar": [
 (r"^(.+), NARION'un patentli akıllı elektrikli Smart HMD başlığıyla kusursuz çalışır\. Közsüz, külsüz ve baş ağrısız temiz nargile çağı\.$",
  r"\1 تعمل بسلاسة مع رأس NARION Smart HMD الكهربائي المسجّل — عصر نظيف للنرجيلة بلا فحم ولا رماد ولا صداع."),
 (r"^Her bir NARION (.+), özel tasarım sert kapaklı manyetik lüks kutusunda özenle paketlenmiş olarak teslim edilir\.$",
  r"يُسلَّم كل NARION \1 معبّأً بعناية داخل علبة تقديم مغناطيسية بغطاء صلب."),
 (r"^(.+) sunum kutusu, nargilenizi hem yaşam alanınızda şık bir şekilde muhafaza etmek hem de güvenle taşımak üzere geliştirildi\.$",
  r"صُمّمت علبة تقديم \1 لتعرض نرجيلتك على نحو لائق في بيتك ولتحملها بأمان."),
 (r"^(.+) gövdesi, kırılmaya dayanıklı kristal haznesi ve Smart HMD için özel sünger yuvalar\.$",
  r"مقاعد إسفنجية مخصّصة لهيكل \1 ولقاعدته الكريستالية المقاومة للصدمات ولـ Smart HMD."),
 (r"^(.+)['’](?:yi|yı|yu|yü) Kutulu Olarak Rezerve Edin →$",
  r"← احجز \1 داخل علبته"),
 (r"^NARION (.+) Manyetik Sunum Kutusu ve Ambalajı$",
  r"علبة تقديم NARION \1 المغناطيسية وتغليفها"),
 (r"^NARION (.+) — (.+) \| Haute Hookah Systems$",
  r"NARION \1 — \2 | Haute Hookah Systems"),
 (r"^/ (.+) / NARION (.+)$",
  r"/ \1 / NARION \2"),
 (r"^(.+) Özel Manyetik Sunum Kutusu$",
  r"علبة تقديم \1 المغناطيسية"),
 (r"^NARION (.+) Nargile$",
  r"نرجيلة NARION \1"),
],
}


def uygula(t, dil):
    """Kalip varsa cevirisini dondurur, yoksa None."""
    for desen, karsilik in KALIP.get(dil, []):
        m = re.match(desen, t)
        if not m:
            continue
        sonuc = re.sub(desen, karsilik, t)
        # kalip icindeki seri adlarini da cevir
        for a, b in sorted(SERI.get(dil, {}).items(), key=lambda x: -len(x[0])):
            sonuc = sonuc.replace(a, b)
        return sonuc
    return None
