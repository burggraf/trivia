<script lang="ts">
	import { Sun, Moon, SunMoon } from 'lucide-svelte'
	import { setMode } from 'mode-watcher'
	import { Button } from '$lib/components/ui/button'
	import * as Popover from '$lib/components/ui/popover'
	import { t } from '$lib/i18n'

	let open = $state(false)

	function setTheme(mode: 'light' | 'dark' | 'system') {
		setMode(mode)
		open = false
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button variant="ghost" size="icon" class="ml-2">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">{$t('darkModeToggle.toggleTheme')}</span>
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-56">
		<div class="grid gap-4">
			<h4 class="font-medium leading-none">{$t('darkModeToggle.chooseTheme')}</h4>
			<div class="grid gap-2">
				<Button variant="ghost" class="w-full justify-start" onclick={() => setTheme('light')}>
					<Sun class="mr-2 h-4 w-4" />
					{$t('darkModeToggle.lightMode')}
				</Button>
				<Button variant="ghost" class="w-full justify-start" onclick={() => setTheme('dark')}>
					<Moon class="mr-2 h-4 w-4" />
					{$t('darkModeToggle.darkMode')}
				</Button>
				<Button variant="ghost" class="w-full justify-start" onclick={() => setTheme('system')}>
					<SunMoon class="mr-2 h-4 w-4" />
					{$t('darkModeToggle.systemSetting')}
				</Button>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
