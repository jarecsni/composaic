
// @ts-expect-error - resolution not working
import { DevContainer } from '@composaic/dev/DevContainer';

const loadModule = async (moduleName: string, pkg: string) => {
    const module = await import(`./plugins/${pkg}/${moduleName}.ts`);
    return module;
};

function App() {
    return <DevContainer loadModule={loadModule}></DevContainer>;
}

export default App;
