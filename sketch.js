const SIZE = 540;
const BORDERSIZE = 32;
const MAX_ATTEMPTS = Math.pow(2, 16); // 2^16
const TARGET_PER_FRAME = 4;
const MIN_STEPS = 4;
const MIN_RADIUS = 12;

const OPTIMIZE_FOR_EXPORT = true;

let circles = [];

function setup() {
  if ( OPTIMIZE_FOR_EXPORT ) {
    createCanvas( SIZE, SIZE, SVG );
    clog( "Drawing in the background...");
  } else {
    createCanvas( SIZE, SIZE );
    clog( "Drawing in the foreground...");
  }
  
  // Simplified drawing optimization ignores 
  // circle-specific color properties.
  stroke( 32 );
  strokeWeight( 1 );
  // smooth( 0 );
  noFill();
  let seed = new Circle( SIZE * 0.5, SIZE * 0.5 );
  seed.radius = SIZE * 0.2;
  seed.isGrowing = false;
  circles.push( seed );
}

function draw() {
  clear();
  background(255);
  let attempts = 0,
      added = 0;
  
  while ( attempts++ < MAX_ATTEMPTS && added < TARGET_PER_FRAME ) {
    let p = findSpace();
    if ( p !== null ) {
      circles.push( new Circle( p.x, p.y ));
      added++;
    }
  }
  
  // Select the growing circles
  let cc = circles.filter(c => c.isGrowing );

  cc.forEach(c => {
    c.contain( BORDERSIZE, BORDERSIZE, SIZE-BORDERSIZE, SIZE-BORDERSIZE );

    let intersectionFound = false,
        i=0,
        len=circles.length;

    while ( i<len && !intersectionFound ) {
      if ( c !== circles[i] ) {
        intersectionFound = c.intersects( circles[i] );
        if ( intersectionFound ) {
          c.isGrowing = false;
          // could be redundant but could also an optimization if
          // the test for isGrowing moves back inside the cc.forEach
          circles[i].isGrowing = false; 
          // < DEBUG
          // let pairing = color( Math.random() * 255, Math.random() * 255, 32 );
          // c.color = pairing;
          // circles[i].color = pairing;
          // DEBUG />
        }
      }
      i++;
    }
  });

  // When cc.length === 0, we're done.

  // DRAW and GROW
  circles.forEach(c => {
    if ( !OPTIMIZE_FOR_EXPORT || cc.length === 0 ) {
      c.draw();
    }
    c.grow();
  });

  if ( cc.length === 0 ) {
    if ( OPTIMIZE_FOR_EXPORT ) {
      save( `${ getName() }.svg` );
    } else {
      save( `${ getName() }.png` );
    }
    noLoop();
    clog( "Done." );
  }
}

function findSpace() {
  let intersectionFound = false,
      i = 0,
      len = circles.length,
      x = BORDERSIZE + Math.random() * ( SIZE - 2 * BORDERSIZE ),
      y = BORDERSIZE + Math.random() * ( SIZE - 2 * BORDERSIZE );

  while ( i<len && !intersectionFound ) {
    let dx = x - circles[i].x,
        dy = y - circles[i].y,
        d = Math.sqrt( dx*dx + dy*dy );

    intersectionFound = d-2 < circles[i].radius;
    i++;
  }
  
  if( intersectionFound ) {
    return null;
  } else {
    return { x, y };
  }
}



const MAXRADIUS = 600;
class Circle {
  constructor(x_, y_, c_) {
    this.x = Math.round( x_ );
    this.y = Math.round( y_ );
    this.color = c_ || color( 255 );
    this.radius = 2;
    this.isGrowing = true;
  }
  
  draw() {
    // stroke( this.color );
    noFill();
    if ( this.radius > MIN_RADIUS ) {
      let step = 2;
      let steps = Math.floor( this.radius / step );
      steps = Math.min( steps, MIN_STEPS );

      while ( steps-- > 0 ) {
        let r = (this.radius - step * steps) * 2;
        ellipse( this.x, this.y, r, r );
      }
    } else {
      ellipse( this.x, this.y, this.radius*2, this.radius*2 );
    }
  }
  
  grow() {
    if ( this.isGrowing && this.radius < MAXRADIUS ) {
      this.radius += 0.5;
    }
  }
  // calcMove() {
  //   return { x:this.x, y:this.y + 0.25 };
  // }
  // move() {
  //   let newPos = this.calcMove();
  //   this.x = newPos.x;
  //   this.y = newPos.y;
  // }
  
  intersects( c ) {
    let dx = c.x - this.x,
        dy = c.y - this.y,
        d = Math.sqrt( dx*dx + dy*dy );

    return ( d-2 <= (this.radius + c.radius) );
  }
  contain( x0, y0, x1, y1 ) {
    if (
      this.x - this.radius <= x0 ||
      this.x + this.radius >= x1 || 
      this.y - this.radius <= y0 ||
      this.y + this.radius >= y1 )
    {
    
      this.isGrowing = false;
    }
  }
}

function getName() {
  return `Packed_Circles-MINSTEPS_${MIN_STEPS}-MINRADIUS_${MIN_RADIUS}-MAXATTEMPTS_${MAX_ATTEMPTS}-PERFRAME_${TARGET_PER_FRAME}-SIZE_${SIZE}-BORDER_${BORDERSIZE}-${new Date(Date.now()).toISOString()}`;
}

function clog( str ) {
  console.log( str );
  let d = document.getElementById( 'console' );
  d && (d.innerText += "\n" + str);
}