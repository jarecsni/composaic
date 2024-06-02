import './App.css';
// @ts-expect-error: alias resolution not working in VSC
import DevContainer from '@composaic/dev/DevContainer';

function App() {
    return <DevContainer></DevContainer>
}

export default App
