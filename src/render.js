import List from "./projects";
import format from 'date-fns/format';
import differenceInHours from 'date-fns/differenceInHours';
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

let currentPage = 'To Do';

const taskUI = {
    alltasks: [],
    inbox: [],

    taskDOM: function() {
        this.dateDisplay = document.querySelector('#date-string');
        this.tasksList = document.querySelector('#tasks');
        this.inboxList = document.querySelector('#inboxs');
        this.inboxTitle = document.querySelector('#inbox');
        this.taskTitle = document.querySelector('#task-title');
    },
    displayDate: function() {
        this.dateDisplay.textContent = format((new Date()), 'iiii MMMM d, y');
    },
    displayTitle: function(page) {
        if (page === 'Inbox') {
            this.inboxTitle.classList.remove('hidden');
            this.taskTitle.textContent = 'To Do';
        } else {
            this.inboxTitle.classList.add('hidden');
            this.taskTitle.textContent = page;
        }
    },
    displayTasks: function(page) {
        this.alltasks = [];
        this.inbox = [];
        
        this.tasksList.textContent = '';
        this.inboxList.textContent = '';
        
        // If page is on To Do or Inbox
        if (page === 'To Do' || page === 'Inbox') {
            Object.values(list.storage).forEach(task => {
                if (task['todo'])this.alltasks.push(task);
                if (page === 'Inbox') {
                    if (!task['todo'])this.inbox.push(task);
                }
            });
        } else {
            // Else page is on a project
            Object.values(list.storage).forEach(task => {
                if (task['project'] === page)this.alltasks.push(task);
            });
        }

        // Sort tasks by date
        this.alltasks.sort((a, b) => compareDesc(a.date, b.date));
        this.inbox.sort((a, b) => compareDesc(a.date, b.date));

        // Populate the UI with the alltasks and inbox values
        this.inbox.forEach(object => {
            this.createCard(object, this.inboxList);
        });
        this.alltasks.forEach(object => {
            this.createCard(object, this.tasksList);
        });
    },
    createCard: function(object, parent) {
        const card = document.createElement('div');
        const check = document.createElement('input'); 
        const title = document.createElement('p');
        const info = document.createElement('div');
        const project = document.createElement('p');
        const star = document.createElement('input');
        const trash = document.createElement('button');

        card.classList.add('card');
        parent.appendChild(card);

        
        check.setAttribute('type', 'checkbox');
        check.classList.add('check');
        check.addEventListener('click', ()=> {
            object['check'] = check.checked;
            if (check.checked) {
                star.classList.add('hidden');
                trash.classList.remove('hidden');
            } else {
                star.classList.remove('hidden');
                trash.classList.add('hidden');
            }
        });
        card.appendChild(check);

        title.textContent = object['title'];
        title.classList.add('title');
        card.appendChild(title);

        info.classList.add('info');
        card.appendChild(info);

        if (object['project'] !== 'None') {
            project.textContent = object['project'];
            project.classList.add('project');
            info.appendChild(project);
        } 
        // If date is within a week, display in words
        if (object['date']) {
            const date = document.createElement('p');
            const difference = Math.floor(differenceInHours(today, object['date'])/24)|0;
            if (difference === 0) {
                date.textContent = '📅 Due Today';
            } else if (difference > 0) {
                date.textContent = '📅' + format(object['date'], 'MMM d y');
                date.classList.add('late');
            } else if (difference === -1) {
                date.textContent = '📅 Due Tomorrow';
            } else if (difference > -7) {
                date.textContent = '📅 Due in ' + -difference + ' days';
            } else {
                date.textContent = '📅' + format(object['date'], 'MMM d y');
            }
            date.classList.add('date');
            info.appendChild(date);
        }
        
        star.setAttribute('type', 'checkbox');
        star.classList.add('star');
        star.addEventListener('click', ()=> {
            object['important'] = star.checked;
        });
        card.appendChild(star);

        trash.classList.add('trash');
        trash.classList.add('hidden');
        trash.addEventListener('click', () => {
            list.delTask(object.title);
            this.taskRender();
        });
        card.appendChild(trash);
        
        // If checked hide star and show trash
        if (object['checked']) {
            star.classList.add('hidden');
            trash.classList.remove('hidden');
        }
    },
    cardEvents: function() {

    },
    taskRender: function() {
        this.taskDOM();
        this.displayDate();
        this.displayTasks(currentPage);
        this.displayTitle(currentPage);
        this.taskDOM();
    }
}

const navUI = {
    navDOM: function() {
        this.navProj = document.querySelector('#projects');
        this.inbox = document.querySelector('inbox');
        this.buttons = document.querySelectorAll('#nav-button');
    },
    navProject: function() {
        this.navProj.textContent = '';
        list.projects.forEach(project => {
            if (project === 'None') return;
            const button = document.createElement('button');
            button.setAttribute('id', 'nav-button');
            button.textContent = project;
            this.navProj.appendChild(button);
        });
        this.navDOM();
    },
    navButtonLogic: function() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                currentPage = button.textContent;
                taskUI.taskRender();
            })
        });
    },
    navRender: function() {
        this.navDOM();
        this.navProject();
        this.navButtonLogic();
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