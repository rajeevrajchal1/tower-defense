<script lang="ts">
	import { browser } from '$app/environment';
	import { PerlinNoise } from '$lib/utils/PerlinNoise';
	import { onMount, onDestroy } from 'svelte';

	let width: number = $state(0);
	let height: number = $state(0);
	let noiseScale: number = 0.005; // Reduced for smoother gradients
	let animationSpeed: number = 0.01; // Slowed down for subtler animation

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let offscreenCanvas: OffscreenCanvas;
	let offscreenCtx: OffscreenCanvasRenderingContext2D | null;
	let animationId: number;

	const perlin = new PerlinNoise();
	let t = 0;

	// Function to apply Perlin noise to the gradient
	function applyNoiseToGradient(imageData: ImageData): void {
		const color1 = { r: 197, g: 147, b: 255 }; // #c493ff
		const color2 = { r: 117, g: 65, b: 255 }; // #7541ff
		const data = imageData.data;

		for (let i = 0; i < data.length; i += 4) {
			const x = (i / 4) % width;
			const y = Math.floor(i / 4 / width);
			const noise = (perlin.noise(x * noiseScale, y * noiseScale, t) + 1) / 2;

			const r = Math.floor(color1.r * (1 - noise) + color2.r * noise);
			const g = Math.floor(color1.g * (1 - noise) + color2.g * noise);
			const b = Math.floor(color1.b * (1 - noise) + color2.b * noise);

			data[i] = r; // R
			data[i + 1] = g; // G
			data[i + 2] = b; // B
			data[i + 3] = 255; // A (fully opaque)
		}
	}

	// Main draw function
	function draw(): void {
		if (!ctx || !offscreenCtx) return;

		// Create gradient on offscreen canvas
		perlin.createGradient(offscreenCtx, width, height);

		// Get image data from offscreen canvas
		const imageData = offscreenCtx.getImageData(0, 0, width, height);

		// Apply noise to the gradient
		applyNoiseToGradient(imageData);

		// Put the modified image data back to the offscreen canvas
		offscreenCtx.putImageData(imageData, 0, 0);

		// Draw the offscreen canvas onto the main canvas
		ctx.drawImage(offscreenCanvas, 0, 0);

		// Update time and request next frame
		t += animationSpeed;
		animationId = requestAnimationFrame(draw);
	}

	// Function to handle window resizing
	function handleResize(): void {
		if (!browser) return;
		width = window.innerWidth;
		height = window.innerHeight;
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}
		if (offscreenCanvas) {
			offscreenCanvas.width = width;
			offscreenCanvas.height = height;
		}
	}

	onMount(() => {
		if (!browser) return;
		ctx = canvas.getContext('2d');
		offscreenCanvas = new OffscreenCanvas(width, height);
		offscreenCtx = offscreenCanvas.getContext('2d');
		handleResize();
		window.addEventListener('resize', handleResize);
		draw();
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('resize', handleResize);
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	});
	let counter: number = $state(0);
	const handleButtonClick = () => {
		counter++;
	};
</script>

<canvas bind:this={canvas} {width} {height}></canvas>
<div class="main">
	<p>this is the content</p>
	<button onclick={handleButtonClick}> click here </button>
	<p>Counter: {counter}</p>
</div>

<style>
	.main {
		position: relative;
	}
	canvas {
		display: block;
		position: absolute;
		overflow: hidden;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
