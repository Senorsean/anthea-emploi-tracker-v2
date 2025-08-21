import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Download, Loader2, Palette, Users, Briefcase, Calculator, Wrench, FlaskConical, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const IRMR3Page = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState({
    artistique: '',
    contact: '',
    entreprise: '',
    gestion: '',
    manuel: '',
    sciences: '',
    social: '',
    experience: '',
    motivations: '',
    objectifs: ''
  });
  const [analysis, setAnalysis] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const domains = [
    {
      key: 'artistique',
      title: 'Artistique',
      icon: Palette,
      description: 'Créativité, expression artistique, innovation, esthétique',
      questions: [
        'Êtes-vous attiré(e) par les activités créatives et artistiques ?',
        'Aimez-vous créer, concevoir, imaginer de nouvelles choses ?',
        'Vous sentez-vous à l\'aise dans des environnements créatifs ?'
      ]
    },
    {
      key: 'contact',
      title: 'Contact',
      icon: Users,
      description: 'Relations interpersonnelles, communication, interaction sociale',
      questions: [
        'Appréciez-vous d\'être en contact direct avec les gens ?',
        'Êtes-vous à l\'aise pour communiquer et échanger ?',
        'Aimez-vous les métiers orientés vers la relation client ?'
      ]
    },
    {
      key: 'entreprise',
      title: 'Entreprise',
      icon: Briefcase,
      description: 'Leadership, prise de décision, développement d\'affaires',
      questions: [
        'Êtes-vous intéressé(e) par la création et le développement d\'entreprises ?',
        'Aimez-vous prendre des initiatives et des risques calculés ?',
        'Vous sentez-vous capable de diriger et motiver une équipe ?'
      ]
    },
    {
      key: 'gestion',
      title: 'Gestion',
      icon: Calculator,
      description: 'Organisation, planification, administration, coordination',
      questions: [
        'Appréciez-vous organiser, planifier et structurer les activités ?',
        'Êtes-vous à l\'aise avec la gestion administrative ?',
        'Aimez-vous coordonner des projets et des équipes ?'
      ]
    },
    {
      key: 'manuel',
      title: 'Manuel',
      icon: Wrench,
      description: 'Travail concret, manipulation d\'outils, réalisation pratique',
      questions: [
        'Préférez-vous les activités concrètes et pratiques ?',
        'Êtes-vous habile de vos mains et aimez-vous manipuler des outils ?',
        'Vous sentez-vous satisfait(e) par un travail avec des résultats tangibles ?'
      ]
    },
    {
      key: 'sciences',
      title: 'Sciences',
      icon: FlaskConical,
      description: 'Recherche, analyse, investigation, méthode scientifique',
      questions: [
        'Êtes-vous attiré(e) par la recherche et l\'investigation ?',
        'Aimez-vous analyser, comprendre et résoudre des problèmes complexes ?',
        'Appréciez-vous les démarches méthodiques et scientifiques ?'
      ]
    },
    {
      key: 'social',
      title: 'Social',
      icon: Heart,
      description: 'Aide aux autres, éducation, service à la communauté',
      questions: [
        'Êtes-vous motivé(e) par l\'aide et le service aux autres ?',
        'Aimez-vous éduquer, former ou accompagner les personnes ?',
        'Vous sentez-vous concerné(e) par les enjeux sociaux et humains ?'
      ]
    }
  ];

  const handleDomainResponse = (domain: string, value: string) => {
    setResponses(prev => ({ ...prev, [domain]: value }));
  };

  const handleInputChange = (field: string, value: string) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const generateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-irmr3-analysis', {
        body: { responses }
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
      setCurrentStep(4);
      toast({
        title: "Analyse générée",
        description: "Votre profil IRMR3 a été analysé avec succès !",
      });
    } catch (error) {
      console.error('Erreur lors de la génération de l\'analyse:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'analyse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 6;

    // Ajouter l'en-tête Anthea
    let yPosition = addAntheaHeader(pdf, 'IRMR3 - Inventaire des Intérêts Professionnels');

    // Fonction pour vérifier si on a assez d'espace
    const checkSpace = (requiredHeight: number, currentY: number) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        return addAntheaHeader(pdf, 'IRMR3 - Inventaire des Intérêts Professionnels');
      }
      return currentY;
    };

    // Fonction pour ajouter du texte avec gestion avancée des pages
    const addText = (text: string, x: number, y: number, fontSize = 11, isBold = false) => {
      let currentY = y;
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, isBold ? 'bold' : 'normal');
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        currentY = checkSpace(lineHeight, currentY);
        pdf.text(lines[i], x, currentY);
        currentY += lineHeight;
      }
      
      return currentY;
    };

    // Fonction pour ajouter un paragraphe avec espacement
    const addParagraph = (text: string, y: number) => {
      if (!text.trim()) return y;
      const newY = addText(text, margin, y);
      return newY + 4; // Espacement après paragraphe
    };

    // Fonction pour ajouter un titre de section
    const addSectionTitle = (title: string, y: number) => {
      let currentY = checkSpace(20, y + 8);
      
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, margin, currentY);
      return currentY + 10;
    };

    // Nettoyer l'analyse des marqueurs Markdown de façon plus complète
    const cleanedAnalysis = analysis
      .replace(/#{1,6}\s*[🎯📊🚀💡🔄Ø=ß¯]\s*/g, '') // Retirer les headers avec emojis et caractères parasites
      .replace(/#{1,6}\s*/g, '') // Retirer les autres headers markdown
      .replace(/\*\*(.*?)\*\*/g, '$1') // Retirer le gras markdown
      .replace(/\*(.*?)\*/g, '$1') // Retirer l'italique markdown
      .replace(/[Øß¯=•\-\*\+]+/g, '') // Retirer tous les caractères parasites
      .replace(/^\s*[-•]\s*/gm, '• ') // Normaliser les puces
      .replace(/\n{3,}/g, '\n\n') // Limiter les sauts de ligne multiples
      .trim();

    // Diviser le contenu en sections
    const sections = cleanedAnalysis.split(/(?=VOS DOMAINES D'INTÉRÊT DOMINANTS|PROFIL DÉTAILLÉ IRMR3|MÉTIERS ET SECTEURS RECOMMANDÉS|PLAN D'ACTION PERSONNALISÉ|COHÉRENCE AVEC VOS ASPIRATIONS)/);

    sections.forEach((section, index) => {
      if (section.trim()) {
        const lines = section.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length === 0) return;

        const title = lines[0];
        const content = lines.slice(1);

        // Ajouter le titre de section
        if (title) {
          yPosition = addSectionTitle(title, yPosition);
        }

        // Ajouter le contenu ligne par ligne
        content.forEach(line => {
          if (line.trim()) {
            yPosition = addParagraph(line, yPosition);
          }
        });
      }
    });

    pdf.save('analyse-irmr3.pdf');
    
    toast({
      title: "PDF exporté",
      description: "Votre analyse IRMR3 a été téléchargée.",
    });
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">IRMR3 - Inventaire des Intérêts Professionnels</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Découvrez vos centres d'intérêt professionnels selon 7 grands domaines validés scientifiquement.
          Cet inventaire vous aidera à identifier les secteurs d'activité qui correspondent le mieux à vos aspirations naturelles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => {
          const Icon = domain.icon;
          return (
            <Card key={domain.key} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{domain.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{domain.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button onClick={() => setCurrentStep(2)} className="px-8">
          Commencer l'évaluation
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Évaluation des domaines d'intérêt</h2>
        <p className="text-muted-foreground">
          Pour chaque domaine, évaluez votre niveau d'intérêt de 1 (très faible) à 5 (très élevé)
        </p>
      </div>

      <div className="space-y-8">
        {domains.map((domain) => {
          const Icon = domain.icon;
          return (
            <Card key={domain.key}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">{domain.title}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{domain.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {domain.questions.map((question, idx) => (
                    <p key={idx} className="text-sm">• {question}</p>
                  ))}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Niveau d'intérêt :</Label>
                  <RadioGroup
                    value={responses[domain.key as keyof typeof responses]}
                    onValueChange={(value) => handleDomainResponse(domain.key, value)}
                    className="flex gap-4 mt-2"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-1">
                        <RadioGroupItem value={rating.toString()} id={`${domain.key}-${rating}`} />
                        <Label htmlFor={`${domain.key}-${rating}`} className="text-sm">{rating}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Retour
        </Button>
        <Button 
          onClick={() => setCurrentStep(3)}
          disabled={!domains.every(domain => responses[domain.key as keyof typeof responses])}
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Informations complémentaires</h2>
        <p className="text-muted-foreground">
          Aidez-nous à personnaliser votre analyse en répondant à ces questions
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Votre expérience professionnelle</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Décrivez brièvement vos expériences professionnelles et les domaines dans lesquels vous avez évolué..."
              value={responses.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vos motivations principales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Qu'est-ce qui vous motive le plus dans le travail ? Quelles sont vos valeurs professionnelles importantes ?"
              value={responses.motivations}
              onChange={(e) => handleInputChange('motivations', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vos objectifs professionnels</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Quels sont vos objectifs à court et moyen terme ? Dans quel type d'environnement aimeriez-vous évoluer ?"
              value={responses.objectifs}
              onChange={(e) => handleInputChange('objectifs', e.target.value)}
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Retour
        </Button>
        <Button 
          onClick={generateAnalysis}
          disabled={isGenerating || !responses.experience || !responses.motivations || !responses.objectifs}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            'Générer mon profil IRMR3'
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Votre Profil IRMR3</h2>
        <p className="text-muted-foreground">
          Découvrez vos domaines d'intérêt dominants et les perspectives professionnelles associées
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Analyse de vos intérêts professionnels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {analysis.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button onClick={exportToPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger le PDF
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refaire le test
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Retour accueil
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IRMR3Page;