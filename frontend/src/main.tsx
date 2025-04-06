import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from './Dashboard.tsx';
import Expenses from './expenses/Expenses.tsx';
import Categories from './categories/Categories.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} >
                        <Route index element={<Expenses />} />
                        <Route path='categories' element={<Categories />} />
                        {/* <Route path="settings" element={<Settings />} /> */}
                    </Route>
                    {/* <Route path="/" element={<App />} /> */}
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
)
