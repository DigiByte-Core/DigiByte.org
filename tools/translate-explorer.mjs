#!/usr/bin/env node
/**
 * One-shot: add DigiExplorer link translations across every non-English
 * locale catalog. Idempotent — only adds missing keys.
 * After running, execute `node tools/sync-locales.mjs`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOC = join(resolve(__dirname, '..'), 'locales');

// Keys: chainCta, devhubTitle, footerLink
// devhubMeta ("DigiExplorer.info") is a proper URL and stays untranslated.
const T = {
	af:    { chainCta: "Verken blokke op DigiExplorer",       devhubTitle: "Blokverkenner",       footerLink: "Blokverkenner" },
	ar:    { chainCta: "استكشف الكتل على DigiExplorer",         devhubTitle: "متصفح الكتل",           footerLink: "متصفح الكتل" },
	bg:    { chainCta: "Разгледай блоковете в DigiExplorer",  devhubTitle: "Блоков експлорер",     footerLink: "Блоков експлорер" },
	cs:    { chainCta: "Prohlédnout bloky na DigiExploreru", devhubTitle: "Průzkumník bloků",     footerLink: "Průzkumník bloků" },
	da:    { chainCta: "Udforsk blokke på DigiExplorer",     devhubTitle: "Blokudforsker",        footerLink: "Blokudforsker" },
	de:    { chainCta: "Blöcke auf DigiExplorer erkunden",   devhubTitle: "Block-Explorer",       footerLink: "Block-Explorer" },
	el:    { chainCta: "Εξερεύνηση blocks στο DigiExplorer", devhubTitle: "Εξερευνητής block",    footerLink: "Εξερευνητής block" },
	es:    { chainCta: "Explora bloques en DigiExplorer",    devhubTitle: "Explorador de bloques", footerLink: "Explorador de bloques" },
	fa:    { chainCta: "کاوش بلوک‌ها در DigiExplorer",         devhubTitle: "کاوشگر بلوک",           footerLink: "کاوشگر بلوک" },
	fi:    { chainCta: "Tutki lohkoja DigiExplorerissa",     devhubTitle: "Lohkoselain",          footerLink: "Lohkoselain" },
	fil:   { chainCta: "Galugarin ang mga block sa DigiExplorer", devhubTitle: "Block explorer", footerLink: "Block explorer" },
	fr:    { chainCta: "Explorer les blocs sur DigiExplorer", devhubTitle: "Explorateur de blocs", footerLink: "Explorateur de blocs" },
	hi:    { chainCta: "DigiExplorer पर ब्लॉक देखें",           devhubTitle: "ब्लॉक एक्सप्लोरर",         footerLink: "ब्लॉक एक्सप्लोरर" },
	hr:    { chainCta: "Istraži blokove na DigiExploreru",   devhubTitle: "Preglednik blokova",   footerLink: "Preglednik blokova" },
	hu:    { chainCta: "Blokkok felfedezése a DigiExploreren", devhubTitle: "Blokkfelfedező",     footerLink: "Blokkfelfedező" },
	id:    { chainCta: "Jelajahi blok di DigiExplorer",      devhubTitle: "Block explorer",       footerLink: "Block explorer" },
	it:    { chainCta: "Esplora i blocchi su DigiExplorer",  devhubTitle: "Block explorer",       footerLink: "Block explorer" },
	ja:    { chainCta: "DigiExplorerでブロックを見る",           devhubTitle: "ブロックエクスプローラー", footerLink: "ブロックエクスプローラー" },
	ms:    { chainCta: "Terokai blok di DigiExplorer",       devhubTitle: "Peneroka blok",        footerLink: "Peneroka blok" },
	nb:    { chainCta: "Utforsk blokker på DigiExplorer",    devhubTitle: "Blokkutforsker",       footerLink: "Blokkutforsker" },
	nl:    { chainCta: "Verken blokken op DigiExplorer",     devhubTitle: "Blockchain-verkenner", footerLink: "Blockchain-verkenner" },
	pl:    { chainCta: "Przeglądaj bloki na DigiExplorerze", devhubTitle: "Eksplorator bloków",   footerLink: "Eksplorator bloków" },
	pt:    { chainCta: "Explorar blocos no DigiExplorer",    devhubTitle: "Explorador de blocos", footerLink: "Explorador de blocos" },
	"pt-br":{chainCta: "Explorar blocos no DigiExplorer",    devhubTitle: "Explorador de blocos", footerLink: "Explorador de blocos" },
	ro:    { chainCta: "Explorează blocuri pe DigiExplorer", devhubTitle: "Explorator de blocuri", footerLink: "Explorator de blocuri" },
	ru:    { chainCta: "Изучить блоки в DigiExplorer",       devhubTitle: "Обозреватель блоков",  footerLink: "Обозреватель блоков" },
	sl:    { chainCta: "Razišči bloke v DigiExplorerju",     devhubTitle: "Raziskovalec blokov",  footerLink: "Raziskovalec blokov" },
	sq:    { chainCta: "Eksploro blloqet në DigiExplorer",   devhubTitle: "Eksplorues blloqesh",  footerLink: "Eksplorues blloqesh" },
	sv:    { chainCta: "Utforska block på DigiExplorer",     devhubTitle: "Blockutforskare",      footerLink: "Blockutforskare" },
	sw:    { chainCta: "Chunguza vitalu kwenye DigiExplorer", devhubTitle: "Kichunguzi cha vitalu", footerLink: "Kichunguzi cha vitalu" },
	th:    { chainCta: "สำรวจบล็อกบน DigiExplorer",              devhubTitle: "บล็อกเอกซ์พลอเรอร์",     footerLink: "บล็อกเอกซ์พลอเรอร์" },
	tr:    { chainCta: "DigiExplorer'da blokları keşfet",    devhubTitle: "Blok gezgini",         footerLink: "Blok gezgini" },
	vi:    { chainCta: "Khám phá khối trên DigiExplorer",    devhubTitle: "Trình khám phá khối",  footerLink: "Trình khám phá khối" },
	zh:    { chainCta: "在 DigiExplorer 上浏览区块",             devhubTitle: "区块浏览器",             footerLink: "区块浏览器" },
};

const DEVHUB_META = "DigiExplorer.info";

function keyMap(t) {
	return {
		"chain.cta.explorer": t.chainCta,
		"devhub.link.explorer.title": t.devhubTitle,
		"devhub.link.explorer.meta": DEVHUB_META,
		"footer.resources.explorer": t.footerLink,
	};
}

let touched = 0, added = 0;
for (const [locale, t] of Object.entries(T)) {
	const p = join(LOC, `${locale}.json`);
	const obj = JSON.parse(readFileSync(p, 'utf8'));
	const km = keyMap(t);
	let localAdded = 0;
	for (const [k, v] of Object.entries(km)) {
		if (!(k in obj)) { obj[k] = v; localAdded++; }
	}
	if (localAdded > 0) {
		writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
		console.log(`[update] ${locale}.json (+${localAdded} keys)`);
		touched++;
		added += localAdded;
	} else {
		console.log(`[ok]     ${locale}.json (no changes)`);
	}
}
console.log(`\nDone. ${touched} file(s) updated, ${added} key(s) added.`);
