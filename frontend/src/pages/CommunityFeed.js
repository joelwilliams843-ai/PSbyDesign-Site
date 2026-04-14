import { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Lightbulb, Quote, Heart, Send, Loader2, MessageSquare
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('best_practice');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`${API}/feed`);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`${API}/feed`, { content, type: postType });
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`${API}/feed/${postId}/like`, {});
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const uid = user?._id || user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6" data-testid="community-feed">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">Together</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Community</h1>
        <p className="text-sm text-slate-500 mt-1">Share leadership insights and motivational quotes</p>
      </div>

      {/* Compose */}
      <Card className="border border-slate-200 shadow-sm" data-testid="compose-card">
        <CardContent className="p-5">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setPostType('best_practice')}
              data-testid="type-best-practice"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${postType === 'best_practice'
                  ? 'bg-[#0F2B3C] text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              <Lightbulb size={12} /> Best Practice
            </button>
            <button
              onClick={() => setPostType('quote')}
              data-testid="type-quote"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${postType === 'quote'
                  ? 'bg-[#0B7A6F] text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              <Quote size={12} /> Quote
            </button>
          </div>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={postType === 'quote' ? 'Share an inspiring quote...' : 'Share a leadership best practice...'}
            className="min-h-[80px] mb-3"
            data-testid="post-content-input"
          />
          <div className="flex justify-end">
            <Button
              onClick={handlePost}
              disabled={submitting || !content.trim()}
              data-testid="submit-post-btn"
              className="bg-[#0F2B3C] hover:bg-[#0A2233]"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} className="mr-2" /> Post</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No posts yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post, i) => {
            const isLiked = post.likes?.includes(uid);
            return (
              <div
                key={post.id}
                className="py-5 border-b border-slate-100 last:border-0 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.03}s` }}
                data-testid={`feed-post-${post.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0
                    ${post.user_role === 'admin' ? 'bg-[#0B7A6F]' : 'bg-[#0F2B3C]'}`}>
                    {post.user_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800">{post.user_name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          post.type === 'quote'
                            ? 'bg-[#0B7A6F]/10 text-[#0B7A6F]'
                            : 'bg-[#0F2B3C]/10 text-[#0F2B3C]'
                        }`}
                      >
                        {post.type === 'quote' ? 'Quote' : 'Best Practice'}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm text-slate-600 leading-relaxed ${post.type === 'quote' ? 'italic' : ''}`}>
                      {post.type === 'quote' && '"'}{post.content}{post.type === 'quote' && '"'}
                    </p>
                    <button
                      onClick={() => handleLike(post.id)}
                      data-testid={`like-btn-${post.id}`}
                      className={`flex items-center gap-1.5 mt-2 text-xs font-medium transition-colors
                        ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                    >
                      <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                      {post.likes?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
