import { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import ProgressTracker from '../components/ProgressTracker';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  CalendarClock, FolderOpen, FileText, Clock, CheckCircle2, Sparkles,
  Loader2, Download, BookOpen, Target, Brain, FileBarChart,
  GraduationCap, Award, Heart, Lightbulb, Quote, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RESOURCE_CONFIG = {
  resource_guide: { label: 'Resource Guide', icon: BookOpen, color: '#0F2B3C' },
  '360_assessment': { label: '360 Leadership Assessment', icon: Target, color: '#0B7A6F' },
  '16personalities': { label: '16 Personalities Profile', icon: Brain, color: '#7C3AED' },
  midway_report: { label: 'Midway Progress Report', icon: FileBarChart, color: '#D97706' },
  graduation_report: { label: 'Graduation Report', icon: GraduationCap, color: '#0F2B3C' },
  certificate: { label: 'Certificate of Completion', icon: Award, color: '#0B7A6F' },
};

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await api.get(`${API}/dashboard/participant`);
      setData(d);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    setDownloading(resource.id);
    try {
      const response = await api.get(`${API}/resources/download/${resource.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.original_filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(null);
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
        <p className="text-slate-500">Unable to load workspace data.</p>
      </div>
    );
  }

  const { sessions, completed_sessions, total_sessions, progress_percent, next_session, resources, user_posts } = data;

  const phase = completed_sessions === 0
    ? 'Getting Started'
    : completed_sessions <= 3
      ? 'Foundation Phase'
      : completed_sessions <= 6
        ? 'Growth Phase'
        : completed_sessions <= 9
          ? 'Mastery Phase'
          : 'Program Complete';

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const resourceMap = {};
  resources.forEach(r => { resourceMap[r.type] = r; });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10" data-testid="participant-dashboard">
      {/* ====== HEADER ====== */}
      <div className="animate-fade-in-up">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0B7A6F] font-semibold mb-2">
          Executive Coaching Program
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2B3C]">
          {user?.name}'s Workspace
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {phase} &middot; {completed_sessions} of {total_sessions} sessions completed
        </p>
      </div>

      {/* ====== SECTION 1: PROGRESS OVERVIEW ====== */}
      <section data-testid="section-progress">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-8 md:p-10">
            <ProgressTracker sessions={sessions} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Journey Phase */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0B7A6F]/10 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-[#0B7A6F]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Phase</p>
                  <p className="text-sm font-semibold text-[#0F2B3C] mt-0.5">{phase}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Session */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0F2B3C]/10 flex items-center justify-center shrink-0">
                  <CalendarClock size={16} className="text-[#0F2B3C]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Next Session</p>
                  {next_session ? (
                    <p className="text-sm font-semibold text-[#0F2B3C] mt-0.5">
                      Session {next_session.session_number}
                      {next_session.scheduled_date && <span className="font-normal text-slate-400 ml-1">· {next_session.scheduled_date}</span>}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-[#0B7A6F] mt-0.5">All complete</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0B7A6F]/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className="text-[#0B7A6F]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Progress</p>
                  <p className="text-sm font-semibold text-[#0F2B3C] mt-0.5">{progress_percent}% Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ====== SECTION 2: MY RESOURCES ====== */}
      <section data-testid="section-resources">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0F2B3C]">My Resources</h2>
            <p className="text-xs text-slate-400 mt-0.5">Program documents and assessments</p>
          </div>
          <button
            onClick={() => navigate('/clarity/app/resources')}
            className="text-xs text-[#0B7A6F] hover:text-[#096B62] font-medium transition-colors"
            data-testid="view-all-resources-btn"
          >
            View all &rarr;
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(RESOURCE_CONFIG).map(([type, config]) => {
            const resource = resourceMap[type];
            const Icon = config.icon;
            const available = !!resource;
            return (
              <Card
                key={type}
                className={`border transition-all duration-200 ${available ? 'border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-[1px]' : 'border-slate-100 bg-slate-50/30'}`}
                data-testid={`resource-card-${type}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: available ? `${config.color}0D` : '#F1F5F9' }}
                    >
                      <Icon size={18} strokeWidth={1.5} style={{ color: available ? config.color : '#94A3B8' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${available ? 'text-slate-800' : 'text-slate-400'}`}>
                        {config.label}
                      </p>
                      {available ? (
                        <button
                          onClick={() => handleDownload(resource)}
                          disabled={downloading === resource.id}
                          data-testid={`download-${type}`}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#0B7A6F] hover:text-[#096B62] font-medium transition-colors"
                        >
                          {downloading === resource.id ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                          Download · {resource.original_filename?.split('.').pop()?.toUpperCase()}
                        </button>
                      ) : (
                        <p className="text-[10px] text-slate-300 uppercase tracking-wider font-medium mt-1.5">Pending</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ====== SECTION 3: MY JOURNEY (Timeline) ====== */}
      <section data-testid="section-journey">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#0F2B3C]">My Journey</h2>
          <p className="text-xs text-slate-400 mt-0.5">Session history and coach notes</p>
        </div>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No sessions yet</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-100" />

                <div className="space-y-0">
                  {sessions.map((s, i) => {
                    const isCompleted = s.status === 'completed';
                    const isCurrent = !isCompleted && i === completed_sessions;
                    return (
                      <div
                        key={s.id || i}
                        className="relative flex gap-4 py-3.5 first:pt-0 last:pb-0"
                        data-testid={`journey-session-${s.session_number}`}
                      >
                        {/* Dot */}
                        <div className="relative z-10 shrink-0">
                          <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center
                            ${isCompleted
                              ? 'bg-[#0B7A6F] text-white'
                              : isCurrent
                                ? 'bg-white border-2 border-[#0B7A6F] text-[#0B7A6F]'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                            {isCompleted ? <CheckCircle2 size={14} /> : isCurrent ? <Clock size={13} /> : <span className="text-[10px] font-semibold">{s.session_number}</span>}
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${isCompleted ? 'text-[#0F2B3C]' : isCurrent ? 'text-[#0B7A6F]' : 'text-slate-400'}`}>
                              Session {s.session_number}
                            </p>
                            {isCompleted && (
                              <Badge className="bg-[#0B7A6F] hover:bg-[#0B7A6F] text-[9px] px-1.5 py-0">Done</Badge>
                            )}
                            {isCurrent && (
                              <Badge variant="outline" className="text-[9px] text-[#0B7A6F] border-[#0B7A6F]/30 px-1.5 py-0">Current</Badge>
                            )}
                          </div>
                          {s.completed_at && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Completed {new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                          {s.scheduled_date && !isCompleted && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Scheduled: {s.scheduled_date}</p>
                          )}
                          {s.notes && (
                            <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 rounded-md px-3 py-2 leading-relaxed">{s.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ====== SECTION 4: MY ACTIVITY ====== */}
      <section data-testid="section-activity">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0F2B3C]">My Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your community contributions</p>
          </div>
          <button
            onClick={() => navigate('/clarity/app/community')}
            className="text-xs text-[#0B7A6F] hover:text-[#096B62] font-medium transition-colors"
            data-testid="view-community-btn"
          >
            Go to Community &rarr;
          </button>
        </div>
        {(!user_posts || user_posts.length === 0) ? (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center">
              <MessageSquare size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No posts yet</p>
              <button
                onClick={() => navigate('/clarity/app/community')}
                className="mt-2 text-xs text-[#0B7A6F] hover:text-[#096B62] font-medium transition-colors"
              >
                Share your first insight
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {user_posts.slice(0, 5).map(post => (
              <Card key={post.id} className="border border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${post.type === 'quote' ? 'bg-[#0B7A6F]/10' : 'bg-[#0F2B3C]/10'}`}>
                      {post.type === 'quote' ? <Quote size={12} className="text-[#0B7A6F]" /> : <Lightbulb size={12} className="text-[#0F2B3C]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-slate-600 leading-relaxed ${post.type === 'quote' ? 'italic' : ''}`}>
                        {post.type === 'quote' && '"'}{post.content}{post.type === 'quote' && '"'}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Heart size={10} /> {post.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
