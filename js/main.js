const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

canvas.width = 614;
canvas.height = 455;

let audio1 = document.getElementById("audio1");
let audio2 = new Audio('./audio/audio2.mp3');

audio1.loop = true;
audio1.volume = 0.1;
audio2.volume = 0.2;

let idleAnim = [];
let walkrightAnim = [];
let groundTiles = [];
let rects = [];

let frameCount = 0;
let ground, dino;
let start = true;

let keys = {
	 up : false
}

let overlay = document.querySelector('.overlay');

overlay.addEventListener('click', function(ev){
	setTimeout(() => {
		this.style.display = "none";
	}, 1000);
	this.classList.add('animate-div');
	
	audio1.src = ""

	audio2.play()
	audio2.loop = true

	start = false;
})

window.addEventListener('keydown', (ev) => {
	if(ev.keyCode == 38){
		keys.up = true;
	}
})

window.addEventListener('keyup', (ev) => {
	if(ev.keyCode == 38){
		keys.up = false;
	}
})


function loadImage(url){
	return new Promise(resolve => {
		const img = new Image();
		img.addEventListener('load', () => {
			resolve(img);
		});
		img.src = url;
	});
}


class SpriteSheet {
	constructor(image, x, y, width, height){
		this.image = image;
		this.width = width;
		this.height = height;
		this.frameIdx = 0;		
		this.x = x;
		this.y = y;
		this.speed = 2;
	}

	drawGround(context) {		
		context.drawImage(this.image, 0, 0, 171, 167,
								this.x, this.y, this.width, this.height);			
	}	

	update(){
		this.x -= this.speed;
		
		if(this.x < -205){
			this.x = 614;
		}
	}
}

class Sprite {
	constructor(x,y,ctx){
		this.x = x;
		this.y = y;
		this.anim = [];
		this.jumpForce = 15;
		this.jumpTimer = 0;
		this.frameIdx = 0;
		this.grounded = false;
		this.grav = 1;	
		this.velY = 0;	
	}
	animate(){
		ctx.drawImage(this.anim[this.frameIdx], 0, 0, 98, 82,
							this.x, this.y, 150,140);
	}
	update(mod){
		frameCount++;
		if(frameCount % mod == 0){
			this.frameIdx++;
		}
		if(this.frameIdx == this.anim.length){
			this.frameIdx = 0;
		}
		if(keys.up){
			this.jump();
		} else {
			this.jumpTimer = 0;
		}

		this.y += this.velY;

		if(this.y < 274){
			this.velY += this.grav;
			this.grounded = false;			
		} else {
			this.grounded = true;
			this.velY = 0;
			this.y = 274;
		}
	}
	jump(){
		if(this.grounded && this.jumpTimer == 0){
			this.jumpTimer = 1;
			this.velY = -this.jumpForce;			
		} else if(this.jumpTimer > 0 && this.jumpTimer < 15){
			this.jumpTimer++;
			this.velY = -this.jumpForce - (this.jumpTimer / 50);
		}
	}
}
class Rect {
	constructor(x,y,w,h,c){
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.color = c;
		this.velX = 5;		
	}
	draw(){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.width,this.height);
		ctx.fill();
	}
	update(){
		this.x -= this.velX;

		if(this.x + this.width < 0){
			this.x = randomIntBetween(canvas.width, canvas.width*3);
		}
	}
}


function randomIntBetween(min,max){
	let rand = (Math.random() * (max - min) + min) | 0;
	return rand;
}


Promise.all([
	loadImage('./img/Tile.png'),
	loadImage('./img/animation/idle/idle00.png'),
	loadImage('./img/animation/idle/idle01.png'),
	loadImage('./img/animation/idle/idle02.png'),
	loadImage('./img/animation/idle/idle03.png'),
	
	loadImage('./img/animation/walking_right/walkright00.png'),
	loadImage('./img/animation/walking_right/walkright01.png'),
	loadImage('./img/animation/walking_right/walkright02.png'),
	loadImage('./img/animation/walking_right/walkright03.png'),
	loadImage('./img/animation/walking_right/walkright04.png'),

])
.then(([groundTile,idle0,idle1,idle2,idle3,wr0,wr1,wr2,wr3,wr4]) => {
	
	for(let i = 0; i < 4; i++){
		let x = i * 205;
		let y = 400;
		groundTiles.push(new SpriteSheet(groundTile,x,y,205,55));
	}
	
	let randX = randomIntBetween(canvas.width*2,canvas.width*3);
		
	rects.push(new Rect(randX,350,50,50,"red"));

	dino = new Sprite(0,274,ctx);

	idleAnim = [idle0,idle1,idle2,idle3];

	walkrightAnim = [wr0,wr1,wr2,wr3,wr4];

	dino.anim = idleAnim;

	let id = requestAnimationFrame(startingLoop);
	
});

function startingLoop(){
	if(start){
		ctx.clearRect(0,0,canvas.width,canvas.height);
		for(let i = 0; i < groundTiles.length; i++){
			groundTiles[i].drawGround(ctx);		
		}

		dino.animate();
		dino.update(50);

		requestAnimationFrame(startingLoop);
	} else {
		dino.anim = walkrightAnim;
		gameLoop();	
	}

}


function gameLoop(){
	ctx.clearRect(0,0,canvas.width,canvas.height);

	for(let i = 0; i < groundTiles.length; i++){
		groundTiles[i].drawGround(ctx);
		groundTiles[i].update();
	}

	rects.forEach(rect => {
		rect.draw();
		rect.update();
	})

	dino.animate();
	dino.update(10);

	requestAnimationFrame(gameLoop);
}
