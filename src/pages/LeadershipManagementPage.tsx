import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Users, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const LeadershipManagementPage = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [experience, setExperience] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [challenges, setChallenges] = useState('');
  const [leadershipStyle, setLeadershipStyle] = useState('');
  const [goals, setGoals] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRole.trim() || !experience.trim() || !goals.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir au moins votre rôle actuel, votre expérience et vos objectifs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-leadership-analysis', {
        body: {
          currentRole,
          experience,
          teamSize,
          challenges,
          leadershipStyle,
          goals,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analyse générée",
        description: "Votre analyse de leadership & management est prête.",
      });
    } catch (error) {
      console.error('Error generating leadership analysis:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'analyse.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!analysis) return;

    try {
      const pdf = new jsPDF();
      let yPosition = addAntheaHeader(pdf, 'Analyse Leadership & Management');

      // Add profile information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Profil:', 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Rôle actuel: ${currentRole}`, 20, yPosition);
      yPosition += 7;
      
      if (teamSize) {
        pdf.text(`Taille d'équipe: ${teamSize}`, 20, yPosition);
        yPosition += 7;
      }
      
      if (leadershipStyle) {
        pdf.text(`Style de leadership: ${leadershipStyle}`, 20, yPosition);
        yPosition += 10;
      } else {
        yPosition += 3;
      }

      // Add analysis
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analyse:', 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 7;
      
      const lines = pdf.splitTextToSize(analysis, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = addAntheaHeader(pdf, 'Analyse Leadership & Management');
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      pdf.save('analyse-leadership-management.pdf');
      
      toast({
        title: "Export réussi",
        description: "Votre analyse a été exportée en PDF.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export.",
        variant: "destructive",
      });
    }
  };

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
            Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Users className="h-10 w-10 text-[#a4007c]" />
            <h1 className="text-4xl font-bold text-gray-900">
              Leadership & Management
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Évaluez votre style de leadership, identifiez les compétences managériales à développer et préparez votre transition vers des rôles de management
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Votre Profil de Leadership</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Rôle / Poste actuel *</Label>
                <Input
                  id="currentRole"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="Ex: Chef de projet, Responsable d'équipe, Manager..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience professionnelle et managériale *</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Ex: 3 ans en tant que chef de projet, gestion de petites équipes, leadership informel..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">Taille d'équipe actuelle ou visée</Label>
                <Input
                  id="teamSize"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="Ex: 5-10 personnes, équipe de 15 collaborateurs..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenges">Défis managériaux rencontrés ou anticipés</Label>
                <Textarea
                  id="challenges"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Ex: Gestion des conflits, motivation d'équipe, délégation, communication..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label>Style de leadership préféré (si connu)</Label>
                <RadioGroup value={leadershipStyle} onValueChange={setLeadershipStyle}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="autoritaire" id="autoritaire" />
                    <Label htmlFor="autoritaire" className="font-normal cursor-pointer">
                      Autoritaire (directif, décisions unilatérales)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="democratique" id="democratique" />
                    <Label htmlFor="democratique" className="font-normal cursor-pointer">
                      Démocratique (participatif, consultation de l'équipe)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transformationnel" id="transformationnel" />
                    <Label htmlFor="transformationnel" className="font-normal cursor-pointer">
                      Transformationnel (inspirant, vision partagée)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="situationnel" id="situationnel" />
                    <Label htmlFor="situationnel" className="font-normal cursor-pointer">
                      Situationnel (adapte le style selon le contexte)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="coaching" id="coaching" />
                    <Label htmlFor="coaching" className="font-normal cursor-pointer">
                      Coaching (développement et accompagnement)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ne-sais-pas" id="ne-sais-pas" />
                    <Label htmlFor="ne-sais-pas" className="font-normal cursor-pointer">
                      Je ne sais pas / À découvrir
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Objectifs de développement en leadership *</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Ex: Devenir manager d'une équipe de 10 personnes, améliorer mes compétences en communication, gérer des projets complexes..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#a4007c] hover:bg-[#8a0066] text-white"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-5 w-5" />
                    Générer mon analyse de leadership
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {analysis && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-[#a4007c]" />
                  Votre Analyse de Leadership & Management
                </CardTitle>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {analysis}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LeadershipManagementPage;
