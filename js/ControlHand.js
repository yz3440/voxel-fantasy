class ControlHand {
    constructor(scene_, type_) {
        this.cubes = [];
        this.scene = scene_;

        let planeGeometry = new THREE.PlaneBufferGeometry(50, 50);
        let planeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
        this.surfaceObj = new THREE.Mesh(planeGeometry, planeMaterial);

        this.pos = new THREE.Vector3(0, 0, 0);
        this.centerPos = new THREE.Vector3(0, 0, 0);
        this.relativePos = new THREE.Vector3(0, 0, 0);

        this.normalVector = new THREE.Vector3(0, -1, 0);
        this.directionVector = new THREE.Vector3(0, 0, 1);

        this.hasHandOnce = false;
        this.prevHasHand = false;
        this.hasHand = false;

        this.type = type_;
    }

    update(res) {
        this.prevHasHand = this.hasHand;
        this.hasHand = false;
        res.forEach((hand) => {

                if (hand.type === this.type) {

                    if (!this.hasHandOnce) {
                        this.hasHandOnce = true;
                        // this.scene.add(this.surfaceObj);
                        // console.log(hand);
                    }

                    this.hasHand = true;

                    //update normal vector from palm vector here
                    if (hand.grabStrength === 0) {

                        let updateThreshold = 1;
                        let currentNormalVector = new THREE.Vector3(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]);
                        let currentDirectionVector = new THREE.Vector3(hand.direction[0], hand.direction[1], hand.direction[2]);

                        //if previously has hand, changes in normal vector should be in threshold
                        //if hand has been reset, then update the normal vector anyway
                        if ((this.prevHasHand && currentNormalVector.angleTo(this.normalVector) < updateThreshold) || !this.prevHasHand) {
                            this.normalVector = currentNormalVector;
                            this.directionVector = currentDirectionVector;
                        }

                        this.pos.set(hand.palmPosition[0], hand.palmPosition[1] - 200, hand.palmPosition[2] - 400);

                        this.surfaceObj.position.set(this.pos.x, this.pos.y, this.pos.z);
                        this.surfaceObj.rotation.x = -Math.asin(this.normalVector.z) + Math.PI / 2;
                        this.surfaceObj.rotation.y = Math.asin(this.normalVector.x);
                        // this.surfaceObj.rotation.y = -Math.asin(this.normalVector.y);
                    } else {
                        this.normalVector = new THREE.Vector3(0, -1, 0);
                        this.directionVector = new THREE.Vector3(0, 0, -1);
                        this.pos.set(hand.palmPosition[0], hand.palmPosition[1] - 200, hand.palmPosition[2] - 400);
                        this.resetCenterPosition(this.pos);
                    }

                    if (!this.prevHasHand) {
                        this.resetCenterPosition(this.pos);
                        // this.scene.add(this.surfaceObj);
                    }


                    this.updateRelativePosition();
                }
            }
        );

        if (!this.hasHand) this.scene.remove(this.surfaceObj);

    }


    resetCenterPosition(newCenter) {
        this.centerPos = newCenter.clone();
        // console.log("Reset");
    }

    updateRelativePosition() {
        this.relativePos = this.pos.clone().sub(this.centerPos).multiplyScalar(2);
    }
}


