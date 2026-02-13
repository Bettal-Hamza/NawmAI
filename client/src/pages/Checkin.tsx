import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import RatingPicker from '../components/RatingPicker';
import { useUser } from '../hooks/useUser';
import { submitCheckin } from '../services/api';
import { FadeInUp, PageTransition } from '../components/Motion';
import { HiOutlineCheckCircle, HiOutlineMoon, HiOutlineCpuChip, HiOutlineDevicePhoneMobile, HiOutlineLightBulb } from 'react-icons/hi2';

const Checkin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [bedtime, setBedtime] = useState('23:00');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [mood, setMood] = useState(3);
  const [phoneBeforeBed, setPhoneBeforeBed] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dailyFeedback, setDailyFeedback] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await submitCheckin({
        userId: user.id,
        checkinDate: today,
        bedtime,
        wakeupTime,
        sleepQuality,
        mood,
        notes: notes.trim() || undefined,
        phoneBeforeBed,
      });
      setDailyFeedback(result.dailyFeedback || '');
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col gap-4">
          <FadeInUp>
            <Card className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <HiOutlineCheckCircle className="text-6xl mx-auto mb-4 text-emerald-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Check-in Saved!</h2>
              <p className="text-slate-400 mb-6">Great job tracking your sleep today 🌙</p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/report')}>View Weekly Report</Button>
              </div>
            </Card>
          </FadeInUp>

          {dailyFeedback && (
            <FadeInUp delay={0.3}>
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineCpuChip className="text-lg text-brand-400" />
                  <h3 className="font-semibold text-slate-100 text-sm">Daily Insight</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{dailyFeedback}</p>
              </Card>
            </FadeInUp>
          )}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-500 hover:text-slate-100 text-sm mb-6 flex items-center gap-1 cursor-pointer transition-colors"
        >
          ← Back to Dashboard
        </button>

        <FadeInUp>
          <Card>
            <div className="text-center mb-6">
              <HiOutlineMoon className="text-4xl mb-3 mx-auto text-brand-400" />
              <h2 className="text-2xl font-bold text-slate-100">Daily Check-in</h2>
              <p className="text-slate-400 mt-1">How did you sleep last night?</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input label="Bedtime (last night)" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
              <Input label="Wake-up Time (this morning)" type="time" value={wakeupTime} onChange={(e) => setWakeupTime(e.target.value)} />
              <RatingPicker label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} />
              <RatingPicker label="Morning Mood" value={mood} onChange={setMood} />

              {/* Phone toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiOutlineDevicePhoneMobile className="text-lg text-slate-400" />
                  <label className="text-sm font-medium text-slate-300">Phone before bed?</label>
                </div>
                <button
                  type="button"
                  onClick={() => setPhoneBeforeBed(!phoneBeforeBed)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer
                    ${phoneBeforeBed ? 'bg-brand-400' : 'bg-navy-600'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow transition-transform duration-200
                      ${phoneBeforeBed ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'}`}
                  />
                </button>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything worth noting? e.g. drank coffee late, stressed about exam..."
                  rows={3}
                  maxLength={500}
                  className="bg-navy-700 border border-navy-600 rounded-xl px-4 py-3 text-slate-100
                    placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-2
                    focus:ring-brand-400/25 transition-all duration-200 resize-none"
                />
                <div className="flex items-start gap-1.5 mt-1">
                  <HiOutlineLightBulb className="text-sm text-brand-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-500">Adding notes helps your AI coach give better weekly insights.</p>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Check-in'}
              </Button>
            </form>
          </Card>
        </FadeInUp>
      </div>
    </PageTransition>
  );
};

export default Checkin;
