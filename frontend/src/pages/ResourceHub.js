import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  BookOpen,
  Target,
  Brain,
  FileBarChart,
  GraduationCap,
  Award,
  Download,
  FolderOpen,
  Loader2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RESOURCE_CONFIG = {
  resource_guide: { label: 'Resource Guide', description: 'Your complete program guide', icon: BookOpen, color: '#1E3A5F' },
  '360_assessment': { label: '360 Assessment', description: 'Leadership feedback results', icon: Target, color: '#0F766E' },
  '16personalities': { label: '16 Personalities', description: 'Your personality profile', icon: Brain, color: '#7C3AED' },
  midway_report: { label: 'Midway Report', description: 'Mid-program progress review', icon: FileBarChart, color: '#F59E0B' },
  graduation_report: { label: 'Graduation Report', description: 'Final program assessment', icon: GraduationCap, color: '#1E3A5F' },
  certificate: { label: 'Certificate', description: 'Certificate of Completion', icon: Award, color: '#0F766E' },
};

export default function ResourceHub() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchResources();
  }, [user]);

  const fetchResources = async () => {
    if (!user?._id && !user?.id) return;
    try {
      const uid = user._id || user.id;
      const { data } = await axios.get(`${API}/resources/${uid}`, { withCredentials: true });
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    setDownloading(resource.id);
    try {
      const response = await axios.get(`${API}/resources/download/${resource.id}`, {
        withCredentials: true,
        responseType: 'blob'
      });
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

  // Build resource map
  const resourceMap = {};
  resources.forEach(r => {
    resourceMap[r.type] = r;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8" data-testid="resource-hub">
      <div className="animate-fade-in-up">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">
          Your Materials
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Resource Hub
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Access all your coaching program documents and assessments
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(RESOURCE_CONFIG).map(([type, config], i) => {
          const resource = resourceMap[type];
          const Icon = config.icon;
          const isAvailable = !!resource;

          return (
            <Card
              key={type}
              className={`border shadow-sm transition-all duration-200 animate-fade-in-up
                ${isAvailable
                  ? 'border-slate-200 hover:shadow-md hover:-translate-y-[1px]'
                  : 'border-slate-100 bg-slate-50/50'
                }
              `}
              style={{ animationDelay: `${i * 0.05}s` }}
              data-testid={`resource-card-${type}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isAvailable ? `${config.color}10` : '#F1F5F9',
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      style={{ color: isAvailable ? config.color : '#94A3B8' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{config.description}</p>

                    {isAvailable ? (
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(resource)}
                          disabled={downloading === resource.id}
                          data-testid={`download-${type}`}
                          className="h-8 text-xs bg-[#1E3A5F] hover:bg-[#152D4A]"
                        >
                          {downloading === resource.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <>
                              <Download size={12} className="mr-1" /> Download
                            </>
                          )}
                        </Button>
                        <Badge variant="secondary" className="text-[10px]">
                          {resource.original_filename?.split('.').pop()?.toUpperCase()}
                        </Badge>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">
                          Not yet uploaded
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
