import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
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
    this._state$ = new BehaviorSubject<S>(this.getInitialState());

    if (this._options.syncOnInit === true) {
      this.syncToLocalStorage();
    }
  }

  /**
   * Get the state from local storage or the default if nothing was found
   */
  private getInitialState() {
    try {
      const data = window.localStorage.getItem(this._options.storageKey);
      return data ? (JSON.parse(data) as S) : this._defaultState;
    } catch (error) {
      console.error(
        '[Local Storage][getDefaultState] Unable to get state from local storage due to:',
        error
      );
      return this._defaultState;
    }
  }

  /**
   * Write the new state to the local storage.
   * If any error occurs it will be logged in the console.
   * @param state The store state
   */
  private writeToLocalStorage(state: S) {
    try {
      window.localStorage.setItem(
        this._options.storageKey,
        JSON.stringify(state)
      );
    } catch (error) {
      console.error(
        '[Local Storage][writeToLocalStorage] Unable to sync state due to:',
        error
      );
    }
  }

  /**
   * Set a value for the given key.
   * @description A function can be passed as value to let you lazy compute the new value
   * @param key The key
   * @param value The new value for the given key
   */
  protected set<K extends keyof S>(key: K, value: S[K]) {
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

  /**
   * Get the value returning from the map function
   * @param project The function to apply to each value emitted by the source Observable.
   * @param compare Optional comparison function called to test if an item is distinct from the previous item in the source.
   */
  protected get<T>(
    project: (value: S, index: number) => T,
    compare?: (x: T, y: T) => boolean
  ): Observable<T> {
    return this._state$.pipe(map(project), distinctUntilChanged(compare));
  }

  /**
   * Get the value of the given key (Only first level properties)
   * @param key The property to pluck from each source value (an object).
   * @param compare Optional comparison function called to test if an item is distinct from the previous item in the source.
   */
  protected getByKey<K extends keyof S>(
    key: K,
    compare?: (x: S[K], y: S[K]) => boolean
  ) {
    return this._state$.pipe(pluck(key), distinctUntilChanged(compare));
  }

  /**
   * Automatically sync data to local storage.
   * @description It subscribes to the behavior subject and write the emitted value to the local storage.
   */
  syncToLocalStorage() {
    if (this._syncSubscription$ !== null) {
      console.warn(
        '[Local Storage][syncToLocalStorage] Already synced with local storage!'
      );
      return this;
    }

    this._syncSubscription$ = this._state$.subscribe((state) =>
      this.writeToLocalStorage(state)
    );

    return this;
  }

  /**
   * Stop syncing data to local storage
   * @description The data is no more written to the local storage but the mini store keeps working like a charm
   */
  unsyncFromLocalStorage() {
    if (this._syncSubscription$ === null) {
      console.warn(
        '[Local Storage][unsyncFromLocalStorage] Already unsynced from local storage!'
      );
      return this;
    }

    this._syncSubscription$.unsubscribe();
    this._syncSubscription$ = null;

    return this;
  }

  /**
   * Reset to the default state
   */
  reset() {
    this._state$.next(this._defaultState);

    return this;
  }
}
