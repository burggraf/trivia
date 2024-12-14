<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
</script>

<div class="min-h-screen flex flex-col">
  <!-- Hero Section -->
  <main class="flex-1 container mx-auto px-4 py-16">
    <div class="text-center max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl mb-6 flex flex-col items-center gap-4">
        <img src="/icon.svg" alt="Azabab Logo" class="w-32 h-32" />
        Azabab
      </h1>
      <p class="text-xl text-muted-foreground mb-16">
        Property Rental Manager
      </p>
      <div class="flex justify-center gap-4">
        <a href="/dashboard">
          <Button size="lg">Get Started</Button>
        </a>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">For Agents</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• Manage multiple properties</li>
          <li>• Schedule rentals</li>
          <li>• Generate rental agreements</li>
          <li>• Schedule maintenance</li>
          <li>• Coordinate with all parties</li>
        </ul>
      </div>
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">For Owners</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• Monitor property status</li>
          <li>• Communicate with agents</li>
          <li>• Access important documents</li>
          <li>• Track property performance</li>
          <li>• Review maintenance reports</li>
        </ul>
      </div>
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">For Renters</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• Access rental documents</li>
          <li>• Contact property agent</li>
          <li>• Request maintenance</li>
          <li>• Pay rent and fees</li>
          <li>• Renew lease online</li>
        </ul>
      </div>
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">For Providers</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• Receive service orders</li>
          <li>• Send invoices</li>
          <li>• View scheduled calls</li>
          <li>• Track service history</li>
          <li>• Communicate with agents</li>
        </ul>
      </div>
    </div>
  </main>

  <footer class="border-t mt-8">
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
        <a href="/about" class="hover:text-foreground transition-colors">About</a>
        <a href="/privacy" class="hover:text-foreground transition-colors">Privacy Policy</a>
        <a href="/terms" class="hover:text-foreground transition-colors">Terms of Service</a>
        <a href="/pricing" class="hover:text-foreground transition-colors">Pricing</a>
      </div>
    </div>
  </footer>

  <div class="fixed bottom-4 right-4 flex gap-2">
    <DarkModeToggle />
    <LanguageSelector />
  </div>
</div>
