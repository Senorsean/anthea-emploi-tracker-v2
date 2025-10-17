import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, TrendingUp, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const VeilleSectoriellePage = () => {
  const [currentSector, setCurrentSector] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const [experience, setExperience] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSector.trim() || !currentRole.trim() || !goals.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir au moins votre secteur, votre rôle actuel et vos objectifs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-sector-analysis', {
        body: {
          currentSector,
          currentRole,
          interests,
          goals,
          experience,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analyse générée",
        description: "Votre analyse de veille sectorielle est prête.",
      });
    } catch (error) {
      console.error('Error generating sector analysis:', error);
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
      let yPosition = addAntheaHeader(pdf, 'Veille Sectorielle & Tendances');

      // Add profile information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Profil:', 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Secteur: ${currentSector}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Rôle actuel: ${currentRole}`, 20, yPosition);
      yPosition += 10;

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
        if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
          pdf.addPage();
          yPosition = addAntheaHeader(pdf, 'Veille Sectorielle & Tendances');
          yPosition += 5; // Add extra spacing after header on new pages
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      pdf.save('veille-sectorielle-tendances.pdf');
      
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
            <TrendingUp className="h-10 w-10 text-[#a4007c]" />
            <h1 className="text-4xl font-bold text-gray-900">
              Veille Sectorielle & Tendances Métiers
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Restez informé sur l'évolution de votre secteur, découvrez les métiers émergents et anticipez les compétences du futur
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Votre Profil Professionnel</CardTitle>
              <Link to="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentSector">Secteur d'activité *</Label>
                <Input
                  id="currentSector"
                  value={currentSector}
                  onChange={(e) => setCurrentSector(e.target.value)}
                  placeholder="Ex: Technologies de l'information, Santé, Finance, Marketing..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentRole">Poste / Métier actuel *</Label>
                <Input
                  id="currentRole"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="Ex: Développeur, Responsable marketing, Consultant..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Années d'expérience dans le secteur</Label>
                <Input
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Ex: 5 ans, Débutant, 10+ ans..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Domaines d'intérêt ou technologies qui vous intéressent</Label>
                <Textarea
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Ex: Intelligence artificielle, développement durable, transformation digitale, data science..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Objectifs professionnels et horizon de temps *</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Ex: Évoluer vers un poste de management dans les 2 ans, me reconvertir dans l'IA, suivre les innovations de mon secteur..."
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
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Générer mon analyse de veille sectorielle
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
                  <TrendingUp className="h-6 w-6 text-[#a4007c]" />
                  Votre Analyse de Veille Sectorielle
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

export default VeilleSectoriellePage;
