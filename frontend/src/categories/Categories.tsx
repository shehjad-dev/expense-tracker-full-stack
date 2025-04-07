import { useGetCategoriesQuery } from '../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CreateCategory from './components/CreateCategory';
import EditCategory from './components/EditCategory';
import { Delete } from 'lucide-react';
import DeleteCategory from './components/DeleteCategory';

type Category = {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

const Categories = () => {
    const { data, isLoading, error } = useGetCategoriesQuery();

    if (isLoading) {
        return (
            <div className="h-full w-full py-[60px] px-[100px] relative">
                <h4 className="text-2xl font-medium">Categories</h4>
                <div>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full py-[60px] px-[100px] relative">
                <h4 className="text-2xl font-medium">Categories</h4>
                <div>Error loading categories</div>
            </div>
        );
    }

    const categories = data?.categories || [];
    const totalCategories = categories.length;

    return (
        <div className="h-full w-full py-[60px] px-[100px] relative">
            <div className="flex justify-between items-center gap-4 sticky top-0 bg-background z-10 py-4">
                <h4 className="text-2xl font-medium">Categories</h4>
            </div>

            <div className="mt-4 flex flex-row items-center justify-between">
                <p>Total Categories: {totalCategories}</p>

                <CreateCategory />
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
                                    <EditCategory
                                        category={category}
                                    />
                                    <DeleteCategory
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