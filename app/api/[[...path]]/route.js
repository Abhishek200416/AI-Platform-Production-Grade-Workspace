import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
let SETTINGS_CACHE = { enabledModels: ['gemini-2.0-flash'] }

const prisma = new PrismaClient()

function cors(res) {
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Timezone')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    return res
}

export async function OPTIONS() {
    return cors(new NextResponse(null, { status: 200 }))
}

async function callGeminiAPI(msgs, opts = {}) {
    const body = {
        contents: msgs.map(m => ({
            parts: [{ text: m.content }],
            role: m.role === 'assistant' ? 'model' : 'user'
        })),
        generationConfig: {
            temperature: opts.temperature ?? 0.7,
            maxOutputTokens: opts.maxTokens ?? 1000,
            candidateCount: 1
        }
    }
    for (let i = 0; i < 3; i++) {
        try {
            const r = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': process.env.GEMINI_API_KEY
                },
                body: JSON.stringify(body)
            })
            if (!r.ok) {
                const t = await r.text()
                if ((r.status === 503 || /unavailable|overload/i.test(t)) && i < 2) {
                    await new Promise(d => setTimeout(d, 600 * (i + 1)))
                    continue
                }
                throw new Error(t)
            }
            const data = await r.json()
            const part = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (!part) throw new Error('Invalid Gemini response')
            return { content: part, usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } }
        } catch (e) {
            if (i === 2) throw e
            await new Promise(d => setTimeout(d, 600 * (i + 1)))
        }
    }
}

function normalizeTypos(t) {
    return t
        .replace(/\bablout\b/gi, 'about')
        .replace(/\babput\b/gi, 'about')
        .replace(/\babotu\b/gi, 'about')
}

function extractNewsQuery(text) {
    const f = normalizeTypos(text)
    const m1 = f.match(/latest news(?: about| on)?\s+([^?.!,\n]+)/i)
    if (m1) return m1[1].trim()
    const m2 = f.match(/latest news about (him|her|them)/i)
    if (m2) {
        const m3 = f.match(/who is ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
        if (m3) return m3[1]
    }
    return null
}

const RT_DISCLAIMER = /real[- ]time|I\s+(?:do not|don't)\s+(?:have|get|possess).{0,40}access/i

async function ensureNoRealtimeDisclaimer(content, ctx, msgs, temp, maxT) {
    if (!ctx) return content
    if (RT_DISCLAIMER.test(content)) {
        const fix = [
            { role: 'user', content: 'Rewrite the answer below using the live data provided. Do NOT mention real-time limitations.' },
            ...msgs,
            { role: 'user', content: ctx }
        ]
        const retry = await callGeminiAPI(fix, { temperature: temp, maxTokens: maxT })
        return retry.content
    }
    return content
}

async function buildRealtimeContext(text, tz) {
    const tasks = []
    if (/current time|time now/i.test(text)) tasks.push({ type: 'time' })
    if (/today|date\b/i.test(text)) tasks.push({ type: 'date' })
    if (/^\s*(who|what|where|when|how)\b/i.test(text) && text.length < 60) tasks.push({ type: 'search', query: text.trim() })
    const nq = extractNewsQuery(text)
    if (nq !== null) tasks.push({ type: 'news', query: nq })
    if (/latest news\b/i.test(text) && nq === null) tasks.push({ type: 'news', query: '' })
    text.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
        if (/^\/search\s+/i.test(line)) tasks.push({ type: 'search', query: line.slice(8).trim() })
        if (/^\/news\b/i.test(line)) tasks.push({ type: 'news', query: line.replace(/^\/news\s*/i, '').trim() })
        if (/^\/finance\s+/i.test(line)) tasks.push({ type: 'finance', symbol: line.slice(9).trim().toUpperCase() })
    })
    const mShare = text.match(/\b([A-Z]{3,10}|nifty)\b.*\b(price|share|stock)/i)
    if (mShare) tasks.push({ type: 'finance', symbol: mShare[1].toUpperCase() })
    if (!tasks.length) return ''
    let ctx = ''
    for (const t of tasks) {
        if (t.type === 'time') {
            const now = new Date().toLocaleString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true, timeZone: tz, timeZoneName: 'short'
            })
            ctx += `Current time: ${now}\n\n`
        }
        if (t.type === 'date') {
            const today = new Date().toLocaleDateString('en-CA', { timeZone: tz })
            ctx += `Current date: ${today}\n\n`
        }
        if (t.type === 'search' && t.query) {
            try {
                const r = await fetch(`${process.env.SEARX_URL}/search?q=${encodeURIComponent(t.query)}&format=json&language=en`)
                if (r.ok) {
                    const { results = [] } = await r.json()
                    ctx += `Web search for "${t.query}":\n`
                    ctx += results.slice(0, 5).map(r => `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content}`).join('\n\n') + '\n\n'
                }
            } catch { }
        }
        if (t.type === 'news') {
            try {
                const endpoint = t.query
                    ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(t.query)}&pageSize=5&sortBy=publishedAt&apiKey=${process.env.NEWSAPI_KEY}`
                    : `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`
                const r = await fetch(endpoint)
                if (r.ok) {
                    const { articles = [] } = await r.json()
                    ctx += `News ${t.query ? `about "${t.query}"` : 'headlines'}:\n`
                    ctx += articles.slice(0, 5).map(a =>
                        `Title: ${a.title}\nSource: ${a.source?.name}\nPublished: ${a.publishedAt}\nDesc: ${a.description}`
                    ).join('\n\n') + '\n\n'
                }
            } catch { }
        }
        if (t.type === 'finance') {
            try {
                const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${t.symbol}&token=${process.env.FINNHUB_KEY}`)
                if (r.ok) {
                    const q = await r.json()
                    ctx += `Live price ${t.symbol}: ₹${q.c} (open ₹${q.o}, high ₹${q.h})\n\n`
                }
            } catch { }
        }
    }
    return ctx
}

export async function handleRoute(req, { params }) {
    const seg = params.path || []
    const path = '/' + seg.join('/')
    const method = req.method
    const tz = req.headers.get('x-timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
    // ✅ /settings handlers belong INSIDE the function
    // ✅ GET /settings
    if (path === '/settings' && method === 'GET') {
        return cors(new NextResponse(JSON.stringify(SETTINGS_CACHE), { status: 200 }))
    }

    // ✅ POST /settings  <-- add this INSIDE the function
    if (path === '/settings' && method === 'POST') {
        const body = await req.json()
        SETTINGS_CACHE = { ...SETTINGS_CACHE, ...body }
        return cors(new NextResponse(JSON.stringify(SETTINGS_CACHE), { status: 200 }))
    }

    // ✅ PUT/PATCH /settings
    if (path === '/settings' && (method === 'PUT' || method === 'PATCH')) {
        const body = await req.json()
        SETTINGS_CACHE = { ...SETTINGS_CACHE, ...body }
        return cors(new NextResponse(JSON.stringify(SETTINGS_CACHE), { status: 200 }))
    }
    if (path === '/' && method === 'GET')
        return cors(new NextResponse(JSON.stringify({ message: 'AI Platform API Ready' }), { status: 200 }))

    if (path === '/chat/completions' && method === 'POST') {
        const { sessionId, messages, model, temperature, max_tokens } = await req.json()
        if (!Array.isArray(messages))
            return cors(new NextResponse(JSON.stringify({ error: 'Messages array required' }), { status: 400 }))

        const lastUser = [...messages].reverse().find(m => m.role === 'user')
        const live = lastUser ? await buildRealtimeContext(lastUser.content, tz) : ''
        const augmented = live
            ? [{ role: 'user', content: 'Live data appended. Use if relevant.' }, ...messages, { role: 'user', content: live }]
            : messages

        let ai = await callGeminiAPI(augmented, { temperature, maxTokens: max_tokens })
        ai.content = await ensureNoRealtimeDisclaimer(ai.content, live, messages, temperature, max_tokens)

        const combined = [...messages, { role: 'assistant', content: ai.content }]
        let chatId = sessionId

        if (chatId) {
            await prisma.chatSession.update({
                where: { id: chatId },
                data: { messages: JSON.stringify(combined), timestamp: new Date() }
            })
        } else {
            const rec = await prisma.chatSession.create({
                data: {
                    id: uuidv4(),
                    title: messages.find(m => m.role === 'user')?.content.slice(0, 50) || 'New Chat',
                    messages: JSON.stringify(combined),
                    model: model || 'gemini-2.0-flash',
                    usage: JSON.stringify(ai.usage)
                }
            })
            chatId = rec.id
        }

        return cors(new NextResponse(JSON.stringify({
            id: chatId,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: model || 'gemini-2.0-flash',
            choices: [{ index: 0, message: { role: 'assistant', content: ai.content }, finish_reason: 'stop' }],
            usage: ai.usage
        }), { status: 200 }))
    }
    // ✅ GET /system/usage
    if (path === '/system/usage' && method === 'GET') {
        const totalChats = await prisma.chatSession.count()

        const sessions = await prisma.chatSession.findMany({ select: { usage: true } })
        let totalTokens = 0
        for (const s of sessions) {
            try {
                const u = s.usage ? JSON.parse(s.usage) : null
                if (u) {
                    totalTokens += Number(
                        u.total_tokens ?? ((u.prompt_tokens || 0) + (u.completion_tokens || 0))
                    )
                }
            } catch { }
        }

        const COST_PER_1K_TOKENS = Number(process.env.COST_PER_1K_TOKENS || '0')
        const estimatedCost = Number(((totalTokens / 1000) * COST_PER_1K_TOKENS).toFixed(4))

        return cors(new NextResponse(JSON.stringify({
            totalChats,
            totalTokens,
            estimatedCost,
            lastUpdated: new Date().toISOString()
        }), { status: 200 }))
    }


    if (path === '/chat/sessions' && method === 'GET') {
        const list = await prisma.chatSession.findMany({ orderBy: { timestamp: 'desc' }, take: 100 })
        return cors(new NextResponse(JSON.stringify(list.map(s => ({
            id: s.id,
            title: s.title,
            model: s.model,
            timestamp: s.timestamp,
            messages: JSON.parse(s.messages),
            usage: s.usage ? JSON.parse(s.usage) : undefined
        }))), { status: 200 }))
    }
    if (seg[0] === 'chat' && seg[1] === 'sessions' && seg[2]) {
        const id = seg[2]

        if (method === 'PATCH') {
            const { title } = await req.json()
            await prisma.chatSession.update({
                where: { id },
                data: { title: title?.slice(0, 100) || 'Untitled Chat' }
            })
            const list = await prisma.chatSession.findMany({ orderBy: { timestamp: 'desc' }, take: 100 })
            return cors(new NextResponse(JSON.stringify(list.map(s => ({
                id: s.id,
                title: s.title,
                model: s.model,
                timestamp: s.timestamp,
                messages: JSON.parse(s.messages),
                usage: s.usage ? JSON.parse(s.usage) : undefined
            }))), { status: 200 }))
        }

        if (method === 'DELETE') {
            await prisma.chatSession.delete({ where: { id } })
            const list = await prisma.chatSession.findMany({ orderBy: { timestamp: 'desc' }, take: 100 })
            return cors(new NextResponse(JSON.stringify(list.map(s => ({
                id: s.id,
                title: s.title,
                model: s.model,
                timestamp: s.timestamp,
                messages: JSON.parse(s.messages),
                usage: s.usage ? JSON.parse(s.usage) : undefined
            }))), { status: 200 }))
        }
    }


    if (path === '/search/web' && method === 'GET') {
        const u = new URL(req.url)
        const q = u.searchParams.get('q') || ''
        const lang = u.searchParams.get('lang') || 'en'
        const r = await fetch(`${process.env.SEARX_URL}/search?q=${encodeURIComponent(q)}&format=json&language=${lang}`)
        if (!r.ok) throw new Error('SearxNG error')
        const { results = [] } = await r.json()
        return cors(new NextResponse(JSON.stringify(results.map(r => ({
            title: r.title,
            link: r.url,
            snippet: r.content
        }))), { status: 200 }))
    }
    // ---- helpers (JS-only) ----
    function normalizeBrand(q = '') {
        const s = q.trim().toLowerCase()

        // plain JS object, no Record<> types
        const table = {
            'open ai': ['openai', 'open ai', 'open-ai'],
            'openai': ['openai', 'open ai', 'open-ai'],
            'google': ['google', 'alphabet'],
            'anthropic': ['anthropic'],
            'gemini': ['gemini', 'google gemini'],
            'claude': ['claude', 'anthropic claude'],
            'xai': ['xai'],
            'meta': ['meta', 'facebook'],
            'nvidia': ['nvidia'],
            'microsoft': ['microsoft']
        }

        const aliases = table[s] || [s]
        const primary = aliases[0]

        // Strict regex: allow spaces or hyphens as variants, enforce word boundaries
        const alt = aliases
            .map(a => a.replace(/\s+|-+/g, '\\s*-?\\s*'))
            .map(a => `\\b${a}\\b`)
            .join('|')
        const strictRegex = new RegExp(alt, 'i')

        return { primary, aliases, strictRegex }
    }

    function inferCategoryFromTitle(title = '') {
        const t = title.toLowerCase()
        if (/(openai|claude|gemini|llama|artificial intelligence|\bai\b)/.test(t)) return 'ai'
        if (/(quantum|physics|research|study)/.test(t)) return 'science'
        if (/(startup|funding|acquire|merger|revenue|ipo)/.test(t)) return 'business'
        if (/(health|medical|vaccine|diagnosis)/.test(t)) return 'health'
        if (/(tech|software|hardware|chip|semiconductor)/.test(t)) return 'technology'
        return 'all'
    }

    // ---- inside handleRoute() ----
    if (path === '/news/search' && method === 'GET') {
        const u = new URL(req.url)
        const raw = (u.searchParams.get('q') || '').trim()
        const lang = u.searchParams.get('lang') || 'en'

        if (raw.length < 2) {
            return cors(new NextResponse(JSON.stringify([]), { status: 200 }))
        }

        const { primary, aliases, strictRegex } = normalizeBrand(raw)

        const from = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
        const phrase = (s) => (/\s/.test(s) ? `"${s}"` : s)

        const qExpr = aliases.length > 1
            ? `(${aliases.map(phrase).join(' OR ')})`
            : phrase(primary)

        const params = new URLSearchParams({
            q: qExpr,
            language: lang,
            searchIn: 'title,description',
            from,
            sortBy: 'relevancy',
            pageSize: '10',
            apiKey: process.env.NEWSAPI_KEY || ''
        })
        params.append('qInTitle', primary)

        try {
            const r = await fetch(`https://newsapi.org/v2/everything?${params.toString()}`, { cache: 'no-store' })
            if (!r.ok) {
                const text = await r.text()
                return cors(new NextResponse(JSON.stringify({ error: 'NewsAPI error', details: text }), { status: r.status }))
            }

            const { articles = [] } = await r.json()

            // JS-only: remove (a: any)
            const filtered = articles.filter((a) => {
                const blob = `${a.title || ''} ${a.description || ''} ${a.content || ''}`.toLowerCase()
                return strictRegex.test(blob)
            })

            const mapped = filtered.map((a) => ({
                id: uuidv4(),
                title: a.title,
                summary: a.description,
                content: a.content || a.description || '',
                publishedAt: a.publishedAt,
                source: (a.source && a.source.name) ? a.source.name : 'Unknown',
                category: inferCategoryFromTitle(a.title || ''),
                url: a.url,
                imageUrl: a.urlToImage || null,
                author: a.author || ''
            }))

            return cors(new NextResponse(JSON.stringify(mapped), { status: 200 }))
        } catch (e) {
            return cors(new NextResponse(JSON.stringify({ error: 'Search failed', details: String(e) }), { status: 500 }))
        }
    }



    if (path === '/news/latest' && method === 'GET') {
        const u = new URL(req.url)
        const lang = u.searchParams.get('lang') || 'en'
        const r = await fetch(`https://newsapi.org/v2/top-headlines?language=${lang}&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`)

        if (!r.ok) throw new Error('NewsAPI error')
        const { articles = [] } = await r.json()

        const mapped = articles.map(a => ({
            id: uuidv4(),
            title: a.title,
            summary: a.description,
            content: a.content || a.description || '',
            publishedAt: a.publishedAt,
            source: a.source?.name || 'Unknown',
            category: inferCategoryFromTitle(a.title),
            url: a.url,
            imageUrl: a.urlToImage || null,
            author: a.author || ''
        }))

        return cors(new NextResponse(JSON.stringify(mapped), { status: 200 }))
    }

    // ========= /api/companies/search (JS – no TS, no funding) =========
    if (path === '/companies/search' && method === 'GET') {
        const u = new URL(req.url)
        const q = (u.searchParams.get('q') || '').trim()

        // 1) Require at least 2 chars; otherwise empty list
        if (q.length < 2) {
            return cors(new NextResponse(JSON.stringify([]), { status: 200 }))
        }

        // ---- helpers (local to route for clarity) ----
        function toTitleCase(s = '') {
            return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
        }
        function companyAliases(name = '') {
            const s = name.trim().toLowerCase()
            const table = {
                'google': ['google', 'alphabet inc', 'alphabet'],
                'alphabet': ['alphabet inc', 'alphabet', 'google'],
                'openai': ['openai', 'open ai', 'open-ai'],
                'microsoft': ['microsoft', 'msft'],
                'meta': ['meta', 'facebook', 'meta platforms'],
                'xai': ['xai'],
                'anthropic': ['anthropic', 'claude'],
                'nvidia': ['nvidia', 'nvda'],
                'tesla': ['tesla', 'tsla']
            }
            return table[s] || [s]
        }
        function normalizeName(s = '') {
            return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
        }
        function nameLooksLikeQuery(label = '', q = '', aliases = []) {
            const L = normalizeName(label)
            const Q = normalizeName(q)
            if (!L || !Q) return false
            if (L === Q || L.includes(Q) || Q.includes(L)) return true
            return aliases.some(a => normalizeName(a) === L)
        }
        async function wikidataSearchItem(q) {
            try {
                const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&format=json&type=item&limit=10&origin=*`
                const r = await fetch(url, { cache: 'no-store' })
                if (!r.ok) return null
                const j = await r.json()
                if (!j || !Array.isArray(j.search) || !j.search.length) return null
                const ranked = [...j.search].sort((a, b) => {
                    const aw = /company|technology|software|artificial|intelligence|organization/i.test(a.description || '') ? 0 : 1
                    const bw = /company|technology|software|artificial|intelligence|organization/i.test(b.description || '') ? 0 : 1
                    return aw - bw
                })
                return ranked[0]
            } catch { return null }
        }
        async function wikidataGetEntity(qid) {
            try {
                const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`
                const r = await fetch(url, { cache: 'no-store' })
                if (!r.ok) return null
                const j = await r.json()
                return j && j.entities && j.entities[qid] ? j.entities[qid] : null
            } catch { return null }
        }
        function isCompanyEntity(entity) {
            // P31 instance of -> accept common company/org types
            const ACCEPT = new Set(['Q783794', 'Q43229', 'Q4830453', 'Q167037', 'Q891723', 'Q79913', 'Q724945', 'Q6881511'])
            const claims = entity?.claims?.P31 || []
            return claims.some(s => {
                const id = s?.mainsnak?.datavalue?.value?.id
                return id && ACCEPT.has(id)
            })
        }
        function parseWikidataTime(wbt) {
            if (!wbt || typeof wbt !== 'string') return ''
            const m = wbt.match(/\+?(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/)
            if (!m) return ''
            const [_, y, mo, d] = m
            if (y && mo && d) return `${y}-${mo}-${d}`
            if (y && mo) return `${y}-${mo}`
            return y || ''
        }
        function labelValue(entity, pid) {
            const c = entity?.claims?.[pid]?.[0]?.mainsnak?.datavalue
            if (!c) return ''
            const v = c.value
            if (typeof v === 'string') return v
            if (typeof v === 'object' && v.id) return v.id
            return ''
        }
        async function resolveQidLabels(qids = []) {
            if (!qids.length) return {}
            try {
                const ids = Array.from(new Set(qids)).join('|')
                const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=labels&languages=en&format=json&origin=*`
                const r = await fetch(url, { cache: 'no-store' })
                if (!r.ok) return {}
                const j = await r.json()
                const out = {}
                Object.keys(j.entities || {}).forEach(id => {
                    out[id] = j.entities[id]?.labels?.en?.value || id
                })
                return out
            } catch { return {} }
        }
        async function wikipediaSummaryFromTitle(title) {
            try {
                const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
                const r = await fetch(url, { cache: 'no-store' })
                if (!r.ok) return null
                const j = await r.json()
                if (!j || j.type === 'disambiguation') return null
                return j
            } catch { return null }
        }
        async function wikipediaSummaryForEntity(entity) {
            const enTitle = entity?.sitelinks?.enwiki?.title
            if (enTitle) return await wikipediaSummaryFromTitle(enTitle)
            const label = entity?.labels?.en?.value
            if (label) return await wikipediaSummaryFromTitle(label)
            return null
        }
        function safeCompanySkeleton(name = '') {
            return {
                id: uuidv4(),
                name,
                industry: 'Technology',
                description: '',
                employees: 'Unknown',
                founded: '',
                headquarters: 'Unknown',
                website: '',
                logo: null,
                ticker: '',
                valuation: 0,          // public: market cap; private: inferred valuation
                tags: [],
                lastUpdated: new Date().toISOString()
            }
        }
        function formatNumber(n) {
            if (!n || isNaN(n)) return ''
            return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }
        function pickLatestEmployees(claims) {
            const list = (claims?.P1128 || []).map(s => {
                const val = s?.mainsnak?.datavalue?.value?.amount || s?.mainsnak?.datavalue?.value
                const raw = typeof val === 'string' && val.startsWith('+') ? val.slice(1) : val
                const num = raw ? Number(raw) : NaN
                const time = (s?.qualifiers?.P585?.[0]?.datavalue?.value?.time) || ''
                return { num: isNaN(num) ? null : num, date: parseWikidataTime(time) }
            }).filter(x => x.num !== null)
            if (!list.length) return ''
            list.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
            return `${formatNumber(list[0].num)}${list[0].date ? ` (as of ${list[0].date})` : ''}`
        }
        function extractTicker(claims) {
            const t = claims?.P249?.[0]?.mainsnak?.datavalue?.value
            return typeof t === 'string' ? t : ''
        }

        // Real-time market cap from Yahoo (no API key)
        async function yahooMarketCap(ticker) {
            if (!ticker) return 0
            try {
                const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`
                const r = await fetch(url, { cache: 'no-store' })
                if (!r.ok) return 0
                const j = await r.json()
                const cap = j?.quoteResponse?.result?.[0]?.marketCap
                return typeof cap === 'number' ? cap : 0
            } catch { return 0 }
        }

        // Dollar text parser
        function parseDollarsFromText(text = '') {
            const m = [...text.matchAll(/\$?\s?([\d,.]+)\s*(b|bn|billion|m|million)/gi)]
            if (!m.length) return 0
            const toNum = (val, unit) => {
                const n = Number(val.replace(/,/g, ''))
                if (!n) return 0
                if (/^b|bn|billion$/i.test(unit)) return Math.round(n * 1e9)
                if (/^m|million$/i.test(unit)) return Math.round(n * 1e6)
                return n
            }
            return m.reduce((max, g) => Math.max(max, toNum(g[1], g[2])), 0)
        }

        // Private-company valuation only (no funding)
        async function newsapiValuationOnly(name, aliases) {
            try {
                if (!process.env.NEWSAPI_KEY) return 0
                const qExpr = aliases.map(s => (/\s/.test(s) ? `"${s}"` : s)).join(' OR ')
                const params = new URLSearchParams({
                    q: qExpr,
                    language: 'en',
                    searchIn: 'title,description',
                    from: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
                    sortBy: 'publishedAt',
                    pageSize: '10',
                    apiKey: process.env.NEWSAPI_KEY || ''
                })
                const url = `https://newsapi.org/v2/everything?${params.toString()}`
                const r = await fetch(url, { cache: 'no-store' })
                if (!r.ok) return 0
                const j = await r.json()
                const articles = j.articles || []
                if (!articles.length) return 0
                const blob = articles.map(a => `${a.title} ${a.description}`).join('  ')

                // Prefer numbers near "valuation"/"valued"/"worth"
                const ctxMatches = [...blob.matchAll(
                    /(?:valu(?:ed|ation)|worth)[^$]{0,50}\$?\s?([\d,.]+)\s*(b|bn|billion|m|million)/gi
                )]
                if (ctxMatches.length) {
                    const candidates = ctxMatches.map(m => parseDollarsFromText(m[0]))
                    return candidates.reduce((a, b) => Math.max(a, b), 0)
                }
                // Fallback: largest $ figure (may be noisy, but avoids funding output)
                return parseDollarsFromText(blob)
            } catch { return 0 }
        }

        // 2) Resolve via Wikidata using aliases
        const aliases = companyAliases(q)
        let item = null
        for (const a of aliases) {
            item = await wikidataSearchItem(a)
            if (item) break
            item = await wikidataSearchItem(toTitleCase(a))
            if (item) break
        }
        if (!item) {
            // No entity -> no results (prevents fake cards)
            return cors(new NextResponse(JSON.stringify([]), { status: 200 }))
        }

        // 3) Pull full entity and validate
        const entity = await wikidataGetEntity(item.id)
        const label = entity?.labels?.en?.value || item.label || ''
        if (!label) {
            return cors(new NextResponse(JSON.stringify([]), { status: 200 }))
        }
        if (!isCompanyEntity(entity) || !nameLooksLikeQuery(label, q, aliases)) {
            // Hard gate: if it’s not clearly the same company, show nothing
            return cors(new NextResponse(JSON.stringify([]), { status: 200 }))
        }

        // 4) Build company object from trustworthy sources
        const company = safeCompanySkeleton(label)
        const claims = entity?.claims || {}

        // Wikipedia summary & logo
        const wiki = await wikipediaSummaryForEntity(entity)
        if (wiki?.extract) company.description = wiki.extract
        if (wiki?.thumbnail?.source) company.logo = wiki.thumbnail.source

        // Official site (P856) preferred; otherwise Wikipedia page
        const site = claims?.P856?.[0]?.mainsnak?.datavalue?.value
        if (site && /^https?:\/\//i.test(site)) {
            company.website = site
        } else if (wiki?.content_urls?.desktop?.page) {
            company.website = wiki.content_urls.desktop.page
        }

        // Founded (P571)
        const inception = claims?.P571?.[0]?.mainsnak?.datavalue?.value?.time
        if (inception) company.founded = parseWikidataTime(inception)

        // Employees (P1128, pick latest)
        const emp = pickLatestEmployees(claims)
        if (emp) company.employees = emp

        // Industry (P452), HQ (P159), Country (P17)
        const industryQ = labelValue(entity, 'P452')
        const hqQ = labelValue(entity, 'P159')
        const countryQ = labelValue(entity, 'P17')
        const labelMap = await resolveQidLabels([industryQ, hqQ, countryQ].filter(Boolean))
        if (labelMap[industryQ]) company.industry = labelMap[industryQ]
        if (labelMap[hqQ] && labelMap[countryQ]) {
            company.headquarters = `${labelMap[hqQ]}, ${labelMap[countryQ]}`
        } else if (labelMap[hqQ]) {
            company.headquarters = labelMap[hqQ]
        } else if (labelMap[countryQ]) {
            company.headquarters = labelMap[countryQ]
        }

        // Public ticker (P249) → live market cap
        company.ticker = (extractTicker(claims) || '').trim()
        if (company.ticker) {
            const cap = await yahooMarketCap(company.ticker)
            if (cap) company.valuation = cap
        }

        // Private valuation (no funding at all)
        if (!company.valuation) {
            const val = await newsapiValuationOnly(company.name, aliases)
            if (val) company.valuation = val
        }

        // Lightweight tags from description/aliases
        const tags = new Set()
        const t = (`${wiki?.extract || ''} ${wiki?.description || ''}`).toLowerCase()
        aliases.forEach(a => tags.add(toTitleCase(a)))
        if (/cloud/.test(t)) tags.add('Cloud')
        if (/search/.test(t)) tags.add('Search')
        if (/\bads?|advertis/.test(t)) tags.add('Ads')
        if (/\bai|artificial intelligence/.test(t)) tags.add('AI')
        if (/hardware|chip|gpu|semiconductor/.test(t)) tags.add('Hardware')
        company.tags = Array.from(tags).slice(0, 8)

        company.lastUpdated = new Date().toISOString()

        // FINAL: return one **validated** company, with NO funding key
        return cors(new NextResponse(JSON.stringify([company]), { status: 200 }))
    }


    if (path === '/files/analyze' && method === 'POST') {
        const form = await req.formData()
        const file = form.get('file')
        if (!file) return cors(new NextResponse(JSON.stringify({ error: 'File is required' }), { status: 400 }))
        const buf = Buffer.from(await file.arrayBuffer())
        const txt = buf.toString('utf-8').slice(0, 20000)
        const ai = await callGeminiAPI([{ role: 'user', content: `Summarize:\n\n${txt}` }], { temperature: 0.4, maxTokens: 250 })
        const rec = await prisma.fileAnalysis.create({
            data: {
                id: uuidv4(),
                filename: file.name,
                size: file.size,
                type: file.type || '',
                summary: ai.content
            }
        })
        return cors(new NextResponse(JSON.stringify(rec), { status: 200 }))
    }

    return cors(new NextResponse(JSON.stringify({ error: `Route ${path} not found` }), { status: 404 }))
}



export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const PATCH = handleRoute
export const DELETE = handleRoute
