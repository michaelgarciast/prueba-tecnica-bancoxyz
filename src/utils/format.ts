export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(value);
