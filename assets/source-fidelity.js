(function () {
  function fitPrintedPage() {
    var page = document.querySelector('#content.adt-print-page');
    var flow = page && page.querySelector(':scope > .adt-page-flow');
    if (!page || !flow) return;

    flow.style.zoom = '1';
    flow.style.transform = 'none';
    flow.style.width = '100%';
    flow.style.left = '0';
    // Keep the source layout readable. Dense pages extend vertically instead
    // of being reduced until their text and activities become too small.
    page.dataset.fitScale = '1.000';
  }

  var pending;
  function scheduleFit() {
    clearTimeout(pending);
    pending = setTimeout(fitPrintedPage, 80);
  }

  document.addEventListener('DOMContentLoaded', scheduleFit);
  window.addEventListener('load', scheduleFit);
  document.querySelectorAll('img').forEach(function (image) {
    if (!image.complete) image.addEventListener('load', scheduleFit, { once: true });
  });
  setTimeout(fitPrintedPage, 500);
  setTimeout(fitPrintedPage, 1500);
  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleFit).observe(document.querySelector('.adt-page-flow') || document.documentElement);
  }
  new MutationObserver(scheduleFit).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
