export class Pos {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    [Symbol.iterator]() {
        let i = 0;
        let that = this;
        return {
            next: () => {
                if (i == 0) {
                    return { that.x, done }
                } else {
                    { value: that.x, done: true }
                }
            }
        }
    }
}