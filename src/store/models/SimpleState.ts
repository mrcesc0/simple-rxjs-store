import { User } from './User';

export interface SimpleState {
  user: User | null;
  isLoading: boolean;
}
