import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CommunityPost, Comment, Profile, Location } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useCommunityPosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profile:profiles(*),
          location:locations(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has liked each post
      let postsWithLikes = postsData as (CommunityPost & { profile: Profile; location: Location })[];
      
      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        postsWithLikes = postsWithLikes.map(post => ({
          ...post,
          has_liked: likedPostIds.has(post.id),
        }));
      }

      setPosts(postsWithLikes);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (content: string, locationId?: string, imageUrls?: string[]) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create posts",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content,
          location_id: locationId,
          image_urls: imageUrls || [],
        })
        .select(`
          *,
          profile:profiles(*),
          location:locations(*)
        `)
        .single();

      if (error) throw error;

      const newPost = { ...data, has_liked: false } as CommunityPost & { profile: Profile };
      setPosts(prev => [newPost, ...prev]);

      toast({
        title: "Post created! 📝",
        description: "Your post has been shared with the community",
      });

      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return null;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.has_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Update likes count
        await supabase
          .from('community_posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId);

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, has_liked: false, likes_count: Math.max(0, p.likes_count - 1) }
            : p
        ));
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });

        // Update likes count
        await supabase
          .from('community_posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId);

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, has_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));

      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });

      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      return false;
    }
  };

  return { posts, loading, createPost, toggleLike, deletePost, refetch: fetchPosts };
}

export function useComments(postId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments((data as (Comment & { profile: Profile })[]) || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select(`
          *,
          profile:profiles(*)
        `)
        .single();

      if (error) throw error;

      const newComment = data as Comment & { profile: Profile };
      setComments(prev => [...prev, newComment]);

      // Update comments count
      await supabase
        .from('community_posts')
        .update({ comments_count: comments.length + 1 })
        .eq('id', postId);

      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return null;
    }
  };

  return { comments, loading, addComment, refetch: fetchComments };
}
