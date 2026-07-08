/** Format schedule time from API (e.g. "13:00:00" → "13:00"). */
export const formatScheduleTime = (time) => {
  if (!time) return '';
  return String(time).slice(0, 5);
};

/** Monday (YYYY-MM-DD) of the week containing `date`. */
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return getWeekStart(new Date());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

/** Add `deltaWeeks` to a week_start Monday string. */
export const shiftWeekStart = (weekStart, deltaWeeks) => {
  const d = new Date(`${weekStart}T12:00:00`);
  d.setDate(d.getDate() + deltaWeeks * 7);
  return getWeekStart(d);
};

export const isCurrentWeek = (weekStart) => weekStart === getWeekStart();

/** e.g. "Jun 2 – Jun 8, 2026" */
export const formatWeekRange = (weekStart) => {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  const y = start.getFullYear() !== end.getFullYear() ? `, ${end.getFullYear()}` : `, ${start.getFullYear()}`;
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
};

/** Convert Monday date to value for &lt;input type="week" /&gt;. */
export const dateToWeekInputValue = (weekStart) => {
  const d = new Date(`${weekStart}T12:00:00`);
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 3);
  const year = thursday.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil((((thursday - jan1) / 86400000) + jan1.getDay() + 1) / 7);
  const isoWeek = String(week).padStart(2, '0');
  return `${year}-W${isoWeek}`;
};

/** Parse &lt;input type="week" /&gt; value to Monday YYYY-MM-DD. */
export const weekInputValueToWeekStart = (value) => {
  if (!value || !value.includes('-W')) return getWeekStart();
  const [yearStr, weekStr] = value.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  const jan4 = new Date(year, 0, 4);
  const day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - day + 1 + (week - 1) * 7);
  return monday.toISOString().slice(0, 10);
};

/** Human-readable class time range; handles bad DB values like end at 00:00. */
export const formatScheduleTimeRange = (start, end) => {
  const s = formatScheduleTime(start);
  const e = formatScheduleTime(end);
  if (!s) return '—';
  if (!e || e === '00:00' || (s && e <= s)) {
    return `${s} (end time not set)`;
  }
  return `${s} – ${e}`;
};

/** Resolve product/avatar URLs (external links or Laravel /storage paths). */
export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/storage')) {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const origin = apiBase.replace(/\/api\/?$/, '') || '';
    return origin ? `${origin}${url}` : url;
  }
  return url;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Format datetime
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

// Slugify
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Calculate duration in minutes
export const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.floor((end - start) / 60000); // milliseconds to minutes
};

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return errors;
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
};

// Debounce function
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Class names helper
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
