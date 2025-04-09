import { useState } from 'react';
import { useGetCategoriesQuery, useUpdateExpenseMutation } from '@/services/api';
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
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
import { ChevronDownIcon } from 'lucide-react';
import { toast } from "sonner";
import { Expense } from '@/types/expenses.types';

type Props = {
    expense: Expense;
};

const EditExpenseDialog = ({ expense }: Props) => {
    const [name, setName] = useState(expense.name);
    const [categoryName, setCategoryName] = useState(expense.categoryName); // Dropdown selection
    const [customCategoryName, setCustomCategoryName] = useState(''); // Custom input
    const [amount, setAmount] = useState(expense.amount.toString());
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [open, setOpen] = useState(false);

    // Track which fields have changed
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

    const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
    const [updateExpense, { isLoading: updateExpenseLoading }] = useUpdateExpenseMutation();

    const categories = categoriesData?.categories || [];

    const handleFieldChange = (field: 'name' | 'categoryName' | 'amount', value: string) => {
        const originalValue = field === 'amount' ? expense[field].toString() : expense[field];
        if (value !== originalValue) {
            setChangedFields((prev) => new Set(prev).add(field));
        } else {
            setChangedFields((prev) => {
                const newSet = new Set(prev);
                newSet.delete(field);
                return newSet;
            });
        }

        switch (field) {
            case 'name':
                setName(value);
                break;
            case 'categoryName':
                if (!isCustomCategory) setCategoryName(value);
                else setCustomCategoryName(value);
                break;
            case 'amount':
                setAmount(value);
                break;
        }
    };

    const handleSubmit = async () => {
        const amountInNumber = parseFloat(amount);
        if (amountInNumber < 0) {
            toast.error("Amount cannot be negative");
            return;
        }

        const updateData: { [key: string]: string | number } = {};
        if (changedFields.has('name')) updateData.name = name;
        updateData.categoryName = isCustomCategory ? customCategoryName : categoryName;
        // if (changedFields.has('categoryName')) {
        //     updateData.categoryName = isCustomCategory ? customCategoryName : categoryName;
        // }
        if (changedFields.has('amount')) updateData.amount = amountInNumber;

        if (Object.keys(updateData).length === 0) {
            toast.info("No changes to save");
            setOpen(false);
            return;
        }

        try {
            console.log(updateData, "updateData");
            await updateExpense({ id: expense._id, data: updateData }).unwrap();
            toast.success("Expense updated successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update expense");
            console.error('Failed to update expense:', error);
        }
    };

    const handleDialogChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset to original values when closing without saving
            setName(expense.name);
            setCategoryName(expense.categoryName);
            setCustomCategoryName('');
            setAmount(expense.amount.toString());
            setIsCustomCategory(false);
            setChangedFields(new Set());
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                </DialogHeader>

                {/* Form */}
                <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <Label htmlFor="name" className="mb-2">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
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
                                    onChange={(e) => handleFieldChange('categoryName', e.target.value)}
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
                                                    onClick={() => handleFieldChange('categoryName', category.name)}
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
                            onChange={(e) => handleFieldChange('amount', e.target.value)}
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            updateExpenseLoading ||
                            (!changedFields.has('name') && !changedFields.has('categoryName') && !changedFields.has('amount')) ||
                            !(isCustomCategory ? customCategoryName : categoryName) ||
                            !name ||
                            !amount
                        }
                    >
                        {updateExpenseLoading ? 'Updating...' : 'Update Expense'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditExpenseDialog;