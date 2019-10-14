// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
const calorieList = document.getElementById("calories-list");
const newCalorieForm = document.getElementById("new-calorie-form");
const bmrForm = document.querySelector("#bmr-calulator");
const progressBar = document.getElementById("progress-bar");

const lowRangeBMR = document.getElementById("lower-bmr-range");
const highRangeBMR = document.getElementById("higher-bmr-range");

const editCalorieContainer = document.getElementById("edit-form-container");
const editCalorieForm = document.getElementById("edit-calorie-form");

const caloriesPath = "http://localhost:3000/api/v1/calorie_entries";
const caloriePath = id => caloriesPath + "/" + id;

let editableCalorie = null;

fetch(caloriesPath)
  .then(e => e.json())
  .then(e => e.forEach(renderCard));

function renderCard(card) {
  const cardHTML = `<li data-id="${card.id}" class="calories-list-item">
    <div style='min-height: 40px;' class="uk-grid">
      <div class="uk-width-1-6">
        <strong>${card.calorie}</strong>
        <span>kcal</span>
      </div>
      <div class="uk-width-4-5">
        <em class="uk-text-meta">${card.note}</em>
      </div>
    </div>
    <div class="list-item-menu">
      <a class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a>
      <a class="delete-button" uk-icon="icon: trash"></a>
    </div>
  </li>`;
  calorieList.insertAdjacentHTML("afterbegin", cardHTML);
}

function updateProgressBar() {
  progressBar.max =
    parseInt(+highRangeBMR.innerText + +lowRangeBMR.innerText) / 2;

  progressBar.value = getCalorieSum(calorieList);
}

function getCalorieSum(list) {
  return [...list.children].reduce((sum, n) => {
    return sum + +n.querySelector("strong").innerText;
  }, 0);
}

setTimeout(updateProgressBar, 100);

function setEditableCalorie(card) {
  editableCalorie = card;
}

function setDefaultValues(form, object) {
  const calorieCount = object.querySelector("strong").innerText;
  form.calorie.value = calorieCount;

  const noteValue = object.querySelector("em").innerText;
  form.note.value = noteValue;
}

function editCalorie() {
  const form = {
    api_v1_calorie_entry: {
      calorie: editCalorieForm.calorie.value,
      note: editCalorieForm.note.value
    }
  };

  const content = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(form)
  };

  fetch(caloriePath(editableCalorie.dataset.id), content)
    .then(e => e.json())
    .then(e => {
      editableCalorie.querySelector("strong").innerText = e.calorie;
      editableCalorie.querySelector("em").innerText = e.note;
      updateProgressBar();
    })
    .catch(alert);

  editCalorieContainer.className = "uk-modal";
  editCalorieContainer.style = "";
}

function deleteCalorie(card) {
  const content = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  };

  fetch(caloriePath(card.dataset.id), content)
    .then(e => e.json())
    .then(e => {
      card.remove();
    })
    .catch(alert);

  updateProgressBar();
}

calorieList.addEventListener("click", e => {
  const calorieButton = e.target.closest("a");

  if (calorieButton.className.includes("edit-button")) {
    const calorie = calorieButton.closest("li");
    setEditableCalorie(calorie);
    setDefaultValues(editCalorieForm, calorie);
  }

  if (calorieButton.className.includes("delete-button")) {
    deleteCalorie(calorieButton.closest("li"));
  }
  updateProgressBar();
});

newCalorieForm.addEventListener("submit", e => {
  e.preventDefault();

  const card = {
    api_v1_calorie_entry: {
      calorie: newCalorieForm.calorie.value,
      note: newCalorieForm.note.value
    }
  };

  const content = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(card)
  };

  fetch(caloriesPath, content)
    .then(e => e.json())
    .then(e => {
      renderCard(e);
      updateProgressBar();
    })
    .catch(console.log);

  newCalorieForm.reset();
});

editCalorieForm.addEventListener("submit", e => {
  e.preventDefault();
  editCalorie();
  updateProgressBar();
});

bmrForm.addEventListener("submit", e => {
  e.preventDefault();
  weight = bmrForm.weight.value;
  height = bmrForm.height.value;
  age = bmrForm.age.value;

  lowRangeBMR.innerText = parseInt(
    655 + 4.35 * weight + 4.7 * height - 4.7 * age
  );
  highRangeBMR.innerText = parseInt(
    660 + 6.23 * weight + 12.7 * height - 6.8 * age
  );
  bmrForm.reset();
  updateProgressBar();
});
//lower
//BMR = 655 + (4.35 x weight in pounds) + (4.7 x height in inches) - (4.7 x age in years)

//upper
//BMR = 66 + (6.23 x weight in pounds) + (12.7 x height in inches) - (6.8 x age in years
