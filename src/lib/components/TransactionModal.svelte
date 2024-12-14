<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Select from "$lib/components/ui/select";
  import type { Transaction } from "$lib/services/transactionService.svelte";
  import { upsertTransaction } from "$lib/services/transactionService.svelte";

  let { propertyId, onClose, onSave, existingTransaction, open = true } = $props<{
    propertyId: string;
    onClose: () => void;
    onSave: () => void;
    existingTransaction?: Transaction;
    open?: boolean;
  }>();

  let saving = $state(false);
  let error = $state<string | null>(null);
  let modalTitle = $derived(
    existingTransaction ? "Edit Transaction" : "Add Transaction",
  );
  let modalDescription = $derived(
    existingTransaction
      ? "Edit transaction details for this property."
      : "Add a new transaction for this property.",
  );

  const transactionTypes = [
    { value: "sale", label: "Sale" },
    { value: "purchase", label: "Purchase" },
    { value: "rental", label: "Rental" },
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
  ];

  const transactionStatuses = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  let transaction = $state<Partial<Transaction>>(
    existingTransaction
      ? {
          ...existingTransaction,
          start_date: existingTransaction.start_date
            ? new Date(existingTransaction.start_date)
                .toISOString()
                .split("T")[0]
            : new Date().toISOString().split("T")[0],
          end_date: existingTransaction.end_date
            ? new Date(existingTransaction.end_date).toISOString().split("T")[0]
            : null,
        }
      : {
          propertyid: propertyId,
          type: "",
          amount: 0,
          balance: 0,
          start_date: new Date().toISOString().split("T")[0],
          end_date: null,
          description: "",
          notes: "",
          status: "active",
        },
  );

  const typeContent = $derived(
    transactionTypes.find((t) => t.value === transaction.type)?.label ??
      "Select type...",
  );

  const statusContent = $derived(
    transactionStatuses.find((s) => s.value === transaction.status)?.label ??
      "Select status",
  );

  async function handleSave() {
    saving = true;
    error = null;

    const { error: saveError } = await upsertTransaction(transaction);

    if (saveError) {
      error = saveError.message;
      saving = false;
      return;
    }

    saving = false;
    onSave();
  }

  function handleClose() {
    onClose();
  }
</script>

<Dialog.Root {open} onOpenChange={(isOpen) => !isOpen && onClose()}>
  <Dialog.Content class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
    <Dialog.Header class="pb-4">
      <Dialog.Title>{modalTitle}</Dialog.Title>
      <Dialog.Description>
        {modalDescription}
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-6 py-4">
      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        class="space-y-6"
      >
        <div class="grid gap-2">
          <Label for="type">Type</Label>
          <Select.Root type="single" bind:value={transaction.type}>
            <Select.Trigger class="w-full">
              {typeContent}
            </Select.Trigger>
            <Select.Content>
              {#each transactionTypes as type}
                <Select.Item value={type.value}>{type.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="grid gap-2">
          <Label for="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            bind:value={transaction.amount}
            required
          />
        </div>

        <div class="grid gap-2">
          <Label for="balance">Balance</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            bind:value={transaction.balance}
            required
          />
        </div>

        <div class="grid gap-2">
          <Label for="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            bind:value={transaction.start_date}
            required
          />
        </div>

        <div class="grid gap-2">
          <Label for="end_date">End Date</Label>
          <Input id="end_date" type="date" bind:value={transaction.end_date} />
        </div>

        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Input
            id="description"
            bind:value={transaction.description}
            placeholder="Enter transaction details..."
          />
        </div>

        <div class="grid gap-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            bind:value={transaction.notes}
            placeholder="Enter additional notes..."
            rows={4}
          />
        </div>

        <div class="grid gap-2">
          <Label for="status">Status</Label>
          <Select.Root type="single" bind:value={transaction.status}>
            <Select.Trigger class="w-full">
              {statusContent}
            </Select.Trigger>
            <Select.Content>
              {#each transactionStatuses as status}
                <Select.Item value={status.value}>{status.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        {#if error}
          <p class="text-sm text-destructive">{error}</p>
        {/if}
      </form>
    </div>
    <Dialog.Footer class="pt-4">
      <Button type="button" variant="outline" onclick={handleClose}>
        Cancel
      </Button>
      <Button
        variant="secondary"
        type="submit"
        disabled={saving}
        onclick={handleSave}
      >
        {saving ? "Saving..." : "Save"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
