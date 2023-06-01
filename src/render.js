import List from "./project-list";
const navProj = document.querySelector('#projects');
const overlay = document.querySelector('#overlay');

// FORM
const projectForm = document.querySelector('#project-form');
const projectTitle = document.querySelector('#project-title'); 

const taskForm = document.querySelector('#task-form');

const projectFormButton = document.querySelector('#add-project');

const list = new List();

// Initial data
list.addProject('🏫 School');
list.addProject('💼 Work');
list.projects['🏫 School'].addTask('Homework', 'math hw', '5-5-12');
console.log(list);


function renderNav() {
    navProj.textContent = '';
    Object.keys(list.projects).forEach(project => {
        let button = document.createElement('button');
        button.textContent = project;
        navProj.appendChild(button);
    })
    console.log();
}
function appendListeners() {
    overlay.addEventListener('click', function() {
        taskForm.classList.add('hidden');
        projectForm.classList.add('hidden');
        overlay.classList.add('hidden');
    })
    projectForm.addEventListener('submit', function(event) {
        event.preventDefault();
        list.addProject(projectTitle.value)
        renderNav();
        projectForm.classList.add('hidden');
        overlay.classList.add('hidden');
    });
    projectFormButton.addEventListener('click', () => {
        projectForm.classList.remove('hidden');
        overlay.classList.remove('hidden');
    });
}

export default function renderUI() {
    renderNav();
    appendListeners();
}