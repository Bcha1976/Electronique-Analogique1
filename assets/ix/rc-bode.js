/* Chapitre 2 : le RC vu dans le temps et en fréquence.
   Équations du cours : RC du_C/dt + u_C = u_e (2.x) ; échelon u_C = U(1 − e^{−t/τ}), τ = RC ;
   H(jω) = 1/(1 + jωRC), |H| = 1/√(1 + (ω/ω_c)²), φ = −arctan(ω/ω_c) ; carré ±U : régime établi, crête U·tanh(T/(4τ))
   (figure 2.4 : T = 20τ, 4τ, τ). Valeurs : R = 1 kΩ, C = 100 nF (figure des impédances), τ = 100 µs, f_c ≈ 1,59 kHz. */
(function () {
  'use strict';
  window.IX = window.IX || {};
  var R = 1000, Cc = 100e-9, TAU = R * Cc, FC = 1 / (2 * Math.PI * TAU);
  window.IX['rc-bode'] = function mount(root) {
    var K = window.IX._ea; K.css();
    var S = { r: 4 };   // r = T/τ
    var view = { t: 0 };
    var presets = [
      { label: 'T = 20τ', r: 20, title: 'Basse fréquence : u_C suit u_e' },
      { label: 'T = 4τ', r: 4, title: 'Figure 2.4, au centre' },
      { label: 'T = τ', r: 1, title: 'Haute fréquence : petit triangle' },
      { label: 'f = f<sub>c</sub>', r: 2 * Math.PI, title: 'Fondamentale à la fréquence de coupure : T = 2πτ' }
    ];
    var ctl, anim, clock, A, B, P, rd, note, g = {};
    function uc(t, r) { // régime établi, t en périodes, carré +U sur [0, 1/2), −U sur [1/2, 1)
      var a = Math.exp(-r / 2), V1 = -(1 - a) / (1 + a); // valeur en début de demi-période haute
      var x = ((t % 1) + 1) % 1;
      if (x < 0.5) return 1 + (V1 - 1) * Math.exp(-x * r);
      return -1 + (-V1 + 1) * Math.exp(-(x - 0.5) * r);
    }
    function build() {
      root.innerHTML = '';
      var box = K.el('div', { cls: 'ixe' }, root);
      ctl = K.Controls(function () { anim.kick(); });
      var top = K.el('div', { cls: 'ixe-top' }, box);
      K.el('span', { cls: 'ixe-tag' }, top, 'Préréglages');
      var pre = K.el('div', { cls: 'ixe-pre' }, top);
      presets.forEach(function (p) {
        ctl.button(pre, { label: p.label, title: p.title, apply: function () { S.r = p.r; }, is: function () { return Math.abs(S.r - p.r) < 1e-6; } });
      });
      var grid = K.el('div', { cls: 'ixe-grid' }, box);
      var w = Math.max(320, Math.min(560, (root.clientWidth > 860 ? root.clientWidth / 2 : root.clientWidth) - 20));
      var H = Math.round(w * 0.62);
      var sl = { key: 'r', label: 'T/τ', min: 0.5, max: 50, log: true, snap: function (v) { return Math.round(v * 100) / 100; },
                 get: function () { return S.r; }, set: function (v) { S.r = v; }, fmt: function (v) { return K.sig(v, 3); } };
      var pA = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgA = K.figure(pA, w, H, 'RÉPONSE TEMPORELLE (RÉGIME ÉTABLI)');
      A = K.axes(svgA, { W: w, H: H, x: [0, 2], y: [-1.25, 1.25], xt: [0, 0.5, 1, 1.5, 2], yt: [-1, -0.5, 0, 0.5, 1], xl: 't / T', yl: 'u / U' });
      var sA = K.el('div', { cls: 'ixe-strip' }, pA);
      ctl.slider(sA, sl);
      var pl = ctl.button(sA, { label: '❚❚ Pause', cls: 'play', apply: function () { clock.toggle(); }, is: function () { return clock && clock.on; } });
      var pB = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgB = K.figure(pB, w, H, 'DIAGRAMME DE BODE : GAIN ET HARMONIQUES DU CARRÉ');
      var Hb = Math.round(H * 0.62);
      B = K.axes(svgB, { W: w, H: Hb, b: 22, x: [FC / 100, FC * 100], xlog: true, y: [-50, 5], xt: [1e1, 1e2, 1e3, 1e4, 1e5],
                         xf: function (v) { return v >= 1e3 ? K.num(v / 1e3) + ' k' : K.num(v); }, yt: [-40, -30, -20, -10, 0], yl: 'G (dB)' });
      var gP = K.sv('g', { transform: 'translate(0,' + (Hb - 4) + ')' }, svgB);
      P = K.axes(gP, { W: w, H: H - Hb + 4, t: 6, x: [FC / 100, FC * 100], xlog: true, y: [-90, 0], xt: [1e1, 1e2, 1e3, 1e4, 1e5],
                       xf: function (v) { return v >= 1e3 ? K.num(v / 1e3) + ' k' : K.num(v); }, yt: [-90, -45, 0], xl: 'f (Hz)', yl: 'φ (°)' });
      var sB = K.el('div', { cls: 'ixe-strip' }, pB);
      ctl.slider(sB, sl);
      rd = K.readouts(box, [['f', 'f = 1/T'], ['ff', 'f / f_c'], ['G', 'G(f)'], ['ph', 'φ(f)'], ['pk', 'u_C crête (régime établi)'], ['h3', 'harmonique 3 : G(3f)']]);
      note = K.el('p', { cls: 'ixe-note' }, box);
      K.el('p', { cls: 'ixe-cap' }, box, '<i>R</i> = 1 kΩ, <i>C</i> = 100 nF : τ = <i>RC</i> = 100 µs, <i>f</i><sub>c</sub> = 1/(2πτ) ≈ 1,59 kHz. Le carré ±<i>U</i> a des harmoniques impaires d’amplitude 4<i>U</i>/(<i>k</i>π) ; chaque point orange est placé à <i>kf</i> sur la courbe de gain. Le trait vertical parcourt 2 périodes en 6 s.');
      anim = K.Anim(S, draw, 900);
      anim.kick(true);
      if (!clock) { clock = K.Clock(function (dt) { view.t = (view.t + dt / 3) % 2; moving(); }); clock.start(root); }
      function lbl() { pl.innerHTML = clock.on ? '❚❚ Pause' : '▶ Lecture'; }
      pl.addEventListener('click', lbl); lbl(); ctl.refresh();
    }
    var D0;
    function draw(D) {
      D0 = D; var r = D.r;
      A.draw();
      var ue = [[0, 1], [0.5, 1], [0.5, -1], [1, -1], [1, 1], [1.5, 1], [1.5, -1], [2, -1]];
      A.path(ue, { stroke: K.C.grey, 'stroke-width': 1.6, 'stroke-dasharray': '5 3' });
      var pts = []; for (var k = 0; k <= 400; k++) { var t = 2 * k / 400; pts.push([t, uc(t, r)]); }
      A.path(pts, { stroke: K.C.navy, 'stroke-width': 2.6 });
      var pk = Math.tanh(r / 4);
      A.path([[0, pk], [2, pk]], { stroke: K.C.accent, 'stroke-width': 1, 'stroke-dasharray': '2 3' });
      A.path([[0, -pk], [2, -pk]], { stroke: K.C.accent, 'stroke-width': 1, 'stroke-dasharray': '2 3' });
      leg(A, [[K.C.grey, 'u_e (carré ±U)', '5 3'], [K.C.navy, 'u_C', '']]);
      g.cur = K.sv('line', { y1: A.T, y2: A.B, stroke: K.C.accent, 'stroke-width': 1.2 }, A.top);
      g.pt = A.dot(0, 0);
      // Bode
      B.draw(); P.draw();
      var gp = [], pp = [];
      for (k = 0; k <= 300; k++) { var f = FC / 100 * Math.pow(10, 4 * k / 300), x = f / FC; gp.push([f, -10 * Math.log10(1 + x * x)]); pp.push([f, -Math.atan(x) * 180 / Math.PI]); }
      B.path([[FC / 100, 0], [FC, 0], [FC * 100, -40]], { stroke: K.C.pale, 'stroke-width': 1.5 });
      B.path(gp, { stroke: K.C.navy, 'stroke-width': 2.4 });
      P.path(pp, { stroke: K.C.navy, 'stroke-width': 2.2 });
      K.sv('line', { x1: B.X(FC), x2: B.X(FC), y1: B.T, y2: B.B, stroke: K.C.green, 'stroke-dasharray': '4 3' }, B.top);
      K.text(B.top, B.X(FC) + 4, B.B - 6, 'f_c', { fill: K.C.green, 'font-size': 12 });
      K.sv('line', { x1: P.X(FC), x2: P.X(FC), y1: P.T, y2: P.B, stroke: K.C.green, 'stroke-dasharray': '4 3' }, P.top);
      var f1 = 1 / (r * TAU);
      [1, 3, 5, 7, 9].forEach(function (h) {
        var f = h * f1; if (f > FC * 100) return; var x = f / FC, G = -10 * Math.log10(1 + x * x);
        B.dot(f, G, { r: h === 1 ? 6 : 4, fill: h === 1 ? K.C.accent : '#f0a35e' });
        if (h <= 3) K.text(B.top, B.X(f), B.Y(G) - 9, h === 1 ? 'f' : '3f', { 'text-anchor': 'middle', 'font-size': 11, fill: K.C.accent, 'font-weight': 700 });
      });
      var x1 = f1 / FC;
      P.dot(f1, -Math.atan(x1) * 180 / Math.PI, { r: 5 });
      rd.set('f', K.si(f1, 'Hz', 3)); rd.set('ff', K.sig(x1, 3));
      rd.set('G', K.num(-10 * Math.log10(1 + x1 * x1), 1) + ' dB'); rd.set('ph', K.num(-Math.atan(x1) * 180 / Math.PI, 1) + ' °');
      rd.set('pk', '±' + K.num(pk, 3) + ' U');
      rd.set('h3', K.num(-10 * Math.log10(1 + 9 * x1 * x1), 1) + ' dB');
      note.innerHTML = r >= 12 ? 'Période longue devant τ : le condensateur a le temps de se charger à chaque demi-période, <i>u</i><sub>C</sub> reproduit le carré aux arrondis près. La fondamentale est bien en dessous de <i>f</i><sub>c</sub>.'
        : r >= 3 ? 'Période de quelques τ : <i>u</i><sub>C</sub> n’atteint plus ±<i>U</i> (crête <i>U</i>·tanh(<i>T</i>/4τ)). La fondamentale approche <i>f</i><sub>c</sub>, les harmoniques sont déjà atténuées : les fronts s’arrondissent.'
        : 'Période courte : toutes les harmoniques, et même la fondamentale, sont au-delà de <i>f</i><sub>c</sub>, filtrées à −20 dB/décade. Il reste un petit triangle : le RC intègre.';
      ctl.refresh(); moving();
    }
    function moving() {
      if (!D0 || !g.pt) return;
      var t = view.t;
      g.cur.setAttribute('x1', A.X(t)); g.cur.setAttribute('x2', A.X(t));
      g.pt.setAttribute('cx', A.X(t)); g.pt.setAttribute('cy', A.Y(uc(t, D0.r)));
    }
    function leg(ax, items) {
      var gg = K.sv('g', {}, ax.top), x = ax.R - 8, y = ax.B - 10 - (items.length - 1) * 16;
      K.sv('rect', { x: x - 150, y: y - 14, width: 150, height: items.length * 16 + 6, fill: '#fff', opacity: 0.85 }, gg);
      items.forEach(function (it, k) {
        K.text(gg, x - 30, y + k * 16, it[1], { 'text-anchor': 'end', 'font-size': 11.5, fill: K.C.ink });
        K.sv('line', { x1: x - 24, x2: x, y1: y - 4 + k * 16, y2: y - 4 + k * 16, stroke: it[0], 'stroke-width': 2.2, 'stroke-dasharray': it[2] || null }, gg);
      });
    }
    build();
    K.onResize(root, build);
  };
})();
