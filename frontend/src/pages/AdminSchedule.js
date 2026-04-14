import { useState, useEffect } from 'react';
import { api as axios } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import {
  Clock, CheckCircle2, XCircle, Loader2, CalendarClock
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminSchedule() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [adjustedDate, setAdjustedDate] = useState('');
  const [adjustedTime, setAdjustedTime] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`${API}/schedule/all`);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    if (!selected) return;
    setProcessing(true);
    try {
      await axios.put(`${API}/schedule/${selected.id}`, {
        status,
        admin_notes: adminNotes,
        adjusted_date: adjustedDate || null,
        adjusted_time: adjustedTime || null
      });
      setSelected(null);
      setAdminNotes('');
      setAdjustedDate('');
      setAdjustedTime('');
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6" data-testid="admin-schedule-page">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">Manage</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Schedule Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Review and respond to session requests from participants</p>
      </div>

      {requests.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <CalendarClock size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No schedule requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => {
            const config = statusConfig[r.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card key={r.id} className="border border-slate-200 shadow-sm" data-testid={`schedule-request-${r.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <StatusIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800">{r.participant_name}</p>
                        <Badge className={`${config.color} border-0 text-[10px]`}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {r.requested_date} at {r.requested_time}
                      </p>
                      {r.notes && <p className="text-xs text-slate-400 mt-1">{r.notes}</p>}
                      {r.admin_notes && <p className="text-xs text-slate-500 mt-1 italic">Your note: {r.admin_notes}</p>}
                    </div>
                    {r.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(r)}
                        data-testid={`review-request-${r.id}`}
                        className="text-xs shrink-0"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Session Request</DialogTitle>
            <DialogDescription>
              {selected?.participant_name} requested {selected?.requested_date} at {selected?.requested_time}
              {selected?.notes && ` — "${selected.notes}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Adjusted Date (optional)</label>
              <Input
                type="date"
                value={adjustedDate}
                onChange={e => setAdjustedDate(e.target.value)}
                data-testid="adjust-date-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Adjusted Time (optional)</label>
              <Input
                type="time"
                value={adjustedTime}
                onChange={e => setAdjustedTime(e.target.value)}
                data-testid="adjust-time-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <Textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add a note for the participant..."
                data-testid="admin-notes-input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('rejected')}
              disabled={processing}
              data-testid="decline-request-btn"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Decline
            </Button>
            <Button
              onClick={() => handleAction('approved')}
              disabled={processing}
              data-testid="approve-request-btn"
              className="bg-[#0B7A6F] hover:bg-[#096B62]"
            >
              {processing ? <Loader2 size={14} className="animate-spin" /> : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
