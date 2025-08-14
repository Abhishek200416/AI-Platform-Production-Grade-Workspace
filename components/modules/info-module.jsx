'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Search, Brain, BookOpen, Send, Loader2, CheckCircle, Globe, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'

export function InfoModule() {
  const [activeTab, setActiveTab] = useState('qa')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [searchHistory, setSearchHistory] = useState([])
  const { toast } = useToast()

  // Q&A State
  const [question, setQuestion] = useState('')
  
  // Fact Check State
  const [factStatement, setFactStatement] = useState('')
  
  // Research State
  const [researchTopic, setResearchTopic] = useState('')
  const [researchDepth, setResearchDepth] = useState('comprehensive')

  const handleAIRequest = async (prompt, type) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gemini-2.0-flash',
          temperature: 0.3,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      const data = await response.json()
      setResult(data.choices[0].message.content)
      
      // Add to search history
      const historyItem = {
        id: Date.now().toString(),
        type,
        query: prompt.split('\n')[0].replace('Question: ', '').replace('Statement: ', '').replace('Research: ', ''),
        timestamp: new Date(),
        preview: data.choices[0].message.content.substring(0, 100) + '...'
      }
      setSearchHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10
      
      toast({
        title: "Success",
        description: `${type} completed successfully`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const askQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      })
      return
    }

    const prompt = `Please provide a comprehensive, factual answer to the following question. Include relevant details, context, and cite sources where applicable:

Question: ${question}

Requirements:
- Provide accurate, well-researched information
- Include relevant background context
- Mention any important caveats or limitations
- Structure the response clearly with headings if needed
- If the question involves current events, note that information may be limited by training data`

    await handleAIRequest(prompt, 'Q&A')
  }

  const factCheck = async () => {
    if (!factStatement.trim()) {
      toast({
        title: "Error",
        description: "Please enter a statement to fact-check",
        variant: "destructive"
      })
      return
    }

    const prompt = `Please fact-check the following statement and provide a detailed analysis:

Statement: ${factStatement}

Please provide:
1. **Verdict**: True, False, Partially True, or Needs More Context
2. **Analysis**: Detailed explanation of the accuracy
3. **Evidence**: Sources and reasoning that support your assessment
4. **Context**: Important background information
5. **Caveats**: Any limitations in the fact-checking process

Be thorough and objective in your analysis.`

    await handleAIRequest(prompt, 'Fact Check')
  }

  const conductResearch = async () => {
    if (!researchTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a research topic",
        variant: "destructive"
      })
      return
    }

    const prompt = `Conduct ${researchDepth} research on the following topic:

Research Topic: ${researchTopic}

Please provide:
1. **Overview**: Brief introduction to the topic
2. **Key Points**: Main aspects and important details
3. **Current State**: Latest developments or current status
4. **Different Perspectives**: Various viewpoints or approaches
5. **Implications**: Why this topic matters and its broader impact
6. **Further Reading**: Suggested areas for deeper exploration
7. **Limitations**: What aspects might need additional research

Structure the response for easy reading with clear sections and bullet points where appropriate.`

    await handleAIRequest(prompt, 'Research')
  }

  const quickSearch = async (query) => {
    setQuestion(query)
    setActiveTab('qa')
    const prompt = `Please provide a quick, informative answer to: ${query}

Keep the response concise but comprehensive, focusing on the most important information.`
    
    await handleAIRequest(prompt, 'Quick Search')
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const popularQuestions = [
    "What is artificial intelligence and how does it work?",
    "How does climate change affect global weather patterns?",
    "What are the latest developments in renewable energy?",
    "How do vaccines work and why are they important?",
    "What is blockchain technology and its applications?",
    "How does the human brain process memories?",
    "What are the effects of social media on mental health?",
    "How does quantum computing differ from classical computing?"
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'fact-check' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('fact-check')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Fact Check
            </CardTitle>
            <CardDescription>
              Verify information and get accurate facts
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'qa' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('qa')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Knowledge Q&A
            </CardTitle>
            <CardDescription>
              Ask questions and get detailed answers
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'research' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('research')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Research
            </CardTitle>
            <CardDescription>
              Deep research on any topic
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Input Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Knowledge Retrieval System
              </CardTitle>
              <CardDescription>
                Get accurate, factual information on any topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                  <TabsTrigger value="fact-check">Fact Check</TabsTrigger>
                  <TabsTrigger value="research">Research</TabsTrigger>
                </TabsList>

                <TabsContent value="qa" className="space-y-4">
                  <div>
                    <Label htmlFor="question">Your Question</Label>
                    <Textarea
                      id="question"
                      placeholder="Ask any question... e.g., 'How does photosynthesis work?' or 'What are the causes of inflation?'"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={askQuestion} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Get Answer
                  </Button>
                </TabsContent>

                <TabsContent value="fact-check" className="space-y-4">
                  <div>
                    <Label htmlFor="fact-statement">Statement to Fact-Check</Label>
                    <Textarea
                      id="fact-statement"
                      placeholder="Enter a statement to verify... e.g., 'The Great Wall of China is visible from space'"
                      value={factStatement}
                      onChange={(e) => setFactStatement(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={factCheck} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Fact Check
                  </Button>
                </TabsContent>

                <TabsContent value="research" className="space-y-4">
                  <div>
                    <Label htmlFor="research-topic">Research Topic</Label>
                    <Input
                      id="research-topic"
                      placeholder="e.g., 'Machine learning applications in healthcare'"
                      value={researchTopic}
                      onChange={(e) => setResearchTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="research-depth">Research Depth</Label>
                    <select
                      id="research-depth"
                      className="w-full p-2 border rounded-md"
                      value={researchDepth}
                      onChange={(e) => setResearchDepth(e.target.value)}
                    >
                      <option value="quick">Quick Overview</option>
                      <option value="comprehensive">Comprehensive Analysis</option>
                      <option value="detailed">Detailed Investigation</option>
                    </select>
                  </div>
                  <Button onClick={conductResearch} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="w-4 h-4 mr-2" />
                    )}
                    Start Research
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>AI-generated information and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-12"
                  >
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Researching your query...</p>
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="prose dark:prose-invert max-w-none"
                  >
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Info className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Ask a question, fact-check a statement, or start research to get detailed information
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Popular Questions
              </CardTitle>
              <CardDescription>
                Common questions to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {popularQuestions.slice(0, 5).map((q, index) => (
                  <button
                    key={index}
                    onClick={() => quickSearch(q)}
                    className="w-full text-left p-2 text-sm border rounded hover:bg-accent transition-colors"
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
                <CardDescription>
                  Your recent queries and research
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="border-b border-border pb-2 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (item.type === 'Q&A' || item.type === 'Quick Search') {
                            quickSearch(item.query)
                          }
                        }}
                        className="text-sm font-medium hover:text-primary transition-colors text-left"
                      >
                        {item.query}
                      </button>
                      <p className="text-xs text-muted-foreground mt-1">{item.preview}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}