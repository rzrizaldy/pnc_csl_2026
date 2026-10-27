const {test,expect}=require('@playwright/test');
test('every persona route renders without errors or horizontal overflow',async({page})=>{
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const routes=['','advisor','advisor/align','advisor/docs','advisor/plan', ...['walt','marisa','dale','kyle','ross','sloane'].flatMap(id=>['','/checkin','/options','/plan'].map(s=>'me/'+id+s))];
 for(const route of routes){await page.goto('/prototype/#/'+route); await expect(page.locator('#app')).not.toBeEmpty(); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route).toBeTruthy();}
 expect(errors).toEqual([]);
});
test('sharing is explicit, withdrawable and invalidates approval',async({page})=>{
 await page.goto('/prototype/?reset#/advisor/align');
 await expect(page.getByRole('heading',{name:'Nothing shared yet.'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Approve for advisor preparation'})).toBeDisabled();
 await page.goto('/prototype/#/me/sloane/checkin');
 await expect(page.getByRole('switch',{name:'Share answer 1 with Alex'})).toHaveAttribute('aria-checked','false');
 await page.getByRole('switch',{name:'Share answer 1 with Alex'}).click();
 await page.goto('/prototype/#/advisor/align');
 await expect(page.locator('.quote')).toContainText("Dad told me two years ago");
 await expect(page.locator('.quote')).not.toContainText('Equal shares');
 await page.getByRole('button',{name:'Approve for advisor preparation'}).click();
 await page.goto('/prototype/#/me/sloane/checkin');
 await page.getByRole('switch',{name:'Share answer 1 with Alex'}).click();
 await page.goto('/prototype/#/advisor/align');
 await expect(page.locator('.quote')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Approve for advisor preparation'})).toBeDisabled();
});
test('editing requires sharing again; markup is rendered as text',async({page})=>{
 await page.goto('/prototype/?reset#/me/sloane/checkin');
 await page.getByRole('switch',{name:'Share answer 1 with Alex'}).click();
 const field=page.getByRole('textbox',{name:'Who do you think should lead after the sale, and why?'});
 await field.fill('<img src=x onerror="window.injected=true">');
 await expect(page.getByRole('switch',{name:'Share answer 1 with Alex'})).toHaveAttribute('aria-checked','false');
 await page.getByRole('switch',{name:'Share answer 1 with Alex'}).click();
 await page.goto('/prototype/#/advisor/align');
 await expect(page.locator('.quote')).toContainText('<img');
 await expect(page.locator('.quote img')).toHaveCount(0);
 expect(await page.evaluate(()=>window.injected)).toBeUndefined();
});
test('all gift weights reconcile; outside-bank heirs range is 9 to 10',async({page})=>{
 await page.goto('/prototype/?reset#/me/dale/options');
 const totals=await page.evaluate(()=>Array.from({length:101},(_,w)=>{const g=FT.gifts(w/100);return {sum:Object.values(g).reduce((a,b)=>a+b,0),outside:g.dale+g.ross+g.sloane};}));
 for(const t of totals)expect(t.sum).toBeCloseTo(12,8);
 expect(totals[0].outside).toBe(9);expect(totals[100].outside).toBe(10);
 expect(await page.evaluate(()=>FT.net())).toBe(27);
 await page.getByRole('button',{name:'Equity counted',exact:true}).click();
 await expect(page.locator('[data-mine]')).toHaveText('$3.5M');
});
test('routing a document does not authorize family disclosure',async({page})=>{
 await page.goto('/prototype/?reset#/advisor/docs');
 await page.getByRole('button',{name:'Family attorney to confirm',exact:true}).click();
 await expect(page.getByRole('button',{name:'Notify the four children'})).toHaveCount(0);
});
test('showcase and deck load at both sizes',async({page})=>{
 for(const url of ['/','/case.html','/architecture.html','/slides/']){
 const response=await page.goto(url);expect(response.status()).toBe(200);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),url).toBeTruthy();
 }
 await expect(page.locator('section.slide')).toHaveCount(10);
});
