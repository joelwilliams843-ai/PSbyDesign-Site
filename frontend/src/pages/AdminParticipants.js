import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import ProgressTracker from '../components/ProgressTracker';
import {
  UserPlus, Loader2, Check, Clock, FileText, Upload, AlertCircle,
  MoreVertical, KeyRound, UserX, UserCheck, Archive, Shield
} from 'lucide-react';
import { api, formatApiError } from '../contexts/AuthContext';

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
  const [showResetPassword, setShowResetPassword] = useState(null);
  const [showArchive, setShowArchive] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchParticipants(); }, []);

  const fetchParticipants = async () => {
    try {
      const { data } = await api.get(`${API}/participants`);
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
    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters');
      return;
    }
    setCreating(true);
    try {
      await api.post(`${API}/participants`, createForm);
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '' });
      fetchParticipants();
    } catch (err) {
      setCreateError(formatApiError(err.response?.data?.detail));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (participant) => {
    setActionLoading(true);
    try {
      await api.put(`${API}/participants/${participant.id}/deactivate`, {});
      fetchParticipants();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!showResetPassword || resetPassword.length < 8) return;
    setActionLoading(true);
    try {
      await api.post(`${API}/participants/${showResetPassword.id}/reset-password`, {
        new_password: resetPassword
      });
      setShowResetPassword(null);
      setResetPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!showArchive) return;
    setActionLoading(true);
    try {
      await api.delete(`${API}/participants/${showArchive.id}`);
      setShowArchive(null);
      fetchParticipants();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
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
          className="bg-[#0F2B3C] hover:bg-[#0A2233] text-white"
        >
          <UserPlus size={16} className="mr-2" /> Add Participant
        </Button>
      </div>

      {/* Participants Grid */}
      {participants.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <UserPlus size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-1">No participants enrolled</p>
            <p className="text-sm text-slate-400">Add your first participant to begin the coaching program</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {participants.map(p => {
            const isActive = p.is_active !== false;
            return (
              <Card
                key={p.id}
                className={`border shadow-sm transition-all ${isActive ? 'border-slate-200 hover:shadow-md hover:-translate-y-[1px]' : 'border-slate-100 bg-slate-50/50 opacity-75'}`}
                data-testid={`participant-card-${p.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${isActive ? 'bg-[#0F2B3C]' : 'bg-slate-400'}`}
                      onClick={() => isActive && setSelectedParticipant(p)}
                      style={{ cursor: isActive ? 'pointer' : 'default' }}
                    >
                      {p.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => isActive && setSelectedParticipant(p)}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        {!isActive && (
                          <Badge variant="secondary" className="text-[10px] bg-slate-200 text-slate-500">Inactive</Badge>
                        )}
                      </div>
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
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {p.sessions_completed || 0}/{p.sessions_total || 10}
                    </Badge>

                    {/* Admin actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`participant-actions-${p.id}`}>
                          <MoreVertical size={16} className="text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setSelectedParticipant(p)}
                          data-testid={`view-details-${p.id}`}
                        >
                          <Shield size={14} className="mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { setShowResetPassword(p); setResetPassword(''); }}
                          data-testid={`reset-password-${p.id}`}
                        >
                          <KeyRound size={14} className="mr-2" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(p)}
                          data-testid={`toggle-active-${p.id}`}
                        >
                          {isActive ? (
                            <><UserX size={14} className="mr-2" /> Deactivate</>
                          ) : (
                            <><UserCheck size={14} className="mr-2" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setShowArchive(p)}
                          className="text-red-600 focus:text-red-600"
                          data-testid={`archive-${p.id}`}
                        >
                          <Archive size={14} className="mr-2" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Participant Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Participant</DialogTitle>
            <DialogDescription>Create an account for a new coaching participant. They will be required to change their password on first login.</DialogDescription>
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
                placeholder="Min. 8 characters"
                required
                data-testid="create-password-input"
              />
              <p className="text-[10px] text-slate-400">Participant will be prompted to change this on first login.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={creating}
                data-testid="create-participant-submit"
                className="bg-[#0F2B3C] hover:bg-[#0A2233]"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create Participant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!showResetPassword} onOpenChange={() => setShowResetPassword(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new temporary password for {showResetPassword?.name}. They will be required to change it on next login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Temporary Password</Label>
              <Input
                type="password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                placeholder="Min. 8 characters"
                data-testid="reset-password-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(null)}>Cancel</Button>
            <Button
              onClick={handleResetPassword}
              disabled={actionLoading || resetPassword.length < 8}
              data-testid="confirm-reset-password"
              className="bg-[#0F2B3C] hover:bg-[#0A2233]"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={!!showArchive} onOpenChange={() => setShowArchive(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Participant</DialogTitle>
            <DialogDescription>
              This will deactivate {showArchive?.name}'s account and archive their data. This action cannot be easily undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchive(null)}>Cancel</Button>
            <Button
              onClick={handleArchive}
              disabled={actionLoading}
              data-testid="confirm-archive"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : 'Archive'}
            </Button>
          </DialogFooter>
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
        api.get(`${API}/sessions/${participant.id}`),
        api.get(`${API}/resources/${participant.id}`)
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
      await api.put(`${API}/sessions/${sessionId}`, {
        status: 'completed',
        notes: notes || ''
      });
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
      await api.post(`${API}/resources/upload`, formData, {
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
            <div className="w-10 h-10 rounded-full bg-[#0F2B3C] flex items-center justify-center text-white font-semibold">
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
                    <Check size={16} className="text-[#0B7A6F] shrink-0" />
                  ) : (
                    <Clock size={16} className="text-slate-300 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">Session {s.session_number}</p>
                    {s.notes && <p className="text-xs text-slate-400 mt-0.5">{s.notes}</p>}
                    {s.completed_at && <p className="text-[10px] text-slate-400 mt-0.5">Completed: {new Date(s.completed_at).toLocaleDateString()}</p>}
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
                        className="h-8 text-xs bg-[#0B7A6F] hover:bg-[#096B62]"
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                  {s.status === 'completed' && (
                    <Badge className="bg-[#0B7A6F] hover:bg-[#0B7A6F] text-[10px]">Done</Badge>
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
                    ${uploadType ? 'bg-[#0F2B3C] text-white hover:bg-[#0A2233]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
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
                      <FileText size={16} className="text-[#0F2B3C] shrink-0" />
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
