// 影单横向滚动条：左右按钮 + 鼠标拖动。
// 触屏和触控板的滑动由浏览器原生支持，这里只补上桌面端的鼠标操作。
// 若脚本加载失败，横向滚动、键盘方向键、触控板滑动依然可用。

(function () {
  var strip = document.getElementById('filmStrip');
  if (!strip) return;

  // 每次滚动一张海报的宽度（含间距）
  function step() {
    var card = strip.querySelector('.poster-card');
    if (!card) return 260;
    var gap = parseFloat(getComputedStyle(strip).columnGap) || 16;
    return card.getBoundingClientRect().width + gap;
  }

  document.querySelectorAll('.strip-btn').forEach(function (btn) {
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
    if (e.pointerType === 'touch') return; // 触屏交给浏览器
    dragging = true;
    startX = e.clientX;
    startLeft = strip.scrollLeft;
    strip.classList.add('is-dragging');
    strip.setPointerCapture(e.pointerId);
  });

  strip.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    strip.scrollLeft = startLeft - (e.clientX - startX);
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (name) {
    strip.addEventListener(name, function (e) {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove('is-dragging');
      try { strip.releasePointerCapture(e.pointerId); } catch (_) {}
    });
  });
})();
