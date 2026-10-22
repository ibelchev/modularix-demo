/* Modularix — the other six solutions as models, for the product drill-down (the AI & HPC Ready sheet keeps the
   reference build, container-model.js). Each is drawn from that product's render on the current site (modularix.world)
   and the project photos, on the same six layers as the reference build, so the page explodes and focuses them the
   same way. Illustrative only: layouts, counts and sizes are to be confirmed with Modularix.
   World units are metres; x runs along the module, y is up, z across. Origin: centre of the footprint, ground. */
(function () {
  'use strict';
  const THREE = window.THREE, MX = window.MX, G = MX.gl, C = G.C, hex = G.hex;
  const o = (c, a, x) => Object.assign({ c, a }, x || {});
  // the reference palette, with brand-blue skins as in the renders
  const K = Object.assign({}, MX.container.K, {
    skin: hex('#1b2f86'), skinHi: hex('#23399c'), roof: hex('#17286e'), shield: hex('#8f5532'), skid: hex('#1f3fa6'),
    pump: hex('#2a55cc'), panel: hex('#aeb8c3'), trafo: hex('#4a5560'), coil: hex('#9c6a34'), bus: hex('#c79a2a'), deck: hex('#2c3642'),
  });
  const L20 = 6.058, L40 = 12.192, W = 2.438, H = 2.896;
  const NAMES = ['frame', 'brace', 'floor', 'wallFar', 'wallNear', 'endA', 'endB', 'roof', 'power', 'cooling', 'it', 'safety', 'ghost'];
  const OPTS = {
    frame: { lines: { sweep: [.4, 1, .2] }, solid: { axis: [0, 1, 0], edge: C.blue2 } }, brace: {},
    floor: { lines: { sweep: [1, .2, .3] }, solid: { axis: [1, 0, 0] } },
    wallFar: { solid: { axis: [0, 1, 0] } }, wallNear: { solid: { axis: [0, 1, 0] } }, endA: { solid: { axis: [0, 1, 0] } }, endB: { solid: { axis: [0, 1, 0] } },
    roof: { solid: { axis: [1, 0, 0] } },
    power: { lines: { pen: C.power }, solid: { axis: [0, 1, 0], edge: C.power } },
    cooling: { lines: { pen: C.cool }, solid: { axis: [1, 0, 0], edge: C.cool } },
    it: { lines: { pen: C.blue2 }, solid: { axis: [1, 0, 0], edge: C.blue2 } },
    safety: { lines: { pen: C.safe }, solid: { axis: [0, 1, 0], edge: C.safe } },
    ghost: { lines: { sweep: [1, .2, .3] } },
  };

  /* ------------------------------------------------------------------ drawing on a face: a = along the face, y = up, d = outwards */
  const plane = (ax, v, s) => ({ ax, pt: (a, y, d = 0) => ax === 'z' ? [a, y, v + s * d] : [v + s * d, y, a] });
  const sbox = (S, p, q, col) => S.box(Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[1], q[1]), Math.max(p[2], q[2]), col);
  const pbox = (S, pl, a0, y0, a1, y1, d0, d1, col) => sbox(S, pl.pt(a0, y0, d0), pl.pt(a1, y1, d1), col);
  const prect = (L, pl, a0, y0, a1, y1, d, op) => L.poly([pl.pt(a0, y0, d), pl.pt(a1, y0, d), pl.pt(a1, y1, d), pl.pt(a0, y1, d)], op, true);
  const pseg = (L, pl, a0, y0, a1, y1, d, op) => L.seg(pl.pt(a0, y0, d), pl.pt(a1, y1, d), op);
  const pcirc = (L, pl, a, y, d, r, op) => { const p = pl.pt(a, y, d); L.circle(p[0], p[1], p[2], r, 24, pl.ax, op); };
  const bx = (ly, x0, y0, z0, x1, y1, z1, col, op) => { ly.S.box(x0, y0, z0, x1, y1, z1, col); ly.L.box(x0, y0, z0, x1, y1, z1, op); };

  // a skin with openings (holes: [a0, y0, a1, y1]); corrugated like an ISO box unless corr: false; grid: welded seams
  function sheet(ly, pl, a0, a1, y0, y1, holes, s = {}) {
    const { L, S } = ly, col = s.col || K.skin, [d0, d1] = s.d || [-.05, -.02];
    const xs = [...new Set([a0, a1, ...holes.flatMap(h => [h[0], h[2]])])].filter(v => v >= a0 && v <= a1).sort((p, q) => p - q);
    const hit = a => holes.find(h => a > h[0] && a < h[2]);
    for (let i = 0; i < xs.length - 1; i++) {
      const h = hit((xs[i] + xs[i + 1]) / 2);
      if (!h) pbox(S, pl, xs[i], y0, xs[i + 1], y1, d0, d1, col);
      else { if (h[1] > y0) pbox(S, pl, xs[i], y0, xs[i + 1], h[1], d0, d1, col); if (h[3] < y1) pbox(S, pl, xs[i], h[3], xs[i + 1], y1, d0, d1, col); }
    }
    const spans = a => { const h = holes.find(q => a > q[0] - .03 && a < q[2] + .03); return h ? [[y0, h[1]], [h[3], y1]] : [[y0, y1]]; };
    prect(L, pl, a0, y0, a1, y1, d1 + .004, o(C.line, .5));
    if (s.corr !== false) for (let a = a0 + .16; a < a1 - .1; a += .28) for (const [p, q] of spans(a)) {
      if (q - p < .06) continue;
      pbox(S, pl, a - .05, p, a + .05, q, d1, d1 + .03, K.skinHi); pseg(L, pl, a, p, a, q, d1 + .034, o(C.line, .2));
    }
    if (s.grid) {
      for (let a = a0 + s.grid; a < a1 - .05; a += s.grid) for (const [p, q] of spans(a)) if (q - p > .06) pseg(L, pl, a, p, a, q, d1 + .004, s.pen);
      for (let y = y0 + .5; y < y1 - .05; y += .5) {
        let a = a0; for (const h of holes.filter(q => y > q[1] && y < q[3]).sort((p, q) => p[0] - q[0])) { if (h[0] > a) pseg(L, pl, a, y, h[0], y, d1 + .004, s.pen); a = h[2]; }
        if (a < a1) pseg(L, pl, a, y, a1, y, d1 + .004, s.pen);
      }
    }
    holes.forEach(h => prect(L, pl, h[0], h[1], h[2], h[3], d1 + .04, o(C.ink, .6)));
  }

  // features on a face (all coordinates absolute: a along the face, y up)
  const FEAT = {
    hole() {},
    door(ly, pl, q) {
      pbox(ly.S, pl, q.a0, q.y0, q.a1, q.y1, -.02, .015, K.door); prect(ly.L, pl, q.a0, q.y0, q.a1, q.y1, .02, o(C.ink, .8));
      if (q.double) { // cargo doors: two leaves, four locking bars
        const m = (q.a0 + q.a1) / 2; pseg(ly.L, pl, m, q.y0, m, q.y1, .02, o(C.ink, .7));
        for (const a of [q.a0 + .2, m - .22, m + .22, q.a1 - .2]) { pbox(ly.S, pl, a - .02, q.y0 + .05, a + .02, q.y1 - .05, .015, .055, K.steel); pseg(ly.L, pl, a, q.y0 + .05, a, q.y1 - .05, .06, o(C.line, .6)); }
      } else pseg(ly.L, pl, q.a1 - .12, (q.y0 + q.y1) / 2, q.a1 - .26, (q.y0 + q.y1) / 2, .03, o(C.ink, .9));
    },
    louvre(ly, pl, q) {
      for (let y = q.y0 + .06; y < q.y1 - .03; y += .1) { pbox(ly.S, pl, q.a0, y, q.a1, y + .03, -.01, .04, K.louver); pseg(ly.L, pl, q.a0, y + .03, q.a1, y + .03, .045, o(C.line, .26)); }
      prect(ly.L, pl, q.a0, q.y0, q.a1, q.y1, .045, o(C.line, .55));
    },
    fan(ly, pl, q) { pcirc(ly.L, pl, q.a, q.y, .03, q.r, o(C.line, .7)); pcirc(ly.L, pl, q.a, q.y, .03, q.r * .3, o(C.line, .5)); prect(ly.L, pl, q.a - q.r - .06, q.y - q.r - .06, q.a + q.r + .06, q.y + q.r + .06, .03, o(C.line, .5)); },
    logo(ly, pl, q) { // the Modularix mark, five squares, from the logo
      const s = q.s || .0042, ox = q.a, oy = q.y;
      const sq = (x0, y0, x1, y1, c) => { pbox(ly.S, pl, ox + x0 * s, oy - y1 * s, ox + x1 * s, oy - y0 * s, .01, .022, c); prect(ly.L, pl, ox + x0 * s, oy - y1 * s, ox + x1 * s, oy - y0 * s, .024, o(c, .9)); };
      sq(5, 0, 56, 51, K.logoBlue); sq(58, 53, 177, 166, K.logoBlue); sq(5, 171, 56, 222, K.logoRed); sq(181, 175, 233, 223, K.logoWhite); sq(125, 225, 177, 276, K.logoDeep);
    },
    glands(ly, pl, q) { // Roxtec-type gland plate
      prect(ly.L, pl, q.a0 - .1, q.y0 - .1, q.a0 + .23 * q.n - .13, q.y0 + .23 * q.m - .13, .03, o(C.line, .5));
      for (let i = 0; i < q.n; i++) for (let j = 0; j < q.m; j++) { const p = pl.pt(q.a0 + i * .23, q.y0 + j * .23, .04); ly.L.circle(p[0], p[1], p[2], .075, 14, pl.ax, o(C.red, .9)); }
    },
    portal(ly, pl, q) { // shielded door: a heavy riveted frame with an RF finger-stock gasket inside it
      const t = .16;
      for (const [a0, y0, a1, y1] of [[q.a0 - t, q.y0 - t, q.a1 + t, q.y0], [q.a0 - t, q.y1, q.a1 + t, q.y1 + t], [q.a0 - t, q.y0, q.a0, q.y1], [q.a1, q.y0, q.a1 + t, q.y1]]) pbox(ly.S, pl, a0, y0, a1, y1, -.2, .09, K.steel);
      prect(ly.L, pl, q.a0 - t, q.y0 - t, q.a1 + t, q.y1 + t, .095, o(C.ink, .8));
      prect(ly.L, pl, q.a0 + .01, q.y0 + .01, q.a1 - .01, q.y1 - .01, .02, o(C.power, .85));
      for (let a = q.a0 - .08; a <= q.a1 + .08; a += .2) for (const y of [q.y0 - .08, q.y1 + .08]) ly.P.add(pl.pt(a, y, .1), C.ink, 2.4, 0);
      for (let y = q.y0; y <= q.y1; y += .2) for (const a of [q.a0 - .08, q.a1 + .08]) ly.P.add(pl.pt(a, y, .1), C.ink, 2.4, 0);
    },
    vent(ly, pl, q) { // honeycomb waveguide vent: air in, RF out
      prect(ly.L, pl, q.a0, q.y0, q.a1, q.y1, .04, o(C.line, .6)); pbox(ly.S, pl, q.a0, q.y0, q.a1, q.y1, -.01, .03, K.louver);
      const r = .045, dx = r * 1.5, dy = r * Math.sqrt(3);
      for (let i = 0, a = q.a0 + r; a < q.a1 - r * .9; i++, a += dx) for (let y = q.y0 + dy / 2 + (i % 2) * dy / 2; y < q.y1 - dy / 2; y += dy) {
        const p = []; for (let k = 0; k <= 6; k++) { const t = k / 6 * Math.PI * 2; p.push(pl.pt(a + Math.cos(t) * r * .92, y + Math.sin(t) * r * .92, .035)); }
        ly.L.poly(p, o(C.line, .28));
      }
    },
    badge(ly, pl, q) { // the EMSEC Ready shield
      const s = q.s || .32, p = [[0, 1], [.8, .78], [.72, -.1], [0, -1], [-.72, -.1], [-.8, .78], [0, 1]].map(([a, y]) => pl.pt(q.a + a * s * .7, q.y + y * s, .03));
      ly.L.poly(p, o(C.ink, .85)); pseg(ly.L, pl, q.a - s * .3, q.y + s * .35, q.a + s * .3, q.y - s * .45, .03, o(C.ink, .7)); pseg(ly.L, pl, q.a + s * .3, q.y + s * .35, q.a - s * .3, q.y - s * .45, .03, o(C.ink, .7));
    },
  };
  const FACE_LY = { near: 'wallNear', far: 'wallFar', A: 'endA', B: 'endB' };
  const face = (m, f) => f === 'near' ? plane('z', m.z1, 1) : f === 'far' ? plane('z', m.z0, -1) : f === 'A' ? plane('x', m.x0, -1) : plane('x', m.x1, 1);

  /* ------------------------------------------------------------------ one ISO-type box: frame, deck, skins, roof */
  function isoFrame(ly, m) {
    const { x0, x1, z0, z1, y, top } = m, lo = o(C.line, .8), lf = o(C.line, .38), col = K.steel;
    for (const x of [x0, x1 - .15]) for (const z of [z0, z1 - .15]) bx(ly, x, y, z, x + .15, top, z + .15, col, lo);
    for (const z of [z0, z1 - .12]) { bx(ly, x0, y, z, x1, y + .2, z + .12, col, lo); bx(ly, x0, top - .14, z, x1, top, z + .12, col, lo); }
    for (const x of [x0, x1 - .12]) { bx(ly, x, y, z0, x + .12, y + .22, z1, col, lo); bx(ly, x, top - .18, z0, x + .12, top, z1, col, lo); }
    for (const x of [x0, x1 - .18]) for (const z of [z0, z1 - .16]) for (const yy of [y, top - .12]) bx(ly, x, yy, z, x + .18, yy + .12, z + .16, K.corner, o(C.ink, .55));
    for (let x = x0 + .4; x < x1 - .3; x += .6) ly.L.seg([x, y + .2, z0 + .12], [x, y + .2, z1 - .12], lf);
  }
  function deck(ly, m) {
    const { x0, x1, z0, z1, y, FL } = m;
    ly.S.box(x0 + .12, y + .2, z0 + .12, x1 - .12, FL, z1 - .12, K.floor); ly.L.rect(x0 + .12, z0 + .12, x1 - .12, z1 - .12, FL, o(C.line, .55));
    for (let x = x0 + .6; x < x1 - .2; x += .6) ly.L.seg([x, FL + .003, z0 + .13], [x, FL + .003, z1 - .13], o(C.line, .14));
  }
  function module(Ly, m) {
    m.y = m.y || 0; m.top = m.y + (m.H || H); m.FL = m.y + .3; m.CE = m.top - .3;
    isoFrame(Ly.frame, m); deck(Ly.floor, m);
    for (const f of ['near', 'far', 'A', 'B']) {
      if (m.skip && m.skip.includes(f)) continue;
      const pl = face(m, f), ly = Ly[FACE_LY[f]], long = f === 'near' || f === 'far', fs = (m.faces && m.faces[f]) || [];
      const a0 = long ? m.x0 + .15 : m.z0 + .15, a1 = long ? m.x1 - .15 : m.z1 - .15, y0 = m.y + .2, y1 = m.top - .14;
      const holes = fs.filter(q => q.t === 'hole' || q.t === 'portal').map(q => [q.a0, q.y0, q.a1, q.y1]);
      sheet(ly, pl, a0, a1, y0, y1, holes);
      if (m.shield) sheet(ly, pl, a0 + .04, a1 - .04, y0 + .04, y1 - .04, holes, { col: K.shield, d: [-.2, -.17], corr: false, grid: .6, pen: o(C.power, .4) });
      fs.forEach(q => FEAT[q.t](ly, pl, q, m));
    }
    if (m.roof !== false) {
      const r = Ly.roof, { x0, x1, z0, z1, top } = m;
      r.S.box(x0 + .12, top - .08, z0 + .12, x1 - .12, top - .03, z1 - .12, K.roof); r.L.rect(x0 + .12, z0 + .12, x1 - .12, z1 - .12, top - .02, o(C.line, .55));
      for (let x = x0 + .6; x < x1 - .3; x += .6) r.L.seg([x, top - .02, z0 + .12], [x, top - .02, z1 - .12], o(C.line, .22));
      if (m.shield) { r.S.box(x0 + .16, top - .22, z0 + .16, x1 - .16, top - .19, z1 - .16, K.shield); for (let x = x0 + .6; x < x1 - .3; x += .6) r.L.seg([x, top - .22, z0 + .16], [x, top - .22, z1 - .16], o(C.power, .35)); }
    }
    return m;
  }
  function partition(ly, m, x, door, col = K.lining) {
    const t = .05, zA = m.z0 + .14, zB = m.z1 - .14, { FL, CE } = m;
    if (!door) { ly.S.box(x - t, FL, zA, x + t, CE, zB, col); ly.L.rectZY(zA, FL, zB, CE, x, o(C.line, .55)); return; }
    ly.S.box(x - t, FL, zA, x + t, CE, door[0], col); ly.S.box(x - t, FL, door[1], x + t, CE, zB, col); ly.S.box(x - t, FL + 1.95, door[0], x + t, CE, door[1], col);
    ly.L.rectZY(zA, FL, zB, CE, x, o(C.line, .5)); ly.L.rectZY(door[0], FL, door[1], FL + 1.95, x, o(C.ink, .7));
  }
  // a ghost: the outline of what comes next (or what the add-on connects to), dashed
  function ghostBox(ly, x0, y0, z0, x1, y1, z1, a = .8) { ly.L.box(x0, y0, z0, x1, y1, z1, o(C.ink, a, { dash: .3 })); }

  /* ------------------------------------------------------------------ equipment */
  function rack(ly, x0, x1, za, zb, FL, h, f, net) { // f: +1 front face at zb, -1 at za
    const zf = f > 0 ? zb : za;
    bx(ly, x0 + .01, FL, za, x1 - .01, FL + h, zb, K.rack, o(C.it, .9));
    for (let x = x0 + .08; x < x1 - .05; x += .07) ly.L.seg([x, FL + .08, zf + f * .004], [x, FL + h - .08, zf + f * .004], o(C.it, .16));
    for (let k = 0, n = net ? 46 : 28; k < n; k++) {
      const pick = Math.random();
      ly.P.add([x0 + .08 + Math.random() * (x1 - x0 - .16), FL + .15 + Math.random() * (h - .3), zf + f * .015], pick < .62 ? C.blue2 : pick < .85 ? C.it : pick < .95 ? C.ok : C.power, 2.6 + Math.random() * 2.2, Math.random() < .7 ? 0 : 1);
    }
  }
  function inrow(ly, x0, x1, za, zb, FL, f) {
    const zf = f > 0 ? zb : za;
    bx(ly, x0 + .01, FL, za, x1 - .01, FL + 2.0, zb, K.inrow, o(C.cool, .9));
    for (let y = FL + .2; y < FL + 1.85; y += .09) ly.L.seg([x0 + .05, y, zf + f * .004], [x1 - .05, y, zf + f * .004], o(C.cool, .3));
    ly.P.add([(x0 + x1) / 2, FL + 1.88, zf + f * .02], C.cool, 6, 1);
  }
  // a row along x: r rack · n network rack · ir in-row cooler · c CDU. Returns the pieces with their centres
  function row(Ly, seq, x, za, zb, FL, f) {
    return seq.map(([t, w]) => {
      const r = { t, x0: x, x1: x + w, cx: x + w / 2 }; x += w;
      if (t === 'r' || t === 'n') rack(Ly.it, r.x0, r.x1, za, zb, FL, t === 'n' ? 2.0 : 2.2, f, t === 'n');
      else if (t === 'ir') inrow(Ly.cooling, r.x0, r.x1, za, zb, FL, f);
      else if (t === 'c') cab(Ly.cooling, r.x0, r.x1, za, zb, FL, 2.0, f, 'cdu');
      return r;
    });
  }
  // a cabinet with its front at zb (f = +1) or za (f = -1): ups · batt · board · shelf (hot-swap power shelves) · cdu
  function cab(ly, x0, x1, za, zb, FL, h, f, kind) {
    const zf = (f > 0 ? zb : za) + f * .005, c = kind === 'cdu' ? C.cool : C.power;
    const col = kind === 'board' ? K.board : kind === 'batt' ? K.batt : kind === 'cdu' ? K.inrow : K.ups;
    bx(ly, x0, FL, za, x1, FL + h, zb, col, o(c, .85));
    if (kind === 'ups') {
      ly.L.rectXY(x0 + .14, FL + h - .5, x1 - .14, FL + h - .25, zf, o(c, .9));
      for (let y = FL + .25; y < FL + h - .7; y += .12) ly.L.seg([x0 + .08, y, zf], [x1 - .08, y, zf], o(c, .3));
      ly.P.add([(x0 + x1) / 2, FL + h - .37, zf + f * .015], C.ok, 7, 1);
    } else if (kind === 'batt') {
      for (let y = FL + .18; y < FL + h - .1; y += .115) ly.L.seg([x0 + .06, y, zf], [x1 - .06, y, zf], o(c, .42));
      for (let k = 0; k < 4; k++) ly.P.add([x1 - .1, FL + .3 + k * .4, zf + f * .015], C.ok, 3.5, 2, k);
    } else if (kind === 'board') {
      for (let x = x0 + .55; x < x1 - .1; x += .55) ly.L.seg([x, FL + .05, zf], [x, FL + h - .05, zf], o(c, .5));
      ly.L.rectXY(x0 + .12, FL + 1.25, x0 + .4, FL + 1.55, zf, o(c, .9)); ly.P.add([x0 + .26, FL + 1.4, zf + f * .015], C.power, 9, 1);
      for (let k = 0; k < 4; k++) ly.P.add([x1 - .45 + k * .08, FL + h - .25, zf + f * .015], k % 2 ? C.ok : C.red, 3, 2, k * 1.3);
    } else if (kind === 'shelf') {
      for (let y = FL + .2, k = 0; y < FL + h - .25; y += .21, k++) { ly.L.rectXY(x0 + .05, y, x1 - .05, y + .17, zf, o(c, .55)); ly.P.add([x1 - .1, y + .085, zf + f * .015], C.ok, 3.4, 2, k * .7); ly.P.add([x1 - .17, y + .085, zf + f * .015], C.power, 2.6, 0); }
    } else if (kind === 'cdu') {
      ly.L.rectXY(x0 + .1, FL + h - .45, x1 - .1, FL + h - .2, zf, o(c, .9)); ly.P.add([(x0 + x1) / 2, FL + h - .32, zf + f * .015], C.cool, 6, 1);
      for (let y = FL + .2; y < FL + h - .6; y += .14) ly.L.seg([x0 + .06, y, zf], [x1 - .06, y, zf], o(c, .3));
    }
  }
  // an axis-aligned pipe run; returns its points for a flow
  function pipe(ly, pts, r, pen, col = K.pipe) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], ax = a[0] !== b[0] ? 'x' : a[1] !== b[1] ? 'y' : 'z', j = { x: 0, y: 1, z: 2 }[ax], len = Math.abs(b[j] - a[j]);
      if (len < .001) continue;
      ly.S.cyl((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, r, len, ax, col, 12); ly.L.seg(a, b, o(pen, .85));
    }
    return pts;
  }
  function fan(ly, fans, x, y, z, r) { // a spinning fan on top of a unit
    ly.S.cyl(x, y, z, r, .04, 'y', K.fan, 28); ly.L.circle(x, y + .03, z, r + .02, 32, 'y', o(C.cool, .9)); ly.L.circle(x, y + .03, z, r * .24, 12, 'y', o(C.cool, .6));
    fans.push([x, y + .04, z, r]);
  }
  // dry cooler / fluid cooler: coil box with fans on top, n of them along its longer side
  function cooler(ly, fans, x0, x1, z0, z1, y0, y1, n) {
    bx(ly, x0, y0, z0, x1, y1, z1, K.chiller, o(C.cool, .85));
    const alongX = x1 - x0 >= z1 - z0;
    for (const s of [0, 1]) for (let k = .15; k < (alongX ? x1 - x0 : z1 - z0) - .1; k += .16) {
      if (alongX) { const z = s ? z1 + .005 : z0 - .005; ly.L.seg([x0 + k, y0 + .2, z], [x0 + k, y1 - .15, z], o(C.cool, .22)); }
      else { const x = s ? x1 + .005 : x0 - .005; ly.L.seg([x, y0 + .2, z0 + k], [x, y1 - .15, z0 + k], o(C.cool, .22)); }
    }
    const len = alongX ? x1 - x0 : z1 - z0, r = Math.min(.48, len / n / 2 - .06, (alongX ? z1 - z0 : x1 - x0) / 2 - .06);
    for (let i = 0; i < n; i++) { const u = (i + .5) / n; fan(ly, fans, alongX ? x0 + len * u : (x0 + x1) / 2, y1 + .02, alongX ? (z0 + z1) / 2 : z0 + len * u, r); }
  }
  function pump(ly, x, y, z) { // end-suction pump on a base, as on the cooling-skid render
    bx(ly, x - .35, y, z - .22, x + .45, y + .1, z + .22, K.steel, o(C.cool, .5));
    ly.S.cyl(x, y + .38, z, .24, .2, 'z', K.pump, 20); ly.L.circle(x, y + .38, z + .1, .24, 20, 'z', o(C.cool, .9));
    ly.S.cyl(x + .33, y + .38, z, .15, .42, 'x', K.pump, 16); ly.L.circle(x + .54, y + .38, z, .15, 14, 'x', o(C.cool, .7));
    ly.S.cyl(x, y + .75, z, .07, .5, 'y', K.pipe, 10);
  }
  function lights(ly, x0, x1, z, CE) { for (let x = x0; x < x1 - .6; x += 1.6) { ly.L.rect(x, z - .08, x + 1.2, z + .08, CE - .03, o(C.ink, .45)); ly.P.add([x + .6, CE - .06, z], C.ink, 5, 3); } }
  function agent(ly, x, z, FL) { // clean-agent cylinder
    ly.S.cyl(x, FL + .6, z, .17, 1.2, 'y', K.cyl, 20); ly.L.circle(x, FL + .02, z, .17, 18, 'y', o(C.safe, .9)); ly.L.circle(x, FL + 1.2, z, .17, 18, 'y', o(C.safe, .9));
    ly.L.seg([x - .17, FL, z], [x - .17, FL + 1.2, z], o(C.safe, .6)); ly.L.seg([x + .17, FL, z], [x + .17, FL + 1.2, z], o(C.safe, .6));
  }
  function detectors(ly, xs, z, CE) { for (const x of xs) { ly.S.cyl(x, CE - .03, z, .07, .05, 'y', hex('#d9dee4'), 12); ly.L.circle(x, CE - .055, z, .07, 10, 'y', o(C.safe, .8)); } }
  function cam(ly, p, dir) { ly.L.seg(p, [p[0] + dir[0] * .28, p[1] - .12, p[2] + dir[2] * .28], o(C.safe, .8)); ly.P.add(p, C.safe, 4.5, 2); }
  function cams(ly, m) { const y = m.top - .25; for (const x of [m.x0 + .5, m.x1 - .5]) { cam(ly, [x, y, m.z1 + .02], [0, 0, 1]); cam(ly, [x, y, m.z0 - .02], [0, 0, -1]); } }

  /* ------------------------------------------------------------------ assembly */
  const pose = (l, az, el, d) => ({ l, az, el, d });
  function assemble(draw) {
    const Ly = {}, fanPos = [];
    NAMES.forEach(n => Ly[n] = new G.Layer(n));
    const meta = draw(Ly, fanPos);
    NAMES.forEach(n => Ly[n].finish(OPTS[n]));
    // fans: one blade drawing, spinning instances sharing a material with the cooling lines (as on the reference build)
    const fl = new G.Lines();
    for (let b = 0; b < 5; b++) { const a = b / 5 * Math.PI * 2, p = []; for (let k = 0; k <= 6; k++) { const r = .12 + k * .065, t = a + k * .09; p.push([Math.cos(t) * r, 0, Math.sin(t) * r]); } fl.poly(p, o(C.cool, .9)); }
    const fanMesh = fl.build({ pen: C.cool, span: .3 }), cl = Ly.cooling;
    const fans = fanPos.map(([x, y, z, r]) => { const m = fanMesh.clone(); m.position.set(x, y, z); m.scale.setScalar(r / .5); cl.group.add(m); return m; });
    cl.onSet = () => {
      if (!cl.lines) return;
      const u = cl.lines.userData.u, fu = fanMesh.userData.u;
      fu.uDraw.value = u.uDraw.value; fu.uOp.value = u.uOp.value; fu.uMono.value = u.uMono.value;
      fans.forEach(m => m.visible = cl.lines.visible);
    };
    const root = new THREE.Group(); NAMES.forEach(n => root.add(Ly[n].group));
    return { root, layers: Ly, fans, poses: meta.poses };
  }

  /* ------------------------------------------------------------------ S-01 Legacy: a 20 ft high-cube, air-cooled N+1.
     After the render: end door with a fan and an intake louvre, a side opening onto the racks. Power room at the door end,
     four racks on the far wall, two wall-mount DX units on the far end, supply air along the ceiling over the cold aisle. */
  function legacy(Ly, fans) {
    const x0 = -L20 / 2, x1 = L20 / 2, z0 = -W / 2, z1 = W / 2;
    const m = module(Ly, { x0, x1, z0, z1, faces: {
      A: [{ t: 'door', a0: .1, a1: .95, y0: .3, y1: 2.32 }, { t: 'louvre', a0: -.98, a1: -.18, y0: .45, y1: 1.85 }, { t: 'fan', a: -.58, y: 2.3, r: .22 }],
      near: [{ t: 'hole', a0: -.55, y0: .4, a1: 1.75, y1: 2.55 }, { t: 'logo', a: 2.06, y: 2.42, s: .0032 }],
      B: [{ t: 'glands', a0: -.95, y0: 2.05, n: 3, m: 2 }],
    } });
    const { FL, CE } = m;
    partition(Ly.floor, m, -1.3, [.12, .98]);
    // power room: UPS, battery, distribution board; feed from the gland plate along the ceiling tray
    cab(Ly.power, -2.85, -2.25, z0 + .16, z0 + .96, FL, 1.9, 1, 'ups');
    cab(Ly.power, -2.2, -1.6, z0 + .16, z0 + .96, FL, 1.9, 1, 'batt');
    cab(Ly.power, -2.55, -1.45, z1 - .42, z1 - .14, FL + .4, 1.5, -1, 'board');
    const ty = CE - .12;
    for (const z of [-.05, .22]) { Ly.power.S.box(-2.6, ty, z - .012, x1 - .2, ty + .06, z + .012, K.steel); Ly.power.L.seg([-2.6, ty + .06, z], [x1 - .2, ty + .06, z], o(C.power, .7)); }
    const feed = [[x1 - .1, 2.2, -.95], [x1 - .3, 2.2, -.95], [x1 - .3, ty + .08, .08], [-2.0, ty + .08, .08], [-2.0, FL + 1.9, z1 - .3]];
    Ly.power.L.poly(feed, o(C.power, .55, { dash: .18 })); Ly.power.flows.push(new G.Flow([feed], { color: C.power, count: 16, speed: 1.3, size: 6 }));
    // IT: network rack + three 42U racks, fronts to the aisle
    const r = row(Ly, [['n', .6], ['r', .6], ['r', .6], ['r', .6]], -1.0, z0 + .16, z0 + 1.16, FL, 1);
    lights(Ly.it, -1.1, x1 - .2, .55, CE);
    // cooling: two wall-mount DX units on the far end (N+1), supply duct along the ceiling, return low through the end wall
    for (const [za, zb] of [[-1.05, -.12], [.12, 1.05]]) {
      bx(Ly.cooling, x1 + .02, .55, za, x1 + .6, 2.6, zb, K.chiller, o(C.cool, .85));
      for (let y = .75; y < 1.9; y += .1) Ly.cooling.L.seg([x1 + .605, y, za + .08], [x1 + .605, y, zb - .08], o(C.cool, .3));
      Ly.cooling.L.circle(x1 + .61, 2.2, (za + zb) / 2, .27, 24, 'x', o(C.cool, .9)); Ly.cooling.L.circle(x1 + .61, 2.2, (za + zb) / 2, .07, 10, 'x', o(C.cool, .6));
      Ly.cooling.P.add([x1 + .62, 1.95, zb - .1], C.cool, 5, 1);
    }
    bx(Ly.cooling, -1.1, CE - .32, .25, x1 - .15, CE - .1, .85, K.inrow, o(C.cool, .7));
    for (let x = -.8; x < x1 - .4; x += .6) { Ly.cooling.L.rect(x, .35, x + .35, .75, CE - .325, o(C.cool, .8)); }
    const sup = [[x1 + .3, 2.4, -.6], [x1 - .15, CE - .21, .55], [-1.0, CE - .21, .55], [-1.0, FL + .3, .3]];
    const ret = [[r[2].cx, FL + 2.1, z0 + .3], [x1 - .3, FL + .4, -.6], [x1 + .3, 1.0, -.6]];
    Ly.cooling.flows.push(new G.Flow([sup], { color: C.cool, count: 40, speed: 1.4, size: 5.5 }), new G.Flow([ret], { color: C.it, count: 22, speed: 1.1, size: 4.5 }));
    // protection
    agent(Ly.safety, x1 - .4, z0 + .4, FL); detectors(Ly.safety, [-2.2, -.2, 1.6], .5, CE); cams(Ly.safety, m);
    Ly.safety.S.box(x0 - .1, 2.3, z1 - .35, x0 + .02, 2.5, z1 - .2, K.cyl); Ly.safety.P.add([x0 - .12, 2.4, z1 - .27], C.safe, 8, 0);
    const pz = { power: [-2.2, -.2], cool: [x1, 0], it: [.2, -.4] };
    return { poses: poses(26, pz) };
  }

  /* ------------------------------------------------------------------ S-04 EMSEC Ready: a 20 ft high-cube, TEMPEST-shielded.
     After the render: double cargo doors with the shield badge, a riveted shielded door on the side, honeycomb vents.
     Inside the steel skin a welded six-sided shield (copper here); power enters through RF line filters, data as fibre
     through waveguide tubes, chilled water through dielectric breaks to a chiller outside the shield. */
  function emsec(Ly, fans) {
    const x0 = -L20 / 2, x1 = L20 / 2, z0 = -W / 2, z1 = W / 2;
    const m = module(Ly, { x0, x1, z0, z1, shield: true, faces: {
      A: [{ t: 'door', double: true, a0: -1.06, a1: 1.06, y0: .26, y1: 2.72 }, { t: 'vent', a0: -.85, a1: -.3, y0: 1.95, y1: 2.5 }, { t: 'vent', a0: -.85, a1: -.3, y0: .5, y1: 1.05 }, { t: 'badge', a: .5, y: 1.75, s: .3 }],
      near: [{ t: 'portal', a0: -.75, y0: .48, a1: 1.35, y1: 2.45 }, { t: 'logo', a: 1.78, y: 2.38, s: .003 }, { t: 'vent', a0: 2.45, a1: 2.82, y0: .55, y1: 1.2 }, { t: 'vent', a0: 2.45, a1: 2.82, y0: 1.65, y1: 2.35 }],
      B: [{ t: 'vent', a0: .3, a1: .95, y0: 1.9, y1: 2.5 }],
    } });
    const { FL, CE } = m;
    // entry panel on the far end: RF line filters for power, waveguide tubes for fibre
    const eB = Ly.endB, pl = face(m, 'B');
    pbox(eB.S, pl, -.95, 1.0, -.1, 2.3, 0, .16, K.box); prect(eB.L, pl, -.95, 1.0, -.1, 2.3, .165, o(C.ink, .7));
    for (const [a, y] of [[-.75, 2.05], [-.55, 2.05], [-.35, 2.05], [-.75, 1.85], [-.55, 1.85]]) { const p = pl.pt(a, y, .25); eB.S.cyl(p[0], p[1], p[2], .045, .2, 'x', K.glandIn, 12); eB.L.circle(p[0] + .1, p[1], p[2], .045, 12, 'x', o(C.it, .9)); }
    for (const y of [1.25, 1.55]) prect(eB.L, pl, -.85, y, -.2, y + .2, .17, o(C.power, .8));
    // power: line filters behind the entry panel, then UPS, battery and board
    for (const [za, zb] of [[-.98, -.58], [-.5, -.1]]) cab(Ly.power, x1 - .5, x1 - .2, za, zb, FL + .8, 1.0, -1, 'board');
    cab(Ly.power, 1.3, 1.9, z1 - .9, z1 - .16, FL, 1.9, -1, 'ups');
    cab(Ly.power, 1.95, 2.55, z1 - .9, z1 - .16, FL, 1.9, -1, 'batt');
    const feed = [[x1 - .2, 1.5, -.55], [x1 - .45, CE - .1, -.55], [-2.4, CE - .1, -.55]];
    Ly.power.L.poly(feed, o(C.power, .55, { dash: .18 })); Ly.power.flows.push(new G.Flow([feed], { color: C.power, count: 16, speed: 1.3, size: 6 }));
    // IT: one row, in-row CW between the racks
    const r = row(Ly, [['ir', .3], ['r', .6], ['r', .6], ['ir', .3], ['r', .6], ['n', .6], ['ir', .3]], -2.65, z0 + .22, z0 + 1.2, FL, 1);
    lights(Ly.it, -2.6, x1 - .4, .5, CE);
    // cooling: chiller outside the shield, pipes in through dielectric breaks (the rings at the wall), headers over the row
    cooler(Ly.cooling, fans, x1 + .7, x1 + 1.9, -1.05, 1.05, 0, 1.6, 2);
    const PY = CE - .15, S = -.95, R = -.72, xe = r[r.length - 1].cx;
    const sup = pipe(Ly.cooling, [[x1 + .9, 1.6, S], [x1 + .9, PY, S], [r[0].cx, PY, S]], .05, C.cool);
    const ret = pipe(Ly.cooling, [[xe, PY, R], [x1 + 1.1, PY, R], [x1 + 1.1, 1.6, R]], .05, C.it);
    for (const z of [S, R]) { Ly.cooling.S.cyl(x1 - .02, PY, z, .085, .1, 'x', K.valve, 14); Ly.cooling.L.circle(x1 + .04, PY, z, .09, 14, 'x', o(C.power, .9)); }
    const drops = r.filter(q => q.t === 'ir').map(q => pipe(Ly.cooling, [[q.cx, PY, S], [q.cx, FL + 2.0, S]], .035, C.cool));
    Ly.cooling.flows.push(new G.Flow([sup, ...drops], { color: C.cool, count: 46, speed: 1.4, size: 5.5 }), new G.Flow([ret], { color: C.it, count: 24, speed: 1.1, size: 4.5 }));
    // protection: agent, detection, access control at the shielded door, cameras
    agent(Ly.safety, x0 + .45, z1 - .45, FL); detectors(Ly.safety, [-2.0, 0, 2.0], .5, CE); cams(Ly.safety, m);
    Ly.safety.S.box(1.5, 1.3, z1 + .02, 1.62, 1.5, z1 + .1, hex('#2a3644')); Ly.safety.P.add([1.56, 1.4, z1 + .12], C.blue2, 4, 1);
    return { poses: poses(26, { power: [1.9, .5], cool: [x1 + .6, 0], it: [-.8, -.4] }) };
  }

  /* ------------------------------------------------------------------ S-03 Expandable: two 250 kW modules joined into one hall,
     a third coming. After the render: an open joined hall with two overhead busways, a dry cooler at each module's end.
     Each module brings its own power room, row and cooler, so a step adds capacity without touching the live hall. */
  function expandable(Ly, fans) {
    const x0 = -L40 / 2, x1 = L40 / 2, Wd = 3.0;
    const A = module(Ly, { x0, x1, z0: 0, z1: Wd, H: 3.0, skip: ['far'], faces: {
      near: [{ t: 'logo', a: 1.0, y: 2.55, s: .0052 }, { t: 'door', a0: 4.7, a1: 5.6, y0: .3, y1: 2.35 }], B: [{ t: 'glands', a0: .4, y0: 2.0, n: 3, m: 2 }] } });
    const B = module(Ly, { x0, x1, z0: -Wd, z1: 0, H: 3.0, skip: ['near'], faces: { far: [{ t: 'door', a0: 4.7, a1: 5.6, y0: .3, y1: 2.35 }], B: [{ t: 'door', a0: -2.4, a1: -1.5, y0: .3, y1: 2.35 }] } });
    const { FL, CE } = A;
    const flowsP = [], sup = [], ret = [];
    for (const [m, f] of [[A, -1], [B, 1]]) { // f: the way the row faces (into the shared cold aisle)
      const zo = f < 0 ? m.z1 : m.z0, zw = zo - (f < 0 ? .16 : -.16), zr = zw - (f < 0 ? 1.05 : -1.05), za = Math.min(zw, zr), zb = Math.max(zw, zr);
      partition(Ly.floor, m, -3.85, f < 0 ? [.9, 1.8] : [-1.8, -.9]);
      // power room: two UPS, two battery cabinets, board
      cab(Ly.power, -5.9, -5.3, za, zb, FL, 1.95, f, 'ups'); cab(Ly.power, -5.25, -4.65, za, zb, FL, 1.95, f, 'ups');
      cab(Ly.power, -4.6, -4.0, za, zb, FL, 1.95, f, 'batt');
      // the row: three groups of three racks, an in-row cooler each side, a CDU for the liquid loop at the end
      const r = row(Ly, [['ir', .3], ['r', .6], ['r', .6], ['r', .6], ['ir', .3], ['r', .6], ['r', .6], ['r', .6], ['ir', .3], ['r', .6], ['r', .6], ['r', .6], ['ir', .3], ['c', .6]], -3.5, za, zb, FL, f);
      // overhead busway over the row with tap-off boxes (yellow, as in the render)
      const by = CE - .1, bz = (za + zb) / 2;
      bx(Ly.power, -3.7, by - .06, bz - .09, r[r.length - 1].x1, by + .06, bz + .09, K.steel, o(C.power, .8));
      r.filter(q => q.t === 'r').forEach(q => { Ly.power.S.box(q.cx - .12, by - .3, bz - .1, q.cx + .12, by - .06, bz + .1, K.bus); Ly.power.L.box(q.cx - .12, by - .3, bz - .1, q.cx + .12, by - .06, bz + .1, o(C.power, .9)); });
      const fp = [[x1 - .1, 2.3, f < 0 ? 1.2 : -1.2], [x1 - .4, by, bz], [-3.7, by, bz], [-4.3, by, bz], [-4.3, FL + 1.95, bz]];
      Ly.power.L.poly([fp[0], fp[1]], o(C.power, .55, { dash: .18 })); flowsP.push(fp);
      // cooling: a dry cooler outside the module's end, headers over the aisle side of the row, drops to the in-row units
      const zc = m.z0 + .3, zd = m.z1 - .3;
      cooler(Ly.cooling, fans, x0 - 2.0, x0 - .4, zc, zd, 0, 2.3, 2);
      const PY = CE - .35, Sz = bz + (f < 0 ? -.75 : .75), Rz = bz + (f < 0 ? -.95 : .95), xe = r[r.length - 1].cx;
      sup.push(pipe(Ly.cooling, [[x0 - .9, 2.3, Sz], [x0 - .9, PY, Sz], [xe, PY, Sz]], .06, C.cool));
      ret.push(pipe(Ly.cooling, [[xe - .2, PY + .14, Rz], [x0 - 1.4, PY + .14, Rz], [x0 - 1.4, 2.3, Rz]], .06, C.it));
      r.filter(q => q.t === 'ir' || q.t === 'c').forEach(q => sup.push(pipe(Ly.cooling, [[q.cx, PY, Sz], [q.cx, FL + 2.0, Sz]], .035, C.cool)));
      lights(Ly.it, -3.5, x1 - .4, f < 0 ? .6 : -.6, CE);
      agent(Ly.safety, -4.35, m.z0 + (f < 0 ? 2.65 : .35), FL); detectors(Ly.safety, [-5, -2, 1, 4], f < 0 ? .7 : -.7, CE);
    }
    Ly.power.flows.push(new G.Flow(flowsP, { color: C.power, count: 40, speed: 1.6, size: 6 }));
    Ly.cooling.flows.push(new G.Flow(sup, { color: C.cool, count: 110, speed: 1.5, size: 5.5 }), new G.Flow(ret, { color: C.it, count: 50, speed: 1.2, size: 4.5 }));
    cams(Ly.safety, { x0, x1, z0: -Wd, z1: Wd, top: 3.0 });
    // the next 250 kW step, waiting: its outline, row and cooler
    const g = Ly.ghost;
    ghostBox(g, x0, 0, -2 * Wd - .02, x1, 3.0, -Wd - .02); ghostBox(g, x0 - 2.0, 0, -2 * Wd + .3, x0 - .4, 2.3, -Wd - .3, .6);
    for (let x = -3.5; x < 4.3; x += .6) ghostBox(g, x, .3, -Wd - 1.21, x + .6, 2.5, -Wd - .16, .35);
    for (const z of [-Wd - .2, -2 * Wd + .2]) for (let x = x0 + .5; x < x1; x += 2.2) g.L.seg([x, .01, z], [x + 1.1, .01, z], o(C.it, .5));
    return { poses: poses(46, { power: [-5, 0], cool: [x0 - 1.2, 0], it: [0, 0] }, { base: pose([0, 3.4, -1.2], 34, 22, 46) }) };
  }

  /* ------------------------------------------------------------------ S-05 Custom: no fixed form, so a bespoke two-storey stack.
     After the render: modules side by side and on top of each other, walkways with railings, a stair, rooftop coolers
     and a pipe rack. Two 40 ft halls on the ground with a 20 ft power module beside them; a 40 ft and a 20 ft upstairs. */
  function custom(Ly, fans) {
    const dx = -3.0, G1 = module(Ly, { x0: -L40 / 2 + dx, x1: L40 / 2 + dx, z0: .15, z1: .15 + W, skip: ['far'], faces: {
      near: [{ t: 'logo', a: -8.2, y: 2.4, s: .0048 }, { t: 'hole', a0: -4.2, y0: .4, a1: .2, y1: 2.55 }], A: [{ t: 'louvre', a0: .6, a1: 2.0, y0: .5, y1: 2.3 }] } });
    const G2 = module(Ly, { x0: G1.x0, x1: G1.x1, z0: -.15 - W, z1: -.15, skip: ['near'], faces: { far: [{ t: 'door', a0: -1.6, a1: -.7, y0: .3, y1: 2.32 }], A: [{ t: 'louvre', a0: -2.0, a1: -.6, y0: .5, y1: 2.3 }] } });
    const G3 = module(Ly, { x0: G1.x1 + .3, x1: G1.x1 + .3 + L20, z0: -W / 2, z1: W / 2, faces: {
      near: [{ t: 'door', a0: G1.x1 + 1.0, a1: G1.x1 + 1.9, y0: .3, y1: 2.32 }, { t: 'louvre', a0: G1.x1 + 2.5, a1: G1.x1 + 4.2, y0: .5, y1: 2.4 }, { t: 'logo', a: G1.x1 + 4.7, y: 2.4, s: .0032 }],
      B: [{ t: 'glands', a0: -.6, y0: 1.9, n: 3, m: 3 }] } });
    const U1 = module(Ly, { x0: -L40 / 2 + dx - 1.1, x1: L40 / 2 + dx - 1.1, z0: .15, z1: .15 + W, y: H + .02, faces: {
      near: [{ t: 'logo', a: -5.5, y: H + 2.4, s: .0048 }], A: [{ t: 'hole', a0: .5, y0: H + .4, a1: 2.3, y1: H + 2.5 }] } });
    const U2 = module(Ly, { x0: -1.2, x1: -1.2 + L20, z0: -.15 - W, z1: -.15, y: H + .02, faces: { far: [{ t: 'logo', a: .2, y: H + 2.4, s: .0036 }], A: [{ t: 'door', a0: -2.2, a1: -1.3, y0: H + .32, y1: H + 2.34 }] } });
    const { FL, CE } = G1;
    // structure: columns under the overhang, a walkway along the upper near side, the stair up from beside the power module
    const fr = Ly.frame, st = o(C.line, .7), y2 = H + .02;
    for (const z of [.2, .15 + W - .15]) bx(fr, U1.x0 + .05, 0, z, U1.x0 + .2, y2, z + .15, K.steel, st);
    const wz0 = U1.z1, wz1 = U1.z1 + .8, wx0 = U1.x0, wx1 = U1.x1 + 1.2;
    bx(fr, wx0, y2, wz0, wx1, y2 + .06, wz1, K.deck, st);
    for (let x = wx0 + .1; x < wx1; x += 1.2) { fr.L.seg([x, y2, wz1], [x, y2 + 1.1, wz1], st); fr.S.box(x - .025, y2, wz1 - .05, x + .025, y2 + 1.1, wz1, K.steel); }
    fr.L.seg([wx0, y2 + 1.1, wz1], [wx1, y2 + 1.1, wz1], st); fr.L.seg([wx0, y2 + .55, wz1], [wx1, y2 + .55, wz1], o(C.line, .45));
    for (const x of [wx0 + .1, wx1 - .1]) bx(fr, x - .06, 0, wz1 - .12, x + .06, y2, wz1, K.steel, st);
    const sx0 = wx1, sx1 = wx1 + 3.1;
    for (let k = 0; k <= 16; k++) { const x = sx0 + (sx1 - sx0) * k / 16, y = y2 * (1 - k / 16); fr.L.seg([x, y, wz0 + .05], [x, y, wz1], o(C.line, .55)); }
    for (const z of [wz0 + .05, wz1]) { fr.S.beam([sx0, y2, z], [sx1, 0, z], .06, K.steel); fr.L.seg([sx0, y2 + 1.0, z], [sx1, 1.0, z], st); }
    // IT: rows in both ground halls and the upper 40 ft
    const rows = [];
    const seq = [['ir', .3], ['r', .6], ['r', .6], ['r', .6], ['ir', .3], ['r', .6], ['r', .6], ['r', .6], ['ir', .3], ['r', .6], ['n', .6], ['ir', .3]];
    rows.push(row(Ly, seq, -6.6, G1.z0 + .3, G1.z0 + 1.3, FL, 1), row(Ly, seq, -6.6, G2.z0 + .16, G2.z0 + 1.16, FL, 1), row(Ly, seq, U1.x0 + 2.8, U1.z0 + .3, U1.z0 + 1.3, U1.FL, 1));
    lights(Ly.it, -7, 2, G1.z0 + 1.8, CE); lights(Ly.it, -7, 2, G2.z0 + 1.6, CE); lights(Ly.it, U1.x0 + 2.8, U1.x1 - .3, U1.z0 + 1.8, U1.CE);
    // power: the 20 ft power module (MV switchgear, cast-resin transformer, LV board, after the project photos), trays to the halls
    const px = G3.x0;
    cab(Ly.power, px + .4, px + 1.6, -1.05, -.45, FL, 2.0, 1, 'board');
    bx(Ly.power, px + 2.0, FL, -.85, px + 3.4, FL + .15, .35, K.steel, o(C.power, .6));
    for (const x of [px + 2.25, px + 2.7, px + 3.15]) { Ly.power.S.cyl(x, FL + .95, -.25, .2, 1.3, 'y', K.coil, 18); Ly.power.L.circle(x, FL + 1.6, -.25, .2, 16, 'y', o(C.power, .9)); Ly.power.L.circle(x, FL + .3, -.25, .2, 16, 'y', o(C.power, .6)); }
    bx(Ly.power, px + 2.0, FL + 1.65, -.5, px + 3.4, FL + 1.8, 0, K.trafo, o(C.power, .7));
    cab(Ly.power, px + 3.8, px + 5.6, -1.05, -.45, FL, 2.0, 1, 'board');
    const ty = CE - .1, feeds = [];
    for (const z of [G1.z0 + 1.6, G2.z1 - 1.6]) {
      bx(Ly.power, -6.8, ty, z - .14, px + 4.6, ty + .06, z + .14, K.steel, o(C.power, .6));
      feeds.push([[px + 4.6, FL + 2.0, -.6], [px + 4.6, ty + .08, z], [-6.6, ty + .08, z]]);
    }
    feeds.push([[px + 4.6, FL + 2.0, -.6], [px + 4.6, ty + .08, .4], [px - .2, ty + .08, .4], [px - .2, U1.CE - .1, U1.z0 + 1.6], [U1.x0 + 2.8, U1.CE - .1, U1.z0 + 1.6]]);
    feeds.forEach(f => Ly.power.L.poly(f, o(C.power, .5, { dash: .18 })));
    Ly.power.flows.push(new G.Flow(feeds, { color: C.power, count: 60, speed: 1.8, size: 6 }));
    cab(Ly.power, U2.x0 + .4, U2.x0 + 1.0, U2.z0 + .16, U2.z0 + .96, U2.FL, 1.95, 1, 'ups'); cab(Ly.power, U2.x0 + 1.05, U2.x0 + 1.65, U2.z0 + .16, U2.z0 + .96, U2.FL, 1.95, 1, 'batt');
    cab(Ly.power, U2.x0 + 1.7, U2.x0 + 2.3, U2.z0 + .16, U2.z0 + .96, U2.FL, 1.95, 1, 'batt');
    // cooling: dry coolers on the upper roofs, a pipe rack down the gap between the stacks, headers over each row
    const rt = U1.top + .05, sup = [], ret = [];
    for (const [ux0, ux1, za, zb] of [[U1.x0 + .6, U1.x0 + 3.2, U1.z0 + .4, U1.z1 - .4], [U1.x0 + 3.6, U1.x0 + 6.2, U1.z0 + .4, U1.z1 - .4], [U2.x0 + .5, U2.x1 - .5, U2.z0 + .4, U2.z1 - .4]]) {
      cooler(Ly.cooling, fans, ux0, ux1, za, zb, rt, rt + 1.1, 2);
      sup.push(pipe(Ly.cooling, [[(ux0 + ux1) / 2, rt + .5, za < 0 ? zb + .15 : za - .15], [(ux0 + ux1) / 2, rt + .5, 0], [.4, rt + .5, 0]], .07, C.cool));
    }
    const riser = pipe(Ly.cooling, [[.4, rt + .5, 0], [.4, 1.0, 0]], .09, C.cool);
    const riserR = pipe(Ly.cooling, [[.75, 1.2, 0], [.75, rt + .7, 0]], .09, C.it);
    sup.push(riser); ret.push(riserR);
    for (const [r, PY, Sz] of [[rows[0], CE - .3, G1.z0 + .3 + 1.5], [rows[1], CE - .3, G2.z0 + .16 + 1.5], [rows[2], U1.CE - .3, U1.z0 + 1.8]]) {
      const ys = PY, xr = r[r.length - 1].cx;
      sup.push(pipe(Ly.cooling, [[.4, ys, 0], [.4, ys, Sz], [r[0].cx, ys, Sz]], .05, C.cool));
      r.filter(q => q.t === 'ir').forEach(q => sup.push(pipe(Ly.cooling, [[q.cx, ys, Sz], [q.cx, (r === rows[2] ? U1.FL : FL) + 2.0, Sz]], .035, C.cool)));
      ret.push([[xr, ys + .12, Sz + .2], [.75, ys + .12, Sz + .2]]); Ly.cooling.L.seg([xr, ys + .12, Sz + .2], [.75, ys + .12, Sz + .2], o(C.it, .6));
    }
    Ly.cooling.flows.push(new G.Flow(sup, { color: C.cool, count: 140, speed: 1.6, size: 5.5 }), new G.Flow(ret, { color: C.it, count: 50, speed: 1.2, size: 4.5 }));
    // protection
    for (const m of [G1, G2, U1]) { agent(Ly.safety, m.x1 - .5, (m.z0 + m.z1) / 2 + .6, m.FL); detectors(Ly.safety, [m.x0 + 2, m.x0 + 6, m.x0 + 10], (m.z0 + m.z1) / 2, m.CE); }
    for (const m of [G1, G3, U1, U2]) cams(Ly.safety, m);
    return { poses: poses(56, { power: [px + 2.8, 0], cool: [-3.0, 1.0], it: [-3.5, 1.2] }, {
      base: pose([0, 5.4, 0], 36, 22, 56), L3: pose([px + 2.6, 3.6, 0], 30, 28, 15), L4: pose([-3, 8.4, 0], 30, 30, 26), L5: pose([-3.5, 6.0, 1], 22, 26, 22) }) };
  }

  /* ------------------------------------------------------------------ S-06 Power & Cooling Skids: open steel frames that carry the plant.
     After the render (the cooling skid: blue frame, control panel, two pumps, manifold, three fans on top) and the
     project photos (MV switchgear, a cast-resin transformer, LV switchboard). Shown connected to a module (dashed). */
  function skidFrame(Ly, x0, x1, z0, z1, h) {
    const fr = Ly.frame, st = o(C.line, .8), col = K.skid;
    for (const z of [z0, z1 - .14]) { bx(fr, x0, 0, z, x1, .22, z + .14, col, st); bx(fr, x0, h - .12, z, x1, h, z + .12, col, st); }
    for (const x of [x0, x1 - .14]) { bx(fr, x, 0, z0, x + .14, .22, z1, col, st); bx(fr, x, h - .12, z0, x + .12, h, z1, col, st); }
    const n = Math.max(2, Math.round((x1 - x0) / 1.4));
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0 - .12) * i / n; for (const z of [z0, z1 - .12]) bx(fr, x, .22, z, x + .12, h - .12, z + .12, col, st); }
    for (const x of [x0 + .5, x1 - 1.0]) for (const z of [z0, z1 - .02]) fr.L.rectXY(x, .05, x + .5, .17, z + (z > z0 ? .025 : -.005), o(C.ink, .6)); // forklift pockets
    const fl = Ly.floor; fl.S.box(x0 + .14, .17, z0 + .14, x1 - .14, .22, z1 - .14, K.deck);
    for (let x = x0 + .3; x < x1 - .2; x += .12) fl.L.seg([x, .225, z0 + .14], [x, .225, z1 - .14], o(C.line, .16));
  }
  function skids(Ly, fans) {
    // the module they serve (dashed), behind them
    const g = Ly.ghost; ghostBox(g, -L40 / 2, 0, -3.6, L40 / 2, 3.0, -.6); for (let x = -5.6; x < 6; x += 1.4) g.L.seg([x, 3.0, -3.6], [x, 3.0, -.6], o(C.line, .2, { dash: .3 }));
    // power skid
    const p0 = -6.8, p1 = -.9, z0 = .6, z1 = 3.0, h = 2.7;
    skidFrame(Ly, p0, p1, z0, z1, h);
    cab(Ly.power, p0 + .3, p0 + 1.9, z1 - .95, z1 - .2, .22, 2.0, 1, 'board'); // MV ring-main unit, three cubicles
    for (const x of [p0 + .83, p0 + 1.36]) Ly.power.L.seg([x, .3, z1 - .195], [x, 2.15, z1 - .195], o(C.power, .5));
    bx(Ly.power, p0 + 2.3, .22, z0 + .5, p0 + 3.9, .4, z1 - .5, K.steel, o(C.power, .6));
    for (const x of [p0 + 2.6, p0 + 3.1, p0 + 3.6]) { Ly.power.S.cyl(x, 1.15, (z0 + z1) / 2, .22, 1.4, 'y', K.coil, 18); Ly.power.L.circle(x, 1.85, (z0 + z1) / 2, .22, 16, 'y', o(C.power, .9)); Ly.power.L.circle(x, .45, (z0 + z1) / 2, .22, 16, 'y', o(C.power, .6)); }
    bx(Ly.power, p0 + 2.3, 1.9, (z0 + z1) / 2 - .3, p0 + 3.9, 2.05, (z0 + z1) / 2 + .3, K.trafo, o(C.power, .7));
    cab(Ly.power, p0 + 4.3, p1 - .3, z1 - .85, z1 - .2, .22, 2.1, 1, 'board'); // LV switchboard
    const cable = [[p0 + 5.0, 2.32, z1 - .5], [p0 + 5.0, 2.5, z0 + .3], [p0 + 5.0, 2.5, -.6], [p0 + 5.0, 1.8, -.6]];
    const mv = [[p0 - 2.0, .05, z1 - .5], [p0 + 1.1, .05, z1 - .5], [p0 + 1.1, .25, z1 - .5]];
    Ly.power.L.poly(cable, o(C.power, .8)); Ly.power.L.poly(mv, o(C.power, .6, { dash: .2 }));
    Ly.power.flows.push(new G.Flow([mv, cable], { color: C.power, count: 30, speed: 1.6, size: 6.5 }));
    // two cooling skids (N+1)
    const sup = [], ret = [];
    for (const [c0, k] of [[.1, 0], [3.4, 1]]) {
      const c1 = c0 + 2.9, zz0 = .5, zz1 = 3.3;
      skidFrame(Ly, c0, c1, zz0, zz1, 2.8);
      // fluid cooler on top: coil block, three fans
      bx(Ly.cooling, c0 + .15, 2.0, zz0 + .15, c1 - .15, 2.68, zz1 - .15, K.chiller, o(C.cool, .8));
      for (let i = 0; i < 3; i++) { const fx = c0 + .55 + i * .9; Ly.cooling.S.cyl(fx, 2.95, (zz0 + zz1) / 2, .42, .5, 'y', K.chiller, 24); Ly.cooling.L.circle(fx, 2.7, (zz0 + zz1) / 2, .42, 24, 'y', o(C.cool, .6)); fan(Ly.cooling, fans, fx, 3.2, (zz0 + zz1) / 2, .36); }
      // control panel, front left; pumps, front right; the manifold behind
      bx(Ly.cooling, c0 + .2, .22, zz1 - .55, c0 + 1.35, 1.85, zz1 - .2, K.panel, o(C.cool, .85));
      Ly.cooling.L.seg([c0 + .78, .25, zz1 - .195], [c0 + .78, 1.82, zz1 - .195], o(C.cool, .6)); Ly.cooling.L.rectXY(c0 + .35, 1.4, c0 + .62, 1.62, zz1 - .195, o(C.cool, .9));
      Ly.cooling.P.add([c0 + .48, 1.51, zz1 - .18], C.cool, 7, 1); for (let j = 0; j < 3; j++) Ly.cooling.P.add([c0 + .4 + j * .1, 1.2, zz1 - .18], j ? C.ok : C.red, 3, 2, j);
      pump(Ly.cooling, c0 + 1.7, .22, zz1 - .7); pump(Ly.cooling, c0 + 1.7, .22, zz1 - 1.5);
      const sx = c0 + 2.45, rx = c0 + 2.15;
      const s = pipe(Ly.cooling, [[sx, 2.0, zz1 - .7], [sx, .75, zz1 - .7], [sx, .75, zz0 + .3], [sx, 2.3, zz0 + .3], [sx, 2.3, -.6]], .08, C.cool, K.pump);
      const r = pipe(Ly.cooling, [[rx, 2.0, -.6], [rx, 2.0, zz0 + .5], [rx, 1.0, zz0 + .5], [rx, 1.0, zz1 - 1.5], [c0 + 1.7, 1.0, zz1 - 1.5]], .08, C.it);
      sup.push(s); ret.push(r);
      for (const y of [.75, 1.0]) Ly.cooling.S.cyl(sx, y, zz0 + 1.2 + k * .01, .11, .08, 'z', K.valve, 12);
    }
    Ly.cooling.flows.push(new G.Flow(sup, { color: C.cool, count: 70, speed: 1.4, size: 5.5 }), new G.Flow(ret, { color: C.it, count: 45, speed: 1.2, size: 4.5 }));
    // protection: E-stops and beacons on each skid
    for (const x of [p1 - .2, 2.9, 6.2]) { Ly.safety.S.box(x - .08, 2.4, 3.0, x + .08, 2.6, 3.1, K.cyl); Ly.safety.P.add([x, 2.68, 3.05], C.safe, 7, 0); }
    return { poses: poses(40, { power: [-3.8, 1.8], cool: [3.3, 1.9], it: [0, 0] }, {
      base: pose([0, 3.2, 0], 30, 22, 38), PC: pose([0, 4.6, 1.2], 24, 26, 30), L3: pose([-3.8, 3.8, 1.8], 26, 26, 14), L4: pose([3.3, 4.8, 1.9], 32, 28, 16) }) };
  }

  /* ------------------------------------------------------------------ S-07 Power Module: 19" power cabinets in a 40 ft enclosure.
     After the render (a 40 ft box, three rooms, door on the end with a gland plate beside it) and the spec (19" rack /
     cabinet, N+1 hot-swap, optional battery): input switchboard, a lineup of hot-swap power cabinets, a battery room,
     a busway over them, and the output leaving through the glands to the module it serves. */
  function powerModule(Ly, fans) {
    const x0 = -L40 / 2, x1 = L40 / 2, z0 = -W / 2, z1 = W / 2;
    const m = module(Ly, { x0, x1, z0, z1, faces: {
      near: [{ t: 'logo', a: -1.4, y: 2.5, s: .005 }, { t: 'door', a0: -5.6, a1: -4.7, y0: .3, y1: 2.32 }],
      B: [{ t: 'door', a0: -.05, a1: .95, y0: .3, y1: 2.35 }, { t: 'glands', a0: -.9, y0: 1.55, n: 3, m: 3 }],
      A: [{ t: 'louvre', a0: -.8, a1: .8, y0: 1.5, y1: 2.45 }],
    } });
    const { FL, CE } = m, fz0 = z0 + .16, fz1 = z0 + .96;
    partition(Ly.floor, m, -3.6, [.15, 1.0]); partition(Ly.floor, m, 1.0, [.15, 1.0]);
    // room 1: input switchboard (two feeds); room 2: six hot-swap power cabinets + output board; room 3: battery cabinets
    cab(Ly.power, -5.85, -3.85, fz0, fz0 + .6, FL, 2.0, 1, 'board');
    for (let i = 0; i < 6; i++) cab(Ly.power, -3.4 + i * .6, -2.82 + i * .6, fz0, fz1, FL, 2.0, 1, 'shelf');
    cab(Ly.power, -2.9, -1.7, z1 - .55, z1 - .15, FL, 2.0, -1, 'board');
    for (let i = 0; i < 6; i++) cab(Ly.power, 1.3 + i * .62, 1.88 + i * .62, fz0, fz0 + .7, FL, 2.0, 1, 'batt');
    for (let i = 0; i < 3; i++) cab(Ly.power, 1.6 + i * .62, 2.18 + i * .62, z1 - .7, z1 - .16, FL, 2.0, -1, 'batt');
    // busway over the lineup, from the input board through to the output glands
    const by = CE - .12, bz = fz1 - .25;
    bx(Ly.power, -5.6, by - .06, bz - .09, x1 - .3, by + .06, bz + .09, K.bus, o(C.power, .85));
    for (let x = -5.2; x < x1 - .5; x += .6) Ly.power.L.seg([x, by - .06, bz + .095], [x, by + .06, bz + .095], o(C.power, .5));
    const feed = [[-4.85, FL + 2.0, fz0 + .3], [-4.85, by, bz], [x1 - .4, by, bz], [x1 - .4, 1.8, -.7], [x1 + .4, 1.8, -.7]];
    const inp = [[x0 - 1.6, .05, -.7], [x0 - .2, .05, -.7], [x0 - .2, 1.2, -.7], [-5.4, 1.2, -.7]];
    Ly.power.L.poly(inp, o(C.power, .6, { dash: .2 })); Ly.power.L.seg(feed[3], feed[4], o(C.power, .6, { dash: .2 }));
    Ly.power.flows.push(new G.Flow([inp, feed], { color: C.power, count: 50, speed: 1.6, size: 6.5 }));
    // monitoring: one 19" rack for the controller and DCIM gateway
    rack(Ly.it, -1.5, -.9, z1 - .75, z1 - .15, FL, 2.0, -1, true);
    // cooling: ceiling units in the power and battery rooms, condensers on the roof
    for (const x of [-2.8, -.8, 2.0, 4.4]) { bx(Ly.cooling, x - .5, CE - .3, .1, x + .5, CE - .05, .9, K.inrow, o(C.cool, .8)); Ly.cooling.L.rect(x - .4, .2, x + .4, .8, CE - .305, o(C.cool, .6)); Ly.cooling.P.add([x, CE - .31, .5], C.cool, 5, 1); }
    const sup = [];
    for (const [xa, xb] of [[-3.4, -1.0], [1.8, 4.2]]) {
      cooler(Ly.cooling, fans, xa, xb, -.8, .5, m.top + .02, m.top + .75, 2);
      sup.push(pipe(Ly.cooling, [[(xa + xb) / 2, m.top + .02, .7], [(xa + xb) / 2, CE - .05, .7], [xa < 0 ? -2.8 : 2.0, CE - .05, .7]], .035, C.cool));
    }
    Ly.cooling.flows.push(new G.Flow(sup, { color: C.cool, count: 30, speed: 1.2, size: 5 }));
    // protection: agent, detection incl. off-gas detection in the battery room, cameras
    agent(Ly.safety, -.6, fz0 + .3, FL); detectors(Ly.safety, [-4.8, -2.4, .0, 2.4, 4.6], .3, CE);
    for (const x of [2.0, 4.0]) Ly.safety.P.add([x, CE - .1, -.2], C.safe, 5, 2);
    cams(Ly.safety, m);
    return { poses: poses(40, { power: [-1.2, -.3], cool: [0, 0], it: [-1.2, .6] }, { L4: pose([0, 6.4, 0], 30, 30, 18), L3: pose([-1.2, 3.4, 0], 22, 30, 21) }) };
  }

  // camera poses per focus, as orbit parameters; s: the distance that frames the whole model exploded
  function poses(s, z, over) {
    return Object.assign({
      base: pose([0, 3.6, 0], 38, 20, s),
      L1: pose([0, 1.0, 0], 52, 24, s * .7), L2: pose([0, 3.4, 0], 28, 22, s * .88),
      L3: pose([z.power[0], 3.4, z.power[1]], 24, 30, Math.max(11, s * .34)), L4: pose([z.cool[0], 4.2, z.cool[1]], -38, 28, Math.max(11, s * .36)),
      L5: pose([z.it[0], 5.0, z.it[1]], 26, 26, Math.max(11, s * .34)), L6: pose([0, 6.6, 0], 36, 30, s * .6),
      PC: pose([(z.power[0] + z.cool[0]) / 2, 3.9, 0], -24, 28, s * .5),
    }, over || {});
  }

  const MODELS = { legacy, emsec, expandable, custom, skids, 'power-module': powerModule };
  MX.products = { has: s => !!MODELS[s], build: s => assemble(MODELS[s]) };
})();
