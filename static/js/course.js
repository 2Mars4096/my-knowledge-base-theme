// Course textbook pages: open every hint, answer, and solution panel for printing,
// then restore the reader's own open/closed state afterwards.
(function () {
  var openedForPrint = [];

  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('details.kb-panel:not([open])').forEach(function (panel) {
      panel.open = true;
      openedForPrint.push(panel);
    });
  });

  window.addEventListener('afterprint', function () {
    openedForPrint.forEach(function (panel) { panel.open = false; });
    openedForPrint = [];
  });
})();
