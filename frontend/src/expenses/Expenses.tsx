import { useEffect, useState } from 'react';
import { useGetExpensesQuery } from '../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ChartSection from './components/ChartSection';
import { BugIcon, ChevronDownIcon, Loader2Icon, RabbitIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateExpense from './components/CreateExpense';
import EditExpense from './components/EditExpense';
import DeleteExpense from './components/DeleteExpense';
import {
    DEFAULT_CHART_DATA_TYPE,
    DEFAULT_SORT_BY,
    DEFAULT_EXPENSES_LIMIT_PER_PAGE,
    DEFAULT_PAGE_NO
} from '../constants'
import { Expense } from '@/types/expenses.types';

const Expenses = () => {
    const [page, setPage] = useState(DEFAULT_PAGE_NO);
    const [dataType, setDataType] = useState<'summary' | 'daily'>(DEFAULT_CHART_DATA_TYPE);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>(DEFAULT_SORT_BY);
    const [expenseType, setExpenseType] = useState<'recurring' | 'non-recurring' | undefined>(undefined);
    const [clientExpenseType, setClientExpenseType] = useState<'recurring' | 'non-recurring' | undefined>(undefined);
    const limit = DEFAULT_EXPENSES_LIMIT_PER_PAGE;

    useEffect(() => {
        setPage(1);
        setExpenseType(clientExpenseType);
    }, [clientExpenseType]);

    const { data, isLoading, error } = useGetExpensesQuery({ page, limit, sortBy, expenseType });

    if (isLoading) {
        return (
            <div className="h-full w-full md:py-[60px] px-[24px] py-[18px] md:px-[100px] relative">
                <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4 mb-2">
                    <h4 className="text-lg md:text-2xl font-medium">Expenses</h4>
                </div>
                <div className='flex flex-col mt-4 rounded-xl border-[1px] border-sidebar-border items-center justify-center w-ful h-[300px]'>
                    <Loader2Icon className='w-10 h-10 text-rose-400 animate-spin' />
                    <div className='text-lg font-medium mb-4'>Expenses are loading..</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full py-[60px] px-[100px] relative">
                <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4">
                    <h4 className="text-lg md:text-2xl font-medium">Expenses</h4>
                </div>
                <div className='flex flex-col mt-4 rounded-xl border-[1px] border-sidebar-border items-center justify-center w-ful h-[300px]'>
                    <BugIcon className='w-10 h-10 text-rose-400 animate-bounce' />
                    <div className='text-lg font-medium mb-4'>Oops! Mr. Bug is here</div>
                </div>
            </div>
        );
    }

    const expenses = data?.expenses || [];
    const currentPage = data?.paginationMeta?.currentPage || 1;
    const totalPages = data?.paginationMeta?.totalPages || 1;

    // Aggregate data based on dataType
    const chartData = dataType === 'summary'
        ? expenses.reduce((acc, expense) => {
            const existing = acc.find((item) => item.category === expense.categoryName);
            if (existing) {
                existing.amount += expense.amount;
            } else {
                acc.push({ category: expense.categoryName, amount: expense.amount });
            }
            return acc;
        }, [] as { category: string; amount: number }[])
        : expenses.reduce((acc, expense) => {
            const date = new Date(expense.createdAt).toLocaleDateString();
            const existing = acc.find((item) => item.date === date);
            if (existing) {
                existing.amount += expense.amount;
            } else {
                acc.push({ date, amount: expense.amount });
            }
            return acc;
        }, [] as { date: string; amount: number }[]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setPage((prev) => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <div className="h-full w-full md:py-[60px] px-[24px] py-[18px] md:px-[100px] relative">
            <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4 mb-2">
                <h4 className="text-lg md:text-2xl font-medium">Expenses</h4>
            </div>

            {/* Chart Section */}
            {expenses.length > 0 && (
                <ChartSection
                    chartData={chartData}
                    dataType={dataType}
                    setDataType={setDataType}
                />
            )}


            {/* Filters and Table Section */}
            <div className='mt-4 flex flex-row items-center justify-between'>
                {/* {totalExpenses && <p>Expenses Count: {totalExpenses}</p>} */}
                <div className="flex gap-2 w-fit ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                {sortBy === 'newest' ? 'Newest' : 'Oldest'}
                                <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSortBy('newest')}>
                                Newest
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                                Oldest
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                {clientExpenseType ? (clientExpenseType === 'recurring' ? 'Recurring' : 'Non-Recurring') : 'All'}
                                <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setClientExpenseType(undefined)}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setClientExpenseType('recurring')}>
                                Recurring
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setClientExpenseType('non-recurring')}>
                                Non-Recurring
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>


            <div className="mt-2 overflow-y-auto min-h-[220px] max-h-[600px]">
                {
                    expenses.length > 0 ? (
                        <Table className="rounded-lg overflow-hidden">
                            <TableHeader>
                                <TableRow className="bg-rose-50 dark:bg-rose-500/10">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Recurring</TableHead>
                                    <TableHead>Interval</TableHead>
                                    <TableHead>Created At {`(MM/DD/YYYY)`}</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense: Expense) => (
                                    <TableRow key={expense._id}>
                                        <TableCell className="font-medium">{expense.name}</TableCell>
                                        <TableCell>{expense.categoryName}</TableCell>
                                        <TableCell>${expense.amount}</TableCell>
                                        <TableCell>{expense.isRecurring ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{expense.isRecurring ? expense.recurringInterval || '-' : '-'}</TableCell>
                                        <TableCell>{new Date(expense.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className='flex items-center gap-2'>
                                            <EditExpense expense={expense} />
                                            <DeleteExpense
                                                expenseId={expense._id}
                                                expenseName={expense.name}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className='flex flex-col mt-4 rounded-xl border-[1px] border-sidebar-border items-center justify-center w-ful h-[300px]'>
                            <RabbitIcon className='w-10 h-10 text-rose-400 animate-bounce' />
                            <div className='text-lg font-medium mb-4'>No expenses found</div>

                            <CreateExpense />
                        </div>
                    )
                }

            </div>

            {/* Pagination */}
            {expenses.length > 0 && (
                <div className="flex md:flex-row flex-col-reverse gap-2 items-center justify-between mt-4 pb-[50px]">
                    <CreateExpense />
                    <div className="w-fit gap-3 flex items-center">
                        <Button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            Previous
                        </Button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            variant="outline"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Expenses;