const title = document.getElementById("title");
const description = document.getElementById("description");
const form = document.querySelector("#taskForm");
const container = document.querySelector(".container");

const tasks = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];

showAllTasks();

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

    btn.innerText = "-";

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
