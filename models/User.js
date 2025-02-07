class User {
    constructor(names, lastNames, email, password) {
      this.names = names;
      this.lastNames = lastNames;
      this.email = email;
      this.password = password;
      this.id = null; // El ID se asignará posteriormente
    }
  }
  
module.exports = User;