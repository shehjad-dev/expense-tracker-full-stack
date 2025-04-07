import { useState } from 'react';
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
import { ChevronDownIcon, PencilIcon, TrashIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateNew from './components/CreateNew';
import EditExpense from './components/EditExpense';
import DeleteExpense from './components/DeleteExpense';

type Expense = {
    _id: string;
    categoryName: string;
    name: string;
    amount: number;
    isRecurring: boolean;
    recurringInterval?: string;
    nextRecurrenceDate: string;
    isOriginal: boolean;
    createdAt: string;
    updatedAt: string;
};

const Expenses = () => {
    const [page, setPage] = useState(1);
    const [dataType, setDataType] = useState<'summary' | 'daily'>('summary');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [expenseType, setExpenseType] = useState<'recurring' | 'non-recurring' | undefined>(undefined);
    const limit = 5;

    const { data, isLoading, error } = useGetExpensesQuery({ page, limit, sortBy, expenseType });

    if (isLoading) {
        return (
            <div className="h-full w-full py-[60px] px-[100px] relative">
                <h4 className="text-2xl font-medium">Expenses</h4>
                <div>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full py-[60px] px-[100px] relative">
                <h4 className="text-2xl font-medium">Expenses</h4>
                <div>Error loading expenses</div>
            </div>
        );
    }

    const expenses = data?.expenses || [];
    const currentPage = data?.currentPage || 1;
    const totalPages = data?.totalPages || 1;
    // const totalExpenses = data?.totalExpenses || 0;

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
        <div className="h-full w-full py-[60px] px-[100px] relative">
            <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4">
                <h4 className="text-2xl font-medium">Expenses</h4>
            </div>

            {/* Chart Section */}
            <ChartSection
                chartData={chartData}
                dataType={dataType}
                setDataType={setDataType}
            />

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
                                {expenseType ? (expenseType === 'recurring' ? 'Recurring' : 'Non-Recurring') : 'All'}
                                <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setExpenseType(undefined)}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setExpenseType('recurring')}>
                                Recurring
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setExpenseType('non-recurring')}>
                                Non-Recurring
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="mt-2 overflow-y-auto min-h-[220px] max-h-[600px]">
                <Table className="rounded-lg overflow-hidden">
                    <TableHeader>
                        <TableRow className="bg-rose-50 dark:bg-rose-500/10">
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead>Interval</TableHead>
                            <TableHead>Created At</TableHead>
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
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pb-[50px]">
                <CreateNew />
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
        </div>
    );
};

export default Expenses;