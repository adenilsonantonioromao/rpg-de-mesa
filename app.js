const state = {
  player: {
    name: "Lia Ventura",
    classe: "Exploradora",
    hp: 18,
    mp: 10,
    energia: 12,
    atributos: {
      forca: 2,
      habilidade: 3,
      resistencia: 2,
      armadura: 1,
      poder: 2,
    },
  },
  advantages: [
    {
      name: "Olho Afiado",
      effect: "+1 em testes de investigação",
    },
    {
      name: "Sorte do Aventureiro",
      effect: "Re-rolar 1 dado por cena",
    },
    {
      name: "Afinidade Social",
      effect: "+1 ao conversar com NPCs",
    },
  ],
  affinities: [
    { id: "maria", name: "Maria, a Alquimista", value: 40 },
    { id: "tulio", name: "Túlio, o Bardo", value: 55 },
    { id: "raquel", name: "Raquel, a Guarda", value: 30 },
  ],
  map: {
    size: 5,
    playerPosition: { x: 2, y: 2 },
    pointsOfInterest: [
      { id: "taverna", x: 2, y: 2 },
      { id: "mercado", x: 4, y: 1 },
      { id: "porto", x: 0, y: 3 },
      { id: "torre", x: 1, y: 0 },
    ],
  },
  turn: 1,
  messages: [
    {
      sender: "Narrador",
      text: "A chuva aperta e o som das lareiras preenche a taberna. Um mapa antigo está sobre a mesa, com marcas de sangue seco.",
    },
    {
      sender: "Túlio",
      text: "Se você quer respostas, a torre do norte não vai se abrir sozinha.",
    },
  ],
};

const statsEl = document.getElementById("stats");
const advantagesEl = document.getElementById("advantages");
const affinityEl = document.getElementById("affinity");
const mapEl = document.getElementById("map");
const chatEl = document.getElementById("chat");
const actionsEl = document.getElementById("actions");
const playerInput = document.getElementById("playerInput");
const sendAction = document.getElementById("sendAction");

const quickActions = [
  {
    label: "Investigar o mapa",
    action: () => rollAction("investigação", 3),
  },
  {
    label: "Conversar com o bardo",
    action: () => adjustAffinity("tulio", 8),
  },
  {
    label: "Pedir missão",
    action: () => narrate(
      "Narrador",
      "O ancião da taberna entrega uma missão: recuperar o cristal da torre."
    ),
  },
  {
    label: "Mover no mapa",
    action: () => narrate(
      "Narrador",
      "Clique no mapa ao lado para mover sua personagem."
    ),
  },
  {
    label: "Descansar",
    action: () => rest(),
  },
];

function renderStats() {
  statsEl.innerHTML = "";
  const { player } = state;
  const lines = [
    ["Nome", player.name],
    ["Classe", player.classe],
    ["HP", player.hp],
    ["MP", player.mp],
    ["Energia", player.energia],
  ];
  lines.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "stat";
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    statsEl.appendChild(row);
  });
}

function renderAdvantages() {
  advantagesEl.innerHTML = "";
  state.advantages.forEach((adv) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${adv.name}</strong><br /><span>${adv.effect}</span>`;
    advantagesEl.appendChild(li);
  });
}

function renderAffinities() {
  affinityEl.innerHTML = "";
  state.affinities.forEach((npc) => {
    const card = document.createElement("div");
    card.className = "affinity__card";
    const value = Math.max(0, Math.min(100, npc.value));
    card.innerHTML = `
      <div class="affinity__row">
        <span>${npc.name}</span>
        <strong>${value}%</strong>
      </div>
      <div class="progress">
        <span style="width: ${value}%"></span>
      </div>
    `;
    affinityEl.appendChild(card);
  });
}

function renderMap() {
  mapEl.innerHTML = "";
  const { size, playerPosition, pointsOfInterest } = state.map;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "map__cell";
      const isPlayer = playerPosition.x === x && playerPosition.y === y;
      const isPoi = pointsOfInterest.some((poi) => poi.x === x && poi.y === y);
      if (isPoi) {
        cell.classList.add("map__cell--poi");
      }
      if (isPlayer) {
        cell.classList.add("map__cell--player");
      }
      cell.addEventListener("click", () => movePlayer(x, y));
      mapEl.appendChild(cell);
    }
  }
}

function renderChat() {
  chatEl.innerHTML = "";
  state.messages.forEach((message) => {
    const card = document.createElement("div");
    card.className = "message";
    if (message.sender === "Você") {
      card.classList.add("message--player");
    }
    card.innerHTML = `
      <span class="message__sender">${message.sender}</span>
      <span class="message__text">${message.text}</span>
    `;
    chatEl.appendChild(card);
  });
  chatEl.scrollTop = chatEl.scrollHeight;
}

function renderActions() {
  actionsEl.innerHTML = "";
  quickActions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    button.addEventListener("click", action.action);
    actionsEl.appendChild(button);
  });
}

function narrate(sender, text) {
  state.messages.push({ sender, text });
  renderChat();
}

function adjustAffinity(id, amount) {
  const npc = state.affinities.find((item) => item.id === id);
  if (!npc) return;
  npc.value = Math.max(0, Math.min(100, npc.value + amount));
  renderAffinities();
  narrate(
    "Narrador",
    `${npc.name} reagiu à sua abordagem. Afinidade agora em ${npc.value}%.`
  );
}

function rollAction(type, bonus) {
  const roll = Math.ceil(Math.random() * 6);
  const total = roll + bonus;
  const success = total >= 6;
  narrate(
    "Narrador",
    `Teste de ${type}: você rolou ${roll} + ${bonus}. Resultado ${total} (${success ? "sucesso" : "falha"}).`
  );
  if (success) {
    adjustAffinity("maria", 4);
  } else {
    adjustAffinity("raquel", -2);
  }
}

function movePlayer(x, y) {
  const { playerPosition } = state.map;
  if (playerPosition.x === x && playerPosition.y === y) {
    narrate("Narrador", "Você já está aqui.");
    return;
  }
  playerPosition.x = x;
  playerPosition.y = y;
  state.turn += 1;
  renderMap();
  narrate(
    "Narrador",
    `Você se moveu para o ponto (${x + 1}, ${y + 1}) no mapa.`
  );
}

function rest() {
  state.player.hp = Math.min(20, state.player.hp + 2);
  state.player.mp = Math.min(12, state.player.mp + 1);
  state.player.energia = Math.min(12, state.player.energia + 2);
  renderStats();
  narrate("Narrador", "Você recupera o fôlego enquanto observa a chuva.");
}

function handlePlayerInput() {
  const value = playerInput.value.trim();
  if (!value) return;
  playerInput.value = "";
  state.messages.push({ sender: "Você", text: value });
  renderChat();
  narrate(
    "Narrador",
    "O narrador considera sua ação e prepara a próxima cena."
  );
}

sendAction.addEventListener("click", handlePlayerInput);
playerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handlePlayerInput();
  }
});

renderStats();
renderAdvantages();
renderAffinities();
renderMap();
renderChat();
renderActions();
