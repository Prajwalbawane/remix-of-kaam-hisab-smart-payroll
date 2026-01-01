import { useState } from 'react';
import { Plus, Search, Users, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { WorkerCard } from '@/components/workers/WorkerCard';
import { AddWorkerSheet } from '@/components/workers/AddWorkerSheet';
import { useApiData } from '@/hooks/useApiData';
import { useNavigate } from 'react-router-dom';

export default function WorkersPage() {
  const navigate = useNavigate();
  const { workers, attendance, addWorker, getWorkerStats, isLoading } = useApiData();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date().toISOString().split('T')[0];
  
  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTodayAttendance = (workerId: string) => {
    return attendance.find(a => a.workerId === workerId && a.date === today);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="कामगार" 
        subtitle={`${workers.length} registered`}
        action={
          <button
            onClick={() => setShowAddSheet(true)}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="कामगार शोधा..."
            className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        {/* Workers List */}
        {filteredWorkers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            {workers.length === 0 ? (
              <>
                <p className="text-foreground font-medium mb-1">अजून कामगार नाहीत</p>
                <p className="text-sm text-muted-foreground mb-4">
                  नवीन कामगार जोडण्यासाठी + बटण दाबा
                </p>
                <button
                  onClick={() => setShowAddSheet(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  कामगार जोडा
                </button>
              </>
            ) : (
              <>
                <p className="text-foreground font-medium mb-1">कोणी सापडले नाही</p>
                <p className="text-sm text-muted-foreground">
                  दुसरे नाव शोधून बघा
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredWorkers.map((worker) => {
              const stats = getWorkerStats(worker.id);
              return (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  todayAttendance={getTodayAttendance(worker.id)}
                  stats={stats ? { presentDays: stats.presentDays, balance: stats.balance } : undefined}
                  onClick={() => navigate(`/worker/${worker.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>

      <AddWorkerSheet 
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={addWorker}
      />
    </div>
  );
}
