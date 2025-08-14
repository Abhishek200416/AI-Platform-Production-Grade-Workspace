'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Bug, Regex, Layers, Send, Copy, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function TechnicalModule() {
  const [activeTab, setActiveTab] = useState('code-gen')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Code Generation State
  const [codeRequest, setCodeRequest] = useState('')
  const [language, setLanguage] = useState('javascript')
  
  // Debugging State
  const [buggyCode, setBuggyCode] = useState('')
  const [debugLanguage, setDebugLanguage] = useState('javascript')
  
  // Regex State
  const [regexPattern, setRegexPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [regexFlags, setRegexFlags] = useState('g')
  
  // System Design State
  const [systemQuery, setSystemQuery] = useState('')

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'php', label: 'PHP' }
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
          temperature: 0.3,
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

  const generateCode = async () => {
    if (!codeRequest.trim()) {
      toast({
        title: "Error",
        description: "Please describe what code you want to generate",
        variant: "destructive"
      })
      return
    }

    const prompt = `Generate ${language} code for the following request. Provide clean, well-commented, production-ready code with proper error handling where applicable:

Request: ${codeRequest}

Please format your response with proper code blocks and explanations.`

    await handleAIRequest(prompt, 'Code generation')
  }

  const debugCode = async () => {
    if (!buggyCode.trim()) {
      toast({
        title: "Error",
        description: "Please provide the code you want to debug",
        variant: "destructive"
      })
      return
    }

    const prompt = `Debug the following ${debugLanguage} code. Identify issues, explain what's wrong, and provide the corrected version:

\`\`\`${debugLanguage}
${buggyCode}
\`\`\`

Please explain:
1. What issues you found
2. Why they occur
3. The corrected code
4. Best practices to avoid similar issues`

    await handleAIRequest(prompt, 'Code debugging')
  }

  const buildRegex = async () => {
    if (!regexPattern.trim()) {
      toast({
        title: "Error",
        description: "Please describe what pattern you want to match",
        variant: "destructive"
      })
      return
    }

    const prompt = `Create a regular expression for the following requirement:

Requirement: ${regexPattern}
${testString ? `Test string: "${testString}"` : ''}

Please provide:
1. The regex pattern
2. Explanation of how it works
3. Example matches
4. Common variations or edge cases
5. JavaScript code example showing how to use it`

    await handleAIRequest(prompt, 'Regex building')
  }

  const designSystem = async () => {
    if (!systemQuery.trim()) {
      toast({
        title: "Error",
        description: "Please describe the system you want to design",
        variant: "destructive"
      })
      return
    }

    const prompt = `Provide a system design for the following requirement:

System: ${systemQuery}

Please include:
1. High-level architecture overview
2. Key components and their responsibilities
3. Data flow and interactions
4. Technology stack recommendations
5. Scalability considerations
6. Potential challenges and solutions
7. Database design (if applicable)
8. API design (if applicable)`

    await handleAIRequest(prompt, 'System design')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Result copied to clipboard"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'code-gen' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('code-gen')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Generation
            </CardTitle>
            <CardDescription>
              Generate code in any programming language
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'debug' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('debug')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Debugging
            </CardTitle>
            <CardDescription>
              Debug and fix code issues
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'regex' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('regex')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Regex className="w-5 h-5" />
              Regex Builder
            </CardTitle>
            <CardDescription>
              Create and test regular expressions
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            activeTab === 'system' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setActiveTab('system')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              System Design
            </CardTitle>
            <CardDescription>
              System design Q&A and architecture
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Assistant</CardTitle>
            <CardDescription>
              Get AI-powered help with your technical challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="code-gen">Code</TabsTrigger>
                <TabsTrigger value="debug">Debug</TabsTrigger>
                <TabsTrigger value="regex">Regex</TabsTrigger>
                <TabsTrigger value="system">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="code-gen" className="space-y-4">
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="code-request">Code Request</Label>
                  <Textarea
                    id="code-request"
                    placeholder="Describe what code you want to generate... e.g., 'Create a function to sort an array of objects by a specific property'"
                    value={codeRequest}
                    onChange={(e) => setCodeRequest(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={generateCode} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Code className="w-4 h-4 mr-2" />
                  )}
                  Generate Code
                </Button>
              </TabsContent>

              <TabsContent value="debug" className="space-y-4">
                <div>
                  <Label htmlFor="debug-language">Programming Language</Label>
                  <Select value={debugLanguage} onValueChange={setDebugLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="buggy-code">Code to Debug</Label>
                  <Textarea
                    id="buggy-code"
                    placeholder="Paste your buggy code here..."
                    value={buggyCode}
                    onChange={(e) => setBuggyCode(e.target.value)}
                    className="min-h-[150px] font-mono"
                  />
                </div>
                <Button onClick={debugCode} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bug className="w-4 h-4 mr-2" />
                  )}
                  Debug Code
                </Button>
              </TabsContent>

              <TabsContent value="regex" className="space-y-4">
                <div>
                  <Label htmlFor="regex-pattern">Pattern Description</Label>
                  <Textarea
                    id="regex-pattern"
                    placeholder="Describe what you want to match... e.g., 'Email addresses with validation'"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="test-string">Test String (Optional)</Label>
                  <Input
                    id="test-string"
                    placeholder="Text to test the regex against"
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                  />
                </div>
                <Button onClick={buildRegex} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Regex className="w-4 h-4 mr-2" />
                  )}
                  Build Regex
                </Button>
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <div>
                  <Label htmlFor="system-query">System Description</Label>
                  <Textarea
                    id="system-query"
                    placeholder="Describe the system you want to design... e.g., 'A real-time chat application for 1M users'"
                    value={systemQuery}
                    onChange={(e) => setSystemQuery(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <Button onClick={designSystem} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Layers className="w-4 h-4 mr-2" />
                  )}
                  Design System
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
                <CardTitle>Results</CardTitle>
                <CardDescription>AI-generated technical assistance</CardDescription>
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
                    <p className="text-muted-foreground">AI is processing your request...</p>
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
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
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
                      }
                    }}
                  >
                    {result}
                  </ReactMarkdown>
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
                    <Code className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Select a feature and submit your request to get started
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