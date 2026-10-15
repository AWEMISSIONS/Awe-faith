import test from 'node:test';
import assert from 'node:assert/strict';
import {buildProduct,csv,validateDesign,catalogCategory} from '../shared.mjs';
const design=()=>({projectId:'test-123',title:'Faith, "Hope"',description:'<script>test</script>\nPurpose',price:29,colors:['Black','Natural'],sizes:['S','M'],rights:true});
test('Shopify drafts contain every variant and cannot oversell before fulfillment setup',()=>{
 const p=buildProduct(design());assert.equal(p.status,'DRAFT');assert.equal(p.variants.length,4);assert.equal(new Set(p.variants.map(v=>v.sku)).size,4);assert.ok(p.variants.every(v=>v.inventoryPolicy==='DENY'&&v.inventoryItem.tracked));assert.ok(!p.descriptionHtml.includes('<script>'));assert.equal(p.variants[0].price,'29.00');
});
test('CSV escapes merchant text and exports zero inventory with draft status',()=>{
 const text=csv(design());assert.ok(text.includes('"Faith, ""Hope"""'));assert.equal(text.split('\r\n').length,5);assert.ok(text.includes('"shopify","0","deny","manual","TRUE","draft"'));
});
test('Missing consent, invalid price and unavailable catalog combinations block actions',()=>{
 assert.throws(()=>validateDesign({...design(),rights:false}),/permission/);assert.throws(()=>validateDesign({...design(),price:0}),/positive/);assert.throws(()=>validateDesign({...design(),catalogId:71,variantMap:{}}),/Unavailable/);assert.throws(()=>validateDesign({...design(),colors:[]}),/combinations/);
});
test('Verified variant map supports all selected combinations',()=>{
 const d=design();d.catalogId=71;d.variantMap={'Black|S':1,'Black|M':2,'Natural|S':3,'Natural|M':4};assert.doesNotThrow(()=>validateDesign(d));
});
test('Sweatshirts and hoodies are classified separately and retain their type in Shopify exports',()=>{
 assert.equal(catalogCategory({title:'Unisex Premium Sweatshirt'}),'sweatshirt');
 assert.equal(catalogCategory({title:'Unisex Crew Neck T-Shirt'}),'tshirt');
 assert.equal(catalogCategory({title:'Hooded Sweatshirt'}),'hoodie');
 assert.equal(catalogCategory({title:'Ceramic mug'}),null);
 for(const [productCategory,type] of [['sweatshirt','Sweatshirt'],['hoodie','Hoodie']]){
   const d={...design(),productCategory};assert.equal(buildProduct(d).productType,type);assert.ok(csv(d).includes(`"${type}"`));
 }
});
