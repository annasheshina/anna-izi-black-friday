import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { campaign } from './campaign';
import content from './content.json';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import './style.css';

type Product = (typeof content.products)[number];
const products = content.products;
const venera = products.find(p=>p.id==='09')!;
const bundle = products.find(p=>p.id==='duo')!;
const guides = ['03','04'];
const levels = [
  { id:'discovery', roman:'I', name:'DISCOVERY', label:'Знакомство с собой', description:'Первые открытия, индивидуальные инструменты и возможность лучше узнать себя.', discountSummary:'Скидки до 40%', image:'shadow', count:4 },
  { id:'expansion', roman:'II', name:'EXPANSION', label:'Глубокое погружение', description:'Индивидуальная работа, исследование себя и новые знания.', discountSummary:'Скидки до 50%', image:'water', count:3 },
  { id:'transformation', roman:'III', name:'TRANSFORMATION', label:'Трансформация', description:'Мои самые глубокие авторские программы и длительная работа со мной.', discountSummary:'', image:'mountain', count:2 },
];
const money = (value:number) => new Intl.NumberFormat('ru-RU').format(value)+' ₽';
const price = (p:Product) => p.salePrice === null ? 'SECRET PRICE — уточняется индивидуально' : money(p.salePrice);
const campaignDiscounts: Record<string, number> = {
  '01':30, '02':30, '03':35, '04':35, '05':50, '06':50, '08':30, '07':25, '09':30,
};
const percent = new Intl.NumberFormat('ru-RU', { style:'percent', maximumFractionDigits:0 });
function discount(p:Product) {
  const configured=campaignDiscounts[p.id];
  if (configured !== undefined) return '−'+configured+'%'+(p.isSecretPrice?' на оба тарифа':'');
  if (p.oldPrice === null || p.salePrice === null || p.oldPrice <= p.salePrice) return '';
  return '−'+percent.format((p.oldPrice-p.salePrice)/p.oldPrice);
}
function DiscountBadge({label}:{label:string}) {
  const [value,...suffix]=label.split(' на ');
  return <span className="discount" role="img" aria-label={'Скидка '+label}>
    <span className="discount-star" aria-hidden="true">{value}</span>
    {suffix.length>0 && <span aria-hidden="true">на {suffix.join(' на ')}</span>}
  </span>;
}
const image = (name: keyof typeof campaign.images) => {
  const path=campaign.images[name];
  return path.startsWith('data:') ? path : import.meta.env.BASE_URL+path;
};
const available = (p:Product) => p.availability && p.capacity !== 0 && (p.id !== bundle.id || products.filter(item=>guides.includes(item.id)).every(item=>item.availability && item.capacity !== 0));
const initialSelection = () => {
  try {
    const ids:unknown = JSON.parse(localStorage.getItem('anna-izi-selection') ?? '[]');
    if (Array.isArray(ids)) return products.filter(p=>ids.includes(p.id) && (!ids.includes('duo') || !guides.includes(p.id))).map(p=>p.id);
  } catch { /* Storage may be unavailable in private browsing. */ }
  return [];
};

function Header({count,open,openThrough}:{count:number,open:()=>void,openThrough:number}) {
  const [menu,setMenu]=useState(false);
  const links=levels.map((level,index)=>index<openThrough
    ? <a key={level.id} href={'#'+level.id} onClick={()=>setMenu(false)}>{level.name}</a>
    : <span key={level.id} className="locked-nav" aria-label={level.name+' — закрыто'}>{level.name} <LockIcon/></span>);
  return <header><div className="header-inner">
    <a className="logo" href="#top">ANNA IZI</a>
    <nav aria-label="Уровни и продукты">{links}<a href="#welcome">О ПРОДУКТАХ</a></nav>
    {count ? <button className="button outline compact" onClick={open}>МОЙ ВЫБОР · {count}</button> : <a className="button outline compact" href="#levels">ВЫБРАТЬ СВОЁ</a>}
    <button className="menu-toggle" aria-label={menu?'Закрыть меню':'Открыть меню'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?'×':'☰'}</button>
    {menu && <div className="mobile-menu">{links}<a href="#welcome" onClick={()=>setMenu(false)}>О ПРОДУКТАХ</a></div>}
  </div></header>;
}

function Hero() {
  return <section className="hero" aria-labelledby="title"><div className="hero-photo"><img src={image('portrait')} alt="Портрет Анны Изи" fetchPriority="high" /></div>
    <div className="hero-content"><p className="eyebrow">PRIVATE</p><h1 id="title">BLACK<br/>FRIDAY</h1>
    <p className="date">27 — 29 НОЯБРЯ</p><hr/><p className="hero-quote">В этом году я предлагаю вам купить<br className="wide-only"/> не вещи. А новую версию себя.</p>
    <p className="topics">Психология · Астрология · Женственность · Обучение · Трансформация</p>
    <a className="button gold hero-button" href="#levels">ВЫБРАТЬ СВОЁ <span aria-hidden="true">⟶</span></a></div>
  </section>;
}

function CampaignInfo({status}:{status:string}) {
  return <><div className="campaign-info">{[['◇','3 уровня погружения'],['✧','9 авторских продуктов'],['⌛︎','Только 3 дня']].map(([icon,label])=><div key={label}><span aria-hidden="true">{icon}</span>{label}</div>)}</div>{status && <p className="campaign-status">{status}</p>}</>;
}

function WelcomeSection() {
  return <section id="welcome" className="welcome"><div className="welcome-art"><img src={image('hills')} alt="" loading="lazy"/></div>
    <div className="welcome-content"><h2 className="eyebrow">Привет, я Аня</h2>
      <p>Я собрала практически всю свою <strong>вселенную в одном месте.</strong><br/>Здесь есть психология и астрология, быстрые инструменты для себя и глубокая работа, которая меняет качество жизни.</p>
      <p>Я разделила все предложения на три уровня — не по цене,<br className="wide-only"/> а по глубине погружения. Выбирай то, что сейчас откликается тебе.</p>
      <img className="signature" src={image('signature')} alt="Анна Изи" loading="lazy"/>
      <details><summary>Письмо от Анны</summary><Paragraphs items={content.copy.welcome.split('\n\n')}/><p>С любовью,<br/>Анна Изи</p></details>
    </div></section>;
}

const levelOpeningDate: Record<string, string> = { expansion:'28.11', transformation:'29.11' };

function LockIcon() {
  return <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3"/></svg>;
}

function LevelNavigation({openThrough}:{openThrough:number}) {
  return <section className="levels" id="levels"><p className="eyebrow">ТРИ УРОВНЯ</p><h2>Выбери свою глубину</h2>
    <div className="level-grid">{levels.map((level,index)=><article key={level.id} className={'level-tile '+level.id+(index>=openThrough?' locked-tile':'')}>
      <img src={image(level.image as keyof typeof campaign.images)} alt="" loading="lazy"/>
      <div className="tile-content"><p className="eyebrow">LEVEL {level.roman}</p><h3>{level.name}</h3><p className="tile-label">{level.label}</p><hr/>
      <p className="tile-description">{level.description}</p>
      {index<openThrough ? <><p className="tile-count">{level.count} предложения{level.discountSummary && <strong>{level.discountSummary}</strong>}</p>
      <a className="button outline" href={'#'+level.id}>СМОТРЕТЬ <span aria-hidden="true">⟶</span></a></> :
      <><p className="tile-count">Скоро откроется</p><span className="button locked-label"><LockIcon/> Закрыто до {levelOpeningDate[level.id]}</span></>}</div>
    </article>)}</div>
  </section>;
}

function Paragraphs({items}:{items:string[]}) {
  return items.map((part,i)=>part.startsWith('- ')?<ul key={i}>{part.split('\n').filter(line=>line.startsWith('- ')).map(line=><li key={line}>{line.slice(2)}</li>)}</ul>:<p key={i}>{part}</p>);
}

function ProductArt({p}:{p:Product}) {
  if (p.id === bundle.id || guides.includes(p.id)) return <div className={'product-art journals '+(p.id==='04'?'silk':'')} aria-hidden="true">
    {p.id!=='04' && <div className="book sun-book"><small>ANNA IZI</small><span>SUN<br/>WAY</span></div>}
    {p.id!=='03' && <div className="book venus-book"><small>ANNA IZI</small><span>MY<br/>VENERA</span></div>}
  </div>;
  return <div className="product-art"><img src={image(p.image as keyof typeof campaign.images)} alt={p.id==='07'?'Анна Изи':''} loading="lazy"/></div>;
}

type Purchase = {selected:string[], enabled:boolean, toggle:(p:Product)=>void, inquire:(p:Product)=>void};
function PurchaseButton({p,actions,contact=false}:{p:Product,actions:Purchase,contact?:boolean}) {
  const chosen=actions.selected.includes(p.id) || (guides.includes(p.id)&&actions.selected.includes('duo'));
  const canChoose=available(p);
  return <button className="button primary" disabled={!canChoose || !actions.enabled} aria-pressed={chosen} onClick={()=>contact?actions.inquire(p):actions.toggle(p)}>
    {!canChoose?'МЕСТА ЗАНЯТЫ':chosen?'ВЫБРАНО ✓':p.buttonText}
  </button>;
}
function Prices({p}:{p:Product}) {
  const label=discount(p);
  return <div className="prices">{p.oldPrice!==null && <del>{money(p.oldPrice)}</del>}<strong>{price(p)}</strong>{label && <DiscountBadge label={label}/>}</div>;
}
function ProductCard({p,actions}:{p:Product,actions:Purchase}) {
  return <article className="product-card"><ProductArt p={p}/><div className="product-content">
    <p className="eyebrow">ЛОТ {p.lotNumber} · {p.englishName}</p><h3>{p.name}</h3><p className="product-headline">{p.headline}</p>
    <Paragraphs items={p.description.slice(0,1)}/>
    <details><summary>Подробнее</summary><Paragraphs items={p.description.slice(1)}/>{p.id==='06' && <p>Духовная практика не заменяет медицинскую помощь, диагностику или лечение.</p>}</details>
    <div className="format"><Paragraphs items={p.format}/>{p.capacity!==null && <p>{p.capacity===1?'1 место':p.capacity===0?'Места заняты':p.capacity+' мест'}</p>}</div>
    <Prices p={p}/><PurchaseButton p={p} actions={actions}/>
  </div></article>;
}
function LevelSection({level,actions}:{level:1|2,actions:Purchase}) {
  const first=level===1;
  return <section id={levels[level-1].id} className={'catalog '+(first?'light':'dark')}>
    <div className="section-heading"><p className="eyebrow">0{level} / {levels[level-1].name}</p><h2>{first?'Познакомиться с собой.':'Пойти глубже.'}</h2>
    <p>{first?'Иногда достаточно узнать что-то новое о себе, чтобы совершенно иначе посмотреть на свою жизнь.':'Когда хочется не просто получить информацию, а разобраться в себе, исследовать свои реакции или освоить новые инструменты.'}</p></div>
    <div className={first?'catalog-grid':'editorial-list'}>{content.products.filter(p=>p.level===level).map(p=><ProductCard key={p.id} p={p} actions={actions}/>)}</div>
    {first && <GuideBundle actions={actions}/>}
  </section>;
}
function GuideBundle({actions}:{actions:Purchase}) {
  return <article className="bundle"><ProductArt p={bundle}/><div className="product-content"><p className="eyebrow">{bundle.englishName}</p><h3>{bundle.name}</h3><p className="product-headline">{bundle.headline}</p><Paragraphs items={bundle.description}/><Prices p={bundle}/><PurchaseButton p={bundle} actions={actions}/></div></article>;
}
function EditorialTransition({deep=false}:{deep?:boolean}) {
  return deep?<section id="transformation" className="transition mountain-scene"><img src={image('mountain')} alt="" loading="lazy"/><div><p className="eyebrow">03 / TRANSFORMATION</p><h2>Не просто узнать о себе новое.<br/>А начать жить иначе.</h2><p>Мои самые глубокие форматы для тех, кто хочет посвятить себе следующие два месяца.</p></div></section>:
  <section className="transition"><h2>Иногда нам достаточно узнать что-то новое о себе.</h2><p>А иногда хочется пойти глубже и понять, почему мы снова и снова оказываемся в одних и тех же ситуациях.</p><hr/></section>;
}
function PrivateWorkSection({actions}:{actions:Purchase}) {
  const p=content.products.find(p=>p.id==='07')!;
  return <section className="private-work"><ProductArt p={p}/><div className="product-content"><p className="eyebrow">ЛОТ 07 · {p.englishName}</p><h2>{p.headline}</h2><Paragraphs items={p.description}/><div className="format"><Paragraphs items={p.format}/>{p.capacity!==null && <p>{p.capacity===1?'1 место':p.capacity===0?'Места заняты':p.capacity+' мест'}</p>}</div><Prices p={p}/><PurchaseButton p={p} actions={actions} contact/><p>Если тебе откликается этот формат, мы можем предварительно обсудить твой запрос.</p></div></section>;
}
function VeneraSection({actions}:{actions:Purchase}) {
  const p=venera;
  return <section className="venera light">
    <div className="venera-hero"><img src={image('water')} alt="" loading="lazy"/><div><p className="eyebrow">ANNA IZI PRESENTS</p><p className="eyebrow">МОЙ ЛЕГЕНДАРНЫЙ КУРС</p><h2>VENERA</h2><p className="eyebrow">ПРОБУЖДЕНИЕ ЖЕНЩИНЫ</p></div></div>
    <div className="venera-copy"><h3>{p.headline}</h3><Paragraphs items={p.description}/></div>
    <div className="venera-format">{p.format.map(label=><span key={label}>{label.toUpperCase()}</span>)}</div>
    <p className="venera-note">Роскошные задания и работа с мышлением.</p>
    <div className="secret"><p className="eyebrow">PRIVATE BLACK FRIDAY OFFER</p><h3>SECRET PRICE</h3><div className="secret-discount"><DiscountBadge label={discount(p)}/></div><p>На Чёрную пятницу я подготовила особые условия участия в моём легендарном курсе.</p><p>Хочешь узнать подробности и выбрать свой формат?</p><PurchaseButton p={p} actions={actions} contact/></div>
  </section>;
}
function FinalCTA({help}:{help:()=>void}) {
  return <section className="final"><p className="eyebrow">ANNA IZI — PRIVATE BLACK FRIDAY</p><h2>Что сейчас твоё?</h2><Paragraphs items={content.copy.final.split('\n\n')}/><div className="actions"><a className="button gold" href="#levels">ВЫБРАТЬ СВОЁ ↑</a><button className="button outline" onClick={help}>ПОМОГИ МНЕ ВЫБРАТЬ</button></div></section>;
}
function Footer() {
  const links=[['Telegram',campaign.contact],['Контакты',campaign.contact],['Политика конфиденциальности',campaign.legal.privacy],['Условия приобретения',campaign.legal.terms],['Публичная оферта',campaign.legal.offer]];
  return <footer><div><a className="logo" href="#top">ANNA IZI</a><p>Psychology · Astrology · Conscious Living</p></div><div>PRIVATE BLACK FRIDAY 2026<p>27–29 ноября</p></div>{links.some(([,url])=>url)&&<nav aria-label="Контакты и документы">{links.filter(([,url])=>url).map(([name,url])=><a key={name} href={url}>{name}</a>)}</nav>}</footer>;
}
function Modal({title,close,children,drawer=false}:{title:string,close:()=>void,children:ReactNode,drawer?:boolean}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current;dialog?.showModal();return ()=>{dialog?.close();};},[]);
  return <dialog ref={ref} className={drawer?'dialog drawer':'dialog'} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
    <div className="dialog-content"><button className="close" aria-label="Закрыть" onClick={close}>×</button><h2 id="dialog-title">{title}</h2>{children}</div>
  </dialog>;
}
function RequestText({message}:{message:string}) {
  const [copied,setCopied]=useState('');
  const copy=async()=>{try {await navigator.clipboard.writeText(message);setCopied('Текст скопирован.');} catch {setCopied('Выдели и скопируй текст из поля.');}};
  return <><textarea readOnly value={message} aria-label="Текст заявки" onFocus={e=>e.currentTarget.select()}/><p>Скопируй это сообщение и отправь мне в личные сообщения.</p><div className="actions"><button className="button primary" onClick={copy}>СКОПИРОВАТЬ</button>{campaign.contact&&<a className="button outline" href={campaign.contact+'?text='+encodeURIComponent(message)} target="_blank" rel="noreferrer">Отправить в ЛС</a>}</div><p role="status">{copied}</p></>;
}
function SelectionDrawer({items,total,remove,actions,close}:{items:Product[],total:string,remove:(id:string)=>void,actions:Purchase,close:()=>void}) {
  const savings=items.length && items.every(p=>p.oldPrice!==null && p.salePrice!==null)?items.reduce((sum,p)=>sum+p.oldPrice!-p.salePrice!,0):null;
  const request='Привет! Хочу воспользоваться предложениями BLACK FRIDAY.\n\nМой выбор:\n'+items.map((p,i)=>(i+1)+'. '+p.name+' — '+price(p)+'.').join('\n')+'\n\nИтого: '+total+'.\n\nХочу уточнить условия приобретения.';
  return <Modal title="Мой выбор" close={close} drawer>{items.length?<><ul className="selection-list">{items.map(p=><li key={p.id}><div><strong>{p.name}</strong><div>{p.oldPrice!==null && <del>{money(p.oldPrice)}</del>} {price(p)}</div>{discount(p) && <DiscountBadge label={discount(p)}/>}{actions.enabled && available(p) && campaign.payment[p.id] && <a href={campaign.payment[p.id]}>Перейти к оплате</a>}</div><button className="remove" aria-label={'Удалить '+p.name} onClick={()=>remove(p.id)}>×</button></li>)}</ul>
    {guides.every(id=>actions.selected.includes(id)) && available(bundle) && actions.enabled && <div className="bundle-prompt"><p>Ты выбрала оба журнала. Для тебя есть специальная цена комплекта — 8 888 ₽ вместо 10 000 ₽.</p><button className="button primary" onClick={()=>actions.toggle(bundle)}>ВЫБРАТЬ КОМПЛЕКТ</button></div>}
    <p><strong>Итого: {total}</strong></p>{savings!==null&&<p>Выгода: {money(savings)}</p>}<RequestText message={request}/></>:<p>Подборка пока пуста.</p>}</Modal>;
}
function ContactModal({p,actions,close}:{p:Product|null,actions:Purchase,close:()=>void}) {
  const chosen=p && actions.selected.includes(p.id);
  const message=p?.isSecretPrice?'Привет! Хочу узнать SECRET PRICE, условия участия и подробности обоих тарифов курса VENERA.':p?'Привет! Хочу обсудить персональное сопровождение и мой запрос.':'Привет! Помоги мне, пожалуйста, выбрать подходящий формат на Чёрную пятницу.';
  return <Modal title={p?.isSecretPrice?'Узнать SECRET PRICE':p?'Личное сопровождение':'Помоги мне выбрать'} close={close}>
    <p>{p?.isSecretPrice?`Запроси условия участия в VENERA. Скидка на Чёрную пятницу ${discount(p)}.`:p?'Расскажи Анне, с каким запросом хочешь поработать.':'Расскажи, что тебя сейчас интересует, чтобы Анна могла подсказать формат.'}</p>
    {p&&<button className="button outline" disabled={!actions.enabled || !available(p) || !!chosen} onClick={()=>actions.toggle(p)}>{chosen?'ВЫБРАНО ✓':'ДОБАВИТЬ В МОЙ ВЫБОР'}</button>}
    <RequestText message={message}/>
  </Modal>;
}
function App() {
  const [selected,setSelected]=useState(initialSelection);
  const [modal,setModal]=useState<'selection'|'help'|Product|null>(null);
  const [now,setNow]=useState(Date.now);
  useEffect(()=>{const refresh=()=>setNow(Date.now());const id=setInterval(refresh,1000);window.addEventListener('focus',refresh);return ()=>{clearInterval(id);window.removeEventListener('focus',refresh);};},[]);
  useEffect(()=>{try {localStorage.setItem('anna-izi-selection',JSON.stringify(selected));}catch { /* The session selection still works. */ }},[selected]);
  const preview=campaign.preview || location.protocol==='file:' || (import.meta.env.DEV && new URLSearchParams(location.search).get('preview')==='1');
  const previewDay=document.querySelector<HTMLMetaElement>('meta[name="campaign-preview-day"]')?.content;
  const openThrough=previewDay==='1'?1:previewDay==='2'?2:campaign.openThrough;
  const before=now < Date.parse(campaign.start);
  const ended=now >= Date.parse(campaign.end);
  const enabled=preview || (!before && !ended);
  const status=preview?(previewDay?'Предпросмотр · День '+previewDay:'Режим предварительного просмотра'):before?'Предложения откроются 27 ноября в 00:00 по Москве.':ended?'Специальные условия Чёрной пятницы завершились.':'';
  const remove=(id:string)=>setSelected(current=>current.filter(key=>key!==id));
  const actions:Purchase={selected,enabled,inquire:setModal,toggle:p=>{
    if (!enabled || p.level>openThrough || !available(p)) return;
    setSelected(current=>{
      if(current.includes(p.id)) return current.filter(id=>id!==p.id);
      if(guides.includes(p.id) && current.includes('duo')) return current;
      return [...current.filter(id=>p.id!=='duo' || !guides.includes(id)),p.id];
    });
  }};
  const items=products.filter(p=>p.level<=openThrough && selected.includes(p.id));
  const known=items.filter(p=>p.salePrice!==null);
  const total=[known.length?money(known.reduce((sum,p)=>sum+p.salePrice!,0)):'',items.some(p=>p.isSecretPrice)?'стоимость VENERA':''].filter(Boolean).join(' + ');
  return <div id="top"><Header count={items.length} open={()=>setModal('selection')} openThrough={openThrough}/><main><Hero/><CampaignInfo status={status}/><WelcomeSection/><LevelNavigation openThrough={openThrough}/><LevelSection level={1} actions={actions}/>{openThrough>=2 && <><EditorialTransition/><LevelSection level={2} actions={actions}/></>}{openThrough>=3 && <><EditorialTransition deep/><PrivateWorkSection actions={actions}/><VeneraSection actions={actions}/></>}<FinalCTA help={()=>setModal('help')}/></main><Footer/>
  {items.length>0 && <aside className="selection-bar" aria-label="Твоя подборка"><span>МОЙ ВЫБОР · {items.length} {items.length===1?'продукт':items.length<5?'продукта':'продуктов'} · {total}</span><button className="button gold compact" onClick={()=>setModal('selection')}>ПОСМОТРЕТЬ →</button></aside>}
  {modal==='selection'&&<SelectionDrawer items={items} total={total} remove={remove} actions={actions} close={()=>setModal(null)}/>}
  {modal&&modal!=='selection'&&<ContactModal p={modal==='help'?null:modal} actions={actions} close={()=>setModal(null)}/>}</div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
