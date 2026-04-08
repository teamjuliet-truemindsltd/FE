import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Loader, Calendar, User, X } from 'lucide-react';
import { collaborationService, type Discussion, type CreateDiscussionRequest } from '../services/collaborationService';
import AppLayout from '../components/layout/AppLayout';

export const DiscussionsPage: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [formData, setFormData] = useState<CreateDiscussionRequest>({ title: '', content: '' });

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await collaborationService.getAllDiscussions();
      setDiscussions(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load discussions';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      setCreating(true);
      const newDiscussion = await collaborationService.createDiscussion(formData);
      setDiscussions(prev => [newDiscussion, ...prev]);
      setFormData({ title: '', content: '' });
      setShowCreateForm(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create discussion';
      alert(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const viewDiscussion = async (id: string) => {
    try {
      const detail = await collaborationService.getDiscussion(id);
      setSelectedDiscussion(detail);
    } catch (err) {
      alert('Failed to load discussion details');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !replyContent.trim()) return;

    try {
      setIsReplying(true);
      await collaborationService.createReply({
        discussionId: selectedDiscussion.id,
        content: replyContent
      });
      // Refresh discussion to get new replies
      await viewDiscussion(selectedDiscussion.id);
      setReplyContent('');
    } catch (err) {
      alert('Failed to post reply');
    } finally {
      setIsReplying(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      viewDiscussion(id);
    }
  }, []);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discussions</h1>
          <p className="text-foreground/60 mt-1">Connect and collaborate with the community</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Discussion
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-surface/60 rounded-2xl p-6 border border-primary-teal/30 mb-8 animate-in slide-in-from-top">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Start a New Discussion</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-foreground/40 hover:text-foreground transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What do you want to discuss?"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts, questions, or ideas..."
                rows={4}
                className="input resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !formData.title.trim() || !formData.content.trim()}
                className="btn-primary"
              >
                {creating ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-10 h-10 text-primary-teal animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discussion List */}
          <div className={`space-y-3 ${selectedDiscussion ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            {discussions.length === 0 ? (
              <div className="text-center py-16 bg-surface/30 rounded-2xl border border-border border-dashed">
                <MessageSquare className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/40 mb-4">No discussions yet. Be the first to start one!</p>
              </div>
            ) : (
              discussions.map((discussion) => (
                <button
                  key={discussion.id}
                  onClick={() => viewDiscussion(discussion.id)}
                  className={`w-full text-left bg-surface/60 rounded-xl p-5 border transition-all hover:border-primary-teal/30 ${
                    selectedDiscussion?.id === discussion.id
                      ? 'border-primary-teal ring-1 ring-primary-teal/20'
                      : 'border-border'
                  }`}
                >
                  <h3 className="text-foreground font-bold mb-2 line-clamp-1">{discussion.title}</h3>
                  <p className="text-foreground/60 text-sm line-clamp-2 mb-3">{discussion.content}</p>
                  <div className="flex items-center gap-3 text-xs text-foreground/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Discussion Detail Panel */}
          {selectedDiscussion && (
            <div className="lg:col-span-2">
              <div className="bg-surface/60 rounded-2xl p-6 border border-border sticky top-20">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">{selectedDiscussion.title}</h2>
                  <button
                    onClick={() => setSelectedDiscussion(null)}
                    className="text-foreground/40 hover:text-foreground transition p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/50 mb-6 pb-4 border-b border-border">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {selectedDiscussion.user ? `${selectedDiscussion.user.firstName} ${selectedDiscussion.user.lastName}` : `User #${selectedDiscussion.createdBy}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedDiscussion.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-8">
                  {selectedDiscussion.content}
                </div>

                {/* Replies Section */}
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">Replies ({selectedDiscussion.replies?.length || 0})</h3>
                  
                  <div className="space-y-4 mb-8">
                    {selectedDiscussion.replies?.map((reply) => (
                      <div key={reply.id} className="bg-background/50 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 text-xs text-foreground/40 mb-3">
                          <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center font-bold text-foreground uppercase">
                            {reply.user?.firstName?.charAt(0) || <User className="w-3 h-3" />}
                          </div>
                          <span className="font-semibold text-foreground/80">
                            {reply.user ? `${reply.user.firstName} ${reply.user.lastName}` : `User #${reply.userId}`}
                          </span>
                          <span>•</span>
                          <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-foreground/80 text-sm whitespace-pre-wrap pl-8">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                    {(!selectedDiscussion.replies || selectedDiscussion.replies.length === 0) && (
                      <p className="text-foreground/40 text-sm italic">No replies yet. Start the conversation!</p>
                    )}
                  </div>

                  <form onSubmit={handleReply} className="mt-4">
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Write a Reply</label>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={3}
                      className="input mb-3 resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isReplying || !replyContent.trim()}
                        className="btn-primary"
                      >
                        {isReplying ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

          )}
        </div>
      )}
    </AppLayout>
  );
};

export default DiscussionsPage;
