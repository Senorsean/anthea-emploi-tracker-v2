
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, Calendar, Building } from 'lucide-react';
import { AddJobModal } from './AddJobModal';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  label: string;
  url?: string;
  dateAdded: string;
}

interface ApplicationKanbanProps {
  preview?: boolean;
}

const SortableJobCard: React.FC<{ job: Job }> = ({ job }) => {
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

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({ preview = false }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Record<string, Job[]>>({
    targeted: [
      {
        id: '1',
        title: 'Product Manager',
        company: 'Google',
        location: 'Paris, FR',
        priority: 'High',
        label: 'Tech',
        dateAdded: '2025-01-02'
      },
      {
        id: '2',
        title: 'Marketing Manager',
        company: 'Microsoft',
        location: 'Lyon, FR',
        priority: 'Medium',
        label: 'Marketing',
        dateAdded: '2025-01-01'
      }
    ],
    applied: [
      {
        id: '3',
        title: 'Senior Product Manager',
        company: 'Amazon',
        location: 'Remote',
        priority: 'High',
        label: 'Tech',
        url: 'https://example.com',
        dateAdded: '2024-12-28'
      }
    ],
    screening: [
      {
        id: '4',
        title: 'Product Marketing Manager',
        company: 'Salesforce',
        location: 'Paris, FR',
        priority: 'High',
        label: 'Marketing',
        dateAdded: '2024-12-25'
      }
    ],
    interview: [],
    final: [],
    offer: []
  });

  const columns = [
    { id: 'targeted', title: 'Ciblés', color: 'bg-gray-100', count: jobs.targeted.length },
    { id: 'applied', title: 'Postulé', color: 'bg-blue-100', count: jobs.applied.length },
    { id: 'screening', title: 'Screening', color: 'bg-yellow-100', count: jobs.screening.length },
    { id: 'interview', title: 'Entretien', color: 'bg-orange-100', count: jobs.interview.length },
    { id: 'final', title: 'Finale', color: 'bg-purple-100', count: jobs.final.length },
    { id: 'offer', title: 'Offre', color: 'bg-green-100', count: jobs.offer.length },
  ];

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
    const targetColumnId = over.id as string;
    
    const result = findJobAndColumn(jobId);
    if (!result || result.columnId === targetColumnId) {
      setActiveJob(null);
      return;
    }

    // Move job to new column
    setJobs(prev => {
      const newJobs = { ...prev };
      
      // Remove job from source column
      newJobs[result.columnId] = newJobs[result.columnId].filter(job => job.id !== jobId);
      
      // Add job to target column
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

  if (preview) {
    return (
      <Card className="h-96">
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
          <Button onClick={() => setShowAddModal(true)} className="bg-[#a4007c] hover:bg-[#a4007c]/90">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Poste
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {columns.map(column => (
            <SortableContext key={column.id} items={jobs[column.id].map(job => job.id)} strategy={verticalListSortingStrategy}>
              <div
                className={`${column.color} rounded-lg p-4 min-h-[600px]`}
                data-column-id={column.id}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary">{column.count}</Badge>
                </div>
                
                <div
                  className="space-y-3 min-h-[500px] relative"
                  style={{ 
                    minHeight: '500px',
                    border: '2px dashed transparent',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.border = '2px dashed #a4007c';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.border = '2px dashed transparent';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.border = '2px dashed transparent';
                  }}
                >
                  {jobs[column.id].map(job => (
                    <SortableJobCard key={job.id} job={job} />
                  ))}
                  
                  {/* Drop zone overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      zIndex: -1,
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const targetColumnId = column.id;
                      // Handle drop logic here if needed
                    }}
                    data-droppable-id={column.id}
                  />
                </div>
              </div>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeJob ? <SortableJobCard job={activeJob} /> : null}
        </DragOverlay>
      </div>

      <AddJobModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addJob}
      />
    </DndContext>
  );
};
