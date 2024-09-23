/* 
    * Perlin noise is a type of gradient noise used to generate smooth and natural-looking random variations, 
    * often in visual effects, textures, and procedural generation (such as terrain in games). It’s designed to 
    * avoid harsh, sharp transitions by creating continuous noise that flows smoothly across coordinates. 
*/

export class PerlinNoise {
    private p: Uint8Array;

    constructor() {
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        // Shuffle array to create permutation array
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
    }

    public noise(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        const A = this.p[X] + Y,
            AA = this.p[A] + Z,
            AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y,
            BA = this.p[B] + Z,
            BB = this.p[B + 1] + Z;
        return this.lerp(
            w,
            this.lerp(
                v,
                this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
                this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
            ),
            this.lerp(
                v,
                this.lerp(
                    u,
                    this.grad(this.p[AA + 1], x, y, z - 1),
                    this.grad(this.p[BA + 1], x - 1, y, z - 1)
                ),
                this.lerp(
                    u,
                    this.grad(this.p[AB + 1], x, y - 1, z - 1),
                    this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    }

    public createGradient(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        width: number,
        height: number): void {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(1, 'red');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /*
     * The fade function is a smoothing function applied to the distance (or "coordinate fractions") between grid points.
     * It’s designed to reduce the abruptness of transitions by smoothing the interpolation.
     */
    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /** Linear interpolation blends two values (a and b) based on the amount t (which ranges between 0 and 1).
     * This is essential for smoothing the transitions between the gradient values of grid points.*/
    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    /** The gradient function determines the direction of the gradient at a specific point on the grid.
    Based on the lower 4 bits of the hash (a number generated from the permutation array), it decides which gradient vector to use. 
    The gradient vector's components are either x, y, or z, and the final value is determined by the dot product of the gradient vector and the distance from the grid point.
    By hashing the coordinates and using this to select one of 12 pre-defined gradient directions, this method helps ensure that the noise looks smooth and continuous. */
    private grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    }
}
