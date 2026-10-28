import { Utils } from "../wf_Utils.js";

export class Empty
{
	constructor(inherited = {})
	{
		// Physical variables
		this.positionX = inherited.positionX ?? 0;
		this.positionY = inherited.positionY ?? 0;
		this.scaleX = inherited.scaleX ?? 1;
		this.scaleY = inherited.scaleY ?? 1;
		this.rotation = inherited.rotation ?? 0;
		this.width = inherited.width ?? 100;
		this.height = inherited.height ?? 100;
		this.halfWidth = this.width * 0.5;
		this.halfHeight = this.height * 0.5;

		// Global Physical Variables
		this.globalPositionX = this.positionX;
		this.globalPositionY = this.positionY;
		this.globalRotation = this.rotation

		// Included as a cache
		this.cos = Math.cos(Utils.getRadians(this.rotation));
		this.sin = Math.sin(Utils.getRadians(this.rotation));
		this.globalCos = Math.cos(Utils.getRadians(this.globalRotation));
		this.globalSin = Math.sin(Utils.getRadians(this.globalRotation));

		// Helpful Direction references
		this.forwardX = this.cos;
		this.forwardY = this.sin;
		this.rightX = -this.sin;
		this.rightY = this.cos;
		this.leftX = this.sin;
		this.leftY = -this.cos;
		this.backX = -this.cos;
		this.backY = -this.sin;

		// Identity variabels
		this.id = Symbol("UID");
		this.isLive = true;
		this.tag = inherited.tag ?? "_Empty";
		this.dirty = true;
		
		// Debug toggles
		this.dDraw = inherited.dDraw ?? false;
		this.ddCross = inherited.ddCross ?? false;

		// Children Handler
		this.children = {};
		this.childRunningCount = 0;
		this.relativeID = -1;

		// Parent Handler
		this.parent = inherited.parent ?? null;
		this.parentAsReference = inherited.parentAsReference ?? false;
		this.useParentSize = inherited.useParentSize ?? false;

		//Let Empty return the proxy, do not re-return just overwrite getProxyHandler()
		return new Proxy(this, this.getProxyHandler());
	}

	// Variable update automation, override as required but include the parents code still
	getProxyHandler()
	{
		const handler =
		{
			set(target, prop, value)
			{
				target[prop] = value;

				switch (prop)
				{
					case "rotation":
						target.sin = Math.sin(Utils.getRadians(value));
						target.cos = Math.cos(Utils.getRadians(value));
						target.forwardX = target.cos;
						target.forwardY = target.sin;
						target.rightX = -target.sin;
						target.rightY = target.cos;
						target.leftX = target.sin;
						target.leftY = -target.cos;
						target.backX = -target.cos;
						target.backY = -target.sin;
						target.dirty = true;
						target[prop] = Utils.forceMod(value, 360);
						break;
					case "positionX":
					case "positionY":
					case "scaleX":
					case "scaleY":
						target.dirty = true;
						break;
					case "width":
						target.halfWidth = value * 0.5;
					case "height":
						target.halfHeight = value * 0.5;
						break;
					case "globalRotation":
						target.globalCos = Math.cos(Utils.getRadians(value));
						target.globalSin = Math.sin(Utils.getRadians(value));
						target[prop] = Utils.forceMod(value, 360);
						break;
				}

				return true;
			}
		};

		return handler;
	}

	// Internal Update

	_update(dt)
	{
		if (this.parent !== null && !this.parentAsReference && !this.parent.isLive) this.isLive = false;
		this.update(dt);
		if (this.dirty) this.updateWorldData();
		return this.isLive;
	}

	updateWorldData()
	{
		for (let key in this.children) this.children[key].dirty = true;
		this.setGlobalPosition();
		this.setGlobalRotation();
		this.dirty = false;
	}

	// Internal Draw
	
	_draw(ctx)
	{
		ctx.save();
		this.setupCamera(ctx);
		this.draw(ctx);
		if (this.dDraw) Utils.debugDrawing(ctx, this);
		ctx.restore();
	};

	setupCamera(ctx)
	{
		if(this.parent !== null && !this.parentAsReference)
		{
			this.parent.setupCamera(ctx);
		}

		ctx.translate(this.positionX, this.positionY);
		ctx.rotate(Utils.getRadians(this.rotation));
		ctx.scale(this.scaleX, this.scaleY);
	}

	resetCamera(ctx)
	{
		ctx.resetTransform();
		this.engine.setupGlobalCamera();
	}

	// Global Getters

	getGlobalPosition()
	{
		if (this.dirty) this.updateWorldData();
		return [this.globalPositionX, this.globalPositionY];
	}

	getGlobalRotation()
	{
		if (this.dirty) this.updateWorldData();
		return this.globalRotation;
	}

	setGlobalPosition()
	{
		let outPosX = this.positionX;
		let outPosY = this.positionY;

		if (this.parent !== null && !this.parentAsReference)
		{
			const parentPos = this.parent.getGlobalPosition();
			const parentRotation = this.parent.getGlobalRotation();
			outPosX += parentPos[0];
			outPosY += parentPos[1];
			const rotated = Utils.rotatePoint(outPosX, outPosY, parentRotation, parentPos[0], parentPos[1])
			outPosX = rotated[0];
			outPosY = rotated[1];
		}

		this.globalPositionX = outPosX;
		this.globalPositionY = outPosY;
	}

	setGlobalRotation()
	{
		let outRotation = this.rotation;

		if (this.parent !== null && !this.parentAsReference)
		{
			const parentRotation = this.parent.getGlobalRotation();
			outRotation = parentRotation;
		}
		
		this.globalRotation = outRotation;
	}

	// Parent Child Functions

	adoptChild(child)
	{
		child.relativeID = this.childRunningCount++;
		this.children[child.relativeID] = child;
		child.dirty = true;
		child.onAdoption(this);
	}

	onAdoption(parent)
	{
		this.parent = parent;

		if (!this.parentAsReference && this.useParentSize)
		{
			this.width = parent.width;
			this.height = parent.height;
		}
	}
	
	killChild(childID)
	{
		delete this.children[childID];
	}

	leaveParent()
	{
		if(this.parent !== null) this.parent.killChild(this.relativeID);
		this.parent = null;
	}

	// When Removed From Scene

	onDeath()
	{
		this.leaveParent();
	}

	// Extra called Functions

	// Custom Update Draw

	update(dt) { } 
	draw(ctx) { }

	// After Constructor = (useful when this.engine or this.scene is required)

	onSetup() { }

	// Shape Path for _draw(ctx)

	getPath(ctx) { }
}