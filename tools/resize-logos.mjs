import sharp from 'sharp';
import fs from 'node:fs';

const targets = [
	{ path: 'c:/GitHub/DGBio/images/dgb-logo.png',   width: 128, height: 128 },
	{ path: 'c:/GitHub/DGBio/images/footerlogo.png', width: 440, height: 170 },
];

for (const t of targets) {
	const before = fs.statSync(t.path).size;
	const buf = await sharp(t.path)
		.resize(t.width, t.height, { fit: 'fill', kernel: 'lanczos3' })
		.png({ compressionLevel: 9, palette: true, colours: 64, effort: 10 })
		.toBuffer();
	fs.writeFileSync(t.path, buf);
	const after = fs.statSync(t.path).size;
	console.log(`${t.path.split('/').pop()}: ${before} -> ${after} bytes (${t.width}x${t.height})`);
}
