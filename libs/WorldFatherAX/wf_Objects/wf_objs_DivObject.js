import { Utils } from "../wf_Utils.js";
import { Dynamic } from "./wf_objs_Dynamic.js";

export class DivObject extends Dynamic
{
	constructor(inherited = {})
	{
		super(inherited);

		this.tag = inherited.tag ?? "_DivObject";
		this.contentType = inherited.contentType ?? null;
		
		this.maxWidth = this.width;
		this.maxHeight = this.height;

		this.padding = inherited.padding ?? 0;

		this.useBackground = inherited.useBackground ?? true;
		this.backgroundColor = inherited.backgroundColor ?? "magenta";
		this.borderColor = inherited.borderColor ?? "black";
		this.borderWidth = inherited.borderWidth ?? 0;
		this.borderRadius = inherited.borderRadius ?? 0;
	}

	draw(ctx)
	{
		ctx.lineWidth = this.borderWidth;
		ctx.strokeStyle = this.borderColor;
		ctx.fillStyle = this.backgroundColor;

		this.getPath(ctx);

		if (this.borderWidth > 0) ctx.stroke();
		ctx.fill();
	}

	getPath(ctx)
	{
		ctx.beginPath();
		ctx.roundRect(-this.halfWidth, -this.halfHeight, this.width, this.height, this.borderRadius);
		ctx.closePath();
	}
}