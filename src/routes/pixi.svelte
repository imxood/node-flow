<script lang="ts">
    import { onMount } from "svelte";
    import * as PIXI from "pixi.js";

    import { EventSystem } from "@pixi/events";

    let canvas: HTMLCanvasElement;
    let zoom_factor = 1.0;

    let axis_unit_size = 5;
    let axis_font_size = 16;

    let axis_font_style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 16,
        fontStyle: "italic",
        stroke: "#4a1850",
    });

    let mounted = false;

    function canvas_keypressed(e: KeyboardEvent) {
        if (mounted) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function canvas_clicked(e: Event) {
        e.preventDefault();
        if (mounted) {
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
        mounted = true;
        PIXI.extensions.remove(PIXI.InteractionManager);

        const app = new PIXI.Application({
            antialias: true,
            backgroundColor: 0xffffff,
            view: canvas,
        });

        const { renderer, stage } = app;

        renderer.addSystem(EventSystem, "events");

        // Make the whole scene interactive
        stage.interactive = true;
        // Make sure stage captures all events when interactive
        stage.hitArea = renderer.screen;

        // // 事件
        // stage.addEventListener("wheel", (w_e: Event) => {
        //     let e = w_e as WheelEvent;
        //     e.preventDefault();
        //     var zoom_factor = -0.001 * e.deltaY;
        //     var x = e.offsetX;
        //     var y = e.offsetY;
        //     console.log(
        //         zoom_factor,
        //         e,
        //         [e.screenX, e.screenY],
        //         [e.clientX, e.clientY]
        //     );
        // });

        // stage.on("click", function handleClick(e: Event) {
        //     console.log("Hello world!", e);
        // });

        /* 
            画图形
        */

        let unit = 10; // px

        const graphics = new PIXI.Graphics();

        let width = renderer.width - axis_font_size;
        let height = renderer.height - axis_font_size;

        // 设置样式
        graphics.lineStyle(1, 0xacacac, 1);

        // x axis
        let tmp_hor = Math.ceil((renderer.width - axis_font_size) / 100.0);

        graphics.moveTo(axis_font_size, axis_font_size);
        graphics.lineTo(tmp_hor * 100.0, axis_font_size);

        for (var i = 0; i <= tmp_hor; i++) {
            if (i) {
                const text = new PIXI.Text(`${i}`, axis_font_style);
                text.x = i * 100;
                text.y = 0;
                stage.addChild(text);
            }
        }

        // y axis
        let tmp_ver = Math.ceil((renderer.height - axis_font_size) / 100.0);

        graphics.moveTo(axis_font_size, axis_font_size);
        graphics.lineTo(axis_font_size, renderer.height);

        for (var i = 0; i <= tmp_ver; i++) {
            if (i) {
                const text = new PIXI.Text(`${i}`, axis_font_style);
                text.x = axis_font_size / 2;
                text.y = i * 100;
                text.anchor.set(0.5, 0.5);
                text.rotation = -PIXI.PI_2 / 4;
                stage.addChild(text);
            }
        }

        // draw a rectangle
        graphics.beginFill(0xacacac);
        // graphics.lineStyle(2, 0xacacac, 1);
        graphics.drawRect(axis_font_size, axis_font_size, width, height);
        graphics.endFill();

        app.stage.addChild(graphics);

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

<canvas
    bind:this={canvas}
    on:click|preventDefault={canvas_clicked}
    width={500}
    height={350}
/>

<svelte:window on:keypress|preventDefault|stopPropagation={canvas_keypressed} />

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
