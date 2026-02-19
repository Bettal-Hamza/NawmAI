import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../hooks/useUser';
import { getWeeklyReport } from '../services/api';
import AnimatedScore from '../components/AnimatedScore';
import { AnalyzingLoader } from '../components/Skeleton';
import { PageTransition, FadeInUp, StaggerContainer, FadeUp } from '../components/Motion';
import {
  HiOutlineChartBar, HiOutlinePencilSquare, HiOutlineStar,
  HiOutlineFaceSmile, HiOutlineMoon,
  HiOutlineTrophy, HiOutlineEye, HiOutlineArrowPath,
  HiOutlineBolt, HiOutlineHeart, HiOutlineClock,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

interface StructuredReport {
  sleep_score: number;
  sleep_score_label: string;
  key_wins: string[];
  pattern_insights: string[];
  focus_recommendation: string;
  coach_note: string;
}

interface ReportData {
  report: StructuredReport;
  stats: {
    total_checkins: number;
    avg_quality: number;
    avg_mood: number;
    avg_sleep_hours?: number;
    phone_nights?: number;
  };
  generatedAt: string;
  isPartial?: boolean;
  cached?: boolean;
}

const Report: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (regenerate = false) => {
    if (!user) return;
    if (regenerate) setRegenerating(true);
    else setLoading(true);
    setError('');

    try {
      const result = await getWeeklyReport(user.id, regenerate);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;

  const report = data?.report;

  return (
    <PageTransition className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-500 hover:text-slate-100 text-sm mb-6 flex items-center gap-1 cursor-pointer transition-colors"
        >
          ← Back to Dashboard
        </button>

        <FadeInUp>
          <div className="text-center mb-8">
            <HiOutlineChartBar className="text-4xl mb-3 mx-auto text-brand-400" />
            <h1 className="text-2xl font-bold text-slate-100">Your Weekly Report</h1>
            <p className="text-slate-400 mt-1">AI-powered insights about your sleep</p>
          </div>
        </FadeInUp>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyzingLoader />
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="text-center py-12">
                <HiOutlineMoon className="text-5xl mx-auto mb-4 text-brand-400" />
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{error}</h3>
                <p className="text-slate-400 mb-6">
                  Make sure you have at least one check-in this week to generate a report.
                </p>
                <Button onClick={() => navigate('/checkin')}>Log a Check-in</Button>
              </Card>
            </motion.div>
          ) : report ? (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StaggerContainer className="flex flex-col gap-4">
                {data.isPartial && (
                  <FadeUp>
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                      <HiOutlineExclamationTriangle className="text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-200">
                        Based on limited data ({data.stats.total_checkins} check-ins). Keep logging to get fuller insights!
                      </p>
                    </div>
                  </FadeUp>
                )}

                <FadeUp>
                  <Card>
                    <div className="flex flex-col items-center py-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Weekly Sleep Score</p>
                      <AnimatedScore value={report.sleep_score} size="lg" />
                      <span className="text-lg font-semibold text-slate-200 mt-2">
                        {report.sleep_score_label}
                      </span>
                    </div>
                  </Card>
                </FadeUp>

                <FadeUp>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MiniStat icon={<HiOutlinePencilSquare className="text-lg text-brand-400" />} label="Check-ins" value={String(data.stats.total_checkins)} />
                    <MiniStat icon={<HiOutlineStar className="text-lg text-yellow-400" />} label="Avg Quality" value={data.stats.avg_quality ? `${data.stats.avg_quality}/5` : '—'} />
                    <MiniStat icon={<HiOutlineFaceSmile className="text-lg text-green-400" />} label="Avg Mood" value={data.stats.avg_mood ? `${data.stats.avg_mood}/5` : '—'} />
                    <MiniStat icon={<HiOutlineClock className="text-lg text-brand-400" />} label="Avg Sleep" value={data.stats.avg_sleep_hours ? `${data.stats.avg_sleep_hours}h` : '—'} />
                  </div>
                </FadeUp>

                {report.key_wins.length > 0 && (
                  <FadeUp>
                    <Card>
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineTrophy className="text-lg text-yellow-400" />
                        <h3 className="font-semibold text-slate-100">Key Wins</h3>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {report.key_wins.map((win, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-emerald-400 mt-0.5">+</span>
                            <span className="text-sm text-slate-300">{win}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </Card>
                  </FadeUp>
                )}

                {report.pattern_insights.length > 0 && (
                  <FadeUp>
                    <Card>
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineEye className="text-lg text-blue-400" />
                        <h3 className="font-semibold text-slate-100">Pattern Insights</h3>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {report.pattern_insights.map((insight, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-blue-400 mt-0.5">&bull;</span>
                            <span className="text-sm text-slate-300">{insight}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </Card>
                  </FadeUp>
                )}

                {report.focus_recommendation && (
                  <FadeUp>
                    <Card className="border-brand-400/20">
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineBolt className="text-lg text-brand-400" />
                        <h3 className="font-semibold text-slate-100">This Week's Focus</h3>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">{report.focus_recommendation}</p>
                    </Card>
                  </FadeUp>
                )}

                {report.coach_note && (
                  <FadeUp>
                    <Card>
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineHeart className="text-lg text-pink-400" />
                        <h3 className="font-semibold text-slate-100">Coach's Note</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{report.coach_note}</p>
                    </Card>
                  </FadeUp>
                )}

                <FadeUp>
                  <div className="flex flex-col items-center gap-3 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchReport(true)}
                      disabled={regenerating}
                      className="flex items-center gap-2"
                    >
                      <HiOutlineArrowPath className={`text-sm ${regenerating ? 'animate-spin' : ''}`} />
                      {regenerating ? 'Regenerating...' : 'Regenerate Report'}
                    </Button>

                    <p className="text-xs text-slate-500">
                      Generated {data.generatedAt ? new Date(data.generatedAt).toLocaleDateString() : 'recently'}
                      {data.cached && ' (cached)'}
                    </p>

                    <p className="text-xs text-slate-500 text-center">
                      This is not medical advice. NawmAI provides friendly sleep insights only.
                    </p>
                  </div>
                </FadeUp>
              </StaggerContainer>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

const MiniStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-navy-800 rounded-xl border border-navy-700 p-4 text-center hover:border-brand-400/20 transition-colors duration-200">
    <div className="flex justify-center">{icon}</div>
    <p className="text-lg font-bold text-slate-100 mt-1">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
);

export default Report;
