import React, { lazy } from 'react'
import './App.css'
// import { say } from '@composaic/utils';

import {
    __federation_method_getRemote,
    __federation_method_setRemote,
    // @ts-expect-error: this is a private API
} from '__federation__'

function useFeatureFlagsOrSomethingCoolToGetRemote() {
    // default to remoteA
    let remoteConfig = {
        url: 'http://localhost:9000/assets/remoteEntry.js',
        name: 'remoteA',
        module: './RemoteARoot',
    }

    // insert super cool logic to determine your remote
    // for demo purposes, we'll just alternate between remoteA and remoteB every 5 seconds
    // const seconds = new Date().getSeconds()
    // if (Math.floor(seconds / 5) % 2 === 0) {
    //     remoteConfig = {
    //         url: 'http://localhost:9001/assets/remoteEntry.js',
    //         name: 'remoteB',
    //         module: './RemoteBRoot',
    //     }
    // }
    return remoteConfig
}

const DynamicRemoteApp = lazy(async () => {
    const { url, name, module } = useFeatureFlagsOrSomethingCoolToGetRemote()
    __federation_method_setRemote(name, {
        url: () => Promise.resolve(url),
        format: 'esm',
        from: 'vite',
    })
    let comp = null
    try {
        comp = await __federation_method_getRemote(name, module)
    } catch (error) {
        console.error(error)
        console.error('Error fetching remote', error)
        comp = { default: () => <div>Failed to fetch remote</div> }
    }
    return comp
})

function App() {
    return (
        <div className="app">
            <React.Suspense fallback="Loading">
                <div>Content</div>
                <DynamicRemoteApp />
            </React.Suspense>
        </div>
    )
}

export default App
