'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    Bot,
    User,
    Loader2,
    Plus,
    Trash2,
    Edit2,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function ChatModule() {
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content:
                'Hello! I can help with coding, analysis, writing, and live lookups. Ask anything or type /search query or /news topic.',
            timestamp: new Date(),
            isError: false,
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash')
    const [sessions, setSessions] = useState([])
    const [currentSessionId, setCurrentSessionId] = useState(null)

    // sidebar state
    const [sidebarWidth, setSidebarWidth] = useState(240)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [dragging, setDragging] = useState(false)
    const messagesEndRef = useRef(null)
    const { toast } = useToast()

    const GUTTER_WIDTH = 8
    const MIN_WIDTH = 100
    const MAX_WIDTH = 400

    // auto-scroll new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // load sessions once
    useEffect(() => {
        fetch('/api/chat/sessions')
            .then((r) => r.ok && r.json())
            .then((data) => data && setSessions(data))
            .catch(console.error)
    }, [])

    // drag-to-resize—but only while inside the gutter band
    useEffect(() => {
        function onMouseMove(e) {
            if (!dragging) return
            const x = e.clientX
            // only resize while cursor remains in the gutter region
            if (x < sidebarWidth || x > sidebarWidth + GUTTER_WIDTH) {
                setDragging(false)
                return
            }
            let w = x
            if (w < MIN_WIDTH) w = MIN_WIDTH
            if (w > MAX_WIDTH) w = MAX_WIDTH
            setSidebarWidth(w)
        }
        function onMouseUp() {
            setDragging(false)
        }
        if (dragging) {
            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
            return () => {
                window.removeEventListener('mousemove', onMouseMove)
                window.removeEventListener('mouseup', onMouseUp)
            }
        }
    }, [dragging, sidebarWidth])

    async function renameSession(id) {
        const title = prompt('New title?')
        if (!title) return
        const res = await fetch(`/api/chat/sessions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        })
        if (res.ok) {
            toast({ title: 'Renamed' })
            const updated = await res.json()
            setSessions(updated)
        }
    }

    async function deleteSession(id) {
        if (!confirm('Delete this chat?')) return
        const res = await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' })
        if (res.ok) {
            toast({ title: 'Deleted' })
            if (currentSessionId === id) startNewChat()
            const updated = await res.json()
            setSessions(updated)
        }
    }

    async function sendMessage() {
        if (!input.trim() || isLoading) return
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
            isError: false,
        }
        const updated = [...messages, userMsg]
        setMessages(updated)
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    messages: updated.map(({ id, timestamp, isError, ...m }) => m),
                    model: selectedModel,
                    temperature: 0.7,
                    max_tokens: 1000,
                }),
            })
            if (!res.ok) throw new Error((await res.json()).error || 'Failed')
            const data = await res.json()
            const botMsg = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: new Date(),
                isError: false,
            }
            setMessages([...updated, botMsg])
            setCurrentSessionId(data.id)
        } catch (err) {
            const message = err.message || 'Unknown error'
            toast({ title: 'Error', description: message, variant: 'destructive' })
            setMessages([
                ...updated,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `Error: ${message}`,
                    timestamp: new Date(),
                    isError: true,
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    function startNewChat() {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content:
                    'New chat started. Ask anything or use /search and /news for live data.',
                timestamp: new Date(),
                isError: false,
            },
        ])
        setCurrentSessionId(null)
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    function formatTime(ts) {
        return new Date(ts).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div
            className="grid h-full overflow-hidden"
            style={{
                gridTemplateColumns: sidebarCollapsed
                    ? `0px ${GUTTER_WIDTH}px 1fr`
                    : `${sidebarWidth}px ${GUTTER_WIDTH}px 1fr`,
            }}
        >
            {/* --- Sidebar --- */}
            <aside className="flex flex-col h-full border-r border-border bg-card overflow-hidden">
                {/* header */}
                <div className="flex items-center justify-between p-3 flex-none">
                    <h3 className="font-semibold">Chat Sessions</h3>
                    <Button size="sm" variant="outline" onClick={startNewChat}>
                        <Plus className="w-4 h-4" /> New
                    </Button>
                </div>
                {/* sessions list */}
                <div className="flex-1 overflow-auto">
                    <div className="p-2 space-y-1">
                        {sessions.map((s) => (
                            <motion.div
                                key={s.id}
                                whileHover={{ scale: 1.01 }}
                                className={`group relative flex items-center justify-between rounded-lg border px-3 py-1 cursor-pointer transition-colors ${currentSessionId === s.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent'
                                    }`}
                                onClick={() => {
                                    setMessages(s.messages)
                                    setCurrentSessionId(s.id)
                                }}
                            >
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium truncate">{s.title}</p>
                                    <p className="text-xs opacity-70">
                                        {formatTime(s.timestamp)}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            renameSession(s.id)
                                        }}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteSession(s.id)
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* --- Gutter (drag+toggle) --- */}
            <div
                className="relative bg-border cursor-col-resize"
                style={{ width: GUTTER_WIDTH }}
                onMouseDown={() => {
                    if (sidebarCollapsed) setSidebarCollapsed(false)
                    setDragging(true)
                }}
            >
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute top-2 left-1/2 -translate-x-1/2 bg-card rounded"
                >
                    {sidebarCollapsed ? (
                        <ChevronsRight className="w-5 h-5" />
                    ) : (
                        <ChevronsLeft className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* --- Main chat panel --- */}
            <main className="flex flex-col h-full overflow-hidden">
                {/* model selector */}
                <div className="flex-none flex items-center justify-between border-b border-border bg-card px-6 py-4">
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gemini-2.0-flash">
                                Gemini 2.0 Flash
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* messages history */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="mx-auto flex max-w-3xl flex-col space-y-6">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                            <Bot className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                    )}
                                    <Card
                                        className={`max-w-[80%] ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : msg.isError
                                                    ? 'border-red-200 bg-red-50 dark:bg-red-950/20'
                                                    : ''
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="prose dark:prose-invert max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        code({ inline, className, children, ...props }) {
                                                            const m = /language-(\w+)/.exec(className || '')
                                                            return !inline && m ? (
                                                                <SyntaxHighlighter
                                                                    style={oneDark}
                                                                    language={m[1]}
                                                                    PreTag="div"
                                                                    {...props}
                                                                >
                                                                    {String(children).replace(/\n$/, '')}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            )
                                                        },
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
                                                <span className="text-xs opacity-70">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {msg.role === 'user' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                                            <User className="h-5 w-5 text-secondary-foreground" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                    <Bot className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <Card className="max-w-[80%]">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm text-muted-foreground">
                                                AI is thinking…
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* input bar */}
                <div className="flex-none border-t border-border bg-card p-4">
                    <div className="mx-auto flex max-w-3xl gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder='Ask anything. Use "/search" or "/news".'
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                className="pr-12"
                            />
                            <Button
                                size="sm"
                                className="absolute right-1 top-1"
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
