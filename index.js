const title = document.getElementById("title");
const description = document.getElementById("description");
const form = document.querySelector("#taskForm");
const container = document.querySelector(".container");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const closeEditModal = document.getElementById("closeEditModal");
const tasks = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];

showAllTasks();

console.log("closeEditModal : ", closeEditModal);

function showAllTasks() {
  removeTasks();

  tasks.forEach((value, index) => {
    const div = document.createElement("div");
    div.setAttribute("class", "task");

    const innerDiv = document.createElement("div");
    div.append(innerDiv);

    const p = document.createElement("p");
    p.innerText = value.title;
    innerDiv.append(p);

    const span = document.createElement("span");
    span.innerText = value.description;
    innerDiv.append(span);

    const star = document.createElement("i");
    star.setAttribute(
      "class",
      value.isFavorite ? "fas fa-star favorite" : "far fa-star"
    );
    star.addEventListener("click", () => {
      toggleFavorite(index);
    });
    innerDiv.append(star);

    const btn = document.createElement("button");
    btn.setAttribute("class", "deleteBtn");

    btn.innerText = "x";

    btn.addEventListener("click", () => {
      removeTasks();
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      showAllTasks();
    });

    div.append(btn);
    container.append(div);
  });
}

function removeTasks() {
  const taskElements = document.querySelectorAll(".task");
  taskElements.forEach((task) => {
    task.remove();
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask();
});

function addTask() {
  removeTasks();

  tasks.push({
    title: title.value,
    description: description.value,
    isFavorite: false,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();

  title.value = "";
  description.value = "";
}

function toggleFavorite(index) {
  tasks[index].isFavorite = !tasks[index].isFavorite;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.target === title || e.target === description)) {
    e.preventDefault();
    addTask();
  }
});

function addTask() {
  removeTasks();

  tasks.push({
    title: title.value,
    description: description.value,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();

  title.value = "";
  description.value = "";
}

function toggleFavorite(index) {
  tasks[index].isFavorite = !tasks[index].isFavorite;
  if (tasks[index].isFavorite) {
    const favoriteTask = tasks.splice(index, 1)[0];
    tasks.unshift(favoriteTask);
  }
  localStorage.setItem("tasks", JSON.stringify(tasks));
  showAllTasks();
}

//edit
function showAllTasks() {
  removeTasks();

  tasks.forEach((value, index) => {
    const div = document.createElement("div");
    div.setAttribute("class", "task");

    const innerDiv = document.createElement("div");
    div.append(innerDiv);

    const p = document.createElement("p");
    p.innerText = value.title;
    innerDiv.append(p);

    const span = document.createElement("span");
    span.innerText = value.description;
    innerDiv.append(span);

    const star = document.createElement("i");
    star.setAttribute(
      "class",
      value.isFavorite ? "fas fa-star favorite" : "far fa-star"
    );
    star.addEventListener("click", () => {
      toggleFavorite(index);
    });
    innerDiv.append(star);

    const editBtn = document.createElement("button");
    editBtn.setAttribute("class", "editBtn");
    editBtn.innerText = "Edit";
    editBtn.addEventListener("click", () => {
      openEditModal(index);
    });
    innerDiv.append(editBtn);

    const btn = document.createElement("button");
    btn.setAttribute("class", "deleteBtn");
    btn.innerText = "x";
    btn.addEventListener("click", () => {
      removeTasks();
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      showAllTasks();
    });

    div.append(btn);
    container.append(div);
  });
}

//editModal
function openEditModal(index) {
  const task = tasks[index];
  editTitle.value = task.title;
  editDescription.value = task.description;
  saveChangesBtn.addEventListener("click", () => {
    saveChangesBtn(index);
  });
  editModal.style.display = "block";
}

function handleModalClose() {
  editModal.style.display = "none";
  editTitle.value = "";
  editDescription.value = "";
  saveChangesBtn.removeEventListener("click", saveChangesBtn);
}
closeEditModal.addEventListener("click", handleModalClose);
