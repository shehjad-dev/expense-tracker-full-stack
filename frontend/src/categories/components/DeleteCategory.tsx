import { useState } from 'react';
import { useDeleteCategoryMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';


type Props = {
    categoryId: string;
    categoryName: string;
};

const DeleteCategory = ({ categoryId, categoryName }: Props) => {
    const [open, setOpen] = useState(false);
    const [deleteCategory, { isLoading: deleteCategoryLoading }] = useDeleteCategoryMutation();

    const handleDelete = async () => {
        try {
            await deleteCategory(categoryId).unwrap();
            toast.success("Category deleted successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to delete category");
            console.error('Failed to delete category:', error);
        }
    };

    const handleDialogChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2Icon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>Do you really want to delete the category "<strong>{categoryName}</strong>"? This action cannot be undone.</p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={deleteCategoryLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteCategoryLoading}
                    >
                        {deleteCategoryLoading ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteCategory;