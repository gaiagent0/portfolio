"""
Smart Router v2 — Demo 3 patch + pontos token számlálás
Változások:
  - HARD RULES: "röviden/brief/short/3 mondatban" → fast, complexity=low
  - expected_tokens < 120 → soha nem reasoning modell
  - max_tokens: 150 (volt 200), temperature: 0.0
  - stream_options: {include_usage: true} → pontos token szám
  - Routing döntési fa: Tool/FAQ/meta → qwen-flash
                        Blog/how-to    → qwen3-30b
                        Pillar/deep    → qwen3-235b
                        Code demo      → qwen3-coder-plus
                        Fordítás       → qwen-mt-turbo
"""

from openai import OpenAI
import json, time, os

API_KEY  = os.getenv("DASHSCOPE_API_KEY", "KULCS_IDE")
BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

# ── Modell térkép ─────────────────────────────────────────
MODELS = {
    # Routing döntési fa
    "tool_faq_meta":   "qwen-flash",                    # ~150 tok
    "blog_howto":      "qwen3-30b-a3b-instruct-2507",   # ~600 tok
    "pillar_deep":     "qwen3-235b-a22b-instruct-2507", # ~4k tok
    "code_demo":       "qwen3-coder-plus-2025-07-22",   # ~800 tok
    "translation":     "qwen-mt-turbo",                 # ~500 tok
    # Belső
    "classifier":      "qwen-flash",
}

# ── HARD RULES (override minden mást) ────────────────────
SHORT_KEYWORDS = [
    "röviden", "rövid", "3 mondatban", "2 mondatban", "egy mondatban",
    "briefly", "brief", "short answer", "in short", "tldr", "tl;dr",
    "kurz", "kurzum", "quick", "one sentence", "summary only"
]

def apply_hard_rules(user_input: str) -> dict | None:
    """Ha HARD RULE teljesül, override-olja a classifiert."""
    lower = user_input.lower()
    # Rövidség kulcsszó → fast
    if any(kw in lower for kw in SHORT_KEYWORDS):
        return {"category": "tool_faq_meta", "complexity": "low",
                "hard_rule": "short_keyword_detected"}
    # Nagyon rövid input (< 60 karakter) valószínűleg lookup
    if len(user_input.strip()) < 60:
        return {"category": "tool_faq_meta", "complexity": "low",
                "hard_rule": "short_input"}
    return None


# ── Classifier prompt (v2) ────────────────────────────────
CLASSIFIER_SYSTEM = """Te egy tartalom-routing asszisztens vagy egy portfólió/blog weboldalhoz.
A feladatod: JSON-t adni vissza a tartalom kategóriájáról.

CSAK JSON-t adj vissza, semmi más!

Routing döntési fa:
- tool_faq_meta  → Tool page, FAQ, meta description, batch fill (rövid, ~150 tok)
- blog_howto     → Blog post, how-to guide, comparison page (~600 tok)
- pillar_deep    → Pillar page, mély analízis, cornerstone content (~4000 tok)
- code_demo      → Code demo oldal, tech referencia, snippet (~800 tok)
- translation    → Bármilyen fordítási feladat (HU/EN/DE)

JSON struktúra:
{
  "category": "tool_faq_meta|blog_howto|pillar_deep|code_demo|translation",
  "complexity": "low|medium|high|extreme",
  "expected_tokens": <becsült output token szám, integer>,
  "target_lang": "hu|en|de|null",
  "summary": "egy sor magyarul",
  "why": "döntés indoka (1 mondat)"
}

FONTOS: ha expected_tokens < 120, category CSAK tool_faq_meta lehet!"""


def classify(user_input: str) -> dict:
    """Osztályoz — v2: hard rules + kisebb prompt + temperature=0."""
    
    # 1. Hard rules (ingyenes, 0 API hívás)
    override = apply_hard_rules(user_input)
    if override:
        override["classifier_tokens"] = 0
        override["classifier_time"]   = 0.0
        override["summary"]           = "Hard rule override"
        override["why"]               = override["hard_rule"]
        return override

    # 2. LLM classifier
    t0 = time.time()
    resp = client.chat.completions.create(
        model=MODELS["classifier"],
        messages=[
            {"role": "system", "content": CLASSIFIER_SYSTEM},
            {"role": "user",   "content": user_input[:1500]}  # max 1500 kar
        ],
        max_tokens=150,        # v2: volt 200
        temperature=0.0,       # v2: volt 0.1
    )
    elapsed = round(time.time() - t0, 2)
    
    raw = resp.choices[0].message.content.strip()
    if "```" in raw:
        raw = raw.split("```")[1].replace("json", "").strip()

    result = json.loads(raw)

    # Post-process: ha expected_tokens < 120 → downgrade
    if result.get("expected_tokens", 999) < 120:
        result["category"]   = "tool_faq_meta"
        result["complexity"] = "low"
        result["why"]        = result.get("why", "") + " [auto-downgrade: expected_tokens<120]"

    result["classifier_tokens"] = resp.usage.total_tokens
    result["classifier_time"]   = elapsed
    return result


def select_model(classification: dict) -> tuple[str, str]:
    """Modell kiválasztás a döntési fa alapján."""
    cat = classification["category"]
    model = MODELS.get(cat, MODELS["blog_howto"])
    descriptions = {
        "tool_faq_meta": "qwen-flash — gyors, ~150 tok",
        "blog_howto":    "qwen3-30b — blog/how-to, ~600 tok",
        "pillar_deep":   "qwen3-235b — mély elemzés, ~4k tok",
        "code_demo":     "qwen3-coder-plus — kód specialista",
        "translation":   "qwen-mt-turbo — 92 nyelv",
    }
    return model, descriptions.get(cat, "")


def execute(user_input: str, model: str, category: str,
            target_lang: str | None = None) -> dict:
    """Végrehajtás — v2: stream_options include_usage → pontos token szám."""

    system_map = {
        "tool_faq_meta": (
            "Te egy SEO szövegíró vagy. Tömör, konverziós szöveget írj."
            " Tartsd a megadott hosszt. Markdown OK."
        ),
        "blog_howto": (
            "Te egy tapasztalt tech blogger vagy. Strukturált, olvasható"
            " how-to cikket írj. H2/H3 fejlécek, kódblokkok ha kell."
        ),
        "pillar_deep": (
            "Te egy senior tartalom stratéga vagy. Átfogó, mély pillar"
            " page-et írj. Tartalomjegyzék, H2-H4 struktúra, belső"
            " linkelési javaslatok, FAQ szekció a végén."
        ),
        "code_demo": (
            "Te egy expert szoftvermérnök vagy. Tiszta, futtatható kódot"
            " írj kommentekkel. Jelöld a nyelvet. Add meg a futtatási"
            " utasítást és magyarázd el a kulcslépéseket."
        ),
        "translation": (
            f"Te egy profi fordító vagy. Fordíts a célnyelvre: {target_lang or 'EN'}."
            " Természetes, folyékony szöveg. Tartsd meg a markdown formázást."
        ),
    }
    system = system_map.get(category, "Te egy hasznos AI asszisztens vagy.")

    t0 = time.time()

    # v2: stream_options → pontos token számlálás streaming mellett
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user_input}
        ],
        max_tokens=4096,
        temperature=0.7,
        stream=True,
        stream_options={"include_usage": True},  # v2 újdonság
    )

    full_text = ""
    usage_tokens = 0
    print("\n" + "─" * 60)
    for chunk in resp:
        delta = chunk.choices[0].delta.content or ""
        print(delta, end="", flush=True)
        full_text += delta
        # Az utolsó chunk tartalmazza a usage-t
        if hasattr(chunk, "usage") and chunk.usage:
            usage_tokens = chunk.usage.total_tokens
    print("\n" + "─" * 60)

    return {
        "text":           full_text,
        "time":           round(time.time() - t0, 2),
        "tokens_exact":   usage_tokens,
    }


# ── Fő pipeline ───────────────────────────────────────────
_session_tokens = 0

def run(user_input: str) -> str:
    global _session_tokens
    print(f"\n{'='*60}")
    print(f"INPUT: {user_input[:80]}{'...' if len(user_input)>80 else ''}")
    print("="*60)

    # 1. Classify
    cl = classify(user_input)
    hard = " [HARD RULE]" if cl.get("hard_rule") else ""
    print(f"\n[1] Kategória:  {cl['category'].upper()}{hard}")
    print(f"    Komplexitás: {cl['complexity']}")
    print(f"    Összefoglalás: {cl.get('summary','')}")
    print(f"    Miért: {cl.get('why','')}")
    if cl["classifier_tokens"]:
        print(f"    Classifier: {cl['classifier_tokens']} tok / {cl['classifier_time']}s")

    # 2. Model select
    model, desc = select_model(cl)
    print(f"\n[2] Modell: {model}")
    print(f"    {desc}")

    # 3. Execute
    print(f"\n[3] Végrehajtás...")
    result = execute(user_input, model, cl["category"], cl.get("target_lang"))

    _session_tokens += cl["classifier_tokens"] + result["tokens_exact"]
    quota_pct = _session_tokens / 1_000_000 * 100

    print(f"\n{'='*60}")
    print(f"ÖSSZESÍTÉS")
    print(f"  Modell:      {model}")
    print(f"  Idő:         {result['time']}s")
    print(f"  Token:       {result['tokens_exact']} (pontos)")
    print(f"  Session:     {_session_tokens:,} / 1,000,000 ({quota_pct:.3f}%)")
    print(f"{'='*60}")
    return result["text"]


# ── Demo ──────────────────────────────────────────────────
if __name__ == "__main__":
    tests = [
        # tool_faq_meta (hard rule: röviden)
        "Mi a különbség a REST és GraphQL API között? Röviden.",

        # blog_howto
        "Írj egy how-to blog posztot: Hogyan állíts be Astro 5 projektet"
        " Cloudflare Pages-re CI/CD-vel? (500 szó, H2 fejlécekkel)",

        # code_demo
        "Készíts egy Astro komponenst amely megjeleníti a blog post"
        " kártyákat: kép, cím, dátum, olvasási idő, tag-ek. TypeScript.",

        # translation
        "Fordítsd le angolra: 'Üdvözlöm a portfóliómon! "
        "Szoftverfejlesztő vagyok, specializálódva AI integrációkra.'",
    ]

    for i, t in enumerate(tests, 1):
        print(f"\n{'#'*60}\n# TESZT {i}/{len(tests)}\n{'#'*60}")
        run(t)
        time.sleep(0.5)

    print(f"\nÖSSZES SESSION TOKEN: {_session_tokens:,}")
