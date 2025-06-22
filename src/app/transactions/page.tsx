'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileDown } from 'lucide-react';
import { useTransactions } from '@/hooks/use-transactions';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TransactionForm } from '@/components/transaction-form';

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useTransactions();
  const { toast } = useToast();
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | undefined>();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({
      title: 'Transação excluída',
      description: 'A transação foi removida com sucesso.',
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsSheetOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingTransaction(undefined);
    setIsSheetOpen(true);
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Tipo', 'Valor', 'Categoria', 'Data', 'Recorrente', 'Notas'];
    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.amount,
      t.category,
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.isRecurring,
      t.notes || ''
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transacoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportado!', description: 'Suas transações foram exportadas para CSV.' });
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) setEditingTransaction(undefined);
       }}>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Transações</CardTitle>
              <CardDescription>
                Gerencie suas receitas e despesas.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 gap-1" onClick={exportToCSV}>
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Exportar
                </span>
              </Button>
              <SheetTrigger asChild>
                <Button size="sm" className="h-7 gap-1" onClick={handleAddNew}>
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Adicionar Transação
                  </span>
                </Button>
              </SheetTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria/Fonte</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge
                          variant={t.type === 'income' ? 'default' : 'secondary'}
                          className={
                            t.type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          }
                        >
                          {t.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{t.category}</TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          t.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(t.amount)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(t.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(t)}>
                              Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Excluir</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso irá deletar permanentemente a transação.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(t.id)}>
                                    Continuar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <SheetContent>
          <TransactionForm transaction={editingTransaction} closeSheet={() => setIsSheetOpen(false)} />
        </SheetContent>
       </Sheet>
    </div>
  );
}
