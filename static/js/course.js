// Course textbook pages exported by learning-assistant's tools/kb_export.
//
// - Printing opens every hint, answer, and solution panel, then restores them.
// - Reference previews: hovering, focusing, or tapping a `.kb-ref` link shows its target.
// - "Back to" control after following a reference.
// - Reading position per chapter, offered back as "Continue at"; progress on the course page.
// - Notes on any anchored block, kept in this browser; listed, exported, and restored on the course page.
// - Answer checks: exercises with an answer key accept a typed final answer and say whether it is right.
// - Recall mode: hide numbered statements and rate yourself; recall sessions on the course page.
// - Chapter map progress on the course page.
// - Keyboard shortcuts (press ? on a chapter page).
//
// State lives in localStorage under one key per course; nothing leaves the browser.
(function () {
  'use strict';

  // --- Printing -------------------------------------------------------------

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

  // --- Page context ---------------------------------------------------------

  var coursePage = document.querySelector('.kb-course');
  var article = document.getElementById('main-content');
  var chapterPage = !coursePage && article && article.querySelector('.kb-exercise-anchor, .kb-statement, .kb-example');
  if (!coursePage && !chapterPage) return;
  document.documentElement.classList.add('kb-js');

  var root = coursePage ? location.pathname : location.pathname.replace(/[^/]+\/?$/, '');
  var chapterSlug = coursePage ? '' : location.pathname.slice(root.length).replace(/\/$/, '');
  var NAV_OFFSET = 72;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollBehavior = reducedMotion ? 'auto' : 'smooth';

  // --- Storage --------------------------------------------------------------

  var STORE_KEY = 'kb-course:' + root;
  var storageOK = (function () {
    try {
      localStorage.setItem('kb-course:probe', '1');
      localStorage.removeItem('kb-course:probe');
      return true;
    } catch (_error) {
      return false;
    }
  })();

  function loadState() {
    var state = {};
    try { state = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (_error) { state = {}; }
    state.position = state.position || {};
    state.notes = state.notes || {};
    state.recall = state.recall || {};
    state.checks = state.checks || {};
    return state;
  }

  function saveState(state) {
    if (!storageOK) return false;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function sessionGet(key) {
    try { return JSON.parse(sessionStorage.getItem(key)); } catch (_error) { return null; }
  }

  function sessionSet(key, value) {
    try {
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify(value));
    } catch (_error) { /* private mode: the feature quietly does nothing */ }
  }

  // --- Small helpers --------------------------------------------------------

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  var toast = el('div', 'kb-toast');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer = null;
  function say(message) {
    toast.textContent = message;
    toast.classList.add('kb-toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('kb-toast--visible'); }, 2400);
  }

  function goTo(target, focus) {
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: scrollBehavior });
    if (focus) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }

  function afterMath(callback) {
    var mj = window.MathJax;
    if (mj && mj.startup && mj.startup.promise) mj.startup.promise.then(callback, callback);
    else callback();
  }

  // Where scrollIntoView puts an element's top: the page's scroll padding plus the element's scroll margin.
  function landingLine(item) {
    var padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    var margin = parseFloat(getComputedStyle(item).scrollMarginTop) || 0;
    return padding + margin;
  }

  // Anchored blocks: sections, statements, examples, exercises, figures. `id` is the anchor id.
  function blockFor(node) {
    if (!node) return null;
    if (node.classList.contains('kb-exercise-anchor')) return { el: node.closest('li'), id: node.id };
    return { el: node, id: node.id };
  }

  function anchoredBlocks() {
    if (!article) return [];
    return Array.prototype.map.call(
      article.querySelectorAll('h2[id^="section-"], .kb-statement[id], .kb-example[id], figure.course-figure[id], .kb-exercise-anchor[id]'),
      blockFor
    ).filter(function (block) { return block.el; });
  }

  function labelFor(id, node) {
    var match = /^([a-z]+)-(r|\d+)-(\d+)$/.exec(id || '');
    if (!match) return '';
    var number = (match[2] === 'r' ? 'R' : match[2]) + '.' + match[3];
    if (match[1] === 'section') {
      var heading = node && node.textContent ? node.textContent.replace(/^\s*\d+\.\d+\s*/, '').trim() : '';
      return '§' + number + (heading ? ' ' + heading : '');
    }
    return match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' ' + number;
  }

  // The anchored block that contains `node`, or else the last one that starts above it.
  function blockAround(node) {
    var top = node.getBoundingClientRect().top;
    var found = null;
    anchoredBlocks().forEach(function (block) {
      if (block.el.contains(node) || block.el.getBoundingClientRect().top <= top) found = block;
    });
    return found;
  }

  // The block being read: the last one whose top has reached the line where scrolling puts blocks.
  function currentBlock() {
    var blocks = anchoredBlocks();
    var current = null;
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].el.getBoundingClientRect().top <= landingLine(blocks[i].el) + 24) current = blocks[i];
      else break;
    }
    return current;
  }

  // --- Reference previews ---------------------------------------------------

  var pageCache = {};
  function fetchPage(path) {
    if (!pageCache[path]) {
      pageCache[path] = fetch(path, { credentials: 'same-origin' })
        .then(function (response) {
          if (!response.ok) throw new Error(response.status);
          return response.text();
        })
        .then(function (html) { return new DOMParser().parseFromString(html, 'text/html'); });
    }
    return pageCache[path];
  }

  function refTarget(link) {
    var url = new URL(link.getAttribute('href'), location.href);
    var id = decodeURIComponent(url.hash.slice(1));
    if (url.pathname === location.pathname) {
      return Promise.resolve({ doc: document, id: id, url: url, local: true });
    }
    return fetchPage(url.pathname).then(function (doc) { return { doc: doc, id: id, url: url, local: false }; });
  }

  function cleanClone(node) {
    var clone = node.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(function (child) { child.removeAttribute('id'); });
    clone.querySelectorAll('details.kb-panel, .kb-note, .kb-note-btn, .kb-note-editor, script').forEach(function (child) { child.remove(); });
    return clone;
  }

  function previewContent(target) {
    var doc = target.doc;
    var box = el('div', 'kb-preview__content');
    if (!target.id) {
      var title = doc.querySelector('.page-nav__title h1');
      var first = doc.querySelector('#main-content > p, #main-content .kb-course__promise');
      box.appendChild(el('p', 'kb-preview__chapter', title ? title.textContent.trim() : 'Chapter'));
      if (first) box.appendChild(cleanClone(first));
      return box;
    }
    var node = doc.getElementById(target.id);
    if (!node) {
      box.appendChild(el('p', '', 'This reference has no preview.'));
      return box;
    }
    if (node.classList.contains('kb-exercise-anchor')) {
      var item = cleanClone(node.closest('li'));
      item.querySelectorAll('.kb-exercise-anchor').forEach(function (span) { span.remove(); });
      var label = el('p', 'kb-preview__chapter', labelFor(target.id));
      box.appendChild(label);
      Array.prototype.forEach.call(item.childNodes, function (child) { box.appendChild(child.cloneNode(true)); });
      return box;
    }
    if (/^H[2-6]$/.test(node.tagName)) {
      box.appendChild(el('p', 'kb-preview__chapter', labelFor(target.id, node)));
      var sibling = node.nextElementSibling;
      var taken = 0;
      while (sibling && !/^H[1-3]$/.test(sibling.tagName) && taken < 2) {
        if (sibling.tagName === 'P' || sibling.classList.contains('kb-statement')) {
          box.appendChild(cleanClone(sibling));
          taken++;
        }
        sibling = sibling.nextElementSibling;
      }
      return box;
    }
    box.appendChild(cleanClone(node));
    return box;
  }

  var preview = el('div', 'kb-preview');
  preview.hidden = true;
  preview.setAttribute('role', 'dialog');
  preview.setAttribute('aria-modal', 'false');
  preview.setAttribute('aria-labelledby', 'kb-preview-title');
  var previewBar = el('div', 'kb-preview__bar');
  var previewTitle = el('span', 'kb-preview__title');
  previewTitle.id = 'kb-preview-title';
  var previewGo = el('a', 'kb-preview__go', 'Go to');
  var previewClose = el('button', 'kb-preview__close');
  previewClose.type = 'button';
  previewClose.setAttribute('aria-label', 'Close preview');
  previewClose.textContent = '×';
  previewBar.appendChild(previewTitle);
  previewBar.appendChild(previewGo);
  previewBar.appendChild(previewClose);
  var previewBody = el('div', 'kb-preview__body');
  preview.appendChild(previewBar);
  preview.appendChild(previewBody);
  document.body.appendChild(preview);

  var previewLink = null;
  var openTimer = null;
  var closeTimer = null;
  var lastPointer = 'mouse';
  var previewToken = 0;

  function placePreview() {
    if (!previewLink || preview.hidden) return;
    if (window.innerWidth < 600) {
      preview.classList.add('kb-preview--sheet');
      preview.style.left = preview.style.top = '';
      return;
    }
    preview.classList.remove('kb-preview--sheet');
    var rect = previewLink.getBoundingClientRect();
    var width = preview.offsetWidth;
    var height = preview.offsetHeight;
    var left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    var below = window.innerHeight - rect.bottom;
    var top = below >= height + 16 || below > rect.top ? rect.bottom + 8 : rect.top - height - 8;
    preview.style.left = left + 'px';
    preview.style.top = Math.max(8, top) + 'px';
  }

  function openPreview(link) {
    clearTimeout(closeTimer);
    if (previewLink === link && !preview.hidden) return;
    previewLink = link;
    var token = ++previewToken;
    previewTitle.textContent = link.textContent.trim();
    previewGo.href = link.href;
    previewBody.textContent = 'Loading…';
    preview.hidden = false;
    link.setAttribute('aria-expanded', 'true');
    placePreview();
    refTarget(link).then(function (target) {
      if (token !== previewToken) return;
      var content = previewContent(target);
      previewBody.textContent = '';
      previewBody.appendChild(content);
      placePreview();
      var mj = window.MathJax;
      if (!target.local && mj && mj.typesetPromise) {
        mj.typesetPromise([content]).then(placePreview, placePreview);
      }
    }, function () {
      if (token !== previewToken) return;
      previewBody.textContent = 'The preview could not be loaded. Follow the link instead.';
    });
  }

  function closePreview(returnFocus) {
    clearTimeout(openTimer);
    if (preview.hidden) return;
    var link = previewLink;
    preview.hidden = true;
    previewLink = null;
    previewToken++;
    if (link) {
      link.removeAttribute('aria-expanded');
      if (returnFocus) link.focus();
    }
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      if (!preview.matches(':hover') && !(previewLink && previewLink.matches(':hover')) && !preview.contains(document.activeElement)) {
        closePreview(false);
      }
    }, 250);
  }

  document.addEventListener('pointerdown', function (event) { lastPointer = event.pointerType || 'mouse'; }, true);

  document.addEventListener('mouseover', function (event) {
    var link = event.target.closest && event.target.closest('a.kb-ref');
    if (!link || lastPointer === 'touch') return;
    clearTimeout(openTimer);
    openTimer = setTimeout(function () { openPreview(link); }, 300);
  });

  document.addEventListener('mouseout', function (event) {
    var link = event.target.closest && event.target.closest('a.kb-ref');
    if (link) clearTimeout(openTimer);
    if (link || (event.target.closest && event.target.closest('.kb-preview'))) scheduleClose();
  });

  document.addEventListener('focusin', function (event) {
    var link = event.target.closest && event.target.closest('a.kb-ref');
    if (link && link.matches(':focus-visible')) openPreview(link);
  });

  document.addEventListener('focusout', function () {
    setTimeout(function () {
      var active = document.activeElement;
      if (!preview.contains(active) && active !== previewLink) scheduleClose();
    }, 0);
  });

  previewClose.addEventListener('click', function () { closePreview(true); });

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a.kb-ref, a.kb-preview__go');
    if (!link) {
      if (!preview.hidden && !preview.contains(event.target)) closePreview(false);
      return;
    }
    // On touch, the first tap previews and the second follows the link.
    if (link.classList.contains('kb-ref') && lastPointer === 'touch' && previewLink !== link) {
      event.preventDefault();
      openPreview(link);
      return;
    }
    rememberBack(link.classList.contains('kb-ref') ? link : previewLink, link.href);
    closePreview(false);
  });

  window.addEventListener('scroll', function () { if (!preview.hidden) window.requestAnimationFrame(placePreview); }, { passive: true });
  window.addEventListener('resize', placePreview);

  // --- Back to where you were -----------------------------------------------

  var BACK_KEY = 'kb-course-back';
  var RESTORE_KEY = 'kb-course-restore';
  var backPill = el('button', 'kb-pill kb-pill--back');
  backPill.type = 'button';
  backPill.hidden = true;
  document.body.appendChild(backPill);

  function rememberBack(source, href) {
    if (!chapterPage) return;
    var block = (source && blockAround(source)) || currentBlock();
    var label = block ? labelFor(block.id, block.el) : document.title.split(' | ')[0];
    sessionSet(BACK_KEY, {
      from: location.pathname,
      y: window.scrollY,
      anchor: block ? block.id : '',
      offset: block ? block.el.getBoundingClientRect().top : 0,
      label: label,
      to: new URL(href, location.href).href,
      t: Date.now()
    });
  }

  // Return to a saved spot by its block, so late layout (mathematics, images) cannot shift it.
  function scrollToSaved(saved, behavior) {
    var anchor = saved.anchor && document.getElementById(saved.anchor);
    var block = anchor ? blockFor(anchor) : null;
    var top = block ? block.el.getBoundingClientRect().top + window.scrollY - saved.offset : saved.y;
    window.scrollTo({ top: top, behavior: behavior });
  }

  function offerBack() {
    var back = sessionGet(BACK_KEY);
    backPill.hidden = true;
    if (!back || Date.now() - back.t > 15 * 60 * 1000) return;
    var here = location.href;
    if (back.to !== here && back.to.split('#')[0] !== here.split('#')[0]) return;
    backPill.textContent = '← Back to ' + back.label;
    backPill.hidden = false;
  }

  backPill.addEventListener('click', function () {
    var back = sessionGet(BACK_KEY);
    sessionSet(BACK_KEY, null);
    backPill.hidden = true;
    if (!back) return;
    if (back.from === location.pathname) {
      scrollToSaved(back, scrollBehavior);
    } else {
      sessionSet(RESTORE_KEY, { path: back.from, y: back.y, anchor: back.anchor, offset: back.offset });
      location.href = back.from;
    }
  });

  window.addEventListener('hashchange', offerBack);

  var restore = sessionGet(RESTORE_KEY);
  if (restore && restore.path === location.pathname) {
    sessionSet(RESTORE_KEY, null);
    window.addEventListener('load', function () {
      afterMath(function () {
        scrollToSaved(restore, 'auto');
        setTimeout(function () { scrollToSaved(restore, 'auto'); }, 400);
      });
    });
  } else {
    restore = null;
  }

  // --- Reading position -----------------------------------------------------

  var state = loadState();

  if (chapterPage && storageOK) {
    var armed = false;
    ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (type) {
      window.addEventListener(type, function () { armed = true; }, { passive: true, once: true });
    });
    var saveTimer = null;
    window.addEventListener('scroll', function () {
      if (!armed) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        var block = currentBlock();
        var doc = document.documentElement;
        var fraction = Math.min(1, (window.scrollY + window.innerHeight) / doc.scrollHeight);
        var fresh = loadState();
        var previous = fresh.position[chapterSlug] || {};
        fresh.position[chapterSlug] = {
          id: block ? block.id : '',
          label: block ? labelFor(block.id, block.el) : '',
          furthest: Math.max(previous.furthest || 0, fraction),
          t: Date.now()
        };
        fresh.last = chapterSlug;
        fresh.lastTitle = document.title.split(' | ')[0];
        saveState(fresh);
      }, 400);
    }, { passive: true });

    var saved = state.position[chapterSlug];
    if (!location.hash && !restore && saved && saved.id && document.getElementById(saved.id)) {
      var continuePill = el('button', 'kb-pill kb-pill--continue');
      continuePill.type = 'button';
      continuePill.textContent = 'Continue at ' + saved.label;
      var dismiss = el('button', 'kb-pill__dismiss');
      dismiss.type = 'button';
      dismiss.setAttribute('aria-label', 'Dismiss');
      dismiss.textContent = '×';
      var holder = el('div', 'kb-pill-row');
      holder.appendChild(continuePill);
      holder.appendChild(dismiss);
      document.body.appendChild(holder);
      var hide = function () { holder.remove(); };
      continuePill.addEventListener('click', function () {
        armed = true;
        goTo(blockFor(document.getElementById(saved.id)).el, false);
        hide();
      });
      dismiss.addEventListener('click', hide);
      window.addEventListener('scroll', function onScroll() {
        if (window.scrollY > 800) { hide(); window.removeEventListener('scroll', onScroll); }
      }, { passive: true });
    }
  }

  // --- Notes ----------------------------------------------------------------

  function noteKey(id) { return chapterSlug + '#' + id; }

  function chapterNotes() {
    var notes = loadState().notes;
    return Object.keys(notes).filter(function (key) { return key.split('#')[0] === chapterSlug; }).map(function (key) {
      return { key: key, id: key.split('#')[1], note: notes[key] };
    });
  }

  function writeNote(id, label, text) {
    var fresh = loadState();
    var key = noteKey(id);
    if (text) {
      fresh.notes[key] = { text: text, label: label, chapter: chapterSlug, chapterTitle: document.title.split(' | ')[0], t: Date.now() };
    } else {
      delete fresh.notes[key];
    }
    if (!saveState(fresh)) say('This browser is not saving notes.');
  }

  function placeAfter(block, node) {
    // Notes and editors go after the block; for an exercise, inside the list item.
    if (block.el.tagName === 'LI') block.el.appendChild(node);
    else block.el.insertAdjacentElement('afterend', node);
  }

  var sideMode = window.matchMedia('(min-width: 901px)');
  var notesAside = document.getElementById('notes');
  var sideBox = null;

  function clearRenderedNotes() {
    document.querySelectorAll('.kb-note, .kb-notes-moved').forEach(function (node) { node.remove(); });
    if (sideBox) sideBox.textContent = '';
  }

  function noteCard(entry, block) {
    var card = el('aside', 'kb-note');
    card.setAttribute('aria-label', 'Your note on ' + entry.note.label);
    var head = el('div', 'kb-note__head');
    var label = el('button', 'kb-note__label', entry.note.label);
    label.type = 'button';
    label.addEventListener('click', function () { if (block) goTo(block.el, true); });
    var edit = el('button', 'kb-note__edit', 'Edit');
    edit.type = 'button';
    edit.addEventListener('click', function () { if (block) openEditor(block); });
    head.appendChild(label);
    if (block) head.appendChild(edit);
    card.appendChild(head);
    card.appendChild(el('p', 'kb-note__text', entry.note.text));
    return card;
  }

  function renderNotes() {
    if (!chapterPage) return;
    clearRenderedNotes();
    var entries = chapterNotes();
    var moved = [];
    var side = sideMode.matches && notesAside;
    var footnotes = document.querySelector('#footnote-container .footnote-wrapper');
    if (side && !entries.length && sideBox && !footnotes) {
      notesAside.style.display = 'none';
      article.classList.add('expanded');
    }
    if (side && entries.length) {
      notesAside.style.display = '';
      article.classList.remove('expanded');
      if (!sideBox) {
        sideBox = el('div', 'kb-side-notes');
        notesAside.appendChild(sideBox);
      }
    }
    entries.forEach(function (entry) {
      var anchor = document.getElementById(entry.id);
      var block = anchor ? blockFor(anchor) : null;
      if (!block) { moved.push(entry); return; }
      var card = noteCard(entry, block);
      if (side) {
        card.dataset.anchor = entry.id;
        sideBox.appendChild(card);
      } else {
        placeAfter(block, card);
      }
    });
    if (moved.length) {
      var box = el('section', 'kb-notes-moved');
      box.appendChild(el('h2', '', 'Notes whose place moved'));
      box.appendChild(el('p', '', 'These notes belong to blocks that no longer exist in this chapter. Copy what you need, then delete them from the course page.'));
      moved.forEach(function (entry) { box.appendChild(noteCard(entry, null)); });
      article.appendChild(box);
      var fresh = loadState();
      moved.forEach(function (entry) { if (fresh.notes[entry.key]) fresh.notes[entry.key].moved = true; });
      saveState(fresh);
    }
    if (side) layoutSideNotes();
  }

  function layoutSideNotes() {
    if (!sideBox || !sideMode.matches) return;
    var base = sideBox.getBoundingClientRect().top;
    var bottom = 0;
    Array.prototype.forEach.call(sideBox.children, function (card) {
      var anchor = document.getElementById(card.dataset.anchor);
      var block = anchor ? blockFor(anchor) : null;
      if (!block) return;
      var top = Math.max(block.el.getBoundingClientRect().top - base, bottom + 8);
      card.style.top = top + 'px';
      bottom = top + card.offsetHeight;
    });
    sideBox.style.minHeight = bottom + 'px';
  }

  var editor = null;
  function closeEditor() {
    if (editor) { editor.remove(); editor = null; }
  }

  function openEditor(block) {
    if (!storageOK) { say('This browser is not saving notes, so notes are off.'); return; }
    closeEditor();
    var label = labelFor(block.id, block.el);
    var existing = loadState().notes[noteKey(block.id)];
    editor = el('form', 'kb-note-editor');
    var area = el('textarea', 'kb-note-editor__text');
    area.rows = 4;
    area.value = existing ? existing.text : '';
    area.setAttribute('aria-label', 'Note on ' + label);
    area.placeholder = 'Your note on ' + label + ' (saved in this browser only)';
    var actions = el('div', 'kb-note-editor__actions');
    var saveButton = el('button', 'kb-button kb-note-editor__save', 'Save');
    saveButton.type = 'submit';
    var cancel = el('button', 'kb-button', 'Cancel');
    cancel.type = 'button';
    actions.appendChild(saveButton);
    actions.appendChild(cancel);
    if (existing) {
      var remove = el('button', 'kb-button kb-note-editor__delete', 'Delete');
      remove.type = 'button';
      remove.addEventListener('click', function () { writeNote(block.id, label, ''); closeEditor(); renderNotes(); say('Note deleted.'); });
      actions.appendChild(remove);
    }
    editor.appendChild(area);
    editor.appendChild(actions);
    editor.addEventListener('submit', function (event) {
      event.preventDefault();
      writeNote(block.id, label, area.value.trim());
      closeEditor();
      renderNotes();
      say(area.value.trim() ? 'Note saved in this browser.' : 'Note deleted.');
    });
    area.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); closeEditor(); goTo(block.el, true); }
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); editor.requestSubmit(); }
    });
    cancel.addEventListener('click', function () { closeEditor(); });
    placeAfter(block, editor);
    area.focus();
  }

  if (chapterPage && storageOK) {
    anchoredBlocks().forEach(function (block) {
      var button = el('button', 'kb-note-btn');
      button.type = 'button';
      button.setAttribute('aria-label', 'Add a note to ' + labelFor(block.id, block.el));
      button.addEventListener('click', function () { openEditor(block); });
      block.el.classList.add('kb-noteable');
      block.el.appendChild(button);
    });
    afterMath(renderNotes);
    window.addEventListener('load', layoutSideNotes);
    sideMode.addEventListener('change', renderNotes);
    window.addEventListener('resize', function () { window.requestAnimationFrame(layoutSideNotes); });
    if (window.ResizeObserver) new ResizeObserver(function () { window.requestAnimationFrame(layoutSideNotes); }).observe(article);
  }

  // --- Answer checks --------------------------------------------------------
  //
  // The exporter writes expected values into each `form.kb-check`; this parses what the reader types.
  // The language matches learning-assistant's tools/kb_export/answers.py: numbers, + - * / ^, implicit
  // products ("2pi", "3 sqrt(2)"), ! and %, functions (sqrt, ln, exp, sin, ...), pi, e, and √ π × − ·.

  var FUNCTIONS = {
    sqrt: Math.sqrt, cbrt: Math.cbrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, log2: Math.log2,
    sin: Math.sin, cos: Math.cos, tan: Math.tan, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    abs: Math.abs, floor: Math.floor, ceil: Math.ceil
  };
  var CONSTANTS = { pi: Math.PI, e: Math.E };

  function readError(message) {
    var error = new Error(message);
    error.read = true;
    return error;
  }

  function tokenize(text) {
    text = text.replace(/[−–]/g, '-').replace(/[×·⋅]/g, '*').replace(/[÷⁄]/g, '/').trim();
    var pattern = /\s*(?:((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)|(log10|log2|[A-Za-z]+)|(\*\*|[-+*/^(),!%√π]))/y;
    var tokens = [];
    pattern.lastIndex = 0;
    while (pattern.lastIndex < text.length) {
      var start = pattern.lastIndex;
      var match = pattern.exec(text);
      if (!match || pattern.lastIndex === start) throw readError('cannot read “' + text.slice(start, start + 8).trim() + '”');
      if (match[1] !== undefined) tokens.push(['number', match[1]]);
      else if (match[2] !== undefined) tokens.push(['name', match[2]]);
      else if (match[3] === 'π') tokens.push(['name', 'pi']);
      else tokens.push(['op', match[3] === '**' ? '^' : match[3]]);
    }
    if (!tokens.length) throw readError('nothing to read');
    return tokens;
  }

  function evaluate(text, variables) {
    var tokens = tokenize(text);
    var i = 0;
    variables = variables || {};
    function peek() { return tokens[i] || null; }
    function take(value) {
      var token = tokens[i];
      if (!token || (value !== undefined && token[1] !== value)) throw readError(value ? 'missing “' + value + '”' : 'it ends too early');
      i++;
      return token;
    }
    function isOp(token, chars) { return token && token[0] === 'op' && chars.indexOf(token[1]) !== -1; }
    function startsPrimary() {
      var token = peek();
      return !!token && (token[0] === 'number' || token[0] === 'name' || token[1] === '(' || token[1] === '√');
    }
    function expr() {
      var value = term();
      while (isOp(peek(), '+-')) {
        var op = take()[1];
        value = op === '+' ? value + term() : value - term();
      }
      return value;
    }
    function term() {
      var value = unary();
      for (;;) {
        if (isOp(peek(), '*/')) {
          var op = take()[1];
          var right = unary();
          value = op === '*' ? value * right : value / right;
        } else if (startsPrimary()) {
          value *= unary();
        } else {
          return value;
        }
      }
    }
    function unary() {
      if (isOp(peek(), '+-')) return take()[1] === '-' ? -unary() : unary();
      return power();
    }
    function power() {
      var base = postfix();
      if (peek() && peek()[1] === '^') { take(); return Math.pow(base, unary()); }
      return base;
    }
    function factorial(n) {
      if (n < 0 || !Number.isInteger(n) || n > 170) throw readError('! needs a whole number up to 170');
      var result = 1;
      for (var k = 2; k <= n; k++) result *= k;
      return result;
    }
    function postfix() {
      var value = primary();
      while (peek() && (peek()[1] === '!' || peek()[1] === '%')) value = take()[1] === '%' ? value / 100 : factorial(value);
      return value;
    }
    function splitName(word) {
      var known = function (name) { return FUNCTIONS[name] || name in CONSTANTS || name in variables; };
      if (known(word)) return [word];
      var parts = [];
      var position = 0;
      while (position < word.length) {
        var size = word.length - position;
        while (size > 0 && !known(word.substr(position, size))) size--;
        if (!size) throw readError('unknown name “' + word + '”');
        parts.push(word.substr(position, size));
        position += size;
      }
      return parts;
    }
    function call(name) {
      var argument;
      if (peek() && peek()[1] === '(') { take(); argument = expr(); take(')'); } else { argument = power(); }
      return FUNCTIONS[name](argument);
    }
    function primary() {
      var token = take();
      if (token[0] === 'number') return parseFloat(token[1]);
      if (token[1] === '(') { var inner = expr(); take(')'); return inner; }
      if (token[1] === '√') return Math.sqrt(postfix());
      if (token[0] === 'name') {
        var names = splitName(token[1]);
        var result = 1;
        names.forEach(function (name, index) {
          if (FUNCTIONS[name]) {
            if (index !== names.length - 1) throw readError(name + ' needs an argument');
            result *= call(name);
          } else {
            result *= name in variables ? variables[name] : CONSTANTS[name];
          }
        });
        return result;
      }
      throw readError('unexpected “' + token[1] + '”');
    }
    var value = expr();
    if (i < tokens.length) throw readError('unexpected “' + tokens[i][1] + '”');
    return value;
  }

  var DECIMAL = /^[+-]?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$/;

  // Significant figures of a plain decimal as typed; trailing zeros of a whole number do not count.
  function significantFigures(text) {
    var mantissa = text.replace(/^[+-]/, '').replace(/[eE].*$/, '');
    var digits = mantissa.replace('.', '').replace(/^0+/, '');
    if (mantissa.indexOf('.') === -1) digits = digits.replace(/0+$/, '');
    return digits.length;
  }

  function within(value, expect, tolerance) {
    return Math.abs(value - expect) <= Math.max(tolerance * Math.abs(expect), 1e-9 * Math.max(1, Math.abs(expect)));
  }

  // "2765 m/s" -> "2765" when the field's unit is m/s; spaces inside the unit do not matter.
  function stripUnit(text, unit) {
    var compact = unit.replace(/\s+/g, '');
    var j = text.length;
    var k = compact.length;
    if (!k) return text;
    while (k > 0 && j > 0) {
      var c = text.charAt(j - 1);
      j--;
      if (/\s/.test(c)) continue;
      if (c !== compact.charAt(k - 1)) return text;
      k--;
    }
    return k === 0 && /\d|\)/.test(text.slice(0, j)) ? text.slice(0, j).trim() : text;
  }

  // { ok, close, message } for one field.
  function judgeNumber(field, raw) {
    var text = stripUnit(raw.trim(), field.dataset.unit || '');
    if (/\d,\d{3}\b/.test(text)) return { ok: false, message: 'Leave out thousands separators.' };
    var value = evaluate(text);
    if (!isFinite(value)) return { ok: false, message: 'That is not a finite number.' };
    var expect = parseFloat(field.dataset.expect);
    var tolerance = parseFloat(field.dataset.tolerance) || 0;
    if (within(value, expect, tolerance)) return { ok: true };
    if (field.dataset.integer !== 'true' && DECIMAL.test(text) && value !== 0) {
      var figures = significantFigures(text);
      var halfStep = 0.5 * Math.pow(10, Math.floor(Math.log10(Math.abs(value))) - figures + 1);
      if (figures >= 3 && Math.abs(value - expect) <= halfStep * (1 + 1e-9)) return { ok: true };
      if (figures < 3 && Math.abs(value - expect) <= halfStep * (1 + 1e-9)) {
        return { ok: false, close: true, message: 'Close. Give at least three significant figures, or an exact value.' };
      }
    }
    return { ok: false };
  }

  function judgeExpression(field, raw) {
    var names = field.dataset.variables.split(',');
    var points = JSON.parse(field.dataset.points);
    var expects = JSON.parse(field.dataset.expect);
    var tolerance = parseFloat(field.dataset.tolerance) || 1e-6;
    for (var k = 0; k < points.length; k++) {
      var variables = {};
      names.forEach(function (name, index) { variables[name] = points[k][index]; });
      var value;
      try {
        value = evaluate(raw, variables);
      } catch (error) {
        if (error.read && /unknown name/.test(error.message)) {
          return { ok: false, message: 'Write it in terms of ' + names.join(', ') + ' only; ' + error.message + '.' };
        }
        throw error;
      }
      if (!isFinite(value) || !within(value, expects[k], tolerance)) return { ok: false };
    }
    return { ok: true };
  }

  function judgeChoice(field) {
    var chosen = Array.prototype.filter.call(field.querySelectorAll('input'), function (input) { return input.checked; })
      .map(function (input) { return input.value; }).sort().join(',');
    if (!chosen) return { ok: false, empty: true };
    return { ok: chosen === field.dataset.correct.split(',').sort().join(',') };
  }

  function checkKey(form) { return chapterSlug + '#' + form.dataset.exercise; }

  function markField(field, verdict) {
    var mark = field.querySelector('.kb-check__mark');
    field.classList.toggle('kb-check__field--right', verdict.ok === true);
    field.classList.toggle('kb-check__field--wrong', verdict.ok === false && !verdict.empty);
    var input = field.querySelector('input[type="text"]');
    if (input) input.setAttribute('aria-invalid', verdict.ok === false && !verdict.empty ? 'true' : 'false');
    if (mark) mark.textContent = verdict.ok ? '✓ Right' : (verdict.empty ? '' : (verdict.message || '✗ Not this'));
  }

  function runCheck(form) {
    var fields = form.querySelectorAll('.kb-check__field');
    var right = 0;
    var answered = 0;
    Array.prototype.forEach.call(fields, function (field) {
      var verdict;
      if (field.dataset.kind === 'choice') {
        verdict = judgeChoice(field);
      } else {
        var input = field.querySelector('input[type="text"]');
        if (!input.value.trim()) {
          verdict = { ok: false, empty: true };
        } else {
          try {
            verdict = field.dataset.kind === 'expression' ? judgeExpression(field, input.value) : judgeNumber(field, input.value);
          } catch (error) {
            verdict = { ok: false, message: 'Could not read that: ' + (error.read ? error.message : 'check the brackets') + '.' };
          }
        }
      }
      if (!verdict.empty) answered++;
      if (verdict.ok) right++;
      markField(field, verdict);
    });
    var result = form.querySelector('.kb-check__result');
    var total = fields.length;
    if (!answered) {
      result.textContent = total === 1 ? 'Type an answer first.' : 'Answer at least one part first.';
    } else if (right === total) {
      result.textContent = total === 1 ? 'Correct.' : 'All ' + total + ' parts correct.';
      var fresh = loadState();
      fresh.checks[checkKey(form)] = { t: Date.now() };
      saveState(fresh);
      form.classList.add('kb-check--solved');
    } else {
      var item = form.closest('li');
      var hint = item && item.querySelector('details.kb-panel--hint') ? ' Stuck? Open the Hint.' : '';
      result.textContent = (total === 1 ? 'Not yet.' : right + ' of ' + total + ' parts correct so far.') + hint;
    }
  }

  if (chapterPage) {
    var solved = loadState().checks;
    article.querySelectorAll('form.kb-check').forEach(function (form) {
      form.hidden = false;
      if (solved[checkKey(form)]) {
        form.classList.add('kb-check--solved');
        form.querySelector('.kb-check__result').textContent = 'You checked this one before.';
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        runCheck(form);
      });
      form.addEventListener('input', function (event) {
        var field = event.target.closest('.kb-check__field');
        if (field) markField(field, { ok: null, empty: true });
      });
    });
  }

  // --- Recall ---------------------------------------------------------------
  //
  // Numbered definitions, theorems, propositions, lemmas, and corollaries are the cards. Ratings go into
  // five boxes; "Knew it" moves a card up a box and makes it due again after that box's interval.

  var RECALL_KINDS = /\bkb-statement--(definition|theorem|proposition|lemma|corollary)\b/;
  var BOX_DAYS = [1, 3, 7, 16, 35];
  var DAY = 24 * 60 * 60 * 1000;

  function recallLabel(statement) {
    var strong = statement.querySelector('p > strong');
    return strong ? strong.textContent.trim().replace(/\.$/, '') : labelFor(statement.id);
  }

  function rate(key, label, chapterTitle, knew) {
    var fresh = loadState();
    var card = fresh.recall[key] || { box: 0 };
    card.box = knew ? Math.min(card.box + 1, BOX_DAYS.length) : 0;
    card.due = Date.now() + (knew ? BOX_DAYS[card.box - 1] * DAY : 0);
    card.label = label;
    card.chapterTitle = chapterTitle;
    card.t = Date.now();
    fresh.recall[key] = card;
    if (!saveState(fresh)) say('This browser is not saving ratings.');
    return card;
  }

  function dueText(card) {
    if (!card || !card.due) return '';
    var days = Math.round((card.due - Date.now()) / DAY);
    return days <= 0 ? 'Due for review' : 'Next review in ' + days + (days === 1 ? ' day' : ' days');
  }

  var recallPrepared = false;
  var recallToggle = null;

  // Split each statement's first paragraph after its bold label, so recall mode can hide the rest.
  function prepareRecall() {
    if (recallPrepared) return;
    recallPrepared = true;
    var chapterTitle = document.title.split(' | ')[0];
    article.querySelectorAll('.kb-statement[id]').forEach(function (statement) {
      if (!RECALL_KINDS.test(statement.className)) return;
      var first = statement.firstElementChild;
      var strong = first && first.tagName === 'P' ? first.querySelector(':scope > strong:first-child') : null;
      if (!strong) return;
      var rest = el('span', 'kb-recall-rest');
      while (strong.nextSibling) rest.appendChild(strong.nextSibling);
      first.appendChild(rest);
      statement.classList.add('kb-recallable');
      var proof = statement.nextElementSibling;
      if (proof && proof.classList.contains('kb-statement--proof')) proof.classList.add('kb-recall-proof');
      var key = chapterSlug + '#' + statement.id;
      var label = recallLabel(statement);
      var controls = el('div', 'kb-recall-controls');
      var show = el('button', 'kb-button kb-recall-controls__show', 'Show statement');
      show.type = 'button';
      var knew = el('button', 'kb-button kb-recall-controls__knew', 'Knew it');
      knew.type = 'button';
      var notYet = el('button', 'kb-button kb-recall-controls__not-yet', 'Not yet');
      notYet.type = 'button';
      var status = el('span', 'kb-recall-controls__status');
      status.textContent = dueText(loadState().recall[key]);
      knew.hidden = notYet.hidden = true;
      controls.appendChild(show);
      controls.appendChild(notYet);
      controls.appendChild(knew);
      controls.appendChild(status);
      statement.appendChild(controls);
      function reveal(open) {
        statement.classList.toggle('kb-recall-shown', open);
        if (proof && proof.classList.contains('kb-recall-proof')) proof.classList.toggle('kb-recall-proof--shown', open);
        show.hidden = open;
        knew.hidden = notYet.hidden = !open;
        if (open) knew.focus();
        layoutSideNotes();
      }
      show.addEventListener('click', function () { reveal(true); });
      [knew, notYet].forEach(function (button) {
        button.addEventListener('click', function () {
          var card = rate(key, label, chapterTitle, button === knew);
          status.textContent = button === knew ? 'Saved. ' + dueText(card) + '.' : 'Saved. It will come up again in your next session.';
          knew.hidden = notYet.hidden = true;
        });
      });
    });
  }

  function setRecallMode(on, announce) {
    if (on) prepareRecall();
    document.documentElement.classList.toggle('kb-recall-on', on);
    article.querySelectorAll('.kb-recallable.kb-recall-shown').forEach(function (statement) {
      statement.classList.remove('kb-recall-shown');
      var show = statement.querySelector('.kb-recall-controls__show');
      if (show) show.hidden = false;
      statement.querySelectorAll('.kb-recall-controls__knew, .kb-recall-controls__not-yet').forEach(function (b) { b.hidden = true; });
    });
    article.querySelectorAll('.kb-recall-proof--shown').forEach(function (proof) { proof.classList.remove('kb-recall-proof--shown'); });
    if (recallToggle) {
      recallToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      recallToggle.textContent = on ? 'Recall mode: on' : 'Recall mode';
    }
    var fresh = loadState();
    fresh.recallMode = on;
    saveState(fresh);
    if (announce) say(on ? 'Recall mode on: statements are hidden until you show them.' : 'Recall mode off.');
    layoutSideNotes();
  }

  if (chapterPage && article.querySelector('.kb-statement[id]')) {
    var tools = el('div', 'kb-chapter-tools');
    recallToggle = el('button', 'kb-button kb-chapter-tools__recall', 'Recall mode');
    recallToggle.type = 'button';
    recallToggle.setAttribute('aria-pressed', 'false');
    recallToggle.title = 'Hide definitions and theorems to test yourself (r)';
    recallToggle.addEventListener('click', function () { setRecallMode(!document.documentElement.classList.contains('kb-recall-on'), true); });
    tools.appendChild(recallToggle);
    var help = el('button', 'kb-button kb-chapter-tools__help', 'Shortcuts');
    help.type = 'button';
    help.setAttribute('aria-keyshortcuts', '?');
    help.addEventListener('click', function () { showHelp(); });
    tools.appendChild(help);
    var deps = article.querySelector(':scope > .kb-chapter-deps');
    if (deps) deps.insertAdjacentElement('afterend', tools);
    else article.insertBefore(tools, article.firstChild);
    if (loadState().recallMode) afterMath(function () { setRecallMode(true, false); });
  }

  // A session on the course page: due cards first, then unseen ones in reading order.
  function recallSession(chapterList, scope) {
    var dialog = el('dialog', 'kb-dialog kb-recall-session');
    dialog.setAttribute('aria-labelledby', 'kb-recall-session-title');
    var header = el('div', 'kb-dialog-header');
    var title = el('h2', '', 'Recall');
    title.id = 'kb-recall-session-title';
    var close = el('button', 'kb-button', 'Close');
    close.type = 'button';
    header.appendChild(title);
    header.appendChild(close);
    var body = el('div', 'kb-recall-session__body');
    body.textContent = 'Gathering statements…';
    dialog.appendChild(header);
    dialog.appendChild(body);
    document.body.appendChild(dialog);
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () { dialog.remove(); if (coursePage) renderRecallSummary(); });
    dialog.showModal();

    var chosen = chapterList.filter(function (chapter) {
      if (scope === 'all') return true;
      if (scope === 'started') return !!state.position[chapter.slug];
      return chapter.slug === scope;
    });
    Promise.all(chosen.map(function (chapter) {
      return fetchPage(chapter.href).then(function (doc) {
        return Array.prototype.filter.call(doc.querySelectorAll('#main-content .kb-statement[id]'), function (node) {
          return RECALL_KINDS.test(node.className);
        }).map(function (node) {
          return { key: chapter.slug + '#' + node.id, node: node, chapter: chapter, label: recallLabel(node) };
        });
      }, function () { return []; });
    })).then(function (lists) {
      var all = [].concat.apply([], lists);
      var ratings = loadState().recall;
      var now = Date.now();
      var due = all.filter(function (card) { return ratings[card.key] && ratings[card.key].due <= now; })
        .sort(function (a, b) { return ratings[a.key].due - ratings[b.key].due; });
      var unseen = all.filter(function (card) { return !ratings[card.key]; });
      var cards = due.concat(unseen).slice(0, 20);
      var tally = { knew: 0, notYet: 0 };
      var index = 0;
      if (!cards.length) {
        body.textContent = '';
        body.appendChild(el('p', '', all.length ? 'Nothing is due, and you have rated every statement in these chapters. Come back later, or choose all chapters.' : 'These chapters have no numbered statements to recall yet.'));
        return;
      }

      function showCard() {
        body.textContent = '';
        if (index >= cards.length) {
          body.appendChild(el('p', 'kb-recall-session__done', 'Done: ' + tally.knew + ' knew it, ' + tally.notYet + ' not yet.'));
          body.appendChild(el('p', 'kb-course__hint', 'Cards you knew come back after 1, 3, 7, 16, then 35 days; the others come back next session.'));
          var again = el('button', 'kb-button', 'Close');
          again.type = 'button';
          again.addEventListener('click', function () { dialog.close(); });
          body.appendChild(again);
          again.focus();
          return;
        }
        var card = cards[index];
        var rating = ratings[card.key];
        var progress = el('p', 'kb-recall-session__progress', 'Card ' + (index + 1) + ' of ' + cards.length + ' · ' + (rating ? 'review' : 'new'));
        var where = el('a', 'kb-recall-session__where', card.chapter.title);
        where.href = card.chapter.href + '#' + card.node.id;
        var prompt = el('p', 'kb-recall-session__prompt', card.label);
        var hint = el('p', 'kb-course__hint', 'State it to yourself, then show it.');
        var statement = el('div', 'kb-recall-session__statement');
        statement.hidden = true;
        var actions = el('div', 'kb-recall-session__actions');
        var show = el('button', 'kb-button kb-recall-session__show', 'Show statement');
        show.type = 'button';
        show.setAttribute('aria-keyshortcuts', 'Space');
        var notYet = el('button', 'kb-button', 'Not yet');
        notYet.type = 'button';
        notYet.setAttribute('aria-keyshortcuts', '1');
        var knew = el('button', 'kb-button kb-recall-session__knew', 'Knew it');
        knew.type = 'button';
        knew.setAttribute('aria-keyshortcuts', '2');
        notYet.hidden = knew.hidden = true;
        actions.appendChild(show);
        actions.appendChild(notYet);
        actions.appendChild(knew);
        body.appendChild(progress);
        body.appendChild(where);
        body.appendChild(prompt);
        body.appendChild(hint);
        body.appendChild(statement);
        body.appendChild(actions);
        function reveal() {
          statement.textContent = '';
          statement.appendChild(cleanClone(card.node));
          statement.hidden = false;
          hint.hidden = true;
          show.hidden = true;
          notYet.hidden = knew.hidden = false;
          knew.focus();
          var mj = window.MathJax;
          if (mj && mj.typesetPromise) mj.typesetPromise([statement]).catch(function () {});
        }
        function answer(known) {
          rate(card.key, card.label, card.chapter.title, known);
          tally[known ? 'knew' : 'notYet']++;
          index++;
          showCard();
        }
        show.addEventListener('click', reveal);
        notYet.addEventListener('click', function () { answer(false); });
        knew.addEventListener('click', function () { answer(true); });
        dialog.onkeydown = function (event) {
          if (event.metaKey || event.ctrlKey || event.altKey) return;
          if (event.key === ' ' && !show.hidden && event.target.tagName !== 'A') { event.preventDefault(); reveal(); }
          else if (event.key === '1' && !notYet.hidden) { event.preventDefault(); answer(false); }
          else if (event.key === '2' && !knew.hidden) { event.preventDefault(); answer(true); }
        };
        show.focus();
      }
      showCard();
    });
  }

  var renderRecallSummary = function () {};

  // --- Course front page: continue, progress, notes -------------------------

  function download(name, type, text) {
    var link = el('a');
    link.href = URL.createObjectURL(new Blob([text], { type: type }));
    link.download = name;
    document.body.appendChild(link);
    link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 0);
  }

  function courseFrontPage() {
    var chapters = {};
    document.querySelectorAll('.kb-chapter-list a').forEach(function (link) {
      var slug = new URL(link.href).pathname.replace(/\/$/, '').split('/').pop();
      var title = link.querySelector('.kb-chapter-list__title');
      var number = link.querySelector('.kb-chapter-list__number');
      var name = title ? title.textContent.trim() : slug;
      var n = number ? number.textContent.trim() : '';
      chapters[slug] = {
        slug: slug,
        href: link.getAttribute('href'),
        link: link,
        title: /^\d+$/.test(n) ? 'Chapter ' + n + ': ' + name : name,
        statements: parseInt(link.dataset.statements || '0', 10),
        checks: parseInt(link.dataset.checks || '0', 10)
      };
    });
    var chapterList = Object.keys(chapters).map(function (slug) { return chapters[slug]; });
    var courseTitle = (document.querySelector('.page-nav__title h1') || {}).textContent || document.title;

    var continueLine = document.querySelector('.kb-course__continue');
    var last = state.last && state.position[state.last];
    if (continueLine && last && chapters[state.last]) {
      continueLine.textContent = '';
      var go = el('a', 'kb-course__continue-link');
      go.href = chapters[state.last].link.getAttribute('href') + (last.id ? '#' + last.id : '');
      go.textContent = 'Continue reading: ' + chapters[state.last].title + (last.label ? ', ' + last.label : '');
      continueLine.appendChild(go);
      continueLine.hidden = false;
    }

    function solvedIn(slug) {
      return Object.keys(state.checks).filter(function (key) { return key.split('#')[0] === slug; }).length;
    }

    Object.keys(chapters).forEach(function (slug) {
      var position = state.position[slug];
      var meta = chapters[slug].link.querySelector('.kb-chapter-list__meta');
      if (!meta) return;
      var solvedHere = solvedIn(slug);
      if (solvedHere && chapters[slug].checks) {
        var checked = meta.querySelector('.kb-chapter-list__checks');
        if (checked) checked.textContent = solvedHere + ' of ' + chapters[slug].checks + ' answers checked';
      }
      var node = document.querySelector('.kb-map [data-chapter="' + slug + '"]');
      if (!position) return;
      var done = position.furthest >= 0.97;
      if (node) node.classList.add(done ? 'kb-map__node--read' : 'kb-map__node--started');
      var status = el('span', 'kb-chapter-status kb-chapter-status--' + (done ? 'read' : 'started'),
        done ? 'Read' : 'In progress · ' + Math.round(position.furthest * 100) + '%');
      meta.appendChild(document.createTextNode(meta.textContent.trim() ? ' · ' : ''));
      meta.appendChild(status);
    });

    var recall = document.getElementById('kb-recall');
    if (recall) {
      var total = chapterList.reduce(function (sum, chapter) { return sum + chapter.statements; }, 0);
      var scope = recall.querySelector('.kb-recall__scope');
      chapterList.forEach(function (chapter) {
        if (!chapter.statements) return;
        var option = el('option', '', chapter.title);
        option.value = chapter.slug;
        scope.appendChild(option);
      });
      if (!Object.keys(state.position).length) scope.value = 'all';
      renderRecallSummary = function () {
        var ratings = loadState().recall;
        var keys = Object.keys(ratings).filter(function (key) { return chapters[key.split('#')[0]]; });
        var due = keys.filter(function (key) { return ratings[key].due <= Date.now(); }).length;
        var known = keys.filter(function (key) { return ratings[key].box >= 3; }).length;
        recall.querySelector('.kb-recall__summary').textContent = total + ' definitions and results to recall. ' +
          (keys.length ? due + ' due for review, ' + Math.max(total - keys.length, 0) + ' not yet tried, ' + known + ' known well.' : 'None tried yet.');
      };
      renderRecallSummary();
      recall.querySelector('.kb-recall__start').addEventListener('click', function () { recallSession(chapterList, scope.value); });
      if (!storageOK) {
        recall.querySelector('.kb-recall__summary').textContent = 'This browser is not saving data (for example a private window), so ratings will not be kept.';
      }
      recall.hidden = !total;
    }

    var section = document.getElementById('kb-course-notes');
    if (!section) return;
    function renderList() {
      var current = loadState();
      var list = section.querySelector('.kb-course-notes__list');
      list.textContent = '';
      var keys = Object.keys(current.notes);
      var count = section.querySelector('.kb-course-notes__count');
      count.textContent = keys.length ? keys.length + (keys.length === 1 ? ' note' : ' notes') + ', saved in this browser only.' : 'No notes yet. On any chapter page, use the note button beside a section, theorem, example, exercise, or figure, or press m.';
      var order = Object.keys(chapters);
      var groups = {};
      keys.forEach(function (key) {
        var slug = key.split('#')[0];
        (groups[slug] = groups[slug] || []).push(key);
      });
      Object.keys(groups).sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); }).forEach(function (slug) {
        var group = el('div', 'kb-course-notes__group');
        group.appendChild(el('h3', '', chapters[slug] ? chapters[slug].title : (current.notes[groups[slug][0]].chapterTitle || slug)));
        groups[slug].forEach(function (key) {
          var note = current.notes[key];
          var item = el('div', 'kb-course-notes__item');
          var link = el('a', '', note.label + (note.moved ? ' (place moved)' : ''));
          link.href = root + slug + '/' + (note.moved ? '' : '#' + key.split('#')[1]);
          var text = el('p', 'kb-note__text', note.text);
          var remove = el('button', 'kb-note__edit', 'Delete');
          remove.type = 'button';
          remove.addEventListener('click', function () {
            var fresh = loadState();
            delete fresh.notes[key];
            saveState(fresh);
            renderList();
            say('Note deleted.');
          });
          item.appendChild(link);
          item.appendChild(remove);
          item.appendChild(text);
          group.appendChild(item);
        });
        list.appendChild(group);
      });
      section.querySelector('[data-action="markdown"]').disabled = !keys.length;
      section.querySelector('[data-action="backup"]').disabled = !keys.length && !Object.keys(current.recall).length && !Object.keys(current.checks).length;
    }

    section.querySelector('[data-action="markdown"]').addEventListener('click', function () {
      var current = loadState();
      var lines = ['# Notes: ' + courseTitle.trim(), ''];
      var bySlug = {};
      Object.keys(current.notes).forEach(function (key) { (bySlug[key.split('#')[0]] = bySlug[key.split('#')[0]] || []).push(key); });
      Object.keys(chapters).concat(Object.keys(bySlug).filter(function (slug) { return !chapters[slug]; })).forEach(function (slug) {
        if (!bySlug[slug]) return;
        lines.push('## ' + (chapters[slug] ? chapters[slug].title : slug), '');
        bySlug[slug].forEach(function (key) {
          var note = current.notes[key];
          lines.push('### [' + note.label + '](' + root + slug + '/#' + key.split('#')[1] + ')', '', note.text, '');
        });
      });
      download(root.split('/').filter(Boolean).pop() + '-notes.md', 'text/markdown', lines.join('\n'));
    });

    section.querySelector('[data-action="backup"]').addEventListener('click', function () {
      var current = loadState();
      download(root.split('/').filter(Boolean).pop() + '-notes-backup.json', 'application/json',
        JSON.stringify({ format: 'kb-course-notes', version: 2, course: root, notes: current.notes, position: current.position, recall: current.recall, checks: current.checks }, null, 2));
    });

    var picker = section.querySelector('input[type="file"]');
    section.querySelector('[data-action="restore"]').addEventListener('click', function () { picker.click(); });
    picker.addEventListener('change', function () {
      var file = picker.files && picker.files[0];
      if (!file) return;
      file.text().then(function (text) {
        var backup = JSON.parse(text);
        if (!backup || backup.format !== 'kb-course-notes' || typeof backup.notes !== 'object') throw new Error('format');
        var current = loadState();
        var added = 0;
        Object.keys(backup.notes).forEach(function (key) {
          var incoming = backup.notes[key];
          if (!incoming || typeof incoming.text !== 'string') return;
          if (!current.notes[key] || (incoming.t || 0) > (current.notes[key].t || 0)) { current.notes[key] = incoming; added++; }
        });
        ['recall', 'checks'].forEach(function (part) {
          var incoming = backup[part];
          if (!incoming || typeof incoming !== 'object') return;
          Object.keys(incoming).forEach(function (key) {
            if (!current[part][key] || (incoming[key].t || 0) > (current[part][key].t || 0)) current[part][key] = incoming[key];
          });
        });
        if (backup.course !== root) say('This backup is from another course; its notes were added here anyway.');
        if (!saveState(current)) throw new Error('storage');
        renderList();
        say(added + (added === 1 ? ' note restored.' : ' notes restored.'));
      }).catch(function () {
        say('That file is not a notes backup.');
      }).then(function () { picker.value = ''; });
    });

    if (!storageOK) {
      section.querySelector('.kb-course-notes__count').textContent = 'This browser is not saving data (for example a private window), so notes and reading position are off.';
      section.querySelectorAll('button').forEach(function (button) { button.disabled = true; });
    } else {
      renderList();
    }
    section.hidden = false;
  }

  if (coursePage) courseFrontPage();

  // --- Keyboard -------------------------------------------------------------

  var SHORTCUTS = [
    ['j / k', 'Next / previous section'],
    ['n / p', 'Next / previous exercise'],
    ['] / [', 'Next / previous chapter'],
    ['h', 'Open or close the hint of the current exercise'],
    ['a', 'Open or close the answer'],
    ['s', 'Open or close the solution'],
    ['m', 'Write a note on the current block'],
    ['r', 'Turn recall mode on or off'],
    ['?', 'Show these shortcuts'],
    ['Esc', 'Close a preview or note editor']
  ];

  var helpDialog = null;
  function showHelp() {
    if (!helpDialog) {
      helpDialog = el('dialog', 'kb-dialog kb-shortcuts');
      helpDialog.setAttribute('aria-labelledby', 'kb-shortcuts-title');
      var header = el('div', 'kb-dialog-header');
      var title = el('h2', '', 'Keyboard shortcuts');
      title.id = 'kb-shortcuts-title';
      var close = el('button', 'kb-button', 'Close');
      close.type = 'button';
      close.addEventListener('click', function () { helpDialog.close(); });
      header.appendChild(title);
      header.appendChild(close);
      var list = el('dl', 'kb-shortcuts__list');
      SHORTCUTS.forEach(function (pair) {
        var key = el('dt');
        key.appendChild(el('kbd', '', pair[0]));
        list.appendChild(key);
        list.appendChild(el('dd', '', pair[1]));
      });
      helpDialog.appendChild(header);
      helpDialog.appendChild(list);
      document.body.appendChild(helpDialog);
    }
    helpDialog.showModal();
  }

  function sections() {
    return Array.prototype.slice.call(article.querySelectorAll('h2'));
  }

  function exercises() {
    return Array.prototype.map.call(article.querySelectorAll('.kb-exercise-anchor'), function (span) { return span.closest('li'); });
  }

  function step(items, direction) {
    if (!items.length) return null;
    var line = landingLine(items[0]);
    if (direction > 0) {
      return items.find(function (item) { return item.getBoundingClientRect().top > line + 12; }) || null;
    }
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].getBoundingClientRect().top < line - 12) return items[i];
    }
    return null;
  }

  var currentExercise = null;
  function exerciseInView() {
    if (currentExercise) {
      var rect = currentExercise.getBoundingClientRect();
      if (rect.bottom > NAV_OFFSET && rect.top < window.innerHeight) return currentExercise;
    }
    return exercises().find(function (item) {
      var rect = item.getBoundingClientRect();
      return rect.bottom > NAV_OFFSET + 8 && rect.top < window.innerHeight;
    }) || null;
  }

  function togglePanel(kind, name) {
    var item = exerciseInView();
    if (!item) { say('No exercise on screen.'); return; }
    var panel = item.querySelector('details.kb-panel--' + kind);
    if (!panel) { say('This exercise has no ' + name + '.'); return; }
    panel.open = !panel.open;
    if (panel.open) panel.scrollIntoView({ block: 'nearest', behavior: scrollBehavior });
  }

  function chapterLink(rel) {
    return document.querySelector('.kb-series-footer a[rel="' + rel + '"]');
  }

  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Escape') {
      if (!preview.hidden) { closePreview(preview.contains(document.activeElement)); return; }
      if (editor) { closeEditor(); return; }
      return;
    }
    var target = event.target;
    if (target.closest && target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], dialog')) return;
    if (document.querySelector('dialog[open]')) return;
    if (event.key === '?') { event.preventDefault(); showHelp(); return; }
    if (!chapterPage) return;
    var next;
    switch (event.key) {
      case 'j': case 'k':
        next = step(sections(), event.key === 'j' ? 1 : -1);
        if (next) goTo(next, true); else say(event.key === 'j' ? 'Last section.' : 'First section.');
        break;
      case 'n': case 'p':
        next = step(exercises(), event.key === 'n' ? 1 : -1);
        if (next) { currentExercise = next; goTo(next, true); } else say(event.key === 'n' ? 'No later exercise in this chapter.' : 'No earlier exercise in this chapter.');
        break;
      case ']': case '[':
        next = chapterLink(event.key === ']' ? 'next' : 'prev');
        if (next) location.href = next.href; else say(event.key === ']' ? 'This is the last page of the course.' : 'This is the first chapter.');
        break;
      case 'h': togglePanel('hint', 'hint'); break;
      case 'a': togglePanel('answer', 'answer'); break;
      case 's': togglePanel('solution', 'full solution'); break;
      case 'r':
        if (recallToggle) recallToggle.click();
        break;
      case 'm':
        next = currentBlock() || anchoredBlocks()[0];
        if (next) { event.preventDefault(); openEditor(next); }
        break;
      default:
        return;
    }
  });

  offerBack();
})();
