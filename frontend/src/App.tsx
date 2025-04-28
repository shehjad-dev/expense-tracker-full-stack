import "./App.css";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/ui/mode-toggle";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Button>Click me</Button>
        <ModeToggle />
      </div>
    </ThemeProvider>
  );
}

export default App;
