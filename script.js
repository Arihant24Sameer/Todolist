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

  // Function to add a new task
  function addTask() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title !== "" && description !== "") {
      const newTask = { title, description, starred: false };
      addTaskToCollection(COLLECTION_NAME, newTask)
        .then((docRef) => {
          newTask.key = docRef.id;
          tasks.push(newTask);
          renderTasks();

          // Clear input fields
          titleInput.value = "";
          descriptionInput.value = "";
        })
        .catch((error) => {
          console.error("Error adding task: ", error);
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

      updateTaskInCollection(COLLECTION_NAME, task.key, updatedTask)
        .then(() => {
          task.title = newTitle;
          task.description = newDescription;

          renderTasks();
          closeEditModal();
        })
        .catch((error) => {
          console.error("Error updating task: ", error);
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
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <div>
        <span class="star-icon ${
          task.starred ? "checked" : ""
        }" data-index="${index}">
          <i class="fas fa-star"></i>
        </span>
        <button class="edit-button" data-index="${index}">Edit</button>
        <button class="delete-button" data-key="${task.key}">Delete</button>
      </div>
    `;
      todoList.appendChild(li);

      // Add event listener to star icon
      const starIcon = li.querySelector(".star-icon");
      starIcon.addEventListener("click", () => {
        toggleStar(index);
      });

      // Add event listener to edit button
      const editButton = li.querySelector(".edit-button");
      editButton.addEventListener("click", () => {
        openEditModal(index);
      });

      // Add event listener to delete button
      const deleteButton = li.querySelector(".delete-button");
      deleteButton.addEventListener("click", () => {
        const key = deleteButton.dataset.key;
        deleteTaskItem(key);
      });
    });
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
  // Event listener for the add button
  addButton.addEventListener("click", addTask);

  // Event listener for the close button in the edit modal
  document.querySelector(".close").addEventListener("click", closeEditModal);

  // Event listener for the save button in the edit modal
  saveButton.addEventListener("click", saveEditedTask);

  // Render the tasks on page load
  renderTasks();
});
