import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Download, Loader2, Palette, Users, Briefcase, Calculator, Wrench, FlaskConical, Heart, TreePine, Hammer, Cpu, Microscope, Stethoscope, Music, Paintbrush, BookOpen, HandHeart, MessageCircle, ClipboardList, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const IRMR3Page = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState({
    pleinAir: '',
    pratiques: '',
    techniques: '',
    scientifiques: '',
    medicaux: '',
    musicaux: '',
    esthetiques: '',
    litteraires: '',
    serviceSocial: '',
    contactsPersonnels: '',
    gestion: '',
    bureau: '',
    experience: '',
    motivations: '',
    objectifs: ''
  });
  const [analysis, setAnalysis] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const domains = [
    {
      key: 'pleinAir',
      title: 'Plein air',
      icon: TreePine,
      description: 'Activités en extérieur, nature, environnement',
      questions: [
        'Aimez-vous travailler en plein air ?',
        'Êtes-vous attiré(e) par les métiers liés à la nature ?',
        'Préférez-vous les environnements extérieurs aux bureaux fermés ?'
      ]
    },
    {
      key: 'pratiques',
      title: 'Pratiques',
      icon: Hammer,
      description: 'Travail manuel, construction, réparation',
      questions: [
        'Aimez-vous travailler de vos mains ?',
        'Êtes-vous attiré(e) par les activités pratiques et concrètes ?',
        'Appréciez-vous construire ou réparer des choses ?'
      ]
    },
    {
      key: 'techniques',
      title: 'Techniques',
      icon: Cpu,
      description: 'Technologie, mécanique, systèmes techniques',
      questions: [
        'Êtes-vous intéressé(e) par les technologies et systèmes techniques ?',
        'Aimez-vous comprendre le fonctionnement des machines ?',
        'Vous sentez-vous à l\'aise avec les outils techniques ?'
      ]
    },
    {
      key: 'scientifiques',
      title: 'Scientifiques',
      icon: Microscope,
      description: 'Recherche, expérimentation, analyse scientifique',
      questions: [
        'Êtes-vous attiré(e) par la recherche scientifique ?',
        'Aimez-vous expérimenter et analyser ?',
        'Appréciez-vous les démarches scientifiques rigoureuses ?'
      ]
    },
    {
      key: 'medicaux',
      title: 'Médicaux',
      icon: Stethoscope,
      description: 'Santé, soins, bien-être',
      questions: [
        'Êtes-vous intéressé(e) par le domaine médical et la santé ?',
        'Aimez-vous prendre soin des autres ?',
        'Vous sentez-vous concerné(e) par le bien-être des personnes ?'
      ]
    },
    {
      key: 'musicaux',
      title: 'Musicaux',
      icon: Music,
      description: 'Musique, rythme, expression sonore',
      questions: [
        'Êtes-vous attiré(e) par la musique ?',
        'Aimez-vous jouer d\'un instrument ou composer ?',
        'La musique joue-t-elle un rôle important dans votre vie ?'
      ]
    },
    {
      key: 'esthetiques',
      title: 'Esthétiques',
      icon: Paintbrush,
      description: 'Arts visuels, design, créativité esthétique',
      questions: [
        'Êtes-vous attiré(e) par les arts visuels et le design ?',
        'Aimez-vous créer des œuvres esthétiques ?',
        'Avez-vous un sens développé de l\'esthétique ?'
      ]
    },
    {
      key: 'litteraires',
      title: 'Littéraires',
      icon: BookOpen,
      description: 'Écriture, lecture, expression écrite',
      questions: [
        'Aimez-vous lire et écrire ?',
        'Êtes-vous attiré(e) par la littérature ?',
        'Appréciez-vous vous exprimer par l\'écrit ?'
      ]
    },
    {
      key: 'serviceSocial',
      title: 'Service social',
      icon: HandHeart,
      description: 'Aide sociale, accompagnement, service à la communauté',
      questions: [
        'Êtes-vous motivé(e) par l\'aide aux personnes en difficulté ?',
        'Aimez-vous accompagner et soutenir les autres ?',
        'Le service social vous semble-t-il une vocation ?'
      ]
    },
    {
      key: 'contactsPersonnels',
      title: 'Contacts personnels',
      icon: MessageCircle,
      description: 'Relations interpersonnelles, communication, échanges',
      questions: [
        'Aimez-vous échanger avec les autres ?',
        'Êtes-vous à l\'aise dans les relations interpersonnelles ?',
        'Appréciez-vous créer des liens avec les gens ?'
      ]
    },
    {
      key: 'gestion',
      title: 'Gestion',
      icon: ClipboardList,
      description: 'Organisation, planification, administration',
      questions: [
        'Aimez-vous organiser et planifier ?',
        'Êtes-vous attiré(e) par la gestion de projets ou d\'équipes ?',
        'Appréciez-vous coordonner des activités ?'
      ]
    },
    {
      key: 'bureau',
      title: 'Bureau',
      icon: FileText,
      description: 'Travail administratif, tâches de bureau, organisation',
      questions: [
        'Êtes-vous à l\'aise avec les tâches administratives ?',
        'Aimez-vous travailler dans un environnement de bureau ?',
        'Appréciez-vous les activités de classement et d\'organisation ?'
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
    const maxWidth = pageWidth - 2 * margin - 5; // Réduire un peu plus pour éviter le débordement
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

    // Fonction pour ajouter du texte avec gestion avancée des pages et des listes
    const addText = (text: string, x: number, y: number, fontSize = 11, isBold = false) => {
      let currentY = y;
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, isBold ? 'bold' : 'normal');
      
      // Détecter si c'est un élément de liste
      const isBulletPoint = /^[•\-]\s/.test(text);
      const isNumberedItem = /^\d+\.\s/.test(text);
      
      let textToWrap = text;
      let indent = 0;
      
      if (isBulletPoint || isNumberedItem) {
        // Pour les listes, réduire encore la largeur pour l'indentation
        const listMaxWidth = maxWidth - 10;
        const match = text.match(/^([•\-]\s|\d+\.\s)/);
        const prefix = match ? match[0] : '';
        textToWrap = text.substring(prefix.length);
        
        const lines = pdf.splitTextToSize(textToWrap, listMaxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          currentY = checkSpace(lineHeight, currentY);
          if (i === 0) {
            // Première ligne avec la puce ou le numéro
            pdf.text(prefix + lines[i], x, currentY);
          } else {
            // Lignes suivantes avec indentation
            pdf.text(lines[i], x + 10, currentY);
          }
          currentY += lineHeight;
        }
      } else {
        // Texte normal
        const lines = pdf.splitTextToSize(textToWrap, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          currentY = checkSpace(lineHeight, currentY);
          pdf.text(lines[i], x, currentY);
          currentY += lineHeight;
        }
      }
      
      return currentY;
    };

    // Fonction pour ajouter un paragraphe avec espacement
    const addParagraph = (text: string, y: number) => {
      if (!text.trim()) return y;
      const newY = addText(text, margin, y);
      return newY + 3; // Espacement après paragraphe
    };

    // Fonction pour ajouter un titre de section
    const addSectionTitle = (title: string, y: number) => {
      let currentY = checkSpace(20, y + 8);
      
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, margin, currentY);
      return currentY + 10;
    };

    // Fonction pour décoder les entités HTML
    const decodeHTMLEntities = (text: string) => {
      const entities: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x26;': '&',
        '&#38;': '&',
        '&#x27;': "'",
        '&#39;': "'",
        '&apos;': "'",
      };
      return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
    };

    // Nettoyer l'analyse des marqueurs Markdown et entités HTML
    const cleanedAnalysis = decodeHTMLEntities(analysis)
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
          Découvrez vos centres d'intérêt professionnels selon les 12 catégories spécifiques de l'IRMR3.
          Ce questionnaire comprend 98 questions réparties en 12 domaines pour identifier avec précision 
          les secteurs d'activité qui correspondent le mieux à vos aspirations naturelles.
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
            {analysis
              .replace(/[🎯📊🚀💡🔄]/g, '') // Retirer les émojis
              .split('\n')
              .map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))
            }
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