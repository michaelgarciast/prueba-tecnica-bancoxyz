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
      <label className="field">
        Destinatario
        <input name="name" autoComplete="off" value={filters.name} onChange={set('name')} />
      </label>
      <label className="field">
        Valor mínimo
        <input
          type="number"
          name="minValue"
          autoComplete="off"
          min="0"
          value={filters.minValue}
          onChange={set('minValue')}
        />
      </label>
      <label className="field">
        Valor máximo
        <input
          type="number"
          name="maxValue"
          autoComplete="off"
          min="0"
          value={filters.maxValue}
          onChange={set('maxValue')}
        />
      </label>
      <label className="field">
        Fecha
        <input type="date" name="date" autoComplete="off" value={filters.date} onChange={set('date')} />
      </label>
      <button type="button" className="btn-secondary" onClick={() => onChange(emptyFilters)}>
        Limpiar filtros
      </button>
    </form>
  );
}
