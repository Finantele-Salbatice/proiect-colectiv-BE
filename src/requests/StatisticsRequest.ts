import { AuthRequest } from './AuthRequest';

export interface StatisticsRequest extends AuthRequest {
  body: StatisticsRequestFilter;
}

export interface StatisticsRequestFilter {
  lastDays: number;
}