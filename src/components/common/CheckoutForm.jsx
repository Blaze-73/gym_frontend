const inputClass =
  'w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none';

const CheckoutForm = ({ form, onChange, errors = {} }) => {
  const set = (field) => (e) => onChange({ ...form, [field]: e.target.value });

  return (
    <div className="space-y-3" autoComplete="off">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Your information</p>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Full name *</label>
        <input
          name="checkout_customer_name"
          autoComplete="off"
          className={inputClass}
          value={form.customer_name}
          onChange={set('customer_name')}
          placeholder="Full name"
          required
        />
        {errors.customer_name && <p className="text-xs text-error mt-1">{errors.customer_name}</p>}
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Email *</label>
        <input
          type="email"
          name="checkout_customer_email"
          autoComplete="off"
          className={inputClass}
          value={form.customer_email}
          onChange={set('customer_email')}
          placeholder="Email address"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Phone *</label>
        <input
          name="checkout_customer_phone"
          autoComplete="off"
          className={inputClass}
          value={form.customer_phone}
          onChange={set('customer_phone')}
          placeholder="Phone number"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Address (street, city) *</label>
        <textarea
          rows={2}
          name="checkout_customer_address"
          autoComplete="off"
          placeholder="Street, city, postal code"
          className={inputClass}
          value={form.customer_address}
          onChange={set('customer_address')}
          required
        />
      </div>
    </div>
  );
};

export default CheckoutForm;

export const emptyCheckoutForm = () => ({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  customer_address: '',
});
