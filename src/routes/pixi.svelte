<script lang="ts">
    import { onMount } from "svelte";
    import * as PIXI from "pixi.js";

    import { EventSystem } from "@pixi/events";
    import { Pos } from "$lib/pos";

    let canvas: HTMLCanvasElement;
    let app: PIXI.Application;
    let transform = new PIXI.Matrix();

    let zoom_factor = 1.0;

    let axis_unit_size = 100.0;
    let axis_font_size = 8;
    let axis_mark_size = 3;

    let axis_font_style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: axis_font_size,
        fontStyle: "italic",
        stroke: "#4a1850",
    });

    function canvas_contextmenu(e: Event) {}

    function canvas_keydown(e: KeyboardEvent) {
        if (e.ctrlKey) {
            console.log("ctrlKey pressed");
        }
        if (e.altKey) {
            console.log("altKey pressed");
        }
        console.log(`${e.key} keydown`, e, window.event);
        e.preventDefault();
    }

    function canvas_keyup(e: KeyboardEvent) {
        if (e.ctrlKey) {
            console.log("ctrlKey pressed");
        }
        if (e.altKey) {
            console.log("altKey pressed");
        }
        console.log(`${e.key} pressed, ${e}`);
    }

    function canvas_click(e: Event) {
        if (e.target == canvas) {
            if ((<KeyboardEvent>e).ctrlKey) {
                console.log("ctrlKey pressed");
            }
            if ((<KeyboardEvent>e).altKey) {
                console.log("altKey pressed");
            }
            console.log("clicked");
        }
    }

    onMount(() => {
        PIXI.extensions.remove(PIXI.InteractionManager);

        app = new PIXI.Application({
            antialias: true,
            backgroundColor: 0xffffff,
            view: canvas,
        });

        const { renderer, stage } = app;

        renderer.addSystem(EventSystem, "events");

        document.addEventListener("pointermove", (e: PointerEvent) => {
            if (e.target == canvas && e.buttons) {
                if (e.buttons == 1) {
                    console.log("move, left key pressed");
                } else if (e.buttons == 2) {
                    console.log("move, right key pressed");
                } else if (e.buttons == 4) {
                    console.log("move, middle key pressed");
                }
            }
        });

        document.addEventListener(
            "wheel",
            (e: WheelEvent) => {
                e.preventDefault();
                if (e.target == canvas) {
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

        /* 
            画图形
        */

        let unit = 10; // px

        const graphics = new PIXI.Graphics();

        function drawGridLines() {
            stage.removeChild();

            // 设置样式
            graphics.lineStyle(1, 0x8a919f, 1);

            // axis
            let axis_eles = new PIXI.Container();

            // x axis
            let tmp_hor = Math.ceil(
                (renderer.width - axis_font_size - axis_mark_size) /
                    axis_unit_size
            );

            let start_pos = new Pos(
                axis_font_size + axis_mark_size,
                axis_font_size + axis_mark_size
            );

            graphics.moveTo(...start_pos);
            graphics.lineTo(renderer.width, axis_font_size + axis_mark_size);

            // x axis
            for (var i = 0; i <= tmp_hor; i++) {
                var base = axis_font_size + axis_mark_size + i * axis_unit_size;
                const text = new PIXI.Text(
                    `${i * axis_unit_size}`,
                    axis_font_style
                );
                text.x = base - text.width / 2.0;
                text.y = 0;
                axis_eles.addChild(text);

                let small_unit = axis_unit_size / 10;
                for (var j = 0; j <= 10; j++) {
                    var v = base + small_unit * j;
                    if (j == 5) {
                        graphics.moveTo(v, axis_font_size - axis_mark_size);
                        graphics.lineTo(v, axis_font_size + axis_mark_size);
                    } else {
                        graphics.moveTo(v, axis_font_size);
                        graphics.lineTo(v, axis_font_size + axis_mark_size);
                    }
                }
            }

            // y axis
            let tmp_ver = Math.ceil(
                (renderer.height - axis_font_size - axis_mark_size) /
                    axis_unit_size
            );

            graphics.moveTo(
                axis_font_size + axis_mark_size,
                axis_font_size + axis_mark_size
            );
            graphics.lineTo(axis_font_size + axis_mark_size, renderer.height);

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
                    if (j == 5) {
                        graphics.moveTo(axis_font_size - axis_mark_size, v);
                        graphics.lineTo(axis_font_size + axis_mark_size, v);
                    } else {
                        graphics.moveTo(axis_font_size, v);
                        graphics.lineTo(axis_font_size + axis_mark_size, v);
                    }
                }
            }

            stage.addChild(graphics);
            stage.addChild(axis_eles);
        }

        drawGridLines();

        PIXI.Ticker.shared.add((delta) => {
            // console.log("delta", delta);
            // basicText.text = `delta ${delta.toFixed(6)}`;
        });

        console.log(
            "PIXI.Ticker.shared.autoStart",
            PIXI.Ticker.shared.autoStart
        );
    });
</script>

<canvas bind:this={canvas} width={500} height={350} />

<svelte:window on:contextmenu|preventDefault={canvas_contextmenu} />

<!-- <script>
    import { Application, Text } from "svelte-pixi";
</script>

<Application width={400} height={400} antialias>
    <Text
        text="Hello World"
        style={{ fill: "white" }}
        x={200}
        y={200}
        anchor={0.5}
    />
</Application> -->

<!-- 
// // 画矩形
// graphics.beginFill(0xacacac);
// graphics.drawRect(axis_font_size, axis_font_size, width, height);
// graphics.endFill();

// graphics.interactive = true;
// graphics.addEventListener("click", (mouse_event: Event) => {
//     let e = <MouseEvent>mouse_event;
//     if (e.button == 0) {
//         if (e.altKey && e.ctrlKey) {
//             console.log("Ctrl + Alt + 左键 clicked");
//         } else if (e.altKey) {
//             console.log("Alt + 左键 clicked");
//         } else if (e.ctrlKey) {
//             console.log("Ctrl + 左键 clicked");
//         } else {
//             console.log("左键 clicked");
//         }
//     } else if (e.button == 1) {
//         if (e.altKey && e.ctrlKey) {
//             console.log("Ctrl + Alt + 中键 clicked");
//         } else if (e.altKey) {
//             console.log("Alt + 中键 clicked");
//         } else if (e.ctrlKey) {
//             console.log("Ctrl + 中键 clicked");
//         } else {
//             console.log("中键 clicked");
//         }
//     } else if (e.button == 2) {
//         if (e.altKey && e.ctrlKey) {
//             console.log("Ctrl + Alt + 右键 clicked");
//         } else if (e.altKey) {
//             console.log("Alt + 右键 clicked");
//         } else if (e.ctrlKey) {
//             console.log("Ctrl + 右键 clicked");
//         } else {
//             console.log("右键 clicked");
//         }
//     }
// }); -->
