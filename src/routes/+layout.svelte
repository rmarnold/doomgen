<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { preloadDefaultFont } from '$lib/engine/figlet-renderer';

  let { children } = $props();
  let container: HTMLDivElement;

  onMount(async () => {
    await document.fonts.load('16px "JetBrains Mono"');
    preloadDefaultFont();

    // Stagger entrance animations
    const header = container.querySelector('[data-anim="header"]');
    const input = container.querySelector('[data-anim="input"]');
    const style = container.querySelector('[data-anim="style"]');
    const preview = container.querySelector('[data-anim="preview"]');
    const exportSection = container.querySelector('[data-anim="export"]');

    const targets = [header, input, style, preview, exportSection].filter(Boolean);
    if (targets.length > 0) {
      gsap.from(targets, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
      });
    } else {
      gsap.from(container, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  });
</script>

<div bind:this={container} class="min-h-screen bg-doom-black font-mono text-doom-text">
  {@render children()}
</div>
