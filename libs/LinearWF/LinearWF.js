import { BaseLevel } from "./LWF_Scenes.js";

const worldFather = await import("../WorldFatherAX/WorldFather2D.js");
const LinearWF = new worldFather.WorldFather("wfTest", 1440, 1080, 4/3);

LinearWF.addSystem(new worldFather.systems.CollisionDetection());
LinearWF.addSystem(new worldFather.systems.KeyInputs());
LinearWF.addScene("BaseLevel", new BaseLevel);
LinearWF.swapScene("BaseLevel")
LinearWF.start(); 