<script>
  import '../app.css';
  let { children } = $props();
</script>

<div class="vignette min-h-screen bg-doom-black font-mono text-doom-text">
  {@render children()}
</div>
