import { MiniStore } from './mini-store';
import { User, UserRaw } from './models/User';
import { map } from 'rxjs/operators';

interface State {
  user: UserRaw | null;
  isLoading: boolean;
}

const DEFAULT_STATE: State = {
  user: null,
  isLoading: true,
};

const OPTIONS = { storageKey: 'userstore/v0' };

export class UserStore extends MiniStore<State> {
  constructor() {
    super(DEFAULT_STATE, OPTIONS);
  }

  getUser() {
    return this.get<State['user']>('user').pipe(
      map((raw) => (raw ? new User(raw) : null))
    );
  }

  getUserName() {
    return this.get<string>('user', 'name');
  }

  setUser(user: User): UserStore {
    this.set('user', () => user.getRaw());
    return this;
  }

  isLoading(value?: boolean) {
    if (value !== undefined) {
      this.set('isLoading', value);
    }
    return this.get<boolean>('isLoading');
  }
}
