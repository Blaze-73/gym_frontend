import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '@/services/api';
import { Plus, Edit, Trash2, Search, AlertTriangle, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveMediaUrl } from '@/utils/helpers';

const AdminProducts = () => {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // product object | null
  const [deleting, setDeleting]       = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAllAdmin(),
        categoriesAPI.getAll(),
      ]);
      setProducts(Array.isArray(productsRes.data)    ? productsRes.data    : []);
      const cats = categoriesRes.data.categories || categoriesRes.data;
      setCategories(Array.isArray(cats) ? cats : []);
      
    } catch (error) {
      console.error('Failed to fetch:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Called only from the modal confirm button — no window.confirm needed
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await productsAPI.delete(deleteConfirm.id);
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Uncategorized';
  };

  const statusCounts = {
    all: products.length,
    active: products.filter((p) => p.status === 'active').length,
    inactive: products.filter((p) => p.status !== 'active').length,
  };

  const filteredProducts = products
    .filter((p) => {
      if (statusFilter === 'active') return p.status === 'active';
      if (statusFilter === 'inactive') return p.status !== 'active';
      return true;
    })
    .filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-headline text-white uppercase italic">
            PRODUCT <span className="text-primary-fixed">MANAGEMENT</span>
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            {statusCounts.active} active · {statusCounts.inactive} inactive · {categories.length} categories
          </p>
        </div>
        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-fixed text-on-primary-fixed
                     font-headline font-bold text-sm uppercase tracking-wider rounded-full
                     hover:scale-105 transition-transform shadow-[0_0_12px_#daf90050] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* ── Status filter ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider border transition-colors
              ${statusFilter === key
                ? key === 'inactive'
                  ? 'bg-error/15 border-error/40 text-error'
                  : 'bg-primary-fixed/15 border-primary-fixed/40 text-primary-fixed'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
          >
            {label}
            <span className="ml-1.5 opacity-70">({statusCounts[key]})</span>
          </button>
        ))}
      </div>

      {/* ── Search ─────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container-high border border-white/10 rounded-lg
                     pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary-fixed/50
                     transition-colors placeholder:text-gray-600"
        />
        {searchQuery && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Desktop table / Mobile cards ───────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="bg-surface-container-low border border-white/5 rounded-xl px-6 py-16
                        flex flex-col items-center text-center">
          <AlertTriangle className="w-12 h-12 text-on-surface-variant/40 mb-4" />
          <p className="text-on-surface-variant mb-3">
            {searchQuery
              ? `No products match "${searchQuery}"`
              : statusFilter === 'inactive'
                ? 'No inactive products'
                : statusFilter === 'active'
                  ? 'No active products'
                  : 'No products yet'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link
              to="/admin/products/add"
              className="text-primary-fixed hover:underline text-sm font-headline font-bold"
            >
              Add your first product →
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* ── Desktop table (md+) ── */}
          <div className="hidden md:block bg-surface-container-low border border-white/5
                          overflow-hidden rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-highest/30">
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-headline uppercase tracking-[0.2em]
                                  text-on-surface-variant ${h === 'Actions' ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map(product => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-highest rounded-lg
                                        overflow-hidden flex-shrink-0">
                          {product.image
                            ? <img src={resolveMediaUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-on-surface-variant/40" />
                              </div>
                          }
                        </div>
                        <span className="font-headline font-bold text-sm text-on-surface">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {getCategoryName(product.category_id)}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-sm text-primary-fixed font-bold font-headline">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 text-sm">
                      <span className={product.stock <= 5
                        ? 'text-error font-bold'
                        : product.stock <= 20
                          ? 'text-yellow-400'
                          : 'text-on-surface'
                      }>
                        {product.stock}
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="ml-1 text-[10px]">low</span>
                        )}
                        {product.stock === 0 && (
                          <span className="ml-1 text-[10px]">out</span>
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold font-headline uppercase
                                        rounded-full tracking-wider ${
                        product.status === 'active'
                          ? 'bg-primary-fixed/10 text-primary-fixed'
                          : 'bg-error/10 text-error'
                      }`}>
                        {product.status ?? 'inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 hover:bg-surface-container-highest rounded-lg
                                     text-on-surface-variant hover:text-white transition-colors"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant
                                     hover:text-error transition-colors"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-low border border-white/5 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-surface-container-highest rounded-lg
                                  overflow-hidden flex-shrink-0">
                    {product.image
                      ? <img src={resolveMediaUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-on-surface-variant/40" />
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-on-surface truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {getCategoryName(product.category_id)}
                    </p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-primary-fixed font-bold font-headline text-sm">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>

                      <span className={`text-xs ${
                        product.stock === 0
                          ? 'text-error'
                          : product.stock <= 5
                            ? 'text-yellow-400'
                            : 'text-on-surface-variant'
                      }`}>
                        {product.stock === 0
                          ? 'Out of stock'
                          : `${product.stock} in stock`}
                      </span>

                      <span className={`px-2 py-0.5 text-[10px] font-bold font-headline uppercase
                                        rounded-full tracking-wider ${
                        product.status === 'active'
                          ? 'bg-primary-fixed/10 text-primary-fixed'
                          : 'bg-error/10 text-error'
                      }`}>
                        {product.status ?? 'inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="p-2 hover:bg-surface-container-highest rounded-lg
                                 text-on-surface-variant hover:text-white transition-colors"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(product)}
                      className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant
                                 hover:text-error transition-colors"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ── Delete confirmation modal ───────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50
                       flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.95,    opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface-container-high border border-white/10 rounded-2xl
                         p-6 max-w-sm w-full shadow-2xl"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center
                              justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-error" />
              </div>

              <h3 className="text-lg font-headline font-bold text-white text-center mb-2">
                Delete Product?
              </h3>
              <p className="text-on-surface-variant text-sm text-center mb-6">
                <span className="text-white font-semibold">"{deleteConfirm.name}"</span> will be
                permanently removed. This cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-surface-container-highest text-white
                             font-headline font-bold text-sm uppercase tracking-wider rounded-xl
                             hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-error text-white font-headline font-bold
                             text-sm uppercase tracking-wider rounded-xl hover:bg-error/80
                             transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting
                    ? <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> Deleting…</>
                    : 'Delete'
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminProducts;