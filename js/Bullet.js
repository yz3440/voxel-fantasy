class Bullet {
    constructor(cube_) {
        this.isDead = false;
        this.isNearCanvas = false;

        this.cube = cube_;

        this.life = 0;

        this.size = this.cube.size;
        this.color = this.cube.color;
        this.scene = this.cube.scene;

        this.pointCloud = [];
        this.vertices2D = [];
        this.oriPointCloud = [];

        this.instance = [];

        this.pos = this.cube.pos.clone();
        this.vel = this.cube.vel.clone();

        this.geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        this.material = new THREE.MeshBasicMaterial({color: this.color});

        this.obj = new THREE.Mesh(this.geometry, this.material);

        this.obj.position.x = this.pos.x;
        this.obj.position.y = this.pos.y;
        this.obj.position.z = this.pos.z;

        this.scene.add(this.obj);

        this.generatePointCloud(this.size*1.5);

    }

    update() {
        this.pos.add(this.vel.normalize().multiplyScalar(1.5));

        this.obj.position.x = this.pos.x;
        this.obj.position.y = this.pos.y;
        this.obj.position.z = this.pos.z;

        this.obj.rotation.x += .1;
        this.obj.rotation.y += .1;

        this.life++;

        this.updatePointCloud();

        if (this.life > 300) {
            console.log("bullet removed");
            this.cube.isFly = false;
            // this.cube.isDisplay = true;
            this.isDead = true;
            this.scene.remove(this.obj);
        }
    }

    generatePointCloud(resolution) {


        if (this.vertices2D.length === 0) {
            let s = this.size / 1.5;
            this.vertices2D.push([new THREE.Vector3(s, s, s), new THREE.Vector3(s, s, -s), new THREE.Vector3(-s, s, -s), new THREE.Vector3(-s, s, s)]);
            this.vertices2D.push([new THREE.Vector3(s, -s, s), new THREE.Vector3(s, -s, -s), new THREE.Vector3(-s, -s, -s), new THREE.Vector3(-s, -s, s)]);
        }


        if (this.pointCloud.length === 0) {
            for (let h = 0; h < 2; h++) {
                for (let i = 0; i < 4; i += 2) {
                    this.pointCloud.push([this.vertices2D[h][i].clone(), this.vertices2D[h][1].clone()]);
                    this.pointCloud.push([this.vertices2D[h][i].clone(), this.vertices2D[h][3].clone()]);
                }
            }
            for (let i = 0; i < 4; i += 1) {
                this.pointCloud.push([this.vertices2D[0][i].clone(), this.vertices2D[1][i].clone()]);
            }
        }
        for (let j = 0; j < this.pointCloud.length; j++) {
            let x_1 = this.pointCloud[j][0].x;
            let x_2 = this.pointCloud[j][1].x;

            let y_1 = this.pointCloud[j][0].y;
            let y_2 = this.pointCloud[j][1].y;

            let z_1 = this.pointCloud[j][0].z;
            let z_2 = this.pointCloud[j][1].z;

            for (let i = 1; i < resolution; i++) {

                let factor = i / resolution;
                let rFractor = 1 - factor;

                this.pointCloud[j].push(new THREE.Vector3(factor * x_1 + rFractor * x_2, factor * y_1 + rFractor * y_2, factor * z_1 + rFractor * z_2))
            }
        }

        for (let i = 0; i < this.pointCloud.length; i++) {
            let temp = [];
            for (let j = 0; j < this.pointCloud[i].length; j++) {
                temp.push(this.pointCloud[i][j].clone())
            }
            this.oriPointCloud.push(temp);
        }

        // // visualization of point cloud
        // for (let i = 0; i < this.pointCloud.length; i++) {
        //     for (let j = 0; j < this.pointCloud[i].length; j++) {
        //         let g = new THREE.BoxGeometry(5,5,5);
        //         let m = new THREE.Mesh(g);
        //         m.position.x = this.pointCloud[i][j].x;
        //         m.position.y = this.pointCloud[i][j].y;
        //         m.position.z = this.pointCloud[i][j].z;
        //         this.instance.push(m);
        //         this.scene.add(m)
        //     }
        // }

        // console.log(this.cube.pos);
    }

    checkNearCanvas(canvas) {
        this.isNearCanvas = (Math.abs(canvas.plane.distanceToPoint(this.pos)) < (this.size / 2) * 1.5);
        // console.log(canvas.plane.distanceToPoint(this.pos));
        // if (this.isNearCanvas) {
        //     console.log("NEAR");
        // }
    }

    updatePointCloud() {

        if (this.isNearCanvas) {

            for (let i = 0; i < this.pointCloud.length; i++) {
                for (let j = 0; j < this.pointCloud[i].length; j++) {
                    this.pointCloud[i][j] = this.oriPointCloud[i][j].clone();
                }
            }

            for (let i = 0; i < this.pointCloud.length; i++) {
                for (let j = 0; j < this.pointCloud[i].length; j++) {
                    this.pointCloud[i][j].applyMatrix4(this.obj.matrix);
                    // this.instance[2*i + j].position.x = this.pointCloud[i][j].x;
                    // this.instance[2*i + j].position.y = this.pointCloud[i][j].y;
                    // this.instance[2*i + j].position.z = this.pointCloud[i][j].z;
                }
            }
        }
    }

    //pointCloud [ [ THREE.Vector3 * resolution] * 12 ]
}