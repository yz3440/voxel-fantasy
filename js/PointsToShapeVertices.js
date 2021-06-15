class PointsToShapeVertices {
    //the JarvisMarch class is built to sort an array of points
    //in the sorted order, they can be connected and build a polygon
    constructor(points) {
        this.points = points;
    }

    compare(a, b) {
        return ((a.y < b.y) || (a.y === b.y && a.x < b.x));
    }

    cross(o, a, b) {
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }

    distSq(a, b) {
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    }

    aIsFar(o, a, b) {
        return this.distSq(o, a) > this.distSq(o, b);
    }

    jarvisMarch() {
        let inputs = this.points;
        let outputs = [];
        let start = 0;
        for (let i = 0; i < inputs.length; ++i) {
            if (this.compare(inputs[i], inputs[start])) start = i;
        }
        outputs.push(inputs[start]);
        for (let output_length = 1; true; output_length++) {
            let next = start;
            for (let i = 0; i < inputs.length; ++i) {
                let c = this.cross(outputs[output_length - 1], inputs[i], inputs[next]);
                if (c > 0 || c === 0 && this.aIsFar(outputs[output_length - 1], inputs[i], inputs[next])) {
                    next = i;
                }
            }
            if (next === start) break;
            outputs[output_length] = inputs[next];
        }
        this.points = outputs;
        return outputs;
    }

    addNoise() {
        let centerPoint = new THREE.Vector2(0, 0);
        this.points.forEach((point) => {
            centerPoint.add(point)
        });
        centerPoint.divideScalar(this.points.length);

        let newPoints = [];
        for (let i = 0; i < this.points.length; i++) {
            newPoints.push(this.points[i]);
            let newPoint = this.points[i].clone().add(this.points[(i + 1) % this.points.length].clone()).divideScalar(2);
            newPoint.add(newPoint.clone().sub(centerPoint).multiplyScalar(Math.random() * 1.5));
            newPoints.push(newPoint);
        }

        this.points = newPoints;
    }

    relocatePointOutOfCanvas(canvas) {
        let width = canvas.size.x;
        let height = canvas.size.y;

        //relocate points that are outside of the canvas onto the canvas
        this.points.forEach((point) => {
                if (point.x > width / 2)
                    point.x = width / 2;
                else if (point.x < -width / 2)
                    point.x = -width / 2;

                if (point.y > height / 2)
                    point.y = height / 2;
                else if (point.y < -height / 2)
                    point.y = -height / 2;
            }
        );
    }
}