# 🌟 Sky Trace: Desktop AR Tracing Experience

A polished, consistent desktop learning application inspired by the five-screen Sky Trace design system. Kids learn letters, numbers, and shapes using fun hand gestures and air-tracing powered by **Google MediaPipe AI Vision**.

---

## 🚀 How to Run the Application
1. Double-click `run_app.bat` or run in PowerShell:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\server.ps1
   ```
2. Navigate to **[http://localhost:8080](http://localhost:8080)** in **Google Chrome** or **Microsoft Edge**.

---

## 📱 The Five-Screen Learning Flow

### 1. 🌟 Splash / Welcome
* Prominent, colorful **Sky Trace** logo with playful dashed pencil loop.
* Tagline: *"Learn letters, numbers and more with fun hand gestures!"*
* Prominent golden CTA: **"Start learning ➔"**.
* Illustrated lower meadow featuring the boy in overalls, cute orange fox, white rabbit, and blue penguin.

### 2. 📖 Onboarding / Introduction
* Clean 3-step progress indicator without any top navbar.
* Split layout:
  - **Left**: Three key learning benefits:
    - 🖐️ *Use your hand to trace*
    - ⭐ *Get instant feedback*
    - 📊 *Earn stars and unlock new worlds*
    - Coral CTA: **"Next ➔"**.
  - **Right**: Beautiful 3D illustration of the child reaching up to trace the glowing golden letter **A** in the sky with numbered checkpoints (1, 2, 3).

### 3. 🗺️ World Map
* Immersive island archipelago surrounded by crystal-clear ocean, clouds, and stepping-stone trails.
* Top-left **Learning Journey Card**: Level indicator, progress bar (`2/12`), activity checklists, and total stars earned.
* Interactive Island Hotspots:
  - **Letters ➔**: Opens the Islands Category selection.
  - **Numbers ➔**: Jumps directly to Numbers learning.
  - **Shapes ➔**: Jumps directly to Shapes learning.
  - **Practice ➔ (Locked)**: Snowy mountain island with padlock 🔒. Clicking it displays a friendly unlock tip.

### 4. 🏝️ Worlds / Category Selection ("Explore the Islands")
* Title: *"Explore the Islands"* with cheerful smiling sun.
* Contextual `←` Back button to return to the World Map.
* 4 Spacious illustrated island cards:
  1. **Small Letters**: *a b c* with wooden toy blocks.
  2. **Capital Letters**: *A B C* with castle towers.
  3. **Numbers**: *1 2 3* with vibrant 3D numbers.
  4. **Shapes**: *△ ○ □* with 3D colorful geometric solids.

### 5. 🔤 Letter Learning & "🪄 Magic Pen" Tracing
* Central warm-cream card:
  - Letter and word header (*e.g. "A for Apple"*) with audio speech button `🔊`.
  - Rich 3D object illustration (*e.g. delicious red apple*).
  - Prominent CTA: **"🪄 Magic Pen"**.
* Previous `❮` and Next `❯` navigation buttons to browse letters.
* Star counter pill at top-right (*e.g. ⭐ 3*).
* Waving penguin mascot on bottom-right with encouraging speech bubble (*"Great job! Keep going!"*).
* **The Magic Pen Air-Tracing Experience**:
  - Clicking **"🪄 Magic Pen"** activates the live guided air-tracing overlay with MediaPipe hand tracking (Landmark 8: `INDEX_FINGER_TIP`) or tabletop mouse/touch fallback.
  - **Real-Time Feedback**: Glowing green path for correct tracing and coral-red alert path with animated directional guide arrow if straying off track.
  - Upon completion: Celebratory fanfare, star confetti explosion, and seamless return to the learning card with updated stars and progress!
