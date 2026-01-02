<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gemini 2.5 Flash – Preview</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #eef2ff, #fdf4ff);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 900px;
      margin: 40px auto;
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      animation: fadeIn 0.8s ease-in-out;
    }
    h1 {
      text-align: center;
      margin-bottom: 6px;
    }
    p {
      text-align: center;
      color: #555;
    }
    textarea {
      width: 100%;
      height: 180px;
      padding: 12px;
      margin-top: 16px;
      border-radius: 10px;
      border: 1px solid #d1d5db;
      font-size: 14px;
    }
    select, button {
      margin-top: 16px;
      padding: 12px 16px;
      font-size: 14px;
      border-radius: 10px;
      border: 1px solid #d1d5db;
    }
    button {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      cursor: pointer;
    }
    .output {
      margin-top: 20px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      white-space: pre-wrap;
    }
    #mindmap {
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .mindmap-center {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      padding: 14px;
      border-radius: 999px;
      background: linear-gradient(135deg, #a5b4fc, #c4b5fd);
      color: #1e1b4b;
      align-self: center;
    }
    .mindmap-branch {
      background: #eef2ff;
      border-radius: 14px;
      padding: 16px;
    }
    .note {
      margin-top: 20px;
      font-size: 13px;
      color: #444;
      background: #fff7ed;
      padding: 12px;
      border-radius: 10px;
      border: 1px dashed #fb923c;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📘 AI Text Assistant (Preview)</h1>
    <p>Powered by <strong>Gemini 2.5 Flash</strong></p>

    <textarea id="inputText" placeholder="Paste or type your text here..."></textarea>

    <div>
      <select id="mode">
        <option value="quick">Quick Summary</option>
        <option value="detailed">Detailed Summary</option>
        <option value="academic">Academic Summary</option>
        <option value="mindmap">Mind Map</option>
      </select>

      <button onclick="generatePreview()">Generate</button>
    </div>

    <div class="output" id="output">Output will appear here...</div>
    <div id="mindmap"></div>

    <div class="note">
      ⚠️ Backend API not available in this environment.<br />
      The app will automatically switch to <strong>mock preview mode</strong> for demo purposes.
    </div>
  </div>

  <script>
    const API_URL = "/api/generate"; // change if backend runs elsewhere

    async function generatePreview() {
      const text = document.getElementById('inputText').value.trim();
      const mode = document.getElementById('mode').value;
      const output = document.getElementById('output');
      const mindmap = document.getElementById('mindmap');

      mindmap.innerHTML = "";

      if (!text) {
        output.textContent = "Please enter some text.";
        return;
      }

      output.textContent = "Generating response...";

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode })
        });

        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        handleResult(mode, data.result);
      } catch (err) {
        console.warn("API unavailable, using mock data", err);
        const mock = getMockResult(mode);
        handleResult(mode, mock);
      }
    }

    function handleResult(mode, result) {
      const output = document.getElementById('output');
      if (mode === "mindmap") {
        output.textContent = "Mind map generated below:";
        renderMindMap(result);
      } else {
        output.textContent = result;
      }
    }

    function renderMindMap(result) {
      const container = document.getElementById('mindmap');
      container.innerHTML = "";

      let data;
      try {
        data = typeof result === "string" ? JSON.parse(result) : result;
      } catch {
        container.textContent = "Invalid mind map format.";
        return;
      }

      const center = document.createElement('div');
      center.className = "mindmap-center";
      center.textContent = data.main_topic;
      container.appendChild(center);

      data.subtopics.forEach(sub => {
        const branch = document.createElement('div');
        branch.className = "mindmap-branch";
        branch.innerHTML = `<strong>${sub.title}</strong><ul>${sub.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
        container.appendChild(branch);
      });
    }

    // Mock data for sandbox / preview
    function getMockResult(mode) {
      if (mode === "mindmap") {
        return {
          main_topic: "Artificial Intelligence",
          subtopics: [
            { title: "Definition", points: ["Simulation of intelligence", "Machines & software"] },
            { title: "Applications", points: ["Education", "Healthcare", "Finance"] },
            { title: "Benefits", points: ["Automation", "Personalization"] }
          ]
        };
      }

      if (mode === "academic") {
        return "MAIN THESIS: AI enhances human capability.\nKEY FINDINGS: Automation, efficiency.\nMETHODOLOGY: Not specified.\nSIGNIFICANCE: Improves productivity.";
      }

      if (mode === "detailed") {
        return "Artificial Intelligence enables machines to perform tasks that normally require human intelligence. It is widely used across industries such as education, healthcare, and finance. AI improves efficiency and accuracy. Its impact continues to grow rapidly.";
      }

      return "Artificial Intelligence allows machines to mimic human intelligence.";
    }
  </script>
</body>
</html>
