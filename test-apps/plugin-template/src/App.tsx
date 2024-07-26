import { DevContainer } from 'composaic';

const loadModule = async (moduleName: string, pkg: string) => {
    const module = await import(`./plugins/${pkg}/${moduleName}.ts`);
    return module;
};

function App() {
    return <DevContainer loadModule={loadModule}></DevContainer>;
}

export default App;
