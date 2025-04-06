import { cn } from '@/lib/utils'
import { BanknoteArrowUpIcon, ListFilterIcon, WalletIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useLocation } from 'react-router'

type Props = {}

const menuItems = [
    {
        name: 'Expenses',
        icon: <BanknoteArrowUpIcon className='w-6 h-6' />,
        link: '/',
    },
    {
        name: 'Categories',
        icon: <ListFilterIcon className='w-6 h-6' />,
        link: '/categories',
    }
]

const Sidebar = (props: Props) => {
    const [activeLink, setActiveLink] = useState('');
    const currentPath = useLocation().pathname;

    useEffect(() => {
        setActiveLink(currentPath);
    }, [currentPath])

    console.log(currentPath);

    return (
        <div className='w-1/6 bg-sidebar border-r-[1px] shadow-foreground/15 h-full py-6 px-8'>
            <div className='flex items-center gap-2 p-2 mb-6 '>
                <WalletIcon className='w-6 h-6 text-rose-400' />
                <h3 className='text-lg font-medium'>ExpTracker</h3>
            </div>


            <div className='space-y-2'>
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.link}
                        className={cn(
                            'flex items-center gap-2 p-2 hover:bg-sidebar-accent rounded-lg border-[1px]',
                            activeLink === item.link ? 'bg-sidebar-accent border-sidebar-border' : 'border-transparent'
                        )}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>

        </div>
    )
}

export default Sidebar