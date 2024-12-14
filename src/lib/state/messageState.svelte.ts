let messageRefreshCounter = $state(0);

export function getMessageRefreshCounter() {
    return messageRefreshCounter;
}

export function triggerMessageRefresh() {
    messageRefreshCounter++;
}
