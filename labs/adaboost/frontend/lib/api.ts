import type {DataSet, TrainConfig, TrainResult} from './types';
const API=(process.env.NEXT_PUBLIC_ADABOOST_API_URL || 'http://127.0.0.1:8020').replace(/\/+$/,'');
async function request<T>(path:string, init?:RequestInit):Promise<T>{
 let res:Response;
 try {res=await fetch(API+path,init);} catch {throw new Error(`Could not connect to AdaBoost backend at ${API}. Start FastAPI, or configure NEXT_PUBLIC_ADABOOST_API_URL.`)}
 if(!res.ok){let reason=`HTTP ${res.status}`;try{const j=await res.json();reason=typeof j.detail==='string'?j.detail:JSON.stringify(j.detail||j)}catch{}throw new Error(reason)}
 return res.json();
}
export const getDataset=(id:string)=>request<DataSet>(`/api/datasets/${id}`);
export const trainModel=(config:TrainConfig)=>request<TrainResult>('/api/train',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(config)});
