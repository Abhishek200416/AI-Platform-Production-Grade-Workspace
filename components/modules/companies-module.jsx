'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Search, TrendingUp, Users, DollarSign, MapPin, ExternalLink, Calendar, Star, Filter, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useDebouncedApi, useApi } from '@/hooks/use-api'
import { LoadingSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorMessage } from '@/components/ui/error-boundary'

export function CompaniesModule() {
    const [activeTab, setActiveTab] = useState('search')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState('all')
    const [selectedSize, setSelectedSize] = useState('all')
    const [sortBy, setSortBy] = useState('relevance')
    const [selectedCompany, setSelectedCompany] = useState(null)
    const { toast } = useToast()

    // API hooks
    const { data: searchResults, loading: searchLoading, error: searchError } =
        useDebouncedApi('/api/companies/search', searchTerm, 500)

    useEffect(() => {
        if (searchError) {
            toast({ title: 'Search failed', description: 'Try again in a moment.' })
        }
    }, [searchError])

    const industries = [
        { value: 'all', label: 'All Industries' },
        { value: 'technology', label: 'Technology' },
        { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
        { value: 'fintech', label: 'FinTech' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'e-commerce', label: 'E-commerce' },
        { value: 'saas', label: 'SaaS' },
        { value: 'biotech', label: 'Biotech' },
        { value: 'clean-energy', label: 'Clean Energy' }
    ]

    const companySizes = [
        { value: 'all', label: 'All Sizes' },
        { value: 'startup', label: 'Startup (1-50)' },
        { value: 'small', label: 'Small (51-200)' },
        { value: 'medium', label: 'Medium (201-1000)' },
        { value: 'large', label: 'Large (1000+)' }
    ]

    const sortOptions = [
        { value: 'relevance', label: 'Relevance' },
        { value: 'funding', label: 'Funding Amount' },
        { value: 'employees', label: 'Employee Count' },
        { value: 'founded', label: 'Founded Date' },
        { value: 'alphabetical', label: 'Alphabetical' }
    ]

    // Mock data for demonstration
    const mockCompanies = [
        {
            id: '1',
            name: 'TechFlow AI',
            industry: 'Artificial Intelligence',
            description: 'Leading AI platform provider specializing in enterprise conversational AI solutions and natural language processing.',
            employees: '250-500',
            founded: '2019',
            headquarters: 'San Francisco, CA',
            funding: {
                total: 75000000,
                stage: 'Series B',
                lastRound: 50000000,
                investors: ['Andreessen Horowitz', 'Sequoia Capital', 'GV']
            },
            website: 'https://techflowai.com',
            logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
            tags: ['AI', 'NLP', 'Enterprise', 'B2B'],
            rating: 4.8,
            growth: '+120%'
        },
        {
            id: '2',
            name: 'DataCore Analytics',
            industry: 'Technology',
            description: 'Advanced data processing and analytics platform helping businesses make data-driven decisions with real-time insights.',
            employees: '50-100',
            founded: '2020',
            headquarters: 'Austin, TX',
            funding: {
                total: 25000000,
                stage: 'Series A',
                lastRound: 15000000,
                investors: ['Kleiner Perkins', 'Index Ventures']
            },
            website: 'https://datacore.com',
            logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100',
            tags: ['Analytics', 'Big Data', 'SaaS'],
            rating: 4.6,
            growth: '+85%'
        },
        {
            id: '3',
            name: 'QuantumLeap Systems',
            industry: 'Technology',
            description: 'Quantum computing solutions for enterprise applications, focusing on optimization and machine learning acceleration.',
            employees: '100-250',
            founded: '2018',
            headquarters: 'Boston, MA',
            funding: {
                total: 120000000,
                stage: 'Series C',
                lastRound: 80000000,
                investors: ['Google Ventures', 'Intel Capital', 'Bessemer Venture Partners']
            },
            website: 'https://quantumleap.com',
            logo: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?w=100',
            tags: ['Quantum Computing', 'Enterprise', 'R&D'],
            rating: 4.9,
            growth: '+200%'
        },
        {
            id: '4',
            name: 'HealthTech Innovations',
            industry: 'Healthcare',
            description: 'Digital health platform combining AI diagnostics with telemedicine to improve patient care and clinical outcomes.',
            employees: '150-300',
            founded: '2017',
            headquarters: 'Seattle, WA',
            funding: {
                total: 45000000,
                stage: 'Series B',
                lastRound: 30000000,
                investors: ['Johnson & Johnson Innovation', 'Healthtech Capital']
            },
            website: 'https://healthtechinno.com',
            logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100',
            tags: ['HealthTech', 'AI Diagnostics', 'Telemedicine'],
            rating: 4.7,
            growth: '+95%'
        },
        {
            id: '5',
            name: 'EcoFlow Energy',
            industry: 'Clean Energy',
            description: 'Renewable energy management platform using AI to optimize solar and wind energy distribution for smart grids.',
            employees: '75-150',
            founded: '2021',
            headquarters: 'Denver, CO',
            funding: {
                total: 35000000,
                stage: 'Series A',
                lastRound: 22000000,
                investors: ['Tesla Ventures', 'Clean Energy Fund']
            },
            website: 'https://ecoflow.energy',
            logo: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100',
            tags: ['Clean Energy', 'AI', 'Smart Grid'],
            rating: 4.5,
            growth: '+150%'
        }
    ]

    const hasQuery = searchTerm.trim().length >= 2
    const currentCompanies = hasQuery ? (searchResults ?? []) : mockCompanies


    const filteredCompanies = currentCompanies.filter(company => {
        const matchesIndustry = selectedIndustry === 'all' ||
            company.industry.toLowerCase().includes(selectedIndustry) ||
            company.tags.some(tag => tag.toLowerCase().includes(selectedIndustry.toLowerCase()))

        const matchesSize = selectedSize === 'all' || (() => {
            const employeeCount = company.employees
            switch (selectedSize) {
                case 'startup': return employeeCount.includes('1-50') || employeeCount.includes('50')
                case 'small': return employeeCount.includes('50-') || employeeCount.includes('100') || employeeCount.includes('200')
                case 'medium': return employeeCount.includes('200') || employeeCount.includes('500') || employeeCount.includes('1000')
                case 'large': return employeeCount.includes('1000+') || employeeCount.includes('500+')
                default: return true
            }
        })()

        return matchesIndustry && matchesSize
    })

    const formatCurrency = (amount) => {
        if (amount >= 1000000000) {
            return `$${(amount / 1000000000).toFixed(1)}B`
        } else if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`
        }
        return `$${amount}`
    }

    const generateCompanyInsights = async (company) => {
        try {
            const response = await fetch('/api/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `Provide competitive analysis insights for ${company.name} in the ${company.industry} industry. Consider their funding of ${formatCurrency(company.funding.total)}, employee count of ${company.employees}, and focus areas: ${company.tags.join(', ')}. Include market positioning, competitive advantages, and growth potential.`
                    }],
                    model: 'gemini-2.0-flash',
                    temperature: 0.7,
                    max_tokens: 300
                })
            })

            if (!response.ok) throw new Error('Failed to generate insights')

            const data = await response.json()
            return data.choices[0].message.content
        } catch (error) {
            console.error('Insights generation failed:', error)
            return null
        }
    }

    const CompanyCard = ({ company, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedCompany(selectedCompany?.id === company.id ? null : company)}
            >
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                    {company.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <span>{company.industry}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {company.employees} employees
                                    </Badge>
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {company.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Founded</p>
                            <p className="font-semibold">{company.founded}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-semibold text-xs">{company.headquarters}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                        {company.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {company.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{company.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {company.employees && company.employees !== 'Unknown' ? (
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {company.employees}
                                </span>
                            ) : null}
                            {company.headquarters && company.headquarters !== 'Unknown' ? (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {company.headquarters.split(', ')[0]}
                                </span>
                            ) : null}
                        </div>
                        <div className="flex gap-2">
                            {company.website && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        window.open(company.website, '_blank')
                                    }}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1"
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    const insights = await generateCompanyInsights(company)
                                    if (insights) {
                                        toast({
                                            title: "AI Analysis",
                                            description: insights
                                        })
                                    }
                                }}
                            >
                                <Eye className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <AnimatePresence>
                    {selectedCompany?.id === company.id && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t"
                        >
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">All Tags</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {company.tags.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                const insights = await generateCompanyInsights(company)
                                                if (insights) {
                                                    toast({
                                                        title: "Competitive Analysis",
                                                        description: insights
                                                    })
                                                }
                                            }}
                                        >
                                            AI Analysis
                                        </Button>
                                        {company.website && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(company.website, '_blank')}
                                            >
                                                Visit Website
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


    if (searchError) {
        return (
            <div className="page-container">
                <ErrorMessage error={searchError} />
            </div>
        )
    }

    return (
        <div className="page-container space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-responsive-lg font-bold">Company Intelligence</h1>
                    <p className="text-muted-foreground">
                        Discover companies, analyze funding patterns, and gain competitive insights
                    </p>
                </div>
                <Badge variant="secondary" className="w-fit">
                    {filteredCompanies.length} companies found
                </Badge>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Search & Filter Companies
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="search">Company Search</Label>
                            <Input
                                id="search"
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Industry</Label>
                            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map((industry) => (
                                        <SelectItem key={industry.value} value={industry.value}>
                                            {industry.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Company Size</Label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {companySizes.map((size) => (
                                        <SelectItem key={size.value} value={size.value}>
                                            {size.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Sort By</Label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
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
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Company Profiles
                        </CardTitle>
                        <CardDescription>
                            Detailed company information and insights
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {filteredCompanies.length}
                        </div>
                        <p className="text-sm text-muted-foreground">companies in database</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Funding Insights
                        </CardTitle>
                        <CardDescription>
                            Investment rounds and financial data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                                filteredCompanies.reduce((sum, c) => sum + (c?.funding?.total || 0), 0)
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">total funding tracked</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Competitor Analysis
                        </CardTitle>
                        <CardDescription>
                            Compare companies and market position
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {industries.length - 1}
                        </div>
                        <p className="text-sm text-muted-foreground">industries covered</p>
                    </CardContent>
                </Card>
            </div>

            {/* Company Results */}
            <div>
                {searchLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <CardSkeleton key={i} className="h-80" />
                        ))}
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg mb-2">No companies found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm
                                    ? `No companies match your search criteria`
                                    : 'Try adjusting your filters'
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map((company, index) => (
                            <CompanyCard key={company.id} company={company} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}