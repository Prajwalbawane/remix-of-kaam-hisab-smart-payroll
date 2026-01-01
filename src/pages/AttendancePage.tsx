import { useState } from 'react';
import { Calendar, Check, CheckCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AttendanceActions } from '@/components/attendance/AttendanceActions';
import { useApiData } from '@/hooks/useApiData';
import { cn } from '@/lib/utils';

export default function AttendancePage() {
  const { workers, attendance, markAttendance, isLoading } = useApiData();
  const today = new Date().toISOString().split('T')[0];

  const getTodayAttendance = (workerId: string) => {
    return attendance.find(a => a.workerId === workerId && a.date === today);
  };

  const markedCount = workers.filter(w => getTodayAttendance(w.id)).length;

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
        title="आजची हजेरी" 
        subtitle={`${markedCount}/${workers.length} marked`}
        showBack
      />

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-success" />
            <div>
              <p className="font-semibold text-foreground">{markedCount} of {workers.length}</p>
              <p className="text-xs text-muted-foreground">Attendance marked</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-success">
              {workers.length > 0 ? Math.round((markedCount / workers.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Workers List */}
        {workers.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No workers added</p>
            <p className="text-sm text-muted-foreground">
              Add workers first to mark attendance
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((worker) => {
              const todayRecord = getTodayAttendance(worker.id);
              
              return (
                <div
                  key={worker.id}
                  className={cn(
                    "p-4 bg-card rounded-xl border shadow-card transition-all",
                    todayRecord ? "border-success/30" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        todayRecord ? "bg-success/10" : "bg-primary/10"
                      )}>
                        {todayRecord ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {worker.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{worker.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{worker.dailyRate}/day
                        </p>
                      </div>
                    </div>
                    {todayRecord && (
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-medium",
                        todayRecord.status === 'present' && "bg-success/10 text-success",
                        todayRecord.status === 'half-day' && "bg-warning/10 text-warning",
                        todayRecord.status === 'absent' && "bg-destructive/10 text-destructive"
                      )}>
                        {todayRecord.status === 'present' ? 'हजर' : 
                         todayRecord.status === 'half-day' ? 'अर्धा' : 'गैरहजर'}
                      </span>
                    )}
                  </div>
                  
                  <AttendanceActions
                    currentStatus={todayRecord?.status}
                    onMark={(status) => markAttendance(worker.id, status)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
