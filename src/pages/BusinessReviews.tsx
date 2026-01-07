import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { useBusinessReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewCard } from '@/components/business/ReviewCard';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';

export default function BusinessReviews() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { businessAccount, isLoading: accountLoading } = useBusinessAccount();
  const { reviews, isLoading: reviewsLoading, respondToReview } = useBusinessReviews(businessAccount?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!accountLoading && !businessAccount) {
      navigate('/business/onboarding');
    }
  }, [businessAccount, accountLoading, navigate]);

  const isLoading = authLoading || accountLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const pendingResponses = reviews?.filter(r => !r.business_response).length || 0;

  const handleRespond = async (reviewId: string, response: string) => {
    await respondToReview.mutateAsync({ reviewId, response });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Reviews</h1>
            <p className="text-sm text-muted-foreground">
              Manage customer reviews
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRating}</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingResponses}</p>
                <p className="text-xs text-muted-foreground">Pending Responses</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="font-semibold">All Reviews ({reviews?.length || 0})</h2>
          
          {!reviews?.length ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold">No reviews yet</h3>
                <p className="text-sm text-muted-foreground">
                  Customer reviews will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showLocationName
                canRespond
                onRespond={handleRespond}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
