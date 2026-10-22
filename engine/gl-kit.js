/* Modularix — Design 1 · GL kit.
   The visual grammar of the 3D world, shared by every page:
   - Lines   : instanced screen-space quads with width, soft halo, distance fog, dashes and a plotter draw-in
   - Solids  : merged, vertex-coloured geometry that "prints" into existence behind a glowing scan front
   - Points  : LEDs / beacons (blinking, pulsing or steady)
   - Flow    : particles travelling along polylines (chilled water, power, data)
   - Grid, Dust, Glow, Labels (HTML callouts projected from 3D) and a cinematic camera Rig
   Requires window.THREE (set by the page before this script loads). */
(function () {
  'use strict';
  const THREE = window.THREE, MX = window.MX;
  const { clamp, lerp, smooth } = MX;

  const hex = h => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  const C = {
    line: hex('#93b8ea'), ink: hex('#e8f0fa'), faint: hex('#5d7596'), dim: hex('#7d97ba'),
    blue: hex('#1e8fff'), blue2: hex('#62b2ff'), red: hex('#ff3b2f'),
    power: hex('#f2a93b'), cool: hex('#6fd3f5'), it: hex('#5b86ff'), safe: hex('#ff4a3d'), ok: hex('#5be3a1'),
  };
  const BG = hex('#050a14');

  // uniforms shared by every material (same objects referenced everywhere)
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) }, uHalf: { value: 2.6 }, uCore: { value: .7 }, uPix: { value: 1 },
    uTime: { value: 0 }, uCam: { value: new THREE.Vector3() },
    uFogNear: { value: 30 }, uFogFar: { value: 140 }, uFogCol: { value: new THREE.Color().fromArray(BG) },
  };
  const premul = { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor, transparent: true, depthWrite: false };

  /* ============================================================ lines */
  const LINE_VERT = /* glsl */`
    attribute vec3 aStart; attribute vec3 aEnd; attribute vec3 aColor; attribute vec4 aMeta;
    uniform vec2 uRes; uniform float uHalf; uniform float uDraw; uniform float uOp; uniform float uBias; uniform float uMono; uniform vec3 uMonoCol;
    varying vec2 vPxW; varying float vW; varying float vLenPx; varying float vU; varying vec4 vC; varying float vKey; varying float vDash; varying float vLen; varying float vDepth; varying float vX;
    void main(){
      vec4 ms = modelViewMatrix * vec4(aStart, 1.0); ms.xyz *= uBias;
      vec4 me = modelViewMatrix * vec4(aEnd, 1.0);   me.xyz *= uBias;
      vec4 s = projectionMatrix * ms, e = projectionMatrix * me;
      vKey = aMeta.y; vDash = aMeta.z; vLen = distance(aStart, aEnd);
      vC = vec4(mix(aColor, uMonoCol, uMono), aMeta.x * uOp);
      float sn = s.z + s.w, en = e.z + e.w;
      if ((sn < 0.0 && en < 0.0) || vC.a < 0.003 || uDraw * 1.25 <= vKey) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); vPxW = vec2(0.0); vW = 1.0; vLenPx = 0.0; vU = 0.0; vDepth = 1.0; return; }
      float u0 = 0.0, u1 = 1.0;
      if (sn < 0.0) { float t = sn / (sn - en); s = mix(s, e, t); u0 = t; }
      if (en < 0.0) { float t = en / (en - sn); e = mix(e, s, t); u1 = 1.0 - t; }
      vec2 sP = s.xy / s.w * uRes * 0.5, eP = e.xy / e.w * uRes * 0.5;
      vec2 d = eP - sP; float L = length(d);
      vec2 dir = L > 0.0001 ? d / L : vec2(1.0, 0.0);
      vec2 nrm = vec2(-dir.y, dir.x);
      float u = position.x, v = position.y;
      vec4 clip = mix(s, e, u);
      vec2 P = mix(sP, eP, u) + dir * (u * 2.0 - 1.0) * uHalf + nrm * v * uHalf;
      clip.xy = P / (uRes * 0.5) * clip.w;
      gl_Position = clip;
      vPxW = vec2(mix(-uHalf, L + uHalf, u), v * uHalf) * clip.w; vW = clip.w; vLenPx = L;
      vU = mix(u0, u1, u); vDepth = clip.w; vX = mix(aStart.x, aEnd.x, vU);
    }`;
  const LINE_FRAG = /* glsl */`
    uniform float uHalf; uniform float uCore; uniform float uSpan; uniform vec3 uPen; uniform float uDraw;
    uniform float uFogNear; uniform float uFogFar; uniform float uTime; uniform float uDashMove; uniform float uScan; uniform float uScanAmt;
    varying vec2 vPxW; varying float vW; varying float vLenPx; varying float vU; varying vec4 vC; varying float vKey; varying float vDash; varying float vLen; varying float vDepth; varying float vX;
    void main(){
      float drawn = clamp((uDraw * 1.25 - vKey) / uSpan, 0.0, 1.0);
      if (drawn <= 0.001 || vU > drawn) discard;
      if (vDash > 0.0) { float dd = fract(vU * vLen / vDash - uTime * uDashMove); if (dd > 0.56) discard; }
      vec2 px = vPxW / vW;
      float along = max(0.0, max(-px.x, px.x - vLenPx));
      float dist = length(vec2(along, px.y));
      float core = 1.0 - smoothstep(uCore * 0.45, uCore + 0.8, dist);
      float halo = 1.0 - smoothstep(0.0, uHalf, dist); halo = halo * halo * 0.24;
      float pen = drawn < 0.999 ? (1.0 - smoothstep(0.0, 0.12, drawn - vU)) : 0.0;
      float fog = 1.0 - 0.82 * smoothstep(uFogNear, uFogFar, vDepth);
      float scan = uScanAmt * exp(-pow((vX - uScan) / 0.55, 2.0));
      vec3 col = mix(mix(vC.rgb, uPen, pen * 0.9), vec3(0.85, 0.93, 1.0), scan * 0.8);
      float a = clamp((core + halo + pen * halo * 3.5 + scan * (core * 1.4 + halo * 3.0)) * min(1.0, vC.a * (1.0 + scan * 2.5)) * fog, 0.0, 1.0);
      gl_FragColor = vec4(col * a, a * 0.86);
    }`;

  class Lines {
    constructor() { this.S = []; this.E = []; this.C = []; this.M = []; this.K = []; }
    get count() { return this.K.length; }
    seg(a, b, o = {}) {
      const c = o.c || C.line;
      this.S.push(a[0], a[1], a[2]); this.E.push(b[0], b[1], b[2]); this.C.push(c[0], c[1], c[2]);
      this.M.push(o.a ?? .7, 0, o.dash || 0, 0); this.K.push(o.k ?? -1);
    }
    poly(p, o, closed) { for (let i = 0; i < p.length - 1; i++) this.seg(p[i], p[i + 1], o); if (closed) this.seg(p[p.length - 1], p[0], o); }
    rect(x0, z0, x1, z1, y, o) { this.poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], o, true); }   // horizontal
    rectXY(x0, y0, x1, y1, z, o) { this.poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], o, true); } // facing z
    rectZY(z0, y0, z1, y1, x, o) { this.poly([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], o, true); } // facing x
    box(x0, y0, z0, x1, y1, z1, o) {
      const c = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
      for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) this.seg(c[i], c[j], o);
    }
    circle(cx, cy, cz, r, n, axis, o) {
      const p = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2, u = Math.cos(a) * r, v = Math.sin(a) * r;
        p.push(axis === 'x' ? [cx, cy + u, cz + v] : axis === 'z' ? [cx + u, cy + v, cz] : [cx + u, cy, cz + v]);
      }
      this.poly(p, o, true);
    }
    tube(a, b, r, n, o) { // a pipe: two rings + n longitudinal lines (axis-aligned a→b)
      const ax = a[0] !== b[0] ? 'x' : a[1] !== b[1] ? 'y' : 'z';
      this.circle(a[0], a[1], a[2], r, n * 2, ax, o); this.circle(b[0], b[1], b[2], r, n * 2, ax, o);
      for (let i = 0; i < n; i++) {
        const t = i / n * Math.PI * 2, u = Math.cos(t) * r, v = Math.sin(t) * r;
        const off = ax === 'x' ? [0, u, v] : ax === 'y' ? [u, 0, v] : [u, v, 0];
        this.seg([a[0] + off[0], a[1] + off[1], a[2] + off[2]], [b[0] + off[0], b[1] + off[1], b[2] + off[2]], o);
      }
    }
    build(opts = {}) {
      const n = this.count, { S, E, M, K } = this;
      const w = opts.sweep || [1, .35, .6];
      // plotter order: sweep through the bounding box, with a little jitter
      let lo = Infinity, hi = -Infinity; const key = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const k = ((S[i * 3] + E[i * 3]) * w[0] + (S[i * 3 + 1] + E[i * 3 + 1]) * w[1] + (S[i * 3 + 2] + E[i * 3 + 2]) * w[2]) / 2;
        key[i] = k; lo = Math.min(lo, k); hi = Math.max(hi, k);
      }
      const span = (hi - lo) || 1;
      for (let i = 0; i < n; i++) M[i * 4 + 1] = K[i] >= 0 ? K[i] : Math.min(.96, (key[i] - lo) / span * .9 + Math.random() * .05);
      const g = new THREE.InstancedBufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      g.setAttribute('aStart', new THREE.InstancedBufferAttribute(new Float32Array(S), 3));
      g.setAttribute('aEnd', new THREE.InstancedBufferAttribute(new Float32Array(E), 3));
      g.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(this.C), 3));
      g.setAttribute('aMeta', new THREE.InstancedBufferAttribute(new Float32Array(M), 4));
      g.instanceCount = n;
      return lineMesh(g, opts);
    }
  }
  function lineMesh(geo, opts = {}) {
    const m = new THREE.ShaderMaterial({
      vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, ...premul, depthTest: opts.depthTest ?? true,
      uniforms: {
        uRes: U.uRes, uHalf: U.uHalf, uCore: U.uCore, uTime: U.uTime, uFogNear: U.uFogNear, uFogFar: U.uFogFar,
        uDraw: { value: 0 }, uOp: { value: 1 }, uSpan: { value: opts.span ?? .16 }, uBias: { value: opts.bias ?? .996 },
        uPen: { value: new THREE.Color().fromArray(opts.pen || C.ink) }, uDashMove: { value: opts.dashMove || 0 },
        uMono: { value: 0 }, uMonoCol: { value: new THREE.Color().fromArray(C.line) }, uScan: { value: 0 }, uScanAmt: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(geo, m);
    mesh.frustumCulled = false; mesh.renderOrder = opts.order ?? 10;
    mesh.userData.u = m.uniforms;
    return mesh;
  }

  /* ============================================================ solids */
  const SOLID_VERT = /* glsl */`
    attribute vec3 color;
    varying vec3 vN; varying vec3 vW; varying vec3 vL; varying vec3 vC;
    void main(){
      vec4 w = modelMatrix * vec4(position, 1.0);
      vW = w.xyz; vL = position; vC = color;
      vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  const SOLID_FRAG = /* glsl */`
    uniform vec3 uCam; uniform vec3 uFogCol; uniform float uFogNear; uniform float uFogFar;
    uniform float uReveal; uniform float uOp; uniform vec3 uAxis; uniform vec2 uRange; uniform vec3 uEdge; uniform vec3 uTint; uniform float uGlow;
    varying vec3 vN; varying vec3 vW; varying vec3 vL; varying vec3 vC;
    float h3(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
    void main(){
      float k = (dot(vL, uAxis) - uRange.x) / max(uRange.y - uRange.x, 0.001);
      float d = uReveal * 1.1 - 0.05 - k - h3(floor(vL * 4.0)) * 0.035;
      if (d < 0.0) discard;
      vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
      vec3 V = normalize(uCam - vW);
      vec3 L1 = normalize(vec3(-0.45, 0.82, 0.5)), L2 = normalize(vec3(0.65, 0.3, -0.7));
      float dif = max(dot(N, L1), 0.0) * 0.8 + max(dot(N, L2), 0.0) * 0.32;
      float hemi = 0.5 + 0.5 * N.y;
      float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
      vec3 base = vC * uTint;
      vec3 col = base * (0.30 * hemi + 0.18 + 0.85 * dif);
      col += vec3(0.25, 0.5, 1.0) * fres * 0.28;
      vec3 H = normalize(L1 + V); col += vec3(0.65, 0.8, 1.0) * pow(max(dot(N, H), 0.0), 36.0) * 0.16;
      col *= mix(0.62, 1.0, smoothstep(0.0, 1.1, vL.y));
      col += base * uGlow;
      float band = 1.0 - smoothstep(0.0, 0.028, d);
      col += uEdge * band * 2.2;
      float f = smoothstep(uFogNear, uFogFar, distance(uCam, vW));
      col = mix(col, uFogCol, f * 0.9);
      gl_FragColor = vec4(col * uOp, uOp);
    }`;

  const unitBox = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
  unitBox.translate(0, .5, 0); // y from 0 to 1
  const cylCache = {};
  const _m = new THREE.Matrix4(), _n = new THREE.Matrix3(), _v = new THREE.Vector3();
  class Solids {
    constructor() { this.P = []; this.N = []; this.C = []; }
    get count() { return this.P.length / 3; }
    _push(geo, mat, color) {
      const p = geo.attributes.position, nr = geo.attributes.normal;
      _n.getNormalMatrix(mat);
      for (let i = 0; i < p.count; i++) {
        _v.fromBufferAttribute(p, i).applyMatrix4(mat); this.P.push(_v.x, _v.y, _v.z);
        _v.fromBufferAttribute(nr, i).applyMatrix3(_n).normalize(); this.N.push(_v.x, _v.y, _v.z);
        this.C.push(color[0], color[1], color[2]);
      }
    }
    box(x0, y0, z0, x1, y1, z1, color) {
      _m.makeScale(Math.max(x1 - x0, 1e-3), Math.max(y1 - y0, 1e-3), Math.max(z1 - z0, 1e-3)).setPosition((x0 + x1) / 2, y0, (z0 + z1) / 2);
      this._push(unitBox, _m, color);
    }
    cyl(x, y, z, r, len, axis, color, seg = 18) { // centred at (x,y,z)
      const g = cylCache[seg] || (cylCache[seg] = new THREE.CylinderGeometry(1, 1, 1, seg, 1).toNonIndexed());
      _m.makeScale(r, len, r);
      if (axis === 'x') _m.premultiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
      if (axis === 'z') _m.premultiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
      _m.setPosition(x, y, z);
      this._push(g, _m, color);
    }
    beam(a, b, s, color) { // a square bar from a to b
      const A = new THREE.Vector3(...a), d = new THREE.Vector3(...b).sub(A), len = d.length();
      _m.compose(A, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()), new THREE.Vector3(s, len, s));
      this._push(unitBox, _m, color);
    }
    geo(g, matrix, color) { this._push(g.index ? g.toNonIndexed() : g, matrix, color); }
    build(opts = {}) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.P, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.N, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.C, 3));
      g.computeBoundingBox();
      const ax = new THREE.Vector3().fromArray(opts.axis || [1, 0, 0]).normalize();
      const bb = g.boundingBox, cs = [];
      for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) cs.push(ax.x * x + ax.y * y + ax.z * z);
      return solidMesh(g, { ...opts, axis: ax, range: [Math.min(...cs), Math.max(...cs)] });
    }
  }
  function solidMesh(g, opts) {
    const m = new THREE.ShaderMaterial({
      vertexShader: SOLID_VERT, fragmentShader: SOLID_FRAG, side: THREE.DoubleSide,
      uniforms: {
        uCam: U.uCam, uFogCol: U.uFogCol, uFogNear: U.uFogNear, uFogFar: U.uFogFar,
        uReveal: { value: 0 }, uOp: { value: 1 }, uAxis: { value: opts.axis }, uRange: { value: new THREE.Vector2(...opts.range) },
        uEdge: { value: new THREE.Color().fromArray(opts.edge || C.blue2) }, uTint: { value: new THREE.Color(1, 1, 1) }, uGlow: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.renderOrder = 1; mesh.frustumCulled = false; mesh.userData.u = m.uniforms;
    return mesh;
  }
  // opacity changes switch the material between opaque and blended
  function setSolid(mesh, reveal, op) {
    if (!mesh) return;
    const u = mesh.userData.u, m = mesh.material;
    u.uReveal.value = reveal; u.uOp.value = op;
    mesh.visible = reveal > .001 && op > .004;
    const tr = op < .995;
    if (m.transparent !== tr) { m.transparent = tr; m.depthWrite = !tr; m.blending = tr ? THREE.CustomBlending : THREE.NormalBlending; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor; m.needsUpdate = true; mesh.renderOrder = tr ? 5 : 1; }
  }
  function setLines(mesh, draw, op) {
    if (!mesh) return;
    const u = mesh.userData.u; u.uDraw.value = draw; u.uOp.value = op;
    mesh.visible = draw > .001 && op > .003;
  }

  /* ============================================================ points (LEDs, beacons, flow) */
  const PT_VERT = /* glsl */`
    attribute vec3 color; attribute float aPhase; attribute float aSize; attribute float aMode;
    uniform float uTime; uniform float uOp; uniform float uPix; uniform float uFogNear; uniform float uFogFar;
    varying vec4 vC;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float b = 1.0;
      if (aMode < 0.5) b = 0.3 + 0.7 * step(0.25, sin(uTime * 2.6 + aPhase));
      else if (aMode < 1.5) b = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase);
      else if (aMode < 2.5) b = 0.5 + 0.5 * step(0.0, sin(uTime * 0.9 + aPhase)) ;
      float depth = -mv.z;
      float fog = 1.0 - 0.7 * smoothstep(uFogNear, uFogFar, depth);
      vC = vec4(color, uOp * b * fog);
      gl_PointSize = clamp(aSize * uPix / max(depth, 0.5), 1.0, 64.0);
      gl_Position = vC.a < 0.003 ? vec4(0.0, 0.0, 2.0, 1.0) : projectionMatrix * mv;
    }`;
  const PT_FRAG = /* glsl */`
    varying vec4 vC;
    void main(){
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float core = 1.0 - smoothstep(0.0, 0.32, d);
      float glow = 1.0 - smoothstep(0.1, 1.0, d);
      float a = (core * 0.9 + glow * glow * 0.55) * vC.a;
      vec3 c = mix(vC.rgb, vec3(1.0), core * 0.55);
      gl_FragColor = vec4(c * a, a * 0.8);
    }`;
  function pointMaterial(depthTest = true) {
    return new THREE.ShaderMaterial({
      vertexShader: PT_VERT, fragmentShader: PT_FRAG, ...premul, depthTest,
      uniforms: { uTime: U.uTime, uPix: U.uPix, uFogNear: U.uFogNear, uFogFar: U.uFogFar, uOp: { value: 1 } },
    });
  }
  class PointSet {
    constructor() { this.P = []; this.C = []; this.F = []; this.S = []; this.Mo = []; }
    get count() { return this.F.length; }
    add(p, color, size = 6, mode = 0, phase = Math.random() * 6.28) { this.P.push(p[0], p[1], p[2]); this.C.push(...color); this.S.push(size); this.Mo.push(mode); this.F.push(phase); }
    build(depthTest = true) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.P, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.C, 3));
      g.setAttribute('aSize', new THREE.Float32BufferAttribute(this.S, 1));
      g.setAttribute('aMode', new THREE.Float32BufferAttribute(this.Mo, 1));
      g.setAttribute('aPhase', new THREE.Float32BufferAttribute(this.F, 1));
      const m = pointMaterial(depthTest), pts = new THREE.Points(g, m);
      pts.frustumCulled = false; pts.renderOrder = 12; pts.userData.u = m.uniforms;
      return pts;
    }
  }
  // particles running along polylines; positions are updated on the CPU (a few hundred at most)
  class Flow {
    constructor(paths, o = {}) {
      this.paths = paths.map(p => { const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2])); return { p, L, len: L[L.length - 1] }; });
      this.speed = o.speed || 1.6; this.n = o.count || 60;
      const total = this.paths.reduce((s, p) => s + p.len, 0);
      const ps = new PointSet(); this.parts = [];
      for (let i = 0; i < this.n; i++) {
        let r = Math.random() * total, k = 0; while (k < this.paths.length - 1 && r > this.paths[k].len) { r -= this.paths[k].len; k++; }
        this.parts.push({ k, off: Math.random() * this.paths[k].len, s: .8 + Math.random() * .5 });
        ps.add([0, 0, 0], o.color || C.cool, (o.size || 5) * (.7 + Math.random() * .6), 3, 0);
      }
      this.mesh = ps.build(o.depthTest ?? true);
      this.pos = this.mesh.geometry.attributes.position;
    }
    update(t) {
      const a = this.pos.array;
      this.parts.forEach((q, i) => {
        const P = this.paths[q.k]; let d = (q.off + t * this.speed * q.s) % P.len, j = 1;
        while (j < P.L.length - 1 && P.L[j] < d) j++;
        const f = (d - P.L[j - 1]) / ((P.L[j] - P.L[j - 1]) || 1), A = P.p[j - 1], B = P.p[j];
        a[i * 3] = A[0] + (B[0] - A[0]) * f; a[i * 3 + 1] = A[1] + (B[1] - A[1]) * f; a[i * 3 + 2] = A[2] + (B[2] - A[2]) * f;
      });
      this.pos.needsUpdate = true;
    }
    set op(v) { this.mesh.userData.u.uOp.value = v; this.mesh.visible = v > .003; }
  }

  /* ============================================================ ground grid, glow, dust */
  function grid(size = 700) {
    const m = new THREE.ShaderMaterial({
      ...premul, depthWrite: false,
      uniforms: { uCam: U.uCam, uOp: { value: 1 }, uShift: { value: 0 }, uRange: { value: 90 }, uCenter: { value: new THREE.Vector2() }, uCol: { value: new THREE.Color().fromArray(C.line) } },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform vec3 uCol; uniform float uOp; uniform float uShift; uniform float uRange; uniform vec2 uCenter; varying vec3 vW;
        float gl(vec2 q, float w){ vec2 f = abs(fract(q - 0.5) - 0.5) / (fwidth(q) * w); return 1.0 - min(min(f.x, f.y), 1.0); }
        void main(){
          vec2 p = vW.xz + vec2(uShift, 0.0);
          float g = gl(p, 1.0) * 0.07 + gl(p / 5.0, 1.0) * 0.17 + gl(p / 25.0, 1.4) * 0.26;
          float d = distance(vW.xz, uCenter);
          float a = g * (1.0 - smoothstep(uRange * 0.12, uRange, d)) * uOp;
          gl_FragColor = vec4(uCol * a, a);
        }`,
    });
    const g = new THREE.PlaneGeometry(size, size); g.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(g, m); mesh.position.y = -.002; mesh.renderOrder = 0; mesh.userData.u = m.uniforms;
    return mesh;
  }
  function glow(r = 16, color = C.blue) {
    const m = new THREE.ShaderMaterial({
      ...premul, uniforms: { uOp: { value: .5 }, uCol: { value: new THREE.Color().fromArray(color) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 uCol; uniform float uOp; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(1.0 - smoothstep(0.0, 1.0, d), 2.2) * uOp; gl_FragColor = vec4(uCol * a, a * 0.6); }`,
    });
    const g = new THREE.PlaneGeometry(r * 2, r * 2); g.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(g, m); mesh.position.y = .004; mesh.renderOrder = 0; mesh.userData.u = m.uniforms;
    return mesh;
  }
  function dust(n = 900, box = [120, 40, 120]) {
    const ps = new PointSet();
    for (let i = 0; i < n; i++) ps.add([(Math.random() - .5) * box[0], Math.random() * box[1], (Math.random() - .5) * box[2]], Math.random() < .12 ? C.blue2 : C.line, 1.6 + Math.random() * 2.6, 1);
    const pts = ps.build(true);
    pts.material.vertexShader = pts.material.vertexShader.replace('vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      'vec3 q = position; q.y += mod(uTime * 0.25 + aPhase * 3.0, 40.0) - 20.0; q.x += sin(uTime * 0.11 + aPhase) * 1.5; vec4 mv = modelViewMatrix * vec4(q, 1.0);');
    return pts;
  }

  /* ============================================================ labels: HTML callouts projected from 3D */
  class Labels {
    /* stagger: pins that become due together enter one at a time, `stagger` s apart, each fading in over `fade` s.
       Leaving is never delayed: a pin follows its show() curve out as soon as it is no longer due. */
    constructor(root, camera) { this.root = root; this.camera = camera; this.items = []; this.v = new THREE.Vector3();
      this.stagger = MX.reduced ? 0 : .6; this.fade = MX.reduced ? 0 : .4; this.last = -1e9; }
    add(o) {
      const el = document.createElement('div');
      el.className = 'lbl ' + (o.cls || '');
      if (o.h != null) el.style.setProperty('--h', o.h + 'px');
      el.innerHTML = `<i class="pin"></i><i class="stem"></i><span class="tag">${o.html}</span>`;
      this.root.appendChild(el);
      this.items.push({ el, obj: o.obj, p: o.p, show: o.show, a: -1, due: -1, at: -1 });
    }
    update(T, w, h) {
      const now = performance.now() / 1000;
      // queue: pins due now, oldest first (ties keep the order they were added in), admitted one per `stagger`
      for (const it of this.items) {
        const raw = it.show(T) >= .01;
        if (!raw) { it.due = -1; it.at = -1; continue; }
        if (it.due < 0) it.due = now;
      }
      if (now - this.last >= this.stagger) {
        let next = null;
        for (const it of this.items) if (it.due >= 0 && it.at < 0 && (!next || it.due < next.due)) next = it;
        if (next) { next.at = now; this.last = now; }
      }
      for (const it of this.items) {
        let a = clamp(it.show(T), 0, 1);
        if (it.at < 0) a = 0; else if (this.fade > 0) a = Math.min(a, smooth(clamp((now - it.at) / this.fade, 0, 1)));
        if (a < .01) { if (it.a !== 0) { it.el.style.opacity = 0; it.a = 0; } continue; }
        this.v.set(it.p[0], it.p[1], it.p[2]);
        if (it.obj) it.obj.localToWorld(this.v);
        this.v.project(this.camera);
        if (this.v.z > 1 || Math.abs(this.v.x) > 1.25 || Math.abs(this.v.y) > 1.25) a = 0;
        const x = (this.v.x * .5 + .5) * w, y = (-this.v.y * .5 + .5) * h;
        it.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        if (Math.abs(a - it.a) > .01) { it.el.style.opacity = a.toFixed(3); it.a = a; }
      }
    }
  }

  /* ============================================================ camera rig: keyframes on T, Catmull-Rom between them */
  class Rig {
    constructor(camera, keys) { this.cam = camera; this.k = keys; this.p = new THREE.Vector3(); this.l = new THREE.Vector3(); this.fov = camera.fov; this.init = false; this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0; }
    sample(T) {
      const k = this.k, n = k.length;
      if (T <= k[0].t) return { p: k[0].p, l: k[0].l, fov: k[0].fov || 36 };
      if (T >= k[n - 1].t) return { p: k[n - 1].p, l: k[n - 1].l, fov: k[n - 1].fov || 36 };
      let i = 0; while (i < n - 2 && T > k[i + 1].t) i++;
      const f = clamp((T - k[i].t) / (k[i + 1].t - k[i].t), 0, 1);
      const u = lerp(f, smooth(f), .7);
      const cr = (key) => {
        const P0 = k[Math.max(0, i - 1)][key], P1 = k[i][key], P2 = k[i + 1][key], P3 = k[Math.min(n - 1, i + 2)][key];
        const t = u, t2 = t * t, t3 = t2 * t;
        return [0, 1, 2].map(j => .5 * ((2 * P1[j]) + (-P0[j] + P2[j]) * t + (2 * P0[j] - 5 * P1[j] + 4 * P2[j] - P3[j]) * t2 + (-P0[j] + 3 * P1[j] - 3 * P2[j] + P3[j]) * t3));
      };
      return { p: cr('p'), l: cr('l'), fov: lerp(k[i].fov || 36, k[i + 1].fov || 36, u) };
    }
    update(T, dt, extra) {
      const s = this.sample(T);
      const tp = new THREE.Vector3().fromArray(s.p), tl = new THREE.Vector3().fromArray(s.l);
      if (extra) extra(tp, tl);
      // mouse parallax, perpendicular to the view
      this.mx = lerp(this.mx, this.tx, 1 - Math.exp(-dt * 2.5)); this.my = lerp(this.my, this.ty, 1 - Math.exp(-dt * 2.5));
      const fwd = tl.clone().sub(tp), dist = fwd.length(); fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
      tp.addScaledVector(right, this.mx * dist * .045).y += this.my * dist * .03;
      if (!this.init) { this.p.copy(tp); this.l.copy(tl); this.fov = s.fov; this.init = true; }
      const a = 1 - Math.exp(-dt * 5.5);
      this.p.lerp(tp, a); this.l.lerp(tl, a); this.fov = lerp(this.fov, s.fov, a);
      this.cam.position.copy(this.p); this.cam.lookAt(this.l);
      if (Math.abs(this.cam.fov - this.fov) > .01) { this.cam.fov = this.fov; this.cam.updateProjectionMatrix(); }
    }
  }

  /* ============================================================ layer: a named group of lines + solids + points */
  class Layer {
    constructor(name) { this.name = name; this.group = new THREE.Group(); this.group.name = name; this.L = new Lines(); this.S = new Solids(); this.P = new PointSet(); this.flows = []; this.a = {}; }
    finish(o = {}) {
      if (this.L.count) { this.lines = this.L.build(o.lines || {}); this.group.add(this.lines); }
      if (this.S.count) { this.solid = this.S.build(o.solid || {}); this.group.add(this.solid); }
      if (this.P.count) { this.points = this.P.build(); this.group.add(this.points); }
      this.flows.forEach(f => this.group.add(f.mesh));
      this.set({ draw: 0, line: 0, reveal: 0, solid: 0, pts: 0, flow: 0 });
      return this;
    }
    set(s) {
      if (s.draw != null || s.line != null) setLines(this.lines, s.draw ?? this.lines?.userData.u.uDraw.value, s.line ?? this.lines?.userData.u.uOp.value);
      if (s.reveal != null || s.solid != null) setSolid(this.solid, s.reveal ?? this.solid?.userData.u.uReveal.value, s.solid ?? this.solid?.userData.u.uOp.value);
      if (s.pts != null && this.points) { this.points.userData.u.uOp.value = s.pts; this.points.visible = s.pts > .003; }
      if (s.flow != null) this.flows.forEach(f => f.op = s.flow);
      if (s.glow != null && this.solid) this.solid.userData.u.uGlow.value = s.glow;
      if (s.mono != null && this.lines) this.lines.userData.u.uMono.value = s.mono;
      if (s.scan != null && this.lines) { this.lines.userData.u.uScan.value = s.scan[0]; this.lines.userData.u.uScanAmt.value = s.scan[1]; }
      if (this.onSet) this.onSet(s);
    }
  }

  /* ============================================================ renderer bootstrap */
  function setup(canvas, o = {}) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { document.documentElement.classList.add('no-gl'); throw e; }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .3, 1200);
    function resize() {
      const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight, mob = innerWidth <= 900;
      const dpr = Math.min(devicePixelRatio || 1, mob ? 1.5 : 1.75);
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      U.uRes.value.set(w * dpr, h * dpr);
      U.uHalf.value = (mob ? 2.2 : 2.6) * dpr; U.uCore.value = (mob ? .55 : .62) * dpr;
      U.uPix.value = h * dpr * .055;
      o.onResize && o.onResize(w, h);
    }
    resize();
    // follow the canvas box, so a CSS-sized canvas (mobile exhibition band) renders at its own aspect; window resize only as a fallback
    if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(canvas); else addEventListener('resize', resize);
    // mouse parallax target
    const rigs = [];
    addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; rigs.forEach(r => { r.tx = (e.clientX / innerWidth - .5) * 2; r.ty = (e.clientY / innerHeight - .5) * -2; }); }, { passive: true });
    return { renderer, scene, camera, resize, rigs };
  }

  // the render loop: T comes from the scroll model, smoothed so jumps glide.
  // Frames are capped at 60 fps (high-refresh screens would draw twice as often for no gain). Once nothing has moved for a while
  // (no input, T settled, no reel) the ambient motion drops to 30 fps; with reduced motion the scene stops drawing altogether.
  function run(ctx, frame) {
    let last = performance.now(), Ts = MX.chapterIndex(), first = true, wake = last;
    const poke = () => { wake = performance.now(); };
    ['scroll', 'wheel', 'pointermove', 'pointerdown', 'keydown', 'touchstart', 'resize'].forEach(t => addEventListener(t, poke, { passive: true }));
    MX.wake = poke;
    const loop = now => {
      requestAnimationFrame(loop);
      const T = MX.chapterIndex();
      const idle = now - wake > (MX.reduced ? 1500 : 8000) && Math.abs(Ts - T) < 1e-4 && !(MX.reel && MX.reel.on && !MX.reduced);
      if (!first && (idle && MX.reduced || now - last < (idle ? 33 : 15.5))) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      Ts = MX.reduced ? T : lerp(Ts, T, 1 - Math.exp(-dt * 4.2));
      if (MX.snapT) { MX.snapT = false; Ts = T; ctx.rigs.forEach(r => r.init = false); } // a cut (nav jump under the page veil): no catch-up
      if (Math.abs(Ts - T) < 1e-4) Ts = T;
      U.uTime.value = now / 1000;
      frame(Ts, dt, now / 1000);
      U.uCam.value.copy(ctx.camera.position);
      ctx.renderer.render(ctx.scene, ctx.camera);
      if (first) { first = false; document.body.classList.add('gl-ready'); }
    };
    requestAnimationFrame(loop);
  }

  MX.gl = { C, U, hex, Lines, Solids, PointSet, Flow, Layer, Labels, Rig, grid, glow, dust, setup, run, setLines, setSolid, lineMesh, solidMesh };
})();
