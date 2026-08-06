#!/usr/bin/env node
/**
 * One-shot: add DigiDollar white paper strings across every non-English
 * locale catalog. Idempotent — only adds missing keys.
 * After running, execute `node tools/sync-locales.mjs`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOC = join(resolve(__dirname, '..'), 'locales');

// Keys: whitepaperTitle, whitepaperMeta, ctaWhitepaper, footerWhitepaper
// DigiDollar is a product name and kept as-is across locales.
const T = {
	af:    { title: "DigiDollar-witpaper",       meta: "PDF · Aug 2026 · tegniese fondament",             cta: "Lees die witpaper",                footer: "DigiDollar-witpaper" },
	ar:    { title: "الورقة البيضاء لـ DigiDollar", meta: "PDF · أغسطس 2026 · الأساس التقني",              cta: "اقرأ الورقة البيضاء",               footer: "الورقة البيضاء لـ DigiDollar" },
	bg:    { title: "Бяла книга на DigiDollar",   meta: "PDF · авг. 2026 · техническа основа",              cta: "Прочети бялата книга",              footer: "Бяла книга на DigiDollar" },
	cs:    { title: "Bílá kniha DigiDollar",      meta: "PDF · srpen 2026 · technický základ",              cta: "Přečíst bílou knihu",               footer: "Bílá kniha DigiDollar" },
	da:    { title: "DigiDollar whitepaper",      meta: "PDF · aug. 2026 · teknisk fundament",              cta: "Læs whitepaperet",                  footer: "DigiDollar whitepaper" },
	de:    { title: "DigiDollar-Whitepaper",      meta: "PDF · Aug. 2026 · technische Grundlage",           cta: "Whitepaper lesen",                  footer: "DigiDollar-Whitepaper" },
	el:    { title: "Λευκή βίβλος DigiDollar",    meta: "PDF · Αύγ. 2026 · τεχνική βάση",                    cta: "Διάβασε τη λευκή βίβλο",            footer: "Λευκή βίβλος DigiDollar" },
	es:    { title: "Whitepaper de DigiDollar",   meta: "PDF · ago 2026 · fundamento técnico",              cta: "Leer el whitepaper",                footer: "Whitepaper de DigiDollar" },
	fa:    { title: "وایت‌پیپر DigiDollar",        meta: "PDF · مرداد ۱۴۰۵ · مبانی فنی",                     cta: "وایت‌پیپر را بخوانید",              footer: "وایت‌پیپر DigiDollar" },
	fi:    { title: "DigiDollar-whitepaper",      meta: "PDF · elo 2026 · tekninen perusta",                cta: "Lue whitepaper",                    footer: "DigiDollar-whitepaper" },
	fil:   { title: "DigiDollar white paper",     meta: "PDF · Ago 2026 · teknikal na pundasyon",           cta: "Basahin ang white paper",           footer: "DigiDollar white paper" },
	fr:    { title: "Livre blanc DigiDollar",     meta: "PDF · août 2026 · fondation technique",            cta: "Lire le livre blanc",               footer: "Livre blanc DigiDollar" },
	hi:    { title: "DigiDollar श्वेतपत्र",         meta: "PDF · अग. 2026 · तकनीकी आधार",                    cta: "श्वेतपत्र पढ़ें",                     footer: "DigiDollar श्वेतपत्र" },
	hr:    { title: "DigiDollar bijela knjiga",   meta: "PDF · kol. 2026. · tehnička osnova",               cta: "Pročitaj bijelu knjigu",            footer: "DigiDollar bijela knjiga" },
	hu:    { title: "DigiDollar fehérkönyv",      meta: "PDF · 2026. aug. · technikai alap",                cta: "Fehérkönyv olvasása",               footer: "DigiDollar fehérkönyv" },
	id:    { title: "White paper DigiDollar",     meta: "PDF · Agu 2026 · fondasi teknis",                  cta: "Baca white paper",                  footer: "White paper DigiDollar" },
	it:    { title: "Whitepaper DigiDollar",      meta: "PDF · ago 2026 · fondamento tecnico",              cta: "Leggi il whitepaper",               footer: "Whitepaper DigiDollar" },
	ja:    { title: "DigiDollar ホワイトペーパー",  meta: "PDF · 2026年8月 · 技術的基盤",                       cta: "ホワイトペーパーを読む",             footer: "DigiDollar ホワイトペーパー" },
	ms:    { title: "Kertas putih DigiDollar",    meta: "PDF · Ogo 2026 · asas teknikal",                   cta: "Baca kertas putih",                 footer: "Kertas putih DigiDollar" },
	nb:    { title: "DigiDollar-whitepaper",      meta: "PDF · aug. 2026 · teknisk grunnlag",               cta: "Les whitepaperet",                  footer: "DigiDollar-whitepaper" },
	nl:    { title: "DigiDollar-whitepaper",      meta: "PDF · aug. 2026 · technische basis",               cta: "Lees de whitepaper",                footer: "DigiDollar-whitepaper" },
	pl:    { title: "Biała księga DigiDollar",    meta: "PDF · sie 2026 · podstawa techniczna",             cta: "Przeczytaj białą księgę",           footer: "Biała księga DigiDollar" },
	pt:    { title: "White paper DigiDollar",     meta: "PDF · ago 2026 · fundamento técnico",              cta: "Ler o white paper",                 footer: "White paper DigiDollar" },
	"pt-br":{title: "White paper DigiDollar",     meta: "PDF · ago 2026 · fundamento técnico",              cta: "Leia o white paper",                footer: "White paper DigiDollar" },
	ro:    { title: "White paper DigiDollar",     meta: "PDF · aug. 2026 · fundament tehnic",               cta: "Citește white paper-ul",            footer: "White paper DigiDollar" },
	ru:    { title: "Уайтпейпер DigiDollar",      meta: "PDF · авг. 2026 · техническая основа",             cta: "Читать уайтпейпер",                 footer: "Уайтпейпер DigiDollar" },
	sl:    { title: "Bela knjiga DigiDollar",     meta: "PDF · avg. 2026 · tehnične osnove",                cta: "Preberi belo knjigo",               footer: "Bela knjiga DigiDollar" },
	sq:    { title: "Letra e bardhë DigiDollar",  meta: "PDF · gusht 2026 · themeli teknik",                cta: "Lexo letrën e bardhë",              footer: "Letra e bardhë DigiDollar" },
	sv:    { title: "DigiDollar-whitepaper",      meta: "PDF · aug 2026 · teknisk grund",                   cta: "Läs whitepaperet",                  footer: "DigiDollar-whitepaper" },
	sw:    { title: "Karatasi nyeupe ya DigiDollar", meta: "PDF · Ago 2026 · msingi wa kiufundi",           cta: "Soma karatasi nyeupe",              footer: "Karatasi nyeupe ya DigiDollar" },
	th:    { title: "เอกสารไวต์เปเปอร์ DigiDollar", meta: "PDF · ส.ค. 2026 · รากฐานทางเทคนิค",              cta: "อ่านไวต์เปเปอร์",                    footer: "เอกสารไวต์เปเปอร์ DigiDollar" },
	tr:    { title: "DigiDollar teknik dokümanı", meta: "PDF · Ağu 2026 · teknik temel",                    cta: "Teknik dokümanı oku",               footer: "DigiDollar teknik dokümanı" },
	vi:    { title: "Sách trắng DigiDollar",      meta: "PDF · Th08 2026 · nền tảng kỹ thuật",              cta: "Đọc sách trắng",                    footer: "Sách trắng DigiDollar" },
	zh:    { title: "DigiDollar 白皮书",           meta: "PDF · 2026 年 8 月 · 技术基础",                     cta: "阅读白皮书",                          footer: "DigiDollar 白皮书" },
};

function keyMap(t) {
	return {
		"downloads.docs.digidollarWhitepaper.title": t.title,
		"downloads.docs.digidollarWhitepaper.meta": t.meta,
		"digidollar.cta.whitepaper": t.cta,
		"footer.resources.digidollarWhitepaper": t.footer,
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
