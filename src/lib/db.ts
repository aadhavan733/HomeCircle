import Dexie, { type Table } from 'dexie';

export interface LocalTransaction {
  id: string; // client-generated UUID
  family_id: string;
  amount_paise: number;
  type: string;
  category_id: string | null;
  date: string;
  visibility: string;
  note: string;
  custom_category_name?: string;
  sync_status: 'pending' | 'synced' | 'failed';
  created_at: string;
}

export class HomeCircleDB extends Dexie {
  transactions!: Table<LocalTransaction, string>;

  constructor() {
    super('HomeCircleDB');
    this.version(1).stores({
      transactions: 'id, sync_status, created_at' 
    });
  }
}

export const db = new HomeCircleDB();
