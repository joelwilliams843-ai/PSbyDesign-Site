import { useState, useEffect, useCallback } from 'react';
import { api as axios } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import {
  Upload, FileText, Loader2, FolderOpen
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RESOURCE_TYPES = [
  { value: 'resource_guide', label: 'Participant Resource Guide' },
  { value: '360_assessment', label: '360 Leadership Assessment' },
  { value: '16personalities', label: '16 Personalities Profile' },
  { value: 'midway_report', label: 'Midway Report' },
  { value: 'graduation_report', label: 'Graduation Report' },
  { value: 'certificate', label: 'Certificate of Completion' },
];

export default function AdminResources() {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');

  const fetchParticipants = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/participants`);
      setParticipants(data);
      if (data.length > 0) setSelectedParticipant(data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    if (!selectedParticipant) return;
    try {
      const { data } = await axios.get(`${API}/resources/${selectedParticipant}`);
      setResources(data);
    } catch (err) {
      console.error(err);
    }
  }, [selectedParticipant]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  useEffect(() => {
    if (selectedParticipant) fetchResources();
  }, [selectedParticipant, fetchResources]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadType || !selectedParticipant) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('participant_id', selectedParticipant);
      formData.append('resource_type', uploadType);
      await axios.post(`${API}/resources/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadType('');
      fetchResources();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      await axios.delete(`${API}/resources/${resourceId}`);
      fetchResources();
    } catch (err) {
      console.error(err);
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6" data-testid="admin-resources-page">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">Manage</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Resources</h1>
        <p className="text-sm text-slate-500 mt-1">Upload and manage documents for participants</p>
      </div>

      {/* Select participant */}
      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium text-slate-700 shrink-0">Participant:</Label>
        <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
          <SelectTrigger className="w-64" data-testid="participant-select">
            <SelectValue placeholder="Select participant" />
          </SelectTrigger>
          <SelectContent>
            {participants.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.email})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedParticipant && (
        <>
          {/* Upload area */}
          <Card className="border border-dashed border-slate-200 bg-slate-50 shadow-none">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 mb-1">Upload Document</p>
                  <p className="text-xs text-slate-400">Select a resource type and upload a file. Uploading a new file will replace the previous version.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="h-9 w-52" data-testid="admin-resource-type-select">
                      <SelectValue placeholder="Resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors whitespace-nowrap
                    ${uploadType ? 'bg-[#0F2B3C] text-white hover:bg-[#0A2233]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={!uploadType || uploading}
                      data-testid="admin-resource-file-input"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources list */}
          {resources.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No resources uploaded for this participant</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resources.map(r => (
                <Card key={r.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[#0F2B3C] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{r.original_filename}</p>
                        <p className="text-xs text-slate-400">
                          {RESOURCE_TYPES.find(t => t.value === r.type)?.label || r.type}
                          <span className="mx-1.5">·</span>
                          {new Date(r.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(r.id)}
                        data-testid={`delete-resource-${r.id}`}
                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Label({ children, className }) {
  return <label className={className}>{children}</label>;
}
