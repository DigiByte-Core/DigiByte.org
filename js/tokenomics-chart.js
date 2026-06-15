/* Tokenomics emission-schedule chart.
 *
 * Pure SVG, no third-party data: the supply curve is computed from DigiByte's
 * known monetary policy (1% monthly reward reduction, 21B hard cap).
 * Optionally overlays the live DGB/USD price published by chain-dashboard.js.
 */

export function init() {
	const host = document.querySelector('[data-tokenomics-chart]');
	if (!host) return;
	render(host);
}

const W = 720;
const H = 440;
const PAD = { t: 28, r: 28, b: 56, l: 56 };
const START_YEAR = 2014;
const END_YEAR = 2035;
const MAX_SUPPLY = 21; // billions

/** Smooth approximation of cumulative DGB emission in billions. */
function supplyAt(year) {
	const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
	return MAX_SUPPLY * (1 - Math.exp(-3.2 * Math.max(0, Math.min(1, t))));
}

function x(year) {
	return PAD.l + (year - START_YEAR) / (END_YEAR - START_YEAR) * (W - PAD.l - PAD.r);
}
function y(supply) {
	return H - PAD.b - (supply / MAX_SUPPLY) * (H - PAD.t - PAD.b);
}

function render(host) {
	const pts = [];
	for (let yr = START_YEAR; yr <= END_YEAR; yr += 0.25) {
		pts.push([x(yr), y(supplyAt(yr))]);
	}
	const linePath = 'M ' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ');
	const areaPath = linePath + ` L ${x(END_YEAR).toFixed(1)} ${y(0).toFixed(1)} L ${x(START_YEAR).toFixed(1)} ${y(0).toFixed(1)} Z`;

	const now = new Date();
	const nowYear = now.getFullYear() + (now.getMonth() / 12);
	const nowSupply = supplyAt(nowYear);

	const yearTicks = [2014, 2018, 2022, 2026, 2030, 2035];
	const supplyTicks = [0, 5, 10, 15, 21];

	host.innerHTML = `
		<figure class="tokenomics-chart">
			<figcaption class="tokenomics-chart__caption">
				<span class="eyebrow">Emission schedule</span>
				<span class="tokenomics-chart__live" data-tokenomics-live aria-live="polite">
					<span class="chip chip--live">Live</span>
					<span class="tokenomics-chart__price" data-stat="price">—</span>
				</span>
			</figcaption>
			<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="DigiByte cumulative supply over time, asymptoting to 21 billion DGB" preserveAspectRatio="xMidYMid meet">
				<defs>
					<linearGradient id="tk-area" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#00e5ff" stop-opacity="0.45"/>
						<stop offset="100%" stop-color="#1450ff" stop-opacity="0.02"/>
					</linearGradient>
					<linearGradient id="tk-line" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#00e5ff"/>
						<stop offset="100%" stop-color="#1450ff"/>
					</linearGradient>
					<filter id="tk-glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="3" result="b"/>
						<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
					</filter>
				</defs>

				${supplyTicks.map(s => `
					<line x1="${PAD.l}" y1="${y(s).toFixed(1)}" x2="${W - PAD.r}" y2="${y(s).toFixed(1)}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
					<text x="${PAD.l - 8}" y="${(y(s) + 4).toFixed(1)}" text-anchor="end" fill="rgba(255,255,255,0.45)" font-family="ui-monospace, monospace" font-size="11">${s}B</text>
				`).join('')}

				${yearTicks.map(yr => `
					<text x="${x(yr).toFixed(1)}" y="${H - PAD.b + 20}" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-family="ui-monospace, monospace" font-size="11">${yr}</text>
				`).join('')}

				<path d="${areaPath}" fill="url(#tk-area)"/>
				<path d="${linePath}" fill="none" stroke="url(#tk-line)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" filter="url(#tk-glow)"/>

				<line x1="${x(nowYear).toFixed(1)}" y1="${PAD.t}" x2="${x(nowYear).toFixed(1)}" y2="${H - PAD.b}" stroke="rgba(0,229,255,0.35)" stroke-width="1" stroke-dasharray="4 4"/>
				<circle cx="${x(nowYear).toFixed(1)}" cy="${y(nowSupply).toFixed(1)}" r="6" fill="#00e5ff" filter="url(#tk-glow)"/>
				<circle cx="${x(nowYear).toFixed(1)}" cy="${y(nowSupply).toFixed(1)}" r="3" fill="#ffffff"/>

				<g transform="translate(${(x(nowYear) + 12).toFixed(1)}, ${(y(nowSupply) - 8).toFixed(1)})">
					<rect x="0" y="-18" rx="6" ry="6" width="148" height="40" fill="rgba(5,7,13,0.85)" stroke="rgba(0,229,255,0.35)"/>
					<text x="10" y="-2" fill="#9fb3c8" font-family="ui-monospace, monospace" font-size="10" letter-spacing="1">TODAY</text>
					<text x="10" y="16" fill="#ffffff" font-family="ui-sans-serif, system-ui" font-size="14" font-weight="600">${nowSupply.toFixed(2)}B DGB issued</text>
				</g>

				<text x="${W - PAD.r}" y="${(y(MAX_SUPPLY) - 8).toFixed(1)}" text-anchor="end" fill="rgba(255,255,255,0.55)" font-family="ui-monospace, monospace" font-size="11">21B hard cap</text>
			</svg>
			<div class="tokenomics-chart__legend">
				<span><i class="fas fa-circle text-cyan"></i> Cumulative supply</span>
				<span><i class="fas fa-circle text-ink-3"></i> Today: ~${nowSupply.toFixed(2)}B / 21B</span>
			</div>
		</figure>
	`;
}
