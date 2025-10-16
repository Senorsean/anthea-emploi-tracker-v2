import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, Mic, Clock, Sparkles } from 'lucide-react';

interface Pitch {
  duration: '30s' | '1min' | '3min';
  content: string;
  wordCount: number;
}

const PitchPresentationPage = () => {
  const navigate = useNavigate();
  const [pitches, setPitches] = useState<Pitch[]>([
    { duration: '30s', content: '', wordCount: 0 },
    { duration: '1min', content: '', wordCount: 0 },
    { duration: '3min', content: '', wordCount: 0 },
  ]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('30s');

  const updatePitch = (duration: '30s' | '1min' | '3min', content: string) => {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setPitches(pitches.map(p => 
      p.duration === duration ? { ...p, content, wordCount } : p
    ));
  };

  const getPitch = (duration: '30s' | '1min' | '3min') => {
    return pitches.find(p => p.duration === duration) || pitches[0];
  };

  const getRecommendedWordCount = (duration: '30s' | '1min' | '3min') => {
    switch (duration) {
      case '30s': return '60-80 mots';
      case '1min': return '120-150 mots';
      case '3min': return '350-450 mots';
    }
  };

  const handleGenerateFeedback = async () => {
    const filledPitches = pitches.filter(p => p.content.trim().length > 0);
    
    if (filledPitches.length === 0) {
      toast.error('Veuillez rédiger au moins un pitch avant de demander un feedback');
      return;
    }

    setIsLoading(true);
    setFeedback('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-pitch-feedback', {
        body: { pitches: filledPitches }
      });

      if (error) throw error;

      setFeedback(data.feedback);
      toast.success('Feedback généré avec succès !');
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast.error('Erreur lors de la génération du feedback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Préparation pitch de présentation 🎤
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Créez vos elevator pitchs et recevez un feedback personnalisé
          </p>
        </div>

        {/* Conseils */}
        <Card className="border-amber-200 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Sparkles className="h-5 w-5" />
              Techniques de storytelling professionnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p><strong>Structure STAR :</strong> Situation → Tâche → Action → Résultat</p>
            <p><strong>Accroche :</strong> Commencez par une phrase impactante qui capte l'attention</p>
            <p><strong>Problème → Solution :</strong> Identifiez un problème et montrez comment vous y répondez</p>
            <p><strong>Authenticité :</strong> Soyez vous-même, utilisez des exemples concrets</p>
            <p><strong>Appel à l'action :</strong> Terminez par ce que vous recherchez concrètement</p>
          </CardContent>
        </Card>

        {/* Pitchs */}
        <Card className="border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-6 w-6 text-amber-600" />
              Vos pitchs de présentation
            </CardTitle>
            <CardDescription>
              Rédigez vos pitchs pour différentes durées. Un bon pitch s'adapte au temps disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="30s" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  30 secondes
                </TabsTrigger>
                <TabsTrigger value="1min" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  1 minute
                </TabsTrigger>
                <TabsTrigger value="3min" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  3 minutes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="30s" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Pitch de 30 secondes</Label>
                    <span className="text-sm text-gray-600">
                      {getPitch('30s').wordCount} mots (recommandé: {getRecommendedWordCount('30s')})
                    </span>
                  </div>
                  <Textarea
                    placeholder="Ex: Bonjour, je suis [nom], expert en [domaine] avec [X] ans d'expérience. Je me spécialise dans [compétence clé] et j'ai récemment [réalisation marquante]. Je recherche actuellement [objectif]."
                    value={getPitch('30s').content}
                    onChange={(e) => updatePitch('30s', e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Concentrez-vous sur l'essentiel : qui vous êtes, votre expertise unique, et ce que vous cherchez
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="1min" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Pitch d'1 minute</Label>
                    <span className="text-sm text-gray-600">
                      {getPitch('1min').wordCount} mots (recommandé: {getRecommendedWordCount('1min')})
                    </span>
                  </div>
                  <Textarea
                    placeholder="Développez votre pitch de 30s : ajoutez un exemple concret de réalisation, expliquez votre parcours, et détaillez votre valeur ajoutée."
                    value={getPitch('1min').content}
                    onChange={(e) => updatePitch('1min', e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Ajoutez une anecdote ou un chiffre marquant pour illustrer votre impact
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="3min" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Pitch de 3 minutes</Label>
                    <span className="text-sm text-gray-600">
                      {getPitch('3min').wordCount} mots (recommandé: {getRecommendedWordCount('3min')})
                    </span>
                  </div>
                  <Textarea
                    placeholder="Version complète : racontez votre parcours, vos motivations, 2-3 réalisations clés avec résultats chiffrés, vos compétences distinctives, et votre vision pour la suite."
                    value={getPitch('3min').content}
                    onChange={(e) => updatePitch('3min', e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Structurez en 3 parties : Qui je suis (30s) → Ce que j'ai accompli (2min) → Ce que je recherche (30s)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={handleGenerateFeedback}
              className="w-full mt-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Obtenir un feedback IA
            </Button>
          </CardContent>
        </Card>

        {feedback && (
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-600">Feedback personnalisé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-amber max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {feedback}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PitchPresentationPage;
