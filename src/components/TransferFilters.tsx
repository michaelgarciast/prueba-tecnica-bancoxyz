import { TransferFilters as Filters, emptyFilters } from '../utils/filterTransfers';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function TransferFilters({ filters, onChange }: Readonly<Props>) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  return (
    <form
      className="card mb-6 grid gap-4 sm:grid-cols-[repeat(4,1fr)_auto] sm:items-end"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="field">
        <span>Destinatario</span>
        <input className="input" name="name" autoComplete="off" value={filters.name} onChange={set('name')} />
      </label>
      <label className="field">
        <span>Valor mínimo</span>
        <input
          className="input"
          type="number"
          name="minValue"
          autoComplete="off"
          min="0"
          value={filters.minValue}
          onChange={set('minValue')}
        />
      </label>
      <label className="field">
        <span>Valor máximo</span>
        <input
          className="input"
          type="number"
          name="maxValue"
          autoComplete="off"
          min="0"
          value={filters.maxValue}
          onChange={set('maxValue')}
        />
      </label>
      <label className="field">
        <span>Fecha</span>
        <input
          className="input"
          type="date"
          name="date"
          autoComplete="off"
          value={filters.date}
          onChange={set('date')}
        />
      </label>
      <button type="button" className="btn btn-secondary" onClick={() => onChange(emptyFilters)}>
        Limpiar filtros
      </button>
    </form>
  );
}
