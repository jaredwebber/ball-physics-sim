/* Written with jshint linting enabled */
/* https://jshint.com/docs/ */
/* jshint esversion: 6 */
/* jshint browser: true */

/* physics calculations from https://spicyyoghurt.com */

/*GAME MODIFIERS*/
var MAXSIZE = 10;//MAX RADIUS of the generated balls (-MINSIZE)
var MINSIZE = 20;//MIN RADIUS of the generated balls MUST BE >1
var SPEEDMULTIPLIER = 20;//a speed multiplier for the velocity of all creatures
var NUMBALLS = 20;//number of balls (creatures) on the canvas
var BASEMULT = 5000;//large value used in generation of several randomized stats

//linking html canvas with js
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//Calculation for the size of the canvas displayed
canvas.width = 7 * window.innerWidth / 8;
canvas.height = 6 * window.innerHeight / 8;
const WIDTH = canvas.width;//Constants used throughout for width of canvas
const HEIGHT = canvas.height;//Constants used throughout for the height of canvas


var currentID = 0;//unique identifier for the next creature generated
var Creatures = [];//array storing all creatures in existance

/* 
 * Each instance of Creature is a ball displayed on the canvas
 *
 * Creature class includes constructor and drawCreature functions, as
 * well as a printInfo() debug helper
 */
class Creature{
    
    //Constructor for the initialization of new creature instance
    constructor(){
        //add the creature to global tracking array
        Creatures.push(this);
        //unique Identifier
        this.id= currentID++;
        //radius of ball in pixels
        this.radius = getRandomSize();
        //x coordinate of center of the ball
        this.x =getRandomX(this.radius);
        //y coordinate of the center of the ball
        this.y = getRandomY(this.radius);
        //rgb colour of the ball
        this.colour = getRandomRgb();
        //value between 0 and 1 deciding how velocity is split between x and y
        var proportion = Math.random();
        //x velocity
        this.dx = getXVector(this.radius, proportion);
        //y velocity
        this.dy = getYVector(this.radius, 1-proportion);
        //boolean tracking if ball is colliding with another ball
        this.isColliding = false;
    }
    
     //function responsible for drawing the desired creature to canvas
     drawCreature(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.closePath();
    }
    
    //debug function - not meant to be included in 'production' models
    printInfo(){
        //console.log("ID:" + this.id+", size:" + this.radius +", x:" + this.x +", y:" + this.y + ", dx:"+this.dx+", dy:"+this.dy +", colliding:"+this.isColliding);
    }
    
}

/*
 * updateLocation() function takes the current x and y velocities and
 * adds the values to the current x and y positions, animating their
 * movement
 */
function updateLocation(){
    //for loop iterates through all existing creatures
    for(var i = 0;i<currentID;i++){
        Creatures[i].x += Creatures[i].dx;
        Creatures[i].y += Creatures[i].dy;
    }
}

/*
 * detectWallCollisions() is responsible for detecting and responding
 * to balls colliding with the outside of the canvas.
 */
function detectWallCollision(){
    //iterate through all existing creatures
    for(var i = 0; i<currentID;i++){
        if(Creatures[i].x-Creatures[i].radius < 0){//hitting left wall
            Creatures[i].dx = -Creatures[i].dx;
        }
        else if(Creatures[i].x+Creatures[i].radius > WIDTH){//hitting right wall
            Creatures[i].dx = -Creatures[i].dx;
        }
        else if(Creatures[i].y-Creatures[i].radius < 0){//hitting top wall
            Creatures[i].dy = -Creatures[i].dy;
        }
        else if(Creatures[i].y+Creatures[i].radius > HEIGHT){//hitting bottom wall
            Creatures[i].dy = -Creatures[i].dy;
        }
    }
    
}

/* function returns a random radius within the bounds of MINSIZE and MAXSIZE */
function getRandomSize(){
    return MINSIZE+Math.round(Math.random()*BASEMULT%MAXSIZE);
}

/*
 * getRandomX function returns a x coordinate within the bounds the canvas,
 * taking into account the size of the ball, making sure the ball doesnt
 * overlap with the edge of the canvas.
 */
function getRandomX(rad){
    var value = 0;
    //do-while generates positions until the ball fits entirely within canvas
    do{
        value = Math.round(Math.random()*BASEMULT%WIDTH);
    }
    while(value-rad < 0 || value+rad > WIDTH);
                    
    return value;
}

/*
 * getRandomY function returns a x coordinate within the bounds the canvas,
 * taking into account the size of the ball, making sure the ball doesnt
 * overlap with the edge of the canvas.
 */
function getRandomY(rad){
    var value = 0;
    //do-while generates positions until the ball fits entirely within canvas
    do{
        value = Math.round(Math.random()*BASEMULT%HEIGHT);
    }
    while(value-rad < 0 || value+rad > HEIGHT);
                
    return value;
}
 
/*
 * function returns a bitwise generated random colour
 */
function getRandomRgb() {
  var num = Math.round(0xffffff * Math.random());
  var r = num >> 16;
  var g = num >> 8 & 255;
  var b = num & 255;
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

/*
 * function returns either a positive or negative, used to randomize
 * directions of creatures initially
 */
function plusOrMinus(){
    var check = Math.random();
    if(check<0.5){
        return -1;
    }
    return 1;
}

/*
 * function returns x velocity using its radius (bigger creatures move slower),
 * as well as the proportion parameter which is a value between 0 and 1
 * [1-proportion is sent to getYVector]
 */
function getXVector(rad, proportion){
    return proportion*plusOrMinus()*(1/rad)*SPEEDMULTIPLIER;
}

/*
 * function returns y velocity using its radius (bigger creatures move slower),
 * as well as the proportion parameter which is a value between 0 and 1
 * [1-proportion is sent to getXVector]
 */
function getYVector(rad, proportion){
    return proportion*plusOrMinus()*(1/rad)*SPEEDMULTIPLIER;
}

/*
 * function checks if two passed creatures overlap (are colliding)
 * returns true if balls are colliding 
 */
function testBallCollision(x, y){
    var dist = (x.x-y.x)*(x.x-y.x) + (x.y-y.y)*(x.y-y.y);
    return (dist <= ((x.radius+y.radius)*(x.radius+y.radius)));
}

/*
 * detectBallCollisions is responsibe for checking if balls are colliding
 * and then adjusting the velocities of both balls to account for their
 * 'mass' (radius) and current velocity
 */
function detectBallCollisions(){
    var CreatureOne;
    var CreatureTwo;

    // Reset collision state of all objects
    for (var n = 0; n < Creatures.length; n++) {
        Creatures[n].isColliding = false;
    }

    // Start checking for collisions
    for (var i = 0; i < Creatures.length; i++)
    {
        CreatureOne = Creatures[i];
        for (var j = i + 1; j < Creatures.length; j++)
        {
            CreatureTwo = Creatures[j];
            // Compare CreatureOne with CreatureTwo
            if (testBallCollision(CreatureOne,CreatureTwo)){
                CreatureOne.isColliding = true;
                CreatureTwo.isColliding = true;
                
                var vCollision = {x: CreatureTwo.x - CreatureOne.x, y: CreatureTwo.y - CreatureOne.y};
                var distance = Math.sqrt((CreatureTwo.x-CreatureOne.x)*(CreatureTwo.x-CreatureOne.x) + (CreatureTwo.y-CreatureOne.y)*(CreatureTwo.y-CreatureOne.y));
                var vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
                var vRelativeVelocity = {x: CreatureOne.dx - CreatureTwo.dx, y: CreatureOne.dy - CreatureTwo.dy};
                var speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

                if (speed < 0) {
                    break;
                }
                
                //Adjust vectors taking size of creature into consideration
                var impulse = 2 * speed / (CreatureOne.radius + CreatureTwo.radius);
                CreatureOne.dx -= (impulse * CreatureTwo.radius * vCollisionNorm.x);
                CreatureOne.dy -= (impulse * CreatureTwo.radius * vCollisionNorm.y);
                CreatureTwo.dx += (impulse * CreatureOne.radius * vCollisionNorm.x);
                CreatureTwo.dy += (impulse * CreatureOne.radius * vCollisionNorm.y);
            }
        }
    }
}

/*
 * function creates new instances of creatures, making sure they dont intersect
 * with any existing creatures on the canvas
 */
function makeCreature(numCreatures){
    
    while(currentID<numCreatures){
        var attempt = new Creature();
        detectBallCollisions();
        //if creature intersects, remove it and generate a new one
        if(attempt.isColliding){
            Creatures.pop();
            currentID--;
        }
        //clear isColliding stat for all creatures
        for(var i = 0; i<currentID;i++){
            Creatures[i].isColliding = false;
        }
    }
 
}
 
/*
 * function acts as the game loop, recursively calling iteself
 * function detects collisions between creatures, as well as wall collisions,
 * updates location of all creatures, and draws them to the canvas
 */
function activeLoop(){ 
    
    detectBallCollisions();
    detectWallCollision();
    updateLocation();
    draw();
    
    window.requestAnimationFrame(activeLoop);
}

/*
 * function clears the canvas , and then calls drawCreature() for all 
 * existing creatures
 */
function draw(){
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    //iterate through all existing creatures
    for(var i = 0; i<currentID;i++){
        Creatures[i].printInfo();
        Creatures[i].drawCreature();
    }
}
  
/*
 * runGame function generates the passed numCreatures balls, and then
 * begins activeLoop
 */
function runGame(numCreatures){
    makeCreature(numCreatures);
    activeLoop(); 
}

//Call runGame with NUMBALLS starts exection of the program
runGame(NUMBALLS);


