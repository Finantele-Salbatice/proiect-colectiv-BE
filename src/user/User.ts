


export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  salt: string;
  passowrd: string;
  active: number;
  created_at?: Date;
}