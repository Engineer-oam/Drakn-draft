import { useAdminReviews } from '../../hooks/useAdminReviews';
import { Star, Check, X, Trash } from 'lucide-react';

export function ReviewsManager() {
  const { reviews, loading, updateReviewStatus } = useAdminReviews();

  if (loading) return <div className="p-8 max-w-7xl mx-auto uppercase tracking-widest text-xs">Loading reviews...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-display uppercase tracking-[0.2em] mb-8 border-b border-drakn-light/20 pb-4">Reviews Moderation</h1>
      
      {reviews.length === 0 ? (
        <p className="text-drakn-muted uppercase tracking-widest text-sm">No reviews found.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className={`border p-6 flex flex-col md:flex-row gap-6 ${review.status === 'pending' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-drakn-light/20'}`}>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-center">
                    <p className="text-sm font-bold uppercase tracking-widest">{review.userName}</p>
                    {review.verifiedPurchase && <span className="text-[10px] text-green-500 uppercase tracking-widest border border-green-500/30 px-2 py-0.5">Verified</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-drakn-muted uppercase tracking-widest">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Unknown Date'}</p>
                    <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${review.status === 'approved' ? 'text-green-500' : review.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {review.status}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} strokeWidth={1} className={star <= review.rating ? "text-drakn-light" : "text-drakn-muted"} />
                  ))}
                </div>
                
                <p className="text-sm text-drakn-muted leading-relaxed">{review.text}</p>
                <p className="text-[10px] text-drakn-muted mt-4">Product ID: {review.productId}</p>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-center">
                {review.status !== 'approved' && (
                  <button 
                    onClick={() => updateReviewStatus(review.id, 'approved')}
                    className="flex items-center justify-center gap-2 border border-green-500/30 text-green-500 px-4 py-2 hover:bg-green-500/10 transition-colors text-xs uppercase tracking-widest"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button 
                    onClick={() => updateReviewStatus(review.id, 'rejected')}
                    className="flex items-center justify-center gap-2 border border-red-500/30 text-red-500 px-4 py-2 hover:bg-red-500/10 transition-colors text-xs uppercase tracking-widest"
                  >
                    <X size={14} /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
