(function(){
var K = [["firca", "#c2c8cc", 0.88, 0.3], ["sampanya", "#d8bb8a", 0.92, 0.22], ["siyah", "#33373a", 0.8, 0.44], ["gun", "#5c666d", 0.9, 0.3]], MODELLER = [{"id": "narion-koza", "ad": "NARION KOZA", "taban": 130.0, "sise": 150.0, "siseH": 143, "bilezik": 78.0, "saft": 45.0, "saftH": 168, "tabla": 232, "lule": 85.0, "yuk": 420.0, "panel": "pencereli", "siluet": [[0.0, 0.0], [0.4, 0.0], [0.47, 0.03], [0.5, 0.09], [0.5, 0.66], [0.48, 0.76], [0.4, 0.87], [0.28, 0.95], [0.23, 1.0]]}, {"id": "narion-ladin", "ad": "NARION LAD\u0130N", "taban": 120.0, "sise": 120.0, "siseH": 197, "bilezik": 78.0, "saft": 45.0, "saftH": 232, "tabla": 186, "lule": 85.0, "yuk": 580.0, "panel": "duz", "siluet": [[0.0, 0.0], [0.36, 0.0], [0.42, 0.04], [0.44, 0.1], [0.44, 0.72], [0.42, 0.82], [0.34, 0.92], [0.24, 1.0]]}, {"id": "narion-manolya", "ad": "NARION MANOLYA", "taban": 180.0, "sise": 150.0, "siseH": 211, "bilezik": 78.0, "saft": 45.0, "saftH": 248, "tabla": 232, "lule": 85.0, "yuk": 620.0, "panel": "yok", "siluet": [[0.0, 0.0], [0.3, 0.0], [0.38, 0.06], [0.47, 0.2], [0.5, 0.36], [0.48, 0.52], [0.4, 0.68], [0.3, 0.84], [0.24, 0.93], [0.22, 1.0]]}];
var kap = K[0], mid = MODELLER[0].id;
var el = document.getElementById('sahne');
if (!el || typeof THREE === 'undefined') return;
var ren = new THREE.WebGLRenderer({antialias:true, alpha:true});
ren.setPixelRatio(Math.min(devicePixelRatio, 2));
ren.setSize(el.clientWidth, el.clientHeight);
ren.outputEncoding = THREE.sRGBEncoding;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.toneMappingExposure = 1.02;
ren.shadowMap.enabled = true;
ren.shadowMap.type = THREE.PCFSoftShadowMap;
el.appendChild(ren.domElement);
var sah = new THREE.Scene();
var kam = new THREE.PerspectiveCamera(38, el.clientWidth/el.clientHeight, 1, 4000);
var ASSET3D = '../gorsel/3d/';
var HDR_CDN = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr';
var _texL = new THREE.TextureLoader();
function ortamYedek(){
var c2 = document.createElement('canvas'); c2.width = 1024; c2.height = 512;
var g2 = c2.getContext('2d');
var gr = g2.createLinearGradient(0, 0, 0, 512);
gr.addColorStop(0.00, '#f2f4f6'); gr.addColorStop(0.28, '#c5ccd2');
gr.addColorStop(0.54, '#7e8790');
gr.addColorStop(0.57, '#3f474e');
gr.addColorStop(0.82, '#242a30');
gr.addColorStop(1.00, '#12161a');
g2.fillStyle = gr; g2.fillRect(0, 0, 1024, 512);
function softbox(x, y, w, h, guc){
var ad = 26, i;
for(i = ad; i >= 0; i--){
var k = i/ad, yum = 1 - k;
g2.fillStyle = 'rgba(255,255,255,' + (guc*0.055*yum*yum) + ')';
g2.fillRect(x - w/2 - k*w*0.7, y - h/2 - k*h*0.5,
w + k*w*1.4, h + k*h*1.0);
}
g2.fillStyle = 'rgba(255,255,255,' + guc + ')';
g2.fillRect(x - w/2, y - h/2, w, h);
}
softbox(215, 150, 150, 210, 0.98);
softbox(690, 175, 105, 170, 0.72);
softbox(455, 105,  60, 100, 0.40);
softbox(950, 235, 34, 260, 0.55);
var tex = new THREE.CanvasTexture(c2);
tex.mapping = THREE.EquirectangularReflectionMapping;
tex.encoding = THREE.sRGBEncoding;
var pm = new THREE.PMREMGenerator(ren);
var env = pm.fromEquirectangular(tex).texture;
pm.dispose(); tex.dispose();
return env;
}
sah.environment = ortamYedek();
function uygulaHDR(hdr){
hdr.mapping = THREE.EquirectangularReflectionMapping;
var pm = new THREE.PMREMGenerator(ren);
pm.compileEquirectangularShader();
var env = pm.fromEquirectangular(hdr).texture;
sah.environment = env;
pm.dispose(); hdr.dispose();
if (typeof isaretle === 'function') isaretle();
}
function yukleHDR(url, sonra){
if (typeof THREE.RGBELoader !== 'function'){ if(sonra) sonra(false); return; }
new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load(
url, function(hdr){ uygulaHDR(hdr); if(sonra) sonra(true); },
undefined, function(){ if(sonra) sonra(false); });
}
yukleHDR(ASSET3D + 'studio_small_09_1k.hdr', function(ok){
if(!ok) yukleHDR(HDR_CDN, function(ok2){ /* yedek softbox zaten aktif */ });
});
// Ürün-stüdyo ışık: soft key + fill + rim (HDRI asıl GI'yi taşır)
sah.add(new THREE.HemisphereLight(0xf5f7fa, 0x1c2228, 0.22));
var l1 = new THREE.DirectionalLight(0xfff7ef, 0.78); l1.position.set(320, 520, 380);
l1.castShadow = true; l1.shadow.mapSize.set(2048, 2048); l1.shadow.bias = -0.0012;
l1.shadow.radius = 4; sah.add(l1);
var l2 = new THREE.DirectionalLight(0xe8eef4, 0.32); l2.position.set(-360, 200, -220); sah.add(l2);
var l3 = new THREE.DirectionalLight(0xdfe7ec, 0.20); l3.position.set(0, -260, 160); sah.add(l3);
var grup = new THREE.Group(); sah.add(grup);
var _fircaMaps = null;
function fircaProc(){
var W = 1024, H = 512;
var cR = document.createElement('canvas'); cR.width = W; cR.height = H;
var cN = document.createElement('canvas'); cN.width = W; cN.height = H;
var r = cR.getContext('2d'), n = cN.getContext('2d');
var iR = r.createImageData(W, H), iN = n.createImageData(W, H);
var seed = 42; function rnd(){ seed = (seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
var row = new Float32Array(W);
for(var x=0;x<W;x++) row[x] = 0.35 + rnd()*0.35;
for(var y=0;y<H;y++){
var shift = ((Math.sin(y*0.014)*2.5)|0);
var tmp = new Float32Array(W);
for(var x=0;x<W;x++){
var src = row[(x+shift+W)%W];
src = src*0.97 + (0.35+rnd()*0.35)*0.03;
if(rnd()<0.003) src = Math.max(0.08, src-0.28);
tmp[x] = src;
var v = (src*255)|0;
var o = (y*W+x)*4;
iR.data[o]=iR.data[o+1]=iR.data[o+2]=v; iR.data[o+3]=255;
}
row = tmp;
for(var x=0;x<W;x++){
var x1 = (x+1)%W;
var dx = row[x1]-row[x];
var nx = Math.max(-1, Math.min(1, -dx*7.0));
var ny = 0.0, nz = 1.0;
var len = Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
nx/=len; ny/=len; nz/=len;
var o = (y*W+x)*4;
iN.data[o]   = (nx*0.5+0.5)*255;
iN.data[o+1] = (ny*0.5+0.5)*255;
iN.data[o+2] = (nz*0.5+0.5)*255;
iN.data[o+3] = 255;
}
}
r.putImageData(iR,0,0); n.putImageData(iN,0,0);
function wrap(tex){
tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
tex.repeat.set(3.2, 1.0);
tex.anisotropy = ren.capabilities.getMaxAnisotropy();
return tex;
}
return { rough: wrap(new THREE.CanvasTexture(cR)),
normal: wrap(new THREE.CanvasTexture(cN)) };
}
function fircaMaps(){
if(_fircaMaps) return _fircaMaps;
_fircaMaps = fircaProc();
var aniso = ren.capabilities.getMaxAnisotropy();
function applyWrap(t, srgb){
t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3.2, 1.0);
t.anisotropy = aniso; if(srgb) t.encoding = THREE.sRGBEncoding;
t.needsUpdate = true; return t;
}
function fromB64(name, key, srgb){
fetch(ASSET3D + name + '.b64').then(function(r){
if(!r.ok) throw new Error('no b64'); return r.text();
}).then(function(b64){
var img = new Image();
img.onload = function(){
_fircaMaps[key] = applyWrap(new THREE.Texture(img), srgb);
if(typeof isaretle==='function') isaretle();
};
img.src = 'data:image/jpeg;base64,' + b64.trim();
}).catch(function(){});
}
function tryFile(name, key, srgb){
_texL.load(ASSET3D + name, function(t){
_fircaMaps[key] = applyWrap(t, srgb);
if(typeof isaretle==='function') isaretle();
}, undefined, function(){ fromB64(name, key, srgb); });
}
tryFile('firca_roughness.jpg', 'rough', false);
tryFile('firca_normal.jpg', 'normal', false);
return _fircaMaps;
}
function metal(){
var m = new THREE.MeshStandardMaterial({
color:new THREE.Color(kap[1]), metalness:kap[2], roughness:kap[3],
envMapIntensity: 1.25 });
var fm = fircaMaps();
if (kap[0] === 'firca'){
m.roughnessMap = fm.rough; m.normalMap = fm.normal;
m.normalScale = new THREE.Vector2(0.85, 0.28);
m.roughness = 0.34; m.metalness = 0.92; m.envMapIntensity = 1.35;
} else if (kap[0] === 'gun'){
m.roughnessMap = fm.rough; m.normalMap = fm.normal;
m.normalScale = new THREE.Vector2(0.70, 0.22);
m.roughness = 0.36; m.metalness = 0.90; m.envMapIntensity = 1.20;
} else if (kap[0] === 'sampanya'){
m.roughnessMap = fm.rough; m.normalMap = fm.normal;
m.normalScale = new THREE.Vector2(0.35, 0.12);
m.roughness = 0.20; m.metalness = 0.95; m.envMapIntensity = 1.45;
} else if (kap[0] === 'siyah'){
m.roughnessMap = fm.rough; m.normalMap = fm.normal;
m.normalScale = new THREE.Vector2(0.45, 0.16);
m.roughness = 0.48; m.metalness = 0.82; m.envMapIntensity = 0.95;
}
return m;
}
function cam(){ return new THREE.MeshPhysicalMaterial({
color:0xcfe4ee, metalness:0.0, roughness:0.02,
transparent:true, opacity:0.20, side:THREE.DoubleSide,
clearcoat:1.0, clearcoatRoughness:0.015, envMapIntensity:1.35,
depthWrite:false }); }
function kesmeCam(){ var m = cam();
m.flatShading = true; m.envMapIntensity = 2.6; m.opacity = 0.36;
m.clearcoatRoughness = 0.015; m.roughness = 0.02;
return m; }
function su(){ return new THREE.MeshPhysicalMaterial({
color:0x44778c, metalness:0.0, roughness:0.10,
transparent:true, opacity:0.80,
clearcoat:0.45, envMapIntensity:0.6 }); }
var _cevizMaps = null;
function cevizProc(){
var S = 512;
var cA = document.createElement('canvas'); cA.width = cA.height = S;
var cN = document.createElement('canvas'); cN.width = cN.height = S;
var cR = document.createElement('canvas'); cR.width = cR.height = S;
var a = cA.getContext('2d'), nctx = cN.getContext('2d'), rctx = cR.getContext('2d');
a.fillStyle = '#6e4c32'; a.fillRect(0,0,S,S);
for(var i=0;i<1200;i++){
var xx=Math.random()*S, yy=Math.random()*S;
a.fillStyle = Math.random()<0.5 ? 'rgba(48,30,18,0.08)' : 'rgba(150,110,75,0.07)';
a.fillRect(xx, yy, 2+Math.random()*6, 1+Math.random()*3);
}
for(var i=0;i<220;i++){
var xx0 = Math.random()*S, k = 0.6+Math.random()*3.2;
var koyu = Math.random() < 0.48;
a.strokeStyle = koyu ? 'rgba(42,26,16,'+(0.14+Math.random()*0.38)+')'
: 'rgba(168,124,86,'+(0.08+Math.random()*0.24)+')';
a.lineWidth = k; a.beginPath(); a.moveTo(xx0, 0);
for(var yy=0; yy<=S; yy+=18){
a.lineTo(xx0 + Math.sin((yy+xx0)*0.011)*11 + (Math.random()-0.5)*3.2, yy);
}
a.stroke();
}
var id = a.getImageData(0,0,S,S);
var h = new Float32Array(S*S);
for(var p=0;p<S*S;p++){
var o=p*4; h[p]=(0.299*id.data[o]+0.587*id.data[o+1]+0.114*id.data[o+2])/255;
}
var iN = nctx.createImageData(S,S), iR = rctx.createImageData(S,S);
for(var y=0;y<S;y++) for(var x=0;x<S;x++){
var i=y*S+x;
var dx = h[y*S+((x+1)%S)] - h[i];
var dy = h[((y+1)%S)*S+x] - h[i];
var nx = Math.max(-1,Math.min(1,-dx*5.5));
var ny = Math.max(-1,Math.min(1,-dy*5.5));
var nz = 1.0, len=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
nx/=len; ny/=len; nz/=len;
var o=i*4;
iN.data[o]=(nx*0.5+0.5)*255; iN.data[o+1]=(ny*0.5+0.5)*255;
iN.data[o+2]=(nz*0.5+0.5)*255; iN.data[o+3]=255;
var rv = (0.42 + (1.0-h[i])*0.38)*255;
iR.data[o]=iR.data[o+1]=iR.data[o+2]=rv; iR.data[o+3]=255;
}
nctx.putImageData(iN,0,0); rctx.putImageData(iR,0,0);
function wrap(tex, srgb){
tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
tex.center.set(0.5, 0.5);
tex.rotation = 0;
tex.repeat.set(2.4, 1.0);
tex.anisotropy = ren.capabilities.getMaxAnisotropy();
if(srgb) tex.encoding = THREE.sRGBEncoding;
return tex;
}
return {
color: wrap(new THREE.CanvasTexture(cA), true),
normal: wrap(new THREE.CanvasTexture(cN), false),
rough: wrap(new THREE.CanvasTexture(cR), false)
};
}
function cevizMaps(){
if(_cevizMaps) return _cevizMaps;
_cevizMaps = cevizProc();
var aniso = ren.capabilities.getMaxAnisotropy();
function applyWrap(t, srgb){
t.wrapS = t.wrapT = THREE.RepeatWrapping;
t.center.set(0.5, 0.5); t.rotation = Math.PI/2; t.repeat.set(1.0, 2.4);
t.anisotropy = aniso; if(srgb) t.encoding = THREE.sRGBEncoding;
t.needsUpdate = true; return t;
}
function fromB64(name, key, srgb){
fetch(ASSET3D + name + '.b64').then(function(r){
if(!r.ok) throw new Error('no b64'); return r.text();
}).then(function(b64){
var img = new Image();
img.onload = function(){
_cevizMaps[key] = applyWrap(new THREE.Texture(img), srgb);
if(typeof isaretle==='function') isaretle();
};
img.src = 'data:image/jpeg;base64,' + b64.trim();
}).catch(function(){});
}
function tryFile(name, key, srgb){
_texL.load(ASSET3D + name, function(t){
_cevizMaps[key] = applyWrap(t, srgb);
if(typeof isaretle==='function') isaretle();
}, undefined, function(){ fromB64(name, key, srgb); });
}
tryFile('ceviz_color.jpg', 'color', true);
tryFile('ceviz_normal.jpg', 'normal', false);
tryFile('ceviz_roughness.jpg', 'rough', false);
return _cevizMaps;
}
function cevizDoku(){ return cevizMaps().color; }
function ahsap(){
var cm = cevizMaps();
return new THREE.MeshStandardMaterial({
map: cm.color,
normalMap: cm.normal,
normalScale: new THREE.Vector2(0.75, 0.75),
roughnessMap: cm.rough,
color: 0xffffff,
metalness: 0.0,
roughness: 0.68,
envMapIntensity: 0.38
});
}
function seramik(){ return new THREE.MeshStandardMaterial({
color:0xc6a888, metalness:0.02, roughness:0.66, envMapIntensity:0.42 }); }
function seramikIc(){ return new THREE.MeshStandardMaterial({
color:0x7a5f48, metalness:0.0, roughness:0.82, envMapIntensity:0.25,
side:THREE.BackSide }); }
var luleTakili = true;
function ekleLule(M, seatY){
// Kil/seramik lüle: bayonet kafanın üstüne oturur. Takılı = flush, çıkık = hafif
// yükseltilmiş + eğik — bağlantı noktasını göstermek için.
var H = M.lule * 0.74, cap = M.lule;
var g = new THREE.Group();
var clay = seramik(), clayIn = seramikIc();
var dis = [
[0.00,0.00],[0.26,0.00],[0.28,0.05],[0.29,0.18],[0.34,0.28],
[0.52,0.40],[0.78,0.55],[0.94,0.70],[1.00,0.82],[0.98,0.90],
[0.90,0.97],[0.82,1.00]
];
var pts = dis.map(function(p){
return new THREE.Vector2(Math.max(0.001, p[0]*cap*0.5), p[1]*H); });
g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 72), clay));
var ic = [
[0.00,0.22],[0.22,0.22],[0.24,0.30],[0.38,0.48],[0.58,0.68],
[0.70,0.84],[0.74,0.94],[0.70,0.99]
];
var ptsI = ic.map(function(p){
return new THREE.Vector2(Math.max(0.001, p[0]*cap*0.5), p[1]*H); });
g.add(new THREE.Mesh(new THREE.LatheGeometry(ptsI, 56), clayIn));
// Kauçuk conta — bayonet oturma halkası
var conta = new THREE.Mesh(
new THREE.TorusGeometry(cap*0.145, 2.4, 10, 36), silikon());
conta.rotation.x = Math.PI/2; conta.position.y = 3.2; g.add(conta);
// Metal bilezik üst kenarda ince halka (lüle boynu)
var bilezik = new THREE.Mesh(
new THREE.TorusGeometry(cap*0.148, 1.5, 8, 40), metal());
bilezik.rotation.x = Math.PI/2; bilezik.position.y = H*0.20; g.add(bilezik);
if (luleTakili){
g.position.y = seatY - 1.5;
} else {
g.position.set(10, seatY + 36, 4);
g.rotation.z = 0.16; g.rotation.x = 0.05;
}
grup.add(g);
return H + (luleTakili ? 0 : 36);
}
function silikon(){ return new THREE.MeshStandardMaterial({
color:0x15181a, metalness:0.05, roughness:0.88, envMapIntensity:0.35 }); }
function sil(r1, r2, h, mat, y, seg){
var m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg||64), mat);
m.position.y = y; grup.add(m); return m;
}
function lathe(profil, cap, h, mat, y0){
var pts = profil.map(function(p){ return new THREE.Vector2(Math.max(0.001, p[0]*cap), p[1]*h); });
var m = new THREE.Mesh(new THREE.LatheGeometry(pts, 80), mat);
m.position.y = y0; grup.add(m); return m;
}
// Sahte radyal golge lekesi urunu yere oturtmuyordu; render'larda urun
var zeminler = [], yansima = null;
function zeminKur(zf, genislik){
zeminler.forEach(function(o){ sah.remove(o); }); zeminler = [];
var R = genislik*5.0;
var zc = document.createElement('canvas'); zc.width = zc.height = 512;
var zx = zc.getContext('2d');
var zg = zx.createRadialGradient(256, 256, 20, 256, 256, 252);
zg.addColorStop(0.00, 'rgba(28,24,20,0.92)');
zg.addColorStop(0.45, 'rgba(24,21,18,0.74)');
zg.addColorStop(0.78, 'rgba(18,16,14,0.28)');
zg.addColorStop(1.00, 'rgba(18,16,14,0)');
zx.fillStyle = zg; zx.fillRect(0, 0, 512, 512);
var yuzey = new THREE.Mesh(new THREE.PlaneGeometry(R, R),
new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(zc),
transparent:true, depthWrite:false}));
yuzey.rotation.x = -Math.PI/2; yuzey.position.y = zf + 0.4;
yuzey.renderOrder = 1;
var gol = new THREE.Mesh(new THREE.PlaneGeometry(R, R),
new THREE.ShadowMaterial({opacity:0.55}));
gol.rotation.x = -Math.PI/2; gol.position.y = zf + 0.8;
gol.receiveShadow = true; gol.renderOrder = 2;
var cg = document.createElement('canvas'); cg.width = cg.height = 256;
var g3 = cg.getContext('2d');
var rg = g3.createRadialGradient(128, 128, 2, 128, 128, 124);
rg.addColorStop(0, 'rgba(6,5,4,0.78)');
rg.addColorStop(0.42, 'rgba(6,5,4,0.28)');
rg.addColorStop(1, 'rgba(6,5,4,0)');
g3.fillStyle = rg; g3.fillRect(0, 0, 256, 256);
var tem = new THREE.Mesh(new THREE.PlaneGeometry(genislik*1.9, genislik*1.9),
new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cg),
transparent:true, depthWrite:false}));
tem.rotation.x = -Math.PI/2; tem.position.y = zf + 1.2; tem.renderOrder = 3;
[yuzey, gol, tem].forEach(function(o){ sah.add(o); zeminler.push(o); });
}
function yansimaKur(){
if (yansima){ sah.remove(yansima); yansima = null; }
yansima = grup.clone(true);
yansima.traverse(function(o){
if(!o.isMesh) return;
var m = o.material.clone();
m.side = THREE.DoubleSide; m.transparent = true;
m.opacity = (o.material.transparent ? o.material.opacity : 1) * 0.34;
m.depthWrite = false;
o.material = m; o.castShadow = false; o.receiveShadow = false;
o.renderOrder = 0;
});
yansima.scale.y = -1;
sah.add(yansima);
}
// lathe'e phi araligi: govdenin bir yayini bosaltip yerine ceviz panel
function lathe2(profil, cap, h, mat, y0, olcek, phi0, phiLen, seg, uvx){
var s = olcek === undefined ? 1 : olcek;
var pts = profil.map(function(p){
return new THREE.Vector2(Math.max(0.001, p[0]*cap*0.5*s), p[1]*h); });
var g = new THREE.LatheGeometry(pts, seg || 96, phi0 || 0,
phiLen === undefined ? Math.PI*2 : phiLen);
// sutunlara bolunen panelde her parcanin UV'si 0..1 olur ve doku her
if (uvx){
var uv = g.attributes.uv;
for (var i=0;i<uv.count;i++) uv.setX(i, uvx[0] + uv.getX(i)*uvx[1]);
uv.needsUpdate = true;
}
if (_topla){ g.translate(0, y0, 0); _topla.push(g); return null; }
var m = new THREE.Mesh(g, mat); m.position.y = y0; grup.add(m); return m;
}
// Sutunlara bolunen panel 300'u askin ayri mesh uretiyor; her biri bir cizim
var _topla = null;
function birlestir(gs){
var tv = 0, ti = 0;
gs.forEach(function(g){ tv += g.attributes.position.count; ti += g.index.count; });
var pos = new Float32Array(tv*3), nor = new Float32Array(tv*3),
uvd = new Float32Array(tv*2), idx = new Uint32Array(ti);
var vo = 0, io = 0;
gs.forEach(function(g){
pos.set(g.attributes.position.array, vo*3);
nor.set(g.attributes.normal.array, vo*3);
uvd.set(g.attributes.uv.array, vo*2);
var gi = g.index.array;
for(var i=0;i<gi.length;i++) idx[io+i] = gi[i] + vo;
vo += g.attributes.position.count; io += gi.length;
});
var m = new THREE.BufferGeometry();
m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
m.setAttribute('normal',   new THREE.BufferAttribute(nor, 3));
m.setAttribute('uv',       new THREE.BufferAttribute(uvd, 2));
m.setIndex(new THREE.BufferAttribute(idx, 1));
return m;
}
function toplu(mat, fn){
var onceki = _topla; _topla = [];
fn();
var gs = _topla; _topla = onceki;
if (!gs.length) return null;
var m = new THREE.Mesh(birlestir(gs), mat); grup.add(m); return m;
}
function dilim(profil, a, b){
var r = [], n = profil.length;
function ara(p, q, y){ var k = (y-p[1])/(q[1]-p[1]);
return [p[0]+(q[0]-p[0])*k, y]; }
for(var i=0;i<n-1;i++){
var p = profil[i], q = profil[i+1];
if (p[1] <= a && q[1] > a) r.push(ara(p, q, a));
if (q[1] > a && q[1] < b) r.push(q);
if (p[1] < b && q[1] >= b) { r.push(ara(p, q, b)); break; }
}
return r;
}
function sutunlar(n, phi0, phiW, fn, kes){
var sn = [-1].concat(kes || [], [1]), u = [];
for(var s=0; s<sn.length-1; s++){
var a = sn[s], b = sn[s+1], m = Math.max(10, Math.round(n*(b-a)/2));
for(var i=(s ? 1 : 0); i<=m; i++){
u.push(a + (b-a)*(Math.sin((i/m - 0.5)*Math.PI) + 1)/2);
}
}
for(var j=0;j<u.length-1;j++){
var c = u[j], d = u[j+1];
fn((c+d)/2, phi0 + phiW*(c+1)/2, phiW*(d-c)/2*1.06, (c+1)/2, (d-c)/2);
}
}
function kenar(u, rk, ry){
var a = Math.min(1, Math.abs(u));
if (a <= 1-rk) return 1;
var k = (a-(1-rk))/rk;
return 1 - (ry === undefined ? 0.25 : ry)*(1 - Math.sqrt(Math.max(0, 1-k*k)));
}
function govdeDelikli(prof, cap, h, mat, a0, aw, m0, m1, rk, n, ry){
toplu(mat, function(){
lathe2(prof, cap, h, mat, 0, 1, a0+aw, Math.PI*2-aw);
var yM = (m0+m1)/2, yH = (m1-m0)/2;
sutunlar(n, a0, aw, function(u, b0, bw){
var k = kenar(u, rk, ry);
lathe2(dilim(prof, 0, yM-yH*k), cap, h, mat, 0, 1, b0, bw, 4);
lathe2(dilim(prof, yM+yH*k, 1), cap, h, mat, 0, 1, b0, bw, 4);
});
});
}
function konturKapla(prof, cap, h, mat, a0, aw, m0, m1, rk, n, ol, delik, ry){
var yM = (m0+m1)/2, yH = (m1-m0)/2;
toplu(mat, function(){ sutunlar(n, a0, aw, function(u, b0, bw, v0, vs){
var k = kenar(u, rk, ry), t0 = yM-yH*k, t1 = yM+yH*k, uv = [v0, vs];
if (delik){
var uu = u/delik.arc;
if (Math.abs(uu) < 1){
var kk = kenar(uu, delik.rk, delik.ry);
lathe2(dilim(prof, t0, delik.m-delik.h*kk), cap, h, mat, 0, ol, b0, bw, 4, uv);
lathe2(dilim(prof, delik.m+delik.h*kk, t1), cap, h, mat, 0, ol, b0, bw, 4, uv);
return;
}
}
lathe2(dilim(prof, t0, t1), cap, h, mat, 0, ol, b0, bw, 4, uv);
}, delik ? [-delik.arc, delik.arc] : null); });
}
function icAstar(){ return new THREE.MeshStandardMaterial({
color:0x15191c, metalness:0.22, roughness:0.75, side:THREE.BackSide }); }
function metal2(){ var m = metal(); m.side = THREE.DoubleSide; return m; }
var PANEL_C = 0.72, PANEL_W = 2.02;
function marpuc(rx, ry, ol){
var pt = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 26, 28), metal());
pt.rotation.z = -Math.PI/2; pt.position.set(rx+12, ry, 0); grup.add(pt);
var bl = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 10, 28), metal());
bl.rotation.z = -Math.PI/2; bl.position.set(rx+28, ry, 0); grup.add(bl);
var eg = new THREE.CatmullRomCurve3([
new THREE.Vector3(rx+34,       ry,          0),
new THREE.Vector3(rx+ol*0.62,  ry+ol*0.06, -ol*0.20),
new THREE.Vector3(rx+ol*0.92,  ry-ol*0.34, -ol*0.06),
new THREE.Vector3(rx+ol*0.74,  ol*0.10,     ol*0.34),
new THREE.Vector3(rx+ol*0.24,  ol*0.055,    ol*0.58)
]);
grup.add(new THREE.Mesh(new THREE.TubeGeometry(eg, 110, 8.2, 18, false), silikon()));
var u = eg.getPoint(1.0), o = eg.getPoint(0.94);
var yon = new THREE.Vector3().subVectors(u, o).normalize();
var q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), yon);
function ek(g, m, d){ var me = new THREE.Mesh(g, m); me.quaternion.copy(q);
me.position.copy(u).addScaledVector(yon, d); grup.add(me); }
ek(new THREE.CylinderGeometry(11.5, 11.5, 8, 28), metal(), 3);
ek(new THREE.CylinderGeometry(9.6, 7.8, 64, 28), ahsap(), 39);
ek(new THREE.CylinderGeometry(7.2, 6.4, 10, 28), metal(), 76);
}
function kurKoza(M){
var Y = M.yuk, gH = Y*0.745, r = M.sise/2, N = 64;
var prof = [[0.00,0.000],[0.70,0.000],[0.88,0.012],[0.97,0.038],[1.00,0.075],
[1.00,0.700],[0.99,0.780],[0.95,0.855],[0.87,0.918],
[0.74,0.966],[0.58,0.994],[0.44,1.000]];
var pw = PANEL_W, p0 = PANEL_C - pw/2;
var py0 = 0.115, py1 = 0.880;
var wArc = 0.60, ww = pw*wArc, w0 = p0 + pw*(1-wArc)/2;
var wy0 = 0.215, wy1 = 0.780;
var mM = metal2(), mA = ahsap(), mC = cam();
govdeDelikli(prof, M.sise, gH, mM, w0, ww, wy0, wy1, 0.34, N, 0.30);
konturKapla(prof, M.sise, gH, mA, p0, pw, py0, py1, 0.26, N, 1.007,
{arc: wArc, rk: 0.34, ry: 0.30, m: (wy0+wy1)/2, h: (wy1-wy0)/2}, 0.22);
konturKapla(prof, M.sise, gH, mC, w0, ww, wy0, wy1, 0.34, N, 1.003,
null, 0.30);
lathe2(prof, M.sise, gH, icAstar(), 0, 0.93);
var suP = dilim(prof, 0, 0.31);
suP.unshift([0.02, 0.0]); suP.push([0.02, 0.31]);
lathe2(suP, M.sise, gH, su(), 1, 0.90);
sil(8.0, 8.0, gH*0.74, metal(), gH*0.42, 32);
sil(r*1.014, r*1.014, 3.2, metal(), gH*0.520, 80);
sil(r*1.014, r*1.014, 3.2, metal(), gH*0.485, 80);
var nH = Y*0.255;
var bo = [[0.00,0.00],[0.54,0.00],[0.56,0.035],[0.56,0.075],[0.50,0.095],
[0.50,0.125],[0.56,0.145],[0.56,0.185],[0.48,0.215],
[0.385,0.36],[0.365,0.50],[0.40,0.64],[0.455,0.775],
[0.455,0.815],[0.53,0.835],[0.53,0.875],[0.47,0.895],
[0.47,0.925],[0.545,0.945],[0.545,1.00],[0.38,1.00],
[0.38,0.945],[0.00,0.945]];
lathe2(bo, M.sise, nH, metal(), gH);
marpuc(r, gH*0.62, r*3.1);
return gH + nH;
}
function kurLadin(M){
var Y = M.yuk, gH = Y*0.800, r = M.sise/2, N = 64;
var prof = [[0.00,0.000],[0.74,0.000],[0.92,0.010],[0.99,0.026],[1.00,0.048],
[1.00,0.880],[0.98,0.925],[0.92,0.960],[0.80,0.984],
[0.62,0.997],[0.44,1.000]];
var pw = PANEL_W*0.92, p0 = PANEL_C - pw/2;
var py0 = 0.135, py1 = 0.855;
var mM = metal2();
// panel yuvasi acilir, ceviz icerlek oturur — render'daki frezelenmis his
govdeDelikli(prof, M.sise, gH, mM, p0, pw, py0, py1, 0.18, N, 0.16);
konturKapla(prof, M.sise, gH, ahsap(), p0, pw, py0-0.004, py1+0.004,
0.18, N, 0.962, null, 0.16);
lathe2(prof, M.sise, gH, icAstar(), 0, 0.90);
sil(r*1.006, r*1.006, 2.4, new THREE.MeshStandardMaterial(
{color:0x1d2225, metalness:0.35, roughness:0.72}), gH*0.500, 80);
var nH = Y*0.200;
var bo = [[0.00,0.00],[0.40,0.00],[0.40,0.055],[0.30,0.14],
[0.265,0.44],[0.30,0.62],[0.46,0.87],[0.58,1.00],
[0.455,1.00],[0.325,0.83],[0.235,0.58],[0.215,0.38],[0.00,0.32]];
lathe2(bo, M.sise, nH, metal(), gH);
marpuc(r, gH*0.660, r*3.7);
return gH + nH;
}
function kurManolya(M){
var Y = M.yuk, y = 0;
var kH = Y*0.105;
lathe2([[0.00,0.00],[0.95,0.00],[1.00,0.07],[1.00,0.90],[0.97,1.00],
[0.58,1.00],[0.00,0.92]], M.taban, kH, metal(), y); y += kH;
var cH = Y*0.305, cCap = M.taban*0.90;
var koni = [[0.00,0.00],[0.94,0.00],[1.00,0.045],[0.97,0.13],
[0.82,0.40],[0.64,0.68],[0.52,0.90],[0.49,1.00]];
var FASET = 12;
lathe2(koni, cCap, cH, kesmeCam(), y, 1, 0, Math.PI*2, FASET);
var kenarMat = new THREE.MeshStandardMaterial(
{color:0xdfe6ea, metalness:0.55, roughness:0.18, envMapIntensity:1.6});
toplu(kenarMat, function(){
for(var f=0; f<FASET; f++){
var a = f*Math.PI*2/FASET;
lathe2(koni, cCap, cH, kenarMat, y, 1.004, a-0.012, 0.024, 2);
}
});
var suP = dilim(koni, 0, 0.40);
suP.unshift([0.02, 0.0]); suP.push([0.02, 0.40]);
lathe2(suP, cCap, cH, su(), y+1, 0.95, 0, Math.PI*2, FASET);
sil(6.5, 6.5, cH*0.72, metal(), y + cH*0.38, 32);
y += cH;
var bR = M.taban*0.235, bH = Y*0.072;
lathe2([[0.00,0.00],[1.06,0.00],[1.08,0.06],[1.00,0.16],
[1.00,0.30],[0.94,0.345],[1.00,0.39],[1.00,0.52],
[0.94,0.565],[1.00,0.61],[1.00,0.74],[0.94,0.785],
[1.00,0.83],[1.00,0.95],[0.96,1.00],[0.00,1.00]],
bR*2, bH, metal(), y);
marpuc(bR*1.02, y + bH*0.52, M.sise*1.55);
y += bH;
var aH = Y*0.175;
lathe2([[0.00,0.00],[0.92,0.00],[0.95,0.04],[0.90,0.50],[0.93,0.95],
[0.95,1.00],[0.00,1.00]], bR*2, aH, ahsap(), y); y += aH;
sil(bR*0.98, bR*0.98, 4.5, metal(), y+2.2, 48); y += 4.5;
var tH = Y*0.150;
lathe2([[0.00,0.00],[0.90,0.00],[0.92,0.05],[0.78,0.34],[0.72,0.62],
[0.82,0.88],[0.90,1.00],[0.00,1.00]], bR*2, tH, metal(), y); y += tH;
var hH = Y*0.032;
lathe2([[0.00,0.00],[0.94,0.00],[0.98,0.16],[0.98,0.84],[0.94,1.00],
[0.00,1.00]], bR*2, hH, ahsap(), y); y += hH;
var kH2 = Y*0.048;
lathe2([[0.00,0.00],[1.10,0.00],[1.22,0.14],[1.24,0.34],[1.24,0.76],
[1.20,0.92],[1.02,1.00],[0.46,1.00],[0.44,0.66],[0.00,0.60]],
bR*2, kH2, metal(), y);
y += kH2;
return y;
}
function kur(){
while(grup.children.length) grup.remove(grup.children[0]);
var M = MODELLER.filter(function(x){return x.id===mid;})[0];
var toplam;
if (M.id === 'narion-ladin')        toplam = kurLadin(M);
else if (M.id === 'narion-manolya') toplam = kurManolya(M);
else                                toplam = kurKoza(M);
toplam += ekleLule(M, toplam);
var genis = Math.max(M.taban, M.sise, M.lule);
grup.position.y = -toplam/2;
grup.traverse(function(o){
if(!o.isMesh) return;
o.castShadow = true; o.receiveShadow = true;
});
zeminKur(-toplam/2, genis);
yansimaKur();
var kap2 = Math.max(toplam, genis*3)*0.85;
l1.shadow.camera.left = -kap2; l1.shadow.camera.right = kap2;
l1.shadow.camera.top = kap2;   l1.shadow.camera.bottom = -kap2;
l1.shadow.camera.near = 1;     l1.shadow.camera.far = kap2*7;
l1.shadow.camera.updateProjectionMatrix();
var uzak = Math.max(toplam*1.85, genis*7.2);
kam.position.set(uzak*0.50, uzak*0.17, uzak*0.85);
kam.lookAt(0, 0, 0);
hedefUzak = uzak;
}
var donY = 0.72, donX = 0.16, basili = false, sx = 0, sy = 0, hedefUzak = 900;
function ac(e){ basili = true; isaretle(); sx = (e.touches?e.touches[0]:e).clientX; sy = (e.touches?e.touches[0]:e).clientY; }
function kapat(){ if(basili) isaretle(); basili = false; }
function hareket(e){
if(!basili) return;
var t = e.touches?e.touches[0]:e;
donY += (t.clientX - sx) * 0.009;
donX += (t.clientY - sy) * 0.006;
donX = Math.max(-0.75, Math.min(0.95, donX));
sx = t.clientX; sy = t.clientY; isaretle();
if(e.touches) e.preventDefault();
}
ren.domElement.addEventListener('mousedown', ac);
ren.domElement.addEventListener('touchstart', ac, {passive:true});
addEventListener('mouseup', kapat); addEventListener('touchend', kapat);
addEventListener('mousemove', hareket);
ren.domElement.addEventListener('touchmove', hareket, {passive:false});
ren.domElement.addEventListener('wheel', function(e){
if(!e.ctrlKey && !e.metaKey) return;
hedefUzak = Math.max(260, Math.min(2200, hedefUzak + e.deltaY*0.6));
isaretle(); e.preventDefault();
}, {passive:false});
var zi = document.getElementById('z-in'), zo = document.getElementById('z-out');
if(zi) zi.addEventListener('click', function(){ hedefUzak = Math.max(260, hedefUzak-180); isaretle(); });
if(zo) zo.addEventListener('click', function(){ hedefUzak = Math.min(2200, hedefUzak+180); isaretle(); });
var HIZLI = Math.min(devicePixelRatio, 1.75);
var BITMIS = Math.min(devicePixelRatio * 2, 3);
var kirli = true, yuksek = false, sonHareket = 0;
var acilisT = performance.now(), acilisVar = true, donY0 = donY - 0.62;
function oranla(o){
ren.setPixelRatio(o);
ren.setSize(el.clientWidth, el.clientHeight);
kam.aspect = el.clientWidth/el.clientHeight; kam.updateProjectionMatrix();
}
function isaretle(){
kirli = true; sonHareket = performance.now(); acilisVar = false;
if (yuksek){ yuksek = false; oranla(HIZLI); }
}
function ciz(){
var r = hedefUzak;
kam.position.x = Math.sin(donY)*Math.cos(donX)*r;
kam.position.z = Math.cos(donY)*Math.cos(donX)*r;
kam.position.y = Math.sin(donX)*r;
kam.lookAt(0,0,0);
ren.render(sah, kam);
}
function dongu(){
requestAnimationFrame(dongu);
var simdi = performance.now();
if (acilisVar){
var p = Math.min(1, (simdi - acilisT)/2400);
var e2 = 1 - Math.pow(1 - p, 3);
donY = donY0 + 0.62*e2;
kirli = true;
if (p >= 1){ acilisVar = false; sonHareket = simdi; }
}
if (basili) kirli = true;
if (kirli){ kirli = false; ciz(); sonHareket = simdi; return; }
if (!yuksek && simdi - sonHareket > 380){
yuksek = true; oranla(BITMIS); ciz();
}
}
addEventListener('resize', function(){
oranla(yuksek ? BITMIS : HIZLI); isaretle();
});
document.querySelectorAll('[data-model]').forEach(function(b){
b.addEventListener('click', function(){
mid = b.dataset.model;
document.querySelectorAll('[data-model]').forEach(function(x){x.setAttribute('aria-pressed', x===b);});
kur(); isaretle();
});
});
document.querySelectorAll('[data-kaplama]').forEach(function(b){
b.addEventListener('click', function(){
kap = K.filter(function(x){return x[0]===b.dataset.kaplama;})[0];
document.querySelectorAll('[data-kaplama]').forEach(function(x){x.setAttribute('aria-pressed', x===b);});
kur(); isaretle();
});
});
document.querySelectorAll('[data-lule]').forEach(function(b){
b.addEventListener('click', function(){
luleTakili = b.dataset.lule === 'takili';
document.querySelectorAll('[data-lule]').forEach(function(x){x.setAttribute('aria-pressed', x===b);});
kur(); isaretle();
});
});
var dlb = document.getElementById('v3-indir');
if (dlb) dlb.addEventListener('click', function(){
var onceki = ren.getPixelRatio();
dlb.disabled = true;
try {
// uzun kenari 3000 px'i asmasin — mobilde tuval tahsisi basarisiz olur
var enb = Math.max(el.clientWidth, el.clientHeight);
oranla(Math.min(devicePixelRatio * 3, 4, 3000 / enb));
ciz();
var a = document.createElement('a');
a.href = ren.domElement.toDataURL('image/png');
a.download = 'narion-' + mid.replace('narion-', '') + '-' + kap[0] + '.png';
a.click();
} finally {
oranla(onceki); ciz(); dlb.disabled = false;
}
});
oranla(HIZLI); kur(); dongu();
})();
