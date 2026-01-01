import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, ArrowRight, ArrowLeft, Shield, HardHat, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppData } from '@/hooks/useAppData';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

type LoginMode = 'select' | 'owner' | 'worker';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAsOwner, loginAsWorker } = useAuth();
  const { workers } = useAppData();
  const { t } = useLanguage();
  
  const [mode, setMode] = useState<LoginMode>('select');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  const handleOwnerLogin = () => {
    if (!name.trim() || !phone.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter name and phone number',
        variant: 'destructive',
      });
      return;
    }
    
    loginAsOwner(name.trim(), phone.trim());
    toast({
      title: 'Welcome!',
      description: `Logged in as Owner: ${name}`,
    });
    navigate('/');
  };

  const handleWorkerLogin = () => {
    if (!selectedWorkerId) {
      toast({
        title: 'Error',
        description: 'Please select your name from the list',
        variant: 'destructive',
      });
      return;
    }
    
    const worker = workers.find(w => w.id === selectedWorkerId);
    if (!worker) return;
    
    loginAsWorker(worker.name, worker.phone || '', worker.id);
    toast({
      title: 'Welcome!',
      description: `Logged in as: ${worker.name}`,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-success/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <div className="relative z-10 pt-12 pb-8 px-6 text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl animate-scale-in">
            <HardHat className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-3 h-3 text-success-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight animate-fade-in">{t('appName')}</h1>
        <p className="text-muted-foreground mt-2 animate-fade-in">{t('tagline')}</p>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-6 pb-6">
        <div className="max-w-md mx-auto">
          {mode === 'select' && (
            <div className="space-y-4 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-foreground">{t('chooseRole')}</h2>
                <p className="text-sm text-muted-foreground mt-1">Select how you want to use KaamTrack</p>
              </div>
              
              {/* Owner Option */}
              <button
                onClick={() => setMode('owner')}
                className="w-full p-6 bg-card/80 backdrop-blur-sm border border-border rounded-2xl flex items-center gap-4 hover:border-primary/50 hover:bg-card hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-foreground text-lg">{t('ownerMalik')}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{t('ownerDescription')}</p>
                </div>
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>

              {/* Worker Option */}
              <button
                onClick={() => setMode('worker')}
                className="w-full p-6 bg-card/80 backdrop-blur-sm border border-border rounded-2xl flex items-center gap-4 hover:border-success/50 hover:bg-card hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center group-hover:from-success/30 group-hover:to-success/20 transition-all duration-300">
                  <HardHat className="w-8 h-8 text-success" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-foreground text-lg">{t('workerKamgar')}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{t('workerDescription')}</p>
                </div>
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-success group-hover:text-success-foreground transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>

              {/* Features hint */}
              <div className="pt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  QR Attendance
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  Payment Tracking
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  Reports
                </span>
              </div>
            </div>
          )}

          {mode === 'owner' && (
            <div className="animate-slide-up">
              {/* Back button and title */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setMode('select')}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('ownerLogin')}</h2>
                  <p className="text-sm text-muted-foreground">Enter your details to continue</p>
                </div>
              </div>

              {/* Form */}
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('yourName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('enterName')}
                      className="w-full pl-12 pr-4 py-4 bg-muted/50 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('phoneNumber')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-4 bg-muted/50 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleOwnerLogin}
                  className="w-full py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {t('login')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {mode === 'worker' && (
            <div className="animate-slide-up">
              {/* Back button and title */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setMode('select')}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('workerLogin')}</h2>
                  <p className="text-sm text-muted-foreground">Select your name to continue</p>
                </div>
              </div>

              {workers.length === 0 ? (
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HardHat className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-semibold mb-2">{t('noWorkersRegistered')}</p>
                  <p className="text-sm text-muted-foreground">{t('askOwnerToAdd')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-3">
                      {t('selectYourName')}
                    </label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {workers.map((worker) => (
                        <button
                          key={worker.id}
                          onClick={() => setSelectedWorkerId(worker.id)}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all duration-200",
                            selectedWorkerId === worker.id
                              ? "bg-success/10 border-success shadow-md"
                              : "bg-background/50 border-transparent hover:border-border hover:bg-background"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                            selectedWorkerId === worker.id 
                              ? "bg-success text-success-foreground" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-foreground">{worker.name}</p>
                            <p className="text-xs text-muted-foreground">₹{worker.dailyRate}/day</p>
                          </div>
                          {selectedWorkerId === worker.id && (
                            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center animate-scale-in">
                              <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleWorkerLogin}
                    disabled={!selectedWorkerId}
                    className="w-full py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {t('login')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-6 text-center border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground">
          {t('appName')} v1.0 • Made for contractors with ❤️
        </p>
      </div>
    </div>
  );
}
