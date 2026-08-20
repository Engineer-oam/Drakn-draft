import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export function AdminLogin() {
  const { user, isAdmin, loading, login } = useAdminAuth();
  const location = useLocation();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  if (loading) return <div className="min-h-screen bg-drakn-base" />;

  // If already authenticated and is admin, redirect to dashboard
  if (user && isAdmin) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async () => {
    try {
      setError('');
      await login();
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-drakn-base text-drakn-light font-body flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background aesthetic */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-drakn-charcoal rounded-full blur-3xl mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="border border-drakn-graphite bg-drakn-dark/80 backdrop-blur-xl p-10 shadow-2xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-display font-bold tracking-[0.2em] mb-2">DRAKN</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-drakn-muted">Operations Console</p>
          </div>

          {(user && !isAdmin) ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-red-950/30 border border-red-900/50 p-4 mb-8 text-center flex flex-col items-center"
            >
              <ShieldAlert className="text-red-500 mb-2" size={24} />
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-1">Access Denied</h3>
              <p className="text-xs text-drakn-muted">Your account ({user.email}) does not possess administrative clearance.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-drakn-muted text-center mb-8">
                Strictly restricted to authorized personnel. Secure authentication required.
              </p>
              
              {error && (
                <div className="text-xs text-red-500 text-center border border-red-900/30 bg-red-950/20 py-2">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full bg-drakn-light text-drakn-base font-bold text-xs uppercase tracking-[0.2em] py-4 hover:bg-drakn-muted transition-colors"
              >
                Authenticate via Google
              </button>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-drakn-graphite text-center">
            <p className="text-[10px] text-drakn-muted uppercase tracking-widest">
              Secured by Firebase Enterprise
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
