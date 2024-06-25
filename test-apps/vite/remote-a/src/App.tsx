import './App.css'
import { sayHello } from './util/say-hello'

function App() {
    return (
        <>
            <h1>This is Remote A!</h1>
            <p>{sayHello()}</p>
        </>
    )
}

export default App
