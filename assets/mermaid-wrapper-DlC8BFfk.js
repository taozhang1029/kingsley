import{j as r,_ as a,o as s,c as o,f as i,a as d,t as n}from"./app-C8q1F3U4.js";const l={name:"mermaid",props:{dsl:{type:String,default:""}},mounted(){this.importMermaid()},updated(){this.importMermaid()},methods:{importMermaid(){r(()=>import("./mermaid-BEgWE5GJ.js").then(e=>e.m),[]).then(e=>{e.initialize({startOnLoad:!0}),e.run({querySelector:".dsl"})})}}},m={class:"dsl"};function p(e,_,t,c,u,f){return s(),o("div",null,[i(e.$slots,"default",{},()=>[d("div",m,n(t.dsl),1)])])}const v=a(l,[["render",p],["__file","mermaid-wrapper.vue"]]);export{v as default};
