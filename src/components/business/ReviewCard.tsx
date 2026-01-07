import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { Review } from '@/types/business';

interface ReviewCardProps {
  review: Review;
  showLocationName?: boolean;
  canRespond?: boolean;
  onRespond?: (reviewId: string, response: string) => Promise<void>;
}

export function ReviewCard({
  review,
  showLocationName,
  canRespond,
  onRespond,
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState(review.business_response || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!response.trim() || !onRespond) return;
    
    setIsSubmitting(true);
    try {
      await onRespond(review.id, response);
      setShowResponseForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {review.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {review.profiles?.full_name || 'Anonymous'}
                </span>
                {review.is_verified_booking && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.created_at!), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="mt-3 text-sm">{review.comment}</p>
        )}

        {/* Business Response */}
        {review.business_response && (
          <div className="mt-3 bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Business Response</p>
            <p className="text-sm">{review.business_response}</p>
          </div>
        )}

        {/* Response Form */}
        {canRespond && !review.business_response && (
          <>
            {showResponseForm ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write your response..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResponseForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Submit Response'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setShowResponseForm(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Respond
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
