/* Hero blockchain background — Canvas 2D, no deps.
 * Layered effect:
 *   1. Drifting hex "blocks" rising upward (the chain).
 *   2. Chain links between consecutive blocks with periodic confirmation pulses.
 *   3. Light particle network for atmospheric depth.
 *   4. Subtle hash glyph drift in the far background.
 * Respects prefers-reduced-motion (renders one static frame).
 */

export function init(selector = '[data-hero-network]') {
	const host = document.querySelector(selector);
	if (!host) return;

	const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const canvas = document.createElement('canvas');
	canvas.setAttribute('aria-hidden', 'true');
	host.appendChild(canvas);
	const ctx = canvas.getContext('2d', { alpha: true });
	if (!ctx) return;

	let dpr = Math.min(window.devicePixelRatio || 1, 2);
	let w = 0, h = 0;
	let blocks = [];
	let particles = [];
	let glyphs = [];
	let pulses = [];
	let mouse = { x: -9999, y: -9999, active: false };
	let raf = 0;
	let last = 0;
	let nextPulse = 0;
	let logoTime = 0;
	let logoImg = null;
	try {
		logoImg = new Image();
		logoImg.decoding = 'async';
		logoImg.src = '/images/dgb-logo.png';
	} catch (_) { /* ignore */ }

	const HEX_CHARS = '0123456789abcdef';
	const randHash = (n = 8) => {
		let s = '';
		for (let i = 0; i < n; i++) s += HEX_CHARS[(Math.random() * 16) | 0];
		return s;
	};

	function resize() {
		const rect = host.getBoundingClientRect();
		w = rect.width;
		h = rect.height;
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		seed();
	}

	function seed() {
		const blockCount = Math.min(14, Math.max(7, Math.floor(h / 90)));
		blocks = new Array(blockCount).fill(0).map((_, i) => ({
			x: Math.random() * w,
			y: (i / blockCount) * h + Math.random() * 40,
			size: 18 + Math.random() * 14,
			rot: 0,
			vx: (Math.random() - 0.5) * 0.12,
			vy: -0.18 - Math.random() * 0.18,
			hue: Math.random() < 0.3 ? 'cyan' : 'blue',
			hash: randHash(8),
			height: 23_000_000 + Math.floor(Math.random() * 500_000),
			confirm: Math.random(),
			dgb: Math.random() < 0.25,
		}));

		const particleCount = Math.min(70, Math.max(28, Math.floor((w * h) / 28000)));
		particles = new Array(particleCount).fill(0).map(() => ({
			x: Math.random() * w,
			y: Math.random() * h,
			vx: (Math.random() - 0.5) * 0.18,
			vy: (Math.random() - 0.5) * 0.18,
			r: Math.random() * 1.2 + 0.4,
			pulse: Math.random() * Math.PI * 2,
		}));

		const glyphCount = Math.min(12, Math.max(5, Math.floor(w / 180)));
		glyphs = new Array(glyphCount).fill(0).map(() => ({
			x: Math.random() * w,
			y: Math.random() * h,
			vy: -0.12 - Math.random() * 0.15,
			text: '0x' + randHash(10),
			alpha: 0.04 + Math.random() * 0.06,
			size: 10 + Math.random() * 4,
		}));

		pulses = [];
		nextPulse = 600 + Math.random() * 1200;
	}

	function drawHex(x, y, size, rot) {
		// Kept for confirmation rings — draws a rounded square outline.
		const s = size * 0.95;
		const r = Math.min(s * 0.18, 6);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rot);
		ctx.beginPath();
		ctx.moveTo(-s + r, -s);
		ctx.lineTo(s - r, -s);
		ctx.quadraticCurveTo(s, -s, s, -s + r);
		ctx.lineTo(s, s - r);
		ctx.quadraticCurveTo(s, s, s - r, s);
		ctx.lineTo(-s + r, s);
		ctx.quadraticCurveTo(-s, s, -s, s - r);
		ctx.lineTo(-s, -s + r);
		ctx.quadraticCurveTo(-s, -s, -s + r, -s);
		ctx.closePath();
		ctx.restore();
	}

	function drawCube(cx, cy, size, hue) {
		// True isometric cube: top + left + right faces visible.
		const s = size;
		const cos30 = Math.cos(Math.PI / 6);
		const sin30 = 0.5;
		const v = (X, Y, Z) => ({
			x: cx + (X - Z) * cos30 * s,
			y: cy + ((X + Z) * sin30 - Y) * s,
		});
		// Y-up cube, vertices at ±1
		const TFL = v(-1,  1, -1);
		const TFR = v( 1,  1, -1);
		const TBR = v( 1,  1,  1);
		const TBL = v(-1,  1,  1);
		const BFL = v(-1, -1, -1);
		const BFR = v( 1, -1, -1);
		const BBL = v(-1, -1,  1);

		const isCyan = hue === 'cyan';
		const stroke = isCyan ? 'rgba(0, 229, 255, 0.95)' : 'rgba(80, 150, 255, 0.95)';
		const topFill   = isCyan ? 'rgba(0, 229, 255, 0.26)' : 'rgba(40, 110, 255, 0.26)';
		const leftFill  = isCyan ? 'rgba(0, 180, 220, 0.18)' : 'rgba(20, 70, 200, 0.20)';
		const rightFill = isCyan ? 'rgba(0, 110, 160, 0.10)' : 'rgba(10, 40, 140, 0.12)';

		const face = (pts, fill) => {
			ctx.beginPath();
			ctx.moveTo(pts[0].x, pts[0].y);
			for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
			ctx.closePath();
			ctx.fillStyle = fill;
			ctx.fill();
			ctx.strokeStyle = stroke;
			ctx.lineWidth = 1.3;
			ctx.stroke();
		};

		// Right face (X = +1): TFR -> TBR -> BBR -> BFR
		const BBR = v( 1, -1,  1);
		face([TFR, TBR, BBR, BFR], rightFill);
		// Back face (Z = +1, projects to screen-left): TBL -> TBR -> BBR -> BBL
		face([TBL, TBR, BBR, BBL], leftFill);
		// Top face (Y = +1): TFL -> TFR -> TBR -> TBL
		face([TFL, TFR, TBR, TBL], topFill);

		// Bright top-edge highlights along the two front edges of the top face
		ctx.strokeStyle = isCyan ? 'rgba(190, 250, 255, 0.55)' : 'rgba(170, 210, 255, 0.50)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(TFL.x, TFL.y); ctx.lineTo(TFR.x, TFR.y);
		ctx.moveTo(TFL.x, TFL.y); ctx.lineTo(TBL.x, TBL.y);
		ctx.stroke();
	}

	function step(t) {
		const dt = last ? Math.min(33, t - last) : 16;
		last = t;
		logoTime += dt;
		ctx.clearRect(0, 0, w, h);

		// Drifting hex strings
		ctx.textBaseline = 'middle';
		for (const g of glyphs) {
			g.y += g.vy;
			if (g.y < -20) {
				g.y = h + 20;
				g.x = Math.random() * w;
				g.text = '0x' + randHash(10);
			}
			ctx.fillStyle = `rgba(120, 200, 255, ${g.alpha})`;
			ctx.font = `500 ${g.size}px "JetBrains Mono", ui-monospace, monospace`;
			ctx.fillText(g.text, g.x, g.y);
		}

		// Particle network
		for (const p of particles) {
			p.x += p.vx;
			p.y += p.vy;
			p.pulse += 0.02;
			if (p.x < 0 || p.x > w) p.vx *= -1;
			if (p.y < 0 || p.y > h) p.vy *= -1;
			if (mouse.active) {
				const dx = p.x - mouse.x, dy = p.y - mouse.y;
				const d2 = dx * dx + dy * dy;
				if (d2 < 14400) {
					const f = (1 - d2 / 14400) * 0.5;
					p.x += (dx / Math.sqrt(d2 || 1)) * f;
					p.y += (dy / Math.sqrt(d2 || 1)) * f;
				}
			}
		}
		const maxLink = 130;
		for (let i = 0; i < particles.length; i++) {
			const a = particles[i];
			for (let j = i + 1; j < particles.length; j++) {
				const b = particles[j];
				const dx = a.x - b.x, dy = a.y - b.y;
				const d = Math.sqrt(dx * dx + dy * dy);
				if (d < maxLink) {
					const alpha = (1 - d / maxLink) * 0.18;
					ctx.strokeStyle = `rgba(0, 229, 255, ${alpha.toFixed(3)})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(a.x, a.y);
					ctx.lineTo(b.x, b.y);
					ctx.stroke();
				}
			}
		}
		for (const p of particles) {
			const r = p.r + Math.sin(p.pulse) * 0.3;
			ctx.fillStyle = 'rgba(0, 229, 255, 0.55)';
			ctx.beginPath();
			ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
			ctx.fill();
		}

		// Update blocks
		for (const b of blocks) {
			b.y += b.vy;
			b.x += b.vx;
			b.confirm = (b.confirm + 0.003) % 1;
			if (b.y < -40) {
				b.y = h + 40;
				b.x = Math.random() * w;
				b.hash = randHash(8);
				b.height += blocks.length;
				b.dgb = Math.random() < 0.25;
			}
			if (b.x < -40) b.x = w + 40;
			if (b.x > w + 40) b.x = -40;
		}
		const sorted = [...blocks].sort((a, b) => a.y - b.y);

		// Chain links between consecutive blocks
		for (let i = 0; i < sorted.length - 1; i++) {
			const a = sorted[i], b = sorted[i + 1];
			const dx = b.x - a.x, dy = b.y - a.y;
			const d = Math.sqrt(dx * dx + dy * dy);
			if (d > 280) continue;
			const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
			grad.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
			grad.addColorStop(1, 'rgba(20, 80, 255, 0.35)');
			ctx.strokeStyle = grad;
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(a.x, a.y);
			ctx.lineTo(b.x, b.y);
			ctx.stroke();
		}

		// Confirmation pulses traveling along chain
		nextPulse -= dt;
		if (nextPulse <= 0 && sorted.length > 1) {
			pulses.push({ idx: 0, t: 0, chain: sorted });
			nextPulse = 1400 + Math.random() * 1800;
		}
		for (let pi = pulses.length - 1; pi >= 0; pi--) {
			const p = pulses[pi];
			p.t += dt / 700;
			while (p.t >= 1 && p.idx < p.chain.length - 2) {
				p.idx++;
				p.t -= 1;
			}
			if (p.idx >= p.chain.length - 1) {
				pulses.splice(pi, 1);
				continue;
			}
			const a = p.chain[p.idx], b = p.chain[p.idx + 1];
			const x = a.x + (b.x - a.x) * p.t;
			const y = a.y + (b.y - a.y) * p.t;
			const grad = ctx.createRadialGradient(x, y, 0, x, y, 22);
			grad.addColorStop(0, 'rgba(0, 255, 240, 0.9)');
			grad.addColorStop(0.4, 'rgba(0, 229, 255, 0.45)');
			grad.addColorStop(1, 'transparent');
			ctx.fillStyle = grad;
			ctx.beginPath();
			ctx.arc(x, y, 22, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#dffaff';
			ctx.beginPath();
			ctx.arc(x, y, 2.4, 0, Math.PI * 2);
			ctx.fill();
		}

		// Isometric cube blocks
		for (const b of sorted) {
			const isCyan = b.hue === 'cyan';

			// Soft glow halo
			const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size * 3);
			glow.addColorStop(0, isCyan
				? 'rgba(0, 229, 255, 0.18)'
				: 'rgba(20, 80, 255, 0.18)');
			glow.addColorStop(1, 'transparent');
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(b.x, b.y, b.size * 3, 0, Math.PI * 2);
			ctx.fill();

			drawCube(b.x, b.y, b.size, b.hue);

			// Confirmation ring (expanding rounded square)
			const cr = b.size * (1 + b.confirm * 1.5);
			const ca = (1 - b.confirm) * 0.4;
			ctx.strokeStyle = `rgba(0, 229, 255, ${ca.toFixed(3)})`;
			ctx.lineWidth = 1;
			drawHex(b.x, b.y, cr, 0);
			ctx.stroke();

			// Block label: DGB logo inside the cube, or block height
			if (b.size > 22) {
				if (b.dgb && logoImg && logoImg.complete && logoImg.naturalWidth) {
					const ls = b.size * 1.1;
					ctx.save();
					ctx.globalCompositeOperation = 'lighter';
					ctx.globalAlpha = 0.85;
					ctx.shadowColor = isCyan
						? 'rgba(0, 229, 255, 0.9)'
						: 'rgba(80, 150, 255, 0.9)';
					ctx.shadowBlur = 14;
					ctx.drawImage(logoImg, b.x - ls / 2, b.y - ls / 2, ls, ls);
					ctx.restore();
				} else {
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.font = `500 ${(b.size * 0.30).toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`;
					ctx.fillStyle = 'rgba(190, 230, 255, 0.7)';
					ctx.fillText('#' + b.height, b.x, b.y);
					ctx.textAlign = 'start';
				}
			}
		}

		raf = requestAnimationFrame(step);
	}

	function drawStatic() {
		seed();
		ctx.clearRect(0, 0, w, h);
		for (const p of particles) {
			ctx.fillStyle = 'rgba(0, 229, 255, 0.55)';
			ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
		}
		for (const b of blocks) {
			drawCube(b.x, b.y, b.size, b.hue);
		}
	}

	resize();
	window.addEventListener('resize', () => {
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		resize();
		if (reduced) drawStatic();
	}, { passive: true });

	if (reduced) {
		drawStatic();
		return;
	}

	host.addEventListener('pointermove', (e) => {
		const r = host.getBoundingClientRect();
		mouse.x = e.clientX - r.left;
		mouse.y = e.clientY - r.top;
		mouse.active = true;
	});
	host.addEventListener('pointerleave', () => { mouse.active = false; });

	const io = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (e.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(step); }
			else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
		}
	}, { threshold: 0 });
	io.observe(host);

	raf = requestAnimationFrame(step);
}
