////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////
//declaring global variables
let captchaAudio;
let captchaInput;
let submitButton;
let playButton;
let captchaResult;
let regenerateButton;
let fft; 
let waveformCanvas;
let ctx;

let noiseOscillator;
let noiseFilter;
let staticNoise;

let currentCaptchaType = 0;
let captchaAnswer = "awesome";

let captchaLowPass;
let captchaHighPass;
let captchaBandPass;
let captchaReverb;
let captchaDelay;
let captchaCompressor;
let captchaWaveShaper;

let effectParams = {
    playbackRate: 0.5, 
    volume: 1.0,
    noiseLevel: 0.0,
    distortionAmount: 0,
    lowPassFreq: 0,
    highPassFreq: 0,
    bandPassFreq: 0,
    bandPassRes: 0,
    filterRes: 0,
    reverbTime: 0,
    delayTime: 0,
    delayFeedback: 0
};

//playing or stopping the captcha audio
function playCaptchaAudio() {
    if (captchaAudio && captchaAudio.isLoaded()) {
        if (captchaAudio.isPlaying()) {
            //stop audio and noise effects
            captchaAudio.stop();
            if (noiseOscillator) {
                noiseOscillator.amp(0, 0.1);
                noiseOscillator.stop();
            }
            if (staticNoise) {
                staticNoise.amp(0, 0.1);
                staticNoise.stop();
            }
            playButton.html('Play Audio');
        } else {
            //play audio with set playback rate and volume
            captchaAudio.rate(effectParams.playbackRate);
            captchaAudio.setVolume(effectParams.volume);
            captchaAudio.play();
            
            //adding noise effects if noise level is set
            if (effectParams.noiseLevel > 0) {
                if (noiseOscillator) {
                    noiseOscillator.amp(effectParams.noiseLevel * 0.7, 0.1);
                    noiseOscillator.start();
                }
                if (staticNoise) {
                    staticNoise.amp(effectParams.noiseLevel * 0.5, 0.1);
                    staticNoise.start();
                }
            }
            
            captchaAudio.onended(() => {
                //stop noise effects when audio ends
                if (noiseOscillator) {
                    noiseOscillator.amp(0, 0.1);
                    noiseOscillator.stop();
                }
                if (staticNoise) {
                    staticNoise.amp(0, 0.1);
                    staticNoise.stop();
                }
                playButton.html('Play Audio');
            });
            
            playButton.html('Stop Audio');
            captchaResult.html('');
            
            //visualizing the waveform of the audio
            visualizeWaveform();
        }
    } else {
        captchaResult.html('Audio not loaded yet. Please wait...');
        captchaResult.style('color', 'orange');
    }
}

//visualizing the waveform of the captcha audio
function visualizeWaveform() {
    fft = new p5.FFT(0.8, 1024);

    waveformCanvas = document.getElementById('waveformCanvas');
    ctx = waveformCanvas.getContext('2d');
    ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    function drawWaveform() {
        let waveform = fft.waveform();
        
        ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        
        ctx.beginPath();
        ctx.moveTo(0, waveformCanvas.height / 2);

        //drawing waveform on the canvas
        for (let i = 0; i < waveform.length; i++) {
            let x = map(i, 0, waveform.length, 0, waveformCanvas.width);
            let y = map(waveform[i], -1, 1, 0, waveformCanvas.height);
            ctx.lineTo(x, y);
        }
        //setting waveform color
        ctx.strokeStyle = '#3498db';  
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function animate() {
        drawWaveform();
        //animating continuously
        requestAnimationFrame(animate);  
    }

    animate();
}

//checking the users captcha answer
function checkCaptchaAnswer() {
    let answer = captchaInput.value().toLowerCase().trim();
    
    if (answer === '') {
        captchaResult.html('Please enter an answer.');
        captchaResult.style('color', 'orange');
        return;
    }
    
    if (answer === captchaAnswer) {
        captchaResult.html('✓ Captcha passed! Access granted.');
        captchaResult.style('color', 'green');
    } else {
        captchaResult.html('✗ Incorrect answer, try again.');
        captchaResult.style('color', 'red');
    }
}

//regenerating the captcha with new audio and effects
function regenerateCaptcha() {
    if (captchaAudio && captchaAudio.isPlaying()) {
        captchaAudio.stop();
    }
    if (noiseOscillator) {
        noiseOscillator.stop();
    }
    if (staticNoise) {
        staticNoise.stop();
    }
    //switching captcha type
    let newType = currentCaptchaType === 0 ? 1 : 0;  
    //randomize effect parameters
    randomizeEffects(newType);  
    //loading new captcha audio
    loadCaptchaAudio(newType);  
    
    captchaResult.html('New captcha generated. Click Play Audio.');
    captchaResult.style('color', 'blue');
    captchaInput.value('');
    playButton.html('Play Audio');
}

//randomizing the effect parameters for captcha audio
function randomizeEffects(type) {
    effectParams.playbackRate = random(0.3, 0.6); 
    effectParams.volume = random(0.7, 1.0);
    effectParams.noiseLevel = random(0.05, 0.15);
    effectParams.distortionAmount = random(300, 800);
    
    if (type === 0) {
        effectParams.lowPassFreq = random(600, 1200);
        effectParams.highPassFreq = random(150, 350);
        effectParams.bandPassFreq = random(500, 1000);
        effectParams.reverbTime = random(3, 5);
        effectParams.delayTime = random(0.1, 0.18);
        effectParams.delayFeedback = random(0.4, 0.6);
    } else {
        effectParams.lowPassFreq = random(550, 1100);
        effectParams.highPassFreq = random(200, 400);
        effectParams.bandPassFreq = random(450, 950);
        effectParams.reverbTime = random(3.5, 5.5);
        effectParams.delayTime = random(0.12, 0.22);
        effectParams.delayFeedback = random(0.45, 0.65);
    }
    effectParams.filterRes = random(8, 20);
    effectParams.bandPassRes = random(5, 15);
}

//loading the captcha audio based on the type
function loadCaptchaAudio(type) {
    if (captchaAudio) {
        if (captchaAudio.isPlaying()) {
            captchaAudio.stop();
        }
        captchaAudio = null;
    }
    
    let audioFile;
    if (type === 0) {
        audioFile = './Ex2_files/awesome.wav';
        captchaAnswer = 'awesome';
    } else {
        audioFile = './Ex2_files/excellent.wav';
        captchaAnswer = 'excellent';
    }

    //setting the current captcha type
    currentCaptchaType = type;  
    captchaAudio = loadSound(audioFile, () => {
        //disconnecting the audio source
        captchaAudio.disconnect();  
        
        //connecting the audio to various effects
        captchaAudio.connect(captchaWaveShaper);
        captchaWaveShaper.connect(captchaHighPass);
        captchaHighPass.connect(captchaBandPass);
        captchaBandPass.connect(captchaLowPass);
        captchaLowPass.connect(captchaDelay);
        captchaDelay.connect(captchaReverb);
        captchaReverb.connect(captchaCompressor);
        
        //setting effect parameters
        captchaWaveShaper.setType(effectParams.distortionAmount);
        captchaHighPass.set(effectParams.highPassFreq, effectParams.filterRes);
        captchaBandPass.freq(effectParams.bandPassFreq);
        captchaBandPass.res(effectParams.bandPassRes);
        captchaLowPass.freq(effectParams.lowPassFreq);
        captchaLowPass.res(effectParams.filterRes);
        captchaDelay.process(captchaAudio, effectParams.delayTime, effectParams.delayFeedback, 2300);
        captchaReverb.process(captchaAudio, effectParams.reverbTime, 2);
        captchaCompressor.process(captchaAudio, 0.001, 0.35, -30, 16, 0.2);
        
        if (playButton) {
            playButton.html('Play Audio');
        }
        
    }, (err) => {
        console.error('Error loading captcha audio:', err);
        if (captchaResult) {
            captchaResult.html('Error loading audio file. Check console.');
            captchaResult.style('color', 'red');
        }
    });
}

//initializing captcha related elements and effects
function setupCaptcha() {
    captchaLowPass = new p5.LowPass();
    captchaHighPass = new p5.HighPass();
    captchaBandPass = new p5.BandPass();
    captchaReverb = new p5.Reverb();
    captchaDelay = new p5.Delay();
    captchaCompressor = new p5.Compressor();
    captchaWaveShaper = new p5.Distortion(); 
    
    noiseOscillator = new p5.Oscillator('sine');
    staticNoise = new p5.Noise('white');
    
    noiseFilter = new p5.LowPass();
    noiseFilter.freq(600);
    noiseOscillator.disconnect();
    noiseOscillator.connect(noiseFilter);
    
    captchaInput = select('#captcha-input');
    submitButton = select('#submit-btn');
    playButton = select('#play-btn');
    captchaResult = select('#captcha-result');
    regenerateButton = select('#regenerate-btn');
    
     //handling captcha answer submission
    submitButton.mousePressed(checkCaptchaAnswer); 
     //handling play audio button
    playButton.mousePressed(playCaptchaAudio); 
    //handlingg regenerate captcha button
    regenerateButton.mousePressed(regenerateCaptcha);  
    
    //initializing random effects for the first captcha
    randomizeEffects(0);
    //loading the first captcha audio  
    loadCaptchaAudio(0);  
}
////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////