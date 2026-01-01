import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { User, Building2, ArrowLeft, Loader2 } from 'lucide-react';

type AuthMode = 'select' | 'login' | 'register';
type UserRole = 'owner' | 'worker';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('select');
  const [role, setRole] = useState<UserRole>('owner');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const result = await login(phone, password);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Login successful!' });
      navigate('/');
    } else {
      toast({ title: result.error || 'Login failed', variant: 'destructive' });
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, phone, password, role);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Registration successful!' });
      navigate('/');
    } else {
      toast({ title: result.error || 'Registration failed', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setPassword('');
    setMode('select');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">KaamTrack</h1>
        <p className="text-muted-foreground mt-2">Attendance & Payment Tracker</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8">
        {mode === 'select' && (
          <div className="max-w-md mx-auto space-y-4">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => { setRole('owner'); setMode('login'); }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Login as Owner</h3>
                  <p className="text-sm text-muted-foreground">Manage workers & attendance</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => { setRole('worker'); setMode('login'); }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <User className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Login as Worker</h3>
                  <p className="text-sm text-muted-foreground">View your attendance & payments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={resetForm}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>
                  {mode === 'login' ? 'Login' : 'Register'} as {role === 'owner' ? 'Owner' : 'Worker'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={mode === 'login' ? handleLogin : handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {mode === 'login' ? 'Logging in...' : 'Registering...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Login' : 'Register'
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        className="text-primary underline"
                        onClick={() => setMode('register')}
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        className="text-primary underline"
                        onClick={() => setMode('login')}
                      >
                        Login
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}