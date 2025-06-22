'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { useTransactions } from '@/hooks/use-transactions';
import { Transaction, expenseCategories, incomeSources } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('O valor deve ser positivo.'),
  category: z.string().min(1, 'Selecione uma categoria.'),
  date: z.date(),
  isRecurring: z.boolean(),
  notes: z.string().optional(),
});

type TransactionFormProps = {
  transaction?: Transaction;
  closeSheet: () => void;
};

export function TransactionForm({
  transaction,
  closeSheet,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount || 0,
      category: transaction?.category || '',
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      isRecurring: transaction?.isRecurring || false,
      notes: transaction?.notes || '',
    },
  });

  const transactionType = form.watch('type');

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTransaction: Omit<Transaction, 'id'> = {
      ...values,
      amount: Number(values.amount),
    };

    if (transaction) {
      updateTransaction({ ...newTransaction, id: transaction.id });
      toast({ title: 'Sucesso!', description: 'Transação atualizada.' });
    } else {
      addTransaction(newTransaction);
      toast({ title: 'Sucesso!', description: 'Transação adicionada.' });
    }
    closeSheet();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{transaction ? 'Editar' : 'Adicionar'} Transação</SheetTitle>
        <SheetDescription>
          Preencha os detalhes da sua transação.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Transação</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="expense" />
                      </FormControl>
                      <FormLabel className="font-normal">Despesa</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="income" />
                      </FormControl>
                      <FormLabel className="font-normal">Receita</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="R$ 0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {transactionType === 'expense' ? 'Categoria' : 'Fonte'}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione uma ${transactionType === 'expense' ? 'categoria' : 'fonte'}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(transactionType === 'expense'
                      ? expenseCategories
                      : incomeSources
                    ).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Transação</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="space-y-3">
                 <FormLabel>Recorrência</FormLabel>
                 <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={String(field.value)}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="false" />
                      </FormControl>
                      <FormLabel className="font-normal">Única</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="true" />
                      </FormControl>
                      <FormLabel className="font-normal">Mensal</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea placeholder="Adicione uma nota (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {transaction ? 'Salvar Alterações' : 'Adicionar Transação'}
          </Button>
        </form>
      </Form>
    </>
  );
}
