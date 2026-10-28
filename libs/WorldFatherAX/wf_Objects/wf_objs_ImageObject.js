import { Solid } from "./wf_objs_Solid.js";
import { Utils } from "../wf_Utils.js";

export class ImageObject extends Solid
{
	constructor(inherited = {})
	{
		super(inherited);

		this.tag = inherited.tag ?? "_ImageObject";
		
		this.imageSrc = inherited.imageSrc ?? "./libs/WorldFatherAX/wf_InternalData/LogoWhite.png";
		this.imageWidth = this.width;
		this.imageHeight = this.height;		
		this.aspectRatio = inherited.aspectRatio ?? null;

		this.paddingX = inherited.paddingX ?? 0;
		this.paddingY = inherited.paddingY ?? 0;

		this.image = {isReady: false, image: new Image()};
		this.image.image.src = this.imageSrc;
		this.image.image.onload = () =>
		{
			this.image.isReady = true;
		}
		this.imageDirty = true;
	}

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
						target.imageWidth = value;
						target.imageDirty = true;
					case "height":
						target.halfHeight = value * 0.5;
						target.imageHeight = value;
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

	draw(ctx)
	{
		if(this.imageDirty && this.aspectRatio != null) this.calcRatio();
		if (this.image.isReady) ctx.drawImage(this.image.image, (-this.imageWidth * 0.5) + this.paddingX, (-this.imageHeight * 0.5) + this.paddingY, this.imageWidth - this.paddingX * 2, this.imageHeight - this.paddingY * 2);
	}

	calcRatio()
	{
		const isWidthSmaller = this.width < this.height;
		const aspectRatio = (this.aspectRatio > 1) ? 1 / this.aspectRatio : this.aspectRatio;
		this.imageHeight = (isWidthSmaller) ? this.width * aspectRatio : this.height;
		this.imageWidth = (isWidthSmaller) ? this.width : this.height * aspectRatio;
		this.imageDirty = false;
	}
}