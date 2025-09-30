// script.js
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


languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    codeInput.value = defaultCode[lang];
});

runBtn.addEventListener("click", async () => {
  const code = codeInput.value;
  const lang = languageSelect.value;

  // Prepare body for Piston API
  const body = {
    language: lang,
    version: "*", // use latest version
    files: [
      {
        name: "main." + (lang === "python" ? "py" : lang === "java" ? "java" : "js"),
        content: code
      }
    ]
  };

  try {
    outputDiv.textContent = "Running...";
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (data.run.output) {
  outputDiv.textContent = data.run.output + "\n\n(Time: " + data.run.time + "s)";
} else {
  outputDiv.textContent = "Error: " + JSON.stringify(data);
}
  } catch (err) {
    outputDiv.textContent = "Error: " + err.message;
  }
});

