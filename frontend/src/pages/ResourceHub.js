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
  Loader2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RESOURCE_CONFIG = {
  resource_guide: { label: 'Resource Guide', description: 'Your complete coaching program guide and workbook', icon: BookOpen, color: '#1E3A5F' },
  '360_assessment': { label: '360 Leadership Assessment', description: 'Multi-rater feedback on your leadership competencies', icon: Target, color: '#0F766E' },
  '16personalities': { label: '16 Personalities Profile', description: 'Your personality type analysis and insights', icon: Brain, color: '#7C3AED' },
  midway_report: { label: 'Midway Progress Report', description: 'Mid-program assessment and development review', icon: FileBarChart, color: '#D97706' },
  graduation_report: { label: 'Graduation Report', description: 'Comprehensive final program evaluation', icon: GraduationCap, color: '#1E3A5F' },
  certificate: { label: 'Certificate of Completion', description: 'Official program completion certificate', icon: Award, color: '#0F766E' },
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

  const resourceMap = {};
  resources.forEach(r => { resourceMap[r.type] = r; });

  const availableCount = Object.keys(RESOURCE_CONFIG).filter(t => resourceMap[t]).length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8" data-testid="resource-hub">
      <div className="animate-fade-in-up">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
          Your Materials
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Resource Hub
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-lg">
          Access all your coaching program documents and assessments.
          {availableCount > 0 && (
            <span className="text-[#0F766E] font-medium"> {availableCount} of {Object.keys(RESOURCE_CONFIG).length} available.</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(RESOURCE_CONFIG).map(([type, config], i) => {
          const resource = resourceMap[type];
          const Icon = config.icon;
          const isAvailable = !!resource;

          return (
            <Card
              key={type}
              className={`border transition-all duration-200 animate-fade-in-up group
                ${isAvailable
                  ? 'border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-[1px]'
                  : 'border-slate-100 bg-slate-50/30'
                }
              `}
              style={{ animationDelay: `${i * 0.06}s` }}
              data-testid={`resource-card-${type}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105`}
                    style={{
                      backgroundColor: isAvailable ? `${config.color}0D` : '#F1F5F9',
                    }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      style={{ color: isAvailable ? config.color : '#94A3B8' }}
                    />
                  </div>

                  {/* Title */}
                  <p className={`text-sm font-semibold mb-1 ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>
                    {config.label}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">
                    {config.description}
                  </p>

                  {/* Action */}
                  {isAvailable ? (
                    <div className="flex items-center gap-2.5 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(resource)}
                        disabled={downloading === resource.id}
                        data-testid={`download-${type}`}
                        className="h-9 text-xs bg-[#1E3A5F] hover:bg-[#152D4A] px-4"
                      >
                        {downloading === resource.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <>
                            <Download size={13} className="mr-1.5" /> Download
                          </>
                        )}
                      </Button>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {resource.original_filename?.split('.').pop()?.toUpperCase()}
                      </Badge>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-300 uppercase tracking-wider font-medium">
                        Pending upload
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
