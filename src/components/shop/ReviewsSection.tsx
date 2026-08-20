import { useState } from 'react';
import { useReviews, Review } from '../../hooks/useReviews';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ReviewsSection({ productId }: { productId: string }) {
  const { reviews, loading, isEligible, submitReview } = useReviews(productId);
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !text) return;
    setSubmitting(true);
    try {
      await submitReview(rating, text);
      setSuccess(true);
      setIsWriting(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="border-t border-drakn-light/20 mt-24 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div>
          <h2 className="text-2xl font-display uppercase tracking-widest mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={16} fill={star <= parseFloat(averageRating) ? "currentColor" : "none"} strokeWidth={1} className={star <= parseFloat(averageRating) ? "text-drakn-light" : "text-drakn-muted"} />
              ))}
            </div>
            <span className="text-xs uppercase tracking-widest text-drakn-muted">{averageRating} out of 5 ({reviews.length} reviews)</span>
          </div>
        </div>

        {isEligible && !success && !isWriting && (
          <button 
            onClick={() => setIsWriting(true)}
            className="border border-drakn-light px-8 py-4 text-xs uppercase tracking-widest hover:bg-drakn-light hover:text-drakn-base transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-500 p-6 text-sm tracking-widest uppercase mb-12">
          Thank you. Your review has been submitted and is pending moderation.
        </div>
      )}

      {isWriting && (
        <form onSubmit={handleSubmit} className="border border-drakn-light/20 p-8 mb-12 max-w-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Write your review</h3>
          <div className="mb-6">
            <label className="block text-[10px] text-drakn-muted uppercase tracking-widest mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star size={24} fill={star <= rating ? "currentColor" : "none"} strokeWidth={1} className={star <= rating ? "text-drakn-light" : "text-drakn-muted"} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] text-drakn-muted uppercase tracking-widest mb-2">Review</label>
            <textarea 
              required
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-transparent border border-drakn-light/20 p-4 text-sm focus:outline-none focus:border-drakn-light transition-colors"
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" disabled={submitting} className="bg-drakn-light text-drakn-base px-8 py-3 text-xs uppercase tracking-widest font-bold disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={() => setIsWriting(false)} className="border border-drakn-light/20 px-8 py-3 text-xs uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-drakn-muted text-sm tracking-widest uppercase py-12 text-center border border-drakn-light/10">
          No reviews yet for this product.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map(review => (
            <div key={review.id} className="border border-drakn-light/20 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} strokeWidth={1} className={star <= review.rating ? "text-drakn-light" : "text-drakn-muted"} />
                    ))}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest">{review.userName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-drakn-muted uppercase tracking-widest mb-1">
                    {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                  {review.verifiedPurchase && (
                    <p className="text-[10px] text-green-500 uppercase tracking-widest">Verified Purchase</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-drakn-muted leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
