import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useUser } from '../hooks/useUser';
import { getUser } from '../services/api';
import { FadeInUp, StaggerContainer, FadeUp } from '../components/Motion';
import { HiOutlineMoon, HiOutlineSparkles, HiOutlineHandRaised, HiOutlineHeart, HiOutlineChartBar, HiOutlineCpuChip, HiOutlineFlag } from 'react-icons/hi2';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, saveUser } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [emailFormatError, setEmailFormatError] = useState('');

  const validateEmail = (email: string) => {
    if (!email.trim()) { setEmailFormatError(''); return; }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setEmailFormatError(valid ? '' : 'Please enter a valid email address');
  };

  if (user) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const userData = await getUser(loginEmail.trim().toLowerCase());
      saveUser(userData);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setLoginError('No account found with that email. Try signing up instead.');
      } else {
        setLoginError('Something went wrong. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.nav
        className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <HiOutlineMoon className="text-2xl text-brand-400" />
          <span className="text-xl font-bold text-slate-100">NawmAI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)}>
            Log In
          </Button>
          <Button size="sm" onClick={() => navigate('/onboarding')}>
            Sign Up
          </Button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {showLogin && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setShowLogin(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Card className="max-w-sm w-full" hover={false}>
                <div onClick={(e) => e.stopPropagation()}>
                  <div className="text-center mb-6">
                    <HiOutlineHandRaised className="text-4xl mb-3 mx-auto text-brand-400" />
                    <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
                    <p className="text-slate-400 mt-1 text-sm">Enter your email to continue</p>
                  </div>
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="sarah@example.com"
                      value={loginEmail}
                      onChange={(e) => { setLoginEmail(e.target.value); validateEmail(e.target.value); setLoginError(''); }}
                      error={emailFormatError || loginError}
                    />
                    <Button type="submit" className="w-full" disabled={loginLoading || !loginEmail.trim() || !!emailFormatError}>
                      {loginLoading ? 'Logging in...' : 'Continue'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={() => { setShowLogin(false); navigate('/onboarding'); }}>
                      New here? Sign up instead
                    </Button>
                  </form>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInUp delay={0.1}>
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 rounded-full bg-brand-400/15 blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <HiOutlineMoon className="relative text-6xl text-brand-400" />
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-100 mb-6 leading-tight">
              Sleep better.
              <br />
              <span className="text-brand-400">Feel better.</span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.35}>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Your AI-powered sleep coach that helps students and young professionals
              build healthier sleep habits — one night at a time.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.5}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glow-yellow" onClick={() => navigate('/onboarding')}>
                Start Your Journey
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setShowLogin(true)}>
                I Have an Account
              </Button>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.65}>
            <p className="mt-12 text-sm text-slate-500">
              <HiOutlineSparkles className="inline mr-1 text-brand-400" /> Free to use · No medical advice · Just better sleep habits
            </p>
          </FadeInUp>
        </div>
      </main>

      <section className="px-6 py-20 max-w-5xl mx-auto w-full">
        <StaggerContainer className="grid md:grid-cols-3 gap-6" delay={0.3} staggerDelay={0.15}>
          <FadeUp>
            <FeatureCard
              icon={<HiOutlineChartBar className="text-4xl text-brand-400" />}
              title="Track Your Sleep"
              description="Quick daily check-ins to understand your sleep patterns and habits."
            />
          </FadeUp>
          <FadeUp>
            <FeatureCard
              icon={<HiOutlineCpuChip className="text-4xl text-brand-400" />}
              title="AI Insights"
              description="Get personalized weekly reports with friendly tips to improve your rest."
            />
          </FadeUp>
          <FadeUp>
            <FeatureCard
              icon={<HiOutlineFlag className="text-4xl text-brand-400" />}
              title="Build Habits"
              description="Set sleep goals and track your progress toward a healthier routine."
            />
          </FadeUp>
        </StaggerContainer>
      </section>

      <footer className="text-center py-8 text-sm text-slate-500 border-t border-navy-700">
        <p>NawmAI — An Enactus Project · Built with <HiOutlineHeart className="inline text-brand-400" /></p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon, title, description,
}) => (
  <div className="bg-navy-800 rounded-2xl border border-navy-700 p-8 text-center
    hover:border-brand-400/25 hover:shadow-lg hover:shadow-brand-400/5 hover:scale-[1.02]
    transition-all duration-200">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;
