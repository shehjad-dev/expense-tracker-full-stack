import { useState } from 'react';
import { useCreateCategoryMutation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
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

const CreateCategoryDialog = () => {
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const [createCategory, { isLoading: createCategoryLoading }] = useCreateCategoryMutation();

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Category name cannot be empty");
            return;
        }

        try {
            await createCategory({ name }).unwrap();
            toast.success("Category created successfully");
            setName('');
            setOpen(false);
        } catch (error: any) {
            if (error?.data?.statusCode === 409) {
                toast.error("Cannot create duplicate category");
            } else {
                toast.error("Failed to create category");
                console.error('Failed to create category:', error);
            }
        }
    };

    const handleDialogChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setName(''); // Reset input when closing
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="h-4 w-4" />
                    Create New
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="categoryName" className="mb-2">Category Name</Label>
                        <Input
                            id="categoryName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter category name"
                            disabled={createCategoryLoading}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={createCategoryLoading || !name.trim()}
                    >
                        {createCategoryLoading ? 'Creating...' : 'Create Category'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCategoryDialog;