import List from "./project-list";
import getDay from 'date-fns/getDay';
import getMonth from 'date-fns/getMonth';
import getDate from 'date-fns/getDate';
import getYear from 'date-fns/getYear';

// Initialize
const list = new List();
list.addProject('None'); // For tasks with no category

// Initial data
list.addProject('🏫 School');
list.addProject('💼 Work');
list.projects['🏫 School'].addTask('Homework', 'math hw', '5-5-12');
list.projects['🏫 School'].addTask('Science Homework', 'math hw', '6-1-23');
list.projects['💼 Work'].addTask('Email Jenny', 'Ask about reports', '6-1-23');

let currentPage = 'ToDo';
// WORK ON LOADING TASKS SAVE ALL TASKS TO ALLTASK
// SORT THE TASKS BY DATE

const taskUI = {
    alltasks: [],
    display1: [],
    display2: [],

    taskDOM: function() {
        this.tasksList = document.querySelector('#tasks');
    },
    populateAllTasks: function() {
        let i = 0;
        Object.keys(list.projects).forEach(project => {
            Object.keys(list.projects[project]['storage']).forEach(task => {
                this.alltasks[i] = list.projects[project]['storage'][task];
                i++;
            });
        });
        console.log(this.alltasks);
    },
    taskRender: function() {
        this.populateAllTasks();
        this.taskDOM();
    }
}

const dateUI = {
    date: new Date(),
    dateDOM: function() {
        this.dateDisplay = document.querySelector('#date-string');
    },
    dateString: function(date) {
        let day = getDay(date);
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let month = getMonth(date);
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dates = getDate(date);
        const year = getYear(date);
        let n = days[day] + ' ' + months[month] + ' ' + dates + ', ' + year;
        this.dateDisplay.textContent = n;
    },
    dateRender: function() {
        this.dateDOM();
        this.dateString(this.date);
    },
}

const navUI = {
    navDOM: function() {
        this.navProj = document.querySelector('#projects');
    },
    navProject: function() {
        this.navProj.textContent = '';
        Object.keys(list.projects).forEach(project => {
            if (project === 'None') return;
            let button = document.createElement('button');
            button.textContent = project;
            this.navProj.appendChild(button);
        });
    },
    navRender: function() {
        this.navDOM();
        this.navProject();
    },
}

const formUI = {
    formDOM: function() {
        this.projectForm = document.querySelector('#project-form');
        this.projectFormButton = document.querySelector('#add-project');
        this.projectTitle = document.querySelector('#project-title');
        this.overlay = document.querySelector('#overlay');

        this.taskForm = document.querySelector('#task-form');
        this.taskFormButton = document.querySelector('#add-task');
        this.taskSelection = document.querySelector('#category');
        this.taskTitle = document.querySelector('#title');
        this.taskDescription = document.querySelector('#Description');
        this.taskDate = document.querySelector('#date');
    },
    projectSelect: function() {
        this.taskSelection.innerHTML = '';
        let options = '<option value="None">Choose a Project</option>';
        Object.keys(list.projects).forEach(project => {
            if (project === 'None') return;
            options += `<option value="${project}">${project}</option>`;
        });

        this.taskSelection.innerHTML = options;
    },
    formButton: function() {
        this.overlay.addEventListener('click', function() {
            formUI.taskForm.classList.add('hidden');
            formUI.projectForm.classList.add('hidden');
            formUI.overlay.classList.add('hidden');
        });
        
        this.projectForm.addEventListener('submit', function(event) {
            event.preventDefault();
            list.addProject(formUI.projectTitle.value);
            updateProject();
            formUI.projectForm.classList.add('hidden');
            formUI.overlay.classList.add('hidden');
        });
    
        this.projectFormButton.addEventListener('click', () => {
            formUI.projectForm.classList.remove('hidden');
            formUI.overlay.classList.remove('hidden');
        });
    
        this.taskForm.addEventListener('submit', function(event) {
            event.preventDefault();
            formUI.projectForm.classList.add('hidden');
            formUI.overlay.classList.add('hidden');
        });
    
        this.taskFormButton.addEventListener('click', () => {
            formUI.taskForm.classList.remove('hidden');
            formUI.overlay.classList.remove('hidden');
        });
    },
    formRender: function() {
        this.formDOM();
        this.formButton();
        this.projectSelect();
    },
}



export default function renderUI() {
    dateUI.dateRender();
    formUI.formRender();
    navUI.navRender();
    taskUI.taskRender();

    console.log(list);
}