export interface User {
  [key: string]: unknown;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BalanceResponse {
  currency: string;
  accountBalance: number;
}

export interface TransferRequest {
  value: number;
  currency: string;
  payeerDocument: string;
  transferDate: string;
}

export interface TransferResponse {
  status: 'success' | 'error';
  message?: string;
}

export interface Transfer {
  value: number;
  date: string;
  currency: string;
  payeer: { document: string; name: string };
}

export interface TransferListResponse {
  message: string;
  transfers: Transfer[];
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const URLS = {
  login: 'https://qf5k9fspl0.execute-api.us-east-1.amazonaws.com/default/login',
  balance: 'https://2k0ic4z7s5.execute-api.us-east-1.amazonaws.com/default/balance',
  transfer: 'https://ofqx4zxgcf.execute-api.us-east-1.amazonaws.com/default/transfer',
  transferList: 'https://n0qaa2fx3c.execute-api.us-east-1.amazonaws.com/default/transferList',
};

let token: string | null = null;
let onUnauthorized: () => void = () => {};

export const setToken = (value: string | null) => {
  token = value;
};

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data.message ?? 'Error de red');
  }
  return data as T;
}

const post = <T>(url: string, body: unknown) =>
  request<T>(url, { method: 'POST', body: JSON.stringify(body) });

export const login = (email: string, password: string) =>
  post<LoginResponse>(URLS.login, { email, password });

export const getBalance = () => request<BalanceResponse>(URLS.balance);

export const createTransfer = (transfer: TransferRequest) =>
  post<TransferResponse>(URLS.transfer, transfer);

export const getTransfers = () => request<TransferListResponse>(URLS.transferList);
