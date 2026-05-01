/* 3D rotating DGB coin via Three.js (lazy-loaded ESM from esm.sh).
 * Falls back to existing SVG if WebGL is unavailable.
 */

const THREE_URL = 'https://esm.sh/three@0.160.0';

export async function init(selector = '[data-coin-3d]') {
	const hosts = document.querySelectorAll(selector);
	if (!hosts.length) return;
	const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

	// WebGL probe
	const probe = document.createElement('canvas').getContext('webgl');
	if (!probe) return; // SVG fallback already in DOM

	let THREE;
	try { THREE = await import(/* @vite-ignore */ THREE_URL); }
	catch { return; }

	hosts.forEach(host => mountCoin(host, THREE, reduced));
}

function mountCoin(host, THREE, reduced) {
	// Clear fallback content
	host.querySelectorAll(':scope > .coin-fallback').forEach(el => el.style.display = 'none');

	const scene = new THREE.Scene();
	const rect = host.getBoundingClientRect();
	const camera = new THREE.PerspectiveCamera(35, rect.width / rect.height, 0.1, 100);
	camera.position.set(0, 0, 5);

	const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setSize(rect.width, rect.height, false);
	renderer.domElement.style.width = '100%';
	renderer.domElement.style.height = '100%';
	host.appendChild(renderer.domElement);

	// Lights
	scene.add(new THREE.AmbientLight(0x223355, 0.6));
	const key = new THREE.DirectionalLight(0x00e5ff, 1.5); key.position.set(2, 3, 4); scene.add(key);
	const rim = new THREE.DirectionalLight(0x8936ff, 1.2); rim.position.set(-3, -2, 2); scene.add(rim);

	// Coin
	const radius = 1.4, thickness = 0.18;
	const coinGeo = new THREE.CylinderGeometry(radius, radius, thickness, 96, 1, false);
	const coinMat = new THREE.MeshStandardMaterial({
		color: 0x0a1a3a,
		metalness: 0.85,
		roughness: 0.25,
		emissive: 0x001122,
	});
	const coin = new THREE.Mesh(coinGeo, coinMat);
	coin.rotation.z = Math.PI / 2;
	scene.add(coin);

	// Edge ring (neon)
	const ringGeo = new THREE.TorusGeometry(radius + 0.005, 0.012, 16, 128);
	const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.9 });
	const ring = new THREE.Mesh(ringGeo, ringMat);
	ring.rotation.x = Math.PI / 2;
	ring.position.x = thickness / 2;
	scene.add(ring);
	const ring2 = ring.clone();
	ring2.position.x = -thickness / 2;
	scene.add(ring2);

	// Face: DGB glyph as extruded text from a path-like shape (simple D)
	const glyph = makeGlyph(THREE);
	glyph.scale.setScalar(0.9);
	glyph.position.x = thickness / 2 + 0.001;
	scene.add(glyph);
	const glyphBack = glyph.clone();
	glyphBack.position.x = -thickness / 2 - 0.001;
	glyphBack.rotation.y = Math.PI;
	scene.add(glyphBack);

	let raf = 0, last = performance.now();
	let scrollAngle = 0;
	const onScroll = () => { scrollAngle = window.scrollY * 0.002; };
	window.addEventListener('scroll', onScroll, { passive: true });

	function resize() {
		const r = host.getBoundingClientRect();
		camera.aspect = r.width / r.height;
		camera.updateProjectionMatrix();
		renderer.setSize(r.width, r.height, false);
	}
	const ro = new ResizeObserver(resize);
	ro.observe(host);

	function tick(now) {
		const dt = Math.min(64, now - last); last = now;
		const speed = reduced ? 0 : 0.0006;
		coin.rotation.x += speed * dt;
		ring.rotation.z += speed * dt;
		ring2.rotation.z -= speed * dt;
		glyph.rotation.x = coin.rotation.x;
		glyphBack.rotation.x = coin.rotation.x;
		coin.rotation.x += scrollAngle - (coin.userData._lastScroll || 0);
		coin.userData._lastScroll = scrollAngle;
		renderer.render(scene, camera);
		raf = requestAnimationFrame(tick);
	}

	const io = new IntersectionObserver(entries => {
		for (const e of entries) {
			if (e.isIntersecting && !raf) raf = requestAnimationFrame(tick);
			else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
		}
	}, { threshold: 0 });
	io.observe(host);

	if (reduced) {
		// Single static render
		renderer.render(scene, camera);
	}
}

function makeGlyph(THREE) {
	// Build a simple "D" shape with a hole (tokenomics glyph stand-in for DGB)
	const shape = new THREE.Shape();
	shape.moveTo(-0.55, -0.85);
	shape.lineTo(0.10, -0.85);
	shape.bezierCurveTo(0.85, -0.85, 0.95, -0.30, 0.95, 0);
	shape.bezierCurveTo(0.95, 0.30, 0.85, 0.85, 0.10, 0.85);
	shape.lineTo(-0.55, 0.85);
	shape.lineTo(-0.55, -0.85);

	const hole = new THREE.Path();
	hole.moveTo(-0.20, -0.50);
	hole.lineTo(0.10, -0.50);
	hole.bezierCurveTo(0.50, -0.50, 0.55, -0.20, 0.55, 0);
	hole.bezierCurveTo(0.55, 0.20, 0.50, 0.50, 0.10, 0.50);
	hole.lineTo(-0.20, 0.50);
	hole.lineTo(-0.20, -0.50);
	shape.holes.push(hole);

	const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 24 });
	geo.center();
	const mat = new THREE.MeshStandardMaterial({
		color: 0x00e5ff,
		emissive: 0x002a44,
		emissiveIntensity: 0.6,
		metalness: 0.7,
		roughness: 0.3,
	});
	const mesh = new THREE.Mesh(geo, mat);
	mesh.rotation.y = -Math.PI / 2;
	return mesh;
}
