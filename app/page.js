'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Code, 
  FileText, 
  PenTool, 
  Info, 
  Newspaper, 
  Bot, 
  Settings, 
  Building2,
  FlaskConical,
  Menu,
  X,
  Moon,
  Sun,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChatModule } from '@/components/modules/chat-module'
import { TechnicalModule } from '@/components/modules/technical-module'
import { FileAnalyticsModule } from '@/components/modules/file-analytics-module'
import { CreateModule } from '@/components/modules/create-module'
import { InfoModule } from '@/components/modules/info-module'
import { NewsModule } from '@/components/modules/news-module'
import { AIsModule } from '@/components/modules/ais-module'
import { SystemUsageModule } from '@/components/modules/system-usage-module'
import { CompaniesModule } from '@/components/modules/companies-module'
import { MLDLLabModule } from '@/components/modules/mldl-lab-module'
import { SettingsPanel } from '@/components/settings-panel'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const modules = [
  { 
    id: 'chat', 
    name: 'Chat', 
    icon: MessageSquare, 
    description: 'Free-form AI chat with session memory',
    component: ChatModule,
    status: 'active'
  },
  { 
    id: 'technical', 
    name: 'Technical', 
    icon: Code, 
    description: 'Code gen, debugging, regex, system-design',
    component: TechnicalModule,
    status: 'active'
  },
  { 
    id: 'file-analytics', 
    name: 'File Analytics', 
    icon: FileText, 
    description: 'Upload PDF/TXT/CSV for analysis',
    component: FileAnalyticsModule,
    status: 'active'
  },
  { 
    id: 'create', 
    name: 'Create', 
    icon: PenTool, 
    description: 'Generate blogs, tweets, scripts, docs',
    component: CreateModule,
    status: 'active'
  },
  { 
    id: 'info', 
    name: 'Info', 
    icon: Info, 
    description: 'Factual Q&A / knowledge retrieval',
    component: InfoModule,
    status: 'active'
  },
  { 
    id: 'news', 
    name: 'News', 
    icon: Newspaper, 
    description: 'Fetch & AI-summarize live news',
    component: NewsModule,
    status: 'active'
  },
  { 
    id: 'companies', 
    name: 'Companies', 
    icon: Building2, 
    description: 'Profiles, funding, competitor insights',
    component: CompaniesModule,
    status: 'active'
  },
  { 
    id: 'ais', 
    name: 'AIs', 
    icon: Bot, 
    description: 'Discover & compare AI endpoints',
    component: AIsModule,
    status: 'active'
  },
  { 
    id: 'system-usage', 
    name: 'System Usage', 
    icon: Settings, 
    description: 'API keys, usage stats, cost estimates',
    component: SystemUsageModule,
    status: 'active'
  },
  { 
    id: 'mldl-lab', 
    name: 'AI Agent ML/DL Lab', 
    icon: FlaskConical, 
    description: 'Plain-English model builder & trainer',
    component: MLDLLabModule,
    status: 'active'
  }
]

export default function AIPllatform() {
  const [activeModule, setActiveModule] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [systemAlert, setSystemAlert] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Auto-open sidebar on larger screens
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  const ActiveComponent = modules.find(m => m.id === activeModule)?.component || ChatModule

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  }

  const contentVariants = {
    enter: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 }
    },
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.3 }
    }
  }

  if (!mounted) return null

  return (
    <ErrorBoundary>
      <div className="h-screen bg-background text-foreground flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          variants={sidebarVariants}
          animate={sidebarOpen ? "open" : "closed"}
          className="fixed lg:relative lg:translate-x-0 w-80 h-full bg-sidebar border-r border-border z-50 flex flex-col shadow-lg"
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    AI Platform
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium">
                    Production-Grade Workspace
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-accent"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <nav className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon
                const isActive = activeModule === module.id
                
                return (
                  <motion.button
                    key={module.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveModule(module.id)
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false)
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : 'hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-primary-foreground/10' 
                          : 'bg-accent/50 group-hover:bg-accent'
                      }`}>
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-primary-foreground' : ''
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate flex items-center gap-2">
                          {module.name}
                          {module.status === 'active' && (
                            <div className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-primary-foreground/70' : 'bg-green-500'
                            } animate-pulse`} />
                          )}
                        </div>
                        <div className={`text-xs truncate mt-1 transition-colors ${
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {module.description}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 top-1/2 w-1 h-8 bg-primary-foreground rounded-full transform -translate-y-1/2"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2 hover:bg-accent"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hover:bg-accent"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mt-3 p-2 bg-accent/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-accent"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold">
                  {modules.find(m => m.id === activeModule)?.name || 'Chat'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {modules.find(m => m.id === activeModule)?.description || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Online</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                v2.0.0
              </Badge>
            </div>
          </header>

          {/* System Alert */}
          <AnimatePresence>
            {systemAlert && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-border bg-yellow-50 dark:bg-yellow-950/20"
              >
                <Alert className="rounded-none border-0">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      System maintenance scheduled for tonight at 2:00 AM UTC. 
                      Expected downtime: 30 minutes.
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSystemAlert(false)}
                      className="hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <main className="flex-1 overflow-hidden bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <ErrorBoundary
                  fallback={(error, retry) => (
                    <div className="flex items-center justify-center h-full p-6">
                      <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                          </div>
                          <CardTitle>Module Error</CardTitle>
                          <CardDescription>
                            The {modules.find(m => m.id === activeModule)?.name} module encountered an error
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {error?.message || 'An unexpected error occurred'}
                          </p>
                          <div className="flex gap-3">
                            <Button onClick={retry} className="flex-1">
                              Try Again
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setActiveModule('chat')} 
                              className="flex-1"
                            >
                              Go to Chat
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                >
                  <ActiveComponent />
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Settings Panel */}
        <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </ErrorBoundary>
  )
}