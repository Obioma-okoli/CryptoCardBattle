import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set title
document.title = "CryptoCards - Ethereum Card Betting Game";

createRoot(document.getElementById("root")!).render(<App />);
