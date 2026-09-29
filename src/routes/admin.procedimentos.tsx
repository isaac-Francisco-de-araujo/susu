import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Badge, Button, Card, Field, Modal, SelectField, TextareaField } from "@/components/ui-kit";
import { type Service, money } from "@/lib/mock-data";
import { setServices, useServices } from "@/lib/services-store";
import nailGallery from "@/assets/nail-gallery.jpg";

export const Route=createFileRoute("/admin/procedimentos")({head:()=>({meta:[{title:"Procedimentos | Studio Bella"},{name:"description",content:"Gestão dos serviços, preços e durações."},{property:"og:title",content:"Procedimentos | Studio Bella"},{property:"og:description",content:"Catálogo de procedimentos do Studio Bella."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:Page});

function Page(){
  const items=useServices();
  const[modal,setModal]=useState(false);
  const[editing,setEditing]=useState<Service|null>(null);
  const open=(s?:Service)=>{setEditing(s??null);setModal(true)};
  const save=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=new FormData(e.currentTarget);
    const data={name:String(f.get("name")),price:Number(f.get("price")),duration:String(f.get("duration")??""),description:String(f.get("description")),image:String(f.get("image")||"")||editing?.image||nailGallery,active:f.get("active")==="Ativo"};
    // integrar com o back aq
    setServices(x=>editing?x.map(s=>s.id===editing.id?{...s,...data}:s):[...x,{id:String(Date.now()),short:"Cuidado personalizado",icon:"Sparkles",...data}]);setModal(false)};
  return <AdminShell title="Procedimentos" subtitle="Procedimentos ativos aparecem automaticamente no site" action={<Button size="sm" onClick={()=>open()}><Plus className="h-4 w-4"/><span className="hidden sm:inline">Adicionar novo procedimento</span></Button>}>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(s=><Card key={s.id} className={`overflow-hidden ${s.active?"":"opacity-60"}`}>
      <div className="relative aspect-[16/9] bg-muted"><img src={s.image} alt={s.name} className="h-full w-full object-cover"/><div className="absolute left-3 top-3"><Badge tone={s.active?"success":"danger"}>{s.active?"Ativo":"Inativo"}</Badge></div></div>
      <div className="p-5"><div className="flex items-start justify-between gap-2"><h2 className="font-display text-xl font-semibold">{s.name}</h2><div className="flex"><Button variant="ghost" size="icon" aria-label="Editar" onClick={()=>open(s)}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" aria-label="Excluir" onClick={()=>setServices(x=>x.filter(i=>i.id!==s.id))}><Trash2 className="h-4 w-4"/></Button></div></div>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{s.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4"><strong className="text-lg text-primary">{money(s.price)}</strong><div className="flex items-center gap-3">{s.duration&&<span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-4 w-4"/>{s.duration}</span>}<Button size="sm" variant="secondary" onClick={()=>setServices(x=>x.map(i=>i.id===s.id?{...i,active:!i.active}:i))}>{s.active?"Desativar":"Ativar"}</Button></div></div></div>
    </Card>)}</div>
    <Modal open={modal} title={editing?"Editar procedimento":"Adicionar novo procedimento"} onClose={()=>setModal(false)}><form key={editing?.id??"new"} onSubmit={save} className="grid gap-4 sm:grid-cols-2"><Field required name="name" label="Nome" defaultValue={editing?.name}/><Field required name="price" label="Preço (R$)" type="number" step="0.01" defaultValue={editing?.price}/><Field name="duration" label="Duração (opcional)" defaultValue={editing?.duration} placeholder="Ex.: 40 min"/><SelectField name="active" label="Status" defaultValue={editing&&!editing.active?"Inativo":"Ativo"}><option>Ativo</option><option>Inativo</option></SelectField><div className="sm:col-span-2"><Field name="image" label="URL da imagem (opcional)" placeholder="https://..." defaultValue={editing?.image?.startsWith("http")?editing.image:""}/></div><div className="sm:col-span-2"><TextareaField required name="description" label="Descrição" defaultValue={editing?.description}/></div><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={()=>setModal(false)}>Cancelar</Button><Button type="submit">Salvar procedimento</Button></div></form></Modal>
  </AdminShell>}
