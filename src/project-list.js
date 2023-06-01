import Project from './projects';

export default class List {
    constructor () {
        this.projects = {};
    }

    addProject(title) {
        let proj = new Project(title);
        this.projects[title] = proj;
    }
    delProject(title) {
        delete this.projects[title];
    }
}