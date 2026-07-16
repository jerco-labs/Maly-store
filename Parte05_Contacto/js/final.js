const tasks = [
  {
    title: "Verificar enlaces relativos",
    description: "Asegurar que CSS y JS apunten correctamente dentro de la carpeta del proyecto.",
    weight: 2,
    done: true,
  },
  {
    title: "Revisar contenido final",
    description: "Confirmar que el texto del cierre sea claro y listo para presentar.",
    weight: 1,
    done: true,
  },
  {
    title: "Validar diseño responsive",
    description: "Comprobar que el layout se mantenga ordenado en pantallas pequeñas.",
    weight: 2,
    done: false,
  },
  {
    title: "Preparar ZIP final",
    description: "Empaquetar la parte 5 con nombres correctos y estructura limpia.",
    weight: 1,
    done: false,
  },
];

const quality = [
  {
    name: "Estructura del proyecto",
    desc: "Archivos separados y organizados por carpeta.",
    ok: true,
  },
  {
    name: "Experiencia visual",
    desc: "Diseño limpio, tarjetas claras y lectura rápida.",
    ok: true,
  },
  {
    name: "Preparación para entrega",
    desc: "Checklist final con acciones de cierre.",
    ok: false,
  },
];

const els = {
  checklist: document.getElementById("checklist"),
  qualityList: document.getElementById("qualityList"),
  doneCount: document.getElementById("doneCount"),
  issueCount: document.getElementById("issueCount"),
  eta: document.getElementById("eta"),
  projectStatus: document.getElementById("projectStatus"),
  projectMeta: document.getElementById("projectMeta"),
  footerNote: document.getElementById("footerNote"),
  completeBtn: document.getElementById("completeBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

function renderChecklist() {
  els.checklist.innerHTML = tasks.map((task, index) => `
    <label class="task">
      <input type="checkbox" data-index="${index}" ${task.done ? "checked" : ""} />
      <div>
        <strong>${task.title}</strong>
        <p>${task.description}</p>
      </div>
    </label>
  `).join("");

  els.checklist.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.addEventListener("change", (event) => {
      const idx = Number(event.target.dataset.index);
      tasks[idx].done = event.target.checked;
      updateSummary();
    });
  });
}

function renderQuality() {
  els.qualityList.innerHTML = quality.map(item => `
    <div class="metric">
      <div>
        <div class="name">${item.name}</div>
        <div class="desc">${item.desc}</div>
      </div>
      <div class="badge ${item.ok ? "ok" : "warn"}">${item.ok ? "OK" : "Revisar"}</div>
    </div>
  `).join("");
}

function updateSummary() {
  const done = tasks.filter(task => task.done).length;
  const issues = quality.filter(item => !item.ok).length + tasks.filter(task => !task.done).length;
  const eta = Math.max((tasks.length - done) * 4, 4);

  els.doneCount.textContent = `${done}/${tasks.length}`;
  els.issueCount.textContent = String(issues);
  els.eta.textContent = `${eta} min`;

  if (done === tasks.length && issues === 0) {
    els.projectStatus.textContent = "Proyecto cerrado";
    els.projectMeta.textContent = "Todo listo para enviar";
    els.footerNote.textContent = "Entrega completada: el proyecto queda listo para archivarse o publicarse.";
  } else if (done >= 2) {
    els.projectStatus.textContent = "Casi listo";
    els.projectMeta.textContent = "Faltan pocos ajustes";
    els.footerNote.textContent = "Vas bien: termina los últimos pasos y podrás cerrar la entrega.";
  } else {
    els.projectStatus.textContent = "En progreso";
    els.projectMeta.textContent = "Quedan tareas pendientes";
    els.footerNote.textContent = "Completa la checklist para dejar el proyecto cerrado.";
  }
}

function markAllDone() {
  tasks.forEach(task => task.done = true);
  renderChecklist();
  updateSummary();
}

function resetAll() {
  tasks[0].done = true;
  tasks[1].done = true;
  tasks[2].done = false;
  tasks[3].done = false;
  renderChecklist();
  updateSummary();
}

els.completeBtn.addEventListener("click", markAllDone);
els.resetBtn.addEventListener("click", resetAll);

renderChecklist();
renderQuality();
updateSummary();
