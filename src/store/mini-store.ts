import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { tap, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import isFunction from 'lodash/isFunction';

export interface MiniStoreOptions {
  storageKey: string;
  syncOnInit?: boolean;
}

export abstract class MiniStore<S> {
  private readonly _defaultState: S;
  private readonly _options: MiniStoreOptions;
  private readonly _state$: BehaviorSubject<S>;
  private _syncSubscription$: Subscription | null = null;

  protected constructor(defaultState: S, options: MiniStoreOptions) {
    this._defaultState = defaultState;
    this._options = Object.assign({}, { syncOnInit: true }, options);
    this._state$ = new BehaviorSubject<S>(this.getDefaultState());

    if (this._options.syncOnInit === true) {
      this.syncToLocalStorage();
    }
  }

  private getDefaultState() {
    try {
      const data = window.localStorage.getItem(this._options.storageKey);
      return data ? (JSON.parse(data) as S) : this._defaultState;
    } catch (e) {
      console.error('Unable to get state from local storage due to:', e);
      return this._defaultState;
    }
  }

  private writeToLocalStorage(state: S) {
    try {
      window.localStorage.setItem(
        this._options.storageKey,
        JSON.stringify(state)
      );
    } catch (e) {
      console.error('Unable to sync state due to:', e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected set(key: keyof S, value: any) {
    const currentState = this._state$.getValue();
    const currentValue = currentState[key];
    const newValue = isFunction(value)
      ? value(this._state$, currentValue)
      : value;

    this._state$.next({
      ...currentState,
      [key]: newValue,
    });
  }

  protected get<T>(
    project: (value: S, index: number) => T,
    compare?: (x: T, y: T) => boolean
  ): Observable<T> {
    return this._state$.pipe(map(project), distinctUntilChanged(compare));
  }

  syncToLocalStorage() {
    if (this._syncSubscription$) {
      console.warn('Already synced with local storage!');
      return;
    }

    this._syncSubscription$ = this._state$
      .pipe(tap((state) => this.writeToLocalStorage(state)))
      .subscribe();
  }

  unsyncFromLocalStorage() {
    if (!this._syncSubscription$) {
      console.warn('Already unsynced from local storage');
      return;
    }

    this._syncSubscription$.unsubscribe();
    this._syncSubscription$ = null;
  }

  reset() {
    this._state$.next(this._defaultState);
    return this;
  }
}
