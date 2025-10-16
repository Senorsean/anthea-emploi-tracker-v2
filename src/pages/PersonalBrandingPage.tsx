import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, Briefcase, Linkedin, FileText, Target } from 'lucide-react';

const PersonalBrandingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    expertise: '',
    cvSummary: '',
    linkedinProfile: '',
    hasPortfolio: false,
    portfolioUrl: '',
    contentGoals: '',
    targetAudience: '',
  });
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentRole || !formData.targetRole || !formData.expertise) {
      toast.error('Veuillez remplir au minimum votre rôle actuel, rôle visé et votre expertise');
      return;
    }

    setIsLoading(true);
    setAnalysis('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-personal-branding-strategy', {
        body: { formData }
      });

      if (error) throw error;

      setAnalysis(data.strategy);
      toast.success('Stratégie de personal branding générée avec succès !');
    } catch (error) {
      console.error('Error generating strategy:', error);
      toast.error('Erreur lors de la génération de la stratégie');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-start">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Retour accueil
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Personal Branding Digital 💼
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Construisez une présence en ligne cohérente et impactante
          </p>
        </div>

        {/* Conseils */}
        <Card className="border-blue-200 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              Les 3 piliers du personal branding digital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p><strong>1. Cohérence :</strong> Votre message, votre photo, vos mots-clés doivent être alignés sur tous vos supports (CV, LinkedIn, portfolio)</p>
            <p><strong>2. Visibilité :</strong> Créez du contenu régulier qui met en valeur votre expertise et attire votre audience cible</p>
            <p><strong>3. Authenticité :</strong> Montrez votre personnalité unique, partagez votre parcours et vos valeurs</p>
          </CardContent>
        </Card>

        {/* Formulaire */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              Audit de votre présence digitale
            </CardTitle>
            <CardDescription>
              Complétez ces informations pour recevoir une stratégie personnalisée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="presence">Présence actuelle</TabsTrigger>
                  <TabsTrigger value="strategy">Stratégie</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Votre rôle actuel *</Label>
                    <Input
                      id="currentRole"
                      placeholder="Ex: Développeur Full Stack"
                      value={formData.currentRole}
                      onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetRole">Rôle visé *</Label>
                    <Input
                      id="targetRole"
                      placeholder="Ex: Lead Developer, CTO startup"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertise">Votre expertise / domaine de spécialisation *</Label>
                    <Textarea
                      id="expertise"
                      placeholder="Ex: React, Node.js, architecture cloud, DevOps..."
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="presence" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="cvSummary">Résumé de votre CV actuel</Label>
                    <Textarea
                      id="cvSummary"
                      placeholder="Copiez-collez votre titre et résumé de CV, ou décrivez brièvement votre profil actuel"
                      value={formData.cvSummary}
                      onChange={(e) => setFormData({ ...formData, cvSummary: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinProfile">Résumé de votre profil LinkedIn</Label>
                    <Textarea
                      id="linkedinProfile"
                      placeholder="Copiez-collez votre titre et section À propos de LinkedIn"
                      value={formData.linkedinProfile}
                      onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasPortfolio}
                        onChange={(e) => setFormData({ ...formData, hasPortfolio: e.target.checked })}
                        className="w-4 h-4"
                      />
                      J'ai déjà un portfolio en ligne
                    </Label>
                    {formData.hasPortfolio && (
                      <Input
                        placeholder="URL de votre portfolio"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="strategy" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="contentGoals">Objectifs de contenu</Label>
                    <Textarea
                      id="contentGoals"
                      placeholder="Que voulez-vous accomplir avec votre contenu ? Ex: Partager mon expertise, attirer des recruteurs, développer mon réseau..."
                      value={formData.contentGoals}
                      onChange={(e) => setFormData({ ...formData, contentGoals: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Audience cible</Label>
                    <Textarea
                      id="targetAudience"
                      placeholder="Qui voulez-vous atteindre ? Ex: Recruteurs tech, CTOs de startups, communauté dev..."
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Générer ma stratégie de personal branding
              </Button>
            </form>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-600">Votre stratégie de personal branding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {analysis}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalBrandingPage;
