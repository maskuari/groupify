    const storageKeys = {
      theme: "groupify-theme",
      names: "groupify-names",
      groupCount: "groupify-group-count"
    };

    const root = document.documentElement;
    const namesInput = document.getElementById("namesInput");
    const groupCountInput = document.getElementById("groupCount");
    const participantCount = document.getElementById("participantCount");
    const generateBtn = document.getElementById("generateBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const resetBtn = document.getElementById("resetBtn");
    const themeToggle = document.getElementById("themeToggle");
    const errorMessage = document.getElementById("errorMessage");
    const groupsGrid = document.getElementById("groupsGrid");
    const resultSummary = document.getElementById("resultSummary");
    const resultsSection = document.querySelector(".results-section");

    function getParticipants() {
      return namesInput.value
        .split("\n")
        .map((name) => name.trim())
        .filter(Boolean);
    }

    function saveFormState() {
      localStorage.setItem(storageKeys.names, namesInput.value);
      localStorage.setItem(storageKeys.groupCount, groupCountInput.value);
      updateParticipantCount();
    }

    function updateParticipantCount() {
      participantCount.textContent = getParticipants().length;
    }

    function setTheme(theme) {
      root.dataset.theme = theme;
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode");
      localStorage.setItem(storageKeys.theme, theme);
    }

    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.classList.add("show");
    }

    function clearError() {
      errorMessage.textContent = "";
      errorMessage.classList.remove("show");
    }

    function validateInput() {
      const participants = getParticipants();
      const groupCount = Number(groupCountInput.value);

      if (participants.length === 0) {
        return { valid: false, message: "Nama peserta tidak boleh kosong." };
      }

      if (!Number.isInteger(groupCount) || groupCount <= 0) {
        return { valid: false, message: "Jumlah kelompok harus lebih dari 0." };
      }

      if (groupCount > participants.length) {
        return { valid: false, message: "Jumlah kelompok tidak boleh lebih banyak dari jumlah peserta." };
      }

      return { valid: true, participants, groupCount };
    }

    function shuffleArray(items) {
      const shuffled = [...items];

      // Fisher-Yates shuffle menjaga proses acak tetap sederhana dan adil.
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }

      return shuffled;
    }

    function createBalancedGroups(participants, groupCount) {
      const groups = Array.from({ length: groupCount }, () => []);
      const shuffledParticipants = shuffleArray(participants);

      shuffledParticipants.forEach((participant, index) => {
        groups[index % groupCount].push(participant);
      });

      return groups;
    }

    function getInitials(name) {
      return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("") || "?";
    }

    function renderGroups(groups) {
      groupsGrid.innerHTML = "";

      groups.forEach((members, index) => {
        const card = document.createElement("article");
        card.className = "group-card";
        card.style.animationDelay = `${index * 0.04}s`;

        const memberItems = members.map((member) => `
          <li>
            <span class="avatar">${escapeHtml(getInitials(member))}</span>
            <span>${escapeHtml(member)}</span>
          </li>
        `).join("");

        card.innerHTML = `
          <div class="group-header">
            <h3>Kelompok ${index + 1}</h3>
            <span class="member-count">${members.length} anggota</span>
          </div>
          <ul class="members">${memberItems}</ul>
        `;

        groupsGrid.appendChild(card);
      });

      const totalMembers = groups.reduce((total, group) => total + group.length, 0);
      resultSummary.textContent = `${groups.length} kelompok, ${totalMembers} peserta`;
    }

    function escapeHtml(value) {
      return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function generateGroups() {
      const validation = validateInput();

      if (!validation.valid) {
        showError(validation.message);
        return;
      }

      clearError();
      saveFormState();
      const groups = createBalancedGroups(validation.participants, validation.groupCount);
      renderGroups(groups);
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetApp() {
      namesInput.value = "";
      groupCountInput.value = "";
      localStorage.removeItem(storageKeys.names);
      localStorage.removeItem(storageKeys.groupCount);
      updateParticipantCount();
      clearError();
      resultSummary.textContent = "Belum ada hasil";
      groupsGrid.innerHTML = '<div class="empty-state">Hasil kelompok akan muncul di sini setelah kamu menekan tombol Generate Kelompok.</div>';
      namesInput.focus();
    }

    function loadSavedState() {
      const savedTheme = localStorage.getItem(storageKeys.theme) || "light";
      const savedNames = localStorage.getItem(storageKeys.names) || "";
      const savedGroupCount = localStorage.getItem(storageKeys.groupCount) || "";

      setTheme(savedTheme);
      namesInput.value = savedNames;
      groupCountInput.value = savedGroupCount;
      updateParticipantCount();
    }

    namesInput.addEventListener("input", saveFormState);
    groupCountInput.addEventListener("input", saveFormState);
    generateBtn.addEventListener("click", generateGroups);
    shuffleBtn.addEventListener("click", generateGroups);
    resetBtn.addEventListener("click", resetApp);

    themeToggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });

    loadSavedState();
  

