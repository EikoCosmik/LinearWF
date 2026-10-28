import { Solid } from "./wf_objs_Solid.js";
import { Utils } from "../wf_Utils.js";

export class TextObject extends Solid
{
	constructor(inherited = {})
	{
		super(inherited);

		this.tag = inherited.tag ?? "_TextObject";

		this.text = (inherited.text !== undefined) ? [inherited.text] : ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."];
		this.font = inherited.font ?? "Arial";
		this.fontSize = inherited.fontSize ?? 25;
		this.linePadding = inherited.linePadding ?? 2;
		this.textColor = inherited.textColor ?? "White";
		//this.textBaseline = inherited.textBaseline ?? "middle";
		this.textAlign = inherited.textAlign ?? "center";
		this.textOutlineColor = inherited.textOutlineColor ?? "black";
		this.textOutlineWidth = inherited.textOutlineWidth ?? 0;
		this.textWrap = inherited.textWrap ?? true;
		this.multiLineDirty = true;

		this.width = inherited.width ?? 9999999999;
		this.height = inherited.height ?? 9999999999;

		this.useParentSize = inherited.useParentSize ?? true;
	}

	draw(ctx)
	{
		ctx.textBaseline = "middle";
		ctx.textAlign = this.textAlign;
		ctx.font = `${this.fontSize}px ${this.font}`;
		ctx.lineWidth = this.textOutlineWidth;
		ctx.strokeStyle = this.textOutlineColor;
		ctx.fillStyle = this.textColor;

		let maxFontSize = this.fontSize;
		let posX = 0;

		switch (this.textAlign)
		{
			case "left":
				posX = -this.width * 0.5;
				break;
			case "right":
				posX = this.width * 0.5;
				break;
		}

		if (this.textWrap && this.multiLineDirty)
		{
			this.testMultiLine(ctx);
		}

		for (let i = 0; i < this.text.length; i++)
		{
			const posY = ((-this.text.length * 0.5 + i) * (maxFontSize + this.linePadding)) + maxFontSize * 0.5 + this.linePadding;
			ctx.beginPath();
			if (this.textOutlineWidth > 0) ctx.strokeText(this.text[i], posX, posY, this.width);
			ctx.fillText(this.text[i], posX, posY, this.width);
		}
	}

	testMultiLine(ctx)
	{
		this.text = [this.text.join(" ")];
		const newLineArr = this.text[0].split(" ");
		let stopper = Infinity;

		let curLine = "";

		for (let i = 0; i < stopper; i++)
		{
			if (newLineArr[0].includes("\n"))
			{
				const lineBroken = newLineArr.shift().split('\n');
				this.text[i] = (curLine == "") ? lineBroken.shift() : curLine + " " + lineBroken.shift();
				newLineArr.unshift(lineBroken.join("\n"));
				curLine = "";
			}
			else if (ctx.measureText(curLine + newLineArr[0]).width < this.width)
			{
				curLine += (curLine == "") ? newLineArr.shift() : " " + newLineArr.shift();
				i--;
			}
			else if (ctx.measureText(newLineArr[0]).width > this.width && curLine == "")
			{
				this.text[i] = newLineArr.shift();
			}
			else
			{
				this.text[i] = curLine;
				curLine = "";
			}
			if (newLineArr.length == 0)
			{
				if (curLine != "") this.text[i + 1] = curLine;
				stopper = -Infinity;
			}
		}
		this.multiLineDirty = false;
	}
}