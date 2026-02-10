<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { preloadDefaultFont } from '$lib/engine/figlet-renderer';

  let { children } = $props();
  let container;

  onMount(async () => {
    await document.fonts.load('16px "JetBrains Mono"');
    preloadDefaultFont();
    gsap.from(container, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
</script>

<div bind:this={container} class="vignette min-h-screen bg-doom-black font-mono text-doom-text">
  {@render children()}
</div>
