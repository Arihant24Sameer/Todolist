import { COLLECTION_NAME } from "./constants.js";
import {
  initializeConnection,
  getDataFromCollection,
  deleteTask,
  addTaskToCollection,
  updateTaskInCollection,
} from "./index.js";

document.addEventListener("DOMContentLoaded", async () => {
  initializeConnection();

  let tasks = await getDataFromCollection(COLLECTION_NAME);
  console.log("Response Data : ", tasks);

  // Get HTML elements
  const titleInput = document.getElementById("titleInput");
  const descriptionInput = document.getElementById("descriptionInput");
  const addButton = document.getElementById("add-button");
  const todoList = document.getElementById("todo-list");
  const taskModal = document.getElementById("taskModal"); // Get modal elements
  const editModal = document.getElementById("editModal");
  const closeTaskModalButton = document.querySelector("#taskModal .close");
  const editTitleInput = document.getElementById("edit-title-input");
  const editDescriptionInput = document.getElementById(
    "edit-description-input"
  );
  const loaderContainer = document.querySelector(".loader-container");
  const saveButton = document.getElementById("save-button");
  loaderContainer.style.display = "none";

  // Function to add a new task
  function addTask() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title !== "" && description !== "") {
      const newTask = { title, description, starred: false };

      // Show the loader
      loaderContainer.style.display = "flex";

      addTaskToCollection(COLLECTION_NAME, newTask)
        .then((docRef) => {
          newTask.key = docRef.id;
          tasks.push(newTask);
          renderTasks();

          // Clear input fields
          titleInput.value = "";
          descriptionInput.value = "";

          // Hide the loader
          loaderContainer.style.display = "none";
        })
        .catch((error) => {
          console.error("Error adding task: ", error);
          // Hide the loader in case of an error
          loaderContainer.style.display = "none";
        });
    }
  }

  // Function to save the edited task
  function saveEditedTask() {
    const index = saveButton.dataset.index;
    const task = tasks[index];

    const newTitle = editTitleInput.value.trim();
    const newDescription = editDescriptionInput.value.trim();

    if (newTitle !== "" && newDescription !== "") {
      const updatedTask = {
        ...task,
        title: newTitle,
        description: newDescription,
      };

      // Show the loader
      loaderContainer.style.display = "flex";

      updateTaskInCollection(COLLECTION_NAME, task.key, updatedTask)
        .then(() => {
          task.title = newTitle;
          task.description = newDescription;

          renderTasks();
          closeEditModal();

          // Hide the loader
          loaderContainer.style.display = "none";
        })
        .catch((error) => {
          console.error("Error updating task: ", error);
          // Hide the loader in case of an error
          loaderContainer.style.display = "none";
        });
    }
  }

  // Function to delete a task
  async function deleteTaskItem(key) {
    await deleteTask(COLLECTION_NAME, key);
    tasks = tasks.filter((task) => task.key !== key);

    renderTasks();
  }

  // Function to toggle the star status of a task
  function toggleStar(index) {
    const task = tasks[index];
    const newStarStatus = !task.starred;
    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      position: index,
    }));

    // Update the task locally
    task.starred = newStarStatus;

    // Remove the task from the current position
    tasks.splice(index, 1);

    if (task.starred) {
      // Move the task to the top
      tasks.unshift(task);
    } else {
      // Move the task to the bottom
      tasks.push(task);
    }

    // Update the task in the database
    updateTaskInCollection(COLLECTION_NAME, task.key, task, updatedTasks, {
      starred: newStarStatus,
    })
      .then(() => {
        console.log("Task updated successfully in the database");
        renderTasks(); // Update the page dynamically
      })
      .catch((error) => {
        console.error("Error updating task in the database: ", error);
      });
  }

  // Function to render the tasks in the todo list
  function renderTasks() {
    // Clear the todoList
    todoList.innerHTML = "";

    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <h3 class="task-title">${truncateLongWord(task.title)}</h3>
        <p class="task-description">${truncateLongWord(task.description)}</p>
        <div>
          <span class="star-icon ${
            task.starred ? "checked" : ""
          }" data-index="${index}">
            <i class="fas fa-star"></i>
          </span>
          <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-index="${index}" data-bs-target="#exampleModal">Edit</button>
          <button class="btn btn-danger" data-key="${task.key}">Delete</button>
        </div>
      `;
      todoList.appendChild(li);

      // Add event listener to star icon
      const starIcon = li.querySelector(".star-icon");
      starIcon.addEventListener("click", () => {
        toggleStar(index);
      });

      // Add event listener to edit button
      const editButton = li.querySelector(".btn.btn-primary");
      if (editButton) {
        editButton.addEventListener("click", () => {
          openEditModal(index);
        });
      }

      // Add event listener to delete button
      const deleteButton = li.querySelector(".btn.btn-danger");
      if (deleteButton) {
        deleteButton.addEventListener("click", () => {
          const key = deleteButton.dataset.key;
          deleteTaskItem(key);
        });
      }

      // Add event listener to task title
      const taskTitle = li.querySelector(".task-title");
      taskTitle.addEventListener("click", () => {
        openTaskDetailModal(index);
      });

      // Add event listener to task description
      const taskDescription = li.querySelector(".task-description");
      taskDescription.addEventListener("click", () => {
        openTaskDetailModal(index);
      });
    });
  }

  function truncateLongWord(word, maxLength = 10) {
    if (word.length > maxLength) {
      return `${word.slice(0, maxLength)}...`;
    }
    return word;
  }

  function openTaskDetailModal(index) {
    const task = tasks[index];
    const taskModalTitle = document.getElementById("task-modal-title");
    const taskModalDescription = document.getElementById(
      "task-modal-description"
    );

    taskModalTitle.textContent = task.title;
    taskModalDescription.textContent = task.description;

    openModal();
  }

  function openTaskModal() {
    taskModal.style.display = "block";
  }

  // Function to close the task modal
  function closeTaskModal() {
    taskModal.style.display = "none";
  }

  // Add event listener to the close button in the task modal
  closeTaskModalButton.addEventListener("click", closeTaskModal);

  // Add event listener to close the task modal when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === taskModal) {
      closeTaskModal();
    }
  });

  // Function to open the task detail modal
  function openTaskDetailModal(index) {
    const task = tasks[index];
    const taskModalTitle = document.getElementById("task-modal-title");
    const taskModalDescription = document.getElementById(
      "task-modal-description"
    );

    taskModalTitle.textContent = task.title;
    taskModalDescription.textContent = task.description;

    openTaskModal();
  }

  // Function to open the edit modal
  function openEditModal(index) {
    const task = tasks[index];
    editTitleInput.value = task.title;
    editDescriptionInput.value = task.description;

    // Save the index of the task being edited
    saveButton.dataset.index = index;

    // Show the edit modal
    editModal.style.display = "block";
  }

  // Function to close the edit modal
  function closeEditModal() {
    // Clear the inputs in the edit modal
    editTitleInput.value = "";
    editDescriptionInput.value = "";

    // Hide the edit modal
    editModal.style.display = "none";
  }

  // Function to open the task modal
  function openTaskModal(title, description) {
    const taskModalTitle = document.getElementById("task-modal-title");
    const taskModalDescription = document.getElementById(
      "task-modal-description"
    );

    taskModalTitle.textContent = title;
    taskModalDescription.textContent = description;
    taskModal.style.display = "block";
  }

  // Function to open the task detail modal
  function openTaskDetailModal(index) {
    const task = tasks[index];
    openTaskModal(task.title, task.description);
  }

  // Function to handle keydown event on input fields
  function handleInputKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (event.target === titleInput || event.target === descriptionInput) {
        addTask();
      } else if (
        event.target === editTitleInput ||
        event.target === editDescriptionInput
      ) {
        saveEditedTask();
      }
    }
  }

  // Event listener for the add button click
  addButton.addEventListener("click", addTask);

  // Event listener for the close button in the edit modal click
  document.querySelector(".close").addEventListener("click", closeEditModal);

  // Event listener for the save button in the edit modal click
  saveButton.addEventListener("click", saveEditedTask);

  // Event listener for keydown event on input fields
  titleInput.addEventListener("keydown", handleInputKeydown);
  descriptionInput.addEventListener("keydown", handleInputKeydown);
  editTitleInput.addEventListener("keydown", handleInputKeydown);
  editDescriptionInput.addEventListener("keydown", handleInputKeydown);

  // Render the tasks on page load
  renderTasks();
});

// Get the theme toggle element
const themeToggle = document.querySelector(".theme-toggle");

// Function to toggle the theme
function toggleTheme() {
  // Toggle the 'dark-theme' class on the body element
  document.body.classList.toggle("dark-theme");

  // Store the theme preference in local storage
  const isDarkMode = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

// Add click event listener to the theme toggle
themeToggle.addEventListener("click", toggleTheme);

// Check if the user's preference is set to dark mode
const prefersDarkMode = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

// Retrieve the theme preference from local storage
const savedTheme = localStorage.getItem("theme");

// Apply the dark theme if the user's preference is set to dark mode or if the saved theme preference is dark
if (prefersDarkMode || savedTheme === "dark") {
  toggleTheme();
}
