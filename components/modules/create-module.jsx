'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, FileText, Twitter, Code, BookOpen, Send, Copy, CheckCircle, Loader2, Wand2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'

export function CreateModule() {
  const [activeTab, setActiveTab] = useState('blog')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Blog Post State
  const [blogTopic, setBlogTopic] = useState('')
  const [blogStyle, setBlogStyle] = useState('informative')
  const [blogLength, setBlogLength] = useState([800])
  
  // Tweet State
  const [tweetTopic, setTweetTopic] = useState('')
  const [tweetStyle, setTweetStyle] = useState('engaging')
  const [tweetCount, setTweetCount] = useState([3])
  
  // Script State
  const [scriptType, setScriptType] = useState('bash')
  const [scriptPurpose, setScriptPurpose] = useState('')
  
  // Document State
  const [documentType, setDocumentType] = useState('report')
  const [documentTopic, setDocumentTopic] = useState('')
  const [documentLength, setDocumentLength] = useState([1000])

  // Creative State
  const [creativeType, setCreativeType] = useState('story')
  const [creativePrompt, setCreativePrompt] = useState('')
  const [creativeTone, setCreativeTone] = useState('engaging')

  const blogStyles = [
    { value: 'informative', label: 'Informative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'technical', label: 'Technical' }
  ]

  const tweetStyles = [
    { value: 'engaging', label: 'Engaging' },
    { value: 'informative', label: 'Informative' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'controversial', label: 'Thought-provoking' }
  ]

  const scriptTypes = [
    { value: 'bash', label: 'Bash Script' },
    { value: 'python', label: 'Python Script' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'batch', label: 'Batch File' },
    { value: 'node', label: 'Node.js Script' }
  ]

  const documentTypes = [
    { value: 'report', label: 'Business Report' },
    { value: 'proposal', label: 'Project Proposal' },
    { value: 'manual', label: 'User Manual' },
    { value: 'whitepaper', label: 'Whitepaper' },
    { value: 'specification', label: 'Technical Specification' }
  ]

  const creativeTypes = [
    { value: 'story', label: 'Short Story' },
    { value: 'poem', label: 'Poem' },
    { value: 'essay', label: 'Creative Essay' },
    { value: 'dialogue', label: 'Dialogue' },
    { value: 'monologue', label: 'Monologue' }
  ]

  const creativeTones = [
    { value: 'engaging', label: 'Engaging' },
    { value: 'dramatic', label: 'Dramatic' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'romantic', label: 'Romantic' }
  ]

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
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      const data = await response.json()
      setResult(data.choices[0].message.content)
      
      toast({
        title: "Success",
        description: `${type} generated successfully`
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

  const generateBlogPost = async () => {
    if (!blogTopic.trim()) {
      toast({
        title: "Error",
        description: "Please provide a blog topic",
        variant: "destructive"
      })
      return
    }

    const prompt = `Write a ${blogStyle} blog post about "${blogTopic}". 

Requirements:
- Target length: approximately ${blogLength[0]} words
- Style: ${blogStyle}
- Include engaging headlines and subheadings
- Make it SEO-friendly
- Include a compelling introduction and conclusion
- Use bullet points or numbered lists where appropriate

Please create a well-structured, engaging blog post that provides value to readers.`

    await handleAIRequest(prompt, 'Blog post')
  }

  const generateTweets = async () => {
    if (!tweetTopic.trim()) {
      toast({
        title: "Error",
        description: "Please provide a topic for tweets",
        variant: "destructive"
      })
      return
    }

    const prompt = `Create ${tweetCount[0]} ${tweetStyle} tweets about "${tweetTopic}".

Requirements:
- Each tweet must be under 280 characters
- Style: ${tweetStyle}
- Include relevant hashtags
- Make them engaging and shareable
- Vary the format (questions, statements, tips, etc.)
- Consider including emojis where appropriate

Number each tweet and ensure they can work as standalone posts or as a thread.`

    await handleAIRequest(prompt, 'Tweet thread')
  }

  const generateScript = async () => {
    if (!scriptPurpose.trim()) {
      toast({
        title: "Error",
        description: "Please describe what the script should do",
        variant: "destructive"
      })
      return
    }

    const prompt = `Create a ${scriptType} script for the following purpose:

Purpose: ${scriptPurpose}

Requirements:
- Include proper error handling
- Add helpful comments explaining key sections
- Follow best practices for ${scriptType}
- Include usage instructions
- Make it production-ready and safe to run
- Handle edge cases appropriately

Provide the complete script with documentation.`

    await handleAIRequest(prompt, 'Script')
  }

  const generateDocument = async () => {
    if (!documentTopic.trim()) {
      toast({
        title: "Error",
        description: "Please provide a document topic",
        variant: "destructive"
      })
      return
    }

    const prompt = `Create a professional ${documentType} about "${documentTopic}".

Requirements:
- Target length: approximately ${documentLength[0]} words
- Include proper document structure with sections
- Use professional tone and formatting
- Include executive summary (if applicable)
- Add relevant data points and examples
- Structure with clear headings and subheadings
- Include actionable recommendations or conclusions

Create a comprehensive, well-organized document suitable for business use.`

    await handleAIRequest(prompt, 'Document')
  }

  const generateCreative = async () => {
    if (!creativePrompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a creative prompt",
        variant: "destructive"
      })
      return
    }

    const prompt = `Write a ${creativeType} based on this prompt: "${creativePrompt}"

Requirements:
- Tone: ${creativeTone}
- Make it engaging and well-crafted
- Include vivid descriptions and compelling characters (if applicable)
- Show don't tell where possible
- Create emotional resonance with readers
- Use literary devices appropriate to the format

Create an original, compelling piece of creative writing.`

    await handleAIRequest(prompt, 'Creative writing')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Content copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'blog' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('blog')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Blog Posts
            </CardTitle>
            <CardDescription>
              Generate engaging blog content
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'tweets' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('tweets')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="w-5 h-5" />
              Tweets
            </CardTitle>
            <CardDescription>
              Create viral social media content
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'scripts' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('scripts')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Scripts
            </CardTitle>
            <CardDescription>
              Generate automation scripts
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'documents' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('documents')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Professional documents & reports
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'creative' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('creative')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Creative
            </CardTitle>
            <CardDescription>
              Stories, poems, and creative writing
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Content Generator
            </CardTitle>
            <CardDescription>
              Create high-quality content with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="tweets">Tweet</TabsTrigger>
                <TabsTrigger value="scripts">Script</TabsTrigger>
                <TabsTrigger value="documents">Doc</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
              </TabsList>

              <TabsContent value="blog" className="space-y-4">
                <div>
                  <Label htmlFor="blog-topic">Blog Topic</Label>
                  <Input
                    id="blog-topic"
                    placeholder="e.g., 'The Future of AI in Healthcare'"
                    value={blogTopic}
                    onChange={(e) => setBlogTopic(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="blog-style">Writing Style</Label>
                  <Select value={blogStyle} onValueChange={setBlogStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blogStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Length: {blogLength[0]} words</Label>
                  <Slider
                    value={blogLength}
                    onValueChange={setBlogLength}
                    max={2000}
                    min={300}
                    step={100}
                    className="mt-2"
                  />
                </div>
                <Button onClick={generateBlogPost} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4 mr-2" />
                  )}
                  Generate Blog Post
                </Button>
              </TabsContent>

              <TabsContent value="tweets" className="space-y-4">
                <div>
                  <Label htmlFor="tweet-topic">Tweet Topic</Label>
                  <Input
                    id="tweet-topic"
                    placeholder="e.g., 'Productivity tips for remote work'"
                    value={tweetTopic}
                    onChange={(e) => setTweetTopic(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tweet-style">Tweet Style</Label>
                  <Select value={tweetStyle} onValueChange={setTweetStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tweetStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Tweets: {tweetCount[0]}</Label>
                  <Slider
                    value={tweetCount}
                    onValueChange={setTweetCount}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <Button onClick={generateTweets} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Twitter className="w-4 h-4 mr-2" />
                  )}
                  Generate Tweets
                </Button>
              </TabsContent>

              <TabsContent value="scripts" className="space-y-4">
                <div>
                  <Label htmlFor="script-type">Script Type</Label>
                  <Select value={scriptType} onValueChange={setScriptType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scriptTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="script-purpose">Script Purpose</Label>
                  <Textarea
                    id="script-purpose"
                    placeholder="Describe what the script should do... e.g., 'Backup files to cloud storage with error handling'"
                    value={scriptPurpose}
                    onChange={(e) => setScriptPurpose(e.target.value)}
                  />
                </div>
                <Button onClick={generateScript} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Code className="w-4 h-4 mr-2" />
                  )}
                  Generate Script
                </Button>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div>
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="document-topic">Document Topic</Label>
                  <Input
                    id="document-topic"
                    placeholder="e.g., 'Digital Transformation Strategy for SMBs'"
                    value={documentTopic}
                    onChange={(e) => setDocumentTopic(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Target Length: {documentLength[0]} words</Label>
                  <Slider
                    value={documentLength}
                    onValueChange={setDocumentLength}
                    max={3000}
                    min={500}
                    step={100}
                    className="mt-2"
                  />
                </div>
                <Button onClick={generateDocument} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Generate Document
                </Button>
              </TabsContent>

              <TabsContent value="creative" className="space-y-4">
                <div>
                  <Label htmlFor="creative-type">Creative Type</Label>
                  <Select value={creativeType} onValueChange={setCreativeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creativeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creative-prompt">Creative Prompt</Label>
                  <Textarea
                    id="creative-prompt"
                    placeholder="Provide a creative prompt... e.g., 'A story about a robot who discovers emotions'"
                    value={creativePrompt}
                    onChange={(e) => setCreativePrompt(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="creative-tone">Tone</Label>
                  <Select value={creativeTone} onValueChange={setCreativeTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creativeTones.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateCreative} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <PenTool className="w-4 h-4 mr-2" />
                  )}
                  Generate Creative Content
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>AI-generated content ready to use</CardDescription>
              </div>
              {result && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </div>
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
                    <p className="text-muted-foreground">Creating your content...</p>
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
                    <Wand2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Choose a content type and provide details to generate content
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}