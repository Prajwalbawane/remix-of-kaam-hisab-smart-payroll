import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { User, Building2, ArrowLeft, Loader2, Eye, EyeOff, Phone, Lock, UserPlus, LogIn } from 'lucide-react';

type AuthMode = 'select' | 'login' | 'register';
type UserRole = 'owner' | 'worker';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('select');
  const [role, setRole] = useState<UserRole>('owner');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
    setMode('select');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative pt-16 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-4">
          <Building2 className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          KaamTrack
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Attendance & Payment Tracker</p>
      </div>

      {/* Content */}
      <div className="relative flex-1 px-4 pb-8">
        {mode === 'select' && (
          <div className="max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-center text-muted-foreground mb-6">Choose how you want to continue</p>
            
            <Card 
              className="cursor-pointer group hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
              onClick={() => { setRole('owner'); setMode('login'); }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Login as Owner</h3>
                  <p className="text-sm text-muted-foreground">Manage workers & attendance</p>
                </div>
                <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer group hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
              onClick={() => { setRole('worker'); setMode('login'); }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Login as Worker</h3>
                  <p className="text-sm text-muted-foreground">View your attendance & payments</p>
                </div>
                <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
              variant="ghost"
              className="mb-4 hover:bg-primary/10"
              onClick={resetForm}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Card className="shadow-xl shadow-primary/5 border-primary/20">
              <CardHeader className="text-center pb-2">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-2 ${
                  role === 'owner' 
                    ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25' 
                    : 'bg-gradient-to-br from-secondary to-secondary/80 shadow-lg'
                }`}>
                  {role === 'owner' ? (
                    <Building2 className="h-8 w-8 text-primary-foreground" />
                  ) : (
                    <User className="h-8 w-8 text-secondary-foreground" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                </CardTitle>
                <CardDescription>
                  {mode === 'login' 
                    ? `Sign in as ${role === 'owner' ? 'Owner' : 'Worker'}` 
                    : `Register as ${role === 'owner' ? 'Owner' : 'Worker'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full Name
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  onClick={mode === 'login' ? handleLogin : handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="text-center">
                  {mode === 'login' ? (
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <button
                        className="text-primary font-medium hover:underline"
                        onClick={() => setMode('register')}
                      >
                        Create one
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        className="text-primary font-medium hover:underline"
                        onClick={() => setMode('login')}
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative text-center pb-6 text-sm text-muted-foreground">
        <p>© 2024 KaamTrack. All rights reserved.</p>
      </div>
    </div>
  );
}