import { contextBridge, ipcRenderer } from 'electron';

console.log("***************** preload *********************");
console.log(contextBridge.exposeInMainWorld);

const apiName = 'electronAPI';

// contextBridge.exposeInMainWorld(apiName, {
//   setTitle: (title:string) => ipcRenderer.send('set-title', title)
// }); 

contextBridge.exposeInMainWorld(apiName, {
  oneWayCall: (payload:object) => ipcRenderer.send('oneWayCall', payload),
  twoWayCall: (payload:object) => ipcRenderer.invoke('twoWayCall', payload),
  onMainToRendererMessage: (rendererHandler:any) => ipcRenderer.on('messageChannel',(evt,value)=>{
    rendererHandler(value);
  })
});  

