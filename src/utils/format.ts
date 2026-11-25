export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(value);

export const todayLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDate = (date: string) => {
  const [y, m, d] = date.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};
