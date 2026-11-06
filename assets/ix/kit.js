/* Électronique Analogique 1 : outils communs des interactifs (même contrat que le site « Semiconductor Devices Physics »).
   window.IX._ea : axes et tracés SVG, curseurs synchronisés (plusieurs copies d'un même réglage, chacune
   sous la figure qu'elle commande), boutons de préréglage, animation lente vers l'état demandé,
   nombres à la française (virgule décimale, préfixes SI). Chargé avant les modules. */
(function () {
  'use strict';
  window.IX = window.IX || {};
  if (window.IX._ea) return;
  var NS = 'http://www.w3.org/2000/svg';
  var C = { navy: '#1F3A5F', accent: '#D9771A', ink: '#1d2430', grey: '#6B6B6B', line: '#dde3ea', green: '#2E7D4F',
            blue: '#1F4E9A', red: '#A33A3A', violet: '#6a4c93', pale: '#c9d3df' };
  var CSS = [
    '.ixe{font:14px/1.4 "DejaVu Sans","Segoe UI",system-ui,sans-serif;color:#1d2430}',
    '.ixe *{box-sizing:border-box}',
    '.ixe-top{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin:0 0 10px}',
    '.ixe-tag{font-size:11px;font-weight:700;letter-spacing:.06em;color:#6B6B6B;text-transform:uppercase;white-space:nowrap}',
    '.ixe-pre{display:flex;flex-wrap:wrap;gap:5px}',
    '.ixe button.ixe-b{font:600 12.5px/1.2 inherit;font-family:inherit;padding:6px 10px;border:1px solid #c6d2e0;border-radius:6px;background:#fff;color:#1F3A5F;cursor:pointer;white-space:nowrap}',
    '.ixe button.ixe-b:hover{border-color:#1F3A5F}',
    '.ixe button.ixe-b.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}',
    '.ixe button.ixe-b.play{border-color:#D9771A;color:#D9771A}',
    '.ixe button.ixe-b.play.on{background:#D9771A;color:#fff}',
    '.ixe-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:14px}',
    '.ixe-panel{background:#fff;border:1px solid #dde3ea;border-radius:6px;min-width:0;display:flex;flex-direction:column}',
    '.ixe-ph{font:700 12.5px/1.3 inherit;letter-spacing:.04em;color:#1F3A5F;padding:8px 12px 0}',
    '.ixe-panel svg.ixe-fig{display:block;width:100%;height:auto}',
    '.ixe-strip{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:7px 10px;background:#f6f8fb;border-top:1px solid #dde3ea;border-radius:0 0 6px 6px;margin-top:auto}',
    '.ixe-sl{display:flex;align-items:center;gap:7px;flex:1 1 190px;min-width:0}',
    '.ixe-sl>span.l{white-space:nowrap}',
    '.ixe-sl>input{flex:1 1 80px;min-width:60px;width:auto;accent-color:#D9771A;margin:0}',
    '.ixe-sl>b{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;min-width:4.8em;text-align:right;color:#1F3A5F}',
    '.ixe-ck{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;font-size:13px}',
    '.ixe-ck input{accent-color:#D9771A;margin:0}',
    '.ixe-read{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}',
    '.ixe-v{display:flex;flex-direction:column;background:#fff;border:1px solid #dde3ea;border-radius:6px;padding:5px 10px;flex:1 1 120px;min-width:0}',
    '.ixe-v span{font-size:12px;color:#6B6B6B}',
    '.ixe-v b{font-size:15px;color:#1F3A5F;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.ixe-v.warn b{color:#A33A3A}',
    '.ixe-note{margin:8px 0 0;padding:7px 12px;border-left:3px solid #D9771A;background:#FDF3E7;font-size:13.5px;min-height:2.2em}',
    '.ixe-cap{margin:6px 0 0;font-size:12.5px;color:#6B6B6B}',
    '.ixe i{font-style:italic}.ixe sub,.ixe sup{font-size:.72em;line-height:0}',
    '.ixe table.ixe-t{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}',
    '.ixe table.ixe-t th,.ixe table.ixe-t td{padding:4px 6px;border-bottom:1px solid #eef1f5;text-align:right;white-space:nowrap}',
    '.ixe table.ixe-t th:first-child,.ixe table.ixe-t td:first-child{text-align:left}',
    '.ixe table.ixe-t th{font-size:11.5px;color:#6B6B6B;font-weight:700}',
    '.ixe .ixe-tw{overflow-x:auto;padding:4px 10px 8px}',
    '.ixe svg text{font-family:"DejaVu Sans","Segoe UI",system-ui,sans-serif}',
    '@media (max-width:520px){.ixe-strip{padding:6px 7px}.ixe-sl{flex-basis:100%}.ixe button.ixe-b{padding:5px 8px;font-size:12px}.ixe-v{flex-basis:45%}}'
  ].join('\n');
  function css() {
    if (document.getElementById('ix-ea-css')) return;
    var s = document.createElement('style'); s.id = 'ix-ea-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, parent, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'cls') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  /* nombres à la française */
  function num(x, d) {
    if (!isFinite(x)) return '∞';
    var s = (d == null ? x.toString() : x.toFixed(d));
    s = s.replace('-', '−').replace('.', ',');
    return s;
  }
  function dec(step) { for (var d = 0; d < 7; d++) { var a = step * Math.pow(10, d); if (Math.abs(a - Math.round(a)) < 1e-6 * Math.max(1, a)) return d; } return 6; }
  function sig(x, n) { // n chiffres significatifs
    if (x === 0 || !isFinite(x)) return num(x, 0);
    var e = Math.floor(Math.log10(Math.abs(x))), d = Math.max(0, n - 1 - e);
    return num(x, Math.min(d, 6));
  }
  var PRE = [[1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f']];
  function si(x, unit, n) {
    n = n || 3;
    if (!isFinite(x)) return '∞ ' + unit;
    if (x === 0) return '0 ' + unit;
    var a = Math.abs(x);
    for (var k = 0; k < PRE.length; k++) if (a >= PRE[k][0] * 0.9995 || k === PRE.length - 1) {
      return sig(x / PRE[k][0], n) + ' ' + PRE[k][1] + unit;
    }
  }
  /* étiquette : « V_Q » -> V italique, Q en indice ; « i_B (µA) » */
  function lab(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/([A-Za-zα-ωΔδτφ])_\{([^}]*)\}/g, '<i>$1</i><sub>$2</sub>')
      .replace(/([A-Za-zα-ωΔδτφ])_([A-Za-z0-9]+)/g, '<i>$1</i><sub>$2</sub>');
  }
  function svgText(parent, x, y, t, attrs) {
    var e = sv('text', Object.assign({ x: x, y: y, 'font-size': 12, fill: C.ink }, attrs || {}), parent);
    // indices : X_Y -> tspan décalé
    var parts = t.split(/([A-Za-zα-ωΔδτφ]_\{[^}]*\}|[A-Za-zα-ωΔδτφ]_[A-Za-z0-9]+)/);
    parts.forEach(function (p) {
      if (!p) return;
      var m = p.match(/^([A-Za-zα-ωΔδτφ])_\{?([^}]*)\}?$/);
      if (m) {
        sv('tspan', { 'font-style': 'italic' }, e).textContent = m[1];
        sv('tspan', { 'baseline-shift': 'sub', 'font-size': '75%' }, e).textContent = m[2];
        sv('tspan', { dx: 0 }, e).textContent = '';
      } else sv('tspan', {}, e).textContent = p;
    });
    return e;
  }

  /* axes : o = {W,H, l,t,r,b (marges), x:[a,b], y:[a,b], xlog, xt:[...], yt:[...], xl, yl, xf, yf} */
  function axes(svg, o) {
    var g = sv('g', {}, svg);
    var L = o.l || 48, T = o.t || 14, R = o.W - (o.r || 14), B = o.H - (o.b || 38);
    var ax = { g: g, L: L, T: T, R: R, B: B, o: o };
    ax.set = function (x, y) {
      if (x) o.x = x; if (y) o.y = y;
      var lx = o.xlog ? function (v) { return Math.log10(v); } : function (v) { return v; };
      var x0 = lx(o.x[0]), x1 = lx(o.x[1]);
      ax.X = function (v) { return L + (lx(v) - x0) / (x1 - x0) * (R - L); };
      ax.Y = function (v) { return B - (v - o.y[0]) / (o.y[1] - o.y[0]) * (B - T); };
      ax.draw();
    };
    ax.draw = function () {
      while (g.firstChild) g.removeChild(g.firstChild);
      var grid = sv('g', { stroke: '#eef1f5', 'stroke-width': 1 }, g);
      (o.xt || []).forEach(function (v) { if (v < Math.min(o.x[0], o.x[1]) || v > Math.max(o.x[0], o.x[1])) return; sv('line', { x1: ax.X(v), x2: ax.X(v), y1: T, y2: B }, grid); });
      (o.yt || []).forEach(function (v) { if (v < o.y[0] || v > o.y[1]) return; sv('line', { x1: L, x2: R, y1: ax.Y(v), y2: ax.Y(v) }, grid); });
      sv('rect', { x: L, y: T, width: R - L, height: B - T, fill: 'none', stroke: '#b9c4d2' }, g);
      if (o.y[0] < 0 && o.y[1] > 0) sv('line', { x1: L, x2: R, y1: ax.Y(0), y2: ax.Y(0), stroke: '#9aa7b8', 'stroke-width': 1 }, g);
      var tk = sv('g', { 'font-size': 11, fill: C.grey }, g);
      (o.xt || []).forEach(function (v) {
        if (v < Math.min(o.x[0], o.x[1]) || v > Math.max(o.x[0], o.x[1])) return;
        var t = sv('text', { x: ax.X(v), y: B + 14, 'text-anchor': 'middle' }, tk); t.textContent = o.xf ? o.xf(v) : num(v);
      });
      (o.yt || []).forEach(function (v) {
        if (v < o.y[0] || v > o.y[1]) return;
        var t = sv('text', { x: L - 5, y: ax.Y(v) + 4, 'text-anchor': 'end' }, tk); t.textContent = o.yf ? o.yf(v) : num(v);
      });
      if (o.xl) svgText(g, R, B + 30, o.xl, { 'text-anchor': 'end', 'font-size': 12, fill: C.ink });
      if (o.yl) svgText(g, L + 4, T + 12, o.yl, { 'font-size': 12, fill: C.ink, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3 });
      ax.c = sv('g', { 'clip-path': 'url(#' + ax.cid + ')' }, g);
      ax.top = sv('g', {}, g);
    };
    ax.cid = 'ixe-clip-' + Math.random().toString(36).slice(2);
    var cp = sv('clipPath', { id: ax.cid }, sv('defs', {}, svg));
    ax.clipRect = sv('rect', { x: L, y: T, width: R - L, height: B - T }, cp);
    ax.path = function (pts, attrs, parent) {
      var d = '', k;
      for (k = 0; k < pts.length; k++) {
        var p = pts[k];
        if (p == null || !isFinite(p[1])) { continue; }
        var X = ax.X(p[0]), Y = Math.max(-1e4, Math.min(1e4, ax.Y(p[1])));
        d += (d && pts[k - 1] != null ? 'L' : 'M') + X.toFixed(1) + ' ' + Y.toFixed(1);
      }
      return sv('path', Object.assign({ d: d, fill: 'none', stroke: C.navy, 'stroke-width': 2, 'stroke-linejoin': 'round' }, attrs || {}), parent || ax.c);
    };
    ax.dot = function (x, y, attrs, parent) {
      return sv('circle', Object.assign({ cx: ax.X(x), cy: ax.Y(y), r: 5.5, fill: C.accent, stroke: '#fff', 'stroke-width': 2 }, attrs || {}), parent || ax.top);
    };
    ax.text = function (x, y, t, attrs, parent) { return svgText(parent || ax.top, ax.X(x), ax.Y(y), t, attrs); };
    ax.set();
    return ax;
  }
  function figure(panel, W, H, title) {
    if (title) el('div', { cls: 'ixe-ph' }, panel, lab(title));
    return sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'ixe-fig', role: 'img' }, panel);
  }

  /* réglages synchronisés : model = {get(key), set(key,v), on()} ; chaque curseur créé pour une clé suit les autres */
  function Controls(onChange) {
    var inputs = {}, buttons = [];
    var self = {
      slider: function (parent, o) {
        // o = {key, label, min, max, step, get, set, fmt, log}
        var w = el('label', { cls: 'ixe-sl' }, parent);
        if (o.title) w.title = o.title;
        el('span', { cls: 'l' }, w, lab(o.label));
        var i = el('input', { type: 'range', min: o.log ? Math.log10(o.min) : o.min, max: o.log ? Math.log10(o.max) : o.max, step: o.log ? 0.001 : o.step, 'aria-label': o.aria || o.label.replace(/_/g, '') }, w);
        var b = el('b', {}, w);
        var rec = { o: o, i: i, b: b };
        (inputs[o.key] = inputs[o.key] || []).push(rec);
        i.addEventListener('input', function () {
          var v = o.log ? Math.pow(10, +i.value) : +i.value;
          if (o.snap) v = o.snap(v);
          o.set(v); onChange(o.key); self.refresh();
        });
        self.refresh();
        return w;
      },
      check: function (parent, o) {
        var w = el('label', { cls: 'ixe-ck' }, parent);
        var i = el('input', { type: 'checkbox' }, w); el('span', {}, w, o.label);
        i.checked = o.get();
        i.addEventListener('change', function () { o.set(i.checked); onChange(o.key); self.refresh(); });
        (inputs['ck:' + o.key] = inputs['ck:' + o.key] || []).push({ ck: true, o: o, i: i });
        return w;
      },
      button: function (parent, o) {
        var b = el('button', { type: 'button', cls: 'ixe-b' + (o.cls ? ' ' + o.cls : '') }, parent, o.label);
        if (o.title) b.title = o.title;
        b.addEventListener('click', function () { o.apply(); onChange(o.key || 'preset'); self.refresh(); });
        buttons.push({ b: b, o: o });
        return b;
      },
      refresh: function () {
        Object.keys(inputs).forEach(function (k) {
          inputs[k].forEach(function (r) {
            if (r.ck) { r.i.checked = r.o.get(); return; }
            var v = r.o.get(), iv = r.o.log ? Math.log10(v) : v;
            if (document.activeElement !== r.i || Math.abs(+r.i.value - iv) > 1e-9) r.i.value = iv;
            var t = r.o.fmt ? r.o.fmt(v) : num(v);
            if (r.b._t !== t) { r.b.innerHTML = t; r.b._t = t; }
          });
        });
        buttons.forEach(function (x) { if (x.o.is) x.b.classList.toggle('on', !!x.o.is()); });
      }
    };
    return self;
  }

  /* animation lente : D (affiché) rejoint S (demandé) en ~ms ; draw(D) à chaque image */
  function Anim(S, draw, ms) {
    var D = {}, k; for (k in S) D[k] = S[k];
    var raf = 0, last = 0, tau = (ms || 900) / 4;
    function step(t) {
      var dt = last ? Math.min(64, t - last) : 16; last = t;
      var a = 1 - Math.exp(-dt / tau), moving = false;
      for (var key in S) {
        if (typeof S[key] !== 'number') { D[key] = S[key]; continue; }
        var d = S[key] - D[key];
        var sc = Math.abs(S[key]) + Math.abs(D[key]) + 1e-12;
        if (Math.abs(d) <= 1e-4 * sc) D[key] = S[key]; else { D[key] += d * a; moving = true; }
      }
      draw(D);
      raf = moving ? requestAnimationFrame(step) : 0;
      if (!moving) last = 0;
    }
    return {
      D: D,
      kick: function (instant) {
        if (instant || reduce) { for (var key in S) D[key] = S[key]; if (raf) cancelAnimationFrame(raf); raf = 0; draw(D); return; }
        if (!raf) raf = requestAnimationFrame(step);
      }
    };
  }
  /* horloge pour les signaux qui défilent (lecture / pause) */
  function Clock(onTick) {
    var on = !reduce, raf = 0, last = 0, self;
    function f(t) { var dt = last ? Math.min(64, t - last) / 1000 : 0; last = t; onTick(dt); raf = on ? requestAnimationFrame(f) : 0; }
    self = {
      get on() { return on; },
      play: function () { if (!on) { on = true; last = 0; raf = requestAnimationFrame(f); } },
      pause: function () { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; },
      toggle: function () { if (on) self.pause(); else self.play(); },
      start: function (root) {
        if (on) raf = requestAnimationFrame(f);
        // arrêt quand l'interactif quitte la page (montage sur une autre page)
        var obs = setInterval(function () { if (!root.isConnected) { self.pause(); clearInterval(obs); } }, 2000);
      }
    };
    return self;
  }
  function onResize(root, fn) {
    var t = 0, w = root.clientWidth;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { if (root.clientWidth !== w) { w = root.clientWidth; fn(); } }, 150); });
  }
  function readouts(parent, defs) {
    var box = el('div', { cls: 'ixe-read' }, parent), out = {};
    defs.forEach(function (d) {
      var v = el('div', { cls: 'ixe-v' }, box);
      el('span', {}, v, lab(d[1]));
      out[d[0]] = { b: el('b', {}, v), v: v };
    });
    out.set = function (k, t, warn) { var r = out[k]; if (r.b._t !== t) { r.b.innerHTML = t; r.b._t = t; } r.v.classList.toggle('warn', !!warn); };
    return out;
  }
  function bisect(f, a, b, n) {
    var fa = f(a);
    for (var k = 0; k < (n || 80); k++) {
      var m = (a + b) / 2, fm = f(m);
      if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m;
    }
    return (a + b) / 2;
  }
  window.IX._ea = { css: css, el: el, sv: sv, num: num, dec: dec, sig: sig, si: si, lab: lab, text: svgText, axes: axes, figure: figure,
                    Controls: Controls, Anim: Anim, Clock: Clock, onResize: onResize, readouts: readouts, bisect: bisect, C: C, reduce: reduce };
})();
