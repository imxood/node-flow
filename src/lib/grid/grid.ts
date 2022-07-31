import { EventSystem, FederatedPointerEvent, FederatedWheelEvent } from "@pixi/events";
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
        return this._changed;
    }

    clear_changed() {
        this._changed = false;
    }
}

export class Grid {
    canvas: HTMLCanvasElement;
    app: Application;
    grid_lines: Graphics;
    axises: Graphics;
    settings: Settings;
    transform: Matrix;
    start_point: Point;

    private changed: boolean;
    private zoom_factor: number;

    constructor(canvas: HTMLCanvasElement) {

        document.addEventListener('wheel', e => {
            e.preventDefault();
        }, { passive: false });

        // 给 pixi.js chrome plugin 使用
        (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ && (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });

        PIXI.extensions.remove(PIXI.InteractionManager);

        this.canvas = canvas;
        this.app = new Application({
            antialias: true,
            backgroundColor: 0xffffff,
            view: canvas,
            width: canvas.width,
            height: canvas.height,
        });
        this.grid_lines = new Graphics();
        this.axises = new Graphics();

        this.settings = new Settings();
        this.transform = new Matrix();
        this.start_point = new Point();

        this.changed = true;
        this.zoom_factor = 1.0;

        this.app.stage.addChild(this.grid_lines);
        this.app.stage.addChild(this.axises);
    }

    need_redraw() {
        return this.changed && this.settings.is_changed();
    }

    init() {
        const { renderer, stage } = this.app;

        // 设置样式
        this.grid_lines.lineStyle(1, 0x8a919f, 1);

        renderer.addSystem(EventSystem, "events");

        stage.interactive = true;
        stage.hitArea = renderer.screen;

        stage.on("pointerdown", (e: FederatedPointerEvent) => {
            this.start_point.copyFrom(e.global);
            // this.start_point.set(ev);
        });

        stage.on("pointermove", (e: FederatedPointerEvent) => {
            if (e.buttons == 1) {
                console.log("move, left key pressed");
            } else if (e.buttons == 2) {
                this.transform.translate(e.clientX - this.start_point.x, e.clientY - this.start_point.y);
                this.start_point = new Point(e.clientX, e.clientY);
                // console.log("move, right key pressed", this.transform, this);
                // console.log(`${this.app.stage.()}`);
                this.redraw();
                // this.transform.translate();
            } else if (e.buttons == 4) {
                console.log("move, middle key pressed");
            }
        });

        stage.on("wheel", (e: FederatedWheelEvent) => {
            // if (e.ctrlKey) {
            //     console.log(`ctrlKey pressed, e.deltaY: ${e.deltaY}, ${this.transform}`);
            // }
            // if (e.altKey) {
            //     console.log(`altKey pressed, e.deltaY: ${e.deltaY}`);
            // }

            /* 
                中键 旋转一次, 根据当前点击的stage坐标 focus_point, 计算出在 transform后的位置 pos0
            */
            let focus_point = e.global;
            console.log(focus_point);

            // 新的transform
            this.transform.scale(
                1 - e.deltaY * 0.001, 1 - e.deltaY * 0.001
            );

            let pos0 = this.transform.apply(focus_point);

            // // // 应用新的transform后的点的位置
            // let pos1 = this.transform.apply(focus_point);

            // 计算新旧位置的距离
            // let dist = new Point(focus_point.x - pos0.x, focus_point.y - pos0.y);
            // // // 全局下的距离
            // // let global_dist = this.transform.applyInverse(dist);

            // this.transform.translate(dist.x, dist.y);

            this.redraw();
        }
        );

        PIXI.Ticker.shared.add((delta) => {
            if (this.need_redraw()) {
                this.redraw();
            }
        });

        this.drawGridLines();
    }

    redraw() {
        this.changed = false;
        this.settings.clear_changed();
        this.updateGridLines();
        // console.log(`${this.transform}`);
    }

    private updateGridLines() {
        this.grid_lines.transform.setFromMatrix(this.transform);
    }

    private drawGridLines() {
        let renderer = this.app.renderer;
        let { axises, grid_lines } = this;

        axises.removeChildren();
        grid_lines.removeChildren();

        grid_lines.beginFill(0xFFFFFF);
        grid_lines.drawRect(0, 0, renderer.width, renderer.height);
        grid_lines.endFill();

        let { axis_font_size, axis_mark_size, axis_unit_size } = this.settings;

        let start_pos = this.transform.apply(new Point(
            axis_font_size + axis_mark_size,
            axis_font_size + axis_mark_size
        ));

        let end_pos = this.transform.apply(new Point(
            renderer.width,
            axis_font_size + axis_mark_size
        ));

        grid_lines.moveTo(start_pos.x, start_pos.y);
        grid_lines.lineTo(end_pos.x, end_pos.y);

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
            axises.addChild(text);

            // 刻度的线条
            let small_unit = axis_unit_size / 10;
            for (var j = 0; j <= 10; j++) {
                var v = base + small_unit * j;
                if (j == 0) {
                    start_pos = this.transform.apply(new Point(v, axis_font_size - axis_mark_size));
                    /* 画垂直于水平轴的网格线 */
                    grid_lines.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(v, renderer.height));
                    grid_lines.lineTo(end_pos.x, end_pos.y);
                    break;
                } else {
                    start_pos = this.transform.apply(new Point(v, axis_font_size));
                    grid_lines.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(v, axis_font_size + axis_mark_size));
                    grid_lines.lineTo(end_pos.x, end_pos.y);
                }
            }

        }

        // y axis
        let tmp_ver = Math.ceil(
            (renderer.height - axis_font_size - axis_mark_size) /
            axis_unit_size
        );

        start_pos = new Point(axis_font_size + axis_mark_size, axis_font_size + axis_mark_size);
        grid_lines.moveTo(start_pos.x, start_pos.y);

        end_pos = new Point(axis_font_size + axis_mark_size, renderer.height);
        grid_lines.lineTo(end_pos.x, end_pos.y);

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
            axises.addChild(text);

            let small_unit = axis_unit_size / 10;
            for (var j = 0; j <= 10; j++) {
                var v = base + small_unit * j;
                if (j == 0) {
                    /* 画垂直于垂直轴的网格线 */
                    start_pos = this.transform.apply(new Point(axis_font_size - axis_mark_size, v));
                    grid_lines.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(renderer.width, v));
                    grid_lines.lineTo(end_pos.x, end_pos.y);
                    break;
                } else {
                    start_pos = this.transform.apply(new Point(axis_font_size, v));
                    grid_lines.moveTo(start_pos.x, start_pos.y);

                    end_pos = this.transform.apply(new Point(axis_font_size + axis_mark_size, v));
                    grid_lines.lineTo(end_pos.x, end_pos.y);
                }
            }
        }

        grid_lines.closePath();
    }
}
