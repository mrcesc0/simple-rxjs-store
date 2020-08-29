const jsdom = require('jsdom');
import { User } from './models/User';
import { UserStore } from './user-store';

const { JSDOM } = jsdom;
global['window'] = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`, {
  url: 'https://localhost/',
  referrer: 'https://localhost',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 5000000,
}).window;

const store = new UserStore();

const fakeUser = new User({ name: 'Francesco', surname: 'De Filippis' });
const fakeUser2 = new User({ name: 'Bad', surname: 'Bunny' });

const currentUser = store.getUser();
currentUser.subscribe((user) => {
  console.log('####### CURRENT USER:', user);
  console.log('####### FULL NAME:', user?.getFullName());
});

const isLoading = store.isLoading();
isLoading.subscribe((loading) => console.log('####### IS LOADING:', loading));

store.setUser(fakeUser).isLoading(false);
store.reset().setUser(fakeUser2);

store.unsyncFromLocalStorage();

store.setUser(fakeUser);

console.log(
  '####################',
  window.localStorage.getItem('userstore/v0')
);

store.syncToLocalStorage();

console.log(
  '####################',
  window.localStorage.getItem('userstore/v0')
);

// null - true
// Francesco
// false
// null - true
// Bad
