"""
The detect half of the no-ai-slop skill, run mechanically over the whole site.

    npm run build && npx next start -p 3111
    npm run check:slop [findings.json]

Scans what a reader actually sees rather than the source, so nothing hides in a
template and nothing in a code comment is counted as copy. Every hit is reported
with its sentence, because a count is not a finding: most of what this prints is
a false positive that has to be read and dismissed.

The skill lives at .claude/skills/no-ai-slop/ and is the authority on the rules.
docs/slop-audit.md records what the last run found, what was changed, and which
hits were kept and why. Rules with a shape precise enough to test have moved
into tests/house-style.test.ts; this is for the ones that need judgement.
"""
import html, json, re, sys, urllib.request
from collections import defaultdict

BASE = 'http://localhost:3111'

def fetch(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.read().decode('utf8')

urls = re.findall(r'<loc>([^<]+)</loc>', fetch('/sitemap.xml'))
paths = sorted({re.sub(r'^https?://[^/]+', '', u) or '/' for u in urls})

def visible(doc):
    m = re.search(r'<main[^>]*>(.*?)</main>', doc, re.S)
    body = m.group(1) if m else doc
    body = re.sub(r'<(script|style|svg)\b.*?</\1>', ' ', body, flags=re.S)
    # Keep block boundaries so two headings do not fuse into one sentence.
    body = re.sub(r'</(p|h1|h2|h3|h4|li|dd|dt|div|section|article|figcaption|blockquote|td|th)>', '   ', body)
    body = re.sub(r'<[^>]+>', ' ', body)
    text = html.unescape(body)
    return re.sub(r'[ \t\r\n]+', ' ', text)

def sentences(text):
    out = []
    for block in text.split(' '):
        block = block.strip()
        if not block:
            continue
        for s in re.split(r'(?<=[.!?])\s+(?=[A-Z(“"])', block):
            s = s.strip()
            if s:
                out.append(s)
    return out

WORDS = ['delve','foster','leverage','utilize','facilitate','empower','streamline','robust',
         'cutting-edge','paradigm shift','game changer','this is huge','this changes everything',
         'tapestry','realm','beacon','multifaceted','meticulous','intricate','paramount',
         'transformative','elevate','embark','supercharge','harness','ever-evolving']
ADVERBS = ['just','literally','honestly','simply','actually','truly','fundamentally',
           'importantly','crucially','inherently','inevitably']
PHRASES = ["it's worth noting","it is worth noting","it's important to note","it is important to note",
           'at the end of the day','when it comes to','at its core','in today','in the age of',
           'in the world of','the reality is','the truth is','in terms of','with regard to',
           'in order to','going forward','in this article',"let's dive in"]

RULES = [
    ('banned word',        re.compile(r'\b(' + '|'.join(re.escape(w) for w in WORDS) + r')\w*\b', re.I)),
    ('empty adverb',       re.compile(r'\b(' + '|'.join(ADVERBS) + r')\b', re.I)),
    ('empty phrase',       re.compile(r'(' + '|'.join(re.escape(p) for p in PHRASES) + r')', re.I)),
    ('binary contrast',    re.compile(r"\b(?:is|are|was|were|isn't|aren't|it's)\s+not\s+[^.;:]{2,60}?[,.]\s*(?:it|they|that)?\s*(?:is|are|'s)\b|\bnot\s+just\s+[^.;]{2,50}?\s+but\b|\bthe question is\s?n[o']t\b", re.I)),
    ('negative listing',   re.compile(r'\bNot\s+an?\s+[^.]{2,40}\.\s*Not\s+an?\s+', re.I)),
    ('throat-clearing',    re.compile(r"\b(here's the thing|here's what i mean|let me be clear|i'll be honest|the uncomfortable truth is|to be fair,)\b", re.I)),
    ('faux-insight',       re.compile(r'\b(most people (?:skip|get wrong|miss)|nobody tells you|everyone misses|what (?:most|nobody) )\b', re.I)),
    ('colon reveal',       re.compile(r'(?<![:/])(?<!\bcolon)\b([A-Za-z][\w\' -]{2,45}?):\s+[a-z]')),
    ('superficial -ing',   re.compile(r',\s+(highlighting|underscoring|reflecting|showcasing|demonstrating|signalling|signaling|illustrating|emphasising|emphasizing)\b', re.I)),
    ('importance puffery', re.compile(r'\b(stands? as a testament|pivotal|plays? a (?:vital|key|crucial) role|solidif\w+ its|underscores? (?:its|the) significance|significant\w*|critical\w*|essential\b|vital\b|key to)\b', re.I)),
    ('metadiscourse',      re.compile(r'\b(matters? more than it (?:sounds|looks)|the key point is|as you can see|this distinction matters|in other words|it is worth (?:remembering|repeating)|that is the point|which is the point|note that\b|worth (?:noting|stressing))\b', re.I)),
    ('weasel attribution', re.compile(r'\b(experts agree|industry reports suggest|many argue|widely (?:regarded|considered|seen)|studies show|research suggests|it is (?:widely |generally )?(?:accepted|believed|thought)|some argue|critics say)\b', re.I)),
    ('fake-strong verb',   re.compile(r'\b(serves? as|acts? as a|functions? as a|represents? an?|constitutes? an?|stands? as an?)\b', re.I)),
    ('dramatic fragment',  re.compile(r"(?:^|\.\s)(?:That's it\.|That is it\.|And that\b|And then\b)|\.\s+And\s+[a-z]", re.I)),
    ('rhetorical setup',   re.compile(r'\b(what if i told you|think about it|plot twist|consider this)\b', re.I)),
    ('summary recap',      re.compile(r'(?:^|\.\s+)(In conclusion|Ultimately|Overall|In summary|To sum up|All told|In short)\b')),
    ('em dash',            re.compile(r'—')),
]

pages = {}
for path in paths:
    pages[path] = sentences(visible(fetch(path)))

findings = defaultdict(list)
for path, sents in pages.items():
    for s in sents:
        for name, pattern in RULES:
            for m in pattern.finditer(s):
                findings[name].append((path, m.group(0).strip(), s))

total_sentences = sum(len(v) for v in pages.values())
print(f'{len(pages)} pages, {total_sentences} sentences scanned\n')
for name, _ in RULES:
    hits = findings[name]
    print(f'== {name}: {len(hits)}')
out = sys.argv[1] if len(sys.argv) > 1 else 'slop-findings.json'
json.dump({k: v for k, v in findings.items()}, open(out, 'w'), indent=1)
print(f'\nEvery hit, with its sentence, written to {out}.')
