let cart = [];
let activeCategory = "الكل";

const $ = (s) => document.querySelector(s);
const money = (n) => `${n.toFixed(2)} ${CAFE.currency}`;

function waLink(message) {
  const number = (CAFE.whatsapp || "").replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function renderFilters() {
  const cats = ["الكل", ...new Set(PRODUCTS.map(p => p.category))];
  $("#filters").innerHTML = cats.map(c => `<button class="filter ${c===activeCategory?"active":""}" onclick="setCategory('${c}')">${c}</button>`).join("");
}
function setCategory(c){activeCategory=c;renderFilters();renderProducts();}
function renderProducts(){
  const list = activeCategory==="الكل" ? PRODUCTS : PRODUCTS.filter(p=>p.category===activeCategory);
  $("#products").innerHTML = list.map(p=>`
    <article class="product">
      <div class="product-icon">${p.emoji}</div>
      <h3>${p.name}</h3>
      <div class="desc">${p.desc}</div>
      <div class="price">${money(p.price)}</div>
      <button class="btn add" onclick="addToCart(${p.id})">+ أضف للطلب</button>
    </article>`).join("");
}
function addToCart(id){
  const item=cart.find(x=>x.id===id);
  if(item)item.qty++; else cart.push({id,qty:1});
  updateCart();
}
function changeQty(id,d){
  const item=cart.find(x=>x.id===id); if(!item)return;
  item.qty+=d; if(item.qty<=0)cart=cart.filter(x=>x.id!==id); updateCart(); renderModal();
}
function totals(){return cart.reduce((a,x)=>{const p=PRODUCTS.find(p=>p.id===x.id);return {count:a.count+x.qty,total:a.total+p.price*x.qty}}, {count:0,total:0})}
function updateCart(){
  const t=totals(); $("#cartCount").textContent=t.count; $("#cartTotal").textContent=money(t.total);
  $("#cartBar").classList.toggle("hidden",t.count===0);
}
function renderModal(){
  $("#cartItems").innerHTML = cart.length ? cart.map(x=>{
    const p=PRODUCTS.find(p=>p.id===x.id);
    return `<div class="cart-line"><span>${p.name} × ${x.qty}</span><span class="qty"><button onclick="changeQty(${p.id},-1)">−</button><button onclick="changeQty(${p.id},1)">+</button></span></div>`;
  }).join("") : "<p>السلة فارغة.</p>";
}
function openModal(){if(!cart.length)return;renderModal();$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
function sendOrder(){
  if(!cart.length)return;
  const name=$("#customerName").value.trim()||"زبون";
  const time=$("#pickupTime").value.trim()||"أقرب وقت";
  const notes=$("#notes").value.trim()||"لا يوجد";
  const lines=cart.map(x=>{const p=PRODUCTS.find(p=>p.id===x.id);return `• ${p.name} × ${x.qty} = ${money(p.price*x.qty)}`}).join("\n");
  const t=totals();
  const msg=`☕ طلب مسبق - ${CAFE.name}\n\nالاسم: ${name}\nوقت الاستلام: ${time}\n\n${lines}\n\nالإجمالي: ${money(t.total)}\nملاحظات: ${notes}`;
  window.open(waLink(msg),"_blank");
}

document.addEventListener("DOMContentLoaded",()=>{
  $("#year").textContent=new Date().getFullYear();
  $("#address").textContent=`📍 ${CAFE.address}`;
  $("#hours").textContent=`🕐 ${CAFE.hours}`;
  $("#instagram").href=CAFE.instagram; $("#facebook").href=CAFE.facebook;
  const heroMsg=`مرحبا ${CAFE.name}، بدي أعمل طلب مسبق.`;
  $("#heroWhatsapp").href=waLink(heroMsg); $("#contactWhatsapp").href=waLink(heroMsg);
  renderFilters(); renderProducts(); updateCart();
  $("#checkoutBtn").onclick=openModal; $("#closeModal").onclick=closeModal; $("#sendOrder").onclick=sendOrder;
  $("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
});
