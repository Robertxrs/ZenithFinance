'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { smartBudgetAdvisor, SmartBudgetAdvisorOutput } from '@/ai/flows/smart-budget-advisor';
import { useTransactions } from '@/hooks/use-transactions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, ListChecks, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const advisorSchema = z.object({
  goals: z.string().min(10, { message: 'Por favor, descreva seus objetivos com mais detalhes.' }),
});

export default function AdvisorPage() {
  const { transactions } = useTransactions();
  const [result, setResult] = useState<SmartBudgetAdvisorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof advisorSchema>>({
    resolver: zodResolver(advisorSchema),
    defaultValues: {
      goals: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof advisorSchema>) => {
    setIsLoading(true);
    setResult(null);

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .map((t) => ({ category: t.category, amount: t.amount }));

    if(expenses.length === 0 || income === 0) {
      toast({
        variant: "destructive",
        title: "Dados insuficientes",
        description: "Adicione algumas receitas e despesas para obter uma análise.",
      });
      setIsLoading(false);
      return;
    }


    try {
      const advice = await smartBudgetAdvisor({
        income,
        expenses,
        goals: values.goals,
        timePeriod: 'mensal',
      });
      setResult(advice);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar conselho",
        description: "Ocorreu um erro ao se comunicar com o serviço de IA. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Consultor Financeiro Inteligente</CardTitle>
          <CardDescription>
            Receba conselhos personalizados de nossa IA para otimizar seu orçamento e atingir seus objetivos financeiros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quais são seus objetivos financeiros?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Quero economizar para dar entrada em um imóvel, quitar dívidas e começar a investir para a aposentadoria."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Obter Conselho'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className='flex-row items-center gap-4 space-y-0'>
              <div className="rounded-full bg-primary/10 p-3 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Análise dos seus Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.analysis}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex-row items-center gap-4 space-y-0'>
              <div className="rounded-full bg-accent/10 p-3 flex items-center justify-center">
                <ListChecks className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Sugestões</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
