import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function OnboardingForm() {
  const [formData, setFormData] = useState({
    email: '',
    bedtime: '',
    wakeTime: '',
    mainProblem: '',
    phoneUsage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.email || !formData.bedtime || !formData.wakeTime ||
      !formData.mainProblem || !formData.phoneUsage) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Generate client-side UUID
    const userId = uuidv4();

    // Store userId in localStorage for future use
    localStorage.setItem('userId', userId);

    try {
      console.log('Submitting profile data:', {
        user_id: userId,
        email: formData.email,
        bedtime: formData.bedtime,
        wake_time: formData.wakeTime,
        main_problem: formData.mainProblem,
        phone_usage: formData.phoneUsage
      });

      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          email: formData.email,
          bedtime: formData.bedtime,
          wake_time: formData.wakeTime,
          main_problem: formData.mainProblem,
          phone_usage: formData.phoneUsage
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      setSuccess(true);
    } catch (err) {
      console.error('Fetch error:', err);

      // More specific error messages
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:3000');
      } else if (err.name === 'TypeError') {
        setError('Network error. Please check if the backend server is running.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome aboard! 🎉</h2>
          <p className="text-gray-600">Your sleep profile has been created. Start logging your sleep to get personalized insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sleep Better 😴</h1>
          <p className="text-gray-600">Let's set up your sleep profile in 4 quick questions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Bedtime */}
          <div>
            <label htmlFor="bedtime" className="block text-sm font-medium text-gray-700 mb-2">
              1. What time do you usually go to bed?
            </label>
            <input
              type="time"
              id="bedtime"
              name="bedtime"
              value={formData.bedtime}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Wake Time */}
          <div>
            <label htmlFor="wakeTime" className="block text-sm font-medium text-gray-700 mb-2">
              2. What time do you usually wake up?
            </label>
            <input
              type="time"
              id="wakeTime"
              name="wakeTime"
              value={formData.wakeTime}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Main Problem */}
          <div>
            <label htmlFor="mainProblem" className="block text-sm font-medium text-gray-700 mb-2">
              3. What's your main sleep challenge?
            </label>
            <select
              id="mainProblem"
              name="mainProblem"
              value={formData.mainProblem}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            >
              <option value="">Select a problem</option>
              <option value="cant_fall_asleep">Can't fall asleep</option>
              <option value="wake_up_tired">Wake up tired</option>
              <option value="wake_up_at_night">Wake up at night</option>
            </select>
          </div>

          {/* Phone Usage */}
          <div>
            <label htmlFor="phoneUsage" className="block text-sm font-medium text-gray-700 mb-2">
              4. How much time do you spend on your phone before bed?
            </label>
            <select
              id="phoneUsage"
              name="phoneUsage"
              value={formData.phoneUsage}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            >
              <option value="">Select duration</option>
              <option value="less_than_30">Less than 30 minutes</option>
              <option value="30_to_60">30-60 minutes</option>
              <option value="more_than_60">More than 1 hour</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating your profile...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
