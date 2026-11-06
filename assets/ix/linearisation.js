/* Chapitre 1 : linéariser une diode autour de son point de fonctionnement.
   Équations du cours : i = I_S (e^{v/(nV_T)} − 1) (1.x, Shockley), droite de charge E_0 = R i + v (éq. Q),
   g = (I_Q + I_S)/(nV_T), r_d = 1/g, V_0 = V_Q − r_d I_Q ; petit signal δi = e_s/(R + r_d).
   Diode de référence : I_S = 8,7 fA, n = 1, V_T = 25,85 mV ; E_0 = 5 V, R = 1 kΩ -> V_Q ≈ 0,696 V, I_Q ≈ 4,30 mA. */
(function () {
  'use strict';
  window.IX = window.IX || {};
  var IS = 8.7e-15, N = 1, VT = 0.02585;
  function idiode(v) { return IS * (Math.exp(v / (N * VT)) - 1); }
  function solve(E, R) { // point du circuit E -> R -> diode
    var K = window.IX._ea;
    return K.bisect(function (v) { return idiode(v) - (E - v) / R; }, Math.min(E, 0) - 1, Math.max(E, 0) + 0.001, 90);
  }
  window.IX['linearisation'] = function mount(root) {
    var K = window.IX._ea; K.css();
    var S = { E0: 5, R: 1000, Em: 0.02, ph: 0 };
    var view = { t: 0 };
    var presets = [
      { label: 'Exemple du cours', title: 'E_0 = 5 V, R = 1 kΩ, e_s = 20 mV crête', v: { E0: 5, R: 1000, Em: 0.02 } },
      { label: 'Signal plus fort', title: 'e_s = 0,3 V crête : le modèle linéaire décroche', v: { E0: 5, R: 1000, Em: 0.3 } },
      { label: 'Polarisation faible', title: 'E_0 = 1 V : I_Q plus petit, r_d plus grand', v: { E0: 1, R: 1000, Em: 0.02 } },
      { label: 'Sans polarisation', title: 'E_0 = 0, E_m = 0,72 V (figure 1.10, à gauche)', v: { E0: 0, R: 1000, Em: 0.72 } }
    ];
    var cache = null;
    function compute(E0, R, Em) {
      var key = E0.toFixed(5) + '|' + R.toFixed(3) + '|' + Em.toFixed(6);
      if (cache && cache.key === key) return cache;
      var VQ = solve(E0, R), IQ = (E0 - VQ) / R, g = (IQ + IS) / (N * VT), rd = 1 / g, V0 = VQ - rd * IQ;
      var n = 160, ex = [], li = [], dvmax = 0, dimax = 0, dlmax = 0;
      for (var k = 0; k <= n; k++) {
        var t = 2 * k / n, es = Em * Math.sin(2 * Math.PI * t);
        var v = solve(E0 + es, R), i = (E0 + es - v) / R;
        ex.push([t, i - IQ]); li.push([t, es / (R + rd)]);
        dvmax = Math.max(dvmax, Math.abs(v - VQ)); dimax = Math.max(dimax, Math.abs(i - IQ)); dlmax = Math.max(dlmax, Math.abs(es / (R + rd)));
      }
      cache = { key: key, VQ: VQ, IQ: IQ, g: g, rd: rd, V0: V0, ex: ex, li: li, dvmax: dvmax, dimax: dimax, dlmax: dlmax };
      return cache;
    }
    var ctl, anim, clock, A, B, rd, note, gA, gB;
    function build() {
      root.innerHTML = '';
      var box = K.el('div', { cls: 'ixe' }, root);
      ctl = K.Controls(function () { cache = null; anim.kick(); });
      var top = K.el('div', { cls: 'ixe-top' }, box);
      K.el('span', { cls: 'ixe-tag' }, top, 'Préréglages');
      var pre = K.el('div', { cls: 'ixe-pre' }, top);
      presets.forEach(function (p) {
        ctl.button(pre, { label: p.label, title: p.title, apply: function () { for (var k in p.v) S[k] = p.v[k]; },
                          is: function () { for (var k in p.v) if (Math.abs(S[k] - p.v[k]) > 1e-9) return false; return true; } });
      });
      var grid = K.el('div', { cls: 'ixe-grid' }, box);
      var w = Math.max(320, Math.min(560, (root.clientWidth > 860 ? root.clientWidth / 2 : root.clientWidth) - 20));
      var H = Math.round(w * 0.68);
      // panneau A : caractéristique
      var pA = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgA = K.figure(pA, w, H, 'CARACTÉRISTIQUE, DROITE DE CHARGE ET TANGENTE EN Q');
      A = K.axes(svgA, { W: w, H: H, x: [0, 1], y: [0, 8], xt: [0, 0.2, 0.4, 0.6, 0.8, 1], yt: [0, 2, 4, 6, 8], xl: 'v (V)', yl: 'i (mA)' });
      var sA = K.el('div', { cls: 'ixe-strip' }, pA);
      ctl.slider(sA, { key: 'E0', label: 'E_0', min: 0, max: 10, step: 0.05, get: function () { return S.E0; }, set: function (v) { S.E0 = v; }, fmt: function (v) { return K.num(v, 2) + ' V'; } });
      ctl.slider(sA, { key: 'R', label: 'R', min: 100, max: 10000, log: true, snap: function (v) { return Math.round(v / 10) * 10; }, get: function () { return S.R; }, set: function (v) { S.R = v; }, fmt: function (v) { return K.si(v, 'Ω', 3); } });
      // panneau B : courant dans le temps
      var pB = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgB = K.figure(pB, w, H, 'VARIATION DU COURANT : EXACTE ET LINÉARISÉE');
      B = K.axes(svgB, { W: w, H: H, x: [0, 2], y: [-0.03, 0.03], xt: [0, 0.5, 1, 1.5, 2], xl: 't / T', yl: 'δi (mA)' });
      var sB = K.el('div', { cls: 'ixe-strip' }, pB);
      ctl.slider(sB, { key: 'Em', label: 'e_s crête', min: 0.001, max: 1, log: true, snap: function (v) { return v < 0.1 ? Math.round(v * 1e4) / 1e4 : Math.round(v * 1e3) / 1e3; }, get: function () { return S.Em; }, set: function (v) { S.Em = v; }, fmt: function (v) { return K.si(v, 'V', 3); } });
      var pl = ctl.button(sB, { label: '❚❚ Pause', cls: 'play on', apply: function () { clock.toggle(); }, is: function () { return clock && clock.on; } });
      rd = K.readouts(box, [['VQ', 'V_Q'], ['IQ', 'I_Q'], ['g', 'g = dI/dv en Q'], ['rd', 'r_d = 1/g'], ['V0', 'V_0 = V_Q − r_d I_Q'], ['dv', 'δv crête (exact)'], ['di', 'δi crête : exact / linéaire'], ['err', 'écart du modèle linéaire']]);
      note = K.el('p', { cls: 'ixe-note' }, box);
      K.el('p', { cls: 'ixe-cap' }, box, 'Diode du cours : <i>I</i><sub>S</sub> = 8,7 fA, <i>n</i> = 1, <i>V</i><sub>T</sub> = 25,85 mV. Le courant « exact » résout l’équation transcendante à chaque instant ; le courant « linéaire » est <i>e</i><sub>s</sub>/(<i>R</i> + <i>r</i><sub>d</sub>). Le point orange suit le signal, lentement (1 période en 4 s).');
      gA = { }; gB = { };
      ctl.refresh();
      pl._upd = function () { pl.innerHTML = clock.on ? '❚❚ Pause' : '▶ Lecture'; };
      anim = K.Anim(S, draw, 900);
      anim.kick(true);
      if (!clock) { clock = K.Clock(function (dt) { view.t = (view.t + dt / 4) % 2; drawMoving(); }); clock.start(root); }
      pl.addEventListener('click', function () { pl._upd(); }); pl._upd();
    }
    var D0 = null;
    function draw(D) {
      D0 = D;
      var r = compute(D.E0, D.R, D.Em);
      // A : échelle adaptée à I_Q et à la droite de charge
      var imax = Math.max(r.IQ * 1e3 * 1.8, (D.E0 + D.Em) / D.R * 1e3 * 0.25, 0.5);
      var yt = nice(imax);
      A.o.yt = yt.ticks; A.o.yf = function (v) { return K.num(v, K.dec(yt.ticks[1] || 1)); };
      A.set(null, [0, yt.max]);
      var cur = [], k;
      for (k = 0; k <= 200; k++) { var v = k / 200; cur.push([v, idiode(v) * 1e3]); }
      A.path(cur, { stroke: K.C.navy, 'stroke-width': 2.4 });
      A.path([[0, D.E0 / D.R * 1e3], [1, (D.E0 - 1) / D.R * 1e3]], { stroke: K.C.accent, 'stroke-width': 2 });
      A.path([[0, (r.IQ + r.g * (0 - r.VQ)) * 1e3], [1, (r.IQ + r.g * (1 - r.VQ)) * 1e3]], { stroke: K.C.green, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' });
      gA.ll = A.path([], { stroke: K.C.accent, 'stroke-width': 1.2, 'stroke-dasharray': '3 3', opacity: 0.8 });
      A.dot(r.VQ, r.IQ * 1e3, { fill: K.C.navy, r: 5 });
      A.text(r.VQ, r.IQ * 1e3, '  Q', { 'font-weight': 700, fill: K.C.navy, dy: -6 });
      if (r.V0 > 0 && r.V0 < 1) { A.dot(r.V0, 0, { fill: K.C.green, r: 4 }); A.text(r.V0, 0, 'V_0', { dy: -8, 'text-anchor': 'end', fill: K.C.green, 'font-size': 12 }); }
      legend(A, [[K.C.navy, 'diode (exponentielle)', ''], [K.C.accent, 'droite de charge', ''], [K.C.green, 'tangente en Q', '6 4']]);
      gA.pt = A.dot(r.VQ, r.IQ * 1e3);
      // B : δi(t)
      var mm = Math.max(r.dimax, r.dlmax) * 1.25 || 1e-5;
      var u = mm < 1e-3 ? [1e6, 'δi (µA)'] : [1e3, 'δi (mA)'];
      gB.u = u[0];
      var yb = nice(mm * u[0]);
      B.o.yl = u[1];
      B.o.yt = yb.ticks.concat(yb.ticks.slice(1).map(function (x) { return -x; }));
      B.o.yf = function (v) { return K.num(v, K.dec(yb.ticks[1] || 1)); };
      B.set(null, [-yb.max, yb.max]);
      var sc = function (a) { return a.map(function (p) { return [p[0], p[1] * u[0]]; }); };
      B.path(sc(r.ex), { stroke: K.C.navy, 'stroke-width': 2.4 });
      B.path(sc(r.li), { stroke: K.C.green, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      legend(B, [[K.C.navy, 'exact', ''], [K.C.green, 'linéarisé', '6 4']]);
      gB.cur = K.sv('line', { y1: B.T, y2: B.B, stroke: K.C.accent, 'stroke-width': 1.2 }, B.top);
      gB.pt = B.dot(0, 0);
      // valeurs
      rd.set('VQ', K.num(r.VQ, 3) + ' V'); rd.set('IQ', K.si(r.IQ, 'A', 3));
      rd.set('g', K.si(r.g, 'S', 4)); rd.set('rd', K.si(r.rd, 'Ω', 3)); rd.set('V0', K.num(r.V0, 3) + ' V');
      rd.set('dv', K.si(r.dvmax, 'V', 3));
      rd.set('di', K.si(r.dimax, 'A', 3) + ' / ' + K.si(r.dlmax, 'A', 3));
      var err = r.dimax > 0 ? Math.abs(r.dimax - r.dlmax) / r.dimax : 0;
      rd.set('err', K.num(100 * err, err < 0.01 ? 2 : 1) + ' %', err > 0.05);
      var tn = 2 * N * VT;
      note.innerHTML = D.E0 < 0.3 ? 'Sans polarisation, la diode ne conduit que sur les crêtes : le courant est un train d’impulsions, et le modèle linéaire en <i>Q</i> = (0, 0) ne prédit rien.'
        : r.dvmax < 0.1 * tn ? 'δ<i>v</i> = ' + K.si(r.dvmax, 'V', 2) + ' ≪ 2<i>nV</i><sub>T</sub> ≈ 52 mV : le modèle linéaire est excellent, les deux courbes se confondent.'
        : r.dvmax < tn ? 'δ<i>v</i> approche 2<i>nV</i><sub>T</sub> ≈ 52 mV : la courbe exacte commence à se déformer (alternances inégales).'
        : 'δ<i>v</i> dépasse 2<i>nV</i><sub>T</sub> : la diode sort du voisinage de <i>Q</i>, le modèle linéaire n’est plus valable.';
      ctl.refresh();
      drawMoving();
    }
    function drawMoving() {
      if (!D0 || !gA.pt) return;
      var r = compute(D0.E0, D0.R, D0.Em), t = view.t, es = D0.Em * Math.sin(2 * Math.PI * t);
      var v = solve(D0.E0 + es, D0.R), i = (D0.E0 + es - v) / D0.R;
      gA.pt.setAttribute('cx', A.X(v)); gA.pt.setAttribute('cy', A.Y(i * 1e3));
      gA.ll.setAttribute('d', 'M' + A.X(0) + ' ' + A.Y((D0.E0 + es) / D0.R * 1e3) + 'L' + A.X(1) + ' ' + A.Y((D0.E0 + es - 1) / D0.R * 1e3));
      gB.cur.setAttribute('x1', B.X(t)); gB.cur.setAttribute('x2', B.X(t));
      gB.pt.setAttribute('cx', B.X(t)); gB.pt.setAttribute('cy', B.Y((i - r.IQ) * gB.u));
    }
    function nice(m) {
      var p = Math.pow(10, Math.floor(Math.log10(m))), s = [1, 2, 2.5, 5, 10], st = p;
      for (var k = 0; k < s.length; k++) { st = s[k] * p / 2; if (m / st <= 5) break; }
      var max = Math.ceil(m / st) * st, ticks = [];
      for (var x = 0; x <= max + 1e-12; x += st) ticks.push(+x.toPrecision(6));
      return { max: max, ticks: ticks };
    }
    function legend(ax, items) {
      var g = K.sv('g', { 'font-size': 11.5 }, ax.top), x = ax.R - 8, y = ax.T + 14;
      items.forEach(function (it, k) {
        var t = K.text(g, x - 30, y + k * 16, it[1], { 'text-anchor': 'end', 'font-size': 11.5, fill: K.C.ink, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3 });
        K.sv('line', { x1: x - 24, x2: x, y1: y - 4 + k * 16, y2: y - 4 + k * 16, stroke: it[0], 'stroke-width': 2.2, 'stroke-dasharray': it[2] || null }, g);
      });
    }
    build();
    K.onResize(root, build);
  };
})();
