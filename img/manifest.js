/* Modularix — image manifest: every photo, drawing and certificate scan the prototype uses, with what it shows,
   where it came from and what is still to confirm. A classic script (not JSON) so the page also works opened from disk.

   Files: img/ev/<id>.webp (≤ 1600 px long side, never upscaled) and img/ev/<id>-s.webp (≤ 480 px); certificates in img/cert/
   (≤ 1400 px, thumbnails ≤ 260 px). Sources, as ingested 2026-10-21:
   - rb-*   Reference build MX-AI/HPC-120: photos and CAD from the Dictum Labs prototype (reference/dictumlabs-prototype/assets/img)
   - p*     Current site, /projects carousels (https://modularix.world/static/images/<hash>.jpeg). Anonymised, likely Synotech
            group projects (A6). One file on the live site is a byte-for-byte duplicate (d9c07ee1… = 92600ada…) and is not ingested.
   - cert/* Current site, /certifications (cert_*.png). Data below is read off the scans, not the site's captions (A20).

   Review chips (new in this pass; add to the Content Catalog's working assumptions):
   A19 certificates are held by Synotech Global Services Romania SRL, not Modularix: shown as group certifications
   A20 the current site's issuer and year captions don't match the scans; the register follows the scans
   A21 the AGFR scan carries an engineer's name, date of birth and CNP: not republished, listed only
   A22 project photos: publication rights, and which project or build each one shows, to confirm
   A23 low resolution: originals needed (768 × 1024 and smaller)
   A24 identifiable people in frame: consent to confirm before publishing

   Fields: id · kind (photo | cad | doc) · w, h (full file) · src (rb | #project | issuer) · cap (caption) · alt ·
   anchor (a point on the 3D model, see MX.anchorAt in world-home.js) · sys (power | cool | it | safe, colours the pin) ·
   chips [[code, reason]] · origin (where the file came from) */
window.MX_IMG = (function () {
  const RB = 'Reference build · MX-AI/HPC-120';
  const A22 = ['A22', 'A22: from the anonymised Projects page; publication rights and which build it shows to confirm'];
  const A23 = ['A23', 'A23: low resolution on the current site; original file needed'];
  const A24 = ['A24', 'A24: identifiable people in frame; consent to confirm'];
  const A8 = ['A8', 'A8: reference build publication to confirm'];
  const site = h => 'modularix.world/static/images/' + h + '.jpeg';
  const ref = f => 'reference/dictumlabs-prototype/assets/img/' + f + '.jpg';

  const photos = [
    /* reference build (Ivo's own prototype; Pantelimon yard) */
    { id: 'rb-cad-cutaway', kind: 'cad', w: 1498, h: 1600, src: RB, cap: 'CAD cutaway: power room, IT row and chilled-water headers in one 16 m module.', alt: 'CAD cutaway of the 120 kW AI/HPC module showing the power room, rack row and chilled-water pipework', anchor: 'zones', chips: [A8], origin: ref('cad-cutaway') },
    { id: 'rb-cad-systems', kind: 'cad', w: 1600, h: 1285, src: RB, cap: 'Systems coordination drawing: power in green, UPS in blue, suppression in red.', alt: 'Colour-coded CAD coordination drawing of power, UPS and suppression routes', anchor: 'teg', sys: 'power', chips: [A8], origin: ref('cad-systems') },
    { id: 'rb-frame-steel', kind: 'photo', w: 1200, h: 1600, src: RB, cap: 'Bare welded frame with its triangulated end truss, in the factory yard at Pantelimon.', alt: 'Bare welded steel frame of a Modularix module standing on blocks in a factory yard', anchor: 'steel', chips: [A8], origin: ref('frame-steel') },
    { id: 'rb-cad-frame-racks', kind: 'cad', w: 1600, h: 1331, src: RB, cap: 'Frame drawing with the rack positions and bracing set out.', alt: 'CAD drawing of the steel frame with rack positions and diagonal bracing', anchor: 'iso', chips: [A8], origin: ref('cad-frame-racks') },
    { id: 'rb-glands-cabled', kind: 'photo', w: 1200, h: 1600, src: RB, cap: 'Gland plate with the first feeds pulled through, sealed to IP65.', alt: 'Cable glands on the end wall of the module with the first power cables pulled through', anchor: 'glands', sys: 'safe', chips: [A8], origin: ref('glands-cabled') },
    { id: 'rb-cad-envelope', kind: 'cad', w: 1600, h: 1198, src: RB, cap: 'Closed envelope with its service doors.', alt: 'CAD drawing of the closed module envelope with service doors', anchor: 'panel', chips: [A8], origin: ref('cad-envelope') },
    { id: 'rb-power-switchboards', kind: 'photo', w: 1200, h: 1600, src: RB, cap: 'Main switchboards along the power-room wall.', alt: 'Row of switchboards inside the module power room', anchor: 'teg', sys: 'power', chips: [A8], origin: ref('power-switchboards') },
    { id: 'rb-power-wiring', kind: 'photo', w: 1200, h: 1600, src: RB, cap: 'Terminal wiring, labelled and colour-coded.', alt: 'Close-up of labelled terminal block wiring', anchor: 'teg', sys: 'power', chips: [A8], origin: ref('power-wiring') },
    { id: 'rb-it-racks', kind: 'photo', w: 1200, h: 1600, src: RB, cap: 'IT row during fit-out, before the containment closes.', alt: 'Row of server racks inside the module during fit-out', anchor: 'rack', sys: 'it', chips: [A8], origin: ref('it-racks') },
    { id: 'rb-power-transformer', kind: 'photo', w: 1200, h: 1600, src: RB, cap: 'Power module fit-out: a dry-type transformer inside a Modularix enclosure.', alt: 'Dry-type transformer installed inside a power module enclosure', anchor: 'teg', sys: 'power', chips: [A8], origin: ref('power-transformer') },
    { id: 'rb-transport-crane', kind: 'photo', w: 1600, h: 1200, src: RB, cap: 'Crane lift onto a low-bed trailer, chiller end leading.', alt: 'A Modularix module lifted by crane onto a low-bed trailer', anchor: 'lift', chips: [A8], origin: ref('transport-crane') },
    { id: 'rb-live-deployed', kind: 'photo', w: 1600, h: 1200, src: RB, cap: 'On its plinths, with the chilled-water headers and access door fitted.', alt: 'A finished green Modularix module standing on plinths with pipework and an open door at one end', anchor: 'module', sys: 'ok', chips: [A8], origin: ref('live-deployed') },

    /* #12892 — 5 MW for a European cloud provider (as published) */
    { id: 'p12892-1-cable-sleeves', kind: 'photo', w: 1086, h: 1448, src: '#12892', cap: 'Fire-stop cable sleeves for the wall penetrations, before fitting.', alt: 'Two fire-stop cable sleeves with red collars on a blue background', anchor: 'glands', sys: 'safe', chips: [A22], origin: site('0c26a1c462a643c995c242731419a316') },
    { id: 'p12892-2-rack-row', kind: 'photo', w: 768, h: 1024, src: '#12892', cap: 'Rack row under commissioning, cable trays overhead.', alt: 'A row of black server racks in a narrow aisle with three technicians at the far end', anchor: 'rack', sys: 'it', chips: [A22, A23], origin: site('4f3651d508e14e5592881ae5ff729801') },
    { id: 'p12892-3-chw-flanges', kind: 'photo', w: 1086, h: 1448, src: '#12892', cap: 'Chilled-water flanges and insulated pipework on the module end.', alt: 'Two flanged chilled-water connections with black insulated pipes on a blue module wall', anchor: 'chw', sys: 'cool', chips: [A22], origin: site('c50d01e2c67743fdbcd784624448b1e1') },
    { id: 'p12892-4-lv-switchboard', kind: 'photo', w: 768, h: 1024, src: '#12892', cap: 'Low-voltage switchboard line-up along the power corridor.', alt: 'Long white switchboard line-up with breaker panels along a tiled corridor', anchor: 'teg', sys: 'power', chips: [A22, A23], origin: site('92600ada049444afb5e48da028a89af9') },

    /* #32132 — edge network, 12 locations */
    { id: 'p32132-1-mesh-door', kind: 'photo', w: 768, h: 1024, src: '#32132', cap: 'Cooling and control equipment behind a perforated door.', alt: 'Equipment bay seen through a perforated metal door', chips: [A22, A23], origin: site('d2059c762a804ac1a2c649d33112c394') },
    { id: 'p32132-2-schneider-cabinets', kind: 'photo', w: 768, h: 1024, src: '#32132', cap: 'Schneider Electric cabinet line-up in the plant room.', alt: 'White Schneider Electric cabinets in a row under overhead pipework', chips: [A22, A23], origin: site('8761d7de248b4e38a1611635e8d02ed1') },
    { id: 'p32132-3-schneider-cabinets-b', kind: 'photo', w: 768, h: 1024, src: '#32132', cap: 'The same line-up, second shot.', alt: 'White Schneider Electric cabinets in a row under overhead pipework', chips: [A22, A23], origin: site('834e0a60d3bb4faa8b878596495ee737') },
    { id: 'p32132-4-fire-panels', kind: 'photo', w: 768, h: 1024, src: '#32132', cap: 'Fire alarm and detection panels by the entry door.', alt: 'Red alarm box and white detection control panels mounted beside an open door', anchor: 'vesda', sys: 'safe', chips: [A22, A23], origin: site('1b493cb058a742b7886a7058372877cd') },

    /* #77312 — GPU compute, 2,000+ A100 */
    { id: 'p77312-1-chw-headers', kind: 'photo', w: 1086, h: 1448, src: '#77312', cap: 'Module end in the factory: chilled-water headers over the door, field boxes either side.', alt: 'Blue module end wall with insulated chilled-water headers above a door and two electrical boxes', anchor: 'chiller', sys: 'cool', chips: [A22], origin: site('74b5b7901e424f57814b8be816d11d88') },
    { id: 'p77312-2-crane-lift', kind: 'photo', w: 1600, h: 900, src: '#77312', cap: 'Wrapped module lifted by mobile crane on a four-leg spreader.', alt: 'Yellow mobile crane lifting a white-wrapped module with a Synotech logo', anchor: 'lift', chips: [A22], origin: site('48ebc1e4d4184bda82381d57fbcf428f') },
    { id: 'p77312-3-spreader-lift', kind: 'photo', w: 1200, h: 1600, src: '#77312', cap: 'Lift under the spreader, slings to all four top corners.', alt: 'Module hanging from a spreader beam with slings to its corners', anchor: 'lift', chips: [A22], origin: site('c3b4a1ec98f648509db9fce53dce8656') },
    { id: 'p77312-4-crane-set-down', kind: 'photo', w: 360, h: 640, src: '#77312', cap: 'Set-down, seen from the crane side.', alt: 'Mobile crane boom over a module being set down', anchor: 'lift', chips: [A22, A23], origin: site('cb92760ee907477d8153f92303e8b9b9') },
    { id: 'p77312-5-wrapped-on-site', kind: 'photo', w: 1600, h: 1200, src: '#77312', cap: 'Delivered under its transport wrap; the crew opens it up on the roof.', alt: 'Long module under a white Synotech-branded wrap with workers standing on its roof', anchor: 'roof', chips: [A22, A24], origin: site('0d065f96fa9a4ce8be336de669e26adb') },

    /* #73221 — classified-grade, ISO 27001 */
    { id: 'p73221-1-power-corridor', kind: 'photo', w: 768, h: 1024, src: '#73221', cap: 'Power corridor: switchboards left, cabinets right.', alt: 'Tiled corridor between switchboards and white cabinets', anchor: 'teg', sys: 'power', chips: [A22, A23], origin: site('cb930c7663e0459cb1bdee808c6f7f49') },
    { id: 'p73221-2-low-bed', kind: 'photo', w: 1200, h: 1600, src: '#73221', cap: 'Wrapped module on the low-bed, outrigger down.', alt: 'White-wrapped module beside a truck outrigger', anchor: 'lift', chips: [A22], origin: site('2c4f7e15ee4a4263a6ff42c077853775') },
    { id: 'p73221-3-mv-switchgear', kind: 'photo', w: 768, h: 1024, src: '#73221', cap: 'Schneider Electric switchgear, four incoming sections.', alt: 'Four-section Schneider Electric switchgear with rotary handles above a white switchboard', anchor: 'teg', sys: 'power', chips: [A22, A23], origin: site('49108950eae947d4b60d21cc3d609943') },
    { id: 'p73221-4-bare-frame', kind: 'photo', w: 768, h: 1024, src: '#73221', cap: 'Bare frame in the hall, floor beams in and bracing set.', alt: 'Green welded steel module frame inside a factory hall, seen end-on', anchor: 'steel', chips: [A22, A23], origin: site('50ada2b837d049988dbedf89e9e3f668') },
    { id: 'p73221-5-lift-to-plinths', kind: 'photo', w: 1200, h: 1600, src: '#73221', cap: 'Lift from the trailer onto the plinths.', alt: 'Mobile crane lifting a green module from a trailer', anchor: 'lift', chips: [A22], origin: site('fbda8997555f4d72931858ec4807ddee') },
    { id: 'p73221-6-roof-crew', kind: 'photo', w: 1200, h: 1600, src: '#73221', cap: 'Crew on the roof, pulling the transport wrap.', alt: 'Four workers on the roof of a green module pulling a white wrap', anchor: 'roof', chips: [A22, A24], origin: site('67d859bcfcef48faaede1666a6f201de') }
  ];

  /* certificates: holder on every scan is Synotech Global Services Romania SRL (A19) */
  const SRAC = 'SRAC CERT', H = 'Synotech Global Services Romania SRL';
  const SRAC_SCOPE = 'Design, execution and maintenance of electrical, electromechanical and HVAC installations; design and construction of data centres; hardware, software and IT services.';
  const certs = [
    { id: 'iso-9001', grp: 'ms', name: 'ISO 9001:2015', std: 'SR EN ISO 9001:2015', topic: 'Quality management', issuer: SRAC, no: '1551', first: '21 Nov 2003', recert: '15 Apr 2024', valid: '14 Apr 2027', scope: SRAC_SCOPE, site: 'TÜV România, 2023' },
    { id: 'iso-14001', grp: 'ms', name: 'ISO 14001:2015', std: 'SR EN ISO 14001:2015', topic: 'Environmental management', issuer: SRAC, no: '3347', first: '27 Dec 2010', recert: '15 Apr 2024', valid: '14 Apr 2027', scope: SRAC_SCOPE, site: 'TÜV România, 2023' },
    { id: 'iso-27001', grp: 'ms', name: 'ISO/IEC 27001:2022', std: 'SR EN ISO/IEC 27001:2023 · SoA v4.0', topic: 'Information security', issuer: SRAC, no: '30', first: '15 May 2009', recert: '15 Apr 2024', valid: '14 Apr 2027', scope: SRAC_SCOPE, site: 'TÜV România, 2023, as “SR EN ISO/IEC 27001:2023”' },
    { id: 'iso-20000-1', grp: 'ms', name: 'ISO/IEC 20000-1:2018', std: 'SR ISO/IEC 20000-1:2020', topic: 'IT service management', issuer: SRAC, no: '12', first: '16 Apr 2013', recert: '15 Apr 2024', valid: '14 Apr 2027', scope: 'IT services to customers, implementation and support for IT products, per service catalogue v3.0 (14 Feb 2018).', site: 'TÜV România, 2023' },
    { id: 'iso-45001', grp: 'ms', name: 'ISO 45001:2018', std: 'SR EN ISO 45001:2023', topic: 'Occupational health and safety', issuer: SRAC, no: '2369', first: '27 Dec 2010', recert: '15 Apr 2024', valid: '14 Apr 2027', scope: SRAC_SCOPE, site: 'TÜV România, 2023, as “SR EN ISO 45001:2023”' },
    { id: 'se-ecoxpert-it', grp: 'va', name: 'Master EcoXpert™', std: 'Critical IT Infrastructure · specialised in data centres', topic: 'Critical IT infrastructure', issuer: 'Schneider Electric', no: '—', first: '2025', valid: 'dated 06/10/2025', scope: 'Highest Schneider Electric partner tier for critical IT infrastructure in data centres.', site: '2022' },
    { id: 'se-ecoxpert-cooling', grp: 'va', name: 'Master EcoXpert™', std: 'Precision Cooling · specialised in data centres', topic: 'Precision cooling', issuer: 'Schneider Electric', no: '—', first: '2025', valid: 'dated 02/12/2025', scope: 'Highest Schneider Electric partner tier for precision cooling in data centres.', site: '2022' },
    { id: 'rm-lan-designer', grp: 'va', name: 'R&M Authorized Partner', std: 'QPP partner · LAN Designer', topic: 'Structured cabling design', issuer: 'Reichle & De-Massari', no: '—', first: '31 Oct 2024', valid: '31 Oct 2027', scope: 'Authorised to design R&M structured LAN cabling.', site: '2021' },
    { id: 'rm-lan-installation', grp: 'va', name: 'R&M Authorized Partner', std: 'QPP partner · LAN Installation Manager', topic: 'Structured cabling installation', issuer: 'Reichle & De-Massari', no: '—', first: '31 Oct 2024', valid: '31 Oct 2027', scope: 'Authorised to install and manage R&M structured LAN cabling.', site: '2021' },
    { id: 'rm-inteliphy', grp: 'va', name: 'R&M Authorized Partner', std: 'QPP partner · inteliPhy manage customer training', topic: 'Infrastructure management (inteliPhy)', issuer: 'Reichle & De-Massari', no: '—', first: '19 Nov 2024', valid: 'no expiry stated', scope: 'Trained to deliver R&M inteliPhy manage, an automated infrastructure management system.', site: '2021' },
    { id: 'anre-type-b', grp: 'rl', name: 'ANRE attestation, Type B', std: 'Atestat nr. 15595 / 24.02.2020', topic: 'LV electrical installations, 0.4 kV', issuer: 'ANRE', no: '15595', first: '24 Feb 2020', valid: 'unlimited, subject to periodic verification', scope: 'Design and execution of indoor and outdoor electrical installations for civil and industrial buildings, overhead and underground connections, at 0.4 kV nominal.', site: '2020' },
    { id: 'agfr', grp: 'rl', name: 'AGFR certificate, Category I', std: 'Certificat nr. 915/Re2 / 13.04.2024', topic: 'Fluorinated greenhouse gases', issuer: 'AGFR', no: '915/Re2', first: '13 Apr 2024', valid: '12 Apr 2028', scope: 'Installation, servicing, maintenance, repair and decommissioning of refrigeration, air-conditioning and heat-pump equipment containing F-gases, Category I (Reg. (EU) 2024/573).', site: '2020', withheld: true }
  ].map(c => Object.assign({ kind: 'doc', holder: H, file: c.withheld ? null : 'img/cert/' + c.id }, c));

  return { photos, certs, byId: Object.fromEntries(photos.map(p => [p.id, p]).concat(certs.map(c => [c.id, c]))) };
})();
