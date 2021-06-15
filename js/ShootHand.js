class ShootHand {
    constructor(scene_, type_, colors_) {


        this.cubes = [];
        this.scene = scene_;
        this.colorIndex = 0;
        this.prevGrap = false;
        this.nowGrap = false;

        for (let i = 0; i < 20; i++) {
            this.cubes.push(new Cube(20, colors_[i%4], this.scene));
        }

        this.type = type_;
    }

    update(res, bullets) {
        let hasHand = false;
        res.forEach((hand) => {
            if (hand.type === this.type) {
                // console.log(hand);
                hasHand = true;
                let index = 0;
                this.prevGrap = this.nowGrap;

                if (hand.grabStrength === 1) {
                    this.nowGrap = true;
                } else {
                    this.nowGrap = false;
                }
                console.log(this.prevGrap, this.nowGrap);
                if (this.prevGrap && !this.nowGrap) {
                    for (let i = 0; i < this.cubes.length; i++) {
                        let size = colorPatterns["keys"].length;
                        this.cubes[i].color = (colorPatterns[colorPatterns['keys'][this.colorIndex%size]][i%4]);
                        this.cubes[i].obj.material.color.setHex(colorPatterns[colorPatterns['keys'][this.colorIndex%size]][i%4]);
                    }
                    this.colorIndex ++;
                }

                hand.fingers.forEach((finger) => {
                    let bones = finger.bones;
                    bones.forEach((bone) => {
                        this.cubes[index].update(bone);
                        this.cubes[index].checkVel(bullets);
                        index++;
                    })
                })
            }
        });
        if (!hasHand) {
            this.cubes.forEach((cube) => {
                cube.reset();
            })
        }

    }
}


