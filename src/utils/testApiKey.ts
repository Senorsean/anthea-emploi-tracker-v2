import { supabase } from "@/integrations/supabase/client";

export const testOpenAIKey = async (): Promise<boolean> => {
  try {
    console.log("Test de la clé API OpenAI...");
    
    const { data, error } = await supabase.functions.invoke('generate-career-path', {
      body: {
        userProfile: "Test de connexion API",
        targetRole: "Test",
        experience: "1 an",
        skills: ["Test"]
      }
    });

    if (error) {
      console.error("Erreur lors du test de l'API:", error);
      return false;
    }

    console.log("Test réussi - La clé API OpenAI fonctionne !");
    return true;
  } catch (error) {
    console.error("Erreur lors du test:", error);
    return false;
  }
};