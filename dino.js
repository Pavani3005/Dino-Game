const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const gameWidth=800;
const gameHeight=200;
const playerWidth= 88/1.5;
const playerHeight= 94/1.5;
const maxjumpHeight=gameHeight;
const minjumpHeight=150;
const groundWidth=2400;
const groundHeight=24;
const groundAndCactusSpeed=0.5;
const gameSpeedStart=0.75;
const gameSpeedIncrement= 0.00001;
const cactusConfig=[
    {width: 48/1.5, height: 100/1.5, image: './cactus_1.png'},
    {width: 98/1.5, height: 100/1.5, image: './cactus_2.png'},
    {width: 68/1.5, height: 70/1.5, image: './cactus_2.png'}
];


let player=null;
let ground=null;
let cactiController=null;
let scaleratio=0;
let previousTime=null;
let gameSpeed= gameSpeedStart;
let gameOver=false;
let hasAddedEventListenerForRestart=false;
let waitingToStart= true;
let score=null;

class cactusController{

    cactusIntervalMin=500;
    cactusIntervalMax=2000;
    nextCactusInterval=null;
    cacti=[];

    constructor(context, cactiImages, scaleratio, speed){
        this.context=context;
        this.canvas= context.canvas;
        this.cactiImages=cactiImages;
        this.scaleratio=scaleratio;
        this.speed=speed;
        this.setnextCactusTime();
    }

    createCactus(){
        const index= Math.floor(Math.random()* (this.cactiImages.length -1-0 +1)+0);
        const cactusImage= this.cactiImages[index];
        const x= this.canvas.width *1.5;
        const y= this.canvas.height- cactusImage.height;
        const cactus = new Cactus(this.context, x,y, cactusImage.width, cactusImage.height, cactusImage.image);
        this.cacti.push(cactus);
    }

    draw(){
        this.cacti.forEach(cactus => cactus.draw());
    }

    setnextCactusTime(){
        const num= Math.floor(Math.random() *(this.cactusIntervalMax- this.cactusIntervalMin +1)+ this.cactusIntervalMin);
        this.nextCactusInterval= num;
        //console.log(this.nextCactusInterval);
    }

    update(gameSpeed, frameTimeDelta){
        if(this.nextCactusInterval<=0){
            this.createCactus();
            this.setnextCactusTime();
        }
        this.nextCactusInterval -= frameTimeDelta;

        this.cacti= this.cacti.filter((cactus) => cactus.x> -cactus.width);
        //console.log(this.cacti.length);
        this.cacti.forEach(cactus =>{
            cactus.update(this.speed,gameSpeed, frameTimeDelta, this.scaleratio);
        })
    }

    collideWith(sprite){
        return this.cacti.some(cactus => cactus.collideWith(sprite));
    }

    reset(){
        this.cacti=[];
    }
}

class Cactus{
    constructor(context, x, y, width, height, image){
        this.context=context;
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.image=image; 

    }

    update(speed, gameSpeed, frameTimeDelta, scaleratio){
        this.x -= speed* gameSpeed* frameTimeDelta*scaleratio;
    }

    draw(){
        this.context.drawImage(this.image, this.x,this.y, this.width, this.height);
    }

    collideWith(sprite){
        const adjustBy=1.4;
        if(
            sprite.x< this.x + this.width/ adjustBy &&
            sprite.x + sprite.width/ adjustBy> this.x && 
            sprite.y <this.y + this.height/ adjustBy &&
            sprite.height+ sprite.y/ adjustBy > this.y
        ){
            return true;
        }else{
            return false;
        }
    }
}

class Player{

    WALKAnimateionTimer=200;
    walkAnimateionTimer= this.WALKAnimateionTimer;
    dinoRunImages=[];

    jumpPressed= false;
    jumpInProgress= false;
    falling= false;
    jumpSpeed= 0.6;
    gravity= 0.4;

    constructor(context, width, height, minjumpHeight,maxjumpHeight,scaleratio){
        this.context=context;
        this.canvas=context.canvas;
        this.width=width;
        this.height=height;
        this.minjumpHeight=minjumpHeight;
        this.maxjumpHeight=maxjumpHeight;
        this.scaleratio=scaleratio;

        
        this.x= 10* scaleratio;
        this.y= this.canvas.height- this.height- 1.5* scaleratio;
        this.yStandingPosition= this.y;

        this.stillImage=new Image();
        this.stillImage.src="./dino-stationary.png";
        this.image=this.stillImage;

        const dinoRunImage1=new Image();
        dinoRunImage1.src="./dino-run-0.png";
        const dinoRunImage2=new Image();
        dinoRunImage2.src="./dino-run-1.png";
        this.dinoRunImages.push(dinoRunImage1);
        this.dinoRunImages.push(dinoRunImage2);
        
        window.removeEventListener("keydown", this.keydown);
        window.removeEventListener("keyup", this.keyup);
        window.addEventListener("keydown", this.keydown);
        window.addEventListener("keyup", this.keyup);
        
        window.removeEventListener("touchstart", this.touchstart);
        window.removeEventListener("touchend", this.touchend);
        window.addEventListener("touchstart", this.touchstart);
        window.addEventListener("touchend", this.touchend);
    }
    draw(){
        this.context.drawImage(this.image, this.x,this.y,this.width,this.height);
    }

    update(gameSpeed, frameTimeDelta){
        //console.log(this.jumpPressed);
        this.run(gameSpeed, frameTimeDelta);

        if (this.jumpInProgress){
            this.image= this.stillImage;
        }
        this.jump(frameTimeDelta);
    }

    jump(frameTimeDelta){
        if(this.jumpPressed){
            this.jumpInProgress=true;
        }

        if(this.jumpInProgress && !this.falling){
            if(this.y > this.canvas.height- this.minjumpHeight || 
                (this.y > this.canvas.height-this.maxjumpHeight  && this.jumpPressed)){
                    this.y -= this.jumpSpeed*this.scaleratio*frameTimeDelta;
                }
            else{
                this.falling=true;
            }
        }
        else {
            if(this.y< this.yStandingPosition){
                this.y += this.gravity* frameTimeDelta* this.scaleratio;
                if(this.y + this.height> this.canvas.height){
                    this.y= this.yStandingPosition
                }
            }
            else {
                this.falling=false;
                this.jumpInProgress=false;
            }
        }
    }

    run(gameSpeed,frameTimeDelta){
        if (this.walkAnimateionTimer <= 0){
            if (this.image === this.dinoRunImages[0]){
                this.image=this.dinoRunImages[1];
            }
            else{
                this.image=this.dinoRunImages[0];
            }
            this.walkAnimateionTimer=this.WALKAnimateionTimer;
        }
        this.walkAnimateionTimer -= frameTimeDelta* gameSpeed;
    }

    keydown= (event) =>{
        if (event.code ==="Space"){
            this.jumpPressed=true;
        }
    };

    keyup= (event) =>{
        if (event.code ==="Space"){
            this.jumpPressed=false;
        }
    };

    touchstart=()=>{
        this.jumpPressed= true;
    }

    touchend=()=>{
        this.jumpPressed= false;
    }

}

class Ground{
    constructor(context,width,height,speed, scaleratio){
        this.context=context;
        this.canvas=context.canvas;
        this.width=width;
        this.height=height;
        this.speed=speed;
        this.scaleratio=scaleratio;

        this.x=0;
        this.y=this.canvas.height-this.height;

        this.groundImage=  new Image();
        this.groundImage.src="./ground.png"
    }

    draw(){
        this.context.drawImage(this.groundImage, this.x, this.y ,this.width, this.height);
        this.context.drawImage(this.groundImage, this.x+ this.width, this.y ,this.width, this.height);

        if (this.x< -this.width){
            this.x=0;
        }
    }

    update(gameSpeed, frameTimeDelta){
        this.x-=gameSpeed* frameTimeDelta* this.speed* this.scaleratio;
    }

    reset(){
        this.x=0;
    }
}

class Score{

    score=0;
    highScorekey="highScore";
    constructor(context,scaleratio){
        this.context=context;
        this.canvas=context.canvas;
        this.scaleratio=scaleratio;
    }

    update(frameTimeDelta){
        this.score +=frameTimeDelta* 0.01;
    }

    reset(){
        this.score=0;
    }

    draw(){
        const fontSize=20* scaleratio;
        this.context.font=`${fontSize}px Verdana`;
        this.context.fillStyle="grey";
        const x =this.canvas.width- 75* scaleratio;
        const y= 20* this.scaleratio;
        const scorepadded=Math.floor(this.score).toString().padStart(5,0);
        this.context.fillText(scorepadded,x,y);
    }
}

function setScreen(){
    scaleratio= getScaleRatio();
    canvas.width = gameWidth*scaleratio;
    canvas.height = gameHeight*scaleratio;
    createSprites();
}

setScreen();
//window.addEventListener("resize",setScreen);
if(screen.orientation){
    screen.orientation.addEventListener("change",setScreen);
}

function getScaleRatio(){
    const screenHeight=Math.min(window.innerHeight, document.documentElement.clientHeight);
    const screenWidth= Math.min(window.innerWidth, document.documentElement.clientWidth);

    if (screenWidth/screenHeight < gameWidth/ gameHeight){
        return screenWidth/gameWidth
    }else {
        return screenHeight/gameHeight
    }

}

function gameLoop(currentTime){
    if (previousTime === null){
        previousTime=currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }
    const frameTimeDelta=currentTime-previousTime;
    previousTime=currentTime;
    //console.log(frameTimeDelta);
    clearScreen();

    if(!gameOver && !waitingToStart){
        ground.update(gameSpeed, frameTimeDelta);
        cactiController.update(gameSpeed, frameTimeDelta);
        player.update(gameSpeed, frameTimeDelta);
        score.update(frameTimeDelta);   
        updateGameSpeed(frameTimeDelta);
    }

    if (! gameOver && cactiController.collideWith(player)){
        gameOver=true;
        setupGameReset();
    }

    player.draw();
    cactiController.draw();
    ground.draw();
    score.draw();

    if(gameOver){
        showGameOver();
    }

    if (waitingToStart){
        showStartGametext();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
window.addEventListener("keyup", reset, {once:true});
window.addEventListener("touchstart", reset, {once:true});

function clearScreen(){
    context.fillStyle="white";
    context.fillRect(0,0, canvas.width, canvas.height);
}

function createSprites(){
    const playerWidthInGame=playerWidth* scaleratio;
    const playerHeightInGame=playerHeight* scaleratio;
    const minjumpHeightInGame=minjumpHeight* scaleratio;
    const maxjumpHeightInGame= maxjumpHeight*scaleratio;

    const groundWidthInGame= groundWidth* scaleratio;
    const groundHeightInGame= groundHeight* scaleratio;

    player= new Player(context, playerWidthInGame, playerHeightInGame, 
        minjumpHeightInGame, maxjumpHeightInGame, scaleratio);

    ground= new Ground(context,groundWidthInGame, groundHeightInGame, 
        groundAndCactusSpeed, scaleratio);

    const cactiImages= cactusConfig.map(cactus => {
        const image=new Image();
        image.src=cactus.image;
        return{
            image: image,
            width: cactus.width * scaleratio,
            height: cactus.height * scaleratio
        };
    });

    cactiController = new cactusController(context, cactiImages, scaleratio, groundAndCactusSpeed);

    score = new Score(context,scaleratio);
}

function showGameOver(){
    const fontSize= 70* scaleratio;
    context.font= `${fontSize}px Verdana`;
    context.fillStyle= "grey";
    const x= canvas.width/4.5;
    const y = canvas.height/2;
    context.fillText("Game Over!!",x ,y);
}

function setupGameReset(){
    if(!hasAddedEventListenerForRestart){
        hasAddedEventListenerForRestart=true;
    }

    setTimeout(() =>{
        window.addEventListener("keyup", reset, {once:true});
        window.addEventListener("touchstart", reset, {once:true});
    },1000);
}

function reset(){
    hasAddedEventListenerForRestart = false;
    gameOver= false;
    waitingToStart=false;
    ground.reset();
    cactiController.reset();
    score.reset();
    gameSpeed= gameSpeedStart;
}

function showStartGametext(){
    const fontSize= 40* scaleratio;
    context.font=`${fontSize}px Verdana`;
    context.fillStyle="grey";
    const x= canvas.width/14;
    const y= canvas.height/2;
    context.fillText("Touch screen OR Tap Space to START!!",x,y); 
}

function updateGameSpeed(frameTimeDelta){
    gameSpeed+= frameTimeDelta* gameSpeedIncrement;
}

