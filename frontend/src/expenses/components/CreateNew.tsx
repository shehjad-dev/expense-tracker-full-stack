import { useState } from 'react';
import { useGetCategoriesQuery, useAddExpenseMutation } from '@/services/api';
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDownIcon } from 'lucide-react';
import { toast } from "sonner";

const CreateNew = () => {
    const [name, setName] = useState('');
    const [categoryName, setCategoryName] = useState(''); // For dropdown selection
    const [customCategoryName, setCustomCategoryName] = useState(''); // For custom input
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState<boolean>(false);
    const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly' | undefined>(undefined);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [open, setOpen] = useState(false);

    const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
    const [addExpense, { isLoading: addExpenseLoading }] = useAddExpenseMutation();

    const categories = categoriesData?.categories || [];

    const handleSubmit = async () => {
        const amountInNumber = parseFloat(amount);
        if (amountInNumber < 0) {
            toast.error("Amount cannot be negative");
            return;
        }
        const expenseData: {
            name: string;
            categoryName: string;
            amount: number;
            isRecurring: boolean;
            recurringInterval?: 'daily' | 'weekly' | 'monthly';
        } = {
            name,
            categoryName: isCustomCategory ? customCategoryName : categoryName,
            amount: amountInNumber,
            isRecurring,
        };
        if (isRecurring && recurringInterval) {
            expenseData.recurringInterval = recurringInterval;
        }

        try {
            await addExpense(expenseData).unwrap();
            resetForm();
            setOpen(false);
            toast.success("Expense added successfully");
        } catch (error) {
            toast.error("Failed to add expense");
            console.error('Failed to add expense:', error);
        }
    };

    const resetForm = () => {
        setName('');
        setCategoryName('');
        setCustomCategoryName(''); // Reset custom category too
        setAmount('');
        setIsRecurring(false);
        setRecurringInterval(undefined);
        setIsCustomCategory(false);
    };

    const handleDialogChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            resetForm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="w-6 h-6" />
                    <span className="ml-2">Add Expense</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Create New Expense</DialogTitle>
                </DialogHeader>

                {/* Form */}
                <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <Label htmlFor="name" className="mb-2">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter expense name"
                        />
                    </div>

                    {/* Category Selection */}
                    <div className="flex items-end gap-2">
                        {isCustomCategory ? (
                            <div className="flex-1">
                                <Label htmlFor="customCategory" className="mb-2">Category</Label>
                                <Input
                                    id="customCategory"
                                    value={customCategoryName}
                                    onChange={(e) => setCustomCategoryName(e.target.value)}
                                    placeholder="Enter custom category"
                                />
                            </div>
                        ) : (
                            <div className="flex-1">
                                <Label htmlFor="category" className="mb-2">Category</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {categoryName || 'Select a category'}
                                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="max-h-[200px] overflow-y-auto">
                                        {categoriesLoading ? (
                                            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                                        ) : (
                                            categories.map((category) => (
                                                <DropdownMenuItem
                                                    key={category._id}
                                                    onClick={() => setCategoryName(category.name)}
                                                >
                                                    {category.name}
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setIsCustomCategory(!isCustomCategory)}
                        >
                            {isCustomCategory ? 'Use Existing' : 'Add New Category'}
                        </Button>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <Label htmlFor="amount" className="mb-2">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Recurring Radio Group */}
                    <div>
                        <Label className="mb-2">
                            Recurring? <span className="font-normal">{'(will this expense be happening at a regular interval)'}</span>
                        </Label>
                        <RadioGroup
                            value={isRecurring ? 'recurring' : 'non-recurring'}
                            onValueChange={(value) => setIsRecurring(value === 'recurring')}
                            className="flex gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="recurring" id="recurring" />
                                <Label htmlFor="recurring">Recurring</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="non-recurring" id="non-recurring" />
                                <Label htmlFor="non-recurring">Non-Recurring</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Recurring Interval Dropdown (Conditional) */}
                    {isRecurring && (
                        <div>
                            <Label htmlFor="recurringInterval" className="mb-2">Recurring Interval</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {recurringInterval || 'Select interval'}
                                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setRecurringInterval('daily')}>
                                        Daily
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setRecurringInterval('weekly')}>
                                        Weekly
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setRecurringInterval('monthly')}>
                                        Monthly
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            addExpenseLoading ||
                            !name ||
                            !(isCustomCategory ? customCategoryName : categoryName) || // Check appropriate category field
                            !amount ||
                            (isRecurring && !recurringInterval)
                        }
                    >
                        {addExpenseLoading ? 'Adding...' : 'Add Expense'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateNew;