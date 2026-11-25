import { Transfer } from '../api';

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
