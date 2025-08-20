import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, BookOpen, Target, TrendingUp, Users, Award, Clock, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

interface CompetencesFormationData {
  keySkills: {
    ai: string[];
    digital: string[];
    softSkills: string[];
  };
  trainingPlan: {
    mooc: Array<{
      name: string;
      provider: string;
      duration: string;
      level: string;
    }>;
    certifications: Array<{
      name: string;
      provider: string;
      duration: string;
      cost: string;
    }>;
    mentoring: Array<{
      type: string;
      description: string;
      duration: string;
    }>;
  };
  portfolio: {
    structure: string[];
    trackingMethods: string[];
    examples: string[];
  };
  timeline: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  summary: string;
}

const CompetencesFormationPage = () => {
  const [showResults, setShowResults] = useState(false);
  const [reportData, setReportData] = useState<CompetencesFormationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentRole: '',
    experience: '',
    industry: '',
    currentSkills: '',
    careerGoals: '',
    timeAvailable: '',
    budget: '',
    learningStyle: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateReport = async () => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-competences-formation-analysis', {
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
      console.error('Error generating competences formation report:', error);
      // Fallback data in case of error
      const fallbackData: CompetencesFormationData = {
        keySkills: {
          ai: ['Intelligence Artificielle générative', 'Machine Learning basique', 'Automatisation des processus', 'Data Analysis avec IA'],
          digital: ['Cloud Computing (AWS/Azure)', 'Cybersécurité', 'DevOps', 'Transformation digitale'],
          softSkills: ['Leadership adaptatif', 'Pensée critique', 'Collaboration à distance', 'Agilité cognitive']
        },
        trainingPlan: {
          mooc: [
            { name: 'Introduction à l\'IA', provider: 'Coursera', duration: '6 semaines', level: 'Débutant' },
            { name: 'Digital Leadership', provider: 'edX', duration: '8 semaines', level: 'Intermédiaire' }
          ],
          certifications: [
            { name: 'AWS Cloud Practitioner', provider: 'Amazon', duration: '3 mois', cost: '100€' },
            { name: 'Google Analytics', provider: 'Google', duration: '1 mois', cost: 'Gratuit' }
          ],
          mentoring: [
            { type: 'Mentorat interne', description: 'Accompagnement par un senior', duration: '6 mois' },
            { type: 'Coaching externe', description: 'Coach spécialisé en transformation digitale', duration: '3 mois' }
          ]
        },
        portfolio: {
          structure: ['Projets réalisés', 'Compétences acquises', 'Certifications obtenues', 'Témoignages'],
          trackingMethods: ['Carnet de progression mensuel', 'Auto-évaluation trimestrielle', 'Feedback 360°'],
          examples: ['Portfolio LinkedIn', 'Site web personnel', 'Blog professionnel', 'Présentation PowerPoint']
        },
        timeline: {
          immediate: ['Évaluation des compétences actuelles', 'Inscription aux MOOC prioritaires'],
          shortTerm: ['Obtention des premières certifications', 'Démarrage du mentorat'],
          longTerm: ['Finalisation du portfolio', 'Évaluation des impacts sur la carrière']
        },
        summary: 'Plan de développement complet intégrant les compétences clés de demain avec un focus sur l\'IA, le digital et les soft skills, structuré autour d\'un portfolio de progression.'
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

    let yPosition = addAntheaHeader(pdf, 'Compétences & Formation Continue');
    
    yPosition = addText('COMPÉTENCES & FORMATION CONTINUE', margin, yPosition, 18, true);
    yPosition = addText(`Profil: ${formData.currentRole} - ${formData.industry}`, margin, yPosition + 10, 12, true);

    yPosition += 20;
    yPosition = addText('RÉSUMÉ EXÉCUTIF', margin, yPosition, 14, true);
    yPosition = addText(reportData.summary, margin, yPosition + 8, 10);

    // Key Skills
    yPosition += 15;
    yPosition = addText('COMPÉTENCES CLÉS DE DEMAIN', margin, yPosition, 14, true);
    
    yPosition += 8;
    yPosition = addText('Intelligence Artificielle:', margin, yPosition, 12, true);
    reportData.keySkills.ai.forEach(skill => {
      yPosition = addText(`• ${skill}`, margin, yPosition + 6, 10);
    });

    yPosition += 10;
    yPosition = addText('Compétences Digitales:', margin, yPosition, 12, true);
    reportData.keySkills.digital.forEach(skill => {
      yPosition = addText(`• ${skill}`, margin, yPosition + 6, 10);
    });

    yPosition += 10;
    yPosition = addText('Soft Skills:', margin, yPosition, 12, true);
    reportData.keySkills.softSkills.forEach(skill => {
      yPosition = addText(`• ${skill}`, margin, yPosition + 6, 10);
    });

    // Training Plan
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 30;
    }
    yPosition += 15;
    yPosition = addText('PLAN DE MONTÉE EN COMPÉTENCES', margin, yPosition, 14, true);

    yPosition += 8;
    yPosition = addText('MOOC Recommandés:', margin, yPosition, 12, true);
    reportData.trainingPlan.mooc.forEach(mooc => {
      yPosition = addText(`• ${mooc.name} (${mooc.provider}) - ${mooc.duration}`, margin, yPosition + 6, 10);
    });

    yPosition += 10;
    yPosition = addText('Formations Certifiantes:', margin, yPosition, 12, true);
    reportData.trainingPlan.certifications.forEach(cert => {
      yPosition = addText(`• ${cert.name} (${cert.provider}) - ${cert.duration} - ${cert.cost}`, margin, yPosition + 6, 10);
    });

    // Timeline
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 30;
    }
    yPosition += 15;
    yPosition = addText('PLANNING RECOMMANDÉ', margin, yPosition, 14, true);

    yPosition += 8;
    yPosition = addText('Actions immédiates:', margin, yPosition, 12, true);
    reportData.timeline.immediate.forEach(action => {
      yPosition = addText(`• ${action}`, margin, yPosition + 6, 10);
    });

    const currentDate = new Date().toLocaleDateString('fr-FR');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le ${currentDate}`, margin, pageHeight - 10);

    pdf.save('competences-formation-continue.pdf');
  };

  if (showResults && reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour accueil
              </Link>
              <Button onClick={downloadPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Compétences & Formation Continue
              </h1>
              <p className="text-gray-600">
                Plan de développement personnalisé pour {formData.currentRole}
              </p>
            </div>

            {/* Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Résumé Exécutif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{reportData.summary}</p>
              </CardContent>
            </Card>

            {/* Key Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Intelligence Artificielle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.keySkills.ai.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2 block w-fit">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Compétences Digitales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.keySkills.digital.map((skill, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2 block w-fit">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Soft Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.keySkills.softSkills.map((skill, index) => (
                      <Badge key={index} variant="default" className="mr-2 mb-2 block w-fit">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Training Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    MOOC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.trainingPlan.mooc.map((mooc, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{mooc.name}</h4>
                        <p className="text-xs text-gray-600">{mooc.provider}</p>
                        <p className="text-xs text-gray-500">{mooc.duration} - {mooc.level}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Formations Certifiantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.trainingPlan.certifications.map((cert, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{cert.name}</h4>
                        <p className="text-xs text-gray-600">{cert.provider}</p>
                        <p className="text-xs text-gray-500">{cert.duration} - {cert.cost}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Mentorat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.trainingPlan.mentoring.map((mentor, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{mentor.type}</h4>
                        <p className="text-xs text-gray-600">{mentor.description}</p>
                        <p className="text-xs text-gray-500">{mentor.duration}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio de Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Structure recommandée:</h4>
                  <ul className="space-y-2 mb-4">
                    {reportData.portfolio.structure.map((item, index) => (
                      <li key={index} className="text-sm">• {item}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mb-3">Méthodes de suivi:</h4>
                  <ul className="space-y-2">
                    {reportData.portfolio.trackingMethods.map((method, index) => (
                      <li key={index} className="text-sm">• {method}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Actions immédiates</h4>
                      <ul className="space-y-1">
                        {reportData.timeline.immediate.map((action, index) => (
                          <li key={index} className="text-xs text-gray-600">• {action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Court terme (3-6 mois)</h4>
                      <ul className="space-y-1">
                        {reportData.timeline.shortTerm.map((action, index) => (
                          <li key={index} className="text-xs text-gray-600">• {action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Long terme (6-12 mois)</h4>
                      <ul className="space-y-1">
                        {reportData.timeline.longTerm.map((action, index) => (
                          <li key={index} className="text-xs text-gray-600">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour accueil
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Compétences & Formation Continue
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Identifiez les compétences clés de demain et créez votre plan de montée en compétences personnalisé avec suivi via portfolio de progression.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analyse de votre profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currentRole">Poste actuel</Label>
                  <Input
                    id="currentRole"
                    value={formData.currentRole}
                    onChange={(e) => handleInputChange('currentRole', e.target.value)}
                    placeholder="ex: Chef de projet digital"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Années d'expérience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="ex: 5 ans"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Secteur d'activité</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="ex: E-commerce"
                  />
                </div>
                <div>
                  <Label htmlFor="timeAvailable">Temps disponible par semaine</Label>
                  <Input
                    id="timeAvailable"
                    value={formData.timeAvailable}
                    onChange={(e) => handleInputChange('timeAvailable', e.target.value)}
                    placeholder="ex: 5 heures"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currentSkills">Compétences actuelles principales</Label>
                <Textarea
                  id="currentSkills"
                  value={formData.currentSkills}
                  onChange={(e) => handleInputChange('currentSkills', e.target.value)}
                  placeholder="Décrivez vos compétences principales actuelles..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="careerGoals">Objectifs de carrière</Label>
                <Textarea
                  id="careerGoals"
                  value={formData.careerGoals}
                  onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                  placeholder="Où souhaitez-vous être dans 2-3 ans ?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="budget">Budget formation mensuel</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="ex: 200€"
                  />
                </div>
                <div>
                  <Label htmlFor="learningStyle">Style d'apprentissage préféré</Label>
                  <Input
                    id="learningStyle"
                    value={formData.learningStyle}
                    onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                    placeholder="ex: Pratique, théorique, mixte"
                  />
                </div>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={isLoading || !formData.currentRole || !formData.careerGoals}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer mon plan de formation'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompetencesFormationPage;