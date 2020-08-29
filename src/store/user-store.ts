import { MiniStore, MiniStoreOptions } from './mini-store';
import { User, UserRaw } from './models/User';

interface State {
  user: UserRaw | null;
  lastPosition: Geolocation | null;
  isLoading: boolean;
}

const DEFAULT_STATE: State = {
  user: null,
  lastPosition: null,
  isLoading: true,
};

const OPTIONS: MiniStoreOptions = { storageKey: 'userstore/v0' };

export class UserStore extends MiniStore<State> {
  constructor() {
    super(DEFAULT_STATE, OPTIONS);
  }

  getUser() {
    return this.get<User | null>((state: State) =>
      state.user ? new User(state.user) : null
    );
  }

  setUser(user: User): UserStore {
    this.set('user', () => user.getRaw());
    return this;
  }

  isLoading(value?: boolean) {
    if (value !== undefined) {
      this.set('isLoading', value);
    }
    return this.get<boolean>((state) => state.isLoading);
  }
}
