// Reproducible HTML-to-PDF export. Uses the project's test browser because the
// native browser has no standalone HTML PDF-export capability.
const {chromium}=require('@playwright/test');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto('http://127.0.0.1:4311/slides/',{waitUntil:'networkidle'});
 await page.emulateMedia({media:'print'});
 const count=await page.locator('section.slide').count();if(count!==10)throw Error('Expected ten slides');
 fs.mkdirSync('video/build/deck-review',{recursive:true});
 for(let i=0;i<count;i++){
  const slide=page.locator('section.slide').nth(i);
  const fits=await slide.evaluate(el=>el.scrollHeight<=el.clientHeight && el.scrollWidth<=el.clientWidth);
  if(!fits)throw Error('Slide '+(i+1)+' overflows');
  await slide.screenshot({path:`video/build/deck-review/slide-${i+1}.png`});
 }
 await page.pdf({path:'slides/family-table-review.pdf',preferCSSPageSize:true,printBackground:true});
 await browser.close();console.log('Exported ten slides with no slide-container overflow.');
})().catch(e=>{console.error(e);process.exit(1)});
