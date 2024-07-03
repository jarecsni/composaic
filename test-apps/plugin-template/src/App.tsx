import './App.css';
// @ts-expect-error - resolution not working
import { DevContainer } from '@composaic/dev/DevContainer';
//import manifest from '../manifest.json' with { type: 'json' };

import('../manifest.json').then((manifest) => {
    console.log('manifest', manifest);
});

const loadModule = async (moduleName: string, pkg: string) => {
    const module = await import(`./plugins/${pkg}/${moduleName}.ts`);
    return module;
};

function App() {
    return <DevContainer manifest={{}} loadModule={loadModule} ></DevContainer >;
}

export default App;
