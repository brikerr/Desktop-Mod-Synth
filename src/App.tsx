import { Toolbar } from './components/Toolbar.tsx';
import { Rack } from './components/Rack.tsx';
import { Keyboard } from './components/Keyboard.tsx';
import ToastContainer from './components/hints/ToastNotification.tsx';

export default function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <Toolbar />
      <Rack />
      <Keyboard />
      <ToastContainer />
    </div>
  );
}
