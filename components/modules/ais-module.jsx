'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Zap, Settings, BarChart3, Plus, Eye, EyeOff, CheckCircle, AlertCircle, Clock, Activity, Cpu, Gauge, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useApi, useApiMutation } from '@/hooks/use-api'
import { LoadingSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorMessage } from '@/components/ui/error-boundary'

export function AIsModule() {
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [isTestingModel, setIsTestingModel] = useState(false)
  const { toast } = useToast()

  // API hooks
  const { data: settings, loading: settingsLoading, refetch: refetchSettings } = useApi('/api/settings')
  const { mutate: updateSettings } = useApiMutation()

  // Mock AI providers data (would come from API in production)
  const aiProviders = [
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'Google',
      status: 'active',
      category: 'Language Model',
      description: 'Google\'s most capable multimodal AI model with improved reasoning and code generation.',
      capabilities: ['Text Generation', 'Code Generation', 'Reasoning', 'Multimodal'],
      pricing: {
        input: 0.075,
        output: 0.30,
        unit: 'per 1M tokens'
      },
      performance: {
        latency: '120ms',
        throughput: '1000 tokens/sec',
        uptime: '99.9%',
        reliability: 'High'
      },
      limits: {
        contextWindow: '2M tokens',
        maxOutput: '8K tokens',
        rateLimit: '300 RPM'
      },
      features: ['Function Calling', 'JSON Mode', 'Streaming', 'Vision'],
      lastTested: new Date(Date.now() - 2 * 60 * 60 * 1000),
      testScore: 95,
      trending: true
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      status: 'inactive',
      category: 'Language Model',
      description: 'OpenAI\'s most advanced language model with superior reasoning capabilities.',
      capabilities: ['Text Generation', 'Code Generation', 'Analysis', 'Creative Writing'],
      pricing: {
        input: 10.00,
        output: 30.00,
        unit: 'per 1M tokens'
      },
      performance: {
        latency: '200ms',
        throughput: '800 tokens/sec',
        uptime: '99.8%',
        reliability: 'High'
      },
      limits: {
        contextWindow: '128K tokens',
        maxOutput: '4K tokens',
        rateLimit: '500 RPM'
      },
      features: ['Function Calling', 'JSON Mode', 'Streaming', 'Vision'],
      lastTested: new Date(Date.now() - 24 * 60 * 60 * 1000),
      testScore: 92,
      trending: false
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      status: 'inactive',
      category: 'Language Model',
      description: 'Anthropic\'s most powerful model with exceptional reasoning and analysis capabilities.',
      capabilities: ['Text Generation', 'Analysis', 'Reasoning', 'Research'],
      pricing: {
        input: 15.00,
        output: 75.00,
        unit: 'per 1M tokens'
      },
      performance: {
        latency: '180ms',
        throughput: '750 tokens/sec',
        uptime: '99.7%',
        reliability: 'High'
      },
      limits: {
        contextWindow: '200K tokens',
        maxOutput: '4K tokens',
        rateLimit: '1000 RPM'
      },
      features: ['Streaming', 'Long Context', 'Analysis'],
      lastTested: new Date(Date.now() - 48 * 60 * 60 * 1000),
      testScore: 89,
      trending: false
    },
    {
      id: 'mixtral-8x7b',
      name: 'Mixtral 8x7B',
      provider: 'Mistral AI',
      status: 'inactive',
      category: 'Language Model',
      description: 'High-performance mixture of experts model with excellent multilingual capabilities.',
      capabilities: ['Text Generation', 'Code Generation', 'Multilingual', 'Fast Inference'],
      pricing: {
        input: 0.70,
        output: 0.70,
        unit: 'per 1M tokens'
      },
      performance: {
        latency: '150ms',
        throughput: '1200 tokens/sec',
        uptime: '99.5%',
        reliability: 'Medium'
      },
      limits: {
        contextWindow: '32K tokens',
        maxOutput: '4K tokens',
        rateLimit: '200 RPM'
      },
      features: ['Streaming', 'Multilingual', 'Code Generation'],
      lastTested: new Date(Date.now() - 72 * 60 * 60 * 1000),
      testScore: 85,
      trending: false
    },
    {
      id: 'cohere-command-r-plus',
      name: 'Command R+',
      provider: 'Cohere',
      status: 'inactive',
      category: 'Language Model',
      description: 'Enterprise-focused model optimized for business applications and tool use.',
      capabilities: ['Text Generation', 'Tool Use', 'RAG', 'Business Applications'],
      pricing: {
        input: 3.00,
        output: 15.00,
        unit: 'per 1M tokens'
      },
      performance: {
        latency: '160ms',
        throughput: '900 tokens/sec',
        uptime: '99.6%',
        reliability: 'High'
      },
      limits: {
        contextWindow: '128K tokens',
        maxOutput: '4K tokens',
        rateLimit: '100 RPM'
      },
      features: ['Tool Use', 'RAG', 'Citations', 'Grounding'],
      lastTested: new Date(Date.now() - 96 * 60 * 60 * 1000),
      testScore: 87,
      trending: false
    }
  ]

  const testModel = async (model) => {
    setIsTestingModel(true)
    const testQuery = "Write a simple Python function to calculate factorial."
    
    try {
      const startTime = Date.now()
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testQuery }],
          model: model.id,
          temperature: 0.7,
          max_tokens: 200
        })
      })
      
      const endTime = Date.now()
      const latency = endTime - startTime
      
      if (!response.ok) {
        throw new Error(`Test failed: ${response.status}`)
      }
      
      const data = await response.json()
      const result = {
        success: true,
        latency: `${latency}ms`,
        response: data.choices[0].message.content,
        tokens: data.usage?.total_tokens || 'N/A',
        timestamp: new Date()
      }
      
      setTestResults(prev => ({
        ...prev,
        [model.id]: result
      }))
      
      toast({
        title: "Model Test Successful",
        description: `${model.name} responded in ${latency}ms`
      })
      
    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        timestamp: new Date()
      }
      
      setTestResults(prev => ({
        ...prev,
        [model.id]: result
      }))
      
      toast({
        title: "Model Test Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsTestingModel(false)
    }
  }

  const toggleModelStatus = async (modelId) => {
    const updatedProviders = aiProviders.map(provider => 
      provider.id === modelId 
        ? { ...provider, status: provider.status === 'active' ? 'inactive' : 'active' }
        : provider
    )
    
    // In a real app, you'd update this via API
    toast({
      title: "Model Status Updated",
      description: `${aiProviders.find(p => p.id === modelId)?.name} ${
        aiProviders.find(p => p.id === modelId)?.status === 'active' ? 'disabled' : 'enabled'
      }`
    })
  }

  const ModelCard = ({ model, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 ${
        model.status === 'active' ? 'ring-2 ring-primary/20' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                model.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              } animate-pulse`} />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {model.name}
                  {model.trending && (
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{model.provider}</span>
                  <Badge variant="outline" className="text-xs">
                    {model.category}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={model.status === 'active'}
              onCheckedChange={() => toggleModelStatus(model.id)}
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {model.description}
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Latency</p>
              <p className="font-semibold">{model.performance.latency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-semibold">{model.performance.uptime}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Context</p>
              <p className="font-semibold">{model.limits.contextWindow}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Test Score</p>
              <p className="font-semibold text-primary">{model.testScore}/100</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Capabilities</p>
            <div className="flex flex-wrap gap-1">
              {model.capabilities.slice(0, 3).map((capability, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {capability}
                </Badge>
              ))}
              {model.capabilities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{model.capabilities.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last tested {model.lastTested.toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProvider(selectedProvider?.id === model.id ? null : model)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testModel(model)}
                disabled={isTestingModel}
              >
                <Activity className="w-3 h-3 mr-1" />
                Test
              </Button>
            </div>
          </div>
          
          {testResults[model.id] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-muted/50 rounded-lg overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                {testResults[model.id].success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  Test {testResults[model.id].success ? 'Passed' : 'Failed'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {testResults[model.id].timestamp.toLocaleTimeString()}
                </span>
              </div>
              {testResults[model.id].success ? (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Latency: {testResults[model.id].latency}</p>
                  <p>Tokens: {testResults[model.id].tokens}</p>
                </div>
              ) : (
                <p className="text-xs text-red-600">
                  {testResults[model.id].error}
                </p>
              )}
            </motion.div>
          )}
        </CardContent>

        <AnimatePresence>
          {selectedProvider?.id === model.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t"
            >
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Throughput</p>
                        <p className="font-medium">{model.performance.throughput}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reliability</p>
                        <p className="font-medium">{model.performance.reliability}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rate Limit</p>
                        <p className="font-medium">{model.limits.rateLimit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max Output</p>
                        <p className="font-medium">{model.limits.maxOutput}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Pricing</h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Input</p>
                          <p className="font-medium">${model.pricing.input} {model.pricing.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Output</p>
                          <p className="font-medium">${model.pricing.output} {model.pricing.unit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">All Capabilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((capability, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-responsive-lg font-bold">AI Models Hub</h1>
          <p className="text-muted-foreground">
            Discover, compare, and manage AI models and endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {aiProviders.filter(p => p.status === 'active').length} active
          </Badge>
          <Badge variant="outline">
            {aiProviders.length} total
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="card-grid">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Active Models
            </CardTitle>
            <CardDescription>
              Currently enabled AI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {aiProviders.filter(p => p.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">models ready to use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Average Score
            </CardTitle>
            <CardDescription>
              Performance benchmark average
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(aiProviders.reduce((sum, p) => sum + p.testScore, 0) / aiProviders.length)}
            </div>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Best Latency
            </CardTitle>
            <CardDescription>
              Fastest response time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.min(...aiProviders.map(p => parseInt(p.performance.latency)))}ms
            </div>
            <p className="text-sm text-muted-foreground">average response time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Providers
            </CardTitle>
            <CardDescription>
              Unique AI service providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(aiProviders.map(p => p.provider)).size}
            </div>
            <p className="text-sm text-muted-foreground">different providers</p>
          </CardContent>
        </Card>
      </div>

      {/* Models Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Available Models</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Model
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                aiProviders.forEach(model => {
                  if (model.status === 'active') {
                    testModel(model)
                  }
                })
              }}
              disabled={isTestingModel}
            >
              <Activity className="w-4 h-4 mr-2" />
              Test All Active
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiProviders.map((model, index) => (
            <ModelCard key={model.id} model={model} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}