import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  User, Building2, ArrowLeft, Loader2, Eye, EyeOff, Phone, Lock, 
  UserPlus, LogIn, ArrowRight, Users, CalendarCheck, Wallet, ChevronRight
} from 'lucide-react';

type AuthMode = 'splash' | 'onboarding' | 'auth';
type AuthTab = 'login' | 'register';
type UserRole = 'owner' | 'worker';

const onboardingSlides = [
  {
    icon: Users,
    title: 'Manage Workers',
    description: 'Add and organize all your workers in one place. Track their details, work types, and daily rates easily.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: CalendarCheck,
    title: 'Track Attendance',
    description: 'Mark daily attendance with just a tap. Use QR codes for quick and accurate tracking.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Wallet,
    title: 'Handle Payments',
    description: 'Record payments and advances. Generate reports and keep your accounts crystal clear.',
    color: 'from-purple-500 to-purple-600'
  }
];

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('splash');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [role, setRole] = useState<UserRole>('owner');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, isLoading, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('kaamtrack-onboarding-seen');
    if (hasSeenOnboarding) {
      setMode('auth');
    } else {
      // Show splash for 2 seconds then move to onboarding
      const timer = setTimeout(() => {
        setMode('onboarding');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleSkipOnboarding = () => {
    localStorage.setItem('kaamtrack-onboarding-seen', 'true');
    setMode('auth');
  };

  const handleNextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleSkipOnboarding();
    }
  };

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

  // Only show loading if checking auth AND already past splash/onboarding
  if (isLoading && mode === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Splash Screen
  if (mode === 'splash') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="animate-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-2xl">
            <Building2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          KaamTrack
        </h1>
        <p className="text-white/80 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          Attendance & Payment Tracker
        </p>
        <div className="mt-8 animate-in fade-in duration-500 delay-700">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      </div>
    );
  }

  // Onboarding Screens
  if (mode === 'onboarding') {
    const slide = onboardingSlides[currentSlide];
    const SlideIcon = slide.icon;

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
        {/* Skip button */}
        <div className="flex justify-end p-4">
          <Button variant="ghost" onClick={handleSkipOnboarding} className="text-muted-foreground">
            Skip
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-2xl animate-in zoom-in duration-500`}>
            <SlideIcon className="h-16 w-16 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {slide.title}
          </h2>
          
          <p className="text-muted-foreground text-center text-lg max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            {slide.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="p-8">
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {onboardingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <Button 
            className="w-full h-14 text-lg font-medium shadow-lg"
            onClick={handleNextSlide}
          >
            {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Auth Screen (Login/Register)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative pt-8 pb-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-3">
          <Building2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          KaamTrack
        </h1>
      </div>

      {/* Role Selection - Top */}
      <div className="relative px-4 mb-4">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole('owner')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                role === 'owner'
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                role === 'owner'
                  ? 'bg-gradient-to-br from-primary to-primary/80'
                  : 'bg-muted'
              }`}>
                <Building2 className={`h-6 w-6 ${role === 'owner' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <p className={`font-medium ${role === 'owner' ? 'text-primary' : 'text-muted-foreground'}`}>
                Owner
              </p>
            </button>

            <button
              onClick={() => setRole('worker')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                role === 'worker'
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                role === 'worker'
                  ? 'bg-gradient-to-br from-primary to-primary/80'
                  : 'bg-muted'
              }`}>
                <User className={`h-6 w-6 ${role === 'worker' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <p className={`font-medium ${role === 'worker' ? 'text-primary' : 'text-muted-foreground'}`}>
                Worker
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="relative flex-1 px-4 pb-4">
        <Card className="max-w-md mx-auto shadow-xl shadow-primary/5 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {authTab === 'login' ? 'Welcome Back!' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {authTab === 'login' 
                ? `Sign in as ${role === 'owner' ? 'Owner' : 'Worker'}` 
                : `Register as ${role === 'owner' ? 'Owner' : 'Worker'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authTab === 'register' && (
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
              onClick={authTab === 'login' ? handleLogin : handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {authTab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {authTab === 'login' ? (
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
          </CardContent>
        </Card>
      </div>

      {/* Login/Register Toggle - Bottom */}
      <div className="relative px-4 pb-6">
        <div className="max-w-md mx-auto">
          <div className="bg-muted/50 p-1 rounded-xl">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setAuthTab('login')}
                className={`py-3 rounded-lg font-medium transition-all duration-300 ${
                  authTab === 'login'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="h-4 w-4 inline-block mr-2" />
                Login
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`py-3 rounded-lg font-medium transition-all duration-300 ${
                  authTab === 'register'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="h-4 w-4 inline-block mr-2" />
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}