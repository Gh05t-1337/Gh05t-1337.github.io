// MATH
// vector math -------------------------------------------------------

class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x; 
        this.y = y;
    }

    set(v) {
        this.x = v.x; this.y = v.y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    // these 4 change this vector and return it
    add(v, s = 1.0) {
        this.x += v.x * s;
        this.y += v.y * s;
        return this;
    }

    sub(v, s = 1.0) {
        this.x -= v.x * s;
        this.y -= v.y * s;
        return this;
    }

    scale(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    div(s) {
        this.x /= s;
        this.y /= s;
        return this;
    }

    // these 4 don't change this vector, but only return the result
    plus(other){
        return new Vector2(this.x+other.x,this.y+other.y);
    }

    minus(other) {
        return new Vector2(this.x-other.x,this.y-other.y);
    }

    times(scalar){
        return new Vector2(this.x*scalar,this.y*scalar);
    }
    
    divide(scalar){
        return new Vector2(this.x/scalar,this.y/scalar);
    }


    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    perp() {
        return new Vector2(-this.y, this.x);
    }
    
    cross(other){
        return this.x*other.y - this.y*other.x;
    }
}