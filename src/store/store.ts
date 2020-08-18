import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { pluck, tap, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import isEqual from 'lodash/isEqual';

import { SimpleState } from './models/SimpleState';
import { STATE_KEY } from './constants';
import { DEFAULT_SIMPLE_STATE } from './default-state';
import { User } from './models/User';
import window from './window';

export class SimpleStateService {
  private static instance: SimpleStateService;
  private state$ = new BehaviorSubject<SimpleState>(
    this.getDefaultSimpleState()
  );

  private constructor() {
    this.syncToLocalStorage();
  }

  static getInstance() {
    if (!SimpleStateService.instance) {
      SimpleStateService.instance = new SimpleStateService();
    }
    return SimpleStateService.instance;
  }

  private getDefaultSimpleState() {
    try {
      const data = window.localStorage.getItem(STATE_KEY);
      return data ? JSON.parse(data) : DEFAULT_SIMPLE_STATE;
    } catch (e) {
      console.error(
        '### ERROR: unable to get state from local storage due to:',
        e
      );
    }
  }

  private writeToLocalStorage(state: SimpleState) {
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('### ERROR: unable to sync state due to:', e);
    }
  }

  private syncToLocalStorage() {
    this.state$.pipe(tap(this.writeToLocalStorage)).subscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private set(key: keyof SimpleState, value: any) {
    const currentState = this.state$.getValue();
    const currentValue = currentState[key];

    if (isEqual(currentValue, value) === false) {
      this.state$.next({
        ...this.state$.getValue(),
        [key]: value,
      });
    }
  }

  private get<T>(...keys: Array<string>): Observable<T | undefined> {
    return this.state$.pipe(
      pluck<SimpleState, T>(...keys),
      distinctUntilChanged()
    );
  }

  reset(): SimpleStateService {
    this.state$.next(DEFAULT_SIMPLE_STATE);
    return this;
  }

  getUser() {
    return this.get<SimpleState['user']>('user');
  }

  getUserName() {
    return this.get<string>('user', 'name');
  }

  setUser(user: User): SimpleStateService {
    this.set('user', user);
    return this;
  }

  isLoading(value?: boolean) {
    if (value !== undefined) {
      this.set('isLoading', value);
    }
    return this.get<boolean>('isLoading');
  }
}
