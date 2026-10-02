////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////
let visualisationCanvas;
let startVisualisationButton;
let visualSound;
let isVisualisationRunning = false;

//sound selection buttons
let sound1Button, sound2Button, sound3Button;
let currentSoundFile = './Ex2_files/Ex2_sound1.wav';
let currentSoundType = 'sound1'; 
let currentSoundDisplay;

//meyda analyzer
let meydaAnalyzer;

//audio features storage
let spectralCentroid = 0;
let rms = 0;
let zcr = 0;
let spectralRolloff = 0;

function getFeatureExtractors() {
    //returning different feature extractors based on sound type
    switch(currentSoundType) {
        case 'sound1':
            return ['rms', 'spectralCentroid', 'zcr'];
            
        case 'sound2':
            return ['rms', 'spectralRolloff', 'zcr'];
            
        case 'sound3':
            return ['rms', 'spectralRolloff', 'spectralCentroid'];
            
        default:
            return ['rms', 'spectralCentroid', 'zcr'];
    }
}
let spectralFlux = 0;
let loudness = { total: 0 };

//visual variables
let particles = [];
let wavePoints = [];
let bgColor;
let colorPalette = [];

//animation variables
let time = 0;
let rotationAngle = 0;

function setupVisualisation() {
    //creationg canvas and attach to div
    visualisationCanvas = createCanvas(600, 400);
    visualisationCanvas.parent('visualisation');
    
    //getting buttons
    startVisualisationButton = select('#start-visualisation-btn');
    sound1Button = select('#sound1-btn');
    sound2Button = select('#sound2-btn');
    sound3Button = select('#sound3-btn');
    currentSoundDisplay = select('#current-sound-display');
    
    //attaching event handlers
    startVisualisationButton.mousePressed(toggleVisualisation);
    sound1Button.mousePressed(() => selectSound(1));
    sound2Button.mousePressed(() => selectSound(2));
    sound3Button.mousePressed(() => selectSound(3));
    
    //initializing background color
    bgColor = color(20, 20, 30);
    
    //initializing color palettes for different sound types
    updateColorPalette('sound1');
    
    //initializing particles
    initializeParticles();
    
    //initializing wave points
    for (let i = 0; i < 100; i++) {
        wavePoints.push({ x: i * 6, y: height / 2, targetY: height / 2 });
    }
    
    //setting initial active button
    sound1Button.addClass('active');
}

function selectSound(soundNumber) {
    //removing active class from all buttons
    sound1Button.removeClass('active');
    sound2Button.removeClass('active');
    sound3Button.removeClass('active');
    
    //stoping current visualization if running
    if (isVisualisationRunning) {
        stopVisualisation();
    }
    
    //using switch case to select sound file and type
    switch(soundNumber) {
        case 1:
            currentSoundFile = './Ex2_files/Ex2_sound1.wav';
            currentSoundType = 'sound1';
            sound1Button.addClass('active');
            currentSoundDisplay.html('Selected: Sound 1');
            updateColorPalette('sound1');
            break;
            
        case 2:
            currentSoundFile = './Ex2_files/Ex2_sound2.wav';
            currentSoundType = 'sound2';
            sound2Button.addClass('active');
            currentSoundDisplay.html('Selected: Sound 2');
            updateColorPalette('sound2');
            break;
            
        case 3:
            currentSoundFile = './Ex2_files/Ex2_sound3.wav';
            currentSoundType = 'sound3';
            sound3Button.addClass('active');
            currentSoundDisplay.html('Selected: Sound 3');
            updateColorPalette('sound3');
            break;
            
        default:
            return;
    }
    
    //reinitializing particles for new sound type
    initializeParticles();
}

function updateColorPalette(soundType) {
    colorPalette = [];
    
    switch(soundType) {
        case 'sound1':
            colorPalette = [
                color(255, 100, 100),
                color(255, 150, 80),
                color(255, 200, 100),
                color(200, 150, 255),
                color(150, 200, 255)
            ];
            break;
            
        case 'sound2':
            colorPalette = [
                color(100, 200, 255),
                color(150, 100, 255),
                color(255, 100, 200),
                color(100, 255, 150),
                color(255, 200, 50)
            ];
            break;
            
        case 'sound3':
            colorPalette = [
                color(255, 50, 50),
                color(50, 255, 50),
                color(50, 50, 255),
                color(255, 255, 50),
                color(255, 50, 255)
            ];
            break;
    }
}

function initializeParticles() {
    particles = [];
    let numParticles = 50;
    
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            vx: random(-1, 1),
            vy: random(-1, 1),
            size: random(5, 15),
            color: random(colorPalette),
            alpha: 200,
            life: 1.0
        });
    }
}

function toggleVisualisation() {
    if (!isVisualisationRunning) {
        startVisualisation();
    } else {
        stopVisualisation();
    }
}

function startVisualisation() {
    //loading the selected audio file
    visualSound = loadSound(currentSoundFile, () => {
        
        //starting playing the sound
        visualSound.loop();
        
        //creating meyda analyzer with extended features
        if (typeof Meyda !== 'undefined') {
            meydaAnalyzer = Meyda.createMeydaAnalyzer({
                audioContext: getAudioContext(),
                source: visualSound,
                bufferSize: 512,
                featureExtractors: getFeatureExtractors(),
                callback: features => {
                    if (features) {
                        //updating only the features relevant to current sound type
                        rms = features.rms || 0;
                        
                        //updating based on sound type using switch
                        switch(currentSoundType) {
                            case 'sound1':
                                spectralCentroid = features.spectralCentroid || 0;
                                zcr = features.zcr || 0;
                                break;
                                
                            case 'sound2':
                                spectralRolloff = features.spectralRolloff || 0;
                                zcr = features.zcr || 0;
                                break;
                                
                            case 'sound3':
                                spectralRolloff = features.spectralRolloff || 0;
                                spectralCentroid = features.spectralCentroid || 0;
                                break;
                        }
                    }
                }
            });
            
            meydaAnalyzer.start();
        }
        
        isVisualisationRunning = true;
        startVisualisationButton.html('Stop Visualisation');
        
    }, (err) => {
        alert(`Error loading ${currentSoundFile}. Please check if the file exists.`);
    });
}

function stopVisualisation() {
    if (visualSound && visualSound.isPlaying()) {
        visualSound.stop();
    }
    
    if (meydaAnalyzer) {
        meydaAnalyzer.stop();
    }
    
    isVisualisationRunning = false;
    startVisualisationButton.html('Start Visualisation');
}

function drawVisualization() {
    if (!isVisualisationRunning) {
        background(bgColor);
        
        //drawing static message
        fill(200);
        textAlign(CENTER, CENTER);
        textSize(20);
        text('Click "Start Visualisation" to begin', width/2, height/2);
        textSize(14);
        text('Select a sound file above', width/2, height/2 + 30);
        return;
    }
    
    //updating time and rotation
    time += 0.02;
    rotationAngle += 0.01;
    
    //dynamic background based on RMS
    let bgBrightness = map(rms, 0, 0.5, 20, 60);
    bgColor = color(bgBrightness, bgBrightness - 10, bgBrightness + 10);
    background(bgColor);
    
    //drawing different visualizations based on sound type
    switch(currentSoundType) {
        case 'sound1':
            drawSound1Visualization();
            break;
            
        case 'sound2':
            drawSound2Visualization();
            break;
            
        case 'sound3':
            drawSound3Visualization();
            break;
    }
    
    //displaying feature values
    displayFeatureValues();
}

function drawSound1Visualization() {
    //drawing horizontal spectrum bars
    let numBars = 40;
    let barHeight = height / numBars;
    
    for (let i = 0; i < numBars; i++) {
        //bar width controlled by RMS 
        let maxWidth = width * 0.8;
        let barWidth = map(rms, 0, 0.3, 50, maxWidth);
        
        //adding wave motion based on ZCR
        let waveOffset = sin(time * 2 + i * 0.3) * map(zcr, 0, 0.5, 10, 40);
        barWidth += waveOffset;
        
        //x position centered with wave
        let x = (width - barWidth) / 2;
        let y = i * barHeight;
        
        //color based on spectralCentroid
        let hue = map(spectralCentroid, 0, 5000, 180, 360);
        let individualHue = (hue + i * 5) % 360;
        
        colorMode(HSB, 360, 100, 100, 255);
        
        //creating gradient effect
        let saturation = map(i, 0, numBars, 60, 100);
        let brightness = map(rms, 0, 0.3, 50, 100);
        
        //drawing shadow/glow
        for (let g = 3; g > 0; g--) {
            fill(individualHue, saturation - 20, brightness, 40);
            rect(x - g * 2, y, barWidth + g * 4, barHeight);
        }
        
        //main bar
        fill(individualHue, saturation, brightness, 255);
        rect(x, y, barWidth, barHeight - 2);
        
        //highlight based on ZCR 
        if (zcr > 0.1) {
            let highlightWidth = map(zcr, 0.1, 0.5, 5, 20);
            fill(individualHue, 40, 100, 200);
            rect(x + barWidth - highlightWidth, y, highlightWidth, barHeight - 2);
        }
    }
    
    colorMode(RGB, 255, 255, 255, 255);
    
    //adding vertical center pulse
    push();
    translate(width / 2, height / 2);
    
    //pulsing circles based on audio features
    let numCircles = 8;
    for (let i = 0; i < numCircles; i++) {
        let radius = map(i, 0, numCircles, 20, 150);
        let pulseSize = map(rms, 0, 0.3, 0, 30);
        let currentRadius = radius + pulseSize + sin(time * 3 + i) * 10;
        
        //coloring varies with spectral centroid
        let hue = map(spectralCentroid, 0, 5000, 180, 360);
        colorMode(HSB, 360, 100, 100, 255);
        
        noFill();
        stroke(hue + i * 15, 80, 90, map(i, 0, numCircles, 200, 50));
        strokeWeight(map(zcr, 0, 0.5, 1, 4));
        
        ellipse(0, 0, currentRadius * 2, currentRadius * 2);
        
        //adding rotating dots on circles based on ZCR
        if (i % 2 === 0) {
            let numDots = int(map(zcr, 0, 0.5, 4, 12));
            for (let d = 0; d < numDots; d++) {
                let angle = map(d, 0, numDots, 0, TWO_PI) + time;
                let dotX = cos(angle) * currentRadius;
                let dotY = sin(angle) * currentRadius;
                
                noStroke();
                fill(hue + i * 15, 90, 100, 255);
                ellipse(dotX, dotY, 6, 6);
            }
        }
    }
    
    //central bright core
    let coreSize = map(rms, 0, 0.3, 20, 50);
    let hue = map(spectralCentroid, 0, 5000, 180, 360);
    
    //glowing layers
    for (let i = 4; i > 0; i--) {
        fill(hue, 60, 100, 60 / i);
        ellipse(0, 0, coreSize + i * 12, coreSize + i * 12);
    }
    
    fill(hue, 80, 100, 255);
    ellipse(0, 0, coreSize, coreSize);
    
    pop();
    colorMode(RGB, 255, 255, 255, 255);
}

function drawSound2Visualization() {
    //updating and draw particles
    for (let particle of particles) {
        //speed controlled by RMS
        let speedMult = map(rms, 0, 0.5, 0.5, 3);
        particle.x += particle.vx * speedMult;
        particle.y += particle.vy * speedMult;
        
        //turbulence based on ZCR 
        let turbulence = map(zcr, 0, 1, 0, 3);
        particle.x += random(-turbulence, turbulence);
        particle.y += random(-turbulence, turbulence);
        
        //wave motion based on spectral rolloff
        let waveIntensity = map(spectralRolloff, 0, 22050, 5, 40);
        let waveOffset = sin(time + particle.x * 0.05) * waveIntensity;
        particle.y += waveOffset * 0.1;
        
        //wrap around screen
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        //particle size based on RMS
        let size = map(rms, 0, 0.5, particle.size * 0.5, particle.size * 2.5);
        
        //color intensity based on spectral rolloff
        let alpha = map(spectralRolloff, 0, 22050, 100, 255);
        
        //drawing particle glow
        noStroke();
        for (let i = 2; i >= 0; i--) {
            let glowSize = size + (i * 8);
            let glowAlpha = alpha / (i + 2);
            fill(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], glowAlpha);
            ellipse(particle.x, particle.y, glowSize, glowSize);
        }
        
        //main particle
        fill(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], alpha);
        ellipse(particle.x, particle.y, size, size);
        
        //drawing connecting lines based on ZCR
        let maxDistance = map(zcr, 0, 1, 50, 120);
        for (let other of particles) {
            let d = dist(particle.x, particle.y, other.x, other.y);
            if (d < maxDistance && d > 0) {
                let lineAlpha = map(d, 0, maxDistance, 150, 0);
                stroke(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], lineAlpha);
                strokeWeight(map(rms, 0, 0.5, 0.5, 2));
                line(particle.x, particle.y, other.x, other.y);
            }
        }
    }
}

function drawSound3Visualization() {
    let numBars = 30;
    let barWidth = width / numBars;
    
    for (let i = 0; i < numBars; i++) {
        //bar height based on RMS 
        let baseHeight = map(rms, 0, 0.5, 20, height * 0.7);
        
        //variation based on spectralRolloff
        let rolloffVariation = map(spectralRolloff, 0, 22050, 0, 50);
        let variation = sin(time + i * 0.3) * rolloffVariation;
        
        let barHeight = baseHeight + variation;
        
        //color hue based on spectralCentroid
        let hue = map(spectralCentroid, 0, 8000, 0, 360);
        let individualHue = (hue + i * 12) % 360;
        colorMode(HSB);
        
        //saturation based on spectralRolloff
        let sat = map(spectralRolloff, 0, 22050, 40, 100);
        
        //brightness based on RMS
        let bright = map(rms, 0, 0.5, 50, 100);
        
        //draw glow layers
        for (let j = 0; j < 3; j++) {
            let glowAlpha = map(j, 0, 3, map(rms, 0, 0.5, 80, 150), 10);
            fill(individualHue, sat, bright, glowAlpha);
            let glowSize = j * 2;
            rect(i * barWidth - glowSize, height - barHeight - glowSize, 
                 barWidth + glowSize * 2, barHeight + glowSize);
        }
        
        //main bar
        fill(individualHue, sat, bright, 255);
        noStroke();
        rect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
        
        //pop highlight based on spectral centroid
        let highlightBright = map(spectralCentroid, 0, 8000, 60, 100);
        fill(individualHue, 20, highlightBright, 180);
        rect(i * barWidth, height - barHeight, barWidth - 2, 5);
    }
    
    colorMode(RGB);
    
    //central radial burst controlled by features
    if (rms > 0.2) {
        push();
        translate(width / 2, height / 2);
        
        //burst size based on RMS
        let burstSize = map(rms, 0.2, 0.6, 30, 180);
        
        //number of lines based on spectralRolloff
        let numLines = int(map(spectralRolloff, 0, 22050, 8, 24));
        
        //rotation based on spectralCentroid
        rotate(map(spectralCentroid, 0, 8000, 0, PI));
        
        colorMode(HSB);
        for (let i = 0; i < numLines; i++) {
            let angle = map(i, 0, numLines, 0, TWO_PI);
            
            //color from spectralCentroid
            let lineHue = map(spectralCentroid, 0, 8000, 0, 360);
            let individualLineHue = (lineHue + i * 15) % 360;
            
            stroke(individualLineHue, 80, 100, map(rms, 0.2, 0.6, 100, 200));
            strokeWeight(map(rms, 0.2, 0.6, 2, 5));
            
            let x = cos(angle) * burstSize;
            let y = sin(angle) * burstSize;
            line(0, 0, x, y);
            
            noStroke();
            fill(individualLineHue, 90, 100, 255);
            ellipse(x, y, 8, 8);
        }
        
        pop();
        colorMode(RGB);
    }
}

function displayFeatureValues() {
    //semi transparent background for text
    fill(0, 0, 0, 150);
    noStroke();
    rect(5, 5, 160, 80, 5);
    
    fill(255);
    textAlign(LEFT);
    textSize(11);
    text(`Sound: ${currentSoundType}`, 10, 20);
    text(`RMS: ${rms.toFixed(3)}`, 10, 35);
    
    //displaying features based on current sound type
    switch(currentSoundType) {
        case 'sound1':
            text(`Centroid: ${spectralCentroid.toFixed(1)}`, 10, 50);
            text(`ZCR: ${zcr.toFixed(3)}`, 10, 65);
            text(`Features: RMS, Centroid, ZCR`, 10, 80);
            break;
            
        case 'sound2':
            text(`Rolloff: ${spectralRolloff.toFixed(1)}`, 10, 50);
            text(`ZCR: ${zcr.toFixed(3)}`, 10, 65);
            text(`Features: RMS, Rolloff, ZCR`, 10, 80);
            break;
            
        case 'sound3':
            text(`Rolloff: ${spectralRolloff.toFixed(1)}`, 10, 50);
            text(`Centroid: ${spectralCentroid.toFixed(1)}`, 10, 65);
            text(`Features: RMS, Rolloff, Centroid`, 10, 80);
            break;
    }
}
////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////