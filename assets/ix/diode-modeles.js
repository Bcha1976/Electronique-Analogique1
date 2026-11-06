/* Chapitre 3 : quatre modèles de diode, un même circuit (E_0, R, diode).
   Modèles du cours (section 3.3, figure 3.x) : idéale (v = 0 si passante), seuil V_0, seuil et résistance (3.x) i = (v − V_0)/r_D,
   et le modèle exponentiel i = I_S (e^{v/(nV_T)} − 1) avec I_S = 8,7 fA, n = 1, V_T = 25,85 mV.
   Valeurs du chapitre 1 : V_0 = 0,65 V, r_D = 12 Ω ; E_0 = 5 V, R = 1 kΩ -> seuil + r_D : 4,30 mA et 0,702 V. */
(function () {
  'use strict';
  window.IX = window.IX || {};
  var IS = 8.7e-15, VT = 0.02585;
  window.IX['diode-modeles'] = function mount(root) {
    var K = window.IX._ea; K.css();
    var S = { E0: 5, R: 1000, V0: 0.65, rD: 12 };
    var show = { id: true, s: true, sr: true, ex: true };
    var M = [
      { k: 'id', name: 'idéale', col: '#8a94a6', dash: '2 3' },
      { k: 's', name: 'seuil V_0', col: '#2E7D4F', dash: '7 4' },
      { k: 'sr', name: 'seuil + r_D', col: '#D9771A', dash: '' },
      { k: 'ex', name: 'exponentiel', col: '#1F3A5F', dash: '' }
    ];
    var presets = [
      { label: 'Exemple du cours', title: 'E_0 = 5 V, R = 1 kΩ, V_0 = 0,65 V, r_D = 12 Ω', v: { E0: 5, R: 1000, V0: 0.65, rD: 12 } },
      { label: 'Petite tension (1 V)', title: 'E_0 = 1 V : l’idéale se trompe beaucoup', v: { E0: 1, R: 1000, V0: 0.65, rD: 12 } },
      { label: 'Petite résistance (47 Ω)', title: 'R = 47 Ω : r_D compte', v: { E0: 5, R: 47, V0: 0.65, rD: 12 } },
      { label: 'Grande tension (10 V)', title: 'E_0 = 10 V : tous les modèles se rejoignent', v: { E0: 10, R: 1000, V0: 0.65, rD: 12 } }
    ];
    function solve(D) {
      var E = D.E0, R = D.R, out = {};
      out.id = { i: Math.max(0, E / R), v: E > 0 ? 0 : E };
      out.s = E > D.V0 ? { i: (E - D.V0) / R, v: D.V0 } : { i: 0, v: E };
      out.sr = E > D.V0 ? { i: (E - D.V0) / (R + D.rD), v: D.V0 + D.rD * (E - D.V0) / (R + D.rD) } : { i: 0, v: E };
      var v = K.bisect(function (x) { return IS * (Math.exp(x / VT) - 1) - (E - x) / R; }, Math.min(E, 0) - 1, Math.max(E, 0) + 0.001, 90);
      out.ex = { i: (E - v) / R, v: v };
      return out;
    }
    function curve(k, D, v) {
      if (k === 'id') return v < 0 ? 0 : null;
      if (k === 's') return v < D.V0 ? 0 : null;
      if (k === 'sr') return v < D.V0 ? 0 : (v - D.V0) / D.rD;
      return IS * (Math.exp(v / VT) - 1);
    }
    var ctl, anim, A, B, tb, note;
    function build() {
      root.innerHTML = '';
      var box = K.el('div', { cls: 'ixe' }, root);
      ctl = K.Controls(function () { anim.kick(); });
      var top = K.el('div', { cls: 'ixe-top' }, box);
      K.el('span', { cls: 'ixe-tag' }, top, 'Préréglages');
      var pre = K.el('div', { cls: 'ixe-pre' }, top);
      presets.forEach(function (p) {
        ctl.button(pre, { label: p.label, title: p.title, apply: function () { for (var k in p.v) S[k] = p.v[k]; },
                          is: function () { for (var k in p.v) if (Math.abs(S[k] - p.v[k]) > 1e-9) return false; return true; } });
      });
      var grid = K.el('div', { cls: 'ixe-grid' }, box);
      var w = Math.max(320, Math.min(560, (root.clientWidth > 860 ? root.clientWidth / 2 : root.clientWidth) - 20));
      var H = Math.round(w * 0.7);
      var pA = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgA = K.figure(pA, w, H, 'LES MODÈLES ET LA DROITE DE CHARGE');
      A = K.axes(svgA, { W: w, H: H, x: [-0.05, 1], y: [0, 6], xt: [0, 0.2, 0.4, 0.6, 0.8, 1], yt: [0, 1, 2, 3, 4, 5, 6], xl: 'v (V)', yl: 'i (mA)' });
      var sA = K.el('div', { cls: 'ixe-strip' }, pA);
      ctl.slider(sA, { key: 'E0', label: 'E_0', min: 0.2, max: 12, step: 0.05, get: function () { return S.E0; }, set: function (v) { S.E0 = v; }, fmt: function (v) { return K.num(v, 2) + ' V'; } });
      ctl.slider(sA, { key: 'R', label: 'R', min: 10, max: 10000, log: true, snap: function (v) { return v < 100 ? Math.round(v) : Math.round(v / 10) * 10; }, get: function () { return S.R; }, set: function (v) { S.R = v; }, fmt: function (v) { return K.si(v, 'Ω', 3); } });
      M.forEach(function (m) { ctl.check(sA, { key: m.k, label: '<span style="color:' + m.col + ';font-weight:700">■</span> ' + K.lab(m.name), get: function () { return show[m.k]; }, set: function (v) { show[m.k] = v; } }); });
      var pB = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgB = K.figure(pB, w, Math.round(H * 0.36), 'COURANT DONNÉ PAR CHAQUE MODÈLE');
      B = { svg: svgB, W: w, H: Math.round(H * 0.36) };
      var tw = K.el('div', { cls: 'ixe-tw' }, pB);
      tb = K.el('table', { cls: 'ixe-t' }, tw);
      var sB = K.el('div', { cls: 'ixe-strip' }, pB);
      ctl.slider(sB, { key: 'V0', label: 'V_0', min: 0.3, max: 0.8, step: 0.01, get: function () { return S.V0; }, set: function (v) { S.V0 = v; }, fmt: function (v) { return K.num(v, 2) + ' V'; } });
      ctl.slider(sB, { key: 'rD', label: 'r_D', min: 0, max: 50, step: 1, get: function () { return S.rD; }, set: function (v) { S.rD = v; }, fmt: function (v) { return K.num(v, 0) + ' Ω'; } });
      note = K.el('p', { cls: 'ixe-note' }, box);
      K.el('p', { cls: 'ixe-cap' }, box, 'Le modèle exponentiel est la diode du cours (<i>I</i><sub>S</sub> = 8,7 fA, <i>n</i> = 1, <i>V</i><sub>T</sub> = 25,85 mV) ; il sert de référence pour les écarts. Chaque point <i>Q</i> est l’intersection de la droite de charge <i>i</i> = (<i>E</i><sub>0</sub> − <i>v</i>)/<i>R</i> avec le modèle de même couleur ; il glisse lentement vers sa nouvelle place.');
      anim = K.Anim(S, draw, 900);
      anim.kick(true); ctl.refresh();
    }
    function draw(D) {
      var q = solve(D);
      var imax = Math.max(q.id.i, q.ex.i) * 1e3 * 1.25 || 1;
      var st = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500].filter(function (s) { return imax / s <= 6; })[0] || 1000;
      var top = Math.ceil(imax / st) * st, yt = []; for (var y = 0; y <= top + 1e-9; y += st) yt.push(+y.toPrecision(6));
      A.o.yt = yt; A.o.yf = function (v) { return K.num(v, K.dec(st)); };
      A.set(null, [0, top]);
      A.path([[-0.05, (D.E0 + 0.05) / D.R * 1e3], [1, (D.E0 - 1) / D.R * 1e3]], { stroke: '#b0472a', 'stroke-width': 1.6 });
      M.forEach(function (m) {
        if (!show[m.k]) return;
        var pts = [], v;
        if (m.k === 'ex' || m.k === 'sr') { for (var k = 0; k <= 300; k++) { v = -0.05 + 1.05 * k / 300; pts.push([v, curve(m.k, D, v) * 1e3]); } }
        else { var v0 = m.k === 'id' ? 0 : D.V0; pts = [[-0.05, 0], [v0, 0], [v0, 1e6]]; }
        A.path(pts, { stroke: m.col, 'stroke-width': m.k === 'ex' ? 2.6 : 2.2, 'stroke-dasharray': m.dash || null });
      });
      M.forEach(function (m) { if (show[m.k]) A.dot(q[m.k].v, q[m.k].i * 1e3, { fill: m.col, r: m.k === 'ex' ? 6 : 5 }); });
      A.text(1, Math.max(0, (D.E0 - 1) / D.R * 1e3), 'droite de charge', { 'text-anchor': 'end', dx: -6, dy: -6, 'font-size': 11.5, fill: '#b0472a', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3 });
      // barres
      var svg = B.svg; while (svg.firstChild) svg.removeChild(svg.firstChild);
      var L = 112, Rr = B.W - 70, h = (B.H - 16) / 4, mx = Math.max(q.id.i, q.ex.i, 1e-12);
      M.forEach(function (m, k) {
        var y = 8 + k * h, wv = (Rr - L) * q[m.k].i / mx;
        K.text(svg, L - 8, y + h / 2 + 4, m.name, { 'text-anchor': 'end', 'font-size': 12, fill: K.C.ink });
        K.sv('rect', { x: L, y: y + 4, width: Math.max(1, wv), height: h - 10, fill: m.col, rx: 3, opacity: show[m.k] ? 1 : 0.3 }, svg);
        K.text(svg, L + wv + 6, y + h / 2 + 4, K.si(q[m.k].i, 'A', 3), { 'font-size': 12, fill: K.C.navy, 'font-weight': 700 });
      });
      var ex = q.ex, rows = '<tr><th>Modèle</th><th><i>I</i></th><th><i>V</i></th><th>écart sur <i>I</i></th></tr>';
      M.forEach(function (m) {
        var e = ex.i > 0 ? (q[m.k].i - ex.i) / ex.i * 100 : 0;
        rows += '<tr><td><span style="color:' + m.col + ';font-weight:700">■</span> ' + K.lab(m.name) + '</td><td>' + K.si(q[m.k].i, 'A', 3) + '</td><td>' + K.num(q[m.k].v, 3) + ' V</td><td' + (Math.abs(e) > 10 ? ' style="color:#A33A3A;font-weight:700"' : '') + '>' + (m.k === 'ex' ? 'référence' : (e >= 0 ? '+' : '') + K.num(e, 1) + ' %') + '</td></tr>';
      });
      tb.innerHTML = rows;
      var eid = ex.i > 0 ? Math.abs(q.id.i - ex.i) / ex.i : 0, es = ex.i > 0 ? Math.abs(q.s.i - ex.i) / ex.i : 0;
      note.innerHTML = ex.i < 1e-6 ? '<i>E</i><sub>0</sub> est sous le seuil : la diode est pratiquement bloquée, seul le modèle idéal la croit passante.'
        : eid > 0.3 ? 'Les tensions du circuit ne sont pas grandes devant 0,7 V : le modèle idéal se trompe de ' + K.num(eid * 100, 0) + ' %. Il faut au moins le seuil.'
        : es > 0.02 && D.R < 200 ? 'Avec une petite résistance, le courant est fort et la pente de la diode compte : seul « seuil + <i>r</i><sub>D</sub> » suit le modèle exponentiel.'
        : eid < 0.1 ? 'Grande tension devant 0,7 V : même le modèle idéal donne le courant à ' + K.num(eid * 100, 0) + ' % près. Le plus simple suffit.'
        : 'Le modèle à seuil donne le courant à ' + K.num(es * 100, 1) + ' % près ; « seuil + <i>r</i><sub>D</sub> » fait encore mieux. Choisissez le plus simple qui répond à la question (tableau 3.2).';
      ctl.refresh();
    }
    build();
    K.onResize(root, build);
  };
})();
