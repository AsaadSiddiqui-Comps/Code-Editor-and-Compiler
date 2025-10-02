const runBtn = document.getElementById("runBtn");
const codeInput = document.getElementById("code");
const outputDiv = document.getElementById("output");
const languageSelect = document.getElementById("language");

const defaultCode = {
  javascript: `console.log("Hello, JavaScript!");`,
  python: `print("Hello, Python!")`,
  java: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`
};


// Line numbers element and helper
const lineNumbersEl = document.getElementById('lineNumbers');

function renderLineNumbers() {
  const textLines = codeInput.value.split('\n').length;
  let lineHeight = parseFloat(window.getComputedStyle(codeInput).lineHeight);
  if (!lineHeight || isNaN(lineHeight)) lineHeight = 20; // fallback
  const visibleLines = Math.max( Math.floor(codeInput.clientHeight / lineHeight), 1 );
  const minLines = 20; // ensure a minimum gutter for empty editors
  const count = Math.max(textLines, visibleLines, minLines);
  let html = '';
  for (let i = 1; i <= count; i++) {
    html += i + '\n';
  }
  // Keep newline chars but display as text
  lineNumbersEl.textContent = html;
}

// Sync scroll of line numbers with textarea
codeInput.addEventListener('scroll', () => {
  lineNumbersEl.scrollTop = codeInput.scrollTop;
});

// Update line numbers on input
codeInput.addEventListener('input', renderLineNumbers);

// Initial render
renderLineNumbers();

// Re-render line numbers on window resize to account for visible rows
window.addEventListener('resize', renderLineNumbers);


languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    codeInput.value = defaultCode[lang];
  renderLineNumbers();
});

runBtn.addEventListener("click", async () => {
  const code = codeInput.value;
  const lang = languageSelect.value;

  // Prepare body for Piston API
  const body = {
    language: lang,
    version: "*",
    files: [
      {
        name: "main." + (lang === "python" ? "py" : lang === "java" ? "java" : "js"),
        content: code
      }
    ]
  };

  try {
    outputDiv.innerHTML = `<span class="placeholder">Running...</span>`;
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (data.run && data.run.output !== undefined) {
      const programOutput = data.run.output.trim();
      
      // Convert time to seconds (assuming ms)
      const execTime = data.run.time !== undefined ? (data.run.time / 1000).toFixed(2) : "0.00";

      // Format output as code block inside panel
      outputDiv.innerHTML = `
        <pre class="program-output">${programOutput}</pre>
        <div class="exec-time">(Time: ${execTime}s)</div>
      `;
    } else {
      outputDiv.innerHTML = `<span class="error">Error: ${JSON.stringify(data)}</span>`;
    }
  } catch (err) {
    outputDiv.innerHTML = `<span class="error">Error: ${err.message}</span>`;
  }
});
