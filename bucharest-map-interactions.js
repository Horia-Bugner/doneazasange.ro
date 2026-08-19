(()=>{
  let currentMap;
  const label=c=>c.hours?`${['CTS Prahova','CTS Vrancea','CRTS Galați'].includes(c.name)?'':`${c.days}, `}${c.hours}`:c.days;
  const popupHtml=c=>`<b>${c.name}</b><small>${c.address}, ${c.city}<br>${c.hours?label(c):'Programul urmează să fie completat'}</small>`;
  function enhance(){
    const container=document.getElementById('bucharest-map');
    if(!container||!window.maplibregl)return;
    currentMap?.remove();container.innerHTML='';
    currentMap=new maplibregl.Map({container,style:'https://tiles.openfreemap.org/styles/bright',center:[26.095,44.442],zoom:12,minZoom:10,maxZoom:17,attributionControl:false});
    currentMap.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
    currentMap.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a> · <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a>'}));
    currentMap.on('load',()=>{
      currentMap.addSource('bucharest-sectors',{type:'geojson',data:'assets/bucharest-sectors.geojson'});
      currentMap.addLayer({id:'bucharest-sector-fill',type:'fill',source:'bucharest-sectors',paint:{'fill-color':'#b51f35','fill-opacity':.018}});
      currentMap.addLayer({id:'bucharest-sector-lines',type:'line',source:'bucharest-sectors',paint:{'line-color':'#7d6861','line-width':1.6,'line-opacity':.72,'line-dasharray':[3,2]}});
    });
    const correctedCoordinates={'CTS București':[44.453758,26.079757],'CTS MApN — Spitalul Militar':[44.442995,26.073507],'Spitalul Universitar':[44.436055,26.072064],'Spitalul Clinic „Prof. Dr. D. Gerota”':[44.440621,26.123954]};
    const centres=window.FDBS_DATA.centres.filter(c=>c.city==='București').map(c=>{const p=correctedCoordinates[c.name];return p?{...c,lat:p[0],lng:p[1]}:c});
    centres.forEach((c,i)=>{
      const directions=document.querySelector(`[data-city-centre-id="${c.id}"] a[href*="google.com/maps/dir"]`);if(directions)directions.href=`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
      const wrap=document.createElement('div'),button=document.createElement('button');
      wrap.className='map-centre-marker';button.className='bucharest-marker';button.type='button';button.innerHTML=`<span>${i+1}</span>`;button.setAttribute('aria-label',`${c.name}, ${c.address}`);wrap.append(button);
      const popup=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:30,className:'fdbs-centre-popup',maxWidth:'260px'}).setHTML(popupHtml(c));
      const show=()=>popup.setLngLat([c.lng,c.lat]).addTo(currentMap),hide=()=>popup.remove();
      button.addEventListener('mouseenter',show);button.addEventListener('mouseleave',hide);button.addEventListener('focus',show);button.addEventListener('blur',hide);
      button.addEventListener('click',()=>{const card=document.querySelector(`[data-city-centre-id="${c.id}"]`);card?.focus({preventScroll:true});card?.scrollIntoView({behavior:'smooth',block:'start'})});
      new maplibregl.Marker({element:wrap,anchor:'bottom'}).setLngLat([c.lng,c.lat]).addTo(currentMap);
    });
  }
  window.addEventListener('hashchange',()=>setTimeout(enhance));enhance();
})();
