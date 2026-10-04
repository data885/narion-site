/* NARION — mobil menü
 *
 * Başlıkta .burger düğmesi CSS'te tanımlıydı ama HTML'e hiç eklenmemişti;
 * .menu ise 1024px altında display:none olduğu için telefonda gezinme
 * tamamen kayboluyordu (6 bağlantı + dil seçici + iki CTA erişilemezdi).
 * Açılan panel .head-in üzerine "acik" sınıfı koyarak kuruluyor; böylece
 * mutlak konumlandırma ve yükseklik hesabı gerekmiyor, menü ve CTA'lar
 * başlığın altına kendiliğinden sarıyor.
 */
(function () {
  'use strict';
  var dugme = document.querySelector('.burger');
  var kap = document.querySelector('.head-in');
  if (!dugme || !kap) return;

  function ayarla(acik) {
    kap.classList.toggle('acik', acik);
    dugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
  }

  dugme.addEventListener('click', function () {
    ayarla(!kap.classList.contains('acik'));
  });

  // Bağlantıya dokununca kapansın (aynı sayfa içi çapalarda şart)
  kap.addEventListener('click', function (e) {
    if (e.target.closest('.menu a, .head-cta a')) ayarla(false);
  });

  // Esc ile kapat
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') ayarla(false);
  });

  // Masaüstü genişliğine çıkılırsa panel açık kalmasın
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) ayarla(false);
  });
})();
