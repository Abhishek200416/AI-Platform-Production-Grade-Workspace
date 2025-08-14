'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Plus,
    Settings2,
    Key,
    Globe,
    Zap,
    Database,
    Trash2,
    Edit,
    Save,
    AlertCircle,
    Eye,
    EyeOff,
    Check,
    Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useApi, useApiMutation } from '@/hooks/use-api'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorMessage } from '@/components/ui/error-boundary'

export function SettingsPanel({ open, onOpenChange }) {
    const [activeTab, setActiveTab] = useState('endpoints')
    const [newEndpoint, setNewEndpoint] = useState({
        name: '',
        baseUrl: '',
        apiKey: '',
        authHeaders: '',
        enabled: true
    })
    const [editingEndpoint, setEditingEndpoint] = useState(null)
    const [showApiKeys, setShowApiKeys] = useState({})
    const { toast } = useToast()

    // API hooks
    const { data: settings, loading: settingsLoading, error: settingsError, refetch: refetchSettings } = useApi(
        '/api/settings',
        { immediate: open }
    )

    const { mutate: saveSettings, loading: saving } = useApiMutation()

    const [localSettings, setLocalSettings] = useState({
        endpoints: [],
        globalDefaults: {
            temperature: 0.7,
            maxTokens: 1000,
            batchSize: 1,
            ttl: 3600
        },
        mode: 'single-model',
        streaming: true
    })

    useEffect(() => {
        if (settings) {
            setLocalSettings(prev => ({
                // keep everything that ensures a stable, controlled shape
                ...prev,
                ...settings,
                globalDefaults: {
                    ...prev.globalDefaults,
                    ...(settings.globalDefaults ?? {}),
                },
                endpoints: settings.endpoints ?? prev.endpoints,
                mode: settings.mode ?? prev.mode,
                streaming: settings.streaming ?? prev.streaming,
            }))
        }
    }, [settings])

    useEffect(() => {
        if (open) {
            refetchSettings()
        }
    }, [open, refetchSettings])

    const handleSaveSettings = async () => {
        try {
            await saveSettings('/api/settings', {
                method: 'POST',
                body: JSON.stringify(localSettings)
            })

            toast({
                title: "Settings Saved",
                description: "Your configuration has been saved successfully"
            })

            refetchSettings()
        } catch (error) {
            toast({
                title: "Save Failed",
                description: error.message,
                variant: "destructive"
            })
        }
    }

    const addEndpoint = () => {
        if (!newEndpoint.name || !newEndpoint.baseUrl) {
            toast({
                title: "Validation Error",
                description: "Name and Base URL are required",
                variant: "destructive"
            })
            return
        }

        let authHeaders = {}
        if (newEndpoint.authHeaders) {
            try {
                authHeaders = JSON.parse(newEndpoint.authHeaders)
            } catch (error) {
                toast({
                    title: "Invalid JSON",
                    description: "Auth Headers must be valid JSON",
                    variant: "destructive"
                })
                return
            }
        }

        const endpoint = {
            id: Date.now().toString(),
            name: newEndpoint.name,
            baseUrl: newEndpoint.baseUrl,
            apiKey: newEndpoint.apiKey,
            authHeaders,
            enabled: newEndpoint.enabled,
            createdAt: new Date().toISOString()
        }

        setLocalSettings(prev => ({
            ...prev,
            endpoints: [...prev.endpoints, endpoint]
        }))

        setNewEndpoint({
            name: '',
            baseUrl: '',
            apiKey: '',
            authHeaders: '',
            enabled: true
        })

        toast({
            title: "Endpoint Added",
            description: `${endpoint.name} has been added to your configuration`
        })
    }

    const updateEndpoint = (id, updates) => {
        setLocalSettings(prev => ({
            ...prev,
            endpoints: prev.endpoints.map(endpoint =>
                endpoint.id === id ? { ...endpoint, ...updates } : endpoint
            )
        }))
    }

    const removeEndpoint = (id) => {
        setLocalSettings(prev => ({
            ...prev,
            endpoints: prev.endpoints.filter(e => e.id !== id)
        }))

        toast({
            title: "Endpoint Removed",
            description: "The endpoint has been removed from your configuration"
        })
    }

    const toggleEndpoint = (id) => {
        updateEndpoint(id, { enabled: !localSettings.endpoints.find(e => e.id === id)?.enabled })
    }

    const toggleApiKeyVisibility = (id) => {
        setShowApiKeys(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const copyApiKey = async (apiKey) => {
        try {
            await navigator.clipboard.writeText(apiKey)
            toast({
                title: "Copied",
                description: "API key copied to clipboard"
            })
        } catch (error) {
            toast({
                title: "Copy Failed",
                description: "Failed to copy API key",
                variant: "destructive"
            })
        }
    }

    const maskApiKey = (key) => {
        if (!key || key.length <= 8) return '••••••••'
        return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
    }

    const updateGlobalDefaults = (key, value) => {
        setLocalSettings(prev => ({
            ...prev,
            globalDefaults: {
                ...prev.globalDefaults,
                [key]: value
            }
        }))
    }

    const predefinedEndpoints = [
        {
            name: 'OpenAI GPT-4',
            baseUrl: 'https://api.openai.com/v1',
            placeholder: 'sk-...',
            headers: '{"Authorization": "Bearer YOUR_API_KEY"}'
        },
        {
            name: 'Anthropic Claude',
            baseUrl: 'https://api.anthropic.com',
            placeholder: 'sk-ant-...',
            headers: '{"x-api-key": "YOUR_API_KEY", "anthropic-version": "2023-06-01"}'
        },
        {
            name: 'Mistral AI',
            baseUrl: 'https://api.mistral.ai/v1',
            placeholder: 'YOUR_API_KEY',
            headers: '{"Authorization": "Bearer YOUR_API_KEY"}'
        },
        {
            name: 'Hugging Face',
            baseUrl: 'https://api-inference.huggingface.co',
            placeholder: 'hf_...',
            headers: '{"Authorization": "Bearer YOUR_API_KEY"}'
        },
        {
            name: 'Cohere',
            baseUrl: 'https://api.cohere.ai',
            placeholder: 'YOUR_API_KEY',
            headers: '{"Authorization": "Bearer YOUR_API_KEY"}'
        },
        {
            name: 'Google Gemini',
            baseUrl: 'https://generativelanguage.googleapis.com',
            placeholder: 'AIza...',
            headers: '{"X-Goog-Api-Key": "YOUR_API_KEY"}'
        }
    ]

    const panelVariants = {
        open: {
            x: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        closed: {
            x: "100%",
            transition: { type: "spring", stiffness: 300, damping: 30 }
        }
    }

    if (settingsError) {
        return (
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50"
                            onClick={() => onOpenChange(false)}
                        />
                        <motion.div
                            variants={panelVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l border-border z-50 shadow-2xl flex items-center justify-center p-6"
                        >
                            <ErrorMessage error={settingsError} onRetry={refetchSettings} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => onOpenChange(false)}
                    />

                    {/* Settings Panel */}
                    <motion.div
                        variants={panelVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="fixed right-0 top-0 h-full w-full max-w-4xl bg-background border-l border-border z-50 shadow-2xl"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex-shrink-0 p-6 border-b border-border bg-card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                            <Settings2 className="w-5 h-5 text-primary-foreground" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">Settings</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Configure AI endpoints and global preferences
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onOpenChange(false)}
                                        className="hover:bg-accent"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden">
                                {settingsLoading ? (
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3].map(i => (
                                                <LoadingSkeleton key={i} className="h-10" />
                                            ))}
                                        </div>
                                        <LoadingSkeleton className="h-64" />
                                    </div>
                                ) : (
                                    <ScrollArea className="h-full custom-scrollbar">
                                        <div className="p-6">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger value="endpoints">AI Endpoints</TabsTrigger>
                                                    <TabsTrigger value="defaults">Global Defaults</TabsTrigger>
                                                    <TabsTrigger value="system">System Info</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="endpoints" className="space-y-6">
                                                    {/* Current Endpoints */}
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Globe className="w-5 h-5" />
                                                                Active Endpoints
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Manage your AI service providers and API endpoints
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            {localSettings.endpoints?.length === 0 ? (
                                                                <div className="text-center py-8 text-muted-foreground">
                                                                    No endpoints configured. Add your first endpoint below.
                                                                </div>
                                                            ) : (
                                                                localSettings.endpoints?.map((endpoint) => (
                                                                    <motion.div
                                                                        key={endpoint.id}
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                            <Switch
                                                                                checked={endpoint.enabled}
                                                                                onCheckedChange={() => toggleEndpoint(endpoint.id)}
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <p className="font-medium truncate">{endpoint.name}</p>
                                                                                    <Badge variant={endpoint.enabled ? "default" : "secondary"} className="shrink-0">
                                                                                        {endpoint.enabled ? "Active" : "Disabled"}
                                                                                    </Badge>
                                                                                </div>
                                                                                <p className="text-sm text-muted-foreground truncate">{endpoint.baseUrl}</p>
                                                                                {endpoint.apiKey && (
                                                                                    <div className="flex items-center gap-2 mt-2">
                                                                                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                                                                            {showApiKeys[endpoint.id] ? endpoint.apiKey : maskApiKey(endpoint.apiKey)}
                                                                                        </code>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() => toggleApiKeyVisibility(endpoint.id)}
                                                                                        >
                                                                                            {showApiKeys[endpoint.id] ? (
                                                                                                <EyeOff className="w-3 h-3" />
                                                                                            ) : (
                                                                                                <Eye className="w-3 h-3" />
                                                                                            )}
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() => copyApiKey(endpoint.apiKey)}
                                                                                        >
                                                                                            <Copy className="w-3 h-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => setEditingEndpoint(endpoint)}
                                                                            >
                                                                                <Edit className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeEndpoint(endpoint.id)}
                                                                                className="text-destructive hover:text-destructive"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </motion.div>
                                                                ))
                                                            )}
                                                        </CardContent>
                                                    </Card>

                                                    {/* Add New Endpoint */}
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Plus className="w-5 h-5" />
                                                                Add New Endpoint
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Add a custom AI endpoint or select from popular providers
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-6">
                                                            {/* Quick Add Buttons */}
                                                            <div>
                                                                <Label className="text-sm font-medium mb-3 block">Popular Providers</Label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {predefinedEndpoints.map((preset) => (
                                                                        <Button
                                                                            key={preset.name}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => setNewEndpoint({
                                                                                ...newEndpoint,
                                                                                name: preset.name,
                                                                                baseUrl: preset.baseUrl,
                                                                                authHeaders: preset.headers
                                                                            })}
                                                                            className="justify-start"
                                                                        >
                                                                            {preset.name}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label htmlFor="endpoint-name">Name *</Label>
                                                                    <Input
                                                                        id="endpoint-name"
                                                                        value={newEndpoint.name}
                                                                        onChange={(e) => setNewEndpoint({
                                                                            ...newEndpoint,
                                                                            name: e.target.value
                                                                        })}
                                                                        placeholder="My AI Endpoint"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="endpoint-url">Base URL *</Label>
                                                                    <Input
                                                                        id="endpoint-url"
                                                                        value={newEndpoint.baseUrl}
                                                                        onChange={(e) => setNewEndpoint({
                                                                            ...newEndpoint,
                                                                            baseUrl: e.target.value
                                                                        })}
                                                                        placeholder="https://api.example.com/v1"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label htmlFor="endpoint-key">API Key</Label>
                                                                <Input
                                                                    id="endpoint-key"
                                                                    type="password"
                                                                    value={newEndpoint.apiKey}
                                                                    onChange={(e) => setNewEndpoint({
                                                                        ...newEndpoint,
                                                                        apiKey: e.target.value
                                                                    })}
                                                                    placeholder="Your API key"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label htmlFor="endpoint-headers">Auth Headers (JSON)</Label>
                                                                <Textarea
                                                                    id="endpoint-headers"
                                                                    value={newEndpoint.authHeaders}
                                                                    onChange={(e) => setNewEndpoint({
                                                                        ...newEndpoint,
                                                                        authHeaders: e.target.value
                                                                    })}
                                                                    placeholder='{"Authorization": "Bearer YOUR_API_KEY"}'
                                                                    rows={3}
                                                                    className="font-mono text-sm"
                                                                />
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Optional: Add custom headers as JSON object
                                                                </p>
                                                            </div>

                                                            <Button onClick={addEndpoint} className="w-full">
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Add Endpoint
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="defaults" className="space-y-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Settings2 className="w-5 h-5" />
                                                                Global Defaults
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Set default parameters for all AI interactions
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-6">
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Label>Temperature</Label>
                                                                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                                                        {localSettings.globalDefaults?.temperature}
                                                                    </span>
                                                                </div>
                                                                <Slider
                                                                    value={[localSettings.globalDefaults?.temperature ?? 0.7]}
                                                                    max={2}
                                                                    min={0}
                                                                    step={0.1}
                                                                    onValueChange={(value) => updateGlobalDefaults('temperature', value[0])}
                                                                    className="mt-2"
                                                                />
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Controls randomness in responses (0 = deterministic, 2 = very creative)
                                                                </p>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label htmlFor="max-tokens">Max Tokens</Label>
                                                                    <Input
                                                                        id="max-tokens"
                                                                        type="number"
                                                                        min="1"
                                                                        max="4000"
                                                                        value={localSettings.globalDefaults?.maxTokens ?? 1000}
                                                                        onChange={(e) => updateGlobalDefaults('maxTokens', parseInt(e.target.value))}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="batch-size">Batch Size</Label>
                                                                    <Input
                                                                        id="batch-size"
                                                                        type="number"
                                                                        min="1"
                                                                        max="10"
                                                                        value={localSettings.globalDefaults?.batchSize || 1}
                                                                        onChange={(e) => updateGlobalDefaults('batchSize', parseInt(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label htmlFor="ttl">Cache TTL (seconds)</Label>
                                                                <Input
                                                                    id="ttl"
                                                                    type="number"
                                                                    min="0"
                                                                    value={localSettings.globalDefaults?.ttl || 3600}
                                                                    onChange={(e) => updateGlobalDefaults('ttl', parseInt(e.target.value))}
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Operation Mode</CardTitle>
                                                            <CardDescription>
                                                                Choose how the AI platform processes requests
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div>
                                                                <Label htmlFor="mode">Processing Mode</Label>
                                                                <Select
                                                                    value={localSettings.mode ?? 'single-model'}
                                                                    onValueChange={(value) => setLocalSettings({ ...localSettings, mode: value })}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="single-model">Single Model</SelectItem>
                                                                        <SelectItem value="ensemble">Ensemble (Multiple Models)</SelectItem>
                                                                        <SelectItem value="rag">RAG (Retrieval Augmented)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <Label>Streaming Responses</Label>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Enable real-time response streaming
                                                                    </p>
                                                                </div>
                                                                <Switch
                                                                    checked={Boolean(localSettings.streaming)}
                                                                    onCheckedChange={(checked) => setLocalSettings({ ...localSettings, streaming: checked })}
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="system" className="space-y-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Database className="w-5 h-5" />
                                                                System Information
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Platform status and configuration details
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-4 border rounded-lg">
                                                                    <p className="text-sm text-muted-foreground">Platform Version</p>
                                                                    <p className="font-semibold">v2.0.0</p>
                                                                </div>
                                                                <div className="p-4 border rounded-lg">
                                                                    <p className="text-sm text-muted-foreground">Active Endpoints</p>
                                                                    <p className="font-semibold">{localSettings.endpoints?.filter(e => e.enabled).length || 0}</p>
                                                                </div>
                                                                <div className="p-4 border rounded-lg">
                                                                    <p className="text-sm text-muted-foreground">Processing Mode</p>
                                                                    <p className="font-semibold capitalize">{localSettings.mode?.replace('-', ' ')}</p>
                                                                </div>
                                                                <div className="p-4 border rounded-lg">
                                                                    <p className="text-sm text-muted-foreground">System Status</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        <p className="font-semibold">Online</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                                                <h4 className="font-medium mb-2">Configuration Summary</h4>
                                                                <div className="text-sm text-muted-foreground space-y-1">
                                                                    <p>Temperature: {localSettings.globalDefaults?.temperature}</p>
                                                                    <p>Max Tokens: {localSettings.globalDefaults?.maxTokens}</p>
                                                                    <p>Streaming: {localSettings.streaming ? 'Enabled' : 'Disabled'}</p>
                                                                    <p>Endpoints: {localSettings.endpoints?.length || 0} configured</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                <AlertCircle className="w-5 h-5" />
                                                                Advanced Options
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Advanced configuration and system management
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <Button variant="outline" size="sm" className="w-full justify-start">
                                                                Export Configuration
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="w-full justify-start">
                                                                Import Configuration
                                                            </Button>
                                                            <Button variant="destructive" size="sm" className="w-full justify-start">
                                                                Reset to Defaults
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex-shrink-0 p-6 border-t border-border bg-card">
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveSettings}
                                        disabled={saving || settingsLoading}
                                    >
                                        {saving ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 mr-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </motion.div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Settings
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}