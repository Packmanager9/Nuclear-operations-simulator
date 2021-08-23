
window.addEventListener('DOMContentLoaded', (event) => {


    const squaretable = {} // this section of code is an optimization for use of the hypotenuse function on Line and LineOP objects
    for(let t = 0;t<10000000;t++){
        squaretable[`${t}`] = Math.sqrt(t)
        if(t > 999){
            t+=9
        }
    }
    // const gamepadAPI = {
    //     controller: {},
    //     turbo: true,
    //     connect: function (evt) {
    //         if (navigator.getGamepads()[0] != null) {
    //             gamepadAPI.controller = navigator.getGamepads()[0]
    //             gamepadAPI.turbo = true;
    //         } else if (navigator.getGamepads()[1] != null) {
    //             gamepadAPI.controller = navigator.getGamepads()[0]
    //             gamepadAPI.turbo = true;
    //         } else if (navigator.getGamepads()[2] != null) {
    //             gamepadAPI.controller = navigator.getGamepads()[0]
    //             gamepadAPI.turbo = true;
    //         } else if (navigator.getGamepads()[3] != null) {
    //             gamepadAPI.controller = navigator.getGamepads()[0]
    //             gamepadAPI.turbo = true;
    //         }
    //         for (let i = 0; i < gamepads.length; i++) {
    //             if (gamepads[i] === null) {
    //                 continue;
    //             }
    //             if (!gamepads[i].connected) {
    //                 continue;
    //             }
    //         }
    //     },
    //     disconnect: function (evt) {
    //         gamepadAPI.turbo = false;
    //         delete gamepadAPI.controller;
    //     },
    //     update: function () {
    //         gamepadAPI.controller = navigator.getGamepads()[0]
    //         gamepadAPI.buttonsCache = [];// clear the buttons cache
    //         for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
    //             gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
    //         }
    //         gamepadAPI.buttonsStatus = [];// clear the buttons status
    //         var c = gamepadAPI.controller || {}; // get the gamepad object
    //         var pressed = [];
    //         if (c.buttons) {
    //             for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
    //                 if (c.buttons[b].pressed) {
    //                     pressed.push(gamepadAPI.buttons[b]);
    //                 }
    //             }
    //         }
    //         var axes = [];
    //         if (c.axes) {
    //             for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
    //                 axes.push(c.axes[a].toFixed(2));
    //             }
    //         }
    //         gamepadAPI.axesStatus = axes;// assign received values
    //         gamepadAPI.buttonsStatus = pressed;
    //         // console.log(pressed); // return buttons for debugging purposes
    //         return pressed;
    //     },
    //     buttonPressed: function (button, hold) {
    //         var newPress = false;
    //         for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
    //             if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
    //                 newPress = true;// set the boolean variable to true
    //                 if (!hold) {// if we want to check the single press
    //                     for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
    //                         if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
    //                             newPress = false;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         return newPress;
    //     },
    //     buttons: [
    //         'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
    //     ],
    //     buttonsCache: [],
    //     buttonsStatus: [],
    //     axesStatus: []
    // };
    let canvas
    let canvas_context
    let keysPressed = {}
    let FLEX_engine
    let TIP_engine = {}
    let XS_engine
    let YS_engine
    TIP_engine.x = 350
    TIP_engine.y = 350
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.radius = 0
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }

    class Vector{ // vector math and physics if you prefer this over vector components on circles
        constructor(object = (new Point(0,0)), xmom = 0, ymom = 0){
            this.xmom = xmom
            this.ymom = ymom
            this.object = object
        }
        isToward(point){
            let link = new LineOP(this.object, point)
            let dis1 = link.sqrDis()
            let dummy = new Point(this.object.x+this.xmom, this.object.y+this.ymom)
            let link2 = new LineOP(dummy, point)
            let dis2 = link2.sqrDis()
            if(dis2 < dis1){
                return true
            }else{
                return false
            }
        }
        rotate(angleGoal){
            let link = new Line(this.xmom, this.ymom, 0,0)
            let length = link.hypotenuse()
            let x = (length * Math.cos(angleGoal))
            let y = (length * Math.sin(angleGoal))
            this.xmom = x
            this.ymom = y
        }
        magnitude(){
            return (new Line(this.xmom, this.ymom, 0,0)).hypotenuse()
        }
        normalize(size = 1){
            let magnitude = this.magnitude()
            this.xmom/=magnitude
            this.ymom/=magnitude
            this.xmom*=size
            this.ymom*=size
        }
        multiply(vect){
            let point = new Point(0,0)
            let end = new Point(this.xmom+vect.xmom, this.ymom+vect.ymom)
            return point.pointDistance(end)
        }
        add(vect){
            return new Vector(this.object, this.xmom+vect.xmom, this.ymom+vect.ymom)
        }
        subtract(vect){
            return new Vector(this.object, this.xmom-vect.xmom, this.ymom-vect.ymom)
        }
        divide(vect){
            return new Vector(this.object, this.xmom/vect.xmom, this.ymom/vect.ymom) //be careful with this, I don't think this is right
        }
        draw(){
            let dummy = new Point(this.object.x+this.xmom, this.object.y+this.ymom)
            let link = new LineOP(this.object, dummy, "#FFFFFF", 1)
            link.draw()
        }
    }
    class Line {
        constructor(x, y, x2, y2, color, width) {
            this.x1 = x
            this.y1 = y
            this.x2 = x2
            this.y2 = y2
            this.color = color
            this.width = width
        }
        angle() {
            return Math.atan2(this.y1 - this.y2, this.x1 - this.x2)
        }
        squareDistance() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if(hypotenuse < 10000000-1){
                if(hypotenuse > 1000){
                    return squaretable[`${Math.round(10*Math.round((hypotenuse*.1)))}`]
                }else{
                return squaretable[`${Math.round(hypotenuse)}`]
                }
            }else{
                return Math.sqrt(hypotenuse)
            }
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.x1, this.y1)
            canvas_context.lineTo(this.x2, this.y2)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class LineOP {
        constructor(object, target, color, width) {
            this.object = object
            this.target = target
            this.color = color
            this.width = width
        }
        squareDistance() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if(hypotenuse < 10000000-1){
                if(hypotenuse > 1000){
                    return squaretable[`${Math.round(10*Math.round((hypotenuse*.1)))}`]
                }else{
                return squaretable[`${Math.round(hypotenuse)}`]
                }
            }else{
                return Math.sqrt(hypotenuse)
            }
        }
        angle() {
            return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.object.x, this.object.y)
            canvas_context.lineTo(this.target.x, this.target.y)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class Triangle {
        constructor(x, y, color, length, fill = 0, strokeWidth = 0, leg1Ratio = 1, leg2Ratio = 1, heightRatio = 1) {
            this.x = x
            this.y = y
            this.color = color
            this.length = length
            this.x1 = this.x + this.length * leg1Ratio
            this.x2 = this.x - this.length * leg2Ratio
            this.tip = this.y - this.length * heightRatio
            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
            this.fill = fill
            this.stroke = strokeWidth
        }
        draw() {
            canvas_context.strokeStyle = this.color
            canvas_context.stokeWidth = this.stroke
            canvas_context.beginPath()
            canvas_context.moveTo(this.x, this.y)
            canvas_context.lineTo(this.x1, this.y)
            canvas_context.lineTo(this.x, this.tip)
            canvas_context.lineTo(this.x2, this.y)
            canvas_context.lineTo(this.x, this.y)
            if (this.fill == 1) {
                canvas_context.fill()
            }
            canvas_context.stroke()
            canvas_context.closePath()
        }
        isPointInside(point) {
            if (point.x <= this.x1) {
                if (point.y >= this.tip) {
                    if (point.y <= this.y) {
                        if (point.x >= this.x2) {
                            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
                            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
                            this.basey = point.y - this.tip
                            this.basex = point.x - this.x
                            if (this.basex == 0) {
                                return true
                            }
                            this.slope = this.basey / this.basex
                            if (this.slope >= this.accept1) {
                                return true
                            } else if (this.slope <= this.accept2) {
                                return true
                            }
                        }
                    }
                }
            }
            return false
        }
    }
    class Rectangle {
        constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
            this.stroke = stroke
            this.strokeWidth = strokeWidth
            this.fill = fill
        }
        draw() {
            canvas_context.fillStyle = this.color
            canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        draw2() {
            canvas_context.strokeStyle = "#343434"
            canvas_context.strokeRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            if (point.x + point.radius >= this.x) {
                if (point.y + point.radius >= this.y) {
                    if (point.x - point.radius <= this.x + this.width) {
                        if (point.y - point.radius <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }

    class Pie {
        constructor(x, y, radius) {
            this.x = x
            this.y = y
            this.radius = radius
            this.colors = ['#FF0000dd', '#00FFFFdd', '#FFFF00dd', '#00ff00dd', '#0000FFdd', '#FFFFFFdd']
            this.cuts = []
            this.cuts.push(.5*Math.PI)
            for(let t = 0;t<this.colors.length-1;t++){
                this.cuts.push(this.cuts[this.cuts.length-1]+(Math.random()*1.5))
            }
            this.cuts.push((Math.PI*2)-.001)
            console.log(this.cuts)
        }
        draw() {
            for(let t = 1;t<this.cuts.length-1;t++){
                this.cuts[t]+=(Math.random()-.5)*.1
                if(t < this.cuts.length-1){
                    if(this.cuts[t] > this.cuts[t+1]){
                        this.cuts[t]-=.1
                    }
                }
                if(t > 0){
                    if(this.cuts[t] < this.cuts[t-1]){
                        this.cuts[t]+=.05
                    }
                }
            }

            for(let t = 0;t<this.cuts.length-1;t++){
                if(this.cuts[t] > Math.PI*2){
                    this.cuts[t]=(Math.PI*2)-.01
                }
                if(this.cuts[t] < 0){
                    this.cuts[t] = 0
                }
                canvas_context.beginPath();
                canvas_context.moveTo(this.x, this.y);
                canvas_context.arc(this.x, this.y, this.radius, this.cuts[t], this.cuts[t+1], false)
                canvas_context.fillStyle = this.colors[t]
                canvas_context.fill()
            }

            if(this.cuts[this.cuts.length-1] > this.cuts[0]){
                canvas_context.beginPath();
                canvas_context.moveTo(this.x, this.y);
                canvas_context.arc(this.x, this.y, this.radius, this.cuts[this.cuts.length-1], this.cuts[0], false)
                canvas_context.fillStyle = this.colors[this.colors.length-1]
                canvas_context.fill()
            }else{

            canvas_context.beginPath();
            canvas_context.moveTo(this.x, this.y);
            canvas_context.arc(this.x, this.y, this.radius, this.cuts[this.cuts.length-1], this.cuts[0], true)
            canvas_context.fillStyle = this.colors[this.colors.length-1]
            canvas_context.fill()
            }
        }

    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                // canvas_context.stroke();
            } else {
                console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } 
    class CircleRing {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = 10
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } class Polygon {
        constructor(x, y, size, color, sides = 3, xmom = 0, ymom = 0, angle = 0, reflect = 0) {
            if (sides < 2) {
                sides = 2
            }
            this.reflect = reflect
            this.xmom = xmom
            this.ymom = ymom
            this.body = new Circle(x, y, size - (size * .293), "transparent")
            this.nodes = []
            this.angle = angle
            this.size = size
            this.color = color
            this.angleIncrement = (Math.PI * 2) / sides
            this.sides = sides
            for (let t = 0; t < sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
        }
        isPointInside(point) { // rough approximation
            this.body.radius = this.size - (this.size * .293)
            if (this.sides <= 2) {
                return false
            }
            this.areaY = point.y - this.body.y
            this.areaX = point.x - this.body.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.body.radius * this.body.radius)) {
                return true
            }
            return false
        }
        move() {
            if (this.reflect == 1) {
                if (this.body.x > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.body.x < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.body.x += this.xmom
            this.body.y += this.ymom
        }
        draw() {
            this.nodes = []
            this.angleIncrement = (Math.PI * 2) / this.sides
            this.body.radius = this.size - (this.size * .293)
            for (let t = 0; t < this.sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
            canvas_context.strokeStyle = this.color
            canvas_context.fillStyle = this.color
            canvas_context.lineWidth = 0
            canvas_context.beginPath()
            canvas_context.moveTo(this.nodes[0].x, this.nodes[0].y)
            for (let t = 1; t < this.nodes.length; t++) {
                canvas_context.lineTo(this.nodes[t].x, this.nodes[t].y)
            }
            canvas_context.lineTo(this.nodes[0].x, this.nodes[0].y)
            canvas_context.fill()
            canvas_context.stroke()
            canvas_context.closePath()
        }
    }
    class Shape {
        constructor(shapes) {
            this.shapes = shapes
        }
        draw() {
            for (let t = 0; t < this.shapes.length; t++) {
                this.shapes[t].draw()
            }
        }
        isPointInside(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].isPointInside(point)) {
                    return true
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return true
                }
            }
            return false
        }
        innerShape(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return this.shapes[t]
                }
            }
            return false
        }
        isInsideOf(box) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (box.isPointInside(this.shapes[t])) {
                    return true
                }
            }
            return false
        }
        adjustByFromDisplacement(x,y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if(typeof this.shapes[t].fromRatio == "number"){
                    this.shapes[t].x+=x*this.shapes[t].fromRatio
                    this.shapes[t].y+=y*this.shapes[t].fromRatio
                }
            }
        }
        adjustByToDisplacement(x,y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if(typeof this.shapes[t].toRatio == "number"){
                    this.shapes[t].x+=x*this.shapes[t].toRatio
                    this.shapes[t].y+=y*this.shapes[t].toRatio
                }
            }
        }
        mixIn(arr){
            for(let t = 0;t<arr.length;t++){
                for(let k = 0;k<arr[t].shapes.length;k++){
                    this.shapes.push(arr[t].shapes[k])
                }
            }
        }
        push(object) {
            this.shapes.push(object)
        }
    }

    class Spring {
        constructor(x, y, radius, color, body = 0, length = 1, gravity = 0, width = 1) {
            if (body == 0) {
                this.body = new Circle(x, y, radius, color)
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            } else {
                this.body = body
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            }
            this.gravity = gravity
            this.width = width
        }
        balance() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += (this.body.x - this.anchor.x) / this.length
                this.body.ymom += (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom -= (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom -= (this.body.y - this.anchor.y) / this.length
            } else {
                this.body.xmom -= (this.body.x - this.anchor.x) / this.length
                this.body.ymom -= (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom += (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom += (this.body.y - this.anchor.y) / this.length
            }
            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            this.beam.draw()
            this.body.draw()
            this.anchor.draw()
        }
        move() {
            this.anchor.ymom += this.gravity
            this.anchor.move()
        }

    }  
    class SpringOP {
        constructor(body, anchor, length, width = 3, color = body.color) {
            this.body = body
            this.anchor = anchor
            this.beam = new LineOP(body, anchor, color, width)
            this.length = length
        }
        balance() {
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += ((this.body.x - this.anchor.x) / this.length) 
                this.body.ymom += ((this.body.y - this.anchor.y) / this.length) 
                this.anchor.xmom -= ((this.body.x - this.anchor.x) / this.length) 
                this.anchor.ymom -= ((this.body.y - this.anchor.y) / this.length) 
            } else if (this.beam.hypotenuse() > this.length) {
                this.body.xmom -= (this.body.x - this.anchor.x) / (this.length)
                this.body.ymom -= (this.body.y - this.anchor.y) / (this.length)
                this.anchor.xmom += (this.body.x - this.anchor.x) / (this.length)
                this.anchor.ymom += (this.body.y - this.anchor.y) / (this.length)
            }

            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam.draw()
        }
        move() {
            //movement of SpringOP objects should be handled separate from their linkage, to allow for many connections, balance here with this object, move nodes independently
        }
    }

    class Color {
        constructor(baseColor, red = -1, green = -1, blue = -1, alpha = 1) {
            this.hue = baseColor
            if (red != -1 && green != -1 && blue != -1) {
                this.r = red
                this.g = green
                this.b = blue
                if (alpha != 1) {
                    if (alpha < 1) {
                        this.alpha = alpha
                    } else {
                        this.alpha = alpha / 255
                        if (this.alpha > 1) {
                            this.alpha = 1
                        }
                    }
                }
                if (this.r > 255) {
                    this.r = 255
                }
                if (this.g > 255) {
                    this.g = 255
                }
                if (this.b > 255) {
                    this.b = 255
                }
                if (this.r < 0) {
                    this.r = 0
                }
                if (this.g < 0) {
                    this.g = 0
                }
                if (this.b < 0) {
                    this.b = 0
                }
            } else {
                this.r = 0
                this.g = 0
                this.b = 0
            }
        }
        normalize() {
            if (this.r > 255) {
                this.r = 255
            }
            if (this.g > 255) {
                this.g = 255
            }
            if (this.b > 255) {
                this.b = 255
            }
            if (this.r < 0) {
                this.r = 0
            }
            if (this.g < 0) {
                this.g = 0
            }
            if (this.b < 0) {
                this.b = 0
            }
        }
        randomLight() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12) + 4)];
            }
            var color = new Color(hash, 55 + Math.random() * 200, 55 + Math.random() * 200, 55 + Math.random() * 200)
            return color;
        }
        randomDark() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12))];
            }
            var color = new Color(hash, Math.random() * 200, Math.random() * 200, Math.random() * 200)
            return color;
        }
        random() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 16))];
            }
            var color = new Color(hash, Math.random() * 255, Math.random() * 255, Math.random() * 255)
            return color;
        }
    }
    class Softbody { //buggy, spins in place
        constructor(x, y, radius, color, size, members = 10, memberLength = 5, force = 10, gravity = 0) {
            this.springs = []
            this.pin = new Circle(x, y, radius, color)
            this.points = []
            this.flop = 0
            let angle = 0
            this.size = size 
            let line = new Line((Math.cos(angle)*size), (Math.sin(angle)*size), (Math.cos(angle+ ((Math.PI*2)/members))*size), (Math.sin(angle+ ((Math.PI*2)/members))*size) )
            let distance = line.hypotenuse()
            for(let t =0;t<members;t++){
                let circ = new Circle(x+(Math.cos(angle)*size), y+(Math.sin(angle)*size), radius, color)
                circ.reflect = 1
                circ.bigbody = new Circle(x+(Math.cos(angle)*size), y+(Math.sin(angle)*size), distance, color)
                circ.draw()
                circ.touch = []
                this.points.push(circ)
                angle += ((Math.PI*2)/members)
            }

            for(let t =0;t<this.points.length;t++){
                for(let k =0;k<this.points.length;k++){
                    if(t!=k){
                        if(this.points[k].bigbody.doesPerimeterTouch(this.points[t])){
                        if(!this.points[k].touch.includes(t) && !this.points[t].touch.includes(k)){
                                let spring = new SpringOP(this.points[k], this.points[t], (size*Math.PI)/members, 2, color)
                                this.points[k].touch.push(t)
                                this.points[t].touch.push(k)
                                this.springs.push(spring)
                                spring.beam.draw()
                            }
                        }
                    }
                }
            }

            console.log(this)

            // this.spring = new Spring(x, y, radius, color, this.pin, memberLength, gravity)
            // this.springs.push(this.spring)
            // for (let k = 0; k < members; k++) {
            //     this.spring = new Spring(x, y, radius, color, this.spring.anchor, memberLength, gravity)
            //     if (k < members - 1) {
            //         this.springs.push(this.spring)
            //     } else {
            //         this.spring.anchor = this.pin
            //         this.springs.push(this.spring)
            //     }
            // }
            this.forceConstant = force
            this.centroid = new Circle(0, 0, 10, "red")
        }
        circularize() {
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            this.angle = 0
            this.angleIncrement = (Math.PI * 2) / this.springs.length
            for (let t = 0; t < this.points.length; t++) {
                this.points[t].x = this.centroid.x + (Math.cos(this.angle) * this.forceConstant)
                this.points[t].y = this.centroid.y + (Math.sin(this.angle) * this.forceConstant)
                this.angle += this.angleIncrement 
            }
        }
        balance() {
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.points.length; s++) {
                this.xpoint += (this.points[s].x / this.points.length)
                this.ypoint += (this.points[s].y / this.points.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            // this.centroid.x += TIP_engine.x / this.points.length
            // this.centroid.y += TIP_engine.y / this.points.length
            for (let s = 0; s < this.points.length; s++) {
                this.link = new LineOP(this.points[s], this.centroid, 0, "transparent")
                if (this.link.hypotenuse() != 0) {

                    if(this.size < this.link.hypotenuse()){
                        this.points[s].xmom -= (Math.cos(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                        this.points[s].ymom -= (Math.sin(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                    }else{
                        this.points[s].xmom += (Math.cos(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                        this.points[s].ymom += (Math.sin(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                    }

                    // this.points[s].xmom += (((this.points[s].x - this.centroid.x) / (this.link.hypotenuse()))) * this.forceConstant
                    // this.points[s].ymom += (((this.points[s].y - this.centroid.y) / (this.link.hypotenuse()))) * this.forceConstant
                }
            }
            if(this.flop%2 == 0){
                for (let s =  0; s < this.springs.length; s++) {
                    this.springs[s].balance()
                }
            }else{
                for (let s = this.springs.length-1;s>=0; s--) {
                    this.springs[s].balance()
                }
            }
            for (let s = 0; s < this.points.length; s++) {
                this.points[s].move()
                this.points[s].draw()
            }
            for (let s =  0; s < this.springs.length; s++) {
                this.springs[s].draw()
            }
            this.centroid.draw()
        }
    }
    class Observer {
        constructor(x, y, radius, color, range = 100, rays = 10, angle = (Math.PI * .125)) {
            this.body = new Circle(x, y, radius, color)
            this.color = color
            this.ray = []
            this.rayrange = range
            this.globalangle = Math.PI
            this.gapangle = angle
            this.currentangle = 0
            this.obstacles = []
            this.raymake = rays
        }
        beam() {
            this.currentangle = this.gapangle / 2
            for (let k = 0; k < this.raymake; k++) {
                this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
                let ray = new Circle(this.body.x, this.body.y, 1, "white", (((Math.cos(this.globalangle + this.currentangle)))), (((Math.sin(this.globalangle + this.currentangle)))))
                ray.collided = 0
                ray.lifespan = this.rayrange - 1
                this.ray.push(ray)
            }
            for (let f = 0; f < this.rayrange; f++) {
                for (let t = 0; t < this.ray.length; t++) {
                    if (this.ray[t].collided < 1) {
                        this.ray[t].move()
                        for (let q = 0; q < this.obstacles.length; q++) {
                            if (this.obstacles[q].isPointInside(this.ray[t])) {
                                this.ray[t].collided = 1
                            }
                        }
                    }
                }
            }
        }
        draw() {
            this.beam()
            this.body.draw()
            canvas_context.lineWidth = 1
            canvas_context.fillStyle = this.color
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath()
            canvas_context.moveTo(this.body.x, this.body.y)
            for (let y = 0; y < this.ray.length; y++) {
                canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
                canvas_context.lineTo(this.body.x, this.body.y)
            }
            canvas_context.stroke()
            canvas_context.fill()
            this.ray = []
        }
    }
    function setUp(canvas_pass, style = "#666666") {
        canvas = canvas_pass
        canvas_context = canvas.getContext('2d');
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 20)
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
        window.addEventListener('pointerdown', e => {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine

            for(let t = 0;t<buttons.length;t++){

        if(buttons[t].button1.isPointInside(TIP_engine)){
            text.bepushed()
            buttons[t].recoil = buttons[t].button1.radius*.7
        }
            }
            // example usage: if(object.isPointInside(TIP_engine)){ take action }
        window.addEventListener('pointermove', continued_stimuli);

        });

        window.addEventListener('pointerup', e => {
            window.removeEventListener("pointermove", continued_stimuli);
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine

            for(let t = 0;t<buttons.length;t++){

                if(buttons[t].button1.isPointInside(TIP_engine)){
                    text.bepushed()
                    buttons[t].recoil = buttons[t].button1.radius*.7
                }
                    }
        }
    }
//     function gamepad_control(object, speed = 1) { // basic control for objects using the controler
// //         console.log(gamepadAPI.axesStatus[1]*gamepadAPI.axesStatus[0]) //debugging
//         if (typeof object.body != 'undefined') {
//             if(typeof (gamepadAPI.axesStatus[1]) != 'undefined'){
//                 if(typeof (gamepadAPI.axesStatus[0]) != 'undefined'){
//                 object.body.x += (gamepadAPI.axesStatus[0] * speed)
//                 object.body.y += (gamepadAPI.axesStatus[1] * speed)
//                 }
//             }
//         } else if (typeof object != 'undefined') {
//             if(typeof (gamepadAPI.axesStatus[1]) != 'undefined'){
//                 if(typeof (gamepadAPI.axesStatus[0]) != 'undefined'){
//                 object.x += (gamepadAPI.axesStatus[0] * speed)
//                 object.y += (gamepadAPI.axesStatus[1] * speed)
//                 }
//             }
//         }
//     }
    function control(object, speed = 1) { // basic control for objects
        if (typeof object.body != 'undefined') {
            if (keysPressed['w']) {
                object.body.y -= speed
            }
            if (keysPressed['d']) {
                object.body.x += speed
            }
            if (keysPressed['s']) {
                object.body.y += speed
            }
            if (keysPressed['a']) {
                object.body.x -= speed
            }
        } else if (typeof object != 'undefined') {
            if (keysPressed['w']) {
                object.y -= speed
            }
            if (keysPressed['d']) {
                object.x += speed
            }
            if (keysPressed['s']) {
                object.y += speed
            }
            if (keysPressed['a']) {
                object.x -= speed
            }
        }
    }
    function getRandomLightColor() { // random color that will be visible on  black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12) + 4)];
        }
        return color;
    }
    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    function getRandomDarkColor() {// color that will be visible on a black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12))];
        }
        return color;
    }
    function castBetween(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
            let limit = granularity
            let shape_array = []
            for (let t = 0; t < limit; t++) {
                let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
                circ.toRatio = t/limit
                circ.fromRatio = (limit-t)/limit
                shape_array.push(circ)
            }
            return (new Shape(shape_array))
    }

    let setup_canvas = document.getElementById('canvas') //getting canvas from document

    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    // object instantiation and creation happens here 

    class Graph{
        constructor(rect, color, rate, variance){
            this.body = rect
            this.color = color
            this.rate = rate
            this.variance = variance
            this.points = [new Point(this.body.x+this.body.width, this.body.y + (this.body.height*.5))]
        }
        draw(){
            this.body.draw()
            for(let t = 0;t<this.points.length;t++){
                if(this.points[t].x<this.body.x+this.rate){
                    this.points.splice(t,1)
                }
            }
            for(let t = 0;t<this.points.length;t++){
                this.points[t].x-=this.rate
            }
            for(let t = 1;t<this.points.length;t++){
                let link = new LineOP(this.points[t], this.points[t-1], this.color, 2)
                link.draw()
            }
            let point = new Point(this.points[this.points.length-1].x+this.rate, this.points[this.points.length-1].y+((Math.random()-.5)*this.variance))
            if(point.y > (this.body.y+this.body.height)-3){
                point.y = (this.body.y+this.body.height)-3
            }
            if(point.y < this.body.y+3){
                point.y = this.body.y+3
            }
            this.points.push(point)
            this.body.draw2()

        }
    }
    class CentralGraph{
        constructor(rect, color, rate, variance){
            this.body = rect
            this.color = color
            this.rate = rate
            this.variance = variance
            this.points = [new Point(this.body.x+this.body.width, this.body.y + (this.body.height*.99))]
        }
        draw(){
            this.body.draw()
            for(let t = 0;t<this.points.length;t++){
                if(this.points[t].x<this.body.x+this.rate){
                    this.points.splice(t,1)
                }
            }
            for(let t = 0;t<this.points.length;t++){
                this.points[t].x-=this.rate
            }
            for(let t = 1;t<this.points.length;t++){
                let link = new LineOP(this.points[t], this.points[t-1], "#FFAA00", 4)
                if(link.target.y < this.body.y+(this.body.height*.3)){
                    let link = new LineOP(this.points[t], this.points[t-1], "#FF3300", 4)
             
                    link.draw()
                }else  if(link.target.y > this.body.y+(this.body.height*.9)){
                    let link = new LineOP(this.points[t], this.points[t-1], "#00FF00", 4)
             
                    link.draw()
                }else if(link.target.y > this.body.y+(this.body.height*.6)){
                    let link = new LineOP(this.points[t], this.points[t-1], "#FFFF00", 4)
             
                    link.draw()
                }else{
                    link.draw()
                }

                // link.draw()
            }
            let point = new Point(this.points[this.points.length-1].x+this.rate, this.points[this.points.length-1].y+((Math.random()-(.505+(.5*(this.points.length/7000))))*this.variance))
            if(point.y > (this.body.y+this.body.height)-3){
                point.y = (this.body.y+this.body.height)-3
            }
            if(point.y < this.body.y+3){
                point.y = this.body.y+3
            }
            this.points.push(point)
            this.body.draw2()

        }
    }

    class TextRunner {
        constructor(rect){
            this.body = rect
            this.strings = []
            this.heights = []
            this.animals = ['A lion', 'A zebra', 'A cat', 'A horse', 'A sea cucumber', 'A rat', 'An ocelot', 'A sun bear', 'A turtle', 'A honeybee', 'A giant aftican landsnail', 'A hippo', 'A giraffe', 'A rhino', 'A maple tree', 'A left-handed person', 'An ostrich', 'An emu', 'A penguin', 'A goat', 'A pet rock', 'A lobster']
            this.people = ['cameramen', 'doctors', 'flea-marketers', 'shepards', 'lion-tamers', 'rat-milkers', 'office workers', 'tourists', 'beachgoers', 'blacksmiths', 'arborists', 'bee-keepers', 'right-handed people', 'yetis', 'polar explorers', 'train conductors', 'electrical engineers', 'unemployed people', 'chefs', 'medical patients']
            this.places = ['hospital', 'zoo', 'beach', 'dry riverbed', 'morgue', 'stable', 'space station', 'local area', 'waterpark', 'office', 'field', 'horsetrack', 'circus', 'pool', 'gunsmith', 'tobacco store', 'apiary', 'tree-farm', 'ocean floor']
            this.adjetives = ['nearby', 'local', 'downtown', 'rural', 'cheap part of the', 'cheap part of the', 'rundown', 'delapidated', 'condemned', 'brand-new', 'old', 'historical']

        }
        draw(){
            this.body.draw()
            canvas_context.font = '10px arial'
            canvas_context.fillStyle = "white"
            for(let t = 0;t<this.strings.length;t++){
                canvas_context.fillText(this.strings[t], this.body.x+5, this.heights[t]+this.body.y+5)
            }
            // let length = Math.floor(Math.random()*5)
            // if(Math.random()<.1){
            //     // length*=2
            // }
            // for(let t = 0;t<length;t++){
            //     newtext += getRandomColor()
            // }
        }
        bepushed(){
            let newtext = `${this.animals[Math.floor(this.animals.length*Math.random())]} has escaped from a ${this.adjetives[Math.floor(this.adjetives.length*Math.random())]} ${this.places[Math.floor(this.places.length*Math.random())]}, killing ${Math.floor(Math.random()*100)+2} ${this.people[Math.floor(this.people.length*Math.random())]}.`

            this.strings.push(newtext)
            this.heights.push(this.body.height-5)

            for(let t = 0;t<this.heights.length;t++){
                this.heights[t]-=10.5
            }
            for(let t = 0;t<this.heights.length;t++){
                if(this.heights[t] < 5){
                    this.strings.splice(t,1)
                    this.heights.splice(t,1)
                }
            }
        }



    }
    let graphs = []

    let rect1 = new Rectangle(10,10, 256, 144, "#232323")
    let grap1 = new Graph(rect1, "#FFFF00", .5, 3)
    graphs.push(grap1)

    let rect2 = new Rectangle(276,10, 128, 67, "#232323")
    let grap2 = new Graph(rect2, "#00FF00", 2, 1)
    graphs.push(grap2)

    let rect3 = new Rectangle(276,87, 128, 67, "#232323")
    let grap3 = new Graph(rect3, "#FF0000", 2, 7)
    graphs.push(grap3)

    let rect4 = new Rectangle(10,166, 256+20+118, 192, "#232323")
    let grap4 = new Graph(rect4, "#00FFFF", 2, 7)
    graphs.push(grap4)
    

    let rect5 = new Rectangle(10,166, 256+20+118, 192, "#23232300")
    let grap5 = new Graph(rect5, "#FF00FF", 2, 7)
    graphs.push(grap5)
    

    let rect6 = new Rectangle(0,660, 1280, 720, "#343434")
    let grap6 = new Graph(rect6, "#232323", 2, 7)
    graphs.push(grap6)


    let rect7 = new Rectangle((256+20+118)+20,10, 440, 300, "#222222")
    let grap7 = new CentralGraph(rect7, "#FFAA00", .4, 2)
    graphs.push(grap7)

    class Button{
        constructor(x,y,r,g,b, radius){
            this.r = r
            this.b = b
            this.g = g
            this.radius = radius
            this.x= x
            this.y= y
            this.recoil = 0
        }
        draw(){
        let button3 = new Circle(this.x, this.y+this.radius+1, this.radius, `rgb(${this.r*.8},${this.g*.8},${this.b*.8})`)
        let button2 = new Rectangle(this.x-this.radius, this.y+this.recoil, this.radius*2, (this.radius*1.25)-this.recoil,  `rgb(${this.r*.8},${this.g*.8},${this.b*.8})`)
        this.button1 = new Circle(this.x, this.y+this.recoil, this.radius, `rgb(${this.r},${this.g},${this.b})`)

        button3.draw()
        button2.draw()
        this.button1.draw()
        if(this.recoil>0){
            this.recoil*=.95
        }



        }
    }

    let buttons = []

    let button1 = new Button(640, 420, 255, 0, 0 , 44)
    buttons.push(button1)

    for(let t = 0;t<10;t++){
        let button = new Button(25+(t*41), 389, 255, 255, 255, 15)
    buttons.push(button)

    }

    for(let t = 0;t<10;t++){
        let button = new Button(25+(t*41), 440, 255, 255, 255, 15)
    buttons.push(button)

    }

    for(let t = 0;t<10;t++){
        let button = new Button(25+(t*41), 491, 255, 255, 255, 15)
    buttons.push(button)

    }

    for(let t = 0;t<10;t++){
        let button = new Button(25+(t*41), 542, 255, 255, 255, 15)
    buttons.push(button)

    }

    for(let t = 0;t<10;t++){
        let button = new Button(25+(t*41), 593, 255, 255, 255, 15)
    buttons.push(button)

    }

    let rectpie = new Rectangle((256+20+118)+30+440, 10, 280, 200, "#232323")
    let pie = new Pie(1000, 100, 80)


    let rect8 = new Rectangle((256+20+118)+40+440+280,10, 118, 42, "#232323")
    let grap8 = new Graph(rect8, "#FFFFFF", 1, 3)
    graphs.push(grap8)

    let rect9 = new Rectangle((256+20+118)+40+440+280,62, 118, 42, "#232323")
    let grap9 = new Graph(rect9, "#0000FF", 5, 20)
    graphs.push(grap9)


    let rect18 = new Rectangle((256+20+118)+40+440+280,10+62+42, 118, 42, "#232323")
    let grap18 = new Graph(rect18, "#00FFAA", .8, 10)
    graphs.push(grap18)

    let rect19 = new Rectangle((256+20+118)+40+440+280,62+62+42, 118, 42, "#232323")
    let grap19 = new Graph(rect19, "#FF00AA", 2, 7)
    graphs.push(grap19)


    let scrollrect  = new Rectangle((256+20+118)+30+440, 62+62+42+52, 1280-((256+20+118)+30+440)-8, 720-(62+62+42+10)-120, "#232323")
    let text = new TextRunner(scrollrect)
    
    function main() {
        canvas_context.clearRect(0, 0, canvas.width, canvas.height)  // refreshes the image
        // gamepadAPI.update() //checks for button presses/stick movement on the connected controller)
        // // game code goes here
        for(let t = 0;t<graphs.length;t++){
            graphs[t].draw()
        }
        for(let t = 0;t<buttons.length;t++){
            buttons[t].draw()
        }
        rectpie.draw()
        pie.draw()
        text.draw()
    }

    for(let t = 0;t<1000;t++){
        main()
    }
})
