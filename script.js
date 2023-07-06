import { COLLECTION_NAME } from "./constants.js";
import {
  initializeConnection,
  getDataFromCollection,
  deleteTask,
} from "./index.js";

document.addEventListener("DOMContentLoaded", async () => {
  initializeConnection();

  let tasks = await getDataFromCollection(COLLECTION_NAME);
  console.log("Response Data : ", tasks);

  // Get HTML elements
  const titleInput = document.getElementById("title-input");
  const descriptionInput = document.getElementById("description-input");
  const addButton = document.getElementById("add-button");
  const todoList = document.getElementById("todo-list");

  // Get modal elements
  const editModal = document.getElementById("editModal");
  const editTitleInput = document.getElementById("edit-title-input");
  const editDescriptionInput = document.getElementById(
    "edit-description-input"
  );
  const saveButton = document.getElementById("save-button");

  // Function to render the tasks in the todo list
  function renderTasks() {
    todoList.innerHTML = "";

    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
               <h3>${task.title}</h3>
               <p>${task.description}</p>
               <div>
                   <span class="star-icon ${
                     task.starred ? "checked" : ""
                   }" data-index="${index}">
                       <i class="fas fa-star"></i>
                   </span>
                   <button class="edit-button" data-index="${index}">Edit</button>
                   <button class="delete-button" data-index="${index}">Delete</button>
               </div>
           `;
      todoList.appendChild(li);
    });
  }

  // Function to add a new task
  function addTask() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title !== "" && description !== "") {
      const newTask = { title, description, starred: false };
      tasks.push(newTask);

      renderTasks();

      // Clear input fields
      titleInput.value = "";
      descriptionInput.value = "";
    }
  }

  async function deleteTaskItem(key) {

    deleteTask(COLLECTION_NAME, key);
  }
  // Function to toggle the star status of a task
  function toggleStar(index) {
    const task = tasks[index];
    task.starred = !task.starred;

    // Move the task to the top or bottom based on star status
    if (task.starred) {
      tasks.splice(index, 1);
      tasks.unshift(task);
    } else {
      tasks.splice(index, 1);
      tasks.push(task);
    }

    // Save tasks to local storage
    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTasks();
  }

  // Function to render the tasks in the todo list
  function renderTasks() {
    todoList.innerHTML = "";

    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <div>
        <span class="star-icon ${
          task.starred ? "checked" : ""
        }" data-index="${index}">
          <i class="fas fa-star"></i>
        </span>
        <button class="edit-button" data-index="${index}">Edit</button>
        <button class="delete-button" data-index="${index}" value="${
        task.key
      }">Delete</button>
      </div>
    `;
      todoList.appendChild(li);

      // Add event listener to star icon
      const starIcon = li.querySelector(".star-icon");
      starIcon.addEventListener("click", () => {
        toggleStar(index);
      });
    });
  }

  // Function to open the edit modal
  function openEditModal(index) {
    const task = tasks[index];
    editTitleInput.value = task.title;
    editDescriptionInput.value = task.description;

    editModal.style.display = "block";

    // Save the index of the task being edited
    saveButton.dataset.index = index;
  }

  // Function to close the edit modal
  function closeEditModal() {
    editModal.style.display = "none";
  }

  // Function to save the edited task
  function saveEditedTask() {
    const index = saveButton.dataset.index;
    const task = tasks[index];

    const newTitle = editTitleInput.value.trim();
    const newDescription = editDescriptionInput.value.trim();

    if (newTitle !== "" && newDescription !== "") {
      task.title = newTitle;
      task.description = newDescription;

      // Save tasks to local storage
      localStorage.setItem("tasks", JSON.stringify(tasks));

      renderTasks();
      closeEditModal();
    }
  }

  // Event listener for the add button
  addButton.addEventListener("click", addTask);

  // Event listener for the delete and edit buttons
  todoList.addEventListener("click", (event) => {
    const target = event.target;
    const key = target.value;
    console.log("key : ", key);

    if (target.classList.contains("delete-button")) {
      deleteTaskItem(key);
    }

    // if (target.classList.contains("delete-button")) {
    //   const index = target.dataset.index;
    //   console.log("index ::: ", index);
    //   // deleteTask(index);
    //   deleteTaskItem();
    // } else if (target.classList.contains("edit-button")) {
    //   const index = target.dataset.index;
    //   openEditModal(index);
    // } else if (target.classList.contains("star-icon")) {
    //   const index = target.dataset.index;
    //   toggleStar(index);
    // }
  });

  // Event listener for the close button in the edit modal
  document.querySelector(".close").addEventListener("click", closeEditModal);

  // Event listener for the save button in the edit modal
  saveButton.addEventListener("click", saveEditedTask);

  // Get the theme toggle icon element
  const themeIcon = document.getElementById("theme-icon");

  // Check if the user has a preferred theme stored in local storage
  const preferredTheme = localStorage.getItem("theme");

  // Set the initial theme based on the user's preference or default to light theme
  document.body.classList.add(preferredTheme || "light-theme");

  // Set the theme icon based on the current theme
  themeIcon.classList.add(
    preferredTheme === "dark-theme" ? "fa-moon" : "fa-sun"
  );

  themeIcon.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    titleInput.classList.toggle("dark-theme");
    descriptionInput.classList.toggle("dark-theme");
    renderTasks();
  });

  // Function to get the theme class based on the current theme
  function getThemeClass() {
    return document.body.classList.contains("dark-theme") ? "dark-theme" : "";
  }
  // Render the tasks on page load
  renderTasks();
});
