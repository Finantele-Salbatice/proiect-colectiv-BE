export interface IConfig {
  DB_CLIENT: string;
  DB_PORT: number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_TIMEZONE: string;
  DB_CONNECTION_LIMIT: number;
  DB_CONNECTION_TIMEOUT: number;
  DB_ACQUIRE_TIMEOUT: number;
  DB_MULTIPLE_STATEMENTS: boolean;
  SECRET_KEY: string;
  UI_HOST: string;
  EMAIL_PASSWORD: string;
}