#!/usr/bin/env node
/**
 * scripts/generate-content.mjs
 * Qwen → Astro MDX tartalom pipeline
 *
 * Használat:
 *   node scripts/generate-content.mjs --type blog_howto --topic "Astro 5 telepítése"
 *   node scripts/generate-content.mjs --type translation --file src/content/blog/my-post.mdx --lang DE
 *   node scripts/generate-content.mjs --batch topics.json
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { parseArgs } from "node:util";

const API_KEY  = process.env.DASHSCOPE_API_KEY;
const BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

if (!API_KEY) {
  console.error("Hiányzó DASHSCOPE_API_KEY környezeti változó!");
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

// ── Modell térkép (routing döntési fa) ───────────────────
const MODELS = {
  tool_faq_meta: "qwen-flash",
  blog_howto:    "qwen3-30b-a3b-instruct-2507",
  pillar_deep:   "qwen3-235b-a22b-instruct-2507",
  code_demo:     "qwen3-coder-plus-2025-07-22",
  translation:   "qwen-mt-turbo",
};

const MAX_TOKENS = {
  tool_faq_meta: 300,
  blog_howto:    1200,
  pillar_deep:   4000,
  code_demo:     2000,
  translation:   2000,
};

// ── Classifier (qwen-flash, ~100 tok) ────────────────────
async function classify(topic) {
  // Hard rules – 0 API hívás
  const lower = topic.toLowerCase();
  const shortKws = ["röviden","brief","short","3 mondatban","tldr","tl;dr","quick"];
  if (shortKws.some(k => lower.includes(k)) || topic.length < 60) {
    return { category: "tool_faq_meta", complexity: "low", hard_rule: true };
  }

  const resp = await client.chat.completions.create({
    model: "qwen-flash",
    messages: [
      { role: "system", content:
        `Kategorizáld a tartalomkérést. Csak JSON:
{"category":"tool_faq_meta|blog_howto|pillar_deep|code_demo|translation","complexity":"low|medium|high|extreme"}` },
      { role: "user", content: topic.slice(0, 500) }
    ],
    max_tokens: 60,
    temperature: 0.0,
  });

  const raw = resp.choices[0].message.content.trim().replace(/```json?|```/g, "");
  return JSON.parse(raw);
}

// ── Tartalom generálás ────────────────────────────────────
async function generateContent(topic, type, lang = "HU") {
  const systemPrompts = {
    tool_faq_meta: "Írj tömör, SEO-optimalizált szöveget. Max 200 szó. Markdown.",
    blog_howto:    `Írj strukturált how-to blog posztot magyarul.
Frontmatter NÉLKÜL, csak a tartalmat.
Struktúra: rövid bevezetés → H2-es lépések → összefoglalás.
Kb. 600-800 szó.`,
    pillar_deep:   `Írj átfogó pillar page-et magyarul.
Frontmatter NÉLKÜL.
Struktúra: TL;DR → tartalomjegyzék → H2-H4 szekciók → FAQ (3-5 kérdés) → összefoglalás.
Kb. 2000-3000 szó.`,
    code_demo:     `Írj tech reference cikket kódpéldákkal.
Frontmatter NÉLKÜL.
Mindig jelöld a kód nyelvét. Add meg a futtatási utasítást.
Kb. 800-1200 szó.`,
    translation:   `Fordítsd le a következő szöveget erre a nyelvre: ${lang}.
Természetes, folyékony fordítás. Tartsd meg a markdown formázást.`,
  };

  const model    = MODELS[type];
  const maxToks  = MAX_TOKENS[type];
  const system   = systemPrompts[type];

  console.log(`  Modell: ${model} (max ${maxToks} tok)`);

  let fullText = "";
  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user",   content: topic },
    ],
    max_tokens: maxToks,
    temperature: 0.7,
    stream: true,
    stream_options: { include_usage: true },
  });

  let totalTokens = 0;
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(delta);
    fullText += delta;
    if (chunk.usage) totalTokens = chunk.usage.total_tokens;
  }
  console.log("\n");

  return { text: fullText, tokens: totalTokens, model };
}

// ── MDX frontmatter generálás ─────────────────────────────
async function generateFrontmatter(topic, content, model) {
  const resp = await client.chat.completions.create({
    model: "qwen-flash",
    messages: [
      { role: "system", content:
        `Generálj Astro MDX frontmattert. Csak YAML, --- nélkül:
title: "..."
description: "..." (max 155 karakter, SEO)
pubDate: "${new Date().toISOString().split("T")[0]}"
tags: [...]
readingTime: <szám, percek>
aiGenerated: true
aiModel: "${model}"
aiReviewed: false` },
      { role: "user", content: `Téma: ${topic}\n\nTartalom első 300 karaktere:\n${content.slice(0, 300)}` }
    ],
    max_tokens: 200,
    temperature: 0.0,
  });
  return resp.choices[0].message.content.trim().replace(/```yaml?|```/g, "");
}

// ── Slug generálás ────────────────────────────────────────
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[áàä]/g, "a").replace(/[éè]/g, "e")
    .replace(/[íì]/g, "i").replace(/[óöő]/g, "o")
    .replace(/[úüű]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Fő pipeline ───────────────────────────────────────────
async function run(topic, forcedType = null, lang = "HU") {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`GENERÁLÁS: ${topic.slice(0, 70)}`);
  console.log("=".repeat(60));

  // 1. Classify
  const cl   = forcedType ? { category: forcedType } : await classify(topic);
  const type = cl.category;
  console.log(`\n[1] Típus: ${type.toUpperCase()}${cl.hard_rule ? " [HARD RULE]" : ""}`);

  // 2. Generate
  console.log(`\n[2] Tartalom generálása...`);
  const { text, tokens, model } = await generateContent(topic, type, lang);

  // 3. Frontmatter
  console.log(`\n[3] Frontmatter generálása...`);
  const fm = await generateFrontmatter(topic, text, model);
  const slug = toSlug(fm.match(/title: "([^"]+)"/)?.[1] || topic);

  // 4. MDX fájl írás
  const mdxContent = `---\n${fm}\n---\n\n${text}`;
  const outDir  = path.resolve("src/content/blog");
  const outFile = path.join(outDir, `${slug}.mdx`);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, mdxContent, "utf8");

  console.log(`\n[4] Mentve: ${outFile}`);
  console.log(`    Token: ${tokens} | Modell: ${model}`);
  console.log("=".repeat(60));

  return { slug, tokens, model };
}

// ── CLI ───────────────────────────────────────────────────
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    type:  { type: "string" },
    topic: { type: "string" },
    lang:  { type: "string", default: "HU" },
    batch: { type: "string" },
  },
  allowPositionals: true,
});

if (values.batch) {
  // Batch mód: JSON fájlból
  // Format: [{"topic": "...", "type": "...", "lang": "..."}]
  const items = JSON.parse(fs.readFileSync(values.batch, "utf8"));
  let totalTokens = 0;
  for (const item of items) {
    const result = await run(item.topic, item.type || null, item.lang || "HU");
    totalTokens += result.tokens;
    await new Promise(r => setTimeout(r, 1000)); // rate limit
  }
  console.log(`\nBATCH KÉSZ. Összes token: ${totalTokens.toLocaleString()}`);
} else if (values.topic) {
  await run(values.topic, values.type || null, values.lang);
} else {
  console.log(`
Használat:
  node scripts/generate-content.mjs --topic "Astro 5 telepítése Cloudflare Pages-re"
  node scripts/generate-content.mjs --type blog_howto --topic "Python type hints"
  node scripts/generate-content.mjs --type translation --topic "$(cat post.md)" --lang DE
  node scripts/generate-content.mjs --batch topics.json

Típusok: tool_faq_meta | blog_howto | pillar_deep | code_demo | translation
  `);
}
