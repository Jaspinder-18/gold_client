export const formatPrice = (price, decimals = null) => {
  if (price === undefined || price === null || isNaN(price)) return '$0.00';
  const num = Number(price);
  const dec = decimals !== null ? decimals : (num % 1 !== 0 && (num.toString().split('.')[1]?.length > 2) ? 3 : 2);
  return '$' + num.toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
};

export const formatNumber = (num, decimals = 2) => {
  if (num === undefined || num === null || isNaN(num)) return '0.00';
  return Number(num).toFixed(decimals);
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '--:--:--';
  const d = new Date(dateStr);
  return d.toTimeString().split(' ')[0];
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  const dateFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeFormatted = d.toTimeString().split(' ')[0];
  return `${dateFormatted} · ${timeFormatted}`;
};

export const getLevelColor = (level) => {
  switch (level) {
    case 'R3':
      return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-black', hex: '#facc15' };
    case 'R2':
      return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-black', hex: '#facc15' };
    case 'S2':
      return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-black', hex: '#facc15' };
    case 'S3':
      return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-black', hex: '#facc15' };
    default:
      return { text: 'text-slate-300', bg: 'bg-slate-800', border: 'border-slate-700', badge: 'bg-slate-700 text-white', hex: '#94a3b8' };
  }
};
