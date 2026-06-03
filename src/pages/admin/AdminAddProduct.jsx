import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '@/services/api';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Handles BOTH /admin/products/add  and  /admin/products/edit/:id
const AdminAddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();           // present only on edit route
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    category_id: '', name: '', description: '',
    price: '', stock: '', image: '', status: 'active',
  });

  // Load categories + (if edit) existing product data
  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await categoriesAPI.getAll();
        const cats = catRes.data.categories || catRes.data;
        setCategories(Array.isArray(cats) ? cats : []);

        if (isEdit) {
          const prodRes = await productsAPI.getOne(id);
          const p = prodRes.data;
          setFormData({
            category_id: p.category_id || '',
            name:        p.name        || '',
            description: p.description || '',
            price:       p.price       || '',
            stock:       p.stock       || '',
            image:       p.image       || '',
            status:      p.status      || 'active',
          });
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data.' });
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        ...formData,
        price:       parseFloat(formData.price),
        stock:       parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
      };

      if (isEdit) {
        await productsAPI.update(id, payload);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await productsAPI.create(payload);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }

      setTimeout(() => navigate('/admin/products'), 1800);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '', required = false) => (
    <div>
      <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type={type}
        value={formData[key]}
        onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                   focus:outline-none focus:border-primary-fixed/50 transition-colors"
      />
    </div>
  );

  if (fetching) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-fixed" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic">
            {isEdit ? 'EDIT' : 'ADD'} <span className="text-primary-fixed">PRODUCT</span>
          </h1>
          <p className="text-gray-400 mt-0.5 text-sm">
            {isEdit ? 'Update product details.' : 'Create a new inventory item.'}
          </p>
        </div>
      </div>

      {/* Alert */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-headline
            ${message.type === 'success'
              ? 'bg-primary-fixed/10 border-primary-fixed/30 text-primary-fixed'
              : 'bg-error/10 border-error/30 text-error'
            }`}
        >
          {message.type === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />
          }
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6 space-y-5">
          <h3 className="font-headline font-black uppercase tracking-wider text-sm text-gray-300">Basic Information</h3>

          {field('Product Name', 'name', 'text', 'e.g. XENON PRE-WORKOUT', true)}

          <div>
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">
              Category <span className="text-error">*</span>
            </label>
            <select
              value={formData.category_id}
              onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:border-primary-fixed/50 transition-colors"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Product description and specifications..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:border-primary-fixed/50 transition-colors resize-none"
            />
          </div>

          {field('Image URL', 'image', 'url', 'https://...')}
        </div>

        {/* Pricing & stock */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="font-headline font-black uppercase tracking-wider text-sm text-gray-300">Pricing</h3>
            <div>
              <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">Price (USD) <span className="text-error">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number" step="0.01" min="0"
                  value={formData.price}
                  onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-primary-fixed/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="font-headline font-black uppercase tracking-wider text-sm text-gray-300">Inventory</h3>
            {field('Stock Quantity', 'stock', 'number', '100', true)}
          </div>
        </div>

        {/* Status */}
        <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6">
          <h3 className="font-headline font-black uppercase tracking-wider text-sm text-gray-300 mb-4">Status</h3>
          <div className="flex gap-4">
            {['active', 'inactive'].map(s => (
              <label key={s} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio" name="status" value={s}
                  checked={formData.status === s}
                  onChange={() => setFormData(f => ({ ...f, status: s }))}
                  className="accent-primary-fixed w-4 h-4"
                />
                <span className={`text-sm font-headline font-bold uppercase ${formData.status === s ? 'text-white' : 'text-gray-500'}`}>
                  {s}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl font-headline font-black uppercase text-sm hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-primary-fixed text-black rounded-xl font-headline font-black uppercase text-sm
                       hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2
                       shadow-[0_0_20px_rgba(218,249,0,0.2)]"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
              : <><CheckCircle className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Create Product'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;