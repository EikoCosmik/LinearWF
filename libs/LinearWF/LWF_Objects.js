import { Dynamic, Solid } from "../WorldFatherAX/wf_Objects.js";
import { Utils } from "../WorldFatherAX/wf_Utils.js";

export class levelPlayer extends Dynamic
{
	constructor(inherited = {})
	{
		super(inherited);

		this.shape = Utils.getShape(3, false);
		this.tag = "player";

		this.width = 50;
		this.height = 50;

		this.positionY = 400;
		this.rotation = 270;

		this.velocityX = 0;
		this.velocityY = 0;
		this.acceleration = 1750;
		this.drag = 5;

		this.drawThrustTimer = Date.now();
		//this.drawThrust = false;

		this.canCollide = true;

		this.loadout = {
			weapon0: "shooter",
			time0: 500,
			weapon1: "shotgun",
			time1: 1000,
			weapon2: "sniper",
			time2: 2000
		}

		this.curWeapon = 0;

		this.swappingWeapon = false;
		this.shotDelay = this.loadout.time0;
		this.lastShot = this.shotDelay;

		this.initialHealth = 100;
		this.initialShield = 40;
		this.health = 100;
		this.shield = 40;
	}

	update(dt)
	{
		if (this.engine.isKeyDown("KeyW"))
		{
			this.velocityX += this.forwardX * this.acceleration * dt;
			this.velocityY += this.forwardY * this.acceleration * dt;
		}

		if (this.engine.isKeyDown("KeyS"))
		{
			this.velocityX += this.backX * this.acceleration * dt;
			this.velocityY += this.backY * this.acceleration * dt;
		}

		if (this.engine.isKeyDown("KeyD"))
		{
			this.velocityX += this.rightX * this.acceleration * dt;
			this.velocityY += this.rightY * this.acceleration * dt;
		}

		if (this.engine.isKeyDown("KeyA"))
		{
			this.velocityX += this.leftX * this.acceleration * dt;
			this.velocityY += this.leftY * this.acceleration * dt;
		}

		this.velocityX -= this.velocityX * this.drag * dt;
		this.velocityY -= this.velocityY * this.drag * dt;

		if (Utils.absolute(this.velocityX) < 0.01) this.velocityX = 0;
		if (Utils.absolute(this.velocityY) < 0.01) this.velocityY = 0;

		this.positionX += this.velocityX * dt;
		this.positionY += this.velocityY * dt;

		switch(true)
		{
			case this.positionY >= this.engine.halfScreenHeight - this.halfHeight:
				this.positionY = this.engine.halfScreenHeight - this.halfHeight;
				this.velocityY = 0;
				break;
			case this.positionY <= -this.engine.halfScreenHeight + this.halfHeight:
				this.positionY = -this.engine.halfScreenHeight + this.halfHeight;
				this.velocityY = 0;
				break;
		}

		switch(true)
		{
			case this.positionX >= this.engine.halfScreenWidth - this.halfWidth:
				this.positionX = this.engine.halfScreenWidth - this.halfWidth;
				this.velocityX = 0;
				break;
			case this.positionX <= -this.engine.halfScreenWidth + this.halfWidth:
				this.positionX = -this.engine.halfScreenWidth + this.halfWidth;
				this.velocityX = 0;
				break;
		}

		this.scene.importantObjs["reloadBar1"].updateStat(Utils.timeSince(this.lastShot), this.shotDelay);
		this.scene.importantObjs["reloadBar2"].updateStat(Utils.timeSince(this.lastShot), this.shotDelay);
		this.scene.importantObjs["playerReloadBar1"].updateStat(Utils.timeSince(this.lastShot), this.shotDelay);
		this.scene.importantObjs["playerReloadBar2"].updateStat(Utils.timeSince(this.lastShot), this.shotDelay);
		
		if(this.swappingWeapon && !this.engine.isKeyDown("KeyQ")) this.swappingWeapon = false;
		if (this.engine.isKeyDown("KeyQ") && !this.swappingWeapon)
		{
			this.swapWeapon();
		}

		if (this.engine.isKeyDown("Space") && Utils.timeSince(this.lastShot) > this.shotDelay)
		{
			this.shoot();
		}

		if(this.health <= 0) this.isLive = false;
	}

	shoot()
	{
		this.lastShot = Date.now();

		switch(this.curWeapon)
		{
			case 0:
				this.scene.addObject(new bullet({ positionX: this.positionX, positionY: this.positionY, rotation: this.globalRotation}));
				break;
			case 1:
				this.scene.addObject(new shotgunBullet({ positionX: this.positionX, positionY: this.positionY, rotation: this.globalRotation}));
				this.scene.addObject(new shotgunBullet({ positionX: this.positionX, positionY: this.positionY, rotation: this.globalRotation + 15}));
				this.scene.addObject(new shotgunBullet({ positionX: this.positionX, positionY: this.positionY, rotation: this.globalRotation - 15}));
				break;
			case 2:
				this.scene.addObject(new sniperBullet({ positionX: this.positionX, positionY: this.positionY, rotation: this.globalRotation}));
				break;
		}
	}

	swapWeapon()
	{
		this.swappingWeapon = true;
		this.curWeapon = (this.curWeapon + 1) % 3;
		switch(this.curWeapon)
		{
			case 0:
				this.shotDelay = this.loadout.time0;
				break;
			case 1:
				this.shotDelay = this.loadout.time1;
				break;
			case 2:
				this.shotDelay = this.loadout.time2;
				break;
		}
		this.scene.swapWeaponIcons(this.curWeapon);
	}

	collidedWith(collidedObject) 
	{
		if(collidedObject.tag == "baseEnemyBullet" || collidedObject.tag == "enemy")
		{
			this.shield -= collidedObject.damage;

			if(this.shield < 0)
			{
				this.health += this.shield;
				this.shield = 0;
			}

			this.scene.importantObjs["healthBar"].updateStat(this.health, this.initialHealth);
			this.scene.importantObjs["shieldBar"].updateStat(this.shield, this.initialShield);
		}
	}
}

class bullet extends Dynamic
{
	constructor(inherited)
	{
		super(inherited);

		this.canCollide = true;
		this.speed = 500;
		this.width = 20;
		this.height = 10;
		this.tag = "bullet";
		this.color = "Cyan";
		this.damage = 10;
	}

	collidedWith(collidedObject)
	{
		if(collidedObject.tag == "enemy" || collidedObject.tag == "baseEnemyBullet") this.isLive = false;
	}

	update(dt)
	{
		this.positionX += this.speed * this.cos * dt;
		this.positionY += this.speed * this.sin * dt;

		if ((this.positionY < -this.engine.halfScreenHeight - 100) || (this.positionY > this.engine.halfScreenHeight + 100)) this.isLive = false;
	}
}

class shotgunBullet extends bullet
{
	constructor(inherited)
	{
		super(inherited);
		this.color = "red";
		this.damage = 7;
		this.width = 20;
		this.height = 15;
		this.speed = 400;
	}
}

class sniperBullet extends bullet
{
	constructor(inherited)
	{
		super(inherited);
		this.color = "lime";
		this.width = 20;
		this.height = 5;
		this.damage = 20;
		this.speed = 1000;
		this.penetrationCount = 0
	}

	collidedWith(collidedObject)
	{
		if(collidedObject.tag == "enemy" || collidedObject.tag == "baseEnemyBullet")
		{
			this.penetrationCount += 1;
			this.damage -= 2;
		}
		if(this.penetrationCount >= 3) this.isLive = false;
	}
}

class baseEnemyBullet extends bullet
{
	constructor(inherited)
	{
		super(inherited);
		this.tag = "baseEnemyBullet";
		this.color = "darkRed";
		this.damage = 20;
	}

	collidedWith(collidedObject)
	{
		if(collidedObject.tag == "player" || collidedObject.tag == "bullet") this.isLive = false;
	}
}

export class baseEnemy extends Dynamic
{
	constructor(inherited)
	{
		super(inherited);
		this.canCollide = true;
		this.speed = 100;
		this.width = 75;
		this.height = 75;
		this.tag = "enemy";
		this.color = "pink";
		this.damage = 50;
		this.health = 20;
		this.shotDelay = 1000;
		this.lastShot = this.shotDelay;
	}

	update(dt)
	{
		this.positionX += this.speed * this.forwardX * dt;
		this.positionY += this.speed * this.forwardY * dt;

		if (Utils.timeSince(this.lastShot) > this.shotDelay)
		{
			this.shoot();
		}

		if(this.health <= 0) this.isLive = false;

		if ((this.positionY > this.engine.halfScreenHeight + 100)) this.isLive = false;
	}
	
	shoot()
	{
		this.lastShot = Date.now();
		this.scene.addObject(new baseEnemyBullet({ positionX: this.positionX, positionY: this.positionY, rotation: this.globalRotation}));
	}

	collidedWith(collidedObject)
	{
		if(collidedObject.tag == "bullet") this.health -= collidedObject.damage;
		else if(collidedObject.tag == "player") this.isLive = false;
	}
}

export class statBar extends Solid
{
	constructor(inherited = {})
	{
		super(inherited);
		this.initialWidth = inherited.initialWidth ?? 0;
		this.isInverted = inherited.isInverted ?? false;
	}

	onAdoption(parent)
	{
		super.onAdoption(parent);
		if(this.useParentSize) this.initialWidth = this.width;
	}

	updateStat(inStat, inMax)
	{
		const stat = Utils.clamp(inStat, 0, inMax);
		const percentage = stat / inMax;
		const inversePercentage = 1 - percentage;
		this.width = this.initialWidth * percentage;
		const positionBias = (this.initialWidth * inversePercentage)/2;
		this.positionX = (this.isInverted) ? positionBias : -positionBias;
	}
}

export class verticalStatBar extends Solid
{
	constructor(inherited = {})
	{
		super(inherited);
		this.initialHeight = inherited.initialHeight ?? 0;
		this.isInverted = inherited.isInverted ?? false;
	}

	onAdoption(parent)
	{
		super.onAdoption(parent);		
		if(this.useParentSize) this.initialHeight = this.height;
	}

	updateStat(inStat, inMax)
	{
		const stat = Utils.clamp(inStat, 0, inMax);
		const percentage = stat / inMax;
		const inversePercentage = 1 - percentage;
		this.height = this.initialHeight * percentage;
		const positionBias = (this.initialHeight * inversePercentage)/2;
		this.positionY = (this.isInverted) ? positionBias : -positionBias;
	}
}

export class playerReloadBar extends verticalStatBar
{
	constructor(inherited = {})
	{
		super(inherited);
		this.xBias = inherited.xBias ?? 0;
		this.yBias = inherited.yBias ?? 0;
	}

	updateStat(inStat, inMax)
	{
		this.positionX = this.parent.positionX - this.xBias;
		const stat = Utils.clamp(inStat, 0, inMax);
		const percentage = stat / inMax;
		const inversePercentage = 1 - percentage;
		this.height = this.initialHeight * percentage;
		const positionBias = this.parent.positionY + this.yBias + (this.initialHeight * inversePercentage)/2;
		this.positionY = (this.isInverted) ? positionBias : -positionBias;
	}
}