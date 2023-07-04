const title = document.getElementById("title");
const description = document.getElementById("description");
const form = document.querySelector("form");
const container = document.querySelector(".container");

let tasks = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];

showAllTasks();

function showAllTasks() {
  container.innerHTML = ""; // Clear the container

  tasks.forEach((value, index) => {
    const div = document.createElement("div");
    div.setAttribute("class", "task");

    const innerDiv = document.createElement("div");
    div.append(innerDiv);

    const starIcon = document.createElement("i");
    starIcon.setAttribute("class", "fas fa-star");
    starIcon.addEventListener("click", () => {
      moveTaskToTop(index);
    });
    div.prepend(starIcon);

    const p = document.createElement("p");
    p.innerText = value.title;
    innerDiv.append(p);

    const span = document.createElement("span");
    span.innerText = value.description;
    innerDiv.append(span);

    const editBtn = document.createElement("button");
    editBtn.setAttribute("class", "editBtn");
    editBtn.innerText = "Edit";
    editBtn.addEventListener("click", () => {
      openEditModal(index);
    });
    div.append(editBtn);

    const btn = document.createElement("button");
    btn.setAttribute("class", "deleteBtn");
    btn.innerText = "x";
    btn.addEventListener("click", () => {
      removeTask(index);
    });

    div.append(btn);
    container.append(div);
  });
}

function moveTaskToTop(index) {
  const selectedTask = tasks[index];
  tasks.splice(index, 1);
  tasks.unshift(selectedTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();

  const starIcons = document.querySelectorAll(".fa-star");
  starIcons.forEach((starIcon, i) => {
    if (i === 0) {
      starIcon.classList.add("star-selected");
    } else {
      starIcon.classList.remove("star-selected");
    }
  });
}

// ...

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editForm = document.getElementById("editForm");
  const index = editForm.getAttribute("data-index");

  tasks[index].title = editTitle.value;
  tasks[index].description = editDescription.value;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();

  closeEditModal();

  const starIcons = document.querySelectorAll(".fa-star");
  starIcons.forEach((starIcon, i) => {
    if (i === 0) {
      starIcon.classList.add("star-selected");
    } else {
      starIcon.classList.remove("star-selected");
    }
  });
});

function removeTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  tasks.push({
    title: title.value,
    description: description.value,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();

  title.value = "";
  description.value = "";
});

function openEditModal(index) {
  const editModal = document.getElementById("editModal");
  const editForm = document.getElementById("editForm");
  const editTitle = document.getElementById("editTitle");
  const editDescription = document.getElementById("editDescription");

  const task = tasks[index];
  editTitle.value = task.title;
  editDescription.value = task.description;

  // Save the index as a custom data attribute on the form
  editForm.setAttribute("data-index", index);

  // Show the modal
  editModal.style.display = "block";
}

function closeEditModal() {
  const editModal = document.getElementById("editModal");
  editModal.style.display = "none";
}

// Add a close button event listener to close the modal
const closeBtn = document.querySelector(".close");
closeBtn.addEventListener("click", closeEditModal);
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    title: title.value,
    description: description.value,
  };

  tasks.unshift(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();

  title.value = "";
  description.value = "";

  const starIcons = document.querySelectorAll(".fa-star");
  starIcons.forEach((starIcon, i) => {
    if (i === 0) {
      starIcon.classList.add("star-selected");
    } else {
      starIcon.classList.remove("star-selected");
    }
  });
});
