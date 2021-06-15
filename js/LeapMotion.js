// let output = document.getElementById('output');

let res = [];

Leap.loop((frame) => {
    // output.innerHTML = 'Frame: ' + frame.id;
    res = [];
    if (frame.hands.length !== 0) {
        frame.hands.forEach((hand) => {
            // console.log(hand);
            res.push(hand);
            if (res.length === 2) {
                if (res[0].type === 'left') {
                    let temp = res[0];
                    res[0] = res[1];
                    res[0] = temp;
                }
            }
        })
    }
});


let getRes = () => {
    return res;
};


let getPalmPosition = () => {
    let ans = [];
    res.forEach((hand) => {
        ans.push(hand.palmPosition);
    });
    return ans;
};

let getPalmVel = () => {
    let ans = [];
    res.forEach((hand) => {
        ans.push(hand.palmVelocity);
    });
    return ans;
};

let getHandDirection = () => {
    let ans = [];
    res.forEach((hand) => {
        ans.push(hand.direction);
    });
    return ans;
};

let getHandNormDirection = () => {
    let ans = [];
    res.forEach((hand) => {
        ans.push(hand.palmNormal);
    });
    return ans;
};

let getIndexFingerDirection = () => {
    let ans = [];
    res.forEach((hand) => {
        ans.push(hand.indexFinger.direction);
    });
    return ans;
};

let isStretched = () => {
    let ans = [false, false];
    for (let i = 0; i < res.length; i++) {
        res[i].fingers.forEach((finger) => {
            res[i] = res[i] && finger.extended;
        })
    }
    return ans;
};

let isDrawing = () => {
    let ans = [false, false];

    for (let i = 0; i < res.length; i++) {
        if (res[0].fingers[0].extended && res[0].fingers[1].extended) {
            ans[i] = true;
        }
    }
    return ans;
};
