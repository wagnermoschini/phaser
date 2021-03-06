/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2013 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Creates a new BitmapData object.
*
* @class Phaser.BitmapData
*
* @classdesc Note: This object is still experimental and likely to change.
*
* A BitmapData object can be thought of as a blank canvas onto which you can perform graphics operations as you would on a normal canvas, 
* such as drawing lines, circles, arcs, fills and copying and setting blocks of pixel data. A single BitmapData can be used as the texture 
* for multiple Sprites. So if you need to dynamically create a Sprite texture then they are a good choice. It supports the EaselJS Tiny API.
*
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} [width=256] - The width of the BitmapData in pixels.
* @param {number} [height=256] - The height of the BitmapData in pixels.
*/
Phaser.BitmapData = function (game, width, height) {

    if (typeof width === 'undefined') { width = 256; }
    if (typeof height === 'undefined') { height = 256; }

    /**
    * @property {Phaser.Game} game - A reference to the currently running game. 
    */
    this.game = game;

    /**
    * @property {string} name - The name of the BitmapData.
    */
    this.name = '';

    /**
    * @property {number} width - The width of the BitmapData in pixels.
    */
    this.width = width;
    
    /**
    * @property {number} height - The height of the BitmapData in pixels.
    */
    this.height = height;

    /**
    * @property {HTMLCanvasElement} canvas - The canvas to which this BitmapData draws.
    * @default
    */
    this.canvas = Phaser.Canvas.create(width, height);
    
    /**
    * @property {CanvasRenderingContext2D} context - The 2d context of the canvas.
    * @default
    */
    this.context = this.canvas.getContext('2d');

    /**
    * @property {array} imageData - The canvas image data.
    */
    this.imageData = this.context.getImageData(0, 0, width, height);

    /**
    * @property {UInt8Clamped} pixels - A reference to the context imageData buffer.
    */
    if (this.imageData.data.buffer)
    {
        this.pixels = this.imageData.data.buffer;
    }
    else
    {
        this.pixels = this.imageData.data;
    }

    /**
    * @property {PIXI.BaseTexture} baseTexture - The PIXI.BaseTexture.
    * @default
    */
    this.baseTexture = new PIXI.BaseTexture(this.canvas);
    
    /**
    * @property {PIXI.Texture} texture - The PIXI.Texture.
    * @default
    */
    this.texture = new PIXI.Texture(this.baseTexture);
    
    /**
    * @property {Phaser.Frame} textureFrame - The Frame this BitmapData uses for rendering.
    * @default
    */
    this.textureFrame = new Phaser.Frame(0, 0, 0, width, height, 'bitmapData', game.rnd.uuid());

    /**
    * @property {number} type - The const type of this object.
    * @default
    */
    this.type = Phaser.BITMAPDATA;

    this._dirty = false;

}

Phaser.BitmapData.prototype = {

    /**
    * Updates the given Sprite so that it uses this BitmapData as its texture.
    * @method Phaser.BitmapData#add
    * @param {Phaser.Sprite} sprite - The sprite to apply this texture to.
    */
    add: function (sprite) {

        sprite.loadTexture(this);

    },

    /**
    * Given an array of Sprites it will update each of them so that their Textures reference this BitmapData.
    * @method Phaser.BitmapData#addTo
    * @param {Phaser.Sprite[]} sprites - An array of Sprites to apply this texture to.
    */
    addTo: function (sprites) {

        for (var i = 0; i < sprites.length; i++)
        {
            if (sprites[i].texture)
            {
                sprites[i].loadTexture(this);
            }
        }

    },

    /**
    * Clears the BitmapData.
    * @method Phaser.BitmapData#clear
    */
    clear: function () {

        this.context.clearRect(0, 0, this.width, this.height);
    
        this._dirty = true;

    },

    refreshBuffer: function () {

        this.imageData = this.context.getImageData(0, 0, this.width, this.height);
        this.pixels = new Int32Array(this.imageData.data.buffer);

        // this.data8 = new Uint8ClampedArray(this.imageData.buffer);
        // this.data32 = new Uint32Array(this.imageData.buffer);

    },

    /**
    * Sets the color of the given pixel to the specified red, green, blue and alpha values.
    * @method Phaser.BitmapData#setPixel32
    * @param {number} x - The X coordinate of the pixel to be set.
    * @param {number} y - The Y coordinate of the pixel to be set.
    * @param {number} red - The red color value, between 0 and 0xFF (255).
    * @param {number} green - The green color value, between 0 and 0xFF (255).
    * @param {number} blue - The blue color value, between 0 and 0xFF (255).
    * @param {number} alpha - The alpha color value, between 0 and 0xFF (255).
    */
    setPixel32: function (x, y, red, green, blue, alpha) {

        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height)
        {
            this.pixels[y * this.width + x] = (alpha << 24) | (blue << 16) | (green << 8) | red;

            /*
            if (this.isLittleEndian)
            {
                this.data32[y * this.width + x] = (alpha << 24) | (blue << 16) | (green << 8) | red;
            }
            else
            {
                this.data32[y * this.width + x] = (red << 24) | (green << 16) | (blue << 8) | alpha;
            }
           */

            // this.imageData.data.set(this.data8);

            this.context.putImageData(this.imageData, 0, 0);

            this._dirty = true;
        }

    },

    /**
    * Sets the color of the given pixel to the specified red, green and blue values.
    * @method Phaser.BitmapData#setPixel
    * @param {number} x - The X coordinate of the pixel to be set.
    * @param {number} y - The Y coordinate of the pixel to be set.
    * @param {number} red - The red color value (between 0 and 255)
    * @param {number} green - The green color value (between 0 and 255)
    * @param {number} blue - The blue color value (between 0 and 255)
    */
    setPixel: function (x, y, red, green, blue) {

        this.setPixel32(x, y, red, green, blue, 255);

    },

    /**
    * Get a color of a specific pixel.
    * @param {number} x - The X coordinate of the pixel to get.
    * @param {number} y - The Y coordinate of the pixel to get.
    * @return {number} A native color value integer (format: 0xRRGGBB)
    */
    getPixel: function (x, y) {

        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height)
        {
            return this.data32[y * this.width + x];
        }

    },

    /**
    * Get a color of a specific pixel (including alpha value).
    * @param {number} x - The X coordinate of the pixel to get.
    * @param {number} y - The Y coordinate of the pixel to get.
    * @return {number} A native color value integer (format: 0xAARRGGBB)
    */
    getPixel32: function (x, y) {

        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height)
        {
            return this.data32[y * this.width + x];
        }

    },

    /**
    * Get pixels in array in a specific Rectangle.
    * @param rect {Rectangle} The specific Rectangle.
    * @return {array} CanvasPixelArray.
    */
    getPixels: function (rect) {

        return this.context.getImageData(rect.x, rect.y, rect.width, rect.height);

    },

    /**
    * Adds an arc to the path which is centered at (x, y) position with radius r starting at startAngle and ending at endAngle 
    * going in the given direction by anticlockwise (defaulting to clockwise).
    * @method Phaser.BitmapData#arc
    * @param {number} x - The x axis of the coordinate for the arc's center
    * @param {number} y - The y axis of the coordinate for the arc's center
    * @param {number} radius - The arc's radius
    * @param {number} startAngle - The starting point, measured from the x axis, from which it will be drawn, expressed in radians.
    * @param {number} endAngle - The end arc's angle to which it will be drawn, expressed in radians.
    * @param {boolean} [anticlockwise=true] - true draws the arc anticlockwise, otherwise in a clockwise direction.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    arc: function (x, y, radius, startAngle, endAngle, anticlockwise) {

        if (typeof anticlockwise === 'undefined') { anticlockwise = false; }

        this._dirty = true;
        this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        return this;

    },

    /**
    * Adds an arc with the given control points and radius, connected to the previous point by a straight line.
    * @method Phaser.BitmapData#arcTo
    * @param {number} x1
    * @param {number} y1
    * @param {number} x2
    * @param {number} y2
    * @param {number} radius
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    arcTo: function (x1, y1, x2, y2, radius) {

        this._dirty = true;
        this.context.arcTo(x1, y1, x2, y2, radius);
        return this;

    },

    /**
    * Begins a fill with the specified color. This ends the current sub-path.
    * @method Phaser.BitmapData#beginFill
    * @param {string} color - A CSS compatible color value (ex. "red", "#FF0000", or "rgba(255,0,0,0.5)"). Setting to null will result in no fill.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    beginFill: function (color) {

        this.fillStyle(color);

        return this;

    },

    /**
    * Begins a linear gradient fill defined by the line (x0, y0) to (x1, y1). This ends the current sub-path. For
    * example, the following code defines a black to white vertical gradient ranging from 20px to 120px, and draws a square to display it:
    *
    *      ```myGraphics.beginLinearGradientFill(["#000","#FFF"], [0, 1], 0, 20, 0, 120).rect(20, 20, 120, 120);```
    *
    * @method Phaser.BitmapData#beginLinearGradientFill
    * @param {Array} colors - An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient drawing from red to blue.
    * @param {Array} ratios - An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
    * @param {number} x0 - The position of the first point defining the line that defines the gradient direction and size.
    * @param {number} y0 - The position of the first point defining the line that defines the gradient direction and size.
    * @param {number} x1 - The position of the second point defining the line that defines the gradient direction and size.
    * @param {number} y1 - The position of the second point defining the line that defines the gradient direction and size.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    beginLinearGradientFill: function (colors, ratios, x0, y0, x1, y1) {

        var gradient = this.createLinearGradient(x0, y0, x1, y1);

        for (var i = 0, len = colors.length; i < len; i++)
        {
            gradient.addColorStop(ratios[i], colors[i]);
        }

        this.fillStyle(gradient);

        return this;

    },

    /**
    * Begins a linear gradient stroke defined by the line (x0, y0) to (x1, y1). This ends the current sub-path. For
    * example, the following code defines a black to white vertical gradient ranging from 20px to 120px, and draws a
    * square to display it:
    *
    *      ```myGraphics.setStrokeStyle(10).beginLinearGradientStroke(["#000","#FFF"], [0, 1], 0, 20, 0, 120).drawRect(20, 20, 120, 120);```
    *
    * @method Phaser.BitmapData#beginLinearGradientStroke
    * @param {Array} colors - An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient drawing from red to blue.
    * @param {Array} ratios - An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
    * @param {number} x0 - The position of the first point defining the line that defines the gradient direction and size.
    * @param {number} y0 - The position of the first point defining the line that defines the gradient direction and size.
    * @param {number} x1 - The position of the second point defining the line that defines the gradient direction and size.
    * @param {number} y1 - The position of the second point defining the line that defines the gradient direction and size.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    beginLinearGradientStroke: function (colors, ratios, x0, y0, x1, y1) {

        var gradient = this.createLinearGradient(x0, y0, x1, y1);

        for (var i = 0, len = colors.length; i < len; i++)
        {
            gradient.addColorStop(ratios[i], colors[i]);
        }

        this.strokeStyle(gradient);

        return this;

    },

    /**
    * Begins a radial gradient stroke. This ends the current sub-path. For example, the following code defines a red to
    * blue radial gradient centered at (100, 100), with a radius of 50, and draws a rectangle to display it:
    *
    *      myGraphics.setStrokeStyle(10)
    *          .beginRadialGradientStroke(["#F00","#00F"], [0, 1], 100, 100, 0, 100, 100, 50)
    *          .drawRect(50, 90, 150, 110);
    *
    * @method Phaser.BitmapData#beginRadialGradientStroke
    * @param {Array} colors - An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient drawing from red to blue.
    * @param {Array} ratios - An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
    * @param {number} x0 - Center position of the inner circle that defines the gradient.
    * @param {number} y0 - Center position of the inner circle that defines the gradient.
    * @param {number} r0 - Radius of the inner circle that defines the gradient.
    * @param {number} x1 - Center position of the outer circle that defines the gradient.
    * @param {number} y1 - Center position of the outer circle that defines the gradient.
    * @param {number} r1 - Radius of the outer circle that defines the gradient.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    beginRadialGradientStroke: function (colors, ratios, x0, y0, r0, x1, y1, r1) {

        var gradient = this.createRadialGradient(x0, y0, r0, x1, y1, r1);

        for (var i = 0, len = colors.length; i < len; i++)
        {
            gradient.addColorStop(ratios[i], colors[i]);
        }

        this.strokeStyle(gradient);

        return this;

    },

    /**
    * Starts a new path by resetting the list of sub-paths. Call this method when you want to create a new path.
    * @method Phaser.BitmapData#beginPath
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    beginPath: function () {

        this.context.beginPath();
        return this;

    },

    /**
    * Begins a stroke with the specified color. This ends the current sub-path.
    * @method Phaser.BitmapData#beginStroke
    * @param {String} color A CSS compatible color value (ex. "#FF0000", "red", or "rgba(255,0,0,0.5)"). Setting to null will result in no stroke.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    beginStroke: function (color) {

        this.strokeStyle(color);
        return this;

    },

    /**
    * Adds a bezier curve from the current context point to (x, y) using the control points (cp1x, cp1y) and (cp2x, cp2y).
    * @method Phaser.BitmapData#bezierCurveTo
    * @param {number} cp1x - The x axis of control point 1.
    * @param {number} cp1y - The y axis of control point 1.
    * @param {number} cp2x - The x axis of control point 2.
    * @param {number} cp2y - The y axis of control point 2.
    * @param {number} x - The x axis of the ending point.
    * @param {number} y - The y axis of the ending point.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    bezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y) {

        this._dirty = true;
        this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        return this;

    },

    /**
    * Draws a circle with the specified radius at (x, y).
    * @method Phaser.BitmapData#circle
    * @param {number} x - x coordinate center point of circle.
    * @param {number} y - y coordinate center point of circle.
    * @param {number} radius - Radius of circle in radians.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    circle: function (x, y, radius) {

        this.arc(x, y, radius, 0, Math.PI*2);
        return this;

    },

    /**
    * Sets all pixels in the rectangle defined by starting point (x, y) and size (width, height) to transparent black.
    * @method Phaser.BitmapData#clearRect
    * @param {number} x - The x axis of the coordinate for the rectangle starting point.
    * @param {number} y - The y axis of the coordinate for the rectangle starting point.
    * @param {number} width - The rectangles width.
    * @param {number} height - The rectangles height.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    clearRect: function (x, y, width, height) {

        this._dirty = true;
        this.context.clearRect(x, y, width, height);
        return this;

    },

    /**
    * Creates a clipping path from the current sub-paths. Everything drawn after clip() is called appears inside the clipping path only.
    * @method Phaser.BitmapData#clip
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    clip: function () {

        this._dirty = true;
        this.context.clip();
        return this;

    },

    /**
    * Tries to draw a straight line from the current point to the start. If the shape has already been closed or has only one point, this function does nothing.
    * @method Phaser.BitmapData#closePath
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    closePath: function () {

        this._dirty = true;
        this.context.closePath();
        return this;

    },

    /**
    * Creates a linear gradient with defined by an imaginary line which implies the direction of the gradient.
    * Once the gradient is created colors can be inserted using the addColorStop method.
    * @method Phaser.BitmapData#createLinearGradient
    * @param {number} x - The x axis of the coordinate for the gradients starting point.
    * @param {number} y - The y axis of the coordinate for the gradients starting point.
    * @param {number} width - The width of the gradient.
    * @param {number} height - The height of the gradient.
    * @return {CanvasGradient} The Linear Gradient.
    */
    createLinearGradient: function (x, y, width, height) {

        return this.context.createLinearGradient(x, y, width, height);

    },

    //  createPattern

    /**
    * Creates a radial gradient.
    * @method Phaser.BitmapData#createRadialGradient
    * @param {number} x0
    * @param {number} y0
    * @param {number} r0
    * @param {number} x1
    * @param {number} y1
    * @param {number} r1
    * @return {CanvasGradient} The Radial Gradient.
    */
    createRadialGradient: function (x0, y0, r0, x1, y1, r1) {

        return this.context.createRadialGradient(x0, y0, r0, x1, y1, r1);

    },

    //  drawImage
    //  drawSystemFocusRing (?)

    /**
    * Draws an ellipse (oval) with a specified width (w) and height (h).
    * @method Phaser.BitmapData#ellipse
    * @param {number} x - x coordinate center point of ellipse.
    * @param {number} y - y coordinate center point of ellipse.
    * @param {number} w - height (horizontal diameter) of ellipse. The horizontal radius will be half of this number.
    * @param {number} h - width (vertical diameter) of ellipse. The vertical radius will be half of this number.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    ellipse: function (x, y, w, h) {

        var k = 0.5522848;
        var ox = (w / 2) * k;
        var oy = (h / 2) * k;
        var xe = x + w;
        var ye = y + h;
        var xm = x + w / 2;
        var ym = y + h / 2;
            
        this.moveTo(x, ym);
        this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

        return this;

    },

    /**
    * Fills the subpaths with the current fill style.
    * @method Phaser.BitmapData#fill
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    fill: function () {

        this._dirty = true;
        this.context.fill();
        return this;

    },

    /**
    * Draws a filled rectangle at (x, y) position whose size is determined by width and height.
    * @method Phaser.BitmapData#fillRect
    * @param {number} x - The x axis of the coordinate for the rectangle starting point.
    * @param {number} y - The y axis of the coordinate for the rectangle starting point.
    * @param {number} width - The rectangles width.
    * @param {number} height - The rectangles height.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    fillRect: function (x, y, width, height) {

        this._dirty = true;
        this.context.fillRect(x, y, width, height);
        return this;

    },

    /**
    * Sets the fill style.
    * @method Phaser.BitmapData#fillStyle
    * @param {string} color - The fill color value in CSS format: #RRGGBB or rgba(r,g,b,a)
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    fillStyle: function (color) {

        this.context.fillStyle = color;
        return this;

    },

    //  fillText

    /**
    * Sets the font.
    * @method Phaser.BitmapData#font
    * @param {DOMString} font - The font to be used for any text rendering. Default value 10px sans-serif.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    font: function (font) {

        this.context.font = font;
        return this;

    },

    /**
    * Alpha value that is applied to shapes and images before they are composited onto the canvas. Default 1.0 (opaque).
    * @method Phaser.BitmapData#globalAlpha
    * @param {number} alpha - Alpha value that is applied to shapes and images before they are composited onto the canvas. Default 1.0 (opaque).
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    globalAlpha: function (alpha) {

        this.context.globalAlpha = alpha;
        return this;

    },

    /**
    * With globalAlpha applied this sets how shapes and images are drawn onto the existing bitmap. Possible values: source-atop, source-in, source-out,
    * source-over (default), destination-atop, destination-in, destination-out, destination-over, lighter, darker, copy and xor.
    * @method Phaser.BitmapData#globalCompositeOperation
    * @param {DOMString} operation - The composite operation to apply.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    globalCompositeOperation: function (operation) {

        this.context.globalCompositeOperation = operation;
        return this;

    },

    /**
    * Type of endings on the end of lines. Possible values: butt (default), round, square.
    * @method Phaser.BitmapData#lineCap
    * @param {DOMString} style - Possible values: butt (default), round, square
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    lineCap: function (style) {

        this.context.lineCap = style;
        return this;

    },

    /**
    * Specifies where to start a dasharray on a line.
    * @method Phaser.BitmapData#lineDashOffset
    * @param {number} offset - Specifies where to start a dasharray on a line.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    lineDashOffset: function (offset) {

        this.context.lineDashOffset = offset;
        return this;

    },

    /**
    * Defines the type of corners where two lines meet. Possible values: round, bevel, miter (default)
    * @method Phaser.BitmapData#lineJoin
    * @param {DOMString} join - Possible values: round, bevel, miter (default)
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    lineJoin: function (join) {

        this.context.lineJoin = join;
        return this;

    },

    /**
    * Width of lines. Default 1.0
    * @method Phaser.BitmapData#lineWidth
    * @param {number} width - Width of lines. Default 1.0
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    lineWidth: function (width) {

        this.context.lineWidth = width;
        return this;

    },

    /**
    * Default 10.
    * @method Phaser.BitmapData#miterLimit
    * @param {number} limit - Default 10.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    miterLimit: function (limit) {

        this.context.miterLimit = limit;
        return this;

    },

    //  getImageData
    //  getLineDash
    //  isPointInPath
    //  isPointInStroke

    /**
    * Connects the last point in the subpath to the x, y coordinates with a straight line.
    * @method Phaser.BitmapData#lineTo
    * @param {number} x - The x axis of the coordinate for the end of the line.
    * @param {number} y - The y axis of the coordinate for the end of the line.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    lineTo: function (x, y) {

        this._dirty = true;
        this.context.lineTo(x, y);
        return this;

    },

    //  measureText

    /**
    * Moves the starting point of a new subpath to the (x, y) coordinates.
    * @method Phaser.BitmapData#moveTo
    * @param {number} x - The x axis of the point.
    * @param {number} y - The y axis of the point.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    moveTo: function (x, y) {

        this.context.moveTo(x, y);
        return this;

    },

    //  putImageData

    /**
    * Draws a quadratic curve from the current drawing point to (x, y) using the control point (cpx, cpy).
    * @method Phaser.BitmapData#quadraticCurveTo
    * @param {Number} cpx - The x axis of the control point.
    * @param {Number} cpy - The y axis of the control point.
    * @param {Number} x - The x axis of the ending point.
    * @param {Number} y - The y axis of the ending point.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    quadraticCurveTo: function(cpx, cpy, x, y) {

        this._dirty = true;
        this.context.quadraticCurveTo(cpx, cpy, x, y);
        return this;

    },

    /**
    * Draws a rectangle at (x, y) position whose size is determined by width and height.
    * @method Phaser.BitmapData#rect
    * @param {number} x - The x axis of the coordinate for the rectangle starting point.
    * @param {number} y - The y axis of the coordinate for the rectangle starting point.
    * @param {number} width - The rectangles width.
    * @param {number} height - The rectangles height.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    rect: function (x, y, width, height) {

        this._dirty = true;
        this.context.rect(x, y, width, height);
        return this;

    },
    
    /**
    * Restores the drawing style state to the last element on the 'state stack' saved by save().
    * @method Phaser.BitmapData#restore
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    restore: function () {

        this._dirty = true;
        this.context.restore();
        return this;

    },

    /**
    * Rotates the drawing context values by r radians.
    * @method Phaser.BitmapData#rotate
    * @param {number} angle - The angle of rotation given in radians.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    rotate: function (angle) {

        this._dirty = true;
        this.context.rotate(angle);
        return this;

    },

    /**
    * Sets the stroke style for the current sub-path. Like all drawing methods, this can be chained, so you can define
    * the stroke style and color in a single line of code like so:
    *
    *      ```myGraphics.setStrokeStyle(8,"round").beginStroke("#F00");```
    *
    * @method Phaser.BitmapData#setStrokeStyle
    * @param {number} thickness - The width of the stroke.
    * @param {string|number} [caps=0] - Indicates the type of caps to use at the end of lines. One of butt, round, or square. Defaults to "butt". Also accepts the values 0 (butt), 1 (round), and 2 (square) for use with he tiny API.
    * @param {string|number} [joints=0] Specifies the type of joints that should be used where two lines meet. One of bevel, round, or miter. Defaults to "miter". Also accepts the values 0 (miter), 1 (round), and 2 (bevel) for use with the tiny API.
    * @param {number} [miterLimit=10] - If joints is set to "miter", then you can specify a miter limit ratio which controls at what point a mitered joint will be clipped.
    * @param {boolean} [ignoreScale=false] - If true, the stroke will be drawn at the specified thickness regardless of active transformations.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    setStrokeStyle: function (thickness, caps, joints, miterLimit, ignoreScale) {

        if (typeof thickness === 'undefined') { thickness = 1; }
        if (typeof caps === 'undefined') { caps = 'butt'; }
        if (typeof joints === 'undefined') { joints = 'miter'; }
        if (typeof miterLimit === 'undefined') { miterLimit = 10; }

        //  TODO
        ignoreScale = false;

        this.lineWidth(thickness);
        this.lineCap(caps);
        this.lineJoin(joints);
        this.miterLimit(miterLimit);

        return this;

    },

    /**
    * Saves the current drawing style state using a stack so you can revert any change you make to it using restore().
    * @method Phaser.BitmapData#save
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    save: function () {

        this._dirty = true;
        this.context.save();
        return this;

    },

    /**
    * Scales the current drawing context.
    * @method Phaser.BitmapData#scale
    * @param {number} x
    * @param {number} y
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    scale: function (x, y) {

        this._dirty = true;
        this.context.scale(x, y);
        return this;

    },

    /**
    * 
    * @method Phaser.BitmapData#scrollPathIntoView
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    scrollPathIntoView: function () {

        this._dirty = true;
        this.context.scrollPathIntoView();
        return this;

    },

    //  setLineDash
    //  setTransform

    /**
    * Strokes the subpaths with the current stroke style.
    * @method Phaser.BitmapData#stroke
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    stroke: function () {

        this._dirty = true;
        this.context.stroke();
        return this;

    },

    /**
    * Paints a rectangle which has a starting point at (x, y) and has a w width and an h height onto the canvas, using the current stroke style.
    * @method Phaser.BitmapData#strokeRect
    * @param {number} x - The x axis for the starting point of the rectangle.
    * @param {number} y - The y axis for the starting point of the rectangle.
    * @param {number} width - The rectangles width.
    * @param {number} height - The rectangles height.
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    strokeRect: function (x, y, width, height) {

        this._dirty = true;
        this.context.strokeRect(x, y, width, height);
        return this;

    },

    /**
    * Color or style to use for the lines around shapes. Default #000 (black).
    * @method Phaser.BitmapData#strokeStyle
    * @param {string} style - Color or style to use for the lines around shapes. Default #000 (black).
    * @return {Phaser.BitmapData} The BitmapData instance this method was called on.
    */
    strokeStyle: function (style) {

        this.context.strokeStyle = style;
        return this;

    },

    //  strokeText
    //  transform
    //  translate

    /**
    * If the game is running in WebGL this will push the texture up to the GPU if it's dirty.
    * This is called automatically if the BitmapData is being used by a Sprite, otherwise you need to remember to call it in your render function.
    * @method Phaser.BitmapData#render
    */
    render: function () {

        if (this._dirty)
        {
            //  Only needed if running in WebGL, otherwise this array will never get cleared down
            if (this.game.renderType == Phaser.WEBGL)
            {
                PIXI.texturesToUpdate.push(this.baseTexture);
            }

            this._dirty = false;
        }

    }

}

//  EaselJS Tiny API emulation

/**
* Shortcut to moveTo.
* @method Phaser.BitmapData.prototype.mt
*/
Phaser.BitmapData.prototype.mt = Phaser.BitmapData.prototype.moveTo;

/**
* Shortcut to lineTo.
* @method Phaser.BitmapData.prototype.mt
*/
Phaser.BitmapData.prototype.lt = Phaser.BitmapData.prototype.lineTo;

/**
* Shortcut to arcTo.
* @method Phaser.BitmapData.prototype.at
*/
Phaser.BitmapData.prototype.at = Phaser.BitmapData.prototype.arcTo;

/**
* Shortcut to bezierCurveTo.
* @method Phaser.BitmapData.prototype.bt
*/
Phaser.BitmapData.prototype.bt = Phaser.BitmapData.prototype.bezierCurveTo;
    
/**
* Shortcut to quadraticCurveTo.
* @method Phaser.BitmapData.prototype.qt
*/
Phaser.BitmapData.prototype.qt = Phaser.BitmapData.prototype.quadraticCurveTo;
    
/**
* Shortcut to arc.
* @method Phaser.BitmapData.prototype.a
*/
Phaser.BitmapData.prototype.a = Phaser.BitmapData.prototype.arc;

/**
* Shortcut to rect.
* @method Phaser.BitmapData.prototype.r
*/
Phaser.BitmapData.prototype.r = Phaser.BitmapData.prototype.rect;
    
/**
* Shortcut to closePath.
* @method Phaser.BitmapData.prototype.cp
*/
Phaser.BitmapData.prototype.cp = Phaser.BitmapData.prototype.closePath;

/**
* Shortcut to clear.
* @method Phaser.BitmapData.prototype.c
*/
Phaser.BitmapData.prototype.c = Phaser.BitmapData.prototype.clear;
    
/**
* Shortcut to beginFill.
* @method Phaser.BitmapData.prototype.f
*/
Phaser.BitmapData.prototype.f = Phaser.BitmapData.prototype.beginFill;

/**
* Shortcut to beginLinearGradientFill.
* @method Phaser.BitmapData.prototype.lf
*/
Phaser.BitmapData.prototype.lf = Phaser.BitmapData.prototype.beginLinearGradientFill;
    
/**
* Shortcut to beginRadialGradientFill.
* @method Phaser.BitmapData.prototype.rf
*/
Phaser.BitmapData.prototype.rf = Phaser.BitmapData.prototype.beginRadialGradientFill;
    
/**
* Shortcut to beginBitmapFill.
* @method Phaser.BitmapData.prototype.bf
*/
//Phaser.BitmapData.prototype.bf = Phaser.BitmapData.prototype.beginBitmapFill;
    
/**
* Shortcut to endFill.
* @method Phaser.BitmapData.prototype.ef
*/
Phaser.BitmapData.prototype.ef = Phaser.BitmapData.prototype.endFill;

/**
* Shortcut to setStrokeStyle.
* @method Phaser.BitmapData.prototype.ss
*/
Phaser.BitmapData.prototype.ss = Phaser.BitmapData.prototype.setStrokeStyle;
    
/**
* Shortcut to beginStroke.
* @method Phaser.BitmapData.prototype.s
*/
Phaser.BitmapData.prototype.s = Phaser.BitmapData.prototype.beginStroke;
    
/**
* Shortcut to beginLinearGradientStroke.
* @method Phaser.BitmapData.prototype.ls
*/
Phaser.BitmapData.prototype.ls = Phaser.BitmapData.prototype.beginLinearGradientStroke;

/**
* Shortcut to beginRadialGradientStroke.
* @method Phaser.BitmapData.prototype.rs
*/
Phaser.BitmapData.prototype.rs = Phaser.BitmapData.prototype.beginRadialGradientStroke;
    
/**
* Shortcut to beginBitmapStroke.
* @method Phaser.BitmapData.prototype.bs
*/
// Phaser.BitmapData.prototype.bs = Phaser.BitmapData.prototype.beginBitmapStroke;
    
/**
* Shortcut to endStroke.
* @method Phaser.BitmapData.prototype.es
*/
// Phaser.BitmapData.prototype.es = Phaser.BitmapData.prototype.endStroke;
    
/**
* Shortcut to rect.
* @method Phaser.BitmapData.prototype.dr
*/
Phaser.BitmapData.prototype.dr = Phaser.BitmapData.prototype.rect;
    
/**
* Shortcut to drawRoundRect.
* @method Phaser.BitmapData.prototype.rr
*/
// Phaser.BitmapData.prototype.rr = Phaser.BitmapData.prototype.drawRoundRect;
    
/**
* Shortcut to drawRoundRectComplex.
* @method Phaser.BitmapData.prototype.rc
*/
// Phaser.BitmapData.prototype.rc = Phaser.BitmapData.prototype.drawRoundRectComplex;

/**
* Shortcut to drawCircle.
* @method Phaser.BitmapData.prototype.dc
*/
Phaser.BitmapData.prototype.dc = Phaser.BitmapData.prototype.circle;
    
/**
* Shortcut to drawEllipse.
* @method Phaser.BitmapData.prototype.de
*/
Phaser.BitmapData.prototype.de = Phaser.BitmapData.prototype.ellipse;
    
/**
* Shortcut to drawPolyStar.
* @method Phaser.BitmapData.prototype.dp
*/
// Phaser.BitmapData.prototype.dp = Phaser.BitmapData.prototype.drawPolyStar;
