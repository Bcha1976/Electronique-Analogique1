/* Chapitre 4 : montage générique du transistor npn (figure 4.7), du blocage à la saturation.
   Équations d'Ebers et Moll du cours (4.x) : i_C = I_S(e^{v_BE/V_T} − e^{v_BC/V_T}) − (I_S/β_R)(e^{v_BC/V_T} − 1),
   i_B = (I_S/β_F)(e^{v_BE/V_T} − 1) + (I_S/β_R)(e^{v_BC/V_T} − 1), avec l'effet Early (1 + v_CE/V_A) sur i_C ;
   droites de charge i_B = (V_BB − v_BE)/R_B (4.x) et i_C = (V_CC − v_CE)/R_C (4.x).
   Valeurs du cours : I_S = 1,2·10⁻¹⁴ A, β_F = 100, V_A = 100 V, V_T = 25,85 mV ; V_CC = 10 V, R_C = 1,25 kΩ, R_B = 50 kΩ.
   β_R n'est pas donné par le cours (« faible, sans importance ici ») : β_R = 0,12 est un choix pédagogique qui redonne
   le point E du tableau 4.3 (V_CE ≈ 0,23 V). Points A à E : V_BB = 0,5 / 2 / 3 / 4 / 5 V. */
(function () {
  'use strict';
  window.IX = window.IX || {};
  var IS = 1.2e-14, BF = 100, BR = 0.12, VA = 100, VT = 0.02585;
  function ex(x) { return Math.exp(Math.min(x, 60)); }
  function iC(vbe, vce) { var vbc = vbe - vce; return (IS * (ex(vbe / VT) - ex(vbc / VT)) - IS / BR * (ex(vbc / VT) - 1)) * (1 + Math.max(vce, 0) / VA); }
  function iB(vbe, vce) { var vbc = vbe - vce; return IS / BF * (ex(vbe / VT) - 1) + IS / BR * (ex(vbc / VT) - 1); }
  function bis(f, a, b, n) { var fa = f(a); for (var k = 0; k < n; k++) { var m = (a + b) / 2, fm = f(m); if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; }
  function solve(VBB, RB, VCC, RC) {
    function out(vbe) { return bis(function (vce) { return iC(vbe, vce) - (VCC - vce) / RC; }, -0.5, VCC + 1, 60); }
    var vbe = bis(function (v) { return iB(v, out(v)) - (VBB - v) / RB; }, Math.min(0, VBB) - 0.1, Math.max(0.05, Math.min(VBB, 0.95)), 60);
    var vce = out(vbe);
    return { vbe: vbe, vce: vce, ib: iB(vbe, vce), ic: (VCC - vce) / RC };
  }
  var FAM = null;
  function family() { // courbes de sortie i_C(v_CE) à i_B fixé, 10 à 90 µA
    if (FAM) return FAM;
    FAM = [];
    for (var b = 10; b <= 90; b += 10) {
      var pts = [];
      for (var k = 0; k <= 150; k++) {
        var vce = 16 * Math.pow(k / 150, 1.6);
        var vbe = bis(function (v) { return iB(v, vce) - b * 1e-6; }, 0.3, 0.9, 50);
        pts.push([vce, iC(vbe, vce) * 1e3]);
      }
      FAM.push({ ib: b, pts: pts });
    }
    return FAM;
  }
  window.IX['bjt-q'] = function mount(root) {
    var K = window.IX._ea; K.css();
    var S = { VBB: 3, RB: 50000, RC: 1250, VCC: 10 };
    var P = [['A', 0.5, 'blocage'], ['B', 2, 'actif'], ['C', 3, 'actif'], ['D', 4, 'actif'], ['E', 5, 'saturation']];
    var ctl, anim, Ain, Aout, Atr, rd, note, trans = null;
    function transfer(D) {
      var key = [D.RB, D.RC, D.VCC].join('|');
      if (trans && trans.key === key) return trans;
      var pts = []; for (var k = 0; k <= 60; k++) { var v = 6 * k / 60; pts.push([v, solve(v, D.RB, D.VCC, D.RC).vce]); }
      trans = { key: key, pts: pts };
      return trans;
    }
    function build() {
      root.innerHTML = '';
      var box = K.el('div', { cls: 'ixe' }, root);
      ctl = K.Controls(function () { anim.kick(); });
      var top = K.el('div', { cls: 'ixe-top' }, box);
      K.el('span', { cls: 'ixe-tag' }, top, 'Points du tableau 4.3');
      var pre = K.el('div', { cls: 'ixe-pre' }, top);
      P.forEach(function (p) {
        var lbl = p[0] + (p[0] === 'A' ? ' · blocage' : p[0] === 'C' ? ' · actif' : p[0] === 'E' ? ' · saturation' : '');
        ctl.button(pre, { label: lbl, title: 'V_BB = ' + K.num(p[1]) + ' V (' + p[2] + ')', apply: function () { S.VBB = p[1]; S.RB = 50000; S.RC = 1250; S.VCC = 10; },
                          is: function () { return Math.abs(S.VBB - p[1]) < 1e-9 && S.RB === 50000 && S.RC === 1250 && S.VCC === 10; } });
      });
      var grid = K.el('div', { cls: 'ixe-grid' }, box);
      var w = Math.max(320, Math.min(560, (root.clientWidth > 860 ? root.clientWidth / 2 : root.clientWidth) - 20));
      var H = Math.round(w * 0.66);
      var vbb = { key: 'VBB', label: 'V_BB', min: 0, max: 6, step: 0.05, get: function () { return S.VBB; }, set: function (v) { S.VBB = v; }, fmt: function (v) { return K.num(v, 2) + ' V'; } };
      // sortie (le graphe principal)
      var pO = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgO = K.figure(pO, w, H, 'SORTIE : CARACTÉRISTIQUES ET DROITE DE CHARGE');
      Aout = K.axes(svgO, { W: w, H: H, x: [0, 10], y: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10], xl: 'v_CE (V)', yl: 'i_C (mA)' });
      var sO = K.el('div', { cls: 'ixe-strip' }, pO);
      ctl.slider(sO, vbb);
      ctl.slider(sO, { key: 'RC', label: 'R_C', min: 500, max: 5000, step: 50, get: function () { return S.RC; }, set: function (v) { S.RC = v; }, fmt: function (v) { return K.si(v, 'Ω', 3); } });
      ctl.slider(sO, { key: 'VCC', label: 'V_CC', min: 5, max: 15, step: 0.5, get: function () { return S.VCC; }, set: function (v) { S.VCC = v; }, fmt: function (v) { return K.num(v, 1) + ' V'; } });
      // entrée
      var pI = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgI = K.figure(pI, w, Math.round(H * 0.8), 'ENTRÉE : JONCTION BASE-ÉMETTEUR ET DROITE D’ENTRÉE');
      Ain = K.axes(svgI, { W: w, H: Math.round(H * 0.8), x: [0, 0.8], y: [0, 120], xt: [0, 0.2, 0.4, 0.6, 0.8], yt: [0, 30, 60, 90, 120], xl: 'v_BE (V)', yl: 'i_B (µA)' });
      var sI = K.el('div', { cls: 'ixe-strip' }, pI);
      ctl.slider(sI, vbb);
      ctl.slider(sI, { key: 'RB', label: 'R_B', min: 10000, max: 200000, log: true, snap: function (v) { return Math.round(v / 1000) * 1000; }, get: function () { return S.RB; }, set: function (v) { S.RB = v; }, fmt: function (v) { return K.si(v, 'Ω', 3); } });
      // transfert
      var pT = K.el('div', { cls: 'ixe-panel' }, grid);
      var svgT = K.figure(pT, w, Math.round(H * 0.8), 'COURBE DE TRANSFERT V_CE(V_BB)');
      Atr = K.axes(svgT, { W: w, H: Math.round(H * 0.8), x: [0, 6], y: [0, 10], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 2, 4, 6, 8, 10], xl: 'V_BB (V)', yl: 'V_CE (V)' });
      var sT = K.el('div', { cls: 'ixe-strip' }, pT);
      ctl.slider(sT, vbb);
      rd = K.readouts(box, [['vbe', 'V_BE'], ['ib', 'I_B'], ['ic', 'I_C'], ['vce', 'V_CE'], ['reg', 'régime'], ['bf', 'I_C / I_B']]);
      note = K.el('p', { cls: 'ixe-note' }, box);
      K.el('p', { cls: 'ixe-cap' }, box, 'Calcul complet par les équations d’Ebers et Moll avec l’effet Early (<i>I</i><sub>S</sub> = 1,2·10<sup>−14</sup> A, β<sub>F</sub> = 100, <i>V</i><sub>A</sub> = 100 V, <i>V</i><sub>T</sub> = 25,85 mV). Le cours ne donne pas β<sub>R</sub> ; la valeur 0,12, choix pédagogique, redonne le point E du tableau 4.3. Courbes bleues : <i>i</i><sub>B</sub> = 10 à 90 µA ; courbe orange : le <i>I</i><sub>B</sub> du point courant.');
      anim = K.Anim(S, draw, 1100);
      anim.kick(true); ctl.refresh();
    }
    function draw(D) {
      var q = solve(D.VBB, D.RB, D.VCC, D.RC);
      // sortie
      var xmax = Math.max(10, Math.ceil(D.VCC)), ymax = Math.max(10, Math.ceil(D.VCC / D.RC * 1e3 * 1.1));
      var yst = ymax > 20 ? 5 : 2, yt = []; for (var y = 0; y <= ymax; y += yst) yt.push(y);
      var xt = []; for (var x = 0; x <= xmax; x += xmax > 10 ? 3 : 2) xt.push(x);
      Aout.o.xt = xt; Aout.o.yt = yt; Aout.set([0, xmax], [0, ymax]);
      family().forEach(function (c) { Aout.path(c.pts, { stroke: '#7d9cc4', 'stroke-width': 1.3 }); var e = c.pts[c.pts.length - 1]; });
      family().forEach(function (c) {
        var p = c.pts.filter(function (pp) { return pp[0] <= xmax; }).pop();
        if (p[1] < ymax) K.text(Aout.top, Aout.X(p[0]) - 3, Aout.Y(p[1]) - 4, c.ib + ' µA', { 'text-anchor': 'end', 'font-size': 10, fill: '#5a7aa6' });
      });
      if (q.ib > 0.2e-6) {
        var cur = [];
        for (var k = 0; k <= 150; k++) {
          var vce = xmax * Math.pow(k / 150, 1.6);
          var vb = bis(function (v) { return iB(v, vce) - q.ib; }, 0.3, 0.9, 45);
          cur.push([vce, iC(vb, vce) * 1e3]);
        }
        Aout.path(cur, { stroke: K.C.accent, 'stroke-width': 2.2 });
      }
      Aout.path([[0, D.VCC / D.RC * 1e3], [D.VCC, 0]], { stroke: '#b0472a', 'stroke-width': 2.2 });
      Aout.dot(q.vce, q.ic * 1e3, { r: 7 });
      Aout.text(q.vce, q.ic * 1e3, 'Q', { dx: 9, dy: -8, 'font-weight': 700, fill: K.C.navy, 'font-size': 13 });
      // entrée
      Ain.draw();
      var pts = []; for (k = 0; k <= 160; k++) { var v = 0.8 * k / 160; pts.push([v, iB(v, Math.max(q.vce, 0)) * 1e6]); }
      Ain.path(pts, { stroke: K.C.navy, 'stroke-width': 2.4 });
      Ain.path([[0, D.VBB / D.RB * 1e6], [0.8, (D.VBB - 0.8) / D.RB * 1e6]], { stroke: '#b0472a', 'stroke-width': 2 });
      Ain.dot(q.vbe, q.ib * 1e6, { r: 6 });
      // transfert
      var tr = transfer(D);
      var ym = Math.max(10, Math.ceil(D.VCC)); Atr.o.yt = []; for (y = 0; y <= ym; y += ym > 10 ? 3 : 2) Atr.o.yt.push(y);
      Atr.set(null, [0, ym]);
      Atr.path(tr.pts, { stroke: K.C.navy, 'stroke-width': 2.4 });
      if (D.RB === 50000 && D.RC === 1250 && D.VCC === 10) P.forEach(function (p) {
        var s = solve(p[1], 50000, 10, 1250);
        Atr.dot(p[1], s.vce, { r: 3.5, fill: '#7d9cc4' });
        Atr.text(p[1], s.vce, p[0], { dx: p[0] === 'A' ? 2 : 5, dy: p[0] === 'A' ? 20 : -6, 'font-size': 11, fill: '#5a7aa6', 'font-weight': 700 });
      });
      Atr.dot(D.VBB, q.vce, { r: 6 });
      // valeurs
      var reg = q.ib < 0.5e-6 ? 'bloqué' : q.vce < 0.4 ? 'saturé' : 'actif';
      rd.set('vbe', K.num(q.vbe, 3) + ' V'); rd.set('ib', K.si(q.ib, 'A', 3)); rd.set('ic', K.si(q.ic, 'A', 3));
      rd.set('vce', K.num(q.vce, 2) + ' V'); rd.set('reg', reg, reg !== 'actif');
      rd.set('bf', q.ib > 1e-9 ? K.num(q.ic / q.ib, 1) : '—', reg === 'saturé');
      note.innerHTML = reg === 'bloqué' ? 'Bloqué : <i>V</i><sub>BB</sub> ne suffit pas à ouvrir la jonction base-émetteur, <i>I</i><sub>B</sub> ≈ 0, <i>I</i><sub>C</sub> ≈ 0 et <i>V</i><sub>CE</sub> = <i>V</i><sub>CC</sub> : palier haut de la courbe de transfert.'
        : reg === 'saturé' ? 'Saturé : <i>Q</i> est au pied de la droite de charge, <i>V</i><sub>CE</sub> ≈ ' + K.num(q.vce, 2) + ' V. Le courant de base est plus que suffisant : <i>I</i><sub>C</sub>/<i>I</i><sub>B</sub> = ' + K.num(q.ic / q.ib, 0) + ' < β. Palier bas : le transistor est un interrupteur fermé.'
        : 'Régime actif : <i>I</i><sub>C</sub> ≈ β<i>I</i><sub>B</sub>(1 + <i>V</i><sub>CE</sub>/<i>V</i><sub>A</sub>), et <i>V</i><sub>BE</sub> reste près de 0,7 V. Une variation de <i>V</i><sub>BB</sub> déplace <i>Q</i> le long de la droite de charge : pente ≈ −β<i>R</i><sub>C</sub>/<i>R</i><sub>B</sub> = ' + K.num(-BF * D.RC / D.RB, 2) + '.';
      ctl.refresh();
    }
    build();
    K.onResize(root, build);
  };
})();
