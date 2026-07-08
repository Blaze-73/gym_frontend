import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { siteReviewsAPI } from '@/services/api';
import StarRating from '@/components/coaches/StarRating';
import Button from '@/components/common/Button';

const SiteReviewForm = ({ isAuthenticated, onPosted }) => {
  const [open, setOpen] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    siteReviewsAPI.getMine()
      .then((res) => {
        const r = res.data?.review;
        setMyReview(r);
        if (r) setForm({ rating: r.rating, comment: r.text || '' });
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.comment.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = myReview
        ? await siteReviewsAPI.update(myReview.id, form)
        : await siteReviewsAPI.submit(form);
      setMyReview(res.data?.review);
      onPosted?.(res.data);
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your review.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <p className="text-center text-sm text-gray-500 mt-10">
        <Link to="/login" className="text-primary-fixed font-bold hover:underline">Log in</Link>
        {' '}to share your experience with Alien Fitness.
      </p>
    );
  }

  return (
    <div className="mt-12 max-w-xl mx-auto">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-headline font-bold uppercase tracking-wider text-gray-400 hover:text-primary-fixed hover:border-primary-fixed/30 transition-colors"
        >
          <PenLine className="w-4 h-4" />
          {myReview ? 'Edit your review' : 'Write a review'}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <p className="text-xs font-headline font-bold uppercase tracking-wider text-gray-500 text-center">
            {myReview ? 'Update your homepage review' : 'Share your experience'}
          </p>
          <div className="flex justify-center">
            <StarRating value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
          </div>
          <textarea
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            placeholder="What do you love about Alien Fitness?"
            rows={3}
            maxLength={600}
            required
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-fixed/40 resize-none"
          />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 text-xs font-bold uppercase rounded-xl border border-white/10 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="sm" loading={saving} className="flex-1">
              {myReview ? 'Update' : 'Publish'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SiteReviewForm;
