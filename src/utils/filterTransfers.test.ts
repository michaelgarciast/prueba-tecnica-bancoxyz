import { Transfer } from '../api';
import { emptyFilters, filterTransfers } from './filterTransfers';

const make = (name: string, value: number, date: string): Transfer => ({
  value,
  date,
  currency: 'COP',
  payeer: { document: '1', name },
});

const list = [
  make('Ana Pérez', 100, '2025-01-10'),
  make('Luis Gómez', 500, '2025-02-20'),
  make('anabel Ruiz', 900, '2025-02-20'),
];

test('returns everything with empty filters', () => {
  expect(filterTransfers(list, emptyFilters)).toHaveLength(3);
});

test('filters by name, case-insensitive and partial', () => {
  const result = filterTransfers(list, { ...emptyFilters, name: 'ANA' });
  expect(result.map((t) => t.payeer.name)).toEqual(['Ana Pérez', 'anabel Ruiz']);
});

test('filters by value range', () => {
  expect(filterTransfers(list, { ...emptyFilters, minValue: '200', maxValue: '600' })).toEqual([list[1]]);
  expect(filterTransfers(list, { ...emptyFilters, minValue: '500' })).toHaveLength(2);
  expect(filterTransfers(list, { ...emptyFilters, maxValue: '100' })).toEqual([list[0]]);
});

test('filters by exact date', () => {
  expect(filterTransfers(list, { ...emptyFilters, date: '2025-02-20' })).toEqual([list[1], list[2]]);
});

test('combines filters', () => {
  const result = filterTransfers(list, { ...emptyFilters, name: 'ana', date: '2025-02-20' });
  expect(result).toEqual([list[2]]);
});
