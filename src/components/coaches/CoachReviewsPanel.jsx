import { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { coachesAPI } from '@/services/api';
import StarRating from '@/components/coaches/StarRating';
import Button from '@/components/common/Button';

const CoachReviewsPanel = ({ coachId, onRatingChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [average, setAverage] = useState(5);
  const [count, setCount] = useState(0);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, mineRes] = await Promise.all([
        coachesAPI.getReviews(coachId),
        coachesAPI.getMyReview(coachId).catch(() => ({ data: { review: null } })),
      ]);
      setReviews(listRes.data?.reviews || []);
      setAverage(listRes.data?.average_rating ?? 5);
      setCount(listRes.data?.review_count ?? 0);
      const mine = mineRes.data?.review;
      setMyReview(mine);
      if (mine) {
        setForm({ rating: mine.rating, comment: mine.comment || '' });
      }
      onRatingChange?.(listRes.data?.average_rating, listRes.data?.review_count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coachId) load();
  }, [coachId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return;
    setSaving(true);
    setError('');
    try {
      const res = myReview
        ? await coachesAPI.updateReview(myReview.id, form)
        : await coachesAPI.submitReview({ coach_id: coachId, ...form });
      setMyReview(res.data?.review);
      setAverage(res.data?.average_rating);
      setCount(res.data?.review_count);
      onRatingChange?.(res.data?.average_rating, res.data?.review_count);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/10">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-2 text-left group"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-fixed" />
          <span className="text-xs font-headline font-bold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">
            Member reviews
          </span>
          <span className="text-[10px] text-gray-600">
            {count} · <span className="text-primary-fixed font-bold">{Number(average).toFixed(1)}</span>
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {loading ? (
            <p className="text-xs text-gray-500 text-center py-4">Loading reviews…</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-headline font-bold uppercase text-gray-500">
                  {myReview ? 'Update your review' : 'Leave your review'}
                </p>
                <StarRating value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Optional — share your experience…"
                  rows={2}
                  maxLength={500}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-fixed/40 resize-none"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button type="submit" variant="primary" size="sm" loading={saving} className="w-full sm:w-auto">
                  {myReview ? 'Update review' : 'Post review'}
                </Button>
              </form>

              {reviews.length > 0 ? (
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {reviews.map((r) => (
                    <li key={r.id} className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white truncate">
                          {r.author_name}
                          {r.is_mine && <span className="text-primary-fixed ml-1">(you)</span>}
                        </span>
                        <StarRating value={r.rating} readOnly size="sm" />
                      </div>
                      {r.comment && <p className="text-xs text-gray-400 leading-relaxed">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-600 text-center py-2">No reviews yet — be the first.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachReviewsPanel;
