
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, Calendar, Building, Upload, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddJobModal } from './AddJobModal';
import { Job, initialJobs } from '@/data/jobs';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface ApplicationKanbanProps {
  preview?: boolean;
  onPreviewClick?: () => void;
}

const SortableJobCard: React.FC<{ job: Job; onDoubleClick?: () => void }> = ({ job, onDoubleClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={onDoubleClick}
      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm leading-tight">{job.title}</h4>
          {job.url && (
            <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0 ml-2" />
          )}
        </div>
        
        <div className="flex items-center gap-1 mb-2">
          <Building className="h-3 w-3 text-gray-500" />
          <p className="text-xs text-gray-600 truncate">{job.company}</p>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">{job.location}</p>
        
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${getPriorityColor(job.priority)}`}>
            {job.priority}
          </Badge>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {new Date(job.dateAdded).toLocaleDateString('fr-FR', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        <Badge variant="outline" className="mt-2 text-xs">
          {job.label}
        </Badge>
      </CardContent>
    </Card>
  );
};

const DroppableColumn: React.FC<{
  column: { id: string; title: string; color: string; count: number };
  jobs: Job[];
  children: React.ReactNode;
}> = ({ column, jobs, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`${column.color} rounded-lg p-4 min-h-[600px] ${isOver ? 'ring-2 ring-[#a4007c]' : ''}`}
        data-column-id={column.id}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <Badge variant="secondary">{column.count}</Badge>
        </div>

        <div className="space-y-3 min-h-[500px]">
          {children}
        </div>
      </div>
    </SortableContext>
  );
};

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({ preview = false, onPreviewClick }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [editJob, setEditJob] = useState<{ data: Job; columnId: string } | null>(null);
  const [jobs, setJobs] = useState<Record<string, Job[]>>(initialJobs);

  useEffect(() => {
    const saved = localStorage.getItem('jobs');
    if (saved) {
      try {
        setJobs(JSON.parse(saved));
        return; // Skip remote fetch when local data exists
      } catch (err) {
        console.error('Failed to parse saved jobs', err);
      }
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await downloadJson<Record<string, Job[]>>("data-emploi-tracker", `${user.id}/jobs.json`);
      if (data) {
        setJobs(data);
      }
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await uploadJson('data-emploi-tracker', `${user.id}/jobs.json`, jobs);
    };
    save();
  }, [jobs]);

  const columns = [
    { id: 'targeted', title: 'Ciblés', color: 'bg-gray-100', count: jobs.targeted.length },
    { id: 'applied', title: 'Postulé', color: 'bg-blue-100', count: jobs.applied.length },
    { id: 'screening', title: 'Screening', color: 'bg-yellow-100', count: jobs.screening.length },
    { id: 'interview', title: 'Entretien', color: 'bg-orange-100', count: jobs.interview.length },
    { id: 'final', title: 'Finale', color: 'bg-purple-100', count: jobs.final.length },
    { id: 'offer', title: 'Offre', color: 'bg-green-100', count: jobs.offer.length },
  ];

  const validColumnIds = columns.map(col => col.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findJobAndColumn = (jobId: string) => {
    for (const [columnId, columnJobs] of Object.entries(jobs)) {
      const job = columnJobs.find(job => job.id === jobId);
      if (job) {
        return { job, columnId };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const result = findJobAndColumn(active.id as string);
    if (result) {
      setActiveJob(result.job);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveJob(null);
      return;
    }

    const jobId = active.id as string;
    let targetColumnId = over.id as string;
    
    // Si on drop sur une carte, on trouve la colonne parente
    const result = findJobAndColumn(jobId);
    if (!result) {
      setActiveJob(null);
      return;
    }

    // Vérifier si on drop sur une colonne valide
    if (!validColumnIds.includes(targetColumnId)) {
      // Si on drop sur une carte, trouver la colonne qui contient cette carte
      const overResult = findJobAndColumn(targetColumnId);
      if (overResult) {
        targetColumnId = overResult.columnId;
      } else {
        setActiveJob(null);
        return;
      }
    }

    // Si c'est la même colonne, ne rien faire
    if (result.columnId === targetColumnId) {
      setActiveJob(null);
      return;
    }

    console.log(`Moving job ${jobId} from ${result.columnId} to ${targetColumnId}`);

    // Déplacer le job vers la nouvelle colonne
    setJobs(prev => {
      const newJobs = { ...prev };
      
      // Vérifier que les colonnes existent
      if (!newJobs[result.columnId] || !newJobs[targetColumnId]) {
        console.error('Invalid column:', result.columnId, targetColumnId);
        return prev;
      }
      
      // Retirer le job de la colonne source
      newJobs[result.columnId] = newJobs[result.columnId].filter(job => job.id !== jobId);
      
      // Ajouter le job à la colonne de destination
      newJobs[targetColumnId] = [...newJobs[targetColumnId], result.job];
      
      return newJobs;
    });

    setActiveJob(null);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'dateAdded'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setJobs(prev => ({
      ...prev,
      targeted: [...prev.targeted, newJob]
    }));
  };

  const updateJob = (jobData: Job) => {
    setJobs(prev => {
      const newJobs = { ...prev };
      const columnJobs = newJobs[editJob!.columnId];
      newJobs[editJob!.columnId] = columnJobs.map(j => j.id === jobData.id ? { ...j, ...jobData } : j);
      return newJobs;
    });
  };

  const exportJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await uploadJson('data-emploi-tracker', `${user.id}/jobs.json`, jobs);
  };

  if (preview) {
    return (
      <Card role="button" className="h-96 cursor-pointer" onClick={onPreviewClick}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Entonnoir de Candidatures</span>
            <Badge variant="secondary">{Object.values(jobs).flat().length} postes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 h-full">
            {columns.slice(0, 3).map(column => (
              <div key={column.id} className={`${column.color} rounded-lg p-3`}>
                <h4 className="font-medium text-sm mb-2">{column.title}</h4>
                <div className="space-y-2">
                  {jobs[column.id].slice(0, 2).map(job => (
                    <div key={job.id} className="bg-white p-2 rounded shadow-sm">
                      <p className="font-medium text-xs truncate">{job.title}</p>
                      <p className="text-xs text-gray-600 truncate">{job.company}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Entonnoir de Candidatures</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddModal(true)} className="bg-[#a4007c] hover:bg-[#a4007c]/90">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Poste
            </Button>
            <Button variant="outline" onClick={exportJobs} className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Sauvegarder
            </Button>
            <Link to="/methode-star" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent">
              <Info className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {columns.map(column => (
            <DroppableColumn key={column.id} column={column} jobs={jobs[column.id]}>
              {jobs[column.id].map(job => (
                <SortableJobCard
                  key={job.id}
                  job={job}
                  onDoubleClick={() => setEditJob({ data: job, columnId: column.id })}
                />
              ))}
            </DroppableColumn>
          ))}
        </div>

        <DragOverlay>
          {activeJob ? <SortableJobCard job={activeJob} /> : null}
        </DragOverlay>
      </div>

      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addJob}
      />

      <AddJobModal
        isOpen={!!editJob}
        onClose={() => setEditJob(null)}
        onSubmit={(data) => {
          updateJob({ ...(editJob!.data), ...data });
          setEditJob(null);
        }}
        initialData={editJob ? editJob.data : undefined}
      />
    </DndContext>
  );
};
