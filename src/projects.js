export default class List {
    constructor () {
        this.projects = ['None'];
        this.storage = {};
    }

    addProject(title) {
        let dupe = false;
        this.projects.forEach(project => {
            if (project === title) {
                alert('Choose a different name!');
                dupe = true;
            }
        });
        if (!dupe) this.projects.push(title);
    }
    delProject(title) {
        for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i] === title) this.projects.splice(i, 1);
        }
    }
    addTask(title, description, date, project, important, check, todo) {
        const task = {
            title: title,
            description: description,
            date: date,
            project: project,
            important: important,
            check: check,
            todo: todo,
        };
        this.storage[title] = task;
    }
    delTask(title) {
        delete this.storage[title];
    }
}
