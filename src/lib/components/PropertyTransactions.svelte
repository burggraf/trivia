<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Transaction } from "$lib/services/transactionService.svelte";
  import { getPropertyTransactions } from "$lib/services/transactionService.svelte";
  import { formatDate } from "$lib/utils/date";
  import { formatCurrency } from "$lib/utils/currency";
  import TransactionModal from "$lib/components/TransactionModal.svelte";

  let {
    property,
    showTransactionModal,
    onOpenModal = () => {},
    onModalClose = () => {},
  } = $props<{
    property: any;
    showTransactionModal: boolean;
    onOpenModal?: () => void;
    onModalClose?: () => void;
  }>();

  let transactions = $state<Transaction[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedTransaction = $state<Transaction | null>(null);

  function handleTransactionClick(transaction: Transaction) {
    selectedTransaction = transaction;
    onOpenModal();
  }

  function handleModalClose() {
    selectedTransaction = null;
    onModalClose();
  }

  function handleModalSave() {
    selectedTransaction = null;
    onModalClose();
    loadTransactions();
  }

  async function loadTransactions() {
    if (!property.id) return;

    loading = true;
    error = null;

    const { data, error: loadError } = await getPropertyTransactions(
      property.id,
    );

    if (loadError) {
      error = loadError.message;
      loading = false;
      return;
    }

    transactions = data ?? [];
    loading = false;
  }

  $effect(() => {
    loadTransactions();
  });
</script>

<div class="w-full p-4 md:p-6 lg:p-8 space-y-8" transition:fade>
  {#if loading}
    <div class="flex items-center justify-center h-32">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"
      ></div>
    </div>
  {:else if error}
    <div class="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>
  {:else}
    <div class="bg-card rounded-xl shadow-sm p-6">
      <div class="overflow-x-auto -mx-6">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-border">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left p-4 font-semibold text-foreground"
                    >Type</th
                  >
                  <th class="text-left p-4 font-semibold text-foreground"
                    >Start Date</th
                  >
                  <th
                    class="text-left p-4 font-semibold text-foreground hidden md:table-cell"
                    >End Date</th
                  >
                  <th
                    class="text-right p-4 font-semibold text-foreground hidden md:table-cell"
                    >Amount</th
                  >
                  <th
                    class="text-right p-4 font-semibold text-foreground hidden md:table-cell"
                    >Balance</th
                  >
                  <th class="text-left p-4 font-semibold text-foreground"
                    >Status</th
                  >
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                {#if transactions.length === 0}
                  <tr>
                    <td
                      colspan="6"
                      class="text-center p-8 text-muted-foreground"
                    >
                      No transactions found for this property.
                    </td>
                  </tr>
                {:else}
                  {#each transactions as transaction}
                    {#if transaction.description}
                      <tr
                        class="border-b bg-muted/50 cursor-pointer"
                        onclick={() => handleTransactionClick(transaction)}
                      >
                        <td
                          colspan="6"
                          class="p-4 text-sm text-muted-foreground"
                        >
                          {transaction.description}
                        </td>
                      </tr>
                    {/if}
                    <tr
                      class="border-b hover:bg-muted/50 cursor-pointer"
                      onclick={() => handleTransactionClick(transaction)}
                    >
                      <td
                        class="p-4 capitalize whitespace-nowrap text-foreground"
                        >{transaction.type}</td
                      >
                      <td class="p-4 whitespace-nowrap text-foreground"
                        >{formatDate(transaction.start_date)}</td
                      >
                      <td
                        class="p-4 whitespace-nowrap hidden md:table-cell text-foreground"
                      >
                        {transaction.end_date
                          ? formatDate(transaction.end_date)
                          : "-"}
                      </td>
                      <td
                        class="p-4 text-right whitespace-nowrap hidden md:table-cell text-foreground"
                      >
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td
                        class="p-4 text-right whitespace-nowrap hidden md:table-cell text-foreground"
                      >
                        {formatCurrency(transaction.balance)}
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <span
                          class={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            transaction.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
                                : transaction.status === "completed"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

{#if showTransactionModal}
  <TransactionModal
    propertyId={property.id || ""}
    existingTransaction={selectedTransaction ?? undefined}
    onClose={handleModalClose}
    onSave={handleModalSave}
    open={showTransactionModal}
  />
{/if}
