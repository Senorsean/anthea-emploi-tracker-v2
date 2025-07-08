import React, { useState } from "react";
import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { ApplicationStats } from "@/components/ApplicationStats";
import { ApplicationKanban } from "@/components/ApplicationKanban";
import { NetworkingCRM } from "@/components/NetworkingCRM";
import { AIInsights } from "@/components/AIInsights";
import { OverviewFocusAreas } from "@/components/OverviewFocusAreas";
import { GoalsModule } from "@/components/GoalsModule";
import WebzinesAnthea from "@/components/WebzinesAnthea";
import OffresDuJour from "@/components/OffresDuJour";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onLogoClick={() => setActiveTab("overview")} />

      <main className="container mx-auto px-4 py-8">
        <StatsOverview />
        <ApplicationStats />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid grid-cols-4 lg:w-1/2 mx-auto mb-8">
            <TabsTrigger value="overview" className="text-sm">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="applications" className="text-sm">
              Candidatures
            </TabsTrigger>
            <TabsTrigger value="network" className="text-sm">
              Réseau
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-sm">
              Objectifs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <AIInsights />
            <OverviewFocusAreas />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ApplicationKanban
                preview={true}
                onPreviewClick={() => setActiveTab("applications")}
              />
              <NetworkingCRM
                preview={true}
                onPreviewClick={() => setActiveTab("network")}
              />
            </div>
            <OffresDuJour />
            <WebzinesAnthea />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationKanban />
          </TabsContent>

          <TabsContent value="network">
            <NetworkingCRM />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
