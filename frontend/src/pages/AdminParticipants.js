import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import ProgressTracker from '../components/ProgressTracker';
import {
  UserPlus, Loader2, Check, Clock, FileText, Upload, AlertCircle
} from 'lucide-react';
import { formatApiError } from '../contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RESOURCE_TYPES = [
  { value: 'resource_guide', label: 'Participant Resource Guide' },
  { value: '360_assessment', label: '360 Leadership Assessment' },
  { value: '16personalities', label: '16 Personalities Profile' },
  { value: 'midway_report', label: 'Midway Report' },
  { value: 'graduation_report', label: 'Graduation Report' },
  { value: 'certificate', label: 'Certificate of Completion' },
];

export default function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchParticipants(); }, []);

  const fetchParticipants = async () => {
    try {
      const { data } = await axios.get(`${API}/participants`, { withCredentials: true });
      setParticipants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await axios.post(`${API}/participants`, createForm, { withCredentials: true });
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '' });
      fetchParticipants();
    } catch (err) {
      setCreateError(formatApiError(err.response?.data?.detail));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6" data-testid="admin-participants-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">Manage</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Participants</h1>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          data-testid="create-participant-btn"
          className="bg-[#1E3A5F] hover:bg-[#152D4A] text-white"
        >
          <UserPlus size={16} className="mr-2" /> Add Participant
        </Button>
      </div>

      {/* Participants Grid */}
      {participants.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <UserPlus size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-1">No participants yet</p>
            <p className="text-sm text-slate-400">Create your first participant to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {participants.map(p => (
            <Card
              key={p.id}
              className="border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all cursor-pointer"
              onClick={() => setSelectedParticipant(p)}
              data-testid={`participant-card-${p.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-semibold shrink-0">
                    {p.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.email}</p>
                  </div>
                  <div className="hidden sm:block">
                    <ProgressTracker
                      sessions={Array.from({ length: p.sessions_total || 10 }, (_, i) => ({
                        status: i < (p.sessions_completed || 0) ? 'completed' : 'upcoming'
                      }))}
                      compact
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {p.sessions_completed || 0}/{p.sessions_total || 10}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Participant Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Participant</DialogTitle>
            <DialogDescription>Create an account for a new coaching participant.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100" data-testid="create-error">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{createError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={createForm.name}
                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Jane Smith"
                required
                data-testid="create-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="jane@company.com"
                required
                data-testid="create-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Set initial password"
                required
                data-testid="create-password-input"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={creating}
                data-testid="create-participant-submit"
                className="bg-[#1E3A5F] hover:bg-[#152D4A]"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Participant Detail Dialog */}
      {selectedParticipant && (
        <ParticipantDetail
          participant={selectedParticipant}
          onClose={() => { setSelectedParticipant(null); fetchParticipants(); }}
        />
      )}
    </div>
  );
}

function ParticipantDetail({ participant, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [sessionNotes, setSessionNotes] = useState({});

  useEffect(() => { fetchData(); }, [participant.id]);

  const fetchData = async () => {
    try {
      const [sessRes, resRes] = await Promise.all([
        axios.get(`${API}/sessions/${participant.id}`, { withCredentials: true }),
        axios.get(`${API}/resources/${participant.id}`, { withCredentials: true })
      ]);
      setSessions(sessRes.data);
      setResources(resRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (sessionId, notes) => {
    try {
      await axios.put(`${API}/sessions/${sessionId}`, {
        status: 'completed',
        notes: notes || ''
      }, { withCredentials: true });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadType) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('participant_id', participant.id);
      formData.append('resource_type', uploadType);
      await axios.post(`${API}/resources/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadType('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-semibold">
              {participant.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <span className="block">{participant.name}</span>
              <span className="text-xs text-slate-400 font-normal">{participant.email}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <Tabs defaultValue="sessions" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="sessions" className="flex-1" data-testid="tab-sessions">Sessions</TabsTrigger>
              <TabsTrigger value="resources" className="flex-1" data-testid="tab-resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="mt-4 space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                  {s.status === 'completed' ? (
                    <Check size={16} className="text-[#0F766E] shrink-0" />
                  ) : (
                    <Clock size={16} className="text-slate-300 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">Session {s.session_number}</p>
                    {s.notes && <p className="text-xs text-slate-400 mt-0.5">{s.notes}</p>}
                  </div>
                  {s.status !== 'completed' && (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Notes..."
                        className="h-8 text-xs w-32"
                        value={sessionNotes[s.id] || ''}
                        onChange={e => setSessionNotes({ ...sessionNotes, [s.id]: e.target.value })}
                        data-testid={`session-notes-${s.session_number}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => markComplete(s.id, sessionNotes[s.id])}
                        data-testid={`mark-complete-${s.session_number}`}
                        className="h-8 text-xs bg-[#0F766E] hover:bg-[#0D635D]"
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                  {s.status === 'completed' && (
                    <Badge className="bg-[#0F766E] hover:bg-[#0F766E] text-[10px]">Done</Badge>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="resources" className="mt-4 space-y-4">
              {/* Upload section */}
              <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm font-medium text-slate-700 mb-3">Upload Resource</p>
                <div className="flex items-center gap-3">
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="h-9 w-48" data-testid="resource-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors
                    ${uploadType ? 'bg-[#1E3A5F] text-white hover:bg-[#152D4A]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={!uploadType || uploading}
                      data-testid="resource-file-input"
                    />
                  </label>
                </div>
              </div>

              {/* Resources list */}
              {resources.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No resources uploaded</p>
              ) : (
                <div className="space-y-2">
                  {resources.map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                      <FileText size={16} className="text-[#1E3A5F] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{r.original_filename}</p>
                        <p className="text-xs text-slate-400">
                          {RESOURCE_TYPES.find(t => t.value === r.type)?.label || r.type}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {new Date(r.uploaded_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
