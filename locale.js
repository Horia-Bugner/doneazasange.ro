/* Shared RO/HU localization. Hungarian place names are displayed; routing and centre identifiers stay stable. */
window.FDBS_LANG=document.documentElement.lang==='hu'?'hu':'ro';
window.FDBS_HU_PLACES={"București":"Bukarest","Cluj-Napoca":"Kolozsvár","Timișoara":"Temesvár","Brașov":"Brassó","Oradea":"Nagyvárad","Bacău":"Bákó","Sibiu":"Nagyszeben","Târgu Mureș":"Marosvásárhely","Baia Mare":"Nagybánya","Buzău":"Bodzavásár","Satu Mare":"Szatmárnémeti","Botoșani":"Botosány","Suceava":"Szucsáva","Drobeta-Turnu Severin":"Szörényvár","Piatra Neamț":"Karácsonkő","Iași":"Jászvásár","Constanța":"Konstanca","Galați":"Galac","Bistrița":"Beszterce","Alba Iulia":"Gyulafehérvár","Deva":"Déva","Hunedoara":"Vajdahunyad","Petroșani":"Petrozsény","Reșița":"Resicabánya","Zalău":"Zilah","Miercurea Ciuc":"Csíkszereda","Sfântu Gheorghe":"Sepsiszentgyörgy","Câmpulung Muscel":"Hosszúmező","Câmpulung":"Hosszúmező","Odorheiul Secuiesc":"Székelyudvarhely","Gheorgheni":"Gyergyószentmiklós","Târgu Secuiesc":"Kézdivásárhely","Întorsura Buzăului":"Bodzaforduló","Covasna":"Kovászna","Barcani":"Zágonbárkány","Târgu Jiu":"Zsilvásárhely","Focșani":"Foksány","Tulcea":"Tulcsa","Giurgiu":"Gyurgyevó","Bârlad":"Barlád","Vaslui":"Vászló","Odorheiu Secuiesc":"Székelyudvarhely","CTS Mureș":"CTS Maros","Mureș":"Maros","CTS Cluj":"CTS Kolozs","Cluj":"Kolozs","CTS Bihor":"CTS Bihar","Bihor":"Bihar","CTS Arad":"CTS Arad","Arad":"Arad","CTS Alba":"CTS Fehér","Alba":"Fehér","CTS Bistrița-Năsăud":"CTS Beszterce-Naszód","Bistrița-Năsăud":"Beszterce-Naszód","CTS Brașov":"CTS Brassó","CTS Caraș-Severin":"CTS Krassó-Szörény","Caraș-Severin":"Krassó-Szörény","CTS Covasna":"CTS Kovászna","CTS Harghita":"CTS Hargita","Harghita":"Hargita","CTS Hunedoara":"CTS Hunyad","CTS Maramureș":"CTS Máramaros","Maramureș":"Máramaros","CTS Satu Mare":"CTS Szatmár","CTS Sălaj":"CTS Szilágy","Sălaj":"Szilágy","CTS Sibiu":"CTS Szeben","CTS Timiș":"CTS Temes","Timiș":"Temes","CRTS Cluj":"CRTS Kolozs"};
window.fdbsPlaceNames=value=>{for(const [ro,hu] of Object.entries(window.FDBS_HU_PLACES).sort((a,b)=>b[0].length-a[0].length))value=value.replaceAll(ro,hu);return value};
window.FDBS_HU_COUNTIES={"Mureș":"Maros","Cluj":"Kolozs","Bihor":"Bihar","Arad":"Arad","Alba":"Fehér","Bistrița-Năsăud":"Beszterce-Naszód","Brașov":"Brassó","Caraș-Severin":"Krassó-Szörény","Covasna":"Kovászna","Harghita":"Hargita","Hunedoara":"Hunyad","Maramureș":"Máramaros","Satu Mare":"Szatmár","Sălaj":"Szilágy","Sibiu":"Szeben","Timiș":"Temes"};
window.fdbsSearchText=value=>{if(window.FDBS_LANG!=='hu')return value;const plain=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const input=plain(value);for(const [ro,hu] of Object.entries({...window.FDBS_HU_PLACES,...window.FDBS_HU_COUNTIES}).concat(Object.entries(window.FDBS_HU_PLACES)).sort((a,b)=>a[0].length-b[0].length)){const alias=plain(hu);if(input.length>=2&&alias.startsWith(input))return ro;value=value.replace(new RegExp(hu,'gi'),ro);value=plain(value).replaceAll(alias,plain(ro))}return value};
window.fdbsText=function(value){
 if(window.FDBS_LANG!=='hu'||typeof value!=='string')return value;
 const key=value.trim(),dict=window.FDBS_HU||{};
 let result=dict[key];
 if(result===undefined){
  result=key.replace(/^(\d+) (?:locații|locație|de locații)$/,'$1 helyszín').replace(/^(\d+) întrebări rămase$/,'$1 további kérdés').replace(/^(\d+) fotografii$/,'$1 fénykép').replace(/^(\d+) centre în București$/,'$1 központ Bukarestben');
  if(key.startsWith('Luni–Vineri'))result=key.replace('Luni–Vineri','Hétfő–péntek');
  if(key.startsWith('Redă: '))result='Lejátszás: '+fdbsText(key.slice(6));
  if(key.startsWith('Mărește: '))result='Nagyítás: '+fdbsText(key.slice(9));
 }
 return value.slice(0,value.indexOf(key))+fdbsPlaceNames(result)+value.slice(value.indexOf(key)+key.length);
};
window.fdbsTranslateDOM=function(root){
 if(window.FDBS_LANG!=='hu')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){
  if(node.parentElement?.closest('script,style,textarea,[contenteditable]'))continue;
  const value=fdbsText(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;
 }
 root.querySelectorAll?.('[placeholder],[aria-label],[alt],[title]').forEach(el=>{
  for(const attr of ['placeholder','aria-label','alt','title']){const value=el.getAttribute(attr);if(value!==null){const translated=fdbsText(value);if(translated!==value)el.setAttribute(attr,translated)}}
 });
};
window.fdbsHTML=function(html){if(window.FDBS_LANG!=='hu')return html;const template=document.createElement('template');template.innerHTML=html;fdbsTranslateDOM(template.content);return template.innerHTML};
window.fdbsLocalizeFaqs=function(){
 if(window.FDBS_LANG!=='hu')return;
 window.FDBS_DATA.faqs.forEach(f=>{if(f.sourceQuestion)return;f.sourceQuestion=f.question;f.question=fdbsText(f.question);f.answer=fdbsText(f.answer);f.category=fdbsText(f.category);f.keywords=[f.keywords,f.question,f.answer].join(' ')});
};
window.fdbsLanguageUrl=function(lang){const path=typeof currentRoutePath==='function'?publicRoutePath(currentRoutePath()):'/';if(location.protocol==='file:')return (window.FDBS_ROOT_PREFIX||'')+(lang==='hu'?'hu/':'')+'index.html#'+currentRoutePath();return (lang==='hu'?'/hu':'')+path+location.search};
window.fdbsUpdateLanguage=function(){
 document.querySelectorAll('[data-lang]').forEach(el=>{const lang=el.dataset.lang;el.classList.toggle('active',lang===window.FDBS_LANG);el.setAttribute('aria-pressed',String(lang===window.FDBS_LANG));if(lang==='ro'||lang==='hu')el.onclick=()=>{location.href=fdbsLanguageUrl(lang)}});
 if(window.FDBS_LANG==='hu'){
  document.title=fdbsText(document.title);
  document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(!raw||raw.startsWith('#')||a.hasAttribute('download'))return;const u=new URL(raw,document.baseURI);if(location.protocol==='file:'||u.origin!==location.origin||u.pathname.startsWith('/hu/'))return;if(Object.values(publicRoutes).includes(u.pathname)||/^\/centre\/[^/]+\/$/.test(u.pathname))a.setAttribute('href','/hu'+u.pathname+u.search+u.hash)});
 }
};
const originalAlert=window.alert.bind(window);window.alert=message=>originalAlert(fdbsText(message));
document.addEventListener('DOMContentLoaded',()=>{
 fdbsTranslateDOM(document.body);fdbsUpdateLanguage();
 if(window.FDBS_LANG!=='hu')return;
 const observer=new MutationObserver(()=>{observer.disconnect();fdbsTranslateDOM(document.body);fdbsUpdateLanguage();observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']})});
 observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']});
});
window.addEventListener('fdbs:route-rendered',()=>{fdbsTranslateDOM(document.body);fdbsUpdateLanguage()});
