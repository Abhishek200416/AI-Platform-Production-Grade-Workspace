'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, TrendingUp, Globe, Rss, Search, Filter, RefreshCw, ExternalLink, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useApi, useDebouncedApi } from '@/hooks/use-api'
import { LoadingSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorMessage } from '@/components/ui/error-boundary'
import ReactMarkdown from 'react-markdown'

export function NewsModule() {
  const [activeTab, setActiveTab] = useState('latest')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedArticle, setExpandedArticle] = useState(null)
  const { toast } = useToast()

  // API hooks
  const { data: latestNews, loading: latestLoading, error: latestError, refetch: refetchLatest } = useApi('/api/news/latest')
  const { data: searchResults, loading: searchLoading } = useDebouncedApi('/api/news/search', searchTerm, 500)

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'technology', label: 'Technology' },
    { value: 'ai', label: 'Artificial Intelligence' },
    { value: 'business', label: 'Business' },
    { value: 'science', label: 'Science' },
    { value: 'health', label: 'Health' }
  ]

  const handleRefresh = () => {
    refetchLatest()
    toast({
      title: "Refreshing",
      description: "Fetching latest news..."
    })
  }

  const generateSummary = async (articleContent) => {
    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Please provide a concise 2-3 sentence summary of this news article:\n\n${articleContent}`
          }],
          model: 'gemini-2.0-flash',
          temperature: 0.3,
          max_tokens: 150
        })
      })

      if (!response.ok) throw new Error('Failed to generate summary')
      
      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Summary generation failed:', error)
      return null
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const mockNewsData = [
    {
      id: '1',
      title: 'AI Platform Development Accelerates with New Gemini Integration',
      summary: 'Latest developments in AI platform technology show promising results with enhanced natural language processing capabilities and improved user experience.',
      content: 'The integration of Google\'s Gemini AI model into production platforms marks a significant milestone in conversational AI development. This advancement brings enhanced reasoning capabilities, better context understanding, and more natural language interactions to enterprise applications.',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'Tech Today',
      category: 'technology',
      url: 'https://example.com/news/1',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      author: 'Sarah Chen'
    },
    {
      id: '2', 
      title: 'Machine Learning Models Achieve 95% Accuracy in Medical Diagnosis',
      summary: 'Revolutionary breakthrough in healthcare AI demonstrates unprecedented accuracy in diagnosing complex medical conditions, potentially transforming patient care.',
      content: 'Researchers have developed advanced machine learning models that can diagnose medical conditions with 95% accuracy, surpassing traditional diagnostic methods. The models analyze medical imaging, patient history, and symptoms to provide rapid, accurate diagnoses.',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      source: 'Medical AI News',
      category: 'health',
      url: 'https://example.com/news/2',
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
      author: 'Dr. Michael Rodriguez'
    },
    {
      id: '3',
      title: 'Startup Raises $50M for Next-Generation AI Assistant Platform',
      summary: 'Emerging AI company secures major funding round to develop comprehensive AI assistant platform targeting enterprise customers.',
      content: 'TechFlow AI has raised $50 million in Series B funding to expand its AI assistant platform. The platform combines natural language processing, task automation, and enterprise integration to provide comprehensive business solutions.',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: 'Startup Weekly',
      category: 'business',
      url: 'https://example.com/news/3',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
      author: 'Jennifer Kim'
    },
    {
      id: '4',
      title: 'Open Source AI Models Democratize Machine Learning Development',
      summary: 'New open source initiatives make advanced AI models accessible to developers worldwide, fostering innovation and collaboration.',
      content: 'The release of several high-performance open source AI models is democratizing access to advanced machine learning capabilities. These models enable developers and researchers to build sophisticated AI applications without massive computational resources.',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      source: 'Open Source AI',
      category: 'technology',
      url: 'https://example.com/news/4',
      imageUrl: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?w=400',
      author: 'Alex Thompson'
    },
    {
      id: '5',
      title: 'Quantum Computing Breakthrough Promises Exponential AI Speedup',
      summary: 'Scientists achieve major quantum computing milestone that could revolutionize AI model training and inference speeds.',
      content: 'Researchers have demonstrated a quantum computing breakthrough that could accelerate AI computations by orders of magnitude. This development could enable training of much larger and more sophisticated AI models.',
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      source: 'Quantum Tech Review',
      category: 'science',
      url: 'https://example.com/news/5',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      author: 'Dr. Lisa Wang'
    }
  ]

  const currentNews = latestNews || mockNewsData
  const displayNews = searchTerm ? searchResults || [] : currentNews

  const filteredNews = selectedCategory === 'all' 
    ? displayNews 
    : displayNews.filter(article => article.category === selectedCategory)

  const NewsCard = ({ article, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
      >
        <div className="flex gap-4 p-4">
          {article.imageUrl && (
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {article.category}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getTimeAgo(article.publishedAt)}
                </span>
                <span>{article.source}</span>
                {article.author && <span>by {article.author}</span>}
              </div>
              {article.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(article.url, '_blank')
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {expandedArticle === article.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <CardContent className="p-4 pt-4">
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{article.content}</ReactMarkdown>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Published {formatDate(article.publishedAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const summary = await generateSummary(article.content)
                        if (summary) {
                          toast({
                            title: "AI Summary",
                            description: summary
                          })
                        }
                      }}
                    >
                      AI Summary
                    </Button>
                    {article.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        Read Full Article
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )

  if (latestError) {
    return (
      <div className="page-container">
        <ErrorMessage error={latestError} onRetry={refetchLatest} />
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-responsive-lg font-bold">AI-Powered News Hub</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest AI and technology news, enhanced with intelligent summaries
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={latestLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${latestLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <div className="card-grid">
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('trending')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending
            </CardTitle>
            <CardDescription>
              Hot topics and viral stories
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedCategory('technology')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Tech News
            </CardTitle>
            <CardDescription>
              Latest in technology and innovation
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedCategory('ai')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rss className="w-5 h-5" />
              AI Updates
            </CardTitle>
            <CardDescription>
              Artificial intelligence breakthroughs
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* News Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main News Feed */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'Latest News'}
                </div>
                <Badge variant="secondary">
                  {filteredNews.length} articles
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestLoading || searchLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <CardSkeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="text-center py-12">
                  <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? `No articles match your search for "${searchTerm}"`
                      : 'No news articles available at the moment'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((article, index) => (
                    <NewsCard key={article.id} article={article} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">News Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Articles</span>
                <Badge>{displayNews.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Categories</span>
                <Badge>{categories.length - 1}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Updated</span>
                <span className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.slice(1).map((category) => {
                  const count = currentNews.filter(article => article.category === category.value).length
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full flex items-center justify-between p-2 text-sm rounded-lg transition-colors ${
                        selectedCategory === category.value 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      <span>{category.label}</span>
                      <Badge variant="secondary" className="ml-2">
                        {count}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-generated summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Smart categorization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Intelligent search</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Content analysis</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}