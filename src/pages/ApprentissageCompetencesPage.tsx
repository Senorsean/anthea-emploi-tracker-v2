import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, BookOpen, Award, Clock, TrendingUp, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface SkillsReportData {
  skillsGap: string[];
  technicalSkills: string[];
  softSkills: string[];
  certifications: string[];
  shortTermTraining: string[];
  longTermTraining: string[];
  learningResources: Array<{
    type: string;
    name: string;
    description: string;
  }>;
  timeline: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  practicalRecommendations: string[];
  summary: string;
}

const ApprentissageCompetencesPage = () => {
  const [showResults, setShowResults] = useState(false);
  const [reportData, setReportData] = useState<SkillsReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentJobTitle: '',
    experience: '',
    teamSize: '',
    scope: '',
    currentIndustry: '',
    country: 'France',
    city: '',
    targetJobTitle: '',
    targetIndustry: '',
    language: 'French'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateReport = async () => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-skills-report', {
        body: { formData }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setReportData(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating skills report:', error);
      // Fallback data in case of error
      const fallbackData: SkillsReportData = {
        skillsGap: ['Gestion de projet agile', 'Leadership d\'équipe', 'Analyse de données'],
        technicalSkills: ['Certification PMP', 'Formation Scrum Master', 'Outils de Business Intelligence'],
        softSkills: ['Communication interpersonnelle', 'Négociation', 'Pensée stratégique'],
        certifications: ['PMP (Project Management Professional)', 'Certified Scrum Master'],
        shortTermTraining: ['Formation Leadership (5 jours)', 'Atelier Communication (2 jours)'],
        longTermTraining: ['MBA (18 mois)', 'Certification Data Analytics (6 mois)'],
        learningResources: [
          { type: 'Plateforme en ligne', name: 'LinkedIn Learning', description: 'Cours sur le management et leadership' },
          { type: 'Livre', name: 'The First 90 Days', description: 'Guide pour les nouveaux leaders' }
        ],
        timeline: {
          immediate: ['Inscription à une formation en leadership', 'Lecture de livres spécialisés'],
          shortTerm: ['Obtenir une certification Scrum Master', 'Suivre des cours en ligne'],
          longTerm: ['Considérer un MBA ou formation longue', 'Viser des certifications avancées']
        },
        practicalRecommendations: [
          'Proposer de diriger un projet pilote',
          'Rejoindre des communautés professionnelles',
          'Chercher un mentor dans le domaine cible'
        ],
        summary: 'Plan de développement structuré pour évoluer vers un poste de management avec focus sur le leadership et la gestion de projet.'
      };
      setReportData(fallbackData);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;

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

    // Title
    let yPosition = 30;
    yPosition = addText('RAPPORT DE MONTÉE EN COMPÉTENCES', margin, yPosition, 18, true);
    yPosition = addText(`De: ${formData.currentJobTitle} vers: ${formData.targetJobTitle}`, margin, yPosition + 10, 12, true);

    // Summary
    yPosition += 20;
    yPosition = addText('RÉSUMÉ EXÉCUTIF', margin, yPosition, 14, true);
    yPosition = addText(reportData.summary, margin, yPosition + 8, 10);

    // Skills Gap
    yPosition += 15;
    yPosition = addText('ÉCART DE COMPÉTENCES', margin, yPosition, 14, true);
    yPosition += 5;
    reportData.skillsGap.forEach(skill => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`• ${skill}`, margin, yPosition + 6, 10);
    });

    // Technical Skills
    yPosition += 15;
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 30;
    }
    yPosition = addText('COMPÉTENCES TECHNIQUES À DÉVELOPPER', margin, yPosition, 14, true);
    yPosition += 5;
    reportData.technicalSkills.forEach(skill => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`• ${skill}`, margin, yPosition + 6, 10);
    });

    // Certifications
    yPosition += 15;
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 30;
    }
    yPosition = addText('CERTIFICATIONS RECOMMANDÉES', margin, yPosition, 14, true);
    yPosition += 5;
    reportData.certifications.forEach(cert => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`• ${cert}`, margin, yPosition + 6, 10);
    });

    // Timeline
    yPosition += 15;
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 30;
    }
    yPosition = addText('PLANNING RECOMMANDÉ', margin, yPosition, 14, true);
    yPosition += 5;
    
    yPosition = addText('Actions immédiates:', margin, yPosition + 8, 12, true);
    reportData.timeline.immediate.forEach(action => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`• ${action}`, margin, yPosition + 6, 10);
    });

    yPosition += 10;
    yPosition = addText('Court terme (3-6 mois):', margin, yPosition, 12, true);
    reportData.timeline.shortTerm.forEach(action => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`• ${action}`, margin, yPosition + 6, 10);
    });

    yPosition += 10;
    yPosition = addText('Long terme (6-12 mois+):', margin, yPosition, 12, true);
    reportData.timeline.longTerm.forEach(action => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`• ${action}`, margin, yPosition + 6, 10);
    });

    // Learning Resources
    yPosition += 15;
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 30;
    }
    yPosition = addText('RESSOURCES D\'APPRENTISSAGE', margin, yPosition, 14, true);
    yPosition += 5;
    reportData.learningResources.forEach(resource => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`${resource.type}: ${resource.name}`, margin, yPosition + 6, 10, true);
      yPosition = addText(resource.description, margin + 5, yPosition + 4, 9);
    });

    // Practical Recommendations
    yPosition += 15;
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 30;
    }
    yPosition = addText('RECOMMANDATIONS PRATIQUES', margin, yPosition, 14, true);
    yPosition += 5;
    reportData.practicalRecommendations.forEach(rec => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      yPosition = addText(`• ${rec}`, margin, yPosition + 6, 10);
    });

    // Footer
    const currentDate = new Date().toLocaleDateString('fr-FR');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le ${currentDate}`, margin, pageHeight - 10);

    // Save the PDF
    pdf.save(`rapport-competences-${formData.currentJobTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
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

  if (showResults && reportData) {
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

        {/* Results */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Rapport de Montée en Compétences
              </h1>
              <p className="text-gray-600">
                De: {formData.currentJobTitle} vers: {formData.targetJobTitle}
              </p>
            </div>

            {/* Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#e91e63]" />
                  Résumé Exécutif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{reportData.summary}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Skills Gap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#e91e63]" />
                    Écart de Compétences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.skillsGap.map((skill, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technical Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#e91e63]" />
                    Compétences Techniques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.technicalSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Soft Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#e91e63]" />
                    Compétences Transversales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.softSkills.map((skill, index) => (
                      <Badge key={index} variant="default" className="mr-2 mb-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#e91e63]" />
                    Certifications Recommandées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportData.certifications.map((cert, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-[#e91e63] rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#e91e63]" />
                  Planning Recommandé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Actions Immédiates</h4>
                    <ul className="space-y-2">
                      {reportData.timeline.immediate.map((action, index) => (
                        <li key={index} className="text-sm text-gray-600">• {action}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Court Terme (3-6 mois)</h4>
                    <ul className="space-y-2">
                      {reportData.timeline.shortTerm.map((action, index) => (
                        <li key={index} className="text-sm text-gray-600">• {action}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Long Terme (6-12 mois+)</h4>
                    <ul className="space-y-2">
                      {reportData.timeline.longTerm.map((action, index) => (
                        <li key={index} className="text-sm text-gray-600">• {action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Ressources d'Apprentissage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.learningResources.map((resource, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{resource.type}</Badge>
                        <span className="font-semibold">{resource.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Practical Recommendations */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recommandations Pratiques</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData.practicalRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[#e91e63] text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                  setReportData(null);
                }}
                className="px-8"
              >
                Nouvelle Recherche
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              Apprentissage & Montée en compétences
            </h1>
            <p className="text-gray-600">
              Entrez vos informations pour voir les compétences recherchées et obtenir des recommandations personnalisées de cours et de certifications pour atteindre votre emploi cible.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
            {/* Current Job Title */}
            <div className="space-y-3">
              <Label htmlFor="currentJobTitle" className="text-base font-medium text-gray-900">
                Titre de poste actuel:
              </Label>
              <Input
                id="currentJobTitle"
                placeholder="p. ex. Responsable Marketing Digital"
                value={formData.currentJobTitle}
                onChange={(e) => handleInputChange('currentJobTitle', e.target.value)}
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
                min="0"
                type="number"
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

            {/* Current Industry */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Industrie / Secteur:
              </Label>
              <Select value={formData.currentIndustry} onValueChange={(value) => handleInputChange('currentIndustry', value)}>
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
                  <Input
                    id="city"
                    placeholder="p. ex. Paris, France"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Target Job Title */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-[#e91e63]" />
                <Label htmlFor="targetJobTitle" className="text-base font-medium text-gray-900">
                  Titre de poste cible:
                </Label>
              </div>
              <Input
                id="targetJobTitle"
                placeholder="p. ex. Responsable Marketing Digital"
                value={formData.targetJobTitle}
                onChange={(e) => handleInputChange('targetJobTitle', e.target.value)}
                className="h-12"
              />
            </div>

            {/* Target Industry */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-[#e91e63]" />
                <Label className="text-base font-medium text-gray-900">
                  Secteur / industrie cible:
                </Label>
              </div>
              <Select value={formData.targetIndustry} onValueChange={(value) => handleInputChange('targetIndustry', value)}>
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
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="pt-6">
              <Button 
                onClick={generateReport}
                disabled={isLoading || !formData.currentJobTitle || !formData.targetJobTitle}
                className="w-full h-14 bg-[#1a237e] hover:bg-[#1a237e]/90 text-white font-medium text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer le rapport de montée en compétences'
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApprentissageCompetencesPage;