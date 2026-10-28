import { Utils } from "../wf_Utils.js";
import { Solid } from "./wf_objs_Solid.js";

export class Grid extends Solid
{
	constructor(inherited = {})
	{
		super(inherited);

		this.color = inherited.color ?? "#ff000055";

		this.tag = inherited.tag ?? "_GridParent";
		this.shape = Utils.getShape(4);

		this.cellColor = inherited.cellColor ?? "#00ff0055";
		this.drawGrid = inherited.drawGrid ?? false;
		this.drawCells = inherited.drawCells ?? false;

		this.gridCells = [];
		this.gridRows = inherited.gridRows ?? ["1fr", "1fr"];
		this.gridColumns = inherited.gridColumns ?? ["1fr", "1fr"];

		this.padding = inherited.padding ?? 0;
		this.gridGap = inherited.gridGap ?? 0;

		this.width = inherited.width ?? 1000;
		this.height = inherited.height ?? 1000;
	}

	_draw(ctx)
	{
		if(this.drawGrid)
		{
			ctx.save();
			this.setupCamera(ctx);
			this.draw(ctx);
			if (this.dDraw) Utils.debugDrawing(ctx, this);
			ctx.restore();
		}

		if (this.drawCells)
		{
			for (let i = 0; i < this.gridCells.length; i++)
			{
				const currentRow = this.gridCells[i];

				for (let j = 0; j < currentRow.length; j++)
				{
					const currentCell = currentRow[j];
					currentCell._draw(ctx);
				}
			}
		}
	}

	// update(dt)
	// {
	// 	return super._update(dt);
	// }

	updateWorldData()
	{
		super.updateWorldData();
		this.calcGridCells();
		for (let i = 0; i < this.gridCells.length; i++)
		{
			const currentRow = this.gridCells[i];

			for (let j = 0; j < currentRow.length; j++)
			{
				const currentCell = currentRow[j];
				currentCell.updateWorldData();
			}
		}
	}

	calcGridCells()
	{
		let rowFractionalCount = 0;
		let rowReserved = 0;
		let columnFractionalCount = 0;
		let columnReserved = 0;

		const reservedPadding = this.padding * 2;
		const reservedHeightGap = this.gridGap * (this.gridRows.length - 1);
		const reservedWidthGap = this.gridGap * (this.gridColumns.length - 1);
		const actualHeight = (this.height - reservedHeightGap - reservedPadding);
		const actualWidth = (this.width - reservedWidthGap - reservedPadding);

		for (let i = 0; i < this.gridRows.length; i++)
		{
			let currentItem = this.gridRows[i];
			if (currentItem.endsWith("fr")) rowFractionalCount += parseInt(currentItem);
			else if (currentItem.endsWith("%")) rowReserved += actualHeight * (parseInt(currentItem) * 0.01);
			else rowReserved += parseInt(currentItem);
		}

		for (let i = 0; i < this.gridColumns.length; i++)
		{
			let currentItem = this.gridColumns[i];
			if (currentItem.endsWith("fr")) columnFractionalCount += parseInt(currentItem);
			else if (currentItem.endsWith("%")) columnReserved += actualWidth * (parseInt(currentItem) * 0.01);
			else columnReserved += parseInt(currentItem);
		}
		
		const rowFraction = (actualHeight - rowReserved) / rowFractionalCount;
		const columnFraction = (actualWidth - columnReserved) / columnFractionalCount;

		const newGrid = [];
		let rowsRunningYTotal = -this.height * 0.5 + this.padding;

		for (let i = 0; i < this.gridRows.length; i++)
		{
			let currentRow = [];

			let rowHeight = parseInt(this.gridRows[i]);
			if (this.gridRows[i].endsWith("fr")) rowHeight *= rowFraction;
			else if (this.gridRows[i].endsWith("%")) rowHeight *= (0.01 * actualHeight);

			let cellPositionY = rowsRunningYTotal + (rowHeight * 0.5);
			rowsRunningYTotal += rowHeight + this.gridGap;

			let columnsRunningXTotal = -this.width * 0.5 + this.padding;

			for (let j = 0; j < this.gridColumns.length; j++)
			{
				let columnWidth = parseInt(this.gridColumns[j]);
				if (this.gridColumns[j].endsWith("fr")) columnWidth *= columnFraction;
				else if (this.gridColumns[j].endsWith("%")) columnWidth *= (0.01 * actualWidth);

				let cellPositionX = columnsRunningXTotal + (columnWidth * 0.5);
				columnsRunningXTotal += columnWidth + this.gridGap;
				
				if(this.gridCells[i] && this.gridCells[i][j])
				{
					const oldCell = this.gridCells[i][j];
					oldCell.width = columnWidth;
					oldCell.height = rowHeight;
					oldCell.positionX = cellPositionX;
					oldCell.positionY = cellPositionY;
					oldCell.rotation = this.rotation;
					oldCell.parent = this;
					oldCell.color = this.cellColor;
					currentRow.push(oldCell);
				}
				else
				{
					currentRow.push(new GridCell({ width: columnWidth, height: rowHeight, positionX: cellPositionX, positionY: cellPositionY, rotation: this.rotation, parent: this, color: this.cellColor })); 
				}

			}
			newGrid.push(currentRow);
		}
		this.gridCells = newGrid;
	}

	getCellReference(row, collumn)
	{
		if (this.dirty) this.updateWorldData();
		return this.gridCells[row][collumn];
	}
}

export class GridCell extends Solid
{
	constructor(inherited = {})
	{
		super(inherited);
		this.tag = inherited.tag ?? "_GridCell";
	}
}