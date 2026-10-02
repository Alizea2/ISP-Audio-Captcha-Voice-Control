////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////
let voiceControlButton;
let speechRec;
let voiceControlActive = false;
let voiceMusicSound;
let voiceCanvas;

//voice control state
let voiceBgColor;
let currentShape = 'circle';
let voiceShapes = [];

//meyda analyzer for voice control music
let voiceMeydaAnalyzer;
let voiceRms = 0;
let voiceSpectralCentroid = 0;
let voiceSpectralRolloff = 0;

//special effect trigger
let specialEffectActive = false;
let specialEffectTimer = 0;

function setupVoiceControl() {
    voiceControlButton = select('#start-voice-control');
    voiceControlButton.mousePressed(toggleVoiceControl);
    
    //initializeing speech recognition for user commands
    speechRec = new p5.SpeechRec('en-US', gotSpeech);
    speechRec.continuous = true;
    speechRec.interimResults = false;
    
    //initializing voice control visuals
    voiceBgColor = color(255);
    
    //initializing shapes array with velocity for movement
    for (let i = 0; i < 8; i++) {
        voiceShapes.push({
            x: random(50, width - 50),
            y: random(50, height - 50),
            size: random(30, 80),
            type: 'circle',
            col: color(random(255), random(255), random(255)),
            vx: random(-2, 2),
            vy: random(-2, 2)
        });
    }
}

function toggleVoiceControl() {
    if (!voiceControlActive) {
        startVoiceControl();
    } else {
        stopVoiceControl();
    }
}

function startVoiceControl() {
    //loading music file for voice controlled visualization
    voiceMusicSound = loadSound('./Ex2_files/Kalte_Ohren_(_Remix_).mp3', () => {
        voiceMusicSound.loop();
        
        //creating meyda analyzer for the music
        if (typeof Meyda !== 'undefined') {
            voiceMeydaAnalyzer = Meyda.createMeydaAnalyzer({
                audioContext: getAudioContext(),
                source: voiceMusicSound,
                bufferSize: 512,
                featureExtractors: ['rms', 'spectralCentroid', 'spectralRolloff'],
                callback: features => {
                    if (features) {
                        voiceRms = features.rms || 0;
                        voiceSpectralCentroid = features.spectralCentroid || 0;
                        voiceSpectralRolloff = features.spectralRolloff || 0;
                        
                        //simple detection based on RMS spike
                        if (voiceRms > 0.15 && !specialEffectActive) {
                            triggerSpecialEffect();
                        }
                    }
                }
            });
            
            voiceMeydaAnalyzer.start();
        }
    }, (err) => {
        alert('Could not load Kalte_Ohren_(_Remix_).mp3. Make sure the file exists.');
    });
    
    //starting speech recognition for user commands
    speechRec.start();
    voiceControlActive = true;
    voiceControlButton.html('Stop Voice Control');
}

function stopVoiceControl() {
    if (voiceMusicSound && voiceMusicSound.isPlaying()) {
        voiceMusicSound.stop();
    }
    
    if (voiceMeydaAnalyzer) {
        voiceMeydaAnalyzer.stop();
    }
    
    speechRec.stop();
    voiceControlActive = false;
    voiceControlButton.html('Start Voice Control');
}

function gotSpeech() {
    if (speechRec.resultValue) {
        let command = speechRec.resultString.toLowerCase();
        parseVoiceCommand(command);
    }
}

function parseVoiceCommand(command) {
    //color commands
    if (command.includes('black')) {
        voiceBgColor = color(0);
    } else if (command.includes('white')) {
        voiceBgColor = color(255);
    } else if (command.includes('red')) {
        voiceBgColor = color(255, 0, 0);
    } else if (command.includes('blue')) {
        voiceBgColor = color(0, 0, 255);
    } else if (command.includes('green')) {
        voiceBgColor = color(0, 255, 0);
    }
    
    //shape commands
    if (command.includes('circle')) {
        currentShape = 'circle';
        updateShapeTypes('circle');
    } else if (command.includes('square')) {
        currentShape = 'square';
        updateShapeTypes('square');
    } else if (command.includes('triangle')) {
        currentShape = 'triangle';
        updateShapeTypes('triangle');
    } else if (command.includes('pentagon')) {
        currentShape = 'pentagon';
        updateShapeTypes('pentagon');
    }
}

function updateShapeTypes(shapeType) {
    for (let shape of voiceShapes) {
        shape.type = shapeType;
    }
}

function triggerSpecialEffect() {
    specialEffectActive = true;
    specialEffectTimer = 60; 
}

function drawVoiceVisualization() {
    if (!voiceControlActive) {
        return;
    }
    
    //drawing background with RMS based brightness variation
    let bgBrightness = brightness(voiceBgColor);
    let rmsBrightness = map(voiceRms, 0, 0.3, 0, 50);
    
    //modulate background brightness based on music energy
    let r = red(voiceBgColor) + rmsBrightness;
    let g = green(voiceBgColor) + rmsBrightness;
    let b = blue(voiceBgColor) + rmsBrightness;
    background(constrain(r, 0, 255), constrain(g, 0, 255), constrain(b, 0, 255));
    
    //special effect background flash when high energy detected
    if (specialEffectActive) {
        specialEffectTimer--;
        if (specialEffectTimer <= 0) {
            specialEffectActive = false;
        }
        
        //flash effect
        let flashAlpha = map(specialEffectTimer, 0, 60, 0, 150);
        fill(255, 255, 255, flashAlpha);
        rect(0, 0, width, height);
    }
    
    //drawing shapes with music reactive properties
    for (let shape of voiceShapes) {
        push();
        translate(shape.x, shape.y);
        
        //animating based on music features
        if (voiceMusicSound && voiceMusicSound.isPlaying()) {
            //sizing modulation based on RMS 
            let sizeMod = map(voiceRms, 0, 0.3, 0.8, 2.0);
            
            //additional pulsing during special effect
            if (specialEffectActive) {
                sizeMod *= 1.5;
            }
            
            scale(sizeMod);
            
            //rotation speed based on spectral centroid 
            let rotationSpeed = map(voiceSpectralCentroid, 0, 5000, 0.01, 0.05);
            rotate(frameCount * rotationSpeed);
            
            //moving shapes based on spectral rolloff
            let moveAmount = map(voiceSpectralRolloff, 0, 22050, 0.5, 2.0);
            shape.x += shape.vx * moveAmount;
            shape.y += shape.vy * moveAmount;
            
            //bouncing off edges
            if (shape.x < 0 || shape.x > width) shape.vx *= -1;
            if (shape.y < 0 || shape.y > height) shape.vy *= -1;
            
            //keeping shapes within bounds
            shape.x = constrain(shape.x, 0, width);
            shape.y = constrain(shape.y, 0, height);
        }
        
        //color modulation based on spectral centroid
        let colorMod = map(voiceSpectralCentroid, 0, 5000, 0.7, 1.3);
        let modR = constrain(shape.col.levels[0] * colorMod, 0, 255);
        let modG = constrain(shape.col.levels[1] * colorMod, 0, 255);
        let modB = constrain(shape.col.levels[2] * colorMod, 0, 255);
        
        fill(modR, modG, modB);
        stroke(0);
        strokeWeight(map(voiceRms, 0, 0.3, 1, 4));
        
        //drawing different shapes
        drawShape(shape.type, shape.size);
        
        pop();
    }
    
    //drawing audio reactive circle visualizer in center during special effect
    if (specialEffectActive) {
        push();
        translate(width / 2, height / 2);
        
        //drawing pulsing circles
        let numCircles = 5;
        for (let i = 0; i < numCircles; i++) {
            let radius = map(i, 0, numCircles, 30, 150);
            let pulseSize = map(voiceRms, 0, 0.3, 0, 50);
            let currentRadius = radius + pulseSize;
            
            noFill();
            stroke(255, 100, 100, map(i, 0, numCircles, 200, 50));
            strokeWeight(3);
            ellipse(0, 0, currentRadius * 2, currentRadius * 2);
        }
        
        pop();
    }
    
    //displaying current settings and music features
    displayVoiceStatus();
}

function drawShape(type, size) {
    switch(type) {
        case 'circle':
            ellipse(0, 0, size, size);
            break;
        case 'square':
            rectMode(CENTER);
            rect(0, 0, size, size);
            break;
        case 'triangle':
            drawTriangle(size);
            break;
        case 'pentagon':
            drawPentagon(size);
            break;
    }
}

function drawTriangle(size) {
    //height of equilateral triangle
    let h = size * 0.866; 
    triangle(0, -h/2, -size/2, h/2, size/2, h/2);
}

function drawPentagon(size) {
    let radius = size / 2;
    beginShape();
    for (let i = 0; i < 5; i++) {
        let angle = TWO_PI / 5 * i - PI / 2;
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        vertex(x, y);
    }
    endShape(CLOSE);
}

function displayVoiceStatus() {
    fill(0);
    noStroke();
    textAlign(LEFT);
    textSize(12);
    
    //background color based on brightness
    let bgBright = (red(voiceBgColor) + green(voiceBgColor) + blue(voiceBgColor)) / 3;
    if (bgBright < 128) {
        fill(255); 
    } else {
        fill(0); 
    }
    
    text(`Voice Control: Active`, 10, 20);
    text(`Shape: ${currentShape}`, 10, 40);
    text('Say: Red, Blue, Green, Black, White', 10, 60);
    text('Say: Circle, Square, Triangle, Pentagon', 10, 80);
    
    //displaying music features
    text(`Music RMS: ${voiceRms.toFixed(3)}`, 10, 110);
    text(`Spectral Centroid: ${voiceSpectralCentroid.toFixed(1)}`, 10, 130);
    text(`Spectral Rolloff: ${voiceSpectralRolloff.toFixed(1)}`, 10, 150);
    
    if (specialEffectActive) {
        fill(255, 0, 0);
        textSize(16);
        text('⚡ HIGH ENERGY DETECTED ⚡', 10, 180);
    }
}
////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////