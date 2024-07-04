import { useEffect, useState } from 'react';
import './App.css';
// @ts-expect-error - resolution not working
import { DevContainer } from '@composaic/dev/DevContainer';
//import manifest from '../manifest.json' with { type: 'json' };

//console.log('manifest', manifest);

// import('../manifest.json').then((manifest) => {
//     console.log('manifest', manifest);
// });

// import('../manifest.json')
//     .then((json) => {
//         console.log('manifest', json.default);
//     })
//     .catch((error) => console.error('Failed to load manifest:', error));


const loadModule = async (moduleName: string, pkg: string) => {
    const module = await import(`./plugins/${pkg}/${moduleName}.ts`);
    return module;
};

function App() {
    // const [manifest, setManifest] = useState({});
    // useEffect(() => {
    //     fetch('/manifest.json').then((response) => {
    //         response.json().then((json) => {
    //             console.log('setting manifest');
    //             setManifest(json);
    //         })
    //     });
    // }, []);
    return <DevContainer loadModule={loadModule} ></DevContainer >;
}

export default App;
