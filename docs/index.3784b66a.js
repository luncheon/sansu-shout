var e;import{t,i as n,c as s,a as r,b as o,r as i,d as c,e as a,m as l,f as d,g as u}from"./vendor.0c0d0fce.js";const p=t('<div class="flex items-center justify-center whitespace-pre"><span></span><span class="w-2ex"></span></div>',6),x=e=>Math.random()*e|0,f=[()=>{const e=x(20),t=x(20);return{x:e,y:t,correctAnswer:e+t,text:`${e} + ${t} = `}},()=>{let e=x(20),t=x(20);return e<t&&([e,t]=[t,e]),{x:e,y:t,correctAnswer:e-t,text:`${e} - ${t} = `}}],h=()=>f[Math.random()*f.length|0](),v=e=>(()=>{const t=p.cloneNode(!0),s=t.firstChild,r=s.nextSibling;return n(s,(()=>e.question.text)),n(r,(()=>e.answer)),t})();const m=t('<main class="relative flex-auto flex items-center justify-center text-12vw"><div class="absolute inset-0 flex items-center justify-center text-24vw pointer-events-none select-none">⭕️</div></main>',4),b=t('<div class="fixed left-4 bottom-3 font-sans"><div class="font-bold text-xs opacity-60 mb-1">きこえた ことば</div><span class="text-red-400"></span></div>',6),w=t('<button class="fixed right-4 bottom-2 p-0 text-xs opacity-60 border-b-current border-b-1 font-sans" type="button">マイクリセット</button>',2),y=t('<header class="pl-4 pt-3 self-start inline-flex flex-col items-center"><h1><span class="text-pink-200">さんすう</span><span class="text-yellow-100">シャウト</span></h1><p class="text-green-100" style="letter-spacing:1px">こたえが わかったら さけんでね</p></header>',10),g=t('<div class="h-full flex flex-col items-stretch"></div>',2),S=t('<main class="flex-auto flex items-center justify-center text-12vw"><button class="border-b-current border-b-3" type="button">はじめる</button></main>',4),[$,j]=s(h()),[k,N]=s(),[A,C]=s(""),[R,T]=s(),[q,M]=s(),U=r((()=>R()===$().correctAnswer)),F=new(null!=(e=window.SpeechRecognition)?e:window.webkitSpeechRecognition);F.lang="ja",F.continuous=!0,F.interimResults=!0,F.maxAlternatives=1,F.onend=function(){N(!1),setTimeout((()=>this.start()),1e3)},F.onaudiostart=()=>o((()=>{N(!0),C(""),M()})),F.onaudioend=()=>N(!1),F.onerror=e=>M([e.error,e.message]),F.onresult=({results:e,resultIndex:t})=>{var n,s;const r=e[t],i=null!=(s=null==(n=null==r?void 0:r[0])?void 0:n.transcript)?s:"";o((()=>{C(i),(null==r?void 0:r.isFinal)&&T((e=>{var t;const n=e&&(null==(t=e.match(/(-?[0-9]+).*?$/))?void 0:t[1]);return n?+n:void 0})(i))}))},F.start();const I=()=>{C(""),T(),M(),F.stop()},z=new SpeechSynthesisUtterance("正解");z.lang="ja",z.rate=1.25,z.pitch=1.1;const B=new SpeechSynthesisUtterance("ちがうよ");B.lang="ja",B.rate=1.2;const D=()=>(d((()=>{R()&&(F.stop(),U()?(speechSynthesis.speak(z),setTimeout((()=>o((()=>{T(void 0),j(h())}))),1e3)):(speechSynthesis.speak(B),setTimeout((()=>T(void 0)),1e3)))})),[(()=>{const e=m.cloneNode(!0),t=e.firstChild;return n(e,a(v,{get question(){return $()},get answer(){return R()}}),t),u((()=>t.hidden=!U())),e})(),(()=>{const e=b.cloneNode(!0),t=e.firstChild.nextSibling;return n(e,A,t),n(e,(()=>k()?"...":"　"),t),n(t,q),e})(),(()=>{const e=w.cloneNode(!0);return e.$$click=I,e})()]),E=()=>y.cloneNode(!0),G=()=>{const[e,t]=s(!1);return(()=>{const s=g.cloneNode(!0);return n(s,a(E,{}),null),n(s,(()=>{const n=l((()=>!!e()),!0);return()=>n()?a(D,{}):(()=>{const e=S.cloneNode(!0);return e.firstChild.$$click=()=>t(!0),e})()})(),null),s})()};i((()=>a(G,{})),document.body),c(["click"]);