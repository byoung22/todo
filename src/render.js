import List from "./projects";
import format from 'date-fns/format';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInHours from 'date-fns/differenceInHours'
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import compareDesc from 'date-fns/compareDesc';



// Initialize
const list = new List();
const today = new Date();

// Initial data
list.addProject('🏫 School');
list.addProject('💼 Work');
list.addTask('Homework', 'math hw', new Date('2012-05-12'), '🏫 School', false);
list.addTask('Science Homework', 'math hw', new Date(), '🏫 School', true);
list.addTask('Email Jenny', 'Ask about reports', new Date('2021-01-23'), '💼 Work', false);

let currentPage = 'inbox';

const taskUI = {
    alltasks: [],
    inbox: [],

    taskDOM: function() {
        this.dateDisplay = document.querySelector('#date-string');
        this.tasksList = document.querySelector('#tasks');
        this.inboxList = document.querySelector('#inboxs');
    },
    displayDate: function() {
        this.dateDisplay.textContent = format((new Date()), 'iiii MMMM d, y');
    },
    displayTasks: function(page) {
        this.alltasks = [];
        this.inbox = [];
        this.tasksList.textContent = '';
        this.inboxList.textContent = '';
        
        // Update tasks to display and display the tasks
        if (page === 'todo') {
            Object.values(list.storage).forEach(task => {
                if (task['todo'])this.alltasks.push(task);
            });
            this.alltasks.sort((a, b) => compareDesc(a.date, b.date));
        }

        if (page === 'inbox') {
            Object.values(list.storage).forEach(task => {
                if (task['todo']) {
                    this.alltasks.push(task);
                } else {
                    // The rest of tasks that are not planned to do
                    this.inbox.push(task);
                }
            });
            this.alltasks.sort((a, b) => compareDesc(a.date, b.date));

            this.inbox.forEach(object => {
                this.createCard(object, this.inboxList);
            });
        }

        list.projects.forEach(project => {
            if (page === project) {
                Object.values(list.storage).forEach(task => {
                    if (task['project'] === project)this.alltasks.push(task);
                });
                this.alltasks.sort((a, b) => compareDesc(a.date, b.date));
            }
        });

        this.alltasks.forEach(object => {
            this.createCard(object, this.tasksList);
        });

    },
    createCard: function(object, parent) {
        const card = document.createElement('div');
        card.classList.add('card');
        parent.appendChild(card);

        const check = document.createElement('input'); 
        check.setAttribute('type', 'checkbox');
        check.classList.add('check');
        card.appendChild(check);

        const title = document.createElement('p');
        title.textContent = object['title'];
        title.classList.add('title');
        card.appendChild(title);

        const info = document.createElement('div');
        info.classList.add('info');
        card.appendChild(info);

        const project = document.createElement('p');
        if (object['project'] !== 'None') {
            project.textContent = object['project'];
            project.classList.add('project');
            info.appendChild(project);
        } 
        // If date is within a week, display in words
        if (object['date']) {
            const date = document.createElement('p');
            const result = Math.floor(differenceInHours(today, object['date'])/24)|0;
            if (result === 0) {
                date.textContent = '📅 Due Today';
            } else if (result === -1) {
                date.textContent = '📅 Due Tomorrow';
            } else if (result < 7) {
                date.textContent = '📅' + formatDistanceStrict(today, object['date'], {unit: 'day', roundingMethod: 'floor'});
            } else {
                date.textContent = '📅' + format(object['date'], 'MMM d y')
            }
            date.classList.add('date');
            info.appendChild(date);
        }

        const star = document.createElement('input'); 
        star.setAttribute('type', 'checkbox');
        star.classList.add('star');
        card.appendChild(star);
    },
    taskRender: function() {
        this.taskDOM();
        this.displayDate();
        this.displayTasks(currentPage);
    }
}

const navUI = {
    navDOM: function() {
        this.navProj = document.querySelector('#projects');
    },
    navProject: function() {
        this.navProj.textContent = '';
        list.projects.forEach(project => {
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
    formButtonClass: '',
    formDOM: function() {
        this.projectForm = document.querySelector('#project-form');
        this.projectFormButton = document.querySelector('#add-project');
        this.projectTitle = document.querySelector('#project-title');
        this.overlay = document.querySelector('#overlay');

        this.taskForm = document.querySelector('#task-form');
        this.taskFormButton = document.querySelectorAll('#add-task');
        this.taskSelection = document.querySelector('#category');
        this.taskTitle = document.querySelector('#title');
        this.taskDescription = document.querySelector('#description');
        this.taskDate = document.querySelector('#date');
    },
    projectSelection: function() {
        this.taskSelection.innerHTML = '';
        let options = '<option value="None">Choose a Project</option>';
        list.projects.forEach(project => {
            if (project === 'None') return;
            options += `<option value="${project}">${project}</option>`;
        });

        this.taskSelection.innerHTML = options;
    },
    resetVal: function() {
        this.projectTitle.value = '';
        this.taskSelection.value = 'None';
        this.taskTitle.value = '';
        this.taskDescription.value = '';
        this.taskDate.value = '';
    },
    formButton: function() {
        this.overlay.addEventListener('click', function() {
            formUI.taskForm.classList.add('hidden');
            formUI.projectForm.classList.add('hidden');
            formUI.overlay.classList.add('hidden');
            formUI.resetVal();
        });
        
        this.projectForm.addEventListener('submit', function(event) {
            event.preventDefault();
            list.addProject(formUI.projectTitle.value);

            formUI.projectForm.classList.add('hidden');
            formUI.overlay.classList.add('hidden');
            navUI.navRender();
            formUI.projectSelection();
            formUI.resetVal();
        });
    
        this.taskForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Check if it belongs in the todo list
            let todo = false;
            if (formUI.taskDescription.value) {
                let taskDate = format(new Date(formUI.taskDate.value.split('-')), 'MMM d y');
                let todayDate = format(today, 'MMM d y');
                if (taskDate === todayDate) todo = true;   
            }
            if (formUI.formButtonClass === 'todo') todo = true;

            // Check if it has a date
            let date;

            if (formUI.taskDate.value === '') {
                date = false;
            } else {
                date = new Date(formUI.taskDate.value.split('-'))
            }
            list.addTask(
                formUI.taskTitle.value,
                formUI.taskDescription.value,
                date,
                formUI.taskSelection.value,
                todo,
            )

            formUI.taskForm.classList.add('hidden');
            formUI.overlay.classList.add('hidden');
            taskUI.taskRender();
            formUI.resetVal();
        });

        this.projectFormButton.addEventListener('click', () => {
            formUI.projectForm.classList.remove('hidden');
            formUI.overlay.classList.remove('hidden');
        });
    
        this.taskFormButton.forEach(button => {
            button.addEventListener('click', () => {
                this.formButtonClass = button.className;
                formUI.taskForm.classList.remove('hidden');
                formUI.overlay.classList.remove('hidden');
            });
        })
    },
    formRender: function() {
        this.formDOM();
        this.formButton();
        this.projectSelection();
    },
}



export default function renderUI() {
    formUI.formRender();
    navUI.navRender();
    taskUI.taskRender();

    console.log(list);
}