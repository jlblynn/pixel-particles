
// Make sure all resources, stylesheets and images are loaded
window.addEventListener('load', function() {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      // Round canvas numbers for performance
      this.originX = Math.floor(x);
      this.originY = Math.floor(y);
      this.color = color;
      this.size = this.effect.gap;
      this.vx = 0;
      this.vy = 0;
      this.ease = 0.2;
      this.friction = 0.95;
      this.dx = 0;
      this.dy = 0;
      this.distance = 0;
      this.force = 0;
      this.angle = 0;
    }
    draw(context) {
      // Draw the particle
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
      // Get the distance between the mouse and particle on x and y axis
      this.dx = this.effect.mouse.x - this.x;
      this.dy = this.effect.mouse.y - this.y;

      // Calculate the distance between the mouse and the particle
      this.distance = this.dx * this.dx + this.dy * this.dy;

      // Calculate the degree of force to push the particle away depending on distance
      this.force = -this.effect.mouse.radius / this.distance;

      // Push the particle away if the distance is less than the mouse radius
      if (this.distance < this.effect.mouse.radius) {
        // Calculate the angle and force to push the particle away
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += this.force * Math.cos(this.angle);
        this.vy += this.force * Math.sin(this.angle);
      }

      // Return particles to origin position
      this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
      this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
    warp() {
      // Warp button animation
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      this.ease = 0.05;
    }
  }

  class Effect {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.particlesArray = [];
      this.image = document.getElementById('image1');
      this.centerX = this.width * 0.5;
      this.centerY = this.height * 0.5;
      this.x = this.centerX - this.image.width * 0.5;
      this.y = this.centerY - this.image.height * 0.5;
      // Amount of pixel rows to skip (larger number for increased performance)
      this.gap = 3;
      this.mouse = {
        radius: 2000,
        x: undefined,
        y: undefined
      }
      // Get the mouse cursor coordinates
      window.addEventListener('mousemove', event => {
        this.mouse.x = event.x;
        this.mouse.y = event.y;
      })
    }
    init(context) {
      // Draw the provided base64 image
      context.drawImage(this.image, this.x, this.y);
      // Get the total image pixels
      const pixels = context.getImageData(0, 0, this.width, this.height).data;

      // Get image pixels specified for performance improvements
      for (let y = 0; y < this.height; y += this.gap) {
        for (let x = 0; x < this.width; x += this.gap) {

          // There are 4 values for each pixel (r,g,b,a)
          const index = (y * this.width + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const color = 'rgb(' + red + ',' + green + ',' + blue + ')';

          // Target the non-transparent pixels
          if (alpha > 0) {
            this.particlesArray.push(new Particle(this, x, y, color));
          }
        }
      }
    }
    draw(context) {
      // Draw each particle in the array
      this.particlesArray.forEach(particle => particle.draw(context));
    }
    update() {
      // Redraw each particle
      this.particlesArray.forEach(particle => particle.update());
    }
    warp () {
      // Warp animation on each particle in the array
      this.particlesArray.forEach(particle => particle.warp());
    }
  }

  // Apply Effect class to the canvas element
  const effect = new Effect(canvas.width, canvas.height);
  // Call the effect class on the canvas element with 2d context
  effect.init(ctx);


  // Declare the animation to run on the canvas element
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.draw(ctx);
    effect.update();
    requestAnimationFrame(animate);
  }

  // Call the animation
  animate();

  // Warp button
  const warpButton = document.getElementById('warpButton');
  warpButton.addEventListener('click', function() {
    effect.warp();
  }) 

})
