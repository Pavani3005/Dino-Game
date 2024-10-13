export default class Player{
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
        this.stillImage=new Image();
        this.stillImage.src="./dino-stationary.png";
        this.image=this.stillImage;
    }
    draw(){
        this.context.drawImage(this.image, this.x,this.y,this.width,this.height);
    }
}