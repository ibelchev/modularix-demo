/* Modularix — Design 1 · the module itself.
   A parametric model of the Modularix AI/HPC 120 kW container, after the CAD set and the technical proposal:
   16 350 × 3 200 × 3 200 mm welded S355JR space frame, 12 posts / 24 ISO corners, an outdoor chiller bay
   behind lamella panels, a 2N power room (2 × UPS, 2 × Li-ion cabinets, switchboards TEG A/B), an IT hall with
   one contained row (4 × 48U racks, 1 network rack, 6 in-row CW units), chilled-water headers overhead,
   clean-agent suppression, detection and CCTV, and the cable-gland end wall.
   World units are metres; x runs along the container, y is up, z across. Origin: centre of the footprint, ground. */
(function () {
  'use strict';
  const THREE = window.THREE, MX = window.MX, G = MX.gl, C = G.C, hex = G.hex;

  const D = { L: 16.35, W: 3.2, H: 3.2, X0: -8.175, X1: 8.175, Z0: -1.6, Z1: 1.6, XB: -5.0, XP: -2.3, XV: 7.05, FL: .3, CE: 3.0 };
  const K = {
    steel: hex('#2b3747'), corner: hex('#56667a'), skin: hex('#1f4236'), skinHi: hex('#27503f'), lining: hex('#76838f'),
    floor: hex('#3a4552'), roof: hex('#1b3a30'), louver: hex('#26303c'), door: hex('#8e99a5'),
    rack: hex('#0f141b'), inrow: hex('#1c2530'), ups: hex('#242d38'), batt: hex('#1f2731'), board: hex('#8b97a4'),
    chiller: hex('#a3adb8'), fan: hex('#1b222b'), pipe: hex('#141a21'), valve: hex('#2a7fd4'), cyl: hex('#d8342b'),
    gland: hex('#d63a2e'), glandIn: hex('#c9cfd6'), box: hex('#8d98a4'),
    logoBlue: hex('#1e8fff'), logoRed: hex('#ff3b2f'), logoWhite: hex('#e8eef6'), logoDeep: hex('#0a3fd8'),
  };
  const sys = { power: { c: C.power }, cool: { c: C.cool }, it: { c: C.it }, safe: { c: C.safe } };
  const o = (c, a, x) => Object.assign({ c, a }, x || {});

  // the IT row along the far side, front face towards the aisle (z = -0.10)
  const ROW = (() => {
    const seq = [['ir', .3], ['r', .8], ['ir', .6], ['r', .8], ['ir', .6], ['r', .8], ['ir', .6], ['r', .8], ['ir', .6], ['n', .6], ['ir', .3]];
    let x = -1.9; return seq.map(([t, w]) => { const r = { t, x0: x, x1: x + w, cx: x + w / 2 }; x += w; return r; });
  })();
  const RZ0 = -1.30, RZ1 = -0.10;
  const PIPE_Y = 2.8, SUP_Z = -.95, RET_Z = -.68;

  /* ------------------------------------------------------------------ parts (each writes into a Lines L, Solids S, Points P) */
  const PX = [D.X0 + .08, -4.95, -1.65, 1.65, 4.95, D.X1 - .08];

  function frame(L, S, P, A, near) {
    const { X0, X1, Z0, Z1, H } = D, lo = o(C.line, .8), lf = o(C.line, .38);
    const pz = [Z0 + .08, Z1 - .08];
    for (const x of PX) for (const z of pz) { S.box(x - .08, 0, z - .08, x + .08, H, z + .08, K.steel); L.box(x - .08, 0, z - .08, x + .08, H, z + .08, lo); }
    for (const z of pz) {
      S.box(X0, 0, z - .07, X1, .26, z + .07, K.steel); L.box(X0, 0, z - .07, X1, .26, z + .07, lo);
      S.box(X0, H - .16, z - .07, X1, H, z + .07, K.steel); L.box(X0, H - .16, z - .07, X1, H, z + .07, lo);
    }
    for (const x of [X0 + .08, X1 - .08]) {
      S.box(x - .07, 0, Z0, x + .07, .26, Z1, K.steel); L.box(x - .07, 0, Z0, x + .07, .26, Z1, lo);
      S.box(x - .07, H - .16, Z0, x + .07, H, Z1, K.steel); L.box(x - .07, H - .16, Z0, x + .07, H, Z1, lo);
      // triangulated end truss, as in the bare-frame photograph
      const a = [x, H - .16, Z0 + .16], m = [x, H - .9, 0], b = [x, H - .16, Z1 - .16];
      S.beam(a, m, .06, K.steel); S.beam(m, b, .06, K.steel); L.seg(a, m, lo); L.seg(m, b, lo); L.seg(m, [x, H - .16, 0], lf);
    }
    for (let x = X0 + .6; x < X1 - .3; x += .6) { S.box(x - .04, .04, Z0 + .15, x + .04, .24, Z1 - .15, K.steel); L.seg([x, .24, Z0 + .15], [x, .24, Z1 - .15], lf); }
    for (let x = X0 + 1.62; x < X1 - .5; x += 1.62) { S.box(x - .05, H - .15, Z0 + .15, x + .05, H - .03, Z1 - .15, K.steel); L.seg([x, H - .03, Z0 + .15], [x, H - .03, Z1 - .15], lf); }
    for (let i = 0; i < PX.length - 1; i++) for (const z of pz) {
      const up = i % 2 === 0;
      const a = [PX[i] + .1, up ? .26 : H - .16, z], b = [PX[i + 1] - .1, up ? H - .16 : .26, z];
      const tgt = near && z > 0 ? near : { L, S };
      tgt.S.beam(a, b, .07, K.steel); tgt.L.seg(a, b, o(C.line, .6));
    }
    for (let i = 0; i < PX.length - 1; i++) {
      const y = H - .06;
      L.seg([PX[i], y, Z0 + .15], [PX[i + 1], y, Z1 - .15], o(C.line, .26, { dash: .3 }));
      L.seg([PX[i], y, Z1 - .15], [PX[i + 1], y, Z0 + .15], o(C.line, .26, { dash: .3 }));
    }
    for (const x of PX) for (const z of [Z0 + .09, Z1 - .09]) for (const y of [-.01, H - .12]) {
      S.box(x - .1, y, z - .095, x + .1, y + .13, z + .095, K.corner);
      L.box(x - .1, y, z - .095, x + .1, y + .13, z + .095, o(C.ink, .55));
    }
    A.iso = [X1 - .08, H, Z1 - .09]; A.steel = [-3.3, 1.6, Z1 - .08]; A.base = [1.65, .26, Z1 - .08]; A.isoLo = [X0 + .08, 0, Z1 - .09];
  }

  function floor(L, S, P, A) {
    const { X0, X1, Z0, Z1, XB, XP, XV, FL, CE } = D;
    S.box(XB - .05, .22, Z0 + .15, X1 - .15, FL, Z1 - .15, K.floor);
    L.rect(XB - .05, Z0 + .15, X1 - .15, Z1 - .15, FL, o(C.line, .55));
    for (let x = XP + .6; x < XV; x += .6) L.seg([x, FL + .003, Z0 + .16], [x, FL + .003, Z1 - .16], o(C.line, .14));
    for (let z = Z0 + .4; z < Z1 - .2; z += .6) L.seg([XP, FL + .003, z], [XV, FL + .003, z], o(C.line, .14));
    // chiller-bay grating
    for (let x = X0 + .3; x < XB; x += .22) { S.box(x - .015, .2, Z0 + .16, x + .015, .26, Z1 - .16, K.louver); L.seg([x, .26, Z0 + .16], [x, .26, Z1 - .16], o(C.line, .2)); }
    for (let z = Z0 + .3; z < Z1 - .2; z += .3) L.seg([X0 + .16, .26, z], [XB, .26, z], o(C.line, .16));
    // partitions: chiller bay | power room | IT hall | entry
    const part = (x, door, ext) => {
      const t = .05, top = CE, zA = Z0 + .16, zB = Z1 - .16, col = ext ? K.skin : K.lining;
      if (!door) { S.box(x - t, FL, zA, x + t, top, zB, col); L.rectZY(zA, FL, zB, top, x, o(C.line, .6)); return; }
      S.box(x - t, FL, zA, x + t, top, door[0], col); S.box(x - t, FL, door[1], x + t, top, zB, col); S.box(x - t, 2.25, door[0], x + t, top, door[1], col);
      L.rectZY(zA, FL, zB, top, x, o(C.line, .55)); L.rectZY(door[0], FL, door[1], 2.25, x, o(C.ink, .7));
      S.box(x - .02, FL, door[0] + .02, x + .02, 2.23, door[1] - .02, K.door);
      L.seg([x + t + .01, 1.1, door[1] - .12], [x + t + .01, 1.1, door[1] - .25], o(C.ink, .8));
    };
    part(XB, null, true); part(XP, [-.42, .48]); part(XV, [.2, 1.1]);
    A.floor = [2.6, FL, .8]; A.part = [XB, 2.2, 1.0];
    A.zoneBay = [-6.6, 2.3, 0]; A.zonePower = [-3.65, 2.3, 0]; A.zoneIT = [2.4, 2.6, .7]; A.zoneEntry = [7.6, 2.3, .65];
  }

  function wall(L, S, P, A, side) {
    const { X0, X1, Z0, Z1, XB, H } = D;
    const zo = side < 0 ? Z0 + .03 : Z1 - .03, zi = zo - side * .04, zl0 = zo - side * .12, zl1 = zo - side * .145;
    const x0 = XB - .05, x1 = X1 - .16, y0 = .26, y1 = H - .16;
    S.box(x0, y0, Math.min(zo, zi), x1, y1, Math.max(zo, zi), K.skin);
    S.box(x0, y0, Math.min(zl0, zl1), x1, y1, Math.max(zl0, zl1), K.lining);
    const zf = zo + side * .004;
    L.rectXY(x0, y0, x1, y1, zf, o(C.line, .5));
    for (let x = x0 + 1.1; x < x1 - .2; x += 1.1) {
      L.seg([x, y0, zf], [x, y1, zf], o(C.line, .3));
      S.box(x - .012, y0, side < 0 ? zo - .012 : zo, x + .012, y1, side < 0 ? zo : zo + .012, K.skinHi);
    }
    // lamella panels of the chiller bay
    for (let y = .42; y < H - .3; y += .13) {
      S.box(X0 + .16, y, side < 0 ? Z0 + .02 : Z1 - .09, XB - .05, y + .035, side < 0 ? Z0 + .09 : Z1 - .02, K.louver);
      L.seg([X0 + .16, y + .035, zo], [XB - .05, y + .035, zo], o(C.line, .26));
    }
    L.rectXY(X0 + .16, y0, XB - .05, y1, zo, o(C.line, .5));
    if (side > 0) {
      // the Modularix mark, scaled from the logo (five squares)
      const s = .0042, ox = 5.15, oy = 2.55, z = Z1 - .02;
      const sq = (px0, py0, px1, py1, c) => { S.box(ox + px0 * s, oy - py1 * s, z, ox + px1 * s, oy - py0 * s, z + .012, c); L.rectXY(ox + px0 * s, oy - py1 * s, ox + px1 * s, oy - py0 * s, z + .014, o(c, .9)); };
      sq(5, 0, 56, 51, K.logoBlue); sq(58, 53, 177, 166, K.logoBlue); sq(5, 171, 56, 222, K.logoRed); sq(181, 175, 233, 223, K.logoWhite); sq(125, 225, 177, 276, K.logoDeep);
      A.mark = [ox + .5, oy - .6, z];
      A.panel = [1.0, 1.9, Z1 - .03];
    } else A.panelFar = [1.0, 1.9, Z0 + .03];
  }

  function roof(L, S, P, A) {
    const { X0, X1, Z0, Z1, XB, H } = D;
    S.box(XB - .05, H - .17, Z0 + .15, X1 - .15, H - .03, Z1 - .15, K.roof);
    L.rect(XB - .05, Z0 + .15, X1 - .15, Z1 - .15, H - .02, o(C.line, .55));
    for (let x = XB + 1.1; x < X1 - .3; x += 1.1) L.seg([x, H - .02, Z0 + .15], [x, H - .02, Z1 - .15], o(C.line, .26));
    // grating over the chiller bay, fans exhaust through it
    for (let z = Z0 + .3; z < Z1 - .2; z += .2) { S.box(X0 + .16, H - .09, z - .012, XB - .05, H - .03, z + .012, K.louver); L.seg([X0 + .16, H - .03, z], [XB - .05, H - .03, z], o(C.line, .22)); }
    L.rect(X0 + .16, Z0 + .15, XB - .05, Z1 - .15, H - .03, o(C.line, .5));
    A.roof = [-1.0, H, 0];
  }

  function endA(L, S, P, A) { // chiller-bay end: lamella with an access door
    const { X0, Z0, Z1, H } = D;
    for (let y = .42; y < H - .3; y += .13) { S.box(X0 + .02, y, Z0 + .16, X0 + .09, y + .035, Z1 - .16, K.louver); L.seg([X0 + .02, y + .035, Z0 + .16], [X0 + .02, y + .035, Z1 - .16], o(C.line, .26)); }
    L.rectZY(Z0 + .16, .26, Z1 - .16, H - .16, X0 + .02, o(C.line, .5));
    L.rectZY(-.45, .3, .45, 2.3, X0 + .015, o(C.ink, .6));
    A.endA = [X0, 1.6, 0];
  }

  function endB(L, S, P, A) { // entry end: door, gland plate, external feed box
    const { X1, Z0, Z1, FL, H } = D, x0 = X1 - .09, x1 = X1 - .03, d0 = .18, d1 = 1.08, dt = 2.35;
    S.box(x0, .26, Z0 + .16, x1, H - .16, d0, K.skin); S.box(x0, .26, d1, x1, H - .16, Z1 - .16, K.skin); S.box(x0, dt, d0, x1, H - .16, d1, K.skin);
    S.box(x0 - .1, .26, Z0 + .16, x0 - .08, H - .16, Z1 - .16, K.lining);
    L.rectZY(Z0 + .16, .26, Z1 - .16, H - .16, x1 + .004, o(C.line, .5));
    S.box(X1 - .07, FL, d0 + .02, X1 - .035, dt - .02, d1 - .02, K.door);
    L.rectZY(d0, FL, d1, dt, x1 + .006, o(C.ink, .8)); L.seg([x1 + .01, 1.15, d1 - .1], [x1 + .01, 1.15, d1 - .26], o(C.ink, .9));
    // 3 × 3 cable glands (Roxtec-type)
    for (const z of [-1.02, -.79, -.56]) for (const y of [1.78, 2.0, 2.22]) {
      S.cyl(X1 + .01, y, z, .085, .1, 'x', K.gland, 16); S.cyl(X1 + .03, y, z, .045, .1, 'x', K.glandIn, 12);
      L.circle(X1 + .065, y, z, .085, 16, 'x', o(C.red, .9)); L.circle(X1 + .085, y, z, .045, 10, 'x', o(C.ink, .5));
    }
    // external feed box (4 × 400 A inlets: feed A, gen A, feed B, gen B)
    S.box(X1 - .03, .55, -1.32, X1 + .2, 1.38, -.48, K.box);
    L.box(X1 - .03, .55, -1.32, X1 + .2, 1.38, -.48, o(C.power, .75));
    for (const z of [-1.18, -1.0, -.82, -.64]) L.circle(X1 + .205, .8, z, .055, 12, 'x', o(C.power, .9));
    A.glands = [X1 + .08, 2.22, -.56]; A.door = [X1, 1.4, .63]; A.feedBox = [X1 + .2, 1.38, -.9];
  }

  function power(L, S, P, A) {
    const { Z0, Z1, FL, XB, XP } = D, c = C.power, h = 1.97;
    const far0 = Z0 + .2, far1 = Z0 + 1.05;
    [['ups', -4.88], ['ups', -4.24], ['batt', -3.6], ['batt', -2.96]].forEach(([t, x], i) => {
      const x1 = x + .6;
      S.box(x, FL, far0, x1, FL + h, far1, t === 'ups' ? K.ups : K.batt);
      L.box(x, FL, far0, x1, FL + h, far1, o(c, .85));
      if (t === 'ups') {
        L.rectXY(x + .14, FL + 1.45, x1 - .14, FL + 1.72, far1 + .005, o(c, .9));
        for (let y = FL + .25; y < FL + 1.2; y += .12) L.seg([x + .08, y, far1 + .005], [x1 - .08, y, far1 + .005], o(c, .3));
        P.add([x + .3, FL + 1.585, far1 + .02], C.ok, 7, 1);
        P.add([x + .45, FL + 1.85, far1 + .02], C.power, 5, 0);
      } else {
        for (let y = FL + .18; y < FL + h - .1; y += .115) L.seg([x + .06, y, far1 + .005], [x1 - .06, y, far1 + .005], o(c, .42));
        for (let k = 0; k < 4; k++) P.add([x + .5, FL + .3 + k * .42, far1 + .02], C.ok, 3.5, 2, k);
      }
    });
    // switchboards TEG 1 / TEG 2 (A / B) on the near wall
    const nz0 = Z1 - .78, nz1 = Z1 - .17;
    [[-4.88, 'A'], [-3.72, 'B']].forEach(([x]) => {
      const x1 = x + 1.1;
      S.box(x, FL, nz0, x1, FL + 2.0, nz1, K.board); L.box(x, FL, nz0, x1, FL + 2.0, nz1, o(c, .85));
      L.seg([x + .55, FL + .05, nz0 - .005], [x + .55, FL + 1.95, nz0 - .005], o(c, .5));
      L.rectXY(x + .12, FL + 1.25, x + .4, FL + 1.55, nz0 - .006, o(c, .9)); // PLC HMI
      P.add([x + .26, FL + 1.4, nz0 - .02], C.power, 9, 1);
      for (let k = 0; k < 5; k++) P.add([x + .7 + k * .07, FL + 1.75, nz0 - .02], k % 2 ? C.ok : C.red, 3, 2, k * 1.3);
    });
    // overhead power tray (ladder) over the power room and the rack row
    const ty = 2.66, tz0 = -.36, tz1 = -.08, tx0 = XB + .2, tx1 = 4.9;
    for (const z of [tz0, tz1]) { S.box(tx0, ty, z - .015, tx1, ty + .07, z + .015, K.steel); L.seg([tx0, ty + .07, z], [tx1, ty + .07, z], o(c, .7)); }
    for (let x = tx0 + .15; x < tx1; x += .3) L.seg([x, ty + .05, tz0], [x, ty + .05, tz1], o(c, .3));
    // feeds from the gland plate into the room (inside, along the tray)
    const feed = [[D.X1 - .2, 2.0, -.79], [D.X1 - .5, 2.0, -.79], [D.X1 - .5, ty + .1, -.2], [XB + .3, ty + .1, -.2], [XB + .3, FL + 2.0, -.2]];
    L.poly(feed, o(c, .55, { dash: .18 }));
    A.ups = [-4.24, FL + h, far0 + .4]; A.batt = [-2.96, FL + h, far0 + .4]; A.teg = [-3.72, FL + 2.0, nz0 + .3]; A.tray = [1.5, ty + .07, tz0];
    return { feed };
  }

  function cooling(L, S, P, A, fans) {
    const { X0, XB, FL, Z0, Z1 } = D, c = C.cool;
    // two chillers in the bay (N+N, 150 kW each, free-cooling)
    const ch = [[Z0 + .2, -.06], [.06, Z1 - .2]];
    ch.forEach(([z0, z1]) => {
      const x0 = X0 + .3, x1 = XB - .2, y0 = .26, y1 = 2.1;
      S.box(x0, y0, z0, x1, y1, z1, K.chiller); L.box(x0, y0, z0, x1, y1, z1, o(c, .85));
      // V-coil hint on the long sides
      for (const z of [z0 - .005, z1 + .005]) for (let x = x0 + .2; x < x1 - .1; x += .16) L.seg([x, y0 + .25, z], [x, y1 - .2, z], o(c, .22));
      for (const fx of [x0 + .7, x1 - .7]) {
        const fz = (z0 + z1) / 2;
        S.cyl(fx, y1 + .02, fz, .5, .04, 'y', K.fan, 28);
        L.circle(fx, y1 + .05, fz, .52, 32, 'y', o(c, .9)); L.circle(fx, y1 + .05, fz, .12, 12, 'y', o(c, .6));
        fans.push([fx, y1 + .06, fz]);
      }
    });
    // in-row CW units in the row
    ROW.filter(r => r.t === 'ir').forEach(r => {
      S.box(r.x0 + .01, FL, RZ0, r.x1 - .01, FL + 2.0, RZ1, K.inrow);
      L.box(r.x0 + .01, FL, RZ0, r.x1 - .01, FL + 2.0, RZ1, o(c, .9));
      for (let y = FL + .2; y < FL + 1.85; y += .09) L.seg([r.x0 + .05, y, RZ1 + .004], [r.x1 - .05, y, RZ1 + .004], o(c, .3));
      P.add([r.cx, FL + 1.88, RZ1 + .02], C.cool, 6, 1);
    });
    // chilled-water headers: supply + return from the bay to the end of the row, with drops to each unit
    const xa = -6.3, xb = ROW[ROW.length - 1].cx;
    const pipe = (z, col, r) => {
      S.cyl((xa + xb) / 2, PIPE_Y, z, r, xb - xa, 'x', K.pipe, 14);
      L.seg([xa, PIPE_Y + r, z], [xb, PIPE_Y + r, z], o(col, .9)); L.seg([xa, PIPE_Y - r, z], [xb, PIPE_Y - r, z], o(col, .45));
      S.cyl(xa, (PIPE_Y + 2.1) / 2, z, r, PIPE_Y - 2.1, 'y', K.pipe, 12); L.seg([xa, 2.1, z], [xa, PIPE_Y, z], o(col, .8));
      ROW.filter(q => q.t === 'ir').forEach(q => {
        S.cyl(q.cx, (PIPE_Y + FL + 2.0) / 2, z, r * .7, PIPE_Y - FL - 2.0, 'y', K.pipe, 10);
        L.seg([q.cx, FL + 2.0, z], [q.cx, PIPE_Y, z], o(col, .7));
        S.cyl(q.cx, FL + 2.18, z, r * 1.25, .06, 'y', K.valve, 10);
      });
      for (const x of [XB, D.XP]) S.cyl(x + .12, PIPE_Y, z, r * 1.3, .08, 'x', K.valve, 12);
    };
    pipe(SUP_Z, C.cool, .06); pipe(RET_Z, C.it, .06);
    // crossover to the second chiller
    S.cyl(-6.9, PIPE_Y, (RET_Z + .7) / 2, .05, .7 - RET_Z, 'z', K.pipe, 10); L.seg([-6.9, PIPE_Y, RET_Z], [-6.9, PIPE_Y, .7], o(c, .6));
    S.cyl(-6.9, (PIPE_Y + 2.1) / 2, .7, .05, PIPE_Y - 2.1, 'y', K.pipe, 10); L.seg([-6.9, 2.1, .7], [-6.9, PIPE_Y, .7], o(c, .6));
    const sup = [[xa, 2.1, SUP_Z], [xa, PIPE_Y, SUP_Z], [xb, PIPE_Y, SUP_Z]];
    const ret = [[xb, PIPE_Y, RET_Z], [xa, PIPE_Y, RET_Z], [xa, 2.1, RET_Z]];
    const drops = ROW.filter(q => q.t === 'ir').map(q => [[q.cx, PIPE_Y, SUP_Z], [q.cx, FL + 2.0, SUP_Z]]);
    A.chiller = [-6.6, 2.15, -.7]; A.chiller2 = [-5.3, 2.15, .7]; A.inrow = [ROW[2].cx, FL + 2.0, RZ1]; A.chw = [0.4, PIPE_Y + .06, SUP_Z];
    return { sup, ret, drops };
  }

  function it(L, S, P, A) {
    const { FL, CE } = D, c = C.it;
    ROW.filter(r => r.t !== 'ir').forEach((r, ri) => {
      const net = r.t === 'n', h = net ? 1.99 : 2.26;
      S.box(r.x0 + .01, FL, RZ0, r.x1 - .01, FL + h, RZ1, K.rack);
      L.box(r.x0 + .01, FL, RZ0, r.x1 - .01, FL + h, RZ1, o(c, .9));
      // perforated front door
      for (let x = r.x0 + .08; x < r.x1 - .05; x += .07) L.seg([x, FL + .08, RZ1 + .004], [x, FL + h - .08, RZ1 + .004], o(c, .16));
      // server LEDs
      const n = net ? 70 : 44;
      for (let k = 0; k < n; k++) {
        const y = FL + .15 + Math.random() * (h - .3), x = r.x0 + .08 + Math.random() * (r.x1 - r.x0 - .16);
        const pick = Math.random();
        P.add([x, y, RZ1 + .015], pick < .62 ? C.blue2 : pick < .85 ? C.it : pick < .95 ? C.ok : C.power, 2.6 + Math.random() * 2.2, Math.random() < .7 ? 0 : 1);
      }
    });
    // hot-aisle containment: roof over the row + end doors
    const x0 = ROW[0].x0, x1 = ROW[ROW.length - 1].x1, ry = FL + 2.28;
    L.rect(x0, D.Z0 + .16, x1, RZ1, ry, o(c, .6));
    for (let x = x0 + .4; x < x1; x += .4) L.seg([x, ry, D.Z0 + .16], [x, ry, RZ1], o(c, .18));
    S.box(x0, ry - .01, D.Z0 + .16, x1, ry + .01, RZ1, hex('#1a2c4a'));
    for (const x of [x0, x1]) { L.rectZY(D.Z0 + .16, FL, RZ1, ry, x, o(c, .5)); L.seg([x, FL, -.7], [x, ry, -.7], o(c, .3)); }
    // data tray above the aisle
    const ty = 2.88, tz0 = .08, tz1 = .34;
    for (const z of [tz0, tz1]) { S.box(D.XP, ty, z - .012, D.XV, ty + .06, z + .012, K.steel); L.seg([D.XP, ty + .06, z], [D.XV, ty + .06, z], o(c, .6)); }
    for (let x = D.XP + .15; x < D.XV; x += .3) L.seg([x, ty + .04, tz0], [x, ty + .04, tz1], o(c, .25));
    // aisle lighting
    for (let x = -1.6; x < 6.6; x += 1.6) { L.rect(x, .62, x + 1.2, .78, CE - .03, o(C.ink, .45)); P.add([x + .6, CE - .06, .7], C.ink, 5, 3); }
    A.rack = [ROW[3].cx, FL + 2.26, RZ1]; A.net = [ROW[9].cx, FL + 1.99, RZ1]; A.contain = [x1 - .4, ry, -.7]; A.aisle = [3.6, FL + 1.2, .7];
  }

  function safety(L, S, P, A) {
    const { X0, X1, Z0, Z1, FL, CE, H, XB, XV } = D, c = C.safe;
    // FK-5-1-12 clean-agent cylinder + discharge network
    const cx = -2.0, cz = 1.12;
    S.cyl(cx, FL + .72, cz, .2, 1.44, 'y', K.cyl, 22); S.cyl(cx, FL + 1.5, cz, .07, .14, 'y', hex('#c9cfd6'), 10);
    L.circle(cx, FL + .02, cz, .2, 20, 'y', o(c, .9)); L.circle(cx, FL + 1.44, cz, .2, 20, 'y', o(c, .9));
    L.seg([cx - .2, FL, cz], [cx - .2, FL + 1.44, cz], o(c, .6)); L.seg([cx + .2, FL, cz], [cx + .2, FL + 1.44, cz], o(c, .6));
    const disc = [[cx, FL + 1.56, cz], [cx, CE - .1, cz], [cx, CE - .1, .45], [XV - .3, CE - .1, .45]];
    L.poly(disc, o(c, .75)); L.poly([[cx, CE - .1, .45], [XB + .4, CE - .1, .45]], o(c, .75));
    for (const x of [-4.0, -.2, 2.4, 5.0]) { L.seg([x, CE - .1, .45], [x, CE - .3, .45], o(c, .7)); P.add([x, CE - .32, .45], C.safe, 5, 3); }
    // aspirating smoke detection pipe with sampling holes
    L.seg([XB + .3, CE - .04, -.2], [XV - .2, CE - .04, -.2], o(c, .55, { dash: .12 }));
    for (let x = XB + .8; x < XV; x += 1.4) P.add([x, CE - .06, -.2], C.safe, 3.5, 1);
    // point detectors
    for (const x of [-3.6, -.8, 1.8, 4.4, 6.5]) { S.cyl(x, CE - .03, 1.0, .07, .05, 'y', hex('#d9dee4'), 12); L.circle(x, CE - .055, 1.0, .07, 10, 'y', o(c, .8)); }
    // leak-detection cable along the row
    L.seg([ROW[0].x0, FL + .01, RZ1 + .12], [ROW[ROW.length - 1].x1, FL + .01, RZ1 + .12], o(c, .55, { dash: .1 }));
    // CCTV: 10 exterior, 5 interior; sirens and beacons
    const cam = (p, dir) => { L.seg(p, [p[0] + dir[0] * .28, p[1] - .12, p[2] + dir[2] * .28], o(c, .8)); P.add(p, C.safe, 4.5, 2); };
    for (const x of [-7.6, -2.6, 2.6, 7.6]) { cam([x, H - .25, Z1 + .02], [0, 0, 1]); cam([x, H - .25, Z0 - .02], [0, 0, -1]); }
    cam([X1 + .02, H - .25, -1.35], [1, 0, 0]); cam([X0 - .02, H - .25, 1.35], [-1, 0, 0]);
    for (const p of [[XB + .3, CE - .1, -1.3], [XP2(), CE - .1, 1.3], [0, CE - .1, 1.3], [4.5, CE - .1, -1.3], [XV - .2, CE - .1, 1.3]]) P.add(p, C.safe, 3.5, 2);
    S.box(X1 - .02, 2.55, 1.2, X1 + .1, 2.75, 1.4, K.cyl); P.add([X1 + .12, 2.65, 1.3], C.safe, 9, 0);
    S.box(X1 - .02, 2.55, -.15, X1 + .1, 2.7, .05, hex('#2a3644')); P.add([X1 + .12, 2.62, -.05], C.blue2, 4, 1); // card reader / access control
    A.cyl = [cx, FL + 1.5, cz]; A.vesda = [3.2, CE - .04, -.2]; A.cctv = [2.6, H - .25, Z1 + .02]; A.leak = [3.4, FL, RZ1 + .12];
  }
  const XP2 = () => D.XP + .3;

  function ext(L, S, P, A) { // exterior LED floodlights (6 × 50 W), lit once the module is live
    const { X0, X1, Z0, Z1, H } = D;
    for (const [x, z, dz] of [[X0 + .4, Z1 + .02, 1], [X0 + .4, Z0 - .02, -1], [X1 - .4, Z1 + .02, 1], [X1 - .4, Z0 - .02, -1], [-6.6, Z1 + .02, 1], [-6.6, Z0 - .02, -1]]) {
      P.add([x, H + .05, z], C.ink, 11, 3);
      for (const dx of [-1.2, 1.2]) L.seg([x, H, z], [x + dx, 0, z + dz * 2.4], o(C.ink, .12, { dash: .25 }));
    }
  }

  /* ------------------------------------------------------------------ assembly */
  function build() {
    const layers = {}, fanPos = [];
    const mk = (name, fn, opts) => {
      const ly = new G.Layer(name); layers[name] = ly;
      const r = fn(ly.L, ly.S, ly.P, ly.a, fanPos);
      ly.extra = r; ly.opts = opts; return ly;
    };
    const brace = mk('brace', () => {}, { lines: { sweep: [.4, 1, .2] }, solid: { axis: [0, 1, 0], edge: C.blue2 } });
    mk('frame', (L, S, P, A) => frame(L, S, P, A, brace), { lines: { sweep: [.4, 1, .2] }, solid: { axis: [0, 1, 0], edge: C.blue2 } });
    mk('floor', floor, { lines: { sweep: [1, .2, .3] }, solid: { axis: [1, 0, 0] } });
    mk('wallFar', (L, S, P, A) => wall(L, S, P, A, -1), { solid: { axis: [0, 1, 0] } });
    mk('wallNear', (L, S, P, A) => wall(L, S, P, A, 1), { solid: { axis: [0, 1, 0] } });
    mk('roof', roof, { solid: { axis: [1, 0, 0] } });
    mk('endA', endA, { solid: { axis: [0, 1, 0] } });
    mk('endB', endB, { solid: { axis: [0, 1, 0] } });
    const pw = mk('power', power, { lines: { pen: C.power }, solid: { axis: [0, 1, 0], edge: C.power } });
    const cl = mk('cooling', cooling, { lines: { pen: C.cool }, solid: { axis: [1, 0, 0], edge: C.cool } });
    mk('it', it, { lines: { pen: C.blue2 }, solid: { axis: [1, 0, 0], edge: C.blue2 } });
    mk('safety', safety, { lines: { pen: C.safe }, solid: { axis: [0, 1, 0], edge: C.safe } });
    mk('ext', ext, {});
    // energy and water in motion
    pw.flows.push(new G.Flow([pw.extra.feed], { color: C.power, count: 26, speed: 1.4, size: 6 }));
    cl.flows.push(new G.Flow([cl.extra.sup, ...cl.extra.drops], { color: C.cool, count: 90, speed: 1.5, size: 5.5 }));
    cl.flows.push(new G.Flow([cl.extra.ret], { color: C.it, count: 55, speed: 1.2, size: 4.5 }));
    Object.values(layers).forEach(l => l.finish(l.opts));
    // chiller fans: one blade drawing, four spinning instances sharing a material with the cooling lines
    const fl = new G.Lines();
    for (let b = 0; b < 5; b++) { const a = b / 5 * Math.PI * 2; const p = []; for (let k = 0; k <= 6; k++) { const r = .12 + k * .065, t = a + k * .09; p.push([Math.cos(t) * r, 0, Math.sin(t) * r]); } fl.poly(p, o(C.cool, .9)); }
    const fanMesh = fl.build({ pen: C.cool, span: .3 });
    const fans = fanPos.map(p => { const m = fanMesh.clone(); m.position.set(...p); cl.group.add(m); return m; });
    cl.onSet = s => {
      const u = cl.lines.userData.u, fu = fanMesh.userData.u;
      fu.uDraw.value = u.uDraw.value; fu.uOp.value = u.uOp.value; fu.uMono.value = u.uMono.value;
      fans.forEach(m => m.visible = cl.lines.visible);
    };
    const root = new THREE.Group();
    Object.values(layers).forEach(l => root.add(l.group));
    return { root, layers, fans, D, ROW };
  }

  // a merged exterior-only module (frame + envelope) for the campus: shared geometry, one material per copy
  let extGeo = null;
  function exterior() {
    if (!extGeo) {
      const L = new G.Lines(), S = new G.Solids(), P = new G.PointSet(), A = {};
      frame(L, S, P, A); wall(L, S, P, A, -1); wall(L, S, P, A, 1); roof(L, S, P, A); endA(L, S, P, A); endB(L, S, P, A);
      const ch = [[D.Z0 + .2, -.06], [.06, D.Z1 - .2]];
      ch.forEach(([z0, z1]) => { S.box(D.X0 + .3, .26, z0, D.XB - .2, 2.1, z1, K.chiller); L.box(D.X0 + .3, .26, z0, D.XB - .2, 2.1, z1, o(C.cool, .7)); });
      const lm = L.build({ sweep: [1, .3, .3] }), sm = S.build({ axis: [0, 1, 0] });
      extGeo = { lg: lm.geometry, sg: sm.geometry, axis: sm.userData.u.uAxis.value, range: [sm.userData.u.uRange.value.x, sm.userData.u.uRange.value.y] };
    }
    const g = new THREE.Group();
    g.lines = G.lineMesh(extGeo.lg, {}); g.solid = G.solidMesh(extGeo.sg, { axis: extGeo.axis, range: extGeo.range });
    g.add(g.lines, g.solid);
    g.set = (draw, line, reveal, solid) => { G.setLines(g.lines, draw, line); G.setSolid(g.solid, reveal, solid); };
    g.set(0, 0, 0, 0);
    return g;
  }

  MX.container = { build, exterior, D, K, ROW };
})();
