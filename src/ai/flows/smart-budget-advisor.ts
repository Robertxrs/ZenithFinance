// src/ai/flows/smart-budget-advisor.ts
'use server';

/**
 * @fileOverview An AI agent that analyzes spending habits and suggests personalized budget optimizations and savings opportunities.
 *
 * - smartBudgetAdvisor - A function that handles the budget optimization process.
 * - SmartBudgetAdvisorInput - The input type for the smartBudgetAdvisor function.
 * - SmartBudgetAdvisorOutput - The return type for the smartBudgetAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartBudgetAdvisorInputSchema = z.object({
  income: z
    .number()
    .describe('The total income of the user for the given period.'),
  expenses: z.array(
    z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount spent on the expense.'),
    })
  ).describe('An array of expenses with their categories and amounts.'),
  goals: z.string().describe('The financial goals of the user.'),
  timePeriod: z.string().describe('The time period for the analysis (e.g., monthly, yearly).'),
});
export type SmartBudgetAdvisorInput = z.infer<typeof SmartBudgetAdvisorInputSchema>;

const SmartBudgetAdvisorOutputSchema = z.object({
  analysis: z.string().describe('An analysis of the user\'s spending habits.'),
  suggestions: z.array(
    z.string().describe('Personalized budget optimization and savings suggestions.')
  ).describe('A list of budget optimization and savings suggestions.'),
});
export type SmartBudgetAdvisorOutput = z.infer<typeof SmartBudgetAdvisorOutputSchema>;

export async function smartBudgetAdvisor(input: SmartBudgetAdvisorInput): Promise<SmartBudgetAdvisorOutput> {
  return smartBudgetAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartBudgetAdvisorPrompt',
  input: {schema: SmartBudgetAdvisorInputSchema},
  output: {schema: SmartBudgetAdvisorOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending habits and suggest personalized budget optimizations and savings opportunities based on their financial goals.

User's Financial Goals: {{{goals}}}
Time Period: {{{timePeriod}}}
Total Income: {{{income}}}
Expenses:
{{#each expenses}}
- Category: {{{category}}}, Amount: {{{amount}}}
{{/each}}

Based on this information, provide an analysis of the user's spending habits and a list of personalized budget optimization and savings suggestions.

Analysis:
{{analysis}}

Suggestions:
{{#each suggestions}}
- {{{this}}}
{{/each}}`,
});

const smartBudgetAdvisorFlow = ai.defineFlow(
  {
    name: 'smartBudgetAdvisorFlow',
    inputSchema: SmartBudgetAdvisorInputSchema,
    outputSchema: SmartBudgetAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
