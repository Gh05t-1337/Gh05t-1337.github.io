// PHYSICS
// colliders -------------------------------------------------------------

    class Plane{
        constructor(pos,normal_dir,friction = 0.2, bounciness = 0.0){
            this.pos = pos;
            this.normal = normal_dir.divide(normal_dir.length());   // make sure its normalized
            this.tangent = this.normal.perp();
            this.friction = friction;
            this.bounciness = bounciness;
        }
        collideWithParticle(particle,dt){
            var dist = this.normal.dot(particle.pos.minus(this.pos));
            if (dist < 0){
                particle.pos = particle.pos.minus(this.normal.times(dist));
                particle.vel = this.normal.times(-particle.vel.dot(this.normal) * this.bounciness).plus(this.tangent.times(particle.vel.dot(this.tangent) * this.friction));
                particle.previous_pos = particle.vel.times(-1*dt).plus(particle.pos);  
            }
        }
        draw(){
            drawLine(this.pos,this.pos.plus(this.tangent.times(100)),'#000000',3);
            drawLine(this.pos,this.pos.plus(this.tangent.times(-100)),'#000000',3);
        }
    }

    class Plateau extends Plane{
        constructor(pos,radius,normal_dir,friction = 0, bounciness = 0.0){
            super(pos,normal_dir,friction, bounciness);
            this.radius = radius;

            this.left = this.pos.minus(this.tangent.times(this.radius));
            this.right = this.pos.plus(this.tangent.times(this.radius));
        }
        collideWithParticle(particle,dt){
            var dist1 = this.tangent.dot(particle.pos.minus(this.left));
            var dist2 = -this.tangent.dot(particle.pos.minus(this.right));
            var dist = this.normal.dot(particle.pos.minus(this.pos));
            
            if (dist1 >=0 && dist2 >= 0 && Math.abs(dist)<0.5){
                super.collideWithParticle(particle,dt) 
            }
        }
        draw(){
            drawLine(this.left,this.right,'#000000',3);
        }
    }


// physics classes ------------------------------------------------------------

    class Particle {
        constructor(mass, radius, pos, vel=new Vector2(0.0, 0.0), start_acc=new Vector2(0.0, 0.0), bounciness = 1, color = "#FF0000", resistance=0.9) {
            this.radius = radius;
            this.mass = mass;
            this.pos = pos.clone();
            this.vel = vel.clone();
            this.acc = start_acc.clone();
            this.previous_pos = pos.clone();
            this.resistance = resistance;

            this.color = color;
            this.bounciness = bounciness;
        }
        simulate(dt, method = 'euler-cromer') 
        {
            switch(method){
                case 'euler-cromer':
                    // euler-cromer update
                    this.vel.add(this.acc, dt);
                    this.pos.add(this.vel, dt);
                    break;
                
                case 'euler':
                    // euler update
                    this.pos.add(this.vel, dt);
                    this.vel.add(this.acc, dt);
                    break;

                case 'verlet': 
                    // verlet update
                    var pt = this.pos.clone();
                    this.pos = this.pos.times(2.0).minus(this.previous_pos).add(this.acc,dt**2);
                    this.previous_pos = pt.clone();
                    this.vel = this.pos.minus(this.previous_pos).divide(dt);
                    break;
            }
        }
        draw() {
            drawCircle(this.pos,this.radius,this.color);
        }
    }

    class FixedSpring {
        constructor(point, particle, stiffness=1.0, damping_par=1.0){
            this.particle = particle;
            this.point = point;
            this.stiffness = stiffness;
            this.damping_par = damping_par;
            this.length = point.minus(particle.pos).length();
        }
        simulate(){
            var relative_pos = this.point.minus(this.particle.pos);
            var actual_length = relative_pos.length();
            var normalized_dir = relative_pos.divide(actual_length);
            var relative_vel = new Vector2(0.0, 0.0).minus(this.particle.vel);

            var elastic_gen = this.stiffness/this.length * (actual_length - this.length);
            var damping_gen = relative_vel.dot(normalized_dir) * this.damping_par;
            
            var elastic = normalized_dir.times(1/this.particle.mass * elastic_gen);
            var damping = normalized_dir.times(damping_gen * 1/this.particle.mass);

            var acc_particle = elastic.add(damping);

            this.particle.acc.add(acc_particle);
        }
        draw(){
            drawLine(this.particle.pos,this.point);

            // draw point
            drawCircle(this.point,0.1,'#000000')
        }
    }

    class Spring {
        constructor(particle1, particle2, stiffness=1.0, damping_par = 1.0){
            this.particle1 = particle1;
            this.particle2 = particle2;
            this.stiffness = stiffness;
            this.damping_par = damping_par;
            this.length = particle2.pos.minus(particle1.pos).length();
        }
        simulate(){
            var relative_pos = this.particle2.pos.minus(this.particle1.pos);
            var actual_length = relative_pos.length();
            var normalized_dir1 = relative_pos.divide(actual_length);
            var normalized_dir2 = relative_pos.divide(actual_length).times(-1.0);
            var relative_vel = this.particle2.vel.minus(this.particle1.vel);

            var elastic_gen = this.stiffness/this.length * (actual_length - this.length);
            var damping_gen = relative_vel.dot(normalized_dir1) * this.damping_par;

            var acc_particle1 = normalized_dir1.times(1/this.particle1.mass * elastic_gen).add(normalized_dir1.times(damping_gen * 1/this.particle1.mass));
            var acc_particle2 = normalized_dir2.times(1/this.particle2.mass * elastic_gen).add(normalized_dir2.times(damping_gen * 1/this.particle2.mass));


            this.particle1.acc.add(acc_particle1);
            this.particle2.acc.add(acc_particle2);
        }
        draw(){
            drawLine(this.particle1.pos,this.particle2.pos);
        }
    }

    class TriangleSpring {
        constructor(particle1, particle2, particle3, stiffness=1.0, /*damping_par = 1.0,*/ color = '#008f8f'){
            this.particle1 = particle1;
            this.particle2 = particle2;
            this.particle3 = particle3;
            this.stiffness = stiffness;
            //this.damping_par = damping_par;
            this.area = 1/2 * particle1.pos.minus(particle3.pos).cross(particle2.pos.minus(particle3.pos));
            this.faktor = (this.area > 0)? 1:-1;

            this.color = color;
        }
        simulate(){
            if(this.area == 0){	//don't devide by zero
                this.area = 0.1;	
            }
            var e1 = this.particle1.pos.minus(this.particle3.pos);	// vektor von p3 zu p1
            var e2 = this.particle2.pos.minus(this.particle3.pos);	// vektor von p3 zu p2

            var a = e1.cross(e2);
            if(a == 0){	//don't devide by zero
                a = 0.1;
            }

            var fak = this.faktor;
            if(Math.sign(a) != Math.sign(this.area)){
                fak=-fak
            }

            var s = this.stiffness/(2*Math.abs(this.area)*Math.abs(a)) * (1/2*a - this.area);

            var acc1 = e2.perp().times(a * s * 1/this.particle1.mass * fak);
            var acc2 = e1.perp().times(-1 * a * s * 1/this.particle2.mass * fak);
            var acc3 = e2.minus(e1).perp().times(-1 * a * s * 1/this.particle3.mass * fak);

            this.particle1.acc.add(acc1);
            this.particle2.acc.add(acc2);
            this.particle3.acc.add(acc3);
        }
        draw(){
            drawPolygon([this.particle1.pos,this.particle2.pos,this.particle3.pos],this.color,"#ffffff",3) //points,fillColor,strokeColor,lineWidth
        }
    }


// physical objects -----------------------------------------------------------
    //parent classes
    class SimplePhysicsObject {
        constructor(){
            this.particles =[];
            this.springs = [];
            this.triangle_springs = [];
            this.isVisible = true;
        }
        simulate(gravity,dt,method='euler-cromer',colliders=[]){
            //springs
            for (var i = 0; i < this.springs.length; i++){
                this.springs[i].simulate();		//add spring accelaration
            }
            for (var i = 0; i < this.triangle_springs.length; i++){
                this.triangle_springs[i].simulate();		//add spring accelaration
            }

            //particles
            for (var i = 0; i < this.particles.length; i++){
                this.particles[i].acc.add(gravity);	//add gravity

                for (var j = 0; j < colliders.length; j++){
                    colliders[j].collideWithParticle(this.particles[i],dt); //collide with planes, etc.
                }

                this.particles[i].simulate(dt, method);	//simulate particles using specified method
                
                this.particles[i].acc = new Vector2(0,0);			//reset acc
            }
        }
        draw(){
            if (!this.isVisible){
                return;
            }
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].draw();
            }

            for (var i = 0; i < this.triangle_springs.length; i++) {
                this.triangle_springs[i].draw();
            }
            for (var i = 0; i < this.springs.length; i++) {
                this.springs[i].draw();
            }
        }
        addVelocity(vel){
            for (var i = 0; i < this.particles.length; i++){
                this.particles[i].vel.add(vel);
            }
        }
        addForce(force){
            for (var i = 0; i < this.particles.length; i++){
                this.particles[i].acc.add(force.divide(this.particles[i].mass));
            }
        }
    }

    class ComplexPhysicsObject extends SimplePhysicsObject {
        constructor(){
            super();
            this.objects = [];
        }
        simulate(gravity,dt,method='euler-cromer',colliders=[]){
            super.simulate(gravity,dt,method,colliders);

            //objects
            for (var i=0; i<this.objects.length;i++){
                this.objects[i].simulate(gravity,dt,method,colliders);
            }
        }
        draw(){
            super.draw();
            
            for (var i=0; i<this.objects.length;i++){
                this.objects[i].draw();
            }
        }
    }

    //simple physics objects
    
    class ChaosPendulum extends SimplePhysicsObject{
        constructor(pos = new Vector2(15,15),masses = [50,40,30],distances=[new Vector2(0,2),new Vector2(1,2),new Vector2(2,1)],velocities=[new Vector2(5,0),new Vector2(15,0),new Vector2(5,0)]){
            super();
            // Setup Particles
            this.particles.push(new Particle(masses[0], masses[0]/100, pos.plus(distances[0]), velocities[0]));
            this.particles.push(new Particle(masses[1], masses[1]/100, pos.plus(distances[0]).plus(distances[1]), velocities[1]));
            this.particles.push(new Particle(masses[2], masses[2]/100, pos.plus(distances[0]).plus(distances[1]).plus(distances[2]), velocities[2]));

            // Setup Springs
            this.springs.push(new FixedSpring(pos, this.particles[0], 50000.0, 1000.0));
            this.springs.push(new Spring(this.particles[0], this.particles[1], 50000.0, 1000.0));
            this.springs.push(new Spring(this.particles[1], this.particles[2], 50000.0, 1000.0));	
        }
    }

    class ElasticSquare extends SimplePhysicsObject{
        constructor(side_length,pos=[1,1],vel=new Vector2(10,5),scale=1.5,stiffness=10000.0,damping_par=10.0){
            super();
            this.stiffness = stiffness;
            this.damping_par = damping_par;

            // setup particles
            for (var x = pos[0]; x < pos[0]+side_length; x++){
                for (var y = pos[1]; y < pos[1]+side_length; y++){
                    this.particles.push(new Particle(10, 0.1, new Vector2(x*scale, y*scale), vel));
                }
            }

            // connect with springs
            for (var i = 0; i < side_length-1; i++){
                for (var j = 0; j < side_length-1; j++){
                    //diagonals
                    this.springs.push(new Spring(this.particles[side_length*i+j], this.particles[side_length+side_length*i+j+1], this.stiffness, this.damping_par));
                    this.springs.push(new Spring(this.particles[side_length+side_length*i+j], this.particles[side_length*i+j+1], this.stiffness, this.damping_par));
                }
            }

            for (var j = 0; j < side_length; j++){
                for (var i = 0; i < side_length-1; i++){
                    this.springs.push(new Spring(this.particles[i*side_length+j], this.particles[(i+1)*side_length+j], this.stiffness, this.damping_par));
                    this.springs.push(new Spring(this.particles[i+side_length*j], this.particles[i+1+side_length*j], this.stiffness, this.damping_par));
                }
            }
        }	
    }
    
    class BoingBall extends SimplePhysicsObject{
        constructor(side_length,pos=[0,0],vel = new Vector2(0.0,0.0),area_stiffness = 8000,surface_stiffness = 8000,spring_stiffness = 8000,damping = 70,color='#fe6a30',surface_area = 0.9,scale=2){
            super();
            this.area_stiffness = area_stiffness;
            this.surface_stiffness = surface_stiffness;
            this.spring_stiffness = spring_stiffness;
            this.damping = damping;

            // Particles
            for (var i=0; i<side_length; i++){
                for (var j=0; j<side_length; j++){
                    this.particles.push(new Particle(10, 0.1, new Vector2(pos[0]+scale*i, pos[1]+scale*j), vel,new Vector2(0,0),0,color));
                }
            }

            // Triangle Springs
            if(area_stiffness != 0){ // only if it makes sence
                for (var i=0; i<side_length-1; i++){
                    for (var j=0;j<side_length-1;j++){
                        if((i+j)%2==0){
                            this.triangle_springs.push(new TriangleSpring(this.particles[i+side_length*j],this.particles[1+i+side_length*j],this.particles[side_length+i+side_length*j],this.area_stiffness,color));
                            this.triangle_springs.push(new TriangleSpring(this.particles[(side_length+1)+i+side_length*j],this.particles[1+i+side_length*j],this.particles[side_length+i+side_length*j],this.area_stiffness,color));
                        }
                        else{
                            this.triangle_springs.push(new TriangleSpring(this.particles[i+side_length*j],this.particles[1+i+side_length*j],this.particles[(side_length+1)+i+side_length*j],this.area_stiffness,color));
                            this.triangle_springs.push(new TriangleSpring(this.particles[i+side_length*j],this.particles[(side_length+1)+i+side_length*j],this.particles[side_length+i+side_length*j],this.area_stiffness,color));
                        }
                    }
                }
            }


            var start = 1;
            // Surface Springs for making Ball
            if (this.surface_stiffness != 0){
                for (var i = 0; i < side_length-1; i++){
                    this.springs.push(new Spring(this.particles[i*side_length], this.particles[(i+1)*side_length], this.surface_stiffness, this.damping));
                    this.springs[this.springs.length-1].length = surface_area;
                    this.springs.push(new Spring(this.particles[i], this.particles[i+1], this.surface_stiffness, this.damping));
                    this.springs[this.springs.length-1].length = surface_area;
                    this.springs.push(new Spring(this.particles[side_length*(side_length-1)+i], this.particles[side_length*(side_length-1)+i+1], this.surface_stiffness, this.damping));
                    this.springs[this.springs.length-1].length = surface_area;
                    this.springs.push(new Spring(this.particles[side_length-1+i*side_length], this.particles[side_length-1+(i+1)*side_length], this.surface_stiffness, this.damping));
                    this.springs[this.springs.length-1].length = surface_area;
                }
            }
            else{
                start = 0;
            }

            // Stabilization
            if (this.spring_stiffness != 0){
                for (var j = start; j < side_length-start; j++){
                    for (var i = 0; i < side_length-1; i++){
                        this.springs.push(new Spring(this.particles[i*side_length+j], this.particles[(i+1)*side_length+j], this.spring_stiffness, this.damping));
                        this.springs.push(new Spring(this.particles[i+side_length*j], this.particles[i+1+side_length*j], this.spring_stiffness, this.damping));
                    }
                }
    
                for (var i = 0; i < side_length-1; i++){
                    for (var j = 0; j < side_length-1; j++){
                        //diagonals
                        this.springs.push(new Spring(this.particles[side_length*i+j], this.particles[side_length+side_length*i+j+1], this.spring_stiffness-2000, this.damping));
                        this.springs.push(new Spring(this.particles[side_length+side_length*i+j], this.particles[side_length*i+j+1], this.spring_stiffness-2000, this.damping));
                    }
                }
            }
            
        }
    }

    // visual physics objects
    class ElasticPolygon extends SimplePhysicsObject {
        constructor(physob,polygon,color='#aa2200',stroke='#000000'){
            super()
            this.particles = physob.particles;
            this.springs = physob.springs;
            this.triangle_springs = physob.triangle_springs;
            this.polygon = polygon;
            this.isVisible = false;
            this.color = color;
            this.stroke = stroke;

            this.hasArray = [];
            for(var i=0;i<polygon.length;i++){  // for each point of hase
                var smallest = [-1,1,0,0];
                var found = false
                for (var j=0;j<this.triangle_springs.length;j++){ // for each triangleSpring in ball
                    // do some magic to get a1,a2,a3 
                    var sp = this.triangle_springs[j];
                    var x12 = sp.particle2.pos.minus(sp.particle1.pos);
                    var x13 = sp.particle3.pos.minus(sp.particle1.pos);
            
                    var det = x12.cross(x13);
                    
                    var v1 = new Vector2(x13.y,-x12.y);
                    var v2 = new Vector2(-x13.x,x12.x);
            
                    var s1 = polygon[i].x - sp.particle1.pos.x;
                    var s2 = polygon[i].y - sp.particle1.pos.y;
            
                    var a = v1.times(s1).plus(v2.times(s2)).divide(det);    //a2=a.x, a3=a.y
            
                    if (smallest[0] == -1 || (a.x+a.y<smallest[2]+smallest[3] && a.x >= 0 && a.y >= 0)){
                        smallest = [j,(1-a.x-a.y),a.x,a.y];
                    }
                    if(a.x >= 0 && a.y >= 0 && a.x+a.y <=1){    // if point of hase is inside triangle
                        this.hasArray.push([j,(1-a.x-a.y),a.x,a.y]);     //add index of triangle, a1-a3 to hasArray. a1 = 1-a2-a3
                        found = true;
                        break
                    }
                }
                if(!found){
                    this.hasArray.push(smallest); 
                }
            }

        }
        updateHase(){  //reconstruct hase from ball.springs using hasArray 
            var sp = this.triangle_springs;
            this.polygon = []
        
            for(var i=0;i<this.hasArray.length;i++){
                var arr = this.hasArray[i];
                var dreieck = sp[arr[0]];
                this.polygon.push(dreieck.particle1.pos.times(arr[1]).plus(dreieck.particle2.pos.times(arr[2])).plus(dreieck.particle3.pos.times(arr[3])))
            }
            
        }
        simulate(gravity,dt,method='euler-cromer',colliders=[]){
            super.simulate(gravity,dt,method='euler-cromer',colliders)
            this.updateHase()
        }
        draw(){
            if (this.isVisible)
                super.draw()
            drawPolygon(this.polygon,this.color,this.stroke);
        }
    }

	//other physics objects/springs/particles have to be contained in a World. otherwise, canvas needs to be cleared manually.
	class World extends ComplexPhysicsObject {
		constructor(dt=1/60.0,external_acc=new Vector2(0.0, -10.0)){
			super();
			this.dt = dt;
			this.external_acc = external_acc;
            this.colliders = [];
		}
		simulate(method='euler-cromer'){
			super.simulate(this.external_acc,this.dt,method,this.colliders);
		}
		draw(){
			c.clearRect(0, 0, canvas.width, canvas.height);
			
            for (var i=0;i<this.colliders.length;i++){
                this.colliders[i].draw();
            }
			super.draw();
		}
	}
