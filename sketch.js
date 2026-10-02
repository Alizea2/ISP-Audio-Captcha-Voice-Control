////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////
function setup() {
    //seting up audio captcha 
    setupCaptcha();
    
    //setting up audio visualisation 
    setupVisualisation();
    
    //setting up voice control 
    setupVoiceControl();
}

function draw() {
    //drawing visualization 
    drawVisualization();
    
    //drawing voice controlled visualization 
    drawVoiceVisualization();
}

//cleaning up when window is closed
function windowResized() {
}
////////////////////////////////////////////////////////////////mycode///////////////////////////////////////////////////////////////
