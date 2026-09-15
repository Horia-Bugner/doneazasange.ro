// Regenerate before publishing: node generate-seo.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = __dirname, origin = 'https://doneazasange.ro';
const read = f => fs.readFileSync(path.join(root,f),'utf8').replace(/^\uFEFF/,'');
const write = (f,s) => { if(!fs.existsSync(path.join(root,f)) || read(f)!==s) fs.writeFileSync(path.join(root,f),s); };
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const plain = s => s.replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi,'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const escapeXml = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const json = v => JSON.stringify(v).replace(/</g,'\\u003c');
const context = {window:{}};vm.createContext(context);vm.runInContext(read('data.js'),context);
const centres = context.window.FDBS_DATA.centres.filter(c=>c.active);
const app = read('app.js');
const verification = app.slice(app.indexOf('function addCityScheduleVerification('),app.indexOf('\ncityCentrePage=addCityScheduleVerification;'));
assert(verification.startsWith('function addCityScheduleVerification('));
function displayedMetadata(c) {
 const box={D:{centres:[c]},citySlug:slug,centreHoursLabel:x=>x.hours?`${['CTS Vrancea','CRTS Galați'].includes(x.name)?'':`${x.days}, `}${x.hours}`:x.days};
 box.cityCentrePageWithRedundantHeading=()=>`<div><dt>Program</dt><dd>${box.centreHoursLabel(c)}</dd></div>`;
 vm.createContext(box);vm.runInContext(verification,box);
 const html=box.addCityScheduleVerification(slug(c.city));
 const phones=[...html.matchAll(/href="tel:([^\"]+)"/g)].map(x=>x[1]);
 const date=html.match(/<time datetime="([^\"]+)"/);
 return {phones,scheduleDate:date?.[1]||null,scheduleDateLabel:date?plain(html.match(/<div class="schedule-verification">([\s\S]*?)<\/div>/)?.[1]||''):null};
}
const entries = centres.map(c=>{
 const meta=displayedMetadata(c),url=`${origin}/centre/${slug(c.city)}/`;
 return {id:slug(c.name),name:c.name,city:c.city,county:c.county,url,address:c.address,latitude:c.lat,longitude:c.lng,days:c.days,hours:c.hours||null,phoneNumbers:meta.phones,email:c.email||null,notes:c.notes.map(plain),scheduleDate:meta.scheduleDate,scheduleDateLabel:meta.scheduleDateLabel};
});
assert.equal(new Set(entries.map(c=>c.id)).size,entries.length);
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d=>'https://schema.org/'+d);
function huPlace(value){const places=JSON.parse(read('i18n/hu-places.json'));for(const [ro,hu] of Object.entries(places).sort((a,b)=>b[0].length-a[0].length))value=value.replaceAll(ro,hu);return value}
function centreNode(c){
 const node={'@type':['MedicalOrganization','Place'],'@id':c.url+'#'+c.id,name:c.name,url:c.url,address:{'@type':'PostalAddress',streetAddress:c.address,addressLocality:c.city,addressRegion:c.county,addressCountry:'RO'},geo:{'@type':'GeoCoordinates',latitude:c.latitude,longitude:c.longitude}};
 if(c.phoneNumbers.length)node.telephone=c.phoneNumbers;
 if(c.email)node.email=c.email;
 const description=[c.hours?`${c.days}, ${c.hours}`:'Programul urmează să fie completat.',...c.notes,'Toate centrele din țară sunt închise în zilele de sărbătoare națională.'];
 const hu=c.url.includes('/hu/'),dictionary=hu?JSON.parse(read('i18n/hu.json')):{};node.description=description.map(s=>dictionary[s]||s.replace(hu?/Luni–Vineri/g:/$^/g,'Hétfő–péntek')).join(' ');
 const times=c.hours?.match(/^(\d{2}:\d{2})[–-](\d{2}:\d{2})$/);
 if(times && c.days==='Luni–Vineri')node.openingHoursSpecification={'@type':'OpeningHoursSpecification',dayOfWeek:days,opens:times[1],closes:times[2]};
 if(c.url.includes('/hu/')){node.name=huPlace(node.name);node.address.addressLocality=huPlace(node.address.addressLocality);node.address.addressRegion=JSON.parse(read('i18n/hu-counties.json'))[c.county]||huPlace(c.county);node.description=huPlace(node.description)}return node;
}
function pageFiles(dir='') {
 return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{
  const rel=path.posix.join(dir,e.name);
  if(e.isDirectory())return e.name.startsWith('.')||['assets','wp-content','node_modules'].includes(e.name)?[]:pageFiles(rel);
  return e.name==='index.html'?[rel]:[];
 });
}
const files=pageFiles().sort();const pages=files.map(file=>{const html=read(file),canonical=html.match(/<link rel="canonical" href="([^\"]+)"/);assert(canonical,`No canonical: ${file}`);const url=canonical[1];assert(url.startsWith(origin+'/'));return {file,html,url,title:plain(html.match(/<title>([\s\S]*?)<\/title>/)[1]),description:plain(html.match(/<meta name="description" content="([^\"]*)"/)?.[1]||'')};});
assert.equal(new Set(pages.map(p=>p.url)).size,pages.length);
const urls=new Set(pages.map(p=>p.url));entries.forEach(c=>assert(urls.has(c.url),`Missing route ${c.url}`));
const org={'@type':'Organization','@id':origin+'/#organization',name:'Fundația Donatorilor Benevoli de Sânge',alternateName:'FDBS',url:origin+'/',logo:origin+'/assets/logo-fdbs-oficial.jpg'};
const website={'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'FDBS — Donează sânge',inLanguage:['ro','hu'],publisher:{'@id':org['@id']}};
const stateFile='.seo-state.json',previous=fs.existsSync(path.join(root,stateFile))?JSON.parse(read(stateFile)):{};
const state={};const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for(const p of pages){
 const page={'@type':p.url===origin+'/centre/'?'CollectionPage':'WebPage','@id':p.url+'#webpage',url:p.url,name:p.title,description:p.description,inLanguage:p.url.includes('/hu/')?'hu':'ro',isPartOf:{'@id':website['@id']},publisher:{'@id':org['@id']}};
 const graph=[org,website,page];
 const isHu=p.url.includes('/hu/');const cityEntries=entries.filter(c=>c.url===p.url.replace(origin+'/hu/',origin+'/')).map(c=>isHu?{...c,url:c.url.replace(origin+'/',origin+'/hu/')}:c);
 if(cityEntries.length){
  const breadcrumbs={'@type':'BreadcrumbList','@id':p.url+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:isHu?'Hol adhatok vért?':'Unde pot dona?',item:origin+(isHu?'/hu':'')+'/centre/'},{'@type':'ListItem',position:2,name:isHu?huPlace(cityEntries[0].city):cityEntries[0].city,item:p.url}]};
  page.breadcrumb={'@id':breadcrumbs['@id']};page.mainEntity=cityEntries.map(c=>({'@id':c.url+'#'+c.id}));graph.push(breadcrumbs,...cityEntries.map(centreNode));
 }
 if(p.url===origin+'/centre/'||p.url===origin+'/hu/centre/'){
  const list={'@type':'ItemList','@id':p.url+'#directory',numberOfItems:entries.length,itemListElement:entries.map((c,i)=>({'@type':'ListItem',position:i+1,name:isHu?huPlace(c.name):c.name,url:isHu?c.url.replace(origin+'/',origin+'/hu/'):c.url}))};graph.push(list);page.mainEntity={'@id':list['@id']};
 }
 let html=p.html.replace(/\s*<script id="fdbs-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/g,'').replace(/\s*<link rel="alternate" type="application\/json"[^>]*>/g,'');
 const block='\n  <script id="fdbs-structured-data" type="application/ld+json">'+json({'@context':'https://schema.org','@graph':graph})+'</script>\n  <link rel="alternate" type="application/json" title="Directorul centrelor de donare" href="https://doneazasange.ro/centre.json" />';
 const roUrl=p.url.replace(origin+'/hu/',origin+'/');const huUrl=roUrl.replace(origin+'/',origin+'/hu/');
 const alternatives=urls.has(huUrl)?'\n<link rel="alternate" hreflang="ro" href="'+roUrl+'" /><link rel="alternate" hreflang="hu" href="'+huUrl+'" /><link rel="alternate" hreflang="x-default" href="'+roUrl+'" />':'';
 html=html.replace(/\s*<link[^>]*hreflang=[^>]*>/g,'');
 html=html.replace('</head>',block+alternatives+'\n</head>');
 const digest=crypto.createHash('sha256').update(html).update(app).update(read('data.js')).update(read('faq-data.js')).update(read('styles.css')).update(fs.existsSync(path.join(root,'i18n/hu.json'))?read('i18n/hu.json'):'').digest('hex');
 state[p.url]={digest,lastmod:previous[p.url]?.digest===digest?previous[p.url].lastmod:today};
 write(p.file,html);
}
const directory={schemaVersion:1,language:'ro',source:origin+'/centre/',count:entries.length,notice:'Datele reproduc informațiile publicate pe site. Programele se pot modifica; centrele sunt închise în zilele de sărbătoare națională. Datele de verificare sunt cele afișate pentru fiecare centru, nu data generării fișierului.',centres:entries};
write('centre.json',JSON.stringify(directory,null,2)+'\n');
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>`  <url><loc>${escapeXml(p.url)}</loc><lastmod>${state[p.url].lastmod}</lastmod></url>`).join('\n')+'\n</urlset>\n');
write(stateFile,JSON.stringify(state,null,2)+'\n');
console.log(`Generated structured data for ${pages.length} pages, ${entries.length} centres and sitemap.`);