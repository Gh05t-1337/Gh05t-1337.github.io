// SCENE
// scene -------------------------------------------------------

var scene = new World(1/60,new Vector2(0,-10));

//player plateau and plateau index
var plt;
var pltind;

function setup_scene(){

    //COLLIDERS
    //walls
    scene.colliders.push(new Plane(new Vector2(0,0),new Vector2(0,1)));
    scene.colliders.push(new Plane(new Vector2(0,simHeight),new Vector2(0,-1)));
    scene.colliders.push(new Plane(new Vector2(0,0),new Vector2(1,0)));
    scene.colliders.push(new Plane(new Vector2(simWidth,0),new Vector2(-1,0)));

    //ramp
    scene.colliders.push(new Plane(new Vector2(simWidth-10,0),new Vector2(-1,1)));

    //player paddle
    plt = new Plateau(new Vector2(simWidth-30,1),2,new Vector2(0,1));
    pltind = scene.colliders.length;
    scene.colliders.push(plt);

    //OBJECTS
    scene.objects.push(new BoingBall(5,[20,1],new Vector2(30,30),8000,0,8000,70,'#a36163')); //dark red boing square 
    scene.objects.push(new BoingBall(3,[simWidth-5,simHeight-10]));

    // init invisible ball for hase
    var ball = new BoingBall(3,[3,3],new Vector2(0,0),4000,4000,4000,70,'#ffffff',2.5,2.7);
    scene.objects.push(new ElasticPolygon(ball,movePolygon(hasePol,3,3))); //add invisible ball to scene for simulations
}


//input ------------------------------------------

canvas.addEventListener( 'pointermove', onPointer);
function onPointer( evt ) {
    if (evt.type == "pointermove") {
        // get pointer position
        var p = new Vector2(evt.clientX, evt.clientY);

        // update plt position accordingly
        plt.pos = new Vector2(sX(p), sY(p));
        plt.left = plt.pos.minus(plt.tangent.times(plt.radius));
        plt.right = plt.pos.plus(plt.tangent.times(plt.radius));

        //update in scene colliders
        scene.colliders[pltind]=plt;
    }
}	


// make browser to call us repeatedly -----------------------------------

function update() {
    scene.simulate();
    scene.draw();

    requestAnimationFrame(update);
}

setup_scene();
update();