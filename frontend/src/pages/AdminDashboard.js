import { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ProgressTracker from '../components/ProgressTracker';
import {
  Users,
  CalendarClock,
  FolderOpen,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, participantsRes] = await Promise.all([
        api.get(`${API}/dashboard/admin`),
        api.get(`${API}/participants`)
      ]);
      setStats(statsRes.data);
      setParticipants(participantsRes.data);
    } catch (err) {
      console.error('Admin dashboard error:', err);
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

  const statCards = [
    { label: 'Participants', value: stats?.total_participants || 0, icon: Users, color: '#0F2B3C' },
    { label: 'Completion Rate', value: `${stats?.completion_rate || 0}%`, icon: TrendingUp, color: '#0B7A6F' },
    { label: 'Pending Requests', value: stats?.pending_schedule_requests || 0, icon: CalendarClock, color: '#F59E0B' },
    { label: 'Resources', value: stats?.total_resources || 0, icon: FolderOpen, color: '#0F2B3C' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8" data-testid="admin-dashboard">
      {/* Header */}
      <div className="animate-fade-in-up">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">
          Coach Dashboard
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Overview
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Participants List */}
      <Card className="border border-slate-200 shadow-sm" data-testid="admin-participants-list">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">Participants</CardTitle>
            <button
              onClick={() => navigate('/admin/participants')}
              className="text-xs text-[#0F2B3C] hover:text-[#0A2233] font-medium flex items-center gap-1 transition-colors"
              data-testid="manage-participants-btn"
            >
              Manage <ArrowRight size={12} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <Users size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">No participants yet</p>
              <button
                onClick={() => navigate('/admin/participants')}
                className="text-sm text-[#0F2B3C] hover:text-[#0A2233] font-medium"
                data-testid="add-first-participant-btn"
              >
                Add your first participant
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#0F2B3C] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {p.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressTracker
                      sessions={Array.from({ length: p.sessions_total || 10 }, (_, i) => ({
                        status: i < (p.sessions_completed || 0) ? 'completed' : 'upcoming'
                      }))}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
