'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FlaskConical, 
  Brain, 
  Database, 
  Settings, 
  Code, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  FileText,
  Upload,
  Cpu,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useApiMutation } from '@/hooks/use-api'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function MLDLLabModule() {
  const [activeTab, setActiveTab] = useState('builder')
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState('')
  const [executionProgress, setExecutionProgress] = useState(0)
  const [projectHistory, setProjectHistory] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const { toast } = useToast()

  // API hooks
  const { mutate: executeCommand, loading: executing } = useApiMutation()

  // Model configurations
  const [modelConfig, setModelConfig] = useState({
    modelType: 'neural-network',
    dataset: 'custom',
    targetAccuracy: 90,
    maxEpochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    useGPU: true,
    autoTune: true
  })

  const modelTypes = [
    { value: 'neural-network', label: 'Neural Network (MLP)', description: 'Multi-layer perceptron for general ML tasks' },
    { value: 'cnn', label: 'CNN', description: 'Convolutional Neural Network for image tasks' },
    { value: 'rnn', label: 'RNN/LSTM', description: 'Recurrent networks for sequence data' },
    { value: 'transformer', label: 'Transformer', description: 'Attention-based model for NLP' },
    { value: 'vision-transformer', label: 'Vision Transformer (ViT)', description: 'ViT for image classification' },
    { value: 'gan', label: 'GAN', description: 'Generative Adversarial Network' },
    { value: 'autoencoder', label: 'Autoencoder', description: 'For dimensionality reduction/generation' },
    { value: 'random-forest', label: 'Random Forest', description: 'Ensemble method for classification' },
    { value: 'svm', label: 'SVM', description: 'Support Vector Machine' },
    { value: 'clustering', label: 'Clustering', description: 'K-Means, DBSCAN for unsupervised learning' }
  ]

  const datasets = [
    { value: 'custom', label: 'Custom Upload', description: 'Upload your own dataset' },
    { value: 'cifar10', label: 'CIFAR-10', description: '60K 32x32 color images in 10 classes' },
    { value: 'mnist', label: 'MNIST', description: '70K handwritten digits 0-9' },
    { value: 'imdb', label: 'IMDB Reviews', description: '50K movie reviews for sentiment analysis' },
    { value: 'iris', label: 'Iris Dataset', description: '150 iris flower measurements' },
    { value: 'titanic', label: 'Titanic', description: 'Passenger survival prediction' },
    { value: 'housing', label: 'Boston Housing', description: 'Housing price prediction' },
    { value: 'stock-prices', label: 'Stock Prices', description: 'Historical stock data' }
  ]

  const mockProjects = [
    {
      id: '1',
      name: 'Image Classification CNN',
      type: 'cnn',
      dataset: 'cifar10',
      status: 'completed',
      accuracy: 94.2,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      command: 'Train a CNN on CIFAR-10 for image classification, reach >90% accuracy, export code for deployment',
      metrics: {
        loss: 0.18,
        valAccuracy: 94.2,
        epochs: 45,
        trainingTime: '23 minutes'
      }
    },
    {
      id: '2',
      name: 'Customer Churn Predictor',
      type: 'random-forest',
      dataset: 'custom',
      status: 'training',
      accuracy: 87.5,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      command: 'Create a customer churn prediction model using Random Forest with feature importance analysis',
      metrics: {
        precision: 0.89,
        recall: 0.86,
        f1Score: 0.875,
        trainingTime: 'In progress'
      }
    },
    {
      id: '3',
      name: 'Sentiment Analysis LSTM',
      type: 'rnn',
      dataset: 'imdb',
      status: 'failed',
      accuracy: 0,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      command: 'Build LSTM for sentiment analysis on IMDB reviews with attention mechanism',
      error: 'Out of memory error during training'
    }
  ]

  const executeMLCommand = async () => {
    if (!command.trim()) {
      toast({
        title: "Error",
        description: "Please enter a command",
        variant: "destructive"
      })
      return
    }

    setIsExecuting(true)
    setExecutionProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 10
      })
    }, 1000)

    try {
      const response = await executeCommand('/api/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `As an AI/ML expert, analyze this command and provide a detailed implementation plan:

Command: ${command}

Please provide:
1. **Project Overview**: What this command is asking to build
2. **Technical Approach**: Architecture and methodology
3. **Implementation Steps**: Detailed step-by-step process
4. **Code Structure**: File organization and key components
5. **Model Architecture**: Network design (if applicable)
6. **Training Strategy**: Hyperparameters, optimization approach
7. **Evaluation Metrics**: How to measure success
8. **Deployment Guide**: How to export and use the model
9. **Expected Results**: Timeline and accuracy expectations
10. **Code Examples**: Key code snippets for implementation

Format the response as a comprehensive technical document with code examples.`
          }],
          model: 'gemini-2.0-flash',
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      clearInterval(progressInterval)
      setExecutionProgress(100)

      const result = response.choices[0].message.content
      setExecutionResult(result)

      // Add to project history
      const newProject = {
        id: Date.now().toString(),
        name: command.substring(0, 50) + '...',
        type: modelConfig.modelType,
        dataset: modelConfig.dataset,
        status: 'completed',
        accuracy: Math.random() * 20 + 80, // Mock accuracy
        createdAt: new Date(),
        command,
        result
      }

      setProjectHistory(prev => [newProject, ...prev])

      toast({
        title: "Command Executed Successfully",
        description: "ML/DL implementation plan generated"
      })

    } catch (error) {
      clearInterval(progressInterval)
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsExecuting(false)
      setTimeout(() => setExecutionProgress(0), 2000)
    }
  }

  const exampleCommands = [
    "Train a ViT on CIFAR-10 from HuggingFace with TPU, reach ≥95% accuracy, export code",
    "Create a CNN for medical image classification with data augmentation and transfer learning",
    "Build an LSTM for stock price prediction using historical data with attention mechanism",
    "Implement a GAN for generating synthetic tabular data with privacy preservation",
    "Design a Random Forest for customer segmentation with feature importance analysis",
    "Create a transformer model for text classification with BERT fine-tuning",
    "Build an autoencoder for anomaly detection in time series data",
    "Implement a reinforcement learning agent for game playing using PPO algorithm"
  ]

  const ProjectCard = ({ project, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className={`hover:shadow-lg transition-all cursor-pointer ${
          project.status === 'completed' ? 'border-green-200' :
          project.status === 'training' ? 'border-blue-200' :
          'border-red-200'
        }`}
        onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{project.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {modelTypes.find(t => t.value === project.type)?.label || project.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {project.dataset}
                </Badge>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {project.status === 'completed' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {project.status === 'training' && (
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
              )}
              {project.status === 'failed' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <Badge 
                variant={
                  project.status === 'completed' ? 'default' :
                  project.status === 'training' ? 'secondary' :
                  'destructive'
                }
                className="text-xs"
              >
                {project.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <p className="text-muted-foreground">Accuracy</p>
              <p className="font-semibold">
                {project.status === 'completed' ? `${project.accuracy.toFixed(1)}%` : 
                 project.status === 'training' ? `${project.accuracy.toFixed(1)}%` : 
                 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-semibold">
                {project.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {project.command}
          </p>
          
          {project.status === 'training' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Training Progress</span>
                <span>{Math.floor(project.accuracy)}%</span>
              </div>
              <Progress value={project.accuracy} className="h-1" />
            </div>
          )}
          
          {project.status === 'failed' && project.error && (
            <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-xs text-red-600 dark:text-red-400">
              {project.error}
            </div>
          )}
        </CardContent>

        <AnimatePresence>
          {selectedProject?.id === project.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t"
            >
              <CardContent className="p-4">
                <div className="space-y-4">
                  {project.metrics && (
                    <div>
                      <h4 className="font-semibold mb-2">Training Metrics</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(project.metrics).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </p>
                            <p className="font-medium">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Command</h4>
                    <div className="bg-muted p-2 rounded text-sm font-mono">
                      {project.command}
                    </div>
                  </div>
                  
                  {project.result && (
                    <div>
                      <h4 className="font-semibold mb-2">Implementation Plan</h4>
                      <div className="max-h-40 overflow-y-auto prose dark:prose-invert prose-sm">
                        <ReactMarkdown>{project.result.substring(0, 500)}...</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Code className="w-3 h-3 mr-1" />
                      View Code
                    </Button>
                    {project.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Deploy
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

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-responsive-lg font-bold">AI Agent ML/DL Laboratory</h1>
          <p className="text-muted-foreground">
            Train custom models and build AI systems using natural language commands
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {mockProjects.filter(p => p.status === 'completed').length} completed
          </Badge>
          <Badge variant="outline">
            {mockProjects.filter(p => p.status === 'training').length} training
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="card-grid">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Model Builder
            </CardTitle>
            <CardDescription>
              AI-powered model architecture design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {modelTypes.length}
            </div>
            <p className="text-sm text-muted-foreground">supported architectures</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Ingestion
            </CardTitle>
            <CardDescription>
              Automated dataset processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {datasets.length}
            </div>
            <p className="text-sm text-muted-foreground">available datasets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              AutoML Lab
            </CardTitle>
            <CardDescription>
              Automated machine learning pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockProjects.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">models trained</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Success Rate
            </CardTitle>
            <CardDescription>
              Training success percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((mockProjects.filter(p => p.status === 'completed').length / mockProjects.length) * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">successful trainings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Model Builder</TabsTrigger>
          <TabsTrigger value="projects">Project History</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Natural Language Command Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Natural Language ML/DL Commands
              </CardTitle>
              <CardDescription>
                Describe what you want to build using plain English
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="ml-command">Your Command</Label>
                <Textarea
                  id="ml-command"
                  placeholder="Example: Train a ViT on CIFAR-10 from HuggingFace with TPU, reach ≥95% accuracy, export code"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    Be specific about model type, dataset, target metrics, and desired output
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {command.length}/1000
                  </span>
                </div>
              </div>
              
              {isExecuting && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">Processing command...</span>
                  </div>
                  <Progress value={executionProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Analyzing requirements and generating implementation plan
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={executeMLCommand} 
                  disabled={isExecuting || !command.trim()}
                  className="flex-1"
                >
                  {isExecuting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Execute Command
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCommand('')}
                  disabled={isExecuting}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example Commands */}
          <Card>
            <CardHeader>
              <CardTitle>Example Commands</CardTitle>
              <CardDescription>
                Click any example to try it out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exampleCommands.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setCommand(example)}
                    className="text-left p-3 border rounded-lg hover:bg-accent transition-colors text-sm"
                    disabled={isExecuting}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {executionResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Implementation Plan</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Plan
                  </Button>
                </CardTitle>
                <CardDescription>
                  AI-generated implementation strategy and code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
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
                    {executionResult}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project History</CardTitle>
              <CardDescription>
                Your ML/DL projects and training results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(projectHistory.length > 0 || mockProjects.length > 0) ? (
                <div className="space-y-4">
                  {[...projectHistory, ...mockProjects].map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FlaskConical className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your first ML/DL project using natural language commands
                  </p>
                  <Button onClick={() => setActiveTab('builder')}>
                    <Brain className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Default settings for model training and deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Model Type</Label>
                  <Select value={modelConfig.modelType} onValueChange={(value) => 
                    setModelConfig({...modelConfig, modelType: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Dataset</Label>
                  <Select value={modelConfig.dataset} onValueChange={(value) => 
                    setModelConfig({...modelConfig, dataset: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.value} value={dataset.value}>
                          <div>
                            <div className="font-medium">{dataset.label}</div>
                            <div className="text-xs text-muted-foreground">{dataset.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Target Accuracy: {modelConfig.targetAccuracy}%</Label>
                </div>
                <Slider
                  value={[modelConfig.targetAccuracy]}
                  min={70}
                  max={99}
                  step={1}
                  onValueChange={(value) => 
                    setModelConfig({...modelConfig, targetAccuracy: value[0]})
                  }
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Max Epochs</Label>
                  <Input
                    type="number"
                    min="10"
                    max="1000"
                    value={modelConfig.maxEpochs}
                    onChange={(e) => 
                      setModelConfig({...modelConfig, maxEpochs: parseInt(e.target.value)})
                    }
                  />
                </div>
                
                <div>
                  <Label>Batch Size</Label>
                  <Input
                    type="number"
                    min="1"
                    max="512"
                    value={modelConfig.batchSize}
                    onChange={(e) => 
                      setModelConfig({...modelConfig, batchSize: parseInt(e.target.value)})
                    }
                  />
                </div>
                
                <div>
                  <Label>Learning Rate</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    max="1"
                    value={modelConfig.learningRate}
                    onChange={(e) => 
                      setModelConfig({...modelConfig, learningRate: parseFloat(e.target.value)})
                    }
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Use GPU Acceleration</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable GPU training for faster performance
                  </p>
                </div>
                <Switch
                  checked={modelConfig.useGPU}
                  onCheckedChange={(checked) => 
                    setModelConfig({...modelConfig, useGPU: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-tune Hyperparameters</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically optimize hyperparameters during training
                  </p>
                </div>
                <Switch
                  checked={modelConfig.autoTune}
                  onCheckedChange={(checked) => 
                    setModelConfig({...modelConfig, autoTune: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Learning Types</CardTitle>
              <CardDescription>
                Available machine learning paradigms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Supervised Learning',
                  'Unsupervised Learning', 
                  'Reinforcement Learning',
                  'RAG Chatbots',
                  'Neural Networks',
                  'Deep Learning',
                  'Computer Vision',
                  'Natural Language Processing',
                  'Time Series Analysis'
                ].map((type, index) => (
                  <Badge key={index} variant="outline" className="justify-center p-2">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}