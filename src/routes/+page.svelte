<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import DarkModeToggle from "$lib/components/DarkModeToggle.svelte";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
</script>

<div class="min-h-screen flex flex-col">
  <!-- Hero Section -->
  <main class="flex-1 container mx-auto px-4 py-16">
    <div class="text-center max-w-3xl mx-auto">
      <h1
        class="text-4xl font-bold tracking-tight sm:text-6xl mb-6 flex flex-col items-center gap-4"
      >
        <img src="/icon.svg" alt="Trivia Party Logo" class="w-32 h-32" />
        Trivia Party
      </h1>
      <p class="text-xl text-muted-foreground mb-16">The Ultimate Social Trivia Game</p>
      <div class="flex justify-center gap-4">
        <a href="/dashboard">
          <Button size="lg">Get Started</Button>
        </a>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Group Play</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• Create private groups</li>
          <li>• Invite friends to join</li>
          <li>• Schedule trivia parties</li>
          <li>• Real-time multiplayer</li>
          <li>• Track group rankings</li>
        </ul>
      </div>
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Solo Play</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• Practice anytime</li>
          <li>• Quick 5-minute games</li>
          <li>• Track personal progress</li>
          <li>• Earn achievements</li>
          <li>• Compete on leaderboards</li>
        </ul>
      </div>
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Questions</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• 60,000+ unique questions</li>
          <li>• Multiple choice format</li>
          <li>• Diverse categories</li>
          <li>• Never repeats</li>
          <li>• Regular updates</li>
        </ul>
      </div>
      <div class="text-center p-6 border rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Stats & Rankings</h2>
        <ul class="text-muted-foreground text-left space-y-2">
          <li>• Game history</li>
          <li>• Tournament tracking</li>
          <li>• Lifetime statistics</li>
          <li>• Global rankings</li>
          <li>• Achievement badges</li>
        </ul>
      </div>
    </div>
  </main>

  <footer class="border-t mt-8">
    <div class="container mx-auto px-4 py-6">
      <div
        class="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
      >
        <a href="/about" class="hover:text-foreground transition-colors"
          >About</a
        >
        <a href="/privacy" class="hover:text-foreground transition-colors"
          >Privacy Policy</a
        >
        <a href="/terms" class="hover:text-foreground transition-colors"
          >Terms of Service</a
        >
        <a href="/pricing" class="hover:text-foreground transition-colors"
          >Pricing</a
        >
      </div>
    </div>
  </footer>

  <div class="fixed bottom-4 right-4 flex gap-2">
    <DarkModeToggle />
    <LanguageSelector />
  </div>
</div>
