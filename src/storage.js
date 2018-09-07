/*
  Just a helper object for dealing with local storage
*/
export default class FFStorage {
  get(user, key) {
    if (localStorage[user] === undefined) {
      return undefined;
    }

    const userGetObj = JSON.parse(localStorage[user]);
    return userGetObj[key];
  }

  set(user, key, value) {
    let userObj = {};
    if (localStorage[user] !== undefined) {
      userObj = JSON.parse(localStorage[user]);
    }
    userObj[key] = value;
    localStorage[user] = JSON.stringify(userObj);
  }

  getValue(key) {
    return localStorage[key] ? JSON.parse(localStorage[key]) : null;

  }

  setValue(key, value) {
    localStorage[key] = JSON.stringify(value);
  }
}