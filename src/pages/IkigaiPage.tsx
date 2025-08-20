import { useState } from "react";
import { ArrowLeft, Target, Heart, Brain, DollarSign, Lightbulb, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

interface IkigaiFormData {
  passions: string;
  talents: string;
  values: string;
  needsWorld: string;
  currentRole: string;
  experience: string;
}

interface IkigaiResult {
  ikigai_score: number;
  passion_alignment: string;
  mission_clarity: string;
  profession_recommendations: string[];
  development_plan: string;
  next_steps: string[];
  reflection_questions: string[];
}

const IkigaiPage = () => {
  const [formData, setFormData] = useState<IkigaiFormData>({
    passions: "",
    talents: "",
    values: "",
    needsWorld: "",
    currentRole: "",
    experience: ""
  });
  const [result, setResult] = useState<IkigaiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof IkigaiFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.passions || !formData.talents || !formData.values || !formData.needsWorld) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ikigai-analysis', {
        body: { formData }
      });

      if (error) {
        throw error;
      }

      setResult(data);
      toast({
        title: "Analyse terminée",
        description: "Votre analyse IKIGAÏ a été générée avec succès !",
      });
    } catch (error) {
      console.error('Erreur lors de l\'analyse IKIGAÏ:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de votre analyse IKIGAÏ.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent alignement";
    if (score >= 60) return "Bon alignement";
    if (score >= 40) return "Alignement modéré";
    return "Faible alignement";
  };

  const downloadPDF = () => {
    if (!result) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Ajouter l'en-tête Anthea
    let yPosition = addAntheaHeader(pdf, "Analyse IKIGAÏ");

    // Fonction pour diviser le texte en lignes
    const splitText = (text: string, maxWidth: number) => {
      return pdf.splitTextToSize(text, maxWidth);
    };

    // Fonction pour ajouter une nouvelle page si nécessaire
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = addAntheaHeader(pdf, "Analyse IKIGAÏ");
      }
    };

    // Score IKIGAÏ
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Votre Score IKIGAÏ", margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(24);
    pdf.setTextColor(79, 70, 229); // Purple color
    pdf.text(`${result.ikigai_score}/100`, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.text(getScoreLabel(result.ikigai_score), margin, yPosition);
    yPosition += 20;

    // Alignement Passion
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Alignement Passion", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const passionLines = splitText(result.passion_alignment, maxWidth);
    pdf.text(passionLines, margin, yPosition);
    yPosition += passionLines.length * 5 + 10;

    // Clarté de Mission
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Clarté de Mission", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const missionLines = splitText(result.mission_clarity, maxWidth);
    pdf.text(missionLines, margin, yPosition);
    yPosition += missionLines.length * 5 + 10;

    // Recommandations de Carrière
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Recommandations de Carrière", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    result.profession_recommendations.forEach((prof, index) => {
      checkPageBreak(6);
      pdf.text(`• ${prof}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Plan de Développement
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Plan de Développement", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const planLines = splitText(result.development_plan, maxWidth);
    pdf.text(planLines, margin, yPosition);
    yPosition += planLines.length * 5 + 10;

    // Prochaines Étapes
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Prochaines Étapes", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    result.next_steps.forEach((step, index) => {
      const stepLines = splitText(`• ${step}`, maxWidth - 10);
      checkPageBreak(stepLines.length * 5);
      pdf.text(stepLines, margin + 5, yPosition);
      yPosition += stepLines.length * 5 + 2;
    });
    yPosition += 10;

    // Questions de Réflexion
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Questions de Réflexion", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    result.reflection_questions.forEach((question, index) => {
      const questionLines = splitText(`• ${question}`, maxWidth - 10);
      checkPageBreak(questionLines.length * 5);
      pdf.text(questionLines, margin + 5, yPosition);
      yPosition += questionLines.length * 5 + 2;
    });

    // Télécharger le PDF
    const fileName = `analyse-ikigai-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    toast({
      title: "PDF téléchargé",
      description: "Votre analyse IKIGAÏ a été téléchargée avec succès !",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Découvrez votre IKIGAÏ</h1>
            <p className="text-gray-600 mt-1">
              Trouvez l'intersection entre passion, mission, profession et vocation
            </p>
          </div>
        </div>

        {!result ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Questionnaire IKIGAÏ
              </CardTitle>
              <CardDescription>
                Répondez aux questions suivantes pour découvrir votre raison d'être professionnelle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passions" className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Ce que vous aimez *
                    </Label>
                    <Textarea
                      id="passions"
                      placeholder="Décrivez vos passions, ce qui vous motive et vous inspire..."
                      value={formData.passions}
                      onChange={(e) => handleInputChange('passions', e.target.value)}
                      className="min-h-24"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="talents" className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      Ce pour quoi vous êtes doué *
                    </Label>
                    <Textarea
                      id="talents"
                      placeholder="Listez vos compétences, talents naturels et forces..."
                      value={formData.talents}
                      onChange={(e) => handleInputChange('talents', e.target.value)}
                      className="min-h-24"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="values" className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Ce dont le monde a besoin *
                    </Label>
                    <Textarea
                      id="needsWorld"
                      placeholder="Quels problèmes aimeriez-vous résoudre ? Comment voulez-vous contribuer au monde ?"
                      value={formData.needsWorld}
                      onChange={(e) => handleInputChange('needsWorld', e.target.value)}
                      className="min-h-24"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="values" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Ce pour quoi vous pouvez être payé *
                    </Label>
                    <Textarea
                      id="values"
                      placeholder="Quelles activités pourriez-vous monétiser ? Dans quels domaines avez-vous de la valeur ?"
                      value={formData.values}
                      onChange={(e) => handleInputChange('values', e.target.value)}
                      className="min-h-24"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Poste actuel (optionnel)</Label>
                    <Input
                      id="currentRole"
                      placeholder="Votre poste actuel"
                      value={formData.currentRole}
                      onChange={(e) => handleInputChange('currentRole', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Années d'expérience (optionnel)</Label>
                    <Input
                      id="experience"
                      placeholder="Ex: 5 ans"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Analyse en cours..." : "Découvrir mon IKIGAÏ"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Votre Analyse IKIGAÏ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(result.ikigai_score)}`}>
                      {result.ikigai_score}/100
                    </div>
                    <p className="text-gray-600 mt-1">{getScoreLabel(result.ikigai_score)}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Alignement Passion</h3>
                      <p className="text-gray-700 text-sm">{result.passion_alignment}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Clarté de Mission</h3>
                      <p className="text-gray-700 text-sm">{result.mission_clarity}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Recommandations de Carrière</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.profession_recommendations.map((prof, index) => (
                        <Badge key={index} variant="secondary">
                          {prof}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Plan de Développement</h3>
                    <p className="text-gray-700 text-sm">{result.development_plan}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Prochaines Étapes</h3>
                    <ul className="space-y-2">
                      {result.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Questions de Réflexion</h3>
                    <ul className="space-y-2">
                      {result.reflection_questions.map((question, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm italic">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={downloadPDF} variant="default" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exporter en PDF
              </Button>
              <Button onClick={() => setResult(null)} variant="outline">
                Refaire le test
              </Button>
              <Button asChild variant="secondary">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IkigaiPage;