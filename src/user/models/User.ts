
export interface User {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  salt?: string;
  password?: string;
  active?: number;
  created_at?: Date;
}

export interface TokenResponse{
  token: string;
}