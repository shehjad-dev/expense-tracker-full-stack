import { useState } from 'react';
import { useUpdateCategoryMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Category = {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

type Props = {
    category: Category;
};

const EditCategory = ({ category }: Props) => {
    const [name, setName] = useState(category.name);
    const [open, setOpen] = useState(false);
    const [updateCategory, { isLoading: updateCategoryLoading }] = useUpdateCategoryMutation();

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Category name cannot be empty");
            return;
        }

        if (name === category.name) {
            toast.info("No changes to save");
            setOpen(false);
            return;
        }

        try {
            await updateCategory({ id: category._id, data: { name } }).unwrap();
            toast.success("Category updated successfully");
            setOpen(false);
        } catch (error: any) {
            if (error?.data?.statusCode === 404) {
                toast.error("Category not found");
            } else if (error?.data?.statusCode === 409) {
                toast.error("A category with this name already exists");
            } else {
                toast.error("Failed to update category");
                console.error('Failed to update category:', error);
            }
        }
    };

    const handleDialogChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setName(category.name); // Reset to original name when closing
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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="categoryName" className="mb-2">Category Name</Label>
                        <Input
                            id="categoryName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter category name"
                            disabled={updateCategoryLoading}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={updateCategoryLoading || !name.trim()}
                    >
                        {updateCategoryLoading ? 'Updating...' : 'Update Category'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategory;