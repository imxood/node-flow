import { EventSystem } from "@pixi/events";
import * as PIXI from "pixi.js";
import { Application, Graphics, Matrix, Point } from "pixi.js";

export class Settings {
    private _axis_unit_size: number;
    private _axis_font_size: number;
    private _axis_mark_size: number;
    private _changed: boolean;

    constructor() {
        this._axis_unit_size = 100.0;
        this._axis_font_size = 8;
        this._axis_mark_size = 3;
        this._changed = true;
    }

    public get axis_unit_size() {
        return this._axis_unit_size;
    }

    public set axis_unit_size(axis_unit_size: number) {
        this._changed = true;
        this._axis_unit_size = axis_unit_size;
    }

    get axis_font_size() {
        return this._axis_font_size;
    }

    set axis_font_size(axis_font_size: number) {
        this._changed = true;
        this._axis_font_size = axis_font_size;
    }

    get axis_mark_size() {
        return this._axis_mark_size;
    }

    set axis_mark_size(axis_mark_size: number) {
        this._changed = true;
        this._axis_mark_size = axis_mark_size;
    }

    is_changed() {
        let changed = this._changed;
        if (changed) {
            this._changed = false;
        }
        return changed;
    }
}

export class Grid {
    canvas: HTMLCanvasElement;
    app: Application;
    graphics: Graphics;
    settings: Settings;
    transform: Matrix;
    start_point: Point;

    private zoom_factor: number;

    constructor(canvas: HTMLCanvasElement) {

        PIXI.extensions.remove(PIXI.InteractionManager);

        this.canvas = canvas;
        this.app = new Application({
            antialias: true,
            backgroundColor: 0xffffff,
            view: canvas,
        });
        this.graphics = new Graphics();
        this.settings = new Settings();
        this.transform = new Matrix();
        this.start_point = new Point();

        this.zoom_factor = 1.0;

        this.app.stage.addChild(this.graphics);
    }

    is_changed() {
        return this.settings.is_changed();
    }

    init() {
        const { renderer, stage } = this.app;

        // 设置样式
        this.graphics.lineStyle(1, 0x8a919f, 1);

        renderer.addSystem(EventSystem, "events");

        stage.interactive = true;
        stage.hitArea = renderer.screen;

        stage.on("pointerdown", (e: PointerEvent) => {
            this.start_point.set(e.clientX, e.clientY);
            // this.start_point.set(ev);
        });

        stage.on("pointermove", (e: PointerEvent) => {
            if (e.buttons == 1) {
                console.log("move, left key pressed");
            } else if (e.buttons == 2) {
                this.transform.translate(e.clientX - this.start_point.x, e.clientY - this.start_point.y);
                this.start_point = new Point(e.clientX, e.clientY);
                console.log("move, right key pressed", this.transform, this);
                this.redraw();
                // this.transform.translate();
            } else if (e.buttons == 4) {
                console.log("move, middle key pressed");
            }
        });

        document.addEventListener(
            "wheel",
            (e: WheelEvent) => {
                e.preventDefault();
                if (e.target == this.canvas) {
                    if (e.ctrlKey) {
                        console.log(`ctrlKey pressed, e.deltaY: ${e.deltaY}`);
                    }
                    if (e.altKey) {
                        console.log(`altKey pressed, e.deltaY: ${e.deltaY}`);
                    }
                }
            },
            {
                passive: false,
            }
        );

        PIXI.Ticker.shared.add((delta) => {
            if (this.is_changed()) {
                this.redraw();
            }
        });
    }

    redraw() {
        this.drawGridLines();
    }

    private drawGridLines() {
        let { renderer, stage } = this.app;
        let graphics = this.graphics;

        graphics.removeChild();

        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, renderer.width, renderer.height);
        graphics.endFill();

        let { axis_font_size, axis_mark_size, axis_unit_size } = this.settings;

        let start_pos = this.transform.apply(new Point(
            axis_font_size + axis_mark_size,
            axis_font_size + axis_mark_size
        ));

        let end_pos = this.transform.apply(new Point(
            renderer.width,
            axis_font_size + axis_mark_size
        ));

        graphics.moveTo(start_pos.x, start_pos.y);
        graphics.lineTo(end_pos.x, end_pos.y);

        // axis
        let axis_eles = new PIXI.Container();

        let axis_font_style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: axis_font_size,
            fontStyle: "italic",
            stroke: "#4a1850",
        });

        // x axis
        let tmp_hor = Math.ceil(
            (renderer.width - axis_font_size - axis_mark_size) /
            axis_unit_size
        );

        // 水平轴
        for (var i = 0; i <= tmp_hor; i++) {

            // 数字刻度
            var base = axis_font_size + axis_mark_size + i * axis_unit_size;
            const text = new PIXI.Text(
                `${i * axis_unit_size}`,
                axis_font_style
            );
            text.x = base - text.width / 2.0;
            text.y = 0;
            axis_eles.addChild(text);

            // 刻度的线条
            let small_unit = axis_unit_size / 10;
            for (var j = 0; j <= 10; j++) {
                var v = base + small_unit * j;
                if (j == 10) {
                    start_pos = this.transform.apply(new Point(v, axis_font_size - axis_mark_size));
                    /* 画垂直于水平轴的网格线 */
                    graphics.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(v, renderer.height));
                    graphics.lineTo(end_pos.x, end_pos.y);
                } else {
                    start_pos = this.transform.apply(new Point(v, axis_font_size));
                    graphics.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(v, axis_font_size + axis_mark_size));
                    graphics.lineTo(end_pos.x, end_pos.y);
                }
            }

        }

        // y axis
        let tmp_ver = Math.ceil(
            (renderer.height - axis_font_size - axis_mark_size) /
            axis_unit_size
        );

        start_pos = new Point(axis_font_size + axis_mark_size, axis_font_size + axis_mark_size);
        graphics.moveTo(start_pos.x, start_pos.y);

        end_pos = new Point(axis_font_size + axis_mark_size, renderer.height);
        graphics.lineTo(end_pos.x, end_pos.y);

        for (var i = 0; i <= tmp_ver; i++) {
            var base = axis_font_size + axis_mark_size + i * axis_unit_size;
            const text = new PIXI.Text(
                `${i * axis_unit_size}`,
                axis_font_style
            );
            text.x = axis_font_size / 2;
            text.y = base;
            text.anchor.set(0.5, 0.5);
            text.rotation = -PIXI.PI_2 / 4;
            axis_eles.addChild(text);

            let small_unit = axis_unit_size / 10;
            for (var j = 0; j <= 10; j++) {
                var v = base + small_unit * j;
                if (j == 10) {
                    /* 画垂直于垂直轴的网格线 */
                    start_pos = this.transform.apply(new Point(axis_font_size - axis_mark_size, v));
                    graphics.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(renderer.width, v));
                    graphics.lineTo(end_pos.x, end_pos.y);
                } else {
                    start_pos = this.transform.apply(new Point(axis_font_size, v));
                    graphics.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(axis_font_size + axis_mark_size, v));
                    graphics.lineTo(end_pos.x, end_pos.y);
                }
            }
        }

        graphics.addChild(axis_eles);
    }
}

export { };