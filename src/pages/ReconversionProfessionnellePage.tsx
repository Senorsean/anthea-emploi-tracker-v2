import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RefreshCw, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const ReconversionProfessionnellePage = () => {
  const [currentJob, setCurrentJob] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [constraints, setConstraints] = useState('');
  const [targetSector, setTargetSector] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentJob.trim() || !experience.trim() || !skills.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir au moins votre poste actuel, votre expérience et vos compétences.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-reconversion-analysis', {
        body: {
          currentJob,
          experience,
          skills,
          interests,
          constraints,
          targetSector,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analyse générée",
        description: "Votre analyse de reconversion professionnelle est prête.",
      });
    } catch (error) {
      console.error('Error generating reconversion analysis:', error);
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
      let yPosition = addAntheaHeader(pdf, 'Analyse de Reconversion Professionnelle');

      // Add profile information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Profil:', 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Poste actuel: ${currentJob}`, 20, yPosition);
      yPosition += 7;
      
      if (targetSector) {
        pdf.text(`Secteur visé: ${targetSector}`, 20, yPosition);
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
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const bottomMargin = 30;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 7;
      
      const lines = pdf.splitTextToSize(analysis, maxWidth);
      
      lines.forEach((line: string) => {
        // Check if we need a new page BEFORE writing
        if (yPosition + lineHeight > pageHeight - bottomMargin) {
          pdf.addPage();
          yPosition = addAntheaHeader(pdf, 'Analyse de Reconversion Professionnelle');
          // Reset body font after header so wrapping stays correct
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      pdf.save('analyse-reconversion-professionnelle.pdf');
      
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
            <RefreshCw className="h-10 w-10 text-[#a4007c]" />
            <h1 className="text-4xl font-bold text-gray-900">
              Reconversion Professionnelle
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Évaluez la faisabilité de votre reconversion, découvrez les métiers accessibles selon votre profil et établissez un plan de transition
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Votre Profil de Reconversion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentJob">Poste / Métier actuel *</Label>
                <Input
                  id="currentJob"
                  value={currentJob}
                  onChange={(e) => setCurrentJob(e.target.value)}
                  placeholder="Ex: Développeur web, Enseignant, Comptable..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Années d'expérience et parcours *</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Ex: 5 ans en développement web, formation en informatique, expérience en gestion de projet..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Compétences transférables *</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Ex: Communication, gestion de projet, analyse de données, formation, management d'équipe..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Centres d'intérêt et aspirations</Label>
                <Textarea
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Ex: Passion pour l'environnement, envie d'aider les autres, créativité, autonomie..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Contraintes et critères</Label>
                <Textarea
                  id="constraints"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="Ex: Besoin de flexibilité horaire, salaire minimum requis, mobilité géographique limitée..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetSector">Secteur(s) envisagé(s) (optionnel)</Label>
                <Input
                  id="targetSector"
                  value={targetSector}
                  onChange={(e) => setTargetSector(e.target.value)}
                  placeholder="Ex: Santé, Éducation, Tech, Environnement..."
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
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Générer mon plan de reconversion
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
                  <RefreshCw className="h-6 w-6 text-[#a4007c]" />
                  Votre Analyse de Reconversion
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

export default ReconversionProfessionnellePage;
