import { useGetCategoriesQuery } from '../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import CreateCategoryDialog from './components/CreateCategoryDialog';
import EditCategoryDialog from './components/EditCategoryDialog';
import { BugIcon, Loader2Icon, RabbitIcon } from 'lucide-react';
import DeleteCategoryDialog from './components/DeleteCategoryDialog';
import { Category } from '@/types/categories.type'


const Categories = () => {
    const { data, isLoading, error } = useGetCategoriesQuery();

    if (isLoading) {
        return (
            <div className="h-full w-full md:py-[60px] px-[24px] py-[18px] md:px-[100px] relative">
                <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4 mb-2">
                    <h4 className="text-lg md:text-2xl font-medium">Categories</h4>
                </div>
                <div className='flex flex-col mt-4 rounded-xl border-[1px] border-sidebar-border items-center justify-center w-ful h-[300px]'>
                    <Loader2Icon className='w-10 h-10 text-rose-400 animate-spin' />
                    <div className='text-lg font-medium mb-4'>Categories are loading..</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full py-[60px] px-[100px] relative">
                <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4">
                    <h4 className="text-lg md:text-2xl font-medium">Categories</h4>
                </div>
                <div className='flex flex-col mt-4 rounded-xl border-[1px] border-sidebar-border items-center justify-center w-ful h-[300px]'>
                    <BugIcon className='w-10 h-10 text-rose-400 animate-bounce' />
                    <div className='text-lg font-medium mb-4'>Oops! Mr. Bug is here</div>
                </div>
            </div>
        );
    }

    if (data?.categories.length === 0) {
        return (
            <div className="h-full w-full py-[60px] px-[100px] relative">
                <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4">
                    <h4 className="text-lg md:text-2xl font-medium">Categories</h4>
                </div>
                <div className="flex flex-col mt-4 rounded-xl border-[1px] border-sidebar-border items-center justify-center w-ful h-[300px]">
                    <RabbitIcon className="w-10 h-10 text-rose-400 animate-bounce" />
                    <div className="text-lg font-medium mb-4">No categories found</div>

                    <CreateCategoryDialog />
                </div>
            </div>
        );
    }

    const categories = data?.categories || [];
    const totalCategories = categories.length;

    return (
        <div className="h-full w-full md:py-[60px] px-[24px] py-[18px] md:px-[100px] relative">
            <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4">
                <h4 className="text-lg md:text-2xl font-medium">Categories</h4>
            </div>

            <div className="mt-4 flex flex-row items-center justify-between">
                <p>Total Categories: {totalCategories}</p>

                <CreateCategoryDialog />
            </div>

            <div className="mt-2 overflow-y-auto min-h-[220px] max-h-[600px]">
                <Table className="rounded-lg overflow-hidden">
                    <TableHeader>
                        <TableRow className="bg-rose-50 dark:bg-rose-500/10">
                            <TableHead>Name</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead className=''></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category: Category) => (
                            <TableRow key={category._id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
                                <TableCell className='flex items-center gap-2 '>
                                    <EditCategoryDialog
                                        category={category}
                                    />
                                    <DeleteCategoryDialog
                                        categoryId={category._id}
                                        categoryName={category.name}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* No Pagination, just a placeholder for future actions */}
            <div className="flex items-center justify-between mt-4 pb-[50px]">
                <div></div> {/* Placeholder for future CreateNew button */}
            </div>
        </div>
    );
};

export default Categories;