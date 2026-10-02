# Audio Captcha, Visualisation & Voice Control

A browser app with three audio signal processing tasks, built with **p5.js**, **p5.sound**, **Meyda** (audio feature extraction) and **p5.speech** (speech recognition).

Exercise 2 of an Intelligent Signal Processing course.

## Features

### Task 2.1: Audio Captcha
- Plays a spoken word that has been deliberately scrambled so it's hard for bots to recognise: slowed down, with added noise, distortion, high-pass, band-pass and low-pass filters, delay and reverb
- Every time you click **Regenerate Captcha**, the effect settings are randomised and the word changes
- A live waveform is drawn while the audio plays
- Type what you hear and click **Submit** to check your answer

### Task 2.2: Audio Visualisation with Meyda
- Pick one of three sounds and click **Start Visualisation**
- Meyda extracts audio features in real time: **RMS** (loudness), **spectral centroid**, **spectral rolloff** and **zero-crossing rate**
- Each sound uses a different set of features, which drive the size, colour and movement of the visuals

### Task 2.3: Voice Controller
- Click **Start Voice Control** and speak commands to change the music-reactive visualisation:
  - **Colours**: "Red", "Blue", "Green", "Black", "White"
  - **Shapes**: "Circle", "Square", "Triangle", "Pentagon"
- The shapes pulse, rotate and move based on the music's RMS, spectral centroid and spectral rolloff, and the background flashes on loud moments

## Running the App

The app loads audio files and uses the microphone, so it has to be served over a local web server. Opening `index.html` directly won't work.

### Quick start (one command)

**Step 1:** Run this command in the terminal first. It downloads the project from GitHub into a temporary folder and starts a local web server:

```bash
D=$(mktemp -d) && gh repo clone Alizea2/ISP-Audio-Captcha-Voice-Control "$D" && cd "$D" && python3 -m http.server 8000
```

**Step 2:** Once the terminal shows `Serving HTTP on ... port 8000`, click this link to open the app. Use **Google Chrome**, because voice control relies on Chrome's speech recognition.

**<http://localhost:8000>**

When you start voice control, click **Allow** when the browser asks for the microphone.

Keep the terminal open while you use it. When you're done, press `Ctrl + C` in the terminal to stop the server.

> This needs the [GitHub CLI](https://cli.github.com/) (`gh`) signed in to an account that can access this repository, Python 3, and an internet connection (p5.js, p5.sound, p5.speech and Meyda are loaded from CDNs).

### Other ways to run it

From inside the project folder:

**VS Code:** install the *Live Server* extension, right-click `index.html`, and choose **Open with Live Server**.

**Python:** run `python3 -m http.server 8000`, then open <http://localhost:8000>.

## Project Structure

| File / Folder | Purpose |
|---------------|---------|
| `index.html` | Page layout and library loading |
| `style.css` | Styling |
| `sketch.js` | p5.js setup and draw loop |
| `captcha.js` | Task 2.1: audio captcha effects, waveform and answer checking |
| `visualisation.js` | Task 2.2: Meyda feature extraction and visualisation |
| `voiceControl.js` | Task 2.3: speech commands and music-reactive shapes |
| `Ex2_files/` | Captcha words, the three sounds and the voice-control music |
| `libraries/` | Local copies of p5.js, p5.sound and p5.speech |

## Built With

- [p5.js](https://p5js.org/) and [p5.sound](https://p5js.org/reference/#/libraries/p5.sound)
- [Meyda](https://meyda.js.org/): audio feature extraction
- [p5.speech](https://idmnyu.github.io/p5.js-speech/): speech recognition

## Related exercises

- [ISP-Audio-Effects-App](https://github.com/Alizea2/ISP-Audio-Effects-App): Exercise 1
- [ISP-Audio-Steganography](https://github.com/Alizea2/ISP-Audio-Steganography): Exercise 3
- [ISP-Airport-Speech-Recognition](https://github.com/Alizea2/ISP-Airport-Speech-Recognition): Exercise 4

## Author

[@Alizea2](https://github.com/Alizea2)
