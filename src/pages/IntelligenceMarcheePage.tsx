import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingUp, Users, Globe, Loader2, Download, Target, BarChart3, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { frenchRegions } from '@/data/regions';
import { addAntheaHeader } from '@/lib/pdf-utils';

const IntelligenceMarcheePage = () => {
  const [showResults, setShowResults] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    experience: '',
    teamSize: 'No',
    scope: '',
    industry: '',
    country: 'France',
    city: '',
    workMode: '',
    language: 'French'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateMarketIntelligence = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-market-intelligence', {
        body: formData
      });

      if (error) throw error;

      setMarketData(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating market intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    // Add ANTHEA header with gradient banner
    let yPosition = addAntheaHeader(pdf, 'Analyse complète de votre CV');
    
    // Form data summary
    pdf.setFontSize(12);
    pdf.text(`Poste: ${formData.jobTitle}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Expérience: ${formData.experience} ans`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Gestion d'équipe: ${formData.teamSize}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Portée: ${formData.scope}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Industrie: ${formData.industry}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Localisation: ${formData.city}, ${formData.country}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Mode de travail: ${formData.workMode}`, 20, yPosition);
    
    yPosition += 20;
    const pageWidth = 170;
    const lineHeight = 5;
    
    // Helper function to split text and handle page breaks
    const addSection = (title: string, content: string) => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Add section title
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, 20, yPosition);
      yPosition += 10;
      
      // Add section content
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const lines = pdf.splitTextToSize(content, pageWidth);
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page during content
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(lines[i], 20, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += 10; // Add space between sections
    };
    
    // Market intelligence sections
    if (marketData) {
      if (marketData.marketOverview) {
        addSection('Vue d\'ensemble du marché', marketData.marketOverview);
      }
      
      if (marketData.trends) {
        addSection('Tendances du marché', marketData.trends);
      }
      
      if (marketData.opportunities) {
        addSection('Opportunités et recommandations', marketData.opportunities);
      }
      
      if (marketData.competitiveAnalysis) {
        addSection('Analyse concurrentielle', marketData.competitiveAnalysis);
      }
      
      if (marketData.skillsInDemand) {
        addSection('Compétences recherchées', marketData.skillsInDemand);
      }
      
      // Add footer with generation date
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${i}/${pageCount}`, 20, 290);
      }
    }
    
    pdf.save(`rapport-intelligence-marche-${formData.jobTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const industries = [
    'Services professionnels',
    'Technologie & IT',
    'Finance & Banque',
    'Assurance',
    'Santé & Pharmaceutique',
    'Éducation & Formation',
    'Commerce de détail',
    'Fabrication & Industrie',
    'Conseil & Audit',
    'Automobile',
    'Aéronautique & Défense',
    'Énergie & Utilities',
    'Télécommunications',
    'Médias & Communication',
    'Publicité & Marketing',
    'Immobilier',
    'Construction & BTP',
    'Transport & Logistique',
    'Hôtellerie & Restauration',
    'Luxe & Mode',
    'Agroalimentaire',
    'Agriculture',
    'Chimie & Pétrochimie',
    'Environnement & Développement durable',
    'Recherche & Développement',
    'Juridique',
    'Secteur public',
    'ONG & Associations',
    'Sport & Loisirs',
    'Culture & Arts',
    'Jeux vidéo & Gaming',
    'E-commerce',
    'FinTech',
    'Startup & Scale-up',
    'Sécurité & Surveillance',
    'Maritime & Naval',
    'Spatial',
    'Biotechnologie',
    'Intelligence Artificielle',
    'Blockchain & Crypto'
  ];

  if (showResults && marketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowResults(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au formulaire
            </Button>
            <Button onClick={downloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Télécharger le rapport
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Rapport Intelligence de Marché
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Poste analysé</p>
                    <p className="font-medium">{formData.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expérience</p>
                    <p className="font-medium">{formData.experience} ans</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industrie</p>
                    <p className="font-medium">{formData.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Localisation</p>
                    <p className="font-medium">{formData.city}, {formData.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {marketData.marketOverview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Vue d'ensemble du marché
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{marketData.marketOverview}</p>
                </CardContent>
              </Card>
            )}

            {marketData.trends && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendances du marché
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{marketData.trends}</p>
                </CardContent>
              </Card>
            )}

            {marketData.opportunities && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Opportunités et recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{marketData.opportunities}</p>
                </CardContent>
              </Card>
            )}

            {marketData.competitiveAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Analyse concurrentielle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{marketData.competitiveAnalysis}</p>
                </CardContent>
              </Card>
            )}

            {marketData.skillsInDemand && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Compétences recherchées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{marketData.skillsInDemand}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-center mb-2">Intelligence de Marché</h1>
          <p className="text-gray-600 text-center">
            Entrez vos informations pour voir vos informations personnalisées sur le Marché.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Titre de poste:</Label>
              <Input
                id="jobTitle"
                placeholder="p. ex. Responsable Marketing Digital"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Années d'expérience:</Label>
              <Input
                id="experience"
                placeholder="p. ex. 5"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Gestion des membres de l'équipe:</Label>
              <div className="flex gap-2">
                {['No', '1-4', '5-10', '10+'].map((size) => (
                  <Button
                    key={size}
                    variant={formData.teamSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('teamSize', size)}
                    className="flex-1"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Portée:</Label>
              <div className="flex gap-2">
                {['National', 'Regional', 'Global'].map((scope) => (
                  <Button
                    key={scope}
                    variant={formData.scope === scope ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('scope', scope)}
                    className="flex-1"
                  >
                    {scope}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industrie / Secteur:</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tapez ou sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pays</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tapez ou sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Belgique">Belgique</SelectItem>
                    <SelectItem value="Suisse">Suisse</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="p. ex. Los Angeles, Californie"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Disposition de travail:</Label>
              <div className="flex gap-2">
                {['Onsite', 'Hybrid', 'Full Remote'].map((mode) => (
                  <Button
                    key={mode}
                    variant={formData.workMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('workMode', mode)}
                    className="flex-1"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Langue à utiliser</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateMarketIntelligence}
              disabled={isLoading || !formData.jobTitle || !formData.experience || !formData.industry || !formData.city}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  Générer le rapport Intelligence de Marché
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntelligenceMarcheePage;