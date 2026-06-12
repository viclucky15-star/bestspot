import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityPosts } from '@/hooks/useCommunity';
import { CommentsDialog } from '@/components/CommentsDialog';
import { ShareButton } from '@/components/ShareButton';
import { formatDistanceToNow } from 'date-fns';

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, loading, createPost, toggleLike, refetch } = useCommunityPosts();
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);

  const handleCreatePost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    await createPost(newContent.trim());
    setNewContent('');
    setCreateOpen(false);
    setPosting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Community</h1>
          {user && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share with the community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share a place, tip, or experience..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()} className="w-full">
                    {posting ? 'Posting...' : 'Share Post'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="p-4 max-w-lg md:max-w-3xl mx-auto">
        {!user && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/20 rounded-xl p-6 mb-6 text-center">
            <h3 className="font-semibold mb-2">Join the conversation</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign in to share and interact with others</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="bg-card rounded-xl border overflow-hidden">
                {/* Post Header */}
                <div className="flex items-center gap-3 p-4 pb-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.profile?.avatar_url || ''} />
                    <AvatarFallback>{post.profile?.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.profile?.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  
                  {post.location && (
                    <button
                      onClick={() => navigate(`/location/${post.location!.id}`)}
                      className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <MapPin className="w-4 h-4" />
                      {post.location.name}
                    </button>
                  )}

                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {post.image_urls.map((url, i) => (
                        <img key={i} src={url} alt="" className="rounded-lg w-full object-cover max-h-64" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 px-4 py-3 border-t">
                  <button
                    onClick={() => user && toggleLike(post.id)}
                    className={`flex items-center gap-2 text-sm ${post.has_liked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                  >
                    <Heart className={`w-5 h-5 ${post.has_liked ? 'fill-current' : ''}`} />
                    {post.likes_count || 0}
                  </button>
                  <CommentsDialog 
                    postId={post.id} 
                    commentsCount={post.comments_count || 0}
                    onCommentAdded={refetch}
                  />
                  <ShareButton
                    title={`Post by ${post.profile?.full_name || 'tourguide User'}`}
                    text={post.content.slice(0, 100) + (post.content.length > 100 ? '...' : '')}
                    url={`${window.location.origin}/community#post-${post.id}`}
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
