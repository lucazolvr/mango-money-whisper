
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, Search, Filter, Loader2, Building2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import AddTransactionForm from './AddTransactionForm';

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  const { transactions, loading: transactionsLoading } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.tipo === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.categoria === filterCategory;
    const matchesSource = filterSource === 'all' || 
      (filterSource === 'manual' && !transaction.isBankTransaction) ||
      (filterSource === 'bank' && transaction.isBankTransaction);
    
    return matchesSearch && matchesType && matchesCategory && matchesSource;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  const bankTransactionsCount = transactions.filter(t => t.isBankTransaction).length;
  const manualTransactionsCount = transactions.filter(t => !t.isBankTransaction).length;

  if (transactionsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mango-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-mango-900">Transações</h1>
          <p className="text-mango-600 mt-1">
            {manualTransactionsCount} manuais + {bankTransactionsCount} bancárias
          </p>
        </div>
        <AddTransactionForm />
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total de Receitas</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total de Gastos</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-mango-200 bg-mango-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mango-700">Saldo Líquido</CardTitle>
            <Filter className="h-4 w-4 text-mango-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              R$ {(totalIncome - totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900">Filtrar Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-mango-200 focus:border-mango-500"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 border-mango-200">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Gastos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full md:w-48 border-mango-200">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="manual">Manuais</SelectItem>
                <SelectItem value="bank">Bancárias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48 border-mango-200">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.nome}>{category.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900">
            Histórico ({filteredTransactions.length} transações)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma transação encontrada.</p>
              <p className="text-sm mt-2">Experimente ajustar os filtros ou adicionar novas transações.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.tipo === 'receita' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.tipo === 'receita' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{transaction.descricao}</p>
                        {transaction.isBankTransaction && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Building2 className="h-3 w-3 mr-1" />
                            Bancária
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {transaction.categoria}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(transaction.data).toLocaleDateString('pt-BR')}
                        </span>
                        {transaction.isBankTransaction && transaction.accountName && (
                          <span className="text-xs text-blue-600">
                            {transaction.accountName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.tipo === 'receita' ? '+' : ''}R$ {Math.abs(transaction.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
