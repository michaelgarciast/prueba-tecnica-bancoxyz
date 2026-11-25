import { Transfer } from '../api';
import { todayLocal } from './format';

// La API de la prueba no persiste las transferencias creadas: /transferList
// siempre devuelve datos semilla. Guardamos las transferencias locales por
// usuario para que el flujo crear -> listar sea demostrable.
const keyFor = (userId: number) => `transfers:${userId}`;

export const loadLocalTransfers = (userId: number): Transfer[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLocalTransfer = (userId: number, transfer: Transfer) => {
  localStorage.setItem(keyFor(userId), JSON.stringify([...loadLocalTransfers(userId), transfer]));
};

// Total ya descontado del saldo: solo cuentan las transferencias con fecha vencida.
export const spentLocalTransfers = (userId: number) =>
  loadLocalTransfers(userId)
    .filter((t) => t.date.slice(0, 10) <= todayLocal())
    .reduce((sum, t) => sum + t.value, 0);
