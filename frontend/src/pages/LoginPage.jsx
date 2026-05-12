import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Zap, BarChart3, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import LogoIcon from '@/components/ui/LogoIcon';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Subtle spotlight effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError && validateEmail(e.target.value)) {
      setEmailError('');
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    let hasError = false;

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) {
      triggerShake();
      toast.error('Please fix the errors to continue');
      return;
    }

    setIsSubmitLoading(true);
    
    try {
      const start = Date.now();
      await login(email, password);
      const elapsed = Date.now() - start;
      const remainingTime = Math.max(0, 1500 - elapsed);
      
      setTimeout(() => {
        setIsSubmitLoading(false);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }, remainingTime);

    } catch (err) {
      setTimeout(() => {
        setIsSubmitLoading(false);
        setError(err.message || 'Invalid credentials');
        toast.error('Invalid credentials');
        triggerShake();
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-overlay)] flex flex-col lg:flex-row font-sans text-slate-100 overflow-hidden relative selection:bg-primary/30 selection:text-[var(--text-main)]">
      
      {/* Global Grain/Noise Overlay for ultra-premium texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-50"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* LEFT PANEL - 7/12 (Golden Ratio adjacent) */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-16 xl:p-24 overflow-hidden border-r border-[var(--border-subtle)]">
        
        {/* Abstract Fluid Mesh Gradients */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 opacity-40 mix-blend-screen transition-transform duration-1000 ease-out"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 40%),
                           radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.1) 0%, transparent 40%)`
            }}
          />
        </div>
        
        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.4)] shadow-glass-edge">
            <LogoIcon className="w-6 h-6 text-[var(--text-main)]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[var(--text-main)] drop-shadow-sm">
            Vertex<span className="text-primary">.io</span>
          </span>
        </div>

        {/* Middle: Content */}
        <div className="relative z-10 max-w-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-5xl xl:text-[3.5rem] font-semibold leading-[1.1] text-[var(--text-main)] mb-6 tracking-tight">
            Intelligent operations, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400">
              simplified.
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg xl:text-xl mb-12 leading-relaxed font-light">
            Experience our next-generation admin platform designed for extreme performance, security, and pixel-perfect clarity.
          </p>

          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {[
              { icon: Zap, title: 'Real-time Analytics', desc: 'Sub-millisecond data processing pipeline.', color: 'text-indigo-400' },
              { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Bank-grade AES-256 encryption standard.', color: 'text-emerald-400' },
              { icon: BarChart3, title: 'Advanced Reporting', desc: 'Customized visual insights at scale.', color: 'text-amber-400' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover:bg-[var(--bg-active)] group-hover:scale-105 group-hover:shadow-glass-edge">
                  <feature.icon className={cn("w-6 h-6", feature.color)} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[1.05rem] font-medium text-[var(--text-main)] tracking-wide">{feature.title}</h3>
                  <p className="text-[0.9rem] text-[var(--text-muted)] mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="relative z-10 text-sm text-[var(--text-faint)] font-medium tracking-wide animate-fade-in" style={{ animationDelay: '0.7s' }}>
          &copy; {new Date().getFullYear()} Vertex Corporation. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - 5/12 */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10">
        
        {/* Mobile Animated Background */}
        <div 
          className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#030305] to-[#030305] lg:hidden pointer-events-none"
        />

        {/* Form Card */}
        <div className={cn(
          "w-full max-w-[420px] bg-[var(--bg-card)]/80 backdrop-blur-2xl rounded-premium p-8 sm:p-10 shadow-glass-glow shadow-glass-edge border border-[var(--border-focus)] relative z-20 animate-fade-up",
          isShaking && "animate-shake"
        )}>
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-glass-edge">
              <LogoIcon className="w-5 h-5 text-[var(--text-main)]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--text-main)] drop-shadow-sm">
              Vertex<span className="text-primary">.io</span>
            </span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-[1.75rem] font-semibold text-[var(--text-main)] mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-[var(--text-muted)] text-[0.95rem]">Sign in to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Global Error Toast */}
            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              error ? "max-h-20 opacity-100 mb-5" : "max-h-0 opacity-0 m-0"
            )}>
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[0.85rem] font-medium text-[var(--text-secondary)] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-faint)] group-focus-within:text-primary transition-colors duration-300">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={cn(
                    "block w-full pl-[2.8rem] pr-4 py-3.5 bg-[var(--bg-card-alt)] border rounded-xl text-slate-200 placeholder-slate-600 text-[0.95rem] focus:outline-none focus:ring-[3px] transition-all duration-300 shadow-inner",
                    emailError 
                      ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20" 
                      : "border-[var(--border-card)] focus:border-primary focus:ring-primary/20 hover:border-white/[0.1]"
                  )}
                  placeholder="admin@vertex.io"
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-rose-400 ml-1 font-medium animate-fade-in">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[0.85rem] font-medium text-[var(--text-secondary)] ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-faint)] group-focus-within:text-primary transition-colors duration-300">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-[2.8rem] pr-12 py-3.5 bg-[var(--bg-card-alt)] border border-[var(--border-card)] rounded-xl text-slate-200 placeholder-slate-600 text-[0.95rem] focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary hover:border-white/[0.1] transition-all duration-300 shadow-inner"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-[0.85rem] pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-4 h-4 rounded-[4px] border border-white/[0.15] bg-[var(--bg-card-alt)] checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-[#0c0c11] transition-all cursor-pointer"
                  />
                  <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity text-[var(--text-main)]">
                    <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-[var(--text-muted)] group-hover:text-slate-200 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-indigo-400 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitLoading}
              className={cn(
                "w-full h-[52px] mt-4 flex justify-center items-center rounded-xl text-[0.95rem] font-semibold text-[var(--text-main)] transition-all duration-300 overflow-hidden relative group",
                "bg-indigo-600",
                "focus:outline-none focus:ring-[3px] focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-[#0c0c11]",
                "shadow-[0_0_20px_rgba(99,102,241,0.2)] shadow-glass-edge",
                isSubmitLoading ? "opacity-80 cursor-not-allowed" : "hover:scale-[1.01] hover:shadow-premium-glow hover:bg-indigo-500"
              )}
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
              
              <span className="relative flex items-center gap-2">
                {isSubmitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-8 p-4 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-center shadow-inner">
            <p className="text-[0.8rem] text-[var(--text-muted)] tracking-wide">
              Demo: <span className="text-slate-200 font-medium">admin@vertex.io</span> / <span className="text-slate-200 font-medium">vertex2024</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
