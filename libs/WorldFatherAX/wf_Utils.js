export const Utils = {};

// Variables

Utils.maxRadians = 2 * Math.PI;
Utils.Tau = 2 * Math.PI;

// Math Likes

Utils.getRadians = (degrees) =>
{
	return degrees * (Math.PI / 180);
}

Utils.getDegrees = (radians) =>
{
	return radians * (180 / Math.PI);
}

Utils.absolute = (x) =>
{
	let mask = x >> 31;
	return (x + mask) ^ mask;
};

Utils.timeSince = (lastTime, thisTime = Date.now()) =>
{
	return thisTime - lastTime;
}

Utils.getAngleBetweenPoints = (dx, dy) =>
{
	return Math.atan2(dy, dx);
}

Utils.forceMod = (n, m) =>
{
	return ((n % m) + m) % m;
};

Utils.clamp = (x, min, max) =>
{
    return Math.max(min, Math.min(max, x));
};

// Randomness

Utils.mulberry32 = (seed = Date.now() ^ (Math.random() * 0xffffffff)) =>
{
	seed |= 0;
	return function ()
	{
		let t = seed += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
};

Utils.random = Utils.mulberry32();

Utils.getRandomInteger = (min, max) =>
{
	min = Math.ceil(min);
	max = max | 0;
	return (Utils.random() * (max - min) | 0) + min;
};

Utils.getRandomIntegerInclusive = (min, max) =>
{
	min = Math.ceil(min);
	max = max | 0;
	return (Utils.random() * (max - min + 1) | 0) + min;
};

Utils.getRandomFloat = (min, max) =>
{
	return Utils.random() * (max - min) + min;
};

Utils.getRandomChance = (decimalChance, randomIn = Utils.random()) =>
{
	return randomIn <= decimalChance;
}

// Shape Helpers

Utils.getShape = (points, fitToFace = true) =>
{
	const outShape = [];
	const steps = 360 / points;

	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;

	for (let i = 0; i < points; i++)
	{
		let angle = i * (Utils.Tau / points);
		if (fitToFace) angle += (Math.PI / points);
		let x = Math.cos(angle) * 0.5;
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		let y = Math.sin(angle) * 0.5;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;	
		outShape.push([x, y]);
	}

	const scaleFix = 1 / Math.max(maxX - minX, maxY - minY);

	for (let i = 0; i < outShape.length; i++)
	{
		outShape[i][0] *= scaleFix;
		outShape[i][1] *= scaleFix;
	}
	
	return outShape;
}

Utils.rotatePoint = (x, y, angle, centerX = 0, centerY = 0) =>
{
	const cos = Math.cos(Utils.getRadians(angle));
	const sin = Math.sin(Utils.getRadians(angle));
	const newX = ((x - centerX) * cos) - ((y - centerY) * sin) + centerX;
	const newY = ((x - centerX) * sin) + ((y - centerY) * cos) + centerY;
	return [newX, newY];
}

Utils.getLocalOfFrom = (ofObj, fromObj) =>
{
	let localX = ofObj.globalPositionX;
	let localY = ofObj.globalPositionY;

	localX -= fromObj.globalPositionX;
	localY -= fromObj.globalPositionY;

	[localX, localY] = Utils.rotatePoint(localX, localY, Utils.getRadians(-fromObj.globalRotation));

	return [localX, localY]
}

Utils.getPointsOnEllipsis = (ellipse, segments) =>
{
	const pts = [];

	const cosR = Math.cos(Utils.getRadians(ellipse.rotation));
	const sinR = Math.sin(Utils.getRadians(ellipse.rotation));

	for (let i = 0; i < segments; i++) {
		const t = (i / segments) * Math.PI * 2;

		let x = (ellipse.width * 0.5) * Math.cos(t);
		let y = (ellipse.height * 0.5) * Math.sin(t);

		const rx = x * cosR - y * sinR;
		const ry = x * sinR + y * cosR;

		pts.push([rx, ry]);
	}

	return pts;
}

Utils.getRelativePosition = (objectX, objectY, objectRotation, targetX, targetY) =>
{
	const dx = targetX - objectX;
	const dy = targetY - objectY;
	const distance = Math.sqrt(dx * dx + dy * dy);
	const angle = Utils.getAngleBetweenPoints(dx, dy);
	return [objectX + Math.cos(Utils.getRadians(objectRotation) - angle) * distance, objectY + Math.sin(Utils.getRadians(objectRotation) - angle) * distance];
}

// Draw Helpers

Utils.debugDrawing = (ctx, obj) =>
{
	if (obj.ddCross)
	{
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(obj.halfWidth, 0)
		ctx.lineTo(-obj.halfWidth, 0)
		ctx.moveTo(0, obj.halfHeight)
		ctx.lineTo(0, -obj.halfHeight)
		ctx.closePath();
		ctx.strokeStyle = "red";
		ctx.stroke();
		ctx.strokeStyle = "Lime";
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(obj.halfWidth, 0);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(obj.halfWidth, 0);
		ctx.lineTo(obj.halfWidth * 0.5, -obj.halfHeight * 0.5);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(obj.halfWidth, 0);
		ctx.lineTo(obj.halfWidth * 0.5, obj.halfHeight * 0.5)
		ctx.closePath();
		ctx.stroke();
	}

	ctx.save();
	obj.resetCamera(ctx);

	ctx.lineWidth = 3;

	if (obj.ddVerticies)
	{
		ctx.strokeStyle = "cyan";
		for (let i = 0; i < obj.verticies.length; i++)
		{
			ctx.beginPath();
			const vertex = obj.verticies[i];
			ctx.arc(vertex[0], vertex[1], 5, 0, 2 * Math.PI);
			ctx.stroke();
		}
	}
	
	if (obj.ddBoundingBox)
	{
		ctx.strokeStyle = "red";
		ctx.beginPath();
		for (let i = 0; i < obj.verticies.length; i++)
		{
			const vertex = obj.verticies[i];
			if (i == 0) ctx.moveTo(vertex[0], vertex[1]);
			ctx.lineTo(vertex[0], vertex[1]);
		}
		ctx.closePath();
		ctx.stroke();
	}

	if (obj.ddNormals)
	{
		let parentPos = [0,0];
		if (obj.parent !== null) parentPos = obj.getGlobalPosition();
		
		ctx.strokeStyle = "blue";
		for (let i = 0; i < obj.normals.length; i++)
		{
			const normal = obj.normals[i];
			ctx.beginPath();
			ctx.moveTo(obj.positionX + parentPos[0] - normal[0] * obj.width, obj.positionY + parentPos[1] - normal[1] * obj.height);
			ctx.lineTo(obj.positionX + parentPos[0], obj.positionY + parentPos[1]);
			ctx.closePath();
			ctx.stroke();
		}
	}

	ctx.restore();
}