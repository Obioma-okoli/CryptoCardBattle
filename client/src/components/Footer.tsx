export default function Footer() {
  return (
    <footer className="bg-card border-t border-gray-700 py-6 px-6 text-muted-foreground">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© {new Date().getFullYear()} CryptoCards - Ethereum Betting Game</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Game Rules</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">Smart Contract</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
