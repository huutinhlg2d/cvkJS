import { singleton } from 'tsyringe';

@singleton()
export class Database {
  database: string;

  constructor() {
    console.log('I am database');
    this.database = 'connected';
  }

  query() {
    return this.database;
  }
}
