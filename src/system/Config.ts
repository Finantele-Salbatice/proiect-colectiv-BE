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
  BT_FORM_URL: string;
  BT_CLIENT_ID: string;
  BT_CLIENT_SECRET: string;
  BT_CONSENT_ID: string;
  BT_TOKEN_URL: string;
  BT_ACCOUNTS_URL: string;
}