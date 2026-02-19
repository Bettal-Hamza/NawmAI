import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import AnimatedScore from '../components/AnimatedScore';
import { DashboardSkeleton } from '../components/Skeleton';
import { FadeInUp, StaggerContainer, FadeUp, PageTransition } from '../components/Motion';
import { useUser } from '../hooks/useUser';
import { getCheckins, getWeeklySummary, getReportByDate, getSleepProfile } from '../services/api';
import {
  HiOutlineMoon, HiOutlinePencilSquare, HiOutlineChartBar,
  HiOutlineChatBubbleLeftRight, HiOutlineStar, HiOutlineFaceSmile,
  HiOutlineClock, HiOutlineSparkles, HiOutlineXMark, HiOutlineCpuChip,
  HiOutlineFire, HiOutlineBolt, HiOutlineCheckCircle,
} from 'react-icons/hi2';
import {
  FiThumbsDown, FiMeh, FiSmile, FiThumbsUp, FiFrown,
  FiCoffee, FiRefreshCw, FiSmartphone, FiWind, FiVolume2,
  FiMoon, FiDroplet, FiSun, FiEdit,
} from 'react-icons/fi';
import {
  computeSleepScore, computeWeeklyScore, computeStreak,
  getStreakMessage, computeSleepDebt, generateMissions,
  buildTrendData, type TrendPoint,
} from '../utils/sleep';

interface Checkin {
  id: string;
  checkin_date: string;
  bedtime: string;
  wakeup_time: string;
  sleep_quality: number;
  mood: number;
}

interface Summary {
  total_checkins: number;
  avg_quality: number;
  avg_mood: number;
  earliest_bedtime: string;
  latest_bedtime: string;
}

interface Profile {
  bedtime_goal: string;
  wakeup_goal: string;
  sleep_challenges: string[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [reportData, setReportData] = useState<{ report: any; generatedAt: string } | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  // Persist completed missions to localStorage (keyed by date so they reset daily)
  const todayKey = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })();
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`nawmai_missions_${todayKey}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [fetchError, setFetchError] = useState('');

  const handleCheckinClick = async (checkin: Checkin) => {
    setSelectedCheckin(checkin);
    setReportData(null);
    setReportError('');
    setReportLoading(true);
    try {
      const data = await getReportByDate(user!.id, checkin.checkin_date.split('T')[0]);
      setReportData({ report: data.report, generatedAt: data.generatedAt });
    } catch {
      setReportError('No AI report saved for this week yet. Generate one from the Weekly Report page.');
    } finally {
      setReportLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCheckin(null);
    setReportData(null);
    setReportError('');
  };

  const toggleMission = (id: string) => {
    setCompletedMissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(`nawmai_missions_${todayKey}`, JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [checkinsData, summaryData, profileData] = await Promise.all([
          getCheckins(user.id),
          getWeeklySummary(user.id),
          getSleepProfile(user.id).catch(() => null),
        ]);
        setCheckins(checkinsData);
        setSummary(summaryData);
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setFetchError('Failed to load your data. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const latestCheckin = checkins.length > 0 ? checkins[0] : null;
  const sleepScore = latestCheckin ? computeSleepScore(latestCheckin, profile) : 0;
  const weeklyScore = computeWeeklyScore(checkins, profile);
  const streak = computeStreak(checkins);
  const streakMsg = getStreakMessage(streak);
  const sleepDebt = computeSleepDebt(checkins, profile);
  const missions = generateMissions(profile);
  const trendData = buildTrendData(checkins, profile);

  // Check if user already checked in today
  const checkedInToday = latestCheckin
    ? latestCheckin.checkin_date.split('T')[0] === todayKey
    : false;

  const qualityIcon = (q: number) => {
    const icons = [
      <FiThumbsDown className="text-red-400" />,
      <FiFrown className="text-orange-400" />,
      <FiMeh className="text-yellow-400" />,
      <FiSmile className="text-green-400" />,
      <FiThumbsUp className="text-emerald-400" />,
    ];
    return icons[q - 1] || icons[2];
  };
  const moodIcon = (m: number) => qualityIcon(m);

  const scoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-green-400';
    if (s >= 40) return 'text-yellow-400';
    if (s >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const scoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    if (s >= 20) return 'Poor';
    return 'Very Poor';
  };

  const scoreRingColor = (s: number) => {
    if (s >= 80) return 'border-emerald-400';
    if (s >= 60) return 'border-green-400';
    if (s >= 40) return 'border-yellow-400';
    if (s >= 20) return 'border-orange-400';
    return 'border-red-400';
  };

  const barColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-400';
    if (s >= 60) return 'bg-green-400';
    if (s >= 40) return 'bg-yellow-400';
    if (s >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const missionIcon = (iconName: string) => {
    const map: Record<string, React.ReactNode> = {
      clock: <HiOutlineClock className="text-lg text-brand-400" />,
      phone: <FiSmartphone className="text-lg text-blue-400" />,
      wind: <FiWind className="text-lg text-cyan-400" />,
      coffee: <FiCoffee className="text-lg text-amber-400" />,
      refresh: <FiRefreshCw className="text-lg text-purple-400" />,
      volume: <FiVolume2 className="text-lg text-pink-400" />,
      moon: <FiMoon className="text-lg text-brand-400" />,
      droplet: <FiDroplet className="text-lg text-blue-400" />,
      sun: <FiSun className="text-lg text-yellow-400" />,
      edit: <FiEdit className="text-lg text-green-400" />,
    };
    return map[iconName] || <HiOutlineStar className="text-lg text-brand-400" />;
  };

  const getMotivation = () => {
    if (checkins.length === 0) return "Let's start tracking your sleep tonight!";
    if (sleepScore >= 80) return 'Outstanding sleep! Keep it up 👏';
    if (sleepScore >= 60) return "You're building strong sleep habits 🌙";
    if (streak >= 5) return 'Amazing consistency! Small steps, big results ⭐';
    if (streak >= 3) return 'Nice streak going! Stay on track 🔥';
    return 'Every night counts. Small improvements lead to big results ⭐';
  };

  return (
    <PageTransition className="min-h-screen">
      <motion.header
        className="border-b border-navy-700 px-6 py-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineMoon className="text-xl text-brand-400" />
            <span className="font-bold text-slate-100">NawmAI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Hi, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <FadeInUp delay={0.1}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">
              Good {getGreeting()}, {user.name}
            </h1>
            <p className="text-slate-400 mt-1">{getMotivation()}</p>
          </div>
        </FadeInUp>

        {loading ? (
          <DashboardSkeleton />
        ) : fetchError ? (
          <FadeInUp delay={0.2}>
            <Card className="text-center py-12 mb-8">
              <HiOutlineSparkles className="text-5xl mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Couldn't load data</h3>
              <p className="text-slate-400 mb-6">{fetchError}</p>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </Card>
          </FadeInUp>
        ) : checkins.length === 0 ? (
          <FadeInUp delay={0.2}>
            <Card className="text-center py-12 mb-8">
              <HiOutlineSparkles className="text-5xl mx-auto mb-4 text-brand-400" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">No check-ins yet</h3>
              <p className="text-slate-400 mb-6">Start tracking your sleep to see insights here</p>
              <Button className="glow-yellow" onClick={() => navigate('/checkin')}>Log Your First Night</Button>
            </Card>
          </FadeInUp>
        ) : (
          <StaggerContainer staggerDelay={0.12} delay={0.15}>
            <FadeUp>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="md:col-span-1 flex flex-col items-center justify-center py-6">
                  <AnimatedScore
                    value={sleepScore}
                    label="Sleep Score"
                    sublabel={scoreLabel(sleepScore)}
                  />
                  {weeklyScore > 0 && (
                    <p className="text-xs text-slate-500 mt-2">Week avg: {weeklyScore}</p>
                  )}
                </Card>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <StatTile
                    icon={<HiOutlineFire className={`text-3xl mb-1 ${streak >= 3 ? 'text-orange-400' : 'text-slate-500'}`} />}
                    value={String(streak)}
                    label={streakMsg}
                  />
                  <StatTile
                    icon={<HiOutlineBolt className={`text-3xl mb-1 ${sleepDebt > 2 ? 'text-red-400' : sleepDebt > 0 ? 'text-yellow-400' : 'text-emerald-400'}`} />}
                    value={sleepDebt > 0 ? `${sleepDebt}h` : 'None'}
                    valueColor={sleepDebt > 2 ? 'text-red-400' : sleepDebt > 0 ? 'text-yellow-400' : 'text-emerald-400'}
                    label={sleepDebt > 2 ? 'High sleep debt' : sleepDebt > 0 ? 'Mild sleep debt' : 'No sleep debt'}
                  />
                  <StatTile
                    icon={<HiOutlineStar className="text-2xl text-brand-400 mb-1" />}
                    value={summary?.avg_quality ? `${summary.avg_quality}/5` : '—'}
                    label="Avg Quality"
                  />
                  <StatTile
                    icon={<HiOutlineFaceSmile className="text-2xl text-green-400 mb-1" />}
                    value={summary?.avg_mood ? `${summary.avg_mood}/5` : '—'}
                    label="Avg Mood"
                  />
                </div>
              </div>
            </FadeUp>

            {trendData.length > 1 && (
              <FadeUp>
                <Card className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineChartBar className="text-lg text-brand-400" />
                    <h2 className="font-semibold text-slate-100">7-Day Trend</h2>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-36">
                    {trendData.map((point, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                        style={{ transformOrigin: 'bottom' }}
                      >
                        <span className={`text-xs font-bold ${scoreColor(point.score)}`}>{point.score}</span>
                        <div className="w-full flex justify-center">
                          <div
                            className={`w-8 rounded-t-lg ${barColor(point.score)} transition-all duration-500`}
                            style={{ height: `${Math.max(point.score, 4)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{point.day}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </FadeUp>
            )}

            <FadeUp>
              <Card className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineSparkles className="text-lg text-brand-400" />
                  <h2 className="font-semibold text-slate-100">Tonight's Missions</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {missions.map((m) => {
                    const done = completedMissions.has(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleMission(m.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer
                          ${done
                            ? 'bg-brand-400/10 border-brand-400/25'
                            : 'bg-navy-700 border-navy-600 hover:border-brand-400/15'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${done ? 'border-brand-400 bg-brand-400/15' : 'border-slate-500'}`}>
                          {done && <HiOutlineCheckCircle className="text-sm text-brand-400" />}
                        </div>
                        {missionIcon(m.icon)}
                        <span className={`text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {m.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  {completedMissions.size}/{missions.length} completed
                </p>
              </Card>
            </FadeUp>

            <FadeUp>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <ActionCard icon={<HiOutlinePencilSquare className="text-2xl text-brand-400" />} label={checkedInToday ? 'Update Check-in' : 'Check-in'} onClick={() => navigate('/checkin')} />
                  {checkedInToday && (
                    <span className="absolute -top-2 -right-2 bg-emerald-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      Done ✓
                    </span>
                  )}
                </div>
                <ActionCard icon={<HiOutlineChartBar className="text-2xl text-brand-400" />} label="Weekly Report" onClick={() => navigate('/report')} />
                <ActionCard icon={<HiOutlineChatBubbleLeftRight className="text-2xl text-brand-400" />} label="Give Feedback" onClick={() => navigate('/feedback')} />
              </div>
            </FadeUp>

            {checkins.length > 0 && (
              <FadeUp>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Check-ins</h2>
                  <div className="flex flex-col gap-3">
                    {checkins.slice(0, 5).map((c, i) => {
                      const cScore = computeSleepScore(c, profile);
                      return (
                        <motion.button
                          key={c.id}
                          onClick={() => handleCheckinClick(c)}
                          className="w-full text-left"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * i, duration: 0.3 }}
                        >
                          <Card className="flex flex-row items-center justify-between !p-4 hover:border-brand-400/25 hover:scale-[1.01] transition-all duration-200 cursor-pointer">
                            <div>
                              <p className="text-sm font-medium text-slate-100">
                                {new Date(c.checkin_date.split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', {
                                  weekday: 'short', month: 'short', day: 'numeric',
                                })}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {c.bedtime} → {c.wakeup_time}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-bold ${scoreColor(cScore)}`}>{cScore}</span>
                              <span title="Sleep quality">{qualityIcon(c.sleep_quality)}</span>
                              <span title="Mood">{moodIcon(c.mood)}</span>
                            </div>
                          </Card>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </FadeUp>
            )}
          </StaggerContainer>
        )}
      </main>

      <AnimatePresence>
        {selectedCheckin && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto" hover={false}>
                <div onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-100">
                      {new Date(selectedCheckin.checkin_date.split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                      })}
                    </h2>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">
                      <HiOutlineXMark className="text-xl" />
                    </button>
                  </div>

                  <div className="flex justify-center mb-5">
                    <AnimatedScore value={computeSleepScore(selectedCheckin, profile)} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <ModalStat label="Bedtime" value={selectedCheckin.bedtime} />
                    <ModalStat label="Wake-up" value={selectedCheckin.wakeup_time} />
                    <div className="bg-navy-700 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Sleep Quality</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {qualityIcon(selectedCheckin.sleep_quality)}
                        <span className="text-slate-100 font-semibold">{selectedCheckin.sleep_quality}/5</span>
                      </div>
                    </div>
                    <div className="bg-navy-700 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Mood</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {moodIcon(selectedCheckin.mood)}
                        <span className="text-slate-100 font-semibold">{selectedCheckin.mood}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-navy-700 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <HiOutlineCpuChip className="text-lg text-brand-400" />
                      <h3 className="font-semibold text-slate-100">AI Weekly Report</h3>
                    </div>

                    {reportLoading ? (
                      <div className="text-center py-6">
                        <div className="w-6 h-6 border-2 border-navy-600 border-t-brand-400 rounded-full animate-spin mx-auto" />
                        <p className="text-slate-400 text-sm mt-3">Loading report...</p>
                      </div>
                    ) : reportError ? (
                      <div className="text-center py-4">
                        <p className="text-slate-400 text-sm">{reportError}</p>
                        <Button variant="ghost" size="sm" className="mt-3" onClick={() => { closeModal(); navigate('/report'); }}>
                          Generate Report
                        </Button>
                      </div>
                    ) : reportData ? (
                      <div>
                        {typeof reportData.report === 'object' && reportData.report.sleep_score !== undefined ? (
                          <div className="flex flex-col gap-3">
                            <div className="text-center">
                              <span className={`text-2xl font-bold ${scoreColor(reportData.report.sleep_score)}`}>
                                Score: {reportData.report.sleep_score}
                              </span>
                              <span className="text-sm text-slate-400 ml-2">{reportData.report.sleep_score_label}</span>
                            </div>
                            {reportData.report.key_wins?.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-500 font-semibold mb-1">Key Wins</p>
                                {reportData.report.key_wins.map((w: string, i: number) => (
                                  <p key={i} className="text-sm text-slate-300">+ {w}</p>
                                ))}
                              </div>
                            )}
                            {reportData.report.focus_recommendation && (
                              <div>
                                <p className="text-xs text-slate-500 font-semibold mb-1">Focus</p>
                                <p className="text-sm text-slate-200">{reportData.report.focus_recommendation}</p>
                              </div>
                            )}
                            {reportData.report.coach_note && (
                              <p className="text-sm text-slate-300 italic">{reportData.report.coach_note}</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                            {typeof reportData.report === 'string' ? reportData.report : reportData.report.coach_note || JSON.stringify(reportData.report)}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-3">
                          Generated {new Date(reportData.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const StatTile: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  valueColor?: string;
}> = ({ icon, value, label, valueColor }) => (
  <div className="bg-navy-800 rounded-2xl border border-navy-700 p-4 flex flex-col items-center justify-center
    hover:border-brand-400/15 transition-colors duration-200">
    {icon}
    <p className={`text-2xl font-bold ${valueColor || 'text-slate-100'}`}>{value}</p>
    <p className="text-xs text-slate-500 text-center mt-1">{label}</p>
  </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({
  icon, label, onClick,
}) => (
  <button
    onClick={onClick}
    className="bg-navy-800 rounded-2xl border border-navy-700 p-5 text-center
      hover:border-brand-400/25 hover:shadow-lg hover:shadow-brand-400/5 hover:scale-[1.03]
      transition-all duration-200 cursor-pointer active:scale-[0.97]"
  >
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-sm font-medium text-slate-300">{label}</p>
  </button>
);

const ModalStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-navy-700 rounded-xl p-3 text-center">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-lg font-semibold text-slate-100">{value}</p>
  </div>
);

export default Dashboard;
