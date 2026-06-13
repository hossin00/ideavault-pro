import { useState } from 'react';
import { Lightbulb, Plus, Trash2, Search, Sparkles, Loader, Hash, X, Star, Grid, List } from 'lucide-react';
import { format } from 'date-fns';
import { ai } from './utils/ai';

interface Idea { id:string; title:string; content:string; tags:string[]; color:string; starred:boolean; expanded?:string; createdAt:number; }
const COLORS=['#a855f7','#3b82f6','#10b981','#f59e0b','#ec4899','#6366f1'];
const SAVE='iv_ideas_v1';
const load=():Idea[]=>{ try{return JSON.parse(localStorage.getItem(SAVE)||'[]')}catch{return []} };

export default function App() {
  const [ideas,setIdeas]=useState<Idea[]>(load);
  const [search,setSearch]=useState('');
  const [filterTag,setFilter]=useState('');
  const [gridView,setGrid]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [editItem,setEdit]=useState<Idea|null>(null);

  const save=(items:Idea[])=>{ setIdeas(items); localStorage.setItem(SAVE,JSON.stringify(items)); };
  const allTags=[...new Set(ideas.flatMap(i=>i.tags))].sort();
  const filtered=ideas.filter(i=>{
    const ms=!search||i.title.toLowerCase().includes(search.toLowerCase())||i.content.toLowerCase().includes(search.toLowerCase())||i.tags.some(t=>t.includes(search.toLowerCase()));
    const mt=!filterTag||i.tags.includes(filterTag);
    return ms&&mt;
  }).sort((a,b)=>(b.starred?1:0)-(a.starred?1:0)||b.createdAt-a.createdAt);

  return (
    <div style={{minHeight:'100vh',background:'#0a080f',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #1e0a3c',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#a855f7,#7e22ce)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px #a855f730'}}><Lightbulb size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>IdeaVault</div>
          <div style={{fontSize:'11px',color:'#4a1d96',marginTop:'2px'}}>{ideas.length} ideas captured</div></div>
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          <button onClick={()=>setGrid(!gridView)} style={{padding:'7px',borderRadius:'7px',background:gridView?'#a855f720':'none',border:'none',cursor:'pointer',color:gridView?'#d8b4fe':'#4a1d96'}}>
            {gridView?<List size={15}/>:<Grid size={15}/>}
          </button>
          <button onClick={()=>{setEdit(null);setShowAdd(true);}} style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'9px',background:'#a855f7',border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 12px #a855f730'}}>
            <Plus size={13}/> Capture
          </button>
        </div>
      </header>
      <div style={{flex:1,overflow:'auto',padding:'16px 20px'}}>
        <div style={{position:'relative',marginBottom:'12px'}}>
          <Search size={13} style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',color:'#4a1d96'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ideas…" style={{width:'100%',background:'#160c24',border:'1px solid #1e0a3c',borderRadius:'10px',padding:'9px 12px 9px 34px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter'}} onFocus={e=>e.target.style.borderColor='#a855f7'} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
        </div>
        {allTags.length>0&&<div style={{display:'flex',gap:'6px',overflowX:'auto',marginBottom:'14px',paddingBottom:'2px'}}>
          {['All',...allTags].map(t=><button key={t} onClick={()=>setFilter(t==='All'?'':t)} style={{flexShrink:0,display:'flex',alignItems:'center',gap:'4px',padding:'4px 12px',borderRadius:'20px',border:`1px solid ${(t==='All'&&!filterTag)||(filterTag===t)?'#a855f7':'#1e0a3c'}`,background:(t==='All'&&!filterTag)||(filterTag===t)?'#a855f715':'transparent',color:(t==='All'&&!filterTag)||(filterTag===t)?'#d8b4fe':'#4a1d96',fontSize:'12px',cursor:'pointer',fontFamily:'Inter',whiteSpace:'nowrap'}}>
            {t!=='All'&&<Hash size={9}/>}{t}
          </button>)}
        </div>}
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'52px',marginBottom:'16px'}}>💡</div>
            <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>{ideas.length===0?'Capture your first idea':'No matches'}</h3>
            <p style={{color:'#4a1d96',fontSize:'14px',marginBottom:'24px',lineHeight:'1.6',maxWidth:'240px',margin:'0 auto 24px'}}>
              {ideas.length===0?'Every great thing starts with an idea. Capture it before it vanishes.':'Try different search terms.'}
            </p>
            {ideas.length===0&&<button onClick={()=>setShowAdd(true)} style={{padding:'12px 24px',borderRadius:'10px',background:'#a855f7',border:'none',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 16px #a855f730'}}>Capture first idea</button>}
          </div>
        ):(
          <div style={gridView?{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}:{display:'flex',flexDirection:'column',gap:'8px'}}>
            {filtered.map(idea=>(
              <div key={idea.id} style={{background:'#160c24',border:`1px solid ${idea.color}25`,borderRadius:'12px',padding:'14px',cursor:'pointer',transition:'all 0.2s',position:'relative'}}
                onClick={()=>{setEdit(idea);setShowAdd(true);}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';(e.currentTarget as HTMLElement).style.boxShadow=`0 8px 24px ${idea.color}15`;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='none';}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:idea.color,marginBottom:'8px'}}/>
                <div style={{fontSize:'13px',fontWeight:'600',color:'white',marginBottom:'5px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:gridView?'nowrap':'normal'}}>{idea.title||'Untitled'}</div>
                {idea.content&&<div style={{fontSize:'12px',color:'#7c3aed',lineHeight:'1.5',display:'-webkit-box',WebkitLineClamp:gridView?3:2,WebkitBoxOrient:'vertical',overflow:'hidden',marginBottom:'8px'}}>{idea.content}</div>}
                {idea.expanded&&<div style={{fontSize:'11px',color:'#a855f7',lineHeight:'1.5',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',marginBottom:'8px',fontStyle:'italic'}}>{idea.expanded}</div>}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'10px',color:'#4a1d96'}}>{format(new Date(idea.createdAt),'MMM d')}</span>
                  <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                    {idea.tags.slice(0,2).map(t=><span key={t} style={{fontSize:'10px',color:'#7c3aed'}}>#{t}</span>)}
                    {idea.starred&&<Star size={11} style={{color:'#f59e0b'}} fill="#f59e0b"/>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAdd&&<IdeaModal idea={editItem} onSave={idea=>{const u=ideas.find(i=>i.id===idea.id)?ideas.map(i=>i.id===idea.id?idea:i):[idea,...ideas];save(u);setShowAdd(false);setEdit(null);}} onDelete={editItem?()=>{save(ideas.filter(i=>i.id!==editItem.id));setShowAdd(false);setEdit(null);}:undefined} onClose={()=>{setShowAdd(false);setEdit(null);}}/>}
    </div>
  );
}

function IdeaModal({idea,onSave,onDelete,onClose}:{idea:Idea|null;onSave:(i:Idea)=>void;onDelete?:()=>void;onClose:()=>void}) {
  const [title,setTitle]=useState(idea?.title||'');
  const [content,setContent]=useState(idea?.content||'');
  const [color,setColor]=useState(idea?.color||COLORS[0]);
  const [starred,setStarred]=useState(idea?.starred||false);
  const [tags,setTags]=useState<string[]>(idea?.tags||[]);
  const [tagInput,setTagInput]=useState('');
  const [expanded,setExpanded]=useState(idea?.expanded||'');
  const [aiLoad,setAiL]=useState(false);
  const inp={width:'100%',background:'#0a080f',border:'1px solid #1e0a3c',borderRadius:'10px',padding:'11px 14px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter',transition:'border-color 0.2s'};

  const expand=async()=>{
    if(!content.trim()||aiLoad)return;
    setAiL(true);
    const res=await ai(`Expand this idea with more angles, applications, and possibilities:

"${content}"`, 'You are an idea expansion expert. Add 2-3 fresh angles or applications for the idea. Be specific and creative. Keep it brief.');
    setExpanded(res); setAiL(false);
  };

  const submit=()=>{
    if(!title.trim()&&!content.trim())return;
    onSave({id:idea?.id||crypto.randomUUID(),title:title.trim()||content.slice(0,40),content:content.trim(),color,starred,tags,expanded,createdAt:idea?.createdAt||Date.now()});
  };

  return (
    <div style={{position:'fixed',inset:0,background:'#00000080',zIndex:50,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:'100%',background:'#160c24',borderRadius:'20px 20px 0 0',border:'1px solid #1e0a3c',borderBottom:'none',padding:'24px',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{width:'36px',height:'3px',background:'#1e0a3c',borderRadius:'2px',margin:'0 auto 20px'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h3 style={{color:'white',fontSize:'16px',fontWeight:'700',fontFamily:'Inter'}}>{idea?'Edit Idea':'New Idea'}</h3>
          <div style={{display:'flex',gap:'6px'}}>
            {onDelete&&<button onClick={onDelete} style={{padding:'6px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',color:'#4a1d96'}}><Trash2 size={14}/></button>}
            <button onClick={()=>setStarred(!starred)} style={{padding:'6px',borderRadius:'7px',background:starred?'#f59e0b15':'none',border:'none',cursor:'pointer',color:starred?'#f59e0b':'#4a1d96'}}><Star size={14} fill={starred?'#f59e0b':'none'}/></button>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#4a1d96'}}><X size={16}/></button>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{display:'flex',gap:'6px',marginBottom:'2px'}}>
            {COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:'20px',height:'20px',borderRadius:'50%',background:c,border:`2px solid ${color===c?'white':c+'60'}`,cursor:'pointer',transition:'all 0.15s',transform:color===c?'scale(1.2)':'scale(1)'}}/>)}
          </div>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Idea title (optional)" style={inp} autoFocus onFocus={e=>e.target.style.borderColor='#a855f7'} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Describe your idea…" rows={4} style={{...inp,resize:'none',lineHeight:'1.6'}} onFocus={e=>e.target.style.borderColor='#a855f7'} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
          <button onClick={expand} disabled={!content.trim()||aiLoad} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',borderRadius:'10px',background:'#a855f715',border:'1px solid #a855f725',color:'#d8b4fe',fontSize:'13px',fontWeight:'500',cursor:content.trim()&&!aiLoad?'pointer':'not-allowed',fontFamily:'Inter',opacity:!content.trim()||aiLoad?0.5:1}}>
            {aiLoad?<Loader size={13} style={{animation:'spin 1s linear infinite'}}/>:<Sparkles size={13}/>} ✦ AI Expand this idea
          </button>
          {expanded&&<div style={{padding:'12px',borderRadius:'10px',background:'#a855f710',border:'1px solid #a855f725',fontSize:'13px',color:'#d8b4fe',lineHeight:'1.7',fontStyle:'italic'}}>{expanded}</div>}
          <div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'8px'}}>
              {tags.map(t=><span key={t} style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',padding:'3px 10px',borderRadius:'20px',background:'#1e0a3c',color:'#a855f7'}}>
                <Hash size={9}/>#{t}<button onClick={()=>setTags(tags.filter(x=>x!==t))} style={{background:'none',border:'none',cursor:'pointer',color:'#4a1d96',padding:'0',display:'flex'}}><X size={10}/></button>
              </span>)}
            </div>
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const t=tagInput.trim().toLowerCase().replace(/\s+/g,'-');if(t&&!tags.includes(t)&&tags.length<6)setTags([...tags,t]);setTagInput('');}}} placeholder="Add tag + Enter" style={{...inp,maxWidth:'220px'}} onFocus={e=>e.target.style.borderColor='#a855f7'} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
          </div>
          <button onClick={submit} disabled={!title.trim()&&!content.trim()} style={{padding:'14px',borderRadius:'12px',background:!title.trim()&&!content.trim()?'#1e0a3c':'#a855f7',border:'none',color:'white',fontSize:'15px',fontWeight:'700',cursor:!title.trim()&&!content.trim()?'not-allowed':'pointer',fontFamily:'Inter',opacity:!title.trim()&&!content.trim()?0.5:1}}>{idea?'Save Changes':'Capture Idea'}</button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}