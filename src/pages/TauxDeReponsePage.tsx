import { Header } from '@/components/Header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import React from 'react';

const responseData = {
  day: [
    { label: '03/01', rate: 50 },
    { label: '02/01', rate: 45 },
    { label: '01/01', rate: 40 },
    { label: '31/12', rate: 35 },
    { label: '30/12', rate: 30 },
  ],
  week: [
    { label: 'Semaine 1', rate: 42 },
    { label: 'Semaine 52', rate: 38 },
    { label: 'Semaine 51', rate: 36 },
    { label: 'Semaine 50', rate: 34 },
  ],
  month: [
    { label: 'Janvier', rate: 40 },
    { label: 'Décembre', rate: 39 },
    { label: 'Novembre', rate: 37 },
    { label: 'Octobre', rate: 35 },
  ],
  threeMonths: [
    { label: 'Derniers 3 mois', rate: 39 },
  ],
  sixMonths: [
    { label: 'Derniers 6 mois', rate: 36 },
  ],
};

const TauxDeReponsePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <Header />
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Taux de Réponse des candidatures envoyées</h1>
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          Retour
        </Link>
      </div>
      <Tabs defaultValue="day" className="space-y-4">
        <TabsList className="grid grid-cols-5 max-w-xl mx-auto">
          <TabsTrigger value="day">Jour</TabsTrigger>
          <TabsTrigger value="week">Semaine</TabsTrigger>
          <TabsTrigger value="month">Mois</TabsTrigger>
          <TabsTrigger value="threeMonths">3 mois</TabsTrigger>
          <TabsTrigger value="sixMonths">6 mois</TabsTrigger>
        </TabsList>
        {(['day','week','month','threeMonths','sixMonths'] as const).map(period => (
          <TabsContent value={period} key={period}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Taux de réponse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responseData[period].map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>{item.rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  </div>
);

export default TauxDeReponsePage;
