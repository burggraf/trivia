interface AlertOptions {
    title: string;
    message: string;
    buttons?: Array<{
        label: string;
        value: string;
        variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    }>;
}

class AlertManager {
    isOpen = $state(false);
    options = $state<AlertOptions | null>(null);
    resolvePromise: ((value: string) => void) | null = null;

    async show(options: AlertOptions): Promise<string> {
        this.options = options;
        this.isOpen = true;

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    handleAction(value: string) {
        this.isOpen = false;
        this.resolvePromise?.(value);
        this.options = null;
    }
}

export const alertManager = new AlertManager(); 