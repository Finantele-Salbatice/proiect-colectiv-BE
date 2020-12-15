
export interface IBCROauthResponse {
    transactions_count: string;
    clientId: string;
    // accounts_1: string;
    // accounts_0: string;
    [key: string]: any;
    token_type: string;
    access_token: string;
    transactionScope: string;
    refresh_token: string;
    accounts_count: string;
    balances_count: string;
    // balances_0: string;
    // balances_1: string;
    scope: string;
    consents: string;
    // transactions_0: string;
    // transactions_1: string;
    expires_in: number;
  }