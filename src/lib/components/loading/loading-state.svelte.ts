class LoadingState {
    isOpen = $state(false);
    message = $state("Loading...");

    show(message?: string) {
        this.message = message ?? "Loading...";
        this.isOpen = true;
    }

    hide() {
        this.isOpen = false;
    }
}

export const loadingState = new LoadingState();
