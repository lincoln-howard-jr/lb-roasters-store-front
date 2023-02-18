import { useApp } from "./AppProvider"
import { Header } from "./components/Header";
import { AboutPage } from "./pages/AboutPage";
import { CoffeesPage } from "./pages/CoffeesPage";
import { Customize } from "./pages/Customize";

export default function App() {
  const app = useApp ();
  return (
    <>
      <Header />
      <CoffeesPage />
      <AboutPage />
      <Customize />
    </>
  )
}