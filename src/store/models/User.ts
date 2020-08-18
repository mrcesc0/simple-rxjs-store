export interface UserRaw {
  name: string;
  surname: string;
}

export class User {
  public name: string;
  public surname: string;

  constructor(data: UserRaw) {
    this.name = data.name;
    this.surname = data.surname;
  }

  getFullName() {
    return `${this.name} ${this.surname}`;
  }

  getRaw(): UserRaw {
    return {
      name: this.name,
      surname: this.surname,
    };
  }
}
