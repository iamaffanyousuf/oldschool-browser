const apiKey = "";
const bootLogs = document.getElementById('boot-logs');
const bootFill = document.getElementById('boot-fill');
const bootPercent = document.getElementById('boot-percent');
const loadingScreen = document.getElementById('loading-screen');
const searchInterface = document.getElementById('search-interface');
const searchInput = document.getElementById('search-input');
const output = document.getElementById('output');

const bootMessages = [
    { text: "Verifying kernel integrity...", type: "process" },
    { text: "Checksum 0xAF32 matched.", type: "success" },
    { text: "Initializing network stack...", type: "process" },
    { text: "DHCP Lease acquired: 192.168.1.105", type: "success" },
    { text: "Loading web-scraping subroutines...", type: "process" },
    { text: "Search index pointers cached.", type: "success" },
    { text: "Waking search daemon...", type: "process" },
    { text: "Daemon online.", type: "success" }
];

// Timers
function updateClocks() {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    if (document.getElementById('boot-clock')) document.getElementById('boot-clock').innerText = time;
    if (document.getElementById('search-clock')) document.getElementById('search-clock').innerText = time;
}
setInterval(updateClocks, 1000);
updateClocks();

// Boot Sequence Logic
let bootIdx = 0;
function runBoot() {
    if (bootIdx < bootMessages.length) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${bootMessages[bootIdx].type}`;
        entry.innerText = bootMessages[bootIdx].text;
        bootLogs.insertBefore(entry, bootLogs.firstChild);

        bootIdx++;
        let p = Math.floor((bootIdx / bootMessages.length) * 100);
        bootFill.style.width = p + "%";
        bootPercent.innerText = p + "%";

        setTimeout(runBoot, Math.random() * 400 + 200);
    } else {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                searchInterface.style.display = 'flex';
                searchInput.focus();
            }, 800);
        }, 500);
    }
}

// Terminal Commands
function executeCommand(cmd) {
    const cleanCmd = cmd.toLowerCase().trim();

    if (cleanCmd === 'clear') {
        output.innerHTML = '';
        return true;
    }

    if (cleanCmd === 'help') {
        const helpMsg = document.createElement('div');
        helpMsg.className = 'log-entry';
        helpMsg.style.margin = '10px 0';
        helpMsg.innerHTML = `
                    <div style="color: #fff">AVAILABLE COMMANDS:</div>
                    <div>- clear : Purge terminal output buffer</div>
                    <div>- help  : Display this transmission</div>
                    <div>- [query] : Any other string initiates web search</div>
                `;
        output.appendChild(helpMsg);
        output.scrollTop = output.scrollHeight;
        return true;
    }

    return false; // not a predefined command, treat as search
}

// internet search Logic
async function performSearch(query) {
    const status = document.createElement('div');
    status.className = 'status-msg';
    status.innerText = `Searching archives for: "${query}"...`;
    output.appendChild(status);
    output.scrollTop = output.scrollHeight;

    try {
        const response = await fetchWithRetry("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        status.remove();

        if (data.error) {
            const errBox = document.createElement("div");
            errBox.innerText = data.error;
            errBox.className = "result-snippet";
            output.appendChild(errBox);
            return;
        }

        const results = data.items || [];

        const container = document.createElement('div');
        container.innerHTML = `<div class="log-entry" style="color:var(--dim-text)">> Results for: ${query}</div>`;

        if (results.length > 0) {
            results.forEach(r => {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.innerHTML = `
                    <a href="${r.link}" target="_blank" class="result-title">${r.title}</a>
                    <a href="${r.link}" target="_blank" class="result-link">${r.link}</a>
                    <div class="result-snippet">${r.snippet}</div>
                `;
                container.appendChild(item);
            });
        } else {
            const noRes = document.createElement("div");
            noRes.className = "result-snippet";
            noRes.innerText = "No results found.";
            container.appendChild(noRes);
        }

        output.appendChild(container);
    } catch (err) {
        status.innerText = "Error: Connection to search uplink failed.";
    }

    output.scrollTop = output.scrollHeight;
}

async function fetchWithRetry(url, options, retries = 5, backoff = 1000) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(res.statusText);
        return res;
    } catch (err) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
}

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        const val = searchInput.value;

        // Echo the command
        const echo = document.createElement('div');
        echo.innerHTML = `<span class="prompt">guest@web:~$</span> <span>${val}</span>`;
        echo.style.marginBottom = '10px';
        output.appendChild(echo);

        // Check if it's a command first
        const wasCommand = executeCommand(val);

        if (!wasCommand) {
            performSearch(val);
        }

        searchInput.value = '';
        output.scrollTop = output.scrollHeight;
    }
});

window.onload = () => setTimeout(runBoot, 1000);