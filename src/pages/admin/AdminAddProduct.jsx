import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '@/services/api';
import { CheckCircle, AlertCircle, ArrowLeft, Link2, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Select from '@/components/common/Select';
import { resolveMediaUrl } from '@/utils/helpers';

const MAX_IMAGE_MB = 5;

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageMode, setImageMode] = useState('url');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    category_id: '', name: '', description: '',
    price: '', stock: '', image: '', status: 'active',
  });

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await categoriesAPI.getAll();
        const cats = catRes.data.categories || catRes.data;
        setCategories(Array.isArray(cats) ? cats : []);

        if (isEdit) {
          const prodRes = await productsAPI.getOne(id);
          const p = prodRes.data;
          const image = p.image || '';
          setFormData({
            category_id: p.category_id || '',
            name:        p.name        || '',
            description: p.description || '',
            price:       p.price       || '',
            stock:       p.stock       || '',
            image,
            status:      p.status      || 'active',
          });
          if (image) {
            setImagePreview(resolveMediaUrl(image));
            setImageMode(image.includes('/storage/') ? 'upload' : 'url');
          }
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load data.' });
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, isEdit]);

  const setPreviewFromFile = (file) => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImageSelection = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    setFormData((f) => ({ ...f, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchImageMode = (mode) => {
    setImageMode(mode);
    clearImageSelection();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file (JPG, PNG, WebP, or GIF).' });
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setMessage({ type: 'error', text: `Image must be ${MAX_IMAGE_MB}MB or smaller.` });
      return;
    }

    setMessage({ type: '', text: '' });
    setImageFile(file);
    setFormData((f) => ({ ...f, image: '' }));
    setPreviewFromFile(file);
  };

  const buildPayload = () => {
    const base = {
      category_id: parseInt(formData.category_id, 10),
      name: formData.name,
      description: formData.description || '',
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      status: formData.status,
    };

    if (imageMode === 'upload' && imageFile) {
      const fd = new FormData();
      Object.entries(base).forEach(([key, val]) => {
        if (val !== undefined && val !== null) fd.append(key, String(val));
      });
      fd.append('image', imageFile);
      return fd;
    }

    if (imageMode === 'url' && formData.image.trim()) {
      base.image = formData.image.trim();
    }

    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (imageMode === 'url' && formData.image.trim() && !/^https?:\/\//i.test(formData.image.trim())) {
      setMessage({ type: 'error', text: 'Image URL must start with http:// or https://' });
      setLoading(false);
      return;
    }

    try {
      const payload = buildPayload();

      if (isEdit) {
        await productsAPI.update(id, payload);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await productsAPI.create(payload);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }

      setTimeout(() => navigate('/admin/products'), 1800);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors && Object.values(errors).flat()[0];
      setMessage({
        type: 'error',
        text: firstError || err.response?.data?.message || 'Save failed. Please try again.',
      });
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

  const previewSrc = imagePreview || (imageMode === 'url' && formData.image ? resolveMediaUrl(formData.image) : '');

  if (fetching) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-fixed" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
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
        <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6 space-y-5">
          <h3 className="font-headline font-black uppercase tracking-wider text-sm text-gray-300">Basic Information</h3>

          {field('Product Name', 'name', 'text', 'e.g. XENON PRE-WORKOUT', true)}

          <div>
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">
              Category <span className="text-error">*</span>
            </label>
            <Select
              value={formData.category_id}
              onChange={(category_id) => setFormData((f) => ({ ...f, category_id }))}
              placeholder="Select Category"
              options={[
                { value: '', label: 'Select Category' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
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

          <div>
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-3">
              Product Image
            </label>
            <p className="text-xs text-gray-500 mb-3">Choose one: upload from your computer or paste an image link.</p>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => switchImageMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-headline font-bold uppercase tracking-wider transition-colors
                  ${imageMode === 'upload'
                    ? 'bg-primary-fixed/15 border-primary-fixed/40 text-primary-fixed'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
              >
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
              <button
                type="button"
                onClick={() => switchImageMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-headline font-bold uppercase tracking-wider transition-colors
                  ${imageMode === 'url'
                    ? 'bg-primary-fixed/15 border-primary-fixed/40 text-primary-fixed'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
              >
                <Link2 className="w-4 h-4" /> Image URL
              </button>
            </div>

            {imageMode === 'upload' ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg
                             file:border-0 file:bg-primary-fixed file:text-black file:font-headline file:font-bold
                             file:text-xs file:uppercase hover:file:opacity-90 cursor-pointer"
                />
                <p className="text-xs text-gray-600">JPG, PNG, WebP, or GIF — max {MAX_IMAGE_MB}MB</p>
              </div>
            ) : (
              <input
                type="url"
                value={formData.image}
                onChange={(e) => {
                  setFormData((f) => ({ ...f, image: e.target.value }));
                  setImageFile(null);
                  if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                  setImagePreview('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                placeholder="https://example.com/product.jpg"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:border-primary-fixed/50 transition-colors"
              />
            )}

            {previewSrc && (
              <div className="mt-4 relative inline-block">
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-white/10"
                />
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="absolute -top-2 -right-2 p-1 bg-error rounded-full text-white hover:opacity-90"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

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
