'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Key, BarChart3, DollarSign, Activity, AlertTriangle, Plus, Eye, EyeOff, Trash2, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export function SystemUsageModule() {
    const [usage, setUsage] = useState({
        totalChats: 0,
        totalTokens: 0,
        estimatedCost: 0,
        lastUpdated: new Date()
    })
    const [apiKeys, setApiKeys] = useState([])
    const [newKey, setNewKey] = useState({ name: '', key: '', provider: 'gemini' })
    const [showKeys, setShowKeys] = useState({})
    const [isAddingKey, setIsAddingKey] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadUsageData()
        loadApiKeys()
    }, [])

    const loadUsageData = async () => {
        try {
            const response = await fetch('/api/system/usage')
            if (response.ok) {
                const data = await response.json()
                setUsage(data)
            }
        } catch (error) {
            console.error('Failed to load usage data:', error)
        }
    }

    const loadApiKeys = () => {
        // Simulate API keys (in production, this would come from a secure endpoint)
        const keys = [
            {
                id: '1',
                name: 'Gemini API',
                provider: 'Google',
                key: 'AIzaSyDULsUy7WIGoPy54YMugCdapbIeW2IaNFo',
                status: 'active',
                usage: 1234,
                lastUsed: new Date().toISOString()
            }
        ]
        setApiKeys(keys)
    }

    const addApiKey = () => {
        if (!newKey.name || !newKey.key) {
            toast({
                title: "Error",
                description: "Please provide both name and API key",
                variant: "destructive"
            })
            return
        }

        const key = {
            id: Date.now().toString(),
            name: newKey.name,
            provider: newKey.provider,
            key: newKey.key,
            status: 'active',
            usage: 0,
            lastUsed: new Date().toISOString()
        }

        setApiKeys(prev => [...prev, key])
        setNewKey({ name: '', key: '', provider: 'gemini' })
        setIsAddingKey(false)

        toast({
            title: "Success",
            description: "API key added successfully"
        })
    }

    const removeApiKey = (id) => {
        setApiKeys(prev => prev.filter(key => key.id !== id))
        toast({
            title: "Success",
            description: "API key removed"
        })
    }

    const toggleKeyVisibility = (id) => {
        setShowKeys(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const maskApiKey = (key) => {
        if (key.length <= 8) return '••••••••'
        return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString()
    }

    const providers = [
        { value: 'gemini', label: 'Google Gemini' },
        { value: 'openai', label: 'OpenAI' },
        { value: 'anthropic', label: 'Anthropic Claude' },
        { value: 'mistral', label: 'Mistral AI' },
        { value: 'huggingface', label: 'Hugging Face' }
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Usage Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usage.totalChats.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(usage.totalTokens / 1000).toFixed(1)}K</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(usage.estimatedCost)}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Keys</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</div>
                        <p className="text-xs text-muted-foreground">{apiKeys.length} total configured</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* API Key Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="w-5 h-5" />
                                    API Key Management
                                </CardTitle>
                                <CardDescription>
                                    Manage your AI service API keys
                                </CardDescription>
                            </div>
                            <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Key
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New API Key</DialogTitle>
                                        <DialogDescription>
                                            Add a new AI service API key to your account
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="key-name">Key Name</Label>
                                            <Input
                                                id="key-name"
                                                placeholder="e.g., My OpenAI Key"
                                                value={newKey.name}
                                                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="provider">Provider</Label>
                                            <select
                                                id="provider"
                                                className="w-full p-2 border rounded-md"
                                                value={newKey.provider}
                                                onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                                            >
                                                {providers.map((provider) => (
                                                    <option key={provider.value} value={provider.value}>
                                                        {provider.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="api-key">API Key</Label>
                                            <Input
                                                id="api-key"
                                                type="password"
                                                placeholder="Enter your API key"
                                                value={newKey.key}
                                                onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={addApiKey} className="w-full">
                                            <Save className="w-4 h-4 mr-2" />
                                            Add API Key
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {apiKeys.map((key) => (
                                <motion.div
                                    key={key.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium">{key.name}</p>
                                            <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                                                {key.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {showKeys[key.id] ? key.key : maskApiKey(key.key)}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleKeyVisibility(key.id)}
                                            >
                                                {showKeys[key.id] ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {key.provider} • Used {key.usage} times • Last used {formatDate(key.lastUsed)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeApiKey(key.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            System Alerts & Health
                        </CardTitle>
                        <CardDescription>
                            Monitor system health and important alerts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium">High Error Rate Detected</p>
                                    <p className="text-xs text-muted-foreground">
                                        Some AI providers experiencing higher than normal error rates
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                <Activity className="w-4 h-4 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">All Systems Operational</p>
                                    <p className="text-xs text-muted-foreground">
                                        Core services running normally
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Usage Spike Detected</p>
                                    <p className="text-xs text-muted-foreground">
                                        20% increase in API calls this week
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Analytics Chart Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Usage Analytics & Cost Breakdown
                    </CardTitle>
                    <CardDescription>
                        Detailed usage statistics and cost analysis over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Daily Average</h3>
                            <p className="text-3xl font-bold text-primary">127</p>
                            <p className="text-sm text-muted-foreground">requests per day</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Peak Hour</h3>
                            <p className="text-3xl font-bold text-orange-600">2-3 PM</p>
                            <p className="text-sm text-muted-foreground">highest usage</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Cost Efficiency</h3>
                            <p className="text-3xl font-bold text-green-600">$0.01</p>
                            <p className="text-sm text-muted-foreground">per request average</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Usage Trends</h4>
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                                <div key={day} className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">{day}</div>
                                    <div
                                        className="bg-primary rounded-sm mx-auto"
                                        style={{
                                            width: '20px',
                                            height: `${Math.random() * 60 + 20}px`
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Weekly usage pattern - Last 7 days
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}