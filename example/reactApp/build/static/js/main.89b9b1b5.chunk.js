(this["webpackJsonpvesting-ui"]=this["webpackJsonpvesting-ui"]||[]).push([[0],{474:function(e,n,t){},476:function(e,n){},484:function(e,n){},486:function(e,n){},487:function(e,n){},488:function(e,n){},489:function(e,n){},490:function(e,n){},499:function(e,n){},501:function(e,n){},513:function(e,n){},514:function(e,n){},528:function(e,n){},532:function(e,n){},534:function(e,n){},536:function(e,n){},546:function(e,n){},548:function(e,n){},555:function(e,n){},556:function(e,n){},557:function(e,n){},558:function(e,n){},559:function(e,n){},560:function(e,n){},561:function(e,n){},562:function(e,n){},563:function(e,n){},564:function(e,n){},565:function(e,n){},566:function(e,n){},567:function(e,n){},597:function(e,n){},599:function(e,n){},604:function(e,n){},606:function(e,n){},613:function(e,n){},625:function(e,n){},628:function(e,n){},644:function(e,n){},647:function(e,n){},656:function(e,n){},690:function(e,n){},706:function(e,n){},713:function(e,n){},723:function(e,n){},775:function(e,n){},786:function(e,n){},787:function(e,n){},792:function(e,n){},866:function(e,n){},901:function(e,n,t){"use strict";t.r(n);var c=t(3),i=t.n(c),r=t(162),s=t.n(r),o=(t(474),t(0)),j=t.n(o),a=t(188),d=t(79),l=t(185),b=t(74),u=t(194);var O=t(392),h=t.n(O),x=Object({NODE_ENV:"production",PUBLIC_URL:"",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0}).REACT_APP_EXPLORER_URL||"https://bscscan.com",f=Object({NODE_ENV:"production",PUBLIC_URL:"",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0}).REACT_APP_REQUIRED_CHAIN_ID||"56",g=(t(491),t(393)),S=t(335),p=t(336),v=t(337),m=t(17);var T=function(){var e,n=Object(c.useState)(),t=Object(d.a)(n,2),i=t[0],r=t[1],s=Object(c.useState)(),o=Object(d.a)(s,2),O=(o[0],o[1],Object(c.useState)()),f=Object(d.a)(O,2),T=f[0],C=f[1],_=Object(c.useState)({balance:0,symbol:"BTIEPT",nonce:0}),E=Object(d.a)(_,2),P=E[0],w=(E[1],Object(c.useState)({})),D=Object(d.a)(w,2),R=D[0],A=(D[1],Object(c.useState)(!1)),I=Object(d.a)(A,2),k=I[0],W=(I[1],window.ethereum),y=new u.a.providers.Web3Provider(W).getSigner(),H=new g.DIDhubSDK({chain:"BNB",secret:"0x0000000000000000000000000000000000000000000000000000000000000000",provider:y}),L=function(){var e=Object(a.a)(j.a.mark((function e(){return j.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(m.jsxs)(b.a,{children:[Object(m.jsx)(b.e,{size:"md",mb:5,textAlign:"center",children:"Test meta transaction"}),Object(m.jsx)(S.a,{variant:"simple",size:"md",borderRadius:"12px",borderWidth:"1px",style:{borderCollapse:"initial",tableLayout:"fixed"},children:Object(m.jsxs)(S.b,{children:[Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Token Contract Address"})}),Object(m.jsx)(S.c,{children:Object(m.jsx)(b.f,{color:"teal.500",href:"".concat(x,"/address/").concat(H.seaportContract.address),isExternal:!0,children:(e=H.seaportContract.address,e.substr(0,6)+"..."+e.substr(e.length-4,4))})})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Signed Transaction Owner"})}),Object(m.jsx)(S.c,{children:R.owner?R.owner:"loading..."})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Signed Transaction Spender"})}),Object(m.jsx)(S.c,{children:R.spender?R.spender:"loading..."})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Signed Transaction Value"})}),Object(m.jsx)(S.c,{children:R.value?R.value+" "+P.symbol:"loading..."})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Signed Transaction Deadline"})}),Object(m.jsx)(S.c,{children:R.deadline?Object(m.jsxs)(b.a,{children:[Object(m.jsx)(b.g,{children:h()(R.deadline).format("YYYY/MM/DD HH:mm")}),Object(m.jsx)(b.g,{children:"Stamp: "+R.deadline})]}):"loading..."})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"R, S, V"})}),Object(m.jsx)(S.c,{children:R.r?Object(m.jsxs)(b.a,{children:[Object(m.jsx)(b.g,{children:"R: "+R.r}),Object(m.jsx)(b.g,{children:"\nS: "+R.s}),Object(m.jsx)(b.g,{children:"\n V: "+R.v})]}):"loading..."})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Available to Permit"})}),Object(m.jsx)(S.c,{children:Object(m.jsx)(b.b,{children:"".concat(P.balance," ").concat(P.symbol)})})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Amount to Permit"})}),Object(m.jsxs)(S.c,{children:[Object(m.jsx)(b.b,{children:Object(m.jsx)(p.a,{value:i,onChange:function(e){return r(e)},defaultValue:0,children:Object(m.jsx)(p.b,{})})}),parseInt(""===i?"0":i,10)>parseInt(P.balance,10)?Object(m.jsx)(b.g,{fontSize:"xs",color:"red.400",fontWeight:"bold",children:"Amount is greater than balance!"}):Object(m.jsx)(b.g,{})]})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{children:Object(m.jsx)("strong",{children:"Grant to Address"})}),Object(m.jsx)(S.c,{children:Object(m.jsx)(v.a,{value:T,onChange:function(e){return C(e.target.value)}})})]}),Object(m.jsxs)(S.d,{children:[Object(m.jsx)(S.c,{}),Object(m.jsx)(S.c,{children:Object(m.jsx)(l.a,{onClick:L,colorScheme:"green",ml:5,isDisabled:k||parseInt(""===i?"0":i,10)>parseInt(P.balance,10)||""===i,children:"Sign Transaction"})})]})]})})]})},C=t(193),_=t(410),E=t.n(_);var P=function(){var e=Object(c.useState)(!1),n=Object(d.a)(e,2),t=n[0],i=n[1],r=Object(C.useMetamask)(),s=r.connect,o=r.getAccounts,u=r.getChain,O=r.metaState,h=Object(c.useState)(null),x=Object(d.a)(h,2),g=x[0],S=x[1],p=Object(c.useState)(null),v=Object(d.a)(p,2),_=v[0],P=v[1];return console.log("Starting up"),window.ethereum.on("chainChanged",(function(e){S(parseInt(e.slice(2),16).toString())})),Object(m.jsx)(b.c,{height:"100vh",children:Object(m.jsxs)(b.d,{direction:"column",height:"100%",width:"100%",children:[t?Object(m.jsxs)(b.a,{children:[Object(m.jsx)(b.a,{}),Object(m.jsx)("br",{}),Object(m.jsx)(b.a,{})]}):Object(m.jsxs)(b.b,{p:5,children:[Object(m.jsx)(b.a,{mr:2,children:"Your Wallet:"}),Object(m.jsx)(l.a,{colorScheme:"blue",onClick:function(){O.isConnected||Object(a.a)(j.a.mark((function e(){var n,t;return j.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,s(E.a);case 3:return e.next=5,o();case 5:return n=e.sent,P(n[0]),e.next=9,u();case 9:t=e.sent,S(t.id),i(!0),e.next=17;break;case 14:e.prev=14,e.t0=e.catch(0),console.log(e.t0);case 17:case"end":return e.stop()}}),e,null,[[0,14]])})))()},children:"Connect Metamask"})]}),_?g!==f?Object(m.jsx)(b.b,{children:"Incorrect network. Your current chain Id is ".concat(g,", ").concat(f," is needed.")}):Object(m.jsx)(b.d,{flexGrow:1,children:Object(m.jsx)(T,{})}):"Please connect your Metamask or change your address."]})})},w=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,967)).then((function(n){var t=n.getCLS,c=n.getFID,i=n.getFCP,r=n.getLCP,s=n.getTTFB;t(e),c(e),i(e),r(e),s(e)}))},D=t(244);s.a.render(Object(m.jsx)(i.a.StrictMode,{children:Object(m.jsx)(D.a,{children:Object(m.jsx)(C.MetamaskStateProvider,{children:Object(m.jsx)(P,{})})})}),document.getElementById("root")),w()}},[[901,1,2]]]);