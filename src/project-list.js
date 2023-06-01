import Project from './projects';

let school = new Project('school');
school.addTask('Homework', 'math hw', '5-5-12');
school.addTask('Project', 'english essay', '6-6-12');

export default class List {
    constructor () {
        this.noDate = {};
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