import { SimpleStateService } from './store';
import { User } from './models/User';

const fakeUser = new User('Francesco', 'De Filippis');
const fakeUser2 = new User('Bad', 'Bunny');

const service = SimpleStateService.getInstance();

const currentUser = service.getUser();
currentUser.subscribe((data) => console.log('####### CURRENT USER:', data));

const currentUserName = service.getUserName();
currentUserName.subscribe((data) =>
  console.log('####### CURRENT USER NAME:', data)
);

const isLoading = service.isLoading();
isLoading.subscribe((data) => console.log('####### IS LOADING:', data));

service.setUser(fakeUser).isLoading(false);
service.reset().setUser(fakeUser2);

// null - true
// Francesco
// false
// null - true
// Bad
