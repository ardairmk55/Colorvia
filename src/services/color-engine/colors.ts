let idSequence = 0
export function createId(prefix = 'color') { idSequence += 1; return `${prefix}-${Date.now().toString(36)}-${idSequence.toString(36)}-${Math.random().toString(36).slice(2, 8)}` }
export type Color = { id: string; hex: string }
export type Harmony = 'analogous' | 'complementary' | 'triadic' | 'monochrome'
const toHex=(n:number)=>Math.round(n).toString(16).padStart(2,'0').toUpperCase()
function hslToHex(h:number,s:number,l:number){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const [r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return `#${toHex((r+m)*255)}${toHex((g+m)*255)}${toHex((b+m)*255)}`}
function hexToHsl(value:string){const hex=normalizeHex(value)!;const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;const l=(max+min)/2;const s=d===0?0:d/(1-Math.abs(2*l-1));if(d){if(max===r)h=60*(((g-b)/d)%6);else if(max===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4)}return{h:(h+360)%360,s,l}}
export function normalizeHex(value:unknown):string|null{if(typeof value!=='string')return null;const raw=value.trim().replace(/^#/,'');if(/^[\da-f]{3}$/i.test(raw))return `#${[...raw].map(c=>c+c).join('').toUpperCase()}`;return /^[\da-f]{6}$/i.test(raw)?`#${raw.toUpperCase()}`:null}
export function generateHarmony(baseHex:string,mode:Harmony):Color[]{const base=hexToHsl(baseHex),offsets:Record<Harmony,number[]>={analogous:[-36,-18,0,18,36],complementary:[0,180,28,208,0],triadic:[0,120,240,24,0],monochrome:[0,0,0,0,0]},light=[.52,.43,.57,.66,.34];return offsets[mode].map((offset,i)=>({id:createId(),hex:hslToHex((base.h+offset+360)%360,mode==='monochrome'?base.s*.8:Math.max(.28,base.s),mode==='monochrome'?[.28,.4,.53,.68,.78][i]:light[i])}))}
export function generatePalette(){return generateHarmony(hslToHex(Math.random()*360,.62,.54),'analogous')}
