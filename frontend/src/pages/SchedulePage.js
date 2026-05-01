import { useState, useEffect, useCallback } from 'react';
import { api } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import {
  CalendarClock, Clock, CheckCircle2, XCircle, Loader2, CalendarIcon, Plus
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SchedulePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!user?._id && !user?.id) return;
    try {
      const uid = user._id || user.id;
      const { data } = await api.get(`${API}/schedule/${uid}`);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return;
    setSubmitting(true);
    try {
      await api.post(`${API}/schedule/request`, {
        requested_date: format(date, 'yyyy-MM-dd'),
        requested_time: time,
        notes
      });
      setShowForm(false);
      setDate(null);
      setTime('');
      setNotes('');
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6" data-testid="schedule-page">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">Sessions</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Request and manage your coaching sessions</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          data-testid="request-session-btn"
          className="bg-[#0F2B3C] hover:bg-[#0A2233]"
        >
          <Plus size={16} className="mr-2" /> Request Session
        </Button>
      </div>

      {/* Request Form */}
      {showForm && (
        <Card className="border border-slate-200 shadow-sm animate-fade-in-up" data-testid="schedule-form">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10"
                        data-testid="date-picker-trigger"
                      >
                        <CalendarIcon size={14} className="mr-2 text-slate-400" />
                        {date ? format(date, 'PPP') : <span className="text-slate-400">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date()}
                        data-testid="schedule-calendar"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    required
                    data-testid="time-input"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any preferences or topics to discuss..."
                  className="min-h-[80px]"
                  data-testid="schedule-notes"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button
                  type="submit"
                  disabled={submitting || !date || !time}
                  data-testid="submit-schedule-btn"
                  className="bg-[#0F2B3C] hover:bg-[#0A2233]"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <CalendarClock size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No session requests yet</p>
            <p className="text-sm text-slate-400 mt-1">Request your first coaching session above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => {
            const config = statusConfig[r.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card key={r.id} className="border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color}`}>
                      <StatusIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {r.requested_date} at {r.requested_time}
                        </p>
                        <Badge className={`${config.color} border-0 text-[10px]`}>
                          {config.label}
                        </Badge>
                      </div>
                      {r.notes && <p className="text-xs text-slate-500">{r.notes}</p>}
                      {r.admin_notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">Coach: {r.admin_notes}</p>
                      )}
                      {r.adjusted_date && (
                        <p className="text-xs text-[#0B7A6F] mt-1 font-medium">
                          Adjusted to: {r.adjusted_date} {r.adjusted_time && `at ${r.adjusted_time}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
