// 聚焦式卡牌滑轨：算出每张卡离中心的距离，写进 CSS 变量 --d，
// 由 CSS 决定虚化/缩放/透明度。加左右按钮与鼠标拖动。
//
// 无脚本时：--d 恒为 0，所有卡片都清晰可读，滑轨仍可横向滚动。

(function () {
  var strip = document.getElementById('filmStrip');
  if (!strip) return;

  var cards = Array.prototype.slice.call(strip.querySelectorAll('.poster-card'));
  var counter = document.getElementById('filmIndex');
  var totalEl = document.querySelector('.strip-count');

  if (counter) counter.max = String(cards.length);
  if (totalEl) {
    totalEl.innerHTML = '<b id="filmIndex">01</b> / ' + String(cards.length).padStart(2, '0');
    counter = document.getElementById('filmIndex');
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // 更新每张卡的 --d 与右下角计数
  var frame = null;
  function update() {
    frame = null;
    var box = strip.getBoundingClientRect();
    var center = box.left + box.width / 2;
    var nearest = 0;
    var best = Infinity;

    cards.forEach(function (card, i) {
      var r = card.getBoundingClientRect();
      var cardCenter = r.left + r.width / 2;
      var dist = Math.abs(cardCenter - center);

      // 大约离开一个卡身宽度时，虚化到最深
      var d = Math.min(1, dist / (r.width * 1.15));
      card.style.setProperty('--d', d.toFixed(3));

      if (dist < best) {
        best = dist;
        nearest = i;
      }
    });

    if (counter) counter.textContent = pad(nearest + 1);
  }

  function schedule() {
    if (frame === null) frame = requestAnimationFrame(update);
  }

  strip.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  // 左右按钮：一次走一张卡（含间距）
  function step() {
    if (!cards.length) return 260;
    var gap = parseFloat(getComputedStyle(strip).columnGap) || 24;
    return cards[0].getBoundingClientRect().width + gap;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.strip-btn'), function (btn) {
    btn.addEventListener('click', function () {
      var dir = Number(btn.dataset.dir) || 1;
      strip.scrollBy({ left: dir * step(), behavior: 'smooth' });
    });
  });

  // 鼠标拖动
  var dragging = false;
  var startX = 0;
  var startLeft = 0;

  strip.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return; // 触屏交给浏览器原生滑动
    dragging = true;
    startX = e.clientX;
    startLeft = strip.scrollLeft;
    strip.classList.add('is-dragging');
    try { strip.setPointerCapture(e.pointerId); } catch (_) {}
  });

  strip.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    strip.scrollLeft = startLeft - (e.clientX - startX);
  });

  ['pointerup', 'pointercancel'].forEach(function (name) {
    strip.addEventListener(name, function (e) {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove('is-dragging');
      try { strip.releasePointerCapture(e.pointerId); } catch (_) {}
    });
  });

  update();
})();
