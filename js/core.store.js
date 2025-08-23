async function createStore(){
  const db = await new Promise((res,rej)=>{
    const r = indexedDB.open('hangulplay',1);
    r.onupgradeneeded = e=>{
      const db = e.target.result;
      db.createObjectStore('tries',{keyPath:'ts'});   // {ts,c,v,ok,durMs}
      db.createObjectStore('snapshots',{keyPath:'date'});
      db.createObjectStore('prefs',{keyPath:'k'});
    };
    r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error);
  });
  const tx = (name,mode='readonly')=>db.transaction(name,mode).objectStore(name);
  return {
    logTry: (row)=>tx('tries','readwrite').put(row),
    listTries: ()=>new Promise(r=>{ const req=tx('tries').getAll(); req.onsuccess=()=>r(req.result||[]) }),
    putPref: (k,v)=>tx('prefs','readwrite').put({k,v}),
    getPref: (k)=>new Promise(r=>{ const req=tx('prefs').get(k); req.onsuccess=()=>r(req.result?.v) }),
    saveSnap: (snap)=>tx('snapshots','readwrite').put(snap),
    getSnap: (d)=>new Promise(r=>{ const req=tx('snapshots').get(d); req.onsuccess=()=>r(req.result) }),
  };
}
