import List from "./projects";
import format from 'date-fns/format';
import differenceInHours from 'date-fns/differenceInHours';
import addDays from 'date-fns/addDays'
import compareAsc from 'date-fns/compareAsc';
import parseISO from 'date-fns/parseISO'




// Initialize
let list = new List();
const today = new Date();

(function () {
    if (localStorage.list === undefined) {
        // Initial data
        list.addProject('🏫 School');
        list.addProject('💼 Work');
        list.addTask('Homework', 'Math HW section 2-4', addDays(new Date(), -1), '🏫 School', false);
        list.addTask('Science Homework', 'Biology HW posted on canvas', new Date(), '🏫 School', true);
        list.addTask('Email Jenny', 'Ask about reports', addDays(new Date(), 1), '💼 Work', false);
        list.addTask('Excel report', 'Add up expenses', addDays(new Date(), 4), '💼 Work', false);
        list.addTask('Senior Design Project', 'Design freeze report', new Date(), '🏫 School', true);
        list.addTask('Lab Report', 'Heat transfer lab 4', addDays(new Date(), 30), '🏫 School', true);
        console.log(list)
    } else {
        const storedString = localStorage.getItem('list');
        list = JSON.parse(storedString);

        // Parse the dates
        Object.values(list.storage).forEach(task => {
            task.date = parseISO(task.date)
        });
    }
})();

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
        this.alltasks.sort((a, b) => compareAsc(a.date, b.date));
        this.inbox.sort((a, b) => compareAsc(a.date, b.date));

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
        card.addEventListener('click', (event) => {
            if (event.target.className !== 'check' && event.target.className !== 'star' && event.target.className !== 'trash') {
                formUI.projectSelection();
                formUI.cardButton(object);
                formUI.presetVal(object);
            }
        });
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
                object.todo = true;
            } else if (difference > 0) {
                date.textContent = '📅' + format(object['date'], ' MMM d y');
                date.classList.add('late');
            } else if (difference === -1) {
                date.textContent = '📅 Due Tomorrow';
            } else if (difference > -7) {
                date.textContent = '📅 Due in ' + -difference + ' days';
            } else {
                date.textContent = '📅 ' + format(object['date'], ' MMM d y');
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
    taskRender: function() {
        this.taskDOM();
        this.displayDate();
        this.displayTasks(currentPage);
        this.displayTitle(currentPage);
        const listString = JSON.stringify(list);
        localStorage.setItem('list', listString);
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
            const text = document.createElement('span');
            text.textContent = project;
            
            button.appendChild(text);
            this.navProj.appendChild(button);
        });
        this.navDOM();
    },
    navButtonLogic: function() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.buttons.forEach(selection => {
                    selection.classList.remove('selected')
                });

                currentPage = button.textContent;
                button.classList.add('selected');
                taskUI.taskRender();
            })
        });
    },
    navRender: function() {
        this.navDOM();
        this.navProject();
        this.navButtonLogic();
        const listString = JSON.stringify(list);
        localStorage.setItem('list', listString);
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

        this.editForm = document.querySelector('#edit-form');
        this.editDelete = document.querySelector('#delete');
        this.editTaskTitle = document.querySelector('#edit-title');
        this.editTaskSelection = document.querySelector('#edit-category');
        this.editTaskDescription = document.querySelector('#edit-description');
        this.editTaskDate = document.querySelector('#edit-date');
    },
    projectSelection: function() {
        this.taskSelection.innerHTML = '';
        this.editTaskSelection.innerHTML = '';
        let options = '<option value="None">Choose a Project</option>';
        list.projects.forEach(project => {
            if (project === 'None') return;
            options += `<option value="${project}">${project}</option>`;
        });

        this.taskSelection.innerHTML = options;
        this.editTaskSelection.innerHTML = options;
    },
    resetVal: function() {
        this.projectTitle.value = '';
        this.taskSelection.value = 'None';
        this.taskTitle.value = '';
        this.taskDescription.value = '';
        this.taskDate.value = '';
    },
    presetVal: function(object) {
        this.editTaskTitle.value = object.title;
        this.editTaskSelection.value = object.project;
        this.editTaskDescription.value = object.description;
        this.editTaskDate.value = format(object.date, 'yyyy-MM-dd');
    },
    cardButton: function(object) {
        this.editForm.addEventListener('submit', function(event) {
            event.preventDefault();
            object.title = formUI.editTaskTitle.value;
            object.project = formUI.editTaskSelection.value;
            object.description = formUI.editTaskDescription.value;
            object.date = addDays(new Date(formUI.editTaskDate.value), 1);

            taskUI.taskRender();
            formUI.editForm.classList.add('hidden');
            formUI.overlay.classList.add('hidden');
        });

        this.editDelete.addEventListener('click', ()=> {
            list.delTask(object.title);
        });

        this.editForm.classList.remove('hidden');
        this.overlay.classList.remove('hidden');
    },
    formButton: function() {
        this.overlay.addEventListener('click', function() {
            formUI.taskForm.classList.add('hidden');
            formUI.projectForm.classList.add('hidden');
            formUI.editForm.classList.add('hidden');
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
                list.projects.forEach(project => {
                    if (currentPage === project) {
                        formUI.taskSelection.value = project;
                    }
                });
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

    console.log(localStorage.getItem('list'));
}