import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import RatingPicker from '../components/RatingPicker';
import { useUser } from '../hooks/useUser';
import { submitFeedback } from '../services/api';
import { PageTransition, FadeInUp } from '../components/Motion';
import { HiOutlineHeart, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(4);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write a message');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitFeedback(user.id, message.trim(), rating);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center px-4">
        <FadeInUp>
          <Card className="text-center max-w-md w-full py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <HiOutlineHeart className="text-6xl mx-auto mb-4 text-brand-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Thank You!</h2>
            <p className="text-slate-400 mb-8">Your feedback helps us improve NawmAI 💛</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </Card>
        </FadeInUp>
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
              <HiOutlineChatBubbleLeftRight className="text-4xl mb-3 mx-auto text-brand-400" />
              <h2 className="text-2xl font-bold text-slate-100">Share Your Feedback</h2>
              <p className="text-slate-400 mt-1">Help us make NawmAI better</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <RatingPicker label="How's your experience so far?" value={rating} onChange={setRating} />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What do you like? What can we improve? Any feature requests?"
                  rows={5}
                  maxLength={1000}
                  className="bg-navy-700 border border-navy-600 rounded-xl px-4 py-3 text-slate-100
                    placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-2
                    focus:ring-brand-400/25 transition-all duration-200 resize-none"
                />
                <p className="text-xs text-slate-500 text-right">{message.length}/1000</p>
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading || !message.trim()}>
                {loading ? 'Sending...' : 'Send Feedback'}
              </Button>
            </form>
          </Card>
        </FadeInUp>
      </div>
    </PageTransition>
  );
};

export default Feedback;
