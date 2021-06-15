class Cube {

    constructor(size_, color_, scene_) {
        this.size = size_;
        this.color = color_;
        this.scene = scene_;

        this.ppos = new THREE.Vector3( 0, 0, 0 );
        this.pos = new THREE.Vector3(0, 0, 0);
        this.vel = new THREE.Vector3(0, 0, 0);

        this.isFly = false;
        this.isDisplay = true;

        this.geometry = new THREE.BoxGeometry( this.size, this.size, this.size );
        this.material = new THREE.MeshBasicMaterial( { color: this.color } );

        this.obj = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.obj);
    }

    update(data) {
        this.still(data);
        //upate' cloud
        this.material.wireframe = this.isFly;

        if (this.isFly){
            this.obj.material.color.setHex(this.color);
        }
    }

    reset() {
        this.ppos.set(0, 0, 0);
        this.pos.set(0, 0, 0);
        this.vel.set(0, 0, 0);
        this.obj.material.color.setHex(this.color);
        this.material.wireframe = false;

        this.obj.position.set(this.pos);
        // console.log("reset");
    }

    checkVel(bullets) {
        if (this.vel.distanceTo(new THREE.Vector3(0, 0, 0)) > 65 && this.vel.z < 0 && !this.ppos.equals(new THREE.Vector3(0, 0, 0)) && !this.isFly) {
            this.isDisplay = false;
            this.isFly = true;
            bullets.push(new Bullet(this));
        }
    }

    fly() {
        this.pos.add(this.vel.normalize());
        this.obj.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.obj.rotation.x += .1;
        this.obj.rotation.y += .1;
    }

    still(data) {
        this.ppos = this.pos.clone();
        this.pos.setX(data.center()[0]);
        this.pos.setY(data.center()[1]-200);
        this.pos.setZ(data.center()[2]-400);
        // console.log(this.pos);
        this.obj.position.set(this.pos.x, this.pos.y, this.pos.z);

        this.vel.subVectors(this.pos, this.ppos);

        this.obj.rotation.x += .1;
        this.obj.rotation.y += .1;
    }


}