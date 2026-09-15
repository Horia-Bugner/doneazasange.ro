// Run with Playwright available in NODE_PATH, then run generate-seo.cjs.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=__dirname,version='20260915-hu1';
const dict=JSON.parse(fs.readFileSync(path.join(root,'i18n/hu.json'),'utf8'));
fs.writeFileSync(path.join(root,'i18n/hu.js'),'window.FDBS_HU='+JSON.stringify(dict)+';\n');
function files(dir=''){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{const rel=path.posix.join(dir,e.name);return e.isDirectory()?['hu','assets','wp-content','node_modules','i18n'].includes(e.name)||e.name.startsWith('.')?[]:files(rel):e.name==='index.html'?[rel]:[]})}
const places=JSON.parse(fs.readFileSync(path.join(root,'i18n/hu-places.json'),'utf8'));const localePath=path.join(root,'locale.js');fs.writeFileSync(localePath,fs.readFileSync(localePath,'utf8').replace(/window.FDBS_HU_PLACES=\{[^\n]+\};/,()=> 'window.FDBS_HU_PLACES='+JSON.stringify(places)+';'));
const pages=files();
for(const file of pages){
 let ro=fs.readFileSync(path.join(root,file),'utf8');
 ro=ro.replace(/app\.js\?v=[^"']+/g,'app.js?v='+version).replace(/styles\.css\?v=[^"']+/g,'styles.css?v='+version);
 if(!ro.includes('src="locale.js'))ro=ro.replace(/<script src="app.js/, '<script src="locale.js?v='+version+'"></script><script src="app.js');
 fs.writeFileSync(path.join(root,file),ro);
 const depth=file.split('/').length,base='../'.repeat(depth);
 let hu=ro.replace('<html lang="ro"','<html lang="hu"').replace(/<base href="[^"]*"\s*\/>/,'');
 hu=hu.replace('<head>','<head>\n<base href="'+base+'" />\n<script src="i18n/hu.js?v='+version+'"></script>');
 hu=hu.replace(/window\.FDBS_ROOT_PREFIX='[^']*';/,"window.FDBS_ROOT_PREFIX='"+base+"';");
 if(!hu.includes('window.FDBS_ROOT_PREFIX'))hu=hu.replace('<body>',"<body><script>window.FDBS_ROOT_PREFIX='"+base+"';</script>");
 hu=hu.replace(/(<link rel="canonical" href="https:\/\/doneazasange.ro)([^" ]*)/,'$1/hu$2');
 hu=hu.replace(/\s*<script id="fdbs-structured-data"[^>]*>[\s\S]*?<\/script>/g,'').replace(/\s*<link[^>]*hreflang=[^>]*>/g,'');
 const dest=path.join(root,'hu',file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,hu);
}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();page.on('pageerror',e=>console.log('PAGE ERROR',e.message));await page.route('https://**/*',r=>r.abort());
 const escape=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 for(const file of pages){
  const dest=path.join(root,'hu',file);console.log(file);await page.goto('file:///'+dest.replace(/\\/g,'/'),{waitUntil:'domcontentloaded'});await page.waitForSelector('main h1,main h2',{state:'attached',timeout:5000});
  const data=await page.evaluate(()=>{fdbsTranslateDOM(document.body);document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(raw.includes('index.html#/')){const route=raw.split('index.html#')[1];a.setAttribute('href','/hu'+publicRoutePath(route.split('?')[0])+(route.includes('?')?'?'+route.split('?')[1]:''))}else if(raw.startsWith('/')&&!raw.startsWith('/hu/')&&(Object.values(publicRoutes).includes(raw)||/^\/centre\/[^/]+\/$/.test(raw)))a.setAttribute('href','/hu'+raw)});return {title:document.querySelector('main h1,main h2').textContent.replace(/\s+/g,' ').trim()+' — FDBS',description:document.querySelector('main .page-hero p,main .hero p')?.textContent.trim()||document.querySelector('main h1,main h2').textContent,main:document.querySelector('main').innerHTML,header:document.querySelector('.site-header').outerHTML,footer:document.querySelector('.site-footer').outerHTML,cta:document.querySelector('#footer-cta').outerHTML,cookie:document.querySelector('.cookie-banner').outerHTML}});
  if(file==='index.html')data.title='FDBS — Adj vért';if(file==='despre-noi/index.html')data.title='Rólunk — FDBS';let html=fs.readFileSync(dest,'utf8');
  html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escape(data.title)+'</title>').replace(/(<meta name="description" content=")[^"]*("\s*\/>)/,(_,a,b)=>a+escape(data.description)+b);
  html=html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/,(_,a,b)=>a+data.main+b);
  html=html.replace(/(<meta property="og:title" content=")[^"]*("\s*\/>)/,(_,a,b)=>a+escape(data.title)+b).replace(/(<meta property="og:description" content=")[^"]*("\s*\/>)/,(_,a,b)=>a+escape(data.description)+b);
  html=html.replace(/<header[\s\S]*?<\/header>/,()=>data.header).replace(/<footer[\s\S]*?<\/footer>/,()=>data.footer);
  // Keep source scripts and translate shell text without persisting file:// navigation URLs.
  html=html.replace(/file:\/\/\/[^"<>]*?\/hu\/index.html#([^"<>]*)/g,(_,route)=>'/hu'+(route==='/'?'/':route.replace(/\/$/,'')+'/'));
  fs.writeFileSync(dest,html);
 }
 await browser.close();console.log('Generated '+pages.length+' Hungarian pages');
})().catch(e=>{console.error(e);process.exit(1)});

const countyNames=JSON.parse(fs.readFileSync(path.join(root,'i18n/hu-counties.json'),'utf8'));fs.writeFileSync(localePath,fs.readFileSync(localePath,'utf8').replace(/window.FDBS_HU_COUNTIES=\{[^\n]+\};/,()=>'window.FDBS_HU_COUNTIES='+JSON.stringify(countyNames)+';'));
