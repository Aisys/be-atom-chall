class Task {
    constructor(title, description, creation, complete) {
      this.title = title;
      this.description = description;
      this.creation = creation;
      this.complete = complete;
      this.id = null;
    }
  }
  
module.exports = Task;
