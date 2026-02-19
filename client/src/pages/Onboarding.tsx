import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { registerUser, createSleepProfile } from '../services/api';
import { useUser } from '../hooks/useUser';
import { HiOutlineDevicePhoneMobile, HiOutlineExclamationTriangle, HiOutlineSpeakerWave, HiOutlineHandRaised, HiOutlineFlag } from 'react-icons/hi2';
import { FiCoffee, FiRefreshCw, FiMoon, FiMessageCircle } from 'react-icons/fi';

const CHALLENGES = [
  { id: 'phone', label: 'Phone before bed', icon: <HiOutlineDevicePhoneMobile className="inline mr-1" /> },
  { id: 'stress', label: 'Stress / Anxiety', icon: <HiOutlineExclamationTriangle className="inline mr-1" /> },
  { id: 'caffeine', label: 'Late caffeine', icon: <FiCoffee className="inline mr-1" /> },
  { id: 'irregular', label: 'Irregular schedule', icon: <FiRefreshCw className="inline mr-1" /> },
  { id: 'noise', label: 'Noise / Environment', icon: <HiOutlineSpeakerWave className="inline mr-1" /> },
  { id: 'naps', label: 'Too many naps', icon: <FiMoon className="inline mr-1" /> },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, saveUser } = useUser();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <OnboardingWizard saveUser={saveUser} navigate={navigate} />;
};

const OnboardingWizard: React.FC<{
  saveUser: (u: any) => void;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ saveUser, navigate }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [bedtimeGoal, setBedtimeGoal] = useState('23:00');
  const [wakeupGoal, setWakeupGoal] = useState('07:00');
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (v: string) => {
    if (!v.trim()) { setEmailError(''); return; }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    setEmailError(valid ? '' : 'Please enter a valid email address');
  };

  const toggleChallenge = (id: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await registerUser(name.trim(), email.trim(), age ? parseInt(age) : undefined);
      await createSleepProfile(user.id, bedtimeGoal, wakeupGoal, selectedChallenges);
      saveUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <button
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-slate-100 text-sm mb-6 flex items-center gap-1 cursor-pointer transition-colors"
        >
          ← Back to Home
        </button>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className={`h-1.5 rounded-full transition-colors duration-300
                ${s === step ? 'bg-brand-400' : s < step ? 'bg-brand-400/40' : 'bg-navy-700'}`}
              animate={{ width: s === step ? 40 : 32 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 */}
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card>
                <div className="text-center mb-6">
                  <HiOutlineHandRaised className="text-4xl mb-3 mx-auto text-brand-400" />
                  <h2 className="text-2xl font-bold text-slate-100">Welcome to NawmAI</h2>
                  <p className="text-slate-400 mt-2">Let's get to know you</p>
                </div>
                <div className="flex flex-col gap-4">
                  <Input label="Your Name" placeholder="e.g. Sarah" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input label="Email" type="email" placeholder="sarah@example.com" value={email} onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }} error={emailError} />
                  <Input label="Age (optional)" type="number" placeholder="21" value={age} onChange={(e) => setAge(e.target.value)} />
                  <Button className="mt-2 w-full" disabled={!name.trim() || !email.trim() || !!emailError} onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card>
                <div className="text-center mb-6">
                  <HiOutlineFlag className="text-4xl mb-3 mx-auto text-brand-400" />
                  <h2 className="text-2xl font-bold text-slate-100">Your Sleep Goals</h2>
                  <p className="text-slate-400 mt-2">What does your ideal schedule look like?</p>
                </div>
                <div className="flex flex-col gap-4">
                  <Input label="Target Bedtime" type="time" value={bedtimeGoal} onChange={(e) => setBedtimeGoal(e.target.value)} />
                  <Input label="Target Wake-up Time" type="time" value={wakeupGoal} onChange={(e) => setWakeupGoal(e.target.value)} />
                  <div className="flex gap-3 mt-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={() => setStep(3)}>Continue</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card>
                <div className="text-center mb-6">
                  <FiMessageCircle className="text-4xl mb-3 mx-auto text-brand-400" />
                  <h2 className="text-2xl font-bold text-slate-100">Sleep Challenges</h2>
                  <p className="text-slate-400 mt-2">What gets in the way of your sleep?</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {CHALLENGES.map((challenge) => (
                    <button
                      key={challenge.id}
                      type="button"
                      onClick={() => toggleChallenge(challenge.id)}
                      className={`p-3 rounded-xl text-sm text-left transition-all duration-200 cursor-pointer
                        ${selectedChallenges.includes(challenge.id)
                          ? 'bg-brand-400/15 border border-brand-400/40 text-brand-400'
                          : 'bg-navy-700 border border-navy-600 text-slate-300 hover:border-navy-600'
                        }`}
                    >
                      {challenge.icon}{challenge.label}
                    </button>
                  ))}
                </div>
                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Setting up...' : 'Start Tracking'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
