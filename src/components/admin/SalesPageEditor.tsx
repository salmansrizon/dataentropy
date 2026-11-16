import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateSalesPage } from "@/pages/course-details/salesPage";
import { ImageUploadField } from "./ImageUploadField";

type R = Record<string, any>; // sales_page is free-form JSON; validateSalesPage is the contract
type Up = (next: R) => void;

const ICONS = ["calendar", "video", "rocket", "chart", "life-buoy", "users", "infinity", "book", "award"];
const isObj = (v: unknown): v is R => !!v && typeof v === "object" && !Array.isArray(v);
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);

/** Set a key; blank string / undefined / empty object removes it (optional fields must be omitted, not ""). */
const put = (o: R, k: string, v: unknown): R => {
  const n = { ...o };
  const blankBi = isObj(v) && Object.keys(v).every((key) => (key === "en" || key === "bn") && !String(v[key] ?? "").trim());
  if (v === "" || v === undefined || blankBi) delete n[k];
  else n[k] = v;
  return n;
};
/** Wire a field of object `o` to an input's value/onChange. */
/** <input type=datetime-local> shows local wall time; we store a UTC ISO instant. */
const toLocalInput = (iso: unknown) => {
  const d = typeof iso === "string" ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const bindDateTime = (o: R, k: string, up: Up) => ({
  value: toLocalInput(o[k]),
  onChange: (v: unknown) => up(put(o, k, typeof v === "string" && v ? new Date(v).toISOString() : undefined)),
});
const bind = (o: R, k: string, up: Up) => ({ value: o[k], onChange: (v: unknown) => up(put(o, k, v)) });

interface Bound<V> { label: string; value: V; onChange: (v: V) => void }

function BiInput({ label, value, onChange }: Bound<unknown>) {
  const bi = typeof value === "string" ? { en: value, bn: "" } : (isObj(value) ? value : {});
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input placeholder="EN" value={bi.en ?? ""} onChange={(e) => onChange({ ...bi, en: e.target.value })} />
        <Input placeholder="বাংলা" value={bi.bn ?? ""} onChange={(e) => onChange({ ...bi, bn: e.target.value })} />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text" }: Bound<unknown> & { type?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumInput({ label, value, onChange }: Bound<unknown>) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min={0}
        step={1}
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </div>
  );
}

function ImgInput({ label, value, onChange }: Bound<unknown>) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <ImageUploadField
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
        bucket="admin-uploads"
        pathPrefix="courses/sales"
        maxWidthOrHeight={1200}
        label={label}
      />
    </div>
  );
}

function IconSelect({ label, value, onChange }: Bound<unknown>) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={typeof value === "string" && value ? value : "none"} onValueChange={(v) => onChange(v === "none" ? undefined : v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {ICONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function ListEditor({ label, items, onChange, blank, children }: {
  label: string;
  items: unknown;
  onChange: (next: any[]) => void;
  blank: unknown;
  children: (item: any, set: (next: any) => void, index: number) => ReactNode;
}) {
  const list = arr(items);
  const move = (i: number, d: number) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{label} ({list.length})</Label>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...list, structuredClone(blank)])}>
          <Plus className="mr-1 h-3 w-3" /> Add
        </Button>
      </div>
      {list.map((item, i) => (
        <div key={i} className="space-y-2 rounded-md bg-muted/40 p-3">
          <div className="flex justify-end gap-1">
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-3 w-3" /></Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-3 w-3" /></Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-3 w-3" /></Button>
          </div>
          {children(item, (next) => onChange(list.map((x, j) => (j === i ? next : x))), i)}
        </div>
      ))}
    </div>
  );
}

/** List of plain bilingual strings (topics, points, items). */
const BiList = ({ label, items, onChange }: { label: string; items: unknown; onChange: (n: any[]) => void }) => (
  <ListEditor label={label} items={items} onChange={onChange} blank={{ en: "", bn: "" }}>
    {(item, set) => <BiInput label="Text" value={item} onChange={set} />}
  </ListEditor>
);

const Grid = ({ children }: { children: ReactNode }) => <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
const BI0 = { en: "", bn: "" };

export default function SalesPageEditor({ value, onChange }: { value: unknown; onChange: (next: Record<string, unknown>) => void }) {
  const root: R = isObj(value) ? value : {};
  const sec = (k: string): R => (isObj(root[k]) ? root[k] : {});
  const setSec = (k: string): Up => (next) => onChange(put(root, k, next));
  const setList = (k: string) => (next: any[]) => onChange({ ...root, [k]: next });
  const check = validateSalesPage(value);

  const item = (key: string, title: string, body: ReactNode) => (
    <AccordionItem value={key}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent className="space-y-3">{body}</AccordionContent>
    </AccordionItem>
  );

  const batch = sec("batch"), upBatch = setSec("batch");
  const cur = sec("curriculum"), upCur = setSec("curriculum");
  const demo = sec("demo_classes"), upDemo = setSec("demo_classes");
  const live = isObj(demo.live_demo) ? demo.live_demo : {}, upLive: Up = (n) => upDemo(put(demo, "live_demo", n));
  const cert = sec("certificate"), upCert = setSec("certificate");
  const comm = sec("community"), upComm = setSec("community");
  const contact = sec("contact"), upContact = setSec("contact");
  const pre = sec("prerequisite_videos"), upPre = setSec("prerequisite_videos");

  return (
    <div className="space-y-3">
      {check.ok === false && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <p className="font-semibold">Fix before saving:</p>
          <ul className="list-disc pl-4">{check.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <Accordion type="multiple">
        {item("batch", "Batch", (
          <>
            <Grid>
              <BiInput label="Name" {...bind(batch, "name", upBatch)} />
              <BiInput label="Mode" {...bind(batch, "mode", upBatch)} />
              <BiInput label="Live schedule" {...bind(batch, "live_schedule", upBatch)} />
              <BiInput label="Support schedule" {...bind(batch, "support_schedule", upBatch)} />
              <NumInput label="Seats total" {...bind(batch, "seats_total", upBatch)} />
              <NumInput label="Seats left" {...bind(batch, "seats_left", upBatch)} />
            </Grid>
          </>
        ))}

        {item("curriculum", "Curriculum", (
          <>
            <BiInput label="Summary" {...bind(cur, "summary", upCur)} />
            <ListEditor label="Phases" items={cur.phases} onChange={(n) => upCur({ ...cur, phases: n })} blank={{ title: BI0, weeks: [] }}>
              {(ph, setPh) => (
                <>
                  <BiInput label="Phase title" {...bind(ph, "title", setPh)} />
                  <ListEditor label="Weeks" items={ph.weeks} onChange={(n) => setPh({ ...ph, weeks: n })} blank={{ label: BI0, title: BI0, topics: [], projects: [] }}>
                    {(w, setW) => (
                      <>
                        <Grid>
                          <BiInput label="Label (Week 1)" {...bind(w, "label", setW)} />
                          <BiInput label="Title" {...bind(w, "title", setW)} />
                        </Grid>
                        <BiInput label="Goal" {...bind(w, "goal", setW)} />
                        <div className="grid grid-cols-3 gap-2">
                          <NumInput label="Live classes" {...bind(w, "live_classes", setW)} />
                          <NumInput label="Quizzes" {...bind(w, "quizzes", setW)} />
                          <NumInput label="Assignments" {...bind(w, "assignments", setW)} />
                        </div>
                        <BiList label="Topics" items={w.topics} onChange={(n) => setW({ ...w, topics: n })} />
                        <BiList label="Projects" items={w.projects} onChange={(n) => setW({ ...w, projects: n })} />
                      </>
                    )}
                  </ListEditor>
                </>
              )}
            </ListEditor>
          </>
        ))}

        {item("demo_classes", "Demo classes", (
          <>
            <ListEditor label="Videos" items={demo.videos} onChange={(n) => upDemo({ ...demo, videos: n })} blank={{ title: BI0, video_url: "" }}>
              {(v, setV) => (
                <>
                  <BiInput label="Title" {...bind(v, "title", setV)} />
                  <BiInput label="Instructor" {...bind(v, "instructor", setV)} />
                  <TextInput label="Video URL" {...bind(v, "video_url", setV)} />
                </>
              )}
            </ListEditor>
            <div className="space-y-2 rounded-md border p-3">
              <Label className="text-sm font-semibold">Live demo</Label>
              <BiInput label="Topic" {...bind(live, "topic", upLive)} />
              <Grid>
                <TextInput label="Starts at" type="datetime-local" {...bindDateTime(live, "starts_at", upLive)} />
                <TextInput label="Booking URL" {...bind(live, "booking_url", upLive)} />
              </Grid>
              <BiInput label="Instructor" {...bind(live, "instructor", upLive)} />
            </div>
          </>
        ))}

        {item("projects", "Projects", (
          <ListEditor label="Projects" items={root.projects} onChange={setList("projects")} blank={{ title: BI0 }}>
            {(p, set) => (
              <>
                <BiInput label="Title" {...bind(p, "title", set)} />
                <BiInput label="Description" {...bind(p, "description", set)} />
                <ImgInput label="Image" {...bind(p, "image_url", set)} />
                <TextInput label="Link" {...bind(p, "link", set)} />
              </>
            )}
          </ListEditor>
        ))}

        {item("teaching_assistants", "Teaching assistants", (
          <ListEditor label="Assistants" items={root.teaching_assistants} onChange={setList("teaching_assistants")} blank={{ name: "" }}>
            {(a, set) => (
              <>
                <TextInput label="Name" {...bind(a, "name", set)} />
                <BiInput label="Role" {...bind(a, "role", set)} />
                <ImgInput label="Avatar" {...bind(a, "avatar_url", set)} />
                <BiInput label="Bio" {...bind(a, "bio", set)} />
              </>
            )}
          </ListEditor>
        ))}

        {item("features", "Features", (
          <ListEditor label="Features" items={root.features} onChange={setList("features")} blank={{ title: BI0 }}>
            {(f, set) => (
              <>
                <BiInput label="Title" {...bind(f, "title", set)} />
                <BiInput label="Description" {...bind(f, "description", set)} />
                <IconSelect label="Icon" {...bind(f, "icon", set)} />
              </>
            )}
          </ListEditor>
        ))}

        {item("career_support", "Career support", (
          <ListEditor label="Groups" items={root.career_support} onChange={setList("career_support")} blank={{ title: BI0, items: [] }}>
            {(g, set) => (
              <>
                <BiInput label="Group title" {...bind(g, "title", set)} />
                <BiList label="Items" items={g.items} onChange={(n) => set({ ...g, items: n })} />
              </>
            )}
          </ListEditor>
        ))}

        {item("certificate", "Certificate", (
          <>
            <ImgInput label="Certificate image" {...bind(cert, "image_url", upCert)} />
            <BiList label="Points" items={cert.points} onChange={(n) => upCert({ ...cert, points: n })} />
          </>
        ))}

        {item("success_stories", "Success stories", (
          <ListEditor label="Stories" items={root.success_stories} onChange={setList("success_stories")} blank={{ name: "", quote: BI0 }}>
            {(s, set) => (
              <>
                <Grid>
                  <TextInput label="Name" {...bind(s, "name", set)} />
                  <TextInput label="Company" {...bind(s, "company", set)} />
                </Grid>
                <BiInput label="Role" {...bind(s, "role", set)} />
                <ImgInput label="Avatar" {...bind(s, "avatar_url", set)} />
                <BiInput label="Quote" {...bind(s, "quote", set)} />
              </>
            )}
          </ListEditor>
        ))}

        {item("payment_faq", "Payment FAQ", (
          <ListEditor label="Questions" items={root.payment_faq} onChange={setList("payment_faq")} blank={{ question: BI0, answer: BI0 }}>
            {(q, set) => (
              <>
                <BiInput label="Question" {...bind(q, "question", set)} />
                <BiInput label="Answer" {...bind(q, "answer", set)} />
              </>
            )}
          </ListEditor>
        ))}

        {item("community", "Community", (
          <>
            <BiInput label="Title" {...bind(comm, "title", upComm)} />
            <Grid>
              <NumInput label="Members" {...bind(comm, "members", upComm)} />
              <TextInput label="URL (required)" {...bind(comm, "url", upComm)} />
            </Grid>
          </>
        ))}

        {item("contact", "Contact", (
          <>
            <Grid>
              <TextInput label="Phone" {...bind(contact, "phone", upContact)} />
              <TextInput label="WhatsApp" {...bind(contact, "whatsapp", upContact)} />
            </Grid>
            <BiInput label="Hours" {...bind(contact, "hours", upContact)} />
          </>
        ))}

        {item("prerequisite_videos", "Prerequisite videos", (
          <>
            <BiInput label="Title" {...bind(pre, "title", upPre)} />
            <TextInput label="View all URL" {...bind(pre, "view_all_url", upPre)} />
            <ListEditor label="Videos" items={pre.videos} onChange={(n) => upPre({ ...pre, videos: n })} blank={{ title: BI0, video_url: "" }}>
              {(v, set) => (
                <>
                  <BiInput label="Title" {...bind(v, "title", set)} />
                  <TextInput label="Video URL" {...bind(v, "video_url", set)} />
                </>
              )}
            </ListEditor>
          </>
        ))}
      </Accordion>
    </div>
  );
}
