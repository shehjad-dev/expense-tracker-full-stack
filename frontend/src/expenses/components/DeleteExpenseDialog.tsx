import { useState } from 'react';
import { useDeleteExpenseMutation } from '@/services/api';
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from "sonner";

type Props = {
    expenseId: string;
    expenseName: string;
};

const DeleteExpenseDialog = ({ expenseId, expenseName }: Props) => {
    const [open, setOpen] = useState(false);
    const [deleteExpense, { isLoading: deleteExpenseLoading }] = useDeleteExpenseMutation();

    const handleDelete = async () => {
        try {
            await deleteExpense(expenseId).unwrap();
            toast.success("Expense deleted successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to delete expense");
            console.error('Failed to delete expense:', error);
        }
    };

    const handleDialogChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <TrashIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>Do you really want to delete the expense "<strong>{expenseName}</strong>"? This action cannot be undone.</p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={deleteExpenseLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteExpenseLoading}
                    >
                        {deleteExpenseLoading ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteExpenseDialog;