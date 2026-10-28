import { Dynamic } from "./wf_objs_Dynamic.js";

export class DevObj extends Dynamic
{
	constructor(inherited = {})
	{
		super(inherited);
		this.tag = inherited.tag ?? "_DevObj";
		this.canCollide = inherited.canCollide ?? true;
		this.isEllipse = inherited.isEllipse ?? false;
		this.speed = inherited.speed ?? 200;
		this.turnSpeed = inherited.turnSpeed ?? 100;
		this.rotation = inherited.rotation ?? 0;		
		this.dDraw = inherited.dDraw ?? true;
	}

	update(dt)
	{
		if (this.engine.isKeyDown("KeyA")) this.rotation -= this.turnSpeed * dt;
		if (this.engine.isKeyDown("KeyD")) this.rotation += this.turnSpeed * dt;

		if (this.engine.isKeyDown("KeyW"))
		{
			this.positionX += this.forwardX * this.speed * dt;
			this.positionY += this.forwardY * this.speed * dt;
		}

		if (this.engine.isKeyDown("KeyS"))
		{
			this.positionX += this.backX * this.speed * dt;
			this.positionY += this.backY * this.speed * dt;
		}

		if (this.engine.isKeyDown("KeyE"))
		{
			this.positionX += this.leftX * this.speed * dt;
			this.positionY += this.leftY * this.speed * dt;
		}

		if (this.engine.isKeyDown("KeyQ"))
		{
			this.positionX += this.rightX * this.speed * dt;
			this.positionY += this.rightY * this.speed * dt;
		}
	}

	collidedWith(collidedObject)
	{
		console.log(`DevObj Hit: ${collidedObject.tag}`);
	}

	onClicked()
	{
		console.log("wasClicked")
	}
}