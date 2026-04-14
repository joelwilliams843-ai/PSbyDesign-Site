import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ProgressTracker from '../components/ProgressTracker';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  CalendarClock,
  FolderOpen,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RESOURCE_LABELS = {
  resource_guide: 'Resource Guide',
  '360_assessment': '360 Assessment',
  '16personalities': '16 Personalities',
  midway_report: 'Midway Report',
  graduation_report: 'Graduation Report',
  certificate: 'Certificate',
};

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await axios.get(`${API}/dashboard/participant`, { withCredentials: true });
      setData(d);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6" data-testid="participant-dashboard-error">
        <p className="text-slate-500">Unable to load dashboard data.</p>
      </div>
    );
  }

  const { sessions, completed_sessions, total_sessions, progress_percent, next_session, resources, schedule_requests } = data;

  // Determine journey phase
  const phase = completed_sessions === 0
    ? 'Getting Started'
    : completed_sessions <= 3
      ? 'Foundation Phase'
      : completed_sessions <= 6
        ? 'Growth Phase'
        : completed_sessions <= 9
          ? 'Mastery Phase'
          : 'Program Complete';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8" data-testid="participant-dashboard">
      {/* Welcome header */}
      <div className="animate-fade-in-up">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">
          Welcome back
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          {user?.name}
        </h1>
      </div>

      {/* Progress Tracker - Visual Centerpiece */}
      <Card className="border border-slate-200 shadow-sm animate-fade-in-up stagger-1" data-testid="progress-card">
        <CardContent className="p-6 md:p-8">
          <ProgressTracker sessions={sessions} />
        </CardContent>
      </Card>

      {/* Journey + Next Session Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Where you are */}
        <Card className="border border-slate-200 shadow-sm animate-fade-in-up stagger-2" data-testid="journey-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-[#0F766E]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">
                  Where you are
                </p>
                <p className="text-lg font-semibold text-slate-900">{phase}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {completed_sessions === 0
                    ? 'Your coaching journey begins now. Let\'s get started!'
                    : completed_sessions === total_sessions
                      ? 'Congratulations! You\'ve completed the program.'
                      : `You've completed ${completed_sessions} of ${total_sessions} sessions.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Session */}
        <Card className="border border-slate-200 shadow-sm animate-fade-in-up stagger-3" data-testid="next-session-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
                <CalendarClock size={18} className="text-[#1E3A5F]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">
                  Next Session
                </p>
                {next_session ? (
                  <>
                    <p className="text-lg font-semibold text-slate-900">
                      Session {next_session.session_number}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {next_session.scheduled_date
                        ? `Scheduled: ${next_session.scheduled_date}`
                        : 'Not yet scheduled'}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-[#0F766E]">All sessions complete!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resources */}
        <Card className="border border-slate-200 shadow-sm animate-fade-in-up stagger-4" data-testid="resources-preview">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">Resources</CardTitle>
              <button
                onClick={() => navigate('/resources')}
                className="text-xs text-[#1E3A5F] hover:text-[#152D4A] font-medium flex items-center gap-1 transition-colors"
                data-testid="view-all-resources-btn"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {resources.length === 0 ? (
              <div className="text-center py-6">
                <FolderOpen size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No resources uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resources.slice(0, 4).map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <FileText size={16} className="text-[#1E3A5F] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{r.original_filename}</p>
                      <p className="text-xs text-slate-400">{RESOURCE_LABELS[r.type] || r.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card className="border border-slate-200 shadow-sm animate-fade-in-up stagger-5" data-testid="sessions-preview">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {sessions.slice(0, 5).map(s => (
                <div key={s.id || s.session_number} className="flex items-center gap-3 p-2.5 rounded-lg">
                  {s.status === 'completed' ? (
                    <CheckCircle2 size={16} className="text-[#0F766E] shrink-0" />
                  ) : (
                    <Clock size={16} className="text-slate-300 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${s.status === 'completed' ? 'text-slate-700' : 'text-slate-400'}`}>
                      Session {s.session_number}
                    </p>
                  </div>
                  <Badge
                    variant={s.status === 'completed' ? 'default' : 'secondary'}
                    className={`text-[10px] ${s.status === 'completed' ? 'bg-[#0F766E] hover:bg-[#0F766E]' : ''}`}
                  >
                    {s.status === 'completed' ? 'Done' : 'Upcoming'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
