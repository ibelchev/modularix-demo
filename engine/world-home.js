/* Modularix — Design 1 · landing world: one module, built in six stages as you scroll.
   Chapters (T): 0 brief · 1 design · 2 frame · 3 envelope · 4 systems · 5 transport · 6 live · 7 solutions · 8 proof · 9 contact
   Every state below is a pure function of T, so scrolling back rewinds the build. */
(function () {
  'use strict';
  const THREE = window.THREE, MX = window.MX, G = MX.gl, C = G.C;
  const { clamp, lerp, smooth, ramp } = MX;
  const R = (T, a, b) => smooth(ramp(T, a, b));
  const win = (T, a, b, c, d) => R(T, a, b) * (1 - R(T, c, d));
  const o = (c, a, x) => Object.assign({ c, a }, x || {});

  const ctx = G.setup(document.getElementById('gl'));
  const { scene, camera } = ctx; MX.camera = camera;
  const mobile = MX.isMobile();

  /* ------------------------------------------------------------ product mode (drill-down): the page sets MX.prod = { on, focus }
     on: 0/1 holds the module in view; x: 0–1 how far its six layers are apart (the window's scroll); focus: 'L1'…'L6' or 'PC' (power + cooling) zooms to that layer */
  const PM = MX.prod || (MX.prod = { on: 0, focus: null, x: 1 });
  const XP = { frame: [0, 0, 0], brace: [0, 0, 0], floor: [0, 0, 0], wallFar: [0, 0, -3.4], wallNear: [0, 0, 3.4], endA: [-2.8, 0, 0], endB: [2.8, 0, 0],
    roof: [0, 7.4, 0], power: [0, 2.2, 0], cooling: [0, 3.1, 0], it: [0, 4.0, 0], safety: [0, 5.4, 0] };
  const LAYER = { L1: ['frame', 'brace', 'floor'], L2: ['wallFar', 'wallNear', 'endA', 'endB', 'roof'], L3: ['power'], L4: ['cooling'], L5: ['it'], L6: ['safety'], PC: ['power', 'cooling'] };
  let pAmt = 0, xAmt = 0; const hiW = {};
  const vP = new THREE.Vector3(), vL = new THREE.Vector3();

  /* ------------------------------------------------------------ ground, atmosphere */
  const ground = G.grid(); scene.add(ground);
  const pool = G.glow(16, C.blue); scene.add(pool);
  const dust = G.dust(mobile ? 380 : 900); scene.add(dust);

  /* ------------------------------------------------------------ the module */
  const M = MX.container.build(), D = M.D, K = MX.container.K, Ly = M.layers;
  const mod = M.root; scene.add(mod);

  /* ------------------------------------------------------------ the other solutions (product-models.js), built the first time their sheet opens;
     the page names the product in MX.prod.slug, and the reference module (with its site) hands over to its model in a crossfade */
  const PMOD = {}, pW = {};
  const pmodel = s => PMOD[s] || (MX.products && MX.products.has(s) ? (PMOD[s] = MX.products.build(s), scene.add(PMOD[s].root), PMOD[s]) : null);

  /* ------------------------------------------------------------ factory bay (Pantelimon): floor marks + hall portals */
  const fac = new G.Lines();
  fac.rect(-10.6, -4.2, 10.6, 4.2, .01, o(C.power, .5, { dash: .45 }));
  for (const [x, z, sx, sz] of [[-10.6, -4.2, 1, 1], [10.6, -4.2, -1, 1], [-10.6, 4.2, 1, -1], [10.6, 4.2, -1, -1]])
    for (let k = 0; k < 5; k++) fac.seg([x + sx * k * .32, .01, z], [x, .01, z + sz * k * .32], o(C.power, .4));
  for (let x = -18; x <= 18; x += 6) {
    fac.seg([x, 0, -7.5], [x, 9, -7.5], o(C.line, .15)); fac.seg([x, 0, 7.5], [x, 9, 7.5], o(C.line, .15));
    fac.poly([[x, 9, -7.5], [x, 10.6, 0], [x, 9, 7.5]], o(C.line, .2));
    fac.seg([x, 7.2, -7.5], [x, 7.2, -6.8], o(C.line, .3)); fac.seg([x, 7.2, 7.5], [x, 7.2, 6.8], o(C.line, .3));
  }
  for (const z of [-7.5, 7.5]) { fac.seg([-18, 9, z], [18, 9, z], o(C.line, .2)); fac.seg([-18, 7.2, z * .9], [18, 7.2, z * .9], o(C.line, .32)); }
  fac.seg([-18, 10.6, 0], [18, 10.6, 0], o(C.line, .16));
  const facMesh = fac.build({ sweep: [1, .2, .5] }); scene.add(facMesh);

  /* ------------------------------------------------------------ design: dimensions and zone plan */
  const dim = new G.Lines(), ink = o(C.ink, .8), ext = o(C.ink, .32, { dash: .14 });
  const arrow = (p, d, n) => { dim.seg(p, [p[0] + d[0] * .4 + n[0] * .13, p[1] + d[1] * .4 + n[1] * .13, p[2] + d[2] * .4 + n[2] * .13], ink); dim.seg(p, [p[0] + d[0] * .4 - n[0] * .13, p[1] + d[1] * .4 - n[1] * .13, p[2] + d[2] * .4 - n[2] * .13], ink); };
  const dz = D.Z1 + 1.3, dx = D.X1 + 1.3;
  dim.seg([D.X0, .01, dz], [D.X1, .01, dz], ink); arrow([D.X0, .01, dz], [1, 0, 0], [0, 0, 1]); arrow([D.X1, .01, dz], [-1, 0, 0], [0, 0, 1]);
  dim.seg([D.X0, .01, D.Z1 + .15], [D.X0, .01, dz + .35], ext); dim.seg([D.X1, .01, D.Z1 + .15], [D.X1, .01, dz + .35], ext);
  dim.seg([dx, .01, D.Z0], [dx, .01, D.Z1], ink); arrow([dx, .01, D.Z0], [0, 0, 1], [1, 0, 0]); arrow([dx, .01, D.Z1], [0, 0, -1], [1, 0, 0]);
  dim.seg([D.X1 + .15, .01, D.Z0], [dx + .35, .01, D.Z0], ext); dim.seg([D.X1 + .15, .01, D.Z1], [dx + .35, .01, D.Z1], ext);
  dim.seg([dx, 0, D.Z1], [dx, D.H, D.Z1], ink); arrow([dx, 0, D.Z1], [0, 1, 0], [1, 0, 0]); arrow([dx, D.H, D.Z1], [0, -1, 0], [1, 0, 0]);
  dim.seg([D.X1 + .15, D.H, D.Z1], [dx + .35, D.H, D.Z1], ext);
  const zone = (x0, x1, c) => {
    dim.rect(x0 + .05, D.Z0 - .35, x1 - .05, D.Z1 + .35, .012, o(c, .7, { dash: .3 }));
    for (let x = x0 + .3; x < x1 - .1; x += .45) dim.seg([x, .012, D.Z0 - .35], [Math.min(x + .7, x1 - .05), .012, D.Z0 - .35 + .7 * 0 + Math.min(.7, x1 - .05 - x)], o(c, .12));
  };
  zone(D.X0, D.XB, C.cool); zone(D.XB, D.XP, C.power); zone(D.XP, D.XV, C.it); zone(D.XV, D.X1, C.line);
  for (const x of [D.XB, D.XP, D.XV]) dim.seg([x, .012, D.Z0 - .9], [x, .012, D.Z1 + .9], o(C.ink, .45, { dash: .2 }));
  const dimMesh = dim.build({ sweep: [1, .2, .2] }); scene.add(dimMesh);

  /* ------------------------------------------------------------ transport: mobile crane, rigging, low-bed truck, road */
  const cz = -9.6, tip = [0, 18.6, 0];
  const cr = new G.Lines(), cl = o(C.line, .55), cd = o(C.line, .28);
  cr.box(-6.6, .75, cz - 1.3, 5.6, 1.9, cz + 1.3, cl);
  for (const x of [-5.1, -3.7, 2.3, 3.7]) for (const z of [cz - 1.3, cz + 1.3]) cr.circle(x, .6, z, .6, 16, 'z', cl);
  for (const x of [-5.9, 4.9]) for (const s of [-1, 1]) { cr.poly([[x, 1.1, cz + s * 1.3], [x, .25, cz + s * 3.6], [x, .02, cz + s * 3.6]], cl); cr.rect(x - .4, cz + s * 3.6 - .4, x + .4, cz + s * 3.6 + .4, .02, cl); }
  cr.box(-3.9, 1.9, cz - 1.25, -.7, 3.5, cz + 1.25, cl); cr.box(-5.8, 1.9, cz - 1.1, -3.9, 3.1, cz + 1.1, cd);
  cr.box(1.4, 1.9, cz - 1.25, 3.6, 3.6, cz + .2, cl); // carrier cab
  const p0 = [-1.6, 3.3, cz], dir = [tip[0] - p0[0], tip[1] - p0[1], tip[2] - p0[2]], bl = Math.hypot(...dir), du = dir.map(v => v / bl);
  const side = [1, 0, 0], nrm = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const bp = (t, s, n) => [p0[0] + du[0] * t + side[0] * s + nrm[0] * n, p0[1] + du[1] * t + side[1] * s + nrm[1] * n, p0[2] + du[2] * t + side[2] * s + nrm[2] * n];
  for (const [s, n] of [[-.4, -.35], [.4, -.35], [-.4, .35], [.4, .35]]) cr.seg(bp(0, s, n), bp(bl, s * .5, n * .5), cl);
  for (let t = 0; t < bl; t += 1.4) { const k = 1 - t / bl * .5; cr.seg(bp(t, -.4 * k, -.35 * k), bp(t + .7, .4 * k, -.35 * k), cd); cr.seg(bp(t, -.4 * k, .35 * k), bp(t + .7, .4 * k, .35 * k), cd); }
  cr.seg([-2.6, 2.3, cz], bp(bl * .32, 0, -.35), o(C.power, .5)); // luffing ram
  const craneMesh = cr.build({ sweep: [.2, 1, .4] }); scene.add(craneMesh);
  const rg = new G.Lines();
  rg.box(-6.6, 6.15, -.12, 6.6, 6.38, .12, o(C.power, .8));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) rg.seg([sx * 6.4, 6.15, 0], [sx * 8.09, D.H + .02, sz * 1.51], o(C.ink, .7));
  rg.seg([0, 6.38, 0], [0, 6.8, 0], o(C.ink, .8)); rg.box(-.25, 6.8, -.2, .25, 7.4, .2, o(C.power, .8));
  const rigMesh = rg.build({ sweep: [.2, 1, .2] }); scene.add(rigMesh);
  const rp = new G.Lines(); rp.seg([-.06, 0, 0], [-.06, 1, 0], o(C.ink, .7)); rp.seg([.06, 0, 0], [.06, 1, 0], o(C.ink, .7));
  const ropeMesh = rp.build({ span: 1 }); scene.add(ropeMesh);

  const tr = new G.Lines(), tl = o(C.line, .6), tdk = o(C.line, .3);
  tr.box(-8.7, .95, -1.27, 8.7, 1.3, 1.27, tl);
  for (let x = -8.2; x < 8.6; x += .9) tr.seg([x, 1.3, -1.27], [x, 1.3, 1.27], tdk);
  tr.poly([[8.7, 1.3, -1.2], [9.4, 1.75, -1.2], [11.0, 1.75, -1.2], [11.0, 1.2, -1.2]], tl); tr.poly([[8.7, 1.3, 1.2], [9.4, 1.75, 1.2], [11.0, 1.75, 1.2], [11.0, 1.2, 1.2]], tl);
  tr.box(11.1, 1.05, -1.25, 13.7, 3.75, 1.25, tl); tr.rectZY(-1.0, 2.5, 1.0, 3.5, 13.71, o(C.blue2, .5)); tr.box(10.0, .8, -1.0, 13.7, 1.05, 1.0, tdk);
  for (const x of [-7.4, -6.3, -5.2, 10.4, 12.9]) for (const z of [-1.05, 1.05]) { tr.circle(x, .48, z, .48, 18, 'z', tl); tr.circle(x, .48, z, .2, 10, 'z', tdk); }
  const truckMesh = tr.build({ sweep: [1, .2, .2] }); scene.add(truckMesh);
  const rd = new G.Lines();
  for (const z of [-4.2, 4.2]) rd.seg([-90, .01, z], [90, .01, z], o(C.line, .45));
  for (let x = -90; x < 90; x += 6) rd.seg([x, .01, 0], [x + 3, .01, 0], o(C.ink, .45));
  for (let x = -90; x < 90; x += 2) { rd.seg([x, .01, -4.2], [x - .6, .01, -4.8], o(C.line, .16)); rd.seg([x, .01, 4.2], [x - .6, .01, 4.8], o(C.line, .16)); }
  const roadMesh = rd.build({ sweep: [1, 0, 0] }); scene.add(roadMesh);

  /* ------------------------------------------------------------ the site: pad, plinths, fence, poles, generators, utility kiosk, cables */
  const site = new G.Layer('site');
  { const L = site.L, S = site.S, P = site.P;
    S.box(-16.2, 0, -3.6, 15.8, .15, 4.2, G.hex('#232b35')); L.rect(-16.2, -3.6, 15.8, 4.2, .152, o(C.line, .5));
    for (let x = -14; x < 15; x += 2) L.seg([x, .153, -3.6], [x, .153, 4.2], o(C.line, .08));
    for (const x of [D.X0 + .08, -4.95, -1.65, 1.65, 4.95, D.X1 - .08]) for (const z of [D.Z0 + .09, D.Z1 - .09]) { S.box(x - .32, .15, z - .3, x + .32, .35, z + .3, G.hex('#3a434e')); L.box(x - .32, .15, z - .3, x + .32, .35, z + .3, o(C.line, .45)); }
    // fence and light poles
    const fx0 = -18, fx1 = 18, fz0 = -5.6, fz1 = 6.4;
    for (const [a, b] of [[[fx0, fz0], [fx1, fz0]], [[fx1, fz0], [fx1, fz1]], [[fx1, fz1], [fx0, fz1]], [[fx0, fz1], [fx0, fz0]]]) {
      L.seg([a[0], 2.1, a[1]], [b[0], 2.1, b[1]], o(C.line, .35)); L.seg([a[0], 1.0, a[1]], [b[0], 1.0, b[1]], o(C.line, .18, { dash: .2 }));
      const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2.5);
      for (let k = 0; k <= n; k++) { const x = lerp(a[0], b[0], k / n), z = lerp(a[1], b[1], k / n); L.seg([x, 0, z], [x, 2.1, z], o(C.line, .28)); }
    }
    for (const [x, z] of [[fx0 + .6, fz0 + .6], [fx1 - .6, fz0 + .6], [fx0 + .6, fz1 - .6], [fx1 - .6, fz1 - .6]]) { L.seg([x, 0, z], [x, 7, z], o(C.line, .45)); L.seg([x, 7, z], [x * .96, 7, z * .9], o(C.line, .45)); P.add([x * .96, 6.95, z * .9], C.ink, 14, 3); }
    // generators A / B on trailers (2 × 220 kVA, 15 h autonomy)
    for (const z of [-1.15, 1.35]) {
      const x0 = -14.6, x1 = -10.9, z0 = z - .62, z1 = z + .62, y0 = .78, y1 = y0 + 2.3;
      S.box(x0, y0, z0, x1, y1, z1, G.hex('#232b35')); L.box(x0, y0, z0, x1, y1, z1, o(C.power, .9));
      S.box(x0, y1 - .32, z0 - .005, x1, y1 - .22, z1 + .005, G.hex('#c98a2c'));
      for (let x = x0 + .25; x < x1 - .2; x += .14) { L.seg([x, y0 + .3, z1 + .005], [x, y1 - .5, z1 + .005], o(C.power, .25)); L.seg([x, y0 + .3, z0 - .005], [x, y1 - .5, z0 - .005], o(C.power, .25)); }
      S.cyl(x0 + .6, y1 + .3, z, .1, .6, 'y', G.hex('#11161c'), 10); L.circle(x0 + .6, y1 + .6, z, .1, 10, 'y', o(C.power, .7));
      L.box(x0 - .2, .45, z0 + .1, x1 + .2, y0, z1 - .1, o(C.line, .5)); L.poly([[x1 + .2, .55, z0 + .2], [x1 + 1.4, .45, z], [x1 + .2, .55, z1 - .2]], o(C.line, .5));
      for (const zz of [z0 + .1, z1 - .1]) L.circle(-13.2, .4, zz, .38, 16, 'z', o(C.line, .55));
      P.add([x1 + .01, y0 + 1.7, z], C.ok, 7, 1);
    }
    // MV/LV kiosk feeding A / B
    S.box(11.4, .15, -2.0, 14.2, 2.6, .6, G.hex('#28313b')); L.box(11.4, .15, -2.0, 14.2, 2.6, .6, o(C.power, .8));
    for (const z of [-1.5, -.5]) L.rectZY(z - .35, .5, z + .35, 2.2, 11.39, o(C.power, .45));
    P.add([11.38, 2.35, -.7], C.power, 6, 1);
    // cable routes: generators and utility feeds to the gland end
    const y = .17, gy = 1.15;
    site.routes = [
      [[-10.9, 1.2, -1.15], [-10.3, y, -1.15], [-10.3, y, -2.5], [9.0, y, -2.5], [9.0, y, -1.18], [9.0, gy, -1.18], [8.4, gy, -1.18]],
      [[-10.9, 1.2, 1.35], [-10.0, y, 1.35], [-10.0, y, -2.85], [9.3, y, -2.85], [9.3, y, -.82], [9.3, gy, -.82], [8.4, gy, -.82]],
      [[11.4, 1.0, -1.5], [10.6, y, -1.5], [10.6, y, -1.0], [8.75, y, -1.0], [8.75, gy, -1.0], [8.4, gy, -1.0]],
      [[11.4, 1.0, -.5], [10.2, y, -.5], [10.2, y, -.64], [8.6, y, -.64], [8.6, gy, -.64], [8.4, gy, -.64]],
    ];
    site.routes.forEach(r => L.poly(r, o(C.power, .7, { dash: .22 })));
    site.flows.push(new G.Flow(site.routes, { color: C.power, count: 120, speed: 2.2, size: 6 }));
    site.a = { genA: [-12.7, 3.1, -1.15], genB: [-12.7, 3.1, 1.35], kiosk: [12.8, 2.6, -.7], feeds: [9.3, .2, -2.85] };
  }
  site.finish({ lines: { sweep: [.5, .3, 1] }, solid: { axis: [1, 0, 0], edge: C.power } });
  scene.add(site.group);

  /* ------------------------------------------------------------ campus: the module, repeated */
  const CAMPUS = [[22, 0], [0, -8], [22, -8], [44, 0], [44, -8], [0, -16], [22, -16], [44, -16]];
  const campus = CAMPUS.map(([x, z]) => { const g = MX.container.exterior(); g.position.set(x, .35, z); scene.add(g); return g; });
  const cpad = new G.Lines();
  cpad.rect(-18, -20, 56, 6.4, .01, o(C.line, .4, { dash: .5 })); for (const [x, z] of CAMPUS) cpad.rect(x - 9, z - 2.4, x + 9, z + 2.4, .012, o(C.it, .35));
  const cpadMesh = cpad.build({ sweep: [1, 0, .6] }); scene.add(cpadMesh);

  /* ------------------------------------------------------------ go-live ping: rings expanding from the module */
  const ringL = new G.Lines(); ringL.circle(0, .02, 0, 1, 96, 'y', o(C.blue2, .9));
  const ringGeo = ringL.build({ span: 1 }).geometry;
  const rings = [0, 1, 2].map(() => { const m = G.lineMesh(ringGeo, { span: 1 }); m.userData.u.uDraw.value = 1; m.scale.set(1, 1, .42); scene.add(m); return m; });

  /* ------------------------------------------------------------ labels */
  const lbl = new G.Labels(document.getElementById('labels'), camera);
  const add = (obj, p, html, cls, a, b, c, d, h) => lbl.add({ obj, p, html, cls, h, show: T => win(T, a, b, c, d) });
  const F = Ly.floor.a;
  add(scene, [0, .01, dz], '16 350 mm', 'dim', .7, .95, 1.3, 1.5);
  add(scene, [dx, .01, 0], '3 200', 'dim', .7, .95, 1.3, 1.5);
  add(scene, [dx, D.H / 2, D.Z1], '3 200', 'dim', .7, .95, 1.3, 1.5);
  add(Ly.floor.group, F.zoneBay, '<b>Z1</b>Chiller bay · N+N', 'cool', .75, 1, 1.3, 1.5, 44);
  add(Ly.floor.group, F.zonePower, '<b>Z2</b>Power room · 2N', 'power', .8, 1.05, 1.3, 1.5, 70);
  add(Ly.floor.group, F.zoneIT, '<b>Z3</b>IT hall · 120 kW', 'it', .85, 1.1, 1.3, 1.5, 44);
  add(Ly.floor.group, F.zoneEntry, '<b>Z4</b>Entry · glands', '', .9, 1.15, 1.3, 1.5, 70);
  add(Ly.frame.group, Ly.frame.a.steel, '<b>S355JR</b>Welded space frame', '', 1.75, 1.95, 2.3, 2.45, 46);
  add(Ly.frame.group, Ly.frame.a.iso, '<b>×24</b>ISO corners', '', 1.85, 2.05, 2.3, 2.45, 30);
  add(Ly.frame.group, Ly.frame.a.isoLo, '<b>C5</b>ISO 12944 coating', '', 1.9, 2.1, 2.3, 2.45, 64);
  add(Ly.wallNear.group, Ly.wallNear.a.panel, '<b>EI 90</b>Sandwich panel 100 mm', '', 2.85, 3.0, 3.3, 3.42, 40);
  add(Ly.roof.group, Ly.roof.a.roof, '<b>IP65</b>Sealed envelope', '', 3.0, 3.12, 3.3, 3.42, 34);
  add(Ly.endB.group, Ly.endB.a.glands, '<b>9×</b>Roxtec-type glands', 'safe', 2.9, 3.05, 3.3, 3.42, 54);
  add(Ly.power.group, Ly.power.a.ups, '<b>UPS A/B</b>2 × 150 kW modular', 'power', 3.6, 3.7, 3.88, 3.98, 54);
  add(Ly.power.group, Ly.power.a.batt, '<b>Li-ion</b>10 min @ 120 kW', 'power', 3.63, 3.73, 3.88, 3.98, 30);
  add(Ly.power.group, Ly.power.a.teg, '<b>TEG A/B</b>Dual feed · PLC ATS', 'power', 3.66, 3.76, 3.88, 3.98, 40);
  add(Ly.cooling.group, Ly.cooling.a.chiller, '<b>Chiller ×2</b>150 kW · free-cooling', 'cool', 3.86, 3.96, 4.12, 4.22, 70);
  add(Ly.cooling.group, Ly.cooling.a.chw, '<b>CHW</b>14 / 22 °C · glycol 40 %', 'cool', 3.9, 4.0, 4.12, 4.22, 30);
  add(Ly.it.group, Ly.it.a.rack, '<b>4 × 48U</b>up to 30 kW / rack', 'it', 4.1, 4.2, 4.36, 4.46, 46);
  add(Ly.cooling.group, Ly.cooling.a.inrow, '<b>In-row CW</b>N+1', 'cool', 4.12, 4.22, 4.36, 4.46, 84);
  add(Ly.it.group, Ly.it.a.contain, '<b>Hot aisle</b>contained', 'it', 4.14, 4.24, 4.36, 4.46, 28);
  add(Ly.safety.group, Ly.safety.a.cyl, '<b>FK-5-1-12</b>Clean agent', 'safe', 4.33, 4.43, 4.58, 4.66, 40);
  add(Ly.safety.group, Ly.safety.a.vesda, '<b>Aspirating</b>smoke detection', 'safe', 4.36, 4.46, 4.58, 4.66, 30);
  add(Ly.safety.group, Ly.safety.a.cctv, '<b>CCTV</b>15 × IP 5 MP', 'safe', 4.38, 4.48, 4.58, 4.66, 50);
  add(mod, [D.X1 - .08, D.H, D.Z1 - .09], '<b>Lift</b>4 × ISO corner', '', 4.9, 5.0, 5.2, 5.3, 36);
  add(mod, [0, D.H, 0], '<b>FAT</b>Passed · ready to ship', 'ok', 4.72, 4.82, 4.95, 5.05, 50);
  add(mod, [-4, D.H, 0], '<b>En route</b>Low-bed · ISO-corner lashed', '', 5.35, 5.45, 5.68, 5.78, 40);
  add(site.group, site.a.genA, '<b>Gen A</b>220 kVA · 15 h', 'power', 6.05, 6.15, 6.32, 6.42, 30);
  add(site.group, site.a.genB, '<b>Gen B</b>220 kVA · 15 h', 'power', 6.08, 6.18, 6.32, 6.42, 64);
  add(site.group, site.a.kiosk, '<b>Feed A / B</b>MV / LV', 'power', 6.1, 6.2, 6.32, 6.42, 24);
  add(mod, [-2, D.H + .2, 0], '<b>Live</b>120 kW IT · DCIM online', 'ok', 6.12, 6.22, 6.38, 6.5, 90);
  add(scene, [22, 3.6, 0], '<b>+120 kW</b>Module 02', 'it', 6.5, 6.6, 6.85, 6.95, 30);
  add(scene, [44, 3.6, -8], '<b>×9</b>1.08 MW campus', 'it', 6.62, 6.72, 6.85, 6.95, 30);

  /* evidence anchors: the page pins a photo to the part of the module it shows. MX.anchorAt(key) → screen px
     in the canvas (view offset included), or null when the point is behind the camera */
  const AN = {
    module: [mod, [0, D.H, 0]], zones: [Ly.floor.group, F.zoneIT], steel: [Ly.frame.group, Ly.frame.a.steel], iso: [Ly.frame.group, Ly.frame.a.iso],
    panel: [Ly.wallNear.group, Ly.wallNear.a.panel], roof: [Ly.roof.group, Ly.roof.a.roof], glands: [Ly.endB.group, Ly.endB.a.glands],
    teg: [Ly.power.group, Ly.power.a.teg], chiller: [Ly.cooling.group, Ly.cooling.a.chiller], chw: [Ly.cooling.group, Ly.cooling.a.chw],
    rack: [Ly.it.group, Ly.it.a.rack], vesda: [Ly.safety.group, Ly.safety.a.vesda], lift: [mod, [D.X1 - .08, D.H, D.Z1 - .09]]
  };
  const vA = new THREE.Vector3();
  MX.anchorAt = k => {
    const a = AN[k]; if (!a) return null;
    vA.fromArray(a[1]); a[0].localToWorld(vA); vA.project(camera);
    if (vA.z > 1) return null;
    const el = ctx.renderer.domElement, w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
    return { x: (vA.x * .5 + .5) * w, y: (-vA.y * .5 + .5) * h };
  };

  /* ------------------------------------------------------------ camera */
  // camera path as orbit parameters: target, azimuth (deg, from +z towards +x), elevation (deg), distance, fov
  const K_ = (t, l, az, el, d, fov = 34) => { const A = az * Math.PI / 180, E = el * Math.PI / 180; return { t, l, fov, o: [az, el, d], p: [l[0] + d * Math.cos(E) * Math.sin(A), l[1] + d * Math.sin(E), l[2] + d * Math.cos(E) * Math.cos(A)] }; };
  // two arcs, not a swing per stop: building it (Design → Transport) turns one way, past the near wall while it x-rays;
  // the module turns once on the crane hook; in service (Transport → Proof) turns back the other way
  const keys = [
    K_(0, [.5, 1.4, 0], 34, 13, 31),
    K_(1, [.4, .3, .4], 34, 50, 41, 32),
    K_(2, [-.5, 1.4, 0], 24, 17, 28),
    K_(3, [.6, 1.6, 0], 15, 12, 30),
    K_(3.58, [-3.6, 1.0, -.3], 8, 44, 12.5, 38),
    K_(3.86, [-6.4, 1.1, 0], -4, 38, 13.5, 38),
    K_(4.16, [1.6, 1.3, -.6], -14, 27, 11.5, 40),
    K_(4.44, [0, 1.1, 0], -22, 40, 25, 36),
    K_(4.9, [0, 4.8, -2.5], -32, 13, 40, 36),
    K_(5.1, [0, 4.8, -2.5], -34, 13, 40, 36), // hold while the module turns on the hook
    K_(5.3, [0, 2.6, 0], -28, 14, 31),
    K_(5.6, [-1, 2.3, 0], -16, 8, 28, 40),
    K_(5.95, [-.5, 1.4, 0], -2, 14, 33),
    K_(6.25, [-3, 1.4, 0], 12, 15, 33),
    K_(6.8, [17, 0, -7], 28, 34, 78),
    K_(7, [17, 0, -7], 40, 40, 74),
    K_(8, [17, 0, -7], 62, 20, 64),
    K_(9, [-.5, 1.0, 0], 40, 9, 22, 36),
  ];
  const rig = new G.Rig(camera, keys); rig.orbit = true; ctx.rigs.push(rig);
  const sides = MX.chapters.map(c => ({ l: 1, r: -1, w: 0, c: 0 })[c.dataset.side || 'l']);
  const sideAt = T => { const i = Math.floor(T), f = smooth(clamp(T - i, 0, 1)); return lerp(sides[i] ?? 0, sides[Math.min(sides.length - 1, i + 1)] ?? 0, f); };

  /* ------------------------------------------------------------ the timeline */
  const B = { frame: [1.45, 2.05], brace: [1.45, 2.05], floor: [2.35, 2.6], wallFar: [2.45, 2.85], wallNear: [2.55, 2.95], endA: [2.6, 2.95], endB: [2.65, 3.0], roof: [2.8, 3.15],
    power: [3.5, 3.72], cooling: [3.76, 3.98], it: [4.02, 4.24], safety: [4.27, 4.46], ext: [6.1, 6.25] };
  const t0 = performance.now() / 1000;
  const fwd = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

  const labelsEl = document.getElementById('labels');
  function prodPose(f) {
    const pm = PM.slug && PMOD[PM.slug];
    if (pm) { const q = pm.poses[f] || pm.poses.base; return K_(0, q.l, q.az, q.el, q.d); }
    const z = Ly.floor.a, at = (p, dy) => [p[0], dy, 0];
    switch (f) {
      case 'L1': return K_(0, [0, 1.0, 0], 52, 24, 27);
      case 'L2': return K_(0, [0, 3.6, 0], 28, 22, 36);
      case 'L3': return K_(0, at(z.zonePower, 3.4), 24, 30, 12.5);
      case 'L4': return K_(0, at(z.zoneBay, 4.2), -38, 28, 13.5);
      case 'L5': return K_(0, at(z.zoneIT, 5.0), 26, 26, 13);
      case 'L6': return K_(0, [0, 6.6, 0], 36, 30, 23);
      case 'PC': return K_(0, [(z.zoneBay[0] + z.zonePower[0]) / 2, 3.9, 0], -24, 28, 17);
      default: return K_(0, [0, 3.8, 0], 38, 20, 41);
    }
  }

  /* ------------------------------------------------------------ the reel (first screen)
     A timed showreel instead of the scroll build, all on site (no factory, no transport): the module builds from the
     frame up, the walls x-ray away while the systems go in, it explodes into its six layers and closes again, the
     campus grows around it, then a dip to dark resets the loop. Each scene system reads its own channel, so the reel
     can drive them independently of the scroll build. The page hands the reel back to the scroll timeline through
     MX.reelW() (0 = reel, 1 = scroll), switching under a brief dip to dark. */
  const SHOTS = [
    { n: 'Built frame up', d: 12 },
    { n: 'Inside the module', d: 16 },
    { n: 'Six layers', d: 12 },
    { n: 'Grow to a campus', d: 10 },
  ];
  let acc = 0; SHOTS.forEach(s => { s.s = acc; acc += s.d; });
  const LOOP = acc, LIVE = 6.3, BLANK = 1.6; // BLANK: a T with no labels showing
  // reel camera keys on reel time: look-at target, distance, elevation (azimuth turns on its own, slowly and always one way)
  const CK = [
    [0, [0, 1.2, 0], 40, 24], [11, [-.5, 1.3, 0], 33, 18],
    [13.5, [-1.5, -.2, 0], 26, 32], [26.5, [-1, -.2, 0], 27, 29],
    [29.5, [0, 1.8, 0], 52, 20], [39, [0, 1.6, 0], 50, 22],
    [42.5, [22, -3, -7], 96, 30], [LOOP, [24, -3, -8], 104, 33],
  ];
  function reelCam(rt) {
    let i = 0; while (i < CK.length - 2 && rt >= CK[i + 1][0]) i++;
    const a = CK[i], b = CK[i + 1], u = smooth(clamp((rt - a[0]) / Math.max(.001, b[0] - a[0]), 0, 1));
    return { l: [0, 1, 2].map(j => lerp(a[1][j], b[1][j], u)), d: lerp(a[2], b[2], u), el: lerp(a[3], b[3], u) };
  }
  // channels for reel time rt: Tl layers · xr x-ray · Tt transport · Ts site · Tc campus · Tlab labels · x explode · story (for the telemetry)
  function reelState(rt) {
    let i = 0; while (i < SHOTS.length - 1 && rt >= SHOTS[i + 1].s) i++;
    const u = clamp((rt - SHOTS[i].s) / SHOTS[i].d, 0, 1), r = (a, b) => smooth(ramp(u, a, b));
    const st = { i, u, Tl: LIVE, xr: 0, Tt: LIVE, Ts: LIVE, Tc: LIVE, Tlab: BLANK, x: 0, story: 6 };
    if (i === 0) { // frame, floor, walls, roof
      const T = lerp(1.35, 3.3, ramp(u, .04, .96));
      Object.assign(st, { Tl: T, Tlab: Math.max(T, BLANK), story: T });
    } else if (i === 1) { // walls x-ray away, the systems go in, a long look while it is open, then the envelope closes
      st.xr = r(0, .08) * (1 - r(.88, 1));
      st.Tl = u < .86 ? lerp(3.3, 4.6, ramp(u, .07, .5)) : lerp(4.6, LIVE, ramp(u, .88, .98));
      st.Tlab = u < .07 ? BLANK : lerp(3.4, 4.7, ramp(u, .07, .82)); st.story = Math.min(st.Tl, 4.6);
    }
    else if (i === 2) st.x = r(.04, .22) * (1 - r(.8, .97)); // apart for most of the shot
    else { st.Tc = lerp(6.38, 6.95, ramp(u, .08, .62)); st.Tlab = u < .1 ? BLANK : lerp(6.5, 6.8, ramp(u, .15, .6)); }
    return st;
  }
  const veilEl = document.getElementById('veil');
  // layer pins for the exploded shot: their own layer, because the build labels hide while the module is apart
  const xEl = document.createElement('div'); xEl.id = 'labelsX'; xEl.setAttribute('aria-hidden', 'true');
  labelsEl.after(xEl);
  const lblX = new G.Labels(xEl, camera);
  const xPin = (obj, p, html, cls, a, h) => lblX.add({ obj, p, html, cls, h, show: u => win(u, a - .1, a - .05, .74, .79) });
  xPin(Ly.roof.group, Ly.roof.a.roof, '<b>L2</b>Envelope · EI 90 · IP65', '', .3, 46);
  xPin(Ly.frame.group, Ly.frame.a.steel, '<b>L1</b>Structure · S355JR frame', '', .33, 22);
  xPin(Ly.power.group, Ly.power.a.ups, '<b>L3</b>Power · 2N to the rack', 'power l', .36, 104);
  xPin(Ly.cooling.group, Ly.cooling.a.chiller, '<b>L4</b>Cooling · N+N chillers', 'cool l', .39, 40);
  xPin(Ly.it.group, Ly.it.a.rack, '<b>L5</b>Compute · 4 × 48U', 'it', .42, 76);
  xPin(Ly.safety.group, Ly.safety.a.cyl, '<b>L6</b>Protection · clean agent', 'safe', .45, 132);
  const wantReel = () => (MX.reelW ? MX.reelW() < .5 : false) && !PM.on;
  // azimuth starts so the camera is square to the near wall (az 0, the side that x-rays open) mid "Inside the module";
  // it restarts with every loop, under the reset dip
  const AZ_RATE = 4, AZ0 = -(SHOTS[1].s + SHOTS[1].d * .5) * AZ_RATE;
  let reelOn = wantReel(), rt = 0, az = AZ0, dip = -1, lastRt = 0;
  // hero zoom: on the first screen the reel camera sits closer (HERO_D × distance) so the module fills the space;
  // it eases back to the normal framing as the visitor scrolls into the first section (MX.heroOut: 0 → 1)
  const HERO_D = .7; let zf = MX.heroOut ? MX.heroOut() : 1;
  MX.reel = { on: reelOn, i: 0, u: 0, n: SHOTS[0].n, count: SHOTS.length, story: 6 };
  const bump = (d, w) => 1 - smooth(clamp(Math.abs(d) / w, 0, 1));
  MX.reelSeek = v => { rt = clamp(v, 0, LOOP - .001); az = AZ0 + rt * AZ_RATE; rig.init = false; }; // review aid: jump to a shot

  G.run(ctx, (T, dt, t) => {
    // ---- reel or scroll: switch only while the scene is dark (scroll dip between Overview and Solutions, or a short timed dip)
    const w = MX.reelW ? MX.reelW() : 1, sv = MX.reelW ? bump(w - .5, .25) : 0;
    const want = wantReel();
    if (want !== reelOn) {
      if (sv > .82) { reelOn = want; rig.init = false; if (reelOn) rt = 0; }
      else if (dip < 0) dip = t;
    }
    let dv = 0;
    if (dip >= 0) {
      dv = bump(t - dip - .35, .35);
      if (t - dip >= .35 && wantReel() !== reelOn) { reelOn = wantReel(); rig.init = false; if (reelOn) rt = 0; }
      if (t - dip > .7) dip = -1;
    }
    if (reelOn) {
      lastRt = rt; rt = MX.reduced ? 3 : rt + dt;
      if (rt >= LOOP) rt -= LOOP;
      if (rt < lastRt) rig.init = false; // reset: hard cut from the campus back to the empty site
      if (!MX.reduced) az = AZ0 + rt * AZ_RATE;
    }
    const cv = reelOn && !MX.reduced ? bump(Math.min(rt, LOOP - rt), .6) : 0;
    veilEl && (veilEl.style.opacity = (Math.max(sv, dv, cv) * .97).toFixed(3));

    pAmt = MX.reduced ? PM.on : lerp(pAmt, PM.on, 1 - Math.exp(-dt * 2.6));
    if (Math.abs(pAmt - PM.on) < .001) pAmt = PM.on;
    xAmt = MX.reduced ? (PM.x ?? 1) : lerp(xAmt, PM.x ?? 1, 1 - Math.exp(-dt * 5));
    const st = reelOn ? reelState(rt) : { Tl: T, xr: win(T, 3.3, 3.48, 4.56, 4.74), Tt: T, Ts: T, Tc: T, Tlab: T, x: pAmt * xAmt, story: T };
    Object.assign(MX.reel, { on: reelOn, i: st.i ?? 0, u: st.u ?? 0, n: SHOTS[st.i ?? 0].n, story: st.story, p: rt / LOOP });
    const pX = st.x, focus = reelOn ? null : PM.focus;
    const { Tl, Tt, Ts, Tc } = st, xray = st.xr;
    // another solution's model in view: keep (1 → 0) is how much of the reference module and its site still shows
    const slug = PM.on && !reelOn ? PM.slug : null; if (slug) pmodel(slug);
    let alt = 0;
    for (const s in PMOD) { pW[s] = MX.reduced ? +(s === slug) : lerp(pW[s] ?? 0, s === slug ? 1 : 0, 1 - Math.exp(-dt * 4)); alt = Math.max(alt, pW[s]); }
    const keep = 1 - smooth(alt);
    labelsEl.style.opacity = (1 - Math.max(pX, pAmt)).toFixed(3);
    const intro = MX.reduced || reelOn ? 1 : smooth(clamp((t - t0 - .2) / 3.2, 0, 1));
    const crisp = R(Tl, .45, .95), base = lerp(.42, .9, crisp), mono = 1 - R(Tl, .55, 1.0);
    // a light sweep scans the blueprint on the cover, then once more over the design drawing
    const scanX = Tl < .7 ? Math.sin(t * .42) * 9.5 : lerp(-10, 10, ramp(Tl, .7, 1.25));
    const scanA = Math.max(1 - R(Tl, .3, .65), win(Tl, .7, .8, 1.15, 1.25) * .8) * intro;

    for (const n in Ly) {
      const l = Ly[n], b = B[n];
      if (n === 'ext') { l.set({ draw: R(Tl, 6.1, 6.25), line: keep, pts: R(Tl, 6.1, 6.25) * keep }); continue; }
      let a = lerp(base, .3, R(Tl, 1.3, 1.6));
      a = lerp(a, 1, R(Tl, b[0] - .18, b[0]));
      a = lerp(a, .42, R(Tl, b[1], b[1] + .3));
      let rev = R(Tl, b[0], b[1]), op = 1;
      if (n === 'wallNear' || n === 'roof') { op = 1 - xray; a = lerp(a, .16, xray); }
      if (n === 'brace') { op = 1 - xray * .9; a = lerp(a, .2, xray); }
      if (pX > .001) {
        const inF = !focus || (LAYER[focus] || []).includes(n);
        hiW[n] = lerp(hiW[n] ?? 1, inF ? 1 : 0, MX.reduced ? 1 : 1 - Math.exp(-dt * 5));
        const h = hiW[n], q = smooth(pX), env = LAYER.L2.includes(n);
        // exploded: the envelope panels come back as ghosts so the inside stays readable; a focused layer is lit, the rest dimmed
        a = lerp(a, lerp(.1, env ? .7 : 1, h), q);
        op = lerp(op, env ? (focus === 'L2' ? .85 * h : .12) : lerp(.18, 1, h), q);
        rev = lerp(rev, 1, q);
      }
      l.set({ draw: intro, line: a * keep, mono, reveal: rev, solid: op * keep, pts: R(Tl, b[1] - .04, b[1] + .1) * keep, scan: [scanX, scanA] });
      const x = XP[n]; if (x) { const e = smooth(pX); l.group.position.set(x[0] * e, x[1] * e, x[2] * e); }
    }
    // water and power in motion: commissioning test in the factory, then for good on site
    const cool = Math.max(win(Tl, 3.96, 4.1, 4.6, 4.72), R(Ts, 6.08, 6.25));
    Ly.cooling.set({ flow: cool * keep }); Ly.power.set({ flow: R(Ts, 6.08, 6.25) * keep });

    // the other solutions' models: assembled, or apart and focused like the reference module, at the weight of the crossfade
    for (const s in PMOD) {
      const pm = PMOD[s], w = smooth(pW[s]); pm.root.visible = w > .002; if (!pm.root.visible) continue;
      const foc = s === slug ? focus : null, q = smooth(pX);
      for (const n in pm.layers) {
        const l = pm.layers[n];
        if (n === 'ghost') { l.set({ draw: 1, line: w * (1 - q * .6) }); continue; }
        const k = s + ':' + n, inF = !foc || (LAYER[foc] || []).includes(n), env = LAYER.L2.includes(n);
        hiW[k] = lerp(hiW[k] ?? 1, inF ? 1 : 0, MX.reduced ? 1 : 1 - Math.exp(-dt * 5));
        const h = hiW[k];
        const a = lerp(.5, lerp(.1, env ? .7 : 1, h), q), op = lerp(1, env ? (foc === 'L2' ? .85 * h : .12) : lerp(.18, 1, h), q);
        l.set({ draw: 1, line: a * w, mono: 0, reveal: 1, solid: op * w, pts: w * (env ? 1 - q * .7 : 1), flow: w, glow: n === 'it' ? .25 : 0 });
        const x = XP[n]; if (x) l.group.position.set(x[0] * q, x[1] * q, x[2] * q);
      }
      pm.fans.forEach((f, i) => f.rotation.y += dt * (2 + i * .3) * 4);
    }
    M.fans.forEach((f, i) => f.rotation.y += dt * (2 + i * .3) * cool * 4);
    Ly.it.set({ glow: .25 * R(Tl, 4.2, 4.4) });

    // transport choreography
    const yLift = Tt < 5.12 ? R(Tt, 4.86, 5.06) * 3.4 : Tt < 5.8 ? lerp(3.4, 1.32, R(Tt, 5.12, 5.27)) : lerp(1.32, .35, R(Tt, 5.8, 5.96));
    mod.position.y = yLift;
    // one full turn on the hook while the camera holds, so the visitor sees every side and it lands as it left
    const spin = R(Tt, 4.9, 5.11) * Math.PI * 2;
    mod.rotation.y = spin;
    const truckX = Tt < 5.5 ? lerp(-38, 0, R(Tt, 4.94, 5.12)) : lerp(0, 36, R(Tt, 5.86, 6.05));
    truckMesh.position.x = truckX;
    G.setLines(truckMesh, R(Tt, 4.9, 5.05), win(Tt, 4.92, 5.02, 5.95, 6.06) * keep);
    const crane = win(Tt, 4.55, 4.72, 5.22, 5.38) * keep;
    G.setLines(craneMesh, R(Tt, 4.55, 4.86), crane);
    G.setLines(rigMesh, R(Tt, 4.66, 4.86), crane); rigMesh.position.y = yLift; rigMesh.rotation.y = spin;
    const spY = 7.4 + yLift; ropeMesh.position.y = spY; ropeMesh.scale.y = Math.max(.01, tip[1] - spY);
    G.setLines(ropeMesh, R(Tt, 4.7, 4.86), crane);
    const travel = R(Tt, 5.25, 5.78);
    ground.userData.u.uShift.value = travel * 160;
    roadMesh.position.x = -((travel * 160) % 6);
    G.setLines(roadMesh, R(Tt, 5.18, 5.36), win(Tt, 5.2, 5.32, 5.74, 5.86) * keep);
    G.setLines(facMesh, intro, lerp(.55, 1, crisp) * (1 - R(Tt, 5.05, 5.25)) * keep);
    G.setLines(dimMesh, R(Tl, .62, 1.05), win(Tl, .55, .8, 1.35, 1.6) * keep);

    // site + campus
    site.set({ draw: R(Ts, 5.55, 5.95), line: R(Ts, 5.55, 5.7) * keep, reveal: R(Ts, 5.78, 6.08), solid: keep, pts: R(Ts, 6.1, 6.3) * keep, flow: R(Ts, 6.08, 6.25) * keep });
    campus.forEach((g, i) => { const s = 6.42 + i * .045; g.set(R(Tc, s, s + .12), .55 * keep, R(Tc, s + .08, s + .2), keep); });
    G.setLines(cpadMesh, R(Tc, 6.38, 6.6), .7 * R(Tc, 6.38, 6.5) * keep);

    const ping = (win(Ts, 6.1, 6.25, 6.55, 6.8) + (reelOn ? 0 : .6 * R(T, 8.6, 9))) * (1 - xray) * (1 - pX) * keep;
    rings.forEach((m, i) => { const f = (t * .32 + i / 3) % 1; m.scale.set(9 + f * 16, 1, (9 + f * 16) * .42); G.setLines(m, 1, ping * (1 - f) * .8); });

    // ground + light pool
    pool.position.set(0, .006, 0);
    pool.userData.u.uOp.value = lerp(.28, .55, R(Tl, 4.1, 4.4)) * (1 - .5 * R(Tc, 6.6, 7)) + (reelOn ? 0 : .25 * R(T, 8.6, 9));

    // camera with framing: keep the module clear of the text column
    rig.update(reelOn ? 0 : T, dt, (tp, tl) => {
      if (reelOn) { // reel: one slow orbit, the shot only changes target, distance and height
        const c = reelCam(rt), A = az * Math.PI / 180, E = c.el * Math.PI / 180;
        const zt = mobile || !MX.heroOut ? 1 : MX.heroOut(); zf = MX.reduced ? zt : lerp(zf, zt, 1 - Math.exp(-dt * 4));
        c.d *= lerp(HERO_D, 1, smooth(zf));
        tl.fromArray(c.l);
        tp.set(tl.x + c.d * Math.cos(E) * Math.sin(A), tl.y + c.d * Math.sin(E), tl.z + c.d * Math.cos(E) * Math.cos(A));
      } else if (T < .6) { // idle orbit on the cover
        const a = Math.sin(t * .09) * .22 * (1 - R(T, 0, .6)), dx_ = tp.x - tl.x, dz_ = tp.z - tl.z;
        tp.x = tl.x + dx_ * Math.cos(a) - dz_ * Math.sin(a); tp.z = tl.z + dx_ * Math.sin(a) + dz_ * Math.cos(a);
      }
      fwd.subVectors(tl, tp); const dist = fwd.length(); fwd.normalize();
      right.crossVectors(fwd, up).normalize();
      if (camera.aspect < 1) { const k = 1 + (1 / camera.aspect - 1) * .95; tp.sub(tl).multiplyScalar(k).add(tl); tl.y -= dist * k * .12; tp.y -= dist * k * .12; }
      else if (!reelOn) tl.addScaledVector(right, -sideAt(T) * dist * .19);
      if (!reelOn && pAmt > .001) { const pose = prodPose(PM.focus), q = smooth(pAmt); tp.lerp(vP.fromArray(pose.p), q); tl.lerp(vL.fromArray(pose.l), q); }
    });
    const dist = camera.position.distanceTo(rig.l);
    G.U.uFogNear.value = dist * .7; G.U.uFogFar.value = dist * 3.4;
    const gu = ground.userData.u; gu.uCenter.value.set(rig.l.x, rig.l.z); gu.uRange.value = clamp(dist * 2.6, 40, 220);
    gu.uOp.value = lerp(.6, 1, crisp);
    scene.updateMatrixWorld();
    xEl.style.opacity = reelOn && st.i === 2 ? '1' : '0';
    if (reelOn && st.i === 2) lblX.update(st.u, ctx.renderer.domElement.clientWidth || innerWidth, ctx.renderer.domElement.clientHeight || innerHeight);
    lbl.update(st.Tlab, ctx.renderer.domElement.clientWidth || innerWidth, ctx.renderer.domElement.clientHeight || innerHeight);
  });
})();
