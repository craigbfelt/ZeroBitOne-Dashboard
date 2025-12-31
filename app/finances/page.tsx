import { createClient } from "@/lib/supabase/server";
import type { FinanceAccount, FinanceTransaction } from "@/lib/types";

export default async function FinancesPage() {
  const supabase = createClient();
  
  // Check if user has access to a personal tenant
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .eq('is_personal', true);

  if (!tenants || tenants.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Finances</h2>
          <p className="mt-2 text-gray-600">
            Personal financial tracking (personal tenant only)
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Finances are only available for personal tenants. Please switch to your personal tenant to access this feature.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: accounts, error: accountsError } = await supabase
    .from('finance_accounts')
    .select('*')
    .order('name');

  const { data: transactions, error: transactionsError } = await supabase
    .from('finance_transactions')
    .select(`
      *,
      finance_accounts(name)
    `)
    .order('date', { ascending: false })
    .limit(20);

  const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0) || 0;
  const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
  const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Finances</h2>
          <p className="mt-2 text-gray-600">
            Personal financial tracking
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            New Account
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            New Transaction
          </button>
        </div>
      </div>

      {(accountsError || transactionsError) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
            Error loading financial data. Please check your Supabase configuration.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Balance</h3>
          <p className="text-3xl font-bold text-blue-600">${totalBalance.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Across all accounts</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Income</h3>
          <p className="text-3xl font-bold text-green-600">${income.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Recent transactions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses</h3>
          <p className="text-3xl font-bold text-red-600">${expenses.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Recent transactions</p>
        </div>
      </div>

      {/* Accounts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Accounts</h3>
        </div>
        <div className="p-6">
          {accounts && accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account: FinanceAccount) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{account.name}</h4>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                      {account.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${parseFloat(account.balance.toString()).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{account.currency}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No accounts found. Create your first account to get started.
            </p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.finance_accounts?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${parseFloat(transaction.amount.toString()).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No transactions found. Add your first transaction to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
