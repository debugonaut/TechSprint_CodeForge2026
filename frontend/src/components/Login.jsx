import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Signed in successfully!');
      }
    } catch (err) {
      const errorMessage = err.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(')', '');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google!');
    } catch (err) {
      const errorMessage = err.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(')', '');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header with back button */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors group"
        >
          <div className="bg-surface border border-default p-2 rounded-xl group-hover:border-primary/50 transition-colors">
             <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg">Recallr</span>
        </button>
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-surface/80 backdrop-blur-2xl border border-default p-8 md:p-10 rounded-3xl shadow-2xl relative z-10"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div 
             initial={{ rotate: -10, scale: 0.9 }}
             animate={{ rotate: 0, scale: 1 }}
             transition={{ duration: 0.5 }}
             className="w-20 h-20 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/20"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 text-secondary tracking-tight">
            {isRegistering ? 'Create Account' : 'Welcome to Recallr'}
          </h2>
          <p className="text-muted text-sm">
            {isRegistering ? 'Start building your second brain today.' : 'Your neural command center awaits.'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3"
          >
            <XCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full bg-elevated border border-default rounded-xl py-4 px-5 text-base text-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted/50"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-elevated border border-default rounded-xl py-4 px-5 text-base text-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted/50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl mt-6 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isRegistering ? 'Sign Up' : 'Sign In'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-default/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest text-muted font-bold">
            <span className="px-3 bg-surface">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-surface hover:bg-elevated border border-default hover:border-primary/30 text-secondary font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <div className="mt-8 text-center bg-elevated/50 rounded-xl py-3 border border-default/30">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-muted hover:text-primary transition-colors font-medium"
          >
            {isRegistering ? (
                <>Already have an account? <span className="text-primary underline">Sign In</span></>
            ) : (
                <>New to Recallr? <span className="text-primary underline">Create Account</span></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
