import { Utils } from "../wf_Utils.js";
import { Empty } from "./wf_objs_Empty.js";

export class Solid extends Empty
{
	constructor(inherited = {})
	{
		super(inherited);

		this.tag = inherited.tag ?? "_Solid";

		this.isEllipse = inherited.isEllipse ?? false;
		this.shape = inherited.shape ?? Utils.getShape(4);
		this.color = inherited.color ?? "magenta";
	}

	// Drawing

	draw(ctx)
	{
		ctx.fillStyle = this.color;
		this.getPath(ctx);
		ctx.fill();
	}

	getPath(ctx)
	{
		ctx.beginPath();

		if(this.isEllipse)
		{
			ctx.ellipse(0, 0, this.halfWidth, this.halfHeight, 0, 0, 2 * Math.PI);
		}
		else
		{
			for (let i = 0; i < this.shape.length; i++)
			{
				if (i == 0) ctx.moveTo(this.shape[i][0] * this.width, this.shape[i][1] * this.height);
				ctx.lineTo(this.shape[i][0] * this.width, this.shape[i][1] * this.height);
			}
		}

		ctx.closePath();
	}
}