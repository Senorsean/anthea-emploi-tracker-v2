import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MapPin, TrendingUp, DollarSign, Users, Globe, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

import { addAntheaHeader } from '@/lib/pdf-utils';

const ReferentielsSalairesPage = () => {
  const [showResults, setShowResults] = useState(false);
  const [salaryData, setSalaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    experience: '',
    teamSize: '',
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

  const calculateSalary = () => {
    // Base salaries by job title (rough estimates)
    const baseSalaries: { [key: string]: number } = {
      'dsi': 90000,
      'directeur': 85000,
      'manager': 65000,
      'développeur': 45000,
      'chef de projet': 55000,
      'commercial': 40000,
      'marketing': 45000,
      'rh': 50000,
      'comptable': 40000,
      'consultant': 55000,
      'ingénieur': 50000,
      'architecte': 70000,
      'data': 65000,
      'product': 60000,
      'designer': 45000,
    };

    // Find base salary based on job title
    const jobKey = Object.keys(baseSalaries).find(key => 
      formData.jobTitle.toLowerCase().includes(key)
    );
    let baseSalary = jobKey ? baseSalaries[jobKey] : 50000;

    // Experience multiplier
    const experience = parseInt(formData.experience) || 0;
    const experienceMultiplier = 1 + (experience * 0.05); // 5% per year

    // Team size multiplier
    const teamMultipliers: { [key: string]: number } = {
      'no': 1,
      '1-4': 1.1,
      '5-10': 1.25,
      '10+': 1.4
    };
    const teamMultiplier = teamMultipliers[formData.teamSize] || 1;

    // Scope multiplier
    const scopeMultipliers: { [key: string]: number } = {
      'national': 1,
      'regional': 1.1,
      'global': 1.3
    };
    const scopeMultiplier = scopeMultipliers[formData.scope] || 1;

    // Industry multiplier
    const industryMultipliers: { [key: string]: number } = {
      'services-professionnels': 1,
      'technologie': 1.2,
      'finance': 1.3,
      'assurance': 1.25,
      'sante': 1.1,
      'education': 0.9,
      'retail': 0.85,
      'manufacturing': 0.95,
      'consulting': 1.15,
      'automobile': 1.0,
      'aeronautique': 1.2,
      'energie': 1.15,
      'telecommunications': 1.1,
      'medias': 0.95,
      'publicite': 1.05,
      'immobilier': 1.0,
      'construction': 0.9,
      'transport': 0.88,
      'hotellerie': 0.8,
      'luxe': 1.1,
      'agroalimentaire': 0.9,
      'agriculture': 0.85,
      'chimie': 1.05,
      'environnement': 0.95,
      'recherche': 1.1,
      'juridique': 1.2,
      'public': 0.85,
      'ong': 0.75,
      'sport': 0.9,
      'culture': 0.85,
      'gaming': 1.15,
      'ecommerce': 1.1,
      'fintech': 1.35,
      'startup': 1.0,
      'securite': 0.95,
      'maritime': 1.0,
      'spatial': 1.25,
      'biotechnologie': 1.2,
      'intelligence-artificielle': 1.4,
      'blockchain': 1.3
    };
    const industryMultiplier = industryMultipliers[formData.industry] || 1;

    // Location multiplier
    const locationMultipliers: { [key: string]: number } = {
      'paris': 1.2,
      'lyon': 1.05,
      'marseille': 0.95,
      'toulouse': 0.98,
      'lille': 0.92,
      'bordeaux': 1.0,
      'nantes': 0.98,
      'strasbourg': 1.02
    };
    const cityKey = formData.city.toLowerCase();
    const locationMultiplier = locationMultipliers[cityKey] || 1;

    // Remote work adjustment
    const workModeMultipliers: { [key: string]: number } = {
      'onsite': 1,
      'hybrid': 1.05,
      'remote': 1.1
    };
    const workModeMultiplier = workModeMultipliers[formData.workMode] || 1;

    // Calculate final salary
    const finalSalary = Math.round(
      baseSalary * 
      experienceMultiplier * 
      teamMultiplier * 
      scopeMultiplier * 
      industryMultiplier * 
      locationMultiplier * 
      workModeMultiplier
    );

    // Calculate range (±20% from median)
    const minSalary = Math.round(finalSalary * 0.8);
    const maxSalary = Math.round(finalSalary * 1.2);

    // Calculate projected growth (3-8% per year based on experience and industry)
    const growthRate = experience > 10 ? 0.03 : 0.06;
    const projectedSalary = Math.round(finalSalary * (1 + growthRate * 2));
    const growthPercentage = Math.round(((projectedSalary - finalSalary) / finalSalary) * 100);

    return {
      min: minSalary,
      median: finalSalary,
      max: maxSalary,
      projected: projectedSalary,
      growth: growthPercentage
    };
  };

  const generateReport = async () => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-salary-report', {
        body: { formData }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform AI response to match existing interface
      const transformedData = {
        min: data.salaryRange.min,
        median: data.salaryRange.median,
        max: data.salaryRange.max,
        projected: data.projectedGrowth.projected,
        growth: data.projectedGrowth.percentage,
        marketPosition: data.marketPosition,
        regionalComparison: data.regionalComparison,
        factors: data.factors,
        recommendations: data.recommendations
      };

      setSalaryData(transformedData);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating salary report:', error);
      // Fallback to local calculation
      const calculatedSalary = calculateSalary();
      setSalaryData(calculatedSalary);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!salaryData) return;

    const pdf = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, textMaxWidth: number = maxWidth) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, textMaxWidth);
      pdf.text(lines, x, y);
      return y + lines.length * (fontSize * 0.5);
    };

    // Add ANTHEA header with gradient banner
    let yPosition = addAntheaHeader(pdf, 'Rapport Salarial');
    
    // Title
    yPosition = addText('RAPPORT SALARIAL', margin, yPosition, 18, true);
    yPosition = addText(`${formData.jobTitle}`, margin, yPosition + 10, 14, true);
    yPosition = addText(`${formData.experience} années d'expérience • ${formData.city}, ${formData.country}`, margin, yPosition + 5, 10);

    // Salary Range Section
    yPosition += 20;
    yPosition = addText('FOURCHETTE SALARIALE', margin, yPosition, 14, true);
    yPosition += 5;
    yPosition = addText(`Minimum: ${salaryData.min.toLocaleString()} €`, margin, yPosition + 8, 10);
    yPosition = addText(`Médiane: ${salaryData.median.toLocaleString()} €`, margin, yPosition + 6, 10, true);
    yPosition = addText(`Maximum: ${salaryData.max.toLocaleString()} €`, margin, yPosition + 6, 10);

    // Growth Projection Section
    yPosition += 15;
    yPosition = addText('CROISSANCE PROJETÉE', margin, yPosition, 14, true);
    yPosition += 5;
    yPosition = addText(`Croissance sur 2 ans: +${salaryData.growth}%`, margin, yPosition + 8, 10);
    yPosition = addText(`Salaire projeté en 2027: ${salaryData.projected.toLocaleString()} €`, margin, yPosition + 6, 10, true);

    // Market Position Section
    yPosition += 15;
    yPosition = addText('POSITION MARCHÉ', margin, yPosition, 14, true);
    yPosition += 5;
    yPosition = addText(`Secteur: ${formData.industry}`, margin, yPosition + 8, 10);
    yPosition = addText(`Équipe: ${formData.teamSize} personnes`, margin, yPosition + 6, 10);
    yPosition = addText(`Mode de travail: ${formData.workMode}`, margin, yPosition + 6, 10);

    // Regional Comparison Section
    yPosition += 15;
    yPosition = addText('COMPARAISON RÉGIONALE', margin, yPosition, 14, true);
    yPosition += 5;
    yPosition = addText(`Paris: ${Math.round(salaryData.median * 1.2).toLocaleString()} €`, margin, yPosition + 8, 10);
    yPosition = addText(`Lyon: ${Math.round(salaryData.median * 1.05).toLocaleString()} €`, margin, yPosition + 6, 10);
    yPosition = addText(`Toulouse: ${Math.round(salaryData.median * 0.98).toLocaleString()} €`, margin, yPosition + 6, 10);
    yPosition = addText(`Lille: ${Math.round(salaryData.median * 0.92).toLocaleString()} €`, margin, yPosition + 6, 10);

    // Add AI insights if available
    if (salaryData.factors) {
      yPosition += 15;
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText('FACTEURS INFLUENÇANT LE SALAIRE', margin, yPosition, 14, true);
      yPosition += 5;
      salaryData.factors.forEach((factor: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        yPosition = addText(`• ${factor}`, margin, yPosition + 6, 10);
      });
    }

    if (salaryData.recommendations) {
      yPosition += 15;
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText('RECOMMANDATIONS', margin, yPosition, 14, true);
      yPosition += 5;
      salaryData.recommendations.forEach((rec: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        yPosition = addText(`• ${rec}`, margin, yPosition + 6, 10);
      });
    }

    // Footer
    const currentDate = new Date().toLocaleDateString('fr-FR');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le ${currentDate}`, margin, pageHeight - 10);

    // Save the PDF
    pdf.save(`rapport-salarial-${formData.jobTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const teamSizeOptions = [
    { value: 'no', label: 'No' },
    { value: '1-4', label: '1-4' },
    { value: '5-10', label: '5-10' },
    { value: '10+', label: '10+' },
  ];

  const scopeOptions = [
    { value: 'national', label: 'National' },
    { value: 'regional', label: 'Régional' },
    { value: 'global', label: 'Global' },
  ];

  const workModeOptions = [
    { value: 'onsite', label: 'Onsite' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Full Remote' },
  ];

  const RadioGroup = ({ 
    options, 
    value, 
    onChange, 
    name 
  }: { 
    options: { value: string; label: string }[]; 
    value: string; 
    onChange: (value: string) => void; 
    name: string;
  }) => (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-colors ${
            value === option.value
              ? 'bg-[#e91e63] text-white border-[#e91e63]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/progression-carriere"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Progression de Carrière
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Référentiels de Salaires
            </h1>
            <p className="text-gray-600">
              Entrez vos informations pour voir les fourchettes salariales et la croissance salariale projetée.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
            {/* Job Title */}
            <div className="space-y-3">
              <Label htmlFor="jobTitle" className="text-base font-medium text-gray-900">
                Titre de poste:
              </Label>
              <Input
                id="jobTitle"
                placeholder="p. ex. Responsable Marketing Digital"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="h-12"
              />
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <Label htmlFor="experience" className="text-base font-medium text-gray-900">
                Années d'expérience:
              </Label>
              <Input
                id="experience"
                placeholder="p. ex. 5"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="h-12"
              />
            </div>

            {/* Team Management */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Gestion des membres de l'équipe:
              </Label>
              <RadioGroup
                options={teamSizeOptions}
                value={formData.teamSize}
                onChange={(value) => handleInputChange('teamSize', value)}
                name="teamSize"
              />
            </div>

            {/* Scope */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Portée:
              </Label>
              <RadioGroup
                options={scopeOptions}
                value={formData.scope}
                onChange={(value) => handleInputChange('scope', value)}
                name="scope"
              />
            </div>

            {/* Industry */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Industrie / Secteur:
              </Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Tapez ou sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="services-professionnels">Services professionnels</SelectItem>
                  <SelectItem value="technologie">Technologie & IT</SelectItem>
                  <SelectItem value="finance">Finance & Banque</SelectItem>
                  <SelectItem value="assurance">Assurance</SelectItem>
                  <SelectItem value="sante">Santé & Pharmaceutique</SelectItem>
                  <SelectItem value="education">Éducation & Formation</SelectItem>
                  <SelectItem value="retail">Commerce de détail</SelectItem>
                  <SelectItem value="manufacturing">Fabrication & Industrie</SelectItem>
                  <SelectItem value="consulting">Conseil & Audit</SelectItem>
                  <SelectItem value="automobile">Automobile</SelectItem>
                  <SelectItem value="aeronautique">Aéronautique & Défense</SelectItem>
                  <SelectItem value="energie">Énergie & Utilities</SelectItem>
                  <SelectItem value="telecommunications">Télécommunications</SelectItem>
                  <SelectItem value="medias">Médias & Communication</SelectItem>
                  <SelectItem value="publicite">Publicité & Marketing</SelectItem>
                  <SelectItem value="immobilier">Immobilier</SelectItem>
                  <SelectItem value="construction">Construction & BTP</SelectItem>
                  <SelectItem value="transport">Transport & Logistique</SelectItem>
                  <SelectItem value="hotellerie">Hôtellerie & Restauration</SelectItem>
                  <SelectItem value="luxe">Luxe & Mode</SelectItem>
                  <SelectItem value="agroalimentaire">Agroalimentaire</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="chimie">Chimie & Pétrochimie</SelectItem>
                  <SelectItem value="environnement">Environnement & Développement durable</SelectItem>
                  <SelectItem value="recherche">Recherche & Développement</SelectItem>
                  <SelectItem value="juridique">Juridique</SelectItem>
                  <SelectItem value="public">Secteur public</SelectItem>
                  <SelectItem value="ong">ONG & Associations</SelectItem>
                  <SelectItem value="sport">Sport & Loisirs</SelectItem>
                  <SelectItem value="culture">Culture & Arts</SelectItem>
                  <SelectItem value="gaming">Jeux vidéo & Gaming</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="startup">Startup & Scale-up</SelectItem>
                  <SelectItem value="securite">Sécurité & Surveillance</SelectItem>
                  <SelectItem value="maritime">Maritime & Naval</SelectItem>
                  <SelectItem value="spatial">Spatial</SelectItem>
                  <SelectItem value="biotechnologie">Biotechnologie</SelectItem>
                  <SelectItem value="intelligence-artificielle">Intelligence Artificielle</SelectItem>
                  <SelectItem value="blockchain">Blockchain & Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Localisation:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="text-sm text-gray-600 mb-2 block">
                    Pays
                  </Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Belgium">Belgique</SelectItem>
                      <SelectItem value="Switzerland">Suisse</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm text-gray-600 mb-2 block">
                    Ville
                  </Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="p. ex. Los Angeles, Californie"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="h-12 pr-10"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Mode */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Disposition de travail:
              </Label>
              <RadioGroup
                options={workModeOptions}
                value={formData.workMode}
                onChange={(value) => handleInputChange('workMode', value)}
                name="workMode"
              />
            </div>

            {/* Language */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Langue à utiliser
              </Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="pt-6">
              <Button 
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white text-base font-medium rounded-full"
                onClick={generateReport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer le rapport salarial →'
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {showResults && salaryData && (
            <div className="mt-8 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Rapport Salarial - {formData.jobTitle}
                </h2>
                <p className="text-gray-600">
                  Basé sur {formData.experience} années d'expérience à {formData.city}, {formData.country}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salary Range */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#a4007c]" />
                      Fourchette Salariale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Minimum</span>
                          <span className="font-semibold">{salaryData.min.toLocaleString()} €</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Médiane</span>
                          <span className="font-semibold text-[#a4007c]">{salaryData.median.toLocaleString()} €</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Maximum</span>
                          <span className="font-semibold">{salaryData.max.toLocaleString()} €</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Projection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#a4007c]" />
                      Croissance Projetée
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-[#a4007c]/10 rounded-lg">
                        <div className="text-2xl font-bold text-[#a4007c]">+{salaryData.growth}%</div>
                        <div className="text-sm text-gray-600">Croissance sur 2 ans</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{salaryData.projected.toLocaleString()} €</div>
                        <div className="text-sm text-gray-600">Salaire projeté en 2027</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Position */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#a4007c]" />
                      Position Marché
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Secteur:</span>
                        <span className="font-medium">{formData.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Équipe:</span>
                        <span className="font-medium">{formData.teamSize} personnes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mode:</span>
                        <span className="font-medium">{formData.workMode}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-[#a4007c]" />
                      Comparaison Régionale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Paris:</span>
                        <span className={`font-medium ${formData.city.toLowerCase() === 'paris' ? 'text-[#a4007c]' : ''}`}>
                          {Math.round(salaryData.median * 1.2).toLocaleString()} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lyon:</span>
                        <span className={`font-medium ${formData.city.toLowerCase() === 'lyon' ? 'text-[#a4007c]' : ''}`}>
                          {Math.round(salaryData.median * 1.05).toLocaleString()} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toulouse:</span>
                        <span className={`font-medium ${formData.city.toLowerCase() === 'toulouse' ? 'text-[#a4007c]' : ''}`}>
                          {Math.round(salaryData.median * 0.98).toLocaleString()} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lille:</span>
                        <span className={`font-medium ${formData.city.toLowerCase() === 'lille' ? 'text-[#a4007c]' : ''}`}>
                          {Math.round(salaryData.median * 0.92).toLocaleString()} €
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button 
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-[#a4007c] hover:bg-[#8a0067] text-white px-8"
                >
                  <Download className="h-4 w-4" />
                  Télécharger le rapport PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setSalaryData(null);
                  }}
                  className="px-8"
                >
                  Nouvelle Recherche
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReferentielsSalairesPage;