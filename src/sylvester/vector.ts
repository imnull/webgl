import Sylvester from "./sylvester";

const getV = (vector: number[] | Vector) => Array.isArray(vector) ? vector : vector.elements

export default class Vector {

    public elements: number[] = []
    public anchor: any = null
    public direction: number = 0

    constructor() {
        this.elements = []
        this.anchor = null
        this.direction = 0
    }

    // Returns element i of the vector
    e(i: number) {
        return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
    }

    // Returns the number of elements the vector has
    dimensions() {
        return this.elements.length;
    }

    // Returns the modulus ('length') of the vector
    modulus() {
        return Math.sqrt(this.dot(this));
    }

    // Returns true iff the vector is equal to the argument
    eql(vector: Vector | number[]) {
        let n = this.elements.length;
        const V = getV(vector)
        if (n != V.length) { return false; }
        do {
            if (Math.abs(this.elements[n - 1] - V[n - 1]) > Sylvester.precision) {
                return false
            }
        } while (--n);
        return true;
    }

    // Returns a copy of the vector
    dup() {
        return Vector.create(this.elements);
    }

    // Maps the vector to another vector according to the given function
    map(fn: (el: number, idx: number) => number) {
        var elements = [];
        this.each(function (x, i) {
            elements.push(fn(x, i));
        });
        return Vector.create(elements);
    }

    // Calls the iterator for each element of the vector in turn
    each(fn: (el: number, idx: number) => void) {
        let n = this.elements.length, k = n, i: number;
        do {
            i = k - n;
            fn(this.elements[i], i + 1);
        } while (--n);
    }

    // Returns a new vector created by normalizing the receiver
    toUnitVector() {
        const r = this.modulus();
        if (r === 0) { return this.dup(); }
        return this.map(function (x) { return x / r; })
    }

    // Returns the angle between the vector and the argument (also a vector)
    angleFrom(vector: number[] | Vector) {
        const V = getV(vector)
        let n = this.elements.length, k = n, i: number;
        if (n != V.length) { return null }
        let dot = 0, mod1 = 0, mod2 = 0;
        // Work things out in parallel to save time
        this.each(function (x, i) {
            dot += x * V[i - 1];
            mod1 += x * x;
            mod2 += V[i - 1] * V[i - 1];
        });
        mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
        if (mod1 * mod2 === 0) { return null; }
        let theta = dot / (mod1 * mod2);
        if (theta < -1) { theta = -1; }
        if (theta > 1) { theta = 1; }
        return Math.acos(theta);
    }

    // Returns true iff the vector is parallel to the argument
    isParallelTo(vector: number[] | Vector) {
        var angle = this.angleFrom(vector);
        return (angle === null) ? null : (angle <= Sylvester.precision);
    }

    // Returns true iff the vector is antiparallel to the argument
    isAntiparallelTo(vector: number[] | Vector) {
        var angle = this.angleFrom(vector);
        return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
    }

    // Returns true iff the vector is perpendicular to the argument
    isPerpendicularTo(vector: number[] | Vector) {
        var dot = this.dot(vector);
        return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
    }

    // Returns the result of adding the argument to the vector
    add(vector: number[] | Vector) {
        const V = getV(vector)
        if (this.elements.length != V.length) { return null; }
        return this.map((x, i) => x + V[i - 1])
    }

    // Returns the result of subtracting the argument from the vector
    subtract(vector: number[] | Vector) {
        const V = getV(vector)
        if (this.elements.length != V.length) { return null; }
        return this.map((x, i) => x - V[i - 1]);
    }

    // Returns the result of multiplying the elements of the vector by the argument
    multiply(k: number) {
        return this.map(x => x * k);
    }

    x(k: number) { return this.multiply(k); }

    // Returns the scalar product of the vector with the argument
    // Both vectors must have equal dimensionality
    dot(vector: number[] | Vector) {
        const V = getV(vector)
        let i: number, product = 0, n = this.elements.length;
        if (n != V.length) { return null; }
        do { product += this.elements[n - 1] * V[n - 1]; } while (--n);
        return product;
    }

    // Returns the vector product of the vector with the argument
    // Both vectors must have dimensionality 3
    cross(vector: number[] | Vector) {
        var B = getV(vector)
        if (this.elements.length != 3 || B.length != 3) { return null; }
        var A = this.elements;
        return Vector.create([
            (A[1] * B[2]) - (A[2] * B[1]),
            (A[2] * B[0]) - (A[0] * B[2]),
            (A[0] * B[1]) - (A[1] * B[0])
        ]);
    }

    // Returns the (absolute) largest element of the vector
    max() {
        var m = 0, n = this.elements.length, k = n, i;
        do {
            i = k - n;
            if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
        } while (--n);
        return m;
    }

    // Returns the index of the first match found
    indexOf(x: number) {
        var index = null, n = this.elements.length, k = n, i;
        do {
            i = k - n;
            if (index === null && this.elements[i] == x) {
                index = i + 1;
            }
        } while (--n);
        return index;
    }

    // Returns a diagonal matrix with the vector's elements as its diagonal elements
    toDiagonalMatrix() {
        return Matrix.Diagonal(this.elements);
    }

    // Returns the result of rounding the elements of the vector
    round() {
        return this.map(function (x) { return Math.round(x); });
    }

    // Returns a copy of the vector with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    snapTo(x: number) {
        return this.map(y => {
            return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
        });
    }

    // Returns the vector's distance from the argument, when considered as a point in space
    distanceFrom(obj: number[] | Vector) {
        if(obj instanceof Vector && obj.anchor) {
            return obj.distanceFrom(this)
        }
        const V = getV(obj)
        if (V.length != this.elements.length) { return null; }
        var sum = 0, part;
        this.each((x, i) => {
            part = x - V[i - 1];
            sum += part * part;
        });
        return Math.sqrt(sum);
    }

    // // Returns true if the vector is point on the given line
    // liesOn(line) {
    //     return line.contains(this);
    // }

    // // Return true iff the vector is a point in the given plane
    // liesIn(plane) {
    //     return plane.contains(this);
    // }

    // Rotates the vector about the given object. The object should be a 
    // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
    rotate(t: number, obj: number[] | Vector) {
        let V: number[], R: number[], x: number, y: number, z: number
        switch (this.elements.length) {
            case 2:
                V = getV(obj);
                if (V.length != 2) { return null; }
                R = Matrix.Rotation(t).elements;
                x = this.elements[0] - V[0];
                y = this.elements[1] - V[1];
                return Vector.create([
                    V[0] + R[0][0] * x + R[0][1] * y,
                    V[1] + R[1][0] * x + R[1][1] * y
                ]);
                break;
            case 3:
                if (!obj.direction) { return null; }
                var C = obj.pointClosestTo(this).elements;
                R = Matrix.Rotation(t, obj.direction).elements;
                x = this.elements[0] - C[0];
                y = this.elements[1] - C[1];
                z = this.elements[2] - C[2];
                return Vector.create([
                    C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
                    C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
                    C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
                ]);
                break;
            default:
                return null;
        }
    }

    // // Returns the result of reflecting the point in the given point, line or plane
    // reflectionIn(obj: number[] | Vector) {
    //     if (obj.anchor) {
    //         // obj is a plane or line
    //         var P = this.elements.slice();
    //         var C = obj.pointClosestTo(P).elements;
    //         return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    //     } else {
    //         // obj is a point
    //         var Q = obj.elements || obj;
    //         if (this.elements.length != Q.length) { return null; }
    //         return this.map(function (x, i) { return Q[i - 1] + (Q[i - 1] - x); });
    //     }
    // }

    // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
    to3D() {
        var V = this.dup();
        switch (V.elements.length) {
            case 3: break;
            case 2: V.elements.push(0); break;
            default: return null;
        }
        return V;
    }

    // Returns a string representation of the vector
    inspect() {
        return '[' + this.elements.join(', ') + ']';
    }

    // Set vector's elements from an array
    setElements(els: Vector | number[]) {
        els = getV(els)
        this.elements = els.slice();
        return this;
    }

    // Constructor function
    static create(elements: number[]) {
        var V = new Vector();
        return V.setElements(elements);
    }
    // Random vector of size n
    static Random(n: number) {
        var elements = [];
        do {
            elements.push(Math.random());
        } while (--n);
        return Vector.create(elements);
    }
    // Vector filled with zeros
    static Zero(n: number) {
        const elements: number[] = [];
        do {
            elements.push(0);
        } while (--n);
        return Vector.create(elements);
    }

    // i, j, k unit vectors
    static i = Vector.create([1, 0, 0])
    static j = Vector.create([0, 1, 0])
    static k = Vector.create([0, 0, 1])
}