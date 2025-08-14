'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, BarChart3, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export function FileAnalyticsModule() {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [analysisResults, setAnalysisResults] = useState([])
    const [dragActive, setDragActive] = useState(false)
    const { toast } = useToast()

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback(async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFileUpload(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await handleFileUpload(e.target.files[0])
        }
    }

    const handleFileUpload = async (file) => {
        if (!file) return

        // Validate file type and size
        const allowedTypes = ['text/plain', 'text/csv', 'application/pdf']
        const maxSize = 10 * 1024 * 1024 // 10MB

        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
            toast({
                title: "Invalid File Type",
                description: "Please upload a PDF, TXT, or CSV file.",
                variant: "destructive"
            })
            return
        }

        if (file.size > maxSize) {
            toast({
                title: "File Too Large",
                description: "Please upload a file smaller than 10MB.",
                variant: "destructive"
            })
            return
        }

        setUploading(true)
        setProgress(0)

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            const response = await fetch('/api/files/analyze', {
                method: 'POST',
                body: formData
            })

            clearInterval(progressInterval)
            setProgress(100)

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const result = await response.json()

            setAnalysisResults(prev => [result, ...prev])

            toast({
                title: "File Analyzed Successfully",
                description: `${file.name} has been processed and analyzed.`
            })

        } catch (error) {
            toast({
                title: "Upload Failed",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setUploading(false)
            setTimeout(() => setProgress(0), 2000)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString()
    }

    return (
        <div className="p-6 space-y-6">
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            PDF Analysis
                        </CardTitle>
                        <CardDescription>
                            Extract text, metadata, and summaries from PDFs
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5" />
                            CSV Processing
                        </CardTitle>
                        <CardDescription>
                            Analyze data, generate insights, and visualizations
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Text Analytics
                        </CardTitle>
                        <CardDescription>
                            Token counts, sentiment analysis, and summaries
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* File Upload Area */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        File Upload & Analysis
                    </CardTitle>
                    <CardDescription>
                        Upload files for comprehensive analysis and insights
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".pdf,.txt,.csv"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />

                        <AnimatePresence mode="wait">
                            {uploading ? (
                                <motion.div
                                    key="uploading"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="space-y-4"
                                >
                                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                                    <p className="text-lg font-medium">Analyzing File...</p>
                                    <div className="max-w-md mx-auto">
                                        <Progress value={progress} className="h-2" />
                                        <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-lg font-medium mb-2">Drag & drop files here</p>
                                    <p className="text-muted-foreground mb-4">
                                        Supports PDF, TXT, CSV files up to 10MB
                                    </p>
                                    <Button onClick={() => document.getElementById('file-upload').click()}>
                                        Browse Files
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Analysis Results
                        </CardTitle>
                        <CardDescription>
                            Recent file analysis results and statistics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analysisResults.map((result) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                {result.type?.includes('pdf') ? (
                                                    <FileText className="w-5 h-5 text-primary" />
                                                ) : result.type?.includes('csv') ? (
                                                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{result.filename}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Analyzed {formatDate(result.uploadedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Complete
                                        </Badge>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">Summary</h4>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {result.summary}
                                        </p>
                                    </div>

                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}