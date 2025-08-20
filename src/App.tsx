import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AmeliorerEntretiensPage from "./pages/AmeliorerEntretiensPage";
import NegociationOffrePage from "./pages/NegociationOffrePage";
import PreparationEntretienPage from "./pages/PreparationEntretienPage";
import MethodeStarPage from "./pages/MethodeStarPage";
import RenforcezVotreReseauPage from "./pages/RenforcezVotreReseauPage";
import OptimiserProfilLinkedinPage from "./pages/OptimiserProfilLinkedinPage";
import ProgressionEntretiensPage from "./pages/ProgressionEntretiensPage";
import ProgressionCandidaturesPage from "./pages/ProgressionCandidaturesPage";
import ProgressionReseauPage from "./pages/ProgressionReseauPage";
import ProgressionCarrierePage from "./pages/ProgressionCarrierePage";
import ReferentielsSalairesPage from "./pages/ReferentielsSalairesPage";
import ParcoursCarrierePage from "./pages/ParcoursCarrierePage";
import ParcoursCarriereResultatsPage from "./pages/ParcoursCarriereResultatsPage";
import TauxReponsePage from "./pages/TauxReponsePage";
import ApprentissageCompetencesPage from "./pages/ApprentissageCompetencesPage";
import IntelligenceMarcheePage from "./pages/IntelligenceMarcheePage";
import TesterConnaissancesPage from "./pages/TesterConnaissancesPage";
import AireMobilitePage from "./pages/AireMobilitePage";
import IkigaiPage from "./pages/IkigaiPage";
import { AnalyseTransactionnellePage } from './pages/AnalyseTransactionnellePage';
import SwotPersonnelPage from './pages/SwotPersonnelPage';
import Settings from "./pages/Settings";
import RequireAuth from "./components/RequireAuth";
import { JobsProvider } from "@/hooks/useJobs";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <JobsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          />
          <Route
            path="/ameliorer-entretiens"
            element={
              <RequireAuth>
                <AmeliorerEntretiensPage />
              </RequireAuth>
            }
          />
          <Route
            path="/progression-entretiens"
            element={
              <RequireAuth>
                <ProgressionEntretiensPage />
              </RequireAuth>
            }
          />
          <Route
            path="/progression-candidatures"
            element={
              <RequireAuth>
                <ProgressionCandidaturesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/progression-reseau"
            element={
              <RequireAuth>
                <ProgressionReseauPage />
              </RequireAuth>
            }
          />
          <Route
            path="/taux-reponse"
            element={
              <RequireAuth>
                <TauxReponsePage />
              </RequireAuth>
            }
          />
          <Route
            path="/preparation-entretien"
            element={
              <RequireAuth>
                <PreparationEntretienPage />
              </RequireAuth>
            }
          />
          <Route
            path="/methode-star"
            element={
              <RequireAuth>
                <MethodeStarPage />
              </RequireAuth>
            }
          />
          <Route
            path="/renforcez-votre-reseau"
            element={
              <RequireAuth>
                <RenforcezVotreReseauPage />
              </RequireAuth>
            }
          />
          <Route
            path="/optimiser-profil-linkedin"
            element={
              <RequireAuth>
                <OptimiserProfilLinkedinPage />
              </RequireAuth>
            }
          />
          <Route
            path="/negociation-offre"
            element={
              <RequireAuth>
                <NegociationOffrePage />
              </RequireAuth>
            }
          />
          <Route
            path="/progression-carriere"
            element={
              <RequireAuth>
                <ProgressionCarrierePage />
              </RequireAuth>
            }
          />
          <Route
            path="/referentiels-salaires"
            element={
              <RequireAuth>
                <ReferentielsSalairesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/parcours-carriere"
            element={
              <RequireAuth>
                <ParcoursCarrierePage />
              </RequireAuth>
            }
          />
          <Route
            path="/parcours-carriere-resultats"
            element={
              <RequireAuth>
                <ParcoursCarriereResultatsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/apprentissage-competences"
            element={
              <RequireAuth>
                <ApprentissageCompetencesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/intelligence-marche"
            element={
              <RequireAuth>
                <IntelligenceMarcheePage />
              </RequireAuth>
            }
          />
          <Route
            path="/tester-connaissances"
            element={
              <RequireAuth>
                <TesterConnaissancesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/aire-mobilite"
            element={
              <RequireAuth>
                <AireMobilitePage />
              </RequireAuth>
            }
          />
          <Route
            path="/mobility"
            element={
              <RequireAuth>
                <AireMobilitePage />
              </RequireAuth>
            }
          />
          <Route
            path="/ikigai"
            element={
              <RequireAuth>
                <IkigaiPage />
              </RequireAuth>
            }
          />
          <Route
            path="/analyse-transactionnelle"
            element={
              <RequireAuth>
                <AnalyseTransactionnellePage />
              </RequireAuth>
            }
          />
          <Route
            path="/swot-personnel"
            element={
              <RequireAuth>
                <SwotPersonnelPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <footer className="text-center py-4 text-xs text-gray-500">
        Application créée par Samuel LUCAS© 2025 Conformité RGPD
      </footer>
    </TooltipProvider>
    </JobsProvider>
  </QueryClientProvider>
);

export default App;
