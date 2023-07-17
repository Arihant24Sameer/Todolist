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
  const taskModal = document.getElementById("exampleModal"); // Get modal elements
  const editModal = document.getElementById("editModal");
  const closeTaskModalButton = document.querySelector(
    "#exampleModal .btn-close"
  );
  const editTitleInput = document.getElementById("edit-title-input");
  const editDescriptionInput = document.getElementById(
    "edit-description-input"
  );
  const loaderContainer = document.querySelector(".loader-container");
  const saveButton = document.getElementById("save-button");
  loaderContainer.style.display = "none";
  const importantTasksContainer = document.getElementById("important-tasks");

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
    try {
      const loaderContainer = document.querySelector(".loader-container");
      loaderContainer.style.display = "flex";

      await deleteTask(COLLECTION_NAME, key);
      tasks = tasks.filter((task) => task.key !== key);

      renderTasks();

      // Hide the loader after a short delay (to make sure the task deletion is complete)
      setTimeout(() => {
        loaderContainer.style.display = "none";
      }, 1000);
    } catch (error) {
      console.error("Error deleting task: ", error);
      // Hide the loader in case of an error
      document.querySelector(".loader-container").style.display = "none";
    }
  }

  // Function to toggle the star status of a task
  function toggleStar(index) {
    const task = tasks[index];
    const newStarStatus = !task.starred;
    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      position: index,
    }));

    // Show the loader
    loaderContainer.style.display = "flex";

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
        // Hide the loader
        loaderContainer.style.display = "none";
      })

      .catch((error) => {
        console.error("Error updating task in the database: ", error);

        // Hide the loader in case of an error
        loaderContainer.style.display = "none";
      });
  }

  // Function to handle card click event
  function handleCardClick(index, target) {
    if (target.classList.contains("fa-star")) {
      // Clicked on the star icon, toggle the star status
      toggleStar(index);
    } else {
      // Clicked on the card body, open the editing modal
      openEditModal(index);
    }
  }
  // Function to render the tasks in the todo list
  function renderTasks() {
    const importantTasksContainer = document.getElementById("important-tasks");
    const regularTasksContainer = document.getElementById("regular-tasks");

    // Clear the containers
    importantTasksContainer.innerHTML = "";
    regularTasksContainer.innerHTML = "";

    let hasImportantTasks = false; // Track if there are any important tasks

    tasks.forEach((task, index) => {
      const cardContainer = document.createElement("div");
      cardContainer.className = "col";

      const card = document.createElement("div");
      card.className = "card";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";
      cardBody.id = `card-body-${index}`; // Add an ID to the card body

      cardContainer.addEventListener("click", (event) => {
        handleCardClick(index, event);
      });

      const title = document.createElement("h5");
      title.className = "card-title";
      title.textContent = truncateLongText(task.title, 20); // Truncate the title

      const description = document.createElement("p");
      description.className = "card-text";
      description.textContent = truncateLongText(task.description, 50); // Truncate the description

      const iconContainer = document.createElement("div");
      iconContainer.className = "icon-container";

      const deleteIcon = document.createElement("i");
      deleteIcon.className = "fas fa-trash delete-icon";
      deleteIcon.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent event bubbling
        deleteTaskItem(task.key);
      });

      const editIcon = document.createElement("i");
      editIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        openEditModal(index);
      });

      const starIcon = document.createElement("i");
      starIcon.className = `fas fa-star star-icon ${
        task.starred ? "checked" : ""
      }`;
      starIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleStar(index);
      });

      cardBody.appendChild(title);
      cardBody.appendChild(description);
      cardBody.appendChild(iconContainer);
      card.appendChild(cardBody);
      iconContainer.appendChild(deleteIcon);
      iconContainer.appendChild(editIcon);
      iconContainer.appendChild(starIcon);
      cardContainer.appendChild(card);

      // Determine the container based on the starred status of the task
      if (task.starred) {
        hasImportantTasks = true;
        importantTasksContainer.appendChild(cardContainer);
      } else {
        regularTasksContainer.appendChild(cardContainer);
      }
    });
  }

  // Function to handle card click event
  function handleCardClick(index, target) {
    if (target.classList.contains("fa-star")) {
      // Clicked on the star icon, toggle the star status
      toggleStar(index);
    } else if (!target.classList.contains("editing")) {
      // Clicked on the card body, open the editing modal (if not currently being edited)
      openEditModal(index);
    }
  }

  // Function to truncate long text and add "..." at the end
  function truncateLongText(text, maxLength) {
    if (text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  }

  // Function to open the card for editing
  function openCardForEditing(index) {
    const card = document.getElementById(`card-${index}`);
    card.classList.add("editing");
  }

  // Function to close the card after editing
  function closeCardAfterEditing(index) {
    const card = document.getElementById(`card-${index}`);
    card.classList.remove("editing");
  }

  document
    .querySelector("#exampleModal .modal-footer .btn-secondary")
    .addEventListener("click", closeEditModal);

  // Function to open the edit modal
  function openEditModal(index) {
    const task = tasks[index];
    editTitleInput.value = task.title;
    editDescriptionInput.value = task.description;
    saveButton.dataset.index = index;
    document.getElementById("exampleModal").classList.add("show");
    document.getElementById("exampleModal").style.display = "block";
  }

  // Function to truncate long text and add "..." at the end
  function truncateLongText(text, maxLength) {
    if (text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  }
  // Event listener for the add button click
  addButton.addEventListener("click", addTask);

  // Render the tasks on page load
  renderTasks();

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
    saveButton.dataset.index = index;
    document.getElementById("exampleModal").classList.add("show");
    document.getElementById("exampleModal").style.display = "block";
  }

  // Function to close the edit modal
  function closeEditModal() {
    // Clear the inputs in the edit modal
    editTitleInput.value = "";
    editDescriptionInput.value = "";

    // Hide the edit modal
    document.getElementById("exampleModal").classList.remove("show");
    document.getElementById("exampleModal").style.display = "none";
  }
  function handleCardClick(index) {
    openEditModal(index);
  }

  // Event listener for the close button in the edit modal click
  document
    .querySelector("#exampleModal .btn-close")
    .addEventListener("click", closeEditModal);

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
  document
    .querySelector("#exampleModal .btn-close")
    .addEventListener("click", closeEditModal);

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
