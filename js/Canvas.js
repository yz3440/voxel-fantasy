class Canvas {
    constructor(index, scene, sizeX, sizeY, posX, posY, posZ, color) {

        this.index = index;

        this.scene = scene;

        this.oriPos = new THREE.Vector3(posX, posY, posZ);
        this.pos = new THREE.Vector3(posX, posY, posZ);
        this.size = new THREE.Vector2(sizeX, sizeY);


        //canvas surface
        this.planeGeometry = new THREE.PlaneBufferGeometry(sizeX, sizeY);
        this.planeMaterial = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
        this.surfaceObj = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
        this.surfaceObj.position.set(this.pos.x, this.pos.y, this.pos.z);

        //canvas frame
        this.edgesGeometry = new THREE.EdgesGeometry(this.planeGeometry);
        this.edgeMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 10});
        this.frameObj = new THREE.LineSegments(this.edgesGeometry, this.edgeMaterial);
        this.frameObj.position.set(this.pos.x, this.pos.y, this.pos.z);

        this.scene.add(this.frameObj);
        // this.scene.add(this.surfaceObj);


        //following attributes for calculations

        // this.unitVectorX = new THREE.Vector3(1, 0, 0);
        // this.unitVectorY = new THREE.Vector3(0, 1, 0);
        this.unitVectorZ = new THREE.Vector3(0, 0, 1);
        this.plane = new THREE.Plane(this.unitVectorZ, this.pos.length());
        let rotationX = this.surfaceObj.rotation.x;
        let rotationY = this.surfaceObj.rotation.y;
        let rotationZ = this.surfaceObj.rotation.z;
        this.euler = new THREE.Euler(rotationX, rotationY, rotationZ, "XYZ");
        this.reverseEuler = new THREE.Euler(-rotationX, -rotationY, -rotationZ, "XYZ");

        // let geometry = new THREE.Geometry();
        // geometry.vertices.push(this.pos);
        // geometry.vertices.push(this.pos.clone().add(new THREE.Vector3(10, 10, 10)));
        // this.line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 1000}));
        // this.scene.add(this.line);

        //to store the painted shapes
        this.imprintsFront = [];
        this.imprintsBack = [];
    }

    updateTranslation(controlHand) {
        if (controlHand.hasHandOnce) {
            let rotationX = 0;
            let rotationY = 0;
            let rotationZ = 0;

            if (controlHand.hasHand) {
                let relativeMovement = controlHand.relativePos;
                this.pos.setX(relativeMovement.x);
                this.pos.setY(relativeMovement.y);
                this.pos.setZ(relativeMovement.z + this.oriPos.z);
                rotationX = Math.asin(controlHand.normalVector.z);
                rotationY = -Math.asin(controlHand.directionVector.x);
                rotationZ = Math.asin(controlHand.normalVector.x);
            } else {
                this.pos = this.oriPos.clone();
            }

            // update position but not when it doesn't have hand for both current and previous
            if (!(!controlHand.prevHasHand && !controlHand.hasHand)) {
                this.frameObj.position.set(this.pos.x, this.pos.y, this.pos.z);
                this.surfaceObj.position.set(this.pos.x, this.pos.y, this.pos.z);
                this.imprintsFront.forEach((imprint) => {
                    imprint.position.set(this.pos.x, this.pos.y, this.pos.z);
                });
                this.imprintsBack.forEach((imprint) => {
                    imprint.position.set(this.pos.x, this.pos.y, this.pos.z);
                });

            }
            let lerpSpeed = 0.4;
            this.frameObj.rotation.x = THREE.Math.lerp(this.frameObj.rotation.x, rotationX, lerpSpeed);
            this.surfaceObj.rotation.x = THREE.Math.lerp(this.surfaceObj.rotation.x, rotationX, lerpSpeed);
            this.frameObj.rotation.y = THREE.Math.lerp(this.frameObj.rotation.y, rotationY, lerpSpeed);
            this.surfaceObj.rotation.y = THREE.Math.lerp(this.surfaceObj.rotation.y, rotationY, lerpSpeed);
            this.frameObj.rotation.z = THREE.Math.lerp(this.frameObj.rotation.z, rotationZ, lerpSpeed);
            this.surfaceObj.rotation.z = THREE.Math.lerp(this.surfaceObj.rotation.z, rotationZ, lerpSpeed);
        }

        this
            .updateEuler();

        this
            .updateCoordinateVectors();

        this
            .updatePlane();

    }

    updateImprints(bullets) {
        // console.log(bullets);
        bullets.forEach((bullet) => {
            //only check when this bullet is close enough to improve performance

            if (bullet.isNearCanvas) {
                //     console.log('checking');
                let collidingPoints = this.checkCollision(bullet);
                if (collidingPoints.length > 0) {
                    // console.log(collidingPoints);
                    collidingPoints = this.transformToCanvasCoordinate(collidingPoints);
                    collidingPoints = this.sortWithJarvisMarch(collidingPoints);
                    if (bullet instanceof StillBullet)
                        this.addImprints(collidingPoints, bullet.cube.color);
                    else
                        this.addImprints(collidingPoints, bullet.color);

                }
            }
        });
        this.translateImprints();

    }

    checkCollision(bullet) {
        // console.log(bullet);
        let pointCloud = bullet.pointCloud;
        let collidingPoints = [];
        pointCloud.forEach((points) => {
            points.forEach((point) => {
                let pointToCenter = new THREE.Vector3(point.x - this.pos.x, point.y - this.pos.y, point.z - this.pos.z);
                // console.log(pointToCenter.dot(this.unitVectorZ));
                let crossThreshold = 0.15;
                if (Math.abs(pointToCenter.dot(this.unitVectorZ)) < crossThreshold) {
                    collidingPoints.push(pointToCenter);
                    // console.log("hit");

                }
            })
        });

        return collidingPoints;
    }

    transformToCanvasCoordinate(inputs) {

        let outputs = [];
        inputs.forEach((point) => {
            point.applyEuler(this.reverseEuler);

            outputs.push(new THREE.Vector2(point.x, point.y));
        });
        return outputs;
    }

    sortWithJarvisMarch(inputs) {
        // console.log(inputs);
        let ptsv = new PointsToShapeVertices(inputs);
        ptsv.jarvisMarch();
        ptsv.addNoise();
        ptsv.relocatePointOutOfCanvas(this);
        return ptsv.points;
        // console.log(jm.jarvisMarch());
        // return jm.jarvisMarch();
    }

    addImprints(collidingPoints, color) {
        // console.log(collidingPoints);
        let imprintShape = new THREE.Shape();
        let currentPoint = collidingPoints[0];
        imprintShape.moveTo(currentPoint.x, currentPoint.y);
        for (let i = 1; i < collidingPoints.length; i++) {
            imprintShape.lineTo(collidingPoints[i].x, collidingPoints[i].y);
        }

        let imprintGeometry = new THREE.ShapeBufferGeometry(imprintShape);
        let imprintMaterial = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
        let imprintMeshFront = new THREE.Mesh(imprintGeometry, imprintMaterial);
        let imprintMeshBack = new THREE.Mesh(imprintGeometry, imprintMaterial);

        this.scene.add(imprintMeshFront);
        this.scene.add(imprintMeshBack);

        imprintMeshFront.position.x = this.pos.x;
        imprintMeshFront.position.y = this.pos.y;
        imprintMeshFront.position.z = this.pos.z + 1;

        imprintMeshBack.position.x = this.pos.x;
        imprintMeshBack.position.y = this.pos.y;
        imprintMeshBack.position.z = this.pos.z - 1;

        this.imprintsFront.push(imprintMeshFront);
        this.imprintsBack.push(imprintMeshBack);

    }

    translateImprints() {
        this.imprintsFront.forEach((imprint) => {
            imprint.rotation.x = this.frameObj.rotation.x;
            imprint.rotation.y = this.frameObj.rotation.y;
            imprint.rotation.z = this.frameObj.rotation.z;
        });
        this.imprintsBack.forEach((imprint) => {
            imprint.rotation.x = this.frameObj.rotation.x;
            imprint.rotation.y = this.frameObj.rotation.y;
            imprint.rotation.z = this.frameObj.rotation.z;
        });
    }

    updateCoordinateVectors() {
        // this.unitVectorX = new THREE.Vector3(1, 0, 0).applyEuler(this.euler);
        // this.unitVectorY = new THREE.Vector3(0, 1, 0).applyEuler(this.euler);
        this.unitVectorZ = new THREE.Vector3(0, 0, 1).applyEuler(this.euler);

    }

    updatePlane() {
        this.plane.set(this.unitVectorZ, -this.pos.dot(this.unitVectorZ));
    }

    updateEuler() {
        let rotationX = this.surfaceObj.rotation.x;
        let rotationY = this.surfaceObj.rotation.y;
        let rotationZ = this.surfaceObj.rotation.z;
        this.plane = new THREE.Plane(this.unitVectorZ, this.pos.length());
        this.euler = new THREE.Euler(rotationX, rotationY, rotationZ, "XYZ");
        this.reverseEuler = new THREE.Euler(-rotationX, -rotationY, -rotationZ, "XYZ");
    }
}