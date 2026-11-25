import { TransferFilters as Filters, emptyFilters } from '../utils/filterTransfers';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function TransferFilters({ filters, onChange }: Props) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  return (
    <form className="card filters" onSubmit={(e) => e.preventDefault()}>
      <label>
        Destinatario
        <input value={filters.name} onChange={set('name')} />
      </label>
      <label>
        Valor mínimo
        <input type="number" value={filters.minValue} onChange={set('minValue')} />
      </label>
      <label>
        Valor máximo
        <input type="number" value={filters.maxValue} onChange={set('maxValue')} />
      </label>
      <label>
        Fecha
        <input type="date" value={filters.date} onChange={set('date')} />
      </label>
      <button type="button" onClick={() => onChange(emptyFilters)}>
        Limpiar filtros
      </button>
    </form>
  );
}
