import { cn } from '@/lib/utils'
import { BanknoteArrowUpIcon, ListFilterIcon, MenuIcon, WalletIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useLocation } from 'react-router'
import { Button } from './ui/button'

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

const Sidebar = () => {
    const [activeLink, setActiveLink] = useState<string>('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const currentPath = useLocation().pathname;

    useEffect(() => {
        setActiveLink(currentPath);
    }, [currentPath])

    console.log(currentPath);

    return (
        <div className='w-full md:w-1/6 flex flex-row md:flex-col md:justify-start justify-between bg-sidebar border-r-[1px] shadow-foreground/15 h-[50px] md:h-full md:py-6 px-2 py-2 md:px-8'>
            <div className='flex items-center gap-2 p-2 mb-0 md:mb-6 '>
                <WalletIcon className='w-4 md:w-6 h-4 md:h-6 text-rose-400' />
                <h3 className='text-base md:text-lg font-medium'>ExpTracker</h3>
            </div>

            <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant='ghost'
                className='md:hidden inline-flex cursor-pointer'
            >
                <MenuIcon className='w-6 h-6' />
            </Button>



            <div className={cn(
                'space-y-2 md:flex flex-col',
                isMobileMenuOpen ? 'block animate-in absolute top-[50px] right-0 left-0 z-50 bg-sidebar p-4 rounded-b-xl' : 'hidden'
            )}>
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.link}
                        className={cn(
                            'flex items-center md:gap-2 gap-4 p-2 hover:bg-sidebar-accent rounded-lg border-[1px]',
                            activeLink === item.link ? 'bg-sidebar-accent border-sidebar-border' : 'border-transparent'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className='w-[16px] md:w-[24px]'>
                            {item.icon}
                        </span>
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>

        </div>
    )
}

export default Sidebar