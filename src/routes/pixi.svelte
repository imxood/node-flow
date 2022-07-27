<script lang="ts">
    import { onMount, tick } from "svelte";
    import { Grid } from "$lib/grid/grid";

    let canvas: HTMLCanvasElement;
    let grid: Grid;

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
        grid = new Grid(canvas);
        grid.init();
        grid.redraw();
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
