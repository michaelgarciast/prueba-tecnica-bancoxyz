import { Transfer } from '../api';

export interface TransferFilters {
  name: string;
  minValue: string;
  maxValue: string;
  date: string;
}

export const emptyFilters: TransferFilters = { name: '', minValue: '', maxValue: '', date: '' };

export const filterTransfers = (list: Transfer[], f: TransferFilters) => {
  const name = f.name.trim().toLowerCase();
  return list.filter(
    (t) =>
      (!name || t.payeer.name.toLowerCase().includes(name)) &&
      (f.minValue === '' || t.value >= Number(f.minValue)) &&
      (f.maxValue === '' || t.value <= Number(f.maxValue)) &&
      (!f.date || t.date.slice(0, 10) === f.date),
  );
};
