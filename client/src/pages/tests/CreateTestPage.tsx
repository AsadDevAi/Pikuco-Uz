import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChevronRight, ChevronLeft, Check, HelpCircle, Brain, Swords, GitBranch,
  Plus, Trash2, Upload, GripVertical, Eye
} from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

type TestType = 'quiz' | 'identification' | 'tournament' | 'tree';

const TEST_TYPES = [
  { type: 'quiz' as TestType, label: 'Viktorina', desc: 'To\'g\'ri/noto\'g\'ri javobli savollar', icon: HelpCircle, color: 'from-blue-500 to-cyan-500' },
  { type: 'identification' as TestType, label: 'Identifikatsiya', desc: 'Shaxsiyat / Natija testi', icon: Brain, color: 'from-purple-500 to-pink-500' },
  { type: 'tournament' as TestType, label: 'Turnir', desc: 'Rasmlar orasida tanlov', icon: Swords, color: 'from-orange-500 to-red-500' },
  { type: 'tree' as TestType, label: 'Daraxt', desc: 'Tarmoqlanuvchi hikoya/quest', icon: GitBranch, color: 'from-green-500 to-emerald-500' },
];

function ImageUpload({ onUpload, currentUrl, folder }: { onUpload: (url: string) => void; currentUrl?: string; folder: string }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/upload?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpload(data.url);
    } catch {
      toast.error('Rasm yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="block">
      <div className={cn(
        'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all',
        'hover:border-primary-400 hover:bg-primary-500/5',
        currentUrl ? 'border-primary-400' : 'border-[rgb(var(--border))]'
      )}>
        {currentUrl ? (
          <img src={currentUrl} alt="Yuklangan" className="w-full h-24 object-cover rounded-lg" />
        ) : (
          <div className="py-2">
            {uploading ? (
              <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-muted mx-auto mb-1" />
                <p className="text-xs text-muted">Rasm yuklash</p>
              </>
            )}
          </div>
        )}
      </div>
      <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} disabled={uploading} />
    </label>
  );
}

export default function CreateTestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<TestType>('quiz');
  const [submitting, setSubmitting] = useState(false);

  const [generalInfo, setGeneralInfo] = useState({
    title: '',
    description: '',
    coverImage: '',
    categoryId: '',
    status: 'draft' as 'draft' | 'published',
  });

  const [quizQuestions, setQuizQuestions] = useState([
    { id: uuidv4(), text: '', image: '', options: [
      { text: '', image: '', isCorrect: true },
      { text: '', image: '', isCorrect: false },
    ]},
  ]);

  const [identResults, setIdentResults] = useState([
    { id: uuidv4(), title: '', description: '', image: '' },
    { id: uuidv4(), title: '', description: '', image: '' },
  ]);
  const [identQuestions, setIdentQuestions] = useState([
    { id: uuidv4(), text: '', image: '', options: [{ text: '', weights: {} as Record<string, number> }] },
  ]);

  const [tournamentItems, setTournamentItems] = useState([
    { id: uuidv4(), title: '', mediaUrl: '', mediaType: 'image' as 'image' | 'video' },
    { id: uuidv4(), title: '', mediaUrl: '', mediaType: 'image' as 'image' | 'video' },
  ]);

  const [treeNodes, setTreeNodes] = useState([
    { id: 'start', text: '', image: '', choices: [
      { text: '', nextNodeId: null as string | null },
      { text: '', nextNodeId: null as string | null },
    ], isEnding: false },
  ]);
  const [startNodeId] = useState('start');

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      id: uuidv4(), text: '', image: '',
      options: [{ text: '', image: '', isCorrect: true }, { text: '', image: '', isCorrect: false }],
    }]);
  };

  const addQuizOption = (qIdx: number) => {
    const updated = [...quizQuestions];
    updated[qIdx].options.push({ text: '', image: '', isCorrect: false });
    setQuizQuestions(updated);
  };

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    const updated = [...quizQuestions];
    updated[qIdx].options = updated[qIdx].options.map((o, i) => ({ ...o, isCorrect: i === oIdx }));
    setQuizQuestions(updated);
  };

  const addIdentResult = () => {
    setIdentResults([...identResults, { id: uuidv4(), title: '', description: '', image: '' }]);
  };

  const addIdentQuestion = () => {
    const weights: Record<string, number> = {};
    identResults.forEach((r) => { weights[r.id] = 0; });
    setIdentQuestions([...identQuestions, { id: uuidv4(), text: '', image: '', options: [{ text: '', weights }] }]);
  };

  const addTournamentItem = () => {
    setTournamentItems([...tournamentItems, { id: uuidv4(), title: '', mediaUrl: '', mediaType: 'image' }]);
  };

  const addTreeNode = () => {
    const newId = uuidv4();
    setTreeNodes([...treeNodes, { id: newId, text: '', image: '', choices: [], isEnding: false }]);
  };

  const buildContent = () => {
    if (selectedType === 'quiz') {
      return { type: 'quiz' as const, questions: quizQuestions.map(q => ({ ...q })) };
    }
    if (selectedType === 'identification') {
      return { type: 'identification' as const, results: identResults, questions: identQuestions };
    }
    if (selectedType === 'tournament') {
      return { type: 'tournament' as const, items: tournamentItems };
    }
    return { type: 'tree' as const, nodes: treeNodes, startNodeId };
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!generalInfo.title.trim()) {
      toast.error('Sarlavha talab qilinadi');
      return;
    }
    setSubmitting(true);
    try {
      const content = buildContent();
      const { data } = await api.post('/tests', {
        ...generalInfo,
        type: selectedType,
        status,
        content,
        categoryId: generalInfo.categoryId || null,
      });
      toast.success(status === 'published' ? 'Test nashr qilindi! +15 ball' : 'Qoralama saqlandi');
      navigate(`/tests/${data.test._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Test turini tanlang', 'Umumiy ma\'lumot', 'Tarkibni to\'ldiring', 'Ko\'rib chiqing'];

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Test yaratish</h1>
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors',
                  step > i + 1 ? 'text-green-500' : step === i + 1 ? 'text-primary-500' : 'text-muted'
                )}>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 transition-all',
                    step > i + 1 ? 'bg-green-500 border-green-500 text-white' :
                    step === i + 1 ? 'border-primary-500 text-primary-500' :
                    'border-[rgb(var(--border))] text-muted'
                  )}>
                    {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-[rgb(var(--border))]" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-6">Test turini tanlang</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {TEST_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={cn(
                    'p-6 rounded-[var(--radius-card)] border-2 text-left transition-all duration-200 hover:-translate-y-1',
                    selectedType === t.type ? 'border-primary-500 bg-primary-500/5' : 'border-[rgb(var(--border))] hover:border-primary-300'
                  )}
                >
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', t.color)}>
                    <t.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-primary mb-1">{t.label}</h3>
                  <p className="text-sm text-secondary">{t.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn btn-primary btn-lg w-full">
              Davom etish <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-primary mb-6">Umumiy ma'lumot</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Sarlavha *</label>
                <input
                  id="test-title"
                  type="text"
                  className="input"
                  placeholder="Test sarlavhasini kiriting"
                  value={generalInfo.title}
                  onChange={(e) => setGeneralInfo({ ...generalInfo, title: e.target.value })}
                  maxLength={150}
                />
              </div>
              <div>
                <label className="label">Tavsif</label>
                <textarea
                  className="input h-24 resize-none"
                  placeholder="Test haqida qisqacha ma'lumot"
                  value={generalInfo.description}
                  onChange={(e) => setGeneralInfo({ ...generalInfo, description: e.target.value })}
                  maxLength={1000}
                />
              </div>
              <div>
                <label className="label">Muqova rasmi</label>
                <ImageUpload
                  folder="covers"
                  currentUrl={generalInfo.coverImage}
                  onUpload={(url) => setGeneralInfo({ ...generalInfo, coverImage: url })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn btn-ghost btn-lg">
                <ChevronLeft className="w-5 h-5" /> Orqaga
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary btn-lg flex-1">
                Davom etish <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {selectedType === 'quiz' && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Savollar</h2>
                {quizQuestions.map((q, qIdx) => (
                  <div key={q.id} className="card p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-primary">Savol {qIdx + 1}</h4>
                      {quizQuestions.length > 1 && (
                        <button
                          onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIdx))}
                          className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      className="input mb-3"
                      placeholder="Savol matni..."
                      value={q.text}
                      onChange={(e) => {
                        const u = [...quizQuestions]; u[qIdx].text = e.target.value; setQuizQuestions(u);
                      }}
                    />
                    <ImageUpload
                      folder="questions"
                      currentUrl={q.image}
                      onUpload={(url) => {
                        const u = [...quizQuestions]; u[qIdx].image = url; setQuizQuestions(u);
                      }}
                    />
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={cn('flex items-center gap-2 p-3 rounded-xl border', opt.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-[rgb(var(--border))]')}>
                          <button
                            onClick={() => setCorrectOption(qIdx, oIdx)}
                            className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-[rgb(var(--border))]')}
                          >
                            {opt.isCorrect && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-primary"
                            placeholder={`Variant ${oIdx + 1}`}
                            value={opt.text}
                            onChange={(e) => {
                              const u = [...quizQuestions];
                              u[qIdx].options[oIdx].text = e.target.value;
                              setQuizQuestions(u);
                            }}
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => {
                                const u = [...quizQuestions];
                                u[qIdx].options = u[qIdx].options.filter((_, i) => i !== oIdx);
                                if (!u[qIdx].options.some(o => o.isCorrect)) u[qIdx].options[0].isCorrect = true;
                                setQuizQuestions(u);
                              }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.options.length < 6 && (
                      <button onClick={() => addQuizOption(qIdx)} className="btn btn-ghost btn-sm mt-2 text-primary-500">
                        <Plus className="w-4 h-4" /> Variant qo'shish
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addQuizQuestion} className="btn btn-secondary btn-md w-full">
                  <Plus className="w-4 h-4" /> Savol qo'shish
                </button>
              </div>
            )}

            {selectedType === 'identification' && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Natijalar</h2>
                <div className="space-y-3 mb-6">
                  {identResults.map((r, rIdx) => (
                    <div key={r.id} className="card p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium text-primary text-sm">Natija {rIdx + 1}</h4>
                        {identResults.length > 2 && (
                          <button onClick={() => setIdentResults(identResults.filter((_, i) => i !== rIdx))} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="input mb-2"
                        placeholder="Natija sarlavhasi (masalan: 'Siz — Introvert')"
                        value={r.title}
                        onChange={(e) => {
                          const u = [...identResults]; u[rIdx].title = e.target.value; setIdentResults(u);
                        }}
                      />
                      <textarea
                        className="input h-16 resize-none text-sm"
                        placeholder="Natija tavsifi"
                        value={r.description}
                        onChange={(e) => {
                          const u = [...identResults]; u[rIdx].description = e.target.value; setIdentResults(u);
                        }}
                      />
                    </div>
                  ))}
                  <button onClick={addIdentResult} className="btn btn-secondary btn-sm">
                    <Plus className="w-4 h-4" /> Natija qo'shish
                  </button>
                </div>

                <h2 className="text-xl font-semibold text-primary mb-4">Savollar</h2>
                {identQuestions.map((q, qIdx) => (
                  <div key={q.id} className="card p-4 mb-3">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium text-primary text-sm">Savol {qIdx + 1}</h4>
                      {identQuestions.length > 1 && (
                        <button onClick={() => setIdentQuestions(identQuestions.filter((_, i) => i !== qIdx))} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      className="input mb-3"
                      placeholder="Savol matni"
                      value={q.text}
                      onChange={(e) => {
                        const u = [...identQuestions]; u[qIdx].text = e.target.value; setIdentQuestions(u);
                      }}
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="border border-[rgb(var(--border))] rounded-xl p-3">
                          <input
                            type="text"
                            className="input mb-2 text-sm"
                            placeholder={`Variant ${oIdx + 1}`}
                            value={opt.text}
                            onChange={(e) => {
                              const u = [...identQuestions];
                              u[qIdx].options[oIdx].text = e.target.value;
                              setIdentQuestions(u);
                            }}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {identResults.map((r) => (
                              <div key={r.id} className="flex items-center gap-2">
                                <label className="text-xs text-muted w-20 truncate">{r.title || `Natija ${identResults.indexOf(r) + 1}`}:</label>
                                <input
                                  type="number"
                                  className="input py-1 text-xs w-16"
                                  placeholder="0"
                                  value={opt.weights[r.id] || 0}
                                  onChange={(e) => {
                                    const u = [...identQuestions];
                                    u[qIdx].options[oIdx].weights = { ...u[qIdx].options[oIdx].weights, [r.id]: parseInt(e.target.value) || 0 };
                                    setIdentQuestions(u);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => {
                      const u = [...identQuestions];
                      const weights: Record<string, number> = {};
                      identResults.forEach(r => { weights[r.id] = 0; });
                      u[qIdx].options.push({ text: '', weights });
                      setIdentQuestions(u);
                    }} className="btn btn-ghost btn-sm mt-2 text-primary-500">
                      <Plus className="w-4 h-4" /> Variant
                    </button>
                  </div>
                ))}
                <button onClick={addIdentQuestion} className="btn btn-secondary btn-sm w-full">
                  <Plus className="w-4 h-4" /> Savol qo'shish
                </button>
              </div>
            )}

            {selectedType === 'tournament' && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-2">Elementlar</h2>
                <p className="text-sm text-secondary mb-4">Kamida 4 ta element kerak. 8, 16, 32 ta bo'lsa eng yaxshi.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {tournamentItems.map((item, idx) => (
                    <div key={item.id} className="card p-3">
                      <ImageUpload
                        folder="tournament"
                        currentUrl={item.mediaUrl}
                        onUpload={(url) => {
                          const u = [...tournamentItems]; u[idx].mediaUrl = url; setTournamentItems(u);
                        }}
                      />
                      <input
                        type="text"
                        className="input text-xs mt-2 py-1.5"
                        placeholder="Nom"
                        value={item.title}
                        onChange={(e) => {
                          const u = [...tournamentItems]; u[idx].title = e.target.value; setTournamentItems(u);
                        }}
                      />
                      {tournamentItems.length > 4 && (
                        <button
                          onClick={() => setTournamentItems(tournamentItems.filter((_, i) => i !== idx))}
                          className="w-full mt-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          O'chirish
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addTournamentItem} className="btn btn-secondary btn-md w-full">
                  <Plus className="w-4 h-4" /> Element qo'shish
                </button>
              </div>
            )}

            {selectedType === 'tree' && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-2">Tugunlar (Nodes)</h2>
                <p className="text-sm text-secondary mb-4">Har bir tugunda matn va tanlovlar bo'ladi. Oxirgi tugunlar "Yakun" bo'lsin.</p>
                <div className="space-y-3">
                  {treeNodes.map((node, nIdx) => (
                    <div key={node.id} className={cn('card p-4 border-l-4', node.isEnding ? 'border-l-green-500' : nIdx === 0 ? 'border-l-primary-500' : 'border-l-[rgb(var(--border))]')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted" />
                          <span className="text-sm font-medium text-primary">
                            {nIdx === 0 ? '🚀 Boshlanish tugun' : node.isEnding ? '🏁 Yakun tugun' : `Tugun ${nIdx + 1}`}
                          </span>
                          <span className="text-xs text-muted">(ID: {node.id.slice(0, 8)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              checked={node.isEnding}
                              onChange={(e) => {
                                const u = [...treeNodes]; u[nIdx].isEnding = e.target.checked; setTreeNodes(u);
                              }}
                            />
                            Yakun
                          </label>
                          {treeNodes.length > 1 && nIdx !== 0 && (
                            <button onClick={() => setTreeNodes(treeNodes.filter((_, i) => i !== nIdx))} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <textarea
                        className="input h-16 resize-none text-sm mb-2"
                        placeholder="Tugun matni..."
                        value={node.text}
                        onChange={(e) => {
                          const u = [...treeNodes]; u[nIdx].text = e.target.value; setTreeNodes(u);
                        }}
                      />
                      {!node.isEnding && (
                        <div className="space-y-2">
                          {node.choices.map((choice, cIdx) => (
                            <div key={cIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                className="input text-sm flex-1"
                                placeholder={`Tanlov ${cIdx + 1} matni`}
                                value={choice.text}
                                onChange={(e) => {
                                  const u = [...treeNodes]; u[nIdx].choices[cIdx].text = e.target.value; setTreeNodes(u);
                                }}
                              />
                              <select
                                className="input text-xs w-32 py-2"
                                value={choice.nextNodeId || ''}
                                onChange={(e) => {
                                  const u = [...treeNodes]; u[nIdx].choices[cIdx].nextNodeId = e.target.value || null; setTreeNodes(u);
                                }}
                              >
                                <option value="">Yo'q</option>
                                {treeNodes.filter((_, i) => i !== nIdx).map((n) => (
                                  <option key={n.id} value={n.id}>{n.text.slice(0, 20) || `Tugun ${n.id.slice(0, 6)}`}</option>
                                ))}
                              </select>
                              {node.choices.length > 1 && (
                                <button onClick={() => {
                                  const u = [...treeNodes]; u[nIdx].choices = u[nIdx].choices.filter((_, i) => i !== cIdx); setTreeNodes(u);
                                }} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          ))}
                          {node.choices.length < 4 && (
                            <button onClick={() => {
                              const u = [...treeNodes]; u[nIdx].choices.push({ text: '', nextNodeId: null }); setTreeNodes(u);
                            }} className="btn btn-ghost btn-sm text-xs text-primary-500">
                              <Plus className="w-3.5 h-3.5" /> Tanlov
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addTreeNode} className="btn btn-secondary btn-md w-full mt-3">
                  <Plus className="w-4 h-4" /> Yangi tugun
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="btn btn-ghost btn-lg">
                <ChevronLeft className="w-5 h-5" /> Orqaga
              </button>
              <button onClick={() => setStep(4)} className="btn btn-primary btn-lg flex-1">
                Davom etish <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Ko'rib chiqish</h2>
            <div className="bg-[rgb(var(--bg-secondary))] rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Test turi:</span>
                <span className="font-medium text-primary capitalize">{selectedType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Sarlavha:</span>
                <span className="font-medium text-primary">{generalInfo.title || '—'}</span>
              </div>
              {selectedType === 'quiz' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Savollar:</span>
                  <span className="font-medium text-primary">{quizQuestions.length} ta</span>
                </div>
              )}
              {selectedType === 'tournament' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Elementlar:</span>
                  <span className="font-medium text-primary">{tournamentItems.length} ta</span>
                </div>
              )}
            </div>

            {generalInfo.coverImage && (
              <img src={generalInfo.coverImage} alt="Muqova" className="w-full rounded-xl mb-4 object-cover h-40" />
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSubmit('published')}
                disabled={submitting}
                className="btn btn-primary btn-lg w-full"
                id="publish-test-btn"
              >
                {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Nashr qilish (+15 ball)
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={submitting}
                className="btn btn-ghost btn-lg w-full border border-[rgb(var(--border))]"
              >
                Qoralama sifatida saqlash
              </button>
              <button onClick={() => setStep(3)} className="btn btn-ghost btn-md">
                <ChevronLeft className="w-4 h-4" /> Orqaga
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
