export type TransactionData = {
  amount_paise: number;
  type: string;
  visibility: string;
  user_id: string;
  categories: { name: string } | { name: string }[] | null;
};

export function calculateTransactionsSummary(
  transactions: TransactionData[] | null,
  currentUserId: string
) {
  let totalIncomePaise = 0;
  let totalExpensePaise = 0;
  const categorySpending: Record<string, number> = {};

  if (transactions) {
    transactions.forEach((txn) => {
      // Filter out personal transactions not owned by user
      if (txn.visibility === 'personal' && txn.user_id !== currentUserId) return;

      if (txn.type === 'income') {
        totalIncomePaise += txn.amount_paise;
      } else {
        totalExpensePaise += txn.amount_paise;
        const catObj = Array.isArray(txn.categories) ? txn.categories[0] : txn.categories;
        const catName = catObj?.name || 'Uncategorized';
        categorySpending[catName] = (categorySpending[catName] || 0) + txn.amount_paise;
      }
    });
  }

  return { totalIncomePaise, totalExpensePaise, categorySpending };
}

export function calculateBudgetRemaining(totalBudgetPaise: number, totalExpensePaise: number) {
  return Math.max(0, totalBudgetPaise - totalExpensePaise);
}

export function calculateSpentPercentage(totalBudgetPaise: number, totalExpensePaise: number) {
  return totalBudgetPaise > 0 ? Math.min(100, (totalExpensePaise / totalBudgetPaise) * 100) : 0;
}

export function getTopCategories(categorySpending: Record<string, number>, limit: number = 5) {
  return Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

// Bill calculation logic based on recurring_bills schema
export function calculateNextOccurrence(currentDate: string, frequency: string): string {
  const date = new Date(currentDate);
  if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (frequency === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  }
  return date.toISOString().split('T')[0];
}

export function calculateSavingsProgress(currentAmount: number, targetAmount: number) {
  if (targetAmount <= 0) return 0;
  return Math.min(100, (currentAmount / targetAmount) * 100);
}

export function validateAmount(amountStr: string) {
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return false;
  return true;
}
