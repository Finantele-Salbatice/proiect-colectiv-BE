
export interface Token {
    id?: number;
    user_id?: number;
    token?: string;
    active?: number;
    type?: TokenType;
    creatsed_at?: Date;
  }

  
export enum TokenType{
      reset = 'reset'
  }
  
 