import BottomNav from './BottomNav';
import LoginModal from './LoginModal';

export default function PageShell({ children }) {
  return (
    <div className="app-shell page-transition-in">
      <a href="#main" className="skip-link">Skip to content</a>
      {children}
      <BottomNav />
      <LoginModal />
    </div>
  );
}
